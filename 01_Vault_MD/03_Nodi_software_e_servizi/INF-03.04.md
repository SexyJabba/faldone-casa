---
codice: "INF-03.04"
titolo: "Applicazioni personali e appartamenti"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-03.04 · Applicazioni personali e appartamenti

Paperless, Tandoor, Stirling PDF, HomeBox, Vikunja, Grocy e Firefly III risiedono su M2. Database, allegati, configurazioni e utenti formano lo stato persistente di ciascuna applicazione.

Paperless e Firefly mantengono dati personali e ruoli distinti dal lavoro. Tandoor separa gli spazi privati per appartamento e lo spazio Condivise; copiare una ricetta non trasferisce diritti sulle altre raccolte. Grocy e HomeBox conservano i rispettivi inventari; Vikunja conserva attività e progetti. IT-Tools resta sul nodo di super visione come utilità leggera.

Il backup comprende DB e file associati dello stesso punto. Nessuna applicazione ha accesso generale ai datadir interni delle altre.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
