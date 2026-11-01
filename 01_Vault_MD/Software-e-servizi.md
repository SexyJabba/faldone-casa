# Software e servizi

[[REV3-SRV]] · [[START]]


# REV3-SRV · Servizi: collocazione e dipendenze

| Servizio | Sede | Pubblico | Condizione |
| --- | --- | --- | --- |
| Nextcloud, Vikunja, n8n | M2 -> C4 in subentro | Personale | HA con repliche complete; accesso privato, non pubblicazione generale |
| Immich, Paperless, Syncthing, SMB/NFS, Tandoor, Stirling, HomeBox, Grocy, Firefly | M2 | Personale/interno | Immich puo attendere M2; non tutti i servizi sono HA |
| Open WebUI e backend LLM/VLM | M2 interfaccia / M3 calcolo | Personale | M3 inferenza su conferma o coda; priorita utente > agenti > fondo |
| Windows / Steam / Sunshine | MP3 Acer Aspire 7 | Client fidati | RTX3050 Ti 4 GB e 16 GB, fuori cluster; Hermes alternato al gioco |
| Home Assistant OS e MQTT separato | M5 -> C3 in subentro | Interno/personale | RPO5 min; RTO5 min; radio fisica su S3 |
| Zigbee2MQTT / Sonoff ZBDongle-P | S3 Wyse | Interno IoT | Binding diretto dove compatibile; radio indipendente da M5 |
| Frigate, Hailo-8, vision-gateway, go2rtc | M5 | Interno | 4 camere eventi 7 giorni; sei future; Hailo/registrazioni non HA |
| Jellyfin / Arc A310 | M6 | Altri utenti autorizzati | Ingresso Caddy; richiesta visione risveglia M4 se file remoto |
| Navidrome, Audiobookshelf, Snapcast | M6 | Locale/personale | Copie locali quotate; Snapcast solo LAN |
| Seafile | M6 | Altri utenti autorizzati | 10 utenti x50 GB; mirror WD10EZRX; nessun backup aggiuntivo |
| Downloader e arr | M6 | Solo interno | Container e permessi separati; scansioni limitate; niente automatismi extra |
| Backup WD e condivisioni media | M4 | Solo interno | Backup personali18:00; niente mount WD da M6; media RO e import separati |
| Caddy, Vaultwarden, ntfy, Kuma, Beszel, IT-Tools, dashboard | S1 | Per servizio | Proxy ingressi ammessi, gestione privata; Vaultwarden non sulla VPS |
| Sentinella indipendente e WoL | S4 | Gestione interna | Nessun voto; C4 secondo mittente |
| Controllo esterno e tunnel/relay | S2 Oracle | Esterno complementare | Non voto cluster, non replica automatica, nessun Vaultwarden |
| OpenClaw | MP3 Acer fisso laboratorio | Personale | Windows come ambiente operatore; runtime/permessi da validare; fuori cluster |
| Hermes | MP3 Acer fisso laboratorio | Personale | Ambiente e carichi separati da gioco/OpenClaw; M3 su conferma o coda |
| Gemini / Google AI Pro | Account lavoro; postazioni autorizzate | Personale/lavoro | Voce, Sheets e Calendar; nessun percorso dispositivo unico |
| Client Jellyfin offline | Due HP t520 esterni | Due amici | Ethernet, identita limitate, USB offline; nessun accesso ai backup |
| Dashboard ingresso | Microtech EBL14B | Locale/personale | Pannello citofono/allarme, fuori quorum |
| Zabbix / metriche e log | M1 VM separata; S4 controllo minimo; S2 esterno candidato | Gestione interna | 2 vCPU / 4-8 GB iniziali; quote disco; nessuna telemetria gia attiva |
| Documenti offline, rapportini e dashboard Vito | C1 / LTE / cloud di lavoro | Mobile e lavoro | 8 GB; sincronizzazione differita, nessuna dipendenza del veicolo dal quorum |

L'infrastruttura e organizzata per durata e dipendenze: nucleo sempre disponibile, calcolo e media accendibili, servizi mobili localmente utili. Il Vito usa M3 soltanto per richieste differibili o esplicite; Gemini e account lavoro non diventano una API gratuita o una procedura di salvataggio gia eseguita.

M2 mantiene i servizi personali; M1 accoglie solo osservazione e strumenti leggeri separati dal firewall. M3 esegue i lotti pesanti. Hailo su M5 e Arc su M6 servono ruoli diversi. Nessun Coral viene aggiunto. [[REV4-RAM]] · [[REV4-MON]] · [[REV4-VLAV]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
