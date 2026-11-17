# Modelli di calcolo
Tutto in `js/calc.js`. Ogni formula ha almeno un caso di prova in `tests/calc.test.mjs`.

## Budget — `budget(state)`
- **Speso** = Σ spese *sostenute* non in quota + max(quota da dettagliare, Σ spese sostenute segnate “in quota”).
  La quota (1.000 €) è contata una volta sola: le ricevute che la dettagliano la sostituiscono, non si sommano.
  Se le ricevute in quota superano la quota, vale il loro totale e compare un avviso.
- **Residuo reale** = tetto − speso. Preventivi e stime non lo toccano.
- **Previsto** = preventivi + stime + acquisti previsti + componenti da acquistare del sistema elettrico *attivo*.
- **Acquisti previsti** (`pianoAcquisti`): per ogni articolo senza spesa collegata, quantità = max(quantità in carrello, unità mancanti per lo scenario materiali *attivo*) × costo unitario. Un articolo non è mai contato due volte. Senza prezzo o quantità: escluso e conteggiato fra le “voci senza prezzo”.
- **Riserva imprevisti** = % del residuo. **Libero** = residuo − previsto − riserva.
- “Acquistato” crea una spesa e collega l'articolo (`spesaId`): esce dal previsto, entra nello speso. Eliminando la spesa l'articolo torna “da acquistare”.
- Casi di prova: 5.000 iniziali; +200 → residuo 4.800; ricevuta in quota da 200 → totale invariato; cambio scenario → cambia il previsto, non lo speso.

## Geometria — `verificaLayout(layout, geom)`
Rettangoli in pianta [mm]: x dai sedili al portellone, y da sinistra a destra (senso di marcia), z quota dal pianale.
- *Errore*: fuori dal vano, oltre l'altezza, sovrapposizione fra moduli (pianta e quote), invasione del corridoio riservato (in pianta e con z < altezza del corridoio).
- *Avviso*: sopra un passaruota (da sagomare), interferenza quando un modulo è aperto. L'estensione oltre il portellone non genera conflitti.
- *Nota*: dati mancanti → “non verificabile”.
- Bordi a filo non sono sovrapposizione. Passo di trascinamento 10 mm.
- Limiti: solo parallelepipedi allineati; nessuna verifica di resistenza, ancoraggio, baricentro, carichi per asse.

## Stratigrafie — `stratigrafia`, `fabbisogni`, `riepilogoScenario`
- Ingombro = Σ spessori. Massa = Σ kg/m² × copertura. R = Σ (R dichiarata, oppure spessore/λ).
- Strato con copertura < 100% non conta per R (semplificazione dichiarata). Strato “non termico” vale R = 0.
- R sconosciuta → elencata; il valore mostrato diventa “≥” (R) e “≤” (U).
- Termoriflettenti: nessuna equivalenza automatica; contano solo con una R dichiarata valida per la posa reale.
- Fabbisogno = Σ superficie zona × copertura × (1 + sfrido); unità = arrotondamento per eccesso su superficie per confezione; mancanti = necessarie − possedute. Zone senza superficie: escluse e dichiarate.

## Energia — `energia(profilo, sistema)`
- Consumo [Wh/g] = Σ W × h × ciclo ÷ rendimento (DC o inverter).
- Ricarica [Wh/g] = Wp × ore di sole equivalenti × rendimento solare + W in marcia × ore di guida + W rete × ore di rete.
- Utilizzabile = capacità × profondità di scarica × (1 − riserva). Autonomia [h] = utilizzabile ÷ (consumo − ricarica) × 24; ∞ se la ricarica copre il consumo.
- Capacità nominale necessaria per N ore = (netto × N/24) ÷ (scarica × (1 − riserva)).
- Utenza con potenza sconosciuta: esclusa e dichiarata (autonomia reale minore). Capacità sconosciuta → “non determinabile”.
- Non modella: spunti, temperatura, invecchiamento, ombre, limiti di corrente. Non dimensiona cavi né protezioni.

## Acqua — `acqua(profilo, serbatoi)`
Giorni = capacità ÷ litri/giorno prelevati da quel serbatoio (pulita o lavoro). Grigie = somma delle sole voci segnate.

## Termico — `termico(scenario, state, clima)`
Regime stazionario.
- U = 1 ÷ (0,13 + R strati + 0,04) [W/m²K] per ogni zona (resistenze superficiali convenzionali ISO 6946 per flusso orizzontale, applicate a tutte le superfici: semplificazione). Lamiera nuda ≈ 5,88.
- H = Σ U·A + vetri·U vetro. Intervallo: H × fattore ponti termici min…max (ipotesi dichiarate, modificabili).
- Ventilazione: 0,33 × portata [m³/h] [W/K]. Potenza = (H·f + Hv) × ΔT − persone × W/persona, minimo 0.
- Superficie o parametro mancante → **non determinabile** con elenco dei motivi.
- Esterno ≥ interno → nessuna potenza calcolata: serve raffrescamento attivo; il carico solare non è modellato.
- Non modella: sole, irraggiamento, inerzia, umidità/condensa, infiltrazioni.

## Carichi — `carichi`, `parseCarichi`
Somma massa × quantità per configurazione; voci senza massa elencate, mai contate zero. Importazione CSV (`;` o `,`, virgola decimale ammessa) o JSON: le righe errate sono segnalate, il file non valido non modifica nulla.

---
# Aggiunte della seconda fase (novembre 2026)

## Geometria: stati, base fissa, vano finito
- `vanoFinito(geom, scenario, state)`: limiti dopo i rivestimenti = lamiera − spessori della stratigrafia (pareti per lato, pavimento, soffitto, portellone). x,y dei moduli restano riferiti alla lamiera; z al pavimento finito.
- `verificaLayout(layout, geom, { base, stato, finito })`: `base` = moduli fissi presenti in ogni configurazione. Con `stato` i moduli elencati contano con l'ingombro APERTO e ogni urto è un errore; senza stato si verifica a moduli chiusi e si avvisa per ogni coppia che interferisce con uno o con ENTRAMBI aperti. Nessun ritaglio al portellone: due estraibili possono urtarsi anche fuori. Il corridoio si verifica sempre a modulo chiuso (serve in viaggio).

## Energia: simulazione oraria — `simulaEnergia(profilo, sistema, ore, extra)`
Passo 1 h. Utenze con `da` lavorano per `ore` ore consecutive, le altre sono distribuite sulle 24 h. Sole: campana (seno) centrata alle 12:30 larga `oreLuce`, totale giornaliero = Wp × ore di sole × rendimento. Guida e rete: finestre. Ricarica limitata da `maxCarica_W`.
Livello minimo = capacità − capacità × scarica × (1 − riserva): sotto, le utenze non sono servite (energia non servita); sopra la capacità la ricarica è sprecata. Bilancio verificato nei test: E_iniziale + ricarica − consumi + non servita − sprecata = E_finale.
Picco = somma delle potenze (o `picco_W`) delle utenze attive nella stessa ora, confrontato con `maxUscita_W`.
**Verdetto**: `non_raggiunto` se capacità ≤ 0, energia non servita > 0 o picco oltre il limite; `non_definitivo` se ci sono utenze ignote o il limite non è noto; `non_determinabile` senza capacità; altrimenti `raggiunto`. `energia()` (bilancio medio) resta come orientamento: con utenze ignote l'autonomia è un massimo, con energia utilizzabile nulla è zero.
Non modella: rendimento di carica, temperatura, spunti sotto l'ora, ombre, meteo variabile.

## Dal termico ai consumi — `consumiApparecchio(P, app, ore)`
Tre grandezze distinte: energia termica = P × ore; combustibile [l/h] = P ÷ (rendimento × kWh/l × 1000); elettricità = assorbimento minimo + (massimo − minimo) × P/Pmax (interpolazione lineare: ipotesi). Apparecchio elettrico: elettricità = P ÷ rendimento (COP). Parametro mancante → quella grandezza è non determinabile. L'elettricità all'estremo ALTO del fabbisogno entra da sola fra le utenze del profilo (`utenzeTermiche` in `views/sim.js`); se il termico non è determinabile l'utenza resta ignota e blocca il verdetto positivo.
Raffrescamento: `termico()` restituisce `componenti`: note (conduzione, ventilazione, persone) e mancanti (sole, umidità, infiltrazioni, apparecchi, inerzia). La somma delle note è presentata come minimo, mai come fabbisogno.

## Progetto — `applicaProgetto`, `partiProgetto`
Il progetto attivo imposta quale stratigrafia e quale sistema elettrico sono `attivo` (quindi nel previsto). Non scrive mai in spese o inventario.

## Piano acquisti (correzione)
Un articolo con spesa collegata non è più "in carrello", ma se lo scenario attivo ne richiede più di quanto posseduto la differenza resta da comprare.

## Percorso — `percorso(state, oreSessione)`
Eseguibile = non concluso e senza dipendenze aperte. Materiali collegati: `ok`, `manca` (non posseduto o quantità insufficiente), `da_verificare` (posseduto, quantità ignota). Ore residue = stima − ore delle sessioni registrate; sessioni = arrotondamento per eccesso su `oreSessione`. Sequenza: ordinamento topologico, a parità per priorità; i "?" non valgono zero; cicli di dipendenze segnalati. Il fermo cumulato somma i fermi come consecutivi (massimo, non pianificazione).

Con utenze ignote, il deficit dei soli carichi conosciuti dà un limite superiore alle ore di autonomia. Se quei carichi sono coperti dalla ricarica, il limite utile è indeterminabile.
