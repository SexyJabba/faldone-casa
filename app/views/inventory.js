// Inventario esplorabile: ricerca immediata, faccette con conteggi, raggruppamenti, griglia con foto e scheda rapida.
import { esc, href, phead, ctxbar, table, icon } from '../ui.js';
import { dtabs } from './docs.js';
import { prepare, filter, facets, sortItems, group, totals, catLabel, stateLabel, isAlias } from '../lib/inventory.js';

const list = (v) => (v ? String(v).split(',').filter(Boolean) : []);
const photoNote = (p) => (p.kind === 'repertorio' ? 'Foto di repertorio, non dell\'esemplare' : 'Foto dell\'esemplare');

export async function inventory(app, [code] = [], scopeInfo = null) {
  const inv = await app.inventory();
  const { idx, core } = app;
  const items = prepare(inv, core.entities);
  const states = [...new Set(items.map((i) => i.inventory_state))].sort();
  const name = (id) => idx.get(id)?.name || id;
  const kv = (i) => `<dl class="kv"><dt>Quantità</dt><dd>${esc(i.quantity)}${isAlias(i) ? ' <span class="small muted">(alias: non si somma)</span>' : ''}</dd><dt>Assegnazione</dt><dd>${esc(i.assignment) || '—'}</dd><dt>Categoria</dt><dd>${esc(catLabel(i.cat))}</dd><dt>Stato d'inventario</dt><dd>${esc(stateLabel(i.inventory_state))}</dd><dt>Usato da</dt><dd>${i.used.map((e) => `<a href="${href('e/' + e)}">${esc(name(e))}</a>`).join(', ') || '<span class="muted">nessun elemento del modello collegato</span>'}</dd>${i.notes ? `<dt>Note</dt><dd>${esc(i.notes)}</dd>` : ''}<dt>Fonte</dt><dd class="small">${esc(i.source)}</dd></dl>`;

  if (code) {
    const pos = items.findIndex((x) => x.code === code);
    const i = items[pos];
    if (!i) return { title: 'Inventario', html: '<p>Codice non trovato.</p>' };
    const prev = items[pos - 1], next = items[pos + 1];
    const same = items.filter((x) => x.cat === i.cat && x.code !== code);
    const html = `${ctxbar([['Documentazione', 'documenti'], ['Inventario', 'inventario'], [catLabel(i.cat), `inventario?cat=${i.cat}`], [code]])}${phead({ eyebrow: `Inventario · <span class="code">${esc(code)}</span>`, title: i.model })}
${kv(i)}
${i.photos.length ? `<h2>Fotografie</h2><div class="grid tight">${i.photos.map((p) => `<figure class="card" style="margin:0"><img src="${esc(p.path)}" alt="${esc(i.model)} (${esc(p.kind)})" loading="lazy" style="max-width:100%;height:auto"><figcaption class="small muted">${esc(photoNote(p))}${p.caption ? ' · ' + esc(p.caption) : ''}${p.source ? ` · <a href="${esc(p.source)}" rel="noopener noreferrer">fonte</a>` : ''}</figcaption></figure>`).join('')}</div>` : ''}
${same.length ? `<h2>Stessa categoria: ${esc(catLabel(i.cat))}</h2><div class="chips">${same.slice(0, 14).map((x) => `<a class="chip" href="${href('inventario/' + x.code)}"><span class="code">${esc(x.code)}</span> ${esc(x.model.slice(0, 34))}</a>`).join('')}${same.length > 14 ? `<a class="chip" href="${href('inventario?cat=' + i.cat)}">Tutte (${same.length + 1}) →</a>` : ''}</div>` : ''}
<nav class="phead" aria-label="Voci vicine"><div class="actions">${prev ? `<a class="btn ghost" href="${href('inventario/' + prev.code)}">← ${esc(prev.code)}</a>` : ''}${next ? `<a class="btn ghost" href="${href('inventario/' + next.code)}">${esc(next.code)} →</a>` : ''}</div></nav>`;
    return { title: code, html };
  }

  const st = {
    q: app.query.q || '', cat: list(app.query.cat), state: list(app.query.st).map((n) => states[+n]).filter(Boolean), used: list(app.query.u).filter((u) => idx.get(u)),
    photo: app.query.photo === '1', linked: ['si', 'no'].includes(app.query.linked) ? app.query.linked : app.query.linked === '1' ? 'si' : '',
    g: ['categoria', 'macchina', 'stato'].includes(app.query.g) ? app.query.g : '', sort: ['modello', 'quantita'].includes(app.query.sort) ? app.query.sort : 'codice', v: app.query.v === 'tabella' ? 'tabella' : 'griglia',
  };
  const html = `${scopeInfo ? ctxbar([['Esplora', 'esplora'], [scopeInfo.name]]) : dtabs('inventario')}${phead({ eyebrow: 'Patrimonio e riuso', title: 'Inventario', lead: `${items.length} voci: dal componente alla funzione nel sistema. Filtra, raggruppa e apri ogni voce senza lasciare la pagina. Le quantità restano quelle della fonte; alias e assegnazioni non provano la disponibilità fisica.` })}
<div class="inv-tools"><label class="inv-search"><span class="vh">Cerca nell'inventario</span>${icon('search')}<input id="inv-q" type="search" value="${esc(st.q)}" placeholder="Cerca modello, codice, assegnazione, note…" autocomplete="off" data-input="inv-q"></label>
<div class="seg" role="group" aria-label="Vista"><button type="button" data-action="inv-set" data-k="v" data-v="griglia" aria-pressed="${st.v === 'griglia'}">Griglia</button><button type="button" data-action="inv-set" data-k="v" data-v="tabella" aria-pressed="${st.v === 'tabella'}">Tabella</button></div>
<label class="inv-sel">Raggruppa<select data-change="inv-sel" data-k="g"><option value="">nessun gruppo</option>${[['categoria', 'per categoria'], ['macchina', 'per macchina o servizio'], ['stato', 'per stato']].map(([k, l]) => `<option value="${k}"${st.g === k ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
<label class="inv-sel">Ordina<select data-change="inv-sel" data-k="sort">${[['codice', 'per codice'], ['modello', 'per modello'], ['quantita', 'per quantità']].map(([k, l]) => `<option value="${k}"${st.sort === k ? ' selected' : ''}>${l}</option>`).join('')}</select></label></div>
<div class="inv-layout"><aside class="inv-facets" aria-label="Filtri" id="inv-facets"></aside><div><div id="inv-sum" role="status"></div><div id="inv-res"></div></div></div>
${inv.opportunities ? `<h2>Riuso e cessione</h2><p>${esc(inv.opportunities.scope || '')}</p><p class="small muted">${esc(inv.opportunities.methodology?.statement || '')}</p>` : ''}
<dialog id="inv-dlg" class="inv-dlg" aria-labelledby="inv-dlg-t"></dialog>`;

  return {
    title: 'Inventario', html, keepScroll: !!(st.q || st.cat.length || st.used.length || st.state.length),
    mount: (root) => {
      const $f = root.querySelector('#inv-facets'), $s = root.querySelector('#inv-sum'), $r = root.querySelector('#inv-res'), dlg = root.querySelector('#inv-dlg');
      let shown = [];
      const sync = () => app.setQuery({ q: st.q, cat: st.cat, st: st.state.map((s) => states.indexOf(s)), u: st.used, photo: st.photo ? '1' : '', linked: st.linked, g: st.g, sort: st.sort === 'codice' ? '' : st.sort, v: st.v === 'griglia' ? '' : st.v });
      const chip = (k, v, label, n, on) => `<button type="button" class="chip" data-action="inv-facet" data-k="${k}" data-v="${esc(v)}" aria-pressed="${on}"${!n && !on ? ' hidden' : ''}>${esc(label)} <span class="n">${n}</span></button>`;
      const thumb = (i) => (i.photos[0] ? `<span class="inv-ph"><img src="${esc(i.photos[0].path)}" alt="" loading="lazy">${i.photos[0].kind === 'repertorio' ? '<span class="inv-tag">repertorio</span>' : ''}</span>` : `<span class="inv-ph none" aria-hidden="true">${icon('box')}</span>`);
      const card = (i) => `<a class="inv-card" href="${href('inventario/' + i.code)}" data-action="inv-open" data-code="${esc(i.code)}">${thumb(i)}<span class="inv-b"><span class="inv-top"><span class="code">${esc(i.code)}</span><span class="inv-q" title="Quantità come da fonte">× ${esc(i.quantity)}</span></span><strong>${esc(i.model)}</strong><span class="small muted">${esc(i.assignment || catLabel(i.cat))}</span>${i.used.length ? `<span class="inv-used">${i.used.slice(0, 4).map((u) => `<span class="code">${esc(u)}</span>`).join('')}${i.used.length > 4 ? `<span class="small muted">+${i.used.length - 4}</span>` : ''}</span>` : ''}</span></a>`;
      const rows = (l) => table(['Codice', 'Modello', 'Q.tà', 'Categoria', 'Assegnazione', 'Usato da', 'Stato'], l.map((i) => [`<a href="${href('inventario/' + i.code)}" class="code" data-action="inv-open" data-code="${esc(i.code)}">${esc(i.code)}</a>`, esc(i.model), esc(i.quantity), esc(catLabel(i.cat)), esc(i.assignment), i.used.map((u) => `<a href="${href('e/' + u)}">${esc(u)}</a>`).join(', ') + (i.photos.length ? `${i.used.length ? ' · ' : ''}${i.photos.length} foto` : ''), esc(stateLabel(i.inventory_state))]), { caption: 'Inventario filtrato' });

      function draw({ keepFacets = false } = {}) {
        const res = sortItems(filter(items, st), st.sort);
        shown = res;
        const fc = facets(items, st), t = totals(res);
        if (!keepFacets) {
          const cats = [...new Set(items.map((i) => i.cat))].sort((a, b) => catLabel(a).localeCompare(catLabel(b), 'it'));
          const users = [...new Set(items.flatMap((i) => i.used))].sort((a, b) => (fc.used.get(b) || 0) - (fc.used.get(a) || 0) || a.localeCompare(b));
          $f.innerHTML = `<details open><summary>Categoria</summary><div class="chips">${cats.map((c) => chip('cat', c, catLabel(c), fc.cat.get(c) || 0, st.cat.includes(c))).join('')}</div></details>
<details open><summary>Usato da</summary><div class="chips">${users.map((u) => chip('used', u, name(u), fc.used.get(u) || 0, st.used.includes(u))).join('')}</div>
<p class="inv-tog"><button type="button" class="chip" data-action="inv-facet" data-k="linked" data-v="si" aria-pressed="${st.linked === 'si'}">Collegati al modello</button><button type="button" class="chip" data-action="inv-facet" data-k="linked" data-v="no" aria-pressed="${st.linked === 'no'}">Non collegati</button></p></details>
<details${st.state.length ? ' open' : ''}><summary>Stato d'inventario</summary><div class="chips">${states.map((s) => chip('state', s, stateLabel(s), fc.state.get(s) || 0, st.state.includes(s))).join('')}</div></details>
<p class="inv-tog"><button type="button" class="chip" data-action="inv-facet" data-k="photo" data-v="1" aria-pressed="${st.photo}">Con fotografie</button></p>`;
        }
        const active = [...st.cat.map((c) => ['cat', c, catLabel(c)]), ...st.used.map((u) => ['used', u, name(u)]), ...st.state.map((s) => ['state', s, stateLabel(s)]), ...(st.photo ? [['photo', '1', 'con fotografie']] : []), ...(st.linked ? [['linked', st.linked, st.linked === 'si' ? 'collegati al modello' : 'non collegati']] : [])];
        $s.innerHTML = `<div class="inv-stats"><span><b>${t.items}</b> ${t.items === 1 ? 'voce' : 'voci'}${t.items !== items.length ? ` su ${items.length}` : ''}</span><span><b>${t.pieces}</b> pezzi contati</span><span><b>${res.filter((i) => i.photos.length).length}</b> con foto</span><span><b>${res.filter((i) => i.used.length).length}</b> collegate al modello</span></div>
<p class="small muted">I pezzi sommano solo le quantità scritte come numero intero${t.textual ? `; ${t.textual} ${t.textual === 1 ? 'voce ha' : 'voci hanno'} una quantità descrittiva` : ''}${t.alias ? `; ${t.alias} alias non ${t.alias === 1 ? 'è sommato' : 'sono sommati'}` : ''}.</p>
${active.length || st.q ? `<div class="chips inv-active">${st.q ? `<button type="button" class="chip" data-action="inv-clearq" aria-label="Togli la ricerca «${esc(st.q)}»">«${esc(st.q)}» ✕</button>` : ''}${active.map(([k, v, l]) => `<button type="button" class="chip" data-action="inv-facet" data-k="${k}" data-v="${esc(v)}" aria-label="Togli il filtro ${esc(l)}">${esc(l)} ✕</button>`).join('')}<button type="button" class="btn ghost" data-action="inv-reset">Azzera tutto</button></div>` : ''}`;
        if (!res.length) { $r.innerHTML = '<div class="empty">Nessuna voce corrisponde. Togli un filtro o cerca un codice (es. INV-005).</div>'; return; }
        $r.innerHTML = group(res, st.g, name).map((g) => `${g.label ? `<h2 class="blockhead">${g.key !== '~' && st.g === 'macchina' ? `<a href="${href('e/' + g.key)}">${esc(g.label)}</a>` : esc(g.label)}<small>${g.items.length} ${g.items.length === 1 ? 'voce' : 'voci'}</small></h2>` : ''}${st.v === 'tabella' ? rows(g.items) : `<div class="inv-grid">${g.items.map(card).join('')}</div>`}`).join('');
      }
      function open(code, { focus = true } = {}) {
        const pos = shown.findIndex((x) => x.code === code), i = shown[pos] || items.find((x) => x.code === code);
        if (!i) return;
        dlg.dataset.code = code;
        dlg.innerHTML = `<header><div><p class="eyebrow">${esc(catLabel(i.cat))} · <span class="code">${esc(i.code)}</span>${pos >= 0 ? ` · ${pos + 1} di ${shown.length}` : ''}</p><h2 id="inv-dlg-t" tabindex="-1">${esc(i.model)}</h2></div><button class="iconbtn" type="button" data-action="inv-close" aria-label="Chiudi">✕</button></header>
<div class="inv-dlg-b">${i.photos.length ? `<div class="inv-dlg-ph">${i.photos.map((p) => `<figure><img src="${esc(p.path)}" alt="${esc(i.model)} (${esc(p.kind)})"><figcaption class="small muted">${esc(photoNote(p))}${p.source ? ` · <a href="${esc(p.source)}" rel="noopener noreferrer">fonte</a>` : ''}</figcaption></figure>`).join('')}</div>` : ''}${kv(i)}</div>
<footer><button class="btn" type="button" data-action="inv-step" data-d="-1"${pos > 0 ? '' : ' disabled'}>← Precedente</button><button class="btn" type="button" data-action="inv-step" data-d="1"${pos >= 0 && pos < shown.length - 1 ? '' : ' disabled'}>Successiva →</button><a class="btn primary" href="${href('inventario/' + i.code)}">Apri la pagina</a></footer>`;
        if (!dlg.open) dlg.showModal();
        if (focus) dlg.querySelector('h2').focus();
      }
      const step = (d) => { const pos = shown.findIndex((x) => x.code === dlg.dataset.code); const n = shown[pos + d]; if (n) open(n.code); };
      let ret = null, timer;
      app.on('inv-open', (el) => { ret = el; open(el.dataset.code); });
      app.on('inv-close', () => dlg.close());
      app.on('inv-step', (el) => step(+el.dataset.d));
      dlg.addEventListener('close', () => { const c = dlg.dataset.code; (root.querySelector(`[data-action=inv-open][data-code="${CSS.escape(c)}"]`) || ret)?.focus(); });
      dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); else if (e.target.closest('a[href^="#"]')) dlg.close(); });
      dlg.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') step(1); else if (e.key === 'ArrowLeft') step(-1); });
      app.on('inv-q', (el) => { clearTimeout(timer); timer = setTimeout(() => { st.q = el.value.trim(); sync(); draw(); }, 100); });
      app.on('inv-clearq', () => { st.q = ''; root.querySelector('#inv-q').value = ''; sync(); draw(); root.querySelector('#inv-q').focus(); });
      app.on('inv-facet', (el) => {
        const { k, v } = el.dataset;
        if (k === 'photo') st.photo = !st.photo; else if (k === 'linked') st.linked = st.linked === v ? '' : v; else st[k] = st[k].includes(v) ? st[k].filter((x) => x !== v) : [...st[k], v];
        sync(); draw();
        (root.querySelector(`#inv-facets [data-k="${k}"][data-v="${CSS.escape(v)}"]`) || root.querySelector('#inv-q')).focus();
      });
      app.on('inv-set', (el) => { st[el.dataset.k] = el.dataset.v; root.querySelectorAll(`[data-action=inv-set][data-k=${el.dataset.k}]`).forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === el.dataset.v)); sync(); draw({ keepFacets: true }); });
      app.on('inv-sel', (el) => { st[el.dataset.k] = el.value; sync(); draw({ keepFacets: true }); });
      app.on('inv-reset', () => { Object.assign(st, { q: '', cat: [], state: [], used: [], photo: false, linked: '' }); root.querySelector('#inv-q').value = ''; sync(); draw(); root.querySelector('#inv-q').focus(); });
      if (window.matchMedia('(max-width: 900px)').matches) root.querySelectorAll('#inv-facets details').forEach((d) => { d.open = false; });
      draw();
      if (window.matchMedia('(max-width: 900px)').matches) root.querySelectorAll('#inv-facets details').forEach((d, n) => { d.open = n === 0 && !st.cat.length ? false : d.querySelector('[aria-pressed=true]') !== null; });
    },
  };
}
