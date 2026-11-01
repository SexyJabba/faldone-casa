---
codice: "INF-05.10"
titolo: "Altri endpoint e riuso del materiale"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-05.10 · Altri endpoint e riuso del materiale

**Postazioni e client.** I quattro Dell OptiPlex 7070 Ultra con i5-8265U sono C1 sul Vito (8 GB), C2 in cucina (8 GB), C3 in camera (16 GB) e C4 in salone (16 GB). Le capacità SSD non sono censite individualmente. C3/C4 affiancano il client Linux con host Proxmox e guest di riserva selezionati; C1 resta autonomo e fuori dal cluster. MP3 Acer ospita Windows e Sunshine; i client Moonlight raggiungono quella sessione con account autorizzati. Il laboratorio usa MP3 e le postazioni Wyse. MP1 è il MacBook M5 personale a casa, con utente lavoro separato.

## Profilo e procedura di stanza

| Dispositivo | Ruolo utile / limite |
| --- | --- |
| Raspberry Pi / SBC Linux | Moonlight e ponte USB, se build, decoder e driver sono compatibili. Su Raspberry Pi 4 il percorso HEVC richiede attenzione alla modalità di esecuzione. Non è una box pronta senza configurazione. [RIF-CL-05-RIF-CL-06] |
| Chromebook | Client Moonlight tramite ambiente supportato/Android quando disponibile, browser e servizi web. Verificare restrizioni del modello, input e gestione USB. [RIF-CL-03] |
| Steam Deck / portatile gaming | Riutilizzo come Moonlight e client Linux; dock per TV, tastiera e USB. Può anche giocare localmente: non richiede una seconda postazione Windows. |
| PC vecchio / Mac mini esistente | Riuso se il decoder regge il profilo. Verificare OS supportato, porte e rumore/consumo. Potenza CPU alta non compensa sempre un decoder incompatibile. |
| Console / dispositivi modificati | Port comunitari sperimentali; richiedono verifica specifica. Non sono il percorso standard per client familiari. [RIF-CL-03] |
| Display cucina / piccoli pannelli | Browser per ricette, HA, musica e controlli; per Moonlight servono un sistema installabile e un decoder adatto. Un display passivo richiede un endpoint esterno. |

## Scelta per funzione, non per etichetta

Per un ponte USB può bastare un piccolo Linux cablato; per una TV 4K serve un decoder e un’uscita migliori; per lo studio contano input e porte. Il dispositivo che mostra il video e quello che esporta USB possono essere due macchine nella stessa stanza.

| <b>Esperimenti sensati</b><br/>Postazione mobile su dock, angolo retrogaming con controller, pannello per dashboard e telecamere, tablet per manutenzione. Registrare il ruolo e i parametri della postazione: non trasformare un esperimento in un servizio garantito per tutti. |
| --- |

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
