---
codice: "INF-11.05"
titolo: "Tagliando dati, copie e applicazioni"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-11.05 · Tagliando dati, copie e applicazioni

Il tagliando dati collega supporti fisici, pool, applicazioni e copie. Il controllo ordinario riguarda spazio libero, stato ZFS, errori HBA/PCIe, usura SSD, SMART e identità dei membri dei mirror.

| Area | Riscontro periodico |
| --- | --- |
| M2 SSD | Quattro mirror, membri identificati, errori e spazio libero |
| M4 WD | Repository isolato, versioni, ultimo backup e ritardo |
| M4 Seagate | Stato media e carichi di scrittura sui dischi SMR |
| M6 | Spazio INV-008 (Samsung 850 EVO 500 GB), coda e import senza scritture nel mountpoint vuoto |
| Applicazioni | Versione, DB, allegati, mount esterni e account |
| SH1/Workspace | Integrità repository, quote, chiavi e campioni recuperati |

Controllo strutturale e lettura dei dati sono attività distinte. La rotazione dei campioni recuperati e il recupero periodico di un’applicazione affiancano il controllo completo del repository. Le chiavi e gli strumenti restano disponibili su un client indipendente.

- Data e nodi: ____
- Pool, seriali ed errori: ____
- Copie e ultimo recupero: ____
- Applicazioni, esito e anomalie: ____

## Collegamenti

[[START]] · [[REV3-STO]] · [[REV3-BCK]] · [[INF-04.10]] · [[INF-04.11]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
