---
codice: "REV4-VNET"
titolo: "Rete mobile: bordo, casa e cloud"
revisione: "4.4"
aggiornato: "2026-11-01"
---

# REV4-VNET · Rete mobile: bordo, casa e cloud

## Una rete propria del veicolo

Il Vito dispone di modem LTE e SIM dedicati. Modello, piano dati e collocazione: n.d. nel registro tecnico; la SIM ho. prevista per casa non viene trasferita implicitamente al mezzo. Il collegamento mobile serve il lavoro interattivo, l’accesso ai servizi autorizzati e la consegna dei dati raccolti. “Sempre attivo” descrive un obiettivo di disponibilità, non una connessione garantita in ogni luogo.

La rete locale di bordo deve restare utilizzabile senza Internet. C1, dashboard e dispositivi del camper devono poter comunicare attraverso percorsi locali verificati. Eventuali ospiti ricevono un accesso separato dalla gestione e dalla diagnostica, se l’apparato scelto lo consente; la separazione non viene attribuita a un modem ancora non selezionato.

## Accesso ai servizi domestici

Il percorso candidato è un collegamento privato avviato dal veicolo verso i servizi necessari. L’accesso viene limitato per identità e destinazione: documenti, applicazioni o acquisizione della telemetria non richiedono un ponte indiscriminato verso tutta la LAN domestica. L’eventuale presenza di CGNAT e il metodo di attraversamento vanno verificati con le SIM reali. Il mezzo resta fuori da Corosync, dal qdevice e da ogni voto del cluster.

La maggiore potenza disponibile in casa apre servizi utili: elaborazioni documentali su M3, archivi su M2 e raccolta dello stato nel monitoraggio. La disponibilità del calcolo non diventa una condizione per compilare una bozza o consultare un manuale. Se M3 è spento, l’utente può scegliere la coda o richiedere l’accensione secondo la politica domestica.

## Traffico e priorità

La configurazione distingue attività interattive, documenti operativi e trasferimenti voluminosi. Voce, agenda e piccoli aggiornamenti hanno precedenza durante il lavoro. Foto numerose, media e copie estese attendono una connessione adatta, salvo scelta esplicita. Soglie e limiti dipendono dal piano del veicolo: i valori già  per la SIM domestica non si applicano automaticamente.

Il trasferimento di dati veicolo tramite collegamento privato è una possibilità documentata da MeatPi,  con la destinazione effettiva. L’integrazione Home Assistant conserva anche informazioni sull’anzianità delle letture; il monitoraggio deve presentarle correttamente. [Dati WiCAN e Home Assistant](https://docs.meatpi.com/wican-pro/send-data/home-assistant/).

## Osservabilità mobile

Il quadro di casa mostra ultima comunicazione, stato  e disponibilità del percorso. Un Vito non raggiungibile può essere parcheggiato, spento o fuori copertura: non genera automaticamente lo stesso allarme di un server domestico fermo. La verifica utile separa rete locale, modem, collegamento privato e applicazione. Il controllo remoto non sostituisce il funzionamento locale e non certifica che una misura del camper sia recente.

Collegamenti: [[REV4-VSYNC]] per la consegna dei dati, [[REV4-VENE]] per le politiche di alimentazione e [[REV4-VTEST]] per i collaudi di disconnessione.

[[REV4-VITO]] · [[REV4-ROAD]] · [[REV4-HOME]]
