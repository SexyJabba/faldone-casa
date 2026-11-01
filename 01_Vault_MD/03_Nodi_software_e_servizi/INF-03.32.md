---
codice: "INF-03.32"
titolo: "Wake-on-LAN e recupero"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-03.32 · Wake-on-LAN e recupero

S4 Wyse e primo mittente, C4 Dell salone secondo. MAC/BIOS e rete restano disponibili fuori dalla sola gestione del cluster. M3 si accende per IA su conferma o coda e per recupero quorum secondo la sequenza prevista; l’accensione inviata non equivale al nodo gia rientrato.

M4 si sveglia per richiesta di visione e backup alle 18:00. L’accesso remoto ai media considera anche disponibilita del servizio M6 e timeout/readiness. Gli HP offline usano i titoli gia sulla USB senza risvegliare server. Arresti M3/M4 dopo 30 minuti solo con dipendenze e quorum validi. [[REV3-HA]] e [[REV3-ENE]] contengono le condizioni. La VPS puo osservare/relay ma non invia magic packet nella LAN senza percorso predisposto.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-OPEN]] · [[REV3-DIFF]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
