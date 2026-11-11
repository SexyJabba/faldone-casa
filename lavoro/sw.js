// Service worker di «Lavoro»: tiene in cache i cinque file della pagina, così si riapre anche senza rete
// sui browser che lo permettono. Rete prima (gli aggiornamenti arrivano subito), cache se la rete manca.
// I dati dell'utente non passano mai da qui: stanno in localStorage.
var CACHE = 'lavoro-v1';
var FILES = ['./', 'style.css', 'core.js', 'qr.js', 'app.js'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('lavoro-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || e.request.url.indexOf(self.registration.scope) !== 0) return;
  e.respondWith(fetch(e.request).then(function (res) {
    if (res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); }
    return res;
  }).catch(function () {
    return caches.match(e.request, { ignoreSearch: true }).then(function (hit) { return hit || caches.match('./'); });
  }));
});
