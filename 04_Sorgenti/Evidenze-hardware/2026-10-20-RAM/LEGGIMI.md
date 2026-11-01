# RAM in arrivo — evidenze del 20 ottobre 2026

Cinque originali archiviati con SHA-256; 23 osservazioni di moduli, 336 GB nominali. Sono foto fornite per materiale in arrivo, non prove di consegna o collaudo. Gli ID -FOTO- identificano un modulo nella fotografia: l’identità fisica viene confermata sul materiale ricevuto.

| Codice | Quantità | Modello / famiglia | Tipo | Velocità nominale | Destinazione |
|---|---:|---|---|---:|---|
| INV-076 | 4×8 GB | HMT41GU7BFR8C-PB (lettura foto, da riscontro all’arrivo) | DDR3 ECC UDIMM | 1600 MT/s | M4 |
| INV-075 | 7×16 GB | M393B2G70DB0-CMA (lettura rappresentativa del lotto) | DDR3 ECC RDIMM | 1866 MT/s | M3/M6; associazione esemplari da fissare |
| INV-101 | 2×16 GB | M393A2G40DB0-CPB (lettura foto a risoluzione limitata) | DDR4 ECC RDIMM | 2133 MT/s | M5 |
| INV-099 | 6×16 GB | KVR16R11D4/16… (suffisso finale da confermare) | DDR3 ECC RDIMM | 1600 MT/s | M3/M6; associazione esemplari da fissare |
| INV-100 | 2×16 GB | M393B2G70QH0-YK0 (famiglia letta, da confronto fra i due esemplari) | DDR3L ECC RDIMM | 1600 MT/s | M2 |
| INV-105 | 1×16 GB | MT36KSF2G72PZ-1G6E1FF | DDR3L ECC RDIMM | 1600 MT/s | M2 |
| INV-106 | 1×16 GB | MT36KSF2G72PZ-1G6E1HF | DDR3L ECC RDIMM | 1600 MT/s | M2 |

## Correzioni e limiti

- INV-105/106 sono nuovi codici prodotto locali rev4; Micron separati da INV-100 Samsung, che passa da quattro a due unità. Registro storico conservato.
- Correzioni rispetto al dichiarato precedente: Samsung PC3 a 1866 MT/s, Kingston PC3 a 1600 MT/s, gruppo DDR3L misto due Samsung e due Micron.
- I dati fotografici non attestano frequenza negoziata, integrità o compatibilità del sistema.
- Suffissi P/N e seriali non leggibili restano aperti. Non sono state ricostruite cifre da barcode illeggibili.

M2 ha quattro moduli DDR3L 1600: due Samsung più due Micron. Capacità di progetto invariata; kit misto da verificare sul sistema. I sei Kingston non sono DDR3-1866, i sette Samsung PC3 non sono DDR3-2133. Per un popolamento misto usare soltanto velocità/tempi comuni realmente supportati e verificarli dal sistema.

## Originali

- [RAM-F01](RAM-F01.avif): Quattro ECC UDIMM Hynix da 8 GB per M4. SHA-256 `560e26fcdc7d827fa2ab0eec736f624b462917f8c82547d9cfc367fadf529138`.
- [RAM-F02](RAM-F02.webp): Lotto misto dieci moduli Samsung/Cisco. SHA-256 `0c9ea3618a484849363cf8d725052494d8011eeda94c2c12567aca5e567a6336`.
- [RAM-F03](RAM-F03.webp): Due Micron DDR3L RDIMM da 16 GB. SHA-256 `72764b74b525e2b1630a1d3581fdf65d2d8cef3ba3eb5f204156ae0fc9dfae02`.
- [RAM-F04](RAM-F04.webp): Sei Kingston DDR3 RDIMM da 16 GB. SHA-256 `0a2745b1f9a5d0b3cf34ed62f813b06c0dcad52d11781bfa7b2bf976228e8db2`.
- [RAM-F05](RAM-F05.webp): Singolo Samsung DDR3L RDIMM con etichetta rivenditore. SHA-256 `031dd46de7c11809448c9349befb33b13a5c7bf323d0425437863289fea2278f`.

## Fonti produttore consultate

- [Samsung DDR3 D-die RDIMM](https://download.semiconductor.samsung.com/resources/data-sheet/DS_DDR3_4Gb_D_die_RDIMM_Rev06-0.pdf): famiglia CMA DDR3-1866.
- [Samsung DDR3L Q-die SPD](https://download.semiconductor.samsung.com/resources/data-sheet/M393B2G70QH0-YH908_YK008-0.pdf): YK0 DDR3-1600, ECC RDIMM, 1.35/1.5 V.
- [Micron MT36KSF2G72PZ-1G6E1](https://www.micron.com/products/obsolete/obsolete-rdimm/part-catalog/part-detail/mt36ksf2g72pz-1g6e1): 16 GB RDIMM 1600 MT/s 1.35 V.
- [Kingston famiglia KVR16R11D4](https://media.kingston.com/pcn/PCN_KVR16R11D4_16I_N.pdf): DDR3-1600 2Rx4 1.5 V; il documento non determina il suffisso delle foto.
- [Samsung DDR4 D-die RDIMM](https://download.semiconductor.samsung.com/resources/data-sheet/DDR4_4Gb_D_die_Registered_DIMM_Rev1_8_Aug_16-0.pdf).
