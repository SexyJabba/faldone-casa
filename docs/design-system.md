# Design system

File: `app/style.css` (sito), `app/static.css` (pagine statiche e kit). Nessun font remoto: pila di sistema.

## Identità

Archivio tecnico contemporaneo: carta calda (`--bg #f4f1ea`), inchiostro (`--fg #1a2227`), petrolio come struttura (`--accent #14505c`). Il marchio è una costola di faldone con la «F». Tema scuro completo, rispetto di `prefers-color-scheme` e scelta manuale (auto → chiaro → scuro). `prefers-reduced-motion` disattiva le transizioni.

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
