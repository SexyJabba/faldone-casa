#!/usr/bin/env node
// Vetrina online dello Scout (scout/): interfaccia e logica dello Scout copiate dalla sua cartella,
// archivio cifrato con la password dell'area riservata. La ricerca resta allo Scout acceso sul computer.
//   FALDONE_PASSWORD=… node tools/scout-vetrina.mjs /percorso/dello/scout             aggiorna interfaccia, logica e archivio
//   FALDONE_PASSWORD=… node tools/scout-vetrina.mjs /percorso/dello/scout --archivio  aggiorna solo l'archivio
// La cartella è quella dello Scout (con public/, lib/, data/scout.json). L'archivio in chiaro non entra mai nel repository.
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { sealBox, unlock } from '../app/lib/vault.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'scout');
const fail = (m) => { console.error(m); process.exit(1); };
const args = process.argv.slice(2);
const SRC = args.find((a) => !a.startsWith('--'));
const ONLY_DATA = args.includes('--archivio');
if (!SRC) fail('Uso: FALDONE_PASSWORD=… node tools/scout-vetrina.mjs /percorso/dello/scout [--archivio]');
const src = resolve(SRC);
const pw = process.env.FALDONE_PASSWORD;
if (!pw) fail('Manca FALDONE_PASSWORD: è la stessa password dell\'area riservata.');
const read = (p) => readFileSync(join(src, p), 'utf8');
for (const f of ['public/app.js', 'public/index.html', 'lib/scout.js', 'data/scout.json']) if (!existsSync(join(src, f))) fail(`Non trovo ${f} in ${src}: indicare la cartella dello Scout.`);
mkdirSync(OUT, { recursive: true });

if (!ONLY_DATA) {
  // logica dello Scout: gli stessi file, avvolti come moduli CommonJS; store, net e ai sono sostituiti nel browser
  const LIBS = ['scout', 'sources', 'trails', 'costs'];
  const mods = LIBS.map((n) => `${JSON.stringify(n)}: function (module, exports, require) {\n${read(`lib/${n}.js`)}\n}`).join(',\n');
  const tpl = readFileSync(join(ROOT, 'tools/templates/scout-vetrina.js'), 'utf8');
  if (!tpl.includes('/*__MODULES__*/')) fail('modello della vetrina senza segnaposto dei moduli');
  writeFileSync(join(OUT, 'motore.js'), tpl.replace('/*__MODULES__*/', () => mods)); // funzione: i $ nel codice dello Scout restano com'erano

  // interfaccia: indirizzi relativi (sta in /scout/), chiamate al motore invece che al server
  let app = read('public/app.js');
  const swap = (a, b) => { if (!app.includes(a)) fail(`app.js è cambiato: non trovo «${a.slice(0, 60)}». Aggiornare tools/scout-vetrina.mjs.`); app = app.replace(a, () => b); };
  swap("r = await fetch('/api/' + path, { method, headers: body ? { 'content-type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });", 'r = await window.scoutApi(path, method, body);');
  swap("href: '/api/export'", "href: 'api/export'");
  swap("navigator.serviceWorker.register('/sw.js')", "navigator.serviceWorker.register('sw.js')");
  writeFileSync(join(OUT, 'app.js'), app);
  copyFileSync(join(src, 'public/style.css'), join(OUT, 'style.css'));
  for (const f of ['icon.svg', 'icon-192.png', 'icon-512.png', 'icon-512-maskable.png']) copyFileSync(join(src, 'public', f), join(OUT, f));
  const man = JSON.parse(read('public/manifest.webmanifest'));
  man.start_url = './'; man.scope = './';
  for (const i of man.icons) i.src = i.src.replace(/^\//, '');
  writeFileSync(join(OUT, 'manifest.webmanifest'), JSON.stringify(man, null, 2) + '\n');
  writeFileSync(join(OUT, 'index.html'), readFileSync(join(ROOT, 'tools/templates/scout-index.html'), 'utf8'));
  writeFileSync(join(OUT, 'sw.js'), readFileSync(join(ROOT, 'tools/templates/scout-sw.js'), 'utf8').replace('__VERSION__', randomBytes(4).toString('hex')));
}

// archivio: tutto cifrato (schede, reazioni, profilo dei gusti, punto di partenza, approfondimenti)
const data = JSON.parse(read('data/scout.json'));
const box = await sealBox(data, pw, { salt: randomBytes(16), iv: randomBytes(12), updated: new Date().toISOString() }).catch((e) => fail(e.message));
if (!(await unlock(box, pw))) fail('Verifica fallita: l\'archivio appena cifrato non si riapre.');
writeFileSync(join(OUT, 'archivio.enc.json'), JSON.stringify(box) + '\n');
rmSync(join(OUT, 'archivio.json'), { force: true });
console.log(`Vetrina dello Scout: ${Object.keys(data.cards || {}).length} schede, ${(data.reactions || []).length} reazioni, archivio cifrato del ${box.updated.slice(0, 10)}.`);
