// Persistenza locale versionata (solo su questo dispositivo).
// Migra le chiavi della 4.4 senza cancellarle; import con validazione e anteprima dei conflitti.

export const KEY = 'faldone5';
export const VERSION = 1;
const LEGACY = { favorites: 'faldone44-favorites', checks: 'faldone44-checks', theme: 'faldone44-theme', power: 'faldone44.power', savings: 'faldone44.savings', tour: 'tour44' };

export const empty = () => ({ v: VERSION, favorites: [], notes: {}, checks: {}, prefs: { depth: 'capire', theme: 'auto' }, scenarios: [], energy: null, progress: {}, updatedAt: null, migratedFrom44: false });

function safeParse(s) { try { return JSON.parse(s); } catch { return undefined; } }

/** storage: oggetto con getItem/setItem (localStorage o finto). Restituisce {data, status} senza lanciare. */
export function load(storage) {
  let raw;
  try { raw = storage.getItem(KEY); } catch { return { data: empty(), status: 'non_disponibile' }; }
  let data = raw ? safeParse(raw) : null;
  if (raw && !data) return { data: empty(), status: 'corrotto', raw };
  if (!data) { data = empty(); const m = migrate44(storage, data); return { data: m, status: m.migratedFrom44 ? 'migrato' : 'nuovo' }; }
  return { data: upgrade(data), status: 'ok' };
}

export function upgrade(d) {
  const base = empty();
  if (!d || typeof d !== 'object') return base;
  // v1 è l'unica versione: campi mancanti completati, campi estranei ignorati
  return { ...base, ...pick(d, Object.keys(base)), prefs: { ...base.prefs, ...(d.prefs || {}) }, v: VERSION };
}
const pick = (o, keys) => Object.fromEntries(keys.filter((k) => k in o).map((k) => [k, o[k]]));

export function migrate44(storage, data) {
  const get = (k) => { try { const v = storage.getItem(k); return v === null ? undefined : safeParse(v); } catch { return undefined; } };
  const fav = get(LEGACY.favorites), checks = get(LEGACY.checks), theme = get(LEGACY.theme), power = get(LEGACY.power), tour = get(LEGACY.tour);
  let migrated = false;
  if (Array.isArray(fav)) { data.favorites = [...new Set(fav.filter((x) => typeof x === 'string'))]; migrated = true; }
  if (checks && typeof checks === 'object') { data.checks = Object.fromEntries(Object.entries(checks).filter(([, v]) => typeof v === 'boolean').map(([k, v]) => [k, { done: v, at: null, source: '4.4' }])); migrated = true; }
  if (theme === 'dark' || theme === 'light') { data.prefs.theme = theme; migrated = true; }
  if (power && Array.isArray(power.rows)) {
    data.energy = { tariff: Number(power.price) || null, rows: power.rows.map((r) => ({ id: r[0], idleW: r[2], loadW: r[3], hoursOn: r[4], hoursLoad: r[5] })) };
    migrated = true;
  }
  if (Array.isArray(tour)) { data.progress.tour44 = tour; migrated = true; }
  data.migratedFrom44 = migrated;
  return data;
}

export function save(storage, data) {
  const d = { ...data, updatedAt: new Date().toISOString() };
  try { storage.setItem(KEY, JSON.stringify(d)); return { ok: true, data: d }; } catch (e) {
    return { ok: false, data: d, error: /quota/i.test(String(e?.name || e)) ? 'spazio del browser esaurito' : 'salvataggio non consentito dal browser' };
  }
}

export function exportData(data, revision) {
  return JSON.stringify({ format: 'faldone-locale', v: VERSION, revision, exportedAt: new Date().toISOString(), note: 'Dati personali di questo dispositivo: preferiti, appunti, spunte. Non sono collaudi ufficiali.', data }, null, 2);
}

const MAXTXT = 5000;
/** Valida un file importato. knownIds: funzione che dice se un codice esiste. Non esegue nulla: testo puro. */
export function parseImport(text, knownIds = () => true) {
  const errors = [];
  if (typeof text !== 'string' || text.length > 2_000_000) return { ok: false, errors: ['file troppo grande o non testuale'] };
  const obj = safeParse(text);
  if (!obj || obj.format !== 'faldone-locale') return { ok: false, errors: ['non è un file di esportazione del Faldone'] };
  if (obj.v > VERSION) return { ok: false, errors: [`versione ${obj.v} più recente di quella supportata (${VERSION})`] };
  const d = obj.data || {};
  const out = empty();
  if (Array.isArray(d.favorites)) out.favorites = d.favorites.filter((x) => typeof x === 'string' && x.length < 64 && (knownIds(x) || (errors.push(`preferito sconosciuto ignorato: ${x}`), false)));
  if (d.notes && typeof d.notes === 'object') for (const [k, v] of Object.entries(d.notes)) {
    if (typeof v?.text !== 'string') { errors.push(`appunto non valido ignorato: ${k}`); continue; }
    out.notes[k] = { text: v.text.slice(0, MAXTXT), at: typeof v.at === 'string' ? v.at : null };
  }
  if (d.checks && typeof d.checks === 'object') for (const [k, v] of Object.entries(d.checks)) if (typeof v?.done === 'boolean') out.checks[k] = { done: v.done, at: v.at || null, source: 'import' };
  if (Array.isArray(d.scenarios)) out.scenarios = d.scenarios.filter((s) => s && typeof s.name === 'string' && Array.isArray(s.events)).slice(0, 50).map((s) => ({ name: s.name.slice(0, 80), events: s.events.filter((e) => e && typeof e.type === 'string' && typeof e.id === 'string').map((e) => ({ type: e.type, id: e.id, ...(e.state ? { state: String(e.state) } : {}) })) }));
  out.updatedAt = typeof d.updatedAt === 'string' ? d.updatedAt : null;
  return { ok: true, data: out, warnings: errors, exportedAt: obj.exportedAt || null };
}

/** Anteprima dell'unione: non sovrascrive nulla, elenca i conflitti. */
export function previewMerge(current, incoming) {
  const conflicts = [];
  for (const [k, v] of Object.entries(incoming.notes)) {
    const c = current.notes[k];
    if (c && c.text !== v.text) conflicts.push({ kind: 'appunto', id: k, current: c, incoming: v, newer: (v.at || '') > (c.at || '') ? 'importato' : 'attuale' });
  }
  const newFav = incoming.favorites.filter((f) => !current.favorites.includes(f));
  const newNotes = Object.keys(incoming.notes).filter((k) => !current.notes[k]);
  const olderFile = incoming.updatedAt && current.updatedAt && incoming.updatedAt < current.updatedAt;
  return { conflicts, newFav, newNotes, newScenarios: incoming.scenarios.length, olderFile };
}

/** Unisce applicando le scelte: choices[id] = 'attuale' | 'importato'. Default: mantiene l'attuale. */
export function merge(current, incoming, choices = {}) {
  const out = structuredClone(current);
  out.favorites = [...new Set([...current.favorites, ...incoming.favorites])];
  for (const [k, v] of Object.entries(incoming.notes)) if (!out.notes[k] || choices[k] === 'importato') out.notes[k] = v;
  for (const [k, v] of Object.entries(incoming.checks)) if (!out.checks[k]) out.checks[k] = v;
  const names = new Set(out.scenarios.map((s) => s.name));
  for (const s of incoming.scenarios) out.scenarios.push(names.has(s.name) ? { ...s, name: `${s.name} (importato)` } : s);
  return out;
}

/** Memoria finta per i test e per i browser che bloccano localStorage. */
export function memoryStorage(init = {}, { failWrites = false } = {}) {
  const m = new Map(Object.entries(init));
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { if (failWrites) { const e = new Error('QuotaExceededError'); e.name = 'QuotaExceededError'; throw e; } m.set(k, String(v)); },
    removeItem: (k) => m.delete(k), _map: m,
  };
}
