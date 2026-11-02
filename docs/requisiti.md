# Registro dei requisiti e criteri di accettazione

Legenda esito: **fatto** (implementato e verificato), **parziale** (implementato con limiti dichiarati), **non fatto** (motivo indicato), **richiede persone** (serve una validazione che non si può fare in automatico).

Verifiche: `T` = test automatico in `tools/test/` (node:test) · `E` = verifica nel browser in `tools/e2e/` (Playwright) · `M` = verifica manuale su screenshot · `R` = revisione euristica.

## Criteri A01–A25

| ID | Esito | Evidenza |
|---|---|---|
| A01 Primo accesso senza conoscenze tecniche | parziale · richiede persone | Home con 5 intenti, sei ambiti in linguaggio comune, percorso «Il sistema in cinque minuti», limiti espliciti (R, M: `docs/screenshot/1280-home.png`). **Nessun test con utenti reali** è stato fatto: è una revisione euristica. |
| A02 Cambio di profondità su M2 | fatto | Stessa entità e stesso URL, limiti di perdita dati visibili a ogni livello, dettaglio tecnico aperto in «Intervenire» (E: `a11y.cjs` «A02»). I fatti vengono dallo stesso oggetto del modello. |
| A03 Ricerca per codice | fatto | `INF-03.03` primo risultato, «codice esatto», apre la scheda con codici, PDF e Markdown (T: `tools.test.mjs` A03). |
| A04 Linguaggio comune | fatto | «non vedo le foto» → Immich con motivo «foto → foto e video personali»; «furgone» → Vito; zero risultati con alternative (T: A04; E: palette). |
| A05 Corpus | fatto | 303/303 codici della 4.4 hanno testo, pagina statica, PDF e Markdown; tutte le 255 code specifiche e i 181 testi identici all'originale (T: `content.test.mjs` A05, confronto con il commit `f43ecf0`). |
| A06 Navigazione | fatto | Indietro ripristina filtri e posizione; una navigazione = un rendering; URL profondi di simulatore e mappa; alias `#node/M2`, `#sim`, `#world-*`, `#tour` (E: `a11y.cjs` A06, `smoke.cjs` 51 rotte). |
| A07 Dipendenze | fatto | Dalla scheda di un servizio: host, dati, copie, subentro con condizioni, procedure, schede e fonti; dipendenze indirette e dipendenti (M: `1280-e_NEXTCLOUD.png`; E: smoke). |
| A08 M2 indisponibile | fatto | Subentro su C4 «non garantito»: collaudo T-HA-APP non eseguito e capacità disco di C4 sconosciuta; con le ipotesi esplicite il subentro vale solo per Nextcloud, Vikunja, n8n con perdita entro RPO obiettivo (T: `sim.test.mjs` A08). |
| A09 M3/M4/M6 spenti | fatto | Voti invariati; «su richiesta» distinto da «fermo»; manutenzione distinta dal guasto (T: A09, manutenzione). |
| A10 Partizione | fatto | Voti per partizione connessa; switch guasto ⇒ membri isolati; senza quorum guest non HA in esecuzione ma non gestibili, con HA ipotetica indeterminato (T: A10). |
| A11 Dato sconosciuto | fatto | Accesso remoto personale, binding Zigbee, collegamento di M5: «non determinabile» con domanda aperta (T: A11). |
| A12 Copia non collaudata | fatto | «Esiste una copia ma il recupero non è mai stato provato»; proposte non attive; snapshot sullo stesso disco segnalato; prova mancante raggiungibile (T: A12; M: `e/D-FOTO`). |
| A13 Roadmap | fatto | Gate senza collaudi blocca A-3.1; spunte locali ignorate; «superato» senza evidenza rifiutato dalla build (T: A13 ×3). |
| A14 Calcolatore energia | fatto | Casi calcolati a mano (840 Wh, 510 Wh), null e ore fuori intervallo esclusi con messaggio, nessun TDP (T: A14). |
| A15 Confronto scenario | fatto | Due scenari A/B salvati sul dispositivo, ripristino dei valori del Faldone, progetto invariato (E: smoke `costi`; codice `costs.js`). Nessun test automatico dedicato al ricaricamento: verificato a mano. |
| A16 Persistenza | fatto | Migrazione chiavi 4.4 senza cancellarle; dati corrotti, quota piena, import non valido gestiti; conflitti con anteprima, attuale preservato (T: A16 ×3). |
| A17 Telemetria assente o vecchia | fatto (contratto) | Ovunque «non rilevato»; adapter: istantanea assente ⇒ non configurato, scaduta ⇒ scaduto, errore ⇒ errore (T: `adapter.test.mjs`). Nessun connettore reale. |
| A18 Consultazione pubblica | fatto | Build e test bloccano percorsi locali, email, segreti, indirizzi IP negli output; foto senza GPS; service worker solo contenuti pubblici, mai risposte con `Authorization` (T: A18; `build.mjs`). Restano percorsi nella **cronologia Git** (vedi I-PRIVACY-PATHS). |
| A19 Permessi | non applicabile | Nessuna area privata né backend: il sito è interamente pubblico e non simula protezioni nel JavaScript. |
| A20 Tastiera e mobile | fatto | Skip link, «/» e Ctrl+K (non nei campi), palette con frecce, mappa e simulatore da tastiera, glossario con Invio; nessun overflow a 360/390/768/1280/1600 px; axe WCAG 2.2 A/AA senza violazioni su 18 viste × 3 configurazioni (E: `a11y.cjs`). La conformità non è certificata. |
| A21 Offline | parziale | Kit autonomo `kit/emergenza.html` con revisione e data; pagine statiche; service worker con precache e «scarica tutto». La cache offline del service worker non è stata provata in modalità aereo reale (richiede https o localhost nel browser dell'utente). Nessuna CDN. |
| A22 Proposta di un tecnico | fatto | Bozza Markdown e pacchetto di contesto JSON scaricabili, nessun invio, baseline intatta (E: smoke `contribuisci`; codice `contribute.js`). |
| A23 Contenuto nuovo | fatto | Modifica a un gruppo ⇒ ricerca, pagine statiche di tutti i codici e dati aggiornati dopo la build (T: A23). |
| A24 Link e allegati | fatto | Link interni del corpus verificati; PDF/MD esistenti; PDF ed EPUB marcati come 4.4 (T: A24, A05). |
| A25 Rilascio | fatto | `docs/rilascio.md`: build, verifica, pubblicazione, rollback (anche del service worker). La pubblicazione non è stata eseguita. |

Casi di test aggiuntivi richiesti: dipendenza indiretta (Caddy ← OPNsense ← M1), ciclo di avvio (fixture), combinazione di guasti (M2 + C4), servizio parzialmente disponibile (senza WAN), informazioni insufficienti (accesso remoto), dato obsoleto (copia stale): tutti in `sim.test.mjs`. Formule controllate con valori calcolati indipendentemente (`tools.test.mjs`). QR confrontato con la libreria Python `qrcode`.

## Requisiti di prodotto (sintesi)

| Area | Esito | Dove |
|---|---|---|
| Tre livelli di lettura | fatto | barra «Capire / Approfondire / Intervenire»; `entity.js`, `paths.js`, `home.js`, `procedure()` |
| Orientamento per intenti | fatto | home |
| Stato a dimensioni distinte con fonte | fatto | `dims()`, scheda «Stato in dettaglio», `ev()` |
| Navigazione a 5 aree e strumenti trasversali | fatto | header, barra in basso su mobile |
| Sei ambiti riconoscibili | fatto | `ambito/*`, home |
| Home con stato documentale e prossimi passi reali | fatto | home (da `roadmapState`) |
| Percorsi guidati (4) | fatto | `percorsi/*`; progresso locale separato |
| Modello comune, validazione, migrazione | fatto | `content/model`, `tools/lib/validate.mjs` |
| Mappa a livelli, selezione, dipendenze, zoom, URL, legenda, elenco | fatto | `mappa`; layout a fasce stabile |
| Percorsi dei dati (4) con vuoti informativi | fatto | documento, foto, multimedia, domotica |
| Rack e porte, QR | parziale | vista logica (U e RJ45 non documentati); QR verso la scheda pubblica |
| Schede nodo / servizio / dato | fatto | `e/*` |
| Simulatore | fatto | eventi su host, servizi, archivi, linee, switch, corrente, Vito, copie; ipotesi esplicite; scenari salvabili |
| Procedure ed emergenza | fatto | 5 emergenze + 2 tecniche; kit offline stampabile |
| Ricerca e glossario contestuale | fatto | palette, pagina con filtri, glossario nel testo |
| Assistente documentale | non fatto | nessun backend autorizzato: contratto in `docs/integrazioni.md`; nessun finto chatbot |
| Roadmap verificabile, decisioni, contribuisci | fatto | `realizza/*`, `contribuisci` |
| Costi, energia, capacità, trasferimenti | fatto | `costi` |
| Registro connettori e adapter read-only | parziale | contratto, adapter, test con fixture; nessuna connessione |
| Area privata | non fatto | richiede backend e autenticazione lato server: decisione del proprietario |
| Prestazioni misurate | fatto | `docs/rilascio.md` |

## Secondo passaggio: identità enterprise e presentazione (2 novembre 2026)

| Area | Esito | Evidenza |
|---|---|---|
| Comprensione iniziale | fatto · richiede persone | Scene 1–2 senza codici né prodotti (T: `presentation.test.mjs`). Revisione editoriale interna, nessun test con utenti. |
| Racconto | fatto | 10 scene in sequenza, ognuna con domanda, messaggio, schema e passaggio alla successiva (`content/presentazione/scene.json`). |
| Durata | fatto (stima) | 638 parole più 379 negli schemi; circa 5 minuti calcolati, non cronometrati da una persona (`docs/presentazione.md`). |
| Utilità concreta | fatto | Scena 3, flusso del Vito documentato come previsto, con la prova ancora da fare. |
| Luoghi e categorie | fatto | Scena 4: quattro luoghi; destinatari e inventario indicati come dimensioni trasversali. |
| Visual | fatto | Schemi HTML/SVG con descrizione testuale, leggibili senza hover né animazione; elenco equivalente su telefono. |
| Stato del progetto | fatto | Nota di stato in apertura; scene 7–9 distinguono proposto, da acquistare, da provare, registrato. |
| Navigazione | fatto | Precedente e successiva con destinazione, «3 di 10 — …», indice, uscita, ritorno dagli approfondimenti (E: `presentation.cjs`). |
| URL | fatto | Link diretti, ricaricamento, Indietro/Avanti, vecchi `?c=1…5` ricondotti per significato, scena inesistente gestita (E). |
| Modalità | fatto | Presentazione e lettura dalla stessa sorgente; la scena si conserva nel cambio (E). |
| Riunione | fatto | Cornice senza testata, ricerca, preferiti e livello di dettaglio; verificata a 1280×720 e 1920×1080 (E). |
| Conclusione | fatto | Scena 10: schema iniziale ricomposto e tre destinazioni. |
| Tecnici | fatto | Approfondimento per scena con entità, codici, fonti e collegamenti; Indietro torna alla scena (E). |
| Identità | fatto | Token condivisi, IBM Plex locale, testata, home, schede, documenti, catalogo, mappa. |
| Correzioni visive | fatto | Titolo della home; testata alleggerita; M2 con 1+2 azioni e menu; tabelle di INF-03.03 a larghezza naturale; codici del catalogo in linea; mappa con comandi in barra e più spazio. |
| Responsive e accessibilità | fatto | axe WCAG 2.2 A/AA su presentazione e sito, tastiera, 360/390/768/1280×720/1440/1920 senza scorrimento orizzontale (E). Nessuna prova con lettori di schermo reali. |
| Stampa | fatto | PDF dal browser: copertina e una scena per pagina, nessun controllo stampato, sempre chiara (E). |
| Regressioni | fatto | 60 test unitari, 51 rotte, verifiche di accessibilità e tastiera del sito. |

Difetti preesistenti trovati e corretti in questo passaggio: la regola CSS della navigazione `.primary` nascondeva su mobile tutti i pulsanti primari (anche «Genera la bozza» in Contribuisci e «Vai ai risultati» nel simulatore) e spostava di 16 px quelli su desktop; il focus dopo un cambio pagina non arrivava al titolo; i pulsanti di zoom della mappa erano sovrapposti ai nodi.
