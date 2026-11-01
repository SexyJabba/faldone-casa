---
codice: "REV3-CLX"
titolo: "Cluster stabile: cinque voti, carichi a richiesta separati"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# REV3-CLX · Cluster stabile: cinque voti, carichi a richiesta separati

La 4.4 propone una semplificazione strutturale della base 4.3: un nucleo Proxmox di cinque membri normalmente accesi (M1, M2, M5, C3, C4), cinque voti e quorum tre. M3 IA, M4 archivio/backup e M6 media sono installazioni Proxmox autonome, non membri votanti. S4 e sentinella/WoL; nessun qdevice attivo necessario nella base dispari a cinque.

Il nucleo stabile è il dominio di continuità dei servizi essenziali. Se esiste un cluster precedente, esportare configurazioni, backup guest e inventario; seguire procedura Proxmox per ricostruzione/reinserimento senza cancellazioni improvvisate. Vietato ridurre expected_votes per nascondere assenze.

Con cinque membri online, due assenze possono lasciare tre voti comunicanti. Una terza assenza perde la maggioranza. Quorum non significa capacita sufficiente di subentro: C3/C4 hanno 16 GB di base e dischi da misurare. M2 normalmente acceso rende disponibili le app; il suo spegnimento e manutenzione pianificata, non un profilo serale ordinario.

| Servizi | Primario | Riserva | Obiettivo dopo test |
| --- | --- | --- | --- |
| HAOS e MQTT separati | M5 | C3 | RPO 5 min / RTO 5 min, non certificati |
| Vikunja, n8n e Nextcloud selezionato | M2 | C4 | RPO 5 min / RTO 15 min, solo se copia completa entra |
| Firewall | M1 | Secondo boot/M7 manuale | Routing recuperabile, nessuna HA automatica |
| IA, media, backup, Hailo | M3/M4/M6/M5 | Recupero specifico | Nessuna live migration hardware promessa |

Repliche ZFS complete di guest, DB, mount e dati richiesti. Scegliere il perimetro Nextcloud dopo misura: non si promette la replica di 4 TB su 256 GB. Fencing, risorse, ritardo replica e ritorno controllato vanno collaudati prima di attivare HA.

Corosync e gestione hanno percorso cablato locale indipendente dal routing virtuale. M3/M4/M6 sono raggiungibili da M2 tramite rete e servizi, ma non ricevono live migration nativa dal cluster. Un livello di gestione unico puo essere aggiunto dopo, senza ricreare dipendenze di voto.

S1 servizi d'ingresso, S3 radio, S4 sentinella e S2 esterno rimangono autonomi. Il Vito non porta voti, storage necessario al quorum o obblighi di presenza LTE. [[REV4-VITO]]

[Cluster Proxmox](https://pve.proxmox.com/pve-docs/chapter-pvecm.html) · [Replica](https://github.com/proxmox/pve-docs/blob/master/pvesr.adoc)

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
