---
codice: "REV4-RACK"
titolo: "Sala server: rack, cablaggi ed energia"
revisione: "4.4"
aggiornato: "2026-11-01"
---

# REV4-RACK · Sala server: rack, cablaggi ed energia

La sala server è un progetto trasferibile. La collocazione attuale nella nicchia del sottotetto riunisce nodi, dorsale, distribuzione energetica e percorsi d’aria; l’identità dei servizi non dipende dalla stanza.

## Organizzazione funzionale

Il fronte separa il nucleo stabile (rete, M1, M2, M5 e servizi ausiliari) dai nodi a richiesta M3, M4 e M6. I riferimenti delle fonti descrivono montanti da 84 e 104 cm, equivalenti nominalmente a 18U e 23U, e un vano inferiore per l’energia. Il diagramma è uno schema di disposizione funzionale: i numeri U non sono una certificazione della posa.

## Dispositivi e connessioni

Il LGS352C-EU concentra i quattro collegamenti server a 10 GbE. Gestione e Corosync usano percorsi cablati locali. Ogni cavo ha un’etichetta ai due estremi; le interfacce di alimentazione, rete, storage e console appartengono alla scheda del nodo. I passacavi non devono impedire estrazione dei tray, accesso ai filtri o manutenzione del retro.

## Aria ed energia

Il flusso d’aria attraversa i frontali e viene espulso dalla nicchia; filtri e aspirazione restano accessibili. Il TDP CPU non dimensiona da solo alimentazione o autonomia. Accumulo rack e piccoli UPS dei client sono domini distinti. Nell’arresto prolungato si chiudono prima carichi e guest, poi host; rete e sentinella restano disponibili per ultime.

## Trasferimento di sede

La migrazione mantiene inventario, nomi, configurazioni esportate e registri di ripristino. Il dominio di quorum resta locale alla sede: il progetto non allunga Corosync su Internet. La domotica e il Vito conservano funzioni locali, mentre i client personali ritrovano i servizi attraverso gli accessi autorizzati.

## Navigazione

[[REV4-ECO]] · [[REV4-SIN]] · [[REV4-ROAD]]
