---
codice: "INF-12.07"
titolo: "Recupero per servizio"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-12.07 · Recupero per servizio

Il recupero parte da un client indipendente con chiavi e credenziali disponibili offline. Il repository viene aperto, lo snapshot scelto per data e il contenuto ripristinato in una directory nuova.

Per i file si confrontano manifest/hash e si controllano apertura, quantità e permessi. Per le applicazioni DB e file appartengono allo stesso punto e la versione del software resta compatibile: il recupero avviene in ambiente isolato, con notifiche e job esterni disabilitati, fino al  su login, allegati, ricerca e ruoli.

Il registro conserva sorgente, repository, snapshot, coerenza DB/file, tempi e anomalie. Un job completato e un recupero riuscito sono eventi distinti. Nessun ripristino sovrascrive automaticamente l’unico originale disponibile.

| Stato | Contenuto della copia |
| --- | --- |
| Nextcloud / Immich | Dump DB, file gestiti, utenti e configurazione coerenti |
| Paperless / Tandoor / Grocy / Firefly | DB, allegati, chiavi e configurazioni |
| Vaultwarden / n8n | DB, allegati, credenziali protette e configurazione |
| HA / MQTT / Zigbee | Backup HA, configurazioni e identità radio |
| M6 | DB arr, stato downloader, configurazione e boot |
| MP3 / OpenClaw | Stato agente, profili browser e configurazioni protette |

Dump supportato o arresto coordinato degli scrittori rende coerente la copia. Uno snapshot del guest non include automaticamente i mount esterni. I repository contengono dati e configurazioni necessari al recupero, senza trasformare gli export condivisibili in un archivio di password.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
