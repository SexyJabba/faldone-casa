---
codice: "INF-05.09"
titolo: "Profilo E: tablet e telefoni"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-05.09 · Profilo E: tablet e telefoni

**Postazioni e client.** I quattro Dell OptiPlex 7070 Ultra con i5-8265U sono C1 sul Vito (8 GB), C2 in cucina (8 GB), C3 in camera (16 GB) e C4 in salone (16 GB). Le capacità SSD non sono censite individualmente. C3/C4 affiancano il client Linux con host Proxmox e guest di riserva selezionati; C1 resta autonomo e fuori dal cluster. MP3 Acer ospita Windows e Sunshine; i client Moonlight raggiungono quella sessione con account autorizzati. Il laboratorio usa MP3 e le postazioni Wyse. MP1 è il MacBook M5 personale a casa, con utente lavoro separato.

## Profilo e procedura di stanza

| Piattaforma | Capacità / attenzione |
| --- | --- |
| Android | Moonlight con touch o input esterni; app Immich, Nextcloud, Jellyfin e musica. USB host/OTG e VirtualHere server possibili sui modelli compatibili. [RIF-CL-03, RIF-CL-20] |
| iPad / iPhone | Moonlight i OS, app media/dati e browser. Controller e tastiera compatibili; mouse, dock, uscita video e modalità schermo dipendono da modello e versione OS. |
| Tablet dedicato a parete | Homepage/HA/camere nel browser o app specifica; alimentazione e gestione schermo. Moonlight resta una funzione aggiuntiva, non necessaria per un pannello HA. |

## Desktop Windows in mobilità

Il touch consente accesso rapido ma non offre automaticamente l’ergonomia di un mouse. Due profili distinguono consultazione touch e lavoro con tastiera/puntatore. Una risoluzione troppo alta su un piccolo pannello rende le scritte difficili da leggere: ridurre la risoluzione host o aumentare la scala di Windows.

Il profilo Wi-Fi dipende dal punto d’uso e dalla copertura. In un dock Ethernet controllare USB, alimentazione e uscita video contemporaneamente. Non presumere estensione multi-monitor dalla sola presenza di USB-C.

## Foto, voce e periferiche

• Abilitare il backup Immich e le cartelle desiderate con account personale; verificare caricamento anche a schermo bloccato secondo le regole dell’OS.

• Per dettatura e segretaria usare il percorso vocale già assegnato dal servizio o dal bot. Un microfono locale per una pagina web è distinto dal microfono dentro Windows remoto.

• Su iPad/iPhone non è documentato un server VirtualHere nativo: per USB grezzo destinato a Windows usare un ponte esterno. L’USB locale del tablet può avere altri usi senza essere esportabile.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
