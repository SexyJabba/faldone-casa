---
codice: "INF-03.14"
titolo: "Nextcloud: M2 e DMZ dedicata"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-03.14 · Nextcloud: M2 e DMZ dedicata

**Confini fisici.** M2 servizi personali e M6 servizi esterni hanno accessi distinti; Hermes MP3 e OpenClaw MP1 sono personali. M4 interno:media RO a Jellyfin e scritturaarr limitata, repository WD esclusi. Reti IoTlocale/cloud/camere su switch/AP indipendenti da M5. Vedi REV3-RET.

Nextcloud su M2, dati propri su SSD e database coerente; Caddy su S1 Q1900 usa il percorso filtrato da M1. Non dual-home il guest per aggirare M1. Backup coerente DB+file, niente scrittura SMB nel datadir.

**Copie indipendenti.** Dati personali e stato dei servizi sono primari sul pool SSD M2; le copie locali versionate risiedono sui WD Green isolati di M4. SH1 / INV-005 (Crucial P310 4 TB + Lexar E750) e Workspace cifrato prima del caricamento aggiungono copie fuori dal nodo. Configurazioni, immagini di boot e stato applicativo dei nodi, compresi M6 e MP3 / OpenClaw, appartengono alla copertura. Cache, staging, media riscaricabili e registrazioni ordinarie restano esclusi salvo dati insostituibili. Dump DB e file appartengono allo stesso punto coerente. M4 esegue i backup nelle finestre di accensione: ultimo esito e ritardo sono visibili. Le chiavi sono recuperabili anche offline e senza Vaultwarden.

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
