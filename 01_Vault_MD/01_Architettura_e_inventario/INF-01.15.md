---
codice: "INF-01.15"
titolo: "Dispositivi personali e lavoro: separazione e ponte Mac"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-01.15 · Dispositivi personali e lavoro: separazione e ponte Mac

| Dispositivo | Ruolo approvato | Stato / verifica |
| --- | --- | --- |
| Pixel di prova | Test GrapheneOS | Modello esatto e test nel registro identità; precedente ruolo lavorativo superato |
| Pixel 10 | Personale: GrapheneOS + account Google personale + homelab | Profilo personale, variante identificata per dispositivo |
| iPhone di prova | Promosso telefono del lavoro | Account aziendale; integrazioni e assistenti per dati aziendali |
| iPad | Dispositivo aziendale | Account ditta; integrazioni comode e permessi aziendali desiderati |
| Mac Book principale | Ponte personale/azienda e controllo infrastruttura | Integrazioni Apple; cartelle/account e credenziali distinti |
| Mac Book Air M1 8/256 del fratello | Portatile lavoro/controllo nel profilo complementare | macOS + Fedora Asahi in dual boot, con account separati |

GrapheneOS distingue servizi Google sandboxed e profili utente. Foto, file, password e accessi VPN seguono i rispettivi account e backup. Il Mac M1 conserva macOS e recovery; memoria8 GB e storage256 GB delimitano carichi e partizioni del profilo complementare.

I permessi ampi agli assistenti sui dispositivi della ditta sono un funzione espresso da Alessandro; questa revisione non concede autorizzazioni a servizi, non cambia account e non invia messaggi. Il ponte Mac non mescola automaticamente archivi aziendali e personali.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
