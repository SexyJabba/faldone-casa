---
codice: "INF-09.04"
titolo: "Protocolli e versi dei collegamenti"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-09.04 · Protocolli e versi dei collegamenti

**Perimetro:** Riferimento operativo per protocolli e versi dei collegamenti. Parametri e procedura da confrontare con gli apparati reali.

| Percorso | Protocollo / controllo |
| --- | --- |
| Client → app M2 | HTTP/HTTPS sulla porta dell’app o sul proxy; account e regole per segmento. |
| Client → SMB | TCP 445 nel profilo autorizzato; nessuna scrittura al pool dal client generico. |
| Client → Sunshine Windows | TCP e UDP secondo versione/configurazione Sunshine; elenco effettivo nella scheda R-06. |
| Windows → server USB stanza | VirtualHere usa TCP 7575 come default; confermare configurazione, licenza e protezioni. [RIF-CL-22] |
| M2 → backend IA M3 | Tunnel verso endpoint interni 8080 modello, 8081 voce, 8184 bridge workflow nel profilo storico; nuova VM R-06. |
| Client / CT → RAG | Servizio interno 8183 nel profilo storico; ingresso autorizzato e binding da riconciliare. |
| CT 121 → ML Immich | Tunnel dedicato a backend loopback 3003; non un ingresso per TV e telefoni. |
| M4 → M2 | SSH per replica pull con permessi limitati ai dataset assegnati. |
| HA ↔ MQTT / dispositivi | Broker, utenti/topic e porte della configurazione adottata; niente attraversamento universale. |
| Tailscale → VLAN 10 | Profilo 122: TCP e DNS autorizzati; UDP Moonlight richiede regole aggiuntive. |

Discovery, mDNS e broadcast sono distinti dal collegamento IP esplicito. Per Sunshine e USB fra reti usare indirizzi stabili, poi autorizzare i flussi effettivi. Non aprire intervalli generici senza confrontarli con la versione installata.

| <b>Legenda degli schemi</b><br/>Linea verde: dati o copie. Linea del colore del settore: collegamento funzionale. Grigio prugna tratteggiato: controllo o coordinamento. Oliva: alimentazione. Gli schemi t520/Dell usano linee grigie con etichette. Le frecce indicano il verso principale; le risposte di un protocollo non sono disegnate una per una. |
| --- |

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
