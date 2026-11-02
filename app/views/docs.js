import { bars } from '../lib/charts.js';
import { esc, href, phead, ctxbar, table } from '../ui.js';

const dtabs = (cur) => `<nav class="chips" aria-label="Sezioni di Documentazione" style="margin-bottom:12px">${[['documenti', 'Schede'], ['glossario', 'Glossario'], ['inventario', 'Inventario'], ['documenti/revisioni', 'Revisioni e fonti'], ['documenti/download', 'Download'], ['guida', 'Come si usa']].map(([r, l]) => `<a class="chip" href="${href(r)}" ${r === cur ? 'aria-current="page"' : ''}>${l}</a>`).join('')}</nav>`;

export function library(app) {
  const { core } = app;
  const b = app.query.b || '';
  const q = (app.query.q || '').toLowerCase();
  const showRoad = app.query.r === '1';
  const cards = core.cards.filter((c) => (!b || c.block === b) && (showRoad || c.scope !== 'roadmap') && (!q || `${c.code} ${c.title}`.toLowerCase().includes(q)));
  const hiddenRoad = core.cards.filter((c) => (!b || c.block === b) && c.scope === 'roadmap' && (!q || `${c.code} ${c.title}`.toLowerCase().includes(q))).length;
  const groups = new Map();
  for (const c of cards) groups.set(c.group, [...(groups.get(c.group) || []), c]);
  app.on('libfilter', (el) => { const qv = document.getElementById('libq').value; const bv = document.getElementById('libb').value; const rv = document.getElementById('libr').checked; app.go(`documenti?${new URLSearchParams({ ...(qv ? { q: qv } : {}), ...(bv ? { b: bv } : {}), ...(rv ? { r: '1' } : {}) })}`, { replace: true }); });
  const html = `${dtabs('documenti')}${phead({ eyebrow: 'Documentazione', title: 'Le schede del Faldone', lead: `${core.meta.counts.cards} codici stabili (INF, ATL, REV), raccolti in ${core.meta.counts.groups} testi leggibili. Più codici possono condividere un testo: ognuno conserva la propria parte specifica, il PDF e il Markdown.` })}
<form class="formgrid" data-submit="libfilter"><label class="f">Filtra per codice o titolo<input type="text" id="libq" value="${esc(app.query.q || '')}" data-change="libfilter"></label>
<label class="f">Blocco<select id="libb" data-change="libfilter"><option value="">Tutti</option>${Object.entries(core.blocks).map(([k, v]) => `<option value="${esc(k)}"${k === b ? ' selected' : ''}>${esc(k)} · ${esc(v)}</option>`).join('')}</select></label>
<label class="f" style="align-self:end;display:flex;gap:8px;align-items:center"><input type="checkbox" id="libr" ${showRoad ? 'checked' : ''} data-change="libfilter" style="width:20px;height:20px"> Includi roadmap e attuazione</label></form>
<p class="small" aria-live="polite">${cards.length} schede in ${groups.size} testi${hiddenRoad && !showRoad ? ` · ${hiddenRoad} schede di roadmap escluse dal filtro predefinito` : ''}. <a href="schede/index.html">Indice stampabile senza JavaScript</a></p>
<ul class="list">${[...groups].map(([g, cs]) => { const gi = core.groups.find((x) => x.id === g); return `<li><a href="${href(cs[0].code)}"><strong>${esc(gi.title)}</strong></a><br><span class="small muted">Codici: </span>${cs.map((c) => `<a class="code" href="${href(c.code)}">${esc(c.code)}</a>`).join('<span class="muted"> · </span>')}${gi.codes.length > cs.length ? `<span class="small muted"> (+${gi.codes.length - cs.length} fuori filtro)</span>` : ''}</li>`; }).join('') || '<li class="empty">Nessuna scheda con questi filtri. Prova la <a href="#cerca">ricerca completa</a>, che include servizi, macchine e glossario.</li>'}</ul>`;
  return { title: 'Schede', html, keepScroll: !!(app.query.q || app.query.b) };
}

export async function card(app, [code]) {
  const { core, idx } = app;
  const c = idx.cards.get(code);
  const g = await app.group(c.group);
  const others = g.codes.filter((x) => x !== code);
  const ents = core.entities.filter((e) => e.cards.includes(code));
  const pos = core.cards.findIndex((x) => x.code === code);
  const prev = core.cards[pos - 1], next = core.cards[pos + 1];
  const tail = g.tails[code];
  const html = `${ctxbar([['Documentazione', 'documenti'], [`${c.block} · ${core.blocks[c.block] || ''}`, `documenti?b=${c.block}`], [code]], app.prev && !app.prev.endsWith(code) ? { route: decodeURI(app.prev.slice(1)), label: 'Indietro' } : null)}
<div class="pagecols"><div>${phead({ eyebrow: `Scheda <span class="code">${esc(code)}</span> · revisione ${esc(core.meta.revision)}${c.scope === 'roadmap' ? ' · roadmap e attuazione' : ''}`, title: g.title, lead: g.title !== c.title ? `Titolo d'archivio: ${esc(c.title)}` : '' })}
${others.length ? `<p class="small">Testo comune a ${others.length + 1} codici: ${others.map((o) => `<a class="code" href="${href(o)}">${esc(o)}</a>`).join(' ')}. ${tail ? `La parte specifica di ${esc(code)} è in fondo.` : ''}</p>` : ''}
<article class="doc" id="doc">${g.html}${tail ? `<section class="tail"><h2 id="specifica">Parte specifica di ${esc(code)}</h2>${tail}</section>` : ''}</article>
<nav class="phead" aria-label="Schede vicine"><div class="actions">${prev ? `<a class="btn ghost" href="${href(prev.code)}">← ${esc(prev.code)}</a>` : ''}${next ? `<a class="btn ghost" href="${href(next.code)}">${esc(next.code)} →</a>` : ''}</div></nav></div>
<aside class="aside" aria-label="Strumenti della scheda"><div class="card"><h3>In questa scheda</h3><nav class="toc" id="toc"></nav></div>
<div class="card"><h3>Formati</h3><p><a href="${esc(c.pdf)}">PDF della scheda</a><br><a href="${esc(c.md)}">Sorgente Markdown</a><br><a href="schede/${esc(code)}.html">Pagina statica stampabile</a></p>
<p><button class="btn ghost" type="button" data-action="fav" data-id="${esc(code)}" aria-pressed="${app.isFav(code)}"><span class="lbl">${app.isFav(code) ? 'Nei preferiti' : 'Aggiungi ai preferiti'}</span></button></p>
<button class="chip" type="button" data-action="copy" data-text="${esc(`${code} · ${g.title}`)}">Copia riferimento</button></div>
${ents.length ? `<div class="card"><h3>Elementi descritti</h3><ul class="list">${ents.map((e) => `<li><a href="${href('e/' + e.id)}">${esc(e.name)}</a><br><span class="small muted">${esc(e.title || '')}</span></li>`).join('')}</ul></div>` : ''}
<div class="card"><h3>Appunto personale</h3><label class="f"><span class="small muted">Salvato solo su questo dispositivo</span><textarea data-input="note" maxlength="5000">${esc(app.data.notes[code]?.text || '')}</textarea></label></div></aside></div>`;
  return {
    title: `${code} ${g.title}`, html,
    mount: (root) => {
      const doc = root.querySelector('#doc');
      const hs = [...doc.querySelectorAll('h2')];
      hs.forEach((h, i) => { if (!h.id) h.id = `s${i}`; });
      root.querySelector('#toc').innerHTML = hs.map((h) => `<a href="#${esc(code)}" data-action="toc" data-id="${esc(h.id)}">${esc(h.textContent)}</a>`).join('') || '<span class="muted small">Testo breve, senza sezioni.</span>';
      app.on('toc', (el) => { const t = doc.querySelector('#' + CSS.escape(el.dataset.id)); t?.scrollIntoView({ block: 'start' }); t?.setAttribute('tabindex', '-1'); t?.focus({ preventScroll: true }); });
      for (const t of doc.querySelectorAll('table')) { if (t.parentElement.classList.contains('tablewrap')) continue; const w = document.createElement('div'); w.className = 'tablewrap'; w.tabIndex = 0; w.setAttribute('role', 'region'); w.setAttribute('aria-label', `Tabella: ${t.querySelector('th')?.textContent || 'dati'}`); t.replaceWith(w); w.append(t); }
      glossaryMarks(doc, core.glossary);
      let timer;
      app.on('note', (el) => { clearTimeout(timer); timer = setTimeout(() => { const t = el.value.trim(); if (t) app.data.notes[code] = { text: t, at: new Date().toISOString() }; else delete app.data.notes[code]; app.persist(); }, 400); });
    },
  };
}

/** Segna la prima occorrenza di ogni termine del glossario come pulsante apribile (tastiera e touch). */
export function glossaryMarks(root, glossary) {
  const pats = glossary.flatMap((g) => g.match.map((m) => ({ term: g.term, re: new RegExp(`(^|[^\\p{L}\\p{N}])(${m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?=$|[^\\p{L}\\p{N}])`, m === m.toUpperCase() ? 'u' : 'iu') })));
  const done = new Set();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement.closest('a,button,code,pre,h2,h3,th') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes) {
    for (const p of pats) {
      if (done.has(p.term)) continue;
      const m = p.re.exec(n.nodeValue);
      if (!m) continue;
      const start = m.index + m[1].length;
      const after = n.splitText(start); after.splitText(m[2].length);
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'gl'; b.dataset.term = p.term; b.setAttribute('aria-expanded', 'false');
      b.title = `Glossario: ${p.term}`; b.textContent = after.nodeValue;
      after.replaceWith(b); done.add(p.term);
      break;
    }
  }
}

export function glossary(app, [term]) {
  const { core } = app;
  const list = [...core.glossary].sort((a, b) => a.term.localeCompare(b.term, 'it'));
  const html = `${dtabs('glossario')}${phead({ eyebrow: 'Documentazione', title: 'Glossario', lead: 'Le parole del Faldone senza dare nulla per scontato. Nelle schede, le parole sottolineate a puntini aprono la spiegazione con un tocco o con Invio.' })}
<dl class="list">${list.map((g) => `<div id="t-${esc(encodeURIComponent(g.term))}" ${term === g.term ? 'class="card"' : ''} style="padding:10px 0;border-bottom:1px solid var(--line)"><dt><strong>${esc(g.term)}</strong></dt><dd style="margin:4px 0 0">${esc(g.text)}</dd></div>`).join('')}</dl>`;
  return { title: 'Glossario', html, mount: () => { if (term) document.getElementById('t-' + encodeURIComponent(term))?.scrollIntoView({ block: 'center' }); }, keepScroll: !!term };
}

export function guide(app) {
  const html = `${dtabs('guida')}${phead({ eyebrow: 'Documentazione', title: 'Come si usa il Faldone', lead: 'Una sola realtà, tre profondità di lettura, stati distinti.' })}
<h2>Tre profondità, stessi fatti</h2><p>«Capire» spiega a cosa serve e che cosa cambia nella vita quotidiana; «Approfondire» apre relazioni e scelte; «Intervenire» mostra dati tecnici, fonti e procedure. Cambiare profondità non cambia i fatti, l'elemento selezionato o lo scenario. I limiti che possono far perdere dati restano sempre visibili.</p>
<p>La profondità è una preferenza di lettura, non un permesso: tutto il Faldone pubblico è uguale per tutti.</p>
<h2>Stati: cinque dimensioni diverse</h2>${table(['Dimensione', 'Valori', 'Significato'], [['Decisione', 'ipotesi, proposta, approvata, superata, da chiarire', 'Che cosa è stato deciso nel progetto'], ['Realizzazione', 'da acquisire, ordinato, disponibile, installato, configurato, collaudato, dismesso, non attestato', 'Che cosa esiste fisicamente o è stato fatto'], ['Osservazione', 'non rilevato (nessuna telemetria collegata)', 'Che cosa si vede dall\'impianto in funzione'], ['Natura del valore', 'documentato, dichiarato, misurato, stimato, simulato, sconosciuto', 'Da dove viene un numero'], ['Accesso', 'pubblico', 'Chi può leggere il contenuto']])}
<h2>Simulazione e realtà</h2><p>Tutto ciò che porta l'etichetta <span class="simtag">Simulazione</span> è calcolato dal modello del progetto. Non è un'osservazione dell'impianto e non dimostra che qualcosa funzioni.</p>
<h2>Scorciatoie</h2><p><kbd>/</kbd> oppure <kbd>Ctrl</kbd>+<kbd>K</kbd> aprono la ricerca (mai mentre scrivi in un campo). Su telefono c'è il pulsante con la lente.</p>
<h2>Dati sul tuo dispositivo</h2><p>Preferiti, appunti, spunte e scenari restano nel browser di questo dispositivo. Si possono esportare e reimportare dalla pagina <a href="${href('preferiti')}">Preferiti e dati locali</a>. Non sono collaudi e non cambiano il progetto.</p>`;
  return { title: 'Come si usa', html };
}

export function misc(app, [which]) {
  const { core } = app;
  if (which === 'download') {
    const files = [['INF_Faldone-completo-navigabile.pdf', 'Faldone completo navigabile (PDF, circa 41 MB)'], ['INF_Atlante-rev4.4.pdf', 'Atlante 4.4 (PDF)'], ['INF_Manuale-operativo.pdf', 'Manuale operativo (PDF)'], ['INF_Integrazioni.pdf', 'Integrazioni (PDF)'], ['INF_Profili-operativi.pdf', 'Profili operativi (PDF)'], ['Sfoglia-le-mappe-rev4.4.pdf', 'Mappe 4.4 (PDF)'], ['Faldone-infrastruttura-Kindle.epub', 'Versione EPUB per lettori'], ['kit/emergenza.html', 'Kit di emergenza offline (HTML autonomo, stampabile)'], ['schede/index.html', 'Tutte le schede senza JavaScript'], ['docs/migrazione/mappa-codici.csv', 'Mappa dei codici e delle rotte (CSV)']];
    const html = `${dtabs('documenti/download')}${phead({ eyebrow: 'Documentazione', title: 'Formati e download', lead: 'I PDF e l\'EPUB sono quelli della revisione 4.4, generati il 1 novembre 2026: non contengono le funzioni interattive di questo sito.' })}<ul class="list">${files.map(([f, l]) => `<li><a href="${esc(f)}">${esc(l)}</a></li>`).join('')}</ul>`;
    return { title: 'Download', html };
  }
  const html = `${dtabs('documenti/revisioni')}${phead({ eyebrow: 'Documentazione', title: 'Revisioni e fonti', lead: 'Da dove viene ogni informazione e quale prevale.' })}
${table(['Data', 'Che cosa'], [[esc(core.meta.documentDate), `Revisione ${esc(core.meta.revision)} dei contenuti (<a href="${href('REV3-DIFF')}">cosa cambia dalla 4.3</a>)`], ['2026-10-20', 'Decisioni confermate dell\'assetto 4.4'], [esc(core.meta.modelDate), `Modello dati strutturato e sito interattivo (build ${esc(core.meta.build)})`]])}
<h2>Gerarchia delle fonti</h2><ol><li>Schede con codice della revisione corrente e decisioni confermate (approvate).</li><li>Registri: acquisti, collaudi, attuazione.</li><li>Documenti storici e revisioni precedenti: solo consultazione.</li></ol><p>Un documento più recente non è automaticamente approvato: lo stato della decisione è indicato a parte. Le incongruenze fra schede sono nel <a href="${href('contribuisci')}">registro delle questioni</a>.</p>
<h2>Come è costruito</h2><p>Il testo leggibile delle schede è in <code>content/corpus/schede/</code>; il modello strutturato in <code>content/model/</code>. La build valida i riferimenti e genera questo sito, le pagine statiche e il kit offline. Istruzioni in <code>docs/manutenzione-editoriale.md</code>.</p>`;
  return { title: 'Revisioni e fonti', html };
}

export async function inventory(app, [code] = [], scopeInfo = null) {
  const inv = await app.inventory();
  const { idx } = app;
  const usedBy = new Map();
  for (const e of app.core.entities) for (const c of e.inventory || []) usedBy.set(c, [...(usedBy.get(c) || []), e.id]);
  if (code) {
    const i = inv.items.find((x) => x.code === code);
    if (!i) return { title: 'Inventario', html: '<p>Codice non trovato.</p>' };
    const ph = inv.photos[code] || [];
    const html = `${ctxbar([['Documentazione', 'documenti'], ['Inventario', 'inventario'], [code]])}${phead({ eyebrow: `Inventario · <span class="code">${esc(code)}</span>`, title: i.model })}
<dl class="kv"><dt>Quantità</dt><dd>${esc(i.quantity)}</dd><dt>Assegnazione</dt><dd>${esc(i.assignment)}</dd><dt>Stato d'inventario</dt><dd>${esc(i.inventory_state)}</dd><dt>Categoria</dt><dd>${esc(i.category)}</dd><dt>Fonte</dt><dd>${esc(i.source)}</dd>${i.notes ? `<dt>Note</dt><dd>${esc(i.notes)}</dd>` : ''}
<dt>Usato da</dt><dd>${(usedBy.get(code) || []).map((e) => `<a href="${href('e/' + e)}">${esc(idx.get(e).name)}</a>`).join(', ') || '—'}</dd></dl>
${ph.length ? `<h2>Fotografie</h2><div class="grid tight">${ph.map((p) => `<figure class="card" style="margin:0"><img src="${esc(p.path)}" alt="${esc(i.model)} (${esc(p.kind)})" loading="lazy" style="max-width:100%;height:auto"><figcaption class="small muted">${esc(p.kind === 'repertorio' ? 'Foto di repertorio, non dell\'esemplare' : 'Foto dell\'esemplare')}${p.caption ? ' · ' + esc(p.caption) : ''}${p.source ? ` · <a href="${esc(p.source)}" rel="noopener noreferrer">fonte</a>` : ''}</figcaption></figure>`).join('')}</div>` : ''}`;
    return { title: code, html };
  }
  const categories = [...new Set(inv.items.map(i => i.category))].sort();
  const q = app.query.q || '', category = app.query.cat || '', photos = app.query.photo === '1', linked = app.query.linked === '1';
  const filtered = () => inv.items.filter(i => (!category || i.category === category) && (!photos || inv.photos[i.code]?.length) && (!linked || usedBy.has(i.code)) && JSON.stringify(i).toLocaleLowerCase('it').includes(q.toLocaleLowerCase('it')));
  const rows = list => table(['Codice', 'Modello', 'Q.tà', 'Categoria', 'Assegnazione', 'Collegamenti e foto', 'Stato'], list.map(i => [`<a href="${href('inventario/' + i.code)}" class="code">${esc(i.code)}</a>`, esc(i.model), esc(i.quantity), esc(i.category), esc(i.assignment), (usedBy.get(i.code) || []).map(id => `<a href="${href('e/'+id)}">${esc(id)}</a>`).join(', ') + (inv.photos[i.code]?.length ? ` · ${inv.photos[i.code].length} foto` : ''), esc(i.inventory_state)]), {caption: 'Inventario filtrato'});
  app.on('inv-filter', () => {
    const root = document.getElementById('main');
    app.setQuery({q:root.querySelector('#inv-q').value, cat:root.querySelector('#inv-cat').value, photo:root.querySelector('#inv-photo').checked ? '1':'', linked:root.querySelector('#inv-linked').checked ? '1':''});
    app.go(app.route + location.hash.slice(1).slice(app.route.length), {replace:true});
  });
  return {title:'Inventario', html: `${scopeInfo ? ctxbar([['Esplora','esplora'],[scopeInfo.name]]) : dtabs('inventario')}${phead({eyebrow:'Patrimonio e riuso',title:'Inventario',lead:`${inv.items.length} voci: dal componente alla funzione nel sistema. Le quantità restano quelle della fonte; alias e assegnazioni non provano la disponibilità fisica.`})}
${bars('Distribuzione delle voci per categoria',categories.map(c => ({label:c,value:inv.items.filter(i=>i.category===c).length})),'voci')}
<form class="card" data-submit="inv-filter"><div class="formgrid"><label class="f">Cerca modello, codice, assegnazione o note<input id="inv-q" type="search" value="${esc(q)}"></label><label class="f">Categoria<select id="inv-cat"><option value="">Tutte</option>${categories.map(c=>`<option value="${esc(c)}" ${c===category?'selected':''}>${esc(c)}</option>`).join('')}</select></label></div><p><label><input id="inv-photo" type="checkbox" ${photos?'checked':''}> Con fotografie</label> · <label><input id="inv-linked" type="checkbox" ${linked?'checked':''}> Collegati al modello</label></p><button class="btn primary" type="submit">Applica filtri</button> <a class="btn" href="#inventario">Azzera filtri</a></form>
<p role="status">${filtered().length} voci su ${inv.items.length}</p>${filtered().length ? rows(filtered()) : '<div class="callout">Nessuna voce corrisponde. Modifica i filtri o cerca un codice inventario.</div>'}
${inv.opportunities ? `<h2>Riuso e cessione</h2><p>${esc(inv.opportunities.scope || '')}</p><p class="small muted">${esc(inv.opportunities.methodology?.statement || '')}</p>`:''}`};
}

export function notFound(app, [path]) {
  return { title: 'Non trovato', html: `${phead({ title: 'Pagina non trovata', lead: `Nessuna pagina corrisponde a «${esc(path)}».` })}<p>Se arrivi da un vecchio collegamento del Faldone 4.4, il codice potrebbe essere cambiato. <a href="#cerca?q=${encodeURIComponent(path)}">Cerca «${esc(path)}»</a> oppure torna alla <a href="#">panoramica</a>.</p>` };
}
