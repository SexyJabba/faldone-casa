# Checkpoint di lavoro

Ultimo aggiornamento: 2 novembre 2026. Ramo: `claude/new-session-itt67j`.

## Stato

Fasi A–E completate per il nucleo pubblico: migrazione, modello, build, interfaccia, simulatore, ricerca, roadmap, costi, collaborazione, offline, verifiche. Vedi `docs/requisiti.md` per l'esito di ogni criterio.

**Push non riuscito**: il remoto ha risposto 403 (l'app GitHub di Claude non ha accesso a `SexyJabba/faldone-casa`). I commit sono nel ramo locale della sessione; vanno spinti quando l'accesso è ripristinato.

## Comandi per riprendere

```sh
git checkout claude/new-session-itt67j
node tools/build.mjs && node --test tools/test/*.test.mjs     # 49 test
python3 -m http.server 8811 --bind 127.0.0.1 &
node tools/e2e/smoke.cjs                                      # 51 rotte
AXE=…/axe-core/axe.min.js node tools/e2e/a11y.cjs              # axe + tastiera
```

## Problemi noti

- Push bloccato (vedi sopra). Pubblicazione in produzione non eseguita per mandato.
- Percorsi locali con email presenti nella cronologia Git del vecchio `assets/data.js`: rimuoverli richiede riscrivere la storia (decisione del proprietario).
- A01 e comprensibilità: solo revisione euristica, nessun test con persone.
- Offline con service worker non provato in modalità aereo reale.

## Decisioni aperte per il proprietario

1. OpenClaw su MP3 o MP1? Hermes dipende da M2? (I-OPENCLAW, I-HERMES-M2)
2. La «copia SH1» del P310: quale supporto è davvero? (I-P310-SH1)
3. Meccanismo dell'accesso remoto personale (Q-ACCESSO).
4. Cifratura del deposito su Drive (DEC-CRYPT) e topologia del pool media (DEC-M4-MEDIA).
5. Area privata e connettori: dove far girare l'adapter e come autenticare.

## Prossime azioni possibili

- Registrare i primi collaudi in `content/model/test-results.json` man mano che la roadmap avanza.
- Completare la mappa porte RJ45 quando decisa.
- Collegare Zabbix all'adapter quando installato (attività A-2.3).
