// Impianti di casa: sezione documentale fuori dalla baseline approvata, ogni impianto con il proprio stato.
import { badge, esc, href, phead, ctxbar, table, icon } from '../ui.js';
import { floorPlan } from '../lib/viz.js';
import { mergeImpianto } from '../lib/vault.js';
import { lockForm, bindLock } from './vault.js';

const itn = (n, d = 2) => Number(n).toLocaleString('it-IT', { minimumFractionDigits: d, maximumFractionDigits: d });

const stateTag = (st) => (st.decision === 'ipotesi' ? badge('unknown', st.label) : badge('on_demand', st.label));

export async function impianti(app) {
  const d = await app.load('impianti', 'data/impianti.json');
  const done = d.impianti.filter((i) => i.components || i.riservato);
  const html = `${ctxbar([['Esplora', 'esplora'], ['Impianti di casa']])}${phead({ eyebrow: 'Casa e ambienti', title: 'Impianti di casa', lead: 'Gli impianti che la domotica dovrà governare. Sono documentati qui man mano, ciascuno con il proprio stato: non fanno parte del progetto approvato 4.4.' })}
<p class="small muted">${done.length} di ${d.impianti.length} compilati.</p>
<div class="grid">${d.impianti.map((i) => `<a class="tile" href="${href('impianti/' + i.id)}"><span class="t">${esc(i.title)}${i.riservato ? ` <span class="lockmark" title="Area riservata">${icon('lock')}<span class="vh">area riservata</span></span>` : ''}</span><p>${esc(i.summary)}</p><span class="meta">${stateTag(i.status)}</span></a>`).join('')}</div>`;
  return { title: 'Impianti di casa', html };
}

export async function impianto(app, [id]) {
  const d = await app.load('impianti', 'data/impianti.json');
  let i = d.impianti.find((x) => x.id === id);
  if (i?.riservato) {
    const data = await app.vault.ready();
    if (!data) {
      const html = `${ctxbar([['Esplora', 'esplora'], ['Impianti di casa', 'impianti'], [i.short]])}${phead({ eyebrow: 'Impianto · area riservata', title: i.title, lead: esc(i.summary) })}${lockForm(app, { title: 'Sezione riservata', text: `«${i.title}» contiene dati sensibili della casa: si legge solo con la password dell'area riservata.` })}`;
      return { title: i.title, html, mount: () => bindLock(app, () => app.go(app.route + (location.hash.includes('?') ? '?' + location.hash.split('?')[1] : ''), { replace: true })) };
    }
    i = mergeImpianto(i, data);
  }
  if (!i) return { title: 'Impianto', html: `${phead({ title: 'Impianto non trovato' })}<p><a href="${href('impianti')}">Tutti gli impianti</a></p>` };
  const { idx } = app;
  const ent = (ids = []) => ids.filter((e) => idx.get(e)).map((e) => `<a class="chip" href="${href('e/' + e)}">${esc(idx.get(e).name)}</a>`).join('');
  const cards = (cs = []) => cs.map((c) => `<a class="code" href="${href(c)}">${esc(c)}</a>`).join(' · ');
  const crumbs = ctxbar([['Esplora', 'esplora'], ['Impianti di casa', 'impianti'], [i.short]]);
  if (i.plan) {
    const v = app.query.v === 'sala' && i.sala ? 'sala' : 'pianta';
    const tabs = i.sala ? `<div class="seg plan-tabs" role="group" aria-label="Vista"><a class="segb" href="${href('impianti/' + i.id)}" ${v === 'pianta' ? 'aria-current="page"' : ''}>Pianta del piano</a><a class="segb" href="${href('impianti/' + i.id + '?v=sala')}" ${v === 'sala' ? 'aria-current="page"' : ''}>Sala server · compositore</a></div>` : '';
    if (v === 'sala') return import('./sala.js').then((m) => m.salaView(app, i, crumbs, tabs));
    return planView(app, i, crumbs, tabs);
  }
  if (!i.components) {
    const r = i.related || {};
    const html = `${crumbs}${phead({ eyebrow: 'Impianto', title: i.title, lead: esc(i.summary), extra: `<p>${stateTag(i.status)}</p>` })}
<div class="empty">Questo impianto non è ancora compilato.</div>
<h2>Che cosa documentare</h2><ul><li>Obiettivo e luoghi coinvolti, sulla planimetria</li><li>Componenti con il loro stato: posseduto, da acquistare, da realizzare</li><li>Flussi o circuiti, anche per stagione</li><li>Sensori e comandi da collegare a Home Assistant</li><li>Automazioni previste e sicurezze</li><li>Domande aperte e fonti</li></ul>
<p class="small muted">Esempio compilato: <a href="${href('impianti/vmc')}">Ventilazione meccanica controllata</a>.</p>
${(r.entities?.length || r.cards?.length) ? `<h2>Che cosa c'è già nel Faldone</h2>${r.entities?.length ? `<div class="chips">${ent(r.entities)}</div>` : ''}${r.cards?.length ? `<p class="small">Schede: ${cards(r.cards)}</p>` : ''}` : ''}`;
    return { title: i.title, html };
  }
  const st = i.status;
  const qs = (i.questions || []).map((q) => idx.issues.get(q)).filter(Boolean);
  const html = `${crumbs}<div class="pagecols"><div>${phead({ eyebrow: 'Impianto', title: i.title, lead: esc(i.summary), extra: `<p>${stateTag(st)}</p>` })}
<div class="callout"><strong>Stato</strong>${esc(st.note)} Fonte: ${esc(st.source)}.</div>
<p><strong>Obiettivo.</strong> ${esc(i.goal)}</p>
<h2>Dove si trova</h2>${table(['Luogo', 'Funzione'], i.places.map((p) => [esc(p.label), esc(p.role)]), { caption: 'Luoghi della VMC' })}
<h2>Come scorre l'aria</h2>${i.modes.map((m) => `<section class="card" style="margin-bottom:12px"><h3 style="margin-top:0">${esc(m.label)}</h3><ol class="pv-flow imp-flow">${m.flow.map((f) => `<li><div class="pv-card"><strong>${esc(f)}</strong></div></li>`).join('')}</ol><p class="small muted">${esc(m.note)}</p></section>`).join('')}
<h2>Componenti</h2>${table(['Componente', 'Funzione', 'Realizzazione', 'Stato'], i.components.map((c) => [esc(c.name), esc(c.role), esc(c.build || '—'), esc(c.state)]), { caption: 'Componenti della VMC' })}
<h2>Sensori e comandi per Home Assistant</h2>${table(['Dove', 'Misura', 'Nota'], i.sensors.map((s) => [esc(s.where), esc(s.what), s.suggested ? `<span class="small">Consigliato: ${esc(s.suggested)}</span>` : '—']), { caption: 'Sensori' })}
<p><strong>Comandi:</strong> ${i.actuators.map(esc).join('; ')}.</p>
<h2>Automazioni previste</h2><ul>${i.automations.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
<h2>Attenzioni di progetto</h2>${i.cautions.map((c) => `<div class="limit">${esc(c)}</div>`).join('')}
</div><aside class="aside" aria-label="Contesto">
<div class="card"><h3>Da chiarire</h3><ul class="list">${qs.map((q) => `<li><a href="${href('contribuisci/' + q.id)}">${esc(q.title.replace(/^VMC: /, ''))}</a></li>`).join('') || '<li class="muted">Nessuna domanda aperta.</li>'}</ul></div>
<div class="card"><h3>Collegamenti nel Faldone</h3><div class="chips">${ent(i.links.entities)}</div><p class="small">Schede: ${cards(i.links.cards)}</p><p class="small"><a href="${href('realizza/decisioni/DEC-VMC')}">Registro delle decisioni: DEC-VMC</a></p></div>
<div class="card"><h3>Altri impianti</h3><ul class="list">${d.impianti.filter((x) => x.id !== i.id).map((x) => `<li><a href="${href('impianti/' + x.id)}">${esc(x.title)}</a> <span class="small muted">${esc(x.status.label)}</span></li>`).join('')}</ul></div>
</aside></div>`;
  return { title: i.title, html };
}

// Planimetria: schema cliccabile delle stanze, con gli apparati del modello collocati nel loro luogo.
function planView(app, i, crumbs, tabs = '') {
  const { core, idx } = app;
  const plan = i.plan, st = i.status;
  const inRoom = (r) => (r.place ? core.entities.filter((e) => e.place === r.place && e.kind !== 'place') : []);
  const total = plan.rooms.reduce((a, r) => a + r.area, 0);
  let sel = plan.rooms.some((r) => r.id === app.query.r) ? app.query.r : '';
  const detail = () => {
    const r = plan.rooms.find((x) => x.id === sel);
    if (!r) return `<div class="card"><h2 class="h3">Nessuna stanza selezionata</h2><p class="small">Tocca una stanza nello schema o nella tabella: vedrai superficie, altezze e gli apparati del Faldone che si trovano lì.</p><p class="small muted">Il numero nel cerchio indica quanti apparati del modello sono collocati nella stanza.</p></div>`;
    const dev = inRoom(r), pl = r.place && idx.get(r.place);
    return `<div class="card"><p class="eyebrow">Stanza</p><h2 class="h3" style="margin-top:4px" id="fp-sel" tabindex="-1">${esc(r.name)}</h2>
<dl class="kv"><dt>Superficie</dt><dd>${itn(r.area)} m²</dd><dt>Altezza</dt><dd>da ${itn(r.hmin)} a ${itn(r.hmax)} m</dd><dt>Ingombro</dt><dd>${itn(r.w)} × ${itn(r.d)} m <span class="small muted">(rettangolo dello schema)</span></dd></dl>
${pl ? `<p class="small">${esc(pl.oneLine || '')}</p>` : ''}
${dev.length ? `<p class="small"><strong>Apparati del Faldone qui (${dev.length})</strong></p><div class="chips">${dev.map((e) => `<a class="chip" href="${href('e/' + e.id)}"><span class="code">${esc(e.id)}</span>${e.title ? ' ' + esc(e.title) : ''}</a>`).join('')}</div>` : `<p class="small muted">${r.place ? 'Nessun apparato del modello collocato qui.' : 'Stanza non ancora collegata a un luogo del modello: gli apparati non sono collocati.'}</p>`}
<div class="phead"><div class="actions">${pl ? `<a class="btn primary" href="${href('e/' + pl.id)}">Scheda del luogo</a>` : ''}${r.impianto ? `<a class="btn primary" href="${href('impianti/' + r.impianto)}">Impianto VMC</a>` : ''}${r.id === 'sala-server' && i.sala ? `<a class="btn" href="${href('impianti/' + i.id + '?v=sala')}">Compositore del rack</a>` : ''}${dev.length ? `<a class="btn" href="${href('mappa?s=' + dev[0].id)}">Vedi sulla mappa</a>` : ''}<button class="btn ghost" type="button" data-action="fp-clear">Deseleziona</button></div></div></div>`;
  };
  const html = `${crumbs}${tabs}${phead({ eyebrow: `Impianto · ${esc(plan.level)} · <span class="lockmark">${icon('unlock')} area riservata</span>`, title: i.title, lead: esc(i.summary), extra: `<p>${stateTag(st)}</p>` })}
<div class="callout warn"><strong>Schema, non rilievo</strong>${esc(st.note)} Fonte: ${esc(st.source)}.</div>
<div class="pagecols mapcols"><div><figure class="viz"><div class="viz-scroll" tabindex="0" role="region" aria-label="Planimetria schematica" id="fp-area">${floorPlan(plan, { sel, count: (r) => inRoom(r).length })}</div>
<figcaption class="small muted">${esc(plan.schematic)} Le stanze con fondo tratteggiato hanno altezza massima sotto 1,50 m.${plan.demolition ? ' ' + esc(plan.demolition) : ''}</figcaption></figure></div>
<aside class="aside" id="fp-detail" aria-live="polite">${detail()}</aside></div>
<h2>Stanze</h2><p class="small muted">${plan.rooms.length} vani · ${itn(total)} m² sommando le superfici del CAD, compresi i vani bassi.</p>
${table(['Stanza', 'Superficie', 'Altezza minima', 'Altezza massima', 'Apparati del Faldone'], plan.rooms.map((r) => [`<a href="${href('impianti/' + i.id + '?r=' + r.id)}" data-action="fp-pick" data-id="${esc(r.id)}">${esc(r.name)}</a>`, `${itn(r.area)} m²`, `${itn(r.hmin)} m`, `${itn(r.hmax)} m`, inRoom(r).map((e) => `<a href="${href('e/' + e.id)}">${esc(e.id)}</a>`).join(', ') || (r.impianto ? `<a href="${href('impianti/' + r.impianto)}">VMC</a>` : '—')]), { caption: 'Stanze del piano' })}
<h2>Note del CAD</h2><p class="small muted">Trascritte dal modello del ${esc(new Date(plan.cadDate + 'T12:00:00Z').toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }))}. Le «quote raccolte» sono bozze, non coordinate con la base.</p>
${plan.notes.map((n, k) => `<details${k === 0 ? ' open' : ''}><summary>${esc(n.title.charAt(0) + n.title.slice(1).toLowerCase())}</summary><ul>${n.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul></details>`).join('')}
${(i.related?.cards?.length) ? `<p class="small">Schede collegate: ${i.related.cards.map((c) => `<a class="code" href="${href(c)}">${esc(c)}</a>`).join(' · ')}</p>` : ''}`;
  return {
    title: i.title, html, keepScroll: !!sel,
    mount: (root) => {
      const area = root.querySelector('#fp-area'), det = root.querySelector('#fp-detail');
      const pick = (id, { focusDetail = false } = {}) => {
        sel = id; app.setQuery({ r: sel });
        area.innerHTML = floorPlan(plan, { sel, count: (r) => inRoom(r).length });
        det.innerHTML = detail();
        if (focusDetail) det.querySelector('#fp-sel')?.focus(); else area.querySelector(`[data-room="${CSS.escape(id)}"]`)?.focus();
      };
      area.addEventListener('click', (e) => { const g = e.target.closest('[data-room]'); if (g) pick(g.dataset.room === sel ? '' : g.dataset.room); });
      area.addEventListener('keydown', (e) => { const g = e.target.closest('[data-room]'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(g.dataset.room === sel ? '' : g.dataset.room); } });
      app.on('fp-pick', (el) => { pick(el.dataset.id, { focusDetail: true }); det.scrollIntoView({ block: 'nearest' }); });
      app.on('fp-clear', () => { const was = sel; pick(''); area.querySelector(`[data-room="${CSS.escape(was)}"]`)?.focus(); });
    },
  };
}
