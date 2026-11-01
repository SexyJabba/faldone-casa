---
codice: "INF-05.06"
titolo: "Profilo B: Android TV e box Android"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-05.06 · Profilo B: Android TV e box Android

**Postazioni e client.** I quattro Dell OptiPlex 7070 Ultra con i5-8265U sono C1 sul Vito (8 GB), C2 in cucina (8 GB), C3 in camera (16 GB) e C4 in salone (16 GB). Le capacità SSD non sono censite individualmente. C3/C4 affiancano il client Linux con host Proxmox e guest di riserva selezionati; C1 resta autonomo e fuori dal cluster. MP3 Acer ospita Windows e Sunshine; i client Moonlight raggiungono quella sessione con account autorizzati. Il laboratorio usa MP3 e le postazioni Wyse. MP1 è il MacBook M5 personale a casa, con utente lavoro separato.

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
