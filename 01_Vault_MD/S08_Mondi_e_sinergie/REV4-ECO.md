---
codice: "REV4-ECO"
titolo: "Sei mondi autonomi, un ecosistema condiviso"
revisione: "4.4"
aggiornato: "2026-11-01"
---

# REV4-ECO · Sei mondi autonomi, un ecosistema condiviso

La configurazione ha sei rami con responsabilità proprie: Vito, domotica, sala server, laboratorio, servizi a terzi e inventario/comunità. Le sedi fisiche sono punti di collocazione; non definiscono l’identità dei progetti. Il Vito è sia laboratorio mobile sia piccola casa autonoma. La domotica gestisce ambienti separati. La sala server offre servizi anche quando si trova in un’altra sede. Il laboratorio coordina attività attuali e future. I terzi usano servizi e identità dedicati. L’inventario produce ricambi, valore economico e nuovi nodi indipendenti.

## Come leggere il faldone

1. **Insieme:** funzioni e responsabilità, prima dei componenti.
2. **Atlante tecnico:** rack, client, connessioni, hardware, fotografie e assegnazioni.
3. **Sinergie:** percorsi dei dati, autorizzazioni e comportamento quando manca una dipendenza.
4. **Sei mondi:** manuali verticali, ciascuno con autonomia, servizi e confini.
5. **Roadmap:** acquisti, arrivi, transizione, misure e collaudi. Le altre parti descrivono l’assetto di riferimento.

## Il contratto di indipendenza

Ogni ramo mantiene una propria identità, un inventario, una configurazione esportabile, un perimetro di dati e una procedura di recupero. Collaborare significa scambiare servizi autorizzati; non significa estendere automaticamente una rete fidata o condividere un account amministratore. La perdita di un collegamento lascia visibile ciò che resta locale e accoda ciò che richiede una consegna.

La sala server può cambiare sede mantenendo i nomi dei servizi e i percorsi di accesso. La gestione della casa conserva comandi e automazioni locali. Il Vito conserva documenti e bozze. Il laboratorio conserva i registri e il modo di operare. Gli utenti esterni conservano credenziali, quote e una procedura di esportazione dei propri dati.

## Portabilità e cluster

Corosync è confinato a una rete locale di sede. Il nucleo a cinque membri descrive l’installazione co-locata: M1/M2/M5/C3/C4. Non viene esteso su LTE, Internet o verso nodi di amici. Il trasferimento di un ramo modifica il dominio locale di virtualizzazione secondo la procedura di migrazione, senza mantenere voti remoti come dipendenza. La continuità applicativa e la replica dei dati sono contratti distinti dalla membership Proxmox.


| Mondo | Missione | Scheda |
| --- | --- | --- |
| Vito · laboratorio mobile e camper | Portare strumenti, documenti e servizi locali dove servono. | [[REV4-VITO]] |
| Domotica · ambienti che restano governabili | Un sistema locale, modulare e trasferibile fra spazi. | [[REV4-DOM]] |
| Sala server · capacità trasferibile | Calcolo, dati e servizi con confini indipendenti dalla nicchia. | [[REV4-SALA]] |
| Laboratorio · gestione e supervisione | Il centro operativo del lavoro e delle attività future. | [[REV4-LAB]] |
| Servizi e client per terzi | Condivisioni chiare senza estendere la fiducia domestica. | [[REV4-TERZI]] |
| Inventario · riuso, vendita e federazione | Ogni componente conserva identità, storia e una destinazione leggibile. | [[REV4-RIUSO]] |

## Navigazione

[[REV4-ECO]] · [[REV4-SIN]] · [[REV4-ROAD]]
