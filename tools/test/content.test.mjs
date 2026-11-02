// Corpus, modello, link e privacy (A05, A18, A24, A23).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, mkdtempSync, cpSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import vm from 'node:vm';
import { model, ROOT } from './helpers.mjs';
import { validate } from '../lib/validate.mjs';
import { validateCondition } from '../../app/lib/model.js';
import { sanitizeHtml } from '../lib/html.mjs';

const { src, norm } = model();
const legacy = (() => {
  try {
    const show = (p) => execFileSync('git', ['show', `f43ecf0:${p}`], { cwd: ROOT, maxBuffer: 64 << 20 }).toString();
    const ctx = { window: {} };
    vm.runInNewContext(show('assets/data.js'), ctx); vm.runInNewContext(show('assets/schede-chiare.js'), ctx);
    return ctx.window;
  } catch { return null; }
})();

test('il modello è valido', () => {
  const v = validate(src, norm);
  assert.deepEqual(v.errors, []);
});

test('A05 · tutti i codici della 4.4 risolvono e hanno pagina statica, PDF e Markdown', { skip: !legacy && 'cronologia Git non disponibile' }, () => {
  const codes = legacy.FALDONE.cards.map((c) => c.code);
  assert.equal(codes.length, 303);
  for (const code of codes) {
    const c = src.cards.find((x) => x.code === code);
    assert.ok(c, `${code} mancante`);
    assert.ok(src.groups.some((g) => g.codes.includes(code)), `${code} senza testo`);
    assert.ok(existsSync(join(ROOT, c.pdf)), `${code}: PDF mancante`);
    assert.ok(existsSync(join(ROOT, c.md)), `${code}: Markdown mancante`);
    assert.ok(existsSync(join(ROOT, 'schede', `${code}.html`)), `${code}: pagina statica mancante (eseguire la build)`);
  }
});

test('A05 · la deduplicazione non perde parti specifiche: ogni coda della 4.4 è conservata', { skip: !legacy && 'cronologia Git non disponibile' }, () => {
  let tails = 0;
  for (const g of legacy.SCHEDE_G) {
    const mine = src.groups.find((x) => x.n === g.n);
    assert.deepEqual(mine.codes, [...g.codes]);
    assert.equal(mine.html, g.html.trim());
    for (const [code, t] of Object.entries(g.tails || {})) { if (!t.trim()) continue; tails++; assert.equal(mine.tails[code], t.trim(), `${code}`); }
  }
  assert.ok(tails > 200);
});

test('condizioni strutturate: niente codice eseguibile', () => {
  assert.deepEqual(validateCondition({ all: [{ test: 'T-X' }, { quorumAt: 'C4' }] }), []);
  assert.ok(validateCondition({ js: 'return true' }).length);
  assert.ok(validateCondition('M2 && C4').length);
  for (const r of norm.relations.filter((x) => x.condition)) assert.deepEqual(validateCondition(r.condition), [], r.id);
});

test('valori mancanti: null con natura «sconosciuto», mai zero come sostituto', () => {
  for (const e of norm.entities) for (const [k, f] of Object.entries(e.facts)) {
    if (f.evidenceKind === 'unknown') assert.equal(f.value, null, `${e.id}.${k}`);
    if (f.value === 0) assert.fail(`${e.id}.${k} vale 0: verificare che non sia un sostituto`);
  }
});

test('una stessa unità non è assegnata a più macchine della sua quantità', () => {
  const broken = structuredClone(src);
  broken.entities.find((e) => e.id === 'M3').inventory = ['INV-105']; // la scheda di M1
  const v = validate(broken, { ...norm, entities: norm.entities.map((e) => (e.id === 'M3' ? { ...e, inventory: ['INV-105'] } : e)) });
  assert.ok(v.errors.some((e) => /INV-105/.test(e)));
});

test('A13 · un esito «superato» senza evidenza è rifiutato', () => {
  const bad = { ...src, testResults: [{ testId: 'T-COPIE', outcome: 'superato', date: '2027-01-10' }] };
  assert.ok(validate(bad, norm).errors.some((e) => /senza evidenza/.test(e)));
});

test('A24 · i collegamenti interni delle schede puntano a schede esistenti', () => {
  const codes = new Set(src.cards.map((c) => c.code));
  const routes = new Set(['home', 'START', ...Object.keys(norm.aliases)]);
  const broken = [];
  for (const g of src.groups) for (const html of [g.html, ...Object.values(g.tails)]) {
    for (const m of html.matchAll(/href="#([^"]+)"/g)) if (!codes.has(m[1]) && !routes.has(m[1])) broken.push(`${g.id} → ${m[1]}`);
  }
  assert.deepEqual(broken, []);
});

test('sanitizzazione: niente script, gestori di eventi o javascript: nelle schede', () => {
  assert.equal(sanitizeHtml('<p onclick="x()">a</p><script>alert(1)</script><a href="javascript:alert(1)">b</a>'), '<p>a</p><a>b</a>');
  for (const f of readdirSync(join(ROOT, 'data/schede'))) {
    const s = readFileSync(join(ROOT, 'data/schede', f), 'utf8');
    assert.doesNotMatch(s, /<script|\son[a-z]+=|javascript:/i, f);
  }
});

test('A18 · output pubblici senza percorsi locali, email personali o segreti', () => {
  const pats = [/\/Users\//, /@gmail\.com/i, /\bjabba\b/i, /(password|token|apikey)\s*[:=]\s*\S{6,}/i, /\b(10|192\.168)\.\d+\.\d+\.\d+\b/];
  const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((x) => (x.isDirectory() ? walk(join(d, x.name)) : [join(d, x.name)]));
  const files = ['data', 'schede', 'e', 'kit', 'app'].flatMap((d) => walk(join(ROOT, d))).concat([join(ROOT, 'index.html'), join(ROOT, 'sw.js')]);
  const leaks = [];
  for (const f of files) { const s = readFileSync(f, 'utf8'); for (const p of pats) if (p.test(s)) leaks.push(`${f.slice(ROOT.length)} ${p}`); }
  assert.deepEqual(leaks, []);
});

test('A23 · una modifica editoriale si propaga a ricerca, pagina statica e dati della scheda', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'faldone-'));
  try {
    for (const d of ['content', 'app', 'tools', 'assets']) cpSync(join(ROOT, d), join(tmp, d), { recursive: true });
    const f = join(tmp, 'content/corpus/schede/g023.html');
    writeFileSync(f, readFileSync(f, 'utf8').replace('</div>', ' Parolaprovaunica di verifica.</div>'));
    execFileSync('node', ['tools/build.mjs'], { cwd: tmp, stdio: 'pipe' });
    assert.match(readFileSync(join(tmp, 'data/search.json'), 'utf8'), /Parolaprovaunica/);
    assert.match(readFileSync(join(tmp, 'schede/INF-03.03.html'), 'utf8'), /Parolaprovaunica/);
    assert.match(readFileSync(join(tmp, 'schede/ATL-06.html'), 'utf8'), /Parolaprovaunica/, 'il testo comune si aggiorna per tutti i codici del gruppo');
    assert.match(readFileSync(join(tmp, 'data/schede/g023.json'), 'utf8'), /Parolaprovaunica/);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});
