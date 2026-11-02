# Build, verifica, rilascio e ritorno indietro

## Requisiti

- Node.js ≥ 20 (nessuna dipendenza da installare per build e test unitari).
- Python 3 (solo per servire il sito in locale).
- Per le verifiche nel browser: Playwright con Chromium; per l'accessibilità, il file `axe.min.js` di axe-core 4.10 (non è una dipendenza del sito).

## Comandi

```sh
node tools/build.mjs                         # valida il modello e genera il sito
node --test tools/test/*.test.mjs            # 49 test: simulazione, corpus, ricerca, energia, persistenza, privacy, QR, adapter
python3 -m http.server 8811 --bind 127.0.0.1 # anteprima su http://127.0.0.1:8811/
node tools/e2e/smoke.cjs                     # tutte le rotte, compresi gli URL storici
AXE=/percorso/axe.min.js node tools/e2e/a11y.cjs   # axe WCAG 2.2 A/AA, tastiera, indietro/avanti, 360 px
node tools/e2e/perf.cjs http://127.0.0.1:8811/     # misura di laboratorio
node tools/e2e/screens.cjs docs/screenshot   # screenshot
```

Per la consultazione offline con service worker serve `https` o `localhost` (non `127.0.0.1`).

## Pubblicazione (non eseguita)

GitHub Pages serve il ramo pubblicato dalla radice. I file generati sono versionati apposta.

1. Eseguire build e test sul ramo di lavoro; controllare l'anteprima.
2. Aprire una pull request verso il ramo pubblicato; revisione.
3. Unire: Pages pubblica in pochi minuti. `CNAME` resta invariato.
4. Dopo la pubblicazione: aprire `/#INF-03.03`, `/#node/M2`, `/kit/emergenza.html`, `/schede/index.html`.

Note di cache: i moduli sono serviti con la cache di Pages (circa 10 minuti); il service worker usa la versione di build e cancella le cache precedenti all'attivazione.

## Ritorno indietro

- Sito: `git revert` del merge (o ripubblicare il commit `f43ecf0`, ultima 4.4). Le rotte a hash sono le stesse, quindi i link continuano a funzionare in entrambe le direzioni.
- Dati locali dei visitatori: la nuova versione **non cancella** le chiavi `faldone44-*`, `faldone44.*`, `tour44`; tornando alla 4.4 i preferiti originali sono ancora lì. Le nuove informazioni sono sotto la sola chiave `faldone5`.
- Service worker: un rollback a un sito senza `sw.js` lascia un worker registrato che continua a servire la cache. Per evitarlo, nel rollback pubblicare un `sw.js` minimo che si de-registra:
  ```js
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', async () => { for (const k of await caches.keys()) await caches.delete(k); await self.registration.unregister(); (await self.clients.matchAll()).forEach((c) => c.navigate(c.url)); });
  ```

## Budget di prestazione

Verificato in laboratorio (Chromium headless, 390×844, 10 Mbit/s, RTT 40 ms, CPU 4× più lenta, cache vuota, mediana di 3; server senza compressione, gzip stimato):

| | 4.4 (`f43ecf0`) | Nuova versione | Budget |
|---|---|---|---|
| Byte per aprire la home | 2.692.615 | 399.922 | — |
| Gzip stimato | 491.665 | 90.107 | ≤ 150 KB |
| LCP | 2.728 ms | 800 ms | ≤ 2.500 ms |
| CLS | 0 | 0,053 | ≤ 0,1 |

Sono misure di laboratorio, non metriche sul campo. Dopo il primo caricamento il service worker scarica in background l'indice di ricerca (412 KB, ~124 KB compressi) per l'uso offline.
