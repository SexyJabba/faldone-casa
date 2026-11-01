---
codice: "INF-11.12"
titolo: "Registro visione: versioni, qualità e prestazioni"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-11.12 · Registro visione: versioni, qualità e prestazioni

Questo registro separa specifiche della configurazione, casi di riferimento e risultati osservati. I campi vuoti non attestano prestazioni o integrazioni funzionanti. Le misure appartengono alla macchina e alla combinazione di versioni rilevata.

## Identità e software

Il registro tecnico associa INV-097/098 a SKU, collegamento e slot, link negoziato, BIOS, kernel, driver, firmware, HailoRT, runtime modelli, immagini container e configurazioni. Per ciascun modello conserva architettura, formato/HEF, versione, hash, classi, pre/post-processing e limiti. Endpoint, autenticazione per servizio, permessi, dataset e retention rimandano alla configurazione protetta; nessun segreto compare nei log o nelle copie condivisibili.

## Campione di riferimento

| Gruppo | Campione | Osservazioni |
| --- | --- | --- |
| Materiali | 20 foto | Marche, codici, quantità, unità e anomalie |
| Documenti fotografati | 10 | Italiano, prospettiva, illuminazione, numeri/date |
| PDF | 10 | Testo nativo e scansioni; tabelle e codici |
| Foto personali | 10 | Tag/album , originali conservati |
| Persone/veicoli/animali | 10 immagini | Classi, falsi positivi/negativi e zone |
| Frigate | Avvio graduale, fino a sei camere previste | Detection e registrazione distinte |
| Home Assistant | Almeno 3 automazioni | Eventi visivi disabilitabili, regole essenziali autonome |
| OpenClaw/WhatsApp | Almeno 5 messaggi con allegati | Proposta e conferma collegate al job |
| Errori e recupero | Conferma, annullamento, errore, retry, rollback | Nessuna scrittura definitiva senza consenso |

## Tempi e risorse

Per le pipeline si registrano upload, OCR, attesa coda, pre-analisi Hailo/CPU, inferenza VLM, risposta finale e token/s con contesto e concorrenza. Qualità comprende accuratezza per campo, campi incerti, correzioni manuali, italiano, tabelle, codici prodotto, quantità e date. Stesso campione e preprocessing rendono confrontabili i backend.

Frigate registra latenza detector, frame persi, fps utili e carico CPU sui flussi effettivamente configurati, con temperature e consumo. Il confronto include contemporaneità dei job gateway e riporta la priorità realmente applicata. Jellyfin registra codec/profilo, risoluzione, bit depth, preset, sottotitoli, tone mapping, Direct Play/remux/transcodifica e numero di flussi, con consumo/temperatura M6.

Il consumo è misurato sul nodo completo e distingue idle e carico; TOPS, TDP e watt nominali non lo sostituiscono. Hailo non è accreditato di un miglioramento finché tempi e qualità non lo mostrano.

## Integrazioni e recupero

Il registro distingue backend ufficiali Frigate/Jellyfin, ML/OCR nativi Immich/Paperless e funzioni custom vision-gateway. Per ogni integrazione conserva limiti, dati archiviati, schema API e percorso di disattivazione. Il recupero conserva configurazioni e versioni note, interrompe i job differibili, ripristina le funzioni di base e mantiene gli originali. Il ritorno al percorso nativo non cancella l’archivio e non modifica automaticamente file o servizi.

## Collegamenti

[[START]] · [[REV3-VIS]] · [[REV3-SRV]] · [[REV3-MAP]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
