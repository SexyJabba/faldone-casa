---
codice: "INF-05.07"
titolo: "Profilo C: Apple TV e TV stick"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-05.07 · Profilo C: Apple TV e TV stick

**Postazioni e client.** I quattro Dell OptiPlex 7070 Ultra con i5-8265U sono C1 sul Vito (8 GB), C2 in cucina (8 GB), C3 in camera (16 GB) e C4 in salone (16 GB). Le capacità SSD non sono censite individualmente. C3/C4 affiancano il client Linux con host Proxmox e guest di riserva selezionati; C1 resta autonomo e fuori dal cluster. MP3 Acer ospita Windows e Sunshine; i client Moonlight raggiungono quella sessione con account autorizzati. Il laboratorio usa MP3 e le postazioni Wyse. MP1 è il MacBook M5 personale a casa, con utente lavoro separato.

## Profilo e procedura di stanza

| Piattaforma | Uso nel progetto |
| --- | --- |
| Apple TV 4K | Moonlight tvOS per desktop/giochi, app media disponibili per tvOS e servizi OTT ufficiali. HEVC fino a 4K60 . Solo la variante Wi-Fi + Ethernet ha Gigabit. [RIF-CL-03, RIF-CL-26] |
| Fire TV con Fire OS | Moonlight Android/Fire TV se installabile sul modello, Jellyfin e app ufficiali. Verificare decoder, rete, alimentazione e possibilità di input. |
| Fire TV con Vega OS | Non assumere compatibilità APK. Amazon distingue Vega e Fire OS e formati applicativi differenti. Controllare OS del modello e disponibilità del client richiesto prima di comprare. [RIF-CL-27-RIF-CL-28] |
| Altri stick Android TV | Valgono i controlli del profilo Android, con particolare attenzione a porte assenti, adattatori Ethernet e gestione termica. |

## USB e input

Apple TV non offre una porta USB generalista per esportare periferiche; la USB-C del telecomando serve alla ricarica. Tastiera e controller compatibili possono essere associati localmente. Per un dispositivo USB speciale affiancare un ponte Linux nella stanza, raggiunto da Windows. [RIF-CL-26]

Sulle stick un hub può richiedere alimentazione propria e non garantisce supporto del firmware. Verificare la velocità dell’adattatore Ethernet: “cablato” non significa sempre Gigabit. Per una postazione Windows con periferiche frequenti il mini PC può essere più pratico.

| <b>Profilo d’uso</b><br/>Buono per media e giochi con controller, con modello e decoder compatibili. Per il lavoro prolungato su Windows il profilo comprende input adatti. Il client TV non deve diventare un amministratore di Proxmox per aprire un gioco. |
| --- |

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
