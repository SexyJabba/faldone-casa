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
    ['percorsi/cinque-minuti', 'Voglio capire il progetto', 'Cosa permette, dove, con quali limiti. Cinque minuti.'],
    ['esplora', 'Voglio trovare un servizio o una macchina', 'Per ambito, per luogo, per nome o per bisogno.'],
    ['emergenza', 'Qualcosa non funziona', 'Percorsi semplici, poi i controlli da tecnico.'],
    ['realizza', 'Voglio realizzare il prossimo passo', 'Cosa si può fare adesso e cosa lo blocca.'],
    ['contribuisci', 'Voglio aiutare o verificare una scelta', 'Questioni aperte, prove mancanti, proposte.'],
  ];
  const depth = app.depth;
  const html = `
<section class="hero" aria-labelledby="ptitle">
  <p class="eyebrow">Il Faldone · infrastruttura informatica di Alessandro Rinaldi</p>
  <h1 id="ptitle">Casa, sala server, laboratorio e Vito: che cosa c'è, come funziona, che cosa succede se qualcosa si ferma.</h1>
  <p class="lead">Documenti, foto, film, domotica e lavoro girano su computer di casa, non su abbonamenti. Qui trovi a cosa serve ogni parte, da che cosa dipende e come si recupera.</p>
  <div class="statusline"><span class="dim d-approvata"><b>Contenuto</b>Revisione ${esc(m.revision)} · ${esc(new Date(m.documentDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }))}</span>
  <span class="dim"><b>Natura</b>Progetto di riferimento, attuazione dal ${esc(new Date(m.implementationStart).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' }))}</span>
  <span class="dim"><b>Collaudi registrati</b>${passed}</span><span class="dim"><b>Stato osservato</b>non rilevato · nessuna telemetria</span></div>
  <ul class="intents">${intents.map(([r, t, s]) => `<li><a href="${href(r)}">${esc(t)}<small>${esc(s)}</small></a></li>`).join('')}</ul>
</section>

<h2>L'insieme in un colpo d'occhio</h2>
<div class="overview">
  <div class="card"><h3>Sempre accese · decidono a maggioranza</h3><p class="small muted">Cinque macchine formano il nucleo: servono 3 voti su 5 perché il gruppo continui a decidere.</p><div class="chips">${group((n) => n.vote)}</div></div>
  <div class="card"><h3>Accese quando servono</h3><p class="small muted">IA, backup e film. Spente non sono guaste e non tolgono voti.</p><div class="chips">${group((n) => n.power === 'on_demand' && /^M/.test(n.id))}</div></div>
  <div class="card"><h3>Supporto e confini</h3><p class="small muted">Ingresso e password, radio dei sensori, sentinella, osservatore esterno.</p><div class="chips">${group((n) => /^S\d/.test(n.id))}</div></div>
  <div class="card"><h3>Postazioni e mobilità</h3><p class="small muted">Client nelle stanze, laboratorio, Vito e amici: fuori dal quorum.</p><div class="chips">${group((n) => !n.vote && /^(C|MP|HP|MICRO)/.test(n.id))}</div></div>
</div>
<p class="small muted">Nella situazione di riferimento (simulata dal modello, non osservata): ${count('available')} servizi d'uso disponibili, ${count('on_demand')} su richiesta, ${count('unknown')} non determinabili per informazioni mancanti. <a href="${href('simula')}">Prova a spegnere una macchina</a>.</p>

<h2>Sei ambiti</h2>
<div class="grid">${core.scopes.map((s) => `<a class="tile scope-bar" data-scope="${s.id}" href="${href('ambito/' + s.id)}"><span class="t">${esc(s.name)}</span><p>${esc(depth === 'capire' ? s.simple : s.tagline)}</p></a>`).join('')}</div>

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
${depth === 'intervenire' ? `<div class="callout"><strong>Riferimenti di progetto 4.4</strong>Nucleo Proxmox M1, M2, M5, C3, C4: ${core.entities.find((e) => e.id === 'CLUSTER').facts.expectedVotes.value} voti, quorum ${core.entities.find((e) => e.id === 'CLUSTER').facts.quorum.value}, senza QDevice; M3/M4/M6 autonomi; S4 sentinella senza voto. HA non attiva finché i collaudi non sono registrati. ${badge('unknown', 'nessun collaudo registrato')}</div>` : ''}
<p class="small muted">Numeri con fonte: ${m.counts.cards} codici di scheda (fonte: anagrafica 4.4), ${m.counts.groups} testi leggibili, ${m.counts.entities} elementi del modello con ${m.counts.relations} relazioni, ${m.counts.inventory} voci d'inventario. Build ${esc(m.build)}.</p>`;
  return { title: 'Panoramica', html };
}
