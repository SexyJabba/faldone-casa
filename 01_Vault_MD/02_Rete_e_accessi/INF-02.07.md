---
codice: "INF-02.07"
titolo: "Accesso remoto e accensione inferenza"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-02.07 · Accesso remoto e accensione inferenza

## Rami, gestione e storage

La mesh/rete familiare accede al router del provider indipendentemente da M1. M1 serve la rete privata: il suo guasto può togliere DHCP/DNS/routing ai segmenti privati, non automaticamente Internet a tutta la famiglia. Preservare il Netgear GS305E disponibile.

**Collegamenti storage.** La dorsale è a stella sul LGS352C-EU: SFP+49 M2 MCX312A porta 1, SFP+50 M3 MNPA19-XTR, SFP+51 M4 SFP+ integrata porta 1, SFP+52 M6 MNPA19-XTR. Le seconde porte M2/M4 sono libere. Gestione e Corosync locali su rame Gigabit; nessun gateway duplicato. M1 raggiunge il LGS352C a 1 GbE: il routing inter-VLAN non eredita i 10 GbE della dorsale.

## Segmentazione e accesso

**Confini fisici.** M2 servizi personali e M6 servizi esterni hanno accessi distinti; Hermes MP3 e OpenClaw MP1 sono personali. M4 interno:media RO a Jellyfin e scritturaarr limitata, repository WD esclusi. Reti IoTlocale/cloud/camere su switch/AP indipendenti da M5. Vedi REV3-RET.

I percorsi diretti ai nodi non richiedono Caddy, dashboard o M2. Verificare DNS quando M1/HP sono assenti e registrare indirizzi di recupero fuori dal vault online. Il profilo di accesso remoto identifica nodo, account e autenticazione nel registro del servizio.

## Energia

**Alimentazione e disponibilita.** M3 IA e M4 media/backup hanno arresto dopo inattività e controllo di lavori, utenti e dipendenze; non partecipano al quorum; M6 su richiesta senza timerstop fissato. Backup M4 giornaliero18:00. Rack power station diretta UPS, client compatti per stop e cluster arrestabile nei blackout prolungati. Vedi REV3-ENE.

**M3 - Inferenza dedicata.** X99-T8 / E5-2678 v3/128 GB RDIMM e RTX3060 per IA su Proxmox. Windows su MP3 Aspire; RTX2080 su MP4 familiare. M3 accensione IA su conferma / coda, spegnimento30 min se non necessario ad altri servizi o lavori autorizzati.

**M3 - Storage locale.** WD PC SN530 512 GB nello slot M.2 PCIe 2.0 x4 per host e ambiente IA. Windows usa il Crucial P3 Plus da 1 TB interno a MP3 Acer; nessun secondo NVMe Windows è assegnato a M3.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
