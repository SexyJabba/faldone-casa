# Registro storico delle condizioni di attuazione

Fotografia documentale antecedente alle ultime conferme. La RAM acquistata e il LGS352C ordinato prevalgono sui vecchi stati. Questo registro non descrive l’assetto di riferimento.

## INF-04.01



# INF-04.01 · Storage: transizione e destinazioni definitive

| Nodo/interfaccia | Supporti | Contenuto | Condizione |
| --- | --- | --- | --- |
| M1 / SATA | INV-007 Kingston V200 120 GB | Boot Proxmox/OPNsense VM | Secondo disco OPNsense bare metal da associare |
| M2 / NVMe | INV-009 Sabrent Rocket512 GB | Boot Proxmox | Locale |
| M2 / secondo NVMe | INV-005 Crucial P310 4 TB, recuperato da Arca | Servizi e dati personali; segnaposto in attesa di pool SSD | Singolo disco; nessuna ridondanza. Solo dopo copie e recupero verificati |
| M3 / M.2 PCIe2.0x4 | INV-006 WD PC SN530512 GB | Host e IA | Altro M.2 non assegnato a Windows; inventario NVMe da ricontare |
| MP3 Aspire 7 | Crucial P3 Plus 1 TB | Windows/Hermes/giochi | Rimane nelportatile, non libero per PC |
| M4 / SATA native | 6 WD10EAVS1 TB, INV-001 | WD oggi anche media; a regime solo backup versionati RAIDZ2 | Ricostruire dopo evacuazione verificata; circa 4 TB nominali, spazio versioni da dimensionare |
| M4 / LSI2308 | 4 ST2000DM0082 TB, INV-087 | Media RAIDZ1, circa 6 TB nominali | ST2000DM008 SMR: collaudo ricostruzione e carico prima adozione; circa 6 TB nominali |
| M5 / SATA | INV-003 Samsung850EVO 250 GB | Boot Proxmox e stato | Recuperabile confermato |
| M5 / SATA | 2 ST1000LM0241 TB, INV-013 | Mirror Frigate circa 1 TB nominale | 4 camere eventi 7 giorni; risultato dipende dai flussi |
| M6 / SATA | INV-004 Kingston V300 120 GB | Boot Proxmox | Boot; dati DB separati e quote sullo staging SSD, dimensionamento prima installazione |
| M6 / SATA | INV-008 Samsung850EVO 500 GB | Download e staging | Incompleti, seed, quote e margine operativo |
| M6 / SATA | 2 WD10EZRX1 TB, INV-002 | Mirror Seafile e copie audio quotate | 10x50 GB; residuo per versioni/audio/margine; nessun backup aggiuntivo cloud |
| C3 / C4 | Un SSD locale per Dell | ZFS host + VM client + repliche HA | Capacita reale da associare; singolo SSD senza ridondanza locale |
| S3 / S4 | Storage Wyse 32 GB dichiarato per esemplare | Linux, radio/testimone e stato | Riconciliare storage effettivo; gli Apacer 8 GB restano sugli HP esterni |
| M4 / S1 / M7 | Boot da associare al saldo | Avvio indipendente | Nessun acquisto prima del riconteggio |
| SH1 / Arca durante transizione | INV-005 P310 4 TB nel box Lexar E750 | Conservare finche i dati unici sono protetti; poi P310 a M2 | Il box resta libero solo dopo il passaggio; non contare due SSD |
| SH3 | INV-086 Intenso250 GB + INV-089 ORICO | Supporto esterno assegnato | Non libera riserva boot |
| MP2 Air M1 | SSD interno256 GB | Scenario Air ancora in sospeso | Non requisito della configurazione 4.3 |
| Due HP esterni | Apacer M.2 8 GB + USB | LibreELEC/configurazione + contenuti offline | Capacita USB da associare |
| Microtech ingresso | 64 GB eMMC da modello, da riscontrare | Sistema e pannello ingresso | SSD opzionale, non acquisto imposto |
| RDX SATA | Tre cartucce HP 2 TB proposte, non comprate | Selezioni offline: foto/video, documenti, lavoro | 50 EUR ciascuna offerta riferita; verificare compatibilita e stato |

## Stato reale e progetto

Oggi film e serie TV sono anche sui WD Green. La separazione WD backup / Seagate media e destinazione, non stato gia installato. I dati devono essere evacuati e confrontati prima della ricostruzione. Arca contiene il medesimo P310 che passera a M2: non esistono due unita da 4 TB.

I sei WD in RAIDZ2 offrono circa 4 TB nominali, non spazio infinito per versioni di tutti i 4 TB di M2 piu tutti i media. I quattro Seagate ST2000DM008 sono SMR: RAIDZ1 da circa 6 TB resta subordinato a prove e accettazione dei tempi di riscrittura/resilver. Un'alternativa a due mirror riduce la capacita a circa 4 TB nominali ma non elimina la natura SMR. Nessun array e dichiarato gia ricostruito.

Database ed esportazioni applicative richiedono consistenza; una copia del rootfs non comprende automaticamente mount esterni. Snapshot e mirror non sono copie indipendenti. [[REV4-MIG]] · [[REV3-BCK]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-04.03



# INF-04.03 · Storage: transizione e destinazioni definitive

| Nodo/interfaccia | Supporti | Contenuto | Condizione |
| --- | --- | --- | --- |
| M1 / SATA | INV-007 Kingston V200 120 GB | Boot Proxmox/OPNsense VM | Secondo disco OPNsense bare metal da associare |
| M2 / NVMe | INV-009 Sabrent Rocket512 GB | Boot Proxmox | Locale |
| M2 / secondo NVMe | INV-005 Crucial P310 4 TB, recuperato da Arca | Servizi e dati personali; segnaposto in attesa di pool SSD | Singolo disco; nessuna ridondanza. Solo dopo copie e recupero verificati |
| M3 / M.2 PCIe2.0x4 | INV-006 WD PC SN530512 GB | Host e IA | Altro M.2 non assegnato a Windows; inventario NVMe da ricontare |
| MP3 Aspire 7 | Crucial P3 Plus 1 TB | Windows/Hermes/giochi | Rimane nelportatile, non libero per PC |
| M4 / SATA native | 6 WD10EAVS1 TB, INV-001 | WD oggi anche media; a regime solo backup versionati RAIDZ2 | Ricostruire dopo evacuazione verificata; circa 4 TB nominali, spazio versioni da dimensionare |
| M4 / LSI2308 | 4 ST2000DM0082 TB, INV-087 | Media RAIDZ1, circa 6 TB nominali | ST2000DM008 SMR: collaudo ricostruzione e carico prima adozione; circa 6 TB nominali |
| M5 / SATA | INV-003 Samsung850EVO 250 GB | Boot Proxmox e stato | Recuperabile confermato |
| M5 / SATA | 2 ST1000LM0241 TB, INV-013 | Mirror Frigate circa 1 TB nominale | 4 camere eventi 7 giorni; risultato dipende dai flussi |
| M6 / SATA | INV-004 Kingston V300 120 GB | Boot Proxmox | Boot; dati DB separati e quote sullo staging SSD, dimensionamento prima installazione |
| M6 / SATA | INV-008 Samsung850EVO 500 GB | Download e staging | Incompleti, seed, quote e margine operativo |
| M6 / SATA | 2 WD10EZRX1 TB, INV-002 | Mirror Seafile e copie audio quotate | 10x50 GB; residuo per versioni/audio/margine; nessun backup aggiuntivo cloud |
| C3 / C4 | Un SSD locale per Dell | ZFS host + VM client + repliche HA | Capacita reale da associare; singolo SSD senza ridondanza locale |
| S3 / S4 | Storage Wyse 32 GB dichiarato per esemplare | Linux, radio/testimone e stato | Riconciliare storage effettivo; gli Apacer 8 GB restano sugli HP esterni |
| M4 / S1 / M7 | Boot da associare al saldo | Avvio indipendente | Nessun acquisto prima del riconteggio |
| SH1 / Arca durante transizione | INV-005 P310 4 TB nel box Lexar E750 | Conservare finche i dati unici sono protetti; poi P310 a M2 | Il box resta libero solo dopo il passaggio; non contare due SSD |
| SH3 | INV-086 Intenso250 GB + INV-089 ORICO | Supporto esterno assegnato | Non libera riserva boot |
| MP2 Air M1 | SSD interno256 GB | Scenario Air ancora in sospeso | Non requisito della configurazione 4.3 |
| Due HP esterni | Apacer M.2 8 GB + USB | LibreELEC/configurazione + contenuti offline | Capacita USB da associare |
| Microtech ingresso | 64 GB eMMC da modello, da riscontrare | Sistema e pannello ingresso | SSD opzionale, non acquisto imposto |
| RDX SATA | Tre cartucce HP 2 TB proposte, non comprate | Selezioni offline: foto/video, documenti, lavoro | 50 EUR ciascuna offerta riferita; verificare compatibilita e stato |

## Stato reale e progetto

Oggi film e serie TV sono anche sui WD Green. La separazione WD backup / Seagate media e destinazione, non stato gia installato. I dati devono essere evacuati e confrontati prima della ricostruzione. Arca contiene il medesimo P310 che passera a M2: non esistono due unita da 4 TB.

I sei WD in RAIDZ2 offrono circa 4 TB nominali, non spazio infinito per versioni di tutti i 4 TB di M2 piu tutti i media. I quattro Seagate ST2000DM008 sono SMR: RAIDZ1 da circa 6 TB resta subordinato a prove e accettazione dei tempi di riscrittura/resilver. Un'alternativa a due mirror riduce la capacita a circa 4 TB nominali ma non elimina la natura SMR. Nessun array e dichiarato gia ricostruito.

Database ed esportazioni applicative richiedono consistenza; una copia del rootfs non comprende automaticamente mount esterni. Snapshot e mirror non sono copie indipendenti. [[REV4-MIG]] · [[REV3-BCK]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-04.06



# INF-04.06 · Storage: transizione e destinazioni definitive

| Nodo/interfaccia | Supporti | Contenuto | Condizione |
| --- | --- | --- | --- |
| M1 / SATA | INV-007 Kingston V200 120 GB | Boot Proxmox/OPNsense VM | Secondo disco OPNsense bare metal da associare |
| M2 / NVMe | INV-009 Sabrent Rocket512 GB | Boot Proxmox | Locale |
| M2 / secondo NVMe | INV-005 Crucial P310 4 TB, recuperato da Arca | Servizi e dati personali; segnaposto in attesa di pool SSD | Singolo disco; nessuna ridondanza. Solo dopo copie e recupero verificati |
| M3 / M.2 PCIe2.0x4 | INV-006 WD PC SN530512 GB | Host e IA | Altro M.2 non assegnato a Windows; inventario NVMe da ricontare |
| MP3 Aspire 7 | Crucial P3 Plus 1 TB | Windows/Hermes/giochi | Rimane nelportatile, non libero per PC |
| M4 / SATA native | 6 WD10EAVS1 TB, INV-001 | WD oggi anche media; a regime solo backup versionati RAIDZ2 | Ricostruire dopo evacuazione verificata; circa 4 TB nominali, spazio versioni da dimensionare |
| M4 / LSI2308 | 4 ST2000DM0082 TB, INV-087 | Media RAIDZ1, circa 6 TB nominali | ST2000DM008 SMR: collaudo ricostruzione e carico prima adozione; circa 6 TB nominali |
| M5 / SATA | INV-003 Samsung850EVO 250 GB | Boot Proxmox e stato | Recuperabile confermato |
| M5 / SATA | 2 ST1000LM0241 TB, INV-013 | Mirror Frigate circa 1 TB nominale | 4 camere eventi 7 giorni; risultato dipende dai flussi |
| M6 / SATA | INV-004 Kingston V300 120 GB | Boot Proxmox | Boot; dati DB separati e quote sullo staging SSD, dimensionamento prima installazione |
| M6 / SATA | INV-008 Samsung850EVO 500 GB | Download e staging | Incompleti, seed, quote e margine operativo |
| M6 / SATA | 2 WD10EZRX1 TB, INV-002 | Mirror Seafile e copie audio quotate | 10x50 GB; residuo per versioni/audio/margine; nessun backup aggiuntivo cloud |
| C3 / C4 | Un SSD locale per Dell | ZFS host + VM client + repliche HA | Capacita reale da associare; singolo SSD senza ridondanza locale |
| S3 / S4 | Storage Wyse 32 GB dichiarato per esemplare | Linux, radio/testimone e stato | Riconciliare storage effettivo; gli Apacer 8 GB restano sugli HP esterni |
| M4 / S1 / M7 | Boot da associare al saldo | Avvio indipendente | Nessun acquisto prima del riconteggio |
| SH1 / Arca durante transizione | INV-005 P310 4 TB nel box Lexar E750 | Conservare finche i dati unici sono protetti; poi P310 a M2 | Il box resta libero solo dopo il passaggio; non contare due SSD |
| SH3 | INV-086 Intenso250 GB + INV-089 ORICO | Supporto esterno assegnato | Non libera riserva boot |
| MP2 Air M1 | SSD interno256 GB | Scenario Air ancora in sospeso | Non requisito della configurazione 4.3 |
| Due HP esterni | Apacer M.2 8 GB + USB | LibreELEC/configurazione + contenuti offline | Capacita USB da associare |
| Microtech ingresso | 64 GB eMMC da modello, da riscontrare | Sistema e pannello ingresso | SSD opzionale, non acquisto imposto |
| RDX SATA | Tre cartucce HP 2 TB proposte, non comprate | Selezioni offline: foto/video, documenti, lavoro | 50 EUR ciascuna offerta riferita; verificare compatibilita e stato |

## Stato reale e progetto

Oggi film e serie TV sono anche sui WD Green. La separazione WD backup / Seagate media e destinazione, non stato gia installato. I dati devono essere evacuati e confrontati prima della ricostruzione. Arca contiene il medesimo P310 che passera a M2: non esistono due unita da 4 TB.

I sei WD in RAIDZ2 offrono circa 4 TB nominali, non spazio infinito per versioni di tutti i 4 TB di M2 piu tutti i media. I quattro Seagate ST2000DM008 sono SMR: RAIDZ1 da circa 6 TB resta subordinato a prove e accettazione dei tempi di riscrittura/resilver. Un'alternativa a due mirror riduce la capacita a circa 4 TB nominali ma non elimina la natura SMR. Nessun array e dichiarato gia ricostruito.

Database ed esportazioni applicative richiedono consistenza; una copia del rootfs non comprende automaticamente mount esterni. Snapshot e mirror non sono copie indipendenti. [[REV4-MIG]] · [[REV3-BCK]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-04.02



# INF-04.02 · Storage: transizione e destinazioni definitive

| Nodo/interfaccia | Supporti | Contenuto | Condizione |
| --- | --- | --- | --- |
| M1 / SATA | INV-007 Kingston V200 120 GB | Boot Proxmox/OPNsense VM | Secondo disco OPNsense bare metal da associare |
| M2 / NVMe | INV-009 Sabrent Rocket512 GB | Boot Proxmox | Locale |
| M2 / secondo NVMe | INV-005 Crucial P310 4 TB, recuperato da Arca | Servizi e dati personali; segnaposto in attesa di pool SSD | Singolo disco; nessuna ridondanza. Solo dopo copie e recupero verificati |
| M3 / M.2 PCIe2.0x4 | INV-006 WD PC SN530512 GB | Host e IA | Altro M.2 non assegnato a Windows; inventario NVMe da ricontare |
| MP3 Aspire 7 | Crucial P3 Plus 1 TB | Windows/Hermes/giochi | Rimane nelportatile, non libero per PC |
| M4 / SATA native | 6 WD10EAVS1 TB, INV-001 | WD oggi anche media; a regime solo backup versionati RAIDZ2 | Ricostruire dopo evacuazione verificata; circa 4 TB nominali, spazio versioni da dimensionare |
| M4 / LSI2308 | 4 ST2000DM0082 TB, INV-087 | Media RAIDZ1, circa 6 TB nominali | ST2000DM008 SMR: collaudo ricostruzione e carico prima adozione; circa 6 TB nominali |
| M5 / SATA | INV-003 Samsung850EVO 250 GB | Boot Proxmox e stato | Recuperabile confermato |
| M5 / SATA | 2 ST1000LM0241 TB, INV-013 | Mirror Frigate circa 1 TB nominale | 4 camere eventi 7 giorni; risultato dipende dai flussi |
| M6 / SATA | INV-004 Kingston V300 120 GB | Boot Proxmox | Boot; dati DB separati e quote sullo staging SSD, dimensionamento prima installazione |
| M6 / SATA | INV-008 Samsung850EVO 500 GB | Download e staging | Incompleti, seed, quote e margine operativo |
| M6 / SATA | 2 WD10EZRX1 TB, INV-002 | Mirror Seafile e copie audio quotate | 10x50 GB; residuo per versioni/audio/margine; nessun backup aggiuntivo cloud |
| C3 / C4 | Un SSD locale per Dell | ZFS host + VM client + repliche HA | Capacita reale da associare; singolo SSD senza ridondanza locale |
| S3 / S4 | Storage Wyse 32 GB dichiarato per esemplare | Linux, radio/testimone e stato | Riconciliare storage effettivo; gli Apacer 8 GB restano sugli HP esterni |
| M4 / S1 / M7 | Boot da associare al saldo | Avvio indipendente | Nessun acquisto prima del riconteggio |
| SH1 / Arca durante transizione | INV-005 P310 4 TB nel box Lexar E750 | Conservare finche i dati unici sono protetti; poi P310 a M2 | Il box resta libero solo dopo il passaggio; non contare due SSD |
| SH3 | INV-086 Intenso250 GB + INV-089 ORICO | Supporto esterno assegnato | Non libera riserva boot |
| MP2 Air M1 | SSD interno256 GB | Scenario Air ancora in sospeso | Non requisito della configurazione 4.3 |
| Due HP esterni | Apacer M.2 8 GB + USB | LibreELEC/configurazione + contenuti offline | Capacita USB da associare |
| Microtech ingresso | 64 GB eMMC da modello, da riscontrare | Sistema e pannello ingresso | SSD opzionale, non acquisto imposto |
| RDX SATA | Tre cartucce HP 2 TB proposte, non comprate | Selezioni offline: foto/video, documenti, lavoro | 50 EUR ciascuna offerta riferita; verificare compatibilita e stato |

## Stato reale e progetto

Oggi film e serie TV sono anche sui WD Green. La separazione WD backup / Seagate media e destinazione, non stato gia installato. I dati devono essere evacuati e confrontati prima della ricostruzione. Arca contiene il medesimo P310 che passera a M2: non esistono due unita da 4 TB.

I sei WD in RAIDZ2 offrono circa 4 TB nominali, non spazio infinito per versioni di tutti i 4 TB di M2 piu tutti i media. I quattro Seagate ST2000DM008 sono SMR: RAIDZ1 da circa 6 TB resta subordinato a prove e accettazione dei tempi di riscrittura/resilver. Un'alternativa a due mirror riduce la capacita a circa 4 TB nominali ma non elimina la natura SMR. Nessun array e dichiarato gia ricostruito.

Database ed esportazioni applicative richiedono consistenza; una copia del rootfs non comprende automaticamente mount esterni. Snapshot e mirror non sono copie indipendenti. [[REV4-MIG]] · [[REV3-BCK]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-03.10



# INF-03.10 · Architettura e apparati della revisione 4.4

La 4.4 e una configurazione di progetto, non un verbale di installazione. Acquisti e riscontri sono distinti in [[REV3-STATO]]. Le tre D1581 sono in arrivo; la RAM Vinted e ancora in trattativa.

Il nucleo stabile proposto comprende M1, M2, M5, C3 e C4: cinque voti, quorum tre. M3, M4 e M6 sono host Proxmox autonomi accesi secondo necessita. S4 osserva e invia WoL senza voto. Il Vito e un nodo mobile indipendente, non un membro del cluster.

| Apparato | Piattaforma | Memoria e storage | Responsabilita | Identita |
| --- | --- | --- | --- | --- |
| M1 | MACHINIST X99 PR9-H / Xeon E5-2630L v3 dichiarato, SKU da identificare | 32 GB DDR4 ECC RDIMM, 2 x 16, disponibili | Proxmox: OPNsense VM e osservabilita separata; nucleo sempre acceso | INV-101 RAM / nuova scheda da associare |
| M2 | D1581-Q3A / Xeon D-1581, assegnazione di progetto | 64 GB PC3L RDIMM, 4 x 16 gia posseduti | Proxmox: app personali; P310 4 TB provvisorio dopo liberazione Arca; nucleo sempre acceso | INV-100 / 005 / 009 / Q3A nuova |
| M3 | HUANANZHI X99-T8 / E5-2678 v3 | 128 GB, 8 x 16 DDR3 RDIMM | Proxmox autonomo IA su richiesta; RTX 3060 12 GB; nessun voto nel nucleo | INV-030 / 048 / 077 |
| M4 | ASUS P9D-MH/SAS/10G-DUAL / E3-1265L v3 | 32 GB, 4 x 8 ECC UDIMM | Proxmox autonomo/ZFS: WD solo backup dopo transizione; media separati, acceso per richiesta/job | INV-073 / 047 / 076 |
| M5 | D1581-Q3 / Xeon D-1581, assegnazione condizionata al bus Hailo | 32 GB PC3L RDIMM, 2 x 16 dal lotto ancora in trattativa | Proxmox: HAOS, MQTT, Frigate/Hailo; nucleo sempre acceso | INV-074 / lotto RAM nuovo / INV-098 candidato |
| M6 | D1581-Q3A / Xeon D-1581, assegnazione condizionata a GPU e NIC | 64 GB PC3L RDIMM, 4 x 16 dal lotto ancora in trattativa | Proxmox autonomo: media, Seafile, download; acceso a richiesta | Q3A nuova / Arc candidata / INV-097 |
| M7 | ASUS H61M-K / E3-1220L v2 | 16 GB, 2 x 8 DDR3 | Riserva manuale H61M-K; T110 II acquistato candidato sostitutivo, da qualificare | INV-033 / 046 / 039 |
| S1 | ASRock Q1900M / Celeron J1900 | 8 GB, 2 x 4 Hynix PC3-10600U | Linux: Caddy, Vaultwarden, notifiche e utilita; fuori cluster | INV-034 / 049 / 041, esemplari da associare |
| S2 | Oracle Cloud Always Free, candidata A1 | Proposta: 1 OCPU / 4 GB / boot 50 GB | Osservazione esterna e relay; attivazione successiva; niente voto | Piano Oracle; nessun account/VM attivato qui |
| S3 | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Linux: Sonoff ZBDongle-P, Zigbee2MQTT e dashboard leggera; fuori cluster | Prodotto/seriale da associare, Wyse radio |
| S4 | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Sentinella indipendente e primo mittente WoL; nessun voto nella base 4.4 | Wyse sentinella, codice esemplare da associare |
| C1 | Dell OptiPlex 7070 Ultra / i5-8265U | 8 GB censiti, nessun LLM locale | Vito W639: nodo mobile lavoro/camper autonomo; offline, LTE e recupero; fuori quorum | INV-079, esemplare C1 |
| C2 | Dell OptiPlex 7070 Ultra / i5-8265U | 8 GB censiti, espansione solo se necessaria | Cucina: client Linux, streaming/Moonlight e pannello casa | INV-079, esemplare C2 |
| C3 | Dell OptiPlex 7070 Ultra / i5-8265U | 16 GB base HA, riscontro risorse | Proxmox client Linux e subentro HAOS/MQTT, senza Hermes | INV-079, esemplare C3 |
| C4 | Dell OptiPlex 7070 Ultra / i5-8265U | 16 GB base HA, riscontro risorse | Proxmox nucleo: client Linux, riserva app selezionate, secondo mittente WoL | INV-079, esemplare C4 |
| MP3 | Acer Aspire 7 A715-42G-R2VB / Ryzen 7 5700U / RTX3050 Ti 4 GB | 16 GB / Crucial P3 Plus1 TB | Acer sempre fisso in laboratorio: Windows lavoro/gioco, Sunshine; OpenClaw di lavoro e Hermes da predisporre | MP3, codice INV da associare; dotazione dichiarata utente |
| MP2 | Apple MacBook Air M1 | 8 GB / SSD256 GB | Scambio ancora in sospeso: opzione MacBook Air, non postazione necessaria della 4.3 | INV-096, esemplare MP2 |
| MP4 | ASUS X99-DELUXE / i7-5930K / RTX2080 | 32 GB DDR4 | PC primo fratello, esterno all’infrastruttura | INV-029/043/035/055 |
| MP5 | ASRock X79 Extreme3 / i7-3820 | DDR3UDIMM, taglio e altri pezzi da associare | Ipotesi PC secondo fratello subordinata allo scambio Air ancora in sospeso; kit X79 da testare | INV-031/044; nessun componente server sottratto |
| Wyse laboratorio | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Jellyfin, musica e pannello Home Assistant; affianca Acer | Codice C e INV da associare |
| Wyse studio | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Monitor e client audio verso Behringer CONTROL2USB | Codice C e INV da associare |
| Wyse Hi-Fi salone | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Client Hi-Fi verso DAC ES9038Q2M USB | Codice C e INV da associare |
| HP amico 1 | HP t520 | 4 GB / Apacer M.2 8 GB | Client esterno Ethernet: LibreELEC, Jellyfin e offline USB | INV-078, codice CE e seriale da associare |
| HP amico 2 | HP t520 | 4 GB / Apacer M.2 8 GB | Client esterno Ethernet: LibreELEC, Jellyfin e offline USB | INV-078, codice CE e seriale da associare |
| Microtech ingresso | Microtech EBL14B | Dotazione da riscontrare; modello 4 GB/64 GB eMMC | Pannello citofono/allarme, display e batteria integrati; fuori cluster | Codice MP/INV e seriale da associare |
| T110 II | Dell PowerEdge T110 II / E3-1220 v2 | 8 GB dichiarati | Riserva candidata per M7 e disponibilita unita RDX SATA | Prodotto/seriale da associare; lotto acquistato 150 EUR |
| Kindle recuperato | Kindle 11a generazione USB-C | Modello base/Paperwhite da associare | Biblioteca tecnica e plancia compatta; dispositivo personale | Codice MD/INV da associare |

Le assegnazioni Q3/Q3A si chiudono dopo il controllo dei bus: M2 richiede due NVMe simultanei e Mellanox; M5 un percorso Hailo con boot SATA; M6 GPU e NIC simultanee. Prima di comprare adattatori si verificano schede ricevute e revisione. [[REV4-PCIE]] · [[REV4-RAM]] · [[REV4-VITO]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-03.05



# INF-03.05 · M6: media, servizi esterni e margine di calcolo

M6 usa la seconda D1581-Q3A, con 64 GB PC3L dal lotto Vinted ancora in trattativa. La Z9PA-U8 esce dalla lista acquisti; il vecchio E5-2630L v2 non viene conteggiato come CPU della nuova scheda. M6 e Proxmox autonomo, fuori dai voti del nucleo stabile, acceso su richiesta o durante download e lavoro autorizzato.

Arc A310 rimane candidata, non acquistata. Prima verificare GPU e MNPA19-XTR simultanee: slot, linee, ingombri, BIOS e driver. Se manca questa possibilita, avvio con rete integrata e direct play/media preparati; non comprare un adattatore presumendo biforcazione. L'assenza di ReBAR non prova da sola che ogni transcodifica sia impossibile: si collauda il percorso reale.

Separare cloud Seafile, Jellyfin/audio e download/arr in ambienti con account, mount e limiti distinti. Preferire LXC non privilegiati dove supportati; non promettere isolamento da VM per container che condividono kernel. Nessun downloader nella rete fidata generale.

V300 120 GB per boot; EVO 500 GB per staging e spazio SSD quotato di DB; due WD10EZRX da 1 TB in mirror per Seafile e audio locale. Dieci utenti per 50 GB significa 500 GB, con margine separato per versioni/audio. Seafile esterno mantiene la scelta gia esplicita: niente backup aggiuntivo automatico dei contenuti su M4 o Drive. Il caricamento totale della transizione va riconciliato per eventuali dati di terzi prima di includerli.

La RAM aggiuntiva puo sostenere servizi e cache del pool locale. I film archiviati su M4 non beneficiano automaticamente dell'ARC di M6. Temporanei di transcodifica in RAM solo con quote e dati ricreabili. Avviare M4 quando il file richiesto e remoto, attendere readiness e non spegnerlo durante una visione. Nessun timer M6 imposto senza osservazione. [[REV4-RAM]] · [[REV4-MON]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-03.21



# INF-03.21 · Download e arr isolati su M6

M6 usa la seconda D1581-Q3A, con 64 GB PC3L dal lotto Vinted ancora in trattativa. La Z9PA-U8 esce dalla lista acquisti; il vecchio E5-2630L v2 non viene conteggiato come CPU della nuova scheda. M6 e Proxmox autonomo, fuori dai voti del nucleo stabile, acceso su richiesta o durante download e lavoro autorizzato. Vedere [[INF-03.46]].

Il mount M4 assente sospende gli import; non scrivere nella directorylocale rimasta vuota al posto del mount. Accountarrscrittura distinto da Jellyfin RO e da Seafile. Le analisi/scansioni sono limitate e nessun automatismo extraarr viene aggiunto. Se M4 spento download/seedinglocali possono continuare finche c’e spazio.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-MAP]] · [[REV3-OPEN]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-03.08



# INF-03.08 · M5: domotica e visione locale

M5 usa la D1581-Q3 in arrivo, se il bus permette Hailo M-key con avvio SATA. La BKHD e esclusa: ordine annullato, non in consegna. Memoria obiettivo 32 GB PC3L RDIMM, due moduli del lotto Vinted ancora da acquistare. La DDR4 precedentemente destinata a M5 va a M1.

Proxmox nel nucleo stabile ospita HAOS, broker MQTT separato e ambiente Frigate/go2rtc/vision-gateway. Samsung 850 EVO 250 GB per boot/stato; due ST1000LM024 da 1 TB in mirror per registrazioni, circa 1 TB nominale. Quattro camere iniziali e sette giorni di eventi sono obiettivi da misurare; sei camere sono espansione. Hailo e camere restano da acquistare.

Hailo esegue inferenza compatibile, non decodifica video e non esegue LLM generici. Substream H.264 leggeri e decodifica CPU sono la base da collaudare. Frigate ha priorita; nessun doppio passthrough esclusivo a due VM. Condividere runtime solo se supportato dalla versione effettiva.

Sonoff/Zigbee2MQTT resta su S3. Reti IoT e AP non attraversano fisicamente M5 come unico ponte. La Q3 non eredita le sei porte della BKHD: interfacce e percorso avvisi via router 5G vanno mappati e isolati.

C3 e riserva per HAOS e MQTT dopo test di replica completa, fencing e capacita. Frigate, Hailo e registrazioni non diventano HA. Un guasto non richiede di trasferire la radio USB da S3. [[REV3-HA]] · [[REV4-PCIE]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-03.29



# INF-03.29 · M5: domotica e visione locale

M5 usa la D1581-Q3 in arrivo, se il bus permette Hailo M-key con avvio SATA. La BKHD e esclusa: ordine annullato, non in consegna. Memoria obiettivo 32 GB PC3L RDIMM, due moduli del lotto Vinted ancora da acquistare. La DDR4 precedentemente destinata a M5 va a M1.

Proxmox nel nucleo stabile ospita HAOS, broker MQTT separato e ambiente Frigate/go2rtc/vision-gateway. Samsung 850 EVO 250 GB per boot/stato; due ST1000LM024 da 1 TB in mirror per registrazioni, circa 1 TB nominale. Quattro camere iniziali e sette giorni di eventi sono obiettivi da misurare; sei camere sono espansione. Hailo e camere restano da acquistare.

Hailo esegue inferenza compatibile, non decodifica video e non esegue LLM generici. Substream H.264 leggeri e decodifica CPU sono la base da collaudare. Frigate ha priorita; nessun doppio passthrough esclusivo a due VM. Condividere runtime solo se supportato dalla versione effettiva.

Sonoff/Zigbee2MQTT resta su S3. Reti IoT e AP non attraversano fisicamente M5 come unico ponte. La Q3 non eredita le sei porte della BKHD: interfacce e percorso avvisi via router 5G vanno mappati e isolati.

C3 e riserva per HAOS e MQTT dopo test di replica completa, fencing e capacita. Frigate, Hailo e registrazioni non diventano HA. Un guasto non richiede di trasferire la radio USB da S3. [[REV3-HA]] · [[REV4-PCIE]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-03.48



# INF-03.48 · M5: domotica e visione locale

M5 usa la D1581-Q3 in arrivo, se il bus permette Hailo M-key con avvio SATA. La BKHD e esclusa: ordine annullato, non in consegna. Memoria obiettivo 32 GB PC3L RDIMM, due moduli del lotto Vinted ancora da acquistare. La DDR4 precedentemente destinata a M5 va a M1.

Proxmox nel nucleo stabile ospita HAOS, broker MQTT separato e ambiente Frigate/go2rtc/vision-gateway. Samsung 850 EVO 250 GB per boot/stato; due ST1000LM024 da 1 TB in mirror per registrazioni, circa 1 TB nominale. Quattro camere iniziali e sette giorni di eventi sono obiettivi da misurare; sei camere sono espansione. Hailo e camere restano da acquistare.

Hailo esegue inferenza compatibile, non decodifica video e non esegue LLM generici. Substream H.264 leggeri e decodifica CPU sono la base da collaudare. Frigate ha priorita; nessun doppio passthrough esclusivo a due VM. Condividere runtime solo se supportato dalla versione effettiva.

Sonoff/Zigbee2MQTT resta su S3. Reti IoT e AP non attraversano fisicamente M5 come unico ponte. La Q3 non eredita le sei porte della BKHD: interfacce e percorso avvisi via router 5G vanno mappati e isolati.

C3 e riserva per HAOS e MQTT dopo test di replica completa, fencing e capacita. Frigate, Hailo e registrazioni non diventano HA. Un guasto non richiede di trasferire la radio USB da S3. [[REV3-HA]] · [[REV4-PCIE]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-03.19



# INF-03.19 · M6: media, servizi esterni e margine di calcolo

M6 usa la seconda D1581-Q3A, con 64 GB PC3L dal lotto Vinted ancora in trattativa. La Z9PA-U8 esce dalla lista acquisti; il vecchio E5-2630L v2 non viene conteggiato come CPU della nuova scheda. M6 e Proxmox autonomo, fuori dai voti del nucleo stabile, acceso su richiesta o durante download e lavoro autorizzato.

Arc A310 rimane candidata, non acquistata. Prima verificare GPU e MNPA19-XTR simultanee: slot, linee, ingombri, BIOS e driver. Se manca questa possibilita, avvio con rete integrata e direct play/media preparati; non comprare un adattatore presumendo biforcazione. L'assenza di ReBAR non prova da sola che ogni transcodifica sia impossibile: si collauda il percorso reale.

Separare cloud Seafile, Jellyfin/audio e download/arr in ambienti con account, mount e limiti distinti. Preferire LXC non privilegiati dove supportati; non promettere isolamento da VM per container che condividono kernel. Nessun downloader nella rete fidata generale.

V300 120 GB per boot; EVO 500 GB per staging e spazio SSD quotato di DB; due WD10EZRX da 1 TB in mirror per Seafile e audio locale. Dieci utenti per 50 GB significa 500 GB, con margine separato per versioni/audio. Seafile esterno mantiene la scelta gia esplicita: niente backup aggiuntivo automatico dei contenuti su M4 o Drive. Il caricamento totale della transizione va riconciliato per eventuali dati di terzi prima di includerli.

La RAM aggiuntiva puo sostenere servizi e cache del pool locale. I film archiviati su M4 non beneficiano automaticamente dell'ARC di M6. Temporanei di transcodifica in RAM solo con quote e dati ricreabili. Avviare M4 quando il file richiesto e remoto, attendere readiness e non spegnerlo durante una visione. Nessun timer M6 imposto senza osservazione. [[REV4-RAM]] · [[REV4-MON]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-03.26



# INF-03.26 · M3: inferenza dedicata e calcolo a richiesta

M3 conserva X99-T8 / E5-2678 v3,128 GB DDR3 RDIMM e Proxmox, dedicati all’IA. GPU MSI RTX3060 Ventus 2X 12 GB; WD PC SN530512 GB nello slot M.2PCIe2.0 per host e IA. Windows e Hermes sono su MP3 Aspire; RTX2080 segue MP4, PC del primo fratello. L’altro M.2 non e riservato alla vecchia VM Windows; il saldo Samsung NVMe e ancora da associare. A380 o RTX30506 GB sono espansioni integrative non acquistate.

Priorita: richieste personali interattive, poi agenti, infine fondo. La priorita si applica attraverso un arbitraggio comune ai lavori in attesa; non promette interruzione immediata della generazione in corso o concorrenza nella VRAM. Modelli, contesto e motore si scelgono sull’hardware. L’Hailo e un detector su M5, non un acceleratore LLM di M3.

Se M3 e spento l’utente sceglie «accendi adesso» con conferma oppure «metti in coda» fino a un’altra accensione e all’endpoint pronto. Il recupero quorum ha una politica distinta. Dopo30 min senza lavori IA attivi o autorizzati in attesa, arresto ordinato solo se nessun servizio/operazione richiede il nodo e il quorum residuo e garantito. Un modello caricato ma inattivo non e un lavoro attivo. Cloud solo su richiesta/conferma, nessun job periodico e nessuna API a consumo.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-MAP]] · [[REV3-OPEN]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-03.47



# INF-03.47 · Vision-gateway su M5

Hermes su MP3 e OpenClaw su MP2 ricevono allegati in quarantena. File, immagini e testo esterno sono dati da analizzare, non istruzioni operative. Identita personale e lavoro restano separate. Le richieste autorizzate passano alle API interne del vision-gateway su M5; nessun accesso generale agli archivi viene assegnato al ponte.

Su M5 risiedono Frigate, Hailo-8 e gateway. Frigate ha priorita; il gateway espone solo modelli e task effettivamente disponibili, con coda limitata, quote e stato job. Detection/classificazione o OCR preliminare richiedono modelli HEF e runtime compatibili: Hailo non rende automaticamente disponibile ogni funzione. Dove esiste una funzione equivalente, il gateway puo usare CPU; altrimenti rinvia o restituisce indisponibilita. Home Assistant conserva il proprio ambiente separato e le automazioni essenziali non richiedono il VLM.

M3 dedica128 GB totali host/IA e RTX3060 alragionamento. Windows/2080 e fuori nodo. Inferenza su conferma / coda, cloud solo esplicito; nessun hardware LLM aggiunto algateway M5.

La pipeline conserva dati letti, inferenze, incertezza e provenienza distinti. Una proposta strutturata richiede conferma esplicita prima di una modifica a Paperless, Immich, Nextcloud o altri sistemi. Originali conservati, retry idempotenti, destinazione e singola azione riconoscibili. Le versioni di driver, runtime, modelli e misure sono nel registro; nessun benchmark e inventato.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-MAP]] · [[REV3-OPEN]]


## Sedi e disponibilita 4.4

M3 conserva X99-T8 / E5-2678 v3,128 GB DDR3 RDIMM e Proxmox, dedicati all’IA. GPU MSI RTX3060 Ventus 2X 12 GB; WD PC SN530512 GB nello slot M.2PCIe2.0 per host e IA. Windows e Hermes sono su MP3 Aspire; RTX2080 segue MP4, PC del primo fratello. L’altro M.2 non e riservato alla vecchia VM Windows; il saldo Samsung NVMe e ancora da associare. A380 o RTX30506 GB sono espansioni integrative non acquistate.

Priorita: richieste personali interattive, poi agenti, infine fondo. La priorita si applica attraverso un arbitraggio comune ai lavori in attesa; non promette interruzione immediata della generazione in corso o concorrenza nella VRAM. Modelli, contesto e motore si scelgono sull’hardware. L’Hailo e un detector su M5, non un acceleratore LLM di M3.

Se M3 e spento l’utente sceglie «accendi adesso» con conferma oppure «metti in coda» fino a un’altra accensione e all’endpoint pronto. Il recupero quorum ha una politica distinta. Dopo30 min senza lavori IA attivi o autorizzati in attesa, arresto ordinato solo se nessun servizio/operazione richiede il nodo e il quorum residuo e garantito. Un modello caricato ma inattivo non e un lavoro attivo. Cloud solo su richiesta/conferma, nessun job periodico e nessuna API a consumo.

M5 usa la D1581-Q3 in arrivo, se il bus permette Hailo M-key con avvio SATA. La BKHD e esclusa: ordine annullato, non in consegna. Memoria obiettivo 32 GB PC3L RDIMM, due moduli del lotto Vinted ancora da acquistare. La DDR4 precedentemente destinata a M5 va a M1. Vedere [[INF-03.08]].

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-03.22



# INF-03.22 · Download e arr isolati su M6

M6 usa la seconda D1581-Q3A, con 64 GB PC3L dal lotto Vinted ancora in trattativa. La Z9PA-U8 esce dalla lista acquisti; il vecchio E5-2630L v2 non viene conteggiato come CPU della nuova scheda. M6 e Proxmox autonomo, fuori dai voti del nucleo stabile, acceso su richiesta o durante download e lavoro autorizzato. Vedere [[INF-03.46]].

Il mount M4 assente sospende gli import; non scrivere nella directorylocale rimasta vuota al posto del mount. Accountarrscrittura distinto da Jellyfin RO e da Seafile. Le analisi/scansioni sono limitate e nessun automatismo extraarr viene aggiunto. Se M4 spento download/seedinglocali possono continuare finche c’e spazio.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-MAP]] · [[REV3-OPEN]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-03.07



# INF-03.07 · M3: inferenza dedicata e calcolo a richiesta

M3 conserva X99-T8 / E5-2678 v3,128 GB DDR3 RDIMM e Proxmox, dedicati all’IA. GPU MSI RTX3060 Ventus 2X 12 GB; WD PC SN530512 GB nello slot M.2PCIe2.0 per host e IA. Windows e Hermes sono su MP3 Aspire; RTX2080 segue MP4, PC del primo fratello. L’altro M.2 non e riservato alla vecchia VM Windows; il saldo Samsung NVMe e ancora da associare. A380 o RTX30506 GB sono espansioni integrative non acquistate.

Priorita: richieste personali interattive, poi agenti, infine fondo. La priorita si applica attraverso un arbitraggio comune ai lavori in attesa; non promette interruzione immediata della generazione in corso o concorrenza nella VRAM. Modelli, contesto e motore si scelgono sull’hardware. L’Hailo e un detector su M5, non un acceleratore LLM di M3.

Se M3 e spento l’utente sceglie «accendi adesso» con conferma oppure «metti in coda» fino a un’altra accensione e all’endpoint pronto. Il recupero quorum ha una politica distinta. Dopo30 min senza lavori IA attivi o autorizzati in attesa, arresto ordinato solo se nessun servizio/operazione richiede il nodo e il quorum residuo e garantito. Un modello caricato ma inattivo non e un lavoro attivo. Cloud solo su richiesta/conferma, nessun job periodico e nessuna API a consumo.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-MAP]] · [[REV3-OPEN]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-03.46



# INF-03.46 · M6: media, servizi esterni e margine di calcolo

M6 usa la seconda D1581-Q3A, con 64 GB PC3L dal lotto Vinted ancora in trattativa. La Z9PA-U8 esce dalla lista acquisti; il vecchio E5-2630L v2 non viene conteggiato come CPU della nuova scheda. M6 e Proxmox autonomo, fuori dai voti del nucleo stabile, acceso su richiesta o durante download e lavoro autorizzato.

Arc A310 rimane candidata, non acquistata. Prima verificare GPU e MNPA19-XTR simultanee: slot, linee, ingombri, BIOS e driver. Se manca questa possibilita, avvio con rete integrata e direct play/media preparati; non comprare un adattatore presumendo biforcazione. L'assenza di ReBAR non prova da sola che ogni transcodifica sia impossibile: si collauda il percorso reale.

Separare cloud Seafile, Jellyfin/audio e download/arr in ambienti con account, mount e limiti distinti. Preferire LXC non privilegiati dove supportati; non promettere isolamento da VM per container che condividono kernel. Nessun downloader nella rete fidata generale.

V300 120 GB per boot; EVO 500 GB per staging e spazio SSD quotato di DB; due WD10EZRX da 1 TB in mirror per Seafile e audio locale. Dieci utenti per 50 GB significa 500 GB, con margine separato per versioni/audio. Seafile esterno mantiene la scelta gia esplicita: niente backup aggiuntivo automatico dei contenuti su M4 o Drive. Il caricamento totale della transizione va riconciliato per eventuali dati di terzi prima di includerli.

La RAM aggiuntiva puo sostenere servizi e cache del pool locale. I film archiviati su M4 non beneficiano automaticamente dell'ARC di M6. Temporanei di transcodifica in RAM solo con quote e dati ricreabili. Avviare M4 quando il file richiesto e remoto, attendere readiness e non spegnerlo durante una visione. Nessun timer M6 imposto senza osservazione. [[REV4-RAM]] · [[REV4-MON]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-03.27



# INF-03.27 · Acer fisso: Windows, lavoro e Sunshine

L'Acer Aspire 7 MP3 e la postazione Windows sempre fissa in laboratorio. La dotazione dichiarata e Ryzen 7 5700U, RTX 3050 Ti 4 GB, 16 GB RAM e Crucial P3 Plus 1 TB. Windows ospita lavoro, Steam/retrogaming e Sunshine, con utenti e permessi distinti per lavoro/assistente e gioco. Il cambio utente non chiude automaticamente l'altra sessione: i carichi agenti si riducono durante il gioco.

OpenClaw di lavoro ha nell'Acer il riferimento aggiornato; Hermes mantiene l'Acer come sede prevista. Gli ambienti effettivi, la convivenza e il runtime compatibile con Windows si verificano in configurazione: non sono attestati due agenti gia installati ne un isolamento forte dato dal solo account. Il modello leggero locale e l'inferenza principale M3 restano distinti. La GPU da 4 GB e condivisa con grafica e gioco.

Il MacBook Air M1 MP2, 8/256, appartiene a uno scambio ancora in sospeso. Non e la postazione necessaria di laboratorio della 4.4 e non viene contato come ricevuto. Il MacBook personale MP1 resta distinto. L'eventuale Mac mini M1 sotto 200 EUR o upgrade Dell 32 GB sotto 100 EUR restano scenari storici condizionati, non acquisti prescritti.

M3 resta dedicato all'IA: se spento, l'agente propone accensione immediata su conferma oppure coda fino a successiva disponibilita. Priorita richieste personali, agenti, lavori di fondo. Niente inferenza principale continua obbligatoria per mantenere gli agenti operativi.

Nel Vito il lavoro usa anche Gemini e Google AI Pro sull'account di lavoro, con Sheets condivisi e Calendar; una sessione avviata dall'utente e distinta da un processo autonomo a consumo. L'abbonamento non e un credito API automaticamente disponibile a OpenClaw. Cloud su richiesta/conferma, senza job periodici pagati impliciti. Le informazioni operative persistono nei registri condivisi, non nella sola chat.

[[REV3-MOB]] dettaglia il PC del Vito; [[REV3-WRK]] il flusso di lavoro Google. Gli agenti e le postazioni mobili rimangono fuori quorum.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-OPEN]] · [[REV3-DIFF]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-09.06



# INF-09.06 · Storico delle configurazioni

La 4.1 resta la configurazione senza scambi familiari. La 4.2 conserva la variante portatili come allora definita. La 4.4 integra i riscontri successivi: Acer rientrato e fisso in laboratorio; Air M1 ancora in sospeso; Vito W639 con Dell C1; cinque Wyse distribuiti; HP esterni; Microtech ingresso; T110 II/RDX; Google AI Pro attivo e copie cifrate progettate. Le revisioni precedenti sono immutate e non si sommano alla corrente.

La base 4.4 e il nucleo stabile M1/M2/M5/C3/C4, cinque voti e quorum tre. M3/M4/M6 sono autonomi, S4 sentinella senza voto. La precedente proposta a otto host e superata. [[REV3-HA]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-09.13



# INF-09.13 · Storico delle configurazioni

La 4.1 resta la configurazione senza scambi familiari. La 4.2 conserva la variante portatili come allora definita. La 4.4 integra i riscontri successivi: Acer rientrato e fisso in laboratorio; Air M1 ancora in sospeso; Vito W639 con Dell C1; cinque Wyse distribuiti; HP esterni; Microtech ingresso; T110 II/RDX; Google AI Pro attivo e copie cifrate progettate. Le revisioni precedenti sono immutate e non si sommano alla corrente.

La base 4.4 e il nucleo stabile M1/M2/M5/C3/C4, cinque voti e quorum tre. M3/M4/M6 sono autonomi, S4 sentinella senza voto. La precedente proposta a otto host e superata. [[REV3-HA]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-09.15



# INF-09.15 · Registro apparati e prodotti

| Prefisso | Classe |
| --- | --- |
| M | M1-M7 nodi infrastrutturali |
| S | S1 utilita, S2 VPS, S3 radio, S4 testimone |
| C | C1-C4 Dellclient; C5/C6assegnazioni HP storiche noncorrenti |
| SH | Supportiesterni shelter |
| MD | Telefonietablet |
| MP | Notebooke PCpersonali |
| CE | Clientstreamingesternialla fidata |
| INV | Prodottolotto; serialeesemplare distinto; codici mairiusati per prodotto diverso |



La configurazione 4.4 distingue infrastruttura domestica, postazioni di lavoro e W639. Stato di acquisto/consegna e separato in [[REV3-STATO]].

| Apparato | Piattaforma | RAM/storage | Ruolo | Riferimenti |
| --- | --- | --- | --- | --- |
| M1 | MACHINIST X99 PR9-H / Xeon E5-2630L v3 dichiarato, SKU da identificare | 32 GB DDR4 ECC RDIMM, 2 x 16, disponibili | Proxmox: OPNsense VM e osservabilita separata; nucleo sempre acceso | INV-101 RAM / nuova scheda da associare |
| M2 | D1581-Q3 / Xeon D-1581 | 64 GB, 4 x 16 DDR3L RDIMM | Proxmox: applicazioni personali e pool SSD; niente Hermes/Frigate | INV-074 / 100 / 067 / 081 |
| M3 | HUANANZHI X99-T8 / E5-2678 v3 | 128 GB, 8 x 16 DDR3 RDIMM | Proxmox IA; MSI RTX3060 Ventus 2X 12 GB; senza Windows | INV-030 / 048 / 077 |
| M4 | ASUS P9D-MH/SAS/10G-DUAL / E3-1265L v3 | 32 GB, 4 x 8 ECC UDIMM | Proxmox/ZFS: backup WD RAIDZ2 e media Seagate RAIDZ1 | INV-073 / 047 / 076 |
| M5 | D1581-Q3 / Xeon D-1581, assegnazione condizionata al bus Hailo | 32 GB PC3L RDIMM, 2 x 16 dal lotto ancora in trattativa | Proxmox: HAOS, MQTT, Frigate/Hailo; nucleo sempre acceso | INV-074 / lotto RAM nuovo / INV-098 candidato |
| M6 | D1581-Q3A / Xeon D-1581, assegnazione condizionata a GPU e NIC | 64 GB PC3L RDIMM, 4 x 16 dal lotto ancora in trattativa | Proxmox autonomo: media, Seafile, download; acceso a richiesta | Q3A nuova / Arc candidata / INV-097 |
| M7 | ASUS H61M-K / E3-1220L v2 | 16 GB, 2 x 8 DDR3 | Riserva manuale H61M-K; T110 II acquistato candidato sostitutivo, da qualificare | INV-033 / 046 / 039 |
| S1 | ASRock Q1900M / Celeron J1900 | 8 GB, 2 x 4 Hynix PC3-10600U | Linux: Caddy, Vaultwarden, notifiche e utilita; fuori cluster | INV-034 / 049 / 041, esemplari da associare |
| S2 | Oracle Cloud Always Free, candidata A1 | Proposta: 1 OCPU / 4 GB / boot 50 GB | Osservazione esterna e relay; attivazione successiva; niente voto | Piano Oracle; nessun account/VM attivato qui |
| S3 | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Linux: Sonoff ZBDongle-P, Zigbee2MQTT e dashboard leggera; fuori cluster | Prodotto/seriale da associare, Wyse radio |
| S4 | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Linux: sentinella indipendente (senza voto) e primo mittente WoL; fuori cluster | Prodotto/seriale da associare, Wyse sentinella |
| C1 | Dell OptiPlex 7070 Ultra / i5-8265U | 8 GB censiti, nessun LLM locale | W639: PC di bordo/lavoro, touchscreen, diagnostica; fuori cluster domestico | INV-079, esemplare C1 |
| C2 | Dell OptiPlex 7070 Ultra / i5-8265U | 8 GB censiti, espansione solo se necessaria | Cucina: client Linux, streaming/Moonlight e pannello casa | INV-079, esemplare C2 |
| C3 | Dell OptiPlex 7070 Ultra / i5-8265U | 16 GB base HA, riscontro risorse | Proxmox client Linux e subentro HAOS/MQTT, senza Hermes | INV-079, esemplare C3 |
| C4 | Dell OptiPlex 7070 Ultra / i5-8265U | 16 GB base HA, riscontro risorse | Proxmox: client Linux VM, subentro app e secondo WoL | INV-079, esemplare C4 |
| MP3 | Acer Aspire 7 A715-42G-R2VB / Ryzen 7 5700U / RTX3050 Ti 4 GB | 16 GB / Crucial P3 Plus1 TB | Acer sempre fisso in laboratorio: Windows lavoro/gioco, Sunshine; OpenClaw di lavoro e Hermes da predisporre | MP3, codice INV da associare; dotazione dichiarata utente |
| MP2 | Apple MacBook Air M1 | 8 GB / SSD256 GB | Scambio ancora in sospeso: opzione MacBook Air, non postazione necessaria della 4.4 | INV-096, esemplare MP2 |
| MP4 | ASUS X99-DELUXE / i7-5930K / RTX2080 | 32 GB DDR4 | PC primo fratello, esterno all’infrastruttura | INV-029/043/035/055 |
| MP5 | ASRock X79 Extreme3 / i7-3820 | DDR3UDIMM, taglio e altri pezzi da associare | Ipotesi PC secondo fratello subordinata allo scambio Air ancora in sospeso; kit X79 da testare | INV-031/044; nessun componente server sottratto |
| Wyse laboratorio | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Jellyfin, musica e pannello Home Assistant; affianca Acer | Codice C e INV da associare |
| Wyse studio | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Monitor e client audio verso Behringer CONTROL2USB | Codice C e INV da associare |
| Wyse Hi-Fi salone | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Client Hi-Fi verso DAC ES9038Q2M USB | Codice C e INV da associare |
| HP amico 1 | HP t520 | 4 GB / Apacer M.2 8 GB | Client esterno Ethernet: LibreELEC, Jellyfin e offline USB | INV-078, codice CE e seriale da associare |
| HP amico 2 | HP t520 | 4 GB / Apacer M.2 8 GB | Client esterno Ethernet: LibreELEC, Jellyfin e offline USB | INV-078, codice CE e seriale da associare |
| Microtech ingresso | Microtech EBL14B | Dotazione da riscontrare; modello 4 GB/64 GB eMMC | Pannello citofono/allarme, display e batteria integrati; fuori cluster | Codice MP/INV e seriale da associare |
| T110 II | Dell PowerEdge T110 II / E3-1220 v2 | 8 GB dichiarati | Riserva candidata per M7 e disponibilita unita RDX SATA | Prodotto/seriale da associare; lotto acquistato 150 EUR |
| Kindle recuperato | Kindle 11a generazione USB-C | Modello base/Paperwhite da associare | Biblioteca tecnica e plancia compatta; dispositivo personale | Codice MD/INV da associare |

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-OPEN]] · [[REV3-DIFF]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## ATL-04



# ATL-04 · Architettura e apparati della revisione 4.4

La 4.4 e una configurazione di progetto, non un verbale di installazione. Acquisti e riscontri sono distinti in [[REV3-STATO]]. Le tre D1581 sono in arrivo; la RAM Vinted e ancora in trattativa.

Il nucleo stabile proposto comprende M1, M2, M5, C3 e C4: cinque voti, quorum tre. M3, M4 e M6 sono host Proxmox autonomi accesi secondo necessita. S4 osserva e invia WoL senza voto. Il Vito e un nodo mobile indipendente, non un membro del cluster.

| Apparato | Piattaforma | Memoria e storage | Responsabilita | Identita |
| --- | --- | --- | --- | --- |
| M1 | MACHINIST X99 PR9-H / Xeon E5-2630L v3 dichiarato, SKU da identificare | 32 GB DDR4 ECC RDIMM, 2 x 16, disponibili | Proxmox: OPNsense VM e osservabilita separata; nucleo sempre acceso | INV-101 RAM / nuova scheda da associare |
| M2 | D1581-Q3A / Xeon D-1581, assegnazione di progetto | 64 GB PC3L RDIMM, 4 x 16 gia posseduti | Proxmox: app personali; P310 4 TB provvisorio dopo liberazione Arca; nucleo sempre acceso | INV-100 / 005 / 009 / Q3A nuova |
| M3 | HUANANZHI X99-T8 / E5-2678 v3 | 128 GB, 8 x 16 DDR3 RDIMM | Proxmox autonomo IA su richiesta; RTX 3060 12 GB; nessun voto nel nucleo | INV-030 / 048 / 077 |
| M4 | ASUS P9D-MH/SAS/10G-DUAL / E3-1265L v3 | 32 GB, 4 x 8 ECC UDIMM | Proxmox autonomo/ZFS: WD solo backup dopo transizione; media separati, acceso per richiesta/job | INV-073 / 047 / 076 |
| M5 | D1581-Q3 / Xeon D-1581, assegnazione condizionata al bus Hailo | 32 GB PC3L RDIMM, 2 x 16 dal lotto ancora in trattativa | Proxmox: HAOS, MQTT, Frigate/Hailo; nucleo sempre acceso | INV-074 / lotto RAM nuovo / INV-098 candidato |
| M6 | D1581-Q3A / Xeon D-1581, assegnazione condizionata a GPU e NIC | 64 GB PC3L RDIMM, 4 x 16 dal lotto ancora in trattativa | Proxmox autonomo: media, Seafile, download; acceso a richiesta | Q3A nuova / Arc candidata / INV-097 |
| M7 | ASUS H61M-K / E3-1220L v2 | 16 GB, 2 x 8 DDR3 | Riserva manuale H61M-K; T110 II acquistato candidato sostitutivo, da qualificare | INV-033 / 046 / 039 |
| S1 | ASRock Q1900M / Celeron J1900 | 8 GB, 2 x 4 Hynix PC3-10600U | Linux: Caddy, Vaultwarden, notifiche e utilita; fuori cluster | INV-034 / 049 / 041, esemplari da associare |
| S2 | Oracle Cloud Always Free, candidata A1 | Proposta: 1 OCPU / 4 GB / boot 50 GB | Osservazione esterna e relay; attivazione successiva; niente voto | Piano Oracle; nessun account/VM attivato qui |
| S3 | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Linux: Sonoff ZBDongle-P, Zigbee2MQTT e dashboard leggera; fuori cluster | Prodotto/seriale da associare, Wyse radio |
| S4 | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Sentinella indipendente e primo mittente WoL; nessun voto nella base 4.4 | Wyse sentinella, codice esemplare da associare |
| C1 | Dell OptiPlex 7070 Ultra / i5-8265U | 8 GB censiti, nessun LLM locale | Vito W639: nodo mobile lavoro/camper autonomo; offline, LTE e recupero; fuori quorum | INV-079, esemplare C1 |
| C2 | Dell OptiPlex 7070 Ultra / i5-8265U | 8 GB censiti, espansione solo se necessaria | Cucina: client Linux, streaming/Moonlight e pannello casa | INV-079, esemplare C2 |
| C3 | Dell OptiPlex 7070 Ultra / i5-8265U | 16 GB base HA, riscontro risorse | Proxmox client Linux e subentro HAOS/MQTT, senza Hermes | INV-079, esemplare C3 |
| C4 | Dell OptiPlex 7070 Ultra / i5-8265U | 16 GB base HA, riscontro risorse | Proxmox nucleo: client Linux, riserva app selezionate, secondo mittente WoL | INV-079, esemplare C4 |
| MP3 | Acer Aspire 7 A715-42G-R2VB / Ryzen 7 5700U / RTX3050 Ti 4 GB | 16 GB / Crucial P3 Plus1 TB | Acer sempre fisso in laboratorio: Windows lavoro/gioco, Sunshine; OpenClaw di lavoro e Hermes da predisporre | MP3, codice INV da associare; dotazione dichiarata utente |
| MP2 | Apple MacBook Air M1 | 8 GB / SSD256 GB | Scambio ancora in sospeso: opzione MacBook Air, non postazione necessaria della 4.3 | INV-096, esemplare MP2 |
| MP4 | ASUS X99-DELUXE / i7-5930K / RTX2080 | 32 GB DDR4 | PC primo fratello, esterno all’infrastruttura | INV-029/043/035/055 |
| MP5 | ASRock X79 Extreme3 / i7-3820 | DDR3UDIMM, taglio e altri pezzi da associare | Ipotesi PC secondo fratello subordinata allo scambio Air ancora in sospeso; kit X79 da testare | INV-031/044; nessun componente server sottratto |
| Wyse laboratorio | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Jellyfin, musica e pannello Home Assistant; affianca Acer | Codice C e INV da associare |
| Wyse studio | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Monitor e client audio verso Behringer CONTROL2USB | Codice C e INV da associare |
| Wyse Hi-Fi salone | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Client Hi-Fi verso DAC ES9038Q2M USB | Codice C e INV da associare |
| HP amico 1 | HP t520 | 4 GB / Apacer M.2 8 GB | Client esterno Ethernet: LibreELEC, Jellyfin e offline USB | INV-078, codice CE e seriale da associare |
| HP amico 2 | HP t520 | 4 GB / Apacer M.2 8 GB | Client esterno Ethernet: LibreELEC, Jellyfin e offline USB | INV-078, codice CE e seriale da associare |
| Microtech ingresso | Microtech EBL14B | Dotazione da riscontrare; modello 4 GB/64 GB eMMC | Pannello citofono/allarme, display e batteria integrati; fuori cluster | Codice MP/INV e seriale da associare |
| T110 II | Dell PowerEdge T110 II / E3-1220 v2 | 8 GB dichiarati | Riserva candidata per M7 e disponibilita unita RDX SATA | Prodotto/seriale da associare; lotto acquistato 150 EUR |
| Kindle recuperato | Kindle 11a generazione USB-C | Modello base/Paperwhite da associare | Biblioteca tecnica e plancia compatta; dispositivo personale | Codice MD/INV da associare |

Le assegnazioni Q3/Q3A si chiudono dopo il controllo dei bus: M2 richiede due NVMe simultanei e Mellanox; M5 un percorso Hailo con boot SATA; M6 GPU e NIC simultanee. Prima di comprare adattatori si verificano schede ricevute e revisione. [[REV4-PCIE]] · [[REV4-RAM]] · [[REV4-VITO]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## ATL-01



# ATL-01 · Architettura e apparati della revisione 4.4

La 4.4 e una configurazione di progetto, non un verbale di installazione. Acquisti e riscontri sono distinti in [[REV3-STATO]]. Le tre D1581 sono in arrivo; la RAM Vinted e ancora in trattativa.

Il nucleo stabile proposto comprende M1, M2, M5, C3 e C4: cinque voti, quorum tre. M3, M4 e M6 sono host Proxmox autonomi accesi secondo necessita. S4 osserva e invia WoL senza voto. Il Vito e un nodo mobile indipendente, non un membro del cluster.

| Apparato | Piattaforma | Memoria e storage | Responsabilita | Identita |
| --- | --- | --- | --- | --- |
| M1 | MACHINIST X99 PR9-H / Xeon E5-2630L v3 dichiarato, SKU da identificare | 32 GB DDR4 ECC RDIMM, 2 x 16, disponibili | Proxmox: OPNsense VM e osservabilita separata; nucleo sempre acceso | INV-101 RAM / nuova scheda da associare |
| M2 | D1581-Q3A / Xeon D-1581, assegnazione di progetto | 64 GB PC3L RDIMM, 4 x 16 gia posseduti | Proxmox: app personali; P310 4 TB provvisorio dopo liberazione Arca; nucleo sempre acceso | INV-100 / 005 / 009 / Q3A nuova |
| M3 | HUANANZHI X99-T8 / E5-2678 v3 | 128 GB, 8 x 16 DDR3 RDIMM | Proxmox autonomo IA su richiesta; RTX 3060 12 GB; nessun voto nel nucleo | INV-030 / 048 / 077 |
| M4 | ASUS P9D-MH/SAS/10G-DUAL / E3-1265L v3 | 32 GB, 4 x 8 ECC UDIMM | Proxmox autonomo/ZFS: WD solo backup dopo transizione; media separati, acceso per richiesta/job | INV-073 / 047 / 076 |
| M5 | D1581-Q3 / Xeon D-1581, assegnazione condizionata al bus Hailo | 32 GB PC3L RDIMM, 2 x 16 dal lotto ancora in trattativa | Proxmox: HAOS, MQTT, Frigate/Hailo; nucleo sempre acceso | INV-074 / lotto RAM nuovo / INV-098 candidato |
| M6 | D1581-Q3A / Xeon D-1581, assegnazione condizionata a GPU e NIC | 64 GB PC3L RDIMM, 4 x 16 dal lotto ancora in trattativa | Proxmox autonomo: media, Seafile, download; acceso a richiesta | Q3A nuova / Arc candidata / INV-097 |
| M7 | ASUS H61M-K / E3-1220L v2 | 16 GB, 2 x 8 DDR3 | Riserva manuale H61M-K; T110 II acquistato candidato sostitutivo, da qualificare | INV-033 / 046 / 039 |
| S1 | ASRock Q1900M / Celeron J1900 | 8 GB, 2 x 4 Hynix PC3-10600U | Linux: Caddy, Vaultwarden, notifiche e utilita; fuori cluster | INV-034 / 049 / 041, esemplari da associare |
| S2 | Oracle Cloud Always Free, candidata A1 | Proposta: 1 OCPU / 4 GB / boot 50 GB | Osservazione esterna e relay; attivazione successiva; niente voto | Piano Oracle; nessun account/VM attivato qui |
| S3 | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Linux: Sonoff ZBDongle-P, Zigbee2MQTT e dashboard leggera; fuori cluster | Prodotto/seriale da associare, Wyse radio |
| S4 | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Sentinella indipendente e primo mittente WoL; nessun voto nella base 4.4 | Wyse sentinella, codice esemplare da associare |
| C1 | Dell OptiPlex 7070 Ultra / i5-8265U | 8 GB censiti, nessun LLM locale | Vito W639: nodo mobile lavoro/camper autonomo; offline, LTE e recupero; fuori quorum | INV-079, esemplare C1 |
| C2 | Dell OptiPlex 7070 Ultra / i5-8265U | 8 GB censiti, espansione solo se necessaria | Cucina: client Linux, streaming/Moonlight e pannello casa | INV-079, esemplare C2 |
| C3 | Dell OptiPlex 7070 Ultra / i5-8265U | 16 GB base HA, riscontro risorse | Proxmox client Linux e subentro HAOS/MQTT, senza Hermes | INV-079, esemplare C3 |
| C4 | Dell OptiPlex 7070 Ultra / i5-8265U | 16 GB base HA, riscontro risorse | Proxmox nucleo: client Linux, riserva app selezionate, secondo mittente WoL | INV-079, esemplare C4 |
| MP3 | Acer Aspire 7 A715-42G-R2VB / Ryzen 7 5700U / RTX3050 Ti 4 GB | 16 GB / Crucial P3 Plus1 TB | Acer sempre fisso in laboratorio: Windows lavoro/gioco, Sunshine; OpenClaw di lavoro e Hermes da predisporre | MP3, codice INV da associare; dotazione dichiarata utente |
| MP2 | Apple MacBook Air M1 | 8 GB / SSD256 GB | Scambio ancora in sospeso: opzione MacBook Air, non postazione necessaria della 4.3 | INV-096, esemplare MP2 |
| MP4 | ASUS X99-DELUXE / i7-5930K / RTX2080 | 32 GB DDR4 | PC primo fratello, esterno all’infrastruttura | INV-029/043/035/055 |
| MP5 | ASRock X79 Extreme3 / i7-3820 | DDR3UDIMM, taglio e altri pezzi da associare | Ipotesi PC secondo fratello subordinata allo scambio Air ancora in sospeso; kit X79 da testare | INV-031/044; nessun componente server sottratto |
| Wyse laboratorio | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Jellyfin, musica e pannello Home Assistant; affianca Acer | Codice C e INV da associare |
| Wyse studio | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Monitor e client audio verso Behringer CONTROL2USB | Codice C e INV da associare |
| Wyse Hi-Fi salone | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Client Hi-Fi verso DAC ES9038Q2M USB | Codice C e INV da associare |
| HP amico 1 | HP t520 | 4 GB / Apacer M.2 8 GB | Client esterno Ethernet: LibreELEC, Jellyfin e offline USB | INV-078, codice CE e seriale da associare |
| HP amico 2 | HP t520 | 4 GB / Apacer M.2 8 GB | Client esterno Ethernet: LibreELEC, Jellyfin e offline USB | INV-078, codice CE e seriale da associare |
| Microtech ingresso | Microtech EBL14B | Dotazione da riscontrare; modello 4 GB/64 GB eMMC | Pannello citofono/allarme, display e batteria integrati; fuori cluster | Codice MP/INV e seriale da associare |
| T110 II | Dell PowerEdge T110 II / E3-1220 v2 | 8 GB dichiarati | Riserva candidata per M7 e disponibilita unita RDX SATA | Prodotto/seriale da associare; lotto acquistato 150 EUR |
| Kindle recuperato | Kindle 11a generazione USB-C | Modello base/Paperwhite da associare | Biblioteca tecnica e plancia compatta; dispositivo personale | Codice MD/INV da associare |

Le assegnazioni Q3/Q3A si chiudono dopo il controllo dei bus: M2 richiede due NVMe simultanei e Mellanox; M5 un percorso Hailo con boot SATA; M6 GPU e NIC simultanee. Prima di comprare adattatori si verificano schede ricevute e revisione. [[REV4-PCIE]] · [[REV4-RAM]] · [[REV4-VITO]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## ATL-08



# ATL-08 · M6: media, servizi esterni e margine di calcolo

M6 usa la seconda D1581-Q3A, con 64 GB PC3L dal lotto Vinted ancora in trattativa. La Z9PA-U8 esce dalla lista acquisti; il vecchio E5-2630L v2 non viene conteggiato come CPU della nuova scheda. M6 e Proxmox autonomo, fuori dai voti del nucleo stabile, acceso su richiesta o durante download e lavoro autorizzato.

Arc A310 rimane candidata, non acquistata. Prima verificare GPU e MNPA19-XTR simultanee: slot, linee, ingombri, BIOS e driver. Se manca questa possibilita, avvio con rete integrata e direct play/media preparati; non comprare un adattatore presumendo biforcazione. L'assenza di ReBAR non prova da sola che ogni transcodifica sia impossibile: si collauda il percorso reale.

Separare cloud Seafile, Jellyfin/audio e download/arr in ambienti con account, mount e limiti distinti. Preferire LXC non privilegiati dove supportati; non promettere isolamento da VM per container che condividono kernel. Nessun downloader nella rete fidata generale.

V300 120 GB per boot; EVO 500 GB per staging e spazio SSD quotato di DB; due WD10EZRX da 1 TB in mirror per Seafile e audio locale. Dieci utenti per 50 GB significa 500 GB, con margine separato per versioni/audio. Seafile esterno mantiene la scelta gia esplicita: niente backup aggiuntivo automatico dei contenuti su M4 o Drive. Il caricamento totale della transizione va riconciliato per eventuali dati di terzi prima di includerli.

La RAM aggiuntiva puo sostenere servizi e cache del pool locale. I film archiviati su M4 non beneficiano automaticamente dell'ARC di M6. Temporanei di transcodifica in RAM solo con quote e dati ricreabili. Avviare M4 quando il file richiesto e remoto, attendere readiness e non spegnerlo durante una visione. Nessun timer M6 imposto senza osservazione. [[REV4-RAM]] · [[REV4-MON]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## ATL-28



# ATL-28 · M5: domotica e visione locale

M5 usa la D1581-Q3 in arrivo, se il bus permette Hailo M-key con avvio SATA. La BKHD e esclusa: ordine annullato, non in consegna. Memoria obiettivo 32 GB PC3L RDIMM, due moduli del lotto Vinted ancora da acquistare. La DDR4 precedentemente destinata a M5 va a M1.

Proxmox nel nucleo stabile ospita HAOS, broker MQTT separato e ambiente Frigate/go2rtc/vision-gateway. Samsung 850 EVO 250 GB per boot/stato; due ST1000LM024 da 1 TB in mirror per registrazioni, circa 1 TB nominale. Quattro camere iniziali e sette giorni di eventi sono obiettivi da misurare; sei camere sono espansione. Hailo e camere restano da acquistare.

Hailo esegue inferenza compatibile, non decodifica video e non esegue LLM generici. Substream H.264 leggeri e decodifica CPU sono la base da collaudare. Frigate ha priorita; nessun doppio passthrough esclusivo a due VM. Condividere runtime solo se supportato dalla versione effettiva.

Sonoff/Zigbee2MQTT resta su S3. Reti IoT e AP non attraversano fisicamente M5 come unico ponte. La Q3 non eredita le sei porte della BKHD: interfacce e percorso avvisi via router 5G vanno mappati e isolati.

C3 e riserva per HAOS e MQTT dopo test di replica completa, fencing e capacita. Frigate, Hailo e registrazioni non diventano HA. Un guasto non richiede di trasferire la radio USB da S3. [[REV3-HA]] · [[REV4-PCIE]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## ATL-09



# ATL-09 · M3: inferenza dedicata e calcolo a richiesta

M3 conserva X99-T8 / E5-2678 v3,128 GB DDR3 RDIMM e Proxmox, dedicati all’IA. GPU MSI RTX3060 Ventus 2X 12 GB; WD PC SN530512 GB nello slot M.2PCIe2.0 per host e IA. Windows e Hermes sono su MP3 Aspire; RTX2080 segue MP4, PC del primo fratello. L’altro M.2 non e riservato alla vecchia VM Windows; il saldo Samsung NVMe e ancora da associare. A380 o RTX30506 GB sono espansioni integrative non acquistate.

Priorita: richieste personali interattive, poi agenti, infine fondo. La priorita si applica attraverso un arbitraggio comune ai lavori in attesa; non promette interruzione immediata della generazione in corso o concorrenza nella VRAM. Modelli, contesto e motore si scelgono sull’hardware. L’Hailo e un detector su M5, non un acceleratore LLM di M3.

Se M3 e spento l’utente sceglie «accendi adesso» con conferma oppure «metti in coda» fino a un’altra accensione e all’endpoint pronto. Il recupero quorum ha una politica distinta. Dopo30 min senza lavori IA attivi o autorizzati in attesa, arresto ordinato solo se nessun servizio/operazione richiede il nodo e il quorum residuo e garantito. Un modello caricato ma inattivo non e un lavoro attivo. Cloud solo su richiesta/conferma, nessun job periodico e nessuna API a consumo.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-MAP]] · [[REV3-OPEN]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## ATL-12



# ATL-12 · M5: domotica e visione locale

M5 usa la D1581-Q3 in arrivo, se il bus permette Hailo M-key con avvio SATA. La BKHD e esclusa: ordine annullato, non in consegna. Memoria obiettivo 32 GB PC3L RDIMM, due moduli del lotto Vinted ancora da acquistare. La DDR4 precedentemente destinata a M5 va a M1.

Proxmox nel nucleo stabile ospita HAOS, broker MQTT separato e ambiente Frigate/go2rtc/vision-gateway. Samsung 850 EVO 250 GB per boot/stato; due ST1000LM024 da 1 TB in mirror per registrazioni, circa 1 TB nominale. Quattro camere iniziali e sette giorni di eventi sono obiettivi da misurare; sei camere sono espansione. Hailo e camere restano da acquistare.

Hailo esegue inferenza compatibile, non decodifica video e non esegue LLM generici. Substream H.264 leggeri e decodifica CPU sono la base da collaudare. Frigate ha priorita; nessun doppio passthrough esclusivo a due VM. Condividere runtime solo se supportato dalla versione effettiva.

Sonoff/Zigbee2MQTT resta su S3. Reti IoT e AP non attraversano fisicamente M5 come unico ponte. La Q3 non eredita le sei porte della BKHD: interfacce e percorso avvisi via router 5G vanno mappati e isolati.

C3 e riserva per HAOS e MQTT dopo test di replica completa, fencing e capacita. Frigate, Hailo e registrazioni non diventano HA. Un guasto non richiede di trasferire la radio USB da S3. [[REV3-HA]] · [[REV4-PCIE]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## ATL-22



# ATL-22 · Storage: transizione e destinazioni definitive

| Nodo/interfaccia | Supporti | Contenuto | Condizione |
| --- | --- | --- | --- |
| M1 / SATA | INV-007 Kingston V200 120 GB | Boot Proxmox/OPNsense VM | Secondo disco OPNsense bare metal da associare |
| M2 / NVMe | INV-009 Sabrent Rocket512 GB | Boot Proxmox | Locale |
| M2 / secondo NVMe | INV-005 Crucial P310 4 TB, recuperato da Arca | Servizi e dati personali; segnaposto in attesa di pool SSD | Singolo disco; nessuna ridondanza. Solo dopo copie e recupero verificati |
| M3 / M.2 PCIe2.0x4 | INV-006 WD PC SN530512 GB | Host e IA | Altro M.2 non assegnato a Windows; inventario NVMe da ricontare |
| MP3 Aspire 7 | Crucial P3 Plus 1 TB | Windows/Hermes/giochi | Rimane nelportatile, non libero per PC |
| M4 / SATA native | 6 WD10EAVS1 TB, INV-001 | WD oggi anche media; a regime solo backup versionati RAIDZ2 | Ricostruire dopo evacuazione verificata; circa 4 TB nominali, spazio versioni da dimensionare |
| M4 / LSI2308 | 4 ST2000DM0082 TB, INV-087 | Media RAIDZ1, circa 6 TB nominali | ST2000DM008 SMR: collaudo ricostruzione e carico prima adozione; circa 6 TB nominali |
| M5 / SATA | INV-003 Samsung850EVO 250 GB | Boot Proxmox e stato | Recuperabile confermato |
| M5 / SATA | 2 ST1000LM0241 TB, INV-013 | Mirror Frigate circa 1 TB nominale | 4 camere eventi 7 giorni; risultato dipende dai flussi |
| M6 / SATA | INV-004 Kingston V300 120 GB | Boot Proxmox | Boot; dati DB separati e quote sullo staging SSD, dimensionamento prima installazione |
| M6 / SATA | INV-008 Samsung850EVO 500 GB | Download e staging | Incompleti, seed, quote e margine operativo |
| M6 / SATA | 2 WD10EZRX1 TB, INV-002 | Mirror Seafile e copie audio quotate | 10x50 GB; residuo per versioni/audio/margine; nessun backup aggiuntivo cloud |
| C3 / C4 | Un SSD locale per Dell | ZFS host + VM client + repliche HA | Capacita reale da associare; singolo SSD senza ridondanza locale |
| S3 / S4 | Storage Wyse 32 GB dichiarato per esemplare | Linux, radio/testimone e stato | Riconciliare storage effettivo; gli Apacer 8 GB restano sugli HP esterni |
| M4 / S1 / M7 | Boot da associare al saldo | Avvio indipendente | Nessun acquisto prima del riconteggio |
| SH1 / Arca durante transizione | INV-005 P310 4 TB nel box Lexar E750 | Conservare finche i dati unici sono protetti; poi P310 a M2 | Il box resta libero solo dopo il passaggio; non contare due SSD |
| SH3 | INV-086 Intenso250 GB + INV-089 ORICO | Supporto esterno assegnato | Non libera riserva boot |
| MP2 Air M1 | SSD interno256 GB | Scenario Air ancora in sospeso | Non requisito della configurazione 4.3 |
| Due HP esterni | Apacer M.2 8 GB + USB | LibreELEC/configurazione + contenuti offline | Capacita USB da associare |
| Microtech ingresso | 64 GB eMMC da modello, da riscontrare | Sistema e pannello ingresso | SSD opzionale, non acquisto imposto |
| RDX SATA | Tre cartucce HP 2 TB proposte, non comprate | Selezioni offline: foto/video, documenti, lavoro | 50 EUR ciascuna offerta riferita; verificare compatibilita e stato |

## Stato reale e progetto

Oggi film e serie TV sono anche sui WD Green. La separazione WD backup / Seagate media e destinazione, non stato gia installato. I dati devono essere evacuati e confrontati prima della ricostruzione. Arca contiene il medesimo P310 che passera a M2: non esistono due unita da 4 TB.

I sei WD in RAIDZ2 offrono circa 4 TB nominali, non spazio infinito per versioni di tutti i 4 TB di M2 piu tutti i media. I quattro Seagate ST2000DM008 sono SMR: RAIDZ1 da circa 6 TB resta subordinato a prove e accettazione dei tempi di riscrittura/resilver. Un'alternativa a due mirror riduce la capacita a circa 4 TB nominali ma non elimina la natura SMR. Nessun array e dichiarato gia ricostruito.

Database ed esportazioni applicative richiedono consistenza; una copia del rootfs non comprende automaticamente mount esterni. Snapshot e mirror non sono copie indipendenti. [[REV4-MIG]] · [[REV3-BCK]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## ATL-23



# ATL-23 · Architettura e apparati della revisione 4.4

La 4.4 e una configurazione di progetto, non un verbale di installazione. Acquisti e riscontri sono distinti in [[REV3-STATO]]. Le tre D1581 sono in arrivo; la RAM Vinted e ancora in trattativa.

Il nucleo stabile proposto comprende M1, M2, M5, C3 e C4: cinque voti, quorum tre. M3, M4 e M6 sono host Proxmox autonomi accesi secondo necessita. S4 osserva e invia WoL senza voto. Il Vito e un nodo mobile indipendente, non un membro del cluster.

| Apparato | Piattaforma | Memoria e storage | Responsabilita | Identita |
| --- | --- | --- | --- | --- |
| M1 | MACHINIST X99 PR9-H / Xeon E5-2630L v3 dichiarato, SKU da identificare | 32 GB DDR4 ECC RDIMM, 2 x 16, disponibili | Proxmox: OPNsense VM e osservabilita separata; nucleo sempre acceso | INV-101 RAM / nuova scheda da associare |
| M2 | D1581-Q3A / Xeon D-1581, assegnazione di progetto | 64 GB PC3L RDIMM, 4 x 16 gia posseduti | Proxmox: app personali; P310 4 TB provvisorio dopo liberazione Arca; nucleo sempre acceso | INV-100 / 005 / 009 / Q3A nuova |
| M3 | HUANANZHI X99-T8 / E5-2678 v3 | 128 GB, 8 x 16 DDR3 RDIMM | Proxmox autonomo IA su richiesta; RTX 3060 12 GB; nessun voto nel nucleo | INV-030 / 048 / 077 |
| M4 | ASUS P9D-MH/SAS/10G-DUAL / E3-1265L v3 | 32 GB, 4 x 8 ECC UDIMM | Proxmox autonomo/ZFS: WD solo backup dopo transizione; media separati, acceso per richiesta/job | INV-073 / 047 / 076 |
| M5 | D1581-Q3 / Xeon D-1581, assegnazione condizionata al bus Hailo | 32 GB PC3L RDIMM, 2 x 16 dal lotto ancora in trattativa | Proxmox: HAOS, MQTT, Frigate/Hailo; nucleo sempre acceso | INV-074 / lotto RAM nuovo / INV-098 candidato |
| M6 | D1581-Q3A / Xeon D-1581, assegnazione condizionata a GPU e NIC | 64 GB PC3L RDIMM, 4 x 16 dal lotto ancora in trattativa | Proxmox autonomo: media, Seafile, download; acceso a richiesta | Q3A nuova / Arc candidata / INV-097 |
| M7 | ASUS H61M-K / E3-1220L v2 | 16 GB, 2 x 8 DDR3 | Riserva manuale H61M-K; T110 II acquistato candidato sostitutivo, da qualificare | INV-033 / 046 / 039 |
| S1 | ASRock Q1900M / Celeron J1900 | 8 GB, 2 x 4 Hynix PC3-10600U | Linux: Caddy, Vaultwarden, notifiche e utilita; fuori cluster | INV-034 / 049 / 041, esemplari da associare |
| S2 | Oracle Cloud Always Free, candidata A1 | Proposta: 1 OCPU / 4 GB / boot 50 GB | Osservazione esterna e relay; attivazione successiva; niente voto | Piano Oracle; nessun account/VM attivato qui |
| S3 | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Linux: Sonoff ZBDongle-P, Zigbee2MQTT e dashboard leggera; fuori cluster | Prodotto/seriale da associare, Wyse radio |
| S4 | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Sentinella indipendente e primo mittente WoL; nessun voto nella base 4.4 | Wyse sentinella, codice esemplare da associare |
| C1 | Dell OptiPlex 7070 Ultra / i5-8265U | 8 GB censiti, nessun LLM locale | Vito W639: nodo mobile lavoro/camper autonomo; offline, LTE e recupero; fuori quorum | INV-079, esemplare C1 |
| C2 | Dell OptiPlex 7070 Ultra / i5-8265U | 8 GB censiti, espansione solo se necessaria | Cucina: client Linux, streaming/Moonlight e pannello casa | INV-079, esemplare C2 |
| C3 | Dell OptiPlex 7070 Ultra / i5-8265U | 16 GB base HA, riscontro risorse | Proxmox client Linux e subentro HAOS/MQTT, senza Hermes | INV-079, esemplare C3 |
| C4 | Dell OptiPlex 7070 Ultra / i5-8265U | 16 GB base HA, riscontro risorse | Proxmox nucleo: client Linux, riserva app selezionate, secondo mittente WoL | INV-079, esemplare C4 |
| MP3 | Acer Aspire 7 A715-42G-R2VB / Ryzen 7 5700U / RTX3050 Ti 4 GB | 16 GB / Crucial P3 Plus1 TB | Acer sempre fisso in laboratorio: Windows lavoro/gioco, Sunshine; OpenClaw di lavoro e Hermes da predisporre | MP3, codice INV da associare; dotazione dichiarata utente |
| MP2 | Apple MacBook Air M1 | 8 GB / SSD256 GB | Scambio ancora in sospeso: opzione MacBook Air, non postazione necessaria della 4.3 | INV-096, esemplare MP2 |
| MP4 | ASUS X99-DELUXE / i7-5930K / RTX2080 | 32 GB DDR4 | PC primo fratello, esterno all’infrastruttura | INV-029/043/035/055 |
| MP5 | ASRock X79 Extreme3 / i7-3820 | DDR3UDIMM, taglio e altri pezzi da associare | Ipotesi PC secondo fratello subordinata allo scambio Air ancora in sospeso; kit X79 da testare | INV-031/044; nessun componente server sottratto |
| Wyse laboratorio | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Jellyfin, musica e pannello Home Assistant; affianca Acer | Codice C e INV da associare |
| Wyse studio | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Monitor e client audio verso Behringer CONTROL2USB | Codice C e INV da associare |
| Wyse Hi-Fi salone | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Client Hi-Fi verso DAC ES9038Q2M USB | Codice C e INV da associare |
| HP amico 1 | HP t520 | 4 GB / Apacer M.2 8 GB | Client esterno Ethernet: LibreELEC, Jellyfin e offline USB | INV-078, codice CE e seriale da associare |
| HP amico 2 | HP t520 | 4 GB / Apacer M.2 8 GB | Client esterno Ethernet: LibreELEC, Jellyfin e offline USB | INV-078, codice CE e seriale da associare |
| Microtech ingresso | Microtech EBL14B | Dotazione da riscontrare; modello 4 GB/64 GB eMMC | Pannello citofono/allarme, display e batteria integrati; fuori cluster | Codice MP/INV e seriale da associare |
| T110 II | Dell PowerEdge T110 II / E3-1220 v2 | 8 GB dichiarati | Riserva candidata per M7 e disponibilita unita RDX SATA | Prodotto/seriale da associare; lotto acquistato 150 EUR |
| Kindle recuperato | Kindle 11a generazione USB-C | Modello base/Paperwhite da associare | Biblioteca tecnica e plancia compatta; dispositivo personale | Codice MD/INV da associare |

Le assegnazioni Q3/Q3A si chiudono dopo il controllo dei bus: M2 richiede due NVMe simultanei e Mellanox; M5 un percorso Hailo con boot SATA; M6 GPU e NIC simultanee. Prima di comprare adattatori si verificano schede ricevute e revisione. [[REV4-PCIE]] · [[REV4-RAM]] · [[REV4-VITO]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## ATL-07



# ATL-07 · Storage: transizione e destinazioni definitive

| Nodo/interfaccia | Supporti | Contenuto | Condizione |
| --- | --- | --- | --- |
| M1 / SATA | INV-007 Kingston V200 120 GB | Boot Proxmox/OPNsense VM | Secondo disco OPNsense bare metal da associare |
| M2 / NVMe | INV-009 Sabrent Rocket512 GB | Boot Proxmox | Locale |
| M2 / secondo NVMe | INV-005 Crucial P310 4 TB, recuperato da Arca | Servizi e dati personali; segnaposto in attesa di pool SSD | Singolo disco; nessuna ridondanza. Solo dopo copie e recupero verificati |
| M3 / M.2 PCIe2.0x4 | INV-006 WD PC SN530512 GB | Host e IA | Altro M.2 non assegnato a Windows; inventario NVMe da ricontare |
| MP3 Aspire 7 | Crucial P3 Plus 1 TB | Windows/Hermes/giochi | Rimane nelportatile, non libero per PC |
| M4 / SATA native | 6 WD10EAVS1 TB, INV-001 | WD oggi anche media; a regime solo backup versionati RAIDZ2 | Ricostruire dopo evacuazione verificata; circa 4 TB nominali, spazio versioni da dimensionare |
| M4 / LSI2308 | 4 ST2000DM0082 TB, INV-087 | Media RAIDZ1, circa 6 TB nominali | ST2000DM008 SMR: collaudo ricostruzione e carico prima adozione; circa 6 TB nominali |
| M5 / SATA | INV-003 Samsung850EVO 250 GB | Boot Proxmox e stato | Recuperabile confermato |
| M5 / SATA | 2 ST1000LM0241 TB, INV-013 | Mirror Frigate circa 1 TB nominale | 4 camere eventi 7 giorni; risultato dipende dai flussi |
| M6 / SATA | INV-004 Kingston V300 120 GB | Boot Proxmox | Boot; dati DB separati e quote sullo staging SSD, dimensionamento prima installazione |
| M6 / SATA | INV-008 Samsung850EVO 500 GB | Download e staging | Incompleti, seed, quote e margine operativo |
| M6 / SATA | 2 WD10EZRX1 TB, INV-002 | Mirror Seafile e copie audio quotate | 10x50 GB; residuo per versioni/audio/margine; nessun backup aggiuntivo cloud |
| C3 / C4 | Un SSD locale per Dell | ZFS host + VM client + repliche HA | Capacita reale da associare; singolo SSD senza ridondanza locale |
| S3 / S4 | Storage Wyse 32 GB dichiarato per esemplare | Linux, radio/testimone e stato | Riconciliare storage effettivo; gli Apacer 8 GB restano sugli HP esterni |
| M4 / S1 / M7 | Boot da associare al saldo | Avvio indipendente | Nessun acquisto prima del riconteggio |
| SH1 / Arca durante transizione | INV-005 P310 4 TB nel box Lexar E750 | Conservare finche i dati unici sono protetti; poi P310 a M2 | Il box resta libero solo dopo il passaggio; non contare due SSD |
| SH3 | INV-086 Intenso250 GB + INV-089 ORICO | Supporto esterno assegnato | Non libera riserva boot |
| MP2 Air M1 | SSD interno256 GB | Scenario Air ancora in sospeso | Non requisito della configurazione 4.3 |
| Due HP esterni | Apacer M.2 8 GB + USB | LibreELEC/configurazione + contenuti offline | Capacita USB da associare |
| Microtech ingresso | 64 GB eMMC da modello, da riscontrare | Sistema e pannello ingresso | SSD opzionale, non acquisto imposto |
| RDX SATA | Tre cartucce HP 2 TB proposte, non comprate | Selezioni offline: foto/video, documenti, lavoro | 50 EUR ciascuna offerta riferita; verificare compatibilita e stato |

## Stato reale e progetto

Oggi film e serie TV sono anche sui WD Green. La separazione WD backup / Seagate media e destinazione, non stato gia installato. I dati devono essere evacuati e confrontati prima della ricostruzione. Arca contiene il medesimo P310 che passera a M2: non esistono due unita da 4 TB.

I sei WD in RAIDZ2 offrono circa 4 TB nominali, non spazio infinito per versioni di tutti i 4 TB di M2 piu tutti i media. I quattro Seagate ST2000DM008 sono SMR: RAIDZ1 da circa 6 TB resta subordinato a prove e accettazione dei tempi di riscrittura/resilver. Un'alternativa a due mirror riduce la capacita a circa 4 TB nominali ma non elimina la natura SMR. Nessun array e dichiarato gia ricostruito.

Database ed esportazioni applicative richiedono consistenza; una copia del rootfs non comprende automaticamente mount esterni. Snapshot e mirror non sono copie indipendenti. [[REV4-MIG]] · [[REV3-BCK]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## ATL-27



# ATL-27 · Sicurezza e indipendenza

**M5 - Domotica autonoma.** D1581-Q3 in arrivo, 32 GB PC3L dal lotto in trattativa. HAOS e MQTT separati da Frigate/Hailo; radio e Zigbee2MQTT su S3. Hailo e camere da acquistare. [[INF-03.08]]

**Confini fisici.** M2 servizi personali e M6 servizi esterni hanno accessi distinti; Hermes MP3 e OpenClaw MP2 sono personali. M4 interno:media RO a Jellyfin e scritturaarr limitata, repository WD esclusi. Reti IoTlocale/cloud/camere su switch/AP indipendenti da M5. Vedi REV3-RET.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-01.10



# INF-01.10 · Memorie: disponibilita, distribuzione e utilizzo

Il conto definitivo distingue possesso e trattativa: quattro PC3L da 16 GB gia comprati per M2 (64 GB) e sei PC3L da 16 GB proposti su Vinted (96 GB). Offerta inviata 85 EUR, non accettazione o acquisto. Totale obiettivo delle tre D1581: 160 GB solo se il lotto viene acquisito.

| Nodo | Gruppo | Composizione | Capacita |
| --- | --- | --- | --- |
| M1 | INV-101 | 2 x 16 GB DDR4 RDIMM gia disponibili | 32 GB |
| M2 | INV-100 | 4 x 16 GB PC3L RDIMM gia posseduti | 64 GB |
| M3 | INV-075/099 | 8x16 GB DDR3 RDIMM | 128 GB |
| M4 | INV-076 | 4x8 GB ECC UDIMM | 32 GB |
| M5 | Lotto Vinted / 2 moduli | 2 x 16 GB PC3L-10600R RDIMM; acquisto non concluso | 32 GB previsti |
| M6 | Lotto Vinted / 4 moduli | 4 x 16 GB PC3L-10600R RDIMM; acquisto non concluso | 64 GB previsti |
| M7 | INV-039 | 2x8 GB HyperX | 16 GB |
| S1 | Hynix PC3-10600U-9-11-B1 | 2x4 GB 2Rx8, esemplari da associare | 8 GB |
| S3/S4 | Wyse 3030 | 4 GB ciascuno dichiarati; 32 GB storage da riscontro | 4 GB ciascuno |
| Scorta RDIMM16 GB | INV-075/099 | 13 DDR3 - 8 M3 = 5; vecchia assegnazione M6 liberata nel progetto | 80 GB PC3; non sostitutivi automatici dei PC3L |
| C1 | DDR4 SO-DIMM | RAM censita8 GB senza LLM | 8 GB |
| C2 | DDR4 SO-DIMM | RAM censita8 GB | 8 GB |
| C3 | DDR4 SO-DIMM | Base16 GB per HA; misura risorse | 16 GB |
| C4 | DDR4 SO-DIMM | Base16 GB per HA; misura risorse | 16 GB |
| MP2 | Apple Silicon unificata | Scenario di scambio, non RAM disponibile obbligatoria | 8 GB |
| MP3 | Aspire 7 | Dotazione dichiarata, composizione slot da verificare | 16 GB |

## Perche 64 / 32 / 64

M2 conserva i quattro moduli gia posseduti. Due nuovi moduli vanno a M5 e quattro a M6. L'utente preferisce utilizzare tutti i banchi; 48/48 rimane un'alternativa tecnica da verificare secondo regole di popolamento, ma la base 4.4 concentra piu margine sul nodo dati/media. I 64 GB di M6 sono una riserva utile, non un fabbisogno misurato.

M1 usa i 32 GB DDR4 gia disponibili: OPNsense 8 GB iniziali, VM monitoraggio 4-8 GB, resto a host e margine. M2 parte con ARC massimo proposto 16 GB se ZFS e sull'host; assegnazioni guest complessive iniziali entro 36 GB e almeno 12 GB per host/margine. Sono budget di progetto da correggere con misure, non memoria da occupare per forza.

M5: 8 GB HAOS, 2 GB MQTT, 10 GB Frigate/gateway come budget iniziale, 4 GB host/cache e 8 GB margine. M6: servizi entro 24 GB, ARC fino a 16 GB iniziali sul pool locale, 8 GB host e 16 GB margine; aumentare ARC solo se le letture ripetute lo giustificano. Cache e limiti guest non devono essere conteggiati due volte. La cache di M6 non e l'ARC dei dischi di M4.

M4 puo iniziare con ARC 8-12 GB e margine per backup e filesystem. M3 conserva 128 GB, utili per lotti e modelli in RAM ma non equivalenti a VRAM della RTX3060. Nessuna cache deve essere unica copia di dati persistenti. Un RAM disk e ammesso solo per temporanei ricreabili, con limite.

Le etichette PC3L-10600R indicano RDIMM a bassa tensione, non ECC UDIMM. Non spostare RDIMM sulla P9D senza compatibilita. I cinque moduli PC3 residui previsti dal vecchio lotto non sostituiscono automaticamente PC3L.

[Proxmox ZFS e ARC](https://github.com/proxmox/pve-docs/blob/master/local-zfs.adoc) · [OpenZFS cache](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Caching.html)

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-01.11



# INF-01.11 · Storage: transizione e destinazioni definitive

| Nodo/interfaccia | Supporti | Contenuto | Condizione |
| --- | --- | --- | --- |
| M1 / SATA | INV-007 Kingston V200 120 GB | Boot Proxmox/OPNsense VM | Secondo disco OPNsense bare metal da associare |
| M2 / NVMe | INV-009 Sabrent Rocket512 GB | Boot Proxmox | Locale |
| M2 / secondo NVMe | INV-005 Crucial P310 4 TB, recuperato da Arca | Servizi e dati personali; segnaposto in attesa di pool SSD | Singolo disco; nessuna ridondanza. Solo dopo copie e recupero verificati |
| M3 / M.2 PCIe2.0x4 | INV-006 WD PC SN530512 GB | Host e IA | Altro M.2 non assegnato a Windows; inventario NVMe da ricontare |
| MP3 Aspire 7 | Crucial P3 Plus 1 TB | Windows/Hermes/giochi | Rimane nelportatile, non libero per PC |
| M4 / SATA native | 6 WD10EAVS1 TB, INV-001 | WD oggi anche media; a regime solo backup versionati RAIDZ2 | Ricostruire dopo evacuazione verificata; circa 4 TB nominali, spazio versioni da dimensionare |
| M4 / LSI2308 | 4 ST2000DM0082 TB, INV-087 | Media RAIDZ1, circa 6 TB nominali | ST2000DM008 SMR: collaudo ricostruzione e carico prima adozione; circa 6 TB nominali |
| M5 / SATA | INV-003 Samsung850EVO 250 GB | Boot Proxmox e stato | Recuperabile confermato |
| M5 / SATA | 2 ST1000LM0241 TB, INV-013 | Mirror Frigate circa 1 TB nominale | 4 camere eventi 7 giorni; risultato dipende dai flussi |
| M6 / SATA | INV-004 Kingston V300 120 GB | Boot Proxmox | Boot; dati DB separati e quote sullo staging SSD, dimensionamento prima installazione |
| M6 / SATA | INV-008 Samsung850EVO 500 GB | Download e staging | Incompleti, seed, quote e margine operativo |
| M6 / SATA | 2 WD10EZRX1 TB, INV-002 | Mirror Seafile e copie audio quotate | 10x50 GB; residuo per versioni/audio/margine; nessun backup aggiuntivo cloud |
| C3 / C4 | Un SSD locale per Dell | ZFS host + VM client + repliche HA | Capacita reale da associare; singolo SSD senza ridondanza locale |
| S3 / S4 | Storage Wyse 32 GB dichiarato per esemplare | Linux, radio/testimone e stato | Riconciliare storage effettivo; gli Apacer 8 GB restano sugli HP esterni |
| M4 / S1 / M7 | Boot da associare al saldo | Avvio indipendente | Nessun acquisto prima del riconteggio |
| SH1 / Arca durante transizione | INV-005 P310 4 TB nel box Lexar E750 | Conservare finche i dati unici sono protetti; poi P310 a M2 | Il box resta libero solo dopo il passaggio; non contare due SSD |
| SH3 | INV-086 Intenso250 GB + INV-089 ORICO | Supporto esterno assegnato | Non libera riserva boot |
| MP2 Air M1 | SSD interno256 GB | Scenario Air ancora in sospeso | Non requisito della configurazione 4.3 |
| Due HP esterni | Apacer M.2 8 GB + USB | LibreELEC/configurazione + contenuti offline | Capacita USB da associare |
| Microtech ingresso | 64 GB eMMC da modello, da riscontrare | Sistema e pannello ingresso | SSD opzionale, non acquisto imposto |
| RDX SATA | Tre cartucce HP 2 TB proposte, non comprate | Selezioni offline: foto/video, documenti, lavoro | 50 EUR ciascuna offerta riferita; verificare compatibilita e stato |

## Stato reale e progetto

Oggi film e serie TV sono anche sui WD Green. La separazione WD backup / Seagate media e destinazione, non stato gia installato. I dati devono essere evacuati e confrontati prima della ricostruzione. Arca contiene il medesimo P310 che passera a M2: non esistono due unita da 4 TB.

I sei WD in RAIDZ2 offrono circa 4 TB nominali, non spazio infinito per versioni di tutti i 4 TB di M2 piu tutti i media. I quattro Seagate ST2000DM008 sono SMR: RAIDZ1 da circa 6 TB resta subordinato a prove e accettazione dei tempi di riscrittura/resilver. Un'alternativa a due mirror riduce la capacita a circa 4 TB nominali ma non elimina la natura SMR. Nessun array e dichiarato gia ricostruito.

Database ed esportazioni applicative richiedono consistenza; una copia del rootfs non comprende automaticamente mount esterni. Snapshot e mirror non sono copie indipendenti. [[REV4-MIG]] · [[REV3-BCK]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-01.01



# INF-01.01 · Architettura e apparati della revisione 4.4

La 4.4 e una configurazione di progetto, non un verbale di installazione. Acquisti e riscontri sono distinti in [[REV3-STATO]]. Le tre D1581 sono in arrivo; la RAM Vinted e ancora in trattativa.

Il nucleo stabile proposto comprende M1, M2, M5, C3 e C4: cinque voti, quorum tre. M3, M4 e M6 sono host Proxmox autonomi accesi secondo necessita. S4 osserva e invia WoL senza voto. Il Vito e un nodo mobile indipendente, non un membro del cluster.

| Apparato | Piattaforma | Memoria e storage | Responsabilita | Identita |
| --- | --- | --- | --- | --- |
| M1 | MACHINIST X99 PR9-H / Xeon E5-2630L v3 dichiarato, SKU da identificare | 32 GB DDR4 ECC RDIMM, 2 x 16, disponibili | Proxmox: OPNsense VM e osservabilita separata; nucleo sempre acceso | INV-101 RAM / nuova scheda da associare |
| M2 | D1581-Q3A / Xeon D-1581, assegnazione di progetto | 64 GB PC3L RDIMM, 4 x 16 gia posseduti | Proxmox: app personali; P310 4 TB provvisorio dopo liberazione Arca; nucleo sempre acceso | INV-100 / 005 / 009 / Q3A nuova |
| M3 | HUANANZHI X99-T8 / E5-2678 v3 | 128 GB, 8 x 16 DDR3 RDIMM | Proxmox autonomo IA su richiesta; RTX 3060 12 GB; nessun voto nel nucleo | INV-030 / 048 / 077 |
| M4 | ASUS P9D-MH/SAS/10G-DUAL / E3-1265L v3 | 32 GB, 4 x 8 ECC UDIMM | Proxmox autonomo/ZFS: WD solo backup dopo transizione; media separati, acceso per richiesta/job | INV-073 / 047 / 076 |
| M5 | D1581-Q3 / Xeon D-1581, assegnazione condizionata al bus Hailo | 32 GB PC3L RDIMM, 2 x 16 dal lotto ancora in trattativa | Proxmox: HAOS, MQTT, Frigate/Hailo; nucleo sempre acceso | INV-074 / lotto RAM nuovo / INV-098 candidato |
| M6 | D1581-Q3A / Xeon D-1581, assegnazione condizionata a GPU e NIC | 64 GB PC3L RDIMM, 4 x 16 dal lotto ancora in trattativa | Proxmox autonomo: media, Seafile, download; acceso a richiesta | Q3A nuova / Arc candidata / INV-097 |
| M7 | ASUS H61M-K / E3-1220L v2 | 16 GB, 2 x 8 DDR3 | Riserva manuale H61M-K; T110 II acquistato candidato sostitutivo, da qualificare | INV-033 / 046 / 039 |
| S1 | ASRock Q1900M / Celeron J1900 | 8 GB, 2 x 4 Hynix PC3-10600U | Linux: Caddy, Vaultwarden, notifiche e utilita; fuori cluster | INV-034 / 049 / 041, esemplari da associare |
| S2 | Oracle Cloud Always Free, candidata A1 | Proposta: 1 OCPU / 4 GB / boot 50 GB | Osservazione esterna e relay; attivazione successiva; niente voto | Piano Oracle; nessun account/VM attivato qui |
| S3 | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Linux: Sonoff ZBDongle-P, Zigbee2MQTT e dashboard leggera; fuori cluster | Prodotto/seriale da associare, Wyse radio |
| S4 | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Sentinella indipendente e primo mittente WoL; nessun voto nella base 4.4 | Wyse sentinella, codice esemplare da associare |
| C1 | Dell OptiPlex 7070 Ultra / i5-8265U | 8 GB censiti, nessun LLM locale | Vito W639: nodo mobile lavoro/camper autonomo; offline, LTE e recupero; fuori quorum | INV-079, esemplare C1 |
| C2 | Dell OptiPlex 7070 Ultra / i5-8265U | 8 GB censiti, espansione solo se necessaria | Cucina: client Linux, streaming/Moonlight e pannello casa | INV-079, esemplare C2 |
| C3 | Dell OptiPlex 7070 Ultra / i5-8265U | 16 GB base HA, riscontro risorse | Proxmox client Linux e subentro HAOS/MQTT, senza Hermes | INV-079, esemplare C3 |
| C4 | Dell OptiPlex 7070 Ultra / i5-8265U | 16 GB base HA, riscontro risorse | Proxmox nucleo: client Linux, riserva app selezionate, secondo mittente WoL | INV-079, esemplare C4 |
| MP3 | Acer Aspire 7 A715-42G-R2VB / Ryzen 7 5700U / RTX3050 Ti 4 GB | 16 GB / Crucial P3 Plus1 TB | Acer sempre fisso in laboratorio: Windows lavoro/gioco, Sunshine; OpenClaw di lavoro e Hermes da predisporre | MP3, codice INV da associare; dotazione dichiarata utente |
| MP2 | Apple MacBook Air M1 | 8 GB / SSD256 GB | Scambio ancora in sospeso: opzione MacBook Air, non postazione necessaria della 4.3 | INV-096, esemplare MP2 |
| MP4 | ASUS X99-DELUXE / i7-5930K / RTX2080 | 32 GB DDR4 | PC primo fratello, esterno all’infrastruttura | INV-029/043/035/055 |
| MP5 | ASRock X79 Extreme3 / i7-3820 | DDR3UDIMM, taglio e altri pezzi da associare | Ipotesi PC secondo fratello subordinata allo scambio Air ancora in sospeso; kit X79 da testare | INV-031/044; nessun componente server sottratto |
| Wyse laboratorio | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Jellyfin, musica e pannello Home Assistant; affianca Acer | Codice C e INV da associare |
| Wyse studio | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Monitor e client audio verso Behringer CONTROL2USB | Codice C e INV da associare |
| Wyse Hi-Fi salone | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Client Hi-Fi verso DAC ES9038Q2M USB | Codice C e INV da associare |
| HP amico 1 | HP t520 | 4 GB / Apacer M.2 8 GB | Client esterno Ethernet: LibreELEC, Jellyfin e offline USB | INV-078, codice CE e seriale da associare |
| HP amico 2 | HP t520 | 4 GB / Apacer M.2 8 GB | Client esterno Ethernet: LibreELEC, Jellyfin e offline USB | INV-078, codice CE e seriale da associare |
| Microtech ingresso | Microtech EBL14B | Dotazione da riscontrare; modello 4 GB/64 GB eMMC | Pannello citofono/allarme, display e batteria integrati; fuori cluster | Codice MP/INV e seriale da associare |
| T110 II | Dell PowerEdge T110 II / E3-1220 v2 | 8 GB dichiarati | Riserva candidata per M7 e disponibilita unita RDX SATA | Prodotto/seriale da associare; lotto acquistato 150 EUR |
| Kindle recuperato | Kindle 11a generazione USB-C | Modello base/Paperwhite da associare | Biblioteca tecnica e plancia compatta; dispositivo personale | Codice MD/INV da associare |

Le assegnazioni Q3/Q3A si chiudono dopo il controllo dei bus: M2 richiede due NVMe simultanei e Mellanox; M5 un percorso Hailo con boot SATA; M6 GPU e NIC simultanee. Prima di comprare adattatori si verificano schede ricevute e revisione. [[REV4-PCIE]] · [[REV4-RAM]] · [[REV4-VITO]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-01.18



# INF-01.18 · Magazzino e componenti liberati

| Identita | Prodotto | Saldo di progetto | Condizione |
| --- | --- | --- | --- |
| INV-031 / 044 | ASRock X79 Extreme3 + i7-3820 | 1 kit | Kit da testare; scenario secondo fratello solo se scambio Air confermato |
| INV-075 / 099 | DDR3 RDIMM 16 GB, lotto PC3 + Kingston | 5 moduli / 80 GB | 13 - 8 M3; nessun PC3 non-L contato nel lotto PC3L |
| INV-036 | ELPIDA 4 GB 2Rx4 PC3-10600R-9-10-E1 | 5 / 20 GB | RDIMM legacy liberi |
| INV-037 | Hynix 4 GB 2Rx4 PC3-10600R-9-10-E1 | 9 / 36 GB | RDIMM legacy liberi |
| INV-040 | Kingston 99U5474-038.A00LF | 1 / 4 GB | Tipologia ECC non attestata: non contato RDIMM |
| INV-042 | Nanya NT2GC72B8PA0NF-CG | 1 / 2 GB | ECC UDIMM da registro, identita da etichetta |
| INV-010 | Western Digital WD3200AAJS 320 GB | 1 | Magazzino; stato attuale non misurato |
| INV-011 | Western Digital WD1601ABYS 160 GB | 1 | Magazzino; stato attuale non misurato |
| INV-012 | Western Digital WD1600AAJS 160 GB | 1 | Magazzino; stato attuale non misurato |
| INV-014 / 015 / 016 | HGST Z7K500-500 / Hitachi Z5K500-500 / HGST Z5K500-500 | 1 ciascuno | Tre HDD da 500 GB; salute attuale non attestata |
| INV-057 | Gigabyte GV-N970G1 GAMING-4GD / GTX970 | 1 | GPU libera da registro; nessuna assegnazione implicita a Frigate |
| INV-058 | Sapphire Radeon HD6570 4 GB | 1 | GPU libera da registro |
| INV-065 / 066 | Intel EXPI9301CTBLK / EXPI9300PTBLK | 1 ciascuna | NIC Gigabit libere |
| INV-068 | HP NC380T | 1 | NIC dual Gigabit libera; non acquistata una nuova NIC per M7 |
| INV-069 / 070 | Fenvi FV-AC1200 / FV-AXE3000 | 1 ciascuna | Adattatori Wi-Fi liberi |
| INV-071 | ASUS Hyper M.2 X4 | 1 | Adattatore libero; compatibilita per ruolo non presunta |
| INV-018 | corsair flash voyager slider | 1 | Supporto a magazzino; capacita/stato come registro, senza valori inventati |
| INV-019 | lexar ljds73-16g | 1 | Supporto a magazzino; capacita/stato come registro, senza valori inventati |
| INV-020 | verbatim usb 2.0 | 2 | Supporto a magazzino; capacita/stato come registro, senza valori inventati |
| INV-021 | kingston data traveler 100g3 | 1 | Supporto a magazzino; capacita/stato come registro, senza valori inventati |
| INV-022 | tdk 16gb | 1 | Supporto a magazzino; capacita/stato come registro, senza valori inventati |
| INV-023 | tohaoll u1 v10 hc | 1 | Supporto a magazzino; capacita/stato come registro, senza valori inventati |
| INV-024 | kingston sdc10g2/64gb | 1 | Supporto a magazzino; capacita/stato come registro, senza valori inventati |
| INV-025 | lexar 800x pro | 1 | Supporto a magazzino; capacita/stato come registro, senza valori inventati |
| INV-026 | generic | 1 | Supporto a magazzino; capacita/stato come registro, senza valori inventati |
| INV-027 | generic class 6 | 1 | Supporto a magazzino; capacita/stato come registro, senza valori inventati |
| INV-028 | generic class 4 | 1 | Supporto a magazzino; capacita/stato come registro, senza valori inventati |
| INV-029/043/035/055 | X99-DELUXE+i75930K+32 GB DDR4+RTX2080 | 1 postazione | MP4 PC primo fratello, non magazzino libero |
| INV-001 | WD10EAVS1 TB | 2 residui | Sei altri a M4; due WD10EZRX a M6; salute da verificare |
| INV-003/004/007 | EVO 250 / V300 120 / V200 120 | Zero liberi in progetto | M5 / M6 / M1 confermati recuperabili |
| INV-084/085 | Tre Samsung NVMe256 GB | Saldo aperto | Riconteggio fisico prima delle destinazioni; SSD Aspire1 TB e Air256 GB non sono questi NVMe |
| INV-038 | HyperX 4 GB DDR3 | 4 moduli / 16 GB da liberare | M1 passa a DDR4; disponibilita fisica dopo dismissione vecchia scheda |
| INV-041 | Hynix 4 GB2Rx8 PC3-10600U | 2 dichiarati per S1 | Registro precedente uno: identificare secondo esemplare senza duplicazioni |
| INV-083 | Quadro NVS290 | 2 censite | Variante PCIex1 riferita; una possibile console M7, non acquistata nuova |
| PSU da associare | 6ATX +Delta DPS250AB49L +gruppo AC0632A/2DPS750RBA | Saldo non libero | Gruppo ridondante non equivale a due alimentatori ATX separati |
| INV-059..064 | 5rack4U +frontale10tray3, 5 senza backplane | Un rack mancante | 50 EUR usato; M4 riusafrontale, S1 chassis HPaccorciato; riconciliare DL180/380 |
| INV-078 | Due HP t520 | 0 liberi | Due client esterni per amici; ruoli S3/S4 trasferiti ai Wyse |
| Halo H1900G | Tre Mercusys | 0 liberi oggi | Wi-Fi casa attuale; domotica dopo sostituzione |
| Lotto Dell 2026-10-29 | T110 II E3-1220 v2/8 GB + RDX SATA + 5 Wyse 4/32 | 150 EUR complessivi | Tutti gli alimentatori Wyse, nessuna cartuccia; codici da associare |
| Wyse 3030 N03D | Cinque esemplari | 0 liberi | Laboratorio, S3, S4, studio, Hi-Fi salone |
| Microtech EBL14B | Recuperato | 0 libero in progetto | Pannello ingresso; dotazione e batteria da riscontrare |
| Kindle USB-C 11a gen | Un solo recuperato | Assegnato uso personale | Modello da identificare; altro Kindle non ritrovato |
| INV-032/072 | MSI H97M-ECO / i5-4570T | Da liberare dopo M1 nuovo | Riserva o riuso, non acquisto |
| INV-067 | LSI9207-8i | Non necessaria a M2 con due NVMe | Conservata per futuro pool SSD, non venduta |
| INV-045 | E5-2630L v2 | Non assegnato a M6 nuovo | Z9PA-U8 non piu in lista acquisti |

I saldi sono di progetto: un componente diventa libero fisicamente soltanto dopo la migrazione del nodo precedente. Non vendere o riutilizzare la riserva necessaria al rollback. [[REV3-STATO]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-01.19



# INF-01.19 · Catalogo prodotti e assegnazioni

| Codice | Prodotto / quantita | Assegnazione | Stato |
| --- | --- | --- | --- |
| INV-001 | Western Digital WD10EAVS 1 TB / 8 | 6WD10EAVS a M4 RAIDZ2; 2riserva | ASSEGNAZIONE DI CONFIGURAZIONE |
| INV-002 | Western Digital WD10EZRX 1 TB / 2 | 2WD10EZRX mirror M6 Seafile/audio | ASSEGNAZIONE DI CONFIGURAZIONE |
| INV-003 | Samsung 850 EVO 250 GB / 1 | M5 boot | RECUPERABILE CONFERMATO |
| INV-004 | Kingston SSDNow V300 120 GB / 1 | M6 boot | RECUPERABILE CONFERMATO |
| INV-005 | Crucial P310 4 TB + Lexar E750 / 1 | Arca fino a gate migrazione, poi M2 dati provvisori | CENSITO |
| INV-006 | Western Digital PC SN530 512 GB / 1 | M3 / Proxmox e IA | CENSITO |
| INV-007 | Kingston SSDNow V200 120 GB / 1 | M1 boot | RECUPERABILE CONFERMATO |
| INV-008 | Samsung 850 EVO 500 GB / 1 | M6 download/staging | CENSITO |
| INV-009 | Sabrent Rocket 512 GB / 1 | M2 / boot | CENSITO |
| INV-010 | Western Digital WD3200AAJS 320 GB / 1 | Non assegnato / magazzino | STATO DA INVENTARIO |
| INV-011 | Western Digital WD1601ABYS 160 GB / 1 | Non assegnato / magazzino | STATO DA INVENTARIO |
| INV-012 | Western Digital WD1600AAJS 160 GB / 1 | Non assegnato / magazzino | STATO DA INVENTARIO |
| INV-013 | Seagate ST1000LM024 1 TB / 2 | M5 / registrazioni Frigate | STATO DA INVENTARIO |
| INV-014 | HGST Z7K500-500 / 1 | Non assegnato / magazzino | STATO DA INVENTARIO |
| INV-015 | Hitachi Z5K500-500 / 1 | Non assegnato / magazzino | STATO DA INVENTARIO |
| INV-016 | HGST Z5K500-500 / 1 | Non assegnato / magazzino | STATO DA INVENTARIO |
| INV-018 | corsair flash voyager slider / 1 | Non assegnato / magazzino | CENSITO |
| INV-019 | lexar ljds73-16g / 1 | Non assegnato / magazzino | CENSITO |
| INV-020 | verbatim usb 2.0 / 2 | Non assegnato / magazzino | STATO DA INVENTARIO |
| INV-021 | kingston data traveler 100g3 / 1 | Non assegnato / magazzino | STATO DA INVENTARIO |
| INV-022 | tdk 16gb / 1 | Non assegnato / magazzino | STATO DA INVENTARIO |
| INV-023 | tohaoll u1 v10 hc / 1 | Non assegnato / magazzino | CENSITO |
| INV-024 | kingston sdc10g2/64gb / 1 | Non assegnato / magazzino | STATO DA INVENTARIO |
| INV-025 | lexar 800x pro / 1 | Non assegnato / magazzino | CENSITO |
| INV-026 | generic / 1 | Non assegnato / magazzino | STATO DA INVENTARIO |
| INV-027 | generic class 6 / 1 | Non assegnato / magazzino | STATO DA INVENTARIO |
| INV-028 | generic class 4 / 1 | Non assegnato / magazzino | STATO DA INVENTARIO |
| INV-029 | ASUS X99-DELUXE / 1 | MP4, PC primo fratello nella configurazione 4.2 | STATO DA INVENTARIO |
| INV-030 | HUANANZHI X99-T8 / 1 | M3 | STATO DA INVENTARIO |
| INV-031 | ASRock X79 Extreme3 / 1 | Kit X79 da testare; scenario MP5 condizionato a scambio Air | DA TESTARE / ASSEGNAZIONE DI CONFIGURAZIONE |
| INV-032 | MSI H97M-ECO / 1 | Vecchio M1; riserva dopo migrazione verificata | STATO DA INVENTARIO |
| INV-033 | ASUS H61M-K / 1 | M7 / router di riserva manuale | STATO DA INVENTARIO |
| INV-034 | ASRock Q1900M / 1 | S1 / utilita locali | STATO DA INVENTARIO |
| INV-035 | G.Skill F4-2666C15Q-32GVR / moduli 8 GB / 4 | MP4, PC primo fratello nella configurazione 4.2 | CENSITO |
| INV-036 | ELPIDA 4 GB 2Rx4 PC3-10600R-9-10-E1 / 5 | Non assegnato / magazzino | STATO DA INVENTARIO |
| INV-037 | hynix 4 GB 2Rx4 PC3-10600R-9-10-E1 / 9 | Non assegnato / magazzino | STATO DA INVENTARIO |
| INV-038 | Kingston HyperX DDR3 4 GB / 8 | Vecchio M1, quattro moduli da liberare dopo transizione | SALDO CON RISERVA PROPOSTA |
| INV-039 | Kingston HyperX DDR3 8 GB / 2 | M7 / 2 moduli | STATO DA INVENTARIO |
| INV-040 | 99u5474-038.a00lf / 1 | Non assegnato / magazzino | STATO DA INVENTARIO |
| INV-041 | hynix 4gb 2rx8 pc3-10600u-9-11-b1 / 1 | Non assegnato / magazzino | STATO DA INVENTARIO |
| INV-042 | nanya nt2gc72b8pa0nf-cg / 1 | Non assegnato / magazzino | STATO DA INVENTARIO |
| INV-043 | Intel Core i7-5930K / 1 | MP4, PC primo fratello nella configurazione 4.2 | STATO DA INVENTARIO |
| INV-044 | Intel Core i7-3820 / 1 | Kit X79 da testare; scenario MP5 condizionato a scambio Air | DA TESTARE / ASSEGNAZIONE DI CONFIGURAZIONE |
| INV-045 | Intel Xeon E5-2630L v2 / 1 | M6 / CPU1, secondo socket vuoto | STATO DA INVENTARIO |
| INV-046 | Intel Xeon E3-1220L v2 / 1 | M7 / router di riserva manuale | STATO DA INVENTARIO |
| INV-047 | Intel Xeon E3-1265L v3 / 1 | M4 | STATO DA INVENTARIO |
| INV-048 | Intel Xeon E5-2678 v3 / 1 | M3 | STATO DA INVENTARIO |
| INV-049 | Intel Celeron J1900 / 1 | S1 / CPU saldata alla Q1900M | STATO DA INVENTARIO |
| INV-050 | be quiet! Dark Power Pro 850 W / 1 | M3 | STATO DA INVENTARIO |
| INV-051 | Cooler Master RS-700-ASAB-L3 / 1 | M4 | STATO DA INVENTARIO |
| INV-052 | Thermaltake Smart SE SPS-730M / 1 | Mappa boot / alimentazione / telai da completare; non contato libero con certezza | STATO DA INVENTARIO |
| INV-053 | Corsair CX500 CP-9020047 / 1 | M2 | STATO DA INVENTARIO |
| INV-054 | FSP ATX-350PNF / 2 | Mappa boot / alimentazione / telai da completare; non contato libero con certezza | STATO DA INVENTARIO |
| INV-055 | ZOTAC GeForce RTX2080 Blower 8 GB / 1 | MP4, PC primo fratello nella configurazione 4.2 | STATO DA INVENTARIO |
| INV-057 | Gigabyte GV-N970G1 GAMING-4GD / 1 | Non assegnato / magazzino | STATO DA INVENTARIO |
| INV-058 | Sapphire Radeon HD6570 4 GB / 1 | Non assegnato / magazzino | STATO DA INVENTARIO |
| INV-059 | Case rack 4U / telaio INV-059 / 1 | Mappa boot / alimentazione / telai da completare; non contato libero con certezza | CENSITO |
| INV-060 | Case rack 4U / telaio INV-060 / 1 | M3 / telaio | CENSITO |
| INV-061 | Case rack 4U / telaio INV-061 / 1 | M1 / telaio | CENSITO |
| INV-062 | Case rack 4U / telaio INV-062 / 1 | Mappa boot / alimentazione / telai da completare; non contato libero con certezza | CENSITO |
| INV-063 | Case rack 4U / telaio INV-063 / 1 | Mappa boot / alimentazione / telai da completare; non contato libero con certezza | CENSITO |
| INV-064 | HP ProLiant DL180 G6 / frontale e 10 tray / 1 | Non assegnato / magazzino | STATO DA INVENTARIO |
| INV-065 | Intel EXPI9301CTBLK / 1 | Non assegnato / magazzino | STATO DA INVENTARIO |
| INV-066 | Intel EXPI9300PTBLK / 1 | Non assegnato / magazzino | STATO DA INVENTARIO |
| INV-067 | LSI SAS9207-8i / 1 | Riserva futuro pool SSD M2 | STATO DA INVENTARIO |
| INV-068 | HP NC380T / 1 | Non assegnato / magazzino | STATO DA INVENTARIO |
| INV-069 | Fenvi FV-AC1200 / 1 | Non assegnato / magazzino | STATO DA INVENTARIO |
| INV-070 | Fenvi FV-AXE3000 / 1 | Non assegnato / magazzino | STATO DA INVENTARIO |
| INV-071 | ASUS Hyper M.2 X4 / 1 | Magazzino | STATO DA INVENTARIO |
| INV-072 | Intel Core i5-4570T / 1 | Vecchio M1; riserva dopo migrazione verificata | CONFIGURAZIONE |
| INV-073 | ASUS P9D-MH/SAS/10G-DUAL / 1 | M4 | RICEVUTA - DICHIARATO 2026-10-28 |
| INV-074 | D1581-Q3 / Intel Xeon D-1581 / 1 | M5 candidato, Q3 in arrivo | IN ARRIVO DICHIARATO |
| INV-075 | Lotto Samsung DDR3 RDIMM16 GB PC3, MPN per esemplare da etichetta / 7 | Lotto condiviso con INV-099: 8 moduli M3, 4 M6, 1 residuo complessivo | DISPONIBILITA DICHIARATA / IDENTITA INCOMPLETA |
| INV-076 | DDR3 ECC UDIMM 8 GB / codice modulo richiesto / 4 | M4 | IDENTITA INCOMPLETA |
| INV-077 | MSI GeForce RTX3060 Ventus2X 12 GB / 1 | M3 IA | RICEVUTA E MONTATA SU M3 - DICHIARATO 2026-10-26 |
| INV-078 | HP t520 / 2 | Due client esterni per amici; LibreELEC/Jellyfin/offline USB | CONFIGURAZIONE |
| INV-079 | Dell OptiPlex 7070 Ultra / Intel Core i5-8265U / 4 | Quattro 7070: Vito, cucina, camera, salone | CONFIGURAZIONE |
| INV-080 | Mellanox MNPA19-XTR / 1 | Due kit ordinati: NIC M3/M6; AOC 3 m per M2-M3 e M2-M4 | ORDINATO - NON ANCORA RICEVUTO ALLA CONFERMA 2026-10-28 |
| INV-081 | Mellanox MCX312A-XCBT / 1 | M2 | CONFIGURAZIONE |
| INV-082 | GLOTRENDS I226-T4 / 1 | M1 | CONFIGURAZIONE |
| INV-083 | NVIDIA Quadro NVS290 / variante bus da identificare / 2 | Magazzino / console | IDENTITA INCOMPLETA |
| INV-084 | Samsung PM991a 256 GB / 2 | Ripartizione M3 / SH da associare | CONFIGURAZIONE |
| INV-085 | Samsung PM991 256 GB / 1 | Ripartizione M3 / SH da associare | CONFIGURAZIONE |
| INV-086 | Intenso 3835440 PCIe Premium 250 GB / 1 | SH3 | CONFIGURAZIONE |
| INV-087 | Seagate ST2000DM008 2 TB / 4 | M4 / media | CONFIGURAZIONE |
| INV-088 | SSD enterprise480/500 GB di riferimento per M2; SKU da scegliere / 8 | M2 / quattro mirror | DA ACQUISTARE |
| INV-089 | ORICO USB 10Gb/s / bridge RTL9210B-CG / 1 | SH3 / box | CONFIGURAZIONE |
| INV-090 | NETGEAR GS305E / 1 | Rete / ruolo di switch nel registro | CONFIGURAZIONE |
| INV-091 | Google Pixel 7 / 1 | MD1 | CONFIGURAZIONE |
| INV-092 | Google Pixel 10 Pro / 1 | MD2 | CONFIGURAZIONE |
| INV-093 | Apple iPhone 11 / 1 | MD3 | CONFIGURAZIONE |
| INV-094 | Apple iPad / modello richiesto / 1 | MD4 | IDENTITA INCOMPLETA |
| INV-095 | Apple Mac Book principale / modello richiesto / 1 | MP1 | IDENTITA INCOMPLETA |
| INV-096 | Apple MacBook Air M1 / 8 GB / 256 GB / 1 | Scambio Air M1 in sospeso; non postazione obbligatoria 4.3 | SCAMBIO IN SOSPESO |
| INV-097 | Intel Arc A310 / produttore e SKU da indicare / 1 | M6 / Jellyfin | DA ACQUISTARE |
| INV-098 | Hailo-8 / SKU e key da indicare / 1 | M5 / Frigate e vision-gateway | NON ACQUISTATO |
| INV-099 | Kingston KVR16R11D4/16, 16GB2Rx4 PC3-12800R 1.5V / 6 | Lotto condiviso con INV-075: 8 moduli M3, 4 M6, 1 residuo complessivo | DISPONIBILITA DICHIARATA / IDENTITA INCOMPLETA |
| INV-100 | DDR3L 16 GB RDIMM:Micron MT36KSF2G72PZ-1G6E1HF e Samsung M393B2G70DB0-YK0 da foto / 4 | M2 4 x16 GB PC3L | GIA POSSEDUTO, CONFERMA UTENTE 1 NOVEMBRE |
| INV-101 | DDR4 PC4 ECC RDIMM 16 GB / produttore, MPN e velocita da indicare / 2 | M1 32 GB DDR4 ECC RDIMM | DISPONIBILE DICHIARATO 1 NOVEMBRE |
| INV-102 | BKHD C612NP-21 VER1.1 / 1 | Nessuna: ordine BKHD annullato | ORDINE ANNULLATO |
| INV-103 | Intel Xeon E5-2630L v3 / 1 | Nessuna: ordine BKHD annullato | ORDINE ANNULLATO |
| INV-104 | ASUS Z9PR-D12 / 1 | Candidata storica scartata; non riutilizzare il codice | CANDIDATA SCARTATA / NON ACQUISTATA |
| DA-ASSOCIARE-T110-II | Dell PowerEdge T110 II / E3-1220 v2 / 8 GB / 1 | Candidato riserva M7 | ACQUISTO DICHIARATO |
| DA-ASSOCIARE-RDX | RDX QuikStor SATA / generazione da associare / 1 | Copie offline candidate | ACQUISTO DICHIARATO |
| DA-ASSOCIARE-WYSE3030 | Dell Wyse 3030 N03D / 4 GB / 32 GB dichiarati / 5 | Laboratorio; S3; S4; studio; Hi-Fi salone | ACQUISTO DICHIARATO |
| DA-ASSOCIARE-ACER | Acer Aspire 7 A715-42G-R2VB / dotazione dichiarata / 1 | MP3 fisso laboratorio | RIENTRATO - SCAMBIO APPROVATO |
| DA-ASSOCIARE-EBL14B | Microtech EBL14B / 1 | Ingresso: pannello citofono/allarme | RECUPERATO |
| DA-ASSOCIARE-KINDLE | Kindle 11a generazione USB-C, modello da associare / 1 | Biblioteca/plancia personale | RECUPERATO |
| DA-ASSOCIARE-K19S | Dock regolamentare K19S, variante da associare / 1 | Postazioni casa | DISPONIBILE DICHIARATO |

Le nuove aggiunte A44 hanno identificativo provvisorio nel registro acquisti; non riutilizzare un codice INV esistente. [[REV3-ACQ]]


## INF-01.09



# INF-01.09 · Architettura e apparati della revisione 4.4

La 4.4 e una configurazione di progetto, non un verbale di installazione. Acquisti e riscontri sono distinti in [[REV3-STATO]]. Le tre D1581 sono in arrivo; la RAM Vinted e ancora in trattativa.

Il nucleo stabile proposto comprende M1, M2, M5, C3 e C4: cinque voti, quorum tre. M3, M4 e M6 sono host Proxmox autonomi accesi secondo necessita. S4 osserva e invia WoL senza voto. Il Vito e un nodo mobile indipendente, non un membro del cluster.

| Apparato | Piattaforma | Memoria e storage | Responsabilita | Identita |
| --- | --- | --- | --- | --- |
| M1 | MACHINIST X99 PR9-H / Xeon E5-2630L v3 dichiarato, SKU da identificare | 32 GB DDR4 ECC RDIMM, 2 x 16, disponibili | Proxmox: OPNsense VM e osservabilita separata; nucleo sempre acceso | INV-101 RAM / nuova scheda da associare |
| M2 | D1581-Q3A / Xeon D-1581, assegnazione di progetto | 64 GB PC3L RDIMM, 4 x 16 gia posseduti | Proxmox: app personali; P310 4 TB provvisorio dopo liberazione Arca; nucleo sempre acceso | INV-100 / 005 / 009 / Q3A nuova |
| M3 | HUANANZHI X99-T8 / E5-2678 v3 | 128 GB, 8 x 16 DDR3 RDIMM | Proxmox autonomo IA su richiesta; RTX 3060 12 GB; nessun voto nel nucleo | INV-030 / 048 / 077 |
| M4 | ASUS P9D-MH/SAS/10G-DUAL / E3-1265L v3 | 32 GB, 4 x 8 ECC UDIMM | Proxmox autonomo/ZFS: WD solo backup dopo transizione; media separati, acceso per richiesta/job | INV-073 / 047 / 076 |
| M5 | D1581-Q3 / Xeon D-1581, assegnazione condizionata al bus Hailo | 32 GB PC3L RDIMM, 2 x 16 dal lotto ancora in trattativa | Proxmox: HAOS, MQTT, Frigate/Hailo; nucleo sempre acceso | INV-074 / lotto RAM nuovo / INV-098 candidato |
| M6 | D1581-Q3A / Xeon D-1581, assegnazione condizionata a GPU e NIC | 64 GB PC3L RDIMM, 4 x 16 dal lotto ancora in trattativa | Proxmox autonomo: media, Seafile, download; acceso a richiesta | Q3A nuova / Arc candidata / INV-097 |
| M7 | ASUS H61M-K / E3-1220L v2 | 16 GB, 2 x 8 DDR3 | Riserva manuale H61M-K; T110 II acquistato candidato sostitutivo, da qualificare | INV-033 / 046 / 039 |
| S1 | ASRock Q1900M / Celeron J1900 | 8 GB, 2 x 4 Hynix PC3-10600U | Linux: Caddy, Vaultwarden, notifiche e utilita; fuori cluster | INV-034 / 049 / 041, esemplari da associare |
| S2 | Oracle Cloud Always Free, candidata A1 | Proposta: 1 OCPU / 4 GB / boot 50 GB | Osservazione esterna e relay; attivazione successiva; niente voto | Piano Oracle; nessun account/VM attivato qui |
| S3 | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Linux: Sonoff ZBDongle-P, Zigbee2MQTT e dashboard leggera; fuori cluster | Prodotto/seriale da associare, Wyse radio |
| S4 | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Sentinella indipendente e primo mittente WoL; nessun voto nella base 4.4 | Wyse sentinella, codice esemplare da associare |
| C1 | Dell OptiPlex 7070 Ultra / i5-8265U | 8 GB censiti, nessun LLM locale | Vito W639: nodo mobile lavoro/camper autonomo; offline, LTE e recupero; fuori quorum | INV-079, esemplare C1 |
| C2 | Dell OptiPlex 7070 Ultra / i5-8265U | 8 GB censiti, espansione solo se necessaria | Cucina: client Linux, streaming/Moonlight e pannello casa | INV-079, esemplare C2 |
| C3 | Dell OptiPlex 7070 Ultra / i5-8265U | 16 GB base HA, riscontro risorse | Proxmox client Linux e subentro HAOS/MQTT, senza Hermes | INV-079, esemplare C3 |
| C4 | Dell OptiPlex 7070 Ultra / i5-8265U | 16 GB base HA, riscontro risorse | Proxmox nucleo: client Linux, riserva app selezionate, secondo mittente WoL | INV-079, esemplare C4 |
| MP3 | Acer Aspire 7 A715-42G-R2VB / Ryzen 7 5700U / RTX3050 Ti 4 GB | 16 GB / Crucial P3 Plus1 TB | Acer sempre fisso in laboratorio: Windows lavoro/gioco, Sunshine; OpenClaw di lavoro e Hermes da predisporre | MP3, codice INV da associare; dotazione dichiarata utente |
| MP2 | Apple MacBook Air M1 | 8 GB / SSD256 GB | Scambio ancora in sospeso: opzione MacBook Air, non postazione necessaria della 4.3 | INV-096, esemplare MP2 |
| MP4 | ASUS X99-DELUXE / i7-5930K / RTX2080 | 32 GB DDR4 | PC primo fratello, esterno all’infrastruttura | INV-029/043/035/055 |
| MP5 | ASRock X79 Extreme3 / i7-3820 | DDR3UDIMM, taglio e altri pezzi da associare | Ipotesi PC secondo fratello subordinata allo scambio Air ancora in sospeso; kit X79 da testare | INV-031/044; nessun componente server sottratto |
| Wyse laboratorio | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Jellyfin, musica e pannello Home Assistant; affianca Acer | Codice C e INV da associare |
| Wyse studio | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Monitor e client audio verso Behringer CONTROL2USB | Codice C e INV da associare |
| Wyse Hi-Fi salone | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Client Hi-Fi verso DAC ES9038Q2M USB | Codice C e INV da associare |
| HP amico 1 | HP t520 | 4 GB / Apacer M.2 8 GB | Client esterno Ethernet: LibreELEC, Jellyfin e offline USB | INV-078, codice CE e seriale da associare |
| HP amico 2 | HP t520 | 4 GB / Apacer M.2 8 GB | Client esterno Ethernet: LibreELEC, Jellyfin e offline USB | INV-078, codice CE e seriale da associare |
| Microtech ingresso | Microtech EBL14B | Dotazione da riscontrare; modello 4 GB/64 GB eMMC | Pannello citofono/allarme, display e batteria integrati; fuori cluster | Codice MP/INV e seriale da associare |
| T110 II | Dell PowerEdge T110 II / E3-1220 v2 | 8 GB dichiarati | Riserva candidata per M7 e disponibilita unita RDX SATA | Prodotto/seriale da associare; lotto acquistato 150 EUR |
| Kindle recuperato | Kindle 11a generazione USB-C | Modello base/Paperwhite da associare | Biblioteca tecnica e plancia compatta; dispositivo personale | Codice MD/INV da associare |

Le assegnazioni Q3/Q3A si chiudono dopo il controllo dei bus: M2 richiede due NVMe simultanei e Mellanox; M5 un percorso Hailo con boot SATA; M6 GPU e NIC simultanee. Prima di comprare adattatori si verificano schede ricevute e revisione. [[REV4-PCIE]] · [[REV4-RAM]] · [[REV4-VITO]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-01.16



# INF-01.16 · M6: media, servizi esterni e margine di calcolo

M6 usa la seconda D1581-Q3A, con 64 GB PC3L dal lotto Vinted ancora in trattativa. La Z9PA-U8 esce dalla lista acquisti; il vecchio E5-2630L v2 non viene conteggiato come CPU della nuova scheda. M6 e Proxmox autonomo, fuori dai voti del nucleo stabile, acceso su richiesta o durante download e lavoro autorizzato.

Arc A310 rimane candidata, non acquistata. Prima verificare GPU e MNPA19-XTR simultanee: slot, linee, ingombri, BIOS e driver. Se manca questa possibilita, avvio con rete integrata e direct play/media preparati; non comprare un adattatore presumendo biforcazione. L'assenza di ReBAR non prova da sola che ogni transcodifica sia impossibile: si collauda il percorso reale.

Separare cloud Seafile, Jellyfin/audio e download/arr in ambienti con account, mount e limiti distinti. Preferire LXC non privilegiati dove supportati; non promettere isolamento da VM per container che condividono kernel. Nessun downloader nella rete fidata generale.

V300 120 GB per boot; EVO 500 GB per staging e spazio SSD quotato di DB; due WD10EZRX da 1 TB in mirror per Seafile e audio locale. Dieci utenti per 50 GB significa 500 GB, con margine separato per versioni/audio. Seafile esterno mantiene la scelta gia esplicita: niente backup aggiuntivo automatico dei contenuti su M4 o Drive. Il caricamento totale della transizione va riconciliato per eventuali dati di terzi prima di includerli.

La RAM aggiuntiva puo sostenere servizi e cache del pool locale. I film archiviati su M4 non beneficiano automaticamente dell'ARC di M6. Temporanei di transcodifica in RAM solo con quote e dati ricreabili. Avviare M4 quando il file richiesto e remoto, attendere readiness e non spegnerlo durante una visione. Nessun timer M6 imposto senza osservazione. [[REV4-RAM]] · [[REV4-MON]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-01.02



# INF-01.02 · Architettura e apparati della revisione 4.4

La 4.4 e una configurazione di progetto, non un verbale di installazione. Acquisti e riscontri sono distinti in [[REV3-STATO]]. Le tre D1581 sono in arrivo; la RAM Vinted e ancora in trattativa.

Il nucleo stabile proposto comprende M1, M2, M5, C3 e C4: cinque voti, quorum tre. M3, M4 e M6 sono host Proxmox autonomi accesi secondo necessita. S4 osserva e invia WoL senza voto. Il Vito e un nodo mobile indipendente, non un membro del cluster.

| Apparato | Piattaforma | Memoria e storage | Responsabilita | Identita |
| --- | --- | --- | --- | --- |
| M1 | MACHINIST X99 PR9-H / Xeon E5-2630L v3 dichiarato, SKU da identificare | 32 GB DDR4 ECC RDIMM, 2 x 16, disponibili | Proxmox: OPNsense VM e osservabilita separata; nucleo sempre acceso | INV-101 RAM / nuova scheda da associare |
| M2 | D1581-Q3A / Xeon D-1581, assegnazione di progetto | 64 GB PC3L RDIMM, 4 x 16 gia posseduti | Proxmox: app personali; P310 4 TB provvisorio dopo liberazione Arca; nucleo sempre acceso | INV-100 / 005 / 009 / Q3A nuova |
| M3 | HUANANZHI X99-T8 / E5-2678 v3 | 128 GB, 8 x 16 DDR3 RDIMM | Proxmox autonomo IA su richiesta; RTX 3060 12 GB; nessun voto nel nucleo | INV-030 / 048 / 077 |
| M4 | ASUS P9D-MH/SAS/10G-DUAL / E3-1265L v3 | 32 GB, 4 x 8 ECC UDIMM | Proxmox autonomo/ZFS: WD solo backup dopo transizione; media separati, acceso per richiesta/job | INV-073 / 047 / 076 |
| M5 | D1581-Q3 / Xeon D-1581, assegnazione condizionata al bus Hailo | 32 GB PC3L RDIMM, 2 x 16 dal lotto ancora in trattativa | Proxmox: HAOS, MQTT, Frigate/Hailo; nucleo sempre acceso | INV-074 / lotto RAM nuovo / INV-098 candidato |
| M6 | D1581-Q3A / Xeon D-1581, assegnazione condizionata a GPU e NIC | 64 GB PC3L RDIMM, 4 x 16 dal lotto ancora in trattativa | Proxmox autonomo: media, Seafile, download; acceso a richiesta | Q3A nuova / Arc candidata / INV-097 |
| M7 | ASUS H61M-K / E3-1220L v2 | 16 GB, 2 x 8 DDR3 | Riserva manuale H61M-K; T110 II acquistato candidato sostitutivo, da qualificare | INV-033 / 046 / 039 |
| S1 | ASRock Q1900M / Celeron J1900 | 8 GB, 2 x 4 Hynix PC3-10600U | Linux: Caddy, Vaultwarden, notifiche e utilita; fuori cluster | INV-034 / 049 / 041, esemplari da associare |
| S2 | Oracle Cloud Always Free, candidata A1 | Proposta: 1 OCPU / 4 GB / boot 50 GB | Osservazione esterna e relay; attivazione successiva; niente voto | Piano Oracle; nessun account/VM attivato qui |
| S3 | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Linux: Sonoff ZBDongle-P, Zigbee2MQTT e dashboard leggera; fuori cluster | Prodotto/seriale da associare, Wyse radio |
| S4 | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Sentinella indipendente e primo mittente WoL; nessun voto nella base 4.4 | Wyse sentinella, codice esemplare da associare |
| C1 | Dell OptiPlex 7070 Ultra / i5-8265U | 8 GB censiti, nessun LLM locale | Vito W639: nodo mobile lavoro/camper autonomo; offline, LTE e recupero; fuori quorum | INV-079, esemplare C1 |
| C2 | Dell OptiPlex 7070 Ultra / i5-8265U | 8 GB censiti, espansione solo se necessaria | Cucina: client Linux, streaming/Moonlight e pannello casa | INV-079, esemplare C2 |
| C3 | Dell OptiPlex 7070 Ultra / i5-8265U | 16 GB base HA, riscontro risorse | Proxmox client Linux e subentro HAOS/MQTT, senza Hermes | INV-079, esemplare C3 |
| C4 | Dell OptiPlex 7070 Ultra / i5-8265U | 16 GB base HA, riscontro risorse | Proxmox nucleo: client Linux, riserva app selezionate, secondo mittente WoL | INV-079, esemplare C4 |
| MP3 | Acer Aspire 7 A715-42G-R2VB / Ryzen 7 5700U / RTX3050 Ti 4 GB | 16 GB / Crucial P3 Plus1 TB | Acer sempre fisso in laboratorio: Windows lavoro/gioco, Sunshine; OpenClaw di lavoro e Hermes da predisporre | MP3, codice INV da associare; dotazione dichiarata utente |
| MP2 | Apple MacBook Air M1 | 8 GB / SSD256 GB | Scambio ancora in sospeso: opzione MacBook Air, non postazione necessaria della 4.3 | INV-096, esemplare MP2 |
| MP4 | ASUS X99-DELUXE / i7-5930K / RTX2080 | 32 GB DDR4 | PC primo fratello, esterno all’infrastruttura | INV-029/043/035/055 |
| MP5 | ASRock X79 Extreme3 / i7-3820 | DDR3UDIMM, taglio e altri pezzi da associare | Ipotesi PC secondo fratello subordinata allo scambio Air ancora in sospeso; kit X79 da testare | INV-031/044; nessun componente server sottratto |
| Wyse laboratorio | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Jellyfin, musica e pannello Home Assistant; affianca Acer | Codice C e INV da associare |
| Wyse studio | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Monitor e client audio verso Behringer CONTROL2USB | Codice C e INV da associare |
| Wyse Hi-Fi salone | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Client Hi-Fi verso DAC ES9038Q2M USB | Codice C e INV da associare |
| HP amico 1 | HP t520 | 4 GB / Apacer M.2 8 GB | Client esterno Ethernet: LibreELEC, Jellyfin e offline USB | INV-078, codice CE e seriale da associare |
| HP amico 2 | HP t520 | 4 GB / Apacer M.2 8 GB | Client esterno Ethernet: LibreELEC, Jellyfin e offline USB | INV-078, codice CE e seriale da associare |
| Microtech ingresso | Microtech EBL14B | Dotazione da riscontrare; modello 4 GB/64 GB eMMC | Pannello citofono/allarme, display e batteria integrati; fuori cluster | Codice MP/INV e seriale da associare |
| T110 II | Dell PowerEdge T110 II / E3-1220 v2 | 8 GB dichiarati | Riserva candidata per M7 e disponibilita unita RDX SATA | Prodotto/seriale da associare; lotto acquistato 150 EUR |
| Kindle recuperato | Kindle 11a generazione USB-C | Modello base/Paperwhite da associare | Biblioteca tecnica e plancia compatta; dispositivo personale | Codice MD/INV da associare |

Le assegnazioni Q3/Q3A si chiudono dopo il controllo dei bus: M2 richiede due NVMe simultanei e Mellanox; M5 un percorso Hailo con boot SATA; M6 GPU e NIC simultanee. Prima di comprare adattatori si verificano schede ricevute e revisione. [[REV4-PCIE]] · [[REV4-RAM]] · [[REV4-VITO]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-01.13



# INF-01.13 · Alimentatori, telai e assemblaggio

Cinque case4U censiti:due profondi46cm, tre ex ATM37cm secondo fonti; associazione ai singoli INV da riscontro. Unrack aggiuntivo50 EUR usato, non scelto. M7 e Deluxe hanno casepropri. S1 riusa chassis HPDL380G6accorciato; M4 frontale10tray3,5senza backplane. Vecchio INV064DL180G6da riconciliare, non duplicare chassis o rinominare prodotto per ipotesi. Cavi dichiarati6/8SATAda1m sono dati, alimentazioni corrispondenti disponibili; connettori controllerda verificare.

Sei ATX censiti:bequiet850 W, Cooler Master700 W, Thermaltake730 W, Corsair CX500,2FSP350 W. Aggiunti Delta DPS250AB49L ebackplane AC0632A con 2DPS750RBA. Ilgruppo ridondante e una possibile soluzione per un nodo, non due ATXstandard o1500Wridondanti garantiti. Pinout/start/standby/ATX-EPS ecompatibilita non attestati: nessun cablaggioelettrico inventato.

Ripartizione PSU/boot/telai resta nelprospetto diassemblaggio, con proposte distinte dalle assegnazioni approvate. Prima saldoesemplari, poinuoviacquisti; alimentatori Dell/HPclient separati dagli ATX. Nessuna scheda videodeve essere comprata solo per console; M7 puo usare NVS290PCIex1 gia disponibile, con verifica del percorso console scelto.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-MAP]] · [[REV3-OPEN]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-01.03



# INF-01.03 · Alimentatori, telai e assemblaggio

Cinque case4U censiti:due profondi46cm, tre ex ATM37cm secondo fonti; associazione ai singoli INV da riscontro. Unrack aggiuntivo50 EUR usato, non scelto. M7 e Deluxe hanno casepropri. S1 riusa chassis HPDL380G6accorciato; M4 frontale10tray3,5senza backplane. Vecchio INV064DL180G6da riconciliare, non duplicare chassis o rinominare prodotto per ipotesi. Cavi dichiarati6/8SATAda1m sono dati, alimentazioni corrispondenti disponibili; connettori controllerda verificare.

Sei ATX censiti:bequiet850 W, Cooler Master700 W, Thermaltake730 W, Corsair CX500,2FSP350 W. Aggiunti Delta DPS250AB49L ebackplane AC0632A con 2DPS750RBA. Ilgruppo ridondante e una possibile soluzione per un nodo, non due ATXstandard o1500Wridondanti garantiti. Pinout/start/standby/ATX-EPS ecompatibilita non attestati: nessun cablaggioelettrico inventato.

Ripartizione PSU/boot/telai resta nelprospetto diassemblaggio, con proposte distinte dalle assegnazioni approvate. Prima saldoesemplari, poinuoviacquisti; alimentatori Dell/HPclient separati dagli ATX. Nessuna scheda videodeve essere comprata solo per console; M7 puo usare NVS290PCIex1 gia disponibile, con verifica del percorso console scelto.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-MAP]] · [[REV3-OPEN]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-01.17



# INF-01.17 · Nomenclatura e identita

| Prefisso | Classe |
| --- | --- |
| M | M1-M7 nodi infrastrutturali |
| S | S1 utilita, S2 VPS, S3 radio, S4 testimone |
| C | C1-C4 Dellclient; C5/C6assegnazioni HP storiche noncorrenti |
| SH | Supportiesterni shelter |
| MD | Telefonietablet |
| MP | Notebooke PCpersonali |
| CE | Clientstreamingesternialla fidata |
| INV | Prodottolotto; serialeesemplare distinto; codici mairiusati per prodotto diverso |



La configurazione 4.4 distingue infrastruttura domestica, postazioni di lavoro e W639. Stato di acquisto/consegna e separato in [[REV3-STATO]].

| Apparato | Piattaforma | RAM/storage | Ruolo | Riferimenti |
| --- | --- | --- | --- | --- |
| M1 | MACHINIST X99 PR9-H / Xeon E5-2630L v3 dichiarato, SKU da identificare | 32 GB DDR4 ECC RDIMM, 2 x 16, disponibili | Proxmox: OPNsense VM e osservabilita separata; nucleo sempre acceso | INV-101 RAM / nuova scheda da associare |
| M2 | D1581-Q3 / Xeon D-1581 | 64 GB, 4 x 16 DDR3L RDIMM | Proxmox: applicazioni personali e pool SSD; niente Hermes/Frigate | INV-074 / 100 / 067 / 081 |
| M3 | HUANANZHI X99-T8 / E5-2678 v3 | 128 GB, 8 x 16 DDR3 RDIMM | Proxmox IA; MSI RTX3060 Ventus 2X 12 GB; senza Windows | INV-030 / 048 / 077 |
| M4 | ASUS P9D-MH/SAS/10G-DUAL / E3-1265L v3 | 32 GB, 4 x 8 ECC UDIMM | Proxmox/ZFS: backup WD RAIDZ2 e media Seagate RAIDZ1 | INV-073 / 047 / 076 |
| M5 | D1581-Q3 / Xeon D-1581, assegnazione condizionata al bus Hailo | 32 GB PC3L RDIMM, 2 x 16 dal lotto ancora in trattativa | Proxmox: HAOS, MQTT, Frigate/Hailo; nucleo sempre acceso | INV-074 / lotto RAM nuovo / INV-098 candidato |
| M6 | D1581-Q3A / Xeon D-1581, assegnazione condizionata a GPU e NIC | 64 GB PC3L RDIMM, 4 x 16 dal lotto ancora in trattativa | Proxmox autonomo: media, Seafile, download; acceso a richiesta | Q3A nuova / Arc candidata / INV-097 |
| M7 | ASUS H61M-K / E3-1220L v2 | 16 GB, 2 x 8 DDR3 | Riserva manuale H61M-K; T110 II acquistato candidato sostitutivo, da qualificare | INV-033 / 046 / 039 |
| S1 | ASRock Q1900M / Celeron J1900 | 8 GB, 2 x 4 Hynix PC3-10600U | Linux: Caddy, Vaultwarden, notifiche e utilita; fuori cluster | INV-034 / 049 / 041, esemplari da associare |
| S2 | Oracle Cloud Always Free, candidata A1 | Proposta: 1 OCPU / 4 GB / boot 50 GB | Osservazione esterna e relay; attivazione successiva; niente voto | Piano Oracle; nessun account/VM attivato qui |
| S3 | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Linux: Sonoff ZBDongle-P, Zigbee2MQTT e dashboard leggera; fuori cluster | Prodotto/seriale da associare, Wyse radio |
| S4 | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Linux: sentinella indipendente (senza voto) e primo mittente WoL; fuori cluster | Prodotto/seriale da associare, Wyse sentinella |
| C1 | Dell OptiPlex 7070 Ultra / i5-8265U | 8 GB censiti, nessun LLM locale | W639: PC di bordo/lavoro, touchscreen, diagnostica; fuori cluster domestico | INV-079, esemplare C1 |
| C2 | Dell OptiPlex 7070 Ultra / i5-8265U | 8 GB censiti, espansione solo se necessaria | Cucina: client Linux, streaming/Moonlight e pannello casa | INV-079, esemplare C2 |
| C3 | Dell OptiPlex 7070 Ultra / i5-8265U | 16 GB base HA, riscontro risorse | Proxmox client Linux e subentro HAOS/MQTT, senza Hermes | INV-079, esemplare C3 |
| C4 | Dell OptiPlex 7070 Ultra / i5-8265U | 16 GB base HA, riscontro risorse | Proxmox: client Linux VM, subentro app e secondo WoL | INV-079, esemplare C4 |
| MP3 | Acer Aspire 7 A715-42G-R2VB / Ryzen 7 5700U / RTX3050 Ti 4 GB | 16 GB / Crucial P3 Plus1 TB | Acer sempre fisso in laboratorio: Windows lavoro/gioco, Sunshine; OpenClaw di lavoro e Hermes da predisporre | MP3, codice INV da associare; dotazione dichiarata utente |
| MP2 | Apple MacBook Air M1 | 8 GB / SSD256 GB | Scambio ancora in sospeso: opzione MacBook Air, non postazione necessaria della 4.4 | INV-096, esemplare MP2 |
| MP4 | ASUS X99-DELUXE / i7-5930K / RTX2080 | 32 GB DDR4 | PC primo fratello, esterno all’infrastruttura | INV-029/043/035/055 |
| MP5 | ASRock X79 Extreme3 / i7-3820 | DDR3UDIMM, taglio e altri pezzi da associare | Ipotesi PC secondo fratello subordinata allo scambio Air ancora in sospeso; kit X79 da testare | INV-031/044; nessun componente server sottratto |
| Wyse laboratorio | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Jellyfin, musica e pannello Home Assistant; affianca Acer | Codice C e INV da associare |
| Wyse studio | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Monitor e client audio verso Behringer CONTROL2USB | Codice C e INV da associare |
| Wyse Hi-Fi salone | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Client Hi-Fi verso DAC ES9038Q2M USB | Codice C e INV da associare |
| HP amico 1 | HP t520 | 4 GB / Apacer M.2 8 GB | Client esterno Ethernet: LibreELEC, Jellyfin e offline USB | INV-078, codice CE e seriale da associare |
| HP amico 2 | HP t520 | 4 GB / Apacer M.2 8 GB | Client esterno Ethernet: LibreELEC, Jellyfin e offline USB | INV-078, codice CE e seriale da associare |
| Microtech ingresso | Microtech EBL14B | Dotazione da riscontrare; modello 4 GB/64 GB eMMC | Pannello citofono/allarme, display e batteria integrati; fuori cluster | Codice MP/INV e seriale da associare |
| T110 II | Dell PowerEdge T110 II / E3-1220 v2 | 8 GB dichiarati | Riserva candidata per M7 e disponibilita unita RDX SATA | Prodotto/seriale da associare; lotto acquistato 150 EUR |
| Kindle recuperato | Kindle 11a generazione USB-C | Modello base/Paperwhite da associare | Biblioteca tecnica e plancia compatta; dispositivo personale | Codice MD/INV da associare |

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-OPEN]] · [[REV3-DIFF]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-12.16



# INF-12.16 · Storage: transizione e destinazioni definitive

| Nodo/interfaccia | Supporti | Contenuto | Condizione |
| --- | --- | --- | --- |
| M1 / SATA | INV-007 Kingston V200 120 GB | Boot Proxmox/OPNsense VM | Secondo disco OPNsense bare metal da associare |
| M2 / NVMe | INV-009 Sabrent Rocket512 GB | Boot Proxmox | Locale |
| M2 / secondo NVMe | INV-005 Crucial P310 4 TB, recuperato da Arca | Servizi e dati personali; segnaposto in attesa di pool SSD | Singolo disco; nessuna ridondanza. Solo dopo copie e recupero verificati |
| M3 / M.2 PCIe2.0x4 | INV-006 WD PC SN530512 GB | Host e IA | Altro M.2 non assegnato a Windows; inventario NVMe da ricontare |
| MP3 Aspire 7 | Crucial P3 Plus 1 TB | Windows/Hermes/giochi | Rimane nelportatile, non libero per PC |
| M4 / SATA native | 6 WD10EAVS1 TB, INV-001 | WD oggi anche media; a regime solo backup versionati RAIDZ2 | Ricostruire dopo evacuazione verificata; circa 4 TB nominali, spazio versioni da dimensionare |
| M4 / LSI2308 | 4 ST2000DM0082 TB, INV-087 | Media RAIDZ1, circa 6 TB nominali | ST2000DM008 SMR: collaudo ricostruzione e carico prima adozione; circa 6 TB nominali |
| M5 / SATA | INV-003 Samsung850EVO 250 GB | Boot Proxmox e stato | Recuperabile confermato |
| M5 / SATA | 2 ST1000LM0241 TB, INV-013 | Mirror Frigate circa 1 TB nominale | 4 camere eventi 7 giorni; risultato dipende dai flussi |
| M6 / SATA | INV-004 Kingston V300 120 GB | Boot Proxmox | Boot; dati DB separati e quote sullo staging SSD, dimensionamento prima installazione |
| M6 / SATA | INV-008 Samsung850EVO 500 GB | Download e staging | Incompleti, seed, quote e margine operativo |
| M6 / SATA | 2 WD10EZRX1 TB, INV-002 | Mirror Seafile e copie audio quotate | 10x50 GB; residuo per versioni/audio/margine; nessun backup aggiuntivo cloud |
| C3 / C4 | Un SSD locale per Dell | ZFS host + VM client + repliche HA | Capacita reale da associare; singolo SSD senza ridondanza locale |
| S3 / S4 | Storage Wyse 32 GB dichiarato per esemplare | Linux, radio/testimone e stato | Riconciliare storage effettivo; gli Apacer 8 GB restano sugli HP esterni |
| M4 / S1 / M7 | Boot da associare al saldo | Avvio indipendente | Nessun acquisto prima del riconteggio |
| SH1 / Arca durante transizione | INV-005 P310 4 TB nel box Lexar E750 | Conservare finche i dati unici sono protetti; poi P310 a M2 | Il box resta libero solo dopo il passaggio; non contare due SSD |
| SH3 | INV-086 Intenso250 GB + INV-089 ORICO | Supporto esterno assegnato | Non libera riserva boot |
| MP2 Air M1 | SSD interno256 GB | Scenario Air ancora in sospeso | Non requisito della configurazione 4.3 |
| Due HP esterni | Apacer M.2 8 GB + USB | LibreELEC/configurazione + contenuti offline | Capacita USB da associare |
| Microtech ingresso | 64 GB eMMC da modello, da riscontrare | Sistema e pannello ingresso | SSD opzionale, non acquisto imposto |
| RDX SATA | Tre cartucce HP 2 TB proposte, non comprate | Selezioni offline: foto/video, documenti, lavoro | 50 EUR ciascuna offerta riferita; verificare compatibilita e stato |

## Stato reale e progetto

Oggi film e serie TV sono anche sui WD Green. La separazione WD backup / Seagate media e destinazione, non stato gia installato. I dati devono essere evacuati e confrontati prima della ricostruzione. Arca contiene il medesimo P310 che passera a M2: non esistono due unita da 4 TB.

I sei WD in RAIDZ2 offrono circa 4 TB nominali, non spazio infinito per versioni di tutti i 4 TB di M2 piu tutti i media. I quattro Seagate ST2000DM008 sono SMR: RAIDZ1 da circa 6 TB resta subordinato a prove e accettazione dei tempi di riscrittura/resilver. Un'alternativa a due mirror riduce la capacita a circa 4 TB nominali ma non elimina la natura SMR. Nessun array e dichiarato gia ricostruito.

Database ed esportazioni applicative richiedono consistenza; una copia del rootfs non comprende automaticamente mount esterni. Snapshot e mirror non sono copie indipendenti. [[REV4-MIG]] · [[REV3-BCK]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-12.15



# INF-12.15 · Mappa operativa della configurazione


La configurazione 4.4 distingue infrastruttura domestica, postazioni di lavoro e W639. Stato di acquisto/consegna e separato in [[REV3-STATO]].

| Apparato | Piattaforma | RAM/storage | Ruolo | Riferimenti |
| --- | --- | --- | --- | --- |
| M1 | MACHINIST X99 PR9-H / Xeon E5-2630L v3 dichiarato, SKU da identificare | 32 GB DDR4 ECC RDIMM, 2 x 16, disponibili | Proxmox: OPNsense VM e osservabilita separata; nucleo sempre acceso | INV-101 RAM / nuova scheda da associare |
| M2 | D1581-Q3 / Xeon D-1581 | 64 GB, 4 x 16 DDR3L RDIMM | Proxmox: applicazioni personali e pool SSD; niente Hermes/Frigate | INV-074 / 100 / 067 / 081 |
| M3 | HUANANZHI X99-T8 / E5-2678 v3 | 128 GB, 8 x 16 DDR3 RDIMM | Proxmox IA; MSI RTX3060 Ventus 2X 12 GB; senza Windows | INV-030 / 048 / 077 |
| M4 | ASUS P9D-MH/SAS/10G-DUAL / E3-1265L v3 | 32 GB, 4 x 8 ECC UDIMM | Proxmox/ZFS: backup WD RAIDZ2 e media Seagate RAIDZ1 | INV-073 / 047 / 076 |
| M5 | D1581-Q3 / Xeon D-1581, assegnazione condizionata al bus Hailo | 32 GB PC3L RDIMM, 2 x 16 dal lotto ancora in trattativa | Proxmox: HAOS, MQTT, Frigate/Hailo; nucleo sempre acceso | INV-074 / lotto RAM nuovo / INV-098 candidato |
| M6 | D1581-Q3A / Xeon D-1581, assegnazione condizionata a GPU e NIC | 64 GB PC3L RDIMM, 4 x 16 dal lotto ancora in trattativa | Proxmox autonomo: media, Seafile, download; acceso a richiesta | Q3A nuova / Arc candidata / INV-097 |
| M7 | ASUS H61M-K / E3-1220L v2 | 16 GB, 2 x 8 DDR3 | Riserva manuale H61M-K; T110 II acquistato candidato sostitutivo, da qualificare | INV-033 / 046 / 039 |
| S1 | ASRock Q1900M / Celeron J1900 | 8 GB, 2 x 4 Hynix PC3-10600U | Linux: Caddy, Vaultwarden, notifiche e utilita; fuori cluster | INV-034 / 049 / 041, esemplari da associare |
| S2 | Oracle Cloud Always Free, candidata A1 | Proposta: 1 OCPU / 4 GB / boot 50 GB | Osservazione esterna e relay; attivazione successiva; niente voto | Piano Oracle; nessun account/VM attivato qui |
| S3 | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Linux: Sonoff ZBDongle-P, Zigbee2MQTT e dashboard leggera; fuori cluster | Prodotto/seriale da associare, Wyse radio |
| S4 | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Linux: sentinella indipendente (senza voto) e primo mittente WoL; fuori cluster | Prodotto/seriale da associare, Wyse sentinella |
| C1 | Dell OptiPlex 7070 Ultra / i5-8265U | 8 GB censiti, nessun LLM locale | W639: PC di bordo/lavoro, touchscreen, diagnostica; fuori cluster domestico | INV-079, esemplare C1 |
| C2 | Dell OptiPlex 7070 Ultra / i5-8265U | 8 GB censiti, espansione solo se necessaria | Cucina: client Linux, streaming/Moonlight e pannello casa | INV-079, esemplare C2 |
| C3 | Dell OptiPlex 7070 Ultra / i5-8265U | 16 GB base HA, riscontro risorse | Proxmox client Linux e subentro HAOS/MQTT, senza Hermes | INV-079, esemplare C3 |
| C4 | Dell OptiPlex 7070 Ultra / i5-8265U | 16 GB base HA, riscontro risorse | Proxmox: client Linux VM, subentro app e secondo WoL | INV-079, esemplare C4 |
| MP3 | Acer Aspire 7 A715-42G-R2VB / Ryzen 7 5700U / RTX3050 Ti 4 GB | 16 GB / Crucial P3 Plus1 TB | Acer sempre fisso in laboratorio: Windows lavoro/gioco, Sunshine; OpenClaw di lavoro e Hermes da predisporre | MP3, codice INV da associare; dotazione dichiarata utente |
| MP2 | Apple MacBook Air M1 | 8 GB / SSD256 GB | Scambio ancora in sospeso: opzione MacBook Air, non postazione necessaria della 4.4 | INV-096, esemplare MP2 |
| MP4 | ASUS X99-DELUXE / i7-5930K / RTX2080 | 32 GB DDR4 | PC primo fratello, esterno all’infrastruttura | INV-029/043/035/055 |
| MP5 | ASRock X79 Extreme3 / i7-3820 | DDR3UDIMM, taglio e altri pezzi da associare | Ipotesi PC secondo fratello subordinata allo scambio Air ancora in sospeso; kit X79 da testare | INV-031/044; nessun componente server sottratto |
| Wyse laboratorio | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Jellyfin, musica e pannello Home Assistant; affianca Acer | Codice C e INV da associare |
| Wyse studio | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Monitor e client audio verso Behringer CONTROL2USB | Codice C e INV da associare |
| Wyse Hi-Fi salone | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Client Hi-Fi verso DAC ES9038Q2M USB | Codice C e INV da associare |
| HP amico 1 | HP t520 | 4 GB / Apacer M.2 8 GB | Client esterno Ethernet: LibreELEC, Jellyfin e offline USB | INV-078, codice CE e seriale da associare |
| HP amico 2 | HP t520 | 4 GB / Apacer M.2 8 GB | Client esterno Ethernet: LibreELEC, Jellyfin e offline USB | INV-078, codice CE e seriale da associare |
| Microtech ingresso | Microtech EBL14B | Dotazione da riscontrare; modello 4 GB/64 GB eMMC | Pannello citofono/allarme, display e batteria integrati; fuori cluster | Codice MP/INV e seriale da associare |
| T110 II | Dell PowerEdge T110 II / E3-1220 v2 | 8 GB dichiarati | Riserva candidata per M7 e disponibilita unita RDX SATA | Prodotto/seriale da associare; lotto acquistato 150 EUR |
| Kindle recuperato | Kindle 11a generazione USB-C | Modello base/Paperwhite da associare | Biblioteca tecnica e plancia compatta; dispositivo personale | Codice MD/INV da associare |

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-OPEN]] · [[REV3-DIFF]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## REV3-STO



# REV3-STO · Storage: transizione e destinazioni definitive

| Nodo/interfaccia | Supporti | Contenuto | Condizione |
| --- | --- | --- | --- |
| M1 / SATA | INV-007 Kingston V200 120 GB | Boot Proxmox/OPNsense VM | Secondo disco OPNsense bare metal da associare |
| M2 / NVMe | INV-009 Sabrent Rocket512 GB | Boot Proxmox | Locale |
| M2 / secondo NVMe | INV-005 Crucial P310 4 TB, recuperato da Arca | Servizi e dati personali; segnaposto in attesa di pool SSD | Singolo disco; nessuna ridondanza. Solo dopo copie e recupero verificati |
| M3 / M.2 PCIe2.0x4 | INV-006 WD PC SN530512 GB | Host e IA | Altro M.2 non assegnato a Windows; inventario NVMe da ricontare |
| MP3 Aspire 7 | Crucial P3 Plus 1 TB | Windows/Hermes/giochi | Rimane nelportatile, non libero per PC |
| M4 / SATA native | 6 WD10EAVS1 TB, INV-001 | WD oggi anche media; a regime solo backup versionati RAIDZ2 | Ricostruire dopo evacuazione verificata; circa 4 TB nominali, spazio versioni da dimensionare |
| M4 / LSI2308 | 4 ST2000DM0082 TB, INV-087 | Media RAIDZ1, circa 6 TB nominali | ST2000DM008 SMR: collaudo ricostruzione e carico prima adozione; circa 6 TB nominali |
| M5 / SATA | INV-003 Samsung850EVO 250 GB | Boot Proxmox e stato | Recuperabile confermato |
| M5 / SATA | 2 ST1000LM0241 TB, INV-013 | Mirror Frigate circa 1 TB nominale | 4 camere eventi 7 giorni; risultato dipende dai flussi |
| M6 / SATA | INV-004 Kingston V300 120 GB | Boot Proxmox | Boot; dati DB separati e quote sullo staging SSD, dimensionamento prima installazione |
| M6 / SATA | INV-008 Samsung850EVO 500 GB | Download e staging | Incompleti, seed, quote e margine operativo |
| M6 / SATA | 2 WD10EZRX1 TB, INV-002 | Mirror Seafile e copie audio quotate | 10x50 GB; residuo per versioni/audio/margine; nessun backup aggiuntivo cloud |
| C3 / C4 | Un SSD locale per Dell | ZFS host + VM client + repliche HA | Capacita reale da associare; singolo SSD senza ridondanza locale |
| S3 / S4 | Storage Wyse 32 GB dichiarato per esemplare | Linux, radio/testimone e stato | Riconciliare storage effettivo; gli Apacer 8 GB restano sugli HP esterni |
| M4 / S1 / M7 | Boot da associare al saldo | Avvio indipendente | Nessun acquisto prima del riconteggio |
| SH1 / Arca durante transizione | INV-005 P310 4 TB nel box Lexar E750 | Conservare finche i dati unici sono protetti; poi P310 a M2 | Il box resta libero solo dopo il passaggio; non contare due SSD |
| SH3 | INV-086 Intenso250 GB + INV-089 ORICO | Supporto esterno assegnato | Non libera riserva boot |
| MP2 Air M1 | SSD interno256 GB | Scenario Air ancora in sospeso | Non requisito della configurazione 4.3 |
| Due HP esterni | Apacer M.2 8 GB + USB | LibreELEC/configurazione + contenuti offline | Capacita USB da associare |
| Microtech ingresso | 64 GB eMMC da modello, da riscontrare | Sistema e pannello ingresso | SSD opzionale, non acquisto imposto |
| RDX SATA | Tre cartucce HP 2 TB proposte, non comprate | Selezioni offline: foto/video, documenti, lavoro | 50 EUR ciascuna offerta riferita; verificare compatibilita e stato |

## Stato reale e progetto

Oggi film e serie TV sono anche sui WD Green. La separazione WD backup / Seagate media e destinazione, non stato gia installato. I dati devono essere evacuati e confrontati prima della ricostruzione. Arca contiene il medesimo P310 che passera a M2: non esistono due unita da 4 TB.

I sei WD in RAIDZ2 offrono circa 4 TB nominali, non spazio infinito per versioni di tutti i 4 TB di M2 piu tutti i media. I quattro Seagate ST2000DM008 sono SMR: RAIDZ1 da circa 6 TB resta subordinato a prove e accettazione dei tempi di riscrittura/resilver. Un'alternativa a due mirror riduce la capacita a circa 4 TB nominali ma non elimina la natura SMR. Nessun array e dichiarato gia ricostruito.

Database ed esportazioni applicative richiedono consistenza; una copia del rootfs non comprende automaticamente mount esterni. Snapshot e mirror non sono copie indipendenti. [[REV4-MIG]] · [[REV3-BCK]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]

## Fonti tecniche verificate

[Seagate: ST2000DM008 SMR](https://www.seagate.com/www-content/datasheets/pdfs/3-5-barracudaDS1900-14-2007US-en_US.pdf)


## REV4-VTEST



# REV4-VTEST · Vito: roadmap di attivazione e prove di accettazione

## Dalle vacanze di Natale alla prima trasferta completa

Il calendario della 4.4 parte dalle vacanze di Natale 2026. Le finestre seguenti organizzano il lavoro; consegne, compatibilità e disponibilità dell’utente determinano la data effettiva. Una fase incompleta mantiene aperte le successive che ne dipendono. Il nodo mobile viene attivato gradualmente senza attendere che ogni ottimizzazione del rack sia terminata.

## Vacanze di Natale 2026: censimento e banco

Identificare C1 fisico, memoria, storage e alimentazione; registrare anno, motore e classe Euro del W639. Definire touchscreen, modem, SIM, accumulo e percorso diagnostico prima degli acquisti mancanti. Provare video, touch, alimentazione, riavvio e carico del Dell con i componenti effettivi. Verificare disponibilità dei documenti locali e accesso ai registri condivisi usando un caso di prova concordato.

La fase termina con una distinta chiara: disponibile, da acquistare, compatibile in prova, ancora incerto. Gli 8 GB censiti rimangono la base; eventuali aumenti si giustificano con il carico misurato. Per la diagnosi Mercedes, i requisiti del software vanno confrontati con spazio e memoria effettivi prima di considerare il PC pronto. [Requisiti e copertura XENTRY](https://b2bconnect.mercedes-benz.com/ee/help/faq/software/xentry-pass-thru-eu).

## Fine vacanze e gennaio 2027: bordo essenziale

Completare il montaggio dopo le prove da banco, attivare la rete locale e verificare il collegamento privato ai soli servizi necessari. Preparare la dashboard essenziale e un insieme di documenti di viaggio. Misurare i consumi dei profili lavoro, sosta e riserva. Provare perdita di LTE, indisponibilità della casa, arresto ordinato e ripresa con bozze ancora da inviare.

Un rapportino viene raccolto senza rete, consegnato al ritorno e ritrovato una sola volta nel registro corretto. I media e i documenti selezionati si aprono senza collegamenti remoti. Queste prove hanno precedenza sulle automazioni accessorie.

## Gennaio 2027: camper, telemetria e monitoraggio

Integrare soltanto sensori e dispositivi realmente presenti. WiCAN entra nel piano dopo acquisto e riscontro sul mezzo; funzioni non provate restano marcate. Collegare il monitoraggio domestico mostrando ultima comunicazione e dati non aggiornati. Collaudare il profilo camper con casa irraggiungibile e verificare che il suo funzionamento non dipenda dal quorum domestico.

## Consolidamento successivo

Eseguire una trasferta pilota, raccogliere problemi e correggere le dipendenze. Solo dopo si valutano assistente locale, nuove automazioni o maggiore memoria. La consegna comprende inventario aggiornato, configurazioni recuperabili e registrazione delle prove con data ed esito.

La checklist finale richiede: USB-C stabile; documenti offline leggibili; nessun rapportino duplicato; dati camper con validità esplicita; backup recuperato su altro dispositivo; arresto senza perdita delle bozze; nessun voto domestico attribuito a C1. Nessuna casella è segnata completata sulla base della sola pubblicazione del faldone.

[[REV4-VITO]] · [[REV4-ROAD]] · [[REV4-HOME]]


## REV3-DIFF



# REV3-DIFF · Cosa cambia dalla 4.3

## Hardware e dati

M1 passa a PR9-H e 32 GB DDR4; M2 e M6 a Q3A; M5 a Q3. X99-T8 e P9D conservano ruoli principali. Quattro PC3L gia posseduti restano su M2; lotto di sei ancora in trattativa per M5/M6. BKHD annullata, Z9PA non piu necessaria. MCX312A e due DAC acquistati dichiarati.

P310 4 TB da Arca a M2 dopo migrazione, pool SSD rinviato. Drive con 5 TB liberi dichiarati e deposito completo transitorio; WD oggi anche media, domani solo backup. Tre RDX tematici proposti, non acquistati. Cifratura di tutta la transizione ancora aperta.

## Potenza, continuita e mobile

Nuovo nucleo stabile a cinque membri proposto, quorum tre, senza qdevice attivo. M3/M4/M6 autonomi a richiesta. S4 sentinella e WoL. Monitoraggio Zabbix in VM su M1 e osservazione indipendente. Budget RAM/ARC iniziali con misure, non memoria da riempire.

Vito come dominio di primo livello: lavoro, camper, offline, energia, rete e ritorno. Otto GB C1 censiti, nessun upgrade presunto. Roadmap da Natale 2026, condizionata a prove e durata upload. Nessun cambiamento eseguito sulle macchine o sulle app esterne.

La revisione 4.3 resta nella cartella precedente; codici scheda storici sono stabili anche quando iniziano con REV3. Nuove schede REV4 estendono il catalogo senza riutilizzare identita inventario.

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## REV4-RAM



# REV4-RAM · Memorie: disponibilita, distribuzione e utilizzo

Il conto definitivo distingue possesso e trattativa: quattro PC3L da 16 GB gia comprati per M2 (64 GB) e sei PC3L da 16 GB proposti su Vinted (96 GB). Offerta inviata 85 EUR, non accettazione o acquisto. Totale obiettivo delle tre D1581: 160 GB solo se il lotto viene acquisito.

| Nodo | Gruppo | Composizione | Capacita |
| --- | --- | --- | --- |
| M1 | INV-101 | 2 x 16 GB DDR4 RDIMM gia disponibili | 32 GB |
| M2 | INV-100 | 4 x 16 GB PC3L RDIMM gia posseduti | 64 GB |
| M3 | INV-075/099 | 8x16 GB DDR3 RDIMM | 128 GB |
| M4 | INV-076 | 4x8 GB ECC UDIMM | 32 GB |
| M5 | Lotto Vinted / 2 moduli | 2 x 16 GB PC3L-10600R RDIMM; acquisto non concluso | 32 GB previsti |
| M6 | Lotto Vinted / 4 moduli | 4 x 16 GB PC3L-10600R RDIMM; acquisto non concluso | 64 GB previsti |
| M7 | INV-039 | 2x8 GB HyperX | 16 GB |
| S1 | Hynix PC3-10600U-9-11-B1 | 2x4 GB 2Rx8, esemplari da associare | 8 GB |
| S3/S4 | Wyse 3030 | 4 GB ciascuno dichiarati; 32 GB storage da riscontro | 4 GB ciascuno |
| Scorta RDIMM16 GB | INV-075/099 | 13 DDR3 - 8 M3 = 5; vecchia assegnazione M6 liberata nel progetto | 80 GB PC3; non sostitutivi automatici dei PC3L |
| C1 | DDR4 SO-DIMM | RAM censita8 GB senza LLM | 8 GB |
| C2 | DDR4 SO-DIMM | RAM censita8 GB | 8 GB |
| C3 | DDR4 SO-DIMM | Base16 GB per HA; misura risorse | 16 GB |
| C4 | DDR4 SO-DIMM | Base16 GB per HA; misura risorse | 16 GB |
| MP2 | Apple Silicon unificata | Scenario di scambio, non RAM disponibile obbligatoria | 8 GB |
| MP3 | Aspire 7 | Dotazione dichiarata, composizione slot da verificare | 16 GB |

## Perche 64 / 32 / 64

M2 conserva i quattro moduli gia posseduti. Due nuovi moduli vanno a M5 e quattro a M6. L'utente preferisce utilizzare tutti i banchi; 48/48 rimane un'alternativa tecnica da verificare secondo regole di popolamento, ma la base 4.4 concentra piu margine sul nodo dati/media. I 64 GB di M6 sono una riserva utile, non un fabbisogno misurato.

M1 usa i 32 GB DDR4 gia disponibili: OPNsense 8 GB iniziali, VM monitoraggio 4-8 GB, resto a host e margine. M2 parte con ARC massimo proposto 16 GB se ZFS e sull'host; assegnazioni guest complessive iniziali entro 36 GB e almeno 12 GB per host/margine. Sono budget di progetto da correggere con misure, non memoria da occupare per forza.

M5: 8 GB HAOS, 2 GB MQTT, 10 GB Frigate/gateway come budget iniziale, 4 GB host/cache e 8 GB margine. M6: servizi entro 24 GB, ARC fino a 16 GB iniziali sul pool locale, 8 GB host e 16 GB margine; aumentare ARC solo se le letture ripetute lo giustificano. Cache e limiti guest non devono essere conteggiati due volte. La cache di M6 non e l'ARC dei dischi di M4.

M4 puo iniziare con ARC 8-12 GB e margine per backup e filesystem. M3 conserva 128 GB, utili per lotti e modelli in RAM ma non equivalenti a VRAM della RTX3060. Nessuna cache deve essere unica copia di dati persistenti. Un RAM disk e ammesso solo per temporanei ricreabili, con limite.

Le etichette PC3L-10600R indicano RDIMM a bassa tensione, non ECC UDIMM. Non spostare RDIMM sulla P9D senza compatibilita. I cinque moduli PC3 residui previsti dal vecchio lotto non sostituiscono automaticamente PC3L.

[Proxmox ZFS e ARC](https://github.com/proxmox/pve-docs/blob/master/local-zfs.adoc) · [OpenZFS cache](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Caching.html)

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## REV4-HOME



# REV4-HOME · Architettura e apparati della revisione 4.4

La 4.4 e una configurazione di progetto, non un verbale di installazione. Acquisti e riscontri sono distinti in [[REV3-STATO]]. Le tre D1581 sono in arrivo; la RAM Vinted e ancora in trattativa.

Il nucleo stabile proposto comprende M1, M2, M5, C3 e C4: cinque voti, quorum tre. M3, M4 e M6 sono host Proxmox autonomi accesi secondo necessita. S4 osserva e invia WoL senza voto. Il Vito e un nodo mobile indipendente, non un membro del cluster.

| Apparato | Piattaforma | Memoria e storage | Responsabilita | Identita |
| --- | --- | --- | --- | --- |
| M1 | MACHINIST X99 PR9-H / Xeon E5-2630L v3 dichiarato, SKU da identificare | 32 GB DDR4 ECC RDIMM, 2 x 16, disponibili | Proxmox: OPNsense VM e osservabilita separata; nucleo sempre acceso | INV-101 RAM / nuova scheda da associare |
| M2 | D1581-Q3A / Xeon D-1581, assegnazione di progetto | 64 GB PC3L RDIMM, 4 x 16 gia posseduti | Proxmox: app personali; P310 4 TB provvisorio dopo liberazione Arca; nucleo sempre acceso | INV-100 / 005 / 009 / Q3A nuova |
| M3 | HUANANZHI X99-T8 / E5-2678 v3 | 128 GB, 8 x 16 DDR3 RDIMM | Proxmox autonomo IA su richiesta; RTX 3060 12 GB; nessun voto nel nucleo | INV-030 / 048 / 077 |
| M4 | ASUS P9D-MH/SAS/10G-DUAL / E3-1265L v3 | 32 GB, 4 x 8 ECC UDIMM | Proxmox autonomo/ZFS: WD solo backup dopo transizione; media separati, acceso per richiesta/job | INV-073 / 047 / 076 |
| M5 | D1581-Q3 / Xeon D-1581, assegnazione condizionata al bus Hailo | 32 GB PC3L RDIMM, 2 x 16 dal lotto ancora in trattativa | Proxmox: HAOS, MQTT, Frigate/Hailo; nucleo sempre acceso | INV-074 / lotto RAM nuovo / INV-098 candidato |
| M6 | D1581-Q3A / Xeon D-1581, assegnazione condizionata a GPU e NIC | 64 GB PC3L RDIMM, 4 x 16 dal lotto ancora in trattativa | Proxmox autonomo: media, Seafile, download; acceso a richiesta | Q3A nuova / Arc candidata / INV-097 |
| M7 | ASUS H61M-K / E3-1220L v2 | 16 GB, 2 x 8 DDR3 | Riserva manuale H61M-K; T110 II acquistato candidato sostitutivo, da qualificare | INV-033 / 046 / 039 |
| S1 | ASRock Q1900M / Celeron J1900 | 8 GB, 2 x 4 Hynix PC3-10600U | Linux: Caddy, Vaultwarden, notifiche e utilita; fuori cluster | INV-034 / 049 / 041, esemplari da associare |
| S2 | Oracle Cloud Always Free, candidata A1 | Proposta: 1 OCPU / 4 GB / boot 50 GB | Osservazione esterna e relay; attivazione successiva; niente voto | Piano Oracle; nessun account/VM attivato qui |
| S3 | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Linux: Sonoff ZBDongle-P, Zigbee2MQTT e dashboard leggera; fuori cluster | Prodotto/seriale da associare, Wyse radio |
| S4 | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Sentinella indipendente e primo mittente WoL; nessun voto nella base 4.4 | Wyse sentinella, codice esemplare da associare |
| C1 | Dell OptiPlex 7070 Ultra / i5-8265U | 8 GB censiti, nessun LLM locale | Vito W639: nodo mobile lavoro/camper autonomo; offline, LTE e recupero; fuori quorum | INV-079, esemplare C1 |
| C2 | Dell OptiPlex 7070 Ultra / i5-8265U | 8 GB censiti, espansione solo se necessaria | Cucina: client Linux, streaming/Moonlight e pannello casa | INV-079, esemplare C2 |
| C3 | Dell OptiPlex 7070 Ultra / i5-8265U | 16 GB base HA, riscontro risorse | Proxmox client Linux e subentro HAOS/MQTT, senza Hermes | INV-079, esemplare C3 |
| C4 | Dell OptiPlex 7070 Ultra / i5-8265U | 16 GB base HA, riscontro risorse | Proxmox nucleo: client Linux, riserva app selezionate, secondo mittente WoL | INV-079, esemplare C4 |
| MP3 | Acer Aspire 7 A715-42G-R2VB / Ryzen 7 5700U / RTX3050 Ti 4 GB | 16 GB / Crucial P3 Plus1 TB | Acer sempre fisso in laboratorio: Windows lavoro/gioco, Sunshine; OpenClaw di lavoro e Hermes da predisporre | MP3, codice INV da associare; dotazione dichiarata utente |
| MP2 | Apple MacBook Air M1 | 8 GB / SSD256 GB | Scambio ancora in sospeso: opzione MacBook Air, non postazione necessaria della 4.3 | INV-096, esemplare MP2 |
| MP4 | ASUS X99-DELUXE / i7-5930K / RTX2080 | 32 GB DDR4 | PC primo fratello, esterno all’infrastruttura | INV-029/043/035/055 |
| MP5 | ASRock X79 Extreme3 / i7-3820 | DDR3UDIMM, taglio e altri pezzi da associare | Ipotesi PC secondo fratello subordinata allo scambio Air ancora in sospeso; kit X79 da testare | INV-031/044; nessun componente server sottratto |
| Wyse laboratorio | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Jellyfin, musica e pannello Home Assistant; affianca Acer | Codice C e INV da associare |
| Wyse studio | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Monitor e client audio verso Behringer CONTROL2USB | Codice C e INV da associare |
| Wyse Hi-Fi salone | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Client Hi-Fi verso DAC ES9038Q2M USB | Codice C e INV da associare |
| HP amico 1 | HP t520 | 4 GB / Apacer M.2 8 GB | Client esterno Ethernet: LibreELEC, Jellyfin e offline USB | INV-078, codice CE e seriale da associare |
| HP amico 2 | HP t520 | 4 GB / Apacer M.2 8 GB | Client esterno Ethernet: LibreELEC, Jellyfin e offline USB | INV-078, codice CE e seriale da associare |
| Microtech ingresso | Microtech EBL14B | Dotazione da riscontrare; modello 4 GB/64 GB eMMC | Pannello citofono/allarme, display e batteria integrati; fuori cluster | Codice MP/INV e seriale da associare |
| T110 II | Dell PowerEdge T110 II / E3-1220 v2 | 8 GB dichiarati | Riserva candidata per M7 e disponibilita unita RDX SATA | Prodotto/seriale da associare; lotto acquistato 150 EUR |
| Kindle recuperato | Kindle 11a generazione USB-C | Modello base/Paperwhite da associare | Biblioteca tecnica e plancia compatta; dispositivo personale | Codice MD/INV da associare |

Le assegnazioni Q3/Q3A si chiudono dopo il controllo dei bus: M2 richiede due NVMe simultanei e Mellanox; M5 un percorso Hailo con boot SATA; M6 GPU e NIC simultanee. Prima di comprare adattatori si verificano schede ricevute e revisione. [[REV4-PCIE]] · [[REV4-RAM]] · [[REV4-VITO]]

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## REV3-OPEN



# REV3-OPEN · Dati da completare e gate tecnici

| Ambito | Oggetto | Riscontro necessario |
| --- | --- | --- |
| Schede D1581 | Q3/Q3A | Due NVMe Q3A, bus slot, RAM RDIMM e avvio da collaudare sulle revisioni ricevute |
| M1 | Xeon E5-2630L v3 e PR9-H | SKU CPU, avvio senza GPU, IOMMU e passthrough NIC; 4 porte non implicano 4 linee indipendenti |
| RAM Vinted | 6 x16 GB PC3L | Offerta 85 EUR; non acquistata. Etichette, test memoria e canali |
| M6 | Arc + MNPA19-XTR | Spazi e linee simultanee, alimentazione e driver; Arc non acquistata |
| M5 | Hailo e camere | M-key/PCIe e decodifica da provare; entrambi ancora da acquistare |
| Dati | Volume totale e banda | 5 TB Drive liberi dichiarati; tutti i media inclusi nella transizione; misurare |
| RDX | Modello e tre cartucce HP | 2 TB per selezione e versioni; 150 EUR offerta riferita, non ordine |
| Cluster 5 | C3/C4 e repliche | 16 GB nominali e SSD da misurare; failover solo per guest che entrano |
| M4 | Media SMR | RAIDZ1 non ratificato senza prova; possibile mirror a coppie riduce spazio nominale a 4 TB |
| Vito | Identita e dotazione | Anno/motore/Euro, SSD C1, touchscreen, modem/SIM e accumulo da definire |
| Energia | Rack e veicolo separati | Assorbimenti e percorsi UPS/USB-C da misurare, nessuna autonomia garantita |
| Drive | Cifratura della transizione | Scelta utente ancora aperta; raccomandazione cifrare almeno dati privati/lavoro; cartelle da preparare separatamente |

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## REV3-INV



# REV3-INV · Magazzino e componenti liberati

| Identita | Prodotto | Saldo di progetto | Condizione |
| --- | --- | --- | --- |
| INV-031 / 044 | ASRock X79 Extreme3 + i7-3820 | 1 kit | Kit da testare; scenario secondo fratello solo se scambio Air confermato |
| INV-075 / 099 | DDR3 RDIMM 16 GB, lotto PC3 + Kingston | 5 moduli / 80 GB | 13 - 8 M3; nessun PC3 non-L contato nel lotto PC3L |
| INV-036 | ELPIDA 4 GB 2Rx4 PC3-10600R-9-10-E1 | 5 / 20 GB | RDIMM legacy liberi |
| INV-037 | Hynix 4 GB 2Rx4 PC3-10600R-9-10-E1 | 9 / 36 GB | RDIMM legacy liberi |
| INV-040 | Kingston 99U5474-038.A00LF | 1 / 4 GB | Tipologia ECC non attestata: non contato RDIMM |
| INV-042 | Nanya NT2GC72B8PA0NF-CG | 1 / 2 GB | ECC UDIMM da registro, identita da etichetta |
| INV-010 | Western Digital WD3200AAJS 320 GB | 1 | Magazzino; stato attuale non misurato |
| INV-011 | Western Digital WD1601ABYS 160 GB | 1 | Magazzino; stato attuale non misurato |
| INV-012 | Western Digital WD1600AAJS 160 GB | 1 | Magazzino; stato attuale non misurato |
| INV-014 / 015 / 016 | HGST Z7K500-500 / Hitachi Z5K500-500 / HGST Z5K500-500 | 1 ciascuno | Tre HDD da 500 GB; salute attuale non attestata |
| INV-057 | Gigabyte GV-N970G1 GAMING-4GD / GTX970 | 1 | GPU libera da registro; nessuna assegnazione implicita a Frigate |
| INV-058 | Sapphire Radeon HD6570 4 GB | 1 | GPU libera da registro |
| INV-065 / 066 | Intel EXPI9301CTBLK / EXPI9300PTBLK | 1 ciascuna | NIC Gigabit libere |
| INV-068 | HP NC380T | 1 | NIC dual Gigabit libera; non acquistata una nuova NIC per M7 |
| INV-069 / 070 | Fenvi FV-AC1200 / FV-AXE3000 | 1 ciascuna | Adattatori Wi-Fi liberi |
| INV-071 | ASUS Hyper M.2 X4 | 1 | Adattatore libero; compatibilita per ruolo non presunta |
| INV-018 | corsair flash voyager slider | 1 | Supporto a magazzino; capacita/stato come registro, senza valori inventati |
| INV-019 | lexar ljds73-16g | 1 | Supporto a magazzino; capacita/stato come registro, senza valori inventati |
| INV-020 | verbatim usb 2.0 | 2 | Supporto a magazzino; capacita/stato come registro, senza valori inventati |
| INV-021 | kingston data traveler 100g3 | 1 | Supporto a magazzino; capacita/stato come registro, senza valori inventati |
| INV-022 | tdk 16gb | 1 | Supporto a magazzino; capacita/stato come registro, senza valori inventati |
| INV-023 | tohaoll u1 v10 hc | 1 | Supporto a magazzino; capacita/stato come registro, senza valori inventati |
| INV-024 | kingston sdc10g2/64gb | 1 | Supporto a magazzino; capacita/stato come registro, senza valori inventati |
| INV-025 | lexar 800x pro | 1 | Supporto a magazzino; capacita/stato come registro, senza valori inventati |
| INV-026 | generic | 1 | Supporto a magazzino; capacita/stato come registro, senza valori inventati |
| INV-027 | generic class 6 | 1 | Supporto a magazzino; capacita/stato come registro, senza valori inventati |
| INV-028 | generic class 4 | 1 | Supporto a magazzino; capacita/stato come registro, senza valori inventati |
| INV-029/043/035/055 | X99-DELUXE+i75930K+32 GB DDR4+RTX2080 | 1 postazione | MP4 PC primo fratello, non magazzino libero |
| INV-001 | WD10EAVS1 TB | 2 residui | Sei altri a M4; due WD10EZRX a M6; salute da verificare |
| INV-003/004/007 | EVO 250 / V300 120 / V200 120 | Zero liberi in progetto | M5 / M6 / M1 confermati recuperabili |
| INV-084/085 | Tre Samsung NVMe256 GB | Saldo aperto | Riconteggio fisico prima delle destinazioni; SSD Aspire1 TB e Air256 GB non sono questi NVMe |
| INV-038 | HyperX 4 GB DDR3 | 4 moduli / 16 GB da liberare | M1 passa a DDR4; disponibilita fisica dopo dismissione vecchia scheda |
| INV-041 | Hynix 4 GB2Rx8 PC3-10600U | 2 dichiarati per S1 | Registro precedente uno: identificare secondo esemplare senza duplicazioni |
| INV-083 | Quadro NVS290 | 2 censite | Variante PCIex1 riferita; una possibile console M7, non acquistata nuova |
| PSU da associare | 6ATX +Delta DPS250AB49L +gruppo AC0632A/2DPS750RBA | Saldo non libero | Gruppo ridondante non equivale a due alimentatori ATX separati |
| INV-059..064 | 5rack4U +frontale10tray3, 5 senza backplane | Un rack mancante | 50 EUR usato; M4 riusafrontale, S1 chassis HPaccorciato; riconciliare DL180/380 |
| INV-078 | Due HP t520 | 0 liberi | Due client esterni per amici; ruoli S3/S4 trasferiti ai Wyse |
| Halo H1900G | Tre Mercusys | 0 liberi oggi | Wi-Fi casa attuale; domotica dopo sostituzione |
| Lotto Dell 2026-10-29 | T110 II E3-1220 v2/8 GB + RDX SATA + 5 Wyse 4/32 | 150 EUR complessivi | Tutti gli alimentatori Wyse, nessuna cartuccia; codici da associare |
| Wyse 3030 N03D | Cinque esemplari | 0 liberi | Laboratorio, S3, S4, studio, Hi-Fi salone |
| Microtech EBL14B | Recuperato | 0 libero in progetto | Pannello ingresso; dotazione e batteria da riscontrare |
| Kindle USB-C 11a gen | Un solo recuperato | Assegnato uso personale | Modello da identificare; altro Kindle non ritrovato |
| INV-032/072 | MSI H97M-ECO / i5-4570T | Da liberare dopo M1 nuovo | Riserva o riuso, non acquisto |
| INV-067 | LSI9207-8i | Non necessaria a M2 con due NVMe | Conservata per futuro pool SSD, non venduta |
| INV-045 | E5-2630L v2 | Non assegnato a M6 nuovo | Z9PA-U8 non piu in lista acquisti |

I saldi sono di progetto: un componente diventa libero fisicamente soltanto dopo la migrazione del nodo precedente. Non vendere o riutilizzare la riserva necessaria al rollback. [[REV3-STATO]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## REV4-VSYNC



# REV4-VSYNC · Dati mobili: preparazione, sincronizzazione e recupero

## Un archivio autorevole e una copia di viaggio

Il Vito porta con sé i dati necessari alla prossima attività, non una copia indiscriminata dell’intera infrastruttura. I registri di lavoro rimangono quelli condivisi con la segretaria; i documenti personali e operativi mantengono la loro collocazione autorevole. La copia a bordo è selezionata, datata e verificata. Lo spazio viene definito dopo il censimento dello storage di C1.

Il piano distingue tre insiemi: **documenti da consultare**, **nuovi dati raccolti** e **copie tecniche di configurazione**. Manuali, elaborati e procedure devono aprirsi realmente senza rete. Foto, note e rapportini nuovi rimangono protetti sul dispositivo fino alla consegna verificata. Configurazioni e istruzioni di recupero permettono di ricostruire la postazione senza dipendere dal computer guasto.

## Preparazione della partenza

Prima dell’uscita si selezionano cantieri e documenti, si aggiorna la copia locale e si registra quando è stata preparata. La verifica include apertura di alcuni file, disponibilità degli allegati e accesso alla procedura di emergenza. Le applicazioni cloud possono avere funzioni offline diverse: il faldone non presume che un collegamento visibile equivalga a contenuto scaricato.

Le credenziali non vengono inserite nei documenti di consultazione. La cifratura del dispositivo e la custodia della chiave di recupero vanno scelte e provate con il sistema operativo effettivo. I dati di clienti e lavoro ricevono una conservazione proporzionata all’uso: una trasferta conclusa non giustifica lasciare indefinitamente ogni documento sul mezzo.

## Raccolta e riallineamento

Ogni bozza riceve un identificativo stabile, cantiere, data e stato. Gli stati di progetto sono “locale”, “da inviare”, “registrata” e “da verificare”. Una modifica della segretaria intervenuta durante l’assenza non viene sostituita senza confronto. Una consegna ripetuta deve riconoscere il record già presente, evitando rapportini doppi.

Al rientro si verifica prima la disponibilità della destinazione, poi si trasferiscono i nuovi contenuti e si controlla l’esito. Soltanto dopo la conferma si aggiorna lo stato locale. Le copie volumetriche attendono una connessione adatta; i documenti urgenti possono essere consegnati via LTE secondo il piano dati. Il metodo tecnico concreto di sincronizzazione resta da implementare e collaudare: questa scheda ne definisce i requisiti.

## Backup e recupero

Il nuovo piano domestico comprende copie locali sui WD, destinazione remota Drive e selezioni offline RDX. I documenti e i lavori provenienti dal Vito entrano in questi percorsi dopo la consegna; la sola sincronizzazione non sostituisce un backup versionato. Le cartucce tematiche sono ancora da acquistare, e la scelta di cifratura del caricamento di transizione Drive resta aperta.

Il criterio conclusivo è pratico: recuperare un documento e una configurazione di bordo su un dispositivo diverso da C1. Se il Dell viene perso o si guasta, i dati già consegnati devono essere ritrovabili e le bozze non ancora salvate altrove devono risultare esplicitamente a rischio. Collegamenti: [[REV4-VLAV]], [[REV4-VTEST]].

[[REV4-VITO]] · [[REV4-ROAD]] · [[REV4-HOME]]


## REV3-VIS



# REV3-VIS · IA, visione e media: confini di calcolo

Hermes su MP3 e OpenClaw su MP2 ricevono allegati in quarantena. File, immagini e testo esterno sono dati da analizzare, non istruzioni operative. Identita personale e lavoro restano separate. Le richieste autorizzate passano alle API interne del vision-gateway su M5; nessun accesso generale agli archivi viene assegnato al ponte.

Su M5 risiedono Frigate, Hailo-8 e gateway. Frigate ha priorita; il gateway espone solo modelli e task effettivamente disponibili, con coda limitata, quote e stato job. Detection/classificazione o OCR preliminare richiedono modelli HEF e runtime compatibili: Hailo non rende automaticamente disponibile ogni funzione. Dove esiste una funzione equivalente, il gateway puo usare CPU; altrimenti rinvia o restituisce indisponibilita. Home Assistant conserva il proprio ambiente separato e le automazioni essenziali non richiedono il VLM.

M3 dedica128 GB totali host/IA e RTX3060 alragionamento. Windows/2080 e fuori nodo. Inferenza su conferma / coda, cloud solo esplicito; nessun hardware LLM aggiunto algateway M5.

La pipeline conserva dati letti, inferenze, incertezza e provenienza distinti. Una proposta strutturata richiede conferma esplicita prima di una modifica a Paperless, Immich, Nextcloud o altri sistemi. Originali conservati, retry idempotenti, destinazione e singola azione riconoscibili. Le versioni di driver, runtime, modelli e misure sono nel registro; nessun benchmark e inventato.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-MAP]] · [[REV3-OPEN]]


## Sedi e disponibilita 4.4

M3 conserva X99-T8 / E5-2678 v3,128 GB DDR3 RDIMM e Proxmox, dedicati all’IA. GPU MSI RTX3060 Ventus 2X 12 GB; WD PC SN530512 GB nello slot M.2PCIe2.0 per host e IA. Windows e Hermes sono su MP3 Aspire; RTX2080 segue MP4, PC del primo fratello. L’altro M.2 non e riservato alla vecchia VM Windows; il saldo Samsung NVMe e ancora da associare. A380 o RTX30506 GB sono espansioni integrative non acquistate.

Priorita: richieste personali interattive, poi agenti, infine fondo. La priorita si applica attraverso un arbitraggio comune ai lavori in attesa; non promette interruzione immediata della generazione in corso o concorrenza nella VRAM. Modelli, contesto e motore si scelgono sull’hardware. L’Hailo e un detector su M5, non un acceleratore LLM di M3.

Se M3 e spento l’utente sceglie «accendi adesso» con conferma oppure «metti in coda» fino a un’altra accensione e all’endpoint pronto. Il recupero quorum ha una politica distinta. Dopo30 min senza lavori IA attivi o autorizzati in attesa, arresto ordinato solo se nessun servizio/operazione richiede il nodo e il quorum residuo e garantito. Un modello caricato ma inattivo non e un lavoro attivo. Cloud solo su richiesta/conferma, nessun job periodico e nessuna API a consumo.

M5 usa la D1581-Q3 in arrivo, se il bus permette Hailo M-key con avvio SATA. La BKHD e esclusa: ordine annullato, non in consegna. Memoria obiettivo 32 GB PC3L RDIMM, due moduli del lotto Vinted ancora da acquistare. La DDR4 precedentemente destinata a M5 va a M1. Vedere [[INF-03.08]].

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## REV3-AGN



# REV3-AGN · Assistenti e lavoro fra laboratorio e Vito

L'Acer Aspire 7 MP3 e la postazione Windows sempre fissa in laboratorio. La dotazione dichiarata e Ryzen 7 5700U, RTX 3050 Ti 4 GB, 16 GB RAM e Crucial P3 Plus 1 TB. Windows ospita lavoro, Steam/retrogaming e Sunshine, con utenti e permessi distinti per lavoro/assistente e gioco. Il cambio utente non chiude automaticamente l'altra sessione: i carichi agenti si riducono durante il gioco.

OpenClaw di lavoro ha nell'Acer il riferimento aggiornato; Hermes mantiene l'Acer come sede prevista. Gli ambienti effettivi, la convivenza e il runtime compatibile con Windows si verificano in configurazione: non sono attestati due agenti gia installati ne un isolamento forte dato dal solo account. Il modello leggero locale e l'inferenza principale M3 restano distinti. La GPU da 4 GB e condivisa con grafica e gioco.

Il MacBook Air M1 MP2, 8/256, appartiene a uno scambio ancora in sospeso. Non e la postazione necessaria di laboratorio della 4.4 e non viene contato come ricevuto. Il MacBook personale MP1 resta distinto. L'eventuale Mac mini M1 sotto 200 EUR o upgrade Dell 32 GB sotto 100 EUR restano scenari storici condizionati, non acquisti prescritti.

M3 resta dedicato all'IA: se spento, l'agente propone accensione immediata su conferma oppure coda fino a successiva disponibilita. Priorita richieste personali, agenti, lavori di fondo. Niente inferenza principale continua obbligatoria per mantenere gli agenti operativi.

Nel Vito il lavoro usa anche Gemini e Google AI Pro sull'account di lavoro, con Sheets condivisi e Calendar; una sessione avviata dall'utente e distinta da un processo autonomo a consumo. L'abbonamento non e un credito API automaticamente disponibile a OpenClaw. Cloud su richiesta/conferma, senza job periodici pagati impliciti. Le informazioni operative persistono nei registri condivisi, non nella sola chat.

[[REV3-MOB]] dettaglia il PC del Vito; [[REV3-WRK]] il flusso di lavoro Google. Gli agenti e le postazioni mobili rimangono fuori quorum.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-OPEN]] · [[REV3-DIFF]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## REV3-MAP



# REV3-MAP · Storage: transizione e destinazioni definitive

| Nodo/interfaccia | Supporti | Contenuto | Condizione |
| --- | --- | --- | --- |
| M1 / SATA | INV-007 Kingston V200 120 GB | Boot Proxmox/OPNsense VM | Secondo disco OPNsense bare metal da associare |
| M2 / NVMe | INV-009 Sabrent Rocket512 GB | Boot Proxmox | Locale |
| M2 / secondo NVMe | INV-005 Crucial P310 4 TB, recuperato da Arca | Servizi e dati personali; segnaposto in attesa di pool SSD | Singolo disco; nessuna ridondanza. Solo dopo copie e recupero verificati |
| M3 / M.2 PCIe2.0x4 | INV-006 WD PC SN530512 GB | Host e IA | Altro M.2 non assegnato a Windows; inventario NVMe da ricontare |
| MP3 Aspire 7 | Crucial P3 Plus 1 TB | Windows/Hermes/giochi | Rimane nelportatile, non libero per PC |
| M4 / SATA native | 6 WD10EAVS1 TB, INV-001 | WD oggi anche media; a regime solo backup versionati RAIDZ2 | Ricostruire dopo evacuazione verificata; circa 4 TB nominali, spazio versioni da dimensionare |
| M4 / LSI2308 | 4 ST2000DM0082 TB, INV-087 | Media RAIDZ1, circa 6 TB nominali | ST2000DM008 SMR: collaudo ricostruzione e carico prima adozione; circa 6 TB nominali |
| M5 / SATA | INV-003 Samsung850EVO 250 GB | Boot Proxmox e stato | Recuperabile confermato |
| M5 / SATA | 2 ST1000LM0241 TB, INV-013 | Mirror Frigate circa 1 TB nominale | 4 camere eventi 7 giorni; risultato dipende dai flussi |
| M6 / SATA | INV-004 Kingston V300 120 GB | Boot Proxmox | Boot; dati DB separati e quote sullo staging SSD, dimensionamento prima installazione |
| M6 / SATA | INV-008 Samsung850EVO 500 GB | Download e staging | Incompleti, seed, quote e margine operativo |
| M6 / SATA | 2 WD10EZRX1 TB, INV-002 | Mirror Seafile e copie audio quotate | 10x50 GB; residuo per versioni/audio/margine; nessun backup aggiuntivo cloud |
| C3 / C4 | Un SSD locale per Dell | ZFS host + VM client + repliche HA | Capacita reale da associare; singolo SSD senza ridondanza locale |
| S3 / S4 | Storage Wyse 32 GB dichiarato per esemplare | Linux, radio/testimone e stato | Riconciliare storage effettivo; gli Apacer 8 GB restano sugli HP esterni |
| M4 / S1 / M7 | Boot da associare al saldo | Avvio indipendente | Nessun acquisto prima del riconteggio |
| SH1 / Arca durante transizione | INV-005 P310 4 TB nel box Lexar E750 | Conservare finche i dati unici sono protetti; poi P310 a M2 | Il box resta libero solo dopo il passaggio; non contare due SSD |
| SH3 | INV-086 Intenso250 GB + INV-089 ORICO | Supporto esterno assegnato | Non libera riserva boot |
| MP2 Air M1 | SSD interno256 GB | Scenario Air ancora in sospeso | Non requisito della configurazione 4.3 |
| Due HP esterni | Apacer M.2 8 GB + USB | LibreELEC/configurazione + contenuti offline | Capacita USB da associare |
| Microtech ingresso | 64 GB eMMC da modello, da riscontrare | Sistema e pannello ingresso | SSD opzionale, non acquisto imposto |
| RDX SATA | Tre cartucce HP 2 TB proposte, non comprate | Selezioni offline: foto/video, documenti, lavoro | 50 EUR ciascuna offerta riferita; verificare compatibilita e stato |

## Stato reale e progetto

Oggi film e serie TV sono anche sui WD Green. La separazione WD backup / Seagate media e destinazione, non stato gia installato. I dati devono essere evacuati e confrontati prima della ricostruzione. Arca contiene il medesimo P310 che passera a M2: non esistono due unita da 4 TB.

I sei WD in RAIDZ2 offrono circa 4 TB nominali, non spazio infinito per versioni di tutti i 4 TB di M2 piu tutti i media. I quattro Seagate ST2000DM008 sono SMR: RAIDZ1 da circa 6 TB resta subordinato a prove e accettazione dei tempi di riscrittura/resilver. Un'alternativa a due mirror riduce la capacita a circa 4 TB nominali ma non elimina la natura SMR. Nessun array e dichiarato gia ricostruito.

Database ed esportazioni applicative richiedono consistenza; una copia del rootfs non comprende automaticamente mount esterni. Snapshot e mirror non sono copie indipendenti. [[REV4-MIG]] · [[REV3-BCK]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## REV3-ATL



# REV3-ATL · Architettura e apparati della revisione 4.4

La 4.4 e una configurazione di progetto, non un verbale di installazione. Acquisti e riscontri sono distinti in [[REV3-STATO]]. Le tre D1581 sono in arrivo; la RAM Vinted e ancora in trattativa.

Il nucleo stabile proposto comprende M1, M2, M5, C3 e C4: cinque voti, quorum tre. M3, M4 e M6 sono host Proxmox autonomi accesi secondo necessita. S4 osserva e invia WoL senza voto. Il Vito e un nodo mobile indipendente, non un membro del cluster.

| Apparato | Piattaforma | Memoria e storage | Responsabilita | Identita |
| --- | --- | --- | --- | --- |
| M1 | MACHINIST X99 PR9-H / Xeon E5-2630L v3 dichiarato, SKU da identificare | 32 GB DDR4 ECC RDIMM, 2 x 16, disponibili | Proxmox: OPNsense VM e osservabilita separata; nucleo sempre acceso | INV-101 RAM / nuova scheda da associare |
| M2 | D1581-Q3A / Xeon D-1581, assegnazione di progetto | 64 GB PC3L RDIMM, 4 x 16 gia posseduti | Proxmox: app personali; P310 4 TB provvisorio dopo liberazione Arca; nucleo sempre acceso | INV-100 / 005 / 009 / Q3A nuova |
| M3 | HUANANZHI X99-T8 / E5-2678 v3 | 128 GB, 8 x 16 DDR3 RDIMM | Proxmox autonomo IA su richiesta; RTX 3060 12 GB; nessun voto nel nucleo | INV-030 / 048 / 077 |
| M4 | ASUS P9D-MH/SAS/10G-DUAL / E3-1265L v3 | 32 GB, 4 x 8 ECC UDIMM | Proxmox autonomo/ZFS: WD solo backup dopo transizione; media separati, acceso per richiesta/job | INV-073 / 047 / 076 |
| M5 | D1581-Q3 / Xeon D-1581, assegnazione condizionata al bus Hailo | 32 GB PC3L RDIMM, 2 x 16 dal lotto ancora in trattativa | Proxmox: HAOS, MQTT, Frigate/Hailo; nucleo sempre acceso | INV-074 / lotto RAM nuovo / INV-098 candidato |
| M6 | D1581-Q3A / Xeon D-1581, assegnazione condizionata a GPU e NIC | 64 GB PC3L RDIMM, 4 x 16 dal lotto ancora in trattativa | Proxmox autonomo: media, Seafile, download; acceso a richiesta | Q3A nuova / Arc candidata / INV-097 |
| M7 | ASUS H61M-K / E3-1220L v2 | 16 GB, 2 x 8 DDR3 | Riserva manuale H61M-K; T110 II acquistato candidato sostitutivo, da qualificare | INV-033 / 046 / 039 |
| S1 | ASRock Q1900M / Celeron J1900 | 8 GB, 2 x 4 Hynix PC3-10600U | Linux: Caddy, Vaultwarden, notifiche e utilita; fuori cluster | INV-034 / 049 / 041, esemplari da associare |
| S2 | Oracle Cloud Always Free, candidata A1 | Proposta: 1 OCPU / 4 GB / boot 50 GB | Osservazione esterna e relay; attivazione successiva; niente voto | Piano Oracle; nessun account/VM attivato qui |
| S3 | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Linux: Sonoff ZBDongle-P, Zigbee2MQTT e dashboard leggera; fuori cluster | Prodotto/seriale da associare, Wyse radio |
| S4 | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Sentinella indipendente e primo mittente WoL; nessun voto nella base 4.4 | Wyse sentinella, codice esemplare da associare |
| C1 | Dell OptiPlex 7070 Ultra / i5-8265U | 8 GB censiti, nessun LLM locale | Vito W639: nodo mobile lavoro/camper autonomo; offline, LTE e recupero; fuori quorum | INV-079, esemplare C1 |
| C2 | Dell OptiPlex 7070 Ultra / i5-8265U | 8 GB censiti, espansione solo se necessaria | Cucina: client Linux, streaming/Moonlight e pannello casa | INV-079, esemplare C2 |
| C3 | Dell OptiPlex 7070 Ultra / i5-8265U | 16 GB base HA, riscontro risorse | Proxmox client Linux e subentro HAOS/MQTT, senza Hermes | INV-079, esemplare C3 |
| C4 | Dell OptiPlex 7070 Ultra / i5-8265U | 16 GB base HA, riscontro risorse | Proxmox nucleo: client Linux, riserva app selezionate, secondo mittente WoL | INV-079, esemplare C4 |
| MP3 | Acer Aspire 7 A715-42G-R2VB / Ryzen 7 5700U / RTX3050 Ti 4 GB | 16 GB / Crucial P3 Plus1 TB | Acer sempre fisso in laboratorio: Windows lavoro/gioco, Sunshine; OpenClaw di lavoro e Hermes da predisporre | MP3, codice INV da associare; dotazione dichiarata utente |
| MP2 | Apple MacBook Air M1 | 8 GB / SSD256 GB | Scambio ancora in sospeso: opzione MacBook Air, non postazione necessaria della 4.3 | INV-096, esemplare MP2 |
| MP4 | ASUS X99-DELUXE / i7-5930K / RTX2080 | 32 GB DDR4 | PC primo fratello, esterno all’infrastruttura | INV-029/043/035/055 |
| MP5 | ASRock X79 Extreme3 / i7-3820 | DDR3UDIMM, taglio e altri pezzi da associare | Ipotesi PC secondo fratello subordinata allo scambio Air ancora in sospeso; kit X79 da testare | INV-031/044; nessun componente server sottratto |
| Wyse laboratorio | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Jellyfin, musica e pannello Home Assistant; affianca Acer | Codice C e INV da associare |
| Wyse studio | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Monitor e client audio verso Behringer CONTROL2USB | Codice C e INV da associare |
| Wyse Hi-Fi salone | Dell Wyse 3030 N03D | 4 GB / 32 GB dichiarati | Client Hi-Fi verso DAC ES9038Q2M USB | Codice C e INV da associare |
| HP amico 1 | HP t520 | 4 GB / Apacer M.2 8 GB | Client esterno Ethernet: LibreELEC, Jellyfin e offline USB | INV-078, codice CE e seriale da associare |
| HP amico 2 | HP t520 | 4 GB / Apacer M.2 8 GB | Client esterno Ethernet: LibreELEC, Jellyfin e offline USB | INV-078, codice CE e seriale da associare |
| Microtech ingresso | Microtech EBL14B | Dotazione da riscontrare; modello 4 GB/64 GB eMMC | Pannello citofono/allarme, display e batteria integrati; fuori cluster | Codice MP/INV e seriale da associare |
| T110 II | Dell PowerEdge T110 II / E3-1220 v2 | 8 GB dichiarati | Riserva candidata per M7 e disponibilita unita RDX SATA | Prodotto/seriale da associare; lotto acquistato 150 EUR |
| Kindle recuperato | Kindle 11a generazione USB-C | Modello base/Paperwhite da associare | Biblioteca tecnica e plancia compatta; dispositivo personale | Codice MD/INV da associare |

Le assegnazioni Q3/Q3A si chiudono dopo il controllo dei bus: M2 richiede due NVMe simultanei e Mellanox; M5 un percorso Hailo con boot SATA; M6 GPU e NIC simultanee. Prima di comprare adattatori si verificano schede ricevute e revisione. [[REV4-PCIE]] · [[REV4-RAM]] · [[REV4-VITO]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## REV3-ACQ



# REV3-ACQ · Acquisti, trattative e spesa evitata

| Voce | Quantita | Importo | Stato | Destinazione |
| --- | --- | --- | --- | --- |
| D1581-Q3A | 2 | 189.67 EUR | Acquisto dichiarato | M2 e M6, subordinati al collaudo |
| MACHINIST X99 PR9-H + CPU | 1 | 47.88 EUR | Acquisto dichiarato | M1 |
| Mellanox MCX312A-XCBT dual 10GbE | 1 | 32.99 EUR | Acquisto dichiarato | M2, link dedicati M3 e M4 |
| DAC passivi 10G, 1 m | 2 | 22.44 EUR | Acquisto dichiarato | Uplink M4/M6 verso switch: proposta |
| 6 x16 GB Hynix/HP PC3L-10600R RDIMM | 6 | 85.00 EUR | Offerta in attesa | 2 moduli M5, 4 M6; nessun modulo ancora arrivato |
| Cartucce HP RDX 2 TB | 3 | 150.00 EUR | Proposta da acquistare | Foto/video, documenti, lavoro: tre selezioni diverse |
| BKHD + E5-2630L v3 | 0 | Non conteggiato | Ordine annullato | Escluso dalla configurazione |
| Pool 8 SSD enterprise M2 | 0 | Non conteggiato | Rinviato | P310 4 TB come segnaposto |

I quattro ordini nello screenshot totalizzano 292,98 EUR, spedizioni comprese secondo l'utente. Stato screenshot: verifica del pagamento; acquisto dichiarato, consegna non attestata. I 85 EUR RAM sono offerta, non spesa conclusa. I 150 EUR RDX sono proposta per tre cartucce, non nuovo ordine. Non sommare il lotto Dell da 150 EUR gia acquistato come nuova spesa.

Q3 preesistente in arrivo; quattro PC3L gia posseduti; DDR4 M1 disponibile; P9D arrivata; RTX3060 montata su M3 secondo precedenti dichiarazioni. Z9PA e BKHD escono dagli acquisti attivi. Pool SSD M2 rinviato: vecchio preventivo 350-400 EUR, non un prezzo corrente garantito.

Restano da scegliere dopo collaudo: Arc A310, Hailo e camere, rete Wi-Fi/switch, energia rack e Vito, touchscreen e modem/SIM del mezzo. Riuso prima di acquisti; nessun ordine viene effettuato dal faldone.

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## REV3-FAM



# REV3-FAM · Recuperi, scambi e postazioni familiari

| Dispositivo | Situazione aggiornata | Effetto sulla 4.4 |
| --- | --- | --- |
| MP3 Acer Aspire 7 | Scambio approvato, Acer rientrato | Sempre fisso in laboratorio; Windows e lavoro/gioco |
| MP4 X99 Deluxe/i7-5930K/32 GB/2080 | PC previsto per il primo fratello | Assegnazione conservata; consegna effettiva non attestata |
| MP2 MacBook Air M1 8/256 | Scambio ancora in sospeso | Non richiesto per operativita laboratorio/Vito |
| MP5 kit X79 Extreme3/i7-3820 | Kit da testare, scenario secondo fratello | Condizionato allo scambio; non macchina funzionante presunta |
| Microtech EBL14B | Recuperato, nuova destinazione ingresso | Pannello citofono/allarme; batteria e audio/video da provare |
| Due HP t520 | Client pilota per due amici | Familiari gia serviti dai propri dispositivi sulla rete Sky |

Il MacBook personale resta MP1 e non viene riallocato. Il rientro dell'Acer non prova automaticamente una consegna del PC fisso. Gli assistenti non hanno disponibilita o quorum garantiti da uno scambio ancora in sospeso. Le dotazioni dell'Acer sono quelle dichiarate sull'esemplare, senza usare il datasheet di un suffisso diverso.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-OPEN]] · [[REV3-DIFF]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## REV3-STATO



# REV3-STATO · Disponibilita: cio che sappiamo al 1 novembre

| Elemento | Stato dichiarato | Da verificare |
| --- | --- | --- |
| Q3 + due Q3A | Tutte in arrivo | Identita PCB, bus, RAM e test |
| PR9-H + CPU | Acquisto dichiarato; screenshot verifica pagamento | SKU Xeon E5-2630L v3 e arrivo |
| MCX312A e 2 DAC | Acquisto dichiarato | Arrivo e link |
| 4 PC3L da 16 GB | Gia posseduti per M2 | Etichette/test |
| 6 PC3L Vinted | Offerta 85 EUR, non acquistati | Accettazione, commissioni, consegna |
| 32 GB DDR4 ECC | Disponibili dichiarati | Assegnati al futuro M1 |
| P3104TB | Oggi Arca | Liberazione solo a gate migrazione |
| Drive5TB | Liberi dichiarati | Quota e copia effettiva, nessun upload attestato |
| BKHD | Ordine annullato | Non in consegna |
| RDX | Lettore nel lotto Dell; cartucce da comprare | Tre selezioni da2TB proposte |
| M3/P9D | RTX3060 montata; P9D arrivata secondo fonti | Nuova configurazione da allestire |
| Vito | Mezzo acquistato, C1 censito | Schermo/modem/energia/sensori da definire |

La documentazione non trasforma decisioni in installazioni. Le schede riportano la destinazione di progetto; il registro collaudi attestera la realizzazione. [[REV4-TEST]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-07.05



# INF-07.05 · M5: domotica e visione locale

M5 usa la D1581-Q3 in arrivo, se il bus permette Hailo M-key con avvio SATA. La BKHD e esclusa: ordine annullato, non in consegna. Memoria obiettivo 32 GB PC3L RDIMM, due moduli del lotto Vinted ancora da acquistare. La DDR4 precedentemente destinata a M5 va a M1.

Proxmox nel nucleo stabile ospita HAOS, broker MQTT separato e ambiente Frigate/go2rtc/vision-gateway. Samsung 850 EVO 250 GB per boot/stato; due ST1000LM024 da 1 TB in mirror per registrazioni, circa 1 TB nominale. Quattro camere iniziali e sette giorni di eventi sono obiettivi da misurare; sei camere sono espansione. Hailo e camere restano da acquistare.

Hailo esegue inferenza compatibile, non decodifica video e non esegue LLM generici. Substream H.264 leggeri e decodifica CPU sono la base da collaudare. Frigate ha priorita; nessun doppio passthrough esclusivo a due VM. Condividere runtime solo se supportato dalla versione effettiva.

Sonoff/Zigbee2MQTT resta su S3. Reti IoT e AP non attraversano fisicamente M5 come unico ponte. La Q3 non eredita le sei porte della BKHD: interfacce e percorso avvisi via router 5G vanno mappati e isolati.

C3 e riserva per HAOS e MQTT dopo test di replica completa, fencing e capacita. Frigate, Hailo e registrazioni non diventano HA. Un guasto non richiede di trasferire la radio USB da S3. [[REV3-HA]] · [[REV4-PCIE]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-07.11



# INF-07.11 · M5: domotica e visione locale

M5 usa la D1581-Q3 in arrivo, se il bus permette Hailo M-key con avvio SATA. La BKHD e esclusa: ordine annullato, non in consegna. Memoria obiettivo 32 GB PC3L RDIMM, due moduli del lotto Vinted ancora da acquistare. La DDR4 precedentemente destinata a M5 va a M1.

Proxmox nel nucleo stabile ospita HAOS, broker MQTT separato e ambiente Frigate/go2rtc/vision-gateway. Samsung 850 EVO 250 GB per boot/stato; due ST1000LM024 da 1 TB in mirror per registrazioni, circa 1 TB nominale. Quattro camere iniziali e sette giorni di eventi sono obiettivi da misurare; sei camere sono espansione. Hailo e camere restano da acquistare.

Hailo esegue inferenza compatibile, non decodifica video e non esegue LLM generici. Substream H.264 leggeri e decodifica CPU sono la base da collaudare. Frigate ha priorita; nessun doppio passthrough esclusivo a due VM. Condividere runtime solo se supportato dalla versione effettiva.

Sonoff/Zigbee2MQTT resta su S3. Reti IoT e AP non attraversano fisicamente M5 come unico ponte. La Q3 non eredita le sei porte della BKHD: interfacce e percorso avvisi via router 5G vanno mappati e isolati.

C3 e riserva per HAOS e MQTT dopo test di replica completa, fencing e capacita. Frigate, Hailo e registrazioni non diventano HA. Un guasto non richiede di trasferire la radio USB da S3. [[REV3-HA]] · [[REV4-PCIE]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-07.01



# INF-07.01 · Casa, allarme e videosorveglianza

**M5 - Domotica autonoma.** D1581-Q3 in arrivo, 32 GB PC3L dal lotto in trattativa. HAOS e MQTT separati da Frigate/Hailo; radio e Zigbee2MQTT su S3. Hailo e camere da acquistare. [[INF-03.08]]

MQTT e automazioni essenziali restano su M5, radio e Zigbee2MQTT su S3, senza dipendenza obbligatoria da M2/M3/M4. Verificare restore HA e riconnessione radio prima del passaggio; dotazione disco/RAM M5 Q3 nel registro identita.

## Evoluzioni 2027 — non approvate

Frigate e Hailo risiedono su M5 insieme al gateway; Home Assistant e in ambiente separato. I due Seagate ST1000LM024 da 1 TB sono le registrazioni iniziali; telecamere e Hailo non sono acquistati e sei camere sono il riferimento di espansione. Retention e carico dipendono dai flussi effettivi. La RTX 2080 è esclusiva Windows; RAM host non aumenta VRAM né sostituisce acceleratori.

**Frigate - M5.** Hailo-8 e Frigate sono locali a M5. Registrazioni sui due INV-013; decode CPU iniziale con substream H.264 leggeri. La LSI9207 di M2 resta dedicata agli otto SSD. Gateway e detector condividono solo un runtime compatibile, con priorita Frigate; nessun carico video e assegnato a M2.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-05.06



# INF-05.06 · Profilo B: Android TV e box Android

**Postazioni e client.** Quattro Dell OptiPlex 7070 Ultra: uno in laboratorio per OpenClaw e lavoro, tre in cucina, camera e salone. Dotazione di riferimento i5-8265U, 8 GB e SSD256; Service Tag e componenti sono registrati per esemplare. Cucina e salone usano Debian KDE, camera Mint Xfce; il laboratorio usa Linux con browser di lavoro. I client mantengono browser, player e accesso HA locali; Moonlight raggiunge Windows su MP3 Aspire. Lo studio usa direttamente la VM Windows, senza un Dell riservato.

## Profilo e procedura di stanza

Android TV / Google TV con telecomando offre un’interfaccia da salotto. Un box con Android generico può avere launcher da tablet, aggiornamenti incerti e limitazioni delle app in abbonamento. Certificazione per servizi video e capacità Moonlight sono controlli separati.

| Criterio | Controllo prima della scelta |
| --- | --- |
| Moonlight | App Android installabile, decoder hardware a bassa latenza, corretta gestione controller e puntatore. [RIF-CL-03-RIF-CL-04] |
| Media locali | App Jellyfin Android TV o Kodi; verificare formati audio, sottotitoli e riproduzione diretta. [RIF-CL-14-RIF-CL-15] |
| Netflix / Prime e simili | App ufficiali, certificazione del modello e qualità realmente consentita. I plugin Kodi non sono una garanzia di supporto. |
| USB over IP | Porta USB host o adattatore compatibile, alimentazione adeguata e VirtualHere Android installabile. [RIF-CL-20] |
| Rete e video | Gigabit preferibile per 4K; verificare HDMI effettivo, HDR, Wi-Fi e stabilità sotto carico. |

## Esempi hardware di riferimento

<b>NVIDIA Shield TV Pro:</b> Gigabit, due USB-A 3.0, uscita HDMI 2.0b e media fino a 4K60: dotazione favorevole per ingressi locali. <b>Google TV Streamer:</b> Gigabit, HDMI 2.1 e 4K60; USB-C dichiarata per alimentazione/dati, del profilo operativo con hub e alimentazione per la periferica concreta. Questi sono esempi di caratteristiche, non acquisti decisi. [RIF-CL-24-RIF-CL-25]

## Configurazione stanza

• Tenere app native e Moonlight sulla schermata iniziale. Telecomando per scegliere; gamepad per giocare; tastiera/puntatore per Windows.

• Provare CEC, accensione TV, uscita audio e rientro alla home. L’avvio della VM resta un’operazione in sala server.

• Se USB e alimentazione condividono un adattatore, provare anche lo scenario con tutte le periferiche collegate.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-05.22



# INF-05.22 · Acer fisso: Windows, lavoro e Sunshine

L'Acer Aspire 7 MP3 e la postazione Windows sempre fissa in laboratorio. La dotazione dichiarata e Ryzen 7 5700U, RTX 3050 Ti 4 GB, 16 GB RAM e Crucial P3 Plus 1 TB. Windows ospita lavoro, Steam/retrogaming e Sunshine, con utenti e permessi distinti per lavoro/assistente e gioco. Il cambio utente non chiude automaticamente l'altra sessione: i carichi agenti si riducono durante il gioco.

OpenClaw di lavoro ha nell'Acer il riferimento aggiornato; Hermes mantiene l'Acer come sede prevista. Gli ambienti effettivi, la convivenza e il runtime compatibile con Windows si verificano in configurazione: non sono attestati due agenti gia installati ne un isolamento forte dato dal solo account. Il modello leggero locale e l'inferenza principale M3 restano distinti. La GPU da 4 GB e condivisa con grafica e gioco.

Il MacBook Air M1 MP2, 8/256, appartiene a uno scambio ancora in sospeso. Non e la postazione necessaria di laboratorio della 4.4 e non viene contato come ricevuto. Il MacBook personale MP1 resta distinto. L'eventuale Mac mini M1 sotto 200 EUR o upgrade Dell 32 GB sotto 100 EUR restano scenari storici condizionati, non acquisti prescritti.

M3 resta dedicato all'IA: se spento, l'agente propone accensione immediata su conferma oppure coda fino a successiva disponibilita. Priorita richieste personali, agenti, lavori di fondo. Niente inferenza principale continua obbligatoria per mantenere gli agenti operativi.

Nel Vito il lavoro usa anche Gemini e Google AI Pro sull'account di lavoro, con Sheets condivisi e Calendar; una sessione avviata dall'utente e distinta da un processo autonomo a consumo. L'abbonamento non e un credito API automaticamente disponibile a OpenClaw. Cloud su richiesta/conferma, senza job periodici pagati impliciti. Le informazioni operative persistono nei registri condivisi, non nella sola chat.

[[REV3-MOB]] dettaglia il PC del Vito; [[REV3-WRK]] il flusso di lavoro Google. Gli agenti e le postazioni mobili rimangono fuori quorum.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-OPEN]] · [[REV3-DIFF]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-06.11



# INF-06.11 · Hermes e OpenClaw: allegati, proposte e conferme

## Hermes personale su MP3 Aspire

L’agente riceve un’immagine o un documento autorizzato, interroga vision-gateway e usa la pre-analisi per selezionare il materiale utile al VLM su M3. Riceve descrizione e dati strutturati, poi propone tag, collegamenti e destinazione. Prima di modificare file o servizi chiede conferma. Le funzioni comprendono foto di materiali, codici/quantità, foto personali, proposte Immich, destinazioni Paperless/Nextcloud e riepiloghi domestici o tecnici.

Le risposte separano dato letto, inferenza, informazione incerta e azione proposta. Una marca leggibile e un cantiere ipotizzato sono campi differenti; l’inferenza non diventa un dato certo nell’archivio. Gli ambiti personale e lavoro mantengono account e autorizzazioni distinti.

## OpenClaw lavorativo su MP3 Acer in laboratorio

Il flusso logico è WhatsApp → OpenClaw → quarantena temporanea → vision-gateway/Hailo o CPU → VLM su M3 → JSON strutturato → proposta → conferma → archivio. Canale e autenticazione del connettore WhatsApp restano registrati; il documento descrive il percorso, senza attestare un connettore già attivo.

MP3 conserva allegati e stato del job con dimensione massima, rate limit e retention espliciti. La ricezione non effettua archiviazione definitiva. L’allegato è contenuto non attendibile: testo nelle immagini/PDF non può modificare permessi, destinazioni o regole dell’agente.

| Campo JSON | Significato e trattamento |
| --- | --- |
| progetto/cantiere, data | Dato letto o ipotesi separati; nessuna associazione forzata |
| tipo_materiale, marca, codice, quantità | Evidenza e incertezza per campo; unità dove leggibile |
| stato/anomalia | Osservazione distinta dalla diagnosi |
| persone/mezzi | Solo se necessari alla richiesta; nessuna identificazione facciale implicita |
| nome_file, tag, destinazione | Proposta, non scrittura automatica |
| original_ref, hash, job_id | Collegamento all’originale e alla richiesta |
| modello, backend, tempi, avvisi | Provenienza tecnica e limiti dell’estrazione |

La risposta WhatsApp è breve: indica cosa è stato letto, cosa resta incerto e la singola azione proposta. La conferma è associata al job, alla destinazione e alla versione della proposta; un allegato successivo non riusa automaticamente una conferma precedente. Correzione e annullamento sono disponibili. Nessun invio a clienti o modifica aziendale senza conferma specifica.

## Scrittura e recupero

Il gateway non archivia in proprio. Il componente autorizzato usa le API dell’archivio finale con chiave di idempotenza, controlla l’esito e registra il riferimento restituito. Un retry non deve duplicare il documento. Un errore conserva la richiesta e l’originale entro retention, senza dichiarare conclusa l’azione. La cancellazione della quarantena per scadenza segue la policy dichiarata; le proposte non autorizzano cancellazioni degli archivi.

Il rollback ripristina configurazione/versioni oppure revoca l’ultima modifica reversibile con riferimento all’oggetto; non pretende di annullare un invio esterno già avvenuto. Log senza password, token, allegati, immagini private o testo sensibile. I backup coprono stato e configurazioni pertinenti di MP3 e M2.

## Collegamenti

[[START]] · [[REV3-VIS]] · [[REV3-SRV]] · [[REV3-MAP]] · [[REV3-SRC]]


## Sedi e disponibilita 4.4

M3 conserva X99-T8 / E5-2678 v3,128 GB DDR3 RDIMM e Proxmox, dedicati all’IA. GPU MSI RTX3060 Ventus 2X 12 GB; WD PC SN530512 GB nello slot M.2PCIe2.0 per host e IA. Windows e gli ambienti OpenClaw/Hermes sono previsti su MP3 Aspire; RTX2080 segue MP4, PC del primo fratello. L’altro M.2 non e riservato alla vecchia VM Windows; il saldo Samsung NVMe e ancora da associare. A380 o RTX30506 GB sono espansioni integrative non acquistate.

Priorita: richieste personali interattive, poi agenti, infine fondo. La priorita si applica attraverso un arbitraggio comune ai lavori in attesa; non promette interruzione immediata della generazione in corso o concorrenza nella VRAM. Modelli, contesto e motore si scelgono sull’hardware. L’Hailo e un detector su M5, non un acceleratore LLM di M3.

Se M3 e spento l’utente sceglie «accendi adesso» con conferma oppure «metti in coda» fino a un’altra accensione e all’endpoint pronto. Il recupero quorum ha una politica distinta. Dopo30 min senza lavori IA attivi o autorizzati in attesa, arresto ordinato solo se nessun servizio/operazione richiede il nodo e il quorum residuo e garantito. Un modello caricato ma inattivo non e un lavoro attivo. Cloud solo su richiesta/conferma, nessun job periodico e nessuna API a consumo.

M5 usa la D1581-Q3 in arrivo, se il bus permette Hailo M-key con avvio SATA. La BKHD e esclusa: ordine annullato, non in consegna. Memoria obiettivo 32 GB PC3L RDIMM, due moduli del lotto Vinted ancora da acquistare. La DDR4 precedentemente destinata a M5 va a M1. Vedere [[INF-03.08]].

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-06.01



# INF-06.01 · Assistenti sui portatili

L'Acer Aspire 7 MP3 e la postazione Windows sempre fissa in laboratorio. La dotazione dichiarata e Ryzen 7 5700U, RTX 3050 Ti 4 GB, 16 GB RAM e Crucial P3 Plus 1 TB. Windows ospita lavoro, Steam/retrogaming e Sunshine, con utenti e permessi distinti per lavoro/assistente e gioco. Il cambio utente non chiude automaticamente l'altra sessione: i carichi agenti si riducono durante il gioco.

OpenClaw di lavoro ha nell'Acer il riferimento aggiornato; Hermes mantiene l'Acer come sede prevista. Gli ambienti effettivi, la convivenza e il runtime compatibile con Windows si verificano in configurazione: non sono attestati due agenti gia installati ne un isolamento forte dato dal solo account. Il modello leggero locale e l'inferenza principale M3 restano distinti. La GPU da 4 GB e condivisa con grafica e gioco.

Il MacBook Air M1 MP2, 8/256, appartiene a uno scambio ancora in sospeso. Non e la postazione necessaria di laboratorio della 4.4 e non viene contato come ricevuto. Il MacBook personale MP1 resta distinto. L'eventuale Mac mini M1 sotto 200 EUR o upgrade Dell 32 GB sotto 100 EUR restano scenari storici condizionati, non acquisti prescritti.

M3 resta dedicato all'IA: se spento, l'agente propone accensione immediata su conferma oppure coda fino a successiva disponibilita. Priorita richieste personali, agenti, lavori di fondo. Niente inferenza principale continua obbligatoria per mantenere gli agenti operativi.

Nel Vito il lavoro usa anche Gemini e Google AI Pro sull'account di lavoro, con Sheets condivisi e Calendar; una sessione avviata dall'utente e distinta da un processo autonomo a consumo. L'abbonamento non e un credito API automaticamente disponibile a OpenClaw. Cloud su richiesta/conferma, senza job periodici pagati impliciti. Le informazioni operative persistono nei registri condivisi, non nella sola chat.

[[REV3-MOB]] dettaglia il PC del Vito; [[REV3-WRK]] il flusso di lavoro Google. Gli agenti e le postazioni mobili rimangono fuori quorum.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-OPEN]] · [[REV3-DIFF]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-06.10



# INF-06.10 · Assistenti sui portatili

L'Acer Aspire 7 MP3 e la postazione Windows sempre fissa in laboratorio. La dotazione dichiarata e Ryzen 7 5700U, RTX 3050 Ti 4 GB, 16 GB RAM e Crucial P3 Plus 1 TB. Windows ospita lavoro, Steam/retrogaming e Sunshine, con utenti e permessi distinti per lavoro/assistente e gioco. Il cambio utente non chiude automaticamente l'altra sessione: i carichi agenti si riducono durante il gioco.

OpenClaw di lavoro ha nell'Acer il riferimento aggiornato; Hermes mantiene l'Acer come sede prevista. Gli ambienti effettivi, la convivenza e il runtime compatibile con Windows si verificano in configurazione: non sono attestati due agenti gia installati ne un isolamento forte dato dal solo account. Il modello leggero locale e l'inferenza principale M3 restano distinti. La GPU da 4 GB e condivisa con grafica e gioco.

Il MacBook Air M1 MP2, 8/256, appartiene a uno scambio ancora in sospeso. Non e la postazione necessaria di laboratorio della 4.4 e non viene contato come ricevuto. Il MacBook personale MP1 resta distinto. L'eventuale Mac mini M1 sotto 200 EUR o upgrade Dell 32 GB sotto 100 EUR restano scenari storici condizionati, non acquisti prescritti.

M3 resta dedicato all'IA: se spento, l'agente propone accensione immediata su conferma oppure coda fino a successiva disponibilita. Priorita richieste personali, agenti, lavori di fondo. Niente inferenza principale continua obbligatoria per mantenere gli agenti operativi.

Nel Vito il lavoro usa anche Gemini e Google AI Pro sull'account di lavoro, con Sheets condivisi e Calendar; una sessione avviata dall'utente e distinta da un processo autonomo a consumo. L'abbonamento non e un credito API automaticamente disponibile a OpenClaw. Cloud su richiesta/conferma, senza job periodici pagati impliciti. Le informazioni operative persistono nei registri condivisi, non nella sola chat.

[[REV3-MOB]] dettaglia il PC del Vito; [[REV3-WRK]] il flusso di lavoro Google. Gli agenti e le postazioni mobili rimangono fuori quorum.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-OPEN]] · [[REV3-DIFF]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-06.12



# INF-06.12 · M3: inferenza dedicata e calcolo a richiesta

M3 conserva X99-T8 / E5-2678 v3,128 GB DDR3 RDIMM e Proxmox, dedicati all’IA. GPU MSI RTX3060 Ventus 2X 12 GB; WD PC SN530512 GB nello slot M.2PCIe2.0 per host e IA. Windows e Hermes sono su MP3 Aspire; RTX2080 segue MP4, PC del primo fratello. L’altro M.2 non e riservato alla vecchia VM Windows; il saldo Samsung NVMe e ancora da associare. A380 o RTX30506 GB sono espansioni integrative non acquistate.

Priorita: richieste personali interattive, poi agenti, infine fondo. La priorita si applica attraverso un arbitraggio comune ai lavori in attesa; non promette interruzione immediata della generazione in corso o concorrenza nella VRAM. Modelli, contesto e motore si scelgono sull’hardware. L’Hailo e un detector su M5, non un acceleratore LLM di M3.

Se M3 e spento l’utente sceglie «accendi adesso» con conferma oppure «metti in coda» fino a un’altra accensione e all’endpoint pronto. Il recupero quorum ha una politica distinta. Dopo30 min senza lavori IA attivi o autorizzati in attesa, arresto ordinato solo se nessun servizio/operazione richiede il nodo e il quorum residuo e garantito. Un modello caricato ma inattivo non e un lavoro attivo. Cloud solo su richiesta/conferma, nessun job periodico e nessuna API a consumo.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-MAP]] · [[REV3-OPEN]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-06.02



# INF-06.02 · Assistenti sui portatili

L'Acer Aspire 7 MP3 e la postazione Windows sempre fissa in laboratorio. La dotazione dichiarata e Ryzen 7 5700U, RTX 3050 Ti 4 GB, 16 GB RAM e Crucial P3 Plus 1 TB. Windows ospita lavoro, Steam/retrogaming e Sunshine, con utenti e permessi distinti per lavoro/assistente e gioco. Il cambio utente non chiude automaticamente l'altra sessione: i carichi agenti si riducono durante il gioco.

OpenClaw di lavoro ha nell'Acer il riferimento aggiornato; Hermes mantiene l'Acer come sede prevista. Gli ambienti effettivi, la convivenza e il runtime compatibile con Windows si verificano in configurazione: non sono attestati due agenti gia installati ne un isolamento forte dato dal solo account. Il modello leggero locale e l'inferenza principale M3 restano distinti. La GPU da 4 GB e condivisa con grafica e gioco.

Il MacBook Air M1 MP2, 8/256, appartiene a uno scambio ancora in sospeso. Non e la postazione necessaria di laboratorio della 4.4 e non viene contato come ricevuto. Il MacBook personale MP1 resta distinto. L'eventuale Mac mini M1 sotto 200 EUR o upgrade Dell 32 GB sotto 100 EUR restano scenari storici condizionati, non acquisti prescritti.

M3 resta dedicato all'IA: se spento, l'agente propone accensione immediata su conferma oppure coda fino a successiva disponibilita. Priorita richieste personali, agenti, lavori di fondo. Niente inferenza principale continua obbligatoria per mantenere gli agenti operativi.

Nel Vito il lavoro usa anche Gemini e Google AI Pro sull'account di lavoro, con Sheets condivisi e Calendar; una sessione avviata dall'utente e distinta da un processo autonomo a consumo. L'abbonamento non e un credito API automaticamente disponibile a OpenClaw. Cloud su richiesta/conferma, senza job periodici pagati impliciti. Le informazioni operative persistono nei registri condivisi, non nella sola chat.

[[REV3-MOB]] dettaglia il PC del Vito; [[REV3-WRK]] il flusso di lavoro Google. Gli agenti e le postazioni mobili rimangono fuori quorum.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-OPEN]] · [[REV3-DIFF]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]


## INF-06.09



# INF-06.09 · Assistenti sui portatili

L'Acer Aspire 7 MP3 e la postazione Windows sempre fissa in laboratorio. La dotazione dichiarata e Ryzen 7 5700U, RTX 3050 Ti 4 GB, 16 GB RAM e Crucial P3 Plus 1 TB. Windows ospita lavoro, Steam/retrogaming e Sunshine, con utenti e permessi distinti per lavoro/assistente e gioco. Il cambio utente non chiude automaticamente l'altra sessione: i carichi agenti si riducono durante il gioco.

OpenClaw di lavoro ha nell'Acer il riferimento aggiornato; Hermes mantiene l'Acer come sede prevista. Gli ambienti effettivi, la convivenza e il runtime compatibile con Windows si verificano in configurazione: non sono attestati due agenti gia installati ne un isolamento forte dato dal solo account. Il modello leggero locale e l'inferenza principale M3 restano distinti. La GPU da 4 GB e condivisa con grafica e gioco.

Il MacBook Air M1 MP2, 8/256, appartiene a uno scambio ancora in sospeso. Non e la postazione necessaria di laboratorio della 4.4 e non viene contato come ricevuto. Il MacBook personale MP1 resta distinto. L'eventuale Mac mini M1 sotto 200 EUR o upgrade Dell 32 GB sotto 100 EUR restano scenari storici condizionati, non acquisti prescritti.

M3 resta dedicato all'IA: se spento, l'agente propone accensione immediata su conferma oppure coda fino a successiva disponibilita. Priorita richieste personali, agenti, lavori di fondo. Niente inferenza principale continua obbligatoria per mantenere gli agenti operativi.

Nel Vito il lavoro usa anche Gemini e Google AI Pro sull'account di lavoro, con Sheets condivisi e Calendar; una sessione avviata dall'utente e distinta da un processo autonomo a consumo. L'abbonamento non e un credito API automaticamente disponibile a OpenClaw. Cloud su richiesta/conferma, senza job periodici pagati impliciti. Le informazioni operative persistono nei registri condivisi, non nella sola chat.

[[REV3-MOB]] dettaglia il PC del Vito; [[REV3-WRK]] il flusso di lavoro Google. Gli agenti e le postazioni mobili rimangono fuori quorum.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-OPEN]] · [[REV3-DIFF]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
