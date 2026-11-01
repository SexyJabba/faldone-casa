---
codice: "ATL-23"
titolo: "Architettura e apparati della revisione 4.4"
revisione: "4.4"
aggiornato: "2026-11-01"
---

# ATL-23 · Architettura e apparati della revisione 4.4

| Nodo | Piattaforma | Memoria | Responsabilità |
| --- | --- | --- | --- |
| M1 | MACHINIST X99 PR9-H / Intel Xeon E5-2630L v3 | 32 GB DDR4 ECC RDIMM, 2 x 16, disponibili | Proxmox: OPNsense VM e osservabilita separata; nucleo stabile |
| M2 | D1581-Q3A / Intel Xeon D-1581 | 64 GB PC3L RDIMM, 4 x 16 | Applicazioni e dati personali; Sabrent per avvio, P310 4 TB per dati; nucleo stabile |
| M3 | HUANANZHI X99-T8 / E5-2678 v3 | 128 GB, 8 x 16 DDR3 RDIMM | Proxmox autonomo IA su richiesta; RTX 3060 12 GB; nessun voto nel nucleo |
| M4 | ASUS P9D-MH/SAS/10G-DUAL / E3-1265L v3 | 32 GB, 4 x 8 ECC UDIMM | Proxmox autonomo/ZFS: WD solo backup dopo transizione; media separati, acceso per richiesta/job |
| M5 | D1581-Q3 / Intel Xeon D-1581 | 32 GB PC3L RDIMM, 2 x 16 | Proxmox: HAOS, MQTT, Frigate/Hailo; nucleo stabile |
| M6 | D1581-Q3A / Intel Xeon D-1581 | 64 GB PC3L RDIMM, 4 x 16 | Proxmox autonomo: media, Seafile, download; acceso a richiesta |
| M7 | ASUS H61M-K / E3-1220L v2 | 16 GB, 2 x 8 DDR3 | Riserva manuale H61M-K; PowerEdge T110 II come riserva complementare |
| S1 | ASRock Q1900M / Celeron J1900 | 8 GB, 2 x 4 Hynix PC3-10600U | Linux: Caddy, Vaultwarden, notifiche e utilita; fuori cluster |
| S2 | Oracle Cloud Always Free, A1 | 1 OCPU / 4 GB / boot 50 GB | Osservazione esterna e relay; niente voto |
| S3 | Dell Wyse 3030 N03D | 4 GB / 32 GB | Linux: Sonoff ZBDongle-P, Zigbee2MQTT e dashboard leggera; fuori cluster |
| S4 | Dell Wyse 3030 N03D | 4 GB / 32 GB | Sentinella indipendente e primo mittente WoL; nessun voto nella base 4.4 |
| C1 | Dell OptiPlex 7070 Ultra / i5-8265U | 8 GB, nessun LLM locale | Vito W639: nodo mobile lavoro/camper autonomo; offline, LTE e recupero; fuori quorum |
| C2 | Dell OptiPlex 7070 Ultra / i5-8265U | 8 GB, espansione solo se necessaria | Cucina: client Linux, streaming/Moonlight e pannello casa |
| C3 | Dell OptiPlex 7070 Ultra / i5-8265U | 16 GB base HA | Proxmox client Linux e subentro HAOS/MQTT, senza Hermes |
| C4 | Dell OptiPlex 7070 Ultra / i5-8265U | 16 GB base HA | Proxmox nucleo: client Linux, riserva app selezionate, secondo mittente WoL |
| MP3 | Acer Aspire 7 A715-42G-R2VB / Ryzen 7 5700U / RTX3050 Ti 4 GB | 16 GB / Crucial P3 Plus1 TB | Acer sempre fisso in laboratorio: Windows lavoro/gioco, Sunshine; OpenClaw di lavoro e Hermes |
| MP4 | ASUS X99-DELUXE / i7-5930K / RTX2080 | 32 GB DDR4 | PC primo fratello, esterno all’infrastruttura |
| Wyse laboratorio | Dell Wyse 3030 N03D | 4 GB / 32 GB | Jellyfin, musica e pannello Home Assistant; affianca Acer |
| Wyse studio | Dell Wyse 3030 N03D | 4 GB / 32 GB | Monitor e client audio verso Behringer CONTROL2USB |
| Wyse Hi-Fi salone | Dell Wyse 3030 N03D | 4 GB / 32 GB | Client Hi-Fi verso DAC ES9038Q2M USB |
| HP amico 1 | HP t520 | 4 GB / Apacer M.2 8 GB | Client esterno Ethernet: LibreELEC, Jellyfin e offline USB |
| HP amico 2 | HP t520 | 4 GB / Apacer M.2 8 GB | Client esterno Ethernet: LibreELEC, Jellyfin e offline USB |
| Microtech ingresso | Microtech EBL14B | Dotazione n.d.; modello 4 GB/64 GB eMMC | Pannello citofono/allarme, display e batteria integrati; fuori cluster |
| T110 II | Dell PowerEdge T110 II / E3-1220 v2 | 8 GB | Riserva complementare e unità RDX SATA |
| Kindle recuperato | Kindle 11a generazione USB-C | Modello base/Paperwhite n.d. | Biblioteca tecnica e plancia compatta; dispositivo personale |
| MP1 | Apple MacBook M5 personale | RAM e SSD: n.d. | A casa: utente lavoro separato, accesso durante la giornata lavorativa; identità personale distinta |

## Autonomia e collaborazione

Il nucleo stabile M1/M2/M5/C3/C4 mantiene cinque voti, quorum tre. M3, M4 e M6 sono host autonomi a richiesta. Vito, client esterni e nodi di altre sedi restano fuori Corosync. Ogni ramo può essere trasferito conservando identità, dati e interfacce: [[REV4-ECO]] e [[REV4-SIN]].

## Navigazione

[[REV4-ECO]] · [[REV4-SIN]] · [[REV4-ROAD]]
