// Vetrina dello Scout: copia offline di interfaccia e archivio cifrato. Rete prima, copia se manca.
// Generato da tools/scout-vetrina.mjs: cancella solo le proprie copie (sulla stessa origine ci sono Faldone, Lavoro e Officina).
const CACHE = 'scout-4c4158d1';
const FILES = ['./', 'index.html', 'style.css', 'app.js', 'motore.js', 'archivio.enc.json', 'icon.svg', 'manifest.webmanifest', '../app/lib/vault.js'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('scout-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (!u.pathname.includes('/scout/') && !u.pathname.endsWith('/app/lib/vault.js')) return;
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then((r) => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); } return r; })
    .catch(() => caches.open(CACHE).then((c) => c.match(e.request, { ignoreSearch: true }).then((m) => m || c.match('index.html')))));
});
