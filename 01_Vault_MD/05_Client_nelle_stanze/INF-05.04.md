---
codice: "INF-05.04"
titolo: "USB e periferiche della postazione"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-05.04 · USB e periferiche della postazione

**Windows - M3.** Una VM Windows con RTX2080 dedicata ospita due account alternativi: Lavoro durante il giorno e Gioco/Steam la sera. Sunshine funziona come servizio; i client usano Moonlight e condividono una sola sessione desktop interattiva. Cambio utente e disconnessione appartengono alla sessione Windows; più client non creano desktop indipendenti. In studio video e USB raggiungono direttamente la postazione. La console Proxmox non sostituisce l’uscita video della GPU in passthrough.

**Postazioni e client.** I quattro Dell OptiPlex 7070 Ultra con i5-8265U sono C1 sul Vito (8 GB), C2 in cucina (8 GB), C3 in camera (16 GB) e C4 in salone (16 GB). Le capacità SSD non sono censite individualmente. C3/C4 affiancano il client Linux con host Proxmox e guest di riserva selezionati; C1 resta autonomo e fuori dal cluster. MP3 Acer ospita Windows e Sunshine; i client Moonlight raggiungono quella sessione con account autorizzati. Il laboratorio usa MP3 e le postazioni Wyse. MP1 è il MacBook M5 personale a casa, con utente lavoro separato.

Video e periferiche sono percorsi distinti. USB over IP è una modalità per gli endpoint compatibili: tastiera, mouse, controller, webcam e audio non hanno gli stessi requisiti di banda e latenza. Il servizio è limitato alla LAN autorizzata e non pubblicato liberamente.

Il passthrough USB assegna il dispositivo al guest che lo usa; i conflitti fra host e VM sono gestiti per periferica. Per lo studio il percorso diretto conserva la relazione fra uscita video RTX2080 e sessione Windows. Le periferiche indispensabili all’accesso locale di recupero rimangono disponibili in sala server.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
