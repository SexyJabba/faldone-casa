// Area riservata del Faldone: cifra i dati sensibili in content/riservato/riservato.enc.json.
// La password non va mai scritta nel repository: si passa nell'ambiente. I dati in chiaro restano fuori dal repository.
//   FALDONE_PASSWORD=… node tools/riservato.mjs decifra > /fuori/dal/repo/riservato.json     leggere
//   FALDONE_PASSWORD=… node tools/riservato.mjs cifra /fuori/dal/repo/riservato.json         aggiornare
//   FALDONE_PASSWORD=… FALDONE_PASSWORD_NUOVA=… node tools/riservato.mjs cambia              cambiare password
//   node tools/riservato.mjs genera                                                         proporre una password casuale
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { randomBytes, randomInt } from 'node:crypto';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sealBox, unlock, checkBox } from '../app/lib/vault.js';
import { validatePrivate } from './lib/riservato.mjs';
import { loadSources } from './lib/load.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'content/riservato/riservato.enc.json');
const fail = (msg) => { console.error(msg); process.exit(1); };
const current = () => (existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : null);

async function write(data, password) {
  const src = loadSources(ROOT);
  const imp = JSON.parse(readFileSync(join(ROOT, 'content/impianti/impianti.json'), 'utf8')).impianti;
  const errs = validatePrivate(data, imp, new Set(src.entities.map((e) => e.id)));
  if (errs.length) fail(errs.map((e) => 'errore: ' + e).join('\n'));
  const box = await sealBox(data, password, { salt: randomBytes(16), iv: randomBytes(12), updated: new Date().toISOString().slice(0, 10) }).catch((e) => fail(e.message));
  if (!(await unlock(box, password))) fail('Verifica fallita: il contenuto appena cifrato non si riapre.');
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(box, null, 1) + '\n');
  return box;
}

const [cmd, file] = process.argv.slice(2);
if (cmd === 'genera') {
  // 4 gruppi da 5 caratteri senza lettere ambigue: circa 99 bit
  const A = 'abcdefghjkmnpqrstuvwxyz23456789';
  console.log(Array.from({ length: 4 }, () => Array.from({ length: 5 }, () => A[randomInt(A.length)]).join('')).join('-'));
  process.exit(0);
}
const pw = process.env.FALDONE_PASSWORD;
if (!pw) fail('Manca FALDONE_PASSWORD nell\'ambiente.');
const old = current();
if (cmd === 'cifra') {
  if (!file) fail('Indica il file JSON con i dati in chiaro (fuori dal repository).');
  if (!relative(ROOT, resolve(file)).startsWith('..')) fail('Il file in chiaro è dentro il repository: spostalo fuori prima di cifrarlo.');
  if (old && !(await unlock(old, pw))) fail('La password non apre il contenuto già presente: usa «cambia» per cambiarla, così non si sovrascrive per errore.');
  const box = await write(JSON.parse(readFileSync(file, 'utf8')), pw);
  console.log(`Scritto content/riservato/riservato.enc.json (impianti: ${box.index.impianti.join(', ') || 'nessuno'}; elementi: ${box.index.entita.join(', ') || 'nessuno'}). Ora: node tools/build.mjs`);
} else if (cmd === 'decifra') {
  if (!old) fail('content/riservato/riservato.enc.json non esiste.');
  if (checkBox(old).length) fail(checkBox(old).join('\n'));
  const r = await unlock(old, pw);
  if (!r) fail('Password sbagliata o contenuto alterato.');
  process.stdout.write(JSON.stringify(r.data, null, 1) + '\n');
} else if (cmd === 'cambia') {
  const nuova = process.env.FALDONE_PASSWORD_NUOVA;
  if (!old) fail('content/riservato/riservato.enc.json non esiste.');
  if (!nuova) fail('Manca FALDONE_PASSWORD_NUOVA nell\'ambiente.');
  const r = await unlock(old, pw);
  if (!r) fail('Password sbagliata o contenuto alterato.');
  await write(r.data, nuova);
  console.log('Password cambiata. I dispositivi che la ricordavano chiederanno la nuova. Ora: node tools/build.mjs');
} else fail('Comandi: genera | cifra <file.json> | decifra | cambia');
