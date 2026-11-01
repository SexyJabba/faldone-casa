---
codice: "INF-05.21"
titolo: "Client Dell, HP e postazioni"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-05.21 · Client Dell, HP e postazioni

| Postazione | Hardware | Funzioni | Rete / vincolo |
| --- | --- | --- | --- |
| Laboratorio principale | MP3 Acer Aspire 7 | Windows lavoro/gioco, Sunshine e ambienti agenti | Sempre fisso; fuori cluster |
| Laboratorio media | Wyse 3030 | Jellyfin, musica e pannello casa | Client distinto da Acer; Ethernet |
| Vito W639 | C1 / 7070 Ultra di riferimento | Lavoro, dashboard veicolo/camper, diagnostica Mercedes | LTE dedicato; power station servizi; fuori quorum |
| Cucina | C2 / 7070 Ultra | Streaming, dashboard e possibilita multi-monitor | Fuori cluster base; candidato estensione |
| Camera | C3 / 7070 Ultra | Client Linux e subentro HAOS/MQTT | Proxmox; 16 GB base di progetto |
| Salone video | C4 / 7070 Ultra | Client Linux e subentro Nextcloud/Vikunja/n8n | Proxmox; 16 GB base; secondo WoL |
| Studio | Wyse 3030 | Monitor e audio verso Behringer CONTROL2USB | Client fidato separato |
| Salone Hi-Fi | Wyse 3030 | Audio verso DAC ES9038Q2M USB | Client distinto dal Dell video |
| Ingresso | Microtech EBL14B | Pannello citofono/allarme; display e batteria riusati | Fuori quorum; audio/video e batteria n.d. |
| Due amici | Due HP t520 | Jellyfin online/offline USB, solo Ethernet | Identita individuali limitate; classificazione CE |
| Radio casa | S3 / Wyse 3030 | Zigbee2MQTT/Sonoff e dashboard leggera | Autonomo rispetto a M5 |
| Sentinella | S4 / Wyse 3030 | Sentinella e primo WoL, senza voto | Fuori Proxmox |

Tutti e quattro i 7070 e tutti e cinque i Wyse hanno una destinazione. I due HP sono client per due amici, non per fratello e padre, che accedono gia con altri dispositivi. I codici C1-C4 mantengono il riferimento progettuale: C1 passa dal laboratorio al Vito; la corrispondenza con gli esemplari fisici viene riscontrata prima delle etichette. Per i nuovi Wyse client e per il Microtech restano campi di codice/seriale n.d., senza riutilizzare vecchi codici di altri dispositivi.

C3/C4 mantengono Proxmox e client Linux separato, risorse prioritarie ai servizi essenziali e schermi spegnibili senza fermare gli host. 16 GB ciascuno sono la base di progetto, non un upgrade gia installato. Capacita SSD e grafica/decodifica nel guest restano n.d.. Il Dell cucina preserva l'uso multi-monitor; Vito e portatili non sostituiscono voti domestici.

Le licenze Synergy 3 Max, 2 Pro e 1 Pro dichiarate disponibili sono una possibilita per condividere tastiera/mouse fra postazioni; i collegamenti video si definiscono separatamente. Non e fissato un solo modo per alternare voce, display e computer. Dettagli nelle schede [[REV3-MOB]], [[REV3-EXT]], [[REV3-AGN]] e [[REV3-CLX]].

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-OPEN]] · [[REV3-DIFF]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
