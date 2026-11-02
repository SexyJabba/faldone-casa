# «Il progetto in cinque minuti»: presentazione del progetto

Il percorso sostituisce il vecchio `#percorsi/cinque-minuti` (5 capitoli). Serve sia in riunione, condividendo lo schermo, sia per chi lo legge da solo.

## Come provarlo

| Che cosa | URL o comando |
|---|---|
| Presentazione, scena 1 | `#presenta` (dalla home: «Scopri il progetto in 5 minuti») |
| Una scena precisa | `#presenta?s=dati` (identificativi: visione, valore, giornata, luoghi, servizi, funzionamento, dati, continuita, realizzazione, quadro) |
| Lettura continua | `#presenta?m=lettura` oppure `#presenta?s=dati&m=lettura` |
| Stampa | pulsante «Stampa / Salva in PDF» (stampa del browser; nessun download simulato) |
| Senza JavaScript | `presentazione.html` |
| Verifiche | `node --test tools/test/presentation.test.mjs` · `node tools/e2e/presentation.cjs` (sito servito su 127.0.0.1:8811) |

Comandi: frecce ← → cambiano scena quando il focus non è in un campo o in un pannello; Esc chiude indice e approfondimenti e riporta il focus al pulsante che li ha aperti. «Schermo intero» è facoltativo e compare solo se il browser lo supporta.

## Una sola sorgente

Tutto deriva da `content/presentazione/scene.json`:

- presentazione e lettura (`app/views/presentation.js`), stampa (stessa vista, foglio di stile di stampa), pagina statica `presentazione.html` (build): tutte usano `renderScene()` di `app/lib/scenes.js`;
- ogni scena: `id` stabile, `short` (nome breve per indice e pulsanti), `question`, `title` (un messaggio, non un argomento), `body` (paragrafi), `visual` (schema), `caption`, `alt` (descrizione testuale equivalente), `deep` (approfondimento: testo tecnico, `entities` del modello, `cards` di fonte, `links`), `exits` (solo l'ultima).

### Aggiornare una scena

1. Modifica il testo in `scene.json`. Non concatenare descrizioni delle schede: il testo è scritto per il racconto.
2. Le prime quattro scene non usano codici macchina, sigle infrastrutturali o nomi di prodotto; nelle successive un prodotto compare solo accanto alla sua funzione, per esempio «archivio delle foto (Immich)». I codici (M2, C4…) stanno solo negli approfondimenti. I test lo controllano.
3. `node tools/build.mjs`: la build si ferma se una scena cita entità o schede inesistenti o se il testo principale esce dal budget di 550–650 parole.
4. `node --test tools/test/*.test.mjs`.

### Aggiornare uno schema

I tipi di schema sono in `renderVisual()` (`app/lib/scenes.js`): `hub`, `places`, `columns`, `grid`, `sequence`, `flow`, `layers`, `scenario`, `timeline`. I dati dello schema stanno nella scena; i colori vengono dai token del tema. Uno schema concettuale non deve aggiungere collegamenti, repliche o dipendenze che il modello non contiene. Sul telefono gli schemi `hub` e `places` diventano un elenco con le stesse informazioni.

### Aggiornare le fonti

Le affermazioni tecniche delicate sono negli approfondimenti con i codici di scheda (`deep.cards`) e le entità del modello (`deep.entities`). Il test `coerenza con il modello` verifica che le affermazioni più delicate corrispondano ai dati: cinque nodi votanti, tre a richiesta, backup locale proposto, cartucce da acquistare, subentro solo per Nextcloud, Vikunja e n8n.

## Fonti delle affermazioni delicate

| Scena | Affermazione | Fonte |
|---|---|---|
| 3 | Documenti e bozze disponibili senza rete; consegna senza duplicati; prova ancora da fare | REV4-VLAV, REV4-VSYNC, REV4-VTEST; profili «Lavoro in trasferta» e «Senza copertura» |
| 4 | Il Vito si collega da fuori, rete propria, nessun ponte libero con casa | REV4-VNET, REV4-ECO |
| 6 | Cinque nodi votanti sempre accesi, M3/M4/M6 a richiesta, S4 accende i server | INF-03.01, REV3-ENE, INF-03.32 |
| 7 | Disco dati singolo; backup locale proposto alle 18:00; Drive con cifratura da decidere; RDX da acquistare, selezioni diverse | REV3-BCK, REV4-MIG, REV3-CLOUD, REV3-ACQ |
| 8 | Domotica indipendente da M2; subentro su C4 solo per alcune app, dopo collaudo e se la replica entra; Immich senza subentro | INF-03.09, INF-08.08, INF-08.04 |
| 9 | Attuazione dal 23 dicembre 2026, tre gruppi di fasi, nessun collaudo registrato nel Faldone | REV4-ROAD, REV4-TEST |

Lo storyboard proponeva per la scena 8 il guasto del disco dati. Le fonti descrivono invece il caso «M2 guasto» (INF-03.09): il solo guasto del disco non fa scattare il subentro, perché la macchina resta accesa. La scena racconta quindi il server che si ferma, e cita il disco come caso in cui si recupera dalle copie.

## Navigazione e cronologia

- Cambio di scena: nuova voce di cronologia. Indietro e Avanti del browser percorrono le scene; ogni scena ha un URL condivisibile.
- Cambio di modalità, scena scelta dall'indice in lettura, scorrimento in lettura: sostituzione, nessuna voce in più.
- Indice e approfondimenti: nessuna voce. Si chiudono con Esc e il focus torna al pulsante d'origine.
- Punto di ripresa: salvato solo sul dispositivo e proposto in home come «Riprendi dalla scena interrotta». Non porta mai automaticamente un visitatore all'ultima scena.
- URL storici: `#percorsi/cinque-minuti?c=1…5` → visione, luoghi, funzionamento, dati, continuità. Senza parametro porta alla prima scena; `#tour` porta alla presentazione; una scena inesistente porta alla prima scena, con un avviso e l'indice.
- Formato e dettaglio sono concetti separati: «Presentazione / Lettura» cambia il formato; gli approfondimenti aggiungono dettaglio. Il «livello di dettaglio» del resto del sito non tocca la presentazione.

## Parole e durata

Conteggio automatico (build e test), su titoli, testi, didascalie e nota di stato: **638 parole** di testo principale, più **379 parole** dentro gli schemi (etichette e brevi descrizioni), contate a parte perché si leggono osservando lo schema.

Stima: a circa 200 parole al minuto il testo principale richiede poco più di 3 minuti; con circa 10–15 secondi per osservare ciascuno dei 10 schemi si arriva a **circa 5 minuti**. È una stima calcolata, non una lettura cronometrata da una persona: va confermata con un lettore reale.

## Revisione editoriale

Revisione interna, senza test con utenti: dopo le dieci scene un lettore inesperto dovrebbe poter rispondere alle sei domande del mandato:

1. che cos'è e perché esiste → scene 1–2;
2. che cosa permette e a chi serve → scene 2, 3 e 5;
3. come si collegano i luoghi → scena 4;
4. servizi, dati e protezione → scene 5–8;
5. previsto, verificato, da realizzare → nota di stato, scene 7–9;
6. dove approfondire o contribuire → approfondimenti e scena 10.

Non è stata fatta una verifica con persone esterne né con tecnologie assistive reali (lettori di schermo): sono controlli ancora da eseguire.
