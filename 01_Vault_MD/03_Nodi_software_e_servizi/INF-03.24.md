---
codice: "INF-03.24"
titolo: "n8n, OCR e Hermes"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-03.24 · n8n, OCR e Hermes

**M2 - Servizi e dati primari.** D1581-Q3A con Xeon D-1581 a 16 core/32 thread e 64 GB DDR3L ECC RDIMM, 4x16 GB. Proxmox ospita i servizi fidati e Hermes; Nextcloud ha un ambiente isolato sulla DMZ dedicata. Database, configurazioni e dati autorevoli risiedono sul P310 4 TB locale, segnaposto del futuro pool SSD; Sabrent 512 GB per avvio. M2 è indipendente da M3 per i servizi ordinari e da M4 per l’accesso ai dati primari.

**Agenti e modelli.** OpenClaw e Hermes sono  su MP3 Acer; MP1 MacBook M5 personale resta a casa con utente lavoro separato, con profili locali minimi e motore M3 su conferma / coda. M3 e dedicato IA con 128 GB e RTX3060; Windows/Hermes e su MP3 Aspire; RTX2080 e su MP4 familiare. Vision-gateway/Frigate/Hailo su M5; ruoli definitivi in REV3-AGN e REV3-FAM.

n8n conserva workflow, credenziali e stato esecuzioni nello storage persistente M2. Paperless gestisce OCR e documenti personali. I workflow attivi hanno ingressi, uscite e account espliciti; non attivano in modo generale le automazioni extra-arr.

OCR ufficiale Paperless e pre-analisi Hailo restano percorsi distinti: [[INF-03.38]]. Le integrazioni Hermes/OpenClaw passano da [[INF-03.47]], senza backend Hailo nativo presunto.

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
