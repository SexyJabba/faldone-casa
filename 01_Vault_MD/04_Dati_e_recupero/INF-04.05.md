---
codice: "INF-04.05"
titolo: "Backup: locale, fuori casa e selezioni offline"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-04.05 · Backup: locale, fuori casa e selezioni offline

A regime i dati attivi sono sui nodi locali. M4 conserva backup versionati sui WD; Drive offre copia remota; RDX conserva selezioni offline tematiche. Non sono tre copie identiche garantite di ogni file: la copertura si registra per insieme di dati.

| Insieme | Copia locale | Fuori casa / offline |
| --- | --- | --- |
| Documenti, lavoro, foto irrinunciabili | WD su M4, backup coerenti e versionati | Drive; RDX tematici entro capienza |
| DB e configurazioni | Export/backup guest con tutti i volumi necessari | Drive protetto e RDX pertinente; chiavi separatamente |
| Film e serie durante migrazione | Originali conservati fino a copia verificata | Tutti inclusi nel deposito temporaneo Drive se entrano nei 5 TB |
| Media a regime | Pool media dedicato, non WD primari | Perimetro Drive da dimensionare; non promettere retention illimitata |
| Seafile utenti esterni | Solo mirror M6 come scelta precedente | Nessuna nuova copia automatica; chiarire inclusione di dati terzi nella migrazione |
| Vito | Copia locale lavoro e kit offline | Rientro verso archivio autorevole e backup; test recupero su altro dispositivo |

## Arca e RDX

Il P310 resta Arca fino al gate di migrazione, poi diventa il disco dati M2. Tre cartucce HP RDX 2 TB sono una configurazione a 50 EUR ciascuna: foto/video, documenti personali, lavoro. Sono tre selezioni, non tre copie alternate della stessa selezione. Circa 2 TB irrinunciabili complessivi vanno ripartiti lasciando margine in ogni cartuccia per crescita e versioni. Stato usato, compatibilita, cifratura e recupero devono essere provati. Lettore senza cartucce non e un backup.

## Frequenze di progetto

Backup locale giornaliero dalle 18:00 Europe/Rome con WoL di M4 e attesa pool pronto. Non spegnere a ora fissa durante la copia. Drive incrementale dopo una copia coerente, secondo banda e quota. RDX documenti/lavoro settimanali e dopo modifiche importanti; foto dopo importazioni rilevanti. Queste frequenze sono proposte da attivare e verificare.

Conservazione iniziale da dimensionare sui byte reali: obiettivo 7 giornaliere e 4 settimanali per i dati prioritari, riducibile per spazio; mensili solo dopo misura. Nessuna retention ereditata automaticamente dalla vecchia Arca. Avvisare per ultima copia troppo vecchia, job fallito e spazio insufficiente. Un esito verde del job non sostituisce restore.

Sorgenti originali conservate fino a verifica completa e prova applicativa. Per il nucleo irrinunciabile mantenere una copia locale indipendente prima di distruggere il pool sorgente. [[REV4-MIG]] · [[REV3-CLOUD]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
