# Vito — Officina e Camper

App personale, in italiano, per il ripristino del Mercedes Vito W639 e il suo allestimento modulare lavoro/camper.
Web app statica: nessuna installazione, nessuna dipendenza, nessuna API a pagamento. I dati restano nel browser del dispositivo.

## Avvio (Mac)
- Doppio clic su **`avvia.command`** → si apre `http://localhost:8642`.
  (La prima volta macOS può chiedere conferma: tasto destro → Apri.)
- In alternativa, da Terminale nella cartella: `python3 -m http.server 8642`.
- Serve solo Python 3, già presente. Non aprire `index.html` con doppio clic: i moduli JavaScript richiedono il piccolo server.

## Telefono
| Cosa | Come | Limite |
|---|---|---|
| Consultare/usare in officina | Stessa Wi‑Fi del Mac: apri l'indirizzo `http://IP-del-Mac:8642` mostrato da `avvia.command` | Il Mac deve restare acceso. **Niente offline** sul telefono in questa modalità (i browser lo consentono solo su HTTPS o localhost). |
| Offline sul telefono | Carica la cartella così com'è su uno spazio web HTTPS tuo; apri una volta la pagina e “Aggiungi a Home” | Da fare; non provato. I dati NON finiscono sul sito: restano nel telefono. |
| Passare i dati fra dispositivi | Dati → *Scarica backup* su uno, *Ripristina da backup* sull'altro | Manuale. Il ripristino sostituisce tutto: usa un dispositivo alla volta. Non esiste sincronizzazione. |

## Backup e ripristino
Sezione **Dati**: *Scarica backup completo* produce un file `.json` con tutti i dati, foto e documenti.
*Ripristina da backup* lo ricarica (sostituisce i dati presenti; i file non validi vengono rifiutati senza toccare nulla).
Fai un backup dopo ogni giornata di lavoro: cancellare i dati del browser cancella anche l'archivio.

## Cartella
```
index.html, css/app.css      interfaccia
js/app.js                    avvio e navigazione
js/store.js                  archivio locale (IndexedDB), backup, foto
js/seed.js                   DATI INIZIALI del progetto (veicolo, lavori, materiali, fonti, rilievi…)
js/calc.js                   tutti i calcoli (funzioni pure, provate da tests/)
js/ui.js                     elementi comuni (moduli di modifica, etichette, foto)
js/views/*.js                una sezione per file
sw.js, manifest.webmanifest  copia offline e installazione
tests/calc.test.mjs          prove: `npm test` (serve Node, solo per sviluppare)
dati/carichi-esempio.csv     modello per importare la lista carichi
docs/                        MODELLI, VERIFICHE, STATO, CONSEGNA, FONTI
```

## Regole dell'app
- Ogni dato ha un'attendibilità: *dichiarato, documentato, ipotesi, misurato, da verificare*.
- Un dato sconosciuto resta vuoto e viene segnalato: non diventa zero.
- Le simulazioni non sono collaudi; la verifica geometrica non certifica resistenza né omologazione.
- Coppie, sezioni dei cavi, fusibili e portate non sono nell'app: si prendono dalla documentazione del costruttore.
