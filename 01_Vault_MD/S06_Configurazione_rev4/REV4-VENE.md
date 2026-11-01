---
codice: "REV4-VENE"
titolo: "Energia di bordo: alimentazione, carichi e riserva"
revisione: "4.4"
aggiornato: "2026-11-01"
---

# REV4-VENE · Energia di bordo: alimentazione, carichi e riserva

## Separare avviamento e servizi

L’architettura richiesta usa una batteria servizi separata dalla batteria d’avviamento, attraverso una power station n.d.. L’Anker SOLIX C1000X è un esempio della revisione precedente, non un acquisto confermato. Il progetto energetico del Vito è distinto dall’UPS del rack: capacità, ricarica, collegamenti e autonomia non si trasferiscono da un impianto all’altro.

Le utenze da misurare sono modem, computer, display e accessori realmente installati. Prima della scelta definitiva si prepara una tabella con potenza a riposo, potenza in uso, durata prevista e modalità di spegnimento. I consumi di tutta la casa, il TDP della CPU o i watt massimi di un alimentatore non descrivono il consumo medio del veicolo.

## Alimentare il Dell e il touchscreen

Il manuale del 7070 Ultra distingue la porta USB-C posteriore con Power Delivery dalla porta laterale con DisplayPort Alt Mode. L’alimentazione attraverso USB-C è un percorso documentato della piattaforma, ma va provato con accumulo e cavo effettivi. [Manuale Dell 7070 Ultra](https://dl.dell.com/topicspdf/optiplex-7070-ultra_owners-manual2_en-us.pdf).

La configurazione desiderata evita una dock aggiuntiva: alimentazione al Dell e collegamento del touchscreen attraverso la porta adatta. Un unico cavo al monitor deve essere verificato per video, touch e potenza; se non basta, il monitor avrà un’alimentazione separata esplicitamente prevista. Non si certifica l’abbinamento prima di conoscere il display. Le prove comprendono avvio, ripresa, luminosità abituale e funzionamento sotto carico.

## Profili energetici

- **Lavoro:** modem, computer e display attivi per la sessione; elaborazioni pesanti delegate quando conveniente.
- **Sosta camper:** display spento quando non serve; servizi locali soltanto se necessari e alimentati.
- **Offline:** attività locali e raccolta delle bozze; nessun tentativo continuo di elaborazione cloud.
- **Riserva:** sospensione delle copie e dei carichi non essenziali, salvataggio delle bozze, arresto controllato del PC.

Le soglie della modalità riserva saranno fissate dopo le misure. L’ordine di arresto deve preservare i dati ancora da sincronizzare; la ripresa deve mostrare chiaramente quali attività sono rimaste incomplete. Il modem non resta acceso a costo di compromettere le funzioni prioritarie del mezzo.

## Misure che chiudono il progetto

L’autonomia si stima dall’energia effettivamente utilizzabile e dall’assorbimento medio del profilo, includendo perdite e riserva. Il risultato riporta condizioni e strumenti di misura. Vanno collaudati anche ricarica e uso contemporaneo secondo la documentazione dell’accumulo scelto; il faldone non fornisce cablaggi o protezioni di un impianto ancora non definito.

Il montaggio finale deve lasciare ventilazione, accessibilità ai connettori e fissaggio adeguati all’uso mobile. Prima di una trasferta si verificano carica, cavi, spazio libero e presenza delle copie locali. Le prove energetiche entrano nella checklist [[REV4-VTEST]] e determinano quali servizi di [[REV4-VCAMP]] possano restare attivi.

[[REV4-VITO]] · [[REV4-ROAD]] · [[REV4-HOME]]
