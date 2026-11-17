// «Officina del Vito» (officina/): app a sé, pubblicata accanto al Faldone sulla stessa origine.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT } from './helpers.mjs';

const DIR = join(ROOT, 'officina');
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const text = walk(DIR).filter((f) => /\.(js|mjs|json|md|html|css|csv|webmanifest)$/.test(f) && !f.includes('/vendor/'));

test('le prove dell\'officina passano', () => {
  const out = execFileSync(process.execPath, ['--test', ...readdirSync(join(DIR, 'tests')).filter((f) => f.endsWith('.test.mjs')).map((f) => join('tests', f))], { cwd: DIR, encoding: 'utf8', stdio: 'pipe', env: Object.fromEntries(Object.entries(process.env).filter(([k]) => k !== 'NODE_TEST_CONTEXT')) });
  assert.match(out, /# pass [1-9]/);
  assert.match(out, /# fail 0/);
});

test('nessun numero di telaio, indirizzo o contatto nella copia pubblica', () => {
  const VIN = /\b[A-HJ-NPR-Z]{3}[A-HJ-NPR-Z0-9]{5}[0-9X][A-HJ-NPR-Z0-9]{8}\b/; // 17 caratteri, senza I, O, Q
  for (const f of text) {
    const s = readFileSync(f, 'utf8');
    for (const re of [VIN, /[A-Za-z0-9._%+-]+@[a-z0-9-]+\.[a-z]{2,}/i, /\b(192\.168|10\.\d+\.\d+)\.\d+\b/, /\bIT\d{2}[A-Z]\d{10}/]) assert.doesNotMatch(s, re, `${f.slice(ROOT.length + 1)}: ${re}`);
  }
});

test('il service worker dell\'officina non cancella le copie offline del Faldone e di Lavoro', () => {
  const sw = readFileSync(join(DIR, 'sw.js'), 'utf8');
  assert.match(sw, /k\.startsWith\('vito-'\) && k !== VERSIONE/);
  assert.doesNotMatch(sw, /filter\(\(k\) => k !== VERSIONE\)/);
  assert.doesNotMatch(sw, /[^.]caches\.match\(/, 'in mancanza di rete cerca solo nella propria copia');
  // ogni file elencato esiste
  const files = JSON.parse(sw.match(/const FILES = (\[[\s\S]*?\]);/)[1].replace(/'/g, '"'));
  for (const f of files) if (f !== './') assert.ok(statSync(join(DIR, f)).isFile(), f);
  // e ogni modulo dell'app è nella copia offline
  for (const f of walk(join(DIR, 'js')).map((p) => p.slice(DIR.length + 1))) assert.ok(files.includes(f), `${f} manca in FILES di sw.js`);
});

test('il Faldone porta all\'officina', () => {
  assert.match(readFileSync(join(ROOT, 'index.html'), 'utf8'), /href="officina\/"/);
  assert.match(readFileSync(join(ROOT, 'app/views/explore.js'), 'utf8'), /href="officina\/"/);
});
