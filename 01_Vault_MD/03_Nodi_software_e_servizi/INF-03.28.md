---
codice: "INF-03.28"
titolo: "Home Assistant, MQTT e radio indipendente"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-03.28 · Home Assistant, MQTT e radio indipendente

S3 Wyse t520 con 4 GB PC3L-12800S e Apacer M.2 8 GB esegue Linux e Zigbee2MQTT, con Sonoff ZBDongle-P USB. S3 e esterno al cluster e fisicamente distinto dal testimone S4. MQTT e un guest separato M5 con replica/subentro C3; HomeAssistantOS ha proprio guest e stesso subentro preferito.

Con M5 guasto, la radio S3 e la rete IoT restano raggiungibili ma broker/HA si interrompono fino al recupero C3. Comandi Zigbee diretti restano dove i dispositivi supportano binding configurato; non tutte le automazioni HA diventano binding. Con S3 guasto il coordinatore e singola dipendenza: non promettere subentro radio automatico. Configurazioni echiavi radio hanno copia di recupero; nessun secondo coordinatore inventato.

Il collegamento C3 passa su Ethernet e percorsi VLAN autorizzati indipendenti da M5. Stesso AP non equivale a stessa VLAN; il Wi-Fi non e un bridge automatico di VMProxmox. Spazioflash8 GB per sistema/log/aggiornamenti va verificato, senza upgrade preventivo.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-MAP]] · [[REV3-OPEN]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
