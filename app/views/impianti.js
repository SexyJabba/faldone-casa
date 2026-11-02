// Impianti di casa: sezione documentale fuori dalla baseline approvata, ogni impianto con il proprio stato.
import { badge, esc, href, phead, ctxbar, table } from '../ui.js';

const stateTag = (st) => (st.decision === 'ipotesi' ? badge('unknown', st.label) : badge('on_demand', st.label));

export async function impianti(app) {
  const d = await app.load('impianti', 'data/impianti.json');
  const done = d.impianti.filter((i) => i.components);
  const html = `${ctxbar([['Esplora', 'esplora'], ['Impianti di casa']])}${phead({ eyebrow: 'Casa e ambienti', title: 'Impianti di casa', lead: 'Gli impianti che la domotica dovrà governare. Sono documentati qui man mano, ciascuno con il proprio stato: non fanno parte del progetto approvato 4.4.' })}
<p class="small muted">${done.length} di ${d.impianti.length} compilati.</p>
<div class="grid">${d.impianti.map((i) => `<a class="tile" href="${href('impianti/' + i.id)}"><span class="t">${esc(i.title)}</span><p>${esc(i.summary)}</p><span class="meta">${stateTag(i.status)}</span></a>`).join('')}</div>`;
  return { title: 'Impianti di casa', html };
}

export async function impianto(app, [id]) {
  const d = await app.load('impianti', 'data/impianti.json');
  const i = d.impianti.find((x) => x.id === id);
  if (!i) return { title: 'Impianto', html: `${phead({ title: 'Impianto non trovato' })}<p><a href="${href('impianti')}">Tutti gli impianti</a></p>` };
  const { idx } = app;
  const ent = (ids = []) => ids.filter((e) => idx.get(e)).map((e) => `<a class="chip" href="${href('e/' + e)}">${esc(idx.get(e).name)}</a>`).join('');
  const cards = (cs = []) => cs.map((c) => `<a class="code" href="${href(c)}">${esc(c)}</a>`).join(' · ');
  const crumbs = ctxbar([['Esplora', 'esplora'], ['Impianti di casa', 'impianti'], [i.short]]);
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
