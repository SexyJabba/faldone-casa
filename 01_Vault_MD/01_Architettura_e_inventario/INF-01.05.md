---
codice: "INF-01.05"
titolo: "Energia: nucleo stabile e carichi attivati quando servono"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-01.05 · Energia: nucleo stabile e carichi attivati quando servono

Nucleo M1/M2/M5/C3/C4 normalmente acceso; S1/S3/S4 e rete secondo funzione. M3 si accende su richiesta/conferma o coda IA; M4 per backup e accesso media; M6 secondo uso, spesso durante download. Le tre macchine autonome non cambiano il quorum quando si spengono.

M3 e M4 possono arrestarsi dopo 30 minuti senza lavoro soltanto dopo verifica di job, mount, copie e utenti. Nessun timer automatico M6 e fissato: misurare attivita e tempi di risveglio. Nessuna somma dei TDP usata come consumo elettrico reale.

Power station rack e piccoli UPS client proteggono domini energetici distinti. Modelli e capacità nominali: n.d.; dimensionamento e collaudi nella roadmap. Nessuna autonomia dichiarata senza assorbimenti e test. Il nucleo deve essere arrestato ordinatamente prima di perdere la maggioranza; rete e percorsi di gestione per ultimi. Prove di perdita alimentazione soltanto con backup e sequenza controllata.

Con le nuove schede si rifanno associazioni case, PSU, dissipatori e ventole. M1 LGA2011-3 necessita staffe/ILM corretti; le D1581 hanno cooling e layout propri. Conservare gli alimentatori  ma verificarne pinout e avvio; i due moduli ridondanti non sono automaticamente due ATX utilizzabili.

La batteria servizi del Vito e un progetto separato dal rack e dalla batteria di avviamento. PC e schermo a richiesta, comunicazioni secondo budget energetico. Non usare il consumo giornaliero di tutta casa per stimare autonomia del veicolo. [[REV4-VENE]]

Misure richieste: idle di ciascun nodo, picco durante job, energia giornaliera del nucleo, tempo di accensione/servizio pronto, rumore e temperatura nel vano. Il monitoraggio confronta risultati prima e dopo ottimizzazione. [[REV4-MON]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
