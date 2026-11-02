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

Superfici: angoli da 4 px, bordi sottili, nessuna ombra sulle superfici in pagina; ombre solo su menu, dialoghi e pannelli sovrapposti.

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
- **Tessera** `.tile`, **scheda** `.card`, **chip** `.chip` (filtri con `aria-pressed`, sezioni con `aria-current`).
- **Tabella** `table()`: regione scorrevole raggiungibile da tastiera, intestazioni di riga e colonna.
- **Passi** `.steps`: percorsi e capitoli; passo tratteggiato = vuoto informativo.
- **Risultato di simulazione** `.result`, bordo viola se cambiato rispetto al riferimento.
- **Palette di ricerca**: `<dialog>` modale, combobox con lista di opzioni.
- **Glossario nel testo**: `<button class="gl">` apribile con tocco o Invio.

Esempi dal vivo: ogni componente compare nelle viste di `app/views/`; gli screenshot in `docs/screenshot/` mostrano home, schede, mappa, simulatore, roadmap, emergenza a 1280 e 390 px.

## Larghezze verificate

360, 390, 768, 1280, 1600 px. Sotto 900 px la navigazione principale passa in basso (uso con una mano), la profondità di lettura in una barra propria; nessuna funzione richiede hover o trascinamento preciso (la mappa ha pulsanti di zoom, vista centrata sull'elemento e alternativa a elenco).
