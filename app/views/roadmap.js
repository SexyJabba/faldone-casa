import { badge, esc, href, phead, ctxbar, st, table, fmt } from '../ui.js';
import { roadmapState, TASK_LABEL } from '../lib/roadmap.js';

const TS = { completato: 'available', da_verificare: 'degraded', pronto: 'available', pronto_incerto: 'on_demand', bloccato: 'blocked' };
const tabs = (cur) => `<nav class="chips" aria-label="Sezioni di Realizza" style="margin-bottom:12px">${[['realizza', 'Roadmap'], ['realizza/decisioni', 'Decisioni'], ['realizza/collaudi', 'Collaudi'], ['realizza/acquisti', 'Acquisti'], ['costi', 'Costi ed energia'], ['contribuisci', 'Contribuisci'], ['connettori', 'Connettori']].map(([r, l]) => `<a class="chip" href="${href(r)}" ${r === cur ? 'aria-current="page" aria-pressed="true"' : ''}>${l}</a>`).join('')}</nav>`;

export function roadmap(app) {
  const { core } = app;
  const rs = roadmapState(core);
  const view = app.query.v || 'adesso';
  app.on('rview', (el) => { app.setQuery({ v: el.dataset.v }); app.go(`realizza?v=${el.dataset.v}`, { replace: true }); });
  const taskLi = (t) => `<li><a href="${href('realizza/attivita/' + t.id)}"><span class="code">${esc(t.id)}</span> ${esc(t.title)}</a> ${badge(TS[t.state], TASK_LABEL[t.state])}
${t.blockers?.length ? `<br><span class="small muted">${esc(t.blockers.map((b) => b.text).join(' · '))}</span>` : ''}${t.unverified?.length ? `<br><span class="small muted">Da verificare: ${esc(t.unverified.map((b) => b.text).join(' · '))}</span>` : ''}</li>`;
  let body;
  if (view === 'adesso') {
    body = `<p>Attività i cui prerequisiti noti sono soddisfatti. Quelle «con prerequisiti non verificati» dipendono da consegne dichiarate ma non registrate.</p><ul class="list">${rs.now.map(taskLi).join('')}</ul>`;
  } else if (view === 'sequenza') {
    body = rs.phases.map((p) => `<section class="card" style="margin-bottom:12px"><p class="eyebrow">${esc(p.id)} · ${esc(p.target.kind)}${p.target.from ? ` · da ${esc(p.target.from)}` : ''}${p.target.to ? ` a ${esc(p.target.to)}` : ''}</p><h2 style="margin-top:4px">${esc(p.title)}</h2><p>${esc(p.goal)}</p>
<p><strong>Gate:</strong> ${esc(p.gate)} ${p.gateOpen ? badge('available', 'gate superato') : badge('blocked', `gate chiuso: ${p.missingTests.length} collaudi da registrare`)}</p>
${p.after ? `<p class="small muted">Dopo: ${p.after.map(esc).join(', ')}</p>` : ''}<p class="small"><strong>Ritorno indietro:</strong> ${esc(p.rollback)}</p><ul class="list">${p.tasks.map(taskLi).join('')}</ul></section>`).join('');
  } else {
    body = table(['Attività', 'Fase', 'Stato', 'Prova richiesta', 'Per'], core.roadmap.tasks.map((t) => { const s = rs.taskState.get(t.id); return [`<a href="${href('realizza/attivita/' + t.id)}"><span class="code">${esc(t.id)}</span> ${esc(t.title)}</a>`, esc(t.phase), badge(TS[s.state], TASK_LABEL[s.state]), esc((t.tests || []).join(', ') || t.evidence || '—'), esc(t.audience || '—')]; }));
  }
  const html = `${tabs('realizza')}${phead({ eyebrow: 'Realizza', title: 'Roadmap verificabile', lead: 'Dal 23 dicembre 2026, a fasi con gate espliciti. Le date sono obiettivi o vincolate a condizioni; nessuna percentuale di avanzamento: conta solo ciò che è registrato.' })}
<div class="seg" role="group" aria-label="Vista">${[['adesso', 'Cosa posso fare adesso'], ['sequenza', 'Sequenza'], ['elenco', 'Elenco']].map(([k, l]) => `<button type="button" data-action="rview" data-v="${k}" aria-pressed="${view === k}">${l}</button>`).join('')}</div>
<div class="callout"><strong>Spuntare non completa</strong>Un'attività è «completata attestata» solo quando l'esito e l'evidenza sono registrati nei sorgenti del Faldone (collaudi e attività). Collaudi registrati oggi: ${core.testResults.length}.</div>
${body}`;
  return { title: 'Roadmap', html };
}

export function task(app, [id]) {
  const { core, idx } = app;
  const t = core.roadmap.tasks.find((x) => x.id === id);
  if (!t) return { title: 'Attività', html: '<p>Attività non trovata.</p>' };
  const rs = roadmapState(core);
  const s = rs.taskState.get(id);
  const ph = core.roadmap.phases.find((p) => p.id === t.phase);
  const acq = (t.needs || []).map((n) => core.acquisitions.find((a) => a.id === n.acq)).filter(Boolean);
  const html = `${ctxbar([['Realizza', 'realizza'], [ph.title, 'realizza?v=sequenza'], [t.id]])}${phead({ eyebrow: `Attività · fase ${esc(t.phase)}`, title: t.title, extra: `<p>${badge(TS[s.state], TASK_LABEL[s.state])}</p>` })}
<dl class="kv"><dt>Fase</dt><dd>${esc(ph.title)} · ${esc(ph.target.kind)}</dd><dt>Risultato atteso</dt><dd>${esc(t.evidence || 'non specificato')}</dd><dt>Destinatario</dt><dd>${esc(t.audience || '—')}</dd>
<dt>Prerequisiti</dt><dd>${(t.after || []).map((a) => `<a href="${href('realizza/attivita/' + a)}">${esc(a)}</a>`).join(', ') || 'nessuno'}</dd>
<dt>Prove richieste</dt><dd>${(t.tests || []).map((x) => esc(idx.tests.get(x)?.name || x)).join(', ') || '—'}</dd>
<dt>Decisioni</dt><dd>${[...(t.decides || []).map((d) => d), ...(t.decisions || [])].map((d) => `<a href="${href('realizza/decisioni/' + d)}">${esc(idx.decisions.get(d)?.title || d)}</a>`).join(', ') || '—'}</dd>
<dt>Materiali</dt><dd>${acq.map((a) => `${esc(a.item)} — ${esc(a.state)}`).join('<br>') || '—'}</dd>
<dt>Procedure</dt><dd>${(t.procedures || []).map((p) => `<a href="${href('procedura/' + p)}">${esc(idx.procedures.get(p)?.title)}</a>`).join(', ') || '—'}</dd>
<dt>Ritorno indietro</dt><dd>${esc(ph.rollback)}</dd></dl>
${s.blockers.length ? `<h2>Che cosa blocca</h2><ul>${s.blockers.map((b) => `<li>${esc(b.text)}</li>`).join('')}</ul>` : ''}
${s.unverified.length ? `<h2>Da verificare</h2><ul>${s.unverified.map((b) => `<li>${esc(b.text)}</li>`).join('')}</ul>` : ''}
<h2>Elementi coinvolti</h2><div class="chips">${(t.entities || []).map((e) => `<a class="chip" href="${href('e/' + e)}">${esc(idx.get(e)?.name || e)}</a>`).join('')}</div>
<p class="small muted">Fonte: <a href="${href('REV4-ROAD')}">REV4-ROAD</a>. L'avanzamento reale si registra nei sorgenti (content/model) con evidenza; Vikunja non è collegato.</p>`;
  return { title: t.id, html };
}

export function decisions(app) {
  const { core } = app;
  const html = `${tabs('realizza/decisioni')}${phead({ eyebrow: 'Realizza', title: 'Registro delle decisioni', lead: 'Problema, alternative, scelta, motivazione e compromessi. Una decisione superata resta consultabile e indica quella che la sostituisce.' })}
${table(['Decisione', 'Stato', 'Data', 'Elementi'], core.decisions.map((d) => [`<a href="${href('realizza/decisioni/' + d.id)}">${esc(d.title)}</a>`, `<span class="dim d-${d.status}">${esc(d.status.replace('_', ' '))}</span>`, esc(d.date || '—'), (d.entities || []).slice(0, 5).map(esc).join(', ')]))}`;
  return { title: 'Decisioni', html };
}

export function decision(app, [id]) {
  const { idx } = app;
  const d = idx.decisions.get(id);
  if (!d) return { title: 'Decisione', html: '<p>Decisione non trovata.</p>' };
  const html = `${ctxbar([['Realizza', 'realizza'], ['Decisioni', 'realizza/decisioni'], [d.id]])}${phead({ eyebrow: `Decisione · ${esc(d.id)}`, title: d.title, extra: `<p><span class="dim d-${d.status}"><b>Stato</b>${esc(d.status.replace('_', ' '))}</span> ${d.date ? `<span class="dim"><b>Data</b>${esc(d.date)}</span>` : ''}</p>` })}
${d.supersededBy ? `<div class="callout warn"><strong>Superata</strong>Sostituita da <a href="${href('realizza/decisioni/' + d.supersededBy)}">${esc(idx.decisions.get(d.supersededBy)?.title)}</a>.</div>` : ''}
<dl class="kv"><dt>Problema</dt><dd>${esc(d.problem || '—')}</dd><dt>Alternative</dt><dd>${(d.alternatives || []).map(esc).join('<br>') || '—'}</dd><dt>Scelta</dt><dd>${d.choice ? esc(d.choice) : '<strong>non ancora presa</strong>'}</dd>${d.recommendation ? `<dt>Raccomandazione</dt><dd>${esc(d.recommendation)} <span class="small muted">(non è una configurazione effettuata)</span></dd>` : ''}
<dt>Motivazione</dt><dd>${esc(d.rationale || '—')}</dd><dt>Compromessi</dt><dd>${esc(d.tradeoffs || '—')}</dd>${d.note ? `<dt>Nota</dt><dd>${esc(d.note)}</dd>` : ''}${d.supersedes ? `<dt>Sostituisce</dt><dd><a href="${href('realizza/decisioni/' + d.supersedes)}">${esc(d.supersedes)}</a></dd>` : ''}
<dt>Blocca</dt><dd>${(d.blocks || []).map((b) => `<a href="${href('realizza/attivita/' + b)}">${esc(b)}</a>`).join(', ') || '—'}</dd></dl>
<h2>Elementi coinvolti</h2><div class="chips">${(d.entities || []).map((e) => `<a class="chip" href="${href('e/' + e)}">${esc(idx.get(e)?.name || e)}</a>`).join('')}</div>
<p class="small">Fonti: ${(d.cards || []).map((c) => `<a class="code" href="${href(c)}">${esc(c)}</a>`).join(' ')}</p>`;
  return { title: d.title, html };
}

export function registers(app, [which]) {
  const { core, idx } = app;
  if (which === 'collaudi') {
    const html = `${tabs('realizza/collaudi')}${phead({ eyebrow: 'Realizza', title: 'Collaudi e registro di accettazione', lead: 'Ogni funzione è pronta solo con una prova registrata: data, esemplare, condizioni, esito, evidenza. Nessun risultato positivo si presume.' })}
${table(['Prova', 'Criterio di accettazione', 'Ripiego', 'Esito registrato', 'Elementi'], core.tests.map((t) => { const r = core.testResults.filter((x) => x.testId === t.id); return [esc(t.name), esc(t.criterion), esc(t.fallback), r.length ? r.map((x) => `${esc(x.outcome)} · ${esc(x.date)}`).join('<br>') : badge('unknown', 'non eseguito'), (t.targets || []).map((e) => `<a href="${href('e/' + e)}">${esc(idx.get(e)?.name || e)}</a>`).join(', ')]; }))}
<p class="small muted">Campi del registro: data · nodo · prova · esito · evidenza · ripetizione prevista (REV4-TEST). Per registrare un esito si aggiorna <code>content/model/test-results.json</code> e si ricostruisce il sito: la build rifiuta un «superato» senza evidenza.</p>`;
    return { title: 'Collaudi', html };
  }
  const tot = (f) => core.acquisitions.filter(f).reduce((a, x) => a + (x.amount || 0), 0);
  const html = `${tabs('realizza/acquisti')}${phead({ eyebrow: 'Realizza', title: 'Acquisti e completamenti', lead: 'Posseduto, ordinato, dichiarato, proposto e annullato restano distinti. Gli importi sono quelli comunicati; spese accessorie non comunicate non vengono stimate.' })}
${table(['ID', 'Voce', 'Q.tà', 'Importo', 'Stato', 'Dettaglio', 'Destinazione'], core.acquisitions.map((a) => [esc(a.id), esc(a.item), esc(a.qty), a.amount === null ? '<span class="muted">n.d.</span>' : `${fmt(a.amount, 2)} €`, esc(a.state), esc(a.detail), esc(a.target)]))}
<p>Totale acquistato o dichiarato: <strong>${fmt(tot((a) => /Acquist/.test(a.state)), 2)} €</strong> · ordinato con prezzo non comunicato: ${core.acquisitions.filter((a) => a.state === 'Ordinato' && a.amount === null).length} voce · proposto, non acquistato: ${fmt(tot((a) => /Proposta/.test(a.state)), 2)} €.</p>
<p class="small">Fonte: <a href="${href('REV3-ACQ')}">REV3-ACQ</a>.</p>`;
  return { title: 'Acquisti', html };
}
