---
codice: "ATL-22"
titolo: "Storage: transizione e destinazioni definitive"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# ATL-22 · Storage: transizione e destinazioni definitive

| Sede / bus | Supporti | Ruolo | Regola |
| --- | --- | --- | --- |
| M1 / SATA | INV-007 Kingston V200 120 GB | Boot Proxmox/OPNsense VM | Secondo disco OPNsense bare metal n.d. |
| M2 / NVMe | INV-009 Sabrent Rocket512 GB | Boot Proxmox | Locale |
| M2 / secondo NVMe | INV-005 Crucial P310 4 TB | Dati e servizi personali; P310 4 TB segnaposto del pool SSD | Singolo disco: copie locali, remote e offline; nessuna ridondanza locale |
| M3 / M.2 PCIe2.0x4 | INV-006 WD PC SN530512 GB | Host e IA | M3 dedicato al calcolo; Windows su MP3 Acer |
| MP3 Aspire 7 | Crucial P3 Plus 1 TB | Windows/Hermes/giochi | Rimane nelportatile, non libero per PC |
| M4 / SATA native | 6 WD10EAVS1 TB, INV-001 | Backup versionati RAIDZ2, circa 4 TB nominali | Solo backup; spazio riservato alle versioni |
| M4 / LSI2308 | 4 ST2000DM0082 TB, INV-087 | Media RAIDZ1, circa 6 TB nominali | Dischi SMR: prestazioni in riscrittura e ricostruzione inferiori ai CMR |
| M5 / SATA | INV-003 Samsung850EVO 250 GB | Boot Proxmox e stato | Sistema e stato persistente |
| M5 / SATA | 2 ST1000LM0241 TB, INV-013 | Mirror Frigate circa 1 TB nominale | 4 camere eventi 7 giorni; risultato dipende dai flussi |
| M6 / SATA | INV-004 Kingston V300 120 GB | Boot Proxmox | Boot; dati DB separati e quote sullo staging SSD |
| M6 / SATA | INV-008 Samsung850EVO 500 GB | Download e staging | Incompleti, seed, quote e margine operativo |
| M6 / SATA | 2 WD10EZRX1 TB, INV-002 | Mirror Seafile e copie audio quotate | 10x50 GB; residuo per versioni/audio/margine; nessun backup aggiuntivo cloud |
| C3 / C4 | Un SSD locale per Dell | ZFS host + VM client + repliche HA | Capacita reale n.d.; singolo SSD senza ridondanza locale |
| S3 / S4 | Storage Wyse 32 GB per esemplare | Linux, radio/testimone e stato | Apacer 8 GB separati, assegnati agli HP esterni |
| M4 / S1 / M7 | Boot n.d. al saldo | Avvio indipendente | Modelli e capacità non censiti; nessuna doppia assegnazione |
| SH3 | INV-086 Intenso250 GB + INV-089 ORICO | Supporto esterno assegnato | Non libera riserva boot |
| Due HP esterni | Apacer M.2 8 GB + USB | LibreELEC/configurazione + contenuti offline | Capacita USB n.d. |
| Microtech ingresso | 64 GB eMMC da modello, n.d. | Sistema e pannello ingresso | SSD opzionale, non acquisto imposto |
| RDX SATA | Tre cartucce HP 2 TB | Selezioni offline: foto/video, documenti, lavoro | Tre selezioni indipendenti con margine per versioni e crescita |
| MP1 / MacBook M5 | SSD interno: n.d. | Utente personale e utente lavoro separati | Dati e credenziali per profilo |

## Stato reale e progetto

Oggi film e serie TV sono anche sui WD Green. La separazione WD backup / Seagate media e destinazione, non stato gia installato. I dati devono essere evacuati e confrontati prima della ricostruzione. Arca contiene il medesimo P310 che passera a M2: non esistono due unita da 4 TB.

I sei WD in RAIDZ2 offrono circa 4 TB nominali, non spazio infinito per versioni di tutti i 4 TB di M2 piu tutti i media. I quattro Seagate ST2000DM008 sono SMR: RAIDZ1 offre circa 6 TB nominali, con tempi di riscrittura e resilver influenzati dalla tecnologia SMR. Un'alternativa a due mirror riduce la capacita a circa 4 TB nominali ma non elimina la natura SMR. Attuazione e risultati delle prove sono raccolti nella roadmap.

Database ed esportazioni applicative richiedono consistenza; una copia del rootfs non comprende automaticamente mount esterni. Snapshot e mirror non sono copie indipendenti. [[REV4-MIG]] · [[REV3-BCK]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
