---
codice: "INF-08.03"
titolo: "Notifiche immediate e riepiloghi"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-08.03 · Notifiche immediate e riepiloghi

**Perimetro:** Separazione delle urgenze

| Livello | Contenuti |
| --- | --- |
| Immediato | Intrusione, fumo, gas, acqua, blackout e guasti critici che richiedono intervento. |
| Riepilogo | Stato servizi, esito backup, anomalie non urgenti e manutenzioni. |
| Destinatari | Alessandro riceve tutto; familiari eventi delle proprie aree e comuni pertinenti. |
| Percorso | ntfy su S1 come raccolta locale; S2 VPS per gli avvisi complementari; canali di chiamata e avvisi di sicurezza nei rispettivi profili. |
| Autonomia | Sirene/allarmi locali continuano senza ntfy, M2, HA o Internet secondo centrale e sensori scelti. |

Il recapito remoto dipende dai percorsi Internet ancora funzionanti. La FWA protegge soltanto M1. Frequenza riepilogo, silenziamento, escalation e conferma presa in carico sono dettagli da affinare.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
