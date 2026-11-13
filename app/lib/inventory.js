// Inventario: filtri a faccette, raggruppamenti e conteggi. Modulo puro (browser e test).
// Le quantità restano quelle della fonte: si sommano solo i numeri interi e mai le voci «alias».
import { normalize } from './search.js';

export const CAT_LABEL = {
  hdd: 'Dischi HDD', ssd: 'SSD', nvme: 'NVMe', usb: 'USB', card: 'Schede di memoria', mobo: 'Schede madri', motherboard: 'Schede madri',
  ram: 'RAM', cpu: 'Processori', psu: 'Alimentatori', gpu: 'Schede video', case: 'Case', pcie: 'Schede PCIe', client: 'Client', nic: 'Schede di rete',
  enclosure: 'Box esterni', network: 'Rete', mobile: 'Mobile', pc: 'PC', npu: 'NPU', server: 'Server', backup: 'Backup', reader: 'Lettori', dock: 'Dock', cavo: 'Cavi', switch: 'Switch',
};
export const catKey = (c) => (c === 'motherboard' ? 'mobo' : c);
export const catLabel = (c) => CAT_LABEL[c] || c;
const sentence = (s) => { s = String(s || '').toLowerCase().replace(/\s*\/\s*/g, ' · '); return s.charAt(0).toUpperCase() + s.slice(1); };
export const stateLabel = sentence;
export const isAlias = (i) => /ALIAS/i.test(i.inventory_state || '');
/** Quantità come numero solo se la fonte scrive un intero; altrimenti null (resta il testo). */
export const qty = (i) => (/^\d+$/.test(String(i.quantity).trim()) ? Number(i.quantity) : null);

/** Prepara le voci: categoria normalizzata, elementi del modello che le usano, foto, testo di ricerca. */
export function prepare(inv, entities) {
  const usedBy = new Map();
  for (const e of entities) for (const c of e.inventory || []) usedBy.set(c, [...(usedBy.get(c) || []), e.id]);
  return inv.items.map((i) => ({
    ...i, cat: catKey(i.category), used: usedBy.get(i.code) || [], photos: inv.photos?.[i.code] || [], n: qty(i),
    text: normalize([i.code, i.model, i.assignment, i.notes, i.category, catLabel(catKey(i.category)), i.inventory_state].join(' ')),
  }));
}

/** f: {q, cat:[], state:[], used:[], photo:bool, linked:'si'|'no'|''} */
export function matches(item, f, skip = '') {
  if (skip !== 'q' && f.q) { const words = normalize(f.q).split(/\s+/).filter(Boolean); if (!words.every((w) => item.text.includes(w))) return false; }
  if (skip !== 'cat' && f.cat?.length && !f.cat.includes(item.cat)) return false;
  if (skip !== 'state' && f.state?.length && !f.state.includes(item.inventory_state)) return false;
  if (skip !== 'used' && f.used?.length && !f.used.some((u) => item.used.includes(u))) return false;
  if (f.photo && !item.photos.length) return false;
  if (f.linked === 'si' && !item.used.length) return false;
  if (f.linked === 'no' && item.used.length) return false;
  return true;
}
export const filter = (items, f) => items.filter((i) => matches(i, f));

/** Conteggi per faccetta calcolati ignorando la faccetta stessa, così si vede che cosa aggiungerebbe ogni scelta. */
export function facets(items, f) {
  const count = (skip, keyOf) => { const m = new Map(); for (const i of items) { if (!matches(i, f, skip)) continue; for (const k of [].concat(keyOf(i))) m.set(k, (m.get(k) || 0) + 1); } return m; };
  return { cat: count('cat', (i) => i.cat), state: count('state', (i) => i.inventory_state), used: count('used', (i) => i.used) };
}

export function sortItems(list, by) {
  const c = [...list];
  if (by === 'modello') c.sort((a, b) => a.model.localeCompare(b.model, 'it'));
  else if (by === 'quantita') c.sort((a, b) => (b.n ?? -1) - (a.n ?? -1) || a.code.localeCompare(b.code));
  else c.sort((a, b) => a.code.localeCompare(b.code));
  return c;
}

/** Gruppi ordinati: [{key, label, items}] — una voce collegata a più macchine compare in ciascuna. */
export function group(list, by, nameOf = (id) => id) {
  if (!by) return [{ key: '', label: '', items: list }];
  const m = new Map();
  const put = (k, label, i) => { if (!m.has(k)) m.set(k, { key: k, label, items: [] }); m.get(k).items.push(i); };
  for (const i of list) {
    if (by === 'categoria') put(i.cat, catLabel(i.cat), i);
    else if (by === 'stato') put(i.inventory_state, stateLabel(i.inventory_state), i);
    else if (by === 'macchina') { if (i.used.length) i.used.forEach((u) => put(u, nameOf(u), i)); else put('~', 'Non collegato a un elemento del modello', i); }
  }
  return [...m.values()].sort((a, b) => (a.key === '~') - (b.key === '~') || b.items.length - a.items.length || a.label.localeCompare(b.label, 'it'));
}

/** Somma dei pezzi: solo quantità intere e voci non alias. Dice anche quante voci restano fuori. */
export function totals(list) {
  let pieces = 0, counted = 0, textual = 0, alias = 0;
  for (const i of list) { if (isAlias(i)) { alias++; continue; } if (i.n === null) { textual++; continue; } pieces += i.n; counted++; }
  return { items: list.length, pieces, counted, textual, alias };
}
