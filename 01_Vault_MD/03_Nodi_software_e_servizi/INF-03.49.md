---
codice: "INF-03.49"
titolo: "Seafile: cloud esterno e limite di protezione"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-03.49 · Seafile: cloud esterno e limite di protezione

Seafile e su M6 in ambiente separato da download e servizi personali M2. Dieci utenti autorizzati con 50 GB ciascuno; 2 WD10EZRX da 1 TB in mirror condividono cloud, versioni locali e copia audio quotata entro spazio effettivo e margine libero. Account equote individuali; nessun accesso generale alla LAN o ai WD di M4.

Scelta esplicita: solo mirror locale M6, nessun backup aggiuntivo dei dati/archivio applicativo Seafile su M4, SH1 o Workspace. I jobguest non reintroducono implicitamente copie escluse. Il mirror tollera un guasto disco ma non e una copia indipendente contro cancellazioni, corruzione o perdita di tutto il pool/nodo. Eventuali versioni locali non sono un backup esterno.

M6 si accende su richiesta; il servizio rimane in attesa finche nodo/container/dati non sono pronti. HTTPS per utenti autorizzati tramite ingresso indipendente M6. Pubblicazione su5G entro quota; downloadfile instradati FTTC con limite dinamico secondo progetto di rete.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-MAP]] · [[REV3-OPEN]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
