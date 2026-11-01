---
codice: "ATL-06"
titolo: "M2: applicazioni e P310 segnaposto"
revisione: "4.4"
aggiornato: "2026-11-01"
---

# ATL-06 · M2: applicazioni e P310 segnaposto

## Identità e ruolo

Applicazioni e dati personali, sempre acceso

| Voce | Dotazione |
| --- | --- |
| Piattaforma | D1581-Q3A |
| Processore | Intel Xeon D-1581 |
| Core / thread | 16 / 32 |
| Frequenza base / turbo | 1.8 / 2.4 GHz |
| TDP CPU | 65 W |
| RAM | 64 GB / PC3L ECC RDIMM |

## Dischi e dispositivi

| Supporto | Quantità | Funzione |
| --- | --- | --- |
| Sabrent Rocket 512 GB | 1 | Avvio Proxmox |
| Crucial P310 4 TB (M.2 interno) | 1 | Dati e servizi; segnaposto in attesa del pool SSD |

| Dispositivo | Porte / interfaccia | Funzione |
| --- | --- | --- |
| Mellanox MCX312A-XCBT | 2 × 10 GbE SFP+ | Una porta alla stella 10G, seconda libera |

Il TDP è una specifica del processore, non il consumo della macchina alla presa.

## Servizi

| Servizio | Sede | Ambito | Regola |
| --- | --- | --- | --- |
| Nextcloud, Vikunja, n8n | M2 -> C4 in subentro | Personale | HA con repliche complete; accesso privato, non pubblicazione generale |
| Immich, Paperless, Syncthing, SMB/NFS, Tandoor, Stirling, HomeBox, Grocy, Firefly | M2 | Personale/interno | Immich puo attendere M2; non tutti i servizi sono HA |
| Open WebUI e backend LLM/VLM | M2 interfaccia / M3 calcolo | Personale | M3 inferenza su conferma o coda; priorita utente > agenti > fondo |

## Fonti tecniche

[Specifica CPU](https://www.intel.com/content/www/us/en/products/sku/93357/intel-xeon-processor-d1581-24m-cache-1-80-ghz/specifications.html)

## Navigazione

[[REV4-ECO]] · [[REV4-SIN]] · [[REV4-ROAD]]
