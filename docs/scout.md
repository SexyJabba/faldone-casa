# Lo Scout nel Faldone (`scout/`)

Lo Scout è il quaderno privato di scoperte di auto, moto e gommoni. Il suo codice sta nel repository `restauri-finder` e gira con `node server.js` sul computer. Nel Faldone c'è la sua **vetrina**: https://faldone.rinaldi.build/scout/

## Che cosa fa la vetrina

- Stessa interfaccia e stessa logica dello Scout (flusso con varietà e sorprese, piste, Economici con il costo di partenza, idee conservate, profilo, approfondimenti). I file `lib/scout.js`, `sources.js`, `trails.js` e `costs.js` sono copiati così come sono dentro `scout/motore.js` e girano nel browser.
- L'archivio (`data/scout.json`) è pubblicato **solo cifrato** (`scout/archivio.enc.json`): PBKDF2-SHA256 a 600.000 iterazioni e AES-256-GCM, come l'area riservata. Si apre con la **stessa password dell'area riservata**. Contiene il profilo dei gusti, le reazioni e il punto di partenza: in chiaro non va mai nel repository.
- Reazioni, motivi, note, gusti e approfondimenti scritti nella vetrina restano **su quel dispositivo**, cifrati nel `localStorage` con la stessa chiave. Non tornano da soli nello Scout del computer: «Fonti → Scarica una copia dell'archivio» li scarica.
- **Non ci sono** ricerca di nuovi annunci, controllo dei link, estrazione da un link e note AI. Servono il server: un browser non può leggere AutoScout24, Subito e gli altri portali, e la chiave AI non può stare in una pagina pubblica. Quei pulsanti rispondono che nella vetrina non sono disponibili e non toccano le schede.
- Quando sul sito arriva un archivio più nuovo, la vetrina lo mostra e offre di scaricare le modifiche fatte prima sul dispositivo.

## Aggiornare la vetrina

Dalla radice del Faldone, con la cartella dello Scout sul computer:

```sh
FALDONE_PASSWORD=… node tools/scout-vetrina.mjs /percorso/dello/scout --archivio   # solo l'archivio (dopo nuove ricerche)
FALDONE_PASSWORD=… node tools/scout-vetrina.mjs /percorso/dello/scout              # anche interfaccia e logica (dopo modifiche al codice)
```

Poi commit e pubblicazione come al solito. Lo strumento si ferma se `public/app.js` dello Scout è cambiato nei punti che la vetrina sostituisce: chiamata al server, esportazione, service worker. `tools/test/scout.test.mjs` controlla che l'archivio sia solo cifrato.

## Più avanti: lo Scout intero sul server di casa

Decisione del proprietario (17 novembre 2026): vetrina subito, Scout completo sul server di casa quando l'infrastruttura sarà attiva (attuazione dal 23 dicembre 2026). Il nodo che lo ospiterà non è ancora scelto. Servirà:

- `node server.js` sempre acceso, Node 20 o più recente, con `SCOUT_PASSWORD` impostata. Senza password il server risponde solo dal computer locale.
- HTTPS davanti, per esempio con Caddy, e un nome dedicato. Indirizzo e porta vanno nell'area riservata, non qui.
- `ANTHROPIC_API_KEY` sul server per le note AI, se si vogliono. La chiave non va mai nel repository.
- `SCOUT_DATA_DIR` su un disco con copia di sicurezza.

A quel punto la vetrina può restare come copia di consultazione offline, oppure la voce «Lo Scout» del Faldone punterà al server.
