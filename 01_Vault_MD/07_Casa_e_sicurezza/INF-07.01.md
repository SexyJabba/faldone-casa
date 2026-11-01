---
codice: "INF-07.01"
titolo: "Casa, allarme e videosorveglianza"
revisione: "4.4"
aggiornato: "2026-11-01"
tipo: "Architettura di riferimento"
---

# INF-07.01 · Casa, allarme e videosorveglianza

**M5 - Domotica autonoma.** D1581-Q3 , 32 GB PC3L (2 x 16 GB). HAOS e MQTT separati da Frigate/Hailo; radio e Zigbee2MQTT su S3. Hailo e camere costituiscono il percorso locale di visione. [[INF-03.08]]

MQTT e automazioni essenziali restano su M5, radio e Zigbee2MQTT su S3, senza dipendenza obbligatoria da M2/M3/M4. Verificare restore HA e riconnessione radio prima del passaggio; dotazione disco/RAM M5 Q3 nel registro identita.

## Evoluzioni 2027 — non approvate

Frigate e Hailo risiedono su M5 insieme al gateway; Home Assistant e in ambiente separato. I due Seagate ST1000LM024 da 1 TB sono le registrazioni iniziali; telecamere e Hailo non sono acquistati e sei camere sono il riferimento di espansione. Retention e carico dipendono dai flussi effettivi. La RTX 2080 è esclusiva Windows; RAM host non aumenta VRAM né sostituisce acceleratori.

**Frigate - M5.** Hailo-8 e Frigate sono locali a M5. Registrazioni sui due INV-013; decode CPU iniziale con substream H.264 leggeri. La LSI9207 resta a magazzino per il futuro pool SSD. M2 usa il P310 4 TB senza HBA nella configurazione corrente. Gateway e detector condividono solo un runtime compatibile, con priorita Frigate; nessun carico video e assegnato a M2.

## Collegamenti

[[START]] · [[REV3-ATL]] · [[REV3-SRV]] · [[REV3-STO]] · [[REV3-GST]] · [[REV3-SRC]]

## Navigazione

[[REV4-HOME]] · [[REV4-ROAD]] · [[REV3-OPEN]]
