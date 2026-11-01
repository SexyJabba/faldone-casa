---
codice: "INF-06.08"
titolo: "Spotify e Lidarr: confine delle automazioni"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-06.08 · Spotify e Lidarr: confine delle automazioni

**Download e arr - M6.** Downloader e stack arr usano DB locali e staging INV-008 (Samsung 850 EVO 500 GB). Con M4 spento i download accodati proseguono e gli import remoti restano sospesi. Con M4 disponibile, arr pubblica i completati nella sola libreria media autorizzata sul pool Seagate. Un mount effettivo e identificato è necessario per la scrittura: la directory locale vuota del mountpoint non è una destinazione alternativa. La coda si ferma prima del pieno, preservando spazio per sistema e DB. Analisi, scansioni, scompattazioni e concorrenza sono limitate. Gli automatismi extra-arr sono disabilitati, salvo quelli esplicitamente mantenuti nel catalogo. Tra SSD e pool remoto si copia; non si usano hardlink. Seed e rimozione dei sorgenti seguono l’esito dell’import. [[INF-12.16]] descrive l’esercizio ordinario.

Il ponte Spotify-Lidarr/beets non appartiene agli automatismi generali attivi. I workflow esplicitamente conservati hanno un proprio registro ingressi, uscite, permessi e limiti; il catalogo non riattiva integrazioni per analogia.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
