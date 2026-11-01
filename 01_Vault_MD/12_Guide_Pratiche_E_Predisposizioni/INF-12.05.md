---
codice: "INF-12.05"
titolo: "Nextcloud: modifica e cartelle condivise"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-12.05 · Nextcloud: modifica e cartelle condivise

La scrittura è limitata alle cartelle assegnate. Creazione, modifica e cancellazione seguono i permessi del gruppo o dell’utente, con versioni e copie indipendenti. Il datadir interno non è una share SMB generica; upload e sincronizzazione passano dalle interfacce supportate.

Nextcloud risiede nell’ambiente isolato M2, con DB e file coerenti nel pool SSD. I documenti personali e di lavoro rimangono nei rispettivi archivi e account.

**Confini fisici.** M2 servizi personali e M6 servizi esterni hanno accessi distinti; Hermes MP3 e OpenClaw MP1 sono personali. M4 interno:media RO a Jellyfin e scritturaarr limitata, repository WD esclusi. Reti IoTlocale/cloud/camere su switch/AP indipendenti da M5. Vedi REV3-RET.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
