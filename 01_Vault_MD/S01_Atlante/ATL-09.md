---
codice: "ATL-09"
titolo: "M3: inferenza dedicata e calcolo a richiesta"
revisione: "4.4"
aggiornato: "2026-11-01"
---

# ATL-09 · M3: inferenza dedicata e calcolo a richiesta

## Identità e ruolo

IA, Proxmox autonomo acceso su richiesta

| Voce | Dotazione |
| --- | --- |
| Piattaforma | HUANANZHI X99-T8 |
| Processore | Intel Xeon E5-2678 v3 |
| Core / thread | 12 / 24 |
| Frequenza base / turbo | 2.5 / n.d. GHz |
| TDP CPU | 120 W |
| RAM | 128 GB / DDR3 ECC RDIMM |

## Dischi e dispositivi

| Supporto | Quantità | Funzione |
| --- | --- | --- |
| Western Digital PC SN530 512 GB | 1 | Avvio host e IA |

| Dispositivo | Porte / interfaccia | Funzione |
| --- | --- | --- |
| MSI GeForce RTX 3060 Ventus 2X |  |  |
| Mellanox MNPA19-XTR | 1 × 10 GbE SFP+ | Stella 10G |

Il TDP è una specifica del processore, non il consumo della macchina alla presa.

## Servizi

| Servizio | Sede | Ambito | Regola |
| --- | --- | --- | --- |
| Open WebUI e backend LLM/VLM | M2 interfaccia / M3 calcolo | Personale | M3 inferenza su conferma o coda; priorita utente > agenti > fondo |

## Fonti tecniche

## Navigazione

[[REV4-ECO]] · [[REV4-SIN]] · [[REV4-ROAD]]
