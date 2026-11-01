---
codice: "INF-05.03"
titolo: "Video, audio e collegamenti delle postazioni"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-05.03 · Video, audio e collegamenti delle postazioni

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


Vito: alimentazione e schermo USB-C descritti in [[REV3-MOB]]. Cucina: possibilita multi-monitor conservata, monitor e cavi identificati nel registro della postazione. Studio: Wyse al Behringer CONTROL2USB; Hi-Fi salone: Wyse distinto dal Dell video, DAC ES9038Q2M USB. Synergy disponibile per tastiera/mouse, senza presumere trasporto video. Il gioco Windows e sull’Acer fisso in laboratorio; M3 resta IA. [[REV3-HA]] riporta la verifica grafica dei client virtualizzati C3/C4.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-OPEN]] · [[REV3-DIFF]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
