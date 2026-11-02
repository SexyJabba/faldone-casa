// Pagine statiche: leggibili senza JavaScript, stampabili e consultabili offline.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc, sanitizeHtml } from './html.mjs';
import { renderScene } from '../../app/lib/scenes.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const STATIC_CSS = () => readFileSync(join(ROOT, 'app/static.css'), 'utf8');

const DEC = { ipotesi: 'Ipotesi', proposta: 'Proposta', approvata: 'Approvata', superata: 'Superata', da_chiarire: 'Da chiarire' };
const REAL = { da_acquisire: 'Da acquisire', ordinato: 'Ordinato / dichiarato', disponibile: 'Disponibile', installato: 'Installato', configurato: 'Configurato', collaudato: 'Collaudato', dismesso: 'Dismesso', non_attestato: 'Installazione non attestata' };
const EV = { documented: 'documentato', declared: 'dichiarato', measured: 'misurato', estimated: 'stimato', simulated: 'simulato', unknown: 'sconosciuto' };
const REL = { hosted_on: 'gira su', depends_on: 'dipende da', connected_to: 'collegato a', stores_on: 'salva su', backs_up_to: 'copiato in', replicates_to: 'replicato in', protected_by: 'protetto da', recovers_on: 'può ripartire su', powered_by: 'alimentato da', located_in: 'si trova in', validated_by: 'provato da', member_of: 'membro di', wakes: 'accende' };

function page({ title, depth = 1, body, inlineCss = false, desc = '' }) {
  const up = '../'.repeat(depth);
  const css = inlineCss ? `<style>${STATIC_CSS()}</style>` : `<link rel="stylesheet" href="${up}app/static.css">`;
  return `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'">
<title>${esc(title)} · Il Faldone</title>${desc ? `<meta name="description" content="${esc(desc)}">` : ''}${inlineCss ? '' : `<link rel="icon" href="${up}assets/favicon.svg" type="image/svg+xml">`}${css}</head>
<body><a class="skip" href="#contenuto">Vai al contenuto</a><header class="sh"><a class="brand" href="${up}index.html">Il Faldone</a><nav aria-label="Navigazione statica"><a href="${up}schede/index.html">Indice delle schede</a> · <a href="${up}kit/emergenza.html">Emergenza</a> · <a href="${up}index.html">Versione interattiva</a></nav></header>
<main id="contenuto">${body}</main></body></html>`;
}

const rewriteLinks = (html, cardSet, prefix = '') => html.replace(/href="#([A-Za-z0-9.-]+)"/g, (m, code) => (cardSet.has(code) ? `href="${prefix}${code}.html"` : m));

export function renderCardPage(ctx, g, code) {
  const card = ctx.cards.find((c) => c.code === code);
  const cardSet = new Set(ctx.cards.map((c) => c.code));
  const others = g.codes.filter((c) => c !== code);
  const ents = (ctx.usedBy.get(code) || []).map((id) => ctx.entities.find((e) => e.id === id)).filter(Boolean);
  const body = `<p class="eyebrow">${esc(card.block)} · ${esc(ctx.blocks[card.block] || '')} · Revisione ${esc(ctx.meta.revision)}</p>
<h1><span class="code">${esc(code)}</span> ${esc(ctx.groupTitle(g))}</h1>
<p class="muted">Titolo d'archivio: ${esc(card.title)}${card.scope === 'roadmap' ? ' · <strong>Roadmap e attuazione</strong>: attività future o da verificare.' : ''}</p>
${others.length ? `<p class="note">Testo comune a ${others.length + 1} schede: ${others.map((c) => `<a href="${c}.html">${esc(c)}</a>`).join(', ')}. La parte specifica di ${esc(code)} è in fondo.</p>` : ''}
<article class="doc">${rewriteLinks(sanitizeHtml(g.html), cardSet)}${g.tails[code] ? `<section class="tail"><h2>Parte specifica di ${esc(code)}</h2>${rewriteLinks(sanitizeHtml(g.tails[code]), cardSet)}</section>` : ''}</article>
${ents.length ? `<h2>Elementi descritti</h2><ul>${ents.map((e) => `<li><a href="../e/${e.id}.html">${esc(e.name)}</a> — ${esc(e.oneLine)}</li>`).join('')}</ul>` : ''}
<p class="links"><a href="../${esc(card.pdf)}">PDF della scheda</a> · <a href="../${esc(card.md)}">Sorgente Markdown</a> · <a href="../index.html#${esc(code)}">Apri nella versione interattiva</a></p>
<footer class="sf">Il Faldone · revisione ${esc(ctx.meta.revision)} del ${esc(ctx.meta.documentDate)} · Documentazione di progetto, nessuna telemetria.</footer>`;
  return page({ title: `${code} ${ctx.groupTitle(g)}`, body, desc: card.title });
}

export function renderIndexPage(ctx) {
  const byBlock = new Map();
  for (const c of ctx.cards) byBlock.set(c.block, [...(byBlock.get(c.block) || []), c]);
  const body = `<h1>Indice delle schede</h1><p>${ctx.cards.length} schede con codice stabile, raccolte in ${ctx.groups.length} testi. Revisione ${esc(ctx.meta.revision)} del ${esc(ctx.meta.documentDate)}. Questa pagina funziona senza JavaScript e si può stampare.</p>
${[...byBlock].map(([b, cs]) => `<section><h2>${esc(b)} · ${esc(ctx.blocks[b] || '')}</h2><ul class="cols">${cs.map((c) => `<li><a href="${c.code}.html"><span class="code">${esc(c.code)}</span> ${esc(c.title)}</a></li>`).join('')}</ul></section>`).join('')}
<h2>Elementi dell'infrastruttura</h2><ul class="cols">${ctx.entities.map((e) => `<li><a href="../e/${e.id}.html"><span class="code">${esc(e.id)}</span> ${esc(e.name)}${e.title ? ' · ' + esc(e.title) : ''}</a></li>`).join('')}</ul>`;
  return page({ title: 'Indice delle schede', body });
}

export function renderEntityPage(ctx, e) {
  const name = (id) => ctx.entities.find((x) => x.id === id)?.name || id;
  const out = ctx.relations.filter((r) => r.fromId === e.id && REL[r.type]);
  const inc = ctx.relations.filter((r) => r.toId === e.id && REL[r.type]);
  const facts = Object.entries(e.facts || {});
  const hw = e.hardware;
  const body = `<p class="eyebrow">${esc(e.kind)} · ${esc(e.id)}</p><h1>${esc(e.name)}${e.title ? ` <small>${esc(e.title)}</small>` : ''}</h1>
<p class="lead">${esc(e.oneLine)}</p>
${(e.limits || []).map((l) => `<p class="warn"><strong>Limite:</strong> ${esc(l)}</p>`).join('')}
<dl class="status"><dt>Decisione</dt><dd>${esc(DEC[e.status.decision] || 'non indicata')}</dd><dt>Realizzazione</dt><dd>${esc(REAL[e.status.realization] || 'non indicata')}</dd><dt>Osservazione</dt><dd>Non rilevato (nessuna telemetria)</dd>${e.status.note ? `<dt>Nota</dt><dd>${esc(e.status.note)}</dd>` : ''}</dl>
${hw ? `<h2>Hardware</h2><table><tbody>${[['Piattaforma', hw.platform], ['Processore', hw.cpu], ['Core / thread', { value: hw.cores.value && `${hw.cores.value} / ${hw.threads.value}` }], ['RAM', { value: hw.ram.value && `${hw.ram.value} GB ${hw.ramType.value || ''}` }], ['TDP CPU (non è consumo)', { value: hw.tdp.value && `${hw.tdp.value} W` }]].map(([k, f]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(f.value ?? 'n.d.')}</td></tr>`).join('')}</tbody></table>
${hw.disks.length ? `<table><thead><tr><th>Disco</th><th>Q.tà</th><th>Funzione</th></tr></thead><tbody>${hw.disks.map((d) => `<tr><td>${esc(d.model)}</td><td>${esc(d.quantity)}</td><td>${esc(d.role)}</td></tr>`).join('')}</tbody></table>` : ''}` : ''}
${facts.length ? `<h2>Dati</h2><table><thead><tr><th>Voce</th><th>Valore</th><th>Natura</th><th>Fonte</th></tr></thead><tbody>${facts.map(([k, f]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(f.value === null ? 'n.d.' : `${f.value}${f.unit ? ' ' + f.unit : ''}`)}${f.note ? `<br><small>${esc(f.note)}</small>` : ''}</td><td>${esc(EV[f.evidenceKind])}</td><td>${f.sourceIds.map((s) => `<a href="../schede/${s}.html">${esc(s)}</a>`).join(' ')}</td></tr>`).join('')}</tbody></table>` : ''}
${out.length ? `<h2>Relazioni</h2><ul>${out.map((r) => `<li>${esc(REL[r.type])} <a href="${r.toId}.html">${esc(name(r.toId))}</a>${r.label ? ` <small>(${esc(r.label)})</small>` : ''}${r.evidenceKind === 'unknown' ? ' <em>— collegamento non documentato</em>' : ''}${r.note ? ` <small>— ${esc(r.note)}</small>` : ''}</li>`).join('')}</ul>` : ''}
${inc.length ? `<h2>Collegati a questo elemento</h2><ul>${inc.map((r) => `<li><a href="${r.fromId}.html">${esc(name(r.fromId))}</a> ${esc(REL[r.type])} ${esc(e.name)}</li>`).join('')}</ul>` : ''}
${e.cards.length ? `<h2>Schede</h2><p>${e.cards.map((c) => `<a href="../schede/${c}.html">${esc(c)}</a>`).join(' · ')}</p>` : ''}
<p class="links"><a href="../index.html#e/${esc(e.id)}">Apri nella versione interattiva</a></p>`;
  return page({ title: e.name, body, desc: e.oneLine });
}

export function renderKit(ctx) {
  const em = ctx.procedures.filter((p) => p.emergency);
  const other = ctx.procedures.filter((p) => !p.emergency);
  const nodes = ctx.entities.filter((e) => e.kind === 'node');
  const proc = (p) => `<section class="proc" id="${p.id}"><h2>${esc(p.symptom)}</h2><p class="muted">${esc(p.title)} · per: ${esc(p.audience)}</p>
${p.stopIf?.length ? `<div class="warn"><strong>Fermati se</strong><ul>${p.stopIf.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>` : ''}
<h3>Controlli iniziali (non modificano nulla)</h3><ol>${p.checks.map((c) => `<li>${esc(c.text)}<br><small>Atteso: ${esc(c.expect)}</small></li>`).join('')}</ol>
<h3>Passaggi</h3><ol>${p.steps.map((s) => `<li>${s.tech ? '<strong>[tecnico]</strong> ' : ''}${esc(s.text)}${s.cmd ? `<pre><code>${esc(s.cmd)}</code></pre><small>Dove: ${esc(s.where)} · Cosa fa: ${esc(s.does)}</small><br>` : '<br>'}<small>Atteso: ${esc(s.expect)}${s.else ? ` · Altrimenti: ${esc(s.else)}` : ''}</small></li>`).join('')}</ol>
<p><strong>Ritorno indietro:</strong> ${esc(p.rollback)}</p><p><strong>Da registrare:</strong> ${esc(p.evidence)}</p>
<p class="muted">Fonti: ${p.cards.map(esc).join(', ')} · Ultima verifica della procedura: ${p.verifiedAt ? esc(p.verifiedAt) : 'mai provata sul campo'}</p></section>`;
  const body = `<div class="kithead"><h1>Kit di emergenza del Faldone</h1>
<p><strong>Revisione ${esc(ctx.meta.revision)}</strong> del ${esc(ctx.meta.documentDate)} · copia generata il ${esc(new Date().toISOString().slice(0, 10))} · build ${esc(ctx.meta.build || '')}</p>
<p>Questo file è autonomo: si apre anche senza Internet e senza i server di casa. Conservane una copia sul telefono e una stampata. Contiene solo informazioni pubbliche: password e chiavi di recupero sono custodite a parte, offline.</p>
<p class="warn">L'impianto descritto è un progetto da attuare dal ${esc(ctx.meta.implementationStart)}. Le procedure non sono ancora state provate sul campo.</p>
<nav><ul>${em.map((p) => `<li><a href="#${p.id}">${esc(p.symptom)}</a></li>`).join('')}${other.map((p) => `<li><a href="#${p.id}">${esc(p.symptom)} (tecnico)</a></li>`).join('')}<li><a href="#macchine">Che cosa fa ogni macchina</a></li></ul></nav></div>
${em.map(proc).join('')}${other.map(proc).join('')}
<section id="macchine"><h2>Che cosa fa ogni macchina e cosa succede se manca</h2><table><thead><tr><th>Sigla</th><th>Ruolo</th><th>Se manca</th></tr></thead><tbody>${nodes.map((n) => `<tr><th scope="row">${esc(n.name)}</th><td>${esc(n.title || '')}<br><small>${n.vote ? 'Nucleo, vota' : n.power === 'on_demand' ? 'Acceso a richiesta' : n.power === 'manual' ? 'Avvio manuale' : n.power === 'external' ? 'Esterno' : 'Sempre acceso'}</small></td><td>${esc(n.oneLine)}</td></tr>`).join('')}</tbody></table></section>`;
  return page({ title: 'Kit di emergenza', body, inlineCss: true });
}

export function renderShell({ meta, scopes, procedures, build }) {
  const intents = [['capire', 'Voglio capire il progetto', 'percorsi/cinque-minuti'], ['trovare', 'Voglio trovare un servizio o una macchina', 'esplora'], ['guasto', 'Qualcosa non funziona', 'emergenza'], ['realizza', 'Voglio realizzare il prossimo passo', 'realizza'], ['aiuto', 'Voglio aiutare o verificare una scelta', 'contribuisci']];
  return `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; worker-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'">
<meta name="theme-color" content="#f4f1ea" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#11181d" media="(prefers-color-scheme: dark)">
<meta name="description" content="Atlante operativo dell'infrastruttura di casa, laboratorio e Vito. Revisione ${esc(meta.revision)}.">
<title>Il Faldone · revisione ${esc(meta.revision)}</title>
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="app/style.css?v=${build}"><link rel="stylesheet" href="app/scenes.css?v=${build}">
<link rel="modulepreload" href="app/main.js?v=${build}"></head>
<body><a class="skip" href="#main">Vai al contenuto</a>
<div class="app" id="app">
<header class="top" role="banner"><a class="brand" href="#"><span class="mark" aria-hidden="true">F</span><span><strong>Il Faldone</strong><small>Rev ${esc(meta.revision)} · progetto</small></span></a>
<nav class="primary" aria-label="Navigazione principale"><a href="#" data-nav="">Panoramica</a><a href="#esplora" data-nav="esplora">Esplora</a><a href="#emergenza" data-nav="emergenza">Usa e risolvi</a><a href="#realizza" data-nav="realizza">Realizza</a><a href="#documenti" data-nav="documenti">Documentazione</a></nav>
<div class="tools" id="tools"></div></header>
<main id="main" tabindex="-1">
<section class="hero"><p class="eyebrow">Il Faldone · revisione ${esc(meta.revision)}</p><h1>Atlante dell'infrastruttura</h1><p><a class="btn primary" href="presentazione.html">Scopri il progetto in 5 minuti</a></p>
<p>${esc(meta.statement)}</p>
<ul class="intents">${intents.map(([k, t, r]) => `<li><a href="#${r}">${esc(t)}</a></li>`).join('')}</ul>
<noscript><p class="warn">La versione interattiva richiede JavaScript. Senza JavaScript puoi leggere <a href="presentazione.html">il progetto in cinque minuti</a>, consultare <a href="schede/index.html">tutte le schede</a>, il <a href="kit/emergenza.html">kit di emergenza</a> e il <a href="INF_Faldone-completo-navigabile.pdf">PDF completo</a>.</p>
<h2>Ambiti</h2><ul>${scopes.map((s) => `<li><strong>${esc(s.name)}</strong>: ${esc(s.simple)}</li>`).join('')}</ul>
<h2>In caso di problemi</h2><ul>${procedures.filter((p) => p.emergency).map((p) => `<li><a href="kit/emergenza.html#${p.id}">${esc(p.symptom)}</a></li>`).join('')}</ul></noscript></section>
</main>
<footer class="foot"><span>Il Faldone · revisione ${esc(meta.revision)} del ${esc(meta.documentDate)}</span><span>Documentazione di progetto · nessuna telemetria collegata</span><span><a href="schede/index.html">Versione senza JavaScript</a> · <a href="kit/emergenza.html">Kit offline</a></span></footer>
</div>
<script type="module" src="app/main.js?v=${build}"></script></body></html>`;
}

// Lettura lineare del percorso «Il progetto in cinque minuti» senza JavaScript (stessa sorgente).
export function renderPresentation({ meta, pres, tests }) {
  const body = `<p class="eyebrow">Il Faldone · revisione ${esc(meta.revision)}</p><h1>${esc(pres.title)}</h1><p class="muted">${esc(pres.statusText)}</p>
<nav aria-label="Indice"><ol>${pres.scenes.map((s) => `<li><a href="#r-${s.id}">${esc(s.short)}</a></li>`).join('')}</ol></nav>
${pres.scenes.map((s, i) => `<section class="pres-sec" id="r-${s.id}-sec">${renderScene(s, i, pres.scenes.length, { prefix: 'r', level: 2, tests })}
${s.deep ? `<details><summary>${esc(s.deep.label)}</summary><p>${esc(s.deep.text)}</p><p class="muted">Fonti: ${s.deep.cards.map((c) => `<a href="schede/${c}.html">${esc(c)}</a>`).join(' · ')}</p></details>` : ''}
${s.exits ? `<ul>${s.exits.map((x) => `<li><a href="index.html#${esc(x.route)}">${esc(x.label)}</a> — ${esc(x.sub)}</li>`).join('')}</ul>` : ''}</section>`).join('')}
<p class="links"><a href="index.html#presenta">Apri la presentazione interattiva</a></p>`;
  return page({ title: pres.title, depth: 0, body: body.replace(/href="#r-([a-z-]+)"/g, 'href="#r-$1-sec"'), desc: 'Il progetto del Faldone in dieci scene' }).replace('</head>', '<link rel="stylesheet" href="app/scenes.css"></head>');
}
