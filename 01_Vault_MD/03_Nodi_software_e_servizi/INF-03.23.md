---
codice: "INF-03.23"
titolo: "Caddy e dashboard"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-03.23 · Caddy e dashboard

Caddy e Vaultwarden risiedono su S1, ASRock Q1900M, in ambienti e percorsi distinti. Caddy pubblica i servizi concessi di M6 e serve i percorsi personali soltanto secondo la politica di accesso privato. TLS e password applicativa non equivalgono a restrizione ai soli dispositivi dell'utente: Nextcloud e Hermes di M2 richiedono l'accesso remoto personale  dalla rete.

Vaultwarden conserva DB, allegati, configurazione e copie coerenti locali, con backup su M4/SH secondo la politica personale. E escluso dalla VPS, anche come destinazione di backup. Recupero e credenziali offline rimangono utilizzabili senza proxy, DNS o vault funzionante. La gestione di S1 non e pubblicata.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-MAP]] · [[REV3-OPEN]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
