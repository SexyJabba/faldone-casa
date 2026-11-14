// Area riservata: i dati sensibili stanno nel repository solo cifrati.
// PBKDF2-HMAC-SHA256 (600.000 iterazioni) → AES-256-GCM, con WebCrypto: stesso codice nel browser e in Node.
// Modulo puro: nessun DOM, nessuna memoria. La password non viene mai conservata.
export const ITERATIONS = 600000;
const subtle = () => globalThis.crypto.subtle;
const enc = new TextEncoder(), dec = new TextDecoder();
export const b64 = (bytes) => { let s = ''; const u = new Uint8Array(bytes); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000)); return btoa(s); };
export const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
/** Le password si confrontano dopo aver tolto gli spazi ai bordi e normalizzato gli accenti. */
export const cleanPassword = (p) => String(p ?? '').normalize('NFC').trim();

/** La forma minima che un contenitore cifrato deve avere. Restituisce l'elenco degli errori. */
export function checkBox(box) {
  const errs = [];
  if (!box || typeof box !== 'object') return ['contenitore assente'];
  if (box.v !== 1) errs.push('versione non riconosciuta');
  if (box.kdf !== 'PBKDF2-SHA256' || box.cipher !== 'AES-256-GCM') errs.push('algoritmi non riconosciuti');
  if (!Number.isInteger(box.it) || box.it < 100000) errs.push('iterazioni insufficienti');
  for (const k of ['salt', 'iv', 'ct']) if (typeof box[k] !== 'string' || !box[k]) errs.push(`campo ${k} mancante`);
  if (!box.index || !Array.isArray(box.index.impianti) || !Array.isArray(box.index.entita)) errs.push('indice pubblico mancante');
  return errs;
}

export async function deriveKey(password, saltB64, iterations = ITERATIONS) {
  const base = await subtle().importKey('raw', enc.encode(cleanPassword(password)), 'PBKDF2', false, ['deriveKey']);
  return subtle().deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: unb64(saltB64), iterations }, base, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}
export const exportKey = async (key) => b64(await subtle().exportKey('raw', key));
export const importKey = (raw) => subtle().importKey('raw', unb64(raw), { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']);

/** Restituisce l'oggetto in chiaro, oppure null se la chiave è sbagliata o il contenuto è stato alterato. */
export async function openBox(box, key) {
  try {
    const pt = await subtle().decrypt({ name: 'AES-GCM', iv: unb64(box.iv), additionalData: enc.encode(`faldone-riservato-v${box.v}`) }, key, unb64(box.ct));
    return JSON.parse(dec.decode(pt));
  } catch { return null; }
}
export async function unlock(box, password) {
  const key = await deriveKey(password, box.salt, box.it);
  const data = await openBox(box, key);
  return data ? { key, data } : null;
}

/** Indice pubblico: dice solo QUALI voci hanno una parte riservata, non che cosa contengono. */
export const indexOf = (data) => ({ impianti: Object.keys(data.impianti || {}).sort(), entita: Object.keys(data.entita || {}).sort() });

/** Cifra un oggetto. salt e iv sono Uint8Array casuali (16 e 12 byte): l'iv non va mai riusato con la stessa chiave. */
export async function sealBox(data, password, { salt, iv, iterations = ITERATIONS, updated = null, allowShort = false } = {}) {
  if (cleanPassword(password).length < 12 && !allowShort) throw new Error('password troppo corta: servono almeno 12 caratteri');
  if (cleanPassword(password).length < 8) throw new Error('password troppo corta: sotto gli 8 caratteri non si cifra');
  const key = await deriveKey(password, b64(salt), iterations);
  const ct = await subtle().encrypt({ name: 'AES-GCM', iv, additionalData: enc.encode('faldone-riservato-v1') }, key, enc.encode(JSON.stringify(data)));
  return { v: 1, kdf: 'PBKDF2-SHA256', cipher: 'AES-256-GCM', it: iterations, salt: b64(salt), iv: b64(iv), ct: b64(ct), index: indexOf(data), updated };
}

/** Unisce la parte riservata di un impianto alla sua scheda pubblica. */
export const mergeImpianto = (pub, data) => (data?.impianti?.[pub.id] ? { ...pub, ...data.impianti[pub.id], id: pub.id, riservato: true } : pub);
