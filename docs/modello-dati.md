# Modello dati

Versione schema: 1 (`content/model/meta.json`). La build produce `data/core.json` con i contratti normalizzati.

## Fonti autorevoli e direzione di generazione

```
content/corpus/schede/gNNN.html   testo leggibile (181 gruppi)      ─┐
content/corpus/cards.json         anagrafica dei 303 codici          │
content/legacy/*.json             dati strutturati 4.4 (ripuliti)    ├─► tools/build.mjs ─► data/, schede/, e/, kit/, index.html, sw.js
content/model/*.json              modello: entità, relazioni, …      │
01_Vault_MD/, 02_PDF_correnti/    Markdown e PDF 4.4 (solo lettura) ─┘   (collegati, non rigenerati)
```

Gerarchia: schede della revisione corrente e decisioni approvate → registri (acquisti, collaudi) → storico. Un documento più recente non è approvato per il solo fatto di esserlo: lo stato della decisione è un campo a parte.

## Contratti

```ts
type EvidenceKind = 'documented' | 'declared' | 'measured' | 'estimated' | 'simulated' | 'unknown';
type Fact<T> = { value: T | null; evidenceKind: EvidenceKind; sourceIds: string[]; unit?: string; verifiedAt?: string | null; note?: string };

type Status = {
  decision: 'ipotesi' | 'proposta' | 'approvata' | 'superata' | 'da_chiarire' | null;
  realization: 'da_acquisire' | 'ordinato' | 'disponibile' | 'installato' | 'configurato' | 'collaudato' | 'dismesso' | 'non_attestato' | null;
  observation: 'non_rilevato';          // nessun connettore collegato
  access: 'pubblico';
  note: string | null; sourceIds: string[];
};

type Entity = {
  id: string; kind: 'place'|'cluster'|'node'|'device'|'network'|'service'|'dataset'|'storage'|'copy';
  name: string; title?: string; oneLine: string; scopes: string[]; place?: string;
  status: Status; facts: Record<string, Fact<unknown>>; cards: string[]; inventory?: string[];
  limits?: string[];                    // limiti che possono far perdere dati: sempre visibili
  power?: 'always'|'on_demand'|'manual'|'external'; vote?: boolean;          // nodi
  activities?: { text: string; write?: boolean }[]; audience?: string;        // servizi
  remote?: 'none'|'caddy'|'private'; determinable?: false; undeterminedReason?: string;
  mechanism?: 'snapshot'|'replica'|'backup'|'offsite'|'offline'|'mirror'|'sync'|'transit'; protects?: string[]; // copie
  assignments?: { phase: 'attuale'|'progetto'; to: string; after?: string; evidenceKind; sourceIds }[];   // archivi
  hardware?: {...}                       // derivato dai dati 4.4 via hardwareRef, non ricopiato
};

type Relation = {
  id: string; fromId: string; toId: string;
  type: 'hosted_on'|'depends_on'|'connected_to'|'stores_on'|'backs_up_to'|'replicates_to'|'protected_by'|'recovers_on'|
        'powered_by'|'located_in'|'documented_by'|'validated_by'|'blocked_by'|'member_of'|'wakes';
  requirement?: 'required'|'optional'|'conditional';
  condition?: StructuredCondition; evidenceKind: EvidenceKind; sourceIds: string[]; label?: string; note?: string; manual?: true; mechanism?: string;
};

type StructuredCondition =
  | { all: StructuredCondition[] } | { any: StructuredCondition[] } | { not: StructuredCondition }
  | { test: string }                     // collaudo superato (registro) o supposto (ipotesi dello scenario)
  | { quorumAt: string }                 // il nodo è in una partizione con quorum
  | { factKnown: string }                // "ENTITÀ.fatto" ha un valore noto
  | { decision: string; is?: string } | { entityUp: string };
```

Le condizioni sono dati: nessun `eval`, nessuna stringa interpretata. `validateCondition` rifiuta chiavi non ammesse.

## Forma abbreviata nei sorgenti

Per leggibilità i file di `content/model` usano abbreviazioni che la build espande:

- fatti: `{"value": 4, "unit": "TB", "ev": "documented", "src": ["INF-03.03"]}` → `evidenceKind`, `sourceIds`;
- relazioni dentro l'entità: `"rel": [["hosted_on", "M2"], ["depends_on", "WAN1", {"req": "optional", "ev": "unknown", "cond": {...}, "label": "…"}]]`;
- copie: `"protects": ["D-DOC"]` genera `D-DOC —backs_up_to/replicates_to/protected_by→ copia` secondo il meccanismo;
- ogni scheda in `cards` genera una relazione `documented_by`.

ID delle relazioni: `R:origine:tipo:destinazione` (stabile finché la relazione esiste), oppure `R:origine:id` se specificato.

## Regole di validazione (la build si ferma se una fallisce)

ID univoci e ben formati; riferimenti a entità, schede, inventario, collaudi, decisioni e acquisti esistenti; enumerazioni ammesse; valore `null` obbligatorio se la natura è «sconosciuto»; numeri con unità; una stessa unità d'inventario non assegnata a più macchine della sua quantità; una sola assegnazione per fase; condizioni conformi allo schema; **nessun ciclo** in `hosted_on`/`depends_on`/`stores_on` salvo cicli ammessi documentati (oggi nessuno); un esito «superato» richiede evidenza; ogni codice di scheda ha un testo leggibile; ogni coda appartiene a un codice del suo gruppo; comandi delle procedure con «dove», «cosa fa» e «risultato atteso». Dopo la generazione, un controllo blocca percorsi locali, email personali e segreti negli output pubblici.

## Semantica del simulatore (`app/lib/sim.js`)

- Stati: disponibile, su richiesta, limitato, non determinabile, fermo. Ordine di gravità: fermo > non determinabile > limitato > su richiesta > disponibile.
- Voti contati **per partizione connessa** attraverso lo switch fidato; collegamenti `unknown` danno un intervallo min–max; quorum `null` = incerto.
- Senza quorum: con HA non attiva (baseline documentata) i guest già avviati continuano ma non si gestiscono; con HA ipotetica l'esito è indeterminato (fencing non documentato).
- Subentro: richiede riserva in funzione **e** condizione vera. Collaudo non registrato o dato mancante ⇒ «non determinabile», mai verde. Subentri manuali accettano una riserva da avviare.
- Server a richiesta spenti: «su richiesta» se un mittente WoL e lo switch funzionano; spento per manutenzione è distinto dal guasto.
- Blackout: autonomia non dichiarata ⇒ non determinabile.
- Protezione dei dati: una copia vale come recupero garantito solo con collaudo registrato; proposte non attive, snapshot/mirror/sync non sono copie indipendenti; dominio di guasto condiviso (stesso disco, macchina, luogo) segnalato.
- Ogni esito porta i motivi e la catena di cause; le ipotesi sono marcate come tali; nessuna simulazione modifica il modello.
