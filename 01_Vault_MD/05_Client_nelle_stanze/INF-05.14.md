---
codice: "INF-05.14"
titolo: "Uso quotidiano e diagnosi"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-05.14 · Uso quotidiano e diagnosi

**Postazioni e client.** I quattro Dell OptiPlex 7070 Ultra con i5-8265U sono C1 sul Vito (8 GB), C2 in cucina (8 GB), C3 in camera (16 GB) e C4 in salone (16 GB). Le capacità SSD non sono censite individualmente. C3/C4 affiancano il client Linux con host Proxmox e guest di riserva selezionati; C1 resta autonomo e fuori dal cluster. MP3 Acer ospita Windows e Sunshine; i client Moonlight raggiungono quella sessione con account autorizzati. Il laboratorio usa MP3 e le postazioni Wyse. MP1 è il MacBook M5 personale a casa, con utente lavoro separato.

## Profilo e procedura di stanza

## Routine della postazione

Per i servizi locali aprire l’app. Per Windows verificare disponibilità di M3 e della VM, poi aprire Moonlight. Collegare le periferiche necessarie; acquisire solo l’USB speciale. A fine uso espellere i dischi, rilasciare l’USB e chiudere lo stream; lo spegnimento di Windows è una scelta separata.

| Sintomo | Controllo / azione |
| --- | --- |
| Homepage non apre | Verificare rete e DNS; provare l’indirizzo diretto. Se manca solo il nome, correggere DNS senza modificare il servizio. |
| Chat aperta, IA non risponde | Controllare M3 e backend del modello, poi rete e interfaccia M2. La pagina disponibile non prova il calcolo disponibile. |
| Moonlight non trova Windows | Verificare boot VM, Sunshine e firewall TCP/UDP; aggiungere indirizzo manualmente tra segmenti. |
| Schermo nero | Provare Desktop non protetto; controllare display, cattura e GPU. Se riguarda solo Sky/OTT può dipendere da protezione del contenuto. |
| Scatti / ritardo | Leggere statistiche; distinguere rete, decoder e host. Ridurre profilo, provare Ethernet, controllare carico IA/CPU. |
| Controller doppio / USB assente | Verificare inoltro Moonlight, proprietario USB e driver Windows. Evitare doppio percorso per lo stesso controller. |
| Film ricodificato / audio errato | Controllare formato, sottotitoli, client e capacità audio. Provare app nativa e file compatibile prima di cambiare server. |
| USB non si riprende | Rilasciare nel client USB, verificare server stanza/rete, riacquisire. Prima di scollegare storage espellere in Windows. |

Annotare sintomo, stanza, ora, profilo e variazione che ha risolto. Per guasti preboot o accesso fisico alla macchina usare la sala server come stabilito. Non trattare un riavvio generale come prima diagnosi di ogni problema.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
