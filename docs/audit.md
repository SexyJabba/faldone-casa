# Audit iniziale e decisioni di progetto

Data: 2 novembre 2026 · Base esaminata: commit `f43ecf0` (sito pubblicato, revisione 4.4 del 1 novembre 2026).

Il sito pubblico `faldone.rinaldi.build` non era raggiungibile dall'ambiente di lavoro (proxy, HTTP 403): l'audit è stato fatto sulla copia del repository servita in locale, che è il contenuto pubblicato da GitHub Pages. Screenshot di partenza in `docs/screenshot/prima/`.

## 1. Che cosa c'era

| Aspetto | Osservazione | Evidenza |
|---|---|---|
| Hosting | GitHub Pages dal ramo, dominio `CNAME`, `.nojekyll`. Nessuna build nel repository. | radice del repo |
| Pipeline | `01_Vault_MD/AGENTS.md` cita `../04_Sorgenti/build_rev4.4.py` e `build_site_rev44.py`: **non sono nel repository**. `assets/data.js` (1,7 MB) e `assets/schede-chiare.js` (778 KB) sono output orfani, non rigenerabili. | `git ls-files` |
| Due testi divergenti | Il testo leggibile riscritto (181 gruppi `SCHEDE_G`) esisteva solo dentro un file JavaScript; i Markdown del vault contengono la versione formale precedente. | `schede-chiare.js` vs `01_Vault_MD/**/INF-*.md` |
| Architettura JS | 7 script che ridefiniscono `pages.*` a cascata (la home è ridefinita 3 volte), 5 listener `hashchange`, stato globale condiviso. | `grep pages\.home=` |
| Payload | 2,69 MB non compressi per aprire la home; tutti i testi e i diagrammi caricati subito. | `tools/e2e/perf.cjs` |
| Simulatore | Contava i voti senza partizioni e dichiarava «quorum perso: le VM del nucleo si fermano per sicurezza», comportamento non documentato. | `rev44-chiaro.js` righe 146–165 |
| Mappa | Collegamenti errati: S1 → `INF-03.07` (che è M3), switch → `REV4-RETE` (codice inesistente). | `interattivo44.js` |
| Calcolatore risparmio | Sommava fra i costi hardware anche l'acquisto **proposto** delle cartucce RDX. | `interattivo44.js` `acqTotal` |
| Privacy | `data.js` pubblico conteneva percorsi assoluti del computer di lavoro con il nome utente e l'indirizzo dell'account Google. Nessuna coordinata GPS nelle foto (verificato con PIL su 118 immagini). | `grep /Users assets/data.js` |
| Stato locale | Chiavi `faldone44-*`, `faldone44.*`, `tour44` con prefissi diversi in script diversi. | `localStorage` |
| Accessibilità | Struttura semantica presente (skip link, `aria-label`), ma stati affidati al colore, tour non saltabile per capitolo, ricerca senza motivazione del risultato. | revisione manuale |

## 2. Inventario del corpus

- 303 codici di scheda (INF, ATL, REV3, REV4), tutti con PDF e Markdown esistenti (verificato).
- 181 testi leggibili; 255 «code» specifiche per codice; 1 gruppo senza titolo (I-G81).
- 115 voci d'inventario, 93 foto collegate, 6 diagrammi SVG/PNG/PDF.
- 18 blocchi, 6 ambiti, 7 fasi di roadmap, 9 acquisti, 12 punti aperti.
- Mappa completa vecchio codice/rotta → nuova destinazione: `docs/migrazione/mappa-codici.csv` e `mappa-rotte.csv`.

## 3. Incongruenze rilevate

Registro completo con fonti a confronto e impatto: `content/model/issues.json`, consultabile in **Realizza → Contribuisci**. Le principali:

- **OpenClaw su MP3 o MP1** (REV3-SRV contro INF-02.07 e INF-08.04): non risolta, decisione del proprietario.
- **Hermes «su M2»** (INF-03.18, INF-08.04) contro la tabella servizi (MP3): il modello segue la tabella, segnalato.
- **P310 come disco dati e come copia SH1** (INF-03.03 contro INF-03.14): la stessa unità non può essere originale e copia indipendente; il modello non conta la «copia SH1».
- Domande aperte che il simulatore rende visibili come «non determinabile»: meccanismo dell'accesso remoto personale, interfacce di rete di M5, capacità dei dischi di C3/C4, risveglio di M6, binding Zigbee, luogo delle cartucce RDX.

Risolte autonomamente solo quelle con fonte inequivocabile o difetti del vecchio sito (mappa, simulatore, calcolatore, percorsi privati).

## 4. Decisioni di stack (motivate)

| Decisione | Motivo | Costo |
|---|---|---|
| Restare su sito statico + GitHub Pages | Hosting attuale, nessun server da mantenere, documentazione consultabile anche se l'impianto è fermo. | Nessuna area privata reale finché non esiste un backend. |
| Nessun framework né dipendenza a runtime | Il sito deve durare anni e funzionare offline; moduli ES nativi bastano. | Codice UI scritto a mano (circa 2.500 righe). |
| Build in Node senza dipendenze (`tools/build.mjs`) | Riproducibile su qualsiasi macchina con Node ≥ 20; sostituisce gli script Python mancanti. | Va eseguita prima di pubblicare (i file generati sono versionati perché Pages serve il ramo). |
| Testo leggibile in `content/corpus/schede/gNNN.html` | Un file per gruppo: diff leggibili, codici e code specifiche esplicite. Migrazione deterministica da Git (`tools/migrate-legacy.mjs`). | HTML e non Markdown: è la forma in cui il testo riscritto esisteva; convertirlo avrebbe rischiato perdite. |
| Modello strutturato in `content/model/*.json` | Una sola fonte per mappa, schede, simulazione, ricerca, roadmap, costi. L'hardware dei nodi è letto dai dati 4.4, non ricopiato. | Va curato a mano; la build lo valida (riferimenti, cicli, quantità, condizioni). |
| Routing a hash | Compatibilità con tutti gli URL `#INF-…`, `#node/M2`, `#sim`, `#world-*` esistenti; funziona su Pages senza riscritture. | URL meno «puliti». |
| Pagine statiche generate (`schede/`, `e/`, `kit/`) | Lettura senza JavaScript, stampa, offline, link stabili per QR. | ~2,5 MB di HTML generato nel repository. |

Le decisioni progettuali sull'impianto **non** sono state toccate: nessuna configurazione ripristinata, nessun hardware riprogettato, nessuna proposta promossa ad approvata.
