// Rack: disposizione dei pezzi in colonne da N unità. Modulo puro (browser, build e test).
// Un «pezzo» occupa `u` unità a partire da `from` (1 = in basso) in una colonna. Nessuna posizione è inventata:
// la disposizione pubblica viene da content/model/rack.json, quelle di prova dal compositore riservato.

/** Errori di una disposizione: riferimenti, sovrapposizioni, pezzi fuori colonna. entSet: identificativi del modello. */
export function validateRack(rack, entSet) {
  const errs = [];
  const cols = new Map((rack.columns || []).map((c) => [c.id, c]));
  const seen = new Set();
  for (const s of rack.slots || []) {
    if (seen.has(s.id)) errs.push(`rack: pezzo ripetuto ${s.id}`);
    seen.add(s.id);
    const c = cols.get(s.col);
    if (!c) { errs.push(`rack: ${s.id} in una colonna inesistente (${s.col})`); continue; }
    if (!Number.isInteger(s.from) || !Number.isInteger(s.u) || s.from < 1 || s.u < 1) errs.push(`rack: ${s.id} con posizione o altezza non valida`);
    else if (s.from + s.u - 1 > c.u) errs.push(`rack: ${s.id} esce dalla colonna ${c.id} (${s.from + s.u - 1}U su ${c.u})`);
    for (const e of s.entities || []) if (entSet && !entSet.has(e)) errs.push(`rack: ${s.id} cita un elemento inesistente (${e})`);
  }
  for (const [a, b] of overlaps(rack.slots || [])) errs.push(`rack: ${a} e ${b} si sovrappongono`);
  return errs;
}

/** Coppie di pezzi che occupano le stesse unità della stessa colonna. */
export function overlaps(slots) {
  const out = [];
  for (let i = 0; i < slots.length; i++) for (let j = i + 1; j < slots.length; j++) {
    const a = slots[i], b = slots[j];
    if (a.col === b.col && a.from < b.from + b.u && b.from < a.from + a.u) out.push([a.id, b.id]);
  }
  return out;
}

/** Unità libere di una colonna, dal basso: [{from, u}]. */
export function freeRuns(slots, col, height) {
  const used = new Array(height + 2).fill(false);
  for (const s of slots) if (s.col === col) for (let k = s.from; k < s.from + s.u; k++) if (k <= height) used[k] = true;
  const runs = []; let start = 0;
  for (let k = 1; k <= height + 1; k++) {
    if (k <= height && !used[k]) { if (!start) start = k; } else if (start) { runs.push({ from: start, u: k - start }); start = 0; }
  }
  return runs;
}

/** Può stare lì? Ignora il pezzo stesso (per gli spostamenti). */
export function fits(slots, piece, col, from, height) {
  if (from < 1 || from + piece.u - 1 > height) return false;
  return !slots.some((s) => s.id !== piece.id && s.col === col && s.from < from + piece.u && from < s.from + s.u);
}

/** La posizione libera più vicina a quella chiesta, nella colonna; null se il pezzo non entra. */
export function nearestFit(slots, piece, col, want, height) {
  let best = null;
  for (let f = 1; f + piece.u - 1 <= height; f++) if (fits(slots, piece, col, f, height) && (best === null || Math.abs(f - want) < Math.abs(best - want))) best = f;
  return best;
}

/** Sposta (o colloca) un pezzo: restituisce la nuova lista, oppure null se non entra. */
export function place(slots, piece, col, want, height) {
  const from = nearestFit(slots, piece, col, want, height);
  if (from === null) return null;
  return [...slots.filter((s) => s.id !== piece.id), { ...piece, col, from }];
}

/** Riepilogo per colonna: unità usate e libere, potenza di picco e peso dove indicati (null se manca anche un solo dato). */
export function columnSummary(slots, columns) {
  return columns.map((c) => {
    const mine = slots.filter((s) => s.col === c.id);
    const used = mine.reduce((n, s) => n + s.u, 0);
    const sum = (k) => (mine.length && mine.every((s) => Number.isFinite(s[k])) ? mine.reduce((n, s) => n + s[k], 0) : null);
    return { id: c.id, name: c.name, u: c.u, used, free: c.u - used, peakW: sum('peakW'), kg: sum('kg') };
  });
}

/** Verifiche di montaggio, solo su dati presenti: [{level:'err'|'warn'|'ok'|'info', text}]. */
export function checks(slots, columns, { pending = [] } = {}) {
  const out = [];
  const cols = new Map(columns.map((c) => [c.id, c]));
  for (const [a, b] of overlaps(slots)) out.push({ level: 'err', text: `${a} e ${b} occupano le stesse unità.` });
  for (const s of slots) { const c = cols.get(s.col); if (c && s.from + s.u - 1 > c.u) out.push({ level: 'err', text: `${s.id} esce dalla colonna: arriva a ${s.from + s.u - 1}U su ${c.u}.` }); }
  if (pending.length) out.push({ level: 'warn', text: `Da collocare: ${pending.join(', ')}.` });
  // peso: un pezzo più pesante sopra uno più leggero, nella stessa colonna
  for (const c of columns) {
    const mine = slots.filter((s) => s.col === c.id && Number.isFinite(s.kg) && !s.ground).sort((a, b) => a.from - b.from);
    for (let i = 1; i < mine.length; i++) if (mine[i].kg > mine[i - 1].kg + 3) { out.push({ level: 'warn', text: `${mine[i].id} (${mine[i].kg} kg) sta sopra ${mine[i - 1].id} (${mine[i - 1].kg} kg): i pezzi pesanti vanno in basso.` }); break; }
  }
  // calore: il pezzo con il picco più alto dovrebbe stare in cima alla sua colonna
  const hot = slots.filter((s) => Number.isFinite(s.peakW)).sort((a, b) => b.peakW - a.peakW)[0];
  if (hot) {
    const above = slots.filter((s) => s.col === hot.col && s.from > hot.from && Number.isFinite(s.peakW) && s.peakW > 50);
    out.push(above.length ? { level: 'warn', text: `${hot.id} è il pezzo che scalda di più (${hot.peakW} W al picco) e ha sopra ${above.map((s) => s.id).join(', ')}.` } : { level: 'ok', text: `${hot.id}, il pezzo che scalda di più (${hot.peakW} W al picco), non ha sopra altri apparati che scaldano.` });
  }
  if (!out.some((c) => c.level === 'err')) out.unshift({ level: 'ok', text: 'Nessuna sovrapposizione e tutti i pezzi dentro le colonne.' });
  return out;
}

// ---------------------------------------------------------------------------
// dal modello ai pezzi disegnabili
// ---------------------------------------------------------------------------
const POWER = { always: 'on', on_demand: 'stby', manual: 'stby' };
/** Accensione secondo il progetto (non è lo stato reale): 'on' sempre accesa, 'stby' a richiesta, 'off' non indicata. */
export const powerOf = (e) => POWER[e?.power] || (e?.kind === 'device' ? 'on' : 'off');

/** Arricchisce i pezzi della disposizione con ciò che serve al disegno. get: id → elemento del modello. */
export function describeSlots(rack, get, { invCat = () => null, relations = [] } = {}) {
  return rack.slots.map((s) => {
    const ents = (s.entities || []).map(get).filter(Boolean), e = ents[0];
    const out = { ...s, sub: s.face === 'power' ? e?.name || s.label || '' : s.label || e?.title || '', power: e ? powerOf(e) : 'off', title: s.label || (e ? `${e.name} · ${e.title || ''}` : s.id) };
    if (s.face === 'shelf') out.items = ents.map((x) => ({ id: x.id, power: powerOf(x) }));
    if (s.face === 'switch') { out.id = e?.name || s.id; out.lit = relations.filter((r) => r.type === 'connected_to' && r.toId === e?.id).map((r) => /SFP\+ (\d+)/.exec(r.label || '')).filter(Boolean).map((m) => Number(m[1]) - 49).filter((i) => i >= 0 && i < 4); }
    if (e && (e.inventory || []).some((c) => invCat(c) === 'gpu')) out.tag = 'GPU';
    out.aria = `${out.id}${out.sub ? ', ' + out.sub : ''}, ${s.u} unità${e ? ', ' + ({ on: 'sempre accesa', stby: 'accesa a richiesta', off: 'accensione non indicata' })[out.power] : ''}`;
    return out;
  });
}

const CAT = { motherboard: 'mobo' };
const CAT_ORDER = ['mobo', 'cpu', 'ram', 'gpu', 'nic', 'pcie', 'npu', 'nvme', 'ssd', 'hdd', 'psu', 'case'];
/**
 * Le parti di una macchina dall'inventario. Una quantità si disegna solo se è un numero e la voce appartiene a questa
 * macchina soltanto: altrimenti resta «1 voce» e si rimanda all'inventario (shared: true).
 */
export function partsFor(entity, items, usedBy) {
  const byCode = new Map(items.map((i) => [i.code, i]));
  return (entity.inventory || []).map((c) => byCode.get(c)).filter(Boolean).map((i) => {
    const cat = CAT[i.category] || i.category;
    const exclusive = (usedBy.get(i.code) || []).length === 1, num = /^\d+$/.test(String(i.quantity).trim()) ? Number(i.quantity) : null;
    return { cat, code: i.code, label: i.model, sub: i.assignment || '', n: exclusive && num ? num : 1, qty: i.quantity, shared: !exclusive, href: '#inventario/' + i.code };
  }).sort((a, b) => (CAT_ORDER.indexOf(a.cat) + 99) % 99 - (CAT_ORDER.indexOf(b.cat) + 99) % 99);
}
