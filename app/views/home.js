import { badge, esc, href, st } from '../ui.js';
import { roadmapState, TASK_LABEL } from '../lib/roadmap.js';
import { simulate } from '../lib/sim.js';

export function home(app) {
  const { core, idx } = app;
  const m = core.meta;
  const rs = roadmapState(core);
  const open = core.decisions.filter((d) => d.status === 'da_chiarire');
  const questions = core.issues.filter((q) => q.kind === 'domanda' && q.status === 'aperta');
  const passed = core.testResults.filter((r) => r.outcome === 'superato').length;
  const nodes = core.entities.filter((e) => e.kind === 'node');
  const group = (f) => nodes.filter(f).map((n) => `<a href="${href('e/' + n.id)}" class="chip"><span class="code">${esc(n.name)}</span></a>`).join('');
  const base = simulate(idx, {});
  const svc = core.entities.filter((e) => e.kind === 'service' && e.activities?.length);
  const count = (s) => svc.filter((e) => base.status(e.id).status === s).length;

  const intents = [
    ['atlante', 'Esplorare funzioni e possibilità', 'Self hosting, privacy, domotica, lavoro, Vito e servizi agli altri.'],
    ['esplora', 'Trovare una parte del sistema', 'Per luogo, servizio, macchina o bisogno.'],
    ['emergenza', 'Risolvere un problema', 'Controlli semplici, poi le procedure tecniche.'],
    ['realizza', 'Seguire la realizzazione', 'Tappe, decisioni aperte e collaudi.'],
    ['documenti', 'Consultare le fonti', `${m.counts.cards} schede con codice, glossario, download.`],
    ['contribuisci', 'Verificare o contribuire', 'Questioni aperte e prove da fare.'],
  ];
  const resume = app.data.progress?.presenta?.scene;
  const fd = (iso, y = true) => new Date(iso + 'T12:00:00Z').toLocaleDateString('it-IT', { day: 'numeric', month: 'long', ...(y ? { year: 'numeric' } : {}), timeZone: 'UTC' });
  const html = `
<section class="hero" aria-labelledby="ptitle">
  <p class="eyebrow">Il Faldone</p>
  <h1 id="ptitle">Atlante dell'infrastruttura</h1>
  <p class="lead">Il progetto che collega dati, servizi e strumenti di casa, sala server, laboratorio e furgone di lavoro: a che cosa serve ogni parte, da che cosa dipende, come si recupera.</p>
  <div class="hero-cta"><a class="btn primary btn-lg" href="${href('presenta')}">Scopri il progetto in 5 minuti</a><span class="small muted">10 scene · circa 5 minuti</span>${resume && resume !== 'visione' ? `<a class="small" href="${href('presenta?s=' + resume)}">Riprendi dalla scena interrotta</a>` : ''}</div>
  <p class="hero-meta">Revisione ${esc(m.revision)} del ${esc(fd(m.documentDate))} · progetto di riferimento, attuazione dal ${esc(fd(m.implementationStart, false))} · collaudi registrati nel Faldone: ${passed || 'nessuno finora'} · nessun monitoraggio collegato</p>
</section>
<ul class="intents" aria-label="Che cosa vuoi fare">${intents.map(([r, t, s]) => `<li><a href="${href(r)}">${esc(t)}<small>${esc(s)}</small></a></li>`).join('')}</ul>

<h2>L'insieme in un colpo d'occhio</h2>
<div class="overview">
  <div class="card"><h3>Sempre accese · decidono a maggioranza</h3><p class="small muted">Cinque macchine formano il nucleo: servono 3 voti su 5 perché il gruppo continui a decidere.</p><div class="chips">${group((n) => n.vote)}</div></div>
  <div class="card"><h3>Accese quando servono</h3><p class="small muted">IA, backup e film. Spente non sono guaste e non tolgono voti.</p><div class="chips">${group((n) => n.power === 'on_demand' && /^M/.test(n.id))}</div></div>
  <div class="card"><h3>Supporto e confini</h3><p class="small muted">Ingresso e password, radio dei sensori, sentinella, osservatore esterno.</p><div class="chips">${group((n) => /^S\d/.test(n.id))}</div></div>
  <div class="card"><h3>Postazioni e mobilità</h3><p class="small muted">Client nelle stanze, laboratorio, Vito e amici: fuori dal quorum.</p><div class="chips">${group((n) => !n.vote && /^(C|MP|HP|MICRO)/.test(n.id))}</div></div>
</div>
<p class="small muted">Nella situazione di riferimento (simulata dal modello, non osservata): ${count('available')} servizi d'uso disponibili, ${count('on_demand')} su richiesta, ${count('unknown')} non determinabili per informazioni mancanti. <a href="${href('simula')}">Prova a spegnere una macchina</a>.</p>

<h2>Le aree del Faldone</h2><p class="small muted">Quattro luoghi (sala server, casa, laboratorio, Vito) e due aree trasversali: i servizi offerti ad altre persone e l'inventario del materiale.</p>
<div class="grid">${core.scopes.map((s) => `<a class="tile scope-bar" data-scope="${s.id}" href="${href('ambito/' + s.id)}"><span class="t">${esc(s.name)}</span><p>${esc(s.tagline)}</p></a>`).join('')}</div>

<div class="overview" style="margin-top:24px">
  <section class="card" aria-labelledby="h-now"><h2 id="h-now" style="margin-top:0">Si può fare adesso</h2>
  <p class="small muted">Dai prerequisiti noti. «Pronto» non vuol dire fatto; nessuna spunta personale lo cambia.</p>
  <ul class="list">${rs.now.slice(0, 5).map((t) => `<li><a href="${href('realizza/attivita/' + t.id)}"><span class="code">${esc(t.id)}</span> ${esc(t.title)}</a><br><span class="small muted">${esc(TASK_LABEL[t.state])}${t.unverified.length ? ' — ' + esc(t.unverified[0].text) : ''}</span></li>`).join('')}</ul>
  <a href="${href('realizza')}">Tutta la roadmap →</a></section>
  <section class="card" aria-labelledby="h-open"><h2 id="h-open" style="margin-top:0">Decisioni e domande aperte</h2>
  <ul class="list">${open.map((d) => `<li><a href="${href('realizza/decisioni/' + d.id)}">${esc(d.title)}</a> <span class="dim d-da_chiarire">da chiarire</span></li>`).join('')}${questions.slice(0, 4).map((q) => `<li><a href="${href('contribuisci/' + q.id)}">${esc(q.title)}</a><br><span class="small muted">${esc(q.impact)}</span></li>`).join('')}</ul>
  <a href="${href('contribuisci')}">Tutte le questioni (${questions.length} domande aperte) →</a></section>
  <section class="card" aria-labelledby="h-tech"><h2 id="h-tech" style="margin-top:0">Consultazione tecnica</h2>
  <ul class="list">
   <li><a href="${href('mappa')}">Mappa relazionale</a> <span class="small muted">rete, dati, copie, quorum, alimentazione</span></li>
   <li><a href="${href('simula')}">Simulatore di dipendenze e guasti</a></li>
   <li><a href="${href('e/M2')}">Scheda di M2</a> <span class="small muted">applicazioni e dati</span></li>
   <li><a href="${href('documenti')}">${m.counts.cards} schede</a> <span class="small muted">in ${m.counts.groups} testi; codici INF, ATL, REV invariati</span></li>
   <li><a href="${href('esplora/rack')}">Rack e porte</a> · <a href="${href('inventario')}">inventario (${m.counts.inventory} voci)</a></li>
  </ul></section>
</div>
<p class="small muted">Numeri con fonte: ${m.counts.cards} codici di scheda (fonte: anagrafica 4.4), ${m.counts.groups} testi leggibili, ${m.counts.entities} elementi del modello con ${m.counts.relations} relazioni, ${m.counts.inventory} voci d'inventario. Build ${esc(m.build)}.</p>`;
  return { title: 'Panoramica', html };
}
