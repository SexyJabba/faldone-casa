# Design system

File: `app/style.css` (sito), `app/static.css` (pagine statiche e kit). Nessun font remoto: IBM Plex è servito in locale.

## Identità (dal 15 novembre 2026)

Tre scelte tengono insieme l'aspetto del sito:

1. **Navigazione e cornice da applicazione da scrivania.** Barra laterale con tutte le sezioni raggruppate (elenco sorgenti), barra degli strumenti in alto con titolo della pagina, ricerca e strumenti. Barra laterale, barra degli strumenti, menu, ricerca e avvisi sono in «vetro»: traslucidi, con sfocatura dello sfondo. Il contenuto resta su superfici piene, per la leggibilità.
2. **Palette enterprise.** Blu su neutri freddi; i colori di stato e degli ambiti non cambiano.
3. **Calibri e angoli squadrati.** Nessun angolo arrotondato. Restano tonde solo le forme che portano un significato (vedi sotto).

Nessuna libreria di componenti, nessun marchio o asset di terzi: lo stile è un riferimento, non una copia.

| Token | Chiaro | Scuro | Uso |
|---|---|---|---|
| `--color-canvas` | `#f2f4f7` | `#0b1016` | fondo della pagina (sotto una sfumatura blu tenue) |
| `--color-surface` | `#ffffff` | `#151b23` | superfici, tabelle, schede |
| `--color-surface-subtle` | `#eceff3` | `#1b222c` | intestazioni di tabella |
| `--color-text` / `--color-text-secondary` | `#101820` / `#56616d` | `#e9edf2` / `#a4afbb` | testo |
| `--color-border` / `--color-border-strong` | `#d7dce2` / `#b7bfc8` | `#2a333e` / `#3c4754` | bordi |
| `--color-accent` (+ hover, subtle) | `#0063b8` | `#6db6f7` | azioni primarie, selezione, collegamenti (contrasto AA anche sul fondo tenue) |
| `--accent-bright` | `#0672cb` | `#3d9bef` | icone e sfumature decorative, mai testo piccolo |
| `--glass`, `--glass-strong`, `--glass-line` | bianco al 64 % / 84 % | grigio-blu al 60 % / 86 % | vetro della cornice; `--blur` è la sfocatura |
| `--fill`, `--fill2` | nero al 6 % / 10 % | bianco al 7 % / 12 % | fondi di campi, selettori, passaggio del mouse |

I nomi brevi usati dai componenti (`--bg`, `--card`, `--fg`, `--muted`, `--line`, `--accent`) sono alias dei token.

Tipografia: **Calibri** dove è installato (Windows, Office); altrove **Carlito**, compatibile nelle metriche e libero, servito in locale da `assets/fonts/` (licenza OFL in `assets/fonts/OFL-Carlito.txt`). Calibri è più piccolo a parità di corpo, quindi il testo base è 17 px. Ha solo normale e grassetto: i pesi intermedi sono dichiarati esplicitamente come l'uno o l'altro. **IBM Plex Mono** resta per codici e identificativi.

Geometria: `border-radius: 0` ovunque (regola globale in coda a `app/style.css`). Eccezioni volute, perché la forma è il significato: stato «disponibile» (cerchio pieno) e «su richiesta» (cerchio vuoto), copie nella matrice delle protezioni, gate superato nel binario delle fasi. Nei grafici SVG i rettangoli sono squadrati con `rx: 0`.

Superfici: bordi sottili e ombra appena percettibile sul contenuto; ombre piene su menu, finestre e pannelli sovrapposti. Con `prefers-reduced-transparency` il vetro diventa pieno; con `prefers-reduced-motion` spariscono le animazioni.

## Navigazione

- **Barra laterale** (`app/lib/nav.js`, un'unica definizione usata dalla pagina generata e dall'app): fissa da 1200 px in su e richiudibile dal pulsante nella barra degli strumenti (la scelta è ricordata); sotto i 1200 px è un pannello a scomparsa con velo, che si chiude scegliendo una voce, con Esc o toccando fuori. Quando è nascosta è `inert`. La voce attiva segue la pagina: una scheda macchina accende «Macchine», una scheda documentale «Schede».
- **Barra degli strumenti**: pulsante della barra laterale, titolo della pagina (decorativo: il titolo vero è l'`h1`), ricerca, area riservata, preferiti, tema.
- **Barra inferiore** sotto i 900 px: le cinque aree principali a portata di pollice.
- Con la barra laterale visibile le file di pastiglie «Sezioni di…» in cima alle pagine sono nascoste, perché le stesse voci sono nella barra.

## Colori con significato fisso (sempre con testo e forma)

| Stato | Forma | Uso |
|---|---|---|
| Disponibile | cerchio pieno | `.st-available` |
| Su richiesta | cerchio vuoto | `.st-on_demand` |
| Limitato | triangolo | `.st-degraded` |
| Non determinabile | quadrato tratteggiato | `.st-unknown` |
| Fermo | quadrato pieno | `.st-blocked` |
| Simulazione | etichetta viola tratteggiata | `.simtag`, `.callout.sim` |

Ambiti: `--s-sala`, `--s-casa`, `--s-lab`, `--s-vito`, `--s-terzi`, `--s-inv` (barra superiore delle tessere, mai unico segnale).

## Componenti

- **Livello di dettaglio**: selettore segmentato in una barra propria, solo dove ha effetto (schede, procedure, percorsi).
- **Barra delle azioni di una risorsa** `.actionbar`: una azione primaria, al massimo due secondarie, il resto nel menu «Altre azioni» (chiudibile con Esc).
- **Cornice della presentazione** `.pres-*` e **schemi** `.pv-*` (`app/scenes.css`): vedi `docs/presentazione.md`.
- **Testata di pagina** `phead()`: occhiello, titolo, sintesi, azioni.
- **Barra di contesto** `ctxbar()`: dove sei, da dove vieni, ritorno.
- **Dimensioni di stato** `dims()`: decisione, realizzazione, osservazione, separate.
- **Natura del valore** `ev()`: documentato, dichiarato, misurato, stimato, simulato, sconosciuto.
- **Limite** `.limit`: rischio di perdita dati o fermo, sempre visibile a ogni profondità.
- **Apertura della home** `.hero`: titolo, azione primaria, ricerca, stato del progetto in etichette (`.hero-facts`) e quattro numeri cliccabili (`.stats`), tutti calcolati dai dati del modello.
- **Intenti** `.intents`: sei ingressi con icona, griglia 3/2/1 colonne senza tessere orfane.
- **Griglie a colonne fisse** `.grid.cols3`, `.grid.cols4`: quando il numero di tessere è noto, per evitare l'ultima riga con un solo elemento.
- **Intestazione di sezione** `.sechead`: titolo, nota e collegamento «vedi tutto» sulla stessa riga.
- **Indice dei blocchi** `.blockjump` e `.blockhead`: in Documentazione le schede sono raggruppate per blocco, con salto diretto.
- **Torna su** `.totop`: compare dopo 700 px di scorrimento, sopra la barra inferiore su schermi stretti.
- **Tessera** `.tile`, **scheda** `.card`, **chip** `.chip` (filtri con `aria-pressed`, sezioni con `aria-current`).
- **Tabella** `table()`: regione scorrevole raggiungibile da tastiera, intestazioni di riga e colonna.
- **Passi** `.steps`: percorsi e capitoli; passo tratteggiato = vuoto informativo.
- **Risultato di simulazione** `.result`, bordo viola se cambiato rispetto al riferimento.
- **Palette di ricerca**: `<dialog>` modale, combobox con lista di opzioni.
- **Glossario nel testo**: `<button class="gl">` apribile con tocco o Invio.

Esempi dal vivo: ogni componente compare nelle viste di `app/views/`; gli screenshot in `docs/screenshot/` mostrano home, schede, mappa, simulatore, roadmap, emergenza a 1280 e 390 px.

## Rappresentazioni grafiche

Modulo `app/lib/viz.js`: funzioni pure che restituiscono HTML o SVG a partire dal modello (provate in `tools/test/viz.test.mjs`). Regole comuni: si disegna solo ciò che il modello contiene; un dato mancante resta visibile come mancante (tratteggio, «libera», «non definita»); accanto a ogni grafico c'è la stessa informazione in testo o tabella; il colore non è mai l'unico segnale; gli schemi larghi scorrono dentro il proprio riquadro, non la pagina.

| Grafico | Funzione | Dove | Che cosa mostra |
|---|---|---|---|
| Schema delle relazioni | `egoGraph(idx, id)` | scheda di ogni elemento | chi si appoggia all'elemento (sinistra) e a che cosa si appoggia (destra); nodi cliccabili, bordo colorato per tipo; oltre 7 per lato rimanda all'elenco |
| Binario delle fasi | `phaseRail(rs)` | Roadmap | le fasi in sequenza con date, stato del gate e attività per stato; nessuna percentuale di avanzamento |
| Matrice delle protezioni | `protectionMatrix(rows)` | Dati e copie | dati × meccanismo; il segno distingue provata, prevista, non attiva, «non è una copia indipendente» |
| Frontale dello switch | `switchFace(…)` | Rack e porte | numero di porte documentato e destinazioni note; disegno logico, non fisico |
| Anello del quorum | `quorumRing(voters)` | home | le macchine con voto e la maggioranza necessaria |
| Planimetria schematica | `floorPlan(plan)` | Impianti › Planimetria (area riservata) | un rettangolo per stanza, da centro e dimensioni del CAD (nord in alto, scala 1 m); stanze cliccabili con superficie, altezze e apparati del modello collocati lì; i muri veri non sono disegnati |

## Interazioni (novembre 2026)

- **Simulazione sulla mappa** (`app/views/map.js`, `#mappa?sim=1&f=M2`): lo stesso motore del simulatore colora i nodi. Lo stato è dato da colore, forma nell'angolo del nodo e testo nel pannello; l'elemento guasto ha una croce. La barra viola riassume quorum, servizi per stato ed elementi cambiati rispetto al riferimento, e rimanda al simulatore per cause e procedure. Stessi parametri d'indirizzo del simulatore (`f`, `o`, `on`).
- **Guida passo passo** delle procedure (`#procedura/ID?g=1&n=…`): un controllo o un passaggio per schermata, «Sì, è così / No, è diverso», riepilogo copiabile per il tecnico. Mostra solo il testo della procedura; se la procedura non prevede un'alternativa lo dice. Le risposte sono le stesse spunte della procedura completa.
- **Comandi nella ricerca** (`app/lib/commands.js`): forme fisse («cosa succede se manca…», «dove stanno…», «confronta … e …», «da cosa dipende…», nomi di pagina) risolte sul modello; ogni comando apre una vista calcolata. A campo vuoto la palette mostra visti di recente, preferiti ed esempi.
- **Inventario esplorabile** (`app/views/inventory.js`, motore in `app/lib/inventory.js`): ricerca immediata, faccette con conteggi (categoria, usato da, stato), raggruppamento, griglia con foto o tabella, scheda rapida in un dialogo con precedente/successiva. Le foto di repertorio sono marcate; i pezzi si sommano solo dove la quantità è un numero intero e mai per gli alias.
- **App installabile e avvisi** (`manifest.webmanifest`, `app.notice` in `app/main.js`): avviso persistente quando una nuova versione ha preso il controllo («Aggiorna ora») e quando si è offline.

## Area riservata

- **Modulo di sblocco** `lockForm()` + `bindLock()` (`app/views/vault.js`): riquadro con lucchetto, campo password, «Ricorda su questo dispositivo», esito annunciato (`role="status"`). Si usa al posto del contenuto di una sezione riservata; a password giusta la vista si ridisegna.
- **Lucchetto in testata**: mostra se l'area è bloccata o sbloccata e porta a `#riservato`, dove si blocca di nuovo e si legge che cosa è protetto.
- **Segno** `.lockmark` accanto ai titoli delle sezioni riservate.

## Larghezze verificate

360, 390, 768, 1280, 1440 px. Sotto 900 px le aree principali passano in basso (uso con una mano), la profondità di lettura in una barra propria; nessuna funzione richiede hover o trascinamento preciso (la mappa ha pulsanti di zoom, vista centrata sull'elemento e alternativa a elenco).
