// Vetrina online dello Scout: la logica dello Scout (lib/*.js, copiati così come sono) gira nel browser
// su una copia cifrata dell'archivio. Ricerca, verifica dei link e note AI restano allo Scout acceso
// sul computer: qui rispondono che non sono disponibili, senza toccare le schede.
// Generato da tools/scout-vetrina.mjs a partire da tools/templates/scout-vetrina.js: non modificare scout/motore.js.
import { unlock, openBox, importKey, exportKey, b64, unb64, cleanPassword } from '../app/lib/vault.js';

const LOCAL = 'scout.vetrina.v1'; // modifiche fatte su questo dispositivo, cifrate con la stessa chiave
const KEY = 'scout.vetrina.k'; // chiave ricordata (solo se richiesto)
const OFF = 'Nella vetrina online questa funzione non c\'è: ricerca, controllo dei link e note AI girano sullo Scout acceso sul computer.';

/* ---------- moduli dello Scout (CommonJS) ---------- */
const SOURCES = { "scout": function (module, exports, require) {
// Logica dello scout: ricerca, deduplicazione, verifica, flusso con varietà, reazioni, approfondimenti.
'use strict';
const store = require('./store');
const sources = require('./sources');
const { trails, byId: trailById } = require('./trails');
const costs = require('./costs');

const REACTIONS = {
  incuriosisce: { label: 'Mi incuriosisce', score: 1 },
  conserva: { label: 'Conserva l\'idea', score: 2 },
  sorprendimi: { label: 'Sorprendimi ancora', score: 1 },
  scarta: { label: 'Non fa per me', score: -1 },
  considera: { label: 'Questa la considero davvero', score: 2 },
};
const EFFORTS = { usare: 'Da usare e migliorare', fasi: 'Recupero per fasi', restauro: 'Restauro importante', capire: 'Ancora da capire' };

const db = () => store.load();
// Sezione "Economici": soglia sul costo di partenza (prezzo + passaggio + revisione) e maggiorazione IPT della tua provincia.
const BUDGET_DEFAULT = { maxStart: 2500, iptPct: null };
const budgetSettings = () => ({ ...BUDGET_DEFAULT, ...(db().settings.budget || {}) });
const startCostOf = (card) => costs.startCost(card, { iptPct: budgetSettings().iptPct });
const now = () => new Date().toISOString();

/* ---------- stato derivato delle schede ---------- */
function lastReaction(cardId) {
  const d = db();
  for (let i = d.reactions.length - 1; i >= 0; i--) if (d.reactions[i].cardId === cardId) return d.reactions[i];
  return null;
}

function distanceKm(card) {
  const b = db().settings.base, f = card.facts || {};
  if (!b || f.lat == null || f.lon == null) return null;
  const R = 6371, rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(f.lat - b.lat), dLon = rad(f.lon - b.lon);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(b.lat)) * Math.cos(rad(f.lat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

function view(card) {
  const r = lastReaction(card.id);
  const d = db();
  const t = trailById[card.trailId];
  return {
    ...card,
    reaction: r ? { type: r.type, label: REACTIONS[r.type].label, reason: r.reason || '', at: r.at } : null,
    reactionHistory: d.reactions.filter((x) => x.cardId === card.id).map((x) => ({ type: x.type, label: REACTIONS[x.type].label, reason: x.reason || '', at: x.at })),
    saved: !!r && (r.type === 'conserva' || r.type === 'considera'),
    hasDossier: !!d.dossiers[card.id],
    archived: card.status === 'non_disponibile',
    distanceKm: distanceKm(card),
    trail: t ? { id: t.id, label: t.label, why: t.why, kind: t.kind } : null,
    effortLabel: EFFORTS[card.effort || 'capire'],
    startCost: startCostOf(card),
  };
}

/* ---------- peso delle piste: le reazioni orientano, non comandano ---------- */
function trailWeights() {
  const d = db();
  const score = {};
  for (const r of d.reactions) {
    const c = d.cards[r.cardId];
    if (!c || !c.trailId) continue;
    score[c.trailId] = (score[c.trailId] || 0) + REACTIONS[r.type].score;
  }
  const w = {};
  // Limiti stretti di proposito: nessuna pista sparisce e nessuna monopolizza il flusso.
  for (const t of trails) w[t.id] = Math.max(0.5, Math.min(1.75, 1 + 0.2 * (score[t.id] || 0)));
  return w;
}

/* ---------- flusso "Scoperte" ---------- */
function feed(filters = {}) {
  const d = db();
  const w = trailWeights();
  let pool = Object.values(d.cards).filter((c) => c.status === 'attiva' && !c.duplicateOf && !lastReaction(c.id));
  const total = pool.length;
  if (filters.cat) pool = pool.filter((c) => c.category === filters.cat);
  if (filters.effort) pool = pool.filter((c) => (c.effort || 'capire') === filters.effort);
  if (filters.maxPrice) pool = pool.filter((c) => c.facts?.price != null && c.facts.price <= +filters.maxPrice);
  if (filters.maxKm) pool = pool.filter((c) => { const k = distanceKm(c); return k != null && k <= +filters.maxKm; });
  pool.sort((a, b) => (w[b.trailId] || 1) - (w[a.trailId] || 1) || (b.addedAt || '').localeCompare(a.addedAt || ''));
  // Composizione: una sorpresa almeno ogni 4 schede (ogni 3 se hai chiesto "Sorprendimi ancora"),
  // e mai due schede di fila della stessa pista o, se possibile, della stessa categoria.
  const every = (d.settings.surpriseBias || 0) > 0 ? 3 : 4;
  const out = [];
  while (pool.length) {
    const prev = out[out.length - 1];
    const wantSurprise = out.length % every === every - 1;
    // Tra le candidate valide vince la categoria finora meno rappresentata: auto, moto e gommoni si alternano.
    const seenCat = (c) => out.filter((o) => o.category === c.category).length;
    const pick = (test) => { let best = -1; pool.forEach((c, k) => { if (test(c) && (best < 0 || seenCat(c) < seenCat(pool[best]))) best = k; }); return best; };
    let i = -1;
    if (wantSurprise) i = pick((c) => c.kind === 'sorpresa' && (!prev || c.trailId !== prev.trailId));
    if (i < 0) i = pick((c) => !prev ? true : (c.category !== prev.category && c.trailId !== prev.trailId));
    if (i < 0) i = pick((c) => !prev || c.trailId !== prev.trailId);
    if (i < 0) i = 0;
    out.push(pool.splice(i, 1)[0]);
  }
  return { total, items: out.map(view) };
}

/* ---------- sezione "Economici": costo di partenza entro la soglia, dal più basso ---------- */
function budgetFeed(opts = {}) {
  const d = db();
  const b = budgetSettings();
  const max = Number(opts.maxStart) > 0 ? Number(opts.maxStart) : b.maxStart;
  const items = Object.values(d.cards)
    .filter((c) => c.status === 'attiva' && !c.duplicateOf && (c.category === 'auto' || c.category === 'moto') && (!opts.cat || c.category === opts.cat))
    .map((c) => ({ c, sc: startCostOf(c) }))
    // Dentro se anche il massimo della forbice sta nella soglia; se la stima è incompleta (moto sotto i 30 anni) decide il minimo.
    .filter(({ sc }) => sc && (sc.complete ? sc.max : sc.min) <= max)
    .sort((a, b2) => a.sc.min - b2.sc.min);
  const fresh = items.filter(({ c }) => !lastReaction(c.id));
  return { maxStart: max, iptPct: b.iptPct, total: items.length, reacted: items.length - fresh.length, items: fresh.map(({ c }) => view(c)) };
}

function collection(viewName) {
  const all = Object.values(db().cards).map(view).sort((a, b) => ((b.reaction?.at || b.addedAt) || '').localeCompare((a.reaction?.at || a.addedAt) || ''));
  const f = {
    conservate: (c) => c.reaction && (c.reaction.type === 'conserva' || c.reaction.type === 'considera') && !c.archived,
    incuriosito: (c) => c.reaction && (c.reaction.type === 'incuriosisce' || c.reaction.type === 'sorprendimi') && !c.archived,
    archiviate: (c) => c.archived && (!c.reaction || c.reaction.type !== 'scarta'),
    scartate: (c) => c.reaction?.type === 'scarta',
    nonverificate: (c) => !c.archived && c.status !== 'attiva' && (!c.reaction || c.reaction.type !== 'scarta'),
  }[viewName];
  return f ? all.filter(f) : all;
}

/* ---------- reazioni ---------- */
function react(cardId, type, reason) {
  const d = db();
  const card = d.cards[cardId];
  if (!card) throw httpErr(404, 'Scheda non trovata');
  if (!REACTIONS[type]) throw httpErr(400, 'Reazione non riconosciuta');
  const r = { id: store.id('r'), cardId, type, reason: String(reason || '').trim().slice(0, 1000), at: now() };
  d.reactions.push(r);
  if (type === 'sorprendimi') d.settings.surpriseBias = Math.min(3, (d.settings.surpriseBias || 0) + 1);
  if (type === 'scarta' && card.kind === 'sorpresa') d.settings.surpriseBias = Math.max(0, (d.settings.surpriseBias || 0) - 1);
  // Solo l'azione esplicita "Questa la considero davvero" apre un approfondimento.
  if (type === 'considera' && !d.dossiers[cardId]) d.dossiers[cardId] = newDossier(card);
  store.save();
  return view(card);
}

function setReason(cardId, reason) {
  const r = lastReaction(cardId);
  if (!r) throw httpErr(400, 'Nessuna reazione da annotare');
  r.reason = String(reason || '').trim().slice(0, 1000);
  store.save();
  return view(db().cards[cardId]);
}

function undoReaction(cardId) {
  const d = db();
  const r = lastReaction(cardId);
  if (!r) return view(d.cards[cardId]);
  d.reactions.splice(d.reactions.indexOf(r), 1);
  store.save();
  return view(d.cards[cardId]);
}

/* ---------- approfondimenti ---------- */
function newDossier(card) {
  const item = (text) => ({ id: store.id('k'), text, done: false, origin: 'promemoria generico dello scout' });
  const common = [
    'Riaprire l\'annuncio e controllare che sia ancora attivo (pulsante "Ricontrolla la fonte").',
    'Vedere il mezzo di persona prima di qualsiasi valutazione: le foto non bastano.',
    'Documenti: intestatario, libretto, eventuali fermi o gravami — da verificare, non dichiarati qui.',
  ];
  const byCat = {
    auto: ['Ruggine strutturale: fondi, longheroni, passaruota, attacchi sospensioni.', 'Quali lavori restano nelle tue mani (carrozzeria, interni, meccanica smontabile) e quali chiedono un professionista (interno motore, alimentazione, eventuale turbo).', 'Attrezzi da integrare: elencarli e metterli nel conto del progetto.', 'Disponibilità dei ricambi specifici del modello: da verificare presso ricambisti e club, qui non è stata controllata.'],
    moto: ['Stato di telaio, forcella e impianto elettrico; avviamento a freddo.', 'Quali lavori restano nelle tue mani e quali chiedono un professionista (interno motore, carburazione/iniezione).', 'Uso previsto: giri fuori porta o viaggi di più giorni con borse? Verificare attacchi e portata.', 'Disponibilità dei ricambi specifici del modello: da verificare, qui non è stata controllata.'],
    gommoni: ['Misure reali: lunghezza, larghezza, spazio a bordo. Sotto i 2,6 m circa per te è troppo piccolo.', 'Tenuta dei tubolari, incollaggi, specchio di poppa, pagliolo, valvole: prova di gonfiaggio prolungata.', 'Trasporto: NON è dato per scontato che stia sul tetto del Vito. Verificare peso, ingombro da smontato, portata delle barre e modalità di carico.', 'Motore: incluso o no? Potenza massima ammessa, documenti, eventuali obblighi (da verificare).', 'Ritiro: se l\'annuncio è all\'estero, distanza e costo del viaggio fanno parte del progetto.'],
    altro: ['Capire quali lavori restano nelle tue mani e quali chiedono un professionista.'],
  };
  return {
    cardId: card.id, openedAt: now(), notes: '',
    checklist: [...common, ...(byCat[card.category] || byCat.altro)].map(item),
    questions: [],
    // Nessun costo inventato: la tabella parte vuota e la riempi tu (o l'AI, come bozza da ipotesi dichiarate).
    costs: card.facts?.price != null ? [{ id: store.id('c'), label: 'Prezzo richiesto nell\'annuncio', min: card.facts.price, max: card.facts.price, note: 'Dato della fonte, non trattato', origin: 'fonte' }] : [],
    aiDraft: null,
  };
}

function dossierView(cardId) {
  const d = db();
  const ds = d.dossiers[cardId];
  if (!ds) return null;
  const card = d.cards[cardId];
  const own = ds.costs.filter((c) => c.origin !== 'fonte');
  const sum = (k) => ds.costs.reduce((s, c) => s + (Number(c[k]) || 0), 0);
  return {
    ...ds, card: card ? view(card) : null,
    // Un totale ha senso solo se hai inserito almeno una voce oltre al prezzo richiesto.
    total: own.length ? { min: sum('min'), max: sum('max'), entries: ds.costs.length } : null,
  };
}

function updateDossier(cardId, patch) {
  const ds = db().dossiers[cardId];
  if (!ds) throw httpErr(404, 'Approfondimento non trovato');
  if (typeof patch.notes === 'string') ds.notes = patch.notes.slice(0, 20000);
  if (Array.isArray(patch.checklist)) ds.checklist = patch.checklist.slice(0, 80).map((k) => ({ id: k.id || store.id('k'), text: String(k.text || '').slice(0, 500), done: !!k.done, origin: k.origin || 'aggiunta da te' })).filter((k) => k.text);
  if (Array.isArray(patch.questions)) ds.questions = patch.questions.slice(0, 60).map((q) => ({ id: q.id || store.id('q'), text: String(q.text || '').slice(0, 500), origin: q.origin || 'aggiunta da te' })).filter((q) => q.text);
  if (Array.isArray(patch.costs)) ds.costs = patch.costs.slice(0, 80).map((c) => ({ id: c.id || store.id('c'), label: String(c.label || '').slice(0, 200), min: numOrNull(c.min), max: numOrNull(c.max), note: String(c.note || '').slice(0, 400), origin: c.origin || 'tua stima' })).filter((c) => c.label);
  ds.updatedAt = now();
  store.save();
  return dossierView(cardId);
}
const numOrNull = (v) => (v === '' || v == null || !Number.isFinite(+v) ? null : Math.max(0, Math.round(+v)));

/* ---------- verifica della fonte ---------- */
function applyCheck(card, result) {
  card.status = result.status;
  card.check = result.check;
  card.checks = [...(card.checks || []), { at: result.check.at, status: result.status }].slice(-8);
  if (result.listing && result.status !== 'non_disponibile') {
    // Aggiorna i fatti della fonte (prezzo ecc.) ma non tocca note, idea di progetto e reazioni.
    if (result.listing.facts?.price != null && card.facts?.price != null && result.listing.facts.price !== card.facts.price) {
      card.priceHistory = [...(card.priceHistory || []), { at: result.check.at, from: card.facts.price, to: result.listing.facts.price }].slice(-10);
    }
    card.facts = { ...card.facts, ...Object.fromEntries(Object.entries(result.listing.facts).filter(([, v]) => v != null)) };
    if (result.listing.images.length) card.images = result.listing.images;
  }
  if (result.status === 'non_disponibile' && !card.archivedAt) card.archivedAt = result.check.at;
}

async function recheck(cardId) {
  const card = db().cards[cardId];
  if (!card) throw httpErr(404, 'Scheda non trovata');
  const res = await sources.verify(card.url);
  // Una fonte che il server non riesce a leggere non "retrocede" una scheda già verificata a mano da te.
  if (res.status === 'non_verificabile' && card.check?.by === 'utente') {
    card.lastServerAttempt = res.check;
  } else applyCheck(card, res);
  store.save();
  return view(card);
}

let recheckJob = null;
function recheckAll() {
  if (recheckJob && !recheckJob.done) return recheckJob;
  const ids = Object.values(db().cards).filter((c) => c.status !== 'non_disponibile').map((c) => c.id);
  const job = recheckJob = { startedAt: now(), total: ids.length, checked: 0, changed: [], done: false };
  (async () => {
    for (const id of ids) {
      const before = db().cards[id]?.status;
      try { const v = await recheck(id); if (v.status !== before) job.changed.push({ id, name: v.name, from: before, to: v.status }); } catch {}
      job.checked++;
    }
    job.done = true; job.finishedAt = now();
  })();
  return job;
}

/* ---------- deduplicazione ---------- */
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, ' ').trim();
function fingerprint(l) {
  if (l.facts?.price == null || !l.facts?.city) return null;
  return [norm(l.name), l.facts.price, norm(l.facts.city).split(' ')[0], l.facts.year || '', l.facts.km || ''].join('|');
}
function loosePrint(l) {
  const f = l.facts || {};
  if (f.price == null || !f.city || !f.year || !f.km) return null;
  return [norm(l.name).split(' ')[0], f.price, norm(f.city).split(' ')[0], f.year, f.km].join('|');
}
function findDuplicate(listing) {
  const d = db();
  const byKey = Object.values(d.cards).find((c) => c.key === listing.key);
  if (byKey) return { card: byKey, how: 'stesso annuncio' };
  const fp = fingerprint(listing);
  if (fp) { const c = Object.values(d.cards).find((x) => x.fingerprint === fp); if (c) return { card: c, how: 'stesso mezzo su un altro annuncio (stesso modello, prezzo, luogo)' }; }
  // Lo stesso rivenditore pubblica su più siti con titoli diversi: stessa marca, prezzo, città, anno e km.
  const lp = loosePrint(listing);
  if (lp) { const c = Object.values(d.cards).find((x) => x.key !== listing.key && loosePrint(x) === lp); if (c) return { card: c, how: 'stesso mezzo su un altro sito (stessa marca, prezzo, città, anno e km)' }; }
  return null;
}

function cardFromListing(listing, extra) {
  return {
    id: store.id('s'), key: listing.key, fingerprint: fingerprint(listing),
    source: listing.source, sourceLabel: sources.byId[listing.source]?.label || hostOf(listing.url), url: listing.url,
    category: listing.category || 'altro', name: listing.name, version: listing.version || '',
    facts: listing.facts || {}, sellerText: listing.sellerText || '', images: listing.images || [], imageKind: 'esemplare',
    effort: 'capire', scout: null, userNote: '', addedAt: now(), ...extra,
  };
}
const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return 'link'; } };

/* ---------- ricerca assistita ---------- */
let job = null;
function searchStatus() { return job; }

function pickTrails(opts) {
  const d = db();
  if (opts.trailIds?.length) return opts.trailIds.map((i) => trailById[i]).filter(Boolean);
  const w = trailWeights();
  let pool = trails.filter((t) => (!opts.category || t.category === opts.category) && (!opts.budget || t.category === 'auto' || t.category === 'moto'));
  const age = (t) => (d.trailState[t.id]?.lastRunAt ? (Date.now() - Date.parse(d.trailState[t.id].lastRunAt)) / 3600e3 : 1e4);
  // Punteggio = preferenza (limitata) × "da quanto non la guardo" + un po' di caso.
  const scored = pool.map((t) => ({ t, s: w[t.id] * Math.min(3, 0.5 + age(t) / 24) * (0.6 + Math.random() * 0.8) })).sort((a, b) => b.s - a.s);
  // In modalità economica molte piste non hanno annunci sotto soglia: se ne interrogano di più.
  const n = Math.min(opts.maxTrails || (opts.budget ? 6 : 4), scored.length);
  const chosen = [];
  for (const { t } of scored) {
    if (chosen.length >= n) break;
    if (chosen.filter((c) => c.category === t.category).length >= Math.ceil(n / 2) && !opts.category) continue;
    chosen.push(t);
  }
  if (!chosen.some((t) => t.kind === 'sorpresa')) { const s = scored.find((x) => x.t.kind === 'sorpresa'); if (s) chosen[chosen.length - 1] = s.t; }
  return chosen;
}

function startSearch(opts = {}) {
  if (job && !job.done) return job;
  const chosen = pickTrails(opts);
  if (opts.budget) opts = { ...opts, budgetCap: budgetCap() };
  job = { id: store.id('run'), startedAt: now(), trigger: opts.trigger || 'manuale', budget: opts.budgetCap || null, done: false, steps: [], added: [], stats: { trovati: 0, giaVisti: 0, esclusi: 0, nonVerificati: 0, pubblicati: 0 }, trails: chosen.map((t) => t.label) };
  runSearch(job, chosen, opts).catch((e) => { job.error = String(e.message || e); }).finally(() => {
    job.done = true; job.finishedAt = now();
    const d = db();
    d.runs.unshift({ id: job.id, startedAt: job.startedAt, finishedAt: job.finishedAt, trigger: job.trigger, trails: job.trails, stats: job.stats, steps: job.steps, error: job.error || null });
    d.runs = d.runs.slice(0, 30);
    store.save();
  });
  return job;
}

// Prezzo massimo da cercare = soglia sul costo di partenza meno il passaggio più economico possibile.
// Il minimo esclude annunci di ricambi, "cerco" e prezzi simbolici.
function budgetCap() {
  const { maxStart } = budgetSettings();
  return { maxStart, maxPrice: Math.max(0, maxStart - Math.round(costs.TARIFFE.fissiMin)), minPrice: { auto: 300, moto: 200 } };
}
function withPriceCap(path, maxPrice) {
  const clean = path.replace(/([?&])(priceto|sort|desc)=[^&]*/g, '$1').replace(/[?&]+$/, '').replace(/\?&+/, '?').replace(/&&+/g, '&');
  return clean + (clean.includes('?') ? '&' : '?') + `priceto=${maxPrice}&sort=price&desc=0`;
}

async function runSearch(job, chosen, opts) {
  const d = db();
  const perTrail = opts.perTrail || 2;
  for (const t of chosen) {
    const all = t.paths.map((x) => (typeof x === 'string' ? { source: t.source, path: x } : x));
    const tried = [];
    let res, adapter, step, choice;
    // Se una fonte rifiuta la lettura si prova UNA volta un percorso di un'altra fonte della stessa pista: mai la stessa.
    for (let attempt = 0; attempt < 2; attempt++) {
      const options = all.filter((x) => !tried.includes(x.source));
      if (!options.length) break;
      choice = options[Math.floor(Math.random() * options.length)];
      // In modalità economica AutoScout24 è preferita: è l'unica fonte che accetta un tetto di prezzo nella ricerca.
      if (opts.budgetCap && choice.source !== 'autoscout24' && Math.random() < 0.6) choice = options.find((x) => x.source === 'autoscout24') || choice;
      if (opts.budgetCap && choice.source === 'autoscout24') choice = { ...choice, path: withPriceCap(choice.path, opts.budgetCap.maxPrice) };
      tried.push(choice.source);
      adapter = sources.byId[choice.source];
      step = { trail: t.label, source: adapter.label, path: choice.path, outcome: '' };
      job.steps.push(step);
      job.current = `Leggo ${adapter.label}: ${t.label}`;
      res = await adapter.search(choice.path);
      if (res.ok) break;
      step.outcome = 'Ricerca non riuscita: ' + (sources.REASONS[res.reason] || res.reason);
    }
    d.trailState[t.id] = { lastRunAt: now(), lastOutcome: res.ok ? 'ok' : res.reason };
    if (!res.ok) continue;
    // Filtri della pista, più quelli propri del percorso scelto (es. parola obbligatoria nel titolo su Subito).
    const f = { yearMin: choice.yearMin ?? t.yearMin, yearMax: choice.yearMax ?? t.yearMax, minPrice: choice.minPrice ?? t.minPrice, not: choice.not || t.not };
    const musts = [t.must, choice.must].filter(Boolean);
    job.stats.trovati += res.items.length;
    let fresh = [];
    for (const it of res.items) {
      if (d.seen[it.key]) { job.stats.giaVisti++; continue; }
      const text = `${it.name} ${it.version}`;
      const out = (f.yearMin && it.year && it.year < f.yearMin) || (f.yearMax && it.year && it.year > f.yearMax)
        || musts.some((re) => !re.test(text)) || (f.not && f.not.test(text)) || (f.minPrice && it.price != null && it.price < f.minPrice)
        || it.offerType === 'N' || !it.hasImage || it.pro || (it.lengthCm && it.lengthCm < 260);
      if (out) { job.stats.esclusi++; d.seen[it.key] = { at: now(), outcome: 'escluso' }; continue; }
      // Fuori soglia di prezzo: escluso da questa ricerca ma NON segnato come visto, così resta proponibile nel flusso normale.
      if (opts.budgetCap && (it.price == null || it.price > opts.budgetCap.maxPrice || it.price < opts.budgetCap.minPrice[t.category])) { job.stats.esclusi++; continue; }
      fresh.push(it);
    }
    fresh = fresh.sort(() => Math.random() - 0.5).slice(0, perTrail);
    let published = 0;
    for (const it of fresh) {
      job.current = `Apro e verifico: ${it.name}`;
      const v = await sources.verify(it.url);
      if (v.status !== 'attiva') {
        // Requisito: senza pagina e fotografie verificate la scheda non entra nel flusso.
        job.stats.nonVerificati++;
        d.seen[it.key] = { at: now(), outcome: 'non verificato: ' + (v.check.page.ok ? v.check.image.detail : v.check.page.detail) };
        continue;
      }
      // Anno e km letti dalla pagina di ricerca della stessa fonte, se la pagina dell'annuncio non li riporta.
      for (const k of ['year', 'km']) if (v.listing.facts[k] == null && it[k] != null) v.listing.facts[k] = it[k];
      const dup = findDuplicate(v.listing);
      if (dup) { job.stats.giaVisti++; d.seen[it.key] = { at: now(), outcome: 'doppione' }; continue; }
      const card = cardFromListing(v.listing, { trailId: t.id, kind: t.kind, category: t.category, origin: 'ricerca', status: 'attiva', check: v.check, checks: [{ at: v.check.at, status: 'attiva' }] });
      d.cards[card.id] = card;
      d.seen[card.key] = { at: now(), outcome: 'scheda' };
      job.added.push({ id: card.id, name: card.name });
      job.stats.pubblicati++; published++;
      store.save();
    }
    step.outcome = `${res.items.length} annunci letti, ${published} nuove schede verificate`;
  }
  job.current = null;
  store.save();
}

/* ---------- aggiunta manuale ---------- */
async function extract(url) {
  let key; try { key = sources.keyFor(url); } catch { throw httpErr(400, 'Indirizzo non valido'); }
  const existing = Object.values(db().cards).find((c) => c.key === key);
  if (existing) return { duplicate: view(existing) };
  const v = await sources.verify(url);
  const draft = v.listing
    ? { url: v.listing.url, key: v.listing.key, source: v.listing.source, category: v.listing.category, name: v.listing.name, version: v.listing.version, facts: v.listing.facts, sellerText: v.listing.sellerText, images: v.listing.images }
    : { url: sources.normalizeUrl(url), key, source: 'link', category: null, name: '', version: '', facts: {}, sellerText: '', images: [] };
  const dup = v.listing ? findDuplicate(v.listing) : null;
  return { draft, status: v.status, check: v.check, possibleDuplicate: dup ? { how: dup.how, card: view(dup.card) } : null };
}

function createManual(body) {
  const d = db();
  const draft = body.draft || {};
  if (!draft.url || !String(body.name || draft.name || '').trim()) throw httpErr(400, 'Servono almeno il link e il nome del mezzo');
  const key = sources.keyFor(draft.url);
  if (Object.values(d.cards).some((c) => c.key === key)) throw httpErr(409, 'Questo annuncio è già in archivio');
  const serverOk = body.status === 'attiva' && body.check?.by === 'server';
  let status = serverOk ? 'attiva' : 'non_verificata';
  let check = body.check || null;
  // Se il server non ha potuto leggere la pagina puoi dichiarare di averla aperta tu: resta scritto chi ha verificato.
  if (!serverOk && body.userConfirms) {
    status = 'attiva';
    check = { at: now(), by: 'utente', page: { ok: true, http: 0, detail: 'aperta da te nel browser (dichiarazione tua, non verifica del server)' }, image: { ok: null, http: 0, detail: 'non controllata dal server' }, serverAttempt: body.check || null };
  }
  const facts = { ...(draft.facts || {}) };
  if (body.price !== undefined) facts.price = numOrNull(body.price);
  if (body.city !== undefined) facts.city = String(body.city || '').slice(0, 120) || null;
  if (body.year !== undefined) facts.year = numOrNull(body.year);
  const images = Array.isArray(body.images) ? body.images.filter((u) => /^https:\/\//.test(u)).slice(0, 12) : (draft.images || []);
  const card = cardFromListing({ key, source: draft.source || 'link', url: draft.url, category: body.category || draft.category || 'altro', name: String(body.name || draft.name).slice(0, 200), version: String(body.version ?? draft.version ?? '').slice(0, 200), facts, sellerText: draft.sellerText || '', images },
    { origin: 'manuale', status, check, checks: check ? [{ at: check.at, status }] : [], kind: 'affine', trailId: null, effort: EFFORTS[body.effort] ? body.effort : 'capire', userNote: String(body.userNote || '').slice(0, 4000), editedFields: body.editedFields || [] });
  d.cards[card.id] = card;
  d.seen[key] = { at: now(), outcome: 'scheda (manuale)' };
  // Un link aggiunto da te è già una scelta: entra tra le idee conservate, non tra le proposte dello scout.
  d.reactions.push({ id: store.id('r'), cardId: card.id, type: 'conserva', reason: String(body.reason || '').slice(0, 1000), at: now() });
  store.save();
  return view(card);
}

function patchCard(id, patch) {
  const card = db().cards[id];
  if (!card) throw httpErr(404, 'Scheda non trovata');
  if (patch.effort && EFFORTS[patch.effort]) { card.effort = patch.effort; card.effortBy = 'utente'; }
  if (typeof patch.userNote === 'string') card.userNote = patch.userNote.slice(0, 4000);
  if (patch.category && ['auto', 'moto', 'gommoni', 'altro'].includes(patch.category)) card.category = patch.category;
  if (patch.scout && typeof patch.scout === 'object') {
    // Testo riscritto da te: cambia l'autore, così non resta attribuito all'AI.
    card.scout = { ...(card.scout || {}), ...pick(patch.scout, ['title', 'why', 'project', 'doubt']), author: 'utente', writtenAt: now() };
  }
  store.save();
  return view(card);
}
const pick = (o, keys) => Object.fromEntries(keys.filter((k) => typeof o[k] === 'string').map((k) => [k, o[k].slice(0, 3000)]));

function removeCard(id) {
  const d = db();
  if (!d.cards[id]) throw httpErr(404, 'Scheda non trovata');
  delete d.cards[id]; delete d.dossiers[id];
  d.reactions = d.reactions.filter((r) => r.cardId !== id);
  store.save();
}

/* ---------- profilo ---------- */
function signals() {
  // Conteggi veri delle tue reazioni, raggruppati per pista: osservazioni, non regole.
  const d = db();
  const by = {};
  for (const r of d.reactions) {
    const c = d.cards[r.cardId];
    if (!c) continue;
    const k = c.trailId || 'manuale';
    (by[k] = by[k] || { trail: trailById[k]?.label || 'Aggiunte da te', category: c.category, pos: 0, neg: 0, reasons: [] });
    if (REACTIONS[r.type].score > 0) by[k].pos++; else by[k].neg++;
    if (r.reason) by[k].reasons.push({ type: REACTIONS[r.type].label, text: r.reason, card: c.name, at: r.at });
  }
  return Object.values(by);
}

function httpErr(status, message) { const e = new Error(message); e.status = status; return e; }

/* ---------- ricerca periodica facoltativa (solo a server acceso) ---------- */
let autoTimer = null, nextAutoAt = null;
function scheduleAuto() {
  if (autoTimer) clearTimeout(autoTimer);
  autoTimer = null; nextAutoAt = null;
  const a = db().settings.autoSearch;
  if (!a?.enabled) return;
  const ms = Math.max(6, Number(a.hours) || 24) * 3600e3;
  nextAutoAt = new Date(Date.now() + ms).toISOString();
  autoTimer = setTimeout(() => { startSearch({ trigger: 'periodica' }); scheduleAuto(); }, ms);
  autoTimer.unref?.();
}
const autoInfo = () => ({ ...db().settings.autoSearch, nextAt: nextAutoAt });

module.exports = { REACTIONS, EFFORTS, view, feed, collection, react, setReason, undoReaction, dossierView, updateDossier, recheck, recheckAll, recheckStatus: () => recheckJob,
  startSearch, searchStatus, findDuplicate, budgetFeed, budgetSettings, withPriceCap, extract, createManual, patchCard, removeCard, signals, trailWeights, scheduleAuto, autoInfo, httpErr };

},
"sources": function (module, exports, require) {
// Fonti: cosa è davvero collegabile e come si legge. Ogni adattatore restituisce
// solo ciò che la pagina contiene (fatti strutturati e testo del venditore): nessuna interpretazione.
'use strict';
const { politeGet, checkImage } = require('./net');

const decode = (s) => String(s || '')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;|&#x27;|&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
const strip = (h) => decode(String(h || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ' ')).replace(/[ \t]+/g, ' ').replace(/\n\s+/g, '\n').trim();
// I recapiti del venditore non vengono conservati: restano solo sulla pagina originale.
const maskContacts = (s) => String(s || '')
  .replace(/(\+?\d[\d\s.\-\/]{7,}\d)/g, (m) => (m.replace(/\D/g, '').length >= 9 && !/^\d{1,2}[.\/-]\d{1,2}[.\/-]\d{2,4}$/.test(m.trim()) ? '[recapito omesso]' : m))
  .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[recapito omesso]');
const num = (s) => { const n = parseInt(String(s ?? '').replace(/[^\d]/g, ''), 10); return Number.isFinite(n) ? n : null; };

function nextData(html) {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null;
  try { return JSON.parse(m[1]).props.pageProps; } catch { return null; }
}

/* ---------- AutoScout24 Italia ---------- */
const AS24 = 'https://www.autoscout24.it';
const as24 = {
  id: 'autoscout24', label: 'AutoScout24 Italia', host: 'www.autoscout24.it', country: 'IT',
  categories: ['auto', 'moto'],
  match: (u) => u.hostname.endsWith('autoscout24.it') && /\/annunci\//.test(u.pathname),
  keyFromUrl: (u) => { const m = u.pathname.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/); return m ? 'autoscout24:' + m[1] : null; },

  async search(pathAndQuery) {
    const r = await politeGet(AS24 + '/' + pathAndQuery);
    if (!r.ok) return { ok: false, http: r.status, reason: r.reason };
    const p = nextData(r.text);
    if (!p || !Array.isArray(p.listings)) return { ok: false, http: r.status, reason: 'formato_inatteso' };
    const items = p.listings.filter((l) => l && l.id && l.url).map((l) => {
      const v = l.vehicle || {}, t = l.tracking || {};
      const yr = (t.firstRegistration || '').match(/(\d{4})$/);
      return {
        key: 'autoscout24:' + l.id, url: AS24 + l.url,
        name: [v.make, v.model].filter(Boolean).join(' '), version: v.modelVersionInput || '',
        price: l.price?.priceRaw ?? null, year: yr ? +yr[1] : null, km: num(t.mileage),
        city: l.location?.city || '', hasImage: (l.images || []).length > 0, offerType: v.offerType,
      };
    });
    return { ok: true, http: r.status, total: p.numberOfResults ?? items.length, items };
  },

  async detail(url) {
    const r = await politeGet(url);
    if (!r.ok) return { ok: false, http: r.status, reason: r.reason };
    // Un annuncio rimosso non dà errore: AutoScout24 rimanda alla pagina di ricerca del modello.
    if (r.finalUrl && !/\/annunci\//.test(new URL(r.finalUrl).pathname)) return { ok: false, http: r.status, reason: 'non_trovato' };
    const p = nextData(r.text);
    const d = p && p.listingDetails;
    if (!d || !d.id) return { ok: false, http: r.status, reason: 'formato_inatteso' };
    const v = d.vehicle || {}, loc = d.location || {};
    const price = d.prices?.public?.priceRaw ?? null;
    const year = (v.firstRegistrationDateRaw || '').slice(0, 4);
    return {
      ok: true, http: r.status,
      listing: {
        key: 'autoscout24:' + d.id, source: 'autoscout24', url: (r.finalUrl || url).split('?')[0],
        category: /motor|bike/i.test(v.type || d.vehicleType || '') ? 'moto' : 'auto',
        name: [v.make, v.model].filter(Boolean).join(' '), version: v.modelVersionInput || v.modelVersionCustom || '',
        facts: {
          price, priceText: d.prices?.public?.price || null, negotiable: !!d.prices?.public?.negotiable,
          year: year ? +year : null, km: v.mileageInKmRaw ?? null,
          power: v.rawPowerInKw ? `${v.rawPowerInKw} kW` : (v.powerInKw || null), displacement: v.rawDisplacementInCCM ? `${v.rawDisplacementInCCM} cm³` : (v.displacementInCCM || null),
          fuel: v.fuelCategory?.formatted || null, gearbox: v.transmissionType || null, color: v.bodyColor || null,
          city: loc.city || null, zip: loc.zip || null, country: loc.countryCode || 'IT',
          lat: loc.latitude ?? null, lon: loc.longitude ?? null,
          sellerType: d.seller?.isDealer ? 'Concessionario' : 'Privato',
          listedAt: d.createdTimestampWithOffset || null,
        },
        sellerText: maskContacts(strip(d.description || '')),
        images: (d.images || []).slice(0, 12),
      },
    };
  },
};

/* ---------- Kleinanzeigen (Germania) ---------- */
const KA = 'https://www.kleinanzeigen.de';
const ka = {
  id: 'kleinanzeigen', label: 'Kleinanzeigen (Germania)', host: 'www.kleinanzeigen.de', country: 'DE',
  categories: ['gommoni'],
  match: (u) => u.hostname.endsWith('kleinanzeigen.de') && /\/s-anzeige\//.test(u.pathname),
  keyFromUrl: (u) => { const m = u.pathname.match(/\/(\d{6,})-\d+-\d+\/?$/); return m ? 'kleinanzeigen:' + m[1] : null; },

  async search(pathAndQuery) {
    const r = await politeGet(KA + '/' + pathAndQuery);
    if (!r.ok) return { ok: false, http: r.status, reason: r.reason };
    const items = [];
    const re = /<article[^>]*data-adid="(\d+)"[^>]*data-href="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g;
    let m;
    while ((m = re.exec(r.text))) {
      const body = m[3];
      let title = '';
      const ld = body.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      if (ld) { try { title = JSON.parse(ld[1]).title || ''; } catch {} }
      const text = strip(body.replace(/<script[\s\S]*?<\/script>/g, ''));
      const pm = text.match(/(\d{1,3}(?:\.\d{3})*)\s*€/);
      items.push({
        key: 'kleinanzeigen:' + m[1], url: KA + decode(m[2]), name: title, version: '',
        price: pm ? num(pm[1]) : null, year: null, km: null, city: (text.match(/\b\d{5}\s+[^\d|]{2,40}?(?=\s+\d{2}\.\d{2}\.\d{4}|\s+Heute|\s+Gestern|$)/) || [''])[0].trim(),
        hasImage: !!ld, pro: /\bPRO\b/.test(text),
      });
    }
    if (!items.length && !/data-adid/.test(r.text)) return { ok: /keine (Anzeigen|Ergebnisse)/i.test(r.text), http: r.status, reason: 'formato_inatteso', items: [], total: 0 };
    return { ok: true, http: r.status, total: items.length, items };
  },

  async detail(url) {
    const r = await politeGet(url);
    if (!r.ok) return { ok: false, http: r.status, reason: r.reason };
    const h = r.text;
    const og = (p) => { const m = h.match(new RegExp('<meta property="og:' + p + '" content="([^"]*)"')); return m ? decode(m[1]) : null; };
    const title = strip((h.match(/id="viewad-title"[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '') || og('title');
    const key = this.keyFromUrl(new URL(r.finalUrl || url));
    if (!title || !key || !/id="viewad-title"/.test(h)) return { ok: false, http: r.status, reason: 'formato_inatteso' };
    const priceText = strip((h.match(/id="viewad-price"[^>]*>([\s\S]*?)<\/h2>/) || [])[1] || '');
    const locality = strip((h.match(/id="viewad-locality"[^>]*>([\s\S]*?)<\/span>/) || [])[1] || '');
    const desc = strip((h.match(/id="viewad-description-text"[^>]*>([\s\S]*?)<\/p>/) || [])[1] || '');
    const images = [];
    const re = /<script type="application\/ld\+json">\s*(\{"creditText"[\s\S]*?\})\s*<\/script>/g;
    let m;
    while ((m = re.exec(h))) { try { const u = JSON.parse(m[1]).contentUrl; if (u && !images.includes(u)) images.push(u); } catch {} }
    if (!images.length && og('image')) images.push(og('image'));
    const zip = (locality.match(/\b\d{5}\b/) || [null])[0];
    return {
      ok: true, http: r.status,
      listing: {
        key, source: 'kleinanzeigen', url: (r.finalUrl || url).split('?')[0], category: 'gommoni',
        name: title, version: '',
        facts: {
          price: /€/.test(priceText) ? num(priceText) : null, priceText: priceText || null, negotiable: /VB/.test(priceText),
          city: locality.replace(/^\d{5}\s*/, '') || null, zip, country: 'DE',
          lat: og('latitude') ? +og('latitude') : null, lon: og('longitude') ? +og('longitude') : null,
          sellerType: /Gewerblicher/.test(h) ? 'Commerciante' : 'Privato', language: 'tedesco',
        },
        sellerText: maskContacts(desc),
        images: images.slice(0, 12),
      },
    };
  },
};

/* ---------- Subito.it ---------- */
const SUB = 'https://www.subito.it';
const subCat = (pathname) => (/^\/nautica\//.test(pathname) ? 'gommoni' : /^\/auto\//.test(pathname) ? 'auto' : /^\/moto-e-scooter\//.test(pathname) ? 'moto' : 'altro');
const subito = {
  id: 'subito', label: 'Subito.it', host: 'www.subito.it', country: 'IT',
  categories: ['auto', 'moto', 'gommoni'],
  match: (u) => u.hostname.endsWith('subito.it') && /-\d{6,}\.htm$/.test(u.pathname),
  keyFromUrl: (u) => { const m = u.pathname.match(/-(\d{6,})\.htm$/); return m ? 'subito:' + m[1] : null; },

  async search(pathAndQuery) {
    const r = await politeGet(SUB + '/' + pathAndQuery);
    if (!r.ok) return { ok: false, http: r.status, reason: r.reason };
    const p = nextData(r.text);
    const list = p?.initialState?.items?.originalList;
    if (!Array.isArray(list)) return { ok: false, http: r.status, reason: 'formato_inatteso' };
    const feat = (it, k) => it.features?.[k]?.values?.[0]?.key ?? null;
    const items = list.filter((it) => it?.urls?.default && it.kind === 'AdItem').map((it) => {
      const u = new URL(it.urls.default);
      return {
        key: this.keyFromUrl(u), url: it.urls.default, name: it.subject || '', version: '',
        price: num(feat(it, '/price')), year: num(feat(it, '/year')), km: num(feat(it, '/mileage_scalar')),
        city: it.geo?.town?.value || it.geo?.city?.value || '', hasImage: (it.images || []).length > 0,
        pro: !!it.advertiser?.company, offerType: it.type?.key === 's' ? 'U' : 'altro', lengthCm: num(feat(it, '/ship_length')),
      };
    }).filter((it) => it.key && it.offerType === 'U');
    return { ok: true, http: r.status, total: p.initialState.items.total ?? items.length, items };
  },

  async detail(url) {
    const r = await politeGet(url);
    if (!r.ok) return { ok: false, http: r.status, reason: r.reason };
    const h = r.text;
    const u = new URL(r.finalUrl || url);
    const key = this.keyFromUrl(u);
    const nodes = [];
    const re = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
    let m;
    while ((m = re.exec(h))) { try { const j = JSON.parse(m[1]); (j['@graph'] || [j]).forEach((n) => nodes.push(n)); } catch {} }
    const prod = nodes.find((n) => n['@type'] === 'Product');
    if (!key || !prod || !prod.name) return { ok: false, http: r.status, reason: 'formato_inatteso' };
    const img = nodes.find((n) => n['@type'] === 'ImageObject' && n.description);
    const text = strip(h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' '));
    const title = strip((h.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
    const offer = [].concat(prod.offers || [])[0];
    let price = offer?.price != null ? num(String(offer.price).split(/[.,]\d{2}$/)[0]) : null;
    if (price == null) { const pm = text.match(new RegExp(prod.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*(\\d{1,3}(?:\\.\\d{3})*)\\s*€')); if (pm) price = num(pm[1]); }
    const len = text.match(/Lunghezza barca\s*(\d{3})\s*m\b/); // il sito scrive i centimetri con l'etichetta "m"
    return {
      ok: true, http: r.status,
      listing: {
        key, source: 'subito', url: u.origin + u.pathname, category: subCat(u.pathname), name: decode(prod.name), version: len ? `lunghezza indicata ${(len[1] / 100).toFixed(2).replace('.', ',')} m` : '',
        facts: { price, priceText: null, city: (title.match(/In vendita a (.+)$/) || [])[1] || null, country: 'IT', lat: null, lon: null, sellerType: null },
        sellerText: maskContacts(strip(img?.description || prod.description || '')),
        images: [].concat(prod.image || []).filter((x) => typeof x === 'string').slice(0, 12),
      },
    };
  },
};

/* ---------- Ruote Classiche – Vendo e compro (Quattroruote) ---------- */
const RC = 'https://ruoteclassiche.quattroruote.it';
const RC_ADS = RC + '/vendo-e-compro';
const titleCase = (s) => String(s || '').toLowerCase().replace(/(^|[\s\-/])([a-zà-ù])/g, (m, a, b) => a + b.toUpperCase());
const slugOf = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const rcPick = (h, cls) => { const m = h.match(new RegExp('class="' + cls + '"[^>]*>([\\s\\S]*?)</(?:div|a)>')); return m ? strip(m[1]) : ''; };
const rcSeller = (name) => (/rivenditor|concession|commerc/i.test(name) ? 'Concessionario' : name ? 'Privato' : null);

// Pagina di elenco per marca/modello (es. "f/alfa-romeo/alfetta/"). Se il modello non esiste il sito
// mostra in silenzio l'elenco completo: lo si riconosce perché le marche non corrispondono.
function rcParseSearch(html, path) {
  const want = (String(path).match(/^f\/([a-z0-9-]+)/) || [])[1] || null;
  const total = num(rcPick(html, 'sab-total-count-value'));
  const blocks = html.split(/<div class="sab-listing-block\s*">/).slice(1);
  const items = blocks.map((b) => {
    const href = (b.match(/href="([^"]*\/vendo-e-compro\/annuncio\/[^"]*-(\d+)\/?)"/) || []);
    if (!href[1]) return null;
    const brand = rcPick(b, 'sab-listing-block-brand'), model = rcPick(b, 'sab-listing-block-model');
    const info = {};
    const re = /sab-listing-block-more-info-box-label">([^<]*)<\/div>\s*<div class="sab-listing-block-more-info-box-value">([^<]*)</g;
    let m; while ((m = re.exec(b))) info[m[1].trim().toLowerCase()] = decode(m[2]).trim();
    const addr = rcPick(b, 'sab-listing-block-reseller-block-address').replace(/^\|\s*/, '');
    return {
      key: 'ruoteclassiche:' + href[2], url: decode(href[1]), brandSlug: slugOf(brand),
      name: [titleCase(brand), model].filter(Boolean).join(' '), version: '',
      price: num(rcPick(b, 'sab-listing-block-price')), year: num(info.anno), km: num(info.km),
      city: addr.replace(/\s*\(.*$/, ''), hasImage: /sab-listing-block-image-img-listing"\s+src="https?:/.test(b),
    };
  }).filter(Boolean);
  if (!blocks.length) return { ok: /sab-total-count/.test(html), reason: 'formato_inatteso', items: [], total: 0 };
  if (want && items.some((it) => it.brandSlug !== want && !want.startsWith(it.brandSlug) && !it.brandSlug.startsWith(want))) return { ok: false, reason: 'nessun_annuncio', items: [], total: 0 };
  return { ok: true, total: total ?? items.length, items };
}

function rcParseDetail(html, url) {
  const id = (String(url).match(/-(\d+)\/?$/) || [])[1];
  const brand = rcPick(html, 'sab-detail-header-info-brand'), model = rcPick(html, 'sab-detail-header-info-model');
  if (!id || !brand) return null;
  const tech = {};
  const re = /sab-detail-technical-information-label">([^<]*)<\/div>\s*<div class="sab-detail-technical-information-value">([^<]*)</g;
  let m; while ((m = re.exec(html))) tech[m[1].trim().toLowerCase()] = decode(m[2]).trim();
  const addr = rcPick(html, 'sab-detail-header-info-reseller-block-address').split('|').map((x) => x.trim()).filter(Boolean);
  const place = addr.find((x) => /\(/.test(x) || /\d{5}/.test(x)) || '';
  const year = addr.map((x) => (/^(19|20)\d{2}$/.test(x) ? +x : null)).find(Boolean) || null;
  const priceText = rcPick(html, 'sab-detail-header-info-price');
  const images = [];
  const ri = /class="sab-detail-header-image"[^>]*>\s*<img[^>]*?\ssrc="([^"]+)"/g;
  while ((m = ri.exec(html))) if (!images.includes(m[1])) images.push(decode(m[1]));
  const cc = num(tech.cilindrata), cv = num(tech.cavalli);
  return {
    key: 'ruoteclassiche:' + id, source: 'ruoteclassiche', url: RC_ADS + '/annuncio/' + String(url).replace(/^.*\/annuncio\//, '').replace(/\/?$/, '/'),
    category: /moto/i.test(tech['tipologia di mercato'] || '') ? 'moto' : 'auto',
    name: [titleCase(brand), model].filter(Boolean).join(' '), version: '',
    facts: {
      price: /€/.test(priceText) ? num(priceText) : null, priceText: priceText || null, negotiable: false,
      year, km: tech.chilometraggio ? num(tech.chilometraggio) : null,
      power: cv ? `${cv} CV` : null, displacement: cc ? `${cc} cm³` : null,
      fuel: tech.alimentazione || null, color: tech['colore est.'] || null,
      city: place.replace(/\s*\(.*$/, '') || null, zip: (place.match(/\b\d{5}\b/) || [null])[0], country: 'IT', lat: null, lon: null,
      sellerType: rcSeller(rcPick(html, 'sab-detail-header-info-reseller-block-name')),
    },
    sellerText: maskContacts(rcPick(html, 'sab-detail-description-container-text')),
    images: images.slice(0, 12),
  };
}

const ruoteclassiche = {
  id: 'ruoteclassiche', label: 'Ruote Classiche – Vendo e compro', host: 'ruoteclassiche.quattroruote.it', country: 'IT',
  categories: ['auto'],
  match: (u) => /(^|\.)ruoteclassiche\.(quattroruote\.)?it$/.test(u.hostname) && /\/vendo-e-compro\/annuncio\//.test(u.pathname),
  keyFromUrl: (u) => { const m = u.pathname.match(/-(\d{6,})\/?$/); return m ? 'ruoteclassiche:' + m[1] : null; },

  async search(path) {
    const r = await politeGet(RC_ADS + '/' + path);
    if (!r.ok) return { ok: false, http: r.status, reason: r.reason };
    return { http: r.status, ...rcParseSearch(r.text, path) };
  },

  async detail(url) {
    const r = await politeGet(url);
    if (!r.ok) return { ok: false, http: r.status, reason: r.reason };
    // Un annuncio rimosso non dà errore: il sito rimanda all'elenco generale.
    if (r.finalUrl && !/\/annuncio\//.test(new URL(r.finalUrl).pathname)) return { ok: false, http: r.status, reason: 'non_trovato' };
    const listing = rcParseDetail(r.text, r.finalUrl || url);
    if (!listing) return { ok: false, http: r.status, reason: 'formato_inatteso' };
    return { ok: true, http: r.status, listing };
  },
};

/* ---------- Automobile.it ---------- */
const AM = 'https://www.automobile.it';
const amCity = (loc) => String(loc || '').replace(/\s*\([^)]*\)\s*$/, '').trim();
const amYear = (reg) => { const m = String(reg || '').match(/\b(19|20)\d{2}\b/); return m ? +m[0] : null; };
const amSeller = (t) => (t === 'DEALER' ? 'Concessionario' : t === 'PRIVATE' ? 'Privato' : null);

// Pagina di elenco per marca-modello (es. "alfa_romeo-alfetta", "fiat-panda-auto_d_epoca").
function amParseSearch(html) {
  const p = nextData(html);
  const r = p && p.apiResults && p.apiResults.result;
  if (!r || !Array.isArray(r.resultList)) return { ok: false, reason: 'formato_inatteso', items: [], total: 0 };
  const items = r.resultList.filter((it) => it && it.id && it.url).map((it) => {
    const d = it.details || {};
    return {
      key: 'automobile:' + it.id, url: AM + it.url, name: it.title || '', version: '',
      price: num(it.formattedPrice), year: amYear(d.registration), km: num(d.formattedKm), city: amCity(it.location),
      hasImage: (it.totalNumberOfPictures || 0) > 0,
      offerType: it.rental || /nuov|km\s?0/i.test(d.channelOrChannelUsed || it.channel || '') ? 'N' : 'U',
    };
  });
  return { ok: true, total: r.page?.totalResults ?? items.length, items };
}

function amParseDetail(html, url) {
  const p = nextData(html);
  const r = p && p.result;
  if (!r || !r.id || !r.title) return null;
  const info = {};
  for (const group of Object.values(p.vehicleInformation || {})) for (const row of [].concat(group || [])) if (row && row.title) info[row.title.toLowerCase()] = [].concat(row.values || [])[0];
  const d = r.details || {};
  const cv = (String(info.potenza || d.formattedPower || '').match(/(\d+)\s*CV/i) || [])[1];
  const cc = num(info.cilindrata || d.formattedEngineCapacity);
  return {
    key: 'automobile:' + r.id, source: 'automobile', url: AM + (r.url || new URL(url).pathname),
    category: /moto|bike|scooter/i.test(d.category || '') ? 'moto' : 'auto',
    name: r.title, version: info.versione && info.versione !== '-' ? info.versione : '',
    facts: {
      price: num(r.formattedPrice), priceText: r.formattedPrice || null, negotiable: false,
      year: amYear(info.immatricolazione || d.registration), km: num(info.chilometri || d.formattedKm),
      power: cv ? `${cv} CV` : null, displacement: cc ? `${cc} cm³` : null,
      fuel: info.carburante || null, gearbox: info.cambio || d.shift || null, color: info['colore esterno'] || null,
      city: amCity(r.location) || null, country: 'IT', lat: null, lon: null, sellerType: amSeller(r.sellerType),
    },
    sellerText: maskContacts(strip(r.description || '')),
    images: (r.vipPictures || []).map((x) => x && x.imgBig).filter(Boolean).slice(0, 12),
  };
}

const automobile = {
  id: 'automobile', label: 'Automobile.it', host: 'www.automobile.it', country: 'IT',
  categories: ['auto'],
  match: (u) => /(^|\.)automobile\.it$/.test(u.hostname) && /^\/[^/]+\/\d{6,}\/?$/.test(u.pathname),
  keyFromUrl: (u) => { const m = u.pathname.match(/\/(\d{6,})\/?$/); return m ? 'automobile:' + m[1] : null; },

  async search(path) {
    const r = await politeGet(AM + '/' + path);
    // Un modello che il sito non conosce risponde 404: non è un errore, semplicemente non ci sono annunci.
    if (!r.ok) return { ok: false, http: r.status, reason: r.reason === 'non_trovato' ? 'nessun_annuncio' : r.reason };
    return { http: r.status, ...amParseSearch(r.text) };
  },

  async detail(url) {
    const r = await politeGet(url);
    if (!r.ok) return { ok: false, http: r.status, reason: r.reason };
    const listing = amParseDetail(r.text, r.finalUrl || url);
    if (!listing) return { ok: false, http: r.status, reason: 'formato_inatteso' };
    return { ok: true, http: r.status, listing };
  },
};

/* ---------- Estrazione generica (link incollato a mano) ---------- */
function genericExtract(html, url) {
  const meta = (attr, name) => {
    const m = html.match(new RegExp(`<meta[^>]+${attr}=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i'))
      || html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*${attr}=["']${name}["']`, 'i'));
    return m ? decode(m[1]).trim() : null;
  };
  const out = { name: null, sellerText: null, images: [], price: null, city: null, found: [] };
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  const nodes = [];
  while ((m = re.exec(html))) {
    try { const j = JSON.parse(m[1]); (Array.isArray(j) ? j : (j['@graph'] || [j])).forEach((n) => nodes.push(n)); } catch {}
  }
  const prod = nodes.find((n) => /Product|Vehicle|Car|Motorcycle|Boat|Offer/i.test([].concat(n['@type'] || []).join(' ')));
  if (prod) {
    out.found.push('dati strutturati (JSON-LD)');
    out.name = prod.name || null;
    out.sellerText = prod.description || null;
    const img = [].concat(prod.image || []).map((i) => (typeof i === 'string' ? i : i?.url || i?.contentUrl)).filter(Boolean);
    out.images.push(...img);
    const offer = [].concat(prod.offers || [])[0] || (/Offer/.test(prod['@type']) ? prod : null);
    if (offer?.price != null) out.price = num(String(offer.price).split(/[.,]\d{2}$/)[0]);
    out.city = offer?.availableAtOrFrom?.address?.addressLocality || prod.address?.addressLocality || null;
  }
  const ogt = meta('property', 'og:title'), ogd = meta('property', 'og:description'), ogi = meta('property', 'og:image');
  if (ogt || ogi) out.found.push('anteprima della pagina (Open Graph)');
  out.name = out.name || ogt || strip((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '') || null;
  out.sellerText = maskContacts(strip(out.sellerText || ogd || meta('name', 'description') || ''));
  if (ogi && !out.images.includes(ogi)) out.images.push(ogi);
  if (out.price == null) { const p = meta('property', 'product:price:amount') || meta('property', 'og:price:amount'); if (p) out.price = num(p.split(/[.,]\d{2}$/)[0]); }
  out.images = out.images.map((i) => { try { return new URL(i, url).href; } catch { return null; } }).filter(Boolean).slice(0, 12);
  return out;
}

const adapters = [as24, ka, subito, ruoteclassiche, automobile];
const byId = Object.fromEntries(adapters.map((a) => [a.id, a]));

function adapterFor(url) {
  let u; try { u = new URL(url); } catch { return null; }
  return adapters.find((a) => a.match(u)) || null;
}

function normalizeUrl(url) {
  const u = new URL(url);
  u.hash = '';
  for (const k of [...u.searchParams.keys()]) if (/^(utm_|fbclid|gclid|ref|source|mkcid|campid)/i.test(k)) u.searchParams.delete(k);
  return u.href.replace(/\/$/, '');
}

function keyFor(url) {
  const a = adapterFor(url);
  const u = new URL(url);
  return (a && a.keyFromUrl(u)) || 'link:' + normalizeUrl(url).replace(/^https?:\/\/(www\.)?/, '');
}

// Lettura di un annuncio qualsiasi: adattatore dedicato se esiste, altrimenti estrazione generica.
async function readListing(url) {
  const a = adapterFor(url);
  if (a) { const r = await a.detail(url); return { ...r, via: a.label }; }
  const r = await politeGet(url);
  if (!r.ok) return { ok: false, http: r.status, reason: r.reason, via: 'lettura generica' };
  const g = genericExtract(r.text, r.finalUrl || url);
  if (!g.name) return { ok: false, http: r.status, reason: 'formato_inatteso', via: 'lettura generica' };
  return {
    ok: true, http: r.status, via: 'lettura generica: ' + (g.found.join(', ') || 'titolo della pagina'),
    listing: {
      key: keyFor(url), source: 'link', url: normalizeUrl(r.finalUrl || url), category: null, name: g.name, version: '',
      facts: { price: g.price, priceText: null, city: g.city, country: null, lat: null, lon: null },
      sellerText: g.sellerText, images: g.images,
    },
  };
}

const REASONS = {
  non_trovato: 'la pagina non esiste più (annuncio rimosso o scaduto)',
  accesso_rifiutato: 'il sito rifiuta la lettura automatica',
  vietato_da_robots: 'il sito chiede di non leggere automaticamente questa pagina (robots.txt)',
  rete: 'sito non raggiungibile da questo server',
  errore_http: 'il sito ha risposto con un errore',
  formato_inatteso: 'pagina raggiunta ma senza i dati di un annuncio riconoscibile',
  nessun_annuncio: 'nessun annuncio per questo modello sulla fonte, in questo momento',
  url_non_valido: 'indirizzo non valido',
  host_non_ammesso: 'indirizzo non ammesso',
};

// Verifica completa di un esemplare: pagina di destinazione + prima fotografia.
async function verify(url) {
  const at = new Date().toISOString();
  const r = await readListing(url);
  const page = { ok: !!r.ok, http: r.http || 0, detail: r.ok ? 'pagina aperta e dati dell\'annuncio letti' : (REASONS[r.reason] || r.reason || 'esito sconosciuto') };
  let image = { ok: false, http: 0, detail: 'non controllata' };
  if (r.ok) {
    const first = r.listing.images[0];
    image = first ? await checkImage(first) : { ok: false, http: 0, detail: 'l\'annuncio non ha fotografie' };
  }
  let status;
  if (r.ok && image.ok) status = 'attiva';
  else if (r.reason === 'non_trovato') status = 'non_disponibile';
  else if (r.ok) status = 'senza_foto';
  else status = 'non_verificabile';
  return { status, check: { at, by: 'server', page, image, via: r.via || null }, listing: r.ok ? r.listing : null };
}

/* ---------- Registro delle fonti mostrato nella pagina "Fonti" ---------- */
// "allestimento" = cosa è risultato dalle prove fatte il 14/11/2026 dal server di sviluppo.
const registry = [
  { id: 'autoscout24', label: 'AutoScout24 Italia', url: AS24, covers: 'Auto e moto', mode: 'ricerca',
    setup: 'Collegata. Ricerca per modello e lettura di ogni annuncio (dati strutturati della pagina).',
    note: 'Lettura consentita dal robots.txt per le pagine usate; le condizioni d\'uso del sito restano da valutare da parte tua. Uso personale, poche richieste, solo quando avvii una ricerca.',
    probe: AS24 + '/lst/volvo/480' },
  { id: 'kleinanzeigen', label: 'Kleinanzeigen (Germania)', url: KA, covers: 'Gommoni e tender', mode: 'ricerca',
    setup: 'Collegata. Fonte stabile per i gommoni, ma gli annunci sono in Germania e in tedesco.',
    note: 'Distanza e ritiro vanno messi nel conto: la scheda lo segnala sempre.',
    probe: KA + '/s-boote-bootszubehoer/honwave/k0c211' },
  { id: 'subito', label: 'Subito.it', url: SUB, covers: 'Auto, moto, gommoni e tender (ricerca); altro con link manuale', mode: 'ricerca',
    setup: 'Collegata con prudenza. Il robots.txt consente le pagine usate, ma il sito a volte rifiuta le letture automatiche (risposta 403): quando succede la ricerca lo dichiara, non insiste e non pubblica nulla che non abbia potuto aprire.',
    note: 'Una richiesta ogni 6 secondi, solo quando avvii una ricerca. Subito non fornisce coordinate: la distanza non è calcolabile per questi annunci.',
    alt: 'Se la lettura viene rifiutata: ricerca salvata con avvisi email su Subito, poi "Aggiungi un link" per gli annunci che ti colpiscono.',
    probe: SUB + '/annunci-italia/vendita/nautica/?q=honwave' },
  { id: 'ruoteclassiche', label: 'Ruote Classiche – Vendo e compro', url: RC_ADS + '/', covers: 'Auto d\'epoca e youngtimer', mode: 'ricerca',
    setup: 'Collegata (15/11/2026). Ricerca per marca e modello e lettura di ogni annuncio. Il robots.txt consente la sezione annunci. Quasi tutti gli annunci sono di rivenditori; la sezione moto è quasi vuota, quindi la uso solo per le auto.',
    note: 'Il sito non fornisce coordinate: la distanza non è calcolabile. Se un modello non ha annunci, il sito mostra l\'elenco generale: lo Scout se ne accorge e prova un\'altra fonte.',
    probe: RC_ADS + '/f/alfa-romeo/alfetta/' },
  { id: 'automobile', label: 'Automobile.it', url: AM, covers: 'Auto (anche d\'epoca)', mode: 'ricerca',
    setup: 'Collegata (15/11/2026). Ricerca per marca e modello (per i modelli ancora in produzione, solo la sezione d\'epoca) e lettura di ogni annuncio dai dati strutturati della pagina. Il robots.txt consente le pagine usate.',
    note: 'Le moto ci sono solo per marca, mescolate a scooter nuovi e ricambi: non le uso. Il sito non fornisce coordinate, quindi la distanza non è calcolabile.',
    probe: AM + '/alfa_romeo-alfetta' },
  { id: 'motoclassiche', label: 'Motoclassiche.it', url: 'https://www.motoclassiche.it', covers: 'Ricambi per moto inglesi', mode: 'manuale',
    setup: 'Non è una fonte di annunci: è un negozio di ricambi per BSA, Triumph e Norton. La "vetrina" mostra moto di clienti come esempi, non in vendita (verificato il 15/11/2026).',
    alt: 'Nessuna: utile semmai per i ricambi di un progetto già avviato.', probe: 'https://www.motoclassiche.it/' },
  { id: 'ebay', label: 'eBay.it', url: 'https://www.ebay.it', covers: 'Auto, moto, nautica', mode: 'manuale',
    setup: 'Pagine di ricerca non leggibili (403, e robots.txt le esclude). Esiste un\'API ufficiale (Browse API) che richiede credenziali da sviluppatore: adattatore non ancora scritto.',
    alt: 'Link incollato a mano; oppure, come sviluppo successivo, registrare un\'app su developer.ebay.com e aggiungere l\'adattatore API.',
    probe: 'https://www.ebay.it/robots.txt' },
  { id: 'motoit', label: 'Moto.it', url: 'https://www.moto.it', covers: 'Moto', mode: 'manuale',
    setup: 'Sito raggiungibile, ma robots.txt esclude le pagine di ricerca: nessuna ricerca automatica. I singoli annunci si possono provare con "Aggiungi un link" (lettura generica, non garantita).',
    alt: 'Ricerche salvate sul sito + link incollato a mano.', probe: 'https://www.moto.it/robots.txt' },
  { id: 'classictrader', label: 'Classic Trader', url: 'https://www.classic-trader.com', covers: 'Auto e moto d\'epoca', mode: 'manuale',
    setup: 'Sito raggiungibile; adattatore di ricerca non ancora scritto. Singoli annunci tramite "Aggiungi un link" (lettura generica).',
    alt: 'Link incollato a mano.', probe: 'https://www.classic-trader.com/robots.txt' },
  { id: 'carandclassic', label: 'Car & Classic', url: 'https://www.carandclassic.com', covers: 'Auto e moto d\'epoca', mode: 'manuale',
    setup: 'Non collegabile: il sito rifiuta la lettura automatica (403).', alt: 'Link incollato a mano, dati compilati da te.', probe: 'https://www.carandclassic.com/robots.txt' },
  { id: 'catawiki', label: 'Catawiki', url: 'https://www.catawiki.com', covers: 'Aste', mode: 'manuale',
    setup: 'Non collegabile: la pagina iniziale risponde ma la ricerca rifiuta la lettura automatica (403).', alt: 'Link incollato a mano, dati compilati da te.', probe: 'https://www.catawiki.com/it/s?q=alfetta' },
  { id: 'leboncoin', label: 'Leboncoin (Francia)', url: 'https://www.leboncoin.fr', covers: 'Tutto', mode: 'manuale',
    setup: 'Non collegabile: il sito rifiuta la lettura automatica (403).', alt: 'Link incollato a mano, dati compilati da te.', probe: 'https://www.leboncoin.fr/' },
  { id: 'facebook', label: 'Facebook Marketplace', url: 'https://www.facebook.com/marketplace', covers: 'Tutto', mode: 'manuale',
    setup: 'Non collegabile: il robots.txt di Facebook esclude sia la ricerca sia le pagine dei singoli annunci (verificato il 15/11/2026), e la consultazione richiede un account. Lo Scout non aggira questi limiti, quindi nemmeno l\'aggiunta di un link riesce a leggere la pagina.',
    alt: 'Link incollato a mano: la scheda resta "non verificata" e i dati (nome, prezzo, luogo) li compili tu.', probe: null },
];

module.exports = { amParseSearch, amParseDetail, rcParseSearch, rcParseDetail, adapters, byId, adapterFor, readListing, verify, keyFor, normalizeUrl, registry, REASONS, maskContacts };

},
"trails": function (module, exports, require) {
// Le "piste" dello scout: direzioni di ricerca derivate dal tuo profilo.
// Il testo "why" è un'ipotesi redazionale a livello di MODELLO (non di esemplare) e nell'interfaccia
// è sempre etichettato così. Nessuna affermazione su affidabilità, ricambi o costi.
'use strict';

const A = 'autoscout24', K = 'kleinanzeigen', S = 'subito', R = 'ruoteclassiche';
// Ruote Classiche: elenco per marca/modello, con i nomi usati dal sito negli indirizzi.
const rc = (brandModel) => ({ source: R, path: `f/${brandModel}/` });
// Automobile.it: "marca-modello"; il suffisso -auto_d_epoca limita alla sezione d'epoca i modelli ancora in produzione.
const am = (makeModel) => ({ source: 'automobile', path: makeModel });
// Un percorso può indicare una fonte diversa da quella della pista: { source, path }.
const subQ = (cat, q, extra) => ({ source: S, path: `annunci-italia/vendita/${cat}/?q=` + encodeURIComponent(q).replace(/%20/g, '+'), ...extra });
const sub = (q) => subQ('nautica', q);
// Su Subito la ricerca per parola è larga: ogni percorso porta il suo filtro sul titolo (must) e, se serve, sull'anno.
const subAuto = (q, must, extra) => subQ('auto', q, { must, ...extra });
const subMoto = (q, must, extra) => subQ('moto-e-scooter', q, { must, ...extra });
const kaBoat = (kw) => `s-boote-bootszubehoer/${kw}/k0c211`;
const BOAT_OK = /gommone|tender|smontabile|schlauchboot|honwave|zodiac|bombard|festrumpf|\brib\b|zar\b|quicksilver|aluboden|luftboden/i;
const BOAT_NO = /\bcerco\b|\bsolo motore\b|\bcarrello\b(?!.*gommon)|suzumar 2[0-5]0|\bsuche\b|persenning|pumpe|nur motor|ersatzteil|trailer ohne|slipräder$|\bsup\b|kajak|kanu|\b[5-9][.,]\d{1,2}\s?m\b|\b(2[.,][0-5]0?\s?m|230|240|250|t-?2[0-5])\b/i;

const trails = [
  /* ---------------- AUTO ---------------- */
  { id: 'alfetta', category: 'auto', kind: 'affine', source: A, label: 'Alfetta, GT e GTV',
    why: 'È il punto fermo del tuo profilo: l\'Alfetta GT/GTV è tra le auto che hai detto di sentire di più. Ti mostro anche qualche berlina, che condivide lo schema transaxle (cambio al retrotreno).',
    paths: ['lst/alfa-romeo/alfetta', 'lst/alfa-romeo/gtv?fregto=1987', subAuto('alfetta', /alfetta/i), rc('alfa-romeo/alfetta'), rc('alfa-romeo/alfetta-gt-gtv'), am('alfa_romeo-alfetta'), am('alfa_romeo-gtv')], yearMax: 1987 },
  { id: 'volvo480', category: 'auto', kind: 'affine', source: A, label: 'Volvo 480',
    why: 'Hai indicato la 480 come forte affinità per la sua particolarità: coda da shooting brake, fari a scomparsa, un carattere fuori dal comune.',
    paths: ['lst/volvo/480', subAuto('volvo 480', /\b480\b/), am('volvo-480')] },
  { id: 'transaxle-alfa', category: 'auto', kind: 'affine', source: A, label: 'Le sorelle transaxle: Giulietta (116) e 75',
    why: 'Stessa famiglia meccanica dell\'Alfetta che ti piace, in carrozzerie meno ovvie. Ipotesi dello scout: ciò che ti attrae dell\'Alfetta potrebbe essere anche lo schema, non solo la linea.',
    paths: ['lst/alfa-romeo/75', 'lst/alfa-romeo/giulietta?fregto=1990', subAuto('alfa romeo 75', /\b75\b/), subAuto('alfa romeo giulietta', /giulietta/i), rc('alfa-romeo/75'), rc('alfa-romeo/giulietta'), am('alfa_romeo-75'), am('alfa_romeo-giulietta-auto_d_epoca')], yearMin: 1977, yearMax: 1993 },
  { id: 'bmw-cabrio', category: 'auto', kind: 'affine', source: A, label: 'BMW Serie 3 cabrio anni \'80–\'90',
    why: 'Hai citato una BMW cabrio anni Novanta con problemi meccanici come esempio di occasione da interpretare. Non è un modello obbligato: la tengo come pista aperta.',
    paths: ['lst/bmw/serie-3?fregfrom=1986&fregto=1999&body=2', subAuto('bmw cabrio', /\bbmw\b.*cabrio|cabrio.*\bbmw\b|\b3[12]\d\s?i?\b.*cabrio/i), am('bmw-serie_3-cabrio')], yearMin: 1986, yearMax: 1999 },
  { id: 'saab', category: 'auto', kind: 'sorpresa', source: A, label: 'Saab 99 e 900 classica',
    why: 'Sorpresa ragionata: se della Volvo 480 ti piace l\'essere fuori dal coro, le Saab classiche sono un altro modo scandinavo di esserlo. Ipotesi da confermare con le tue reazioni.',
    paths: ['lst/saab/900?fregto=1994', 'lst/saab/99', subAuto('saab 900', /saab/i), subAuto('saab 99', /saab/i), rc('saab/900'), am('saab-900')], yearMax: 1994 },
  { id: 'citroen', category: 'auto', kind: 'sorpresa', source: A, label: 'Citroën CX e BX',
    why: 'Sorpresa: progetti ingegneristici molto personali (sospensioni idropneumatiche) pensati per viaggiare comodi, anche su strade secondarie. Attenzione: l\'idraulica è un mondo a sé rispetto ai lavori che fai di solito.',
    paths: ['lst/citroen/cx', 'lst/citroen/bx', subAuto('citroen cx', /\bcx\b/i), subAuto('citroen bx', /\bbx\b/i), rc('citroen/cx'), rc('citroen/bx'), am('citroen-cx'), am('citroen-bx')], yearMax: 1994 },
  { id: 'lancia', category: 'auto', kind: 'sorpresa', source: A, label: 'Lancia Beta, Fulvia e Gamma',
    why: 'Sorpresa italiana: coupé e berline con soluzioni tecniche proprie e abitacoli curati. Ti cito il gusto per motore e abitacolo piacevoli; qui lo metto alla prova lontano dall\'Alfa.',
    paths: ['lst/lancia/beta', 'lst/lancia/fulvia', 'lst/lancia/gamma', subAuto('lancia fulvia', /fulvia/i), subAuto('lancia beta', /\bbeta\b/i), subAuto('lancia gamma', /gamma/i), rc('lancia/beta-berlina'), rc('lancia/betacoupespiderhpe'), rc('lancia/beta-montecarlo'), rc('lancia/gamma'), am('lancia-fulvia'), am('lancia-beta'), am('lancia-gamma')], yearMax: 1990 },
  { id: 'transaxle-porsche', category: 'auto', kind: 'sorpresa', source: A, label: 'Porsche 924 e 944',
    why: 'Sorpresa: stesso principio transaxle dell\'Alfetta, interpretato in Germania. Te le mostro per capire se ti interessa l\'architettura o proprio il mondo Alfa.',
    paths: ['lst/porsche/924', 'lst/porsche/944', subAuto('porsche 944', /\b944\b/), subAuto('porsche 924', /\b924\b/), rc('porsche/924-944'), am('porsche-924'), am('porsche-944')] },
  { id: 'coupe-fuori-coro', category: 'auto', kind: 'sorpresa', source: A, label: 'Coupé anni \'70–\'90 fuori dal coro',
    why: 'Sorpresa: coupé compatte con un\'idea forte dietro (motore centrale, linee a cuneo, portelloni insoliti). Parenti alla lontana della 480 per spirito, non per marca.',
    paths: ['lst/fiat/x-1-9', 'lst/honda/crx', 'lst/renault/fuego', 'lst/volkswagen/scirocco?fregto=1992', 'lst/triumph/tr7', 'lst/alfa-romeo/sprint', 'lst/fiat/coupe', subAuto('fiat x1/9', /x\s?1\s?\/?\s?9/i), subAuto('honda crx', /\bcr-?x\b/i), subAuto('renault fuego', /fuego/i), subAuto('vw scirocco', /scirocco/i), rc('fiat/x1-9'), rc('volkswagen/scirocco'), rc('alfa-romeo/sprint'), rc('fiat/coupe'), am('fiat-x1_9'), am('volkswagen-scirocco-auto_d_epoca')], yearMax: 2000 },
  { id: 'spider', category: 'auto', kind: 'sorpresa', source: A, label: 'Spider con un altro carattere',
    why: 'La MG B ti ha coinvolto meno, ma hai detto che questo non esclude le spider. Provo con caratteri diversi (bialbero italiano, leggerezza giapponese) per capire dove sta il confine.',
    paths: ['lst/alfa-romeo/spider?fregto=1995', 'lst/fiat/124-spider?fregto=1990', 'lst/mazda/mx-5?fregto=1998', 'lst/triumph/spitfire', subAuto('alfa romeo spider duetto', /spider|duetto/i), subAuto('fiat 124 spider', /\b124\b.*spider|spider.*\b124\b/i), subAuto('mazda mx5', /mx-?\s?5/i), rc('alfa-romeo/spider'), rc('fiat/124-spider'), am('alfa_romeo-spider'), am('fiat-124_spider'), am('mazda-mx_5')], yearMax: 1998 },
  { id: 'piccole-semplici', category: 'auto', kind: 'sorpresa', source: A, label: 'Piccole e semplici, da fare tutto in casa',
    why: 'Hai detto che su mezzi semplici e vecchi puoi fare quasi tutto, fino alla distribuzione di una Panda 45. Queste sono palestre dove il lavoro resterebbe quasi tutto nelle tue mani.',
    paths: ['lst/fiat/panda?fregto=1990', 'lst/autobianchi/a-112', 'lst/innocenti/mini', 'lst/alfa-romeo/alfasud', subAuto('fiat panda 45', /panda/i), subAuto('autobianchi a112', /a\s?112/i), subAuto('alfasud', /alfasud/i), rc('fiat/panda'), rc('autobianchi/a112'), rc('innocenti/mini'), rc('alfa-romeo/alfasud'), am('fiat-panda-auto_d_epoca'), am('autobianchi-a112'), am('innocenti-mini'), am('alfa_romeo-alfasud')], yearMax: 1993 },

  /* ---------------- MOTO ---------------- */
  { id: 'africa-twin', category: 'moto', kind: 'affine', source: A, label: 'Honda Africa Twin (XRV 650/750)',
    why: 'L\'Africa Twin è il tuo riferimento di immaginario e d\'uso per la moto da viaggio. Te ne mostro di reali per affinare la categoria, non perché sia già una scelta.',
    paths: ['lst-moto/honda/xrv-750', 'lst-moto/honda/xrv-650', subMoto('africa twin xrv', /\bxrv\b|africa twin (650|750)|\brd0[3-7]\b/i, { yearMax: 2003 })] },
  { id: 'viaggiatrici', category: 'moto', kind: 'affine', source: A, label: 'Viaggiatrici con le borse, anni \'80–2000',
    why: 'Moto pensate per uscite di più giorni con bagaglio, nello stesso spirito dell\'Africa Twin ma con altre taglie e altri motori. Servono a capire quanto conta per te il modello e quanto l\'uso.',
    paths: ['lst-moto/honda/transalp', 'lst-moto/honda/nx-650', 'lst-moto/yamaha/xtz-750', 'lst-moto/yamaha/tdm-850', 'lst-moto/yamaha/xt-600', 'lst-moto/aprilia/pegaso-650', 'lst-moto/suzuki/dr-650', 'lst-moto/honda/xl-600', subMoto('honda transalp', /transalp/i), subMoto('yamaha super tenere', /t[eé]n[eé]r[eé]|\bxtz\b/i), subMoto('yamaha tdm 850', /\btdm\b/i), subMoto('yamaha xt 600', /\bxt\s?600\b/i), subMoto('aprilia pegaso 650', /pegaso/i)], yearMax: 2004 },
  { id: 'boxer', category: 'moto', kind: 'affine', source: A, label: 'BMW boxer due valvole (R 65, R 80, R 100)',
    why: 'Stanno a cavallo dei tuoi due desideri: base classica per una café racer tranquilla, oppure moto da viaggio con le borse. Meccanica a vista, cardano.',
    paths: ['lst-moto/bmw/r-80', 'lst-moto/bmw/r-65', 'lst-moto/bmw/r-100', subMoto('bmw r80', /\br\s?80\b/i), subMoto('bmw r100', /\br\s?100\b/i), subMoto('bmw r65', /\br\s?65\b/i)], yearMax: 1996 },
  { id: 'cafe-basi', category: 'moto', kind: 'affine', source: A, label: 'Basi per una café racer tranquilla',
    why: 'Per i giri fuori porta hai parlato di una café racer tranquilla: qui cerco naked classiche che potrebbero diventarlo o che lo sono già. Categoria ancora tutta da affinare.',
    paths: ['lst-moto/honda/cb-750', 'lst-moto/honda/cb-500?fregto=1985', 'lst-moto/honda/cx-500', 'lst-moto/yamaha/sr-500', 'lst-moto/yamaha/xj-600', 'lst-moto/suzuki/gs-550', 'lst-moto/kawasaki/w-650', subMoto('honda cb 750', /\bcb\s?750\b/i), subMoto('yamaha sr 500', /\bsr\s?500\b/i), subMoto('honda cx 500', /\bcx\s?500\b/i), subMoto('kawasaki w650', /\bw\s?650\b/i)], yearMax: 2006 },
  { id: 'guzzi', category: 'moto', kind: 'sorpresa', source: A, label: 'Moto Guzzi: V 35, V 65, 850 T e V7',
    why: 'Sorpresa italiana: bicilindrico a V trasversale e cardano, un progetto riconoscibile al primo sguardo. Può andare sia verso la café racer sia verso il turismo lento.',
    paths: ['lst-moto/moto-guzzi/v-35', 'lst-moto/moto-guzzi/v-65', 'lst-moto/moto-guzzi/850-t', 'lst-moto/moto-guzzi/v-7', subMoto('moto guzzi v35', /\bv\s?35\b/i), subMoto('moto guzzi v65', /\bv\s?65\b/i), subMoto('moto guzzi 850 t', /\b850\s?t/i), subMoto('moto guzzi v7', /\bv\s?7\b/i)] },
  { id: 'moto-insolite', category: 'moto', kind: 'sorpresa', source: A, label: 'Moto insolite',
    why: 'Sorpresa pura: moto con una soluzione tecnica particolare, fuori dai nomi che hai citato. Se non fa per te, dimmelo: serve a tracciare il confine.',
    paths: ['lst-moto/moto-morini/3-1-2', 'lst-moto/bmw/r-1100-gs', 'lst-moto/yamaha/xj-900', subMoto('moto morini 3 1/2', /morini/i), subMoto('bmw r 1100 gs', /\b1100\s?gs\b/i)] },

  /* ---------------- GOMMONI ---------------- */
  { id: 'honwave', category: 'gommoni', kind: 'affine', source: K, label: 'Honda Honwave e simili',
    why: 'L\'Honwave T32 IE3 è il riferimento che hai apprezzato. Cerco la stessa famiglia, guardando soprattutto le misure compatte ma con spazio a bordo. Cerco su Subito e, in alternativa, su Kleinanzeigen (Germania, dove la logistica va messa nel conto).',
    paths: [sub('honwave'), sub('gommone honwave'), kaBoat('honwave')], must: BOAT_OK, not: BOAT_NO, minPrice: 250 },
  { id: 'compatti-pagliolo', category: 'gommoni', kind: 'affine', source: K, label: 'Smontabili compatti con pagliolo',
    why: 'La tua direzione principale: un compatto smontabile con spazio sufficiente a bordo, per i weekend al mare con il furgone. Sotto i 2,6 m circa per te è troppo piccolo: la misura va sempre verificata sull\'annuncio.',
    paths: [sub('gommone smontabile'), sub('tender pagliolo alluminio'), sub('gommone pagliolo'), kaBoat('schlauchboot-aluboden'), kaBoat('schlauchboot-luftboden')], must: BOAT_OK, not: BOAT_NO, minPrice: 250 },
  { id: 'smontabili-grandi', category: 'gommoni', kind: 'sorpresa', source: K, label: 'Smontabili più grandi e marchi storici',
    why: 'Hai lasciato aperta la porta a smontabili intorno ai 4–4,75 m, sapendo che li useresti meno per la logistica. Ogni tanto te ne mostro uno, insieme a marchi storici del settore.',
    paths: [sub('zodiac smontabile'), sub('gommone smontabile 4 metri'), sub('bombard smontabile'), kaBoat('zodiac-schlauchboot'), kaBoat('bombard-schlauchboot')], must: BOAT_OK, not: BOAT_NO, minPrice: 300 },
];

const byId = Object.fromEntries(trails.map((t) => [t.id, t]));
const publicView = (t) => ({ id: t.id, category: t.category, kind: t.kind, label: t.label, why: t.why, source: t.source });

module.exports = { trails, byId, publicView };

},
"costs": function (module, exports, require) {
// Costo di partenza di un mezzo: prezzo richiesto + passaggio di proprietà + voci dei primi giorni.
// È una STIMA a forbice (minimo–massimo) costruita solo con tariffe pubbliche; ciò che non si può
// calcolare con onestà (assicurazione, bollo sotto i 30 anni, IPT delle moto più giovani) resta
// dichiarato come "non stimato" e non viene sommato.
//
// Tariffe usate (verificate a novembre 2026 su fonti pubbliche; vanno ricontrollate periodicamente):
// - IPT (D.M. 435/1998): 150,81 € fino a 53 kW; oltre 53 kW 3,5119 € per ogni kW dell'intera potenza.
//   Le province possono aumentarla fino al 30% (ACI, "Agevolazioni IPT: informazioni generali").
// - Veicoli ultratrentennali: IPT ridotta a 51,65 € (autoveicoli) e 25,82 € (motoveicoli), su richiesta
//   espressa, uso non professionale (art. 63 L. 342/2000); esenti dalla tassa automobilistica.
//   Dal 2015 gli ultraventennali non hanno più agevolazioni (ACI).
// - Voci fisse PRA/Motorizzazione: emolumenti ACI 27 €, imposta di bollo istanza unificata 32 €,
//   diritti Motorizzazione 10,20 €. Alcune fonti aggiungono 16 € per il documento unico e/o
//   per l'autentica della firma: per questo il massimo è più alto.
// - Revisione, se scaduta: 79,02 € (tariffa ministeriale).
'use strict';

const T = {
  iptBase: 150.81, iptPerKw: 3.5119, iptKwLimit: 53, iptMaxPct: 30,
  iptStoricaAuto: 51.65, iptStoricaMoto: 25.82,
  fissiMin: 27 + 32 + 10.2, fissiMax: 27 + 32 + 10.2 + 16 + 16,
  revisione: 79.02,
};
const round = (n) => Math.round(n);

function kwOf(power) {
  if (power == null) return null;
  if (typeof power === 'number') return power;
  const s = String(power);
  const kw = s.match(/(\d+(?:[.,]\d+)?)\s*kw/i);
  if (kw) return parseFloat(kw[1].replace(',', '.'));
  const cv = s.match(/(\d+(?:[.,]\d+)?)\s*(cv|ps|hp)\b/i);
  if (cv) return Math.round(parseFloat(cv[1].replace(',', '.')) * 0.7355);
  return null;
}

function iptFull(kw) { return kw <= T.iptKwLimit ? T.iptBase : T.iptPerKw * kw; }

// opts: { iptPct: 0–30 o null (sconosciuta → forbice 0–30%), year: anno corrente per i test }
function startCost(card, opts = {}) {
  const f = card.facts || {};
  if (!['auto', 'moto'].includes(card.category) || f.price == null) return null;
  const nowYear = opts.year || new Date().getFullYear();
  const year = f.year || null;
  const storica = year ? year <= nowYear - 30 : null; // null = anno non indicato
  const pct = Number.isFinite(opts.iptPct) ? Math.max(0, Math.min(T.iptMaxPct, opts.iptPct)) : null;
  const pMin = pct == null ? 1 : 1 + pct / 100, pMax = pct == null ? 1 + T.iptMaxPct / 100 : 1 + pct / 100;
  const kw = kwOf(f.power);
  const lines = [], missing = [];
  const add = (label, min, max, note) => lines.push({ label, min: round(min), max: round(max), note });

  add('Prezzo richiesto nell\'annuncio', f.price, f.price, 'Dato della fonte, prima di ogni trattativa');
  add('Passaggio: voci fisse PRA e Motorizzazione', T.fissiMin, T.fissiMax, 'Emolumenti ACI, imposta di bollo, diritti; senza agenzia');

  // IPT
  const storicaIpt = card.category === 'moto' ? T.iptStoricaMoto : T.iptStoricaAuto;
  const pctNote = pct == null ? 'maggiorazione della tua provincia non indicata: forbice 0–30%' : `maggiorazione provinciale ${pct}%`;
  if (card.category === 'auto') {
    if (storica === true) {
      add('Passaggio: IPT', storicaIpt, kw ? iptFull(kw) * pMax : T.iptBase * pMax,
        `Ultratrentennale: IPT ridotta a ${storicaIpt.toString().replace('.', ',')} € se richiesta e se ne ha i requisiti; altrimenti piena (${pctNote})`);
      if (!kw) missing.push('Potenza non indicata: il massimo dell\'IPT piena è calcolato come fino a 53 kW.');
    } else if (kw) {
      add('Passaggio: IPT', storica === null ? storicaIpt : iptFull(kw) * pMin, iptFull(kw) * pMax,
        `${Math.round(kw)} kW, ${pctNote}` + (storica === null ? '; anno non indicato: se ultratrentennale può scendere a 51,65 €' : ''));
    } else {
      add('Passaggio: IPT', storica === null ? storicaIpt : T.iptBase * pMin, T.iptBase * pMax, `Potenza non indicata: calcolata come fino a 53 kW, ${pctNote}`);
      missing.push('Potenza non indicata: se supera 53 kW l\'IPT sale (3,51 € per kW).');
    }
  } else if (storica === true) {
    add('Passaggio: IPT', storicaIpt, storicaIpt, 'Moto ultratrentennale: IPT ridotta, se richiesta e se ne ha i requisiti');
  } else {
    missing.push('IPT della moto non calcolata: per le moto sotto i 30 anni le fonti consultate non concordano. Verificala con il calcolatore ACI.');
  }

  add('Revisione, se scaduta', 0, T.revisione, 'Da controllare sul libretto: conta solo se è scaduta');

  if (storica === true) missing.push('Bollo: un mezzo ultratrentennale ne è esente; se circola, alcune regioni chiedono una piccola tassa di circolazione (da verificare).');
  else missing.push(year ? 'Bollo annuale non calcolato: dipende da regione, kW e classe ambientale.' : 'Bollo non calcolato: anno non indicato (sopra i 30 anni il mezzo ne è esente).');
  missing.push('Assicurazione non stimata: dipende da te e dalla compagnia.');
  missing.push('Commissione dell\'agenzia, se non fai la pratica da te: non inclusa.');

  const min = lines.reduce((s, l) => s + l.min, 0), max = lines.reduce((s, l) => s + l.max, 0);
  return { min, max, lines, missing, storica, kw, complete: !(card.category === 'moto' && storica !== true) };
}

module.exports = { startCost, kwOf, TARIFFE: T };

} };
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
