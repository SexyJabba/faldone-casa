# Stato del progetto — aggiornato il 17 novembre 2026

## Pubblicazione nel Faldone (17 novembre 2026)
- L'app vive nel repository del Faldone, cartella `officina/`, ed è online su https://faldone.rinaldi.build/officina/ (HTTPS: offline e «Aggiungi a Home» funzionano anche sul telefono). Il Mac non serve più acceso.
- Il repository è **pubblico**: il VIN è stato tolto da `js/seed.js` e da `docs/FONTI.md` (resta sulla carta e nei dati del dispositivo). Non scrivere in questa cartella dati personali (VIN, targa, indirizzi, contatti): una prova del Faldone (`tools/test/officina.test.mjs`) lo controlla.
- I dati restano nel browser e sono legati all'indirizzo: quelli inseriti su `localhost:8642` non compaiono su faldone.rinaldi.build. Per portarli: Dati → Scarica backup su localhost, poi Ripristina da backup sul sito.
- `sw.js` cancella solo le proprie copie (`vito-…`): sulla stessa origine ci sono anche le copie offline del Faldone e di Lavoro.
- Prove: `npm test` qui dentro, oppure tutte insieme dalla radice con `node --test tools/test/*.test.mjs`.

## Fatto nella terza fase (schema dati 3, 15 novembre 2026)
- **Vista 3D** nella Mappa (`js/views/mappa3d.js`): proiezione in SVG senza librerie, rotazione col trascinamento, selezione dei moduli, stati aperti, vano finito. Lo spostamento resta in pianta.
- **Manuali** (`js/views/biblioteca.js`): caricamento dei PDF (archivio `doc` di IndexedDB, fuori dal backup), scheda con applicabilità e attendibilità, estratti con pagina collegabili ai lavori, rimando documento+pagina su ogni passo delle guide (l'unico modo per segnare un passo come documentato), elenco di cosa chiedere a Mercedes/officina.
- Ricerca dentro il testo dei PDF (15.11.2026): pdf.js 4.10.38 in `vendor/pdfjs/` (da npm, licenza Apache 2.0, nessuna rete a runtime). Al caricamento il testo viene letto pagina per pagina (`js/pdftesto.js`) e salvato nell'archivio `doc` con chiave `testo:<id>`, fuori dal backup. Si cerca dal campo in Manuali → Documenti e dalla ricerca del Quadro; dal risultato si apre la pagina o si crea un estratto precompilato. 46 prove automatiche (`cercaPagine` in `calc.js`).
- Limiti della ricerca: i PDF fatti di scansioni non hanno testo (l'app lo dice, niente OCR); una pagina corrisponde se contiene tutte le parole; provato solo con un PDF finto di 3 pagine, non con un manuale vero grande né su telefono (pdf.js 4 richiede Safari 17.4+ / browser recenti: se non parte, la scheda mostra l'errore e il resto funziona).
- Nessun manuale è stato acquisito: vanno caricati dal proprietario.

## Fatto nella seconda fase (schema dati 2)
- Corretti i tre difetti di calcolo (energia, piano acquisti, collisioni a moduli aperti), con prove di riproduzione.
- Archivio: migrazioni compatibili (`migra()`), copia di sicurezza prima del cambio di formato, ripristino atomico con validazione preventiva, Annulla/Ripristina.
- A. Sezione **Progetto**: uno scenario collega configurazioni, stratigrafia, impianto e profilo; alternative salvabili e confrontabili; solo il progetto attivo entra nel previsto.
- B. **Mappa**: base fissa (slitta) + mobili sostituibili, stati d'uso verificati uno per uno, vano finito dopo i rivestimenti, quote, zoom, pannello di modifica, misure/ipotesi distinte.
- C. **Simulatore**: andamento orario della carica su 48/72 h, energia non servita, picchi contro il limite, verdetto a tre esiti; termico → apparecchio → energia termica / elettricità / combustibile; raffrescamento per componenti note e mancanti.
- D. **Percorso guidato**: eseguibili, bloccati, lista della spesa, sessioni, sequenza con ore e fermo; materiali e attrezzi collegati all'inventario.
- E. Guide di tetto, ruggine, pianale, cabina, pannellature con passi classificati (documentata / proposta / verifica) e schemi.
- Dati reali inseriti: VIN e carta di circolazione (22.12.2003, F.2 2770 kg, portata 930 kg, assi 1470/1470), prezzi del carrello (345,30 € in tutto).

## Fatto nella prima fase
- App avviabile con i dati iniziali, salvataggio locale, backup/ripristino, copia offline.
- Percorso integrato: mappa → stratigrafie/fabbisogni → acquisti previsti → budget → lavori.
- Sezioni: Quadro, Mappa 2D, Materiali, Simulatore (energia, acqua, termico), Lavori (18 schede), Budget/Inventario/Carichi, Diario/Rilievi (31 informazioni mancanti), Fonti (8), Dati.
- 29 prove automatiche e prove nel browser (vedi VERIFICHE.md).

## Decisioni prese
- Web app statica senza build né dipendenze (HTML + moduli JavaScript); dati in IndexedDB; server = `python3 -m http.server`.
- Un solo stato JSON; i calcoli sono funzioni pure in `calc.js`; ogni sezione legge gli stessi dati.
- Lo “speso” viene solo dalle spese sostenute; scenari e carrello generano solo “previsto”.
- I ~1.000 € già spesi sono una quota, non una spesa: le ricevute la sostituiscono (spunta “fa parte dei 1.000 €”).
- Le schede dei lavori sono “attività di verifica” finché non c'è una fonte del costruttore.
- Superfici e quote del vano inserite come IPOTESI dichiarate per rendere usabili i calcoli da subito.

## Ipotesi da sostituire appena possibile
Vano 2220 × 1650 × 1350 mm, passaruota, corridoio 300 × 150 mm; superfici delle zone; una porta scorrevole; λ lana di vetro 0,040; schiuma VEVOR 1,59 m²/conf; serbatoi da 20 l; utenze elettriche e sistemi generici; vetri 3 m²; ponti termici ×1,3–2,5.

## Da fare, in ordine
1. **Tu**: datacard e libretto d'uso dal VIN; nome della valvola ordinata; rilievi geometrici (pianale già rimosso); pesata del mezzo.
2. **Tu**: prezzi dei componenti elettrici e del ciclo anticorrosivo; dettaglio dei 1.000 €; superficie reale della schiuma VEVOR.
2b. Se usavi già l'app: Dati → “Aggiorna guide e base fissa”.
3. Prova su telefono reale; eventuale pubblicazione HTTPS per l'offline.
4. Con il VIN: acquisire documentazione Mercedes e trasformare le schede prioritarie (tagliando, tetto) in procedure con fonte.
5. Miglioramenti software: vedi CONSEGNA.md.

Il 17 novembre 2026 sono state rieseguite le 46 prove. Il simulatore indica autonomia indeterminabile quando il surplus medio copre i soli consumi conosciuti e ci sono utenze ignote.
