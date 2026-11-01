---
codice: "INF-08.06"
titolo: "Transizione: copie prima, nuovi pool dopo"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-08.06 · Transizione: copie prima, nuovi pool dopo

## Sequenza operativa

1. Censire dati e metadati su tutti i supporti: Arca, WD attuali, media, applicazioni e database. Identificare copie uniche e dati di terzi.
2. Controllare i 5 TB Drive realmente liberi e il volume totale. Se non entra, pianificare capacita temporanea aggiuntiva prima di procedere; nessuna esclusione silenziosa dei media richiesti.
3. Preparare cartelle e scelta cifratura in sessione dedicata. Copiare per lotti, senza spostare gli originali; esportare database e applicazioni coerentemente.
4. Verificare tutti i lotti con confronto integrita e conteggi; provare decifratura e recupero applicativo. Conservare una copia locale indipendente dei dati irrinunciabili.
5. Fermare o congelare le scritture della sorgente nel passaggio finale; copiare e verificare l'ultimo incremento.
6. Solo ora liberare Arca: estrarre il P310 e installarlo su M2, con Sabrent per avvio. Ripristinare app e dati e provarli.
7. Preparare il pool media collaudato; copiare direttamente dai WD dove possibile, conservando anche Drive. Confrontare prima di riutilizzare i WD.
8. Ricostruire i WD come destinazione backup; avviare copie versionate e testare recupero. Attivare RDX  e testati.
9. Mantenere il deposito di transizione finche i nuovi backup non sono completi; la pulizia e un'operazione distinta, mai automatica a una data prefissata.

## Uscita futura dal P310

Quando il pool SSD sara conveniente, scegliere tagli/controller/cavi e verificare capacita utile, endurance, ridondanza e carico. Creare un nuovo pool distinto, trasferire tramite snapshot/invio o backup/ripristino coerente, confrontare e fare cutover con breve fermo delle scritture. Conservare il P310 come rollback fino al primo backup e recupero dal nuovo pool. Solo allora decidere se torna Arca o altro uso.

## Limiti espliciti

P310 singolo: guasto disco significa fermo e recupero. ZFS e snapshot non aggiungono una seconda copia fisica. Il futuro pool non viene comprato e il documento non esegue formattazioni. La capienza del cloud e dei WD deve comprendere le versioni; la disponibilita nominale non e automaticamente spazio utile.

[Rclone copy](https://rclone.org/commands/rclone_copy/) · [Verifica copie cifrate](https://rclone.org/commands/rclone_cryptcheck/)

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
