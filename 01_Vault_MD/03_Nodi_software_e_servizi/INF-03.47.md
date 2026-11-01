---
codice: "INF-03.47"
titolo: "Vision-gateway su M5"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-03.47 · Vision-gateway su M5

Hermes su MP3 e OpenClaw su MP1 ricevono allegati in quarantena. File, immagini e testo esterno sono dati da analizzare, non istruzioni operative. Identita personale e lavoro restano separate. Le richieste autorizzate passano alle API interne del vision-gateway su M5; nessun accesso generale agli archivi viene assegnato al ponte.

Su M5 risiedono Frigate, Hailo-8 e gateway. Frigate ha priorita; il gateway espone solo modelli e task effettivamente disponibili, con coda limitata, quote e stato job. Detection/classificazione o OCR preliminare richiedono modelli HEF e runtime compatibili: Hailo non rende automaticamente disponibile ogni funzione. Dove esiste una funzione equivalente, il gateway puo usare CPU; altrimenti rinvia o restituisce indisponibilita. Home Assistant conserva il proprio ambiente separato e le automazioni essenziali non richiedono il VLM.

M3 dedica128 GB totali host/IA e RTX3060 alragionamento. Windows/2080 e fuori nodo. Inferenza su conferma / coda, cloud solo esplicito; nessun hardware LLM aggiunto algateway M5.

La pipeline conserva dati letti, inferenze, incertezza e provenienza distinti. Una configurazione strutturata richiede conferma esplicita prima di una modifica a Paperless, Immich, Nextcloud o altri sistemi. Originali conservati, retry idempotenti, destinazione e singola azione riconoscibili. Le versioni di driver, runtime, modelli e misure sono nel registro; nessun benchmark e inventato.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-MAP]] · [[REV3-OPEN]]


## Sedi e disponibilita 4.4

M3 conserva X99-T8 / E5-2678 v3,128 GB DDR3 RDIMM e Proxmox, dedicati all’IA. GPU MSI RTX3060 Ventus 2X 12 GB; WD PC SN530512 GB nello slot M.2PCIe2.0 per host e IA. Windows e Hermes sono su MP3 Aspire; RTX2080 segue MP4, PC del primo fratello. L’altro M.2 non e riservato alla vecchia VM Windows; il saldo Samsung NVMe e ancora n.d.. 

Priorita: richieste personali interattive, poi agenti, infine fondo. La priorita si applica attraverso un arbitraggio comune ai lavori in attesa; non promette interruzione immediata della generazione in corso o concorrenza nella VRAM. Modelli, contesto e motore si scelgono sull’hardware. L’Hailo e un detector su M5, non un acceleratore LLM di M3.

Se M3 e spento l’utente sceglie «accendi adesso» con conferma oppure «metti in coda» fino a un’altra accensione e all’endpoint pronto. Il recupero quorum ha una politica distinta. Dopo30 min senza lavori IA attivi o autorizzati in attesa, arresto ordinato solo se nessun servizio/operazione richiede il nodo senza coinvolgere il quorum del nucleo stabile. Un modello caricato ma inattivo non e un lavoro attivo. Cloud solo su richiesta/conferma, nessun job periodico e nessuna API a consumo.

M5 usa la D1581-Q3, Hailo M-key e avvio SATA.  Memoria obiettivo 32 GB PC3L RDIMM, due moduli del lotto PC3L acquistato. La DDR4 precedentemente destinata a M5 va a M1. Vedere [[INF-03.08]].

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
