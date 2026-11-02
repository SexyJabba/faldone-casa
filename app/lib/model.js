// Indice del modello: costruito una volta dai dati generati (data/core.json).
// Modulo puro, usato dal browser e dai test Node.

export const KINDS = {
  place: 'Luogo', cluster: 'Cluster', node: 'Macchina', device: 'Apparato', network: 'Rete',
  service: 'Servizio', dataset: 'Dati', storage: 'Archivio', copy: 'Protezione dati',
};
export const DECISION = { ipotesi: 'Ipotesi', proposta: 'Proposta', approvata: 'Approvata', superata: 'Superata', da_chiarire: 'Da chiarire' };
export const REALIZATION = {
  da_acquisire: 'Da acquisire', ordinato: 'Ordinato / dichiarato', disponibile: 'Disponibile', installato: 'Installato',
  configurato: 'Configurato', collaudato: 'Collaudato', dismesso: 'Dismesso', non_attestato: 'Installazione non attestata',
};
export const OBSERVATION = {
  non_rilevato: 'Non rilevato', disponibile: 'Disponibile', degradato: 'Degradato', indisponibile: 'Indisponibile',
  spento: 'Spento intenzionalmente', scaduto: 'Dato scaduto',
};
export const EVIDENCE = {
  documented: 'Documentato', declared: 'Dichiarato', measured: 'Misurato', estimated: 'Stimato', simulated: 'Simulato', unknown: 'Sconosciuto',
};
export const MECHANISM = {
  snapshot: 'Snapshot', replica: 'Replica', backup: 'Backup', offsite: 'Copia fuori casa', offline: 'Copia offline',
  mirror: 'Ridondanza (mirror)', sync: 'Sincronizzazione', transit: 'Deposito di transizione',
};
export const REL_LABEL = {
  hosted_on: ['gira su', 'ospita'], depends_on: ['dipende da', 'serve a'], connected_to: ['collegato a', 'collegato a'],
  stores_on: ['salva su', 'contiene'], backs_up_to: ['copiato in', 'copia di'], replicates_to: ['replicato in', 'replica di'],
  protected_by: ['protetto da', 'protegge'], recovers_on: ['può ripartire su', 'riserva di'], powered_by: ['alimentato da', 'alimenta'],
  located_in: ['si trova in', 'ospita'], documented_by: ['documentato in', 'documenta'], validated_by: ['provato da', 'prova'],
  blocked_by: ['bloccato da', 'blocca'], member_of: ['membro di', 'membri'], wakes: ['accende', 'acceso da'],
};

export function buildIndex(core) {
  const byId = new Map();
  for (const e of core.entities) byId.set(e.id, e);
  const out = new Map(), inc = new Map();
  for (const r of core.relations) {
    if (!out.has(r.fromId)) out.set(r.fromId, []);
    if (!inc.has(r.toId)) inc.set(r.toId, []);
    out.get(r.fromId).push(r); inc.get(r.toId).push(r);
  }
  const tests = new Map((core.tests || []).map((t) => [t.id, t]));
  const procedures = new Map((core.procedures || []).map((p) => [p.id, p]));
  const decisions = new Map((core.decisions || []).map((d) => [d.id, d]));
  const issues = new Map((core.issues || []).map((d) => [d.id, d]));
  const cards = new Map((core.cards || []).map((c) => [c.code, c]));
  const aliases = core.aliases || {};
  const idx = {
    core, byId, tests, procedures, decisions, issues, cards, aliases,
    get: (id) => byId.get(id),
    out: (id, type) => (out.get(id) || []).filter((r) => !type || r.type === type),
    in: (id, type) => (inc.get(id) || []).filter((r) => !type || r.type === type),
    any: (id) => byId.get(id) || tests.get(id) || procedures.get(id) || decisions.get(id) || issues.get(id) || null,
  };
  return idx;
}

/** Tutti gli elementi raggiungibili seguendo le relazioni indicate (dipendenze indirette). */
export function walk(idx, startId, { dir = 'out', types = ['hosted_on', 'depends_on', 'stores_on'], max = 6 } = {}) {
  const seen = new Map([[startId, { depth: 0, via: null }]]);
  let frontier = [startId];
  for (let d = 1; d <= max && frontier.length; d++) {
    const next = [];
    for (const id of frontier) {
      const rels = dir === 'out' ? idx.out(id) : idx.in(id);
      for (const r of rels) {
        if (!types.includes(r.type)) continue;
        const other = dir === 'out' ? r.toId : r.fromId;
        if (seen.has(other)) continue;
        seen.set(other, { depth: d, via: r });
        next.push(other);
      }
    }
    frontier = next;
  }
  seen.delete(startId);
  return seen;
}

/** Ricerca di cicli nel grafo delle dipendenze. Restituisce la lista dei cicli trovati. */
export function findCycles(relations, types = ['hosted_on', 'depends_on', 'stores_on']) {
  const g = new Map();
  for (const r of relations) {
    if (!types.includes(r.type)) continue;
    if (!g.has(r.fromId)) g.set(r.fromId, []);
    g.get(r.fromId).push(r.toId);
  }
  const color = new Map(), stack = [], cycles = [];
  const visit = (n) => {
    color.set(n, 1); stack.push(n);
    for (const m of g.get(n) || []) {
      if (color.get(m) === 1) cycles.push(stack.slice(stack.indexOf(m)).concat(m));
      else if (!color.get(m)) visit(m);
    }
    stack.pop(); color.set(n, 2);
  };
  for (const n of g.keys()) if (!color.get(n)) visit(n);
  return cycles;
}

// ---- Condizioni strutturate -------------------------------------------------
// Forma ammessa (nessun codice eseguibile):
//   {all:[C...]} | {any:[C...]} | {not:C}
//   {test:"T-ID"}            collaudo superato (registro o ipotesi dello scenario)
//   {quorumAt:"NODE"}        il nodo è in una partizione con quorum
//   {factKnown:"ENT.fatto"}  il fatto ha un valore noto
//   {decision:"DEC-ID", is:"approvata"}
//   {entityUp:"ID"}
const COND_KEYS = ['all', 'any', 'not', 'test', 'quorumAt', 'factKnown', 'decision', 'entityUp'];
export function validateCondition(c, path = 'cond') {
  const errs = [];
  if (!c || typeof c !== 'object' || Array.isArray(c)) return [`${path}: condizione non valida`];
  const keys = Object.keys(c).filter((k) => k !== 'is');
  if (keys.length !== 1 || !COND_KEYS.includes(keys[0])) return [`${path}: chiave non ammessa (${keys.join(',')})`];
  const k = keys[0];
  if (k === 'all' || k === 'any') {
    if (!Array.isArray(c[k]) || !c[k].length) errs.push(`${path}.${k}: elenco vuoto`);
    else c[k].forEach((x, i) => errs.push(...validateCondition(x, `${path}.${k}[${i}]`)));
  } else if (k === 'not') errs.push(...validateCondition(c.not, `${path}.not`));
  else if (typeof c[k] !== 'string') errs.push(`${path}.${k}: atteso identificativo`);
  return errs;
}

/** Valuta una condizione. ctx fornisce le funzioni di base. Risultato: {value: true|false|null, reasons:[...]} (null = indeterminato). */
export function evalCondition(c, ctx) {
  if (c.all) {
    const rs = c.all.map((x) => evalCondition(x, ctx));
    const value = rs.some((r) => r.value === false) ? false : rs.some((r) => r.value === null) ? null : true;
    return { value, reasons: rs.flatMap((r) => r.reasons) };
  }
  if (c.any) {
    const rs = c.any.map((x) => evalCondition(x, ctx));
    const value = rs.some((r) => r.value === true) ? true : rs.some((r) => r.value === null) ? null : false;
    return { value, reasons: rs.flatMap((r) => r.reasons) };
  }
  if (c.not) { const r = evalCondition(c.not, ctx); return { value: r.value === null ? null : !r.value, reasons: r.reasons }; }
  if (c.test) return ctx.test(c.test);
  if (c.quorumAt) return ctx.quorumAt(c.quorumAt);
  if (c.factKnown) return ctx.factKnown(c.factKnown);
  if (c.decision) return ctx.decision(c.decision, c.is || 'approvata');
  if (c.entityUp) return ctx.entityUp(c.entityUp);
  return { value: null, reasons: ['condizione non riconosciuta'] };
}
