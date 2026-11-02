// Il Faldone · applicazione. Un solo router, un solo listener per tipo di evento.
import { buildIndex } from './lib/model.js';
import * as store from './lib/store.js';
import { esc, icon, href } from './ui.js';
import { routes, resolveRoute } from './views/index.js';

const $ = (s, r = document) => r.querySelector(s);
const app = {
  core: null, idx: null, data: null, storeStatus: null, depth: 'capire',
  handlers: new Map(), cache: new Map(), route: '', query: {}, prev: null,
};
window.__faldone = app; // per i test end-to-end

// ---------- dati ----------
async function getJSON(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
}
app.load = (key, url) => {
  if (!app.cache.has(key)) app.cache.set(key, getJSON(url).catch((e) => { app.cache.delete(key); throw e; }));
  return app.cache.get(key);
};
app.group = (id) => app.load(`g:${id}`, `data/schede/${id}.json`);
app.search = () => app.load('search', 'data/search.json');
app.inventory = () => app.load('inventory', 'data/inventory.json');
app.tables = () => app.load('tables', 'data/tables.json');

// ---------- persistenza locale ----------
let storage;
try { storage = window.localStorage; storage.getItem('x'); } catch { storage = store.memoryStorage(); }
app.persist = () => {
  const r = store.save(storage, app.data);
  if (!r.ok) app.toast(`Non salvato: ${r.error}. Esporta i dati per conservarli.`);
  else app.data = r.data;
  return r.ok;
};
app.isFav = (id) => app.data.favorites.includes(id);
app.toggleFav = (id) => {
  const f = app.data.favorites;
  app.data.favorites = f.includes(id) ? f.filter((x) => x !== id) : [...f, id];
  app.persist();
  return app.isFav(id);
};

// ---------- interfaccia comune ----------
app.toast = (msg) => {
  const t = document.createElement('div');
  t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
  document.body.append(t); setTimeout(() => t.remove(), 4200);
};
app.on = (action, fn) => app.handlers.set(action, fn);
app.go = (route, { replace = false } = {}) => {
  const h = href(route);
  if (replace) { history.replaceState(history.state, '', h); render(); } else if (location.hash === h) render(); else location.hash = h;
};
app.setQuery = (q) => {
  const base = app.route;
  const qs = Object.entries(q).filter(([, v]) => v !== '' && v !== null && v !== undefined && !(Array.isArray(v) && !v.length)).map(([k, v]) => `${k}=${encodeURIComponent(Array.isArray(v) ? v.join(',') : v)}`).join('&');
  history.replaceState(history.state, '', '#' + encodeURI(base) + (qs ? '?' + qs : ''));
  app.query = Object.fromEntries(new URLSearchParams(qs));
};

function tools() {
  const depthBtns = [['capire', 'Capire'], ['approfondire', 'Approfondire'], ['intervenire', 'Intervenire']];
  $('#tools').innerHTML = `<button class="iconbtn searchbtn" type="button" data-action="palette" aria-label="Cerca (scorciatoia / o Ctrl+K)">${icon('search')}<span class="lbl">Cerca</span><kbd class="lbl">/</kbd></button>
<a class="iconbtn" href="#preferiti" aria-label="Preferiti e dati locali">${icon('star')}</a>
<button class="iconbtn" type="button" data-action="theme" aria-label="Tema: ${esc(app.data.prefs.theme)}">${icon('theme')}</button>`;
}
function depthbar() {
  let bar = document.getElementById('depthbar');
  if (!bar) { bar = document.createElement('div'); bar.id = 'depthbar'; bar.className = 'depthbar'; document.querySelector('.top').after(bar); }
  bar.innerHTML = `<span id="depthlbl2">Livello di dettaglio</span><div class="seg" role="group" aria-labelledby="depthlbl2">${[['capire', 'Capire'], ['approfondire', 'Approfondire'], ['intervenire', 'Intervenire']].map(([k, l]) => `<button type="button" data-action="depth" data-v="${k}" aria-pressed="${app.depth === k}">${l}</button>`).join('')}</div>`;
}
function applyTheme() {
  const t = app.data.prefs.theme;
  if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.dataset.theme = t;
}
function bottomnav() {
  const items = [['', 'Panoramica', 'home'], ['esplora', 'Esplora', 'explore'], ['emergenza', 'Usa e risolvi', 'fix'], ['realizza', 'Realizza', 'build'], ['documenti', 'Documenti', 'docs']];
  const nav = document.createElement('nav');
  nav.className = 'bottomnav'; nav.setAttribute('aria-label', 'Navigazione principale (mobile)');
  nav.innerHTML = items.map(([r, l, i]) => `<a href="#${r}" data-nav="${r}">${icon(i)}<span>${l}</span></a>`).join('');
  $('#app').append(nav);
}
function markNav(area) {
  document.querySelectorAll('[data-nav]').forEach((a) => { if (a.dataset.nav === area) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
}

// ---------- router ----------
const scrollKey = (h) => `scroll:${h}`;
let renderSeq = 0;
async function render() {
  const seq = ++renderSeq;
  const raw = decodeURI(location.hash.slice(1));
  if (raw === 'main') { $('#main').focus(); return; }
  const [path, qs = ''] = raw.split('?');
  // alias storici (#node/M2, #sim, #world-vito, …)
  const alias = app.idx.aliases[path];
  if (alias !== undefined && path !== alias) { history.replaceState(null, '', '#' + encodeURI(alias) + (qs ? '?' + qs : '')); return render(); }
  app.route = path; app.query = Object.fromEntries(new URLSearchParams(qs));
  const { view, params, area } = resolveRoute(app, path);
  const db = document.getElementById('depthbar'); if (db) db.hidden = !/^(e\/|procedura\/|percorsi\/)/.test(path);
  app.cleanup?.(); app.cleanup = null;
  app.handlers.clear();
  app.onKey = null;
  document.body.classList.remove('presenting');
  markNav(area);
  app.renderCount = (app.renderCount || 0) + 1;
  const main = $('#main');
  main.setAttribute('aria-busy', 'true');
  let out;
  try { out = await view(app, params); } catch (e) {
    console.error(e);
    out = { title: 'Errore', html: `<div class="errbox" role="alert"><strong>Non è stato possibile caricare questa pagina.</strong><p>${esc(e.message)}</p><p>Se sei offline, il <a href="kit/emergenza.html">kit di emergenza</a> e le pagine già visitate restano disponibili. Un errore di rete non significa che il dato manchi o che l'impianto sia guasto.</p></div>` };
  }
  if (seq !== renderSeq) return; // una navigazione più recente ha già preso il posto
  main.innerHTML = out.html;
  main.removeAttribute('aria-busy');
  document.title = `${out.title} · Il Faldone ${app.core.meta.revision}`;
  out.mount?.(main);
  // posizione: ripristino tornando indietro, altrimenti inizio pagina e focus sul titolo
  const saved = sessionStorage.getItem(scrollKey(location.hash));
  if (app.navType === 'pop' && saved !== null) window.scrollTo(0, Number(saved));
  const h1 = main.querySelector('h1');
  if (h1 && !h1.hasAttribute('tabindex')) h1.setAttribute('tabindex', '-1');
  if (app.navType === 'pop' && saved !== null) { /* posizione già ripristinata */ } else if (!out.keepScroll) { window.scrollTo(0, 0); if (app.prev !== null) (h1 || main).focus({ preventScroll: true }); }
  app.prev = location.hash; app.navType = 'push';
}
window.addEventListener('scroll', () => { sessionStorage.setItem(scrollKey(location.hash), String(window.scrollY)); }, { passive: true });
window.addEventListener('popstate', () => { app.navType = 'pop'; });
window.addEventListener('hashchange', render);

// ---------- eventi delegati (un solo listener per tipo) ----------
document.addEventListener('click', (e) => {
  glossaryClick(e);
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const a = el.dataset.action;
  if (a === 'palette') { e.preventDefault(); return openPalette(); }
  if (a === 'theme') {
    const order = ['auto', 'light', 'dark'];
    app.data.prefs.theme = order[(order.indexOf(app.data.prefs.theme) + 1) % 3];
    app.persist(); applyTheme(); tools(); app.toast(`Tema: ${({ auto: 'come il sistema', light: 'chiaro', dark: 'scuro' })[app.data.prefs.theme]}`); return;
  }
  if (a === 'depth') { setDepth(el.dataset.v); return; }
  if (a === 'print') { window.print(); return; }
  if (a === 'fav') { const on = app.toggleFav(el.dataset.id); el.setAttribute('aria-pressed', on); el.querySelector('.lbl') && (el.querySelector('.lbl').textContent = on ? 'Nei preferiti' : 'Aggiungi ai preferiti'); app.toast(on ? 'Aggiunto ai preferiti (su questo dispositivo)' : 'Rimosso dai preferiti'); return; }
  if (a === 'copy') { navigator.clipboard?.writeText(el.dataset.text).then(() => app.toast('Copiato'), () => app.toast('Copia non consentita dal browser')); return; }
  const fn = app.handlers.get(a);
  if (fn) { e.preventDefault(); fn(el, e); }
});
for (const type of ['input', 'change', 'submit', 'keydown']) {
  document.addEventListener(type, (e) => {
    const el = e.target.closest?.(`[data-${type}]`);
    if (!el) return;
    if (type === 'submit') e.preventDefault();
    const fn = app.handlers.get(el.dataset[type]);
    if (fn) fn(el, e);
  });
}
function setDepth(v) {
  app.depth = v; app.data.prefs.depth = v; app.persist();
  document.querySelectorAll('[data-action=depth]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === v));
  const y = window.scrollY;
  render().then(() => window.scrollTo(0, y));
  app.toast(`Profondità: ${({ capire: 'capire', approfondire: 'approfondire', intervenire: 'intervenire' })[v]}. Stessi fatti, presentazione diversa.`);
}
app.setDepth = setDepth;

// scorciatoie: «/» e Ctrl/Cmd+K, mai mentre si scrive in un campo
document.addEventListener('keydown', (e) => {
  const t = e.target;
  const typing = t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);
  if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); openPalette(); return; }
  if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey && !document.body.classList.contains('presenting')) { e.preventDefault(); openPalette(); return; }
  app.onKey?.(e);
});

async function openPalette() {
  const { palette } = await import('./views/search.js');
  palette(app);
}

// ---------- glossario nel testo: apribile con tastiera e touch ----------
function glossaryClick(e) {
  const g = e.target.closest('.gl');
  document.querySelectorAll('.pop').forEach((p) => { if (!g || p.dataset.for !== g.dataset.term) p.remove(); });
  if (!g) return;
  e.preventDefault();
  if (document.querySelector(`.pop[data-for="${CSS.escape(g.dataset.term)}"]`)) return;
  const entry = app.core.glossary.find((x) => x.term === g.dataset.term);
  if (!entry) return;
  const p = document.createElement('div');
  p.className = 'pop'; p.dataset.for = entry.term; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', entry.term);
  p.innerHTML = `<strong>${esc(entry.term)}</strong><p>${esc(entry.text)}</p><a href="#glossario/${encodeURIComponent(entry.term)}">Nel glossario</a>`;
  document.body.append(p);
  const r = g.getBoundingClientRect();
  p.style.left = `${Math.max(8, Math.min(window.scrollX + r.left, window.scrollX + document.documentElement.clientWidth - p.offsetWidth - 8))}px`;
  p.style.top = `${window.scrollY + r.bottom + 6}px`;
  g.setAttribute('aria-expanded', 'true');
}
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const pops = document.querySelectorAll('.pop');
  if (pops.length) { pops.forEach((p) => p.remove()); return; }
  const m = document.querySelector('details.menu[open]');
  if (m) { m.open = false; m.querySelector('summary').focus(); }
});
document.addEventListener('click', (e) => { for (const m of document.querySelectorAll('details.menu[open]')) if (!m.contains(e.target)) m.open = false; });

// ---------- avvio ----------
(async function boot() {
  try {
    app.core = await getJSON('data/core.json');
  } catch (e) {
    $('#main').insertAdjacentHTML('afterbegin', `<div class="errbox" role="alert">Non è stato possibile caricare i dati del Faldone (${esc(e.message)}). Usa la <a href="schede/index.html">versione senza JavaScript</a> o il <a href="kit/emergenza.html">kit di emergenza</a>.</div>`);
    return;
  }
  app.idx = buildIndex(app.core);
  const loaded = store.load(storage);
  app.data = loaded.data; app.storeStatus = loaded.status;
  if (loaded.status === 'migrato') { app.persist(); setTimeout(() => app.toast('Preferiti e impostazioni della 4.4 recuperati su questo dispositivo.'), 600); }
  if (loaded.status === 'corrotto') setTimeout(() => app.toast('I dati locali non erano leggibili: ripartiti da zero. Il contenuto originale non è stato cancellato.'), 600);
  app.depth = app.data.prefs.depth || 'capire';
  applyTheme(); tools(); depthbar(); bottomnav();
  void routes;
  await render();
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
