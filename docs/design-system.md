# Design system

File: `app/style.css` (sito), `app/static.css` (pagine statiche e kit). Nessun font remoto: IBM Plex è servito in locale.

## Identità

Linguaggio unico ispirato a IBM Carbon (disciplina tipografica, griglia a multipli di 4/8 px, superfici sobrie), con soluzioni puntuali da AWS Cloudscape (pagina di risorsa come «hub»: sintesi, una azione primaria, dettagli e relazioni), Microsoft Learn (colonna di lettura e indice contestuale) e PatternFly (tabelle, filtri, menu di azioni). Nessuna libreria di componenti installata, nessun marchio o asset proprietario.

| Token | Chiaro | Uso |
|---|---|---|
| `--color-canvas` | `#f4f6f8` | fondo della pagina |
| `--color-surface` | `#ffffff` | superfici, tabelle, schede |
| `--color-surface-subtle` | `#edf1f4` | intestazioni di tabella, barre |
| `--color-text` / `--color-text-secondary` | `#18212b` / `#526171` | testo |
| `--color-border` / `--color-border-strong` | `#d6dde5` / `#b9c4cf` | bordi |
| `--color-accent` (+ hover, subtle) | `#14505c` | azioni primarie, selezione |
| `--color-focus` | `#0f62fe` | anello di focus |

Ogni token ha il valore scuro corrispondente (`prefers-color-scheme` e scelta manuale). I nomi brevi usati dai componenti (`--bg`, `--card`, `--fg`, `--muted`, `--line`, `--accent`) sono alias dei token.

Tipografia: **IBM Plex Sans** e **IBM Plex Mono**, file locali in `assets/fonts/` (sottoinsieme Latin1, licenza OFL in `assets/fonts/OFL.txt`), `font-display: swap`, con pila di riserva di sistema. Mono solo per codici e identificativi. Titoli di pagina 26–32 px a peso 400; presentazione 28–44 px con testo 17–22 px; testo documentale 16 px con interlinea 1,6; controlli 14 px; metadati 13 px.

Superfici (revisione grafica del 9 novembre 2026): angoli da 10 px per schede e tessere (`--r`), 6 px per controlli (`--r2`), 16 px per il riquadro di apertura della home; bordi sottili e un'ombra appena percettibile (`--shadow`), che cresce solo al passaggio su un elemento cliccabile (`--shadow-hover`); ombre piene solo su menu, dialoghi e pannelli sovrapposti. Testata e barra inferiore traslucide. Le animazioni (ingresso della pagina, sollevamento delle tessere) sono brevi e spente con `prefers-reduced-motion`.

Icone: tratto da 1,8 px su griglia 24, in linea nel codice (`ICON` in `app/ui.js`), nessuna libreria. Sono sempre decorative (`aria-hidden`): il testo accanto porta il significato. `ic(nome)` le mette in un riquadro tinto; negli ambiti il riquadro prende il colore dell'ambito.

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

- **Testata globale**: marchio, cinque aree principali, poi gli strumenti (ricerca, preferiti, tema). Il livello di dettaglio compare in una barra propria solo dove ha effetto (schede, procedure, percorsi).
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

## Larghezze verificate

360, 390, 768, 1280, 1600 px. Sotto 900 px la navigazione principale passa in basso (uso con una mano), la profondità di lettura in una barra propria; nessuna funzione richiede hover o trascinamento preciso (la mappa ha pulsanti di zoom, vista centrata sull'elemento e alternativa a elenco).
