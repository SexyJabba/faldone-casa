// Vetrina online dello Scout: la logica dello Scout (lib/*.js, copiati così come sono) gira nel browser
// su una copia cifrata dell'archivio. Ricerca, verifica dei link e note AI restano allo Scout acceso
// sul computer: qui rispondono che non sono disponibili, senza toccare le schede.
// Generato da tools/scout-vetrina.mjs a partire da tools/templates/scout-vetrina.js: non modificare scout/motore.js.
import { unlock, openBox, importKey, exportKey, b64, unb64, cleanPassword } from '../app/lib/vault.js';

const LOCAL = 'scout.vetrina.v1'; // modifiche fatte su questo dispositivo, cifrate con la stessa chiave
const KEY = 'scout.vetrina.k'; // chiave ricordata (solo se richiesto)
const OFF = 'Nella vetrina online questa funzione non c\'è: ricerca, controllo dei link e note AI girano sullo Scout acceso sul computer.';

/* ---------- moduli dello Scout (CommonJS) ---------- */
const SOURCES = { /*__MODULES__*/ };
const cache = {};
function req(name) {
  const k = name.replace(/^\.\//, '').replace(/\.js$/, '');
  if (cache[k]) return cache[k].exports;
  if (SHIMS[k]) return (cache[k] = { exports: SHIMS[k] }).exports;
  if (!SOURCES[k]) throw new Error(`Modulo non disponibile nella vetrina: ${name}`);
  const module = (cache[k] = { exports: {} });
  SOURCES[k](module, module.exports, req);
  return module.exports;
}

let db = null;
let key = null;
let base = null;
const empty = () => ({ meta: { version: 1 }, settings: { base: null, autoSearch: { enabled: false, hours: 24 }, surpriseBias: 0 }, cards: {}, reactions: [], tastes: [], dossiers: {}, runs: [], seen: {}, trailState: {}, probes: {} });
const hex = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, '0')).join('');
const offline = () => Promise.resolve({ ok: false, status: 0, reason: 'vetrina' });
const SHIMS = {
  store: { load: () => db, save: () => { persist(); }, id: (p) => `${p}_${hex(6)}`, FILE: '', DATA_DIR: '' },
  net: { politeGet: offline, checkImage: offline, UA: 'vetrina' },
  ai: {
    configured: () => false,
    status: async () => ({ configured: false, sdkInstalled: false, model: null, lastError: null, missing: 'Nella vetrina online le note AI non sono disponibili: si scrivono dallo Scout acceso sul computer.' }),
    narrate: async () => { throw Object.assign(new Error(OFF), { status: 503 }); },
    dossierDraft: async () => { throw Object.assign(new Error(OFF), { status: 503 }); },
  },
};

/* ---------- salvataggio locale, cifrato ---------- */
let saving = Promise.resolve();
function persist() {
  const snapshot = JSON.stringify({ base, db });
  saving = saving.then(async () => {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(snapshot));
    try { localStorage.setItem(LOCAL, JSON.stringify({ iv: b64(iv), ct: b64(ct) })); } catch { /* spazio esaurito o archiviazione negata: resta in memoria */ }
  });
  return saving;
}
async function readLocal() {
  try {
    const raw = JSON.parse(localStorage.getItem(LOCAL) || 'null');
    if (!raw) return null;
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(raw.iv) }, key, unb64(raw.ct));
    return JSON.parse(new TextDecoder().decode(pt));
  } catch { return null; }
}

/* ---------- le stesse risposte del server, per quanto ha senso senza rete ---------- */
async function handle(path, method, body) {
  const scout = req('scout');
  const { trails, publicView } = req('trails');
  const sources = req('sources');
  const ai = SHIMS.ai;
  const d = db;
  const url = new URL(path, 'https://vetrina/');
  const seg = url.pathname.split('/').filter(Boolean);
  const q = Object.fromEntries(url.searchParams);
  const m = method;
  body = body || {};
  const no = () => { throw scout.httpErr(503, OFF); };

  if (seg[0] === 'state' && m === 'GET') {
    const col = (v) => scout.collection(v).length;
    return { settings: d.settings, efforts: scout.EFFORTS, reactions: Object.fromEntries(Object.entries(scout.REACTIONS).map(([k, v]) => [k, v.label])), trails: trails.map(publicView), ai: await ai.status(),
      counts: { feed: scout.feed({}).total, conservate: col('conservate'), incuriosito: col('incuriosito'), archiviate: col('archiviate'), nonverificate: col('nonverificate'), scartate: col('scartate'), dossiers: Object.keys(d.dossiers).length } };
  }
  if (seg[0] === 'feed' && m === 'GET') return scout.feed(q);
  if (seg[0] === 'economici' && m === 'GET') return scout.budgetFeed(q);
  if (seg[0] === 'cards') {
    if (!seg[1] && m === 'GET') return { items: scout.collection(q.view) };
    if (!seg[1] && m === 'POST') return scout.createManual(body);
    const id = seg[1];
    if (!d.cards[id]) throw scout.httpErr(404, 'Scheda non trovata');
    if (!seg[2] && m === 'GET') return scout.view(d.cards[id]);
    if (!seg[2] && m === 'PATCH') return scout.patchCard(id, body);
    if (!seg[2] && m === 'DELETE') { scout.removeCard(id); return { ok: true }; }
    if (seg[2] === 'react' && m === 'POST') return scout.react(id, body.type, body.reason);
    if (seg[2] === 'reason' && m === 'POST') return scout.setReason(id, body.reason);
    if (seg[2] === 'undo' && m === 'POST') return scout.undoReaction(id);
    if (seg[2] === 'check' || seg[2] === 'narrate') no();
  }
  if (seg[0] === 'check-all') { if (m === 'POST') no(); return { done: true, total: 0, checked: 0, changed: [] }; }
  if (seg[0] === 'extract') no();
  if (seg[0] === 'search') { if (seg[1] === 'run') no(); return { done: true, idle: true }; }
  if (seg[0] === 'tastes') {
    const clean = (b) => ({ text: String(b.text || '').trim().slice(0, 1000), kind: ['esplicita', 'ipotesi', 'incerta'].includes(b.kind) ? b.kind : 'esplicita', category: ['auto', 'moto', 'gommoni', 'generale', 'capacita'].includes(b.category) ? b.category : 'generale' });
    if (!seg[1] && m === 'POST') {
      const t = clean(body);
      if (!t.text) throw scout.httpErr(400, 'Testo mancante');
      const now = new Date().toISOString();
      const row = { id: SHIMS.store.id('t'), ...t, origin: body.origin || 'scritta da te', createdAt: now, updatedAt: now };
      d.tastes.push(row); persist();
      return row;
    }
    const t = d.tastes.find((x) => x.id === seg[1]);
    if (seg[1] && !t) throw scout.httpErr(404, 'Voce non trovata');
    if (t && m === 'PATCH') { const c = clean({ ...t, ...body }); Object.assign(t, c, { updatedAt: new Date().toISOString(), edited: true }); persist(); return t; }
    if (t && m === 'DELETE') { d.tastes.splice(d.tastes.indexOf(t), 1); persist(); return { ok: true }; }
  }
  if (seg[0] === 'profile' && m === 'GET') {
    const diary = d.reactions.slice().reverse().slice(0, 200).map((r) => ({ ...r, label: scout.REACTIONS[r.type].label, card: d.cards[r.cardId] ? { id: r.cardId, name: d.cards[r.cardId].name, category: d.cards[r.cardId].category } : null }));
    return { tastes: d.tastes, signals: scout.signals(), diary, surpriseBias: d.settings.surpriseBias || 0 };
  }
  if (seg[0] === 'dossiers') {
    if (!seg[1] && m === 'GET') return { items: Object.keys(d.dossiers).map((id) => scout.dossierView(id)).filter((x) => x.card).sort((a, b) => b.openedAt.localeCompare(a.openedAt)) };
    const ds = scout.dossierView(seg[1]);
    if (!ds) throw scout.httpErr(404, 'Approfondimento non trovato');
    if (!seg[2] && m === 'GET') return ds;
    if (!seg[2] && m === 'PATCH') return scout.updateDossier(seg[1], body);
    if (seg[2] === 'ai') no();
  }
  if (seg[0] === 'sources') {
    if (!seg[1] && m === 'GET') {
      const list = sources.registry.map((s) => ({ ...s, lastProbe: d.probes[s.id] || null }));
      return { sources: list, ai: await ai.status(), auto: { ...d.settings.autoSearch, enabled: false, nextAt: null }, runs: d.runs.slice(0, 8), network: { host: 'vetrina', passwordSet: true }, counts: { seen: Object.keys(d.seen).length, cards: Object.keys(d.cards).length } };
    }
    no();
  }
  if (seg[0] === 'settings' && m === 'PATCH') {
    if (body.autoSearch) no();
    if (body.base === null) d.settings.base = null;
    else if (body.base && Number.isFinite(+body.base.lat) && Number.isFinite(+body.base.lon)) d.settings.base = { label: String(body.base.label || 'Punto di partenza').slice(0, 80), lat: +body.base.lat, lon: +body.base.lon };
    if (body.budget) {
      const max = Math.round(Number(body.budget.maxStart));
      const pct = body.budget.iptPct === null || body.budget.iptPct === '' ? null : Number(body.budget.iptPct);
      d.settings.budget = { maxStart: Number.isFinite(max) ? Math.max(300, Math.min(50000, max)) : 2500, iptPct: pct == null || !Number.isFinite(pct) ? null : Math.max(0, Math.min(30, pct)) };
    }
    if (body.surpriseBias != null) d.settings.surpriseBias = Math.max(0, Math.min(3, +body.surpriseBias || 0));
    persist();
    return { settings: d.settings, auto: { ...d.settings.autoSearch, enabled: false, nextAt: null } };
  }
  if (seg[0] === 'export' && m === 'GET') return d;
  throw scout.httpErr(404, 'Percorso non trovato');
}

/* ---------- sblocco ---------- */
let ready;
const whenReady = new Promise((r) => { ready = r; });
window.scoutApi = async (path, method = 'GET', body) => {
  await whenReady;
  try {
    const j = await handle(path, method, body);
    return { ok: true, status: 200, json: async () => JSON.parse(JSON.stringify(j ?? {})) };
  } catch (e) {
    return { ok: false, status: e.status || 500, json: async () => ({ error: e.message }) };
  }
};

const download = (name, obj) => {
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([JSON.stringify(obj, null, 1)], { type: 'application/json' })), download: name });
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 60000);
};
document.addEventListener('click', (e) => {
  const a = e.target.closest?.('a[href="api/export"]');
  if (!a || !db) return;
  e.preventDefault();
  download('scout-backup.json', db);
});

function note(text, actions = []) {
  const box = document.getElementById('vetrina-note');
  box.replaceChildren(Object.assign(document.createElement('span'), { textContent: text }), ...actions);
  box.hidden = false;
}
const btn = (label, fn) => { const b = Object.assign(document.createElement('button'), { type: 'button', className: 'btn small', textContent: label }); b.addEventListener('click', fn); return b; };

async function open(archive, k) {
  key = k;
  const data = await openBox(archive, key);
  if (!data) throw new Error('chiave non valida');
  base = archive.updated || null;
  const local = await readLocal();
  if (local && local.base === base) db = Object.assign(empty(), local.db);
  else {
    db = Object.assign(empty(), data);
    if (local && local.db) {
      const older = local.db;
      note(`L'archivio sul sito è stato aggiornato: ora vedi quello del ${(base || '').slice(0, 10)}. Le modifiche fatte prima su questo dispositivo sono ancora qui, da scaricare.`,
        [btn('Scarica le modifiche precedenti', () => download('scout-modifiche-dispositivo.json', older)), btn('Ho capito', () => { document.getElementById('vetrina-note').hidden = true; })]);
    }
    await persist();
  }
  document.getElementById('vetrina-date').textContent = (base || '').slice(0, 10).split('-').reverse().join('/');
  document.getElementById('lock-main').remove();
  document.body.classList.remove('login');
  for (const id of ['mast', 'app', 'vetrina-bar']) document.getElementById(id).hidden = false;
  ready();
}

async function start() {
  const form = document.getElementById('lock');
  const msg = document.getElementById('lock-msg');
  let archive;
  try {
    const r = await fetch('archivio.enc.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error(String(r.status));
    archive = await r.json();
  } catch {
    msg.textContent = 'Non riesco a leggere l\'archivio: controlla la connessione e ricarica.';
    return;
  }
  try {
    const remembered = localStorage.getItem(KEY);
    if (remembered) { await open(archive, await importKey(remembered)); return; }
  } catch { try { localStorage.removeItem(KEY); } catch { /* niente */ } }
  form.hidden = false;
  form.querySelector('input[type=password]').focus();
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pw = cleanPassword(form.password.value);
    if (!pw) return;
    const b = form.querySelector('button'); b.disabled = true;
    msg.textContent = 'Apro il quaderno…';
    try {
      const r = await unlock(archive, pw);
      if (!r) throw new Error('password');
      const k = r.key;
      if (form.remember.checked) { try { localStorage.setItem(KEY, await exportKey(k)); } catch { /* niente */ } }
      await open(archive, k);
    } catch {
      msg.textContent = 'Parola d\'accesso non corretta.';
      b.disabled = false; form.password.select();
    }
  });
}
document.getElementById('vetrina-lock').addEventListener('click', () => { try { localStorage.removeItem(KEY); } catch { /* niente */ } location.reload(); });
start();
