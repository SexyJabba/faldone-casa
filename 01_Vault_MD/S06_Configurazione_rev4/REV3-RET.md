---
codice: "REV3-RET"
titolo: "Rete, WAN e confini"
revisione: "4.4"
aggiornato: "2026-11-01"
---

# REV3-RET · Rete, WAN e confini

La rete fidata ha come centro il **Linksys LGS352C-EU**: 48 porte RJ45 Gigabit, quattro SFP+ 10GbE numerate 49–52, VLAN 802.1Q. Il modello non fornisce PoE. La dorsale a stella collega M2, M3, M4 e M6 direttamente allo switch. I due AOC da 3 m e i due DAC da 1 m coprono i quattro collegamenti; le seconde porte di M2 e M4 rimangono libere.

M2 non dipende da M4 per raggiungere gli altri server. Gestione, Corosync, dati personali, IoT e servizi esterni conservano domini distinti. Il traffico fra VLAN passa dalle regole del firewall M1: il suo uplink rame negozia 1GbE sul LGS352C, quindi una dorsale a 10GbE non equivale a routing inter-VLAN a 10GbE. Nessun indirizzo duplicato sulla stessa sottorete fra NIC di gestione e NIC dati.

| Origine | Funzione | Destinazione | Regola |
| --- | --- | --- | --- |
| FTTC | WAN1 | M1 / firewall | Upload4Mbit/s; ordinario/download file con limite dinamico |
| Router5G esterno / LAN1 | WAN2 | M1 | SIM ho.casa500 GB, servizi remoti personali ed esterni |
| Router5G esterno / LAN2 | Avvisi indipendenti | M5 | Percorso notifiche anche con M1 fermo; nessun ponte libero |
| M1 I226-T4 | Fidata / DMZ personale / esterna | Switch e reti autorizzate | Porte/trunk da mappa definitiva; doppia WAN non assume quinta porta |
| Switch/AP IoT | VLAN locale/cloud/camere | M5 / S3 / C3 autorizzati | Rete e AP non transitano solo da M5 |
| M5 interfacce n.d. | Gestione/servizi e percorsi IoT | Switch/router5G | Nessuna eredita delle sei porte BKHD; percorso avvisi 5G e segmentare |
| C3 / C4 Ethernet | Cluster e repliche | Switch fidato | Wi-Fi non bridge automatico per VM; client Linux locale separato |
| S3 / Sonoff USB | Zigbee | Dispositivi compatibili | Z2M verso broker M5/C3; binding diretto dove supportato |
| S4 Ethernet | Sentinella e WoL | Nucleo stabile e nodi autonomi | Nessun qdevice nella base a cinque voti |
| 3 Halo H1900G | Wi-Fi casa attuale -> IoT a regime | Appartamento e laboratorio PT | Liberati solo dopo sostituzione Wi-Fi casa |
| Nuovo Wi-Fi casa | 4piani + esterno | Punti Ethernet e uplink wireless | Budget150 EUR complessivo; AP mesh/VLAN/revisioni da offerte |
| Vito LTE | Rete veicolo autonoma | C1 e servizi di bordo | Modem/SIM dedicati, nessun voto Corosync |
| Due HP esterni | Ethernet DHCP | Jellyfin via HTTPS | Identita individuali; mai ponte verso LAN fidata |
| LGS352C-EU | Switch fidato / 48 RJ45 1GbE + 4 SFP+10GbE | Reti segmentate 802.1Q | Non PoE; inter-VLAN autorizzato via M1 |
| M2 MCX312A / porta 1 | Dorsale 10GbE | LGS352C / SFP+49 | App e dati; porta 2 libera |
| M3 MNPA19-XTR | Dorsale 10GbE | LGS352C / SFP+50 | Calcolo e trasferimenti |
| M4 SFP+ integrata / porta 1 | Dorsale 10GbE | LGS352C / SFP+51 | Storage; seconda SFP+ libera |
| M6 MNPA19-XTR | Dorsale 10GbE | LGS352C / SFP+52 | Media, Seafile e servizi a terzi |
| M1 I226-T4 / trunk LAN | Routing e firewall | LGS352C RJ45 / 1GbE | Il link rame e il routing non sono 10GbE |
| M2 / M3 / M4 / M6 gestione | Management separato | LGS352C RJ45 / 1GbE | Nessun indirizzo duplicato su LAN dati e gestione |

Il Vito ha rete LTE e LAN proprie; accede a servizi autorizzati mediante tunnel. I client di amici e parenti usano identità individuali, HTTPS e quote, senza diventare un ponte nella LAN fidata. La gestione remota della sala server resta distinta dagli accessi ai servizi.

[Specifiche Linksys LGS352C](https://support.linksys.com/kb/article/5130-en/?section_id=188)

## Navigazione

[[REV4-ECO]] · [[REV4-SIN]] · [[REV4-ROAD]]
