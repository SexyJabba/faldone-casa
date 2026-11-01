---
codice: "INF-01.17"
titolo: "Nomenclatura e identita"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-01.17 · Nomenclatura e identita

| Prefisso | Classe |
| --- | --- |
| M | M1-M7 nodi infrastrutturali |
| S | S1 utilita, S2 VPS, S3 radio, S4 testimone |
| C | C1-C4 Dellclient; C5/C6assegnazioni HP storiche noncorrenti |
| SH | Supportiesterni shelter |
| MD | Telefonietablet |
| MP | Notebooke PCpersonali |
| CE | Clientstreamingesternialla fidata |
| INV | Prodottolotto; serialeesemplare distinto; codici mairiusati per prodotto diverso |



La configurazione 4.4 distingue infrastruttura domestica, postazioni di lavoro e W639. Stato di acquisto/consegna e separato in [[REV3-STATO]].

| Apparato | Piattaforma | RAM/storage | Ruolo | Riferimenti |
| --- | --- | --- | --- | --- |
| M1 | MACHINIST X99 PR9-H / Xeon E5-2630L v3 , modello completo n.d. | 32 GB DDR4 ECC RDIMM, 2 x 16, disponibili | Proxmox: OPNsense VM e osservabilita separata; nucleo stabile | INV-101 RAM / nuova scheda n.d. |
| M2 | D1581-Q3 / Xeon D-1581 | 64 GB, 4 x 16 DDR3L RDIMM | Proxmox: applicazioni personali e pool SSD; niente Hermes/Frigate | INV-074 / 100 / 067 / 081 |
| M3 | HUANANZHI X99-T8 / E5-2678 v3 | 128 GB, 8 x 16 DDR3 RDIMM | Proxmox IA; MSI RTX3060 Ventus 2X 12 GB; senza Windows | INV-030 / 048 / 077 |
| M4 | ASUS P9D-MH/SAS/10G-DUAL / E3-1265L v3 | 32 GB, 4 x 8 ECC UDIMM | Proxmox/ZFS: backup WD RAIDZ2 e media Seagate RAIDZ1 | INV-073 / 047 / 076 |
| M5 | D1581-Q3 / Xeon D-1581 | 32 GB PC3L RDIMM, 2 x 16 dal lotto assegnato | Proxmox: HAOS, MQTT, Frigate/Hailo; nucleo stabile | INV-074 / lotto RAM nuovo / INV-098 candidato |
| M6 | D1581-Q3A / Xeon D-1581 | 64 GB PC3L RDIMM, 4 x 16 dal lotto assegnato | Proxmox autonomo: media, Seafile, download; acceso a richiesta | Q3A nuova / Arc candidata / INV-097 |
| M7 | ASUS H61M-K / E3-1220L v2 | 16 GB, 2 x 8 DDR3 | Riserva manuale H61M-K; T110 II acquistato candidato sostitutivo, da qualificare | INV-033 / 046 / 039 |
| S1 | ASRock Q1900M / Celeron J1900 | 8 GB, 2 x 4 Hynix PC3-10600U | Linux: Caddy, Vaultwarden, notifiche e utilita; fuori cluster | INV-034 / 049 / 041, esemplari n.d. |
| S2 | Oracle Cloud Always Free, A1 |  1 OCPU / 4 GB / boot 50 GB | Osservazione esterna e relay; niente voto | Piano Oracle; Servizio esterno |
| S3 | Dell Wyse 3030 N03D | 4 GB / 32 GB  | Linux: Sonoff ZBDongle-P, Zigbee2MQTT e dashboard leggera; fuori cluster | Prodotto/seriale n.d., Wyse radio |
| S4 | Dell Wyse 3030 N03D | 4 GB / 32 GB  | Linux: sentinella indipendente (senza voto) e primo mittente WoL; fuori cluster | Prodotto/seriale n.d., Wyse sentinella |
| C1 | Dell OptiPlex 7070 Ultra / i5-8265U | 8 GB , nessun LLM locale | W639: PC di bordo/lavoro, touchscreen, diagnostica; fuori cluster domestico | INV-079, esemplare C1 |
| C2 | Dell OptiPlex 7070 Ultra / i5-8265U | 8 GB , espansione solo se necessaria | Cucina: client Linux, streaming/Moonlight e pannello casa | INV-079, esemplare C2 |
| C3 | Dell OptiPlex 7070 Ultra / i5-8265U | 16 GB base HA,  | Proxmox client Linux e subentro HAOS/MQTT, senza Hermes | INV-079, esemplare C3 |
| C4 | Dell OptiPlex 7070 Ultra / i5-8265U | 16 GB base HA,  | Proxmox: client Linux VM, subentro app e secondo WoL | INV-079, esemplare C4 |
| MP3 | Acer Aspire 7 A715-42G-R2VB / Ryzen 7 5700U / RTX3050 Ti 4 GB | 16 GB / Crucial P3 Plus1 TB | Acer sempre fisso in laboratorio: Windows lavoro/gioco, Sunshine; OpenClaw di lavoro e Hermes  | MP3, codice INV n.d.; dotazione dichiarata utente |
| MP4 | ASUS X99-DELUXE / i7-5930K / RTX2080 | 32 GB DDR4 | PC primo fratello, esterno all’infrastruttura | INV-029/043/035/055 |
| Wyse laboratorio | Dell Wyse 3030 N03D | 4 GB / 32 GB  | Jellyfin, musica e pannello Home Assistant; affianca Acer | Codice C e INV n.d. |
| Wyse studio | Dell Wyse 3030 N03D | 4 GB / 32 GB  | Monitor e client audio verso Behringer CONTROL2USB | Codice C e INV n.d. |
| Wyse Hi-Fi salone | Dell Wyse 3030 N03D | 4 GB / 32 GB  | Client Hi-Fi verso DAC ES9038Q2M USB | Codice C e INV n.d. |
| HP amico 1 | HP t520 | 4 GB / Apacer M.2 8 GB | Client esterno Ethernet: LibreELEC, Jellyfin e offline USB | INV-078, codice CE e seriale n.d. |
| HP amico 2 | HP t520 | 4 GB / Apacer M.2 8 GB | Client esterno Ethernet: LibreELEC, Jellyfin e offline USB | INV-078, codice CE e seriale n.d. |
| Microtech ingresso | Microtech EBL14B | Dotazione n.d.; modello 4 GB/64 GB eMMC | Pannello citofono/allarme, display e batteria integrati; fuori cluster | Codice MP/INV e seriale n.d. |
| T110 II | Dell PowerEdge T110 II / E3-1220 v2 | 8 GB  | Riserva candidata per M7 e disponibilita unita RDX SATA | Prodotto/seriale n.d.; lotto acquistato 150 EUR |
| Kindle recuperato | Kindle 11a generazione USB-C | Modello base/Paperwhite n.d. | Biblioteca tecnica e plancia compatta; dispositivo personale | Codice MD/INV n.d. |

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-OPEN]] · [[REV3-DIFF]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
