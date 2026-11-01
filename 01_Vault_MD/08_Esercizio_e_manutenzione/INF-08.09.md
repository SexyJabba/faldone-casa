---
codice: "INF-08.09"
titolo: "Aggiornamenti, account e accessi"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-08.09 · Aggiornamenti, account e accessi

**Perimetro:** Riferimento operativo per aggiornamenti, account e accessi. Parametri e procedura da confrontare con gli apparati reali.

| Identità | Regola |
| --- | --- |
| Utente dei servizi | Account personale, librerie/cartelle autorizzate, recupero accesso. |
| Amministratore | Accesso dalle reti assegnate; console e chiavi nel luogo protetto. |
| Servizio automatico | Permessi minimi per il flusso, niente riuso indiscriminato di un account umano. |
| Televisore / pannello | Credenziali limitate alla funzione; nessun pannello cluster necessario. |
| Backup / tunnel | Account dedicati al trasferimento ammesso; una chiave tunnel non dà una shell generale. |

<b>01.</b> Leggere requisiti e note di versione del componente e verificare la compatibilità con plugin, client e backup.

<b>02.</b> Preparare backup e recupero, poi applicare l’aggiornamento nella finestra registrata.

<b>03.</b> Verificare funzione dal client e allarmi; non fermarsi allo stato “processo attivo”.

<b>04.</b> Registrare versione, esito e differenze; aggiornare rubrica solo se cambia davvero un ingresso.

<b>05.</b> Revocare account e token non più usati e rinnovare quelli in scadenza nel registro protetto.

| <b>Sistemi datati</b><br/>La piattaforma X99 e gli endpoint usati richiedono una scelta esplicita dell’OS supportato. Il caso Windows di MP3 Aspire è registrato in R-03. Non derivare la compatibilità di driver, encoder o aggiornamenti dalla sola data della CPU. |
| --- |

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
