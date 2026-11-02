// Service worker del Faldone: solo contenuti pubblici, nessuna risposta autenticata.
// Generato da tools/build.mjs: non modificare sw.js nella radice.
const VERSION = 'ca79727fe5d2';
const CORE = `faldone-core-${VERSION}`;
const DOCS = `faldone-docs-${VERSION}`;
const PRECACHE = ["./","index.html","app/lib/energy.js","app/lib/model.js","app/lib/qr.js","app/lib/roadmap.js","app/lib/search.js","app/lib/sim.js","app/lib/store.js","app/main.js","app/static.css","app/style.css","app/ui.js","app/views/contribute.js","app/views/costs.js","app/views/docs.js","app/views/emergency.js","app/views/entity.js","app/views/explore.js","app/views/home.js","app/views/index.js","app/views/map.js","app/views/paths.js","app/views/roadmap.js","app/views/search.js","app/views/settings.js","app/views/sim.js","data/core.json","data/search.json","kit/emergenza.html","schede/index.html","assets/favicon.svg"];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CORE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('faldone-') && !k.endsWith(VERSION)).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', async (e) => {
  if (e.data?.type === 'cache-all') {
    const m = await (await fetch('data/offline-manifest.json', { cache: 'no-store' })).json();
    const c = await caches.open(DOCS);
    let done = 0;
    for (const u of [...m.groups, ...m.pages]) { try { await c.add(u); } catch { /* continua */ } done++; if (done % 50 === 0) e.source?.postMessage({ type: 'cache-progress', done, total: m.groups.length + m.pages.length }); }
    e.source?.postMessage({ type: 'cache-done', done, build: m.build, revision: m.revision });
  }
  if (e.data?.type === 'status') {
    const c = await caches.open(DOCS); const n = (await c.keys()).length;
    e.source?.postMessage({ type: 'status', version: VERSION, docs: n });
  }
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (e.request.headers.get('authorization')) return; // mai in cache risposte autenticate
  // dati: rete prima, cache se offline; il resto: cache prima
  const networkFirst = url.pathname.endsWith('/data/core.json') || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/');
  e.respondWith((async () => {
    const cached = await caches.match(e.request, { ignoreSearch: true });
    if (cached && !networkFirst) return cached;
    try {
      const res = await fetch(e.request);
      if (res.ok && res.type === 'basic' && /\/(data|schede|e|kit|app|assets)\//.test(url.pathname)) (await caches.open(DOCS)).put(e.request, res.clone());
      return res;
    } catch (err) {
      if (cached) return cached;
      throw err;
    }
  })());
});
