---
codice: "ATL-28"
titolo: "M5: domotica e visione locale"
revisione: "4.4"
aggiornato: "2026-11-01"
---

# ATL-28 · M5: domotica e visione locale

## Identità e ruolo

Home Assistant, MQTT e Frigate, sempre acceso

| Voce | Dotazione |
| --- | --- |
| Piattaforma | D1581-Q3 |
| Processore | Intel Xeon D-1581 |
| Core / thread | 16 / 32 |
| Frequenza base / turbo | 1.8 / 2.4 GHz |
| TDP CPU | 65 W |
| RAM | 32 GB / PC3L ECC RDIMM |

## Dischi e dispositivi

| Supporto | Quantità | Funzione |
| --- | --- | --- |
| Samsung 850 EVO 250 GB | 1 | Avvio Proxmox e stato |
| Seagate ST1000LM024 1 TB | 2 | Registrazioni Frigate |

| Dispositivo | Porte / interfaccia | Funzione |
| --- | --- | --- |
| Hailo-8 M.2 M-key |  | Inferenza Frigate |
| Interfacce Ethernet integrate |  | LAN/IoT autorizzate e percorso notifiche router 5G |

Il TDP è una specifica del processore, non il consumo della macchina alla presa.

## Servizi

| Servizio | Sede | Ambito | Regola |
| --- | --- | --- | --- |
| Home Assistant OS e MQTT separato | M5 -> C3 in subentro | Interno/personale | RPO5 min; RTO5 min; radio fisica su S3 |
| Frigate, Hailo-8, vision-gateway, go2rtc | M5 | Interno | 4 camere eventi 7 giorni; sei future; Hailo/registrazioni non HA |

## Fonti tecniche

[Specifica CPU](https://www.intel.com/content/www/us/en/products/sku/93357/intel-xeon-processor-d1581-24m-cache-1-80-ghz/specifications.html)

## Navigazione

[[REV4-ECO]] · [[REV4-SIN]] · [[REV4-ROAD]]
