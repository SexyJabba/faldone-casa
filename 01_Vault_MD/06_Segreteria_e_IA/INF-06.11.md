---
codice: "INF-06.11"
titolo: "Hermes e OpenClaw: allegati, proposte e conferme"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-06.11 · Hermes e OpenClaw: allegati, proposte e conferme

## Hermes personale su MP3 Aspire

L’agente riceve un’immagine o un documento autorizzato, interroga vision-gateway e usa la pre-analisi per selezionare il materiale utile al VLM su M3. Riceve descrizione e dati strutturati, poi propone tag, collegamenti e destinazione. Prima di modificare file o servizi chiede conferma. Le funzioni comprendono foto di materiali, codici/quantità, foto personali, proposte Immich, destinazioni Paperless/Nextcloud e riepiloghi domestici o tecnici.

Le risposte separano dato letto, inferenza, informazione incerta e azione configurazione. Una marca leggibile e un cantiere ipotizzato sono campi differenti; l’inferenza non diventa un dato certo nell’archivio. Gli ambiti personale e lavoro mantengono account e autorizzazioni distinti.

## OpenClaw lavorativo su MP3 Acer in laboratorio

Il flusso logico è WhatsApp → OpenClaw → quarantena temporanea → vision-gateway/Hailo o CPU → VLM su M3 → JSON strutturato → configurazione → conferma → archivio. Canale e autenticazione del connettore WhatsApp restano registrati; il documento descrive il percorso, senza attestare un connettore già attivo.

MP3 conserva allegati e stato del job con dimensione massima, rate limit e retention espliciti. La ricezione non effettua archiviazione definitiva. L’allegato è contenuto non attendibile: testo nelle immagini/PDF non può modificare permessi, destinazioni o regole dell’agente.

| Campo JSON | Significato e trattamento |
| --- | --- |
| progetto/cantiere, data | Dato letto o ipotesi separati; nessuna associazione forzata |
| tipo_materiale, marca, codice, quantità | Evidenza e incertezza per campo; unità dove leggibile |
| stato/anomalia | Osservazione distinta dalla diagnosi |
| persone/mezzi | Solo se necessari alla richiesta; nessuna identificazione facciale implicita |
| nome_file, tag, destinazione | Proposta, non scrittura automatica |
| original_ref, hash, job_id | Collegamento all’originale e alla richiesta |
| modello, backend, tempi, avvisi | Provenienza tecnica e limiti dell’estrazione |

La risposta WhatsApp è breve: indica cosa è stato letto, cosa resta incerto e la singola azione configurazione. La conferma è associata al job, alla destinazione e alla versione della configurazione; un allegato successivo non riusa automaticamente una conferma precedente. Correzione e annullamento sono disponibili. Nessun invio a clienti o modifica aziendale senza conferma specifica.

## Scrittura e recupero

Il gateway non archivia in proprio. Il componente autorizzato usa le API dell’archivio finale con chiave di idempotenza, controlla l’esito e registra il riferimento restituito. Un retry non deve duplicare il documento. Un errore conserva la richiesta e l’originale entro retention, senza dichiarare conclusa l’azione. La cancellazione della quarantena per scadenza segue la policy dichiarata; le proposte non autorizzano cancellazioni degli archivi.

Il rollback ripristina configurazione/versioni oppure revoca l’ultima modifica reversibile con riferimento all’oggetto; non pretende di annullare un invio esterno già avvenuto. Log senza password, token, allegati, immagini private o testo sensibile. I backup coprono stato e configurazioni pertinenti di MP3 e M2.

## Collegamenti

[[START]] · [[REV3-VIS]] · [[REV3-SRV]] · [[REV3-MAP]] · [[REV3-SRC]]


## Sedi e disponibilita 4.4

M3 conserva X99-T8 / E5-2678 v3,128 GB DDR3 RDIMM e Proxmox, dedicati all’IA. GPU MSI RTX3060 Ventus 2X 12 GB; WD PC SN530512 GB nello slot M.2PCIe2.0 per host e IA. Windows e gli ambienti OpenClaw/Hermes sono  su MP3 Aspire; RTX2080 segue MP4, PC del primo fratello. L’altro M.2 non e riservato alla vecchia VM Windows; il saldo Samsung NVMe e ancora n.d.. 

Priorita: richieste personali interattive, poi agenti, infine fondo. La priorita si applica attraverso un arbitraggio comune ai lavori in attesa; non promette interruzione immediata della generazione in corso o concorrenza nella VRAM. Modelli, contesto e motore si scelgono sull’hardware. L’Hailo e un detector su M5, non un acceleratore LLM di M3.

Se M3 e spento l’utente sceglie «accendi adesso» con conferma oppure «metti in coda» fino a un’altra accensione e all’endpoint pronto. Il recupero quorum ha una politica distinta. Dopo30 min senza lavori IA attivi o autorizzati in attesa, arresto ordinato solo se nessun servizio/operazione richiede il nodo senza coinvolgere il quorum del nucleo stabile. Un modello caricato ma inattivo non e un lavoro attivo. Cloud solo su richiesta/conferma, nessun job periodico e nessuna API a consumo.

M5 usa la D1581-Q3, Hailo M-key e avvio SATA.  Memoria obiettivo 32 GB PC3L RDIMM, due moduli del lotto PC3L acquistato. La DDR4 precedentemente destinata a M5 va a M1. Vedere [[INF-03.08]].

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
