---
codice: "INF-05.30"
titolo: "Client esterni HP: online e offline"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-05.30 · Client esterni HP: online e offline

I due HP t520 sono dispositivi CE per due amici esterni alla rete fidata. Fratello e padre usano gia altri dispositivi dalla rete Sky. Gli HP sono privi di Wi-Fi per scelta di questo uso: Ethernet, LibreELEC e interfaccia semplice. Hanno 4 GB RAM e Apacer M.2 8 GB; la memoria USB ospita i contenuti precaricati.

| Funzione | Comportamento | Confine |
| --- | --- | --- |
| Accensione | Catalogo gia configurato, sessione personale salvata | Un account non amministrativo distinto per ciascun amico |
| Guarda online | Direct play se file, client e banda lo consentono | Librerie esplicite; nessuna modifica/cancellazione file |
| Disponibile offline | Scaricamento del titolo su USB con stato di avanzamento | Normali file accessibili accettati; nessun DRM richiesto |
| Guarda senza rete | Riproduzione locale dei titoli completamente precaricati | Il catalogo offline non dipende dal login al server |
| Revoca | Disabilitazione indipendente dell’account remoto | Non ritira le copie gia scaricate |
| Rete esterna | URL HTTPS stabile del servizio Jellyfin | Nessun accesso a LAN fidata, backup WD, SMB/NFS o API key generale |

La selezione del client privilegia funzioni offline gia integrate: Kofin per Kodi/LibreELEC e prima opzione , Jellyfin MPV Shim con Linux appropriato e alternativa. Kofin e progetto della comunita e richiede Kodi 21+ e Jellyfin 10.11+; non si dichiara installato. La sincronizzazione dei metadati degli add-on ufficiali non equivale al download dei film.

La prova dell'utente su HP con H.265 a 1080p e positiva; non documenta bitrate, profilo o codec audio di ogni contenuto. Il precaricamento puo impiegare piu tempo del film: consuma comunque upload, ma permette riproduzione locale ad alta qualita senza buffering di rete. Streaming remoto su percorso 5G e download su FTTC con limite dinamico seguono le politiche domestiche.

Il servizio Jellyfin risiede su M6 e legge i media M4, mantenendo i backup esclusi. La richiesta online gestisce readiness e risveglio dei nodi necessari. L'offline gia precaricato funziona anche a server spenti. La prova iniziale comprende reboot client, cambio rete Ethernet, audio/video, USB e assenza di Internet; configurazioni equivalenti con identita diverse sui due HP.

Fonti: [Kofin Downloads](https://github.com/kontell/plugin.video.kofin/wiki/Downloads), [MPV Shim v3.3.0](https://github.com/jellyfin/jellyfin-mpv-shim/blob/v3.3.0/README.md), [permessi Jellyfin](https://jellyfin.org/docs/general/server/users/adding-managing-users/).

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-OPEN]] · [[REV3-DIFF]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
