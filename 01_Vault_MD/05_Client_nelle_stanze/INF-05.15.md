---
codice: "INF-05.15"
titolo: "Matrice conclusiva: capacità dei client"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-05.15 · Matrice conclusiva: capacità dei client

**Postazioni e client.** I quattro Dell OptiPlex 7070 Ultra con i5-8265U sono C1 sul Vito (8 GB), C2 in cucina (8 GB), C3 in camera (16 GB) e C4 in salone (16 GB). Le capacità SSD non sono censite individualmente. C3/C4 affiancano il client Linux con host Proxmox e guest di riserva selezionati; C1 resta autonomo e fuori dal cluster. MP3 Acer ospita Windows e Sunshine; i client Moonlight raggiungono quella sessione con account autorizzati. Il laboratorio usa MP3 e le postazioni Wyse. MP1 è il MacBook M5 personale a casa, con utente lavoro separato.

## Profilo e procedura di stanza

<b>Sì</b> = percorso disponibile in linea generale; <b>cond.</b> = dipendente da modello, app e configurazione; <b>ponte</b> = dispositivo USB esterno nella stanza. Nessuna riga garantisce Sky Go catturabile.

| Client | Win / giochi | Video / musica | File / foto / IA | USB → Win |
| --- | --- | --- | --- | --- |
| PC Windows | Sì | Sì | Sì | Sì, software |
| PC Linux | Sì | Sì | Sì | Sì, software |
| Mac | Sì | Sì | Sì | Sì, software |
| Android TV / box | Sì, cond. | Sì, cond. | Web/app, cond. | USB host + app |
| Apple TV | Sì | App tvOS | Limitato / app | Ponte |
| Fire OS stick | Cond. | App compatibili | Cond. | Cond. / ponte |
| Vega OS stick | Da verificare | App disponibili | Limitato | Da verificare |
| Smart TV Android | Cond. | Sì, cond. | Browser/app | Cond. / ponte |
| webOS / Tizen | Comunitario | Sì, cond. | Limitato | Ponte |
| Android tablet | Sì | Sì | Sì | OTG + app |
| iPad / iPhone | Sì | Sì | Sì | Ponte |
| SBC Linux | Build/driver | Build/driver | Web/app | Sì, software |
| Steam Deck | Sì | Sì | Sì | Cond. / software |
| Chromebook | Cond. | Web/app | Web/app | Da verificare |

## Come leggere la tabella

“Win / giochi” indica accesso a Windows su MP3 Aspire via Moonlight, non esecuzione locale o sessione indipendente. “Video / musica” comprende i servizi M2; OTT ufficiali dipendono da certificazioni. “File / foto / IA” comprende app e browser, senza promettere sincronizzazione desktop completa su una TV.

Per ogni stanza scegliere il profilo che copre input e display. Se una TV soddisfa media e giochi ma manca l’USB, aggiungere un ponte; se l’attività principale è lavorare su Windows, preferire un PC con input comodi.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
