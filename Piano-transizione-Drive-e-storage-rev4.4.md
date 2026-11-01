# Transizione: copie prima, nuovi pool dopo

## Sequenza operativa

1. Censire dati e metadati su tutti i supporti: Arca, WD attuali, media, applicazioni e database. Identificare copie uniche e dati di terzi.
2. Controllare i 5 TB Drive realmente liberi e il volume totale. Se non entra, pianificare capacita temporanea aggiuntiva prima di procedere; nessuna esclusione silenziosa dei media richiesti.
3. Preparare cartelle e scelta cifratura in sessione dedicata. Copiare per lotti, senza spostare gli originali; esportare database e applicazioni coerentemente.
4. Verificare tutti i lotti con confronto integrita e conteggi; provare decifratura e recupero applicativo. Conservare una copia locale indipendente dei dati irrinunciabili.
5. Fermare o congelare le scritture della sorgente nel passaggio finale; copiare e verificare l'ultimo incremento.
6. Solo ora liberare Arca: estrarre il P310 e installarlo su M2, con Sabrent per avvio. Ripristinare app e dati e provarli.
7. Preparare il pool media collaudato; copiare direttamente dai WD dove possibile, conservando anche Drive. Confrontare prima di riutilizzare i WD.
8. Ricostruire i WD come destinazione backup; avviare copie versionate e testare recupero. Attivare RDX se acquistati e testati.
9. Mantenere il deposito di transizione finche i nuovi backup non sono completi; la pulizia e un'operazione distinta, mai automatica a una data prefissata.

## Uscita futura dal P310

Quando il pool SSD sara conveniente, scegliere tagli/controller/cavi e verificare capacita utile, endurance, ridondanza e carico. Creare un nuovo pool distinto, trasferire tramite snapshot/invio o backup/ripristino coerente, confrontare e fare cutover con breve fermo delle scritture. Conservare il P310 come rollback fino al primo backup e recupero dal nuovo pool. Solo allora decidere se torna Arca o altro uso.

## Limiti espliciti

P310 singolo: guasto disco significa fermo e recupero. ZFS e snapshot non aggiungono una seconda copia fisica. Il futuro pool non viene comprato e il documento non esegue formattazioni. La capienza del cloud e dei WD deve comprendere le versioni; la disponibilita nominale non e automaticamente spazio utile.

[Rclone copy](https://rclone.org/commands/rclone_copy/) · [Verifica copie cifrate](https://rclone.org/commands/rclone_cryptcheck/)

L'utente dichiara 5 TB di Google Drive attualmente liberi al 1 novembre. Google AI Pro e attivo; non sono 5 TB aggiuntivi a una seconda quota dello stesso account. Quota effettiva, occupazione condivisa e scadenza si controllano prima del trasferimento.

Per la transizione Drive conterra tutti i dati da preservare, inclusi film e serie TV oggi sui WD. Il totale reale con media non e noto: i circa 2 TB irrinunciabili non sono il totale. Il P310 si libera solo dopo copie e recuperi verificati. Dopo la migrazione Drive resta un deposito di backup, non il disco operativo delle VM.

La preparazione delle cartelle resta un lavoro separato, come richiesto. La cifratura dell'intero deposito transitorio e ancora da decidere: la raccomandazione e cifrare almeno dati privati, lavoro, configurazioni e chiavi applicative. I media possono essere mantenuti leggibili se questa e la scelta finale. Non presentare la raccomandazione come configurazione effettuata.

Rclone copy e il metodo proposto: lotti ripetibili, niente cancellazioni propagate, verifica dei contenuti; crypt per dati cifrati con chiavi conservate fuori dal solo archivio. La copia semplice non conserva automaticamente tutte le versioni sostituite: prevedere snapshot/esportazioni o destinazione versionata. Proteggere credenziali e log, non inserirli nel faldone.

La FTTC precedente e censita a 4 Mbit/s in upload: circa 23 giorni per TB in teoria continuativa, circa 46 per 2 TB e 116 per 5 TB, prima di overhead e interruzioni. Misurare la banda; non consumare automaticamente la SIM casa da 500 GB per terabyte. Una rete alternativa puo accorciare i tempi solo se autorizzata e disponibile. [[REV4-ROAD]] · [[REV4-MIG]]

[Rclone copy](https://rclone.org/commands/rclone_copy/) · [Cifratura](https://rclone.org/crypt/) · [Verifica cifrata](https://rclone.org/commands/rclone_cryptcheck/)