import { esc, href, phead, dims, ev } from '../ui.js';
import { REL_LABEL } from '../lib/model.js';
import { bars } from '../lib/charts.js';

const themes = [
  ['servizi', 'Servizi self hosting', 'Documenti, foto, attività e media: parti da ciò che vuoi fare.', e => e.kind === 'service'],
  ['continuita', 'Ridondanza e recupero', 'Segui originali, archivi e copie. Apri le schede per distinguere protezione prevista e recupero provato.', e => ['dataset', 'storage', 'copy'].includes(e.kind)],
  ['privacy', 'Privacy e accessi', 'Consulta i confini di accesso e le dipendenze dei servizi di ingresso e delle credenziali.', e => ['ACCESSO-PRIVATO', 'CADDY', 'VAULTWARDEN', 'OPNSENSE', 'SEAFILE'].includes(e.id)],
  ['nodi', 'Nodi e client', 'Ogni postazione ha un ruolo: scopri funzioni, servizi ospitati e collegamenti.', e => e.kind === 'node'],
  ['casa', 'Domotica e sicurezza', 'Comandi, automazioni, sensori e visione: esplora anche ciò che dipende dalla radio.', e => e.scopes?.includes('casa')],
  ['lavoro', 'Assistenti al lavoro', 'Attività, orchestrazione e assistenza IA nel laboratorio, con i limiti descritti nelle fonti.', e => e.scopes?.includes('laboratorio')],
  ['vito', 'Vito · lavoro e camper', 'Il laboratorio mobile e la vita a bordo: scopri strumenti, dati e autonomia documentata.', e => e.scopes?.includes('vito')],
  ['terzi', 'Servizi per altre persone', 'Consulta che cosa è condiviso, per chi e attraverso quali componenti.', e => e.scopes?.includes('terzi')],
];
export function atlas(app) {
  const chosen = themes.find(t => t[0] === app.query.t) || themes[0];
  const query = (app.query.q || '').trim().toLocaleLowerCase('it');
  const members = app.core.entities.filter(chosen[3]);
  const items = members.filter(e => JSON.stringify([e.id, e.name, e.oneLine, e.activities]).toLocaleLowerCase('it').includes(query));
  app.on('atlas-theme', el => app.go('atlante?t=' + el.dataset.id));
  app.on('atlas-search', el => { app.setQuery({t: chosen[0], q: el.value}); const q = el.value.toLocaleLowerCase('it').trim(); let n = 0; document.querySelectorAll('[data-atlas-text]').forEach(card => { card.hidden = !card.dataset.atlasText.includes(q); if (!card.hidden) n++; }); document.getElementById('atlas-count').textContent = `${n} elementi`; });
  const links = e => app.core.relations.filter(r => r.fromId === e.id && r.type !== 'documented_by' && app.idx.get(r.toId));
  return { title: 'Atlante delle funzioni', html: `${phead({eyebrow: 'Capire il sistema', title: 'Un sistema, molte possibilità', lead: 'Dalle attività quotidiane ai componenti che le rendono possibili. Esplora i temi, segui le dipendenze e apri le fonti: ogni funzione resta collegata al progetto.'})}
<div class="atlas-layout"><nav class="atlas-nav" aria-label="Temi dell’atlante">${themes.map(([id,title],i) => `<button class="tile" type="button" data-action="atlas-theme" data-id="${id}" aria-pressed="${chosen[0] === id}"><span class="small muted">0${i+1}</span><strong>${esc(title)}</strong></button>`).join('')}</nav><section>
<div class="atlas-intro"><p class="eyebrow">Esplorazione tematica</p><h2>${esc(chosen[1])}</h2><p class="lead">${esc(chosen[2])}</p><div class="chips"><a class="btn" href="${href('mappa')}">Mappa delle relazioni</a><a class="btn" href="${href('simula')}">Simula un guasto</a><a class="btn" href="${href('costi')}">Consumi e scenari</a><a class="btn" href="${href('inventario')}">Inventario</a></div></div>
${bars('Composizione del tema · numero di elementi', [...new Set(members.map(e=>e.kind))].map(k=>({label:({service:'Servizi',node:'Nodi e client',dataset:'Dati',storage:'Archivi',copy:'Copie',network:'Reti',device:'Apparati',place:'Luoghi'})[k] || k,value:members.filter(e=>e.kind===k).length})), 'elementi')}
<label class="f">Cerca in questo tema<input type="search" value="${esc(app.query.q || '')}" data-input="atlas-search" placeholder="Funzione, servizio o componente"></label><p id="atlas-count" role="status">${items.length} elementi</p>
<div class="grid">${members.map(e => `<article class="card atlas-entry" data-atlas-text="${esc(JSON.stringify([e.id,e.name,e.oneLine,e.activities]).toLocaleLowerCase('it'))}" ${items.includes(e)?'':'hidden'}><p class="eyebrow">${esc(e.id)}</p><h3><a href="${href('e/'+e.id)}">${esc(e.name)}</a></h3><p>${esc(e.oneLine || e.title || '')}</p>${dims(e.status || {},{compact:true})}${e.activities?.length ? `<h4>Che cosa permette di fare</h4><ul>${e.activities.map(a=>`<li>${esc(a.text)}</li>`).join('')}</ul>`:''}${links(e).length ? `<details><summary>Dipendenze e collegamenti (${links(e).length})</summary><ul>${links(e).map(r=>`<li><a href="${href('e/'+r.toId)}">${esc(app.idx.get(r.toId).name)}</a> · ${esc(r.label || REL_LABEL[r.type]?.[0] || 'collegamento')} ${ev(r.evidenceKind)}</li>`).join('')}</ul></details>`:'<p class="small muted">Nessun collegamento strutturato disponibile in questa vista.</p>'}<p><a href="${href('e/'+e.id)}">Funzioni, limiti e fonti →</a></p></article>`).join('')}</div></section></div>` };
}
