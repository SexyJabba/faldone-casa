import { badge, esc, href, phead, ctxbar, dims, st, ev, kind, mech, factValue, srcLinks, table } from '../ui.js';
import { REL_LABEL, walk } from '../lib/model.js';
import { simulate, ST, ST_LABEL, sharesDomain, copyReadiness, diff } from '../lib/sim.js';

const FACT_LABEL = {
  expectedVotes: 'Voti attesi', quorum: 'Quorum', qdevice: 'QDevice', haActive: 'Alta disponibilità attiva', corosyncPath: 'Percorso Corosync',
  autoOff: 'Spegnimento automatico dopo', backupWindow: 'Finestra di backup', diskCapacity: 'Capacità disco', place: 'Collocazione', rj45: 'Porte RJ45',
  sfp: 'Porte SFP+', poe: 'PoE', maxPower: 'Potenza massima (datasheet)', rj45Assignment: 'Assegnazione porte RJ45', capacity: 'Capacità', autonomy: 'Autonomia',
  upload: 'Upload', quota: 'Traffico SIM', vlanIds: 'VLAN e subnet', rpoTarget: 'RPO obiettivo', rtoTarget: 'RTO obiettivo', devices: 'Dispositivi', mechanism: 'Meccanismo',
  size: 'Volume', nominal: 'Capacità nominale', model: 'Modello', free: 'Spazio libero', interval: 'Intervallo di replica', frequency: 'Frequenza', retention: 'Conservazione',
  lastRestore: 'Ultimo recupero provato', tool: 'Strumento', encryption: 'Cifratura', target: 'Supporto',
};
const label = (k) => FACT_LABEL[k] || k;

export function condText(c, idx) {
  const n = (id) => idx.get(id)?.name || idx.tests.get(id)?.name || id;
  if (!c) return '';
  if (c.all) return c.all.map((x) => condText(x, idx)).join('; ');
  if (c.any) return 'una fra: ' + c.any.map((x) => condText(x, idx)).join(' oppure ');
  if (c.not) return 'non ' + condText(c.not, idx);
  if (c.test) return `collaudo «${n(c.test)}» superato`;
  if (c.quorumAt) return `${n(c.quorumAt)} in una partizione con quorum`;
  if (c.factKnown) { const [e, f] = c.factKnown.split('.'); return `${label(f).toLowerCase()} di ${n(e)} nota e sufficiente`; }
  if (c.decision) return `decisione ${c.decision} ${c.is || 'approvata'}`;
  if (c.entityUp) return `${n(c.entityUp)} in funzione`;
  return '';
}

export function entity(app, [id]) {
  const { idx, core } = app;
  const e = idx.get(id);
  if (!e) return { title: 'Non trovato', html: `${phead({ title: `Elemento ${id} non trovato` })}<p>Nessun elemento con questo identificativo. <a href="#cerca?q=${encodeURIComponent(id)}">Cerca «${esc(id)}»</a>.</p>` };
  const depth = app.depth;
  const open = (lvl) => (depth === 'intervenire' || (depth === 'approfondire' && lvl === 'approfondire') ? ' open' : '');
  const base = simulate(idx, {});
  const fail = simulate(idx, { events: [{ type: e.power === 'on_demand' || e.power === 'manual' ? 'fail' : 'fail', id }] });
  const name = (x) => idx.get(x)?.name || idx.tests.get(x)?.name || x;
  const link = (x) => `<a href="${href(idx.get(x) ? 'e/' + x : idx.tests.get(x) ? 'realizza/collaudi' : x)}">${esc(name(x))}</a>`;

  // --- che cosa smette di funzionare se manca (simulazione, non osservazione) ---
  const affected = diff(base, fail, core.entities.filter((x) => x.kind === 'service' && x.activities?.length).map((x) => x.id)).filter((d) => d.id !== id);
  const selfImpact = e.kind === 'service' ? fail.impact(id) : [];
  const impacts = [...selfImpact, ...affected.flatMap((d) => fail.impact(d.id).map((i) => ({ ...i, svc: d.id })))];

  const procs = core.procedures.filter((p) => p.entities?.includes(id));
  const issues = core.issues.filter((q) => q.entities?.includes(id) || e.issues?.includes(q.id));
  const tests = core.tests.filter((t) => t.targets?.includes(id));
  const decisions = core.decisions.filter((d) => d.entities?.includes(id));
  const tasks = core.roadmap.tasks.filter((t) => t.entities?.includes(id));

  // --- relazioni ---
  const relOut = idx.out(id).filter((r) => r.type !== 'documented_by');
  const relIn = idx.in(id).filter((r) => r.type !== 'documented_by');
  const relRow = (r, dir) => {
    const other = dir === 'out' ? r.toId : r.fromId;
    const lab = REL_LABEL[r.type]?.[dir === 'out' ? 0 : 1] || r.type;
    return `<div class="rel"><span class="muted small">${esc(lab)}</span> ${link(other)}${r.label ? ` <span class="small muted">${esc(r.label)}</span>` : ''}${r.requirement === 'optional' ? ' <span class="ev">facoltativo</span>' : ''}${r.evidenceKind === 'unknown' ? ` ${ev('unknown')}` : ''}${r.mechanism ? ` <span class="ev">${mech(r.mechanism)}</span>` : ''}${r.condition ? `<br><span class="small">Condizioni: ${esc(condText(r.condition, idx))}</span>` : ''}${r.note ? `<br><span class="small muted">${esc(r.note)}</span>` : ''}</div>`;
  };
  const indirect = [...walk(idx, id, { dir: 'out' })].filter(([, v]) => v.depth > 1);
  const dependents = [...walk(idx, id, { dir: 'in', types: ['hosted_on', 'depends_on', 'stores_on'] })];

  // --- blocchi per tipo ---
  let specific = '';
  if (e.kind === 'service') {
    const acc = base.access(id);
    const rec = idx.out(id, 'recovers_on');
    specific += `<section aria-labelledby="h-use"><h2 id="h-use">Che cosa permette</h2>
<ul>${(e.activities || []).map((a) => `<li>${esc(a.text[0].toUpperCase() + a.text.slice(1))}${a.write ? ' <span class="small muted">(scrittura)</span>' : ''}</li>`).join('')}</ul>
<dl class="kv"><dt>Per chi</dt><dd>${esc(e.audience || 'n.d.')}</dd><dt>In casa</dt><dd>${acc.local ? st(acc.local.status) + ' ' + esc(acc.local.reasons.map((r) => r.text).join('; ')) : '—'}</dd>
<dt>Da fuori</dt><dd>${acc.remote ? st(acc.remote.status) + ' ' + esc(acc.remote.reasons.map((r) => r.text).join('; ') || (e.remote === 'caddy' ? 'attraverso Caddy su S1 e il filtro di M1' : '')) : 'non previsto'}</dd></dl>
<p class="small muted">Stati calcolati dal modello nella situazione di riferimento: non sono osservazioni dell'impianto.</p></section>`;
    if (rec.length || e.facts.rpoTarget) specific += `<section><h2>Subentro e obiettivi di recupero</h2>
${rec.map((r) => `<p>Può ripartire su ${link(r.toId)}${r.manual ? ' (manualmente)' : ''} solo se: <strong>${esc(condText(r.condition, idx))}</strong>.</p>`).join('') || '<p>Nessun subentro previsto: in caso di guasto si attende la macchina o si ripristina dalle copie.</p>'}
${e.facts.rpoTarget ? `<p><strong>RPO ${factValue(e.facts.rpoTarget)}</strong>: al massimo gli ultimi ${esc(e.facts.rpoTarget.value)} minuti di modifiche potrebbero andare persi. <strong>RTO ${factValue(e.facts.rtoTarget)}</strong>: tempo entro cui il servizio dovrebbe tornare. Sono <em>obiettivi di progetto</em>; nessun risultato misurato è registrato.</p>` : ''}</section>`;
  }
  if (e.kind === 'dataset') {
    const pr = base.protection(id);
    const where = idx.out(id, 'stores_on')[0];
    const users = idx.in(id, 'depends_on').map((r) => r.fromId);
    specific += `<section aria-labelledby="h-data"><h2 id="h-data">Dove sta e chi lo usa</h2>
<dl class="kv"><dt>Criticità</dt><dd>${esc(e.criticality || 'n.d.')}</dd><dt>Originale</dt><dd>${where ? link(where.toId) : 'non documentato'}${where?.evidenceKind === 'unknown' ? ' ' + ev('unknown') : ''}</dd><dt>Usato da</dt><dd>${users.map(link).join(', ') || '—'}</dd>
${e.excludedFromBackup ? '<dt>Backup</dt><dd><strong>Escluso dai backup</strong> per scelta di progetto.</dd>' : ''}<dt>Ultimo recupero provato</dt><dd>non documentato</dd></dl></section>
<section aria-labelledby="h-copies"><h2 id="h-copies">Copie e protezioni</h2>
<p class="small muted">Ridondanza, snapshot, sincronizzazione, replica, backup e copia offline sono cose diverse: ognuna protegge da guasti diversi.</p>
${table(['Protezione', 'Tipo', 'Stato della copia', 'Dominio di guasto'], pr.copies.map((c) => [link(c.id), mech(c.mechanism), esc(c.readiness.text), esc(c.sameDomain.text)]), { caption: 'Copie del dato' })}
${pr.copies.filter((c) => ['stesso_archivio', 'stessa_macchina', 'stesso_luogo'].includes(c.sameDomain.level)).length ? `<div class="limit">Un guasto ${esc([...new Set(pr.copies.filter((c) => ['stesso_archivio', 'stessa_macchina', 'stesso_luogo'].includes(c.sameDomain.level)).map((c) => c.sameDomain.level === 'stesso_luogo' ? 'del luogo (incendio, furto)' : c.sameDomain.level === 'stessa_macchina' ? 'della macchina' : 'del disco'))].join(' o '))} può colpire insieme l'originale e: ${pr.copies.filter((c) => ['stesso_archivio', 'stessa_macchina', 'stesso_luogo'].includes(c.sameDomain.level)).map((c) => esc(c.name)).join(', ')}.</div>` : ''}
${pr.copies.every((c) => c.readiness.level !== 'collaudata') ? `<div class="limit">Nessuna copia di questo dato ha un recupero collaudato: finché non c'è una prova, nessuna è un recupero garantito. <a href="${href('realizza/collaudi')}">Prove previste</a>.</div>` : ''}</section>`;
  }
  if (e.kind === 'copy') {
    const ready = copyReadiness(idx, { test: (t) => ({ value: core.testResults.some((r) => r.testId === t && r.outcome === 'superato') ? true : null, reasons: [] }) }, null, e);
    specific += `<section><h2>Che cosa protegge</h2><dl class="kv"><dt>Tipo</dt><dd>${mech(e.mechanism)}</dd><dt>Protegge</dt><dd>${(e.protects || []).map(link).join(', ')}</dd>${e.partial ? `<dt>Perimetro</dt><dd>${esc(e.partial)}</dd>` : ''}<dt>Stato</dt><dd>${esc(ready.text)}</dd></dl></section>`;
  }
  if (e.kind === 'storage') {
    specific += `<section><h2>Archivio</h2><dl class="kv"><dt>Ridondanza</dt><dd>${esc(e.redundancy || 'n.d.')}</dd><dt>Contiene</dt><dd>${idx.in(id, 'stores_on').map((r) => link(r.fromId)).join(', ') || '—'}</dd></dl>
${e.assignments ? `<h3>Assegnazione nel tempo</h3>${table(['Fase', 'Dove', 'Condizione', 'Natura'], e.assignments.map((a) => [esc(a.phase), esc(a.label), a.after ? `dopo il gate della fase <a href="${href('realizza')}">${esc(a.after)}</a>` : '—', ev(a.evidenceKind)]))}<p class="small muted">La stessa unità fisica ha un solo posto per fase: oggi e nel progetto non coincidono.</p>` : ''}</section>`;
  }
  if (e.kind === 'node' || e.kind === 'device') {
    const hosted = idx.in(id, 'hosted_on').map((r) => r.fromId);
    const links = idx.out(id, 'connected_to');
    specific += `<section aria-labelledby="h-role"><h2 id="h-role">Ruolo</h2>
<dl class="kv"><dt>Ruolo di progetto</dt><dd>${esc(e.title || '')}</dd><dt>Ruolo attuale attestato</dt><dd>${e.status.realization === 'installato' ? esc(e.title) : '<span class="muted">non attestato: l\'impianto 4.4 è in attuazione</span>'}</dd>
<dt>Accensione</dt><dd>${({ always: 'sempre acceso', on_demand: 'acceso a richiesta (spento non è guasto)', manual: 'avvio manuale', external: 'servizio esterno' })[e.power] || '—'}</dd>
${e.kind === 'node' ? `<dt>Voto nel cluster</dt><dd>${e.vote ? 'sì, 1 voto su 5' : 'no'}</dd>` : ''}<dt>Luogo</dt><dd>${e.place ? link(e.place) : '<span class="muted">non documentato</span>'}${e.facts.place?.evidenceKind === 'unknown' ? ' ' + ev('unknown') + ' <span class="small muted">' + esc(e.facts.place.note) + '</span>' : ''}</dd>
${hosted.length ? `<dt>Ospita</dt><dd>${hosted.map(link).join(', ')}</dd>` : ''}${links.length ? `<dt>Collegamenti</dt><dd>${links.map((r) => `${link(r.toId)}${r.label ? ` <span class="small muted">(${esc(r.label)})</span>` : ''}${r.evidenceKind === 'unknown' ? ' ' + ev('unknown') : ''}`).join('<br>')}</dd>` : ''}</dl></section>`;
    if (e.hardware) {
      const h = e.hardware;
      specific += `<details${open('intervenire')}><summary>Hardware documentato</summary>
${table(['Voce', 'Valore', 'Natura'], [['Piattaforma', factValue(h.platform), ev(h.platform.evidenceKind)], ['Processore', factValue(h.cpu), ev(h.cpu.evidenceKind)], ['Core / thread', `${factValue(h.cores)} / ${factValue(h.threads)}`, ev(h.cores.evidenceKind)], ['RAM', `${factValue(h.ram)} ${esc(h.ramType.value || '')}`, ev(h.ram.evidenceKind)], ['TDP del processore', `${factValue(h.tdp)} <span class="small muted">— non è il consumo alla presa</span>`, ev(h.tdp.evidenceKind)]])}
${h.disks.length ? table(['Disco', 'Q.tà', 'Funzione', 'Disposizione'], h.disks.map((d) => [esc(d.model) + (d.inventory ? ` <a class="code" href="${href('inventario/' + d.inventory)}">${esc(d.inventory)}</a>` : ''), esc(d.quantity), esc(d.role), esc(d.layout || '—')])) : ''}
${h.devices.length ? table(['Dispositivo', 'Porte', 'Funzione'], h.devices.map((d) => [esc(d.model), esc(d.ports || '—'), esc(d.role || '—')])) : ''}
<p class="small">Fonte: ${srcLinks(h.platform.sourceIds)} · Inventario: ${(e.inventory || []).map((c) => `<a class="code" href="${href('inventario/' + c)}">${esc(c)}</a>`).join(' ') || 'n.d.'}</p></details>`;
    }
  }

  const facts = Object.entries(e.facts || {});
  const html = `${ctxbar([['Esplora', 'esplora'], [kind(e.kind), e.kind === 'node' ? 'esplora/macchine' : e.kind === 'service' ? 'esplora/servizi' : ['dataset', 'storage', 'copy'].includes(e.kind) ? 'esplora/dati' : 'esplora'], [e.name]], app.prev && !app.prev.endsWith(`e/${id}`) ? { route: decodeURI(app.prev.slice(1)), label: 'Indietro' } : null)}
<div class="pagecols"><div>
<div class="ehead"><div class="ebadge k-${e.kind}" aria-hidden="true">${esc(e.id.length <= 4 ? e.id : ({ dataset: 'DATI', storage: 'DISCO', copy: 'COPIA', service: 'APP', network: 'RETE', device: 'HW', place: 'LUOGO', cluster: 'PVE', node: e.id.slice(0, 4) })[e.kind])}</div><div>
${phead({ eyebrow: `${kind(e.kind)} · <span class="code">${esc(e.id)}</span>`, title: `${e.name}${e.title && e.title !== e.name ? ' · ' + e.title : ''}`, lead: esc(e.oneLine) })}
${dims(e.status)}</div></div>
${(e.limits || []).map((l) => `<div class="limit">${esc(l)}</div>`).join('')}
<div class="phead"><div class="actions">
<a class="btn" href="${href('mappa?s=' + id)}">Vedi in mappa</a>
${['node', 'service', 'device', 'network', 'storage', 'copy'].includes(e.kind) ? `<a class="btn" href="${href('simula?f=' + id)}">Simula indisponibilità</a>` : ''}
${procs[0] ? `<a class="btn" href="${href('procedura/' + procs[0].id)}">Procedura: ${esc(procs[0].symptom)}</a>` : ''}
${e.kind === 'node' ? `<a class="btn ghost" href="${href('esplora/macchine?cmp=' + id)}">Confronta</a>` : ''}
<button class="btn ghost" type="button" data-action="fav" data-id="${esc(id)}" aria-pressed="${app.isFav(id)}"><span class="lbl">${app.isFav(id) ? 'Nei preferiti' : 'Aggiungi ai preferiti'}</span></button>
<button class="btn ghost" type="button" data-action="copy" data-text="${esc(`${e.id} · ${e.name} — ${location.origin}${location.pathname}#e/${e.id}`)}">Copia riferimento</button>
<a class="btn ghost" href="${href('contribuisci?e=' + id)}">Prepara una segnalazione</a></div></div>

${impacts.length || e.kind !== 'place' ? `<section aria-labelledby="h-miss"><h2 id="h-miss">Se manca</h2><p class="small"><span class="simtag">Simulazione</span> Calcolato dal modello con ${esc(e.name)} indisponibile; non è un'osservazione.</p>
${impacts.length ? `<ul>${impacts.slice(0, depth === 'capire' ? 6 : 30).map((i) => `<li>${st(i.status)} ${esc(i.text)}${i.svc ? ` <span class="small muted">(${esc(name(i.svc))})</span>` : ''}</li>`).join('')}</ul>${impacts.length > 6 && depth === 'capire' ? `<p class="small"><a href="${href('simula?f=' + id)}">Tutti gli effetti (${impacts.length}) nel simulatore</a></p>` : ''}` : '<p>Nessun servizio d\'uso cambia stato nel modello.</p>'}</section>` : ''}

${specific}

<details${open('approfondire')}><summary>Relazioni (${relOut.length + relIn.length})</summary>
<div class="relgroup">${relOut.length ? `<h3>Da questo elemento</h3>${relOut.map((r) => relRow(r, 'out')).join('')}` : ''}${relIn.length ? `<h3>Verso questo elemento</h3>${relIn.map((r) => relRow(r, 'in')).join('')}` : ''}</div>
${indirect.length ? `<h3>Dipendenze indirette</h3><p>${indirect.map(([x, v]) => `${link(x)} <span class="small muted">(via ${esc(name(v.via.fromId))})</span>`).join(', ')}</p>` : ''}
${dependents.length ? `<h3>Che cosa dipende da qui</h3><p>${dependents.map(([x]) => link(x)).join(', ')}</p>` : ''}</details>

<details${open('intervenire')}><summary>Dati, natura e fonti (${facts.length})</summary>
${facts.length ? table(['Voce', 'Valore', 'Natura', 'Fonte'], facts.map(([k, f]) => [esc(label(k)), `${factValue(f)}${f.note ? `<br><span class="small muted">${esc(f.note)}</span>` : ''}`, ev(f.evidenceKind), srcLinks(f.sourceIds)])) : '<p class="muted">Nessun dato strutturato oltre alle relazioni.</p>'}
<p class="small muted">Date: documento ${esc(core.meta.documentDate)} · modello ${esc(core.meta.modelDate)} · ultima verifica sul campo: nessuna registrata · misura: nessuna.</p></details>
</div>
<aside class="aside" aria-label="Contesto">
<div class="card"><h3>Stato in dettaglio</h3>
<dl class="kv"><dt>Decisione</dt><dd>${esc(e.status.decision || 'non indicata')}</dd><dt>Realizzazione</dt><dd>${esc(e.status.realization || 'non indicata')}</dd><dt>Osservazione</dt><dd>non rilevato</dd><dt>Accesso</dt><dd>pubblico</dd></dl>
${e.status.note ? `<p class="small">${esc(e.status.note)}</p>` : ''}${e.status.sourceIds.length ? `<p class="small">Fonte: ${srcLinks(e.status.sourceIds)}</p>` : ''}</div>
${e.cards.length ? `<div class="card"><h3>Schede</h3><ul class="list">${e.cards.map((c) => `<li><a href="${href(c)}"><span class="code">${esc(c)}</span> ${esc(idx.cards.get(c)?.title || '')}</a></li>`).join('')}</ul></div>` : ''}
${procs.length ? `<div class="card"><h3>Procedure</h3><ul class="list">${procs.map((p) => `<li><a href="${href('procedura/' + p.id)}">${esc(p.symptom)}</a></li>`).join('')}</ul></div>` : ''}
${tests.length ? `<div class="card"><h3>Collaudi</h3><ul class="list">${tests.map((t) => `<li>${esc(t.name)} ${badge(core.testResults.some((r) => r.testId === t.id && r.outcome === 'superato') ? 'available' : 'unknown', core.testResults.some((r) => r.testId === t.id) ? 'registrato' : 'non eseguito')}</li>`).join('')}</ul></div>` : ''}
${decisions.length || tasks.length ? `<div class="card"><h3>Progetto</h3><ul class="list">${decisions.map((d) => `<li><a href="${href('realizza/decisioni/' + d.id)}">${esc(d.title)}</a></li>`).join('')}${tasks.map((t) => `<li><a href="${href('realizza/attivita/' + t.id)}"><span class="code">${esc(t.id)}</span> ${esc(t.title)}</a></li>`).join('')}</ul></div>` : ''}
${issues.length ? `<div class="card"><h3>Questioni aperte</h3><ul class="list">${issues.map((q) => `<li><a href="${href('contribuisci/' + q.id)}">${esc(q.title)}</a></li>`).join('')}</ul></div>` : ''}
</aside></div>`;
  return { title: e.name, html };
}
void ST; void ST_LABEL; void sharesDomain;
