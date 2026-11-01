---
codice: "INF-03.15"
titolo: "Immich: ML nativo e pre-analisi separata"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-03.15 · Immich: ML nativo e pre-analisi separata

Immich risiede su M2 e mantiene originali, metadati, database e il proprio servizio ML. La documentazione ufficiale dei backend ML consultata non elenca Hailo: il faldone non dichiara quindi accelerazione Hailo nativa. Le versioni applicative e i backend effettivi restano proprietà del registro.

vision-gateway espone una pre-elaborazione separata: classificazione, detection oggetti e metadati visivi possono accompagnare una configurazione di album/tag o selezionare gli elementi per M3. Le capacità dipendono dal catalogo modelli. Il rilevamento volti, ove disponibile nel modello, non equivale a identificazione delle persone; il riconoscimento facciale automatico iniziale è disabilitato.

Gli output del ponte restano derivati associati all’originale. Non si riscrivono o spostano file nella libreria interna per aggirare le API. Modifiche a tag, album e destinazioni richiedono conferma, con account e scope adeguati. Il confronto con l’ML nativo usa qualità, tempi e costo su un campione comune: nessun vantaggio Hailo è presunto per qualsiasi task.

Con ponte o M3 indisponibile, archivio e funzioni native Immich rimangono il percorso di base. Foto personali e allegati aziendali non condividono automaticamente cataloghi, permessi o dati di apprendimento.

Fonte: https://docs.immich.app/features/ml-hardware-acceleration/

## Collegamenti

[[START]] · [[REV3-VIS]] · [[REV3-SRV]] · [[REV3-MAP]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
