---
codice: "ATL-24"
titolo: "Espansioni e verifiche delle schede ricevute"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# ATL-24 · Espansioni e verifiche delle schede ricevute

| Nodo | Espansioni richieste | Gate di compatibilita |
| --- | --- | --- |
| M1 PR9-H | I226-T4 nello slot lungo; boot SATA | Avvio headless, IOMMU, CPU esatta e console recupero |
| M2 Q3A | Sabrent512 + P3104TB su due NVMe; MCX312A | Due M.2 PCIe simultanei, linee condivise e montaggio NIC |
| M3 X99-T8 | RTX3060 + MNPA19-XTR; SN530 | GPU e rete sotto carico; raffreddamento e alimentazione |
| M4 P9D | LSI2308 e SFP+ integrati | Firmware controller/ZFS, dischi e link distinti |
| M5 Q3 | Hailo M-key; boot SATA e mirror HDD | PCIe reale dello slot, driver/runtime, nessun modem presunto |
| M6 Q3A | Arc A310 candidata + MNPA19-XTR | Slot e banda simultanei, ingombri, driver e test Jellyfin |

La sigla commerciale Q3A non certifica lo stesso PCB in ogni annuncio. Nessun manuale produttore univoco delle revisioni acquistate e stato identificato. Prima fotografie fronte/retro ed etichette, poi inventario PCIe e prova simultanea. La distribuzione Q3/Q3A e progettuale e puo essere scambiata senza alterare i ruoli logici.

Fallback: M2 resta su storage esistente finche i due NVMe non funzionano; M5 rinvia Hailo e limita flussi/CPU; M6 usa direct play e rete integrata se GPU/NIC non convivono. Non inventare biforcazione o banda da lunghezza dello slot. Due DAC da 1 m non sostituiscono automaticamente due AOC da 3 m: misurare percorsi e codifica.

La potenza nominale o AVX2 non sono una prova di stabilita o di consumo. Cooling e PSU vanno riallocati: vecchie proposte i117 su M1 LGA1150 e dissipatori LGA2011 su M5/M6 non sono trasferibili alle nuove piattaforme. [[REV4-ENER]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
