---
codice: "INF-01.16"
titolo: "M6: media, servizi esterni e margine di calcolo"
revisione: "4.4"
aggiornato: "2026-11-01"
---

# INF-01.16 · M6: media, servizi esterni e margine di calcolo

## Identità e ruolo

Multimedia, Seafile e download, Proxmox autonomo su richiesta

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
| Kingston SSDNow V300 120 GB | 1 | Avvio Proxmox |
| Samsung 850 EVO 500 GB | 1 | Download, staging e dati applicativi con quote |
| Western Digital WD10EZRX 1 TB | 2 | Seafile e audio |

| Dispositivo | Porte / interfaccia | Funzione |
| --- | --- | --- |
| Intel Arc A310 |  | Accelerazione Jellyfin |
| Mellanox MNPA19-XTR | 1 × 10 GbE SFP+ | Stella 10G |

Il TDP è una specifica del processore, non il consumo della macchina alla presa.

## Servizi

| Servizio | Sede | Ambito | Regola |
| --- | --- | --- | --- |
| Jellyfin / Arc A310 | M6 | Altri utenti autorizzati | Ingresso Caddy; richiesta visione risveglia M4 se file remoto |
| Navidrome, Audiobookshelf, Snapcast | M6 | Locale/personale | Copie locali quotate; Snapcast solo LAN |
| Seafile | M6 | Altri utenti autorizzati | 10 utenti x50 GB; mirror WD10EZRX; nessun backup aggiuntivo |
| Downloader e arr | M6 | Solo interno | Container e permessi separati; scansioni limitate; niente automatismi extra |

## Fonti tecniche

[Specifica CPU](https://www.intel.com/content/www/us/en/products/sku/93357/intel-xeon-processor-d1581-24m-cache-1-80-ghz/specifications.html)

## Navigazione

[[REV4-ECO]] · [[REV4-SIN]] · [[REV4-ROAD]]
