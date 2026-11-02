# Istruzioni per chi lavora su questo repository

- Fonti: `content/corpus/` (testo) e `content/model/` (struttura). Non modificare i file generati (`data/`, `schede/`, `e/`, `kit/`, `index.html`, `sw.js`): eseguire `node tools/build.mjs`.
- Prima di consegnare: `node --test tools/test/*.test.mjs` e, se possibile, `node tools/e2e/smoke.cjs` con il sito servito in locale.
- Non inventare consegne, collaudi, telemetria, porte, VLAN, indirizzi o capacità: un dato mancante resta `null` con `ev: "unknown"` e, se serve, una domanda in `content/model/issues.json`.
- Non promuovere una proposta ad approvata; le decisioni sono del proprietario.
- Gli script di build Python citati in `01_Vault_MD/AGENTS.md` non esistono più nel repository: la build attuale è `tools/build.mjs`.
- Dettagli: `docs/manutenzione-editoriale.md`, `docs/modello-dati.md`.
