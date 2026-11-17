// store.js — stato unico dell'app, salvato in IndexedDB (database "vito-officina").
// Archivi: "kv" (chiave "state" = tutti i dati) e "file" (foto e allegati, per id).
import { seed, SCHEMA } from './seed.js';
import { budget, verificaLayout } from './calc.js';

const DB = 'vito-officina';
let db = null, state = null;
const listeners = new Set();
export const uid = (p = 'x') => p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function open() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 2); // 2 = archivio 'doc' per i PDF dei manuali (Blob, fuori dal backup)
    r.onupgradeneeded = () => { for (const n of ['kv', 'file', 'doc']) if (!r.result.objectStoreNames.contains(n)) r.result.createObjectStore(n); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
const tx = (st, mode, fn) => new Promise((res, rej) => {
  const t = db.transaction(st, mode); const out = fn(t.objectStore(st));
  t.oncomplete = () => res(out.result); t.onerror = () => rej(t.error);
});

// ---- MIGRAZIONI ----
// Regola: una migrazione AGGIUNGE o converte, non cancella mai dati dell'utente. Ogni passo è idempotente.
// Per aggiungere uno schema: aumenta SCHEMA in seed.js, aggiungi `if (da < N) { … }` qui sotto e una prova in tests/migrazione.test.mjs.
export function migra(s) {
  const base = seed(); const da = s.schema || 1;
  for (const k of Object.keys(base)) if (s[k] === undefined && !['baseFissa', 'progetti'].includes(k)) s[k] = base[k];
  if (da < 2 || !Array.isArray(s.progetti)) {
    // Passi dei lavori: da testo a {t, tipo}. Collegamenti a inventario e sessioni: elenchi vuoti.
    for (const l of s.lavori) {
      l.passi = (l.passi || []).map((x) => (typeof x === 'string' ? { t: x, tipo: l.tipoPassi === 'documentata' ? 'documentata' : 'verifica' } : x));
      l.materialiInv ||= []; l.attrezziInv ||= []; l.sessioni ||= []; l.schemi ||= [];
    }
    // Stati d'uso per ogni configurazione: viaggio (tutto chiuso) + uno stato per ogni modulo che si apre.
    for (const ly of s.layout) {
      if (!Array.isArray(ly.stati)) ly.stati = [{ id: 'viaggio', nome: 'Viaggio (tutto chiuso)', aperti: [] }, ...ly.moduli.filter((m) => m.apreX || m.apreY).map((m) => ({ id: 'ap_' + m.id, nome: 'Aperto: ' + m.nome, aperti: [m.id] }))];
      ly.moduli.forEach((m) => { m.stato ||= 'ipotesi'; });
    }
    // Base fissa: nasce vuota negli archivi esistenti (i moduli dell'utente non vengono spostati né duplicati).
    if (!Array.isArray(s.baseFissa)) s.baseFissa = [];
    // Dati documentati arrivati con lo schema 2 (carta di circolazione, prezzi del carrello): si applicano solo dove l'utente non ha già un dato documentato/misurato.
    const fermo = (x) => x && ['documentato', 'misurato'].includes(x.stato);
    for (const v of base.veicolo) { const mio = s.veicolo.find((x) => x.id === v.id); if (!mio) s.veicolo.push(v); else if (!fermo(mio) && v.stato === 'documentato') Object.assign(mio, v); }
    for (const it of base.inventario) { const mio = s.inventario.find((x) => x.id === it.id); if (!mio) s.inventario.push(it); else if (mio.costoUnit == null && it.costoUnit != null) mio.costoUnit = it.costoUnit; }
    for (const k of ['fonti', 'rilievi']) for (const x of base[k]) { const mio = s[k].find((y) => y.id === x.id); if (!mio) s[k].push(x); else if (k === 'rilievi' && mio.valore == null && x.valore != null) Object.assign(mio, { valore: x.valore, stato: x.stato }); }
    if (!Array.isArray(s.apparecchi)) s.apparecchi = base.apparecchi;
    for (const sy of s.energia.sistemi) { if (sy.maxUscita_W === undefined) sy.maxUscita_W = null; if (sy.maxCarica_W === undefined) sy.maxCarica_W = null; if (sy.socIniziale === undefined) sy.socIniziale = 100; }
    // Un progetto che fotografa le scelte attive oggi.
    if (!Array.isArray(s.progetti) || !s.progetti.length) {
      const primo = (arr, f) => (arr.find(f) || arr[0] || {}).id || null;
      s.progetti = [{ id: 'pg_1', nome: 'Progetto attuale', attivo: true, nota: 'Creato dalle scelte attive al momento dell\'aggiornamento.',
        layoutLavoroId: primo(s.layout, (x) => x.modo === 'lavoro'), layoutCamperId: primo(s.layout, (x) => x.modo === 'camper'),
        stratiId: (s.scenariStrati.find((x) => x.attivo) || {}).id || null, sistemaId: (s.energia.sistemi.find((x) => x.attivo) || {}).id || null, profiloId: primo(s.energia.profili, (x) => x.id === 'pr_est') }];
    }
  }
  if (!s.progetti.some((p) => p.attivo) && s.progetti[0]) s.progetti[0].attivo = true;
  s.schema = SCHEMA; return s;
}

const CHIAVI_ELENCO = ['veicolo', 'problemi', 'spese', 'zone', 'inventario', 'scenariStrati', 'layout', 'lavori', 'fonti', 'diario', 'rilievi', 'carichi'];
// Controllo completo di un backup PRIMA di toccare l'archivio. Lancia un errore con messaggio in italiano.
export function validaBackup(o) {
  if (!o || typeof o !== 'object') throw new Error('Il file non contiene un archivio valido.');
  if (o.app !== 'vito-officina') throw new Error('Questo file non è un backup di “Vito — Officina e Camper”.');
  const s = o.state;
  if (!s || typeof s !== 'object') throw new Error('Backup senza dati.');
  for (const k of CHIAVI_ELENCO) {
    if (!Array.isArray(s[k])) throw new Error(`Backup danneggiato: manca l'elenco “${k}”.`);
    const visti = new Set();
    s[k].forEach((x, i) => {
      if (!x || typeof x !== 'object' || typeof x.id !== 'string' || !x.id) throw new Error(`Backup danneggiato: “${k}”, voce ${i + 1} senza identificativo.`);
      if (visti.has(x.id)) throw new Error(`Backup danneggiato: “${k}” contiene due volte l'identificativo ${x.id}.`); visti.add(x.id);
    });
  }
  if (!s.impostazioni || typeof s.impostazioni !== 'object' || !s.geom || !s.geom.corridoio || !s.energia || !Array.isArray(s.energia.sistemi) || !Array.isArray(s.energia.profili)) throw new Error('Backup danneggiato: mancano impostazioni, geometria o energia.');
  if ((s.schema || 0) > SCHEMA) throw new Error('Backup creato con una versione più recente dell\'app.');
  for (const l of s.lavori) for (const k of ['dipende', 'fonti', 'problemi', 'accettazione', 'passi']) if (!Array.isArray(l[k])) throw new Error(`Backup danneggiato: lavoro “${l.titolo || l.id}” senza elenco “${k}”.`);
  for (const ly of s.layout) if (!Array.isArray(ly.moduli)) throw new Error(`Backup danneggiato: configurazione “${ly.nome || ly.id}” senza moduli.`);
  for (const sc of s.scenariStrati) if (!sc.zone || typeof sc.zone !== 'object') throw new Error(`Backup danneggiato: scenario “${sc.nome || sc.id}” senza zone.`);
  if (o.files !== undefined && !Array.isArray(o.files)) throw new Error('Backup danneggiato: elenco degli allegati non valido.');
  (o.files || []).forEach((f, i) => { if (!f || typeof f.id !== 'string' || typeof f.data !== 'string' || !f.data.startsWith('data:')) throw new Error(`Backup danneggiato: allegato ${i + 1} non valido.`); });
  return true;
}
// Prepara lo stato da ripristinare SENZA scrivere nulla: valida, copia, migra e prova i calcoli principali.
export function preparaRipristino(o) {
  validaBackup(o);
  const nuovo = migra(JSON.parse(JSON.stringify(o.state)));
  try { budget(nuovo); for (const ly of nuovo.layout) verificaLayout(ly, nuovo.geom, { base: nuovo.baseFissa }); }
  catch (e) { throw new Error('Backup non utilizzabile: i dati non superano i calcoli di controllo (' + e.message + ').'); }
  return { state: nuovo, files: o.files || [] };
}

const MAX_STORIA = 40;
export const store = {
  get s() { return state; },
  salvato: true,
  passato: [], futuro: [],
  async init() {
    db = await open();
    const s = await tx('kv', 'readonly', (o) => o.get('state'));
    if (s && (s.schema || 1) < SCHEMA) {
      // Copia di sicurezza dell'archivio com'era prima dell'aggiornamento di formato.
      await tx('kv', 'readwrite', (o) => o.put({ salvato: new Date().toISOString(), state: JSON.parse(JSON.stringify(s)) }, 'prima_di_schema_' + SCHEMA));
    }
    state = s ? migra(s) : seed();
    if (!s || (s.schema || 1) < SCHEMA) await this.salva();
    if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
  },
  on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  async salva() { state.meta.agg = new Date().toISOString(); await tx('kv', 'readwrite', (o) => o.put(JSON.parse(JSON.stringify(state)), 'state')); },
  ridisegna() { listeners.forEach((l) => l()); }, // solo interfaccia: non salva e non entra nella cronologia
  // Ogni modifica passa da qui: applica, salva subito, ridisegna. Tiene le ultime modifiche per Annulla/Ripristina.
  update(fn, { silenzioso = false } = {}) {
    const prima = JSON.stringify(state);
    fn(state);
    if (JSON.stringify(state) !== prima) { this.passato.push(prima); if (this.passato.length > MAX_STORIA) this.passato.shift(); this.futuro = []; }
    this._scrivi(silenzioso);
  },
  _scrivi(silenzioso) {
    this.salvato = false;
    this.salva().then(() => { this.salvato = true; }).catch((e) => alert('Salvataggio non riuscito: ' + e.message));
    if (!silenzioso) listeners.forEach((l) => l());
  },
  // Annulla/ripristina riguardano i DATI (non foto e allegati) e valgono fino alla chiusura della pagina.
  annulla() { if (!this.passato.length) return false; this.futuro.push(JSON.stringify(state)); state = JSON.parse(this.passato.pop()); this._scrivi(false); return true; },
  ripristina() { if (!this.futuro.length) return false; this.passato.push(JSON.stringify(state)); state = JSON.parse(this.futuro.pop()); this._scrivi(false); return true; },
  // Scrive un valore in un percorso tipo "geom.corridoio.y" o "zone.pav_cassone.area_m2" (negli elenchi cerca per id).
  setPath(s, path, val) {
    const seg = path.split('.'); let cur = s;
    for (let i = 0; i < seg.length - 1; i++) { cur = Array.isArray(cur) ? cur.find((x) => x.id === seg[i]) : cur[seg[i]]; if (cur == null) return false; }
    cur[seg[seg.length - 1]] = val; if ('stato' in cur) cur.stato = 'misurato'; return true;
  },

  /* ---- foto e allegati ---- */
  async addFile(file) {
    let data, tipo = file.type, nome = file.name;
    if (tipo.startsWith('image/')) { data = await ridimensiona(file, 1400); tipo = 'image/jpeg'; }
    else { if (file.size > 8e6) throw new Error('Allegato troppo grande (max 8 MB).'); data = await leggi(file); }
    const id = uid('f');
    await tx('file', 'readwrite', (o) => o.put({ id, nome, tipo, data }, id));
    return id;
  },
  /* ---- manuali (PDF interi, anche grandi): salvati come Blob, non entrano nel backup ---- */
  async addDoc(id, file) { if (file.size > 300e6) throw new Error('File troppo grande (max 300 MB).'); await tx('doc', 'readwrite', (o) => { o.put({ id, nome: file.name, tipo: file.type, blob: file }, id); return o.delete('testo:' + id); }); },
  getDoc(id) { return tx('doc', 'readonly', (o) => o.get(id)); },
  delDoc(id) { return tx('doc', 'readwrite', (o) => { o.delete('testo:' + id); return o.delete(id); }); },
  /* testo dei PDF, pagina per pagina, per la ricerca (chiave 'testo:<id>' nello stesso archivio; fuori dal backup, si rigenera dal file) */
  setTesto(id, pagine) { return tx('doc', 'readwrite', (o) => o.put({ id, pagine, quando: new Date().toISOString() }, 'testo:' + id)); },
  getTesto(id) { return tx('doc', 'readonly', (o) => o.get('testo:' + id)); },
  getFile(id) { return tx('file', 'readonly', (o) => o.get(id)); },
  delFile(id) { return tx('file', 'readwrite', (o) => o.delete(id)); },

  /* ---- backup ---- */
  async esporta() {
    const files = await tx('file', 'readonly', (o) => o.getAll());
    return { app: 'vito-officina', schema: SCHEMA, esportato: new Date().toISOString(), state: JSON.parse(JSON.stringify(state)), files };
  },
  // Ripristino ATOMICO: prima si valida e si prepara tutto in memoria, poi UNA sola transazione scrive dati e allegati.
  // Se qualcosa fallisce la transazione viene annullata dal browser e l'archivio resta com'era.
  async importa(o) {
    const pronto = preparaRipristino(o); // lancia un errore se il contenuto non è valido: nulla è stato toccato
    pronto.state.meta = { ...(pronto.state.meta || {}), agg: new Date().toISOString() };
    await new Promise((res, rej) => {
      const t = db.transaction(['kv', 'file'], 'readwrite');
      // Un errore sincrono (es. dato non salvabile) NON annulla da solo la transazione: va abortita, altrimenti le scritture già fatte verrebbero confermate.
      try {
        const f = t.objectStore('file'); f.clear();
        for (const x of pronto.files) f.put(x, x.id);
        t.objectStore('kv').put(pronto.state, 'state');
      } catch (e) { try { t.abort(); } catch { /* già chiusa */ } rej(new Error('Ripristino annullato, archivio invariato: ' + e.message)); return; }
      t.oncomplete = res; t.onerror = () => rej(t.error || new Error('scrittura non riuscita')); t.onabort = () => rej(t.error || new Error('ripristino annullato: archivio invariato'));
    });
    state = pronto.state; this.passato = []; this.futuro = []; listeners.forEach((l) => l());
  },
  async azzera() {
    const nuovo = seed();
    await new Promise((res, rej) => { const t = db.transaction(['kv', 'file'], 'readwrite'); t.objectStore('file').clear(); t.objectStore('kv').put(JSON.parse(JSON.stringify(nuovo)), 'state'); t.oncomplete = res; t.onerror = t.onabort = () => rej(t.error); });
    await tx('doc', 'readwrite', (st) => st.clear()); // anche i PDF dei manuali
    state = nuovo; this.passato = []; this.futuro = []; listeners.forEach((l) => l());
  },
};

const leggi = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error); r.readAsDataURL(file); });
async function ridimensiona(file, max) {
  const url = await leggi(file);
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('Immagine non leggibile')); i.src = url; });
  const k = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.82);
}
