// Motore di simulazione delle dipendenze e dei guasti.
// Funzioni pure: nessun accesso a DOM, rete o impianto reale. Ogni esito porta i motivi.
import { evalCondition } from './model.js';

export const ST = { AVAILABLE: 'available', ON_DEMAND: 'on_demand', DEGRADED: 'degraded', UNKNOWN: 'unknown', BLOCKED: 'blocked' };
export const ST_LABEL = {
  available: 'Disponibile', on_demand: 'Su richiesta', degraded: 'Limitato', unknown: 'Non determinabile', blocked: 'Fermo',
};
const RANK = { available: 0, on_demand: 1, degraded: 2, unknown: 3, blocked: 4 };
export const worst = (...xs) => xs.reduce((a, b) => (RANK[b] > RANK[a] ? b : a), ST.AVAILABLE);

const HOME_PLACES = new Set(['P-SALA', 'P-LAB', 'P-CASA', 'P-CUCINA', 'P-CAMERA', 'P-SALONE', 'P-INGRESSO']);

/** Normalizza uno scenario: {events:[{type:'fail'|'off'|'on'|'copy'|'assumeTest'|'cut'|'haActive', id, state}]} */
export function normalizeScenario(s = {}) {
  const sc = { fail: new Set(), off: new Set(), on: new Set(), cut: new Set(), assume: new Set(), assumeFact: new Set(), copy: new Map(), haActive: false };
  for (const e of s.events || []) {
    if (e.type === 'fail') sc.fail.add(e.id);
    else if (e.type === 'off') sc.off.add(e.id);
    else if (e.type === 'on') sc.on.add(e.id);
    else if (e.type === 'cut') sc.cut.add(e.id);
    else if (e.type === 'assumeTest') sc.assume.add(e.id);
    else if (e.type === 'assumeFact') sc.assumeFact.add(e.id);
    else if (e.type === 'copy') sc.copy.set(e.id, e.state || 'missing');
    else if (e.type === 'haActive') sc.haActive = true;
  }
  return sc;
}

export function simulate(idx, scenario = {}) {
  const sc = normalizeScenario(scenario);
  const memo = new Map();
  const inProgress = new Set();
  const results = (id) => memo.get(id);
  const name = (id) => idx.get(id)?.name || idx.tests.get(id)?.name || id;
  const passedTests = new Set((idx.core.testResults || []).filter((r) => r.outcome === 'superato').map((r) => r.testId));

  // ---------- quorum per partizione ----------
  const members = idx.in('CLUSTER', 'member_of').map((r) => r.fromId);
  let quorumInfo = null;
  function computeQuorum() {
    if (quorumInfo) return quorumInfo;
    quorumInfo = { pending: true };
    const need = idx.get('CLUSTER')?.facts?.quorum?.value ?? 3;
    const swStatus = evalEntity('SW').status;
    const hubUp = swStatus === ST.AVAILABLE, hubUnknown = swStatus === ST.UNKNOWN;
    const info = { need, total: members.length, hub: [], hubMaybe: [], isolated: [], down: [], members: {} };
    for (const m of members) {
      const s = evalEntity(m).status;
      if (s === ST.BLOCKED || s === ST.ON_DEMAND) { info.down.push(m); info.members[m] = 'down'; continue; }
      const powerUnknown = s === ST.UNKNOWN;
      const links = idx.out(m, 'connected_to').filter((r) => r.toId === 'SW' && !sc.cut.has(r.id));
      const known = links.some((r) => r.evidenceKind !== 'unknown');
      const maybe = !known && links.some((r) => r.evidenceKind === 'unknown');
      if (hubUp && known && !powerUnknown) { info.hub.push(m); info.members[m] = 'hub'; }
      else if ((hubUp && (maybe || (known && powerUnknown))) || (hubUnknown && (known || maybe))) { info.hubMaybe.push(m); info.members[m] = 'maybe'; }
      else { info.isolated.push(m); info.members[m] = 'isolated'; }
    }
    info.min = info.hub.length; info.max = info.hub.length + info.hubMaybe.length;
    info.hubQuorum = info.min >= need ? true : info.max >= need ? null : false;
    quorumInfo = info;
    return info;
  }
  function quorumAt(nodeId) {
    const q = computeQuorum();
    const where = q.members[nodeId];
    if (!where) return { value: false, reasons: [`${name(nodeId)} non è membro del nucleo`] };
    if (where === 'down') return { value: false, reasons: [`${name(nodeId)} non è in funzione: non partecipa a nessuna partizione`] };
    if (where === 'maybe' && q.hubQuorum !== false && q.max >= q.need) return { value: null, reasons: [`la partecipazione di ${name(nodeId)} alla partizione non è determinabile (collegamento o alimentazione incerti)`] };
    if (where === 'isolated') return { value: false, reasons: [`${name(nodeId)} è isolato dagli altri membri: 1 voto su ${q.need} necessari`] };
    if (where === 'hub') {
      if (q.hubQuorum === true) return { value: true, reasons: [`partizione con ${q.min} voti certi su ${q.need} necessari`] };
      if (q.hubQuorum === null) return { value: null, reasons: [`partizione con ${q.min} voti certi e ${q.max - q.min} incerti (collegamento non documentato): servono ${q.need}`] };
      return { value: false, reasons: [`partizione con ${q.max} voti: ne servono ${q.need}`] };
    }
    // collegamento incerto
    if (q.max >= q.need) return { value: null, reasons: [`il collegamento di ${name(nodeId)} alla rete del cluster non è documentato`] };
    return { value: false, reasons: [`anche se collegato, la partizione avrebbe ${q.max} voti su ${q.need}`] };
  }

  const ctx = {
    test: (id) => {
      if (passedTests.has(id)) return { value: true, reasons: [`collaudo ${id} superato (registro)`] };
      if (sc.assume.has(id)) return { value: true, reasons: [`collaudo ${id} supposto superato (ipotesi dello scenario)`], hypothetical: true };
      return { value: null, reasons: [`collaudo «${name(id)}» (${id}) non ancora eseguito`] };
    },
    quorumAt,
    factKnown: (path) => {
      const [eid, f] = path.split('.');
      const v = idx.get(eid)?.facts?.[f];
      if (sc.assumeFact.has(path)) return { value: true, reasons: [`dato supposto sufficiente: ${name(eid)} · ${f} (ipotesi dello scenario)`], hypothetical: true };
      return v && v.value !== null && v.value !== undefined ? { value: true, reasons: [] } : { value: null, reasons: [`dato mancante: ${name(eid)} · ${v?.note || f}`] };
    },
    decision: (id, is) => {
      const d = idx.decisions.get(id);
      return d?.status === is ? { value: true, reasons: [] } : { value: false, reasons: [`decisione ${id}: ${d?.status || 'assente'}`] };
    },
    entityUp: (id) => ({ value: evalEntity(id).status === ST.AVAILABLE, reasons: [] }),
  };

  function powerState(e) {
    const grid = sc.fail.has('GRID');
    if (!grid) return null;
    const place = e.place ? idx.get(e.place) : null;
    const home = e.place && (HOME_PLACES.has(e.place) || HOME_PLACES.has(place?.parent));
    if (!home) return null;
    const viaPS = idx.out(e.id, 'powered_by').some((r) => r.toId === 'PS-RACK');
    return {
      status: ST.UNKNOWN,
      text: viaPS ? 'blackout: alimentato dalla power station del rack, autonomia non dichiarata' : 'blackout: eventuale UPS dei client con modello e capacità n.d.',
    };
  }

  function evalEntity(id) {
    if (memo.has(id)) return memo.get(id);
    const e = idx.get(id);
    if (!e) { const r = { id, status: ST.UNKNOWN, reasons: [{ text: `elemento ${id} non presente nel modello` }] }; memo.set(id, r); return r; }
    if (inProgress.has(id)) return { id, status: ST.UNKNOWN, reasons: [{ text: `ciclo di dipendenze che passa da ${e.name}` }], cycle: true };
    inProgress.add(id);
    const res = compute(e);
    inProgress.delete(id);
    memo.set(id, res);
    return res;
  }

  function compute(e) {
    const reasons = [];
    let status = ST.AVAILABLE;
    const add = (s, text, cause = null, extra = {}) => { status = worst(status, s); reasons.push({ status: s, text, cause, ...extra }); };

    if (sc.fail.has(e.id)) return { id: e.id, status: ST.BLOCKED, reasons: [{ status: ST.BLOCKED, text: 'guasto simulato', kind: 'fail' }] };

    // macchine e alimentazione
    if (e.kind === 'node' || e.kind === 'device') {
      if (sc.off.has(e.id)) return { id: e.id, status: ST.BLOCKED, intentional: true, reasons: [{ status: ST.BLOCKED, text: 'spento intenzionalmente (manutenzione pianificata)', kind: 'off' }] };
      const p = powerState(e);
      if (p) add(p.status, p.text, 'GRID');
      if (e.power === 'on_demand' && !sc.on.has(e.id)) {
        const wakers = idx.in(e.id, 'wakes').map((r) => r.fromId);
        if (wakers.length) {
          const ok = wakers.filter((w) => evalEntity(w).status === ST.AVAILABLE);
          const sw = evalEntity('SW').status;
          if (ok.length && sw === ST.AVAILABLE) add(ST.ON_DEMAND, `spento in attesa di richiesta; si accende con Wake-on-LAN da ${ok.map(name).join(' o ')} (tempo di risveglio non misurato)`, null, { kind: 'sleep' });
          else add(ST.BLOCKED, `spento e nessun mittente di accensione raggiungibile (${wakers.map(name).join(', ')}${sw !== ST.AVAILABLE ? '; switch fermo' : ''})`, ok[0] || wakers[0]);
        } else add(ST.ON_DEMAND, 'si accende a mano quando serve', null, { kind: 'sleep' });
      }
      if (e.power === 'manual' && !sc.on.has(e.id)) add(ST.ON_DEMAND, 'riserva da avviare manualmente', null, { kind: 'sleep' });
    }
    if (e.determinable === false) add(ST.UNKNOWN, e.undeterminedReason || 'funzionamento non documentato', null, { kind: 'gap' });

    // ospite
    let failover = null;
    const hosts = idx.out(e.id, 'hosted_on');
    for (const h of hosts) {
      const hs = evalEntity(h.toId);
      if (hs.status === ST.AVAILABLE) {
        const hostEnt = idx.get(h.toId);
        if (hostEnt?.vote && e.kind === 'service') {
          const q = quorumAt(h.toId);
          if (q.value === false) {
            if (sc.haActive) add(ST.UNKNOWN, `${name(h.toId)} è in una partizione senza quorum; con HA attiva il comportamento dipende dal fencing, non documentato`, 'CLUSTER');
            else add(ST.DEGRADED, `${name(h.toId)} è in una partizione senza quorum: il guest già avviato può continuare (HA non attiva), ma non si possono avviare, spostare o riconfigurare guest`, 'CLUSTER');
          }
        }
        continue;
      }
      if (hs.status === ST.ON_DEMAND) { add(ST.ON_DEMAND, `gira su ${name(h.toId)}, acceso su richiesta`, h.toId); continue; }
      // host fermo o incerto: subentro?
      const rec = idx.out(e.id, 'recovers_on');
      const options = rec.map((r) => {
        const ts = evalEntity(r.toId);
        const c = r.condition ? evalCondition(r.condition, ctx) : { value: true, reasons: [] };
        const startable = ts.status === ST.AVAILABLE || (r.manual && ts.status === ST.ON_DEMAND);
        if (!startable) return { r, s: ST.BLOCKED, text: `la riserva ${name(r.toId)} non è disponibile`, why: c.reasons };
        if (c.value === true) {
          const rpo = e.facts?.rpoTarget?.value;
          return { r, s: ST.DEGRADED, text: r.manual ? `subentro manuale su ${name(r.toId)}` : `ripartito su ${name(r.toId)} dalla replica${rpo ? `: si possono perdere fino a ${rpo} minuti di dati (obiettivo, non misurato)` : ''}`, why: c.reasons, hypothetical: c.hypothetical };
        }
        if (c.value === null) return { r, s: ST.UNKNOWN, text: `subentro su ${name(r.toId)} previsto ma non garantito`, why: c.reasons };
        return { r, s: ST.BLOCKED, text: `subentro su ${name(r.toId)} non possibile`, why: c.reasons };
      });
      const best = options.sort((a, b) => RANK[a.s] - RANK[b.s])[0];
      const hostText = hs.intentional ? `${name(h.toId)} è spento per manutenzione` : hs.status === ST.UNKNOWN ? `lo stato di ${name(h.toId)} non è determinabile` : `${name(h.toId)} non è in funzione`;
      if (best && RANK[best.s] < RANK[ST.BLOCKED]) {
        failover = best.r.toId;
        add(best.s, `${hostText}; ${best.text}`, best.r.toId, { why: best.why, recover: best.r.toId });
      } else {
        add(hs.status === ST.UNKNOWN ? ST.UNKNOWN : ST.BLOCKED, `${hostText}${best ? `; ${best.text}` : ''}`, h.toId, { why: best?.why });
      }
    }

    // dipendenze
    for (const r of [...idx.out(e.id, 'depends_on'), ...idx.out(e.id, 'stores_on')]) {
      const target = idx.get(r.toId);
      if (failover && (target?.kind === 'dataset' || target?.kind === 'storage')) {
        reasons.push({ status: ST.AVAILABLE, text: `usa la replica su ${name(failover)} al posto di ${target.name}`, cause: r.toId });
        continue;
      }
      if (e.kind === 'copy' && r.type === 'depends_on' && idx.get(r.toId)?.kind === 'copy') {
        // la copia remota si fa dopo una copia coerente: non blocca la disponibilità di ciò che è già stato copiato
        continue;
      }
      const ds = evalEntity(r.toId);
      if (ds.status === ST.AVAILABLE) continue;
      const optional = r.requirement === 'optional';
      const unknownRel = r.evidenceKind === 'unknown';
      let s = ds.status;
      if (optional) s = ds.status === ST.ON_DEMAND ? ST.AVAILABLE : ST.DEGRADED;
      else if (unknownRel) s = worst(ST.UNKNOWN, ds.status === ST.ON_DEMAND ? ST.ON_DEMAND : ST.UNKNOWN);
      if (s === ST.AVAILABLE) continue;
      const verb = r.type === 'stores_on' ? 'i dati stanno su' : optional ? 'usa, se disponibile,' : 'dipende da';
      add(s, `${verb} ${name(r.toId)}: ${ST_LABEL[ds.status].toLowerCase()}${unknownRel ? ' (collegamento non documentato)' : ''}${r.note ? ` — ${r.note}` : ''}`, r.toId);
    }
    // alternative: almeno una WAN
    if (e.id === 'OPNSENSE' || e.kind === 'storage' && e.id === 'ST-DRIVE') {
      const wans = ['WAN1', 'WAN2'].map((w) => evalEntity(w).status);
      if (wans.every((s) => s !== ST.AVAILABLE)) add(e.id === 'OPNSENSE' ? ST.DEGRADED : ST.BLOCKED, 'nessuna linea Internet disponibile: niente uscita verso l\'esterno', 'WAN1');
    }
    // stato della copia indicato nello scenario
    if (e.kind === 'copy' && sc.copy.has(e.id)) {
      const cs = sc.copy.get(e.id);
      if (cs === 'missing') add(ST.BLOCKED, 'copia assente (scenario)');
      else if (cs === 'stale') add(ST.DEGRADED, 'copia obsoleta: ultimo aggiornamento troppo vecchio (scenario)');
      else if (cs === 'untested') add(ST.UNKNOWN, 'copia mai provata con un recupero (scenario)');
    }
    return { id: e.id, status, reasons, failover };
  }

  for (const e of idx.core.entities) evalEntity(e.id);
  const q = computeQuorum();
  return {
    status: (id) => evalEntity(id),
    quorum: q,
    quorumAt,
    entities: memo,
    access: (id) => access(idx, evalEntity, id),
    protection: (id) => protection(idx, evalEntity, ctx, sc, id),
    impact: (id) => impact(idx, evalEntity, id),
    scenario: sc,
  };
}

// ---------- accesso locale e da fuori ----------
function access(idx, evalEntity, id) {
  const e = idx.get(id);
  const res = { local: null, remote: null };
  if (!e || e.kind !== 'service') return res;
  const host = idx.out(id, 'hosted_on')[0]?.toId;
  const hostPlace = idx.get(host)?.place;
  const inRack = hostPlace === 'P-SALA' || hostPlace === 'P-CASA' || idx.get(hostPlace)?.parent === 'P-CASA' || hostPlace === 'P-LAB';
  const local = { status: ST.AVAILABLE, reasons: [] };
  if (inRack) {
    const sw = evalEntity('SW').status;
    if (sw !== ST.AVAILABLE) { local.status = worst(local.status, sw === ST.UNKNOWN ? ST.UNKNOWN : ST.BLOCKED); local.reasons.push({ text: 'lo switch fidato non è in funzione', cause: 'SW' }); }
    const fw = evalEntity('OPNSENSE').status;
    if (fw === ST.BLOCKED || fw === ST.UNKNOWN) { local.status = worst(local.status, ST.DEGRADED); local.reasons.push({ text: 'senza M1 mancano DNS e passaggio fra reti: funziona solo dalla stessa rete locale', cause: 'OPNSENSE' }); }
  }
  res.local = local;
  if (e.remote === 'caddy' || e.remote === 'private') {
    const rem = { status: ST.AVAILABLE, reasons: [] };
    const wanOk = ['WAN1', 'WAN2'].some((w) => evalEntity(w).status === ST.AVAILABLE);
    if (!wanOk) { rem.status = ST.BLOCKED; rem.reasons.push({ text: 'nessuna linea Internet', cause: 'WAN1' }); }
    for (const dep of e.remote === 'caddy' ? ['OPNSENSE', 'CADDY'] : ['ACCESSO-PRIVATO']) {
      const s = evalEntity(dep);
      if (s.status !== ST.AVAILABLE) { rem.status = worst(rem.status, s.status === ST.DEGRADED ? ST.DEGRADED : s.status); rem.reasons.push({ text: `${idx.get(dep).name}: ${ST_LABEL[s.status].toLowerCase()}`, cause: dep }); }
    }
    res.remote = rem;
  }
  return res;
}

// ---------- impatto sulle attività ----------
function impact(idx, evalEntity, id) {
  const e = idx.get(id);
  const s = evalEntity(id);
  return (e.activities || []).map((a) => {
    let text;
    const first = s.reasons.find((r) => r.status === s.status)?.text || '';
    if (s.status === ST.AVAILABLE) text = `Puoi ${a.text}.`;
    else if (s.status === ST.ON_DEMAND) text = `Puoi ${a.text}, dopo l'accensione della macchina (attesa non misurata).`;
    else if (s.status === ST.DEGRADED) text = `Puoi ${a.text}, con limiti: ${first}.`;
    else if (s.status === ST.UNKNOWN) text = `Non si può dire se puoi ${a.text}: ${first}.`;
    else text = `Non puoi ${a.text}.`;
    return { activity: a.text, write: !!a.write, status: s.status, text };
  });
}

// ---------- protezione dei dati ----------
export function copyReadiness(idx, ctx, sc, copy) {
  const st = copy.status || {};
  if (sc?.copy?.get(copy.id) === 'missing') return { level: 'assente', text: 'copia assente nello scenario' };
  if (st.realization === 'da_acquisire') return { level: 'non_attiva', text: 'supporti non ancora acquistati' };
  if (st.decision === 'proposta') return { level: 'non_attiva', text: 'proposta, non ancora attivata' };
  const tests = idx.out(copy.id, 'validated_by').map((r) => r.toId);
  if (['mirror', 'snapshot', 'sync'].includes(copy.mechanism)) return { level: 'non_backup', text: copy.mechanism === 'snapshot' ? 'punti nel tempo sullo stesso disco' : 'non è una copia indipendente' };
  if (sc?.copy?.get(copy.id) === 'stale') return { level: 'obsoleta', text: 'ultimo aggiornamento troppo vecchio' };
  const passed = tests.map((t) => ctx.test(t)).filter((r) => r.value === true);
  if (passed.length) return { level: 'collaudata', text: passed[0].reasons[0] };
  return { level: 'non_collaudata', text: tests.length ? `recupero mai provato (${tests.join(', ')} non eseguito)` : 'nessuna prova di recupero prevista' };
}

function protection(idx, evalEntity, ctx, sc, datasetId) {
  const d = idx.get(datasetId);
  const orig = evalEntity(datasetId);
  const copies = idx.in(datasetId, null).filter((r) => r.fromId === datasetId);
  const prot = idx.out(datasetId).filter((r) => ['backs_up_to', 'replicates_to', 'protected_by'].includes(r.type)).map((r) => idx.get(r.toId)).filter(Boolean);
  void copies;
  const list = prot.map((c) => {
    const s = evalEntity(c.id);
    const ready = copyReadiness(idx, ctx, sc, c);
    const sameDomain = sharesDomain(idx, datasetId, c.id);
    return { id: c.id, name: c.name, mechanism: c.mechanism, status: s.status, readiness: ready, sameDomain };
  });
  let verdict;
  if (orig.status === ST.AVAILABLE) verdict = { status: ST.AVAILABLE, text: "L'originale è disponibile." };
  else {
    const usable = list.filter((c) => c.status === ST.AVAILABLE || c.status === ST.ON_DEMAND || c.status === ST.DEGRADED);
    const tested = usable.filter((c) => c.readiness.level === 'collaudata');
    const untested = usable.filter((c) => ['non_collaudata', 'obsoleta'].includes(c.readiness.level));
    if (tested.length) verdict = { status: ST.DEGRADED, text: `Recuperabile da ${tested[0].name} (recupero collaudato).` };
    else if (untested.length) verdict = { status: ST.UNKNOWN, text: `Esiste una copia (${untested.map((c) => c.name).join(', ')}) ma il recupero non è mai stato provato: non è un recupero garantito.` };
    else verdict = { status: ST.BLOCKED, text: 'Nessuna copia indipendente disponibile in questo scenario.' };
  }
  return { dataset: d, original: orig, copies: list, verdict };
}

/** Una copia condivide il dominio di guasto dell'originale se sta sullo stesso archivio, sulla stessa macchina o nello stesso luogo. */
export function sharesDomain(idx, datasetId, copyId) {
  const where = (id) => {
    const st = idx.out(id, 'stores_on')[0]?.toId;
    const node = st ? idx.out(st, 'hosted_on')[0]?.toId : null;
    const place = (node && idx.get(node)?.place) || (st && idx.get(st)?.place) || null;
    return { st, node, place };
  };
  const a = where(datasetId), b = where(copyId);
  if (!b.st) return { level: 'sconosciuto', text: 'supporto della copia non documentato' };
  if (a.st && a.st === b.st) return { level: 'stesso_archivio', text: 'sullo stesso disco: un guasto del disco colpisce originale e copia' };
  if (a.node && a.node === b.node) return { level: 'stessa_macchina', text: 'sulla stessa macchina' };
  if (a.place && a.place === b.place) return { level: 'stesso_luogo', text: `nello stesso luogo (${idx.get(a.place)?.name}): incendio o furto colpiscono entrambi` };
  if (!b.place) return { level: 'luogo_ignoto', text: 'luogo di conservazione non documentato' };
  return { level: 'separata', text: 'in un luogo diverso' };
}

/** Confronta due simulazioni e restituisce gli elementi il cui stato è cambiato. */
export function diff(a, b, ids) {
  const out = [];
  for (const id of ids) {
    const x = a.status(id).status, y = b.status(id).status;
    if (x !== y) out.push({ id, from: x, to: y });
  }
  return out;
}
