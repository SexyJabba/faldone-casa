// Rack e porte: il rack disegnato, da esplorare. Pubblico: mostra l'ordine funzionale della revisione 4.4 e ciò che
// il Faldone già dice di ogni macchina. Misure della nicchia, case e prove di montaggio stanno nell'area riservata.
import { esc, href, phead, ctxbar, icon } from '../ui.js';
import { rackSvg, interiorSvg } from '../lib/rackviz.js';
import { describeSlots, partsFor, powerOf } from '../lib/rack.js';
import { rackTables } from './explore.js';

const POWER_TXT = { on: 'sempre accesa', stby: 'accesa a richiesta', off: 'accensione non indicata' };
const CAT_TXT = { mobo: 'Scheda madre', cpu: 'Processore', ram: 'Memoria', gpu: 'Scheda video', nic: 'Scheda di rete', pcie: 'Scheda PCIe', npu: 'Acceleratore', nvme: 'Unità NVMe', ssd: 'SSD', hdd: 'Dischi', psu: 'Alimentatore', case: 'Case' };

/** Cornice scura comune al rack pubblico e al compositore: inclinazione leggera che segue il puntatore. */
export function bindStage(stage) {
  if (!stage || !window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  stage.addEventListener('pointermove', (e) => { const r = stage.getBoundingClientRect(); stage.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 5}deg`); stage.style.setProperty('--rx', `${(0.5 - (e.clientY - r.top) / r.height) * 3}deg`); });
  stage.addEventListener('pointerleave', () => { stage.style.setProperty('--ry', '0deg'); stage.style.setProperty('--rx', '0deg'); });
}

export async function rack(app) {
  const { core, idx } = app;
  const inv = await app.inventory().catch(() => ({ items: [] }));
  const byCode = new Map(inv.items.map((i) => [i.code, i]));
  const usedBy = new Map();
  for (const e of core.entities) if (e.kind === 'node') for (const c of e.inventory || []) usedBy.set(c, [...(usedBy.get(c) || []), e.id]);
  const pieces = describeSlots(core.rack, idx.get, { invCat: (c) => byCode.get(c)?.category, relations: core.relations });
  const tables = rackTables(app);
  let sel = pieces.some((p) => p.id === app.query.u) ? app.query.u : '';
  let open = app.query.open === '1' && !!sel;
  let which = idx.get(app.query.e) ? app.query.e : '';

  const entsOf = (p) => (p.entities || []).map(idx.get).filter(Boolean);
  const canOpen = (e) => e && e.kind === 'node';
  const stageHtml = () => {
    if (open) {
      const e = idx.get(which) || entsOf(pieces.find((p) => p.id === sel))[0];
      const parts = partsFor(e, inv.items, usedBy);
      const links = [...idx.out(e.id, 'connected_to').map((r) => ({ kind: 'net', label: r.label || idx.get(r.toId)?.name })), ...idx.out(e.id, 'powered_by').map((r) => ({ kind: 'power', label: idx.get(r.toId)?.name }))];
      const { svg, marks } = interiorSvg(e.name, parts, links);
      return { html: `<div class="rack-inner open">${svg}</div>`, e, parts, marks };
    }
    return { html: `<div class="rack-inner">${rackSvg(core.rack.columns, pieces, { sel, label: `Rack: ${pieces.length} pezzi in due montanti. Tab per scorrere, Invio per selezionare.` })}</div>` };
  };
  const panel = (st) => {
    const p = pieces.find((x) => x.id === sel);
    if (!p) return `<div class="card"><h2 class="h3">Esplora il rack</h2><p class="small">Tocca un pezzo per vedere che cosa è e che cosa fa. Delle macchine puoi aprire il case e guardare le parti registrate in inventario.</p>
<ul class="list rack-list">${pieces.slice().sort((a, b) => a.col.localeCompare(b.col) || b.from - a.from).map((x) => `<li><button type="button" class="rack-pick" data-action="rack-sel" data-id="${esc(x.id)}"><span class="code">${esc(x.id)}</span><span>${esc(x.sub || x.title)}</span><span class="small muted">${x.u}U</span></button></li>`).join('')}</ul></div>`;
    const ents = entsOf(p);
    if (open) {
      const e = st.e, n = (part) => st.marks.find((m) => m.part === part)?.n;
      const hosted = idx.in(e.id, 'hosted_on').map((r) => idx.get(r.fromId)).filter(Boolean);
      return `<div class="card"><p class="eyebrow">Dentro il case · <span class="code">${esc(e.id)}</span></p><h2 class="h3" id="rack-sel" tabindex="-1">${esc(e.name)} · ${esc(e.title || '')}</h2>
<p class="small">${esc(e.hardware?.role?.value || e.oneLine || '')}</p>
${st.parts.length ? `<ol class="rack-parts">${st.parts.map((part) => `<li><span class="ri-n" aria-hidden="true">${n(part) || '·'}</span><span><a href="${esc(part.href)}">${esc(part.label)}</a><br><span class="small muted">${esc(CAT_TXT[part.cat] || part.cat)} · ${part.shared ? `quantità in inventario ${esc(part.qty)}, condivisa con altre macchine` : `quantità ${esc(part.qty)}`}</span></span></li>`).join('')}</ol>` : '<p class="small muted">Nessuna parte di questa macchina è registrata in inventario: il disegno mostra solo il telaio.</p>'}
<p class="small muted">Si vedono solo le parti registrate in inventario; alimentatore tratteggiato se non indicato. La disposizione interna è schematica.</p>
${hosted.length ? `<h3>Che cosa gira qui</h3><div class="chips">${hosted.map((h) => `<a class="chip" href="${href('e/' + h.id)}">${esc(h.name)}</a>`).join('')}</div>` : ''}
${st.e && (idx.out(e.id, 'connected_to').length || idx.out(e.id, 'powered_by').length) ? `<h3>Che cosa è collegato</h3><ul class="small rack-links">${idx.out(e.id, 'connected_to').map((r) => `<li><a href="${href('e/' + r.toId)}">${esc(idx.get(r.toId)?.name)}</a>${r.label ? ' · ' + esc(r.label) : ''}</li>`).join('')}${idx.out(e.id, 'powered_by').map((r) => `<li>alimentata da <a href="${href('e/' + r.toId)}">${esc(idx.get(r.toId)?.name)}</a></li>`).join('')}</ul>` : ''}
<div class="phead"><div class="actions"><button class="btn primary" type="button" data-action="rack-close">${icon('arrow')} Torna al rack</button><a class="btn" href="${href('e/' + e.id)}">Scheda</a></div></div></div>`;
    }
    return `<div class="card"><p class="eyebrow">${esc(core.rack.columns.find((c) => c.id === p.col).name)} · unità ${p.from}–${p.from + p.u - 1}</p><h2 class="h3" id="rack-sel" tabindex="-1">${esc(p.title)}</h2>
${ents.map((e) => `<div class="rack-ent"><p><a href="${href('e/' + e.id)}"><strong>${esc(e.name)}</strong></a> · ${esc(e.title || '')}<br><span class="small muted">${esc(POWER_TXT[powerOf(e)])}${e.vote ? ' · vota nel nucleo' : ''}</span></p><p class="small">${esc(e.oneLine || '')}</p>
<div class="actions rack-act">${canOpen(e) ? `<button class="btn primary" type="button" data-action="rack-open" data-id="${esc(e.id)}">Apri il case</button>` : ''}<a class="btn" href="${href('e/' + e.id)}">Scheda</a><a class="btn ghost" href="${href(`mappa?sim=1&f=${e.id}&s=${e.id}`)}">Simula un guasto</a></div></div>`).join('') || '<p class="small muted">Spazio lasciato libero nello schema: nessun apparato assegnato.</p>'}
<p><button class="btn ghost" type="button" data-action="rack-sel" data-id="">Deseleziona</button></p></div>`;
  };
  const st0 = stageHtml();
  const html = `${ctxbar([['Esplora', 'esplora'], ['Rack e porte']])}${phead({ eyebrow: 'Sala server', title: 'Rack e porte', lead: 'Il rack com\'è pensato nella revisione 4.4: due montanti, le macchine in ordine di funzione. Tocca un pezzo, apri un case, guarda che cosa c\'è dentro e a che cosa è collegato.' })}
<div class="pagecols mapcols rack-cols"><div><div class="rack-stage" id="rack-stage" tabindex="0" role="region" aria-label="Rack, disegno">${st0.html}</div>
<p class="small muted">${esc(core.rack.note)} Fonte: <a href="${href('REV4-RACK')}">REV4-RACK</a>. Le spie seguono il progetto (accese le macchine sempre attive, ambra quelle a richiesta): non sono lo stato reale, nessun monitoraggio è collegato.</p></div>
<aside class="aside" id="rack-panel" aria-label="Dettaglio del pezzo" aria-live="polite">${panel(st0)}</aside></div>
<div class="callout"><strong>Misure, case e prove di montaggio</strong>La nicchia, i case veri e il compositore per spostare i pezzi e valutare come montare tutto sono nell'area riservata. <a href="${href('impianti/planimetria?v=sala')}">Apri il compositore</a> ${icon('lock')}</div>
<p><a class="btn" href="${href('esplora/postazioni')}">Postazioni e client fuori dal rack ${icon('arrow')}</a></p>
${tables.html}`;
  return {
    title: 'Rack e porte', html, keepScroll: !!sel,
    mount: (root) => {
      tables.mount?.(root);
      const stage = root.querySelector('#rack-stage'), pan = root.querySelector('#rack-panel');
      bindStage(stage);
      const redraw = (focus) => {
        app.setQuery({ u: sel, open: open ? '1' : '', e: open ? which : '' });
        const st = stageHtml();
        stage.innerHTML = st.html; pan.innerHTML = panel(st);
        stage.classList.toggle('is-open', open);
        if (focus === 'panel') pan.querySelector('#rack-sel')?.focus({ preventScroll: true });
        else if (focus === 'unit') stage.querySelector(`[data-unit="${CSS.escape(sel)}"] .rk-hit`)?.focus({ preventScroll: true });
      };
      const pick = (id, focus = 'unit') => { sel = id === sel ? '' : id; open = false; which = ''; redraw(focus); };
      stage.addEventListener('click', (e) => { const u = e.target.closest('[data-unit]'); if (u) pick(u.dataset.unit); });
      stage.addEventListener('keydown', (e) => { const u = e.target.closest('[data-unit]'); if (u && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(u.dataset.unit); } });
      app.on('rack-sel', (el) => { const id = el.dataset.id; if (!id) { const was = sel; sel = ''; open = false; redraw(); stage.querySelector(`[data-unit="${CSS.escape(was)}"] .rk-hit`)?.focus({ preventScroll: true }); return; } sel = id; open = false; redraw('panel'); });
      app.on('rack-open', (el) => { which = el.dataset.id; open = true; redraw('panel'); });
      app.on('rack-close', () => { open = false; which = ''; redraw('unit'); });
      stage.classList.toggle('is-open', open);
    },
  };
}
