# Lavoro (`lavoro/`)

Pagina per il Kindle tenuto sul Vito o in cantiere: https://faldone.rinaldi.build/lavoro/

Tiene cantieri, timbratura, rapportini (ore, persone, km, lavori, materiali), spese, cose da fare e appunti, liste di controllo ripetibili e tre calcoli rapidi (IVA, superficie e volume, pendenza).

## Come è fatta

- File scritti a mano, **non generati** da `tools/build.mjs`: `index.html`, `style.css`, `core.js` (logica), `qr.js` (codici QR), `cifra.js` (cifratura), `app.js` (interfaccia), `sw.js`; `dati.js` è prodotto da `tools/lavoro-cifra.mjs`.
- Solo ES5 e CSS di base (blocchi e tabelle; niente flex, grid, animazioni, caratteri scaricati): è il minimo comune tra i browser dei Kindle. Il test L1 lo impone.
- Una pagina sola con rotte nell'ancora (`#oggi`, `#cantieri`, …): dopo il primo caricamento non fa più richieste di rete, quindi resta usabile senza Wi‑Fi finché la pagina è aperta. `sw.js` permette anche di riaprirla offline sui browser che hanno i service worker.
- Ciò che si scrive sul dispositivo resta **solo** nel suo `localStorage`, cifrato: non viene mai inviato.

## Password e dati precaricati

- `lavoro/dati.js` contiene i cantieri del registro dell'ufficio **cifrati con la password**: nel repository, che è pubblico, c'è solo testo illeggibile. All'apertura la pagina chiede la password, decifra e unisce i cantieri all'archivio del dispositivo.
- Anche l'archivio del dispositivo (`localStorage`, chiave `lavoro.v2`) è cifrato con la stessa password; la chiave resta in memoria finché la pagina è aperta. «Altro → Blocca» la richiude.
- La cifratura è in `lavoro/cifra.js` (ES5, senza WebCrypto per i Kindle): chiave con PBKDF2-HMAC-SHA256 a 60.000 iterazioni, flusso HMAC-SHA256 a contatore, autenticazione HMAC. I test L11–L13 la confrontano con `node:crypto`.
- **Accesso rapido.** Sul Kindle la derivazione piena dura minuti. Dopo il primo accesso il dispositivo conserva (`lavoro.k`) la chiave dei dati cifrata con una chiave derivata dalla stessa password con 600 iterazioni: gli accessi successivi durano secondi. Il file pubblico resta a 60.000 iterazioni; il compromesso riguarda solo chi ha in mano la memoria di quel dispositivo.
- **La protezione vale quanto la password.** Chi scarica `dati.js` può provare password all'infinito sul proprio computer: serve una frase lunga. Le versioni precedenti di `dati.js` restano nella cronologia Git, cifrate con la password di allora.
- La password e i dati in chiaro non stanno mai nel repository.

```sh
LAVORO_PASSWORD=… node tools/lavoro-cifra.mjs decifra > /percorso/fuori/dal/repo/dati.json   # leggere
LAVORO_PASSWORD=… node tools/lavoro-cifra.mjs cifra /percorso/fuori/dal/repo/dati.json       # aggiornare i dati
LAVORO_PASSWORD=… LAVORO_PASSWORD_NUOVA=… node tools/lavoro-cifra.mjs cambia                 # cambiare password
```

Dopo un cambio di password ogni dispositivo chiede la nuova e, una sola volta, la precedente per recuperare ciò che aveva salvato.

I cantieri vengono da «REGISTRO UFFICIO - CLIENTI CANTIERI FASI DOCUMENTI» e dalle schede «C-00NN-F01 - Gestione» su Google Drive: nome, cliente, località e stato. Lo stato «Da verificare» è quello del registro; nessuna ora, spesa o importo è stato importato perché i fogli non ne contengono.

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
