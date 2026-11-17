// sw.js — copia offline. Strategia: prima la rete (così le modifiche ai sorgenti si vedono subito), se manca si usa la copia salvata.
// Se aggiungi un file all'app, aggiungilo anche a FILES e cambia VERSIONE.
const VERSIONE = 'vito-v8';
const FILES = ['./', 'index.html', 'css/app.css', 'manifest.webmanifest', 'icona.svg', 'icona-180.png', 'icona-512.png',
  'js/app.js', 'js/store.js', 'js/seed.js', 'js/calc.js', 'js/ui.js',
  'js/views/quadro.js', 'js/views/mappa.js', 'js/views/strati.js', 'js/views/sim.js', 'js/views/lavori.js', 'js/views/budget.js', 'js/views/diario.js', 'js/views/fonti.js', 'js/views/dati.js', 'js/views/progetto.js', 'js/views/mappa3d.js', 'js/views/biblioteca.js', 'js/pdftesto.js',
  'vendor/pdfjs/pdf.min.mjs', 'vendor/pdfjs/pdf.worker.min.mjs'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSIONE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('vito-') && k !== VERSIONE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request.url, { cache: 'no-cache' }).then((r) => { if (r.ok) { const copia = r.clone(); caches.open(VERSIONE).then((c) => c.put(e.request, copia)); } return r; })
    .catch(() => caches.open(VERSIONE).then((c) => c.match(e.request, { ignoreSearch: true }).then((r) => r || c.match('index.html')))));
});
