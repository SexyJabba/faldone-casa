---
codice: "REV4-VDIAG"
titolo: "Diagnostica W639: telemetria e strumenti Mercedes"
revisione: "4.4"
aggiornato: "2026-11-01"
---

# REV4-VDIAG · Diagnostica W639: telemetria e strumenti Mercedes

## Partire dall’identità del mezzo

Prima di scegliere software e interfaccia diagnostica si registrano anno, motorizzazione, classe Euro e identificazione precisa del W639. Questi dati non sono ancora presenti nella configurazione consolidata. Il numero di telaio, se archiviato, appartiene alla documentazione privata del mezzo e non deve comparire automaticamente in una versione del sito destinata alla condivisione.

Il progetto distingue due funzioni. **Telemetria** significa raccogliere parametri disponibili e mostrarli nelle dashboard. **Diagnostica Mercedes** significa usare strumenti compatibili con le centraline e con le operazioni richieste. Un dispositivo utile alla prima funzione non viene considerato automaticamente completo per la seconda.

## WiCAN Pro come candidato

WiCAN Pro è il gateway di telemetria di bordo. La documentazione corrente descrive invio dei dati OBD verso Home Assistant e applicazioni diagnostiche; il manuale consultato riguarda firmware 6 e successivi. Parametri e qualità delle letture devono essere provati sul veicolo reale. [Manuale WiCAN Pro](https://docs.meatpi.com/wican-pro/).

Per il percorso PassThru, MeatPi documenta il supporto J2534 e specifica che i protocolli K-line non sono supportati. Questa limitazione impedisce di promettere una diagnosi completa del W639 soltanto dal nome dell’adattatore. [Compatibilità J2534 WiCAN](https://docs.meatpi.com/wican-pro/send-data/j2534/).

## Valutare XENTRY senza acquisti al buio

Le FAQ Mercedes delimitano XENTRY Pass Thru EU alle serie previste, fra cui i van Euro 5/6. Richiedono connessione online, contratto e crediti; indicano 8 GB di RAM minimi, 16 GB consigliati e almeno 150 GB di spazio libero. [FAQ ufficiali XENTRY Pass Thru EU](https://b2bconnect.mercedes-benz.com/ee/help/faq/software/xentry-pass-thru-eu).

C1 ha 8 GB  e uno storage ancora da misurare: la disponibilità del PC non equivale quindi a una postazione diagnostica pronta. Occorre prima verificare copertura del mezzo, sistema operativo compatibile, spazio e convivenza con gli altri servizi. La diagnostica offline non è una promessa di questo percorso. Se il veicolo richiede una soluzione diversa, l’interfaccia corretta viene scelta separatamente dalla telemetria camper.

## Sessioni e conservazione dei risultati

La prima fase privilegia lettura, identificazione e raccolta dei rapporti. Ogni sessione annota data, condizioni osservate, strumento, versione e file prodotti. I codici letti sono evidenze da interpretare, non diagnosi meccaniche definitive. L’assistente può ordinare documenti e suggerire riferimenti ; non prende decisioni autonome sulle centraline.

Cancellazione errori, codifica e scrittura firmware non fanno parte delle operazioni implicitamente approvate dal faldone. I risultati utili vengono associati al registro di manutenzione del mezzo e inclusi nel backup dei documenti. Le prove di compatibilità costituiscono un passaggio esplicito della roadmap [[REV4-VTEST]], prima di acquistare licenze o attribuire capacità diagnostiche alla dashboard.

[[REV4-VITO]] · [[REV4-ROAD]] · [[REV4-HOME]]
