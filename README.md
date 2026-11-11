# Il Faldone

Atlante operativo dell'infrastruttura di casa, sala server, laboratorio e Vito: capire, esplorare, simulare, mantenere e discutere il sistema attraverso gli stessi dati. Pubblicato su https://faldone.rinaldi.build/ (GitHub Pages).

```sh
node tools/build.mjs                          # valida content/ e genera il sito
node --test tools/test/*.test.mjs             # test
python3 -m http.server 8811 --bind 127.0.0.1  # anteprima
```

| Cartella | Contenuto |
|---|---|
| `content/corpus/` | testo leggibile delle 303 schede (181 gruppi) e loro anagrafica — **fonte editoriale** |
| `content/presentazione/` | le 10 scene di «Il progetto in cinque minuti» — **fonte** di presentazione, lettura, stampa |
| `content/model/` | modello strutturato: entità, relazioni, collaudi, roadmap, decisioni, procedure, percorsi — **fonte** |
| `content/legacy/` | dati 4.4 migrati (hardware, inventario, tabelle) |
| `app/` | interfaccia (moduli ES senza dipendenze) e motori puri in `app/lib/` |
| `tools/` | build, migrazione, test, verifiche nel browser, adapter di integrazione |
| `lavoro/` | «Lavoro»: cantieri, ore, spese e cose da fare per il Kindle sul Vito o in cantiere — scritto a mano, fuori dalla build ([docs/lavoro.md](docs/lavoro.md)) |
| `data/`, `schede/`, `e/`, `kit/`, `index.html`, `sw.js` | **generati** dalla build: non modificare a mano |
| `01_Vault_MD/`, `02_PDF_correnti/`, `04_Sorgenti/`, `07_Piani_di_attivazione/` | Markdown, PDF, evidenze e piani della revisione 4.4 |
| `docs/` | audit, modello dati, migrazione, manutenzione, rilascio, integrazioni, requisiti, screenshot |

Presentazione del progetto: `#presenta` (vedi [docs/presentazione.md](docs/presentazione.md)).

Documentazione: [audit](docs/audit.md) · [modello dati](docs/modello-dati.md) · [manutenzione editoriale](docs/manutenzione-editoriale.md) · [rilascio e rollback](docs/rilascio.md) · [integrazioni](docs/integrazioni.md) · [design system](docs/design-system.md) · [requisiti e verifiche](docs/requisiti.md) · [checkpoint](docs/CHECKPOINT.md).
