// Sala server: compositore riservato. Si spostano i pezzi nei due montanti per valutare come montare tutto,
// con le misure della nicchia, i case, le stime di peso e calore. I dati arrivano dall'area riservata, già decifrati.
// Le prove restano su questo dispositivo; la composizione si può copiare per farla salvare nell'area riservata.
import { esc, href, table, icon } from '../ui.js';
import { rackSvg, rackGeometry, hitTest, faceplate, GEO } from '../lib/rackviz.js';
import { place, fits, checks, columnSummary, overlaps, powerOf } from '../lib/rack.js';

const itn = (n, d = 0) => (n === null || n === undefined ? 'n.d.' : Number(n).toLocaleString('it-IT', { minimumFractionDigits: d, maximumFractionDigits: d }));
const KEY = 'sala';

/** Stato di partenza: la proposta salvata nei dati riservati. */
export function proposalLayout(sala) {
  const p = sala.proposta || {};
  const pos = {}, shelf = {};
  for (const [id, v] of Object.entries(p.pos || {})) { if (sala.colonne.some((c) => c.id === v[0])) pos[id] = [v[0], v[1]]; else shelf[id] = v[0]; }
  return { cols: Object.fromEntries(sala.colonne.map((c) => [c.id, p.col?.[c.id] || c.u_max])), pos, shelf, casi: { ...(p.casi || {}) } };
}
/** Lo schema pubblico della 4.4, per i pezzi che vi compaiono. */
export function publicLayout(sala, rack) {
  const l = { cols: Object.fromEntries(sala.colonne.map((c) => [c.id, c.u_max])), pos: {}, shelf: {}, casi: {} };
  for (const s of rack.slots) {
    const piece = sala.pezzi.find((p) => p.tipo !== 'ripiano' && p.ref && (s.entities || [])[0] === p.ref);
    if (piece && s.from + piece.u - 1 <= l.cols[s.col]) l.pos[piece.id] = [s.col, s.from];
  }
  return l;
}

export function salaView(app, i, crumbs, tabs) {
  const { idx, core } = app;
  const sala = i.sala, vent = sala.ventilazione || {};
  const pieceOf = (id) => sala.pezzi.find((p) => p.id === id);
  const nameOf = (p) => { const e = p.ref && idx.get(p.ref); return e && /^(M|S)\d/.test(p.id) ? `${e.name} · ${e.title}` : p.nome; };
  const saved = app.data.progress?.[KEY];
  let L = saved && saved.cols && saved.pos ? structuredClone(saved) : proposalLayout(sala);
  let sel = '';
  const persist = () => { app.data.progress = { ...app.data.progress, [KEY]: L }; app.persist(); };
  const columns = () => sala.colonne.map((c) => ({ id: c.id, name: c.nome, u: L.cols[c.id] }));
  const caseOf = (id) => sala.casi.find((c) => c.id === L.casi[id]);
  /** L'altezza di un pezzo è quella del case scelto, se c'è. */
  const uOf = (id) => caseOf(id)?.u ?? pieceOf(id).u;
  const placed = () => Object.entries(L.pos).map(([id, [col, from]]) => { const p = pieceOf(id); if (!p) return null; const e = p.ref && idx.get(p.ref); return { id, col, from, u: uOf(id), ground: p.tipo === 'terra', face: p.face || 'server', sub: e && /^(M|S)\d/.test(id) ? e.title : p.nome, label: p.nome, power: e ? powerOf(e) : 'off', kg: p.kg, peakW: p.w?.[2], ports: p.ports, aria: `${nameOf(p)}, ${uOf(id)} unità, ${col === 'SX' ? 'colonna sinistra' : 'colonna destra'} da ${from}` }; }).filter(Boolean);
  const pending = () => sala.pezzi.filter((p) => p.tipo !== 'ripiano' && !L.pos[p.id]);
  const shelfItems = (rid) => sala.pezzi.filter((p) => p.tipo === 'ripiano' && L.shelf[p.id] === rid);
  const shelfPending = () => sala.pezzi.filter((p) => p.tipo === 'ripiano' && !L.shelf[p.id]);

  // nicchia: falda, quote, aria, ripiani in cima. Scala verticale del rack: 1 U = u_cm.
  const pxcm = GEO.U / sala.u_cm;
  const extraTop = Math.max(0, Math.round(sala.vano.h_dx * pxcm - (Math.max(...sala.colonne.map((c) => c.u_max)) * GEO.U + 2 * GEO.CAP)) + 46);
  const overlay = (geo) => {
    const x0 = geo.cols[0].x - 34, x1 = geo.cols.at(-1).x + geo.colW + 16;
    const yL = geo.floor - sala.vano.h_sx * pxcm, yR = geo.floor - sala.vano.h_dx * pxcm;
    const roofAt = (x) => yL + ((x - x0) / (x1 - x0)) * (yR - yL);
    const shelves = geo.cols.map((c, k) => {
      const rid = sala.ripiani.find((r) => r.col === c.id)?.id, items = rid ? shelfItems(rid) : [];
      if (!rid) return '';
      const top = Math.max(roofAt(c.x), roofAt(c.x + geo.colW)) + 6, h = Math.max(0, c.y - top);
      const body = items.length && h >= 54 ? `<g transform="translate(${c.innerX},${c.y - Math.min(h, 66)})" class="sala-shelf">${faceplate('rk', { id: rid, face: 'shelf', u: 3, items: items.map((p) => ({ id: p.id, power: p.ref && idx.get(p.ref) ? powerOf(idx.get(p.ref)) : 'off' })) }, GEO.W, Math.min(h, 66))}</g>` : '';
      return `${body}<text x="${c.x + geo.colW / 2}" y="${c.y - (h >= 54 && items.length ? Math.min(h, 66) + 8 : 10)}" text-anchor="middle" class="sala-t">${esc((sala.ripiani.find((r) => r.id === rid).nome || '').toUpperCase())}${h < 54 ? (items.length ? ' · ' + items.map((p) => p.id).join(', ') : '') + ' · poco spazio sotto la falda' : ''}</text>`;
    }).join('');
    return `<g class="sala-niche" pointer-events="none">
<path d="M${x0} ${yL}L${x1} ${yR}V${yR - 26}L${x0} ${yL - 26}z" class="sala-roof"/><path d="M${x0} ${yL}L${x1} ${yR}" class="sala-roofline"/>
<text x="${(x0 + x1) / 2}" y="${(yL + yR) / 2 - 9}" text-anchor="middle" class="sala-t" transform="rotate(${Math.atan2(yR - yL, x1 - x0) * 180 / Math.PI} ${(x0 + x1) / 2} ${(yL + yR) / 2 - 9})">FALDA DEL TETTO</text>
<path d="M${x0} ${yL}V${geo.floor}M${x1} ${yR}V${geo.floor}" class="sala-wall"/><path d="M${x0 - 12} ${geo.floor + 8}H${x1 + 12}" class="sala-floor"/>
<path d="M${x0 - 14} ${yL}V${geo.floor}M${x0 - 18} ${yL}h8M${x0 - 18} ${geo.floor}h8" class="sala-dim"/><text x="${x0 - 20}" y="${(yL + geo.floor) / 2}" text-anchor="end" class="sala-d">${itn(sala.vano.h_sx)} cm</text>
<path d="M${x1 + 14} ${yR}V${geo.floor}M${x1 + 10} ${yR}h8M${x1 + 10} ${geo.floor}h8" class="sala-dim"/><text x="${x1 + 20}" y="${(yR + geo.floor) / 2}" class="sala-d">${itn(sala.vano.h_dx)} cm</text>
<path d="M${x0} ${geo.floor + 32}H${x1}M${x0} ${geo.floor + 28}v8M${x1} ${geo.floor + 28}v8" class="sala-dim"/><text x="${(x0 + x1) / 2}" y="${geo.floor + 44}" text-anchor="middle" class="sala-d">${itn(sala.vano.larghezza)} cm · profondità ${itn(sala.vano.profondita)} cm</text>
<g class="sala-air in"><path d="M${x0 - 70} ${geo.floor - 40}h34m-9 -6l9 6l-9 6"/><text x="${x0 - 30}" y="${geo.floor - 52}" text-anchor="end">IMMISSIONE</text></g>
<g class="sala-air out"><path d="M${x1 - 40} ${yR + 46}v-34m-6 9l6 -9l6 9"/><text x="${x1 - 52}" y="${yR + 24}" text-anchor="end">ASPIRAZIONE</text></g>
</g>${shelves}`;
  };

  const analysis = () => {
    const ps = placed(), cols = columns();
    const list = checks(ps, cols, { pending: pending().map((p) => p.id) });
    // profondità dei case contro la nicchia
    for (const p of ps) { const c = caseOf(p.id), d = c?.prof ?? pieceOf(p.id).prof; if (Number.isFinite(d) && d > sala.vano.profondita) list.push({ level: 'err', text: `${p.id}: ${c ? c.nome : 'il pezzo'} è profondo ${itn(d)} cm, la nicchia ${itn(sala.vano.profondita)} cm.` }); }
    // lo stesso case non può ospitare due macchine
    const used = Object.entries(L.casi).filter(([id, c]) => c && L.pos[id]);
    for (const [id, c] of used) { const twin = used.find(([o, k]) => o !== id && k === c); if (twin && id < twin[0]) list.push({ level: 'err', text: `${id} e ${twin[0]} usano lo stesso case (${c}).` }); }
    // aria: portata necessaria al picco contro quella disponibile
    const peak = [...ps, ...sala.pezzi.filter((p) => p.tipo === 'ripiano' && L.shelf[p.id]).map((p) => ({ peakW: p.w?.[2] }))].reduce((n, p) => n + (Number.isFinite(p.peakW) ? p.peakW : 0), 0);
    let air = null;
    if (vent.dt && vent.q_ventola && vent.n) { const need = (2.99 * peak) / vent.dt, have = vent.n * vent.q_ventola * (vent.riserva_pressione || 1); air = { need, have, peak }; list.push({ level: need <= have ? 'ok' : 'warn', text: `Aria al picco: servono ${itn(need)} m³/h per ${itn(peak)} W con ${itn(vent.dt)} °C di salto; ${itn(vent.n)} aspiratori ne danno circa ${itn(have)}.` }); }
    return { ps, cols, list, air, bad: new Set(overlaps(ps).flat()) };
  };

  const stage = (a) => `<div class="rack-inner">${rackSvg(a.cols, a.ps, { sel, extraTop, side: 86, titles: 'bottom', overlay, bad: a.bad, label: 'Compositore della sala server. Seleziona un pezzo con Invio e spostalo con i comandi accanto, oppure trascinalo.' })}</div>`;
  const tray = () => { const p = pending(), s = shelfPending(); return `<div class="sala-tray" id="sala-tray"><strong class="small">Da collocare</strong>${p.length || s.length ? `<div class="chips">${[...p, ...s].map((x) => `<button type="button" class="chip" data-action="sala-sel" data-id="${esc(x.id)}" aria-pressed="${x.id === sel}">${esc(x.id)} <span class="n">${x.tipo === 'ripiano' ? 'ripiano' : x.u + 'U'}</span></button>`).join('')}</div>` : '<span class="small muted"> Tutti i pezzi sono collocati. Trascina un pezzo fuori dal rack, o usa «Togli dal rack», per rimetterlo qui.</span>'}</div>`; };
  const panel = (a) => {
    const p = sel && pieceOf(sel);
    const sum = columnSummary(a.ps, a.cols);
    const head = `<div class="card"><h2 class="h3">Colonne</h2>${sum.map((c) => { const max = sala.colonne.find((x) => x.id === c.id).u_max; return `<div class="sala-col"><span><strong>${esc(c.name)}</strong><br><span class="small muted">${c.used} U usate · ${c.free} libere${c.peakW !== null ? ` · ${itn(c.peakW)} W al picco` : ''}${c.kg !== null ? ` · ${itn(c.kg, 1)} kg` : ''}</span></span><span class="sala-step"><button type="button" class="iconbtn" data-action="sala-col" data-id="${c.id}" data-d="-1" aria-label="Togli una unità a ${esc(c.name)}"${c.u <= 4 ? ' disabled' : ''}>−</button><b>${c.u}U</b><button type="button" class="iconbtn" data-action="sala-col" data-id="${c.id}" data-d="1" aria-label="Aggiungi una unità a ${esc(c.name)}"${c.u >= max ? ' disabled' : ''}>+</button></span></div>`; }).join('')}
<p class="small muted">Massimo sotto la falda: ${sala.colonne.map((c) => `${c.u_max}U a ${c.id === 'SX' ? 'sinistra' : 'destra'} (${itn(c.utile_cm)} cm utili)`).join(', ')}. Togliere una unità lascia più spazio al ripiano in cima.</p></div>`;
    let selBox = `<div class="card"><h2 class="h3">Nessun pezzo selezionato</h2><p class="small">Trascina un pezzo dove vuoi provarlo: si aggancia all'unità libera più vicina. Da tastiera: Tab fino al pezzo, Invio, poi i comandi che compaiono qui.</p></div>`;
    if (p) {
      const pos = L.pos[p.id], onShelf = p.tipo === 'ripiano', e = p.ref && idx.get(p.ref), c = caseOf(p.id);
      selBox = `<div class="card sala-selbox"><p class="eyebrow">Pezzo · <span class="code">${esc(p.id)}</span></p><h2 class="h3" id="sala-sel" tabindex="-1">${esc(nameOf(p))}</h2>
<p class="small muted">${onShelf ? `Da ripiano${p.dim ? ` · ${p.dim.map((d) => itn(d, 1)).join(' × ')} cm` : ''}` : `${uOf(p.id)} U`}${Number.isFinite(p.kg) ? ` · ${itn(p.kg, 1)} kg` : ''}${p.w ? ` · ${p.w.map((w) => itn(w)).join(' / ')} W (riposo / medio / picco)` : ''}${p.stima ? ' · misure stimate' : ''}${p.previsto ? ' · previsto, non ancora in casa' : ''}</p>
${p.nota ? `<p class="small">${esc(p.nota)}</p>` : ''}
${onShelf ? `<div class="sala-btns">${sala.ripiani.map((r) => `<button type="button" class="btn${L.shelf[p.id] === r.id ? ' primary' : ''}" data-action="sala-shelf" data-id="${r.id}">${esc(r.nome)}</button>`).join('')}${L.shelf[p.id] ? '<button type="button" class="btn ghost" data-action="sala-shelf" data-id="">Togli</button>' : ''}</div>`
    : `<p class="small"><strong>${pos ? `${pos[0] === 'SX' ? 'Colonna sinistra' : 'Colonna destra'}, unità ${pos[1]}–${pos[1] + uOf(p.id) - 1}` : 'Non collocato'}</strong></p>
<div class="sala-btns">${pos ? `<button type="button" class="btn" data-action="sala-move" data-d="1">↑ Su</button><button type="button" class="btn" data-action="sala-move" data-d="-1">↓ Giù</button><button type="button" class="btn" data-action="sala-swap">Altra colonna</button><button type="button" class="btn ghost" data-action="sala-remove">Togli dal rack</button>` : sala.colonne.map((k) => `<button type="button" class="btn" data-action="sala-put" data-id="${k.id}">Metti a ${k.id === 'SX' ? 'sinistra' : 'destra'}</button>`).join('')}</div>
${p.tipo === 'rack' && p.face !== 'switch' && p.face !== 'panel' ? `<label class="f sala-case">Case (decide l'altezza)<select data-change="sala-case"><option value="">non scelto · ${p.u} U</option>${sala.casi.map((k) => `<option value="${esc(k.id)}"${L.casi[p.id] === k.id ? ' selected' : ''}>${esc(k.nome)} · ${k.u} U · prof. ${itn(k.prof)} cm</option>`).join('')}</select></label>${c?.nota ? `<p class="small muted">${esc(c.nota)}</p>` : ''}` : ''}`}
<div class="sala-btns">${e ? `<a class="btn ghost" href="${href('e/' + e.id)}">Scheda di ${esc(e.name)}</a>` : ''}<button type="button" class="btn ghost" data-action="sala-sel" data-id="">Deseleziona</button></div></div>`;
    }
    return `${selBox}<div class="card"><h2 class="h3">Verifiche</h2><ul class="sala-checks">${a.list.map((c) => `<li class="${c.level}"><span class="vh">${({ err: 'Errore', warn: 'Attenzione', ok: 'A posto', info: 'Nota' })[c.level]}: </span>${esc(c.text)}</li>`).join('')}</ul></div>${head}`;
  };

  const a0 = analysis();
  const rowsPezzi = sala.pezzi.map((p) => [`<span class="code">${esc(p.id)}</span> ${esc(nameOf(p))}`, p.tipo === 'ripiano' ? 'ripiano' : `${p.u} U`, Number.isFinite(p.kg) ? itn(p.kg, 1) + ' kg' : 'n.d.', p.w ? p.w.map((w) => itn(w)).join(' / ') + ' W' : 'n.d.', esc([p.stima && 'misure stimate', p.previsto && 'previsto', p.nota].filter(Boolean).join(' · ') || '—')]);
  const html = `${crumbs}${tabs}
<div class="sala-bar"><h1 id="ptitle">Sala server · compositore</h1><span class="lockmark">${icon('unlock')} area riservata</span></div>
<p class="lead">Sposta i pezzi nei due montanti per valutare come montare tutto. Le prove restano su questo dispositivo finché non le copi.</p>
<div class="callout warn"><strong>Stime da verificare</strong>${esc(sala.revisione)} ${esc(sala.fonte)}</div>
<div class="sala-actions"><button class="btn" type="button" data-action="sala-preset" data-id="proposta">Proposta del 21 ottobre</button><button class="btn" type="button" data-action="sala-preset" data-id="pubblico">Schema della 4.4</button><button class="btn" type="button" data-action="sala-preset" data-id="vuoto">Svuota il rack</button><button class="btn primary" type="button" data-action="sala-copy">Copia la composizione</button></div>
<div class="pagecols mapcols rack-cols"><div><div class="rack-stage sala-stage" id="sala-stage" tabindex="0" role="region" aria-label="Sala server, disegno">${stage(a0)}</div><div id="sala-trayw">${tray()}</div>
<p class="small muted">Vista frontale schematica: l'altezza segue le unità rack (1 U = ${itn(sala.u_cm, 3)} cm), la larghezza è allargata per leggibilità. ${esc(sala.vano.luogo)}. ${esc(sala.vano.porta)}. ${esc(sala.vano.retro)}.</p></div>
<aside class="aside" id="sala-panel" aria-label="Pezzo selezionato e verifiche" aria-live="polite">${panel(a0)}</aside></div>
<h2>Tutti i dati della sala server</h2>
<details open><summary>Aria, linee e cavi</summary><dl class="kv">${Object.entries({ Immissione: sala.aria.immissione, Aspirazione: sala.aria.aspirazione, 'Uscite dei cavi': sala.aria.uscite, 'Linee in ingresso': sala.aria.linea, 'Linea elettrica': `${itn(sala.linea_w)} W disponibili` }).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></details>
<details><summary>Pezzi (${sala.pezzi.length})</summary>${table(['Pezzo', 'Ingombro', 'Peso', 'Riposo / medio / picco', 'Note'], rowsPezzi, { caption: 'Pezzi della sala server' })}</details>
<details><summary>Case (${sala.casi.length})</summary>${table(['Case', 'Altezza', 'Profondità', 'Ventole', 'Note'], sala.casi.map((c) => [`<span class="code">${esc(c.id)}</span> ${c.pagina ? `<a href="${esc(c.pagina)}" rel="noopener noreferrer">${esc(c.nome)}</a>` : esc(c.nome)}`, `${c.u} U`, `${itn(c.prof)} cm`, itn(c.ventole), esc(c.nota || '—')]), { caption: 'Case disponibili' })}</details>
<details><summary>Patch panel</summary>${table(['Porte', 'Uso'], sala.patch.map(([a, b]) => [esc(a), esc(b)]), { caption: 'Assegnazione del patch panel' })}</details>
<details><summary>Ventilazione e power station</summary><dl class="kv"><dt>Salto termico</dt><dd>${itn(vent.dt)} °C</dd><dt>Aspiratori</dt><dd>${itn(vent.n)} da ${itn(vent.q_ventola)} m³/h a bocca libera, contati al ${itn((vent.riserva_pressione || 1) * 100)}%</dd><dt>Rumore massimo</dt><dd>${itn(vent.db_max)} dB(A)</dd><dt>Estate</dt><dd>${itn(vent.t_estate)} °C esterni</dd><dt>Power station</dt><dd>${esc(sala.ps.nome)} · ${itn(sala.ps.capacita_wh)} Wh · inverter ${itn(sala.ps.inverter_w)} W</dd></dl><p class="small muted">${esc(vent.nota || '')}</p></details>
<details><summary>Scenari d'uso (${sala.scenari.length})</summary>${table(['Scenario', 'Descrizione', 'Esterno', 'Apparati accesi'], sala.scenari.map((s) => [esc(s.nome), esc(s.desc), `${itn(s.t_est)} °C`, esc(Object.entries(s.stati).map(([k, v]) => `${k} ${v}`).join(', '))]), { caption: 'Scenari' })}</details>
<details><summary>Perché la proposta è fatta così</summary><ul>${(sala.proposta.motivi || []).map((m) => `<li>${esc(m)}</li>`).join('')}</ul></details>`;

  return {
    title: 'Sala server · compositore', html, keepScroll: false,
    mount: (root) => {
      const st = root.querySelector('#sala-stage'), pan = root.querySelector('#sala-panel'), tr = root.querySelector('#sala-trayw');
      const redraw = (focus) => {
        const a = analysis();
        st.innerHTML = stage(a); pan.innerHTML = panel(a); tr.innerHTML = tray();
        if (focus === 'panel') pan.querySelector('#sala-sel')?.focus({ preventScroll: true });
        else if (focus === 'unit') st.querySelector(`[data-unit="${CSS.escape(sel)}"] .rk-hit`)?.focus({ preventScroll: true });
        else if (focus) pan.querySelector(focus)?.focus({ preventScroll: true });
      };
      const commit = (focus) => { persist(); redraw(focus); };
      const tryPlace = (id, col, want) => {
        const u = uOf(id), ps = placed(), next = place(ps, { id, u }, col, want, L.cols[col]);
        if (!next) { app.toast(`${id} non entra in quella colonna: libera ${u} unità di seguito`); return false; }
        const hit = next.find((x) => x.id === id); L.pos[id] = [hit.col, hit.from]; return true;
      };
      // trascinamento: il pezzo segue il puntatore e si aggancia all'unità libera più vicina
      let drag = null;
      const pt = (ev) => { const svg = st.querySelector('.rk-svg'), m = svg.getScreenCTM(); const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(m.inverse()); };
      st.addEventListener('pointerdown', (ev) => { const u = ev.target.closest('[data-unit]'); if (!u || ev.button) return; const p0 = pt(ev), tf = /translate\(([-\d.]+),([-\d.]+)\)/.exec(u.getAttribute('transform')); drag = { id: u.dataset.unit, el: u, x0: p0.x, y0: p0.y, tx: +tf[1], ty: +tf[2], moved: false }; u.setPointerCapture(ev.pointerId); });
      st.addEventListener('pointermove', (ev) => { if (!drag) return; const p = pt(ev), dx = p.x - drag.x0, dy = p.y - drag.y0; if (!drag.moved && Math.hypot(dx, dy) < 5) return; drag.moved = true; drag.el.classList.add('drag'); drag.el.setAttribute('transform', `translate(${drag.tx + dx},${drag.ty + dy})`); });
      const drop = (ev) => {
        if (!drag) return; const d = drag; drag = null;
        if (!d.moved) { sel = sel === d.id ? '' : d.id; redraw('unit'); return; }
        const p = pt(ev), geo = rackGeometry(columns(), { extraTop, side: 86 });
        const h = hitTest(geo, d.tx + (p.x - d.x0) + GEO.W / 2, d.ty + (p.y - d.y0) + uOf(d.id) * GEO.U);
        sel = d.id;
        if (!h) { delete L.pos[d.id]; app.toast(`${d.id} tolto dal rack`); commit('panel'); return; }
        tryPlace(d.id, h.col, h.u); commit('unit');
      };
      st.addEventListener('pointerup', drop); st.addEventListener('pointercancel', () => { drag = null; redraw(); });
      st.addEventListener('keydown', (ev) => { const u = ev.target.closest('[data-unit]'); if (!u) return; if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); sel = u.dataset.unit; redraw('panel'); } });
      app.on('sala-sel', (el) => { sel = el.dataset.id; redraw(sel ? 'panel' : null); });
      app.on('sala-move', (el) => { const [col, from] = L.pos[sel], u = uOf(sel), d = +el.dataset.d; let f = from + d; const ps = placed(); while (f >= 1 && f + u - 1 <= L.cols[col] && !fits(ps, { id: sel, u }, col, f, L.cols[col])) f += d; if (f < 1 || f + u - 1 > L.cols[col]) { app.toast('Non c\'è spazio libero in quella direzione'); return; } L.pos[sel] = [col, f]; commit(`[data-action=sala-move][data-d="${d}"]`); });
      app.on('sala-swap', () => { const [col, from] = L.pos[sel], other = sala.colonne.find((c) => c.id !== col).id; if (tryPlace(sel, other, from)) commit('[data-action=sala-swap]'); });
      app.on('sala-put', (el) => { if (tryPlace(sel, el.dataset.id, 1)) commit('panel'); });
      app.on('sala-remove', () => { delete L.pos[sel]; commit('panel'); });
      app.on('sala-shelf', (el) => { if (el.dataset.id) L.shelf[sel] = el.dataset.id; else delete L.shelf[sel]; commit('panel'); });
      app.on('sala-case', (el) => {
        const before = L.casi[sel]; if (el.value) L.casi[sel] = el.value; else delete L.casi[sel];
        const pos = L.pos[sel];
        if (pos && !fits(placed(), { id: sel, u: uOf(sel) }, pos[0], pos[1], L.cols[pos[0]]) && !tryPlace(sel, pos[0], pos[1])) { if (before) L.casi[sel] = before; else delete L.casi[sel]; }
        commit('.sala-case select');
      });
      app.on('sala-col', (el) => {
        const id = el.dataset.id, n = L.cols[id] + +el.dataset.d, max = sala.colonne.find((c) => c.id === id).u_max;
        if (n < 4 || n > max) return;
        const out = placed().filter((p) => p.col === id && p.from + p.u - 1 > n);
        if (out.length) { app.toast(`Prima sposta ${out.map((p) => p.id).join(', ')}: ${out.length === 1 ? 'arriva' : 'arrivano'} oltre ${n}U`); return; }
        L.cols[id] = n; commit(`[data-action=sala-col][data-id="${id}"][data-d="${el.dataset.d}"]`);
      });
      app.on('sala-preset', (el) => { L = el.dataset.id === 'proposta' ? proposalLayout(sala) : el.dataset.id === 'pubblico' ? publicLayout(sala, core.rack) : { cols: Object.fromEntries(sala.colonne.map((c) => [c.id, c.u_max])), pos: {}, shelf: {}, casi: {} }; sel = ''; commit(); app.toast(({ proposta: 'Proposta del 21 ottobre ripristinata', pubblico: 'Schema della 4.4: i pezzi non previsti dallo schema sono da collocare', vuoto: 'Rack svuotato' })[el.dataset.id]); });
      app.on('sala-copy', () => { const text = JSON.stringify({ sala: { cols: L.cols, pos: L.pos, shelf: L.shelf, casi: L.casi }, del: new Date().toISOString().slice(0, 10) }); navigator.clipboard?.writeText(text).then(() => app.toast('Composizione copiata: incollala in chat per farla salvare nell\'area riservata'), () => app.toast('Copia non consentita dal browser')); });
    },
  };
}
