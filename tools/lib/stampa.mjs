// Faldone stampabile: schede sostituibili, blocchi e raccoglitore intero, generati dal corpus.
// Un testo si stampa una volta sola, nel blocco del suo primo codice; gli indici dei blocchi rimandano lì.
import { createHash } from 'node:crypto';
import { esc, sanitizeHtml } from './html.mjs';

/** Cambia quando cambia l'impaginazione: tutti i PDF risultano da rigenerare. */
export const TEMPLATE = 1;

const WRAP = '<div class="tablewrap" tabindex="0" role="group" aria-label="Tabella">';
const cssStr = (s) => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ')}"`;
const pageName = (id) => `p-${String(id).replace(/[^A-Za-z0-9]/g, '-')}`;
export const pdfName = (id) => `stampa/pdf/${id}.pdf`;

/** Piano del raccoglitore: quali schede, in quale blocco, in che ordine. */
export function planBinder({ cards, groups, groupTitle, blocks }) {
  const cardBy = new Map(cards.map((c) => [c.code, c]));
  const gBy = new Map(groups.map((g) => [g.id, g]));
  const byGroup = new Map();
  const sheets = [];
  for (const c of cards) {
    if (byGroup.has(c.group)) continue;
    const g = gBy.get(c.group);
    const codes = cards.filter((x) => x.group === c.group).map((x) => x.code);
    const s = { id: g.id, code: c.code, block: c.block, title: groupTitle(g), codes, blocks: [...new Set(codes.map((k) => cardBy.get(k).block))], roadmap: codes.every((k) => cardBy.get(k).scope === 'roadmap') };
    byGroup.set(c.group, s); sheets.push(s);
  }
  const sheetOf = (code) => byGroup.get(cardBy.get(code)?.group);
  const blockList = Object.keys(blocks).map((id) => {
    const cs = cards.filter((c) => c.block === id);
    return { id, name: blocks[id], cards: cs.map((c) => c.code), own: sheets.filter((s) => s.block === id).map((s) => s.code), all: [...new Set(cs.map((c) => sheetOf(c.code).code))] };
  });
  const orphan = cards.filter((c) => !(c.block in blocks)).map((c) => c.code);
  return { sheets, blocks: blockList, sheetOf, cardBy, gBy, orphan };
}

function body(g, sheet, { up, level }) {
  const clean = (h) => sanitizeHtml(h)
    .replace(/\sid="[^"]*"/g, '')
    .replace(/href="#([^"]*)"/g, (m, r) => `href="${up}index.html#${r}"`)
    .replace(/<(\/?)h2\b/g, `<$1h${level}`)
    .replace(/<table\b/g, `${WRAP}<table`).replace(/<\/table>/g, '</table></div>');
  const tails = new Map();
  for (const code of sheet.codes) { const t = (g.tails[code] || '').trim(); if (t) tails.set(t, [...(tails.get(t) || []), code]); }
  const common = tails.size === 1 && [...tails.values()][0].length === sheet.codes.length;
  const tail = common ? clean([...tails.keys()][0]) : [...tails].map(([t, cs]) => `<section class="tail"><p class="tailfor">Parte specifica di ${cs.map((c) => `<span class="code">${esc(c)}</span>`).join(', ')}</p>${clean(t)}</section>`).join('');
  return clean(g.html) + tail;
}

/** Una scheda: testata propria, testo, eventuali parti specifiche dei singoli codici. */
export function sheetHtml(ctx, plan, sheet, { up = '../../', level = 1 } = {}) {
  const m = ctx.meta;
  const also = sheet.codes.filter((c) => c !== sheet.code);
  const H = `h${level}`;
  return `<article class="sheet" id="s-${esc(sheet.code)}" style="page:${pageName(sheet.id)}">
<p class="sheet-eye"><span class="code">${esc(sheet.code)}</span> / scheda sostituibile</p>
<${H} class="sheet-t">${esc(sheet.title)}</${H}>
<p class="sheet-meta">Blocco ${esc(sheet.block)} · ${esc(ctx.blocks[sheet.block] || '')} · revisione ${esc(m.revision)} · ${esc(m.documentDate)}${sheet.roadmap ? ' · <strong>roadmap e attuazione</strong>: attività future o da verificare' : ''}</p>
${also.length ? `<p class="sheet-also">Vale anche per ${also.length === 1 ? 'il codice' : 'i codici'}: ${also.map((c) => `<span class="code">${esc(c)}</span>`).join(' · ')}</p>` : ''}
<div class="doc">${body(plan.gBy.get(sheet.id), sheet, { up, level: level + 1 })}</div>
<div class="filler" aria-hidden="true">Pagina lasciata vuota: la scheda successiva comincia su un foglio nuovo.</div>
</article>`;
}

const sheetRule = (ctx, sheet, numbered) => `@page ${pageName(sheet.id)}{@top-right{content:${cssStr(sheet.code)}}@bottom-left{content:${cssStr(`${sheet.code} | revisione ${ctx.meta.revision} | ${ctx.meta.documentDate}`)}}${numbered ? '@bottom-right{content:"pagina " counter(page) " di " counter(pages)}' : ''}}`;
const partRule = (ctx, id, label, numbered) => `@page ${pageName(id)}{@top-right{content:${cssStr(label)}}@bottom-left{content:${cssStr(`${label} | revisione ${ctx.meta.revision} | ${ctx.meta.documentDate}`)}}${numbered ? '@bottom-right{content:"pagina " counter(page) " di " counter(pages)}' : ''}}`;
const baseRule = (ctx) => `@page{@top-left{content:${cssStr(`IL FALDONE · INFRASTRUTTURA DI CASA · ${ctx.meta.revision}`)}}}`;

/** Frontespizio del raccoglitore, con le istruzioni per tenerlo aggiornato. */
export function coverHtml(ctx, plan, { up = '../../', level = 1, links = false } = {}) {
  const m = ctx.meta; const H = `h${level}`; const H2 = `h${level + 1}`;
  return `<section class="part cover" id="copertina" style="page:${pageName('copertina')}">
<p class="sheet-eye">Raccoglitore a schede sostituibili</p>
<${H} class="cover-t">Il Faldone</${H}>
<p class="cover-sub">${esc(m.subtitle)}</p>
<p class="cover-rev">Revisione ${esc(m.revision)} · documento del ${esc(m.documentDate)}</p>
<p>${esc(m.statement)}</p>
<${H2}>Come si usa e come si aggiorna</${H2}>
<ul>
<li>Il raccoglitore è diviso in ${plan.blocks.length} blocchi. Ogni blocco si apre con il proprio indice.</li>
<li>Ogni scheda comincia su un foglio nuovo e occupa un numero pari di pagine: si stampa fronte-retro e si sfila senza toccare le altre.</li>
<li>In fondo a ogni pagina ci sono codice, revisione e data; le pagine sono numerate dentro la scheda, non nel raccoglitore.</li>
<li>Per aggiornare si ristampa solo la scheda cambiata e si sostituisce il foglio. Se la revisione in fondo alla pagina è più vecchia di quella del sito, la scheda è da ristampare.</li>
<li>Un testo che vale per più codici è stampato una volta sola, nel blocco del suo primo codice; gli indici degli altri blocchi rimandano a quella scheda.</li>
${ctx.site ? `<li>La versione sempre aggiornata, da sfogliare o da scaricare, è sul sito: ${esc(ctx.site)}/stampa/</li>` : ''}
</ul>
<${H2}>I blocchi</${H2}>
${WRAP}<table class="idx"><thead><tr><th scope="col">Blocco</th><th scope="col">Argomento</th><th scope="col">Codici</th><th scope="col">Schede stampate qui</th></tr></thead><tbody>
${plan.blocks.map((b) => `<tr><th scope="row"><span class="code">${esc(b.id)}</span></th><td>${links ? `<a href="#b-${esc(b.id)}">${esc(b.name)}</a>` : esc(b.name)}</td><td>${b.cards.length}</td><td>${b.own.length}</td></tr>`).join('')}
</tbody></table></div>
<p class="muted">${ctx.cards.length} codici in ${plan.sheets.length} schede.</p>
<div class="filler" aria-hidden="true">Pagina lasciata vuota.</div>
</section>`;
}

/** Frontespizio di un blocco con l'indice dei suoi codici. */
export function dividerHtml(ctx, plan, block, { level = 1, links = null } = {}) {
  const H = `h${level}`;
  const row = (code) => {
    const c = plan.cardBy.get(code); const s = plan.sheetOf(code);
    const here = s.code === code;
    const where = here ? 'in questo blocco' : `scheda <span class="code">${esc(s.code)}</span>${s.block === block.id ? '' : ` · blocco ${esc(s.block)}`}`;
    const t = links && links(s) ? `<a href="${links(s)}">${esc(c.title)}</a>` : esc(c.title);
    return `<tr><th scope="row"><span class="code">${esc(code)}</span></th><td>${t}</td><td>${where}</td></tr>`;
  };
  return `<section class="part divider" id="b-${esc(block.id)}" style="page:${pageName('blocco-' + block.id)}">
<p class="sheet-eye">Blocco</p>
<${H} class="divider-t"><span class="divider-n">${esc(block.id)}</span> ${esc(block.name)}</${H}>
<p class="sheet-meta">${block.cards.length} codici · ${block.own.length} schede stampate in questo blocco · revisione ${esc(ctx.meta.revision)} · ${esc(ctx.meta.documentDate)}</p>
${WRAP}<table class="idx"><thead><tr><th scope="col">Codice</th><th scope="col">Titolo</th><th scope="col">Dove si legge</th></tr></thead><tbody>
${block.cards.map(row).join('')}
</tbody></table></div>
<div class="filler" aria-hidden="true">Pagina lasciata vuota.</div>
</section>`;
}

function printPage({ title, up, css, bar, main }) {
  return `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'">
<title>${esc(title)} · Il Faldone</title><link rel="icon" href="${up}assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="${up}app/stampa.css"><style>${css}</style></head>
<body><a class="skip" href="#contenuto">Vai al contenuto</a>
<header class="st-bar"><a class="brand" href="${up}index.html">Il Faldone</a><nav aria-label="Faldone stampabile">${bar}</nav><button type="button" class="st-print" data-print hidden>Stampa</button></header>
<main id="contenuto">${main}</main>
<script type="module" src="${up}app/stampa-page.js"></script></body></html>`;
}

/** Tutte le pagine del Faldone stampabile e il piano che le descrive. */
export function renderBinder(ctx, css) {
  const plan = planBinder(ctx);
  const files = {};
  const hash = (html) => createHash('sha256').update(`${TEMPLATE}\n${css}\n${html}`).digest('hex').slice(0, 16);
  const hub = (up) => `<a href="${up}stampa/index.html">Faldone stampabile</a>`;
  const app = (up, route) => `<a href="${up}index.html#${route}">Versione interattiva</a>`;
  const blockLink = (up, id) => `<a href="${up}stampa/blocco-${esc(id)}.html">Blocco ${esc(id)}</a>`;

  // schede singole: sono anche la sorgente dei PDF
  const sheets = plan.sheets.map((s) => {
    const src = `stampa/scheda/${s.code}.html`;
    const html = printPage({ title: `${s.code} ${s.title}`, up: '../../', css: baseRule(ctx) + sheetRule(ctx, s, true), bar: `${hub('../../')} · ${blockLink('../../', s.block)} · <a href="../pdf/${esc(s.code)}.pdf">PDF</a> · ${app('../../', s.code)}`, main: sheetHtml(ctx, plan, s) });
    files[src] = html;
    return { id: s.id, code: s.code, title: s.title, block: s.block, codes: s.codes, roadmap: s.roadmap, src, pdf: pdfName(s.code), hash: hash(html) };
  });

  // parti: copertina e frontespizi dei blocchi
  const parts = [];
  {
    const src = 'stampa/parti/copertina.html';
    const html = printPage({ title: 'Frontespizio', up: '../../', css: baseRule(ctx) + partRule(ctx, 'copertina', 'Frontespizio', true), bar: hub('../../'), main: coverHtml(ctx, plan) });
    files[src] = html; parts.push({ id: '_copertina', title: 'Frontespizio', src, pdf: pdfName('_copertina'), hash: hash(html) });
  }
  for (const b of plan.blocks) {
    const src = `stampa/parti/blocco-${b.id}.html`;
    const html = printPage({ title: `Blocco ${b.id} · indice`, up: '../../', css: baseRule(ctx) + partRule(ctx, 'blocco-' + b.id, `Blocco ${b.id} · indice`, true), bar: `${hub('../../')} · ${blockLink('../../', b.id)}`, main: dividerHtml(ctx, plan, b) });
    files[src] = html; parts.push({ id: `_blocco-${b.id}`, block: b.id, title: `Blocco ${b.id} · indice`, src, pdf: pdfName(`_blocco-${b.id}`), hash: hash(html) });
  }

  // blocco da solo: indice e tutte le schede che servono ai suoi codici
  for (const b of plan.blocks) {
    const list = b.all.map((code) => plan.sheetOf(code));
    const css1 = baseRule(ctx) + partRule(ctx, 'blocco-' + b.id, `Blocco ${b.id} · indice`, false) + list.map((s) => sheetRule(ctx, s, false)).join('');
    files[`stampa/blocco-${b.id}.html`] = printPage({ title: `Blocco ${b.id} · ${b.name}`, up: '../', css: css1, bar: `${hub('../')} · <a href="faldone.html">Faldone intero</a> · <a href="../index.html#documenti/stampa">Scarica il PDF</a>`,
      main: `<h1 class="vh">Blocco ${esc(b.id)} · ${esc(b.name)}</h1>${dividerHtml(ctx, plan, b, { level: 2, links: (s) => `#s-${s.code}` })}${list.map((s) => sheetHtml(ctx, plan, s, { up: '../', level: 3 })).join('\n')}` });
  }

  // raccoglitore intero: ogni scheda una volta, nel blocco del suo primo codice
  {
    const css1 = baseRule(ctx) + partRule(ctx, 'copertina', 'Frontespizio', false) + plan.blocks.map((b) => partRule(ctx, 'blocco-' + b.id, `Blocco ${b.id} · indice`, false)).join('') + plan.sheets.map((s) => sheetRule(ctx, s, false)).join('');
    files['stampa/faldone.html'] = printPage({ title: 'Faldone intero', up: '../', css: css1, bar: `${hub('../')} · <a href="../index.html#documenti/stampa">Scarica il PDF</a> · <a href="../index.html">Versione interattiva</a>`,
      main: `${coverHtml(ctx, plan, { up: '../', level: 1, links: true })}${plan.blocks.map((b) => `${dividerHtml(ctx, plan, b, { level: 2, links: (s) => `#s-${s.code}` })}${b.own.map((code) => sheetHtml(ctx, plan, plan.sheetOf(code), { up: '../', level: 3 })).join('\n')}`).join('\n')}` });
  }

  // indice senza JavaScript
  files['stampa/index.html'] = printPage({ title: 'Faldone stampabile', up: '../', css: '', bar: `<a href="../index.html#documenti/stampa">Scarica i PDF composti</a> · <a href="../schede/index.html">Indice delle schede</a> · <a href="../index.html">Versione interattiva</a>`,
    main: `<div class="st-hub"><p class="sheet-eye">Revisione ${esc(ctx.meta.revision)} · ${esc(ctx.meta.documentDate)}</p><h1>Faldone stampabile</h1>
<p>Raccoglitore a schede sostituibili, generato dagli stessi testi del sito: ${ctx.cards.length} codici in ${plan.sheets.length} schede, ${plan.blocks.length} blocchi. Si può sfogliare intero, a blocchi o una scheda alla volta, e stampare da qui.</p>
<p><a class="st-btn" href="faldone.html">Sfoglia il Faldone intero</a> <a class="st-btn ghost" href="../index.html#documenti/stampa">Scarica il PDF intero o di un blocco</a></p>
<p class="muted">Ogni scheda ha il suo PDF con pagine pari, pronto per il fronte-retro. Il PDF intero e quelli dei blocchi si compongono al momento nella pagina «Faldone stampabile» della versione interattiva.</p>
${plan.blocks.map((b) => `<section><h2><span class="code">${esc(b.id)}</span> ${esc(b.name)}</h2><p><a href="blocco-${esc(b.id)}.html">Sfoglia il blocco</a> · ${b.cards.length} codici · <a href="pdf/_blocco-${esc(b.id)}.pdf">indice del blocco (PDF)</a></p>
${b.own.length ? `<ul class="cols">${b.own.map((code) => { const s = plan.sheetOf(code); return `<li><a href="scheda/${esc(code)}.html"><span class="code">${esc(code)}</span> ${esc(s.title)}</a> · <a href="pdf/${esc(code)}.pdf">PDF</a></li>`; }).join('')}</ul>` : '<p class="muted">I testi di questo blocco sono stampati in altri blocchi: l\'indice del blocco dice dove.</p>'}</section>`).join('')}</div>` });

  const manifest = { template: TEMPLATE, revision: ctx.meta.revision, date: ctx.meta.documentDate, site: ctx.site, parts, sheets, blocks: plan.blocks.map((b) => ({ id: b.id, name: b.name, cards: b.cards.length, own: b.own, all: b.all })) };
  return { files, manifest, plan };
}
