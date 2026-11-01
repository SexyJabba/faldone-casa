---
codice: "INF-04.04"
titolo: "Snapshot, versioni e retention"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-04.04 · Snapshot, versioni e retention

| Repository | Retention di riferimento |
| --- | --- |
| SH1 | 14 giornaliere,8 settimanali,12 mensili |
| Workspace | 7 giornaliere,4 settimanali,3 mensili |

Le copie locali sui WD hanno retention compatibile con l’occupazione reale del repository. Retention e deduplicazione non garantiscono da sole capienza. Il pruning conserva almeno una copia recuperabile e rimane sospeso durante incidenti non risolti. I dati ordinari hanno frequenza giornaliera; configurazioni dei nodi dopo modifiche; immagini dei guest secondo spazio e rilevanza. Il registro mostra data dell’ultimo job riuscito e dell’ultimo recupero, con tempi effettivi.

Lo snapshot protegge un punto del filesystem e dipende dal pool che lo contiene. La copia indipendente resta disponibile anche se il pool o lo chassis non lo sono. Dati autorevoli, cache e staging hanno politiche distinte; la cancellazione degli scaricabili non modifica i dati personali.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
