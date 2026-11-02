#!/usr/bin/env node
// Migrazione deterministica del Faldone rev 4.4 (sito a script sovrapposti)
// verso sorgenti versionabili in content/.
//
// Legge i file pubblicati da una revisione Git (default: f43ecf0, ultima
// pubblicazione 4.4) e non dai file di lavoro: la migrazione si può rieseguire
// identica anche dopo che il vecchio sito è stato rimosso.
//
//   node tools/migrate-legacy.mjs [--rev f43ecf0]
//
// Uscite:
//   content/corpus/schede/gNNN.html  testo leggibile dei 181 gruppi (fonte editoriale)
//   content/corpus/cards.json        anagrafica delle 303 schede (codice, gruppo, PDF, MD)
//   content/legacy/*.json            dati strutturati 4.4, ripuliti da percorsi locali
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const argRev = process.argv.indexOf('--rev');
const REV = argRev > 0 ? process.argv[argRev + 1] : 'f43ecf0';

const show = (p) => execFileSync('git', ['show', `${REV}:${p}`], { cwd: ROOT, maxBuffer: 64 << 20 }).toString('utf8');
const run = (src) => { const ctx = { window: {} }; vm.runInNewContext(src, ctx); return ctx.window; };

const FALDONE = run(show('assets/data.js')).FALDONE;
const SCHEDE_G = run(show('assets/schede-chiare.js')).SCHEDE_G;

// Percorsi assoluti della macchina di lavoro: non devono finire nel sito pubblico.
const LOCAL_PREFIX = /^\/Users\/[^/]+\/.*?\/(?=(04_Sorgenti|01_Vault_MD)\/)/;
function cleanPath(p) {
  if (typeof p !== 'string') return p;
  if (LOCAL_PREFIX.test(p)) p = p.replace(LOCAL_PREFIX, '');
  else if (p.startsWith('/Users/')) return null; // fuori dal repository: non pubblicabile
  p = p.replace(/^\.\.\//, '');
  // normalizza "a/b/../c"
  const parts = [];
  for (const s of p.split('/')) { if (s === '..') parts.pop(); else if (s !== '.') parts.push(s); }
  return parts.join('/');
}
function deepClean(v) {
  if (Array.isArray(v)) return v.map(deepClean);
  if (v && typeof v === 'object') {
    const o = {};
    for (const [k, x] of Object.entries(v)) o[k] = (k === 'path' || k === 'source' && typeof x === 'string' && x.startsWith('/Users/')) ? cleanPath(x) : deepClean(x);
    return o;
  }
  if (typeof v === 'string' && v.startsWith('/Users/')) return cleanPath(v);
  return v;
}

const out = (rel, data) => {
  const f = join(ROOT, rel); mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, typeof data === 'string' ? data : JSON.stringify(data, null, 1) + '\n');
};

// ---- corpus leggibile: un file per gruppo -----------------------------------
rmSync(join(ROOT, 'content/corpus/schede'), { recursive: true, force: true });
const groupOf = {};
for (const g of SCHEDE_G) {
  const id = 'g' + String(g.n).padStart(3, '0');
  g.codes.forEach((c) => (groupOf[c] = id));
  const head = { n: g.n, title: g.title, codes: g.codes };
  let body = `<!--faldone ${JSON.stringify(head)} -->\n${g.html.trim()}\n`;
  for (const code of g.codes) if (g.tails?.[code]) body += `<!--tail ${code}-->\n${g.tails[code].trim()}\n`;
  out(`content/corpus/schede/${id}.html`, body);
}

// ---- anagrafica schede -------------------------------------------------------
const cards = FALDONE.cards.map((c) => ({
  code: c.code,
  title: c.title,
  block: c.block,
  scope: c.scope,
  group: groupOf[c.code] || null,
  pdf: cleanPath(c.pdf),
  md: cleanPath(c.source),
}));
out('content/corpus/cards.json', cards);

// ---- dati strutturati 4.4 ------------------------------------------------------
for (const k of ['config', 'profiles', 'blocks', 'hardware', 'ecosystem', 'opportunities', 'inventory', 'photos', 'meta']) {
  out(`content/legacy/${k}.json`, deepClean(FALDONE[k]));
}
// I diagrammi sono già nel repository come file (assets/diagrammi/*.svg): si conserva solo l'elenco.
out('content/legacy/diagrams.json', Object.keys(FALDONE.diagrams));

const missing = FALDONE.cards.filter((c) => !groupOf[c.code]).map((c) => c.code);
console.log(`Migrazione da ${REV}: ${SCHEDE_G.length} gruppi, ${cards.length} schede, senza gruppo: ${missing.length ? missing.join(', ') : 'nessuna'}`);

// ---- glossario del sito 4.4 (rev44-chiaro.js) ---------------------------------
{
  const src = show('assets/rev44-chiaro.js');
  const m = src.match(/const GLOSS=(\[[\s\S]*?\]\]);/);
  const gloss = m ? vm.runInNewContext(m[1]) : [];
  out('content/legacy/glossary-44.json', gloss.map(([term, text]) => ({ term, text })));
  console.log(`Glossario 4.4: ${gloss.length} voci`);
}
