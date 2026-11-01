---
codice: "INF-03.38"
titolo: "Paperless: OCR ufficiale e derivati visivi"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-03.38 · Paperless: OCR ufficiale e derivati visivi

Paperless-ngx su M2 mantiene il proprio OCR ufficiale basato su OCRmyPDF/Tesseract come riferimento funzionale. Documento originale, testo OCR, metadati e versioni restano associati. Nessuna dipendenza Hailo è necessaria alla normale acquisizione documentale.

vision-gateway fornisce un percorso aggiuntivo per localizzazione del documento, separazione di regioni testo/immagine, pre-classificazione e OCR preliminare soltanto se esiste un modello compatibile. L’etichetta Hailo non dichiara supporto di OCR generico o equivalenza con Tesseract.

Il confronto conserva separati output ufficiale, output del ponte e correzioni proposte. I campioni includono italiano, tabelle, codici prodotto, numeri, date e fotografie di cantiere. La velocità non compensa l’alterazione di una cifra o di un codice. Se qualità o capacità mancano, il flusso mantiene l’OCR ufficiale e segnala l’incertezza.

OpenClaw e Hermes propongono archivio, tipo documento, tag e destinazione. Una conferma esplicita precede la scrittura definitiva tramite le API autorizzate; una quarantena non coincide con la cartella di consumo automatico Paperless. Originali e derivati non vengono cancellati dal risultato di un modello.

Fonti: https://docs.paperless-ngx.com/setup/ e https://docs.paperless-ngx.com/configuration/

## Collegamenti

[[START]] · [[REV3-VIS]] · [[REV3-SRV]] · [[REV3-MAP]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
