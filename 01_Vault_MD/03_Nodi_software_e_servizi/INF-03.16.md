---
codice: "INF-03.16"
titolo: "SMB/NFS: pool primario M2 e backup M4"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-03.16 · SMB/NFS: pool primario M2 e backup M4

Dati personali primari serviti da M2, identità/ACL nel registro identità. M4 ospita copie e media: non presentare i WD come share primaria automatica. Windows su MP3 Aspire via Virt IO/link10Gb. Accesso di restore distinto da servizio ordinario.

**Copie indipendenti.** Dati personali e stato dei servizi sono primari sul pool SSD M2; le copie locali versionate risiedono sui WD Green isolati di M4. SH1 / INV-005 (Crucial P310 4 TB + Lexar E750) e Workspace cifrato prima del caricamento aggiungono copie fuori dal nodo. Configurazioni, immagini di boot e stato applicativo dei nodi, compresi M6 e MP3 / OpenClaw, appartengono alla copertura. Cache, staging, media riscaricabili e registrazioni ordinarie restano esclusi salvo dati insostituibili. Dump DB e file appartengono allo stesso punto coerente. M4 esegue i backup nelle finestre di accensione: ultimo esito e ritardo sono visibili. Le chiavi sono recuperabili anche offline e senza Vaultwarden.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
