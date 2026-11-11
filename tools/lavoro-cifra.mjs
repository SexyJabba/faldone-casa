// Cifra i dati precaricati di «Lavoro» in lavoro/dati.js. La password non va mai scritta nel repository:
// si passa nell'ambiente. I dati in chiaro restano fuori dal repository.
//   LAVORO_PASSWORD=… node tools/lavoro-cifra.mjs cifra dati.json     → scrive lavoro/dati.js
//   LAVORO_PASSWORD=… node tools/lavoro-cifra.mjs decifra             → stampa i dati in chiaro
//   LAVORO_PASSWORD=… LAVORO_PASSWORD_NUOVA=… node tools/lavoro-cifra.mjs cambia   → nuova password
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'lavoro/dati.js');
const ITER = 60000;
const ctx = vm.createContext({ setTimeout });
vm.runInContext(readFileSync(join(ROOT, 'lavoro/cifra.js'), 'utf8'), ctx);
const X = ctx.LavoroCifra;

function fail(msg) { console.error(msg); process.exit(1); }
function current() {
  if (!existsSync(OUT)) return null;
  const m = /window\.LAVORO_DATI = (\{.*\});/.exec(readFileSync(OUT, 'utf8'));
  return m ? JSON.parse(m[1]) : null;
}
function decrypt(box, password) {
  const text = X.open(X.pbkdf2(password, X.unb64(box.salt), box.it), box);
  if (text === null) fail('Password sbagliata o dati alterati.');
  return text;
}
function encrypt(text, password, salt) {
  const box = X.seal(X.pbkdf2(password, [...salt], ITER), text, [...randomBytes(16)]);
  const full = { v: 1, it: ITER, salt: X.b64([...salt]), iv: box.iv, ct: box.ct, mac: box.mac };
  writeFileSync(OUT, `// Dati precaricati di «Lavoro», cifrati con la password. Generato da tools/lavoro-cifra.mjs: non modificare a mano.\nwindow.LAVORO_DATI = ${JSON.stringify(full)};\n`);
  if (decrypt(full, password) !== text) fail('Verifica fallita.');
}

const [cmd, file] = process.argv.slice(2);
const pw = process.env.LAVORO_PASSWORD;
if (!pw) fail('Manca LAVORO_PASSWORD nell\'ambiente.');
const old = current();
if (cmd === 'cifra') {
  if (!file) fail('Indica il file JSON con i dati.');
  const data = JSON.parse(readFileSync(file, 'utf8'));
  // Stessa password → stesso sale, così i dispositivi già sbloccati non devono ricalcolare la chiave due volte.
  let salt = randomBytes(16);
  if (old && X.open(X.pbkdf2(pw, X.unb64(old.salt), old.it), old) !== null && old.it === ITER) salt = Buffer.from(X.unb64(old.salt));
  encrypt(JSON.stringify(data), pw, salt);
  console.log(`Scritto lavoro/dati.js (${['cant', 'todo', 'rap', 'spe', 'liste'].map((k) => `${(data[k] || []).length} ${k}`).join(', ')}).`);
} else if (cmd === 'decifra') {
  if (!old) fail('lavoro/dati.js non esiste.');
  process.stdout.write(JSON.stringify(JSON.parse(decrypt(old, pw)), null, 1) + '\n');
} else if (cmd === 'cambia') {
  const nuova = process.env.LAVORO_PASSWORD_NUOVA;
  if (!old) fail('lavoro/dati.js non esiste.');
  if (!nuova) fail('Manca LAVORO_PASSWORD_NUOVA nell\'ambiente.');
  encrypt(decrypt(old, pw), nuova, randomBytes(16));
  console.log('Password cambiata. I dispositivi chiederanno la nuova e, una volta, anche la precedente per recuperare i dati locali.');
} else fail('Comandi: cifra <file.json> | decifra | cambia');
