---
codice: "INF-05.13"
titolo: "Uso simultaneo e musica da remoto"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-05.13 · Uso simultaneo e musica da remoto

**Postazioni e client.** I quattro Dell OptiPlex 7070 Ultra con i5-8265U sono C1 sul Vito (8 GB), C2 in cucina (8 GB), C3 in camera (16 GB) e C4 in salone (16 GB). Le capacità SSD non sono censite individualmente. C3/C4 affiancano il client Linux con host Proxmox e guest di riserva selezionati; C1 resta autonomo e fuori dal cluster. MP3 Acer ospita Windows e Sunshine; i client Moonlight raggiungono quella sessione con account autorizzati. Il laboratorio usa MP3 e le postazioni Wyse. MP1 è il MacBook M5 personale a casa, con utente lavoro separato.

## Profilo e procedura di stanza

**Perimetro:** Una Windows condivisa; media indipendenti

L’uso prevalente è una persona che cambia stanza. Sono assegnate anche persone diverse: una può giocare su M2 mentre un’altra vede Jellyfin o ascolta musica da M2. Il progetto offre una sola postazione Windows condivisa; sessioni indipendenti non sono assegnate.

Moonlight accede alla stessa postazione Windows. Due client non producono automaticamente due desktop o due giochi separati. Eventuali sessioni simultanee richiedono un progetto distinto.

REAPER e Ableton remoti servono per aprire, ascoltare e ritoccare progetti semplici. Registrazione, strumenti dal vivo e lavoro realmente in tempo reale restano sul Mac Book. La scheda audio locale può essere uscita del Dell: per il solo ascolto non è necessario importarla via USB over IP nella VM.

Compatibilità dei progetti e plugin Mac/Windows e percorso di cattura dell’audio vanno provati al livello applicativo, senza trasformarli in un obbligo di Windows locale sui client.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
