---
codice: "INF-08.05"
titolo: "M1: rete, monitoraggio e recupero"
revisione: "4.4"
aggiornato: "2026-11-01"
---

# INF-08.05 · M1: rete, monitoraggio e recupero

## Identità e ruolo

Firewall OPNsense e VM osservabilità, sempre acceso

| Voce | Dotazione |
| --- | --- |
| Piattaforma | MACHINIST X99 PR9-H |
| Processore | Intel Xeon E5-2630L v3 |
| Core / thread | 8 / 16 |
| Frequenza base / turbo | 1.8 / 2.9 GHz |
| TDP CPU | 55 W |
| RAM | 32 GB / DDR4 ECC RDIMM |

## Dischi e dispositivi

| Supporto | Quantità | Funzione |
| --- | --- | --- |
| Kingston SSDNow V200 120 GB | 1 | Avvio Proxmox e OPNsense |

| Dispositivo | Porte / interfaccia | Funzione |
| --- | --- | --- |
| GLOTRENDS I226-T4 | 4 × 2,5 GbE RJ45 | WAN e reti LAN; uplink LGS352C a 1 GbE |

Il TDP è una specifica del processore, non il consumo della macchina alla presa.

## Servizi

| Servizio | Sede | Ambito | Regola |
| --- | --- | --- | --- |
| Zabbix / metriche e log | M1 VM separata; S4 controllo minimo; S2 esterno candidato | Gestione interna | 2 vCPU / 4-8 GB iniziali; quote disco; nessuna telemetria gia attiva |

## Fonti tecniche

## Navigazione

[[REV4-ECO]] · [[REV4-SIN]] · [[REV4-ROAD]]
