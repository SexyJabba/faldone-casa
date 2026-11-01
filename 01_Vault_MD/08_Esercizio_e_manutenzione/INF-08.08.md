---
codice: "INF-08.08"
titolo: "Home Assistant e subentro"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-08.08 · Home Assistant e subentro

S3 Wyse t520 con 4 GB PC3L-12800S e Apacer M.2 8 GB esegue Linux e Zigbee2MQTT, con Sonoff ZBDongle-P USB. S3 e esterno al cluster e fisicamente distinto dal testimone S4. MQTT e un guest separato M5 con replica/subentro C3; HomeAssistantOS ha proprio guest e stesso subentro preferito.

Con M5 guasto, la radio S3 e la rete IoT restano raggiungibili ma broker/HA si interrompono fino al recupero C3. Comandi Zigbee diretti restano dove i dispositivi supportano binding configurato; non tutte le automazioni HA diventano binding. Con S3 guasto il coordinatore e singola dipendenza: non promettere subentro radio automatico. Configurazioni echiavi radio hanno copia di recupero; nessun secondo coordinatore inventato.

Il collegamento C3 passa su Ethernet e percorsi VLAN autorizzati indipendenti da M5. Stesso AP non equivale a stessa VLAN; il Wi-Fi non e un bridge automatico di VMProxmox. Spazioflash8 GB per sistema/log/aggiornamenti va verificato, senza upgrade preventivo.

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

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-MAP]] · [[REV3-OPEN]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
