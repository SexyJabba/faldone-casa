import { esc, href, phead, ctxbar, dims, table, kind, st, badge } from '../ui.js';
import { simulate, diff, ST_LABEL } from '../lib/sim.js';
import { scenarioFromQuery, queryFromScenario } from './sim.js';
import { walk, REL_LABEL } from '../lib/model.js';

// Livelli: ogni livello mostra un insieme di relazioni del modello.
export const LAYERS = [
  { id: 'rete', label: 'Rete', types: ['connected_to'], cls: 'physical', desc: 'Collegamenti fisici e radio documentati.' },
  { id: 'hosting', label: 'Hosting', types: ['hosted_on'], cls: 'logical', bands: ['service'], desc: 'Quale servizio gira su quale macchina.' },
  { id: 'dati', label: 'Dati', types: ['stores_on'], cls: 'logical', bands: ['dataset', 'storage'], desc: 'Dove stanno i dati.' },
  { id: 'copie', label: 'Backup e replica', types: ['backs_up_to', 'replicates_to', 'protected_by'], cls: 'copy', bands: ['dataset', 'storage', 'copy'], desc: 'Copie, repliche, snapshot e ridondanze.' },
  { id: 'alimentazione', label: 'Alimentazione', types: ['powered_by'], cls: 'power', desc: 'Alimentazione documentata o dichiarata.' },
  { id: 'quorum', label: 'Quorum', types: ['member_of'], cls: 'logical', desc: 'Membri votanti del nucleo.' },
  { id: 'accesso', label: 'Accesso remoto', types: ['depends_on'], filter: (r, idx) => ['OPNSENSE', 'CADDY', 'ACCESSO-PRIVATO', 'WAN1', 'WAN2', 'R5G'].includes(r.toId) || ['ACCESSO-PRIVATO', 'CADDY'].includes(r.fromId), synthetic: 'remote', cls: 'dep', bands: ['service'], desc: 'Il percorso da fuori casa ai servizi.' },
  { id: 'automazioni', label: 'Dipendenze', types: ['depends_on'], cls: 'dep', bands: ['service'], desc: 'Dipendenze funzionali fra servizi.' },
  { id: 'radio', label: 'Radio', types: ['connected_to', 'depends_on', 'hosted_on'], filter: (r) => ['ZB', 'NET-ZIGBEE', 'Z2M', 'S3', 'ZB-BINDING', 'MQTT', 'HAOS'].includes(r.fromId) && ['ZB', 'NET-ZIGBEE', 'S3', 'MQTT', 'M5'].includes(r.toId), cls: 'physical', bands: ['service'], desc: 'Zigbee e messaggi dei sensori.' },
  { id: 'accensione', label: 'Accensione', types: ['wakes'], cls: 'wake', desc: 'Chi accende i server a richiesta.' },
];
const BANDS = [
  ['esterno', (e) => ['WAN1', 'WAN2', 'R5G', 'S2', 'ST-DRIVE', 'GRID', 'P-CLOUD'].includes(e.id), 'Esterno e linee'],
  ['rete', (e) => ['M1', 'SW', 'NET-FAMIGLIA', 'NET-IOT', 'PS-RACK'].includes(e.id), 'Rete e protezione'],
  ['nucleo', (e) => e.vote || e.id === 'CLUSTER', 'Nucleo (vota)'],
  ['richiesta', (e) => ['M3', 'M4', 'M6', 'M7', 'ARCA'].includes(e.id), 'A richiesta e riserva'],
  ['supporto', (e) => ['S1', 'S3', 'S4', 'ZB', 'NET-ZIGBEE'].includes(e.id), 'Supporto e radio'],
  ['client', (e) => ['C1', 'C2', 'MP3', 'MP1', 'HP-AMICI', 'MICROTECH', 'NET-VITO'].includes(e.id), 'Postazioni, Vito, amici'],
  ['service', (e) => e.kind === 'service', 'Servizi'],
  ['dataset', (e) => e.kind === 'dataset', 'Dati'],
  ['storage', (e) => e.kind === 'storage' && e.id !== 'ST-DRIVE', 'Archivi'],
  ['copy', (e) => e.kind === 'copy', 'Copie'],
];
// Segno di stato nell'angolo del nodo: forma diversa per ogni stato, come nel resto del sito.
const GLYPH = {
  available: '<circle cx="0" cy="0" r="5"/>',
  on_demand: '<circle cx="0" cy="0" r="4" class="hollow"/>',
  degraded: '<path d="M0 -5.5L5.5 4.5H-5.5z"/>',
  unknown: '<rect x="-4.5" y="-4.5" width="9" height="9" rx="1.5" class="hollow dash"/>',
  blocked: '<rect x="-5" y="-5" width="10" height="10" rx="1.5"/>',
};
const EVENT_LABEL = { fail: 'guasto simulato', off: 'spento per manutenzione', on: 'acceso' };
const BW = 150, BH = 48, GAPX = 18, GAPY = 64, PER_ROW = 6;

export function layout(core, layers) {
  const extra = new Set(layers.flatMap((l) => LAYERS.find((x) => x.id === l)?.bands || []));
  const bands = BANDS.filter(([id]) => ['esterno', 'rete', 'nucleo', 'richiesta', 'supporto', 'client'].includes(id) || extra.has(id));
  const placed = new Map(); const rows = [];
  const used = new Set();
  let y = 40;
  for (const [id, f, label] of bands) {
    const items = core.entities.filter((e) => !used.has(e.id) && f(e) && e.kind !== 'place');
    items.forEach((e) => used.add(e.id));
    if (!items.length) continue;
    const perRow = PER_ROW;
    for (let i = 0; i < items.length; i += perRow) {
      const chunk = items.slice(i, i + perRow);
      chunk.forEach((e, j) => placed.set(e.id, { x: 150 + j * (BW + GAPX), y, e }));
      rows.push({ id, label: i ? '' : label, y });
      y += BH + GAPY;
    }
  }
  const width = 150 + PER_ROW * (BW + GAPX);
  return { placed, rows, width, height: y };
}

export function edgesFor(core, idx, layers, placed) {
  const out = [];
  for (const lid of layers) {
    const L = LAYERS.find((x) => x.id === lid); if (!L) continue;
    for (const r of core.relations) {
      if (!L.types.includes(r.type)) continue;
      if (L.filter && !L.filter(r, idx)) continue;
      if (lid === 'automazioni' && !(idx.get(r.fromId)?.kind === 'service' && idx.get(r.toId)?.kind === 'service')) continue;
      if (lid === 'rete' && (idx.get(r.fromId)?.kind === 'service')) continue;
      if (!placed.has(r.fromId) || !placed.has(r.toId)) continue;
      out.push({ r, layer: lid, cls: r.evidenceKind === 'unknown' ? 'unknown' : L.cls });
    }
    if (L.synthetic === 'remote') for (const e of core.entities) {
      if (e.remote === 'caddy' || e.remote === 'private') {
        const to = e.remote === 'caddy' ? 'CADDY' : 'ACCESSO-PRIVATO';
        if (placed.has(e.id) && placed.has(to)) out.push({ r: { id: `X:${e.id}:${to}`, fromId: e.id, toId: to, type: 'depends_on', label: 'accesso da fuori' }, layer: lid, cls: to === 'ACCESSO-PRIVATO' ? 'unknown' : 'dep' });
      }
    }
  }
  return out;
}

export function map(app) {
  const { core, idx } = app;
  const narrow = window.matchMedia('(max-width: 700px)').matches;
  const layers = (app.query.l || 'rete,quorum').split(',').filter((l) => LAYERS.some((x) => x.id === l));
  let sel = idx.get(app.query.s) ? app.query.s : null;
  const mode = app.query.v || (narrow ? 'focus' : 'mappa');
  if (mode === 'focus' && !sel) sel = 'M2';
  const simOn = app.query.sim === '1' || !!(app.query.f || app.query.o || app.query.on);
  if (simOn && !layers.includes('hosting')) layers.push('hosting');

  const html = `${ctxbar([['Esplora', 'esplora'], ['Mappa']])}${phead({ eyebrow: 'Esplora', title: 'Mappa relazionale', lead: 'Fasce stabili: esterno, rete, nucleo, server a richiesta, supporto, postazioni. Scegli i livelli, seleziona un elemento e, se vuoi, simula un guasto per vedere fin dove arriva.' })}
<div class="seg" role="group" aria-label="Modalità"><button type="button" data-action="mode" data-v="mappa" aria-pressed="${mode === 'mappa'}">Mappa</button><button type="button" data-action="mode" data-v="focus" aria-pressed="${mode === 'focus'}">Elemento e vicini</button><button type="button" data-action="mode" data-v="elenco" aria-pressed="${mode === 'elenco'}">Elenco</button></div>
<button class="btn${simOn ? ' primary' : ''}" type="button" data-action="simtoggle" aria-pressed="${simOn}" style="margin-left:8px">Simula un guasto sulla mappa</button>
<div id="simbar" aria-live="polite"></div>
<div class="layers" role="group" aria-label="Livelli">${LAYERS.map((l) => `<button class="chip" type="button" data-action="layer" data-id="${l.id}" aria-pressed="${layers.includes(l.id)}" title="${esc(l.desc)}">${esc(l.label)}</button>`).join('')}</div>
<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:6px 0"><label class="f" style="flex:1;min-width:220px"><span class="vh">Cerca nella mappa</span><input type="text" list="mapitems" placeholder="Cerca un elemento nella mappa (es. M2, Immich)" data-change="mapfind" id="mapfind"></label>
<datalist id="mapitems">${core.entities.map((e) => `<option value="${esc(e.id)}">${esc(e.name)}${e.title ? ' · ' + esc(e.title) : ''}</option>`).join('')}</datalist>
<button class="btn ghost" type="button" data-action="share">Copia collegamento a questa vista</button></div>
<div class="pagecols mapcols"><div><div id="maparea"></div><div class="legend" aria-label="Legenda"><span><svg viewBox="0 0 28 10"><line x1="0" y1="5" x2="28" y2="5" class="edge physical"/></svg>collegamento fisico</span><span><svg viewBox="0 0 28 10"><line x1="0" y1="5" x2="28" y2="5" class="edge logical"/></svg>flusso logico</span><span><svg viewBox="0 0 28 10"><line x1="0" y1="5" x2="28" y2="5" class="edge dep"/></svg>dipendenza funzionale</span><span><svg viewBox="0 0 28 10"><line x1="0" y1="5" x2="28" y2="5" class="edge copy"/></svg>copia / replica</span><span><svg viewBox="0 0 28 10"><line x1="0" y1="5" x2="28" y2="5" class="edge wake"/></svg>accensione</span><span><svg viewBox="0 0 28 10"><line x1="0" y1="5" x2="28" y2="5" class="edge unknown"/></svg>non documentato</span></div></div><aside class="aside" id="mapdetail" aria-live="polite"></aside></div>`;

  return {
    title: 'Mappa', html, keepScroll: true,
    mount: (root) => {
      const area = root.querySelector('#maparea');
      const detail = root.querySelector('#mapdetail');
      let view = null; // {x,y,w,h}
      const state = { layers, sel, mode, sim: simOn };
      let scen = simOn ? { events: scenarioFromQuery(app.query).events.filter((e) => ['fail', 'off', 'on'].includes(e.type) && idx.get(e.id)) } : { events: [] };
      const base = simulate(idx, {});
      let simr = null, changed = new Set();
      const evOf = (id) => scen.events.find((e) => e.id === id)?.type || null;
      const resim = () => { if (!state.sim) { simr = null; changed = new Set(); return; } simr = simulate(idx, scen); changed = new Set(diff(base, simr, core.entities.map((e) => e.id)).map((d) => d.id)); };
      const sync = () => { const sq = state.sim ? queryFromScenario(scen) : {}; app.setQuery({ l: state.layers, s: state.sel, v: state.mode === (narrow ? 'focus' : 'mappa') ? '' : state.mode, sim: state.sim ? '1' : '', f: sq.f, o: sq.o, on: sq.on }); };
      const simCls = (id) => (simr ? ` st-${simr.status(id).status}${changed.has(id) ? ' changed' : ''}${evOf(id) ? ' ev' : ''}` : '');
      const simTxt = (id) => (simr ? `, ${evOf(id) ? EVENT_LABEL[evOf(id)] : ST_LABEL[simr.status(id).status]}` : '');
      function drawBar() {
        const bar = root.querySelector('#simbar');
        if (!state.sim) { bar.innerHTML = ''; return; }
        const q = simr.quorum;
        const svcs = core.entities.filter((e) => e.kind === 'service' && e.activities?.length);
        const counts = ['blocked', 'unknown', 'degraded', 'on_demand', 'available'].map((k) => [k, svcs.filter((e) => simr.status(e.id).status === k).length]).filter(([, n]) => n);
        const ch = [...changed].map((id) => idx.get(id)).filter((e) => e && !evOf(e.id)).sort((a, b) => (a.kind === 'service' ? 0 : 1) - (b.kind === 'service' ? 0 : 1) || a.name.localeCompare(b.name, 'it'));
        const sq = queryFromScenario(scen);
        const qs = new URLSearchParams(Object.entries({ f: sq.f.join(','), o: sq.o.join(','), on: sq.on.join(',') }).filter(([, v]) => v)).toString();
        bar.innerHTML = `<div class="callout sim simbar"><div class="simbar-h"><strong><span class="simtag">Simulazione</span> ${scen.events.length ? scen.events.map((e) => `${esc(idx.get(e.id).name)}: ${EVENT_LABEL[e.type]}`).join(' · ') : 'Situazione di riferimento: seleziona un elemento e scegli «Simula guasto»'}</strong>
<span class="simbar-a">${scen.events.length ? '<button class="btn" type="button" data-action="simreset">Ripristina tutto</button>' : ''}<a class="btn ghost" href="${href('simula' + (qs ? '?' + qs : ''))}">Dettaglio e cause nel simulatore</a></span></div>
<p class="small">Calcolo sul modello del progetto: non è telemetria. ${q.hubQuorum === true ? badge('available', 'Quorum presente') : q.hubQuorum === null ? badge('unknown', 'Quorum incerto') : badge('blocked', 'Quorum assente')} ${q.min}${q.max > q.min ? `–${q.max}` : ''} voti su ${q.total}, ne servono ${q.need} · Servizi: ${counts.map(([k, n]) => `${st(k)} <strong>${n}</strong>`).join(' ')}</p>
${ch.length ? `<p class="small"><strong>Cambiano rispetto al riferimento (${ch.length}):</strong></p><div class="chips">${ch.slice(0, 24).map((e) => `<button type="button" class="chip" data-action="simsel" data-id="${esc(e.id)}">${st(simr.status(e.id).status)} ${esc(e.name)}</button>`).join('')}${ch.length > 24 ? `<span class="small muted">+ ${ch.length - 24} altri nel simulatore</span>` : ''}</div>` : scen.events.length ? '<p class="small">Nessun altro elemento cambia stato in questo scenario.</p>' : ''}
<details${scen.events.length ? '' : ' open'}><summary>Scenari tipici</summary><div class="chips" style="margin-bottom:10px">${core.scenarios.filter((x) => x.events.every((e) => ['fail', 'off', 'on'].includes(e.type))).map((x) => `<button type="button" class="chip" data-action="simpreset" data-id="${esc(x.id)}" title="${esc(x.text)}">${esc(x.title)}</button>`).join('')}</div></details></div>`;
      }

      function draw() {
        resim(); drawBar();
        if (state.mode === 'elenco') return drawList();
        if (state.mode === 'focus') return drawFocus();
        const { placed, rows, width, height } = layout(core, state.layers);
        const edges = edgesFor(core, idx, state.layers, placed);
        const up = state.sel ? walk(idx, state.sel, { dir: 'out', types: ['hosted_on', 'depends_on', 'stores_on', 'connected_to', 'member_of', 'powered_by', 'backs_up_to', 'replicates_to'], max: 8 }) : null;
        const down = state.sel ? walk(idx, state.sel, { dir: 'in', types: ['hosted_on', 'depends_on', 'stores_on', 'wakes', 'member_of'], max: 8 }) : null;
        const hot = (id) => !state.sel || id === state.sel || up.has(id) || down.has(id) || changed.has(id);
        view = view || { x: 0, y: 0, w: width, h: height };
        const nodeSvg = [...placed.values()].map(({ x, y, e }) => {
          const cls = ['node', e.id === state.sel ? 'sel' : '', hot(e.id) ? '' : 'dim', !simr && state.sel && up.has(e.id) ? 'up' : '', !simr && state.sel && down.has(e.id) ? 'down' : ''].join(' ') + simCls(e.id);
          // il nome accessibile comincia con il testo visibile; il nome completo segue solo se è stato accorciato
          const vn = e.name.length > 17 ? e.name.slice(0, 16) : e.name, sub = e.title || kind(e.kind), vs = sub.slice(0, 22);
          const cut = vn !== e.name || vs !== sub;
          return `<g class="${cls}" transform="translate(${x},${y})" tabindex="0" role="button" aria-pressed="${e.id === state.sel}" data-node="${esc(e.id)}" aria-label="${esc(`${vn} ${vs}${cut ? ` (${e.name}, ${sub})` : ''}${simTxt(e.id)}`)}"><rect width="${BW}" height="${BH}" rx="6"/><text x="10" y="20">${esc(vn)}${vn !== e.name ? '<tspan aria-hidden="true">…</tspan>' : ''}</text> <text class="sub" x="10" y="37">${esc(vs)}</text>${simr ? `<g class="glyph" transform="translate(${BW - 14},14)">${GLYPH[simr.status(e.id).status] || ''}</g>${evOf(e.id) ? `<path class="evx" d="M${BW - 34} 8l10 10M${BW - 24} 8l-10 10"/>` : ''}` : ''}</g>`;
        }).join('');
        const edgeSvg = edges.map(({ r, cls }) => {
          const a = placed.get(r.fromId), b = placed.get(r.toId);
          const x1 = a.x + BW / 2, y1 = a.y + (b.y > a.y ? BH : b.y < a.y ? 0 : BH / 2), x2 = b.x + BW / 2, y2 = b.y + (b.y > a.y ? 0 : b.y < a.y ? BH : BH / 2);
          const my = (y1 + y2) / 2;
          const d = a.y === b.y ? `M${x1},${y1 + BH / 2} C${x1},${y1 + BH} ${x2},${y2 + BH} ${x2},${y2 + BH / 2}` : `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`;
          return `<path class="edge ${cls} ${hot(r.fromId) && hot(r.toId) ? '' : 'dim'}" d="${d}"><title>${esc(idx.get(r.fromId)?.name)} ${esc(REL_LABEL[r.type]?.[0] || r.type)} ${esc(idx.get(r.toId)?.name)}${r.label ? ' — ' + esc(r.label) : ''}</title></path>`;
        }).join('');
        const bandSvg = rows.map((r) => (r.label ? `<text x="12" y="${r.y + 28}" class="sub" style="fill:var(--muted);font:600 12px var(--sans)">${esc(r.label)}</text>` : '')).join('');
        area.innerHTML = `<div class="mapwrap"><div class="mapctl"><button class="iconbtn" type="button" data-action="zoom" data-v="in" aria-label="Ingrandisci">+</button><button class="iconbtn" type="button" data-action="zoom" data-v="out" aria-label="Riduci">−</button><button class="iconbtn" type="button" data-action="zoom" data-v="fit" aria-label="Adatta alla vista">⤢</button><button class="iconbtn" type="button" data-action="zoom" data-v="reset" aria-label="Ripristina vista e selezione">↺</button></div><svg id="mapsvg" viewBox="${view.x} ${view.y} ${view.w} ${view.h}" style="height:auto;aspect-ratio:${width}/${height}" role="group" aria-label="Mappa: ${placed.size} elementi, ${edges.length} relazioni. Usa Tab per scorrere gli elementi e Invio per selezionare." >${bandSvg}${edgeSvg}${nodeSvg}</svg>
</div>
<p class="small muted">${placed.size} elementi · ${edges.length} relazioni nei livelli scelti. Trascina per spostare, rotella o pulsanti per lo zoom. Le relazioni tratteggiate viola non sono documentate: il vuoto è segnalato, non riempito.</p>`;
        bindPan(area.querySelector('#mapsvg'), { width, height });
        drawDetail();
      }
      function drawFocus() {
        const id = state.sel || 'M2';
        const e = idx.get(id);
        const rels = [...idx.out(id), ...idx.in(id)].filter((r) => r.type !== 'documented_by');
        const ns = [...new Map(rels.map((r) => { const o = r.fromId === id ? r.toId : r.fromId; return [o, r]; })).entries()].filter(([o]) => idx.get(o));
        const R = 150, cx = 200, cy = 190;
        const pts = ns.map(([o, r], i) => { const a = (i / ns.length) * Math.PI * 2 - Math.PI / 2; return { o, r, x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) }; });
        area.innerHTML = `<div class="mapwrap"><svg viewBox="0 0 400 380" role="group" aria-label="${esc(e.name)} e i suoi ${ns.length} vicini" style="height:auto;min-height:320px">${pts.map((p) => `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" class="edge ${p.r.evidenceKind === 'unknown' ? 'unknown' : p.r.type === 'connected_to' ? 'physical' : p.r.type === 'depends_on' ? 'dep' : 'logical'}"/>`).join('')}
${pts.map((p) => `<g class="node${simCls(p.o)}" transform="translate(${p.x - 40},${p.y - 15})" tabindex="0" role="button" data-node="${esc(p.o)}" aria-label="${esc(idx.get(p.o).name.slice(0, 11))}${idx.get(p.o).name.length > 11 ? ` (${esc(idx.get(p.o).name)})` : ''}${esc(simTxt(p.o))}"><rect width="80" height="30" rx="5"/><text x="6" y="19" style="font-size:11px">${esc(idx.get(p.o).name.slice(0, 11))}</text>${simr ? `<g class="glyph" transform="translate(72,8) scale(.75)">${GLYPH[simr.status(p.o).status] || ''}</g>` : ''}</g>`).join('')}
<g class="node sel${simCls(id)}" transform="translate(${cx - 55},${cy - 20})"><rect width="110" height="40" rx="6"/><text x="8" y="25">${esc(e.name.slice(0, 13))}</text></g></svg></div>
<p class="small muted">Vista centrata sull'elemento: tocca un vicino per spostarti. Per il quadro completo usa «Mappa» o «Elenco».</p>`;
        drawDetail();
      }
      function drawList() {
        const { placed } = layout(core, state.layers);
        const edges = edgesFor(core, idx, state.layers, placed);
        area.innerHTML = `<p>Le stesse relazioni della mappa, in tabella (${edges.length}).</p>${table(['Da', 'Relazione', 'A', 'Livello', 'Natura'], edges.map(({ r, layer }) => [`<a href="${href('e/' + r.fromId)}">${esc(idx.get(r.fromId)?.name)}</a>`, esc(REL_LABEL[r.type]?.[0] || r.type) + (r.label ? ` <span class="small muted">${esc(r.label)}</span>` : ''), `<a href="${href('e/' + r.toId)}">${esc(idx.get(r.toId)?.name)}</a>`, esc(LAYERS.find((l) => l.id === layer).label), esc(r.evidenceKind || '—')]), { caption: 'Relazioni della mappa' })}`;
        drawDetail();
      }
      function drawDetail() {
        if (!state.sel) { detail.innerHTML = `<div class="card"><h3>Nessuna selezione</h3><p class="small">${state.sim ? 'Seleziona un elemento e scegli «Simula guasto»: i colori e i segni mostrano fin dove arriva l\'effetto.' : 'Seleziona un elemento: vedrai da che cosa dipende (bordo blu) e che cosa dipende da lui (bordo arancio).'}</p></div>`; return; }
        const e = idx.get(state.sel);
        const up = walk(idx, e.id, { dir: 'out', types: ['hosted_on', 'depends_on', 'stores_on', 'connected_to', 'member_of', 'powered_by'], max: 8 }); const down = walk(idx, e.id, { dir: 'in', types: ['hosted_on', 'depends_on', 'stores_on', 'wakes'], max: 8 });
        detail.innerHTML = `<div class="card"><p class="eyebrow">${kind(e.kind)} · <span class="code">${esc(e.id)}</span></p><h3 style="margin-top:4px">${esc(e.name)}</h3><p class="small">${esc(e.oneLine)}</p>${dims(e.status, { compact: true })}
<p class="small"><strong>Dipende da</strong> (anche indirettamente): ${[...up.keys()].map((x) => esc(idx.get(x)?.name || x)).join(', ') || '—'}</p>
<p class="small"><strong>Ne dipendono</strong>: ${[...down.keys()].map((x) => esc(idx.get(x)?.name || x)).join(', ') || '—'}</p>
${state.sim ? (() => {
          const s = simr.status(e.id), cur = evOf(e.id), onDemand = e.power === 'on_demand' || e.power === 'manual', isNode = e.kind === 'node';
          const why = s.reasons.filter((r) => r.status && r.status !== 'available').slice(0, 4);
          const imp = e.kind === 'service' ? simr.impact(e.id) : [];
          const can = ['node', 'device', 'network', 'storage', 'service'].includes(e.kind);
          return `<div class="simpanel"><p><span class="simtag">Simulazione</span> ${st(s.status)}${changed.has(e.id) && !cur ? ' <span class="small muted">cambiato rispetto al riferimento</span>' : ''}</p>
${why.length ? `<ul class="small">${why.map((r) => `<li>${esc(r.text)}</li>`).join('')}</ul>` : ''}${imp.length ? `<ul class="small">${imp.slice(0, 4).map((i) => `<li>${esc(i.text)}</li>`).join('')}</ul>` : ''}
${can ? `<div class="actions simact">${cur ? `<button class="btn primary" type="button" data-action="simev" data-v="">Ripristina ${esc(e.name)}</button>` : ''}${cur !== 'fail' ? `<button class="btn${cur ? '' : ' primary'}" type="button" data-action="simev" data-v="fail">Simula guasto</button>` : ''}${isNode && !onDemand && cur !== 'off' ? '<button class="btn" type="button" data-action="simev" data-v="off">Spegni per manutenzione</button>' : ''}${isNode && onDemand && cur !== 'on' ? '<button class="btn" type="button" data-action="simev" data-v="on">Accendi</button>' : ''}</div>` : '<p class="small muted">Questo elemento cambia stato solo per effetto di altri: simula un guasto su una macchina, una rete o un archivio.</p>'}</div>`;
        })() : ''}
<div class="phead"><div class="actions"><a class="btn${state.sim ? '' : ' primary'}" href="${href('e/' + e.id)}">Apri la scheda</a>${state.sim ? '' : `<button class="btn" type="button" data-action="simstart">Simula un guasto qui</button>`}<button class="btn ghost" type="button" data-action="desel">Deseleziona</button></div></div></div>`;
      }
      function select(id) { state.sel = id; sync(); draw(); }
      function bindPan(svg, { width, height }) {
        let drag = null;
        const setVB = () => svg.setAttribute('viewBox', `${view.x} ${view.y} ${view.w} ${view.h}`);
        svg.addEventListener('pointerdown', (ev) => { if (ev.target.closest('[data-node]')) return; drag = { x: ev.clientX, y: ev.clientY, vx: view.x, vy: view.y }; svg.setPointerCapture(ev.pointerId); });
        svg.addEventListener('pointermove', (ev) => { if (!drag) return; const k = view.w / svg.clientWidth; view.x = drag.vx - (ev.clientX - drag.x) * k; view.y = drag.vy - (ev.clientY - drag.y) * k; setVB(); });
        svg.addEventListener('pointerup', () => { drag = null; });
        svg.addEventListener('wheel', (ev) => { ev.preventDefault(); zoom(ev.deltaY < 0 ? 0.85 : 1.18); }, { passive: false });
        app.on('zoom', (el) => {
          const v = el.dataset.v;
          if (v === 'in') zoom(0.8); else if (v === 'out') zoom(1.25);
          else if (v === 'fit') { view = { x: 0, y: 0, w: width, h: height }; setVB(); }
          else { view = null; state.sel = null; sync(); draw(); }
        });
        function zoom(f) { const cx = view.x + view.w / 2, cy = view.y + view.h / 2; view.w *= f; view.h *= f; view.x = cx - view.w / 2; view.y = cy - view.h / 2; setVB(); }
      }
      area.addEventListener('click', (ev) => { const g = ev.target.closest('[data-node]'); if (g) select(g.dataset.node); });
      area.addEventListener('keydown', (ev) => { const g = ev.target.closest('[data-node]'); if (g && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); select(g.dataset.node); setTimeout(() => area.querySelector(`[data-node="${CSS.escape(g.dataset.node)}"]`)?.focus(), 0); } });
      app.on('layer', (el) => { const id = el.dataset.id; state.layers = state.layers.includes(id) ? state.layers.filter((x) => x !== id) : [...state.layers, id]; el.setAttribute('aria-pressed', state.layers.includes(id)); view = null; sync(); draw(); });
      app.on('mode', (el) => { state.mode = el.dataset.v; root.querySelectorAll('[data-action=mode]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === state.mode)); if (state.mode === 'focus' && !state.sel) state.sel = 'M2'; sync(); draw(); });
      app.on('desel', () => { state.sel = null; sync(); draw(); });
      const refocus = (sel) => setTimeout(() => (root.querySelector(sel) || detail.querySelector('button,a'))?.focus(), 0);
      const setSim = (on) => { state.sim = on; if (on && !state.layers.includes('hosting')) { state.layers.push('hosting'); root.querySelector('[data-action=layer][data-id=hosting]')?.setAttribute('aria-pressed', 'true'); view = null; } if (!on) scen = { events: [] }; const b = root.querySelector('[data-action=simtoggle]'); b.setAttribute('aria-pressed', on); b.classList.toggle('primary', on); };
      app.on('simtoggle', () => { setSim(!state.sim); sync(); draw(); app.toast(state.sim ? 'Simulazione attiva: seleziona un elemento e scegli che cosa succede' : 'Simulazione chiusa: la mappa mostra di nuovo solo il progetto'); refocus('[data-action=simtoggle]'); });
      app.on('simstart', () => { setSim(true); scen = { events: [{ type: 'fail', id: state.sel }] }; sync(); draw(); refocus('[data-action=simev]'); });
      app.on('simev', (el) => { const id = state.sel; scen = { events: scen.events.filter((x) => x.id !== id).concat(el.dataset.v ? [{ type: el.dataset.v, id }] : []) }; sync(); draw(); refocus('[data-action=simev]'); });
      app.on('simreset', () => { scen = { events: [] }; sync(); draw(); app.toast('Situazione di riferimento'); refocus('[data-action=simtoggle]'); });
      app.on('simpreset', (el) => { const p = core.scenarios.find((x) => x.id === el.dataset.id); scen = { events: structuredClone(p.events) }; sync(); draw(); app.toast(p.title); refocus(`[data-action=simpreset][data-id="${CSS.escape(p.id)}"]`); });
      app.on('simsel', (el) => { const id = el.dataset.id; if (state.mode === 'mappa') { const { placed } = layout(core, state.layers); if (!placed.has(id)) { const need = { service: 'hosting', dataset: 'dati', storage: 'dati', copy: 'copie' }[idx.get(id).kind]; if (need && !state.layers.includes(need)) { state.layers.push(need); root.querySelector(`[data-action=layer][data-id=${need}]`)?.setAttribute('aria-pressed', 'true'); view = null; } } } select(id); });
      app.on('mapfind', (el) => { const v = el.value.trim(); const hit = idx.get(v) ? v : core.entities.find((e) => e.name.toLowerCase().includes(v.toLowerCase()))?.id; if (hit) { if (state.mode === 'mappa') { const { placed } = layout(core, state.layers); if (!placed.has(hit)) { const k = idx.get(hit).kind; const need = { service: 'hosting', dataset: 'dati', storage: 'dati', copy: 'copie' }[k]; if (need && !state.layers.includes(need)) state.layers.push(need); } } select(hit); } else app.toast('Nessun elemento con questo nome'); });
      app.on('share', () => { navigator.clipboard?.writeText(location.href).then(() => app.toast('Collegamento copiato: riapre questa vista pubblica'), () => app.toast(location.href)); });
      draw();
    },
  };
}
