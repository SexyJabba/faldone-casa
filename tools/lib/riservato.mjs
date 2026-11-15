// Controlli sul contenuto riservato in chiaro, prima di cifrarlo. Nessun dato inventato: riferimenti esistenti, numeri veri.
export function validatePlan(id, plan, entSet, impIds) {
  const errs = [], seen = new Set();
  for (const r of plan.rooms || []) {
    if (!/^[a-z-]+$/.test(r.id) || seen.has(r.id)) errs.push(`impianto ${id}: stanza con identificativo non valido o ripetuto (${r.id})`);
    seen.add(r.id);
    for (const k of ['area', 'hmin', 'hmax', 'x', 'z', 'w', 'd']) if (!Number.isFinite(r[k])) errs.push(`impianto ${id}: stanza ${r.id}, ${k} non numerico`);
    if (r.w <= 0 || r.d <= 0 || r.hmin > r.hmax) errs.push(`impianto ${id}: stanza ${r.id}, dimensioni incoerenti`);
    if (r.place && !entSet.has(r.place)) errs.push(`impianto ${id}: stanza ${r.id}, luogo inesistente ${r.place}`);
    if (r.impianto && !impIds.has(r.impianto)) errs.push(`impianto ${id}: stanza ${r.id}, impianto inesistente ${r.impianto}`);
  }
  return errs;
}

/** data: {v, impianti:{id:{…}}, entita:{id:[{label,value,note?}]}}; pubImpianti: impianti pubblici; entSet: identificativi del modello. */
export function validatePrivate(data, pubImpianti, entSet) {
  const errs = [];
  if (!data || data.v !== 1) return ['contenuto riservato: versione mancante o non riconosciuta'];
  const impIds = new Set(pubImpianti.map((i) => i.id));
  for (const [id, part] of Object.entries(data.impianti || {})) {
    const pub = pubImpianti.find((i) => i.id === id);
    if (!pub) { errs.push(`impianto riservato ${id}: manca la scheda pubblica in content/impianti/impianti.json`); continue; }
    if (!pub.riservato) errs.push(`impianto ${id}: la scheda pubblica deve avere "riservato": true`);
    if (part.status?.decision === 'approvata') errs.push(`impianto ${id}: un impianto non può risultare approvato senza decisione registrata`);
    if (part.plan) errs.push(...validatePlan(id, part.plan, entSet, impIds));
    if (part.sala) errs.push(...validateSala(id, part.sala, entSet));
  }
  for (const [id, rows] of Object.entries(data.entita || {})) {
    if (!entSet.has(id)) errs.push(`dati riservati: elemento inesistente ${id}`);
    if (!Array.isArray(rows) || rows.some((r) => !r || typeof r.label !== 'string' || !r.label || r.value === undefined)) errs.push(`dati riservati di ${id}: ogni riga vuole label e value (null se non noto)`);
  }
  return errs;
}

/** Sala server riservata: pezzi con riferimenti esistenti, colonne coerenti, proposta dentro le colonne. */
export function validateSala(id, sala, entSet) {
  const errs = [], ids = new Set(), cols = new Map((sala.colonne || []).map((c) => [c.id, c]));
  for (const c of sala.colonne || []) if (!Number.isInteger(c.u_max) || c.u_max < 1) errs.push(`impianto ${id}: colonna ${c.id} senza altezza massima`);
  for (const p of sala.pezzi || []) {
    if (ids.has(p.id)) errs.push(`impianto ${id}: pezzo ripetuto ${p.id}`);
    ids.add(p.id);
    if (p.ref && !entSet.has(p.ref)) errs.push(`impianto ${id}: il pezzo ${p.id} cita un elemento inesistente (${p.ref})`);
    if (!['rack', 'terra', 'ripiano'].includes(p.tipo)) errs.push(`impianto ${id}: pezzo ${p.id} di tipo sconosciuto`);
    if (p.tipo !== 'ripiano' && !(Number.isInteger(p.u) && p.u > 0)) errs.push(`impianto ${id}: pezzo ${p.id} senza altezza in unità`);
  }
  for (const [pid, pos] of Object.entries(sala.proposta?.pos || {})) {
    if (!ids.has(pid)) errs.push(`impianto ${id}: la proposta colloca un pezzo inesistente (${pid})`);
    else if (cols.has(pos[0])) { const u = (sala.pezzi.find((x) => x.id === pid).u || 0); if (pos[1] < 1 || pos[1] + u - 1 > cols.get(pos[0]).u_max) errs.push(`impianto ${id}: nella proposta ${pid} esce dalla colonna`); }
  }
  return errs;
}
