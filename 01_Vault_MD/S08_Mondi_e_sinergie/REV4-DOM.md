---
codice: "REV4-DOM"
titolo: "Domotica · ambienti che restano governabili"
revisione: "4.4"
aggiornato: "2026-11-01"
---

# REV4-DOM · Domotica · ambienti che restano governabili

La domotica è un insieme di ambienti governabili, ciascuno con identità, comandi e responsabilità proprie. La casa è il primo ambiente, il laboratorio un secondo contesto operativo, il Vito un ambiente mobile; il campo dietro casa introduce una futura attività con esigenze proprie. Un metodo comune rende leggibili questi spazi senza fingere che siano un unico edificio, una sola rete radio o un solo insieme di permessi. La portabilità nasce dalla possibilità di spostare un modulo con configurazione e documentazione, conservandone il significato.

### Servizi centrali e funzioni vicine all’ambiente

M5 ospita il ruolo di Home Assistant, MQTT e Frigate; S3 mantiene il ruolo radio con Sonoff e Zigbee2MQTT. Questa divisione rende esplicita la differenza fra il collegamento ai dispositivi e l’elaborazione dei loro dati. La dashboard è un’interfaccia, il servizio di automazione una funzione, la radio un componente fisico: separarli nella documentazione permette di capire quale parte ripristinare quando un comportamento non funziona. Il progetto non affida le funzioni essenziali di un ambiente alla sola disponibilità del cloud o di un pannello remoto.

I client delle stanze sono punti di accesso coerenti con il loro uso. L’ingresso usa il Microtech per il pannello citofono e allarme; cucina, camera e salone dispongono dei client Dell assegnati; studio e impianto Hi-Fi hanno i rispettivi Wyse. La schermata della cucina può privilegiare consultazione e media, quella dell’ingresso gli eventi pertinenti a quel luogo. Identità della stanza e privilegi dell’utente restano due cose distinte: trovarsi davanti a un display non concede automaticamente amministrazione completa.

### Un modulo trasportabile

Un modulo ambientale comprende il suo elenco di apparati, i nomi delle entità, il significato dei comandi, le dipendenze, le credenziali pertinenti e il modo di recuperarlo. Trasportarlo dal laboratorio a un’altra sede richiede di ricreare le connessioni locali previste; non implica allungare la copertura radio domestica fino al nuovo luogo. I parametri specifici dell’ambiente restano separati dal modello della dashboard. Lo stesso criterio vale per il Vito: convenzioni grafiche comuni e servizi locali propri, con priorità energetiche differenti da quelle della casa.

Il campo è rappresentato come spazio operativo della futura attività agricola. Le categorie di informazioni possono comprendere osservazioni, interventi, risorse e condizioni ambientali, ma nessuna categoria equivale a un sensore acquistato o installato. I dati del vecchio progetto di orto verticale non definiscono il perimetro o gli impianti del campo. Il primo servizio utile è una raccolta coerente di osservazioni, collegata al laboratorio e al registro dell’attività.

### Un evento dall’ambiente alla decisione

Il percorso completo comincia da un evento o da una nota dell’operatore. L’informazione riceve origine e orario, il servizio locale la interpreta e il pannello pertinente la presenta. Se richiede attenzione, la supervisione del laboratorio la mette nel contesto delle altre attività. Un intervento viene registrato con il suo esito; il sistema conserva la differenza fra evento, decisione e azione eseguita. Se il collegamento con casa manca, il comportamento locale previsto resta valido e la consegna dello storico riprende in seguito.

L’osservabilità distingue dispositivi irraggiungibili, dati vecchi, spegnimenti programmati e guasti. Questa distinzione evita sia allarmi continui sia dashboard rassicuranti ma prive di dati recenti. Il collegamento ai server offre conservazione, ricerca e confronto nel tempo; il laboratorio offre controllo e manutenzione; l’inventario conserva la storia delle assegnazioni. Il risultato è una domotica che può crescere per ambienti e seguire una nuova sede senza imporre di trasferire contemporaneamente tutto il resto dell’ecosistema.

## Autonomia operativa

- Comandi locali per le funzioni essenziali degli ambienti
- Radio S3 separata dai carichi applicativi di M5
- Configurazioni esportabili e identità esplicite per ogni ambiente
- Dati vecchi e assenza rete distinguibili da un guasto

## Confini e responsabilità

- IoT e camere separati dalla gestione e dai dati di lavoro
- Nessun sensore del campo o del camper presunto esistente
- Le funzioni locali non dipendono dalla visione remota
- I profili di un ambiente non autorizzano automaticamente azioni sugli altri

## Interfacce con gli altri mondi

| Ramo | Scambio |
| --- | --- |
| sala-server | Servizi HAOS/MQTT/Frigate, conservazione e osservabilità |
| laboratorio | Supervisione degli ambienti e manutenzione |
| vito | Replica del metodo di gestione locale su un nodo mobile |
| inventario | Tracciamento di radio, sensori, client e configurazioni |

## Navigazione

[[REV4-ECO]] · [[REV4-SIN]] · [[REV4-ROAD]]
