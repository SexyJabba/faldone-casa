// Postazioni e client: gli apparati fuori dal rack, disegnati per modello e raggruppati per luogo.
// Solo dati già pubblici del Faldone; la posizione nelle stanze sta nella planimetria riservata.
import { esc, href, phead, ctxbar, icon } from '../ui.js';
import { deviceSvg, deviceInterior, deviceKind, hasCutaway, CUTAWAY_SOURCE, KIND_LABEL } from '../lib/deviceviz.js';
import { powerOf } from '../lib/rack.js';
import { bindStage } from './rack.js';

const POWER_TXT = { on: 'sempre accesa', stby: 'accesa quando serve', off: 'accensione non indicata' };
const fact = (f) => (f && f.value !== null && f.value !== undefined ? String(f.value) : null);

/** Gli apparati da mostrare: macchine con un luogo in casa, in laboratorio, sul Vito o presso gli amici, più i piccoli della sala server. */
export function clientNodes(core) {
  return core.entities.filter((e) => e.kind === 'node' && e.place && e.place !== 'P-CLOUD' && (e.place !== 'P-SALA' || deviceKind(e)));
}

export function clients(app) {
  const { core, idx } = app;
  const nodes = clientNodes(core);
  const places = [...new Set(nodes.map((e) => e.place))].map((p) => idx.get(p)).filter(Boolean);
  let sel = nodes.some((e) => e.id === app.query.u) ? app.query.u : '';
  let open = app.query.open === '1' && !!sel && hasCutaway(deviceKind(idx.get(sel)));
  const facts = (e) => ({ cpu: fact(e.hardware?.cpu), ram: [fact(e.hardware?.ram) && `${fact(e.hardware.ram)} GB`, fact(e.hardware?.ramType)].filter(Boolean).join(' · ') || null, disk: fact(e.hardware?.disks) });
  const item = (e) => `<button type="button" class="dev-item" data-action="dev-sel" data-id="${esc(e.id)}" aria-pressed="${e.id === sel}">${deviceSvg({ id: e.id, sub: e.title || e.name, kind: deviceKind(e), power: powerOf(e) }, { prefix: 'dv-' + e.id.toLowerCase().replace(/[^a-z0-9]/g, ''), w: 172 })}<span class="vh">${esc(e.name)}, ${esc(e.title || '')}, ${esc(KIND_LABEL[deviceKind(e)])}, ${esc(POWER_TXT[powerOf(e)])}</span></button>`;
  const stage = () => {
    if (open) { const e = idx.get(sel), cut = deviceInterior(deviceKind(e), e.name, facts(e)); return { html: `<div class="rack-inner open">${cut.svg}</div>`, cut }; }
    return { html: `<div class="dev-rooms">${places.map((p) => `<section class="dev-room" aria-label="${esc(p.name)}"><h2 class="dev-h">${esc(p.name)}</h2><div class="dev-row">${nodes.filter((e) => e.place === p.id).map(item).join('')}</div></section>`).join('')}</div>` };
  };
  const panel = (st) => {
    const e = sel && idx.get(sel);
    if (!e) return `<div class="card"><h2 class="h3">Postazioni e client</h2><p class="small">${nodes.length} apparati in ${places.length} luoghi. Tocca un apparato per vedere che cosa fa; dei modelli di cui il Faldone ha una foto dell'interno puoi aprire lo spaccato.</p>
<ul class="list rack-list">${nodes.map((x) => `<li><button type="button" class="rack-pick" data-action="dev-sel" data-id="${esc(x.id)}"><span class="code">${esc(x.id)}</span><span>${esc(x.title || x.name)}</span><span class="small muted">${esc(idx.get(x.place)?.name || '')}</span></button></li>`).join('')}</ul></div>`;
    const kind = deviceKind(e), hosted = idx.in(e.id, 'hosted_on').map((r) => idx.get(r.fromId)).filter(Boolean), conn = idx.out(e.id, 'connected_to');
    if (open) return `<div class="card"><p class="eyebrow">Spaccato · <span class="code">${esc(e.id)}</span></p><h2 class="h3" id="dev-sel" tabindex="-1">${esc(fact(e.hardware?.platform) || e.name)}</h2>
<ol class="rack-parts">${st.cut.marks.map((m) => `<li><span class="ri-n" aria-hidden="true">${m.n}</span><span>${esc(m.part.label)}<br><span class="small muted">${esc(m.part.sub || '')}</span></span></li>`).join('')}</ol>
<p class="small muted">Ricostruito dalla foto di riferimento del modello (<a href="${href('inventario/' + CUTAWAY_SOURCE[kind])}">${esc(CUTAWAY_SOURCE[kind])}</a>, foto di repertorio: non è questo esemplare). Processore e memoria sono quelli dichiarati nel Faldone; ciò che non è censito è scritto come tale.</p>
<div class="phead"><div class="actions"><button class="btn primary" type="button" data-action="dev-close">${icon('arrow')} Torna alle postazioni</button><a class="btn" href="${href('e/' + e.id)}">Scheda</a></div></div></div>`;
    return `<div class="card"><p class="eyebrow">${esc(KIND_LABEL[kind])} · <span class="code">${esc(e.id)}</span></p><h2 class="h3" id="dev-sel" tabindex="-1">${esc(e.name)} · ${esc(e.title || '')}</h2>
<p class="small">${esc(e.oneLine || '')}</p>
<dl class="kv"><dt>Luogo</dt><dd><a href="${href('e/' + e.place)}">${esc(idx.get(e.place)?.name || '')}</a></dd><dt>Accensione</dt><dd>${esc(POWER_TXT[powerOf(e)])}</dd>${fact(e.hardware?.platform) ? `<dt>Modello</dt><dd>${esc(fact(e.hardware.platform))}</dd>` : ''}${facts(e).cpu ? `<dt>Processore</dt><dd>${esc(facts(e).cpu)}</dd>` : ''}${facts(e).ram ? `<dt>Memoria</dt><dd>${esc(facts(e).ram)}</dd>` : ''}</dl>
${hosted.length ? `<h3>Che cosa gira qui</h3><div class="chips">${hosted.map((h) => `<a class="chip" href="${href('e/' + h.id)}">${esc(h.name)}</a>`).join('')}</div>` : ''}
${conn.length ? `<h3>Che cosa è collegato</h3><ul class="small rack-links">${conn.map((r) => `<li><a href="${href('e/' + r.toId)}">${esc(idx.get(r.toId)?.name)}</a>${r.label ? ' · ' + esc(r.label) : ''}</li>`).join('')}</ul>` : ''}
<div class="actions rack-act">${hasCutaway(kind) ? '<button class="btn primary" type="button" data-action="dev-open">Apri lo spaccato</button>' : ''}<a class="btn" href="${href('e/' + e.id)}">Scheda</a><a class="btn ghost" href="${href(`mappa?sim=1&f=${e.id}&s=${e.id}`)}">Simula un guasto</a></div>
${hasCutaway(kind) ? '' : `<p class="small muted">Di questo modello il Faldone non ha una foto dell'interno: niente spaccato, per non disegnare a memoria.${kind ? '' : ' Anche l\'esterno è un segnaposto: il modello non è riconosciuto.'}</p>`}
<p><button class="btn ghost" type="button" data-action="dev-sel" data-id="">Deseleziona</button></p></div>`;
  };
  const s0 = stage();
  const html = `${ctxbar([['Esplora', 'esplora'], ['Postazioni e client']])}${phead({ eyebrow: 'Casa, laboratorio, Vito, amici', title: 'Postazioni e client', lead: 'Gli apparati fuori dal rack: le postazioni nelle stanze, il laboratorio, il Vito, i client degli amici. Ognuno disegnato secondo il modello dichiarato.' })}
<div class="pagecols mapcols rack-cols"><div><div class="rack-stage dev-stage" id="dev-stage" tabindex="0" role="region" aria-label="Postazioni e client, disegno">${s0.html}</div>
<p class="small muted">Disegni indicativi dei modelli dichiarati nel Faldone, non fotografie degli esemplari. Le spie seguono l'accensione di progetto, non lo stato reale. Dove stanno in casa è nella <a href="${href('impianti/planimetria')}">planimetria</a> ${icon('lock')}.</p></div>
<aside class="aside" id="dev-panel" aria-label="Apparato selezionato" aria-live="polite">${panel(s0)}</aside></div>
<p><a class="btn" href="${href('esplora/rack')}">Il rack della sala server ${icon('arrow')}</a></p>`;
  return {
    title: 'Postazioni e client', html, keepScroll: !!sel,
    mount: (root) => {
      const st = root.querySelector('#dev-stage'), pan = root.querySelector('#dev-panel');
      bindStage(st);
      const redraw = (focus) => {
        app.setQuery({ u: sel, open: open ? '1' : '' });
        const s = stage(); st.innerHTML = s.html; pan.innerHTML = panel(s); st.classList.toggle('is-open', open);
        if (focus === 'panel') pan.querySelector('#dev-sel')?.focus({ preventScroll: true });
        else if (focus) st.querySelector(`[data-action=dev-sel][data-id="${CSS.escape(focus)}"]`)?.focus({ preventScroll: true });
      };
      app.on('dev-sel', (el) => { const id = el.dataset.id, was = sel, fromStage = !!el.closest('#dev-stage'); sel = id && id !== sel ? id : fromStage || !id ? '' : id; open = false; redraw(fromStage ? id : sel ? 'panel' : was); });
      app.on('dev-open', () => { open = true; redraw('panel'); });
      app.on('dev-close', () => { open = false; redraw(sel); });
      st.classList.toggle('is-open', open);
    },
  };
}
