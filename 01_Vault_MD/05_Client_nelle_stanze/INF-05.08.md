---
codice: "INF-05.08"
titolo: "Profilo D: app direttamente nella Smart TV"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-05.08 · Profilo D: app direttamente nella Smart TV

**Postazioni e client.** I quattro Dell OptiPlex 7070 Ultra con i5-8265U sono C1 sul Vito (8 GB), C2 in cucina (8 GB), C3 in camera (16 GB) e C4 in salone (16 GB). Le capacità SSD non sono censite individualmente. C3/C4 affiancano il client Linux con host Proxmox e guest di riserva selezionati; C1 resta autonomo e fuori dal cluster. MP3 Acer ospita Windows e Sunshine; i client Moonlight raggiungono quella sessione con account autorizzati. Il laboratorio usa MP3 e le postazioni Wyse. MP1 è il MacBook M5 personale a casa, con utente lavoro separato.

## Profilo e procedura di stanza

| Sistema TV | Cosa attendersi |
| --- | --- |
| Android TV / Google TV | Moonlight e Jellyfin Android TV possibili; USB host/server USB dipendono dal modello, non dal nome dell’OS. |
| webOS / Tizen | Jellyfin ha client elencati ufficialmente. Per Moonlight esistono progetti comunitari: versioni TV e manutenzione seguono il progetto del client. [RIF-CL-03, RIF-CL-14] |
| Altri sistemi chiusi | Usare le app disponibili; browser spesso limitato. Se manca Moonlight affidabile, aggiungere un endpoint esterno. |

## Limiti che contano davvero

• La porta Ethernet di alcune TV è a 100 Mb/s. Può bastare per un profilo moderato, ma non garantisce file 4K a bitrate elevato più altri flussi. Verificare il modello e il file reale.

• Telecomando, modalità gioco, ritardo del pannello e controlli audio fanno parte del profilo della postazione. Disattivare elaborazioni video incompatibili con bassa latenza.

• Le porte USB di una TV possono servire solo per file o accessori assegnati dal produttore; non implicano un server USB over IP installabile.

• Gli aggiornamenti del televisore possono cambiare una compatibilità comunitaria. Conservare versione app/firmware e una via alternativa per entrare nei servizi.

## Percorso operativo

<b>01.</b> Provare prima Jellyfin nativo con file e sottotitoli abituali. Verificare che il server faccia Direct Play quando possibile.

<b>02.</b> Provare Moonlight solo dopo aver identificato app, procedura supportata e controller. Misurare input e stabilità, non solo la comparsa del desktop.

<b>03.</b> Se l’esperienza è incompleta, mantenere la TV come display e usare HDMI da box o mini PC. Un ponte USB separato copre le periferiche senza sostituire lo schermo.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
