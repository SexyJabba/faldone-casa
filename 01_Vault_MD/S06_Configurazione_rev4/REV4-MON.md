---
codice: "REV4-MON"
titolo: "Osservabilita: capire prima di intervenire"
revisione: "4.4"
aggiornato: "2026-11-01"
---

# REV4-MON · Osservabilita: capire prima di intervenire

M1 ospita una VM separata con Zabbix come piattaforma configurazione: 2 vCPU e 4-8 GB iniziali, non una telemetria gia attivata. OPNsense conserva risorse per il traffico; raccolta log e metriche hanno quote disco e conservazione definite. Un guasto della VM di osservazione non deve interrompere la rete.

## Controlli che servono

- Raggiungibilita router, Internet, DNS e applicazioni per separare le cause.
- Memoria sotto pressione, swap, CPU, temperature dove esposte e latenza dischi.
- Spazio utile e stato ZFS/SMART; ARC hit/miss e beneficio delle letture ripetute.
- Eta dell'ultimo backup riuscito, errori, quota Drive e supporti offline da aggiornare.
- Rete: errori porte, link negoziati, perdita pacchetti e banda, solo dove apparati/agent espongono i dati.
- Stato del nucleo e repliche: quorum, guest necessari e ritardo effettivo.

OPNsense Insight/NetFlow fornisce visibilita del traffico che attraversa il firewall. Traffico locale sullo switch richiede contatori o esportazioni da quell'apparato; nessuna cattura totale implicita. Prometheus/Grafana e un'alternativa successiva, non un secondo stack obbligatorio.

## Avvisi con contesto

Distinguere acceso atteso, spento intenzionalmente, manutenzione, non raggiungibile e guasto confermato. M3/M4/M6 spenti su richiesta non generano una raffica di allarmi. Il Vito fuori copertura mostra ultima comunicazione, non una falsa diagnosi. Allarmi dopo persistenza e raggruppati per causa; segnalare anche recupero.

S4 esegue un controllo minimo indipendente del nodo M1 e puo inviare WoL; C4 e mittente alternativo. S2 esterno candidato controlla heartbeat/casa attraverso un percorso autenticato. Se tutta la WAN cade, l'avviso non puo dipendere soltanto dalla stessa WAN.

Collaudo: fermare un servizio di prova, interrompere una sorgente controllata, simulare backup vecchio e verificare messaggio e recupero. Nessun controllo distruttivo automatico sui dati. La dashboard del faldone e documentazione statica, non la console Zabbix reale.

[Zabbix SNMP](https://www.zabbix.com/documentation/current/en/manual/config/items/itemtypes/snmp) · [OPNsense NetFlow](https://docs.opnsense.org/manual/netflow.html)

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
