---
codice: "INF-04.10"
titolo: "Recupero di file e applicazioni"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-04.10 · Recupero di file e applicazioni

Il recupero parte da un client indipendente con chiavi e credenziali disponibili offline. Il repository viene aperto, lo snapshot scelto per data e il contenuto ripristinato in una directory nuova.

Per i file si confrontano manifest/hash e si controllano apertura, quantità e permessi. Per le applicazioni DB e file appartengono allo stesso punto e la versione del software resta compatibile: il recupero avviene in ambiente isolato, con notifiche e job esterni disabilitati, fino al  su login, allegati, ricerca e ruoli.

Il registro conserva sorgente, repository, snapshot, coerenza DB/file, tempi e anomalie. Un job completato e un recupero riuscito sono eventi distinti. Nessun ripristino sovrascrive automaticamente l’unico originale disponibile.

## Comandi di consultazione del repository

```text
restic -r REPOSITORY snapshots
restic -r REPOSITORY check
restic -r REPOSITORY check --read-data-subset=10%
restic -r REPOSITORY ls ID_SNAPSHOT
restic -r REPOSITORY restore ID_SNAPSHOT --target DIRECTORY_NUOVA
```

Il controllo strutturale non legge tutto il contenuto. La percentuale è una lettura parziale; la rotazione periodica e i campioni recuperati affiancano i controlli completi. Il target di ripristino è una directory nuova con spazio sufficiente. Password e chiavi restano fuori dalla cronologia e dagli esempi del faldone.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
