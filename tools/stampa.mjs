#!/usr/bin/env node
// PDF del Faldone stampabile: una scheda, un file, pagine pari. Rigenera solo ciò che è cambiato.
//   node tools/stampa.mjs             rigenera i PDF non aggiornati (dopo node tools/build.mjs)
//   node tools/stampa.mjs --tutto     rigenera tutto
//   node tools/stampa.mjs --verifica  non scrive nulla; esce con 1 se qualche PDF non è aggiornato
// Richiede Playwright con Chromium (lo stesso delle prove in tools/e2e).
import http from 'node:http';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, dirname, normalize, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pageCount } from '../app/lib/pdfmerge.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ALL = process.argv.includes('--tutto');
const CHECK = process.argv.includes('--verifica');
const plan = JSON.parse(readFileSync(join(ROOT, 'data/stampa.json'), 'utf8'));
const manFile = join(ROOT, 'stampa/pdf/manifest.json');
const man = existsSync(manFile) ? JSON.parse(readFileSync(manFile, 'utf8')) : { files: {} };
const items = [...plan.parts.map((p) => ({ key: p.id, ...p })), ...plan.sheets.map((s) => ({ key: s.code, ...s }))];
const todo = items.filter((i) => ALL || man.files[i.key]?.hash !== i.hash || !existsSync(join(ROOT, i.pdf)));

if (CHECK) {
  if (todo.length) { console.error(`${todo.length} PDF non aggiornati: ${todo.slice(0, 12).map((i) => i.key).join(', ')}${todo.length > 12 ? '…' : ''}`); process.exit(1); }
  console.log(`PDF aggiornati: ${items.length}.`); process.exit(0);
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^[/\\]+/, '');
  const f = join(ROOT, p);
  if (!f.startsWith(ROOT) || !existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream' }); res.end(readFileSync(f));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch();
const page = await browser.newPage();
mkdirSync(join(ROOT, 'stampa/pdf'), { recursive: true });
const print = async () => new Uint8Array(await page.pdf({ preferCSSPageSize: true, printBackground: true }));
let done = 0;
try {
  for (const it of todo) {
    await page.goto(base + it.src, { waitUntil: 'load' });
    // nei PDF i collegamenti portano al sito, non al server locale usato per stamparli
    await page.evaluate(async ({ from, to }) => { await document.fonts.ready; for (const a of document.querySelectorAll('a[href]')) if (a.href.startsWith(from)) { if (to) a.setAttribute('href', to + a.href.slice(from.length)); else a.removeAttribute('href'); } }, { from: base, to: plan.site ? plan.site + '/' : '' });
    let pdf = await print(); let n = pageCount(pdf);
    if (n % 2) { await page.evaluate(() => document.documentElement.classList.add('pad')); pdf = await print(); n = pageCount(pdf); }
    if (n % 2) throw new Error(`${it.key}: ${n} pagine, non riesco a renderle pari`);
    writeFileSync(join(ROOT, it.pdf), pdf);
    man.files[it.key] = { hash: it.hash, pages: n, bytes: pdf.length };
    if (++done % 40 === 0) console.log(`  ${done}/${todo.length}`);
  }
} finally { await browser.close(); server.close(); }

// via i PDF di schede che non esistono più
const keep = new Set(items.map((i) => i.key));
for (const k of Object.keys(man.files)) if (!keep.has(k)) delete man.files[k];
for (const f of readdirSync(join(ROOT, 'stampa/pdf'))) if (f.endsWith('.pdf') && !keep.has(f.slice(0, -4))) rmSync(join(ROOT, 'stampa/pdf', f));
const files = Object.fromEntries(Object.keys(man.files).sort().map((k) => [k, man.files[k]]));
const tot = Object.values(files).reduce((a, f) => ({ pages: a.pages + f.pages, bytes: a.bytes + f.bytes }), { pages: 0, bytes: 0 });
writeFileSync(manFile, JSON.stringify({ template: plan.template, revision: plan.revision, date: plan.date, files }, null, 1) + '\n');
console.log(`PDF rigenerati: ${done} su ${items.length} · ${tot.pages} pagine · ${(tot.bytes / 1048576).toFixed(1)} MiB in stampa/pdf.`);
