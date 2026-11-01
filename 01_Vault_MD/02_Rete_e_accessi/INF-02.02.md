---
codice: "INF-02.02"
titolo: "Rete: percorsi chiari per casa, servizi e Vito"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-02.02 · Rete: percorsi chiari per casa, servizi e Vito

| Origine | Percorso | Destinazione | Vincolo |
| --- | --- | --- | --- |
| FTTC | WAN1 | M1 / firewall | Upload4Mbit/s; ordinario/download file con limite dinamico |
| Router5G esterno / LAN1 | WAN2 | M1 | SIM ho.casa500 GB, servizi remoti personali ed esterni |
| Router5G esterno / LAN2 | Avvisi indipendenti | M5 | Percorso notifiche anche con M1 fermo; nessun ponte libero |
| M1 I226-T4 | Fidata / DMZ personale / esterna | Switch e reti autorizzate | Quattro porte fisiche; due WAN e trunk autorizzati, senza quinta porta implicita |
| Switch/AP IoT | VLAN locale/cloud/camere | M5 / S3 / C3 autorizzati | Rete e AP non transitano solo da M5 |
| M5 interfacce n.d. | Gestione/servizi e percorsi IoT | Switch/router5G | Percorso notifiche 5G segmentato; nessun ponte verso le altre reti |
| C3 / C4 Ethernet | Cluster e repliche | Switch fidato | Wi-Fi non bridge automatico per VM; client Linux locale separato |
| S3 / Sonoff USB | Zigbee | Dispositivi compatibili | Z2M verso broker M5/C3; binding diretto dove supportato |
| S4 Ethernet | Sentinella e WoL | Nucleo stabile e nodi autonomi | Nessun qdevice nella base a cinque voti |
| 3 Halo H1900G | Wi-Fi IoT | Appartamento e laboratorio PT | Reti IoT e famiglia distinte; accessi autorizzati |
| Vito LTE | Rete veicolo autonoma | C1 e servizi di bordo | Modem/SIM dedicati, nessun voto Corosync |
| Due HP esterni | Ethernet DHCP | Jellyfin via HTTPS | Identita individuali; mai ponte verso LAN fidata |
| LGS352C-EU | Switch fidato / 48 RJ45 1GbE + 4 SFP+10GbE | Reti segmentate 802.1Q | Non PoE; inter-VLAN autorizzato via M1 |
| M2 MCX312A / porta 1 | Dorsale 10GbE | LGS352C / SFP+49 | App e dati; porta 2 libera |
| M3 MNPA19-XTR | Dorsale 10GbE | LGS352C / SFP+50 | Calcolo e trasferimenti |
| M4 SFP+ integrata / porta 1 | Dorsale 10GbE | LGS352C / SFP+51 | Storage; seconda SFP+ libera |
| M6 MNPA19-XTR | Dorsale 10GbE | LGS352C / SFP+52 | Media, Seafile e servizi a terzi |
| M1 I226-T4 / trunk LAN | Routing e firewall | LGS352C RJ45 / 1GbE | Il link rame e il routing non sono 10GbE |
| M2 / M3 / M4 / M6 gestione | Management separato | LGS352C RJ45 / 1GbE | Nessun indirizzo duplicato su LAN dati e gestione |

Gestione e Corosync cablati restano locali e disponibili con OPNsense fermo. M3/M4/M6 hanno gestione propria fuori cluster. Due AOC da 3 m e due DAC da 1 m collegano la stella 10G; il registro di posa e i test sono nella roadmap.

Le reti famiglia, IoT, camere, servizi esterni e gestione hanno permessi espliciti. VLAN, subnet e nomi OS sono campi da compilare prima dell'attivazione, non valori inventati. La SIM casa non e automaticamente quella del Vito. Il veicolo usa rete autonoma e accesso autenticato selettivo, senza bridge libero nella LAN domestica. [[REV4-VNET]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
