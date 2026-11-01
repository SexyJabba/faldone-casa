---
codice: "INF-05.02"
titolo: "Identikit del client"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-05.02 · Identikit del client

**Postazioni e client.** I quattro Dell OptiPlex 7070 Ultra con i5-8265U sono C1 sul Vito (8 GB), C2 in cucina (8 GB), C3 in camera (16 GB) e C4 in salone (16 GB). Le capacità SSD non sono censite individualmente. C3/C4 affiancano il client Linux con host Proxmox e guest di riserva selezionati; C1 resta autonomo e fuori dal cluster. MP3 Acer ospita Windows e Sunshine; i client Moonlight raggiungono quella sessione con account autorizzati. Il laboratorio usa MP3 e le postazioni Wyse. MP1 è il MacBook M5 personale a casa, con utente lavoro separato.

## Profilo e procedura di stanza

| Uso | Profilo consigliato del profilo operativo |
| --- | --- |
| Desktop e giochi 1080p60 | Decodifica hardware H.264; HEVC utile. Rete Ethernet preferibile; tastiera/mouse o controller. |
| 1440p60 / TV 4K60 | HEVC hardware, uscita reale alla risoluzione scelta e decoder a bassa latenza. Gigabit consigliata. |
| HDR 4K60 | HEVC Main10, uscita HDR, display HDR10 e percorso host/client compatibile. Compatibilità dell’intero percorso. |
| 120 Hz | Uscita e display capaci dei 120 Hz alla risoluzione voluta; decoder, rete e host adeguati. Profilo opzionale, non requisito iniziale. |

## Dotazione minima utile della postazione

• Un’app Moonlight disponibile per l’OS; un browser aggiornato; app native per i servizi realmente utilizzati. Una pagina web generica non sostituisce il client Moonlight. [RIF-CL-03-RIF-CL-06]

• Un collegamento di rete stabile, alimentazione adeguata, uscita video compatibile e un percorso audio verificato. Per TV con Ethernet a 100 Mb/s verificare il margine al bitrate scelto.

• Almeno un modo pratico di selezionare le app e chiudere lo stream. Per Windows personale servono tastiera e puntatore; il telecomando da solo è scomodo.

• USB host locale o un ponte dedicato se la stanza deve esportare periferiche. Bluetooth locale è sufficiente per gli ingressi che Moonlight gestisce già.

| <b>Specifiche consigliate, non minimi ufficiali</b><br/>Per un mini PC generalista: 8 GB RAM e SSD da almeno 64 GB offrono margine per OS, browser e aggiornamenti. Una TV box non si valuta con gli stessi numeri: contano decoder, firmware, certificazioni, porte e prestazioni effettive. La GPU del client non deve eseguire il gioco. |
| --- |

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
