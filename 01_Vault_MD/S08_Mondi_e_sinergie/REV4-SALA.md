---
codice: "REV4-SALA"
titolo: "Sala server · capacità trasferibile"
revisione: "4.4"
aggiornato: "2026-11-01"
---

# REV4-SALA · Sala server · capacità trasferibile

La sala server è il ramo che fornisce dati, applicazioni, calcolo e recupero agli altri mondi. La nicchia nel sottotetto è la sua collocazione fisica attuale di progetto, mentre l’identità del sistema risiede nei ruoli dei nodi, nei collegamenti, nelle destinazioni dei dati e nelle procedure. Questo rende trasferibili server e servizi anche quando la futura sede ha forma, alimentazione e ventilazione differenti. Non si considera la nicchia un armadio pronto da spostare intero: la portabilità riguarda componenti riconoscibili e un sistema ricostruibile.

### Capacità distribuite secondo il lavoro

M1 governa rete e osservabilità, con OPNsense e una VM separata per il monitoraggio. M2 raccoglie le applicazioni e usa il P310 da 4 TB come spazio operativo transitorio al posto del pool SSD. M3 offre capacità IA, M4 concentra i ruoli di archivio e backup previsti, M5 sostiene i servizi domestici e M6 i servizi multimediali. Le funzioni ausiliarie S1, S3 e S4 restano leggibili come ruoli distinti. La disponibilità del nucleo essenziale non richiede che ogni nodo di calcolo o multimediale lavori continuamente.

La memoria si assegna al servizio che può trarne beneficio: applicazioni, database, cache locale e lavorazioni concorrenti. Una cache che riduce attese produce valore; occupare RAM senza riuso non è un risultato. Il monitoraggio di M1 confronta pressione di memoria, latenze, capacità dei dischi e riuscita dei backup. Le modifiche di assegnazione partono da questi dati. Il controllo esterno al solo M1 conserva la possibilità di distinguere un guasto del monitoraggio dall’assenza dell’intera rete.

### Stella di rete e gestione separata

La topologia di riferimento collega M2, M3, M4 e M6 direttamente ai quattro uplink 10G dello switch LGS352C. M1 usa una connessione in rame a 1G; la rete di gestione è separata dai flussi applicativi secondo il piano di accesso. Il disegno non conserva i vecchi collegamenti punto-punto fra server. Lo switch ha il ruolo di centro della stella, non quello di alimentatore PoE per apparati ambientali. Il traffico di calcolo, archivio e servizi mantiene quindi percorsi rappresentabili e verificabili in un’unica mappa.

L’accesso a un’applicazione non dà accesso alla gestione dell’host che la ospita. Vito, client delle stanze e utenti esterni arrivano ai servizi autorizzati; non ereditano privilegi su hypervisor, condivisioni di backup o amministrazione di rete. Il nodo mobile e le sedi di terzi non partecipano al quorum domestico. Il loro distacco è un evento normale, non una condizione da compensare con dipendenze di cluster.

### Dal dato attivo al recupero

Un documento prodotto nel Vito viene consegnato al servizio applicativo, registrato e protetto dai percorsi di backup. Il P310 è una destinazione temporanea dei dati attivi, non una seconda copia di Arca: è lo stesso componente che cambia ruolo. I WD diventano destinazione di backup secondo la transizione, Drive offre la copia esterna e gli RDX custodiscono sottoinsiemi offline per categoria. La capacità disponibile e le versioni conservate appartengono al piano di ciascuna destinazione, senza sommare supporti diversi come se fossero un unico disco.

Il trasferimento a un’altra sede segue lo stesso principio di un recupero: inventario, configurazioni esportate, ordine di avvio, verifica dei servizi e ripristino campione. Ogni cavo e componente conserva una destinazione leggibile. Le quote fisiche della nicchia restano nelle note di rilievo fino a conferma; il disegno principale è funzionale. La sala server può così collaborare con lavoro, casa e servizi esterni senza trasformare la collocazione domestica in un vincolo permanente per tutti.

## Autonomia operativa

- Nucleo locale per rete e servizi essenziali
- Calcolo e media accesi secondo domanda e dipendenze
- Backup e configurazioni recuperabili su altra collocazione
- Separazione fra hardware, ruolo e luogo fisico

## Confini e responsabilità

- Nessun voto di cluster dipende dal Vito o da client terzi
- Accessi ai servizi distinti dalla gestione degli host
- Archivi personali e backup esclusi dalle librerie pubblicate
- Energia e ventilazione si dimensionano per la sede reale

## Interfacce con gli altri mondi

| Ramo | Scambio |
| --- | --- |
| laboratorio | Gestionali, documenti, IA e strumenti di supervisione |
| vito | Consegna dati e calcolo remoto su richiesta |
| domotica | Servizi locali e conservazione delle evidenze |
| terzi | Servizi pubblicati con account e quote |
| inventario | Ricambi, spare e piano di ricollocazione |

## Navigazione

[[REV4-ECO]] · [[REV4-SIN]] · [[REV4-ROAD]]
