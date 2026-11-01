---
codice: "REV4-TEST"
titolo: "Collaudi e registro di accettazione"
revisione: "4.4"
aggiornato: "2026-11-01"
---

# REV4-TEST · Collaudi e registro di accettazione

Ogni prova registra data, esemplare, condizioni, risultato e riferimento all'evidenza. Uno spunto completato nel sito e un appunto personale, non certifica automaticamente l'installazione.

| Prova | Criterio di accettazione | Ripiego |
| --- | --- | --- |
| RAM/boot | Tutti i moduli riconosciuti, test memoria senza errori e avvio ripetuto | Isolare banco/slot; non forzare timing |
| NVMe Q3A | Due SSD presenti insieme e stabili con NIC sotto carico | Mantenere Arca e sistema precedente |
| M1 | Routing, gestione, riavvio e recupero senza dipendere da monitoraggio | Secondo boot/M7 collaudato |
| Cluster | Cinque membri, maggioranza coerente e failover solo con risorse complete | HA non attivata finche manca evidenza |
| Copie | Confronto integrale e restore reale su destinazione distinta | Non cancellare sorgenti |
| M4 SMR | Carico e prova recupero/ricostruzione accettabili | Rivedere topologia o destinazione dischi |
| Frigate | Carico CPU/detector e retention reali con flussi scelti | Ridurre flussi, nessuna promessa6camere |
| Jellyfin | Direct play e transcode provati sui client reali | Profili preconvertiti o direct play |
| Vito | Rapportino offline registrato una volta, kit leggibile e spegnimento pulito | Procedura manuale e copia locale |
| Energia | Arresto ordinato e ripartenza senza perdita dati | Ridurre carico e rivedere protezione |

Campi da compilare: data ____, nodo ____, prova ____, esito ____, evidenza ____, ripetizione prevista ____. Nessun risultato positivo presunto.

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
