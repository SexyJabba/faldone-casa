---
codice: "INF-08.04"
titolo: "Triage e contenimento"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-08.04 · Triage e contenimento

| Evento | Disponibile | Assente o limitato |
| --- | --- | --- |
| M1 fermo | Famiglia/mesh e funzioni nella stessa rete locale | Routing privato, DNS M1 e accesso remoto; subentro M7 manuale |
| M2 fermo | M3 locale, M5 domotica/video, M6 media locali/cloud, S1 | Applicazioni e dati primari M2, Hermes, Nextcloud |
| M3 spento | M2/S1, domotica e video M5, M6 e backup M4 se acceso | Windows e inferenza VLM/LLM locale |
| M4 spento | M6 download/cloud/musica locale; M5 e M2 | Media solo su M4, import remoti e nuove copie WD |
| M5 fermo | M2 applicazioni, M3, M6, S1 | Home Assistant, Frigate, Hailo/gateway e avvisi LTE M5 |
| M6 fermo | M2 personale, M5, S1, M4 dati se acceso | Jellyfin, cloud utenti, player server, download/arr |
| S1 fermo | Accesso diretto autorizzato e osservazione S2 | Caddy, Vaultwarden e utilita locali |
| WAN domestica assente | Domotica/video e file locali; famiglia secondo propria linea | Servizi remoti domestici; LTE M5 solo se operativo |
| MP3 Acer spento o riavviato | Cluster, domotica e client restano indipendenti | Agenti locali assenti fino alla ripresa; nessun Air M1 richiesto |
| MP3 sospeso o fuori rete | Cluster,domotica e OpenClaw MP1 | Windows/Hermes/Sunshine fino alla ripresa |

L’intervento contiene il servizio o il guest interessato prima del riavvio host. Log, stato dei pool, seriali ed errori sono conservati nel registro incidente. Un pool ONLINE non spiega da solo un errore PCIe; il recupero distingue board, HBA, cavo e supporto.

- Evento e nodo: ____
- Contenimento e risultato: ____
- Evidenze e residui: ____

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
