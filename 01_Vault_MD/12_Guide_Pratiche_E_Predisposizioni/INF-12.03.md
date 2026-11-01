---
codice: "INF-12.03"
titolo: "Accesso esterno ai servizi"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-12.03 · Accesso esterno ai servizi

Ogni utente esterno raggiunge soltanto il servizio e i contenuti concessi al proprio account. Il reverse proxy pubblica le rotte autorizzate; M1 filtra i passaggi fra DMZ e rete fidata. Streaming legge le librerie media, Nextcloud i propri dati; i repository backup e la gestione dei nodi rimangono esclusi.

Revoca, scadenza e variazioni dei permessi sono registrate. L’accesso amministrativo di recupero non dipende dal percorso pubblico.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
