---
codice: "INF-03.41"
titolo: "Vikunja"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-03.41 · Vikunja

Database, attività, progetti, allegati e utenti. Le attività appartengono ai rispettivi spazi di lavoro.

Il servizio risiede su M2 con stato persistente nel pool SSD.

Backup e recupero comprendono dati, configurazione, allegati e identità pertinenti, con DB coerente quando presente.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]


## Disponibilita4.2

| Servizio | Primario | Subentro preferito | Obiettivo |
| --- | --- | --- | --- |
| HAOS | M5 | C3 | RPO5 min, RTO5 min |
| MQTT, guest separato | M5 | C3 | RPO5 min, RTO5 min |
| Nextcloud | M2 | C4 | RPO5 min, RTO15 min |
| Vikunja | M2 | C4 | RPO5 min, RTO15 min |
| n8n | M2 | C4 | RPO5 min, RTO15 min |

Le repliche contengono guest, DB e tutti i dati esterni necessari, su SSD locale ZFS di C3/C4. Replica non ebackup; RPO e ritardo massimo di progetto dall’ultima copia riuscita, non garanzia contro doppio guasto o corruzione replicata. Bind mount LXC e condivisioni non diventano replicati per inclusione del solo rootfs. Storage ID, volumi e frequenza effettiva vanno predisposti esplicitamente; niente dipendenza dal solo pool M2 per ilsubentro Nextcloud.

Capienza Nextcloud non stimata dall’utente: si misura. Foto/video Immich possono attendere M2. Risorse riservate agli essenziali; client e Hermes riducibili. Nessun overcommit  valido prima delle misure. Radio HAOS usa S3 via rete; nessun USB pass-through Sonoff su M5 da trasferire al subentro. Frigate/Hailo/GPU non HA e non migrano per implicito.

Rientro al primario controllato dopo verifiche, non immediatamente automatico. Spegnimenti pianificati non cancellano guest replica né autorizzano due istanze attive degli stessi job DB. Ammissione HA, fencing e storage valido sono condizioni dell’implementazione; gli obiettivi non sono risultati di test.

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
