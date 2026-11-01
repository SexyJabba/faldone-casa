# Roadmap di transizione — Natale 2026

Avvio indicativo: 23 dicembre 2026. Le fasi distruttive dipendono dalle prove, non dalla data. Sei PC3L acquistati per 85 EUR; LGS352C-EU ordinato. Nessun collaudo fisico attestato dal faldone.

## 23-27 dicembre 2026 — Inventario e prove da banco

Sapere che cosa funziona prima di cambiare la casa.

- [ ] Registrare consegne e collaudi delle tre D1581, della RAM acquistata e del LGS352C
- [ ] Provare RAM, NVMe simultanei, NIC, temperature e avvio senza GPU
- [ ] Misurare tutti i dati, inclusi media sui WD e contenuti unici Arca
- [ ] Preparare C1 Vito da banco: SSD, alimentazione, display e kit offline

**Condizione di uscita:** Inventario riconciliato, dischi identificati e prove annotate. Nessuna cancellazione.

**Ritorno alla situazione precedente:** Tutto il sistema precedente resta disponibile.

## Dal 27 dicembre 2026 · durata dalla banda — Arca di transizione su Drive

Conservare tutti i dati prima di liberare i dischi.

- [ ] Definire cifratura e perimetro delle cartelle in un lavoro separato
- [ ] Caricare per lotti con registro esiti e controllo integrita
- [ ] Mantenere copia locale indipendente del nucleo irrinunciabile
- [ ] Provare ripristino file e applicazione; completare ultimo incremento

**Condizione di uscita:** Ogni sorgente da ricostruire ha copia completa verificata e recuperabile.

**Ritorno alla situazione precedente:** Sorgenti originali conservate; ripresa dei lotti falliti senza spostamenti.

## 28 dicembre 2026 - 6 gennaio 2027 · se pronti — Rete e nucleo stabile

Costruire il nuovo nucleo senza dipendere dai server a richiesta.

- [ ] Allestire M1 e provare OPNsense, NIC e recupero locale
- [ ] Creare nucleo Proxmox M1/M2/M5/C3/C4 a cinque voti
- [ ] Installare monitoraggio separato su M1 e sentinella S4
- [ ] Collegare M2/M3/M4/M6 alla stella 10G del LGS352C; M3/M4/M6 autonomi

**Condizione di uscita:** Rete ripristinabile, quorum controllato e accesso gestione disponibile anche a router fermo.

**Ritorno alla situazione precedente:** Vecchio firewall o avvio bare metal; importare configurazione verificata.

## Gennaio 2027 o dopo il completamento delle copie — Dati e applicazioni

Liberare il P310 e spostare i dati sulle destinazioni definitive.

- [ ] Trasferire P310 da Arca a M2 soltanto dopo gate copie
- [ ] Ripristinare app e database; misurare latenza, RAM e spazio
- [ ] Evacuare media WD verso pool media collaudato; ricostruire WD per backup
- [ ] Provare backup locale e recupero selettivo; introdurre RDX se acquistati

**Condizione di uscita:** Dati confrontati, applicazioni provate e almeno un recupero eseguito.

**Ritorno alla situazione precedente:** Ripristino da Arca/Drive/RDX secondo copia verificata; mai cancellare unico originale.

## Gennaio 2027 · in parallelo alle copie — Vito: primo viaggio operativo

Lavorare e consultare documenti anche senza casa e LTE.

- [ ] Verificare monitor/touch e alimentazione con C1 reale
- [ ] Configurare rete di bordo e accesso ai soli servizi necessari
- [ ] Preparare rapportino offline con invio e conferma senza duplicati
- [ ] Provare sosta camper, rientro, copia dati e arresto con energia ridotta

**Condizione di uscita:** Rapporto offline recuperato e registrato una sola volta; documenti consultabili senza rete.

**Ritorno alla situazione precedente:** Kit documenti locale e procedura manuale; nessuna dipendenza da automazioni non collaudate.

## Gennaio-febbraio 2027 · dopo collaudi hardware — Domotica, media e telemetria

Attivare gli acceleratori soltanto dove servono.

- [ ] Installare Hailo e camere se acquistati, misurare decodifica e detector
- [ ] Provare Arc e rete su M6; abilitare transcodifica soltanto dopo test
- [ ] Collaudare HAOS/MQTT su C3 e app selezionate su C4
- [ ] Censire eventuali sensori Vito e verificare compatibilita diagnostica

**Condizione di uscita:** Carichi reali stabili; failover e recuperi documentati; nessuna capacita presunta.

**Ritorno alla situazione precedente:** Direct play/media preparati, Frigate ridotto, gestione manuale e copie precedenti.

## Febbraio-marzo 2027 · finestra adattabile — Ottimizzazione e chiusura

Consolidare soltanto cio che e stato misurato.

- [ ] Regolare RAM/ARC da metriche; verificare consumi idle e picchi
- [ ] Verificare stato backup, spazio Drive e selezioni RDX
- [ ] Collaudare perdita LTE del Vito e perdita WAN di casa
- [ ] Aggiornare registro installato, schede e lista acquisti residui

**Condizione di uscita:** Registro collaudi completo e nessuna sorgente unica dimenticata.

**Ritorno alla situazione precedente:** Mantenere configurazione precedente e copie di migrazione finche necessario.

## Connettività e durata

A 4 Mbit/s, 1 TB richiede circa 23 giorni teorici di upload continuativo, prima di margini, altri usi e ritrasmissioni. Il nucleo di circa 2 TB non coincide necessariamente con tutti i media. Misurare il totale completo rispetto ai 5 TB disponibili su Drive; non assumere che la copia termini nelle vacanze.

## Identificazione e posa

SKU esatto dello Xeon E5-2630L v3 M1; modello, RAM e SSD del MacBook M5; capacità dei client; revisioni Q3/Q3A, condivisione delle linee e compatibilità simultanea NVMe/PCIe. Verificare quote del rack, airflow, alimentazione e lunghezze AOC/DAC prima della posa. La stella usa porte 49–52 rispettivamente per M2/M3/M4/M6.

## Autonomia dei rami

Provare Vito senza LTE, domotica senza WAN e servizi locali senza calcolo M3. Il trasferimento di un ramo richiede riconfigurazione del cluster locale e dei percorsi, non estensione di Corosync attraverso WAN. Per il campo, partire da rilievo, perimetro operativo e un ambiente pilota. Per i terzi, attivare un utente pilota con quota, permessi e prova di recupero; per il materiale libero, collaudare e riconciliare i lotti prima di cessione o kit.

## Riconciliazione puntuale del patrimonio

S1: la base è 8 GB, ma INV-041 documenta un solo modulo da 4 GB; associare il secondo senza duplicare la quantità. INV-107 è alias di INV-081: una sola MCX312A. INV-075/099 sono 13 PC3, otto su M3 e cinque liberi; i sei PC3L nuovi sono distinti. Riconciliare boot, telai, PSU e i tre Samsung NVMe prima di nuove destinazioni o vendite.
