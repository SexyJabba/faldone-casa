---
codice: "INF-12.02"
titolo: "Famiglia: contenuti fuori casa"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-12.02 · Famiglia: contenuti fuori casa

L’accesso esterno usa account nominativi, rotte autorizzate e i servizi pubblicati da Caddy. Il percorso Jellyfin/cloud utenti termina nella DMZ M6; Nextcloud e Hermes MP3 restano nell'accesso remoto personale. I permessi delle librerie e delle cartelle non cambiano per il solo uso da remoto.

Gestione hypervisor, repository WD e dati personali non condivisi restano fuori dal percorso pubblico. Revoca e scadenza degli accessi sono applicate al servizio e alle sessioni pertinenti. Con M4 spento sono assenti i contenuti presenti solo sui suoi dischi; cloud e copia musicale locale M6 restano disponibili, come la domotica M5.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
