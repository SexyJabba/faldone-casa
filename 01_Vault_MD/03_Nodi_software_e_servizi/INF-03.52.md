---
codice: "INF-03.52"
titolo: "S2: VPS complementare"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-03.52 · S2: VPS complementare

S1 Q1900 ospita ntfy, Kuma, Beszel, dashboard e WoL insieme alle utilita leggere; S2 VPS osserva dall'esterno disponibilita della casa e segnala guasti con un percorso indipendente. La VPS non rende disponibili servizi spenti in casa. Vaultwarden e escluso da S2.

M5 dispone di un proprio percorso LTE per gli avvisi essenziali. Le notifiche di assenza WAN non devono richiedere un server di notifica locale raggiungibile soltanto attraverso quella WAN. Destinazione esterna e canale effettivo sono nel registro, senza attribuire una connettivita gia verificata al modem non scelto. WoL richiede alimentazione e rete del nodo destinatario, e non sostituisce un accesso di recupero diretto.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-MAP]] · [[REV3-OPEN]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
