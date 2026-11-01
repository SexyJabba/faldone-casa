---
codice: "REV4-RAM"
titolo: "Memorie: distribuzione e utilizzo"
revisione: "4.4"
aggiornato: "2026-11-01"
---

# REV4-RAM · Memorie: distribuzione e utilizzo

Le tre D1581 hanno **160 GB PC3L complessivi**, distribuiti in modo definitivo: M2 64 GB, M5 32 GB, M6 64 GB. M2 usa quattro moduli da 16 GB; M5 due e M6 quattro. I sei moduli HP/Hynix aggiunti completano l’assegnazione. M1 usa i 32 GB DDR4 ECC; M3 conserva 128 GB e M4 32 GB. Totale M1–M6: **352 GB**.

| Nodo | Gruppo | Composizione | Capacità |
| --- | --- | --- | --- |
| M1 | INV-101 | 2 x 16 GB DDR4 RDIMM | 32 GB |
| M2 | INV-100 | 4 x 16 GB PC3L RDIMM | 64 GB |
| M3 | INV-075/099 | 8x16 GB DDR3 RDIMM | 128 GB |
| M4 | INV-076 | 4x8 GB ECC UDIMM | 32 GB |
| M5 | INV-109 | 2 x 16 GB PC3L-10600R RDIMM | 32 GB |
| M6 | INV-109 | 4 x 16 GB PC3L-10600R RDIMM | 64 GB |
| M7 | INV-039 | 2x8 GB HyperX | 16 GB |
| S1 | Hynix PC3-10600U-9-11-B1 | 2x4 GB 2Rx8, esemplari n.d. | 8 GB |
| S3/S4 | Wyse 3030 | 4 GB ciascuno; 32 GB storage n.d. | 4 GB ciascuno |
| Scorta RDIMM16 GB | INV-075/099 | 13 DDR3 - 8 M3 = 5; vecchia assegnazione M6 liberata nel progetto | 80 GB PC3; non sostitutivi automatici dei PC3L |
| C1 | DDR4 SO-DIMM | RAM censita8 GB senza LLM | 8 GB |
| C2 | DDR4 SO-DIMM | RAM censita8 GB | 8 GB |
| C3 | DDR4 SO-DIMM | Base16 GB per HA; misura risorse | 16 GB |
| C4 | DDR4 SO-DIMM | Base16 GB per HA; misura risorse | 16 GB |
| MP3 | Aspire 7 | Dotazione dichiarata, composizione slot | 16 GB |
| MP1 | INV-095 | Memoria unificata Apple M5 | n.d. |

## Quote di memoria e cache

M1 riserva 8 GB iniziali a OPNsense, 4–8 GB alla VM di monitoraggio e mantiene margine host. M2 parte da ARC massimo 16 GB se ZFS sull’host, guest entro 36 GB e almeno 12 GB per host/margine. Sono budget di configurazione: i picchi reali determinano gli aggiustamenti.

M5: HAOS 8 GB, MQTT 2 GB, Frigate/gateway 10 GB, host/cache 4 GB, margine 8 GB. M6: servizi entro 24 GB, ARC locale 16 GB, host 8 GB, margine 16 GB. M4 inizia con ARC 8–12 GB. Non si conta la stessa memoria sia nel guest sia nell’host.

La cache serve dati riletti: non promette guadagni sui film letti una sola volta. La cache M6 non è quella del pool M4. I 128 GB di M3 aiutano lotti e modelli in RAM, ma non sostituiscono la VRAM. RDIMM e UDIMM restano famiglie incompatibili quando la piattaforma non le supporta.

## Navigazione

[[REV4-ECO]] · [[REV4-SIN]] · [[REV4-ROAD]]
