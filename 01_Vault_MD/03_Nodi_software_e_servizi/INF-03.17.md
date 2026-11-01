---
codice: "INF-03.17"
titolo: "Syncthing: cartelle e repliche"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-03.17 · Syncthing: cartelle e repliche

Syncthing su M2 replica cartelle selezionate verso i dispositivi autorizzati. Modalità cartella, dispositivi, esclusioni e conflitti appartengono al registro del servizio. La replica può propagare modifiche e cancellazioni: le copie versionate indipendenti rimangono necessarie.

I dataset Syncthing sono distinti dalle librerie interne gestite da Nextcloud e Immich. Le cartelle condivise rispettano i confini fra personale, lavoro e appartamenti. Il recupero usa una copia indipendente; un conflitto non comporta sovrascrittura automatica della sorgente valida.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
