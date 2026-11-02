# Mappa di migrazione

- `mappa-codici.csv` — per ognuno dei 303 codici: titolo d'archivio, gruppo di testo, titolo leggibile, rotta 4.4 (`#CODICE`, invariata), pagina statica, PDF, Markdown, elementi del modello che la citano. Generato dalla build.
- `mappa-rotte.csv` — rotte del sito 4.4 (`#node/M2`, `#sim`, `#world-vito`, `#tour`, …) e destinazione nuova. Le vecchie rotte continuano a funzionare: il sito le reindirizza.

## Dati salvati nel browser

| Chiave 4.4 | Contenuto | Nuova posizione (chiave `faldone5`) |
|---|---|---|
| `faldone44-favorites` | preferiti (codici) | `favorites` |
| `faldone44-checks` | spunte | `checks` (marcate come provenienti dalla 4.4) |
| `faldone44-theme` | tema | `prefs.theme` |
| `faldone44.power` | valori del calcolatore consumi | `energy` → scenario A |
| `faldone44.savings` | calcolatore risparmio | non migrato (struttura cambiata): restano i valori del Faldone |
| `tour44` | capitoli visti | `progress.tour44` |

Le chiavi 4.4 non vengono cancellate: tornando alla versione precedente sono ancora disponibili. Migrazione verificata dai test (`tools/test/tools.test.mjs`, A16).

## Rigenerare la migrazione

`node tools/migrate-legacy.mjs [--rev f43ecf0]` legge i file pubblicati dal commit indicato e riscrive `content/corpus` e `content/legacy`. Deterministica; sovrascrive eventuali modifiche ai testi.
