# Istruzioni per chi lavora su questo repository

- Fonti: `content/corpus/` (testo) e `content/model/` (struttura). Non modificare i file generati (`data/`, `schede/`, `e/`, `kit/`, `stampa/`, `index.html`, `sw.js`): eseguire `node tools/build.mjs`.
- Dopo una modifica ai testi delle schede o a `app/stampa.css`: `node tools/build.mjs` e poi `node tools/stampa.mjs`, che rigenera i PDF del Faldone stampabile in `stampa/pdf/` (solo quelli cambiati). Le pagine in `stampa/` sono generate: non modificarle a mano.
- Prima di consegnare: `node --test tools/test/*.test.mjs` e, se possibile, `node tools/e2e/smoke.cjs` con il sito servito in locale.
- Non inventare consegne, collaudi, telemetria, porte, VLAN, indirizzi o capacità: un dato mancante resta `null` con `ev: "unknown"` e, se serve, una domanda in `content/model/issues.json`.
- Non promuovere una proposta ad approvata; le decisioni sono del proprietario.
- Il repository è pubblico. I dati sensibili (planimetria, indirizzi, porte, allarme, telecamere) vanno solo nell'area riservata cifrata: mai in chiaro in sorgenti, file generati, test, commit o screenshot. La password non si scrive nel repository. Vedi `docs/area-riservata.md`.
- Gli script di build Python citati in `01_Vault_MD/AGENTS.md` non esistono più nel repository: la build attuale è `tools/build.mjs`.
- Dettagli: `docs/manutenzione-editoriale.md`, `docs/modello-dati.md`.
