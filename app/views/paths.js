import { esc, href, phead, ctxbar, st, ev } from '../ui.js';
import { simulate } from '../lib/sim.js';

// Percorsi guidati: capitoli brevi, collegati alle entità reali. Nessuna schermata obbligatoria.
const TOURS = [
  { id: 'giornata', title: 'Una giornata reale', for: 'Per vedere i servizi all\'opera', chapters: [
    { t: 'Mattina in laboratorio', s: 'Dall\'Acer MP3 si preparano documenti e agenda; Hermes propone, tu confermi.', ex: 'Hermes suggerisce dove archiviare un PDF; la scrittura avviene solo dopo conferma.', links: ['MP3', 'HERMES', 'PAPERLESS'], tech: 'OCR ufficiale Paperless; proposte degli agenti con conferma esplicita via API autorizzate.', cards: ['INF-03.38', 'INF-06.11'] },
    { t: 'Sul Vito, in cantiere', s: 'Il rapportino si compila anche senza rete; i documenti selezionati sono già a bordo.', ex: 'In una galleria senza LTE il rapportino resta in bozza e parte dopo, una sola volta.', links: ['C1', 'VITO-KIT', 'NET-VITO'], tech: 'Kit offline su C1, invio differito senza duplicati; nessuna dipendenza dal quorum.', cards: ['REV4-VLAV', 'REV4-VSYNC'], sim: { events: [{ type: 'fail', id: 'NET-VITO' }] } },
    { t: 'Rientro a casa', s: 'Il lavoro del Vito rientra nell\'archivio autorevole e finisce nelle copie.', ex: 'Le foto di cantiere passano dalla copia di bordo all\'archivio e al backup delle 18:00.', links: ['D-VITO', 'CP-VITO-LOCAL', 'CP-BCK-M4'], tech: 'Rientro verso archivio autorevole; test di recupero su altro dispositivo (T-VITO).', cards: ['REV3-BCK'] },
    { t: 'Sera: copie e consultazione', s: 'Alle 18:00 M4 si sveglia per il backup; un film sveglia M6 e, se serve, M4.', ex: 'Guardare un film non tiene accesi i server tutta la notte.', links: ['M4', 'JELLYFIN', 'WOL'], tech: 'WoL S4 primo mittente, C4 secondo; M4 si spegne dopo 30 minuti solo se job, mount e utenti lo permettono.', cards: ['INF-03.32', 'REV3-ENE'] },
  ] },
  { id: 'tecnico', title: 'Un tecnico prende in carico il progetto', for: 'Per chi deve verificare o intervenire', chapters: [
    { t: 'Architettura', s: 'Nucleo a cinque voti, tre host autonomi, supporti fuori cluster, dorsale 10 GbE a stella.', ex: 'Lo switch LGS352C collega M2, M3, M4, M6 sulle SFP+ 49–52.', links: ['CLUSTER', 'SW', 'M1'], tech: 'Corosync su rame locale indipendente dal routing virtuale; inter-VLAN via M1 a 1 GbE.', cards: ['INF-03.01', 'INF-02.07'] },
    { t: 'Dipendenze critiche', s: 'M2 (disco singolo), S1 (ingresso e vault), S3 (unico coordinatore radio), lo switch.', ex: 'Simula lo switch guasto: ogni membro resta isolato.', links: ['ST-P310', 'S1', 'S3', 'SW'], tech: 'Punti singoli documentati; nessun secondo coordinatore Zigbee; Vaultwarden escluso dalla VPS.', cards: ['INF-03.28', 'INF-03.23'], sim: { events: [{ type: 'fail', id: 'SW' }] } },
    { t: 'Fonti', s: 'Le schede con codice sono la fonte; il modello cita la scheda per ogni fatto importante.', ex: 'La capacità dei dischi di C3 e C4 è «non nota», con fonte REV3-OPEN.', links: ['C4'], tech: 'Natura del valore distinta: documentato, dichiarato, misurato, stimato, simulato, sconosciuto.', cards: ['REV3-SRC', 'REV3-OPEN'] },
    { t: 'Lacune', s: 'Domande aperte e incongruenze fra schede sono raccolte con impatto e fonti a confronto.', ex: 'OpenClaw è indicato su MP3 in una scheda e su MP1 in un\'altra.', links: [], tech: 'Registro in content/model/issues.json; nessuna risoluzione arbitraria.', cards: ['REV3-OPEN'], route: 'contribuisci' },
    { t: 'Procedure', s: 'Triage, recupero e subentro con controlli non distruttivi, condizioni di arresto e rollback.', ex: 'Il recupero da restic avviene sempre in una cartella nuova.', links: [], tech: 'Comandi con parametri espliciti (REPOSITORY, ID_SNAPSHOT); nessun valore reale inventato.', cards: ['INF-04.10', 'INF-08.04'], route: 'procedura/PR-M2' },
  ] },
  { id: 'guasto', title: 'Quando qualcosa si ferma', for: 'Per capire prima di intervenire', chapters: [
    { t: 'L\'impatto umano', s: 'Prima di tutto: che cosa non si può fare, per chi e da dove.', ex: 'Con M2 fermo non si vedono le foto; la domotica continua.', links: ['M2', 'IMMICH'], tech: 'Impatti calcolati dal modello, non osservati.', cards: ['INF-08.04'], sim: { events: [{ type: 'fail', id: 'M2' }] } },
    { t: 'Diagnosi', s: 'Spento non è guasto; servizio fermo non è dato perso. Si contiene il servizio prima di riavviare la macchina.', ex: 'M6 non risponde alle 3 di notte: probabilmente è solo spento in attesa.', links: ['M6', 'NOTIFY'], tech: 'Gli avvisi distinguono spegnimento normale e guasto (INF-12.13).', cards: ['INF-12.13'] },
    { t: 'Recupero', s: 'Dalla replica se collaudata, altrimenti dalle copie, sempre in una cartella nuova.', ex: 'Nextcloud su C4 solo se la replica entra nel disco e il collaudo è registrato.', links: ['CP-REPL-C4', 'CP-BCK-M4'], tech: 'Condizioni strutturate: collaudo T-HA-APP, quorum nella partizione di C4, capacità disco nota.', cards: ['INF-08.08', 'INF-04.10'], route: 'procedura/PR-RESTORE' },
    { t: 'Verifica', s: 'Un job verde non è un recupero. Si chiude sul risultato osservato, con tempi e perdita di dati registrati.', ex: 'Il primo subentro reale diventa il primo RTO misurato.', links: [], tech: 'Registro collaudi: data, esemplare, condizioni, esito, evidenza.', cards: ['REV4-TEST'], route: 'realizza/collaudi' },
  ] },
];

export function paths(app) {
  const { core } = app;
  const prog = app.data.progress || {};
  const html = `${ctxbar([['Esplora', 'esplora'], ['Percorsi']])}${phead({ eyebrow: 'Percorsi', title: 'Percorsi guidati e percorsi dei dati', lead: 'Facoltativi, riprendibili, mai obbligatori. Il progresso di lettura resta su questo dispositivo e non ha nulla a che vedere con l\'avanzamento dell\'impianto.' })}
<h2>Per iniziare</h2><div class="grid"><a class="tile" href="${href('presenta')}"><span class="t">Il progetto in cinque minuti</span><p>La presentazione del progetto: 10 scene, circa 5 minuti, anche in lettura continua.</p></a></div>
<h2>Percorsi di approfondimento</h2><div class="grid">${TOURS.map((t) => `<a class="tile" href="${href('percorsi/' + t.id)}"><span class="t">${esc(t.title)}</span><p>${esc(t.for)} · ${t.chapters.length} capitoli</p><span class="meta small muted">${prog[t.id]?.length ? `letti ${prog[t.id].length} di ${t.chapters.length}` : 'non iniziato'}</span></a>`).join('')}</div>
<h2>Dove passano i dati</h2><div class="grid">${core.paths.map((p) => `<a class="tile" href="${href('percorsi/' + p.id)}"><span class="t">${esc(p.title)}</span><p>${esc(p.question)}</p><span class="meta small muted">${p.steps.length} passaggi${p.steps.some((s) => s.ev === 'unknown') ? ' · con vuoti informativi' : ''}</span></a>`).join('')}</div>`;
  return { title: 'Percorsi', html };
}

export function path(app, [id]) {
  const { core, idx } = app;
  const tour = TOURS.find((t) => t.id === id);
  if (tour) return tourView(app, tour);
  const p = core.paths.find((x) => x.id === id);
  if (!p) return { title: 'Percorso', html: '<p>Percorso non trovato.</p>' };
  const base = simulate(idx, {});
  const html = `${ctxbar([['Esplora', 'esplora'], ['Percorsi', 'percorsi'], [p.title]])}${phead({ eyebrow: 'Percorso dei dati', title: p.title, lead: esc(p.question) })}
<p class="small">I passaggi con il cerchio tratteggiato sono <strong>vuoti informativi</strong>: il collegamento non è documentato e non viene disegnato come se esistesse.</p>
<ol class="steps">${p.steps.map((s) => {
    const e = s.entity && (idx.get(s.entity) || idx.procedures.get(s.entity));
    const isEnt = s.entity && idx.get(s.entity);
    const gap = s.gap && idx.issues.get(s.gap);
    return `<li class="${s.ev === 'unknown' ? 'gap' : ''}"><span class="lbl">${esc(s.label)}</span> ${s.ev === 'unknown' ? ev('unknown') : ''}<br>${esc(s.text)}
${e ? `<br><a href="${href(isEnt ? 'e/' + s.entity : 'procedura/' + s.entity)}">${esc(isEnt ? e.name : e.title)}</a>${isEnt ? ' ' + st(base.status(s.entity).status) : ''}` : ''}
${gap ? `<br><a class="small" href="${href('contribuisci/' + gap.id)}">Domanda aperta: ${esc(gap.title)}</a>` : ''}
<br><span class="small muted">Fonti: ${s.cards.map((c) => `<a class="code" href="${href(c)}">${esc(c)}</a>`).join(' ')}</span></li>`;
  }).join('')}</ol>
<p class="small muted">Stati calcolati sul modello nella situazione di riferimento. <a href="${href('simula')}">Simula un guasto</a> per vedere che cosa cambia lungo il percorso.</p>`;
  return { title: p.title, html };
}

function tourView(app, t) {
  const { idx } = app;
  const n = Math.min(Math.max(parseInt(app.query.c || '1', 10) || 1, 1), t.chapters.length);
  const ch = t.chapters[n - 1];
  const seen = new Set(app.data.progress?.[t.id] || []);
  if (!seen.has(n)) { app.data.progress = { ...(app.data.progress || {}), [t.id]: [...seen, n] }; app.persist(); }
  const simHtml = ch.sim ? (() => {
    const sim = simulate(idx, ch.sim);
    return `<div class="card"><p class="small"><span class="simtag">Simulazione</span> ${ch.sim.events?.length ? `con ${ch.sim.events.map((e) => esc(idx.get(e.id)?.name)).join(', ')} indisponibile` : 'situazione di riferimento'}</p><ul>${ch.links.filter((l) => idx.get(l)?.activities).flatMap((l) => sim.impact(l)).slice(0, 5).map((i) => `<li>${st(i.status)} ${esc(i.text)}</li>`).join('') || ch.links.map((l) => `<li>${esc(idx.get(l)?.name)}: ${st(sim.status(l).status)}</li>`).join('')}</ul>${ch.sim.events?.length ? `<a href="${href('simula?f=' + ch.sim.events.map((e) => e.id).join(','))}">Apri nel simulatore</a>` : ''}</div>`;
  })() : '';
  const html = `${ctxbar([['Esplora', 'esplora'], ['Percorsi', 'percorsi'], [t.title]])}${phead({ eyebrow: `${esc(t.title)} · capitolo ${n} di ${t.chapters.length}`, title: ch.t, lead: esc(ch.s) })}
<div class="bar" role="progressbar" aria-valuemin="1" aria-valuemax="${t.chapters.length}" aria-valuenow="${n}" aria-label="Avanzamento della lettura"><i style="width:${(n / t.chapters.length) * 100}%"></i></div>
<p class="small muted">Avanzamento della lettura, salvato su questo dispositivo. Non indica lo stato dell'impianto.</p>
<div class="callout"><strong>Un esempio concreto</strong>${esc(ch.ex)}</div>
${simHtml}
${ch.links.length ? `<h2>Elementi reali</h2><div class="chips">${ch.links.map((l) => `<a class="chip" href="${href('e/' + l)}">${esc(idx.get(l)?.name || l)}</a>`).join('')}</div>` : ''}
${ch.route ? `<p><a class="btn" href="${href(ch.route)}">Approfondisci</a></p>` : ''}
<details${app.depth !== 'capire' ? ' open' : ''}><summary>Per il tecnico</summary><p>${esc(ch.tech)}</p><p class="small">Fonti: ${ch.cards.map((c) => `<a class="code" href="${href(c)}">${esc(c)}</a>`).join(' ')}</p></details>
<nav class="phead" aria-label="Capitoli"><div class="actions">${n > 1 ? `<a class="btn" href="${href(`percorsi/${t.id}?c=${n - 1}`)}">← ${esc(t.chapters[n - 2].t)}</a>` : ''}${n < t.chapters.length ? `<a class="btn primary" href="${href(`percorsi/${t.id}?c=${n + 1}`)}">${esc(t.chapters[n].t)} →</a>` : `<a class="btn primary" href="${href('percorsi')}">Fine del percorso</a>`}</div>
<ol class="chips" style="list-style:none;padding:0">${t.chapters.map((c, i) => `<li><a class="chip" href="${href(`percorsi/${t.id}?c=${i + 1}`)}" ${i + 1 === n ? 'aria-current="step"' : ''}>${i + 1}. ${esc(c.t)}${seen.has(i + 1) ? ' ✓' : ''}</a></li>`).join('')}</ol></nav>`;
  return { title: `${ch.t} · ${t.title}`, html };
}
