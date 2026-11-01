---
codice: "REV4-VCAMP"
titolo: "Camper: servizi locali e modalità di sosta"
revisione: "4.4"
aggiornato: "2026-11-01"
---

# REV4-VCAMP · Camper: servizi locali e modalità di sosta

## Il camper continua a funzionare senza casa

Le funzioni essenziali della sosta devono dipendere dal sistema locale del mezzo. Il progetto prevede una dashboard camper e valuta Home Assistant di bordo per integrare i dispositivi effettivamente presenti. La sede e il metodo d’installazione del servizio vanno scelti dopo la prova di C1: una macchina Windows dedicata alla diagnostica, un servizio locale e lo spegnimento per risparmio energetico devono convivere con una politica esplicita. Non è ancora attestato un server Home Assistant installato nel Vito.

Il primo lavoro è censire l’allestimento reale. Energia servizi, temperature, illuminazione, acqua e altri impianti sono **categorie da rilevare**, non sensori già disponibili. Per ogni funzione si annotano dispositivo, alimentazione, possibilità di comando locale, interfaccia utilizzabile e comportamento quando il computer è spento. Una dashboard non sostituisce i comandi essenziali del mezzo.

## Una pagina di bordo leggibile

La vista principale propone pochi elementi: modalità attiva, disponibilità rete, stato del computer, documenti locali e dati camper verificati. Una misura assente rimane “non integrata”. Una misura vecchia mostra l’ora dell’ultima lettura. Il progetto non attribuisce al Vito posizione GPS, livelli o percentuali che non siano stati acquisiti da dispositivi reali.

WiCAN Pro è candidato alla telemetria veicolo; acquisto e montaggio restano da confermare. La documentazione corrente descrive un’integrazione Home Assistant locale, con parametri configurati e indicazione dei dati non aggiornati. La posizione richiede un accessorio che la fornisca. Queste possibilità non certificano quali parametri siano leggibili sul W639 specifico. [Integrazione Home Assistant di MeatPi](https://docs.meatpi.com/wican-pro/send-data/home-assistant/).

## Sosta, intrattenimento e uso quotidiano

La selezione di documenti camper, manuali e contenuti multimediali viene preparata prima della partenza e dimensionata sullo storage effettivo. Il collegamento a Jellyfin di casa è un servizio aggiuntivo quando rete e server sono disponibili; i contenuti scelti per l’uso offline non devono richiederne l’accensione. Le copie locali vanno distinte dall’archivio originale e possono avere un limite di spazio esplicito.

La modalità sosta mantiene accesi soltanto i servizi necessari. Spegnere il display non deve essere confuso con spegnere il computer; spegnere il computer interrompe i servizi ospitati su di esso. Il requisito del modem sempre attivo resta subordinato al dimensionamento della batteria servizi e alle soglie di riserva, senza attribuire un’autonomia non misurata.

## Prova di accettazione

La prova camper si svolge con Internet assente e casa non raggiungibile: aprire i documenti selezionati, usare i comandi locali , verificare quali dati restano aggiornati e arrestare ordinatamente il PC. Le funzioni che falliscono vengono dichiarate dipendenti dalla rete o rinviate. Il risultato confluisce in [[REV4-VTEST]], mentre alimentazione e profili sono descritti in [[REV4-VENE]].

[[REV4-VITO]] · [[REV4-ROAD]] · [[REV4-HOME]]
