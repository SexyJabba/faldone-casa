# Integrazioni in sola lettura

Stato: **nessun connettore collegato**. Nel sito ogni stato osservato è «non rilevato». Quanto segue è contratto, adapter di riferimento e prove con dati di test; non è una connessione funzionante.

## Flusso

```
servizi interni (Zabbix, Proxmox, Home Assistant, report backup)
   → adapter su un server autorizzato della rete di casa (tools/adapters/*.mjs)
   → istantanea normalizzata JSON (schema faldone-osservazione/1)
   → pubblicata in un'area privata con autenticazione verificata sul server
   → il sito la mostra solo a chi è autorizzato, con data e scadenza
```

Mai token nel browser, negli URL, nel bundle o nel repository. Mai interrogazioni che sveglino i server a richiesta: l'adapter interroga il sistema di monitoraggio, non gli host.

## Istantanea

```json
{ "schema": "faldone-osservazione/1", "connector": "CN-ZABBIX", "generatedAt": "…", "staleAfter": "…",
  "state": "connesso", "readOnly": true,
  "items": [{ "entityId": "M2", "observation": "disponibile", "at": "…", "source": "zabbix" }] }
```

`observation`: `disponibile`, `degradato`, `indisponibile`, `spento` (a richiesta), `non_rilevato`, `scaduto`. Gli host non mappati esplicitamente vengono ignorati. Un'istantanea scaduta o un errore di rete si mostrano come tali (`freshness()`), mai come «tutto bene».

## Registro

`content/model/connectors.json` (pagina **Realizza → Connettori**): sorgente, scopo, dati letti, stato, frequenza, cache, scadenza, autorizzazioni, sola lettura, cosa è implementato. Fonte preferita: Zabbix su M1, invece di dieci interrogazioni dirette.

## Sicurezza dell'adapter

- Destinazione solo `https` e solo host nell'elenco `FALDONE_ALLOWED_HOSTS`: non è un proxy generico.
- Timeout di 10 s, nessun metodo di scrittura, nessun comando verso gli host, nessun Wake-on-LAN.
- Credenziali minime (utente API in sola lettura) nell'ambiente del server.

## Che cosa manca per attivarlo (decisione del proprietario)

1. Un server autorizzato che esegua l'adapter (per esempio S1 o la VM di osservazione su M1) quando Zabbix sarà installato (attività A-2.3).
2. Un'area privata con autenticazione lato server per pubblicare l'istantanea: oggi il sito è solo pubblico e non simula protezioni con password nel JavaScript.
3. La mappa esplicita host Zabbix → ID del Faldone.

Comandi reali (accensione, manutenzione) sono un'estensione separata da progettare: richiederebbero area privata, autorizzazione sul server, protezione CSRF e registro degli esiti.

## Assistente documentale

Non implementato: nessun backend né fornitore autorizzato. La ricerca è completa e indipendente dall'IA. Contratto per un'eventuale integrazione: recupero solo da `data/search.json` e `data/schede/*.json` (contenuti pubblici), citazioni con codice e revisione, risposta «non lo so» senza fonti, istruzioni nei documenti trattate come dati, nessun accesso amministrativo, nessun invio automatico di contenuti privati.
