# Manutenzione editoriale

Ogni modifica si fa nei sorgenti (`content/`), poi:

```sh
node tools/build.mjs        # valida e rigenera data/, schede/, e/, kit/, index.html, sw.js
node --test tools/test/*.test.mjs
```

Se la build si ferma, il messaggio dice quale riferimento manca o quale regola è violata. Non modificare mai a mano i file generati (`data/`, `schede/`, `e/`, `kit/`, `index.html`, `sw.js`).

## Aggiornare il testo di una scheda

1. Trova il gruppo: `docs/migrazione/mappa-codici.csv` (colonna `gruppo`) oppure la prima riga dei file `content/corpus/schede/gNNN.html`.
2. Modifica il testo comune nel corpo, o la parte specifica dopo `<!--tail CODICE-->`.
3. Non cambiare i codici nell'intestazione `<!--faldone {...} -->`: sono gli identificativi stabili. Per aggiungere un nuovo codice serve anche una voce in `content/corpus/cards.json` con PDF e Markdown.
4. Build: la modifica arriva a ricerca, pagine statiche di tutti i codici del gruppo, kit e sito (verificato dal test A23).

Dopo la build, se il testo di una scheda è cambiato, si rigenera il suo PDF: `node tools/stampa.mjs` (serve Playwright con Chromium). Lo strumento rifà solo i PDF il cui testo è cambiato; le prove falliscono se qualche PDF è rimasto indietro.

I PDF e l'EPUB d'archivio della 4.4 (`02_PDF_correnti/`, `INF_*.pdf`) non vengono rigenerati: restano marcati come revisione 4.4.

## Faldone stampabile

Il raccoglitore a schede sostituibili si genera dagli stessi testi del sito; non c'è più una copia da allineare altrove.

- **Una scheda per testo.** Un testo che vale per più codici è una scheda sola, sotto il suo primo codice (nell'ordine di `cards.json`); l'indice di ogni blocco dice in quale scheda si legge ciascun codice.
- **Pagine** (rifatte da `node tools/build.mjs`): `stampa/index.html` (indice senza JavaScript), `stampa/faldone.html` (intero), `stampa/blocco-XX.html` (un blocco, completo da solo), `stampa/scheda/CODICE.html` (una scheda), `stampa/parti/` (frontespizio e indici dei blocchi). Impaginazione in `tools/lib/stampa.mjs` e `app/stampa.css`.
- **PDF** (rifatti da `node tools/stampa.mjs`): un file per scheda e per parte in `stampa/pdf/`, sempre con pagine pari, con codice, revisione, data e «pagina n di N» della scheda in ogni piè di pagina. `stampa/pdf/manifest.json` registra da quale testo è nato ogni PDF.
- **PDF intero e di blocco**: non sono file nel repository. Li compone il browser al momento, unendo i PDF delle schede (`app/lib/pdfmerge.js`), dalla pagina `#documenti/stampa`.
- **Se cambia l'impaginazione** (`app/stampa.css` o il modello di pagina) tutti i PDF risultano da rigenerare: è voluto.
- Data e revisione stampate sono quelle del documento (`meta.revision`, `meta.documentDate`): il corpus non ha una data per singola scheda e non se ne inventa una.

## Aggiornare un nodo

`content/model/infra.json`. Ruolo, accensione (`power`), voto, luogo, stato (`decision`, `realization`, nota e fonte), limiti, relazioni. L'hardware viene da `content/legacy/hardware.json` tramite `hardwareRef`: per cambiarlo si aggiorna quel file (o il suo successore), non si ricopia nell'entità.

## Aggiornare un servizio

`content/model/services.json`. Indica sempre `hosted_on`, le dipendenze (`depends_on` con `req: optional` se facoltative, `ev: unknown` se il collegamento non è documentato), le attività in linguaggio comune, `remote` (`none`, `caddy`, `private`) e, se previsto, `recovers_on` con una condizione strutturata.

## Aggiungere o correggere una relazione

Nella lista `rel` dell'entità di origine: `["tipo", "DESTINAZIONE", { "label": "…", "src": ["CODICE"], "ev": "documented" }]`. Se un collegamento è ignoto, scrivilo con `"ev": "unknown"` e una domanda in `issues.json`: il sito mostrerà il vuoto invece di inventarlo.

## Aggiornare una procedura

`content/model/procedures.json`: sintomo, destinatario, competenze, condizioni di arresto, controlli non distruttivi con risultato atteso, passaggi (comandi con `where`, `does`, `expect`; parametri espliciti in `params`), ritorno indietro, evidenza da registrare, fonti. `verifiedAt` resta `null` finché la procedura non è provata sul campo.

## Registrare una decisione

`content/model/decisions.json`: problema, alternative, scelta (o `null`), motivazione, compromessi, stato, data, entità, fonti. Per sostituirne una: nuova decisione con `supersedes`, la vecchia con `status: "superata"` e `supersededBy`.

## Registrare un collaudo (l'unico modo per «completare»)

`content/model/test-results.json`:

```json
[{ "testId": "T-COPIE", "outcome": "superato", "date": "2027-01-10", "unit": "M4 / WD RAIDZ2", "conditions": "…", "evidence": "registro restore del 10/01, hash confrontati" }]
```

La build rifiuta un «superato» senza evidenza. Da quel momento simulatore, roadmap e schede usano l'esito; le spunte nel browser non contano mai.

## Incongruenze e domande

`content/model/issues.json`: fonti a confronto, impatto, stato, eventuale risoluzione. Risolvi solo quando la fonte approvata è inequivocabile.

## Migrazione ripetibile

`node tools/migrate-legacy.mjs` rigenera `content/corpus` e `content/legacy` dal commit 4.4 (`f43ecf0`). Serve solo per verifiche: dopo la migrazione i sorgenti di riferimento sono quelli in `content/`. Rieseguirla **sovrascrive** le modifiche fatte ai testi.
