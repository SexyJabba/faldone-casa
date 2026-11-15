// Faldone stampabile: piano del raccoglitore, pagine generate, PDF delle schede e loro composizione.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, model } from './helpers.mjs';
import { planBinder, renderBinder } from '../lib/stampa.mjs';
import { wholeOrder, blockOrder, staleKeys, totals, fileName } from '../../app/lib/stampa.js';
import { mergePdfs, pageCount, parsePdf } from '../../app/lib/pdfmerge.js';

const { src } = model();
const groupTitle = (g) => g.title || src.cards.find((c) => c.code === g.codes[0])?.title || g.codes[0];
const ctx = { meta: src.meta, cards: src.cards, groups: src.groups, groupTitle, blocks: src.legacy.blocks, site: 'https://esempio.invalid' };
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const plan = JSON.parse(read('data/stampa.json'));
const pdf = JSON.parse(read('stampa/pdf/manifest.json'));
const bin = (k) => new Uint8Array(readFileSync(join(ROOT, `stampa/pdf/${k}.pdf`)));

test('piano: ogni codice ha la sua scheda, ogni testo si stampa una volta sola', () => {
  const p = planBinder(ctx);
  assert.equal(p.sheets.length, src.groups.length);
  assert.deepEqual(p.orphan, []);
  for (const c of src.cards) { const s = p.sheetOf(c.code); assert.ok(s && s.codes.includes(c.code), c.code); }
  assert.equal(new Set(p.sheets.map((s) => s.code)).size, p.sheets.length);
  assert.equal(p.blocks.reduce((n, b) => n + b.cards.length, 0), src.cards.length);
  assert.equal(p.blocks.reduce((n, b) => n + b.own.length, 0), p.sheets.length, 'nel raccoglitore intero ogni scheda sta in un blocco solo');
  for (const b of p.blocks) for (const code of b.cards) assert.ok(b.all.includes(p.sheetOf(code).code), `il blocco ${b.id} da solo contiene il testo di ${code}`);
  for (const s of p.sheets) assert.equal(s.block, p.cardBy.get(s.code).block);
});

test('ordine di composizione: frontespizio, indice di blocco, schede', () => {
  const w = wholeOrder(plan);
  assert.equal(w[0], '_copertina');
  assert.equal(w.length, 1 + plan.blocks.length + plan.sheets.length);
  assert.equal(new Set(w).size, w.length);
  const b = blockOrder(plan, '03');
  assert.equal(b[0], '_blocco-03');
  assert.ok(b.includes('INF-03.03') && b.length > 2);
  assert.deepEqual(blockOrder(plan, 'inesistente'), []);
  assert.equal(fileName(plan, 'tutto'), `Faldone-rev${plan.revision}.pdf`);
  assert.equal(totals(['_copertina', 'non-esiste'], pdf), null, 'niente totali inventati se manca un PDF');
});

test('pagine generate: testata propria, piè di pagina per scheda, niente identificativi doppi', () => {
  const css = read('app/stampa.css');
  const { files, manifest } = renderBinder(ctx, css);
  const one = files['stampa/scheda/INF-01.01.html'];
  assert.match(one, /@page p-g002\{[^}]*@top-right\{content:"INF-01\.01"\}/);
  assert.match(one, /INF-01\.01 \| revisione [0-9.]+ \| \d{4}-\d\d-\d\d/);
  assert.match(one, /pagina " counter\(page\) " di " counter\(pages\)/, 'la scheda singola numera le proprie pagine');
  assert.match(one, /Vale anche per i codici/);
  assert.doesNotMatch(one.split('<article')[1], /href="#/, 'i rimandi portano alla versione interattiva, non ad ancore assenti');
  const whole = files['stampa/faldone.html'];
  const ids = [...whole.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, 'identificativi unici nel raccoglitore intero');
  assert.equal((whole.match(/<article class="sheet"/g) || []).length, manifest.sheets.length);
  assert.doesNotMatch(whole, /counter\(pages\)/, 'nel documento intero non c\'è una numerazione globale che cambierebbe a ogni sostituzione');
  assert.equal((whole.match(/<h1\b/g) || []).length, 1);
  // stesso contenuto, stessa impronta; contenuto diverso, impronta diversa
  assert.deepEqual(renderBinder(ctx, css).manifest.sheets.map((s) => s.hash), manifest.sheets.map((s) => s.hash));
  assert.notEqual(renderBinder(ctx, css + ' ').manifest.sheets[0].hash, manifest.sheets[0].hash, 'se cambia l\'impaginazione i PDF sono da rigenerare');
  for (const s of plan.sheets) assert.ok(existsSync(join(ROOT, s.src)), s.src);
});

test('i PDF delle schede sono quelli del testo corrente, con pagine pari', () => {
  const stale = staleKeys(plan, pdf);
  assert.deepEqual(stale, [], `PDF non aggiornati: eseguire «node tools/stampa.mjs» (${stale.slice(0, 8).join(', ')})`);
  const keys = [...plan.parts.map((p) => p.id), ...plan.sheets.map((s) => s.code)];
  assert.deepEqual(readdirSync(join(ROOT, 'stampa/pdf')).filter((f) => f.endsWith('.pdf')).map((f) => f.slice(0, -4)).sort(), [...keys].sort(), 'nessun PDF orfano o mancante');
  for (const k of keys) assert.equal(pdf.files[k].pages % 2, 0, `${k}: pagine pari per il fronte-retro`);
  for (const k of ['_copertina', '_blocco-01', 'INF-01.01', 'INF-01.19']) assert.equal(pageCount(bin(k)), pdf.files[k].pages, k);
});

test('composizione: il blocco e il raccoglitore intero hanno le pagine della somma delle parti', () => {
  const b = blockOrder(plan, '00');
  const out = mergePdfs(b.map(bin), { title: 'Prova è', date: plan.date });
  assert.equal(pageCount(out), totals(b, pdf).pages);
  assert.equal(pageCount(mergePdfs([out, bin('_copertina')])), totals(b, pdf).pages + pdf.files._copertina.pages, 'un PDF composto si può comporre di nuovo');
  const w = wholeOrder(plan);
  const all = mergePdfs(w.map(bin));
  const doc = parsePdf(all);
  assert.equal(doc.pages.length, totals(w, pdf).pages);
  const text = Buffer.from(all).toString('latin1');
  assert.doesNotMatch(text, /127\.0\.0\.1|localhost/, 'nei PDF nessun indirizzo del server usato per stamparli');
  assert.throws(() => mergePdfs([]), /nessun file/);
  assert.throws(() => parsePdf(new Uint8Array([1, 2, 3])), /PDF non componibile/);
  assert.throws(() => parsePdf(new TextEncoder().encode('%PDF-1.5\nniente\n')), /PDF non componibile/);
});
