---
codice: "ATL-29"
titolo: "Guasti, disponibilita e recupero"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# ATL-29 · Guasti, disponibilita e recupero

| Evento | Disponibile | Limite e recupero |
| --- | --- | --- |
| M1 guasto | Restano 4 voti nel nucleo se gli altri sono online | Router e monitor M1 assenti; recupero bare metal/M7, sentinella S4 |
| M2 guasto | Restano 4 voti; app selezionate su C4 dopo collaudo | P310 singolo: altri servizi richiedono ripristino; niente migrazione di tutto il disco |
| M5 guasto | Restano 4 voti; HAOS/MQTT su C3 dopo collaudo | Hailo/registrazioni locali non HA; radio S3 indipendente |
| Due membri del nucleo guasti | Tre voti ancora raggiungibili, maggioranza | Quorum non equivale a RAM/storage di subentro sufficienti |
| M3/M4/M6 spenti | Cinque membri del nucleo invariati | IA/media/archivio attendono WoL e servizi pronti |
| S4 guasto | Nessuna perdita di voto | Sentinella/WoL primario assenti; C4 percorso alternativo |
| Vito senza LTE o spento | Casa e quorum invariati; bordo usa kit offline | Ultima comunicazione non prova un guasto; sincronizzazione differita |
| Blackout prolungato | Arresto ordinato con quorum ancora disponibile | Rete per ultima; riaccensione ordinata; nessuna autonomia stimata senza wattmetro |

Un servizio disponibile non prova un backup recuperabile; quorum non prova capacita di failover. I collaudi registrano tempo e perdita dati effettivi. [[REV3-HA]] · [[REV4-TEST]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
