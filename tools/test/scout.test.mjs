// Vetrina dello Scout (scout/): generata da tools/scout-vetrina.mjs; archivio solo cifrato.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './helpers.mjs';
import { checkBox } from '../../app/lib/vault.js';
import { href } from '../../app/ui.js';
import { commands } from '../../app/lib/commands.js';
import { model } from './helpers.mjs';

const DIR = join(ROOT, 'scout');
const read = (f) => readFileSync(join(DIR, f), 'utf8');

test('l\'archivio dello Scout è pubblicato solo cifrato', () => {
  const files = readdirSync(DIR);
  assert.deepEqual(files.filter((f) => f.endsWith('.json')), ['archivio.enc.json'], 'nessun altro JSON nella vetrina');
  const box = JSON.parse(read('archivio.enc.json'));
  assert.deepEqual(checkBox(box), []);
  assert.ok(box.it >= 600000);
  assert.deepEqual(Object.keys(box).sort(), ['cipher', 'ct', 'index', 'it', 'iv', 'kdf', 'salt', 'updated', 'v']);
  assert.deepEqual(box.index, { impianti: [], entita: [] });
  for (const f of files.filter((x) => /\.(js|html|webmanifest|css)$/.test(x))) {
    const s = read(f);
    for (const re of [/"reactions"\s*:\s*\[\s*\{/, /"tastes"\s*:\s*\[\s*\{/, /"lat"\s*:\s*\d/, /[A-Za-z0-9._%+-]+@(gmail|icloud|outlook|yahoo)\./i]) assert.doesNotMatch(s, re, `${f}: dati dell'archivio in chiaro`);
  }
});

test('la vetrina usa il motore nel browser e non chiama un server', () => {
  const app = read('app.js');
  assert.match(app, /r = await window\.scoutApi\(path, method, body\);/);
  assert.doesNotMatch(app, /fetch\('\/api\//);
  assert.doesNotMatch(app, /['"]\/(sw\.js|api\/export|style\.css)['"]/, 'indirizzi relativi: la vetrina sta in /scout/');
  const m = read('motore.js');
  assert.doesNotMatch(m, /__MODULES__/);
  for (const k of ['"scout": function', '"sources": function', '"trails": function', '"costs": function']) assert.ok(m.includes(k), k);
  assert.match(m, /from '\.\.\/app\/lib\/vault\.js'/);
  // ricerca, verifica dei link e AI non sono simulate: rispondono che non ci sono
  for (const k of ["seg[0] === 'extract') no()", "if (seg[1] === 'run') no()", "seg[2] === 'check' || seg[2] === 'narrate') no()", "if (body.autoSearch) no()"]) assert.ok(m.includes(k), k);
  const html = read('index.html');
  assert.ok(html.indexOf('motore.js') < html.indexOf('app.js'), 'il motore si carica prima dell\'interfaccia');
  assert.match(html, /<main id="app"[^>]*hidden/, 'niente contenuto prima dello sblocco');
  assert.match(html, /name="referrer" content="no-referrer"/);
});

test('il service worker della vetrina cancella solo le proprie copie', () => {
  const sw = read('sw.js');
  assert.match(sw, /k\.startsWith\('scout-'\) && k !== CACHE/);
  assert.doesNotMatch(sw, /[^.]caches\.match\(/);
  const man = JSON.parse(read('manifest.webmanifest'));
  assert.equal(man.start_url, './'); assert.equal(man.scope, './');
});

test('il Faldone porta alle app personali con collegamenti normali', () => {
  assert.equal(href('scout/'), 'scout/');
  assert.equal(href('officina/'), 'officina/');
  assert.equal(href('esplora/rack'), '#esplora/rack');
  const index = readFileSync(join(ROOT, 'index.html'), 'utf8');
  assert.match(index, /href="scout\/"/); assert.match(index, /href="officina\/"/);
  assert.doesNotMatch(index, /href="#(scout|officina)\/"/);
  assert.ok(commands(model().core, 'scout').some((c) => c.route === 'scout/'), 'la ricerca trova lo Scout');
});

test('i moduli dello Scout entrano nel motore senza alterazioni', () => {
  const m = read('motore.js');
  // String.replace con una stringa interpreterebbe «$&» e simili: il codice dello Scout ne contiene
  assert.ok(m.includes("replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')"), 'espressione regolare dello Scout intatta');
  assert.equal((m.match(/function \(module, exports, require\)/g) || []).length, 4);
});
