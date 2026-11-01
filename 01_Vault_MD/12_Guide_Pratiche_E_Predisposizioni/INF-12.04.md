---
codice: "INF-12.04"
titolo: "Nextcloud: consultazione"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-12.04 · Nextcloud: consultazione

La condivisione in sola lettura consente consultazione e download dei soli file autorizzati. Utenti, gruppi, scadenza e permessi appartengono alla cartella condivisa. La libreria privata e le altre applicazioni non diventano visibili per la presenza di un link.

Nextcloud risiede nell’ambiente isolato M2, con DB e file coerenti nel pool SSD. I documenti personali e di lavoro rimangono nei rispettivi archivi e account.

**Confini fisici.** M2 servizi personali e M6 servizi esterni hanno accessi distinti; Hermes MP3 e OpenClaw MP1 sono personali. M4 interno:media RO a Jellyfin e scritturaarr limitata, repository WD esclusi. Reti IoTlocale/cloud/camere su switch/AP indipendenti da M5. Vedi REV3-RET.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
