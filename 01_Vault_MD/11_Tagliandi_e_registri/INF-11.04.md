---
codice: "INF-11.04"
titolo: "Tagliando rete, nodi autonomi e accessi"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-11.04 · Tagliando rete, nodi autonomi e accessi

## Rami, gestione e storage

La mesh/rete familiare accede al router del provider indipendentemente da M1. M1 serve la rete privata: il suo guasto può togliere DHCP/DNS/routing ai segmenti privati, non automaticamente Internet a tutta la famiglia. Preservare il Netgear GS305E disponibile.

**Collegamenti storage.** La dorsale è a stella sul LGS352C-EU: SFP+49 M2 MCX312A porta 1, SFP+50 M3 MNPA19-XTR, SFP+51 M4 SFP+ integrata porta 1, SFP+52 M6 MNPA19-XTR. Le seconde porte M2/M4 sono libere. Gestione e Corosync locali su rame Gigabit; nessun gateway duplicato. M1 raggiunge il LGS352C a 1 GbE: il routing inter-VLAN non eredita i 10 GbE della dorsale.

## Segmentazione e accesso

**Confini fisici.** M2 servizi personali e M6 servizi esterni hanno accessi distinti; Hermes MP3 e OpenClaw MP1 sono personali. M4 interno:media RO a Jellyfin e scritturaarr limitata, repository WD esclusi. Reti IoTlocale/cloud/camere su switch/AP indipendenti da M5. Vedi REV3-RET.

I percorsi diretti ai nodi non richiedono Caddy, dashboard o M2. Verificare DNS quando M1/HP sono assenti e registrare indirizzi di recupero fuori dal vault online. Il profilo di accesso remoto identifica nodo, account e autenticazione nel registro del servizio.

## Energia

**Alimentazione e disponibilita.** M3 IA e M4 media/backup hanno arresto dopo inattività e controllo di lavori, utenti e dipendenze; non partecipano al quorum; M6 su richiesta senza timerstop fissato. Backup M4 giornaliero18:00. Rack power station diretta UPS, client compatti per stop e cluster arrestabile nei blackout prolungati. Vedi REV3-ENE.

**S1-S4.** Q1900S1utilita; Oracle S2 osservazione esterna; Wyse S3 radio/Z2M; Wyse S4 sentinella indipendente (senza voto) e primo WoL. C4 secondo WoL. HP destinati ai due amici esterni. Vaultwarden escluso da S2.

S1 fornisce accesso e utilita senza dipendere da quorum o QDevice; S2 osserva dall'esterno. Accesso diretto a router, hypervisor, NAS e HA documentato fuori dal reverse proxy, con credenziali recuperabili anche a S1 spento. NUT richiede UPS e collegamento supportati effettivamente disponibili, non solo il software.

## Esiti da compilare

Data: __________ Responsabile: __________ Evidenza/log: __________ Esito: __________ Residui: __________

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
