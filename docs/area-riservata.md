# Area riservata

Le parti più sensibili del Faldone (oggi: la planimetria di casa) sono pubblicate **solo cifrate**. Il repository e il sito sono pubblici: senza la password contengono testo illeggibile.

## Come è fatta

| Che cosa | Dove |
|---|---|
| Contenuto cifrato (unica copia durevole dei dati riservati) | `content/riservato/riservato.enc.json` |
| Copia pubblicata dalla build, identica | `data/riservato.json` |
| Cifratura e apertura (browser e Node, WebCrypto) | `app/lib/vault.js` |
| Controlli sul contenuto in chiaro prima di cifrare | `tools/lib/riservato.mjs` |
| Strumento a riga di comando | `tools/riservato.mjs` |
| Modulo di sblocco e pagina `#riservato` | `app/views/vault.js` |

- Chiave: PBKDF2-HMAC-SHA256, 600.000 passaggi, sale casuale di 16 byte. Cifratura: AES-256-GCM, vettore casuale di 12 byte nuovo a ogni scrittura. Un contenuto alterato o una password sbagliata danno lo stesso esito: non si apre.
- Il contenitore ha un **indice pubblico** (`index`): dice quali impianti ed elementi hanno una parte riservata, non che cosa contiene. Serve al sito per mostrare il lucchetto al posto giusto.
- Nel sito la password non viene mai conservata. Dopo lo sblocco la chiave derivata resta nella scheda del browser (`sessionStorage`); con «Ricorda su questo dispositivo» anche in `localStorage`, finché non si sceglie «Blocca adesso». Dopo un cambio di password le chiavi ricordate smettono di funzionare e il sito richiede la nuova.

## Che cosa contiene il file in chiaro

```json
{
  "v": 1,
  "impianti": { "planimetria": { "status": {}, "summary": "…", "plan": { "rooms": [] } } },
  "entita": { "M2": [ { "label": "Indirizzo di gestione", "value": null, "note": "da assegnare" } ] }
}
```

- `impianti.<id>`: si sovrappone alla scheda pubblica dell'impianto, che in `content/impianti/impianti.json` deve avere `"riservato": true` e nessun dato sensibile (solo titolo, riassunto generico, collegamenti).
- `entita.<id>`: righe «etichetta, valore, nota» mostrate in fondo alla scheda dell'elemento dopo lo sblocco. È il posto per indirizzi, VLAN, porte, numeri di serie quando verranno decisi. Un dato non noto resta `null`: non si inventa.

## Comandi

```sh
node tools/riservato.mjs genera                                                      # propone una password casuale
FALDONE_PASSWORD=… node tools/riservato.mjs decifra > /fuori/dal/repo/riservato.json  # leggere
FALDONE_PASSWORD=… node tools/riservato.mjs cifra /fuori/dal/repo/riservato.json      # aggiornare, poi node tools/build.mjs
FALDONE_PASSWORD=… FALDONE_PASSWORD_NUOVA=… node tools/riservato.mjs cambia           # cambiare password
```

Una password sotto i 12 caratteri è rifiutata; il proprietario può imporla aggiungendo `--corta` (minimo assoluto 8), sapendo che il file cifrato è pubblico e che una password breve o comune si può indovinare per tentativi.

`cifra` rifiuta un file in chiaro che si trovi dentro il repository e rifiuta di sovrascrivere un contenuto che la password indicata non apre.

## Regole

- La password e i dati in chiaro **non entrano mai nel repository**: né nei sorgenti, né nei test, né nei messaggi di commit, né negli screenshot in `docs/`.
- Per spostare una sezione nell'area riservata: togliere i dati dalla scheda pubblica, aggiungerli al file in chiaro, cifrare, ricostruire. Il test `tools/test/riservato.test.mjs` controlla che nei file pubblici non restino tracce.
- **Ciò che è già stato pubblicato resta nella cronologia Git.** Cifrare oggi una sezione che era pubblica ieri non la toglie dalle versioni precedenti: per quello serve riscrivere la cronologia (decisione del proprietario).

## Limiti

- La protezione vale quanto la password: il file cifrato è pubblico e chi lo scarica può provare password senza limiti sul proprio computer. Serve una password lunga, non usata altrove.
- Una sola password per tutta l'area: non ci sono livelli diversi per persone diverse.
- Le versioni precedenti del file cifrato restano nella cronologia, cifrate con la password di allora.
- Non è un controllo d'accesso del server: nasconde il contenuto, non l'esistenza delle sezioni.
