---
codice: "INF-03.06"
titolo: "S1-S4: utilita, radio e testimone"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-03.06 · S1-S4: utilita, radio e testimone

| Nodo | Piattaforma | Funzione | Indipendenza |
| --- | --- | --- | --- |
| S1 | Q1900M, 8 GB | Caddy, Vaultwarden, notifiche, monitoraggio e utilita | Fuori cluster; Vaultwarden non replicato sulla VPS |
| S2 | Oracle Always Free, A1 | Osservazione esterna, relay e ridondanza selettiva | Piano da attivare; nessun voto o replica implicita |
| S3 | Wyse 3030, 4/32 GB  | Sonoff ZBDongle-P / Zigbee2MQTT; dashboard leggera | Fuori cluster base; radio separata dal processo browser |
| S4 | Wyse 3030, 4/32 GB  | Sentinella e primo WoL, senza voto | Fuori Proxmox; C4 secondo mittente |

I due HP sono dedicati ai client esterni; i ruoli radio/testimone passano ai Wyse prima della consegna. S3 mostra una pagina essenziale di Home Assistant servita da M5/C3; il carico grafico non deve saturare radio e sistema. Non e un nuovo host HAOS. S4 non e una destinazione dei guest per il solo fatto di svolgere il ruolo di sentinella e WoL senza voto. L'indipendenza di rete IoT resta conforme a [[REV3-RET]].

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-OPEN]] · [[REV3-DIFF]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
