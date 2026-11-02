// Validazioni del modello. Restituisce {errors, warnings}: gli errori bloccano la build.
import { validateCondition, findCycles } from '../../app/lib/model.js';

const KIND = ['place', 'cluster', 'node', 'device', 'network', 'service', 'dataset', 'storage', 'copy'];
const EV = ['documented', 'declared', 'measured', 'estimated', 'simulated', 'unknown'];
const DEC = [null, 'ipotesi', 'proposta', 'approvata', 'superata', 'da_chiarire'];
const REAL = [null, 'da_acquisire', 'ordinato', 'disponibile', 'installato', 'configurato', 'collaudato', 'dismesso', 'non_attestato'];
const REL = ['hosted_on', 'depends_on', 'connected_to', 'stores_on', 'backs_up_to', 'replicates_to', 'protected_by', 'recovers_on', 'powered_by', 'located_in', 'documented_by', 'validated_by', 'blocked_by', 'member_of', 'wakes'];
const MECH = ['snapshot', 'replica', 'backup', 'offsite', 'offline', 'mirror', 'sync', 'transit'];
const ID = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export function validate(src, norm, { allowedCycles = [] } = {}) {
  const errors = [], warnings = [];
  const E = (m) => errors.push(m), W = (m) => warnings.push(m);
  const cardSet = new Set(src.cards.map((c) => c.code));
  const ids = new Map();
  const reg = (id, where) => { if (!ID.test(id)) E(`${where}: identificativo non valido «${id}»`); if (ids.has(id)) E(`identificativo duplicato «${id}» (${ids.get(id)} e ${where})`); ids.set(id, where); };
  norm.entities.forEach((e) => reg(e.id, 'entità'));
  src.tests.forEach((t) => reg(t.id, 'collaudo'));
  src.procedures.forEach((p) => reg(p.id, 'procedura'));
  src.decisions.forEach((d) => reg(d.id, 'decisione'));
  src.issues.forEach((d) => reg(d.id, 'incongruenza'));
  src.roadmap.tasks.forEach((t) => reg(t.id, 'attività'));
  src.roadmap.phases.forEach((t) => reg(t.id, 'fase'));
  src.connectors.forEach((c) => reg(c.id, 'connettore'));
  const known = (id) => ids.has(id) || cardSet.has(id) || id === 'ARCA';
  const checkCards = (list, where) => (list || []).forEach((c) => { if (!cardSet.has(c)) E(`${where}: scheda inesistente ${c}`); });
  const checkFact = (f, where) => {
    if (!EV.includes(f.evidenceKind)) E(`${where}: natura del valore non valida (${f.evidenceKind})`);
    if (f.evidenceKind === 'unknown' && f.value !== null) E(`${where}: valore sconosciuto deve essere null`);
    if (f.value === null && f.evidenceKind !== 'unknown' && !f.note) W(`${where}: valore nullo senza nota`);
    if (typeof f.value === 'number' && !f.unit && !/cores|threads|Votes|quorum/.test(where)) W(`${where}: numero senza unità`);
    checkCards(f.sourceIds, where);
  };
  const inv = new Map(src.legacy.inventory.map((i) => [i.code, i]));
  const invUse = new Map();
  for (const e of norm.entities) {
    const w = `entità ${e.id}`;
    if (!KIND.includes(e.kind)) E(`${w}: tipo non valido ${e.kind}`);
    if (!e.name) E(`${w}: nome mancante`);
    if (!e.oneLine) W(`${w}: sintesi mancante`);
    if (!DEC.includes(e.status.decision)) E(`${w}: decisione non valida ${e.status.decision}`);
    if (!REAL.includes(e.status.realization)) E(`${w}: realizzazione non valida ${e.status.realization}`);
    checkCards(e.cards, w); checkCards(e.status.sourceIds, `${w}.status`);
    for (const [k, f] of Object.entries(e.facts)) checkFact(f, `${w}.facts.${k}`);
    for (const s of e.scopes || []) if (!src.scopes.some((x) => x.id === s)) E(`${w}: ambito inesistente ${s}`);
    if (e.place && !ids.has(e.place)) E(`${w}: luogo inesistente ${e.place}`);
    if (e.kind === 'copy' && !MECH.includes(e.mechanism)) E(`${w}: meccanismo non valido ${e.mechanism}`);
    if (e.hardwareRef && !e.hardware) W(`${w}: hardware ${e.hardwareRef} non trovato nei dati 4.4`);
    for (const c of e.inventory || []) {
      if (!inv.has(c)) E(`${w}: codice inventario inesistente ${c}`);
      else if (e.kind === 'node' || e.kind === 'device') invUse.set(c, [...(invUse.get(c) || []), e.id]);
    }
    const phases = (e.assignments || []).map((a) => a.phase);
    if (new Set(phases).size !== phases.length) E(`${w}: due assegnazioni nella stessa fase`);
    for (const i of e.issues || []) if (!ids.has(i)) E(`${w}: incongruenza inesistente ${i}`);
  }
  // quantità: un'unità non può essere assegnata a più macchine della sua quantità
  for (const [code, users] of invUse) {
    const q = parseInt(inv.get(code).quantity, 10);
    if (Number.isFinite(q) && q > 0 && users.length > q) E(`inventario ${code}: ${users.length} assegnazioni (${users.join(', ')}) su quantità ${q}`);
    if (/ALIAS/.test(inv.get(code).inventory_state || '')) W(`inventario ${code}: è un alias, usare il codice principale`);
  }
  for (const r of norm.relations) {
    const w = `relazione ${r.id}`;
    if (!REL.includes(r.type)) E(`${w}: tipo non valido`);
    if (!known(r.fromId)) E(`${w}: origine inesistente ${r.fromId}`);
    if (!known(r.toId)) E(`${w}: destinazione inesistente ${r.toId}`);
    if (!EV.includes(r.evidenceKind)) E(`${w}: natura non valida`);
    if (r.condition) validateCondition(r.condition).forEach((m) => E(`${w}: ${m}`));
    if (r.condition) JSON.stringify(r.condition).replace(/"(test|quorumAt|entityUp|decision)":"([^"]+)"/g, (_, k, v) => { if (!known(v)) E(`${w}: condizione su elemento inesistente ${v}`); });
    checkCards(r.sourceIds, w);
  }
  // cicli
  for (const c of findCycles(norm.relations)) {
    const key = c.join('>');
    if (!allowedCycles.some((a) => a.cycle.join('>') === key)) E(`ciclo di dipendenze non ammesso: ${c.join(' → ')}`);
  }
  // roadmap
  for (const t of src.roadmap.tasks) {
    if (!src.roadmap.phases.some((p) => p.id === t.phase)) E(`attività ${t.id}: fase inesistente`);
    for (const x of [...(t.after || []), ...(t.tests || []), ...(t.entities || []), ...(t.decisions || []), ...(t.decides || []), ...(t.procedures || [])]) if (!known(x)) E(`attività ${t.id}: riferimento inesistente ${x}`);
    for (const n of t.needs || []) if (!src.legacy.config.acquisitions.some((a) => a.id === n.acq)) E(`attività ${t.id}: acquisto inesistente ${n.acq}`);
  }
  for (const p of src.roadmap.phases) for (const t of p.gateTests || []) if (!ids.has(t)) E(`fase ${p.id}: collaudo inesistente ${t}`);
  for (const t of src.tests) { checkCards(t.cards, `collaudo ${t.id}`); for (const x of [...(t.targets || []), ...(t.requires || [])]) if (!known(x)) E(`collaudo ${t.id}: riferimento inesistente ${x}`); }
  for (const r of src.testResults) { if (!ids.has(r.testId)) E(`esito di collaudo per test inesistente ${r.testId}`); if (r.outcome === 'superato' && !r.evidence) E(`esito ${r.testId}: «superato» senza evidenza`); }
  for (const d of src.decisions) { checkCards(d.cards, `decisione ${d.id}`); for (const x of [...(d.entities || []), ...(d.blocks || [])]) if (!known(x)) E(`decisione ${d.id}: riferimento inesistente ${x}`); if (d.supersededBy && !ids.has(d.supersededBy)) E(`decisione ${d.id}: sostituta inesistente`); }
  for (const p of src.procedures) { checkCards(p.cards, `procedura ${p.id}`); for (const x of p.entities || []) if (!known(x)) E(`procedura ${p.id}: entità inesistente ${x}`); if (!p.steps?.length) E(`procedura ${p.id}: nessun passaggio`); for (const s of p.steps) if (s.cmd && (!s.where || !s.does || !s.expect)) E(`procedura ${p.id}: comando senza «dove», «cosa fa» o «risultato atteso»`); }
  for (const p of src.paths) for (const s of p.steps) { if (s.entity && !known(s.entity)) E(`percorso ${p.id}: entità inesistente ${s.entity}`); checkCards(s.cards, `percorso ${p.id}`); if (s.ev === 'unknown' && !s.gap) W(`percorso ${p.id}: passaggio sconosciuto senza domanda collegata`); if (s.gap && !ids.has(s.gap)) E(`percorso ${p.id}: domanda inesistente ${s.gap}`); }
  for (const s of src.synonyms.groups) for (const x of s.entities) if (!known(x)) E(`sinonimi: entità inesistente ${x}`);
  for (const sc of src.scenarios) for (const ev of sc.events) if (!known(ev.id)) E(`scenario ${sc.id}: elemento inesistente ${ev.id}`);
  // corpus: ogni scheda in un solo gruppo, ogni coda ha la sua scheda
  const seen = new Map();
  for (const g of src.groups) {
    for (const c of g.codes) { if (seen.has(c)) E(`scheda ${c} in due gruppi (${seen.get(c)}, ${g.id})`); seen.set(c, g.id); if (!cardSet.has(c)) E(`gruppo ${g.id}: scheda inesistente ${c}`); }
    for (const t of Object.keys(g.tails)) if (!g.codes.includes(t)) E(`gruppo ${g.id}: coda per scheda estranea ${t}`);
  }
  for (const c of src.cards) if (!seen.has(c.code)) E(`scheda ${c.code} senza testo leggibile`);
  return { errors, warnings };
}
