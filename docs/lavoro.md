# Lavoro (`lavoro/`)

Pagina per il Kindle tenuto sul Vito o in cantiere: https://faldone.rinaldi.build/lavoro/

Tiene cantieri, timbratura, rapportini (ore, persone, km, lavori, materiali), spese, cose da fare e appunti, liste di controllo ripetibili e tre calcoli rapidi (IVA, superficie e volume, pendenza).

## Come è fatta

- Cinque file scritti a mano, **non generati** da `tools/build.mjs`: `index.html`, `style.css`, `core.js` (logica), `qr.js` (codici QR), `app.js` (interfaccia), più `sw.js`.
- Solo ES5 e CSS di base (blocchi e tabelle; niente flex, grid, animazioni, caratteri scaricati): è il minimo comune tra i browser dei Kindle. Il test L1 lo impone.
- Una pagina sola con rotte nell'ancora (`#oggi`, `#cantieri`, …): dopo il primo caricamento non fa più richieste di rete, quindi resta usabile senza Wi‑Fi finché la pagina è aperta. `sw.js` permette anche di riaprirla offline sui browser che hanno i service worker.
- I dati stanno **solo** in `localStorage` del dispositivo (chiave `lavoro.v1`). Il sito è pubblico, i dati no: non vengono mai inviati.

## Portare fuori i dati

Il Kindle non scarica file e non ha fotocamera. «Altro → Passa i dati al telefono» mostra uno o più codici QR: ognuno è l'indirizzo della pagina con un pezzo dei dati nell'ancora (che il browser non manda al server). Il telefono li inquadra, la pagina ricompone i pezzi e unisce i record ai propri; da telefono o computer si scaricano poi CSV e copia JSON.

L'unione è per identificativo e vince la modifica più recente; le eliminazioni lasciano una lapide (`x: 1`) per non ricomparire. Il passaggio va in un solo verso: dal Kindle agli altri dispositivi.

## Limiti noti

- Provata in Chromium con finestra 600×800, **non su un Kindle vero**: alla prima prova sul dispositivo vanno controllati tastiera, salvataggio dopo lo spegnimento e ora mostrata (c'è una correzione dell'ora nelle impostazioni).
- Se si cancellano i dati del browser del Kindle, l'archivio locale si perde: passare i dati al telefono con regolarità.
- Con molti dati «Tutto l'archivio» richiede molti codici (circa uno ogni 300 byte): conviene passare la settimana.

## Verifiche

```sh
node --test tools/test/lavoro.test.mjs
```
