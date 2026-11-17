# Verifiche eseguite (11 novembre 2026)
Verificano l'APP, non il veicolo né gli impianti.

## Automatiche — `npm test` → 29 prove superate su 29
Budget (5.000 iniziali; +200 € → 4.800; ricevuta in quota; quota superata; preventivi/stime; acquisto dal carrello; cambio scenario; nessun doppio conteggio), geometria (corridoio con geometria di prova esplicita, a filo, a ponte, fuori vano, sovrapposizione, altezza, dati mancanti, ingombri aperti, layout iniziali senza errori), stratigrafie e fabbisogni, energia (caso 100 W × 5 h, perdite, riserva, ricarica, dati mancanti), acqua, termico (U = 1 → 200/400 W, ventilazione, lamiera nuda, non determinabile, estate), carichi, importazioni non valide, backup non validi, coerenza dei riferimenti nei dati iniziali.

## Nel browser (Chromium integrato, localhost)
| Prova | Esito |
|---|---|
| Apertura di tutte le 16 schermate senza errori in console | superata |
| Modifica e persistenza dopo ricaricamento | superata |
| +200 € inseriti dal modulo a schermo: residuo 4.800 € | superata |
| Creazione di scenario materiali e di configurazione; confronto in tabella | superata |
| Modulo di prova (x 500, y 700, 600×400, quota 0) nel corridoio (y 675–975): errore e bordo rosso | superata |
| Trascinamento di un modulo sulla pianta | superata |
| Backup → archivio azzerato → ripristino: dati identici, foto compresa | superata |
| Backup estranei o danneggiati: rifiutati, dati intatti | superata |
| Foto: ridotta a JPEG ≤ 1400 px e salvata (via archivio, non dal selettore file) | superata |
| Offline: server spento, pagina ricaricata, tutte le sezioni, scrittura e persistenza | superata |
| Schermo 375 × 812: nessuno scorrimento orizzontale, barra in basso, moduli usabili | superata |

## Difetti trovati e corretti durante le prove
- La barra di navigazione mostrava indirizzi al posto dei collegamenti.
- La copia offline poteva servire sorgenti vecchi: ora chiede sempre al server se sono cambiati.

## Non provato
- Telefono reale (iOS Safari / Android) in rete locale; tocco reale sul trascinamento.
- Offline su telefono tramite hosting HTTPS e “Aggiungi a Home”.
- Selettore file/fotocamera per foto e PDF dal vero; stampa su carta delle schede.
- Backup con centinaia di foto (dimensione del file).
- Safari su Mac.

## Limiti noti
- Nessuna sincronizzazione; nessuna vista 3D; nessun calendario dei fermi.
- Prezzi quasi tutti assenti: il “previsto” è sottostimato finché non li inserisci.
- Quote del vano e superfici sono ipotesi: mappa, fabbisogni e termico valgono come ordine di grandezza.
- Dipendenze, fonti e problemi di un lavoro si collegano scrivendo gli id (elencati nel modulo).

---
# Seconda fase — verifiche del 15 novembre 2026

## Automatiche: 43 prove superate su 43 (`npm test`)
- `tests/difetti.test.mjs`: i tre difetti segnalati sono stati prima RIPRODOTTI (5 prove fallite sul codice vecchio), poi corretti: utenze ignote / capacità zero → mai verdetto positivo; acquistato 1 e necessari 3 → 2 da comprare; collisione con entrambi i moduli aperti, anche fuori dal portellone.
- `tests/migrazione.test.mjs`: backup v1 reale (`tests/fixtures/backup-v1.json`) migrato allo schema 2 senza perdere dati; migrazione idempotente e rispettosa dei dati già documentati; 8 backup corrotti rifiutati prima di scrivere; layout iniziali senza errori in ogni stato con la stratigrafia A e con errori con la B; progetto attivo; simulazione oraria (bilancio chiuso, riserva, picchi, tre verdetti); apparecchi; raffrescamento; percorso (dipendenze, mancanti, sessioni, ciclo).

## Nel browser
| Prova | Esito |
|---|---|
| 16 schermate, comprese Progetto e Percorso, senza errori in console | superata |
| Ripristino di un backup v1: migrato, dati utente e allegato presenti, vecchi allegati sostituiti | superata |
| Backup con allegato non valido: rifiutato prima di scrivere, archivio intatto | superata |
| Errore a metà scrittura (dato non salvabile): **prima falliva** (allegati cancellati e scritti in parte), ora la transazione è annullata e archivio e allegati restano identici | corretta e superata |
| Annulla / Ripristina su uno spostamento di modulo | superata |
| Mappa: stato “Cucina estratta + letto aperto”, vano finito, selezione, quote | superata a vista |
| Grafico della carica su 72 h, verdetti e motivi | superata a vista |
| Guida tetto: 12 passi classificati, schema di decisione, sezione, materiali collegati | superata |
| Schermo 375 px: nessuno scorrimento orizzontale nelle sezioni nuove | superata |

## Non provato in questa fase
Aggiornamento automatico di un archivio v1 già presente nel browser all'avvio (provato via ripristino e nei test, non via avvio a freddo); pulsante “Aggiorna guide” dal vero; zoom e trascinamento con le dita; offline dopo l'aggiunta di `progetto.js` (la lista del service worker è aggiornata, non riprovata a server spento); stampa.

## Limiti noti aggiunti
- La slitta e i mobili sopra sono due rettangoli indipendenti: vanno spostati entrambi.
- Il pannello della mappa salva a ogni campo: l'Annulla è la rete di sicurezza. La cronologia si perde chiudendo la pagina e non riguarda foto/allegati.
- Simulazione oraria con giornate tutte uguali; il riscaldatore entra con l'estremo alto del fabbisogno.
- Le guide non contengono procedure del costruttore: direttive di allestimento e libretto d'uso non sono acquisiti. I passi “D” sono solo quelli con fonte citata (oggi: carico sul tetto).
- Negli archivi esistenti la base fissa nasce vuota e le guide nuove arrivano solo con il pulsante in Dati.

17 novembre 2026 — Ripetute le 46 prove Node, inclusa la regressione sul surplus medio con utenze ignote.
