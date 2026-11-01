---
codice: "INF-04.09"
titolo: "Drive: Arca temporanea e backup remoto"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-04.09 · Drive: Arca temporanea e backup remoto

L'utente dichiara 5 TB di Google Drive attualmente liberi al 1 novembre. Google AI Pro e attivo; non sono 5 TB aggiuntivi a una seconda quota dello stesso account. Quota effettiva, occupazione condivisa e scadenza si controllano prima del trasferimento.

Per la transizione Drive conterra tutti i dati da preservare, inclusi film e serie TV oggi sui WD. Il totale reale con media non e noto: i circa 2 TB irrinunciabili non sono il totale. Il P310 si libera solo dopo copie e recuperi verificati. Dopo la migrazione Drive resta un deposito di backup, non il disco operativo delle VM.

La preparazione delle cartelle resta un lavoro separato, come richiesto. La cifratura dell'intero deposito transitorio e ancora da decidere: la raccomandazione e cifrare almeno dati privati, lavoro, configurazioni e chiavi applicative. I media possono essere mantenuti leggibili se questa e la scelta finale. Non presentare la raccomandazione come configurazione effettuata.

Rclone copy e il metodo : lotti ripetibili, niente cancellazioni propagate, verifica dei contenuti; crypt per dati cifrati con chiavi conservate fuori dal solo archivio. La copia semplice non conserva automaticamente tutte le versioni sostituite: prevedere snapshot/esportazioni o destinazione versionata. Proteggere credenziali e log, non inserirli nel faldone.

La FTTC precedente e censita a 4 Mbit/s in upload: circa 23 giorni per TB in teoria continuativa, circa 46 per 2 TB e 116 per 5 TB, prima di overhead e interruzioni. Misurare la banda; non consumare automaticamente la SIM casa da 500 GB per terabyte. Una rete alternativa puo accorciare i tempi solo se autorizzata e disponibile. [[REV4-ROAD]] · [[REV4-MIG]]

[Rclone copy](https://rclone.org/commands/rclone_copy/) · [Cifratura](https://rclone.org/crypt/) · [Verifica cifrata](https://rclone.org/commands/rclone_cryptcheck/)

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
