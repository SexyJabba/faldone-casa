# Passaggio di consegne (per chi continua, anche un modello più economico)

## In due righe
App statica in `index.html` + `js/`. Nessuna build. Avvio: `python3 -m http.server 8642`. Prove: `npm test`.
Leggi prima: `README.md`, `docs/STATO.md`, poi `js/calc.js` e `js/seed.js`.

## Mappa dei file
| File | Contenuto | Quando toccarlo |
|---|---|---|
| `js/seed.js` | Tutti i dati iniziali e la forma dello stato | Nuovi contenuti (lavori, materiali, fonti, rilievi). Vale solo per archivi nuovi o dopo “Azzera”. |
| `js/calc.js` | Calcoli puri, senza DOM | Ogni modifica a una formula + prova in `tests/calc.test.mjs` + riga in `docs/MODELLI.md` |
| `js/store.js` | IndexedDB, backup, `migra()`, `setPath()` | Nuove chiavi di stato: `migra()` le aggiunge dal seed agli archivi esistenti |
| `js/ui.js` | `h()`, `openForm()`, etichette, `editInventario`, `registraAcquisto` | Nuovi tipi di campo |
| `js/views/*.js` | Una sezione per file; esporta `render(arg)` | Interfaccia |
| `js/app.js` | Elenco `VISTE`, rotte `#/sezione/argomento` | Nuova sezione |
| `sw.js` | Copia offline | **Aggiungi ogni nuovo file a `FILES` e cambia `VERSIONE`** |

## Novità della seconda fase da conoscere
- Schema dati 2 (`SCHEMA` in `seed.js`). Nuove chiavi: `progetti`, `baseFissa`, `apparecchi`; nei layout `stati` e `stato` dei moduli; nei lavori `passi: [{t, tipo}]`, `materialiInv`, `attrezziInv`, `sessioni`, `schemi`; nei sistemi `maxUscita_W`, `maxCarica_W`, `socIniziale`; nelle utenze `da`, `picco_W`; in `clima` `apparecchioId`, `oreApparecchio`.
- **Migrazioni**: `migra()` in `store.js`. Mai cancellare dati dell'utente; ogni passo idempotente; nuova prova in `tests/migrazione.test.mjs` usando `tests/fixtures/backup-v1.json` (non rigenerarlo: è il formato storico).
- **Ripristino**: `preparaRipristino()` valida, copia, migra e prova i calcoli; `importa()` scrive in UNA transazione e la abortisce su errore. Non reintrodurre scritture separate.
- `store.ridisegna()` per i soli cambi di interfaccia; `store.update()` solo per modifiche ai dati (entra nella cronologia Annulla).
- `attivo` su stratigrafie e sistemi è derivato dal progetto attivo: modificare `progetti[..].stratiId/sistemaId` e chiamare `applicaProgetto(state)`.
- Passi delle guide nel seed: prefisso `[D]`, `[P]`, `[V]`. `[D]` solo con una fonte collegata che lo dice davvero.
- Vista nuova: `js/views/progetto.js`. `utenzeTermiche()` sta in `views/sim.js` ed è usata anche dal Progetto.

## Terza fase
- Schema 3: `documenti` (scheda del PDF; il Blob sta nell'archivio IndexedDB `doc`, DB versione 2, mai nel backup) ed `estratti` ({doc, pagina, titolo, testo, lavoroId}). I passi dei lavori possono avere `rif: {doc, pag, nota}`.
- Quando l'utente carica libretto d'uso o manuale d'officina: il lavoro utile è leggere le pagine pertinenti CON lui, creare estratti con pagina e mettere i rimandi sui passi, passando a `documentata` solo ciò che il documento dice davvero. Non trascrivere valori a memoria.
- Ricerca nei PDF: fatta. `vendor/pdfjs/` (pdf.js 4.10.38) è in `FILES` di `sw.js`; `js/pdftesto.js` estrae e cerca, `cercaPagine` in `calc.js` è la parte pura provata. Il testo sta in `doc` con chiave `testo:<id>` e si cancella con il file. Non aggiornare pdf.js senza riprovare: le versioni cambiano i requisiti del browser. Possibile seguito: OCR per le scansioni (altro download pesante, chiedere prima).
- 3D: `vista3d()` è solo disegno; per aggiungere il trascinamento in 3D servirebbe la proiezione inversa sul piano del pavimento.

## Convenzioni da rispettare
- Sconosciuto = `null`. Mai sostituirlo con 0. Usa `num()` di `calc.js` per leggere i numeri.
- Ogni dato tecnico ha `stato`: dichiarato | documentato | ipotesi | misurato | da_verificare.
- Tutte le modifiche passano da `store.update((s) => { … })`: salva e ridisegna.
- Le viste si ridisegnano per intero a ogni modifica: gli input in pagina usano l'evento `change`; i filtri ridisegnano solo la lista.
- Coordinate mappa: x sedili→portellone, y sinistra→destra (senso di marcia), mm. A schermo l'avanti è in alto.
- Non inserire coppie, sezioni, fusibili, portate senza fonte del costruttore. Senza fonte la scheda resta `tipoPassi: 'verifica'`.
- Testi dell'interfaccia in italiano, frasi brevi.
- Attenzione: `replaceChildren(...)` e `append(...)` vogliono elementi, non array: usa lo spread (`...lista`). `h()` invece accetta array fra i figli.

## Come aggiornare i dati dell'utente senza perderli
I dati reali stanno nel browser, non in `seed.js`. Per caricare contenuti preparati altrove: chiedi all'utente un backup (Dati → Scarica), modifica il JSON (`state.lavori`, `state.inventario`, …) e faglielo ripristinare. La lista carichi ha anche l'importazione CSV/JSON diretta.

## Prossime attività software, in ordine di utilità
1. Selettori a spunta per dipendenze/fonti/problemi nel modulo dei lavori (ora si scrivono gli id).
2. Costo previsto per lavoro dai materiali collegati; “Acquistato” direttamente dalla lista della spesa del percorso.
3. Calendario con date: accorpare i lavori nello stesso fermo e tenere conto delle attese.
4. Mappa: legare i mobili alla slitta (si muovono insieme), maniglie di ridimensionamento, vista laterale (altezze), ostacoli liberi, stampa della pianta.
4b. Simulazione: giornate diverse fra loro (meteo), rendimento di carica, più apparecchi termici insieme.
5. Importazione CSV/JSON anche per inventario e spese (riusare lo schema di `parseCarichi`).
6. Termico: zone escludibili dal volume riscaldato (cabina separata), superfici per orientamento.
7. Esportazione PDF/stampa curata delle schede; registro consumi olio/refrigerante con grafico.
8. Vista 3D: solo dopo il resto.

## Prossime attività sui contenuti
- VIN acquisito (in `veicolo`). Con la datacard: acquisire la documentazione Mercedes, collegarla ai lavori “tagliando”, “candelette”, “tetto” (posizione degli attacchi barre).
- Schede tecniche reali dei materiali posseduti (etichette): λ, kg/m², superficie per confezione.
- Parere Kerakoll sul ciclo su multistrato; esito del campione.
- Prezzi reali per power station e componenti separati: il confronto economico oggi è vuoto.

## Come verificare dopo una modifica
`npm test`, poi aprire l'app, passare da tutte le sezioni e controllare la console. Se la pagina mostra codice vecchio: ricaricare due volte (la copia offline si aggiorna al primo caricamento).

Con utenze ignote e surplus medio, energia() restituisce autonomia_h uguale a null e verdetto non_definitivo se la batteria ha capacità utilizzabile positiva. La vista Energia gestisce esplicitamente questo caso.
