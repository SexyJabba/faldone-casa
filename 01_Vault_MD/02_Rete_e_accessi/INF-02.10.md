---
codice: "INF-02.10"
titolo: "Aggiungere un dispositivo alla rete"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-02.10 · Aggiungere un dispositivo alla rete

**Perimetro:** Riferimento operativo per aggiungere un dispositivo alla rete. Parametri e procedura da confrontare con gli apparati reali.

<b>01.</b> Classificare il dispositivo: personale, media, IoT locale, IoT cloud, telecamera o famiglia. Il tipo di rete segue il ruolo, non la comodità della prima porta libera.

<b>02.</b> Scegliere porta access o SSID corretto; registrare codice dispositivo e MAC effettivo. Verificare PVID/tag e alimentazione PoE se presente.

<b>03.</b> Ricevere o prenotare l’indirizzo, controllare gateway/DNS/NTP e aggiornare il nome se necessario.

<b>04.</b> Aprire solo i servizi richiesti dalla matrice. Per Windows remoto considerare entrambi i flussi: client → Sunshine e Windows → server USB stanza.

<b>05.</b> Provare avvio, riavvio, riconnessione e isolamento dalle destinazioni non assegnate. Salvare il risultato nella scheda.

<b>06.</b> Aggiornare inventario, mappa porte, rubrica e monitor solo dove il dispositivo è un componente gestito.

## Risultato atteso

Il dispositivo mantiene la propria identità, accede alle funzioni autorizzate e non riceve il gateway di un’altra rete. La stanza può usare media e Windows senza avere credenziali di amministrazione del cluster.

| <b>Se compare la rete sbagliata</b><br/>Scollegare il nuovo cavo, controllare entrambe le estremità e la configurazione della porta. Un DHCP ricevuto dal ramo Sky su un client server segnala un possibile collegamento improprio: non risolverlo impostando a caso un IP statico. |
| --- |

Per un cambio critico di rete salvare prima la configurazione e preparare una via locale di recupero. Aggiornare un parametro per volta rende il ripristino comprensibile. La procedura di emergenza M1 è nel settore 08.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
