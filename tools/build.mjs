#!/usr/bin/env node
// Build del Faldone: content/ → data/, schede/, e/, kit/, index.html, sw.js, docs/migrazione.
//   node tools/build.mjs           build completa (fallisce se il modello non è valido)
//   node tools/build.mjs --check   solo validazione
import { mkdirSync, writeFileSync, rmSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { loadSources, normalize } from './lib/load.mjs';
import { validate } from './lib/validate.mjs';
import { sanitizeHtml, htmlToText, esc } from './lib/html.mjs';
import { renderCardPage, renderEntityPage, renderIndexPage, renderKit, renderShell, renderPresentation } from './lib/static.mjs';
import { wordCount, statusLine } from '../app/lib/scenes.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const t0 = Date.now();

const src = loadSources(ROOT);
const norm = normalize(src);
const { errors, warnings } = validate(src, norm, { allowedCycles: [] });
for (const w of warnings) console.warn('avviso:', w);
if (errors.length) { for (const e of errors) console.error('errore:', e); console.error(`\n${errors.length} errori: build interrotta.`); process.exit(1); }
console.log(`Modello valido: ${norm.entities.length} entità, ${norm.relations.length} relazioni, ${src.cards.length} schede in ${src.groups.length} gruppi.`);
if (CHECK) process.exit(0);

const write = (rel, data) => { const f = join(ROOT, rel); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, typeof data === 'string' ? data : JSON.stringify(data)); };
for (const d of ['data', 'schede', 'e', 'kit']) rmSync(join(ROOT, d), { recursive: true, force: true });

// ---------- corpus ----------
const groupTitle = (g) => g.title || src.cards.find((c) => c.code === g.codes[0])?.title || g.codes[0];
const cardsSlim = src.cards.map((c) => ({ code: c.code, title: c.title, block: c.block, scope: c.scope, group: c.group, pdf: c.pdf, md: c.md }));
const groupIndex = src.groups.map((g) => ({ id: g.id, n: g.n, title: groupTitle(g), codes: g.codes, untitled: !g.title }));
for (const g of src.groups) {
  write(`data/schede/${g.id}.json`, { id: g.id, title: groupTitle(g), codes: g.codes, html: sanitizeHtml(g.html), tails: Object.fromEntries(Object.entries(g.tails).map(([k, v]) => [k, sanitizeHtml(v)])) });
}

// ---------- glossario ----------
const glossary = [...src.legacy.glossary, ...src.glossary.add].map((g) => ({ ...g, match: src.glossary.match[g.term] || [] }));

// ---------- nucleo dei dati ----------
const usedBy = new Map();
for (const e of norm.entities) for (const c of e.cards) usedBy.set(c, [...(usedBy.get(c) || []), e.id]);
const core = {
  meta: { ...src.meta, counts: { cards: src.cards.length, groups: src.groups.length, entities: norm.entities.length, relations: norm.relations.length, inventory: src.legacy.inventory.length } },
  scopes: src.scopes, entities: norm.entities, relations: norm.relations, aliases: norm.aliases,
  tests: src.tests, testResults: src.testResults, tasksDone: [], roadmap: src.roadmap, decisions: src.decisions, issues: src.issues,
  procedures: src.procedures, paths: src.paths, glossary, synonyms: src.synonyms, connectors: src.connectors, energy: src.energy, scenarios: src.scenarios,
  cards: cardsSlim, groups: groupIndex, blocks: src.legacy.blocks,
  acquisitions: src.legacy.config.acquisitions, profiles: src.legacy.profiles,
};
const coreJson = JSON.stringify(core);
const hasher = createHash('sha256').update(coreJson);
for (const f of walk(join(ROOT, 'app'))) hasher.update(f.slice(ROOT.length)).update(readFileSync(f));
hasher.update(readFileSync(join(ROOT, 'tools/templates/sw.js'))).update(readFileSync(join(ROOT, 'content/presentazione/scene.json')));
const build = hasher.digest('hex').slice(0, 12);
core.meta.build = build;
core.meta.builtAt = new Date().toISOString().slice(0, 10);
write('data/core.json', core);

// dati tecnici consultabili su richiesta (tabelle 4.4, inventario, foto)
const photos = {};
for (const [code, list] of Object.entries(src.legacy.photos)) photos[code] = list.map((p) => ({ kind: p.kind, path: p.path, caption: p.caption || '', source: p.source || '' }));
write('data/inventory.json', { items: src.legacy.inventory, photos, opportunities: src.legacy.opportunities });
const { nodes: _n, ...tables } = src.legacy.config; void _n;
write('data/tables.json', { config: { ...tables, nodes: src.legacy.config.nodes }, ecosystem: src.legacy.ecosystem, switch: src.legacy.hardware.switch, ram: src.legacy.hardware.ram_summary });

// ---------- indice di ricerca ----------
const docs = [];
for (const g of src.groups) {
  const cs = g.codes.map((c) => src.cards.find((x) => x.code === c));
  docs.push({ id: g.id, type: 'scheda', title: groupTitle(g), codes: g.codes, text: htmlToText(g.html + Object.values(g.tails).join(' ')).slice(0, 6000), route: g.codes[0], roadmap: cs.every((c) => c.scope === 'roadmap'), blocks: [...new Set(cs.map((c) => c.block))] });
}
for (const e of norm.entities) docs.push({ id: e.id, type: e.kind === 'service' ? 'servizio' : e.kind === 'node' ? 'macchina' : ['dataset', 'storage', 'copy'].includes(e.kind) ? 'dati' : 'infrastruttura', title: `${e.name}${e.title ? ' · ' + e.title : ''}`, codes: [e.id, ...(e.inventory || [])], text: [e.oneLine, ...(e.activities || []).map((a) => a.text), ...(e.limits || []), ...Object.values(e.facts).map((f) => f.note || '')].join(' '), route: `e/${e.id}`, scopes: e.scopes });
for (const p of src.procedures) docs.push({ id: p.id, type: 'procedura', title: `${p.symptom} — ${p.title}`, codes: [p.id], text: [...p.checks.map((c) => c.text), ...p.steps.map((s) => s.text)].join(' '), route: `procedura/${p.id}` });
for (const d of src.decisions) docs.push({ id: d.id, type: 'decisione', title: d.title, codes: [d.id], text: [d.problem, d.choice, d.rationale, d.tradeoffs].filter(Boolean).join(' '), route: `realizza/decisioni/${d.id}` });
for (const t of src.roadmap.tasks) docs.push({ id: t.id, type: 'attività', title: t.title, codes: [t.id], text: t.evidence || '', route: `realizza/attivita/${t.id}`, roadmap: true });
for (const g of glossary) docs.push({ id: `G:${g.term}`, type: 'glossario', title: g.term, codes: [], text: g.text, route: `glossario/${encodeURIComponent(g.term)}` });
for (const i of src.legacy.inventory) docs.push({ id: i.code, type: 'inventario', title: `${i.code} · ${i.model}`, codes: [i.code], text: [i.assignment, i.inventory_state, i.notes].join(' '), route: `inventario/${i.code}` });
for (const q of src.issues) docs.push({ id: q.id, type: 'questione', title: q.title, codes: [q.id], text: [q.question, q.impact, q.resolution].filter(Boolean).join(' '), route: `contribuisci/${q.id}` });
write('data/search.json', docs);

// ---------- pagine statiche (senza JavaScript, stampabili, offline) ----------
const ctx = { meta: core.meta, cards: cardsSlim, groups: src.groups, groupTitle, entities: norm.entities, relations: norm.relations, usedBy, blocks: src.legacy.blocks };
for (const g of src.groups) for (const code of g.codes) write(`schede/${code}.html`, renderCardPage(ctx, g, code));
write('schede/index.html', renderIndexPage(ctx));
for (const e of norm.entities) write(`e/${e.id}.html`, renderEntityPage(ctx, e));
write('kit/emergenza.html', renderKit({ ...ctx, procedures: src.procedures, scopes: src.scopes, issues: src.issues }));

// ---------- presentazione «Il progetto in cinque minuti» ----------
const pres = JSON.parse(readFileSync(join(ROOT, 'content/presentazione/scene.json'), 'utf8'));
{
  const perr = [];
  const ids = new Set(); const cardSet = new Set(src.cards.map((c) => c.code)); const entSet = new Set(norm.entities.map((e) => e.id));
  for (const sc of pres.scenes) {
    if (ids.has(sc.id) || !/^[a-z-]+$/.test(sc.id)) perr.push(`scena ${sc.id}: identificativo duplicato o non valido`); ids.add(sc.id);
    for (const k of ['title', 'short', 'question', 'caption', 'alt']) if (!sc[k]) perr.push(`scena ${sc.id}: manca ${k}`);
    for (const e of sc.deep?.entities || []) if (!entSet.has(e)) perr.push(`scena ${sc.id}: entità inesistente ${e}`);
    for (const c of sc.deep?.cards || []) if (!cardSet.has(c)) perr.push(`scena ${sc.id}: scheda inesistente ${c}`);
  }
  for (const v of Object.values(pres.legacyChapters)) if (!ids.has(v)) perr.push(`capitolo storico verso scena inesistente ${v}`);
  const wc = wordCount(pres, src.meta);
  if (wc.main < 550 || wc.main > 650) perr.push(`testo principale di ${wc.main} parole: fuori dal budget 550–650`);
  if (perr.length) { perr.forEach((e) => console.error('errore presentazione:', e)); process.exit(1); }
  pres.statusText = statusLine(pres, src.meta);
  pres.words = wc;
  write('data/presentazione.json', pres);
  write('presentazione.html', renderPresentation({ meta: core.meta, pres, tests: src.testResults.filter((r) => r.outcome === 'superato').length }));
  console.log(`Presentazione: ${pres.scenes.length} scene, ${wc.main} parole di testo principale (+${wc.visual} nei visual).`);
}

// ---------- shell e service worker ----------
const appFiles = walk(join(ROOT, 'app')).map((f) => f.slice(ROOT.length + 1));
const indexHtml = renderShell({ meta: core.meta, scopes: src.scopes, procedures: src.procedures, build });
write('index.html', indexHtml);
const precache = ['./', 'index.html', ...appFiles, 'data/core.json', 'data/search.json', 'data/presentazione.json', 'presentazione.html', ...walk(join(ROOT, 'assets/fonts')).filter((f) => f.endsWith('.woff2')).map((f) => f.slice(ROOT.length + 1)), 'kit/emergenza.html', 'schede/index.html', 'assets/favicon.svg'];
const sw = readFileSync(join(ROOT, 'tools/templates/sw.js'), 'utf8').replace('__VERSION__', build).replace('__PRECACHE__', JSON.stringify(precache));
write('sw.js', sw);
write('data/offline-manifest.json', { build, revision: core.meta.revision, groups: src.groups.map((g) => `data/schede/${g.id}.json`), pages: src.cards.map((c) => `schede/${c.code}.html`) });

// ---------- mappa di migrazione ----------
const csv = [['codice', 'titolo_scheda', 'gruppo', 'titolo_gruppo', 'rotta_4.4', 'rotta_nuova', 'pagina_statica', 'pdf', 'markdown', 'entita_collegate']];
for (const c of src.cards) csv.push([c.code, c.title, c.group, groupTitle(src.groups.find((g) => g.id === c.group)), `#${c.code}`, `#${c.code}`, `schede/${c.code}.html`, c.pdf, c.md, (usedBy.get(c.code) || []).join(' ')]);
write('docs/migrazione/mappa-codici.csv', csv.map((r) => r.map((x) => `"${String(x ?? '').replace(/"/g, '""')}"`).join(',')).join('\n') + '\n');
const routes = [['rotta_4.4', 'rotta_nuova']].concat(Object.entries(norm.aliases).map(([a, b]) => [`#${a}`, `#${b}`]));
write('docs/migrazione/mappa-rotte.csv', routes.map((r) => r.join(',')).join('\n') + '\n');

// ---------- controllo privacy sugli output pubblici ----------
const PRIVATE = [/\/Users\//, /[A-Za-z0-9._%+-]+@(gmail|icloud|outlook|yahoo)\.[a-z]+/i, /\bjabba\b/i, /(password|token|apikey)\s*[:=]\s*\S{6,}/i];
const outFiles = ['data', 'schede', 'e', 'kit'].flatMap((d) => walk(join(ROOT, d))).concat([join(ROOT, 'index.html'), join(ROOT, 'sw.js'), join(ROOT, 'presentazione.html')]);
const leaks = [];
for (const f of outFiles) { const s = readFileSync(f, 'utf8'); for (const re of PRIVATE) if (re.test(s)) leaks.push(`${f.slice(ROOT.length + 1)}: ${re}`); }
if (leaks.length) { console.error('Dati privati negli output pubblici:\n' + leaks.join('\n')); process.exit(1); }

const size = (p) => statSync(join(ROOT, p)).size;
console.log(`Build ${build} in ${Date.now() - t0} ms · core.json ${(size('data/core.json') / 1024).toFixed(0)} KiB · search.json ${(size('data/search.json') / 1024).toFixed(0)} KiB · ${src.cards.length} pagine statiche · ${norm.entities.length} pagine entità.`);

function walk(dir) {
  let out = [];
  for (const f of readdirSync(dir)) { const p = join(dir, f); if (statSync(p).isDirectory()) out = out.concat(walk(p)); else out.push(p); }
  return out.sort();
}
export { esc };
