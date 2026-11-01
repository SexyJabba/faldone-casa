---
codice: "INF-05.05"
titolo: "Profilo A: PC e thin client"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-05.05 · Profilo A: PC e thin client

**Postazioni e client.** I quattro Dell OptiPlex 7070 Ultra con i5-8265U sono C1 sul Vito (8 GB), C2 in cucina (8 GB), C3 in camera (16 GB) e C4 in salone (16 GB). Le capacità SSD non sono censite individualmente. C3/C4 affiancano il client Linux con host Proxmox e guest di riserva selezionati; C1 resta autonomo e fuori dal cluster. MP3 Acer ospita Windows e Sunshine; i client Moonlight raggiungono quella sessione con account autorizzati. Il laboratorio usa MP3 e le postazioni Wyse. MP1 è il MacBook M5 personale a casa, con utente lavoro separato.

## Profilo e procedura di stanza

| OS del client | Vantaggi / verifiche |
| --- | --- |
| Windows | Moonlight, browser, app e software USB generalisti. Verificare licenza, supporto dell’OS, driver del decoder e avvio automatico. |
| Linux | Buono per riciclo e avvio dedicato a Moonlight; server USB possibile. Decoder, audio, sospensione e HDR dipendono dalla distribuzione e dalla build. |
| macOS | Riutilizza un Mac esistente; Moonlight, app personali e server USB disponibile. Risoluzioni esterne, dock e modalità input dipendenti dal modello. |

## Identikit d’acquisto

• Ethernet Gigabit, uscita video adeguata, almeno due USB utili o hub alimentato; Wi-Fi/Bluetooth se necessari alla stanza. Consumo e rumore vanno verificati sul modello reale.

• Decodifica H.264 hardware stabile. Per 4K/HDR verificare HEVC Main10 nella documentazione e nel driver; “Intel vecchio” o “GPU integrata” non è una specifica sufficiente.

• Per uso misto desktop/browser: riferimento 8 GB RAM e SSD almeno 64 GB. Preferire hardware con OS ancora supportato; molte CPU Intel di settima generazione non rientrano nel supporto standard Windows 11. [RIF-CL-11]

## Assetto operativo consigliato

<b>01.</b> Account locale del client per l’uso quotidiano; aggiornamenti e rete configurati. Browser con homepage M2 e collegamenti ai servizi autorizzati.

<b>02.</b> Moonlight in evidenza; coppia con Sunshine e profilo video della stanza. Mouse/tastiera e controller associati localmente.

<b>03.</b> Server USB avviato automaticamente solo dove necessario. Disattivare sospensioni indesiderate durante uno stream e provare il riavvio del client.

| <b>Quando sceglierlo</b><br/>Scrivania, lavoro su Windows, periferiche particolari e schermi con più ingressi. Un thin client usato è adatto se decoder e porte rispettano il profilo; il suo marchio non garantisce HEVC o 4K60. |
| --- |

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
