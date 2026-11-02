/* Tour guidato rev 4.4 — percorso di consultazione autonomo, dal punto di vista di chi usa il sistema.
   Ogni capitolo si legge da solo: sintesi per tutti, scenari d'uso, schema, "se si ferma", dettaglio tecnico richiudibile. */
(function(){
const X=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const st=(k,t)=>`<span class="tg-st" data-s="${k}">${t}</span>`;
const lead=t=>`<p class="tg-lead">${t}</p>`;
const h=(t,sub)=>`<h3 class="tg-h">${t}${sub?`<small>${sub}</small>`:''}</h3>`;
const scen=rows=>`<div class="tg-scen">${rows.map(r=>`<div><span>Quando</span><b>${r[0]}</b><span>Succede</span><p>${r[1]}</p></div>`).join('')}</div>`;
const stop=rows=>`<div class="tg-stop"><div class="tg-stop-h"><span>Se si ferma</span><span>Continua</span><span>Si interrompe</span></div>${rows.map(r=>`<div class="tg-stop-r"><b>${r[0]}</b><p data-l="Continua">${r[1]}</p><p data-l="Si interrompe">${r[2]}</p></div>`).join('')}</div>`;
const grid=items=>`<div class="tg-grid">${items.map(i=>`<div class="tg-card"><div class="tg-card-h"><b>${i[0]}</b>${i[3]||''}</div>${i[1]?`<small>${i[1]}</small>`:''}<p>${i[2]}</p></div>`).join('')}</div>`;
const flow=steps=>`<ol class="tg-flow">${steps.map((s,n)=>`<li><i>${n+1}</i><div><b>${s[0]}</b><p>${s[1]}</p></div></li>`).join('')}</ol>`;
const layers=rows=>`<div class="tg-layers">${rows.map(r=>`<div class="tg-layer"${r[2]?` data-area="${r[2]}"`:''}><b>${r[0]}</b><p>${r[1]}</p></div>`).join('')}</div>`;
const tbl=(head,rows)=>`<div class="tablewrap tg-tbl"><table class="datatable"><thead><tr>${head.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,i)=>`<td data-l="${X(head[i])}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const tech=html=>`<details class="tg-tech"><summary>Dettaglio tecnico <small>per sistemisti</small></summary><div>${html}</div></details>`;
const warn=t=>`<div class="tg-warn">${t}</div>`;
const more=links=>`<div class="tg-more"><span>Approfondisci</span>${links.map(l=>`<a href="#${l[0]}">${l[1]}</a>`).join('')}</div>`;
const OK='ok',PRJ='prj',BUY='buy',DEC='dec',WRN='wrn';

const CH=[
/* 1 ---------------------------------------------------------------- */
{s:'Come funziona',a:'orient',i:'⌂',t:'Come funziona, in due minuti',
 o:'Tre livelli: sempre acceso, a richiesta, fuori casa.',
 b:()=>lead('Un’infrastruttura privata che tiene in casa dati, domotica, sicurezza, media e strumenti di lavoro. Si regge su tre regole: <b>le funzioni essenziali non dipendono da Internet</b>, <b>i server pesanti si accendono solo quando servono</b>, <b>una copia vale solo se si è provato a ripristinarla</b>.')+
 h('I tre livelli')+
 layers([
  ['Sempre acceso · il nucleo','M1 rete e firewall · M2 applicazioni e dati personali · M5 domotica e telecamere · C3 e C4, client di stanza che fanno anche da riserva. Accanto, tre piccoli ausiliari: S1 (ingressi, password, notifiche), S3 (radio Zigbee), S4 (sentinella che sveglia gli altri).','infra'],
  ['A richiesta · dormono finché servono','M3 intelligenza artificiale · M4 backup e archivio media · M6 film, musica e file condivisi con altre persone. Si svegliano da soli quando li chiami e si rispengono quando hanno finito.','server'],
  ['Fuori casa','Il Vito (furgone-laboratorio con postazione propria e LTE) · S2, un piccolo server esterno che controlla la casa da fuori · Google Drive come copia remota · due mini PC per amici.','vito']])+
 h('Cosa vivi tu')+
 scen([
  ['Apri un’app di casa (file, foto, documenti)','Risponde subito M2, che è sempre acceso.'],
  ['Chiedi un film o un’analisi IA','Il server che dorme si sveglia: qualche istante di attesa, poi risponde. Nessuno deve accenderlo a mano.'],
  ['Cade Internet','In casa luci, allarme, file, foto e media continuano. Da fuori non raggiungi i servizi finché la linea non torna.'],
  ['Si guasta un server','Gli altri restano in piedi; le funzioni più importanti ripartono su una macchina di riserva.']])+
 h('Dove siamo')+
 `<p class="tg-p">Questo è l’<b>assetto di riferimento</b> della revisione 4.4: il progetto deciso, non un impianto già acceso. La realizzazione parte il <b>23 dicembre 2026</b> con inventario e prove da banco, e procede per fasi fino a marzo 2027 (capitolo 11). Ogni cosa ha uno stato: </p><div class="tg-legend">${st(OK,'Deciso')}${st(PRJ,'Da realizzare')}${st(BUY,'Da acquistare')}${st(DEC,'Da decidere')}${st(WRN,'Limite noto')}</div>`+
 tech(`<ul><li>Cluster Proxmox a cinque voti (M1, M2, M5, C3, C4), quorum 3, nessun qdevice: tollera la perdita di due membri.</li><li>M3, M4, M6 sono host Proxmox autonomi, fuori dal voto, accesi via Wake-on-LAN (S4 primo mittente, C4 secondo).</li><li>Rete: firewall OPNsense su M1, switch Linksys LGS352C-EU (48 × 1 GbE + 4 SFP+ 10 GbE) con dorsale a stella verso M2, M3, M4, M6.</li><li>Due uscite: FTTC (upload 4 Mbit/s) e router 5G (SIM 500 GB).</li></ul>`)+
 more([['map','Mappa interattiva'],['network','Rete e quorum'],['nodes','Anagrafica nodi']])},

/* 2 ---------------------------------------------------------------- */
{s:'Lavoro',a:'lab',i:'▣',t:'Una giornata di lavoro',
 o:'Dal laboratorio al cantiere e ritorno, senza doppioni.',
 b:()=>lead('Il lavoro della ditta vive su <b>registri condivisi con la segretaria</b>: Fogli Google, Calendar, Vikunja. Server e assistenti preparano, leggono, propongono e cercano; ma un rapportino è registrato solo quando <b>la riga è scritta nel foglio</b>. Una risposta in chat non è un aggiornamento.')+
 h('Il giro completo')+
 flow([
  ['Prima di uscire · laboratorio','Dalla postazione Acer scegli la commessa; documenti, elaborati e riferimenti vengono copiati sul Vito con la data della copia. Si aprono a campione per essere sicuri che ci siano davvero, non solo come collegamento.'],
  ['In cantiere · Vito o telefono','Raccogli ore, lavorazioni, materiali, foto, osservazioni e prossima azione, anche senza rete. Ogni bozza ha un codice e uno stato: <i>locale</i>, <i>da inviare</i>, <i>registrata</i>.'],
  ['Foto di un materiale su WhatsApp','L’assistente di lavoro (OpenClaw) legge marca, codice e quantità, separa ciò che è certo da ciò che è ipotesi e propone <b>una sola</b> azione: dove archiviarla. Archivia solo se rispondi «sì», e solo per quella foto.'],
  ['Rientro','I dati raccolti tornano a casa in coda; ogni elemento si verifica e si consegna una volta sola. Se nel frattempo la segretaria ha modificato una riga, non viene sovrascritta senza confronto.'],
  ['Registro','Rapportino nel foglio condiviso, appuntamento in Calendar, attività in Vikunja, documenti in Paperless. L’esito mostra il riferimento della riga salvata.']])+
 h('Gli strumenti')+
 tbl(['Strumento','Ti serve per','Dove sta'],[
  ['Fogli Google condivisi','Rapportini, commesse, registri con la segretaria','Account di lavoro (cloud)'],
  ['Calendar di lavoro','Appuntamenti e sopralluoghi','Account di lavoro (cloud)'],
  ['Gemini (Google AI Pro)','Voce, scrittura, aiuto nei fogli','Account di lavoro (cloud), già pagato'],
  ['Vikunja','Attività, scadenze, progetti','M2, con replica su C4'],
  ['Paperless','Documenti scansionati, ricerca nel testo','M2'],
  ['OpenClaw','Foto e allegati di lavoro → proposta di archiviazione','Acer MP3, laboratorio'],
  ['Hermes','Assistente personale (foto, documenti, riepiloghi)','Acer MP3, account separato'],
  ['Open WebUI + M3','IA locale: sintesi, ricerca nei tuoi documenti con fonte citata','Interfaccia su M2, calcolo su M3'],
  ['n8n','Automazioni tra servizi','M2, con replica su C4'],
  ['Fiscozen','Emissione fatture','Servizio esterno']])+
 h('Regole che proteggono il lavoro')+
 grid([
  ['Conferma per ogni azione','','Nessun archivio, invio o modifica senza un «sì» legato a quel singolo lavoro. Una conferma vecchia non vale per l’allegato successivo.',st(OK,'Deciso')],
  ['Il testo nella foto non comanda','','File, immagini e messaggi sono dati da analizzare, mai istruzioni da eseguire.',st(OK,'Deciso')],
  ['Personale e lavoro separati','','Account, permessi e archivi distinti. Il MacBook personale ha un utente dedicato al lavoro.',st(OK,'Deciso')],
  ['IA in casa, cloud su richiesta','','Se M3 dorme scegli «accendi adesso» o «metti in coda». Si rispegne dopo 30 minuti senza lavori. Il cloud si usa solo se lo chiedi.',st(OK,'Deciso')]])+
 h('Se qualcosa si ferma')+
 stop([
  ['M3 (IA) spento','Registri, documenti, Paperless, Vikunja','Generazione IA locale fino all’accensione'],
  ['Acer MP3 spento','Cluster, registri, domotica','Assistenti OpenClaw e Hermes, Windows'],
  ['Internet assente in cantiere','Lavoro sul Vito con documenti locali, raccolta dati','Consegna dei dati: parte al ritorno della rete'],
  ['M2 fermo','Fogli e Calendar (cloud), Vito','Vikunja e n8n fino al subentro su C4; Paperless fino al ripristino']])+
 tech(`<p>Flusso allegati: WhatsApp → OpenClaw → quarantena temporanea → vision-gateway su M5 (Hailo o CPU) → modello di visione su M3 → JSON strutturato (dato letto, inferenza, incertezza, azione proposta) → conferma → scrittura via API con chiave di idempotenza: un nuovo tentativo non duplica il documento. Log senza token, allegati o immagini private.</p><p>${st(PRJ,'Da realizzare')} Il connettore WhatsApp è descritto, non attivo. La sincronizzazione Vito ↔ casa ha requisiti fissati, metodo da implementare. Collaudo finale: un rapporto raccolto senza rete, consegnato, ritrovato una sola volta nel foglio della segretaria.</p>`)+
 more([['REV4-LAB','Laboratorio'],['INF-06.13','Gemini e Sheets'],['REV4-VLAV','Lavoro a bordo'],['INF-03.47','Vision-gateway']])},

/* 3 ---------------------------------------------------------------- */
{s:'Domotica',a:'casa',i:'◉',t:'La casa che si gestisce da sola',
 o:'Cosa si può automatizzare e cosa resta comandabile sempre.',
 b:()=>lead('Home Assistant su M5 governa la casa <b>in locale</b>. I dispositivi parlano via Zigbee (la radio sta su un apparecchio a parte, S3) oppure su un Wi-Fi isolato che <b>non esce su Internet</b>. Se cade la linea o si ferma un server, luci, riscaldamento e funzioni essenziali restano comandabili sul posto.')+
 h('Cosa si può automatizzare','esempi realistici, da configurare stanza per stanza')+
 grid([
  ['Luci','Interruttori Sonoff · dimmer Mi-Light via MiBoxer','Scene per momento della giornata, spegnimento generale quando esci, luci a presenza nei passaggi, intensità ridotta di notte.',st(OK,'In parte posseduti')],
  ['Riscaldamento','Termosifoni elettrici Mill','Orari per stanza, temperatura ridotta quando la casa è vuota, controllo dal pannello o dal telefono. I Mill stanno sul Wi-Fi senza Internet.',st(OK,'Posseduti')],
  ['Aria e VMC','Sensori temperatura, umidità, qualità dell’aria · relè smart','Ventilazione meccanica fai-da-te comandata da relè: si attiva quando umidità o qualità dell’aria superano una soglia.',st(PRJ,'Da realizzare')],
  ['Perdite d’acqua','Sensori a pavimento','Avviso immediato sul telefono con la stanza interessata.',st(BUY,'Da acquistare')],
  ['Presenza','Sensori di presenza','Luci e clima che seguono chi è in casa; base per le scene di uscita e rientro.',st(BUY,'Da acquistare')],
  ['Esterno e orto','Meteo · irrigazione','Ogni ciclo ha un tempo massimo, condizioni di blocco e un pulsante di arresto. Se un dato è vecchio il pannello lo dice e non comanda.',st(PRJ,'Con la parte fisica')],
  ['Pannelli','NSPanel Pro · pannello cucina · pannello ingresso · display recuperati','Comandi a parete per stanza. Un pannello è un’interfaccia: stare davanti a un display non dà l’amministrazione completa.',st(OK,'In parte posseduti')],
  ['Voce','Microfono → Whisper → modello → Piper','Comandi e risposte vocali in casa. Le funzioni essenziali non dipendono dalla catena voce.',st(PRJ,'Da realizzare')],
  ['Energia','Consumi, UPS, blackout','Avviso di mancanza rete, arresto ordinato dei server, riaccensione in sequenza. La stima non sostituisce la misura con il wattmetro.',st(PRJ,'Da misurare')]])+
 h('Cosa vivi tu')+
 scen([
  ['Esci di casa','Una scena di uscita può spegnere le luci, abbassare il riscaldamento e inserire l’allarme. Tutto in locale, anche senza Internet.'],
  ['Il bagno si riempie di umidità','La VMC parte da sola e si ferma quando il valore rientra.'],
  ['Una perdita sotto il lavello','Notifica immediata con la stanza; resta nello storico.'],
  ['Cade Internet','Comandi, scene e pannelli continuano. Si fermano solo le app che passano dal cloud del produttore.']])+
 h('Tre reti per tre tipi di dispositivo')+
 layers([
  ['Wi-Fi senza Internet','Riscaldamento Mill, pannelli NSPanel Pro, dashboard e streamer Android, allarme. Parlano solo con Home Assistant.','casa'],
  ['Zigbee','Sensori, interruttori, relè: rete radio propria a basso consumo, coordinata da S3 con la chiavetta Sonoff ZBDongle-P.','casa'],
  ['Wi-Fi con Internet, separato','Le poche eccezioni che richiedono il cloud del produttore (gli interruttori Sonoff T5 restano su eWeLink). Isolate dal resto.','terzi']])+
 `<p class="tg-p">I dispositivi domotici dei familiari, quando arriveranno, staranno in una rete propria: il firewall M1 decide chi può parlare con chi.</p>`+
 h('Se qualcosa si ferma')+
 stop([
  ['Internet','Tutta la domotica locale, pannelli, scene','App cloud dei produttori, comandi da fuori'],
  ['M5 (domotica)','Radio S3 e comandi Zigbee diretti tra dispositivi associati','Home Assistant e messaggi MQTT, finché non ripartono su C3 (obiettivo 5 minuti)'],
  ['S3 (radio)','Dispositivi Wi-Fi, Home Assistant','Tutti i dispositivi Zigbee: c’è un solo coordinatore, con configurazione e chiavi in copia']])+
 tech(`<ul><li>M5: Xeon D-1581, 32 GB. Home Assistant OS e broker MQTT in guest separati, replicati su C3 (RPO 5 min, RTO 5 min). Frigate e Hailo non migrano.</li><li>S3: Wyse 3030, 4 GB, flash 8 GB; Linux + Zigbee2MQTT. La radio arriva a HA via rete: nessun pass-through USB da spostare in caso di subentro.</li><li>Binding Zigbee diretti dove i dispositivi li supportano: non tutte le automazioni di HA diventano binding.</li><li>VLAN IoT locale, IoT cloud e telecamere su switch e access point indipendenti da M5. mDNS non attraversa le VLAN: ripetitore su OPNsense o dispositivi per indirizzo IP.</li></ul>`)+
 more([['REV4-DOM','Domotica'],['INF-03.28','Home Assistant e Zigbee'],['INF-07.07','Meteo e orto'],['world-home','Casa e ambienti']])},

/* 4 ---------------------------------------------------------------- */
{s:'Sicurezza',a:'sim',i:'⛨',t:'Allarme e sicurezza',
 o:'Strati indipendenti: se uno cade, gli altri restano.',
 b:()=>lead('La sicurezza è fatta a <b>strati indipendenti</b>. Centrale e sirene funzionano da sole; le telecamere registrano in casa; gli avvisi hanno più strade per uscire. Nessuna immagine passa dal cloud di terzi.')+
 h('Gli strati')+
 layers([
  ['1 · Rilevatori e centrale','Intrusione, fumo, gas, acqua. La centrale con la sua sirena funziona senza Internet, senza Home Assistant, senza server.','sim'],
  ['2 · Telecamere','Frigate su M5 riconosce persone e veicoli e salva solo gli eventi, conservati 7 giorni su due dischi da 1 TB. Si parte con 4 telecamere, fino a 6. I flussi restano in casa: nessuna telecamera è raggiungibile da Internet.','sim'],
  ['3 · Ingresso','Pannello Microtech recuperato per citofono e allarme, con display e batteria tampone. È un pannello di comando, non la centrale.','casa'],
  ['4 · Avvisi','Notifiche dal server locale (S1), un osservatore esterno (S2) che si accorge se la casa sparisce, e una linea mobile dedicata agli avvisi di M5 anche a firewall o linea fissa fermi.','infra'],
  ['5 · Persone','Tu ricevi tutto. Ogni familiare riceve gli eventi della propria area e delle parti comuni. Immagini e storico hanno permessi personali.','terzi']])+
 h('Cosa vivi tu')+
 scen([
  ['Scatta un sensore di notte','Sirena locale, notifica immediata sul telefono, clip dell’evento consultabile.'],
  ['Fumo, gas o acqua','Avviso immediato a te e ai familiari dell’area interessata.'],
  ['Manca la corrente','Avviso di blackout; i server si arrestano in ordine, la rete per ultima.'],
  ['La casa resta senza Internet','S2, da fuori, nota l’assenza e ti avvisa: sai che è un problema di linea, non di furto.'],
  ['Tutto il resto','Stato dei servizi, esito dei backup, anomalie non urgenti: arrivano in un riepilogo, non come allarmi.']])+
 h('Privacy delle immagini')+
 grid([
  ['Solo in casa','','Registrazioni e analisi su M5. Nessun abbonamento cloud di videosorveglianza.',st(OK,'Deciso')],
  ['Niente riconoscimento facciale','','Il sistema riconosce «una persona», non chi è. Il riconoscimento dei volti è disattivato.',st(OK,'Deciso')],
  ['Rete separata','','Le telecamere stanno in una rete propria, senza uscita libera verso Internet.',st(OK,'Deciso')],
  ['Accesso per persona','','Chi vede cosa (telecamere, registrazioni, apertura accessi) è deciso utente per utente.',st(DEC,'Da affinare')]])+
 h('Se qualcosa si ferma')+
 stop([
  ['M5','Centrale, sirene, rilevatori','Telecamere e Frigate (non replicati), Home Assistant fino al subentro'],
  ['S1 (notifiche)','Centrale, osservatore esterno S2','Notifiche locali ntfy'],
  ['Internet','Sirene e allarmi locali, registrazioni','Notifiche remote, salvo la linea mobile di M5 se operativa']])+
 tech(`<ul><li>Frigate + Hailo-8 (M.2 M-key) + vision-gateway + go2rtc su M5; decodifica iniziale su CPU con substream H.264 leggeri. Registrazioni su 2 × Seagate ST1000LM024. Retention e carico da misurare sui flussi reali.</li><li>Percorsi avvisi: ntfy su S1; S2 Oracle per l’osservazione esterna; router 5G LAN2 → M5 per gli avvisi con M1 fermo, senza ponte libero.</li><li>Livelli: immediato (intrusione, fumo, gas, acqua, blackout, guasti critici) / riepilogo (servizi, backup, manutenzioni). Silenziamento, escalation e conferma di presa in carico ${st(DEC,'da definire')}.</li></ul><p>${st(BUY,'Da acquistare')} telecamere, Hailo-8, centrale e rilevatori.</p>`)+
 more([['INF-08.03','Notifiche'],['INF-03.08','M5'],['INF-03.44','go2rtc'],['ATL-27','Sicurezza e indipendenza']])},

/* 5 ---------------------------------------------------------------- */
{s:'Servizi M2',a:'dati',i:'▤',t:'M2: il tuo cloud personale',
 o:'File, foto, documenti, casa e finanze, sempre accesi.',
 b:()=>lead('M2 è il <b>cloud personale di casa</b>: file, foto, documenti, attività, ricette, scorte, inventario, finanze. È sempre acceso, i dati stanno su disco veloce in casa e da fuori si raggiunge solo con il tuo accesso personale.')+
 h('I servizi','cosa fanno per te e cosa sostituiscono')+
 grid([
  ['Nextcloud','invece di Google Drive / Dropbox','File e cartelle da ogni dispositivo. Condividi un file con un link in sola lettura, o ricevi file da altri senza che vedano il resto.',st(OK,'Riserva su C4')],
  ['Immich','invece di Google Foto','Backup automatico delle foto del telefono, album, ricerca per contenuto. Il riconoscimento dei volti parte disattivato.',''],
  ['Paperless','invece del raccoglitore','Scansioni una bolletta o un contratto: legge il testo e lo ritrovi cercando una parola.',''],
  ['Syncthing','','Tiene allineate alcune cartelle tra dispositivi. Non è un backup: una cancellazione si propaga.',''],
  ['Cartelle di rete','','Le cartelle di casa aperte direttamente da PC e Mac.',''],
  ['Vikunja','invece di Todoist','Attività, scadenze e progetti, anche condivisi.',st(OK,'Riserva su C4')],
  ['n8n','invece di Zapier / Make','Automazioni tra servizi: quando arriva X, fai Y.',st(OK,'Riserva su C4')],
  ['Tandoor','','Ricette e piano dei pasti; ogni appartamento ha il suo spazio, più uno condiviso.',''],
  ['Grocy','','Scorte di casa e lista della spesa.',''],
  ['HomeBox','','Inventario degli oggetti: cosa hai e dove si trova.',''],
  ['Firefly III','invece di YNAB','Finanze personali e budget.',''],
  ['Stirling PDF','invece di Acrobat','Unire, dividere, convertire PDF senza caricarli su siti esterni.',''],
  ['Open WebUI','invece di un abbonamento IA','Chat con l’IA di casa; il calcolo lo fa M3, acceso quando serve.','']])+
 h('Cosa vivi tu')+
 scen([
  ['Scatti foto col telefono','Immich le salva in casa appena sei in rete; le ritrovi per data, luogo o contenuto.'],
  ['Arriva una bolletta','La scansioni: Paperless la archivia, legge il testo, la ritrovi cercando «luce novembre».'],
  ['Devi mandare un file a qualcuno','Link Nextcloud in sola lettura, con scadenza: vede quel file, nient’altro.'],
  ['Sei fuori casa','Accedi con il tuo accesso personale; i permessi restano quelli di casa.']])+
 warn(`<b>Limite noto.</b> Finché non arriva il pool SSD previsto, i dati di M2 stanno su <b>un solo disco</b> (Crucial P310 da 4 TB): un guasto si recupera dai backup, non da un secondo disco gemello.`)+
 h('Se qualcosa si ferma')+
 stop([
  ['M2','Domotica, telecamere, media, IA','Tutti i servizi qui sopra; Nextcloud, Vikunja e n8n ripartono su C4 (obiettivo 15 minuti, perdita massima 5 minuti di dati)'],
  ['Un singolo servizio','Gli altri servizi di M2','Solo quel servizio: ognuno ha i propri dati separati']])+
 tech(`<ul><li>M2: D1581-Q3A, Xeon D-1581 16c/32t, 64 GB RDIMM; avvio Sabrent 512 GB; dati su P310 4 TB (segnaposto del pool SSD); Mellanox MCX312A su SFP+ 49, seconda porta libera.</li><li>Nextcloud in ambiente isolato sulla DMZ, pubblicato da Caddy su S1 attraverso il filtro di M1; il guest non è collegato a due reti per aggirare il firewall.</li><li>Backup coerenti: database e file dello stesso istante. Nessuna app accede alle cartelle interne delle altre.</li><li>Repliche ZFS su SSD locale di C4 con tutti i volumi necessari; rientro sul primario controllato, mai automatico.</li></ul>`)+
 more([['INF-03.03','M2'],['INF-03.04','Applicazioni personali'],['INF-03.14','Nextcloud'],['savings','Risparmio self-hosting']])},

/* 6 ---------------------------------------------------------------- */
{s:'Servizi M6',a:'server',i:'▶',t:'M6: media e condivisione con altri',
 o:'Film, musica, audiolibri, audio in più stanze, file per amici.',
 b:()=>lead('M6 è il server dello <b>svago e della condivisione con altre persone</b>: film, serie, musica, audiolibri, audio sincronizzato in più stanze e uno spazio file per amici. Si accende quando lo chiami e resta separato dai tuoi dati personali.')+
 h('I servizi')+
 grid([
  ['Jellyfin','film e serie','Il tuo catalogo sulla TV, sul telefono, dagli amici. La scheda Intel Arc converte al volo i video per i dispositivi meno potenti.',st(BUY,'Arc da acquistare')],
  ['Navidrome','musica','La tua libreria musicale come un servizio di streaming, da qualsiasi app compatibile.',''],
  ['Audiobookshelf','audiolibri e podcast','Riprende dal punto in cui eri arrivato, su ogni dispositivo.',''],
  ['Snapcast','audio multiroom','La stessa musica, sincronizzata, in laboratorio, studio e salone. Solo dentro casa.',''],
  ['Seafile','file per altre persone','Dieci persone, 50 GB ciascuna, account e quote individuali. Nessun accesso al resto della rete.',st(WRN,'Senza backup')],
  ['Download','solo interno','Scaricamenti automatici in un ambiente isolato, con permessi minimi e spazio controllato.','']])+
 h('Cosa vivi tu')+
 scen([
  ['Apri Jellyfin sulla TV','Se M6 dorme si sveglia; se il film è nell’archivio di M4, si sveglia anche M4. Qualche istante di attesa, poi parte.'],
  ['Musica in tutta la casa','Scegli il brano: suona insieme dal Wyse del laboratorio, dallo studio e dall’impianto Hi-Fi del salone.'],
  ['Un amico guarda un film da casa sua','Dal suo piccolo HP: in streaming dal tuo server, oppure dalla chiavetta già caricata, anche senza Internet.'],
  ['Un amico usa Seafile','Vede solo la sua cartella. Se gli revochi l’account, perde l’accesso.']])+
 warn(`<b>Scelta esplicita.</b> Seafile ha solo il mirror tra due dischi: regge la rottura di un disco, <b>non</b> una cancellazione o la perdita del server. Chi lo usa deve tenere una copia propria.`)+
 h('Se qualcosa si ferma')+
 stop([
  ['M6','M2, domotica, telecamere, backup','Jellyfin, musica dal server, audiolibri, Seafile, download'],
  ['M4 spento','M6: musica locale, Seafile, download','I film e le serie presenti solo sull’archivio di M4'],
  ['Internet','Tutti i media dentro casa','Accesso da fuori; gli amici usano la chiavetta offline']])+
 tech(`<ul><li>M6: D1581-Q3A, 64 GB; avvio Kingston 120 GB; Samsung 850 EVO 500 GB per download e staging con quote; 2 × WD10EZRX in mirror (Seafile e copia audio); Intel Arc A310; Mellanox MNPA19-XTR su SFP+ 52.</li><li>Tre account distinti: scrittura «arr», Jellyfin in sola lettura, Seafile. Se il mount di M4 manca gli import si sospendono: non si scrive nella cartella vuota.</li><li>Pubblicazione via 5G entro quota; download file su FTTC con limite dinamico. Ingresso HTTPS per utenti autorizzati, DMZ su M6.</li><li>Client audio: Wyse laboratorio, Wyse studio → Behringer CONTROL2USB, Wyse Hi-Fi → DAC ES9038Q2M.</li></ul>`)+
 more([['INF-03.05','M6'],['INF-03.49','Seafile'],['INF-05.30','Client per amici'],['world-guests','Servizi a terzi']])},

/* 7 ---------------------------------------------------------------- */
{s:'Recupero',a:'dati',i:'↺',t:'Ridondanza e recupero',
 o:'Restare in piedi, tornare indietro, ricostruire.',
 b:()=>lead('Tre domande diverse, tre risposte diverse. <b>Resta in piedi?</b> Nucleo a cinque voti e repliche. <b>Posso tornare a ieri?</b> Snapshot e versioni. <b>Posso ricostruire tutto?</b> Backup in tre luoghi. E una regola sopra tutte: <b>un backup conta solo se un ripristino è riuscito</b>.')+
 h('Quattro livelli di protezione')+
 layers([
  ['1 · Nucleo a cinque voti','Cinque macchine decidono insieme; ne bastano tre. Se due si guastano, il governo del sistema continua.','infra'],
  ['2 · Repliche pronte','Home Assistant e MQTT hanno una copia su C3; Nextcloud, Vikunja e n8n su C4. Se il server principale cade, ripartono lì.','infra'],
  ['3 · Snapshot','Una «foto» giornaliera dei dati: recuperi un file cancellato per errore com’era ieri. Sta sullo stesso disco, quindi non protegge da un guasto del disco.','dati'],
  ['4 · Backup in tre luoghi','<b>In casa</b>: dischi WD su M4, ogni giorno dalle 18:00 (M4 si sveglia da solo). <b>Fuori casa</b>: Google Drive. <b>Staccato dalla rete</b>: tre cartucce RDX da 2 TB per foto e video, documenti personali, lavoro.','dati']])+
 tbl(['Servizio','Riparte su','Dati persi al massimo','Tempo di ripartenza'],[
  ['Home Assistant','C3','5 minuti','5 minuti'],['MQTT','C3','5 minuti','5 minuti'],
  ['Nextcloud','C4','5 minuti','15 minuti'],['Vikunja','C4','5 minuti','15 minuti'],['n8n','C4','5 minuti','15 minuti']])+
 `<p class="tg-p tg-small">Obiettivi di progetto, non risultati di un test: diventano numeri veri solo dopo i collaudi.</p>`+
 h('Perché tre luoghi')+
 grid([
  ['In casa','protegge da: disco rotto','Veloce da ripristinare. Non protegge da incendio o furto.',''],
  ['Fuori casa','protegge da: incendio, furto','Lento: con 4 Mbit/s in upload servono circa 23 giorni per 1 TB.',st(DEC,'Cifratura da decidere')],
  ['Staccato','protegge da: errori, ransomware','La cartuccia non è collegata: nessun virus la raggiunge.',st(BUY,'Cartucce da acquistare')]])+
 h('Come si fa un recupero')+
 flow([
  ['Da un dispositivo indipendente','Con chiavi e password disponibili anche offline, senza dipendere dal gestore password.'],
  ['Scegli il punto nel tempo','Si apre l’archivio e si sceglie la data.'],
  ['Ripristina in una cartella nuova','Mai sopra l’unico originale.'],
  ['Verifica','File: si aprono e si contano. Applicazioni: database e file dello stesso istante, prova di login, allegati, ricerca.'],
  ['Registra','Data, tempi effettivi, anomalie. «Job completato» e «recupero riuscito» sono due cose diverse.']])+
 h('Cosa succede se…')+
 stop([
  ['M1 (rete) si guasta','Quattro voti, servizi locali; i familiari hanno la loro linea','Instradamento privato e accesso remoto; la macchina di scorta M7 si attiva a mano'],
  ['M2 si guasta','Quattro voti, domotica, media','Nextcloud, Vikunja, n8n ripartono su C4; gli altri servizi si ripristinano da backup'],
  ['M5 si guasta','Quattro voti, file, media','Home Assistant e MQTT ripartono su C3; telecamere ferme fino alla riparazione'],
  ['Due macchine del nucleo','Tre voti, il governo continua','Avere il voto non garantisce RAM e spazio per tutti i servizi'],
  ['Blackout lungo','Arresto ordinato finché il quorum è presente; la rete si spegne per ultima','Tutti i servizi, fino alla riaccensione in sequenza']])+
 warn(`<b>Cosa non è protetto, per scelta:</b> Seafile (solo mirror), registrazioni delle telecamere, media riscaricabili e cache. La radio Zigbee ha un solo coordinatore (configurazione e chiavi in copia).`)+
 tech(`<ul><li>Retention di riferimento: SH1 14 giornaliere / 8 settimanali / 12 mensili; Workspace 7 / 4 / 3. Pruning sospeso durante incidenti aperti.</li><li>Transizione: Drive come «Arca» temporanea con rclone copy (nessuna cancellazione propagata), crypt per i dati privati; poi solo deposito di backup, mai disco operativo.</li><li>Restic: <code>snapshots</code>, <code>check --read-data-subset</code>, <code>restore --target</code> in directory nuova.</li><li>Repliche ZFS su SSD locale di C3/C4; bind mount e condivisioni non sono replicati col solo rootfs; fencing e storage valido sono condizioni di attivazione.</li><li>Vaultwarden: backup su M4 e SH, escluso dalla VPS; chiavi recuperabili offline.</li></ul>`)+
 more([['storage','Dati e copie'],['INF-04.05','Backup'],['INF-04.10','Recupero'],['sim','Simula guasti']])},

/* 8 ---------------------------------------------------------------- */
{s:'Postazioni',a:'sinergie',i:'▢',t:'L’esperienza alle postazioni',
 o:'Un piccolo client per stanza, i server lavorano in sala.',
 b:()=>lead('I server lavorano in sala; in ogni stanza c’è un <b>piccolo client</b> che mostra il risultato. Per questo bastano mini PC recuperati. Cambi stanza e ritrovi lo stesso lavoro.')+
 h('Stanza per stanza')+
 tbl(['Dove','Dispositivo','Cosa ci fai'],[
  ['Laboratorio','Acer Aspire 7 (MP3)','Windows di lavoro di giorno, gioco la sera; assistenti; trasmette il desktop alle altre stanze'],
  ['Laboratorio','Wyse','Film, musica, pannello casa'],
  ['Cucina','Dell 7070 (C2)','Streaming, pannello casa, più monitor'],
  ['Camera','Dell 7070 (C3)','Client Linux; in sala fa anche da riserva della domotica'],
  ['Salone','Dell 7070 (C4) + Wyse Hi-Fi','Video sulla TV; audio verso il DAC; riserva delle app'],
  ['Studio','Wyse','Monitor e audio verso il mixer Behringer'],
  ['Ingresso','Microtech','Citofono e allarme'],
  ['Casa','MacBook personale','Utente personale e utente di lavoro separati; registrazione audio'],
  ['Vito','Dell 7070 (C1)','Lavoro, camper, diagnostica del mezzo']])+
 h('Cosa vivi tu')+
 scen([
  ['Ti siedi in cucina e apri Moonlight','Vedi il desktop Windows dell’Acer, con lavoro o gioco in corso.'],
  ['Ti sposti in salone','Riprendi la stessa sessione dallo schermo grande.'],
  ['Un’altra persona vuole un film','Lo guarda da Jellyfin mentre tu lavori: sono servizi separati.'],
  ['Due persone vogliono Windows','Non si può: c’è un solo desktop Windows, due client vedono lo stesso schermo.'],
  ['Tastiera e mouse','Condivisi tra le postazioni con Synergy (licenze già disponibili).'],
  ['Progetti audio','REAPER e Ableton da remoto per ascolto e ritocchi; registrazione e lavoro dal vivo sul MacBook.']])+
 h('Che dispositivo serve','guida rapida per una stanza nuova')+
 tbl(['Dispositivo','Windows / giochi','Film / musica','File / foto / IA'],[
  ['Mini PC Linux o Windows','Sì','Sì','Sì'],['Android TV / box','Sì, dipende dal modello','Sì','App o browser'],
  ['Apple TV','Sì','Sì','Limitato'],['Smart TV','Dipende','Sì, dipende','Browser'],['Tablet e telefoni','Sì','Sì','Sì']])+
 `<p class="tg-p tg-small">Se l’attività principale è lavorare su Windows, meglio un PC con tastiera vera. Se a una TV manca l’USB, si aggiunge un piccolo ponte.</p>`+
 h('Se qualcosa si ferma')+
 stop([
  ['Un client','Tutti i servizi: cambi stanza o dispositivo','Solo quello schermo'],
  ['Acer MP3','Media, file, domotica, cluster','Windows, giochi, assistenti di lavoro'],
  ['Lo schermo di C3 o C4','L’host di riserva in sala continua','Niente: lo schermo si spegne senza toccare i server']])+
 tech(`<ul><li>Dell OptiPlex 7070 Ultra (i5-8265U): C1/C2 8 GB, C3/C4 16 GB di progetto. C3 e C4 sono host Proxmox con il client Linux in un guest separato; priorità ai servizi essenziali.</li><li>Acer MP3: Ryzen 7 5700U, RTX 3050 Ti 4 GB, 16 GB; Windows con account alternati, Sunshine come servizio. Moonlight condivide una sola sessione desktop.</li><li>Licenze Synergy: 3 Max, 2 Pro, 1 Pro.</li></ul>`)+
 more([['INF-05.01','Postazioni'],['INF-05.15','Matrice dei client'],['REV4-CLIENT','Client per persone'],['world-lab','Laboratorio']])},

/* 9 ---------------------------------------------------------------- */
{s:'Fuori casa',a:'vito',i:'↗',t:'Fuori casa: Vito e accesso remoto',
 o:'Il furgone lavora da solo; da fuori entri solo tu.',
 b:()=>lead('Fuori casa contano tre cose: <b>il Vito lavora da solo</b>, <b>tu raggiungi i tuoi servizi</b> con un accesso personale, <b>gli altri vedono solo ciò che condividi</b>.')+
 h('Il Vito: cinque modi')+
 grid([
  ['Lavoro','','Documenti di cantiere, rapportini, foto, agenda su touchscreen.',''],
  ['Camper','','Media e servizi locali di viaggio, indipendenti dall’archivio di casa.',''],
  ['Offline','','Tutto ciò che serve è già a bordo, con la data dell’ultima copia.',''],
  ['Rientro','','Consegna dei dati raccolti a casa, una volta sola, con verifica.',''],
  ['Riserva energia','','Si spengono i carichi non essenziali per preservare la batteria di servizio.','']])+
 `<p class="tg-p">A bordo c’è una <b>copia selezionata e datata</b>, non tutto l’archivio. Le bozze non ancora consegnate sono segnalate «a rischio». Il Vito non fa parte del cluster: spegnerlo o perdere copertura non cambia nulla a casa.</p>`+
 h('Chi entra e cosa vede')+
 tbl(['Chi','Cosa vede','Come'],[
  ['Tu','Amministrazione, servizi privati, domotica e sicurezza','Accesso remoto personale (Tailscale)'],
  ['Familiari','Servizi condivisi in sola lettura; domotica della propria area','Account personali'],
  ['Amici','Film (Jellyfin) e la propria cartella Seafile','Account individuali via HTTPS, revocabili'],
  ['Ospiti','Solo Internet','Wi-Fi ospiti, nessun servizio interno']])+
 h('Cosa vivi tu')+
 scen([
  ['Sei in cantiere senza segnale','Consulti documenti e raccogli dati; partono al ritorno della rete.'],
  ['Sei in viaggio e vuoi una foto di casa','Entri con il tuo accesso personale e la apri da Immich.'],
  ['Revochi un amico','Perde subito l’accesso al server. I film già sulla sua chiavetta restano: revoca e cancellazione sono passi diversi.']])+
 h('Se qualcosa si ferma')+
 stop([
  ['Il Vito resta senza LTE','Lavoro offline a bordo; casa invariata','Consegna dati, fino al ritorno della rete'],
  ['Internet di casa','Tutta la casa in locale; S2 avvisa','Accesso remoto ai servizi'],
  ['S1 (ingresso servizi)','Accesso diretto di recupero, osservazione esterna','Pubblicazione dei servizi e gestore password']])+
 tech(`<ul><li>Vito W639: C1 Dell 7070 Ultra 8 GB, modem LTE dedicato acceso in continuo, C1 acceso quando serve. Tunnel verso i servizi autorizzati; le interfacce del veicolo non diventano porte verso la LAN di casa.</li><li>Ingressi: Caddy su S1 pubblica solo le rotte autorizzate; Jellyfin e Seafile terminano nella DMZ di M6; Nextcloud e Hermes solo con accesso remoto personale. La gestione degli host non è mai sul percorso pubblico.</li></ul><p>${st(DEC,'Da decidere')} modem e SIM del Vito, accumulo, touchscreen.</p>`)+
 more([['REV4-VITO','Vito'],['REV4-VSYNC','Dati mobili'],['INF-12.03','Accesso esterno'],['world-vito','Ambito Vito']])},

/* 10 --------------------------------------------------------------- */
{s:'Privacy',a:'terzi',i:'⚿',t:'Privacy dei dati e indipendenza',
 o:'Cosa resta in casa, cosa no, e perché.',
 b:()=>lead('I dati personali stanno <b>in casa, su macchine tue</b>. Il cloud si usa dove conviene, per scelta, mai come unico posto e mai come padrone dei tuoi dati.')+
 h('Cosa resta in casa')+
 grid([
  ['Foto e video','','Immich su M2.',st(OK,'')],['Documenti e file','','Paperless e Nextcloud su M2.',st(OK,'')],
  ['Password','','Vaultwarden su S1. Mai sul server esterno.',st(OK,'')],['Immagini delle telecamere','','Frigate su M5.',st(OK,'')],
  ['Domotica','','Home Assistant su M5, dispositivi senza Internet.',st(OK,'')],['Intelligenza artificiale','','Modelli su M3; il cloud solo se lo chiedi.',st(OK,'')]])+
 h('Cosa usa servizi esterni, e perché')+
 tbl(['Servizio','Perché','Se sparisce'],[
  ['Google Workspace (Fogli, Calendar, Gemini)','Lavoro condiviso con la segretaria','Perdi i registri condivisi; i dati personali restano in casa'],
  ['Google Drive','Copia di backup fuori casa','Perdi una copia, non i dati'],
  ['Oracle (S2)','Osservare la casa da fuori','Perdi l’osservatore esterno'],
  ['Accesso remoto (Tailscale)','Entrare in casa da fuori','La casa funziona; l’accesso remoto si riconfigura'],
  ['eWeLink (Sonoff T5)','Unica eccezione domotica','Gli interruttori restano comandabili a parete; si perde il controllo da app'],
  ['Fiscozen','Fatture','Nessun effetto sull’infrastruttura']])+
 warn(`<b>Da decidere:</b> la cifratura della copia su Google Drive. Raccomandazione: cifrare almeno dati privati, lavoro, configurazioni e chiavi; i film possono restare in chiaro.`)+
 h('I principi')+
 grid([
  ['Reti separate','','Rete fidata, zona servizi esterni, domotica locale, domotica cloud, telecamere, ospiti, famiglia. Il firewall decide chi parla con chi.',''],
  ['Ognuno vede il suo','','Un permesso riguarda un servizio e un insieme di dati, mai la rete intera.',''],
  ['Un link è un link','','Condividere un file non apre la cartella né le altre app.',''],
  ['Revoca completa','','Si disattivano account, token, condivisioni e sessioni, e si registra.',''],
  ['Log puliti','','Niente password, token, allegati o immagini private nei registri.',''],
  ['Nessun riconoscimento dei volti','','Né nelle foto né nelle telecamere, all’avvio.','']])+
 h('Indipendenza')+
 `<p class="tg-p">Due uscite su Internet (fibra-rame e 5G). Funzioni essenziali che non chiedono permesso a nessun server esterno. Applicazioni self-hosted, in gran parte open source: nessun abbonamento può chiudere l’accesso ai tuoi dati. Quanto costerebbero gli stessi servizi in abbonamento: <a href="#savings">Risparmio self-hosting</a>.</p>`+
 tech(`<ul><li>M1 (OPNsense, I226-T4) filtra ogni passaggio tra VLAN; il routing inter-VLAN è a 1 GbE. Rete mesh e familiari raggiungono il router del provider senza passare da M1.</li><li>Account di servizio con permessi minimi, mai riusati come amministrativi; console e chiavi nel luogo protetto; indirizzi di recupero registrati fuori dal vault online.</li><li>Procedura aggiornamenti: note di versione → backup e recupero pronti → aggiornamento in finestra → prova dal client → registro.</li></ul>`)+
 more([['INF-02.03','Permessi'],['INF-03.18','Caddy e Vaultwarden'],['INF-12.14','Revoca utenti'],['REV3-RET','Rete e confini']])},

/* 11 --------------------------------------------------------------- */
{s:'Crescita',a:'piano',i:'◷',t:'Come cresce in futuro',
 o:'Si aggiunge solo ciò che le misure giustificano.',
 b:()=>lead('Il sistema cresce <b>per passi misurati</b>: si aggiunge solo ciò che i numeri reali giustificano, e ogni pezzo si può spostare, sostituire o condividere senza rifare tutto.')+
 h('Le fasi','dal 23 dicembre 2026')+
 flow([
  ['23–27 dicembre · Inventario e prove da banco','Sapere cosa funziona prima di toccare la casa. Nessuna cancellazione.'],
  ['Dal 27 dicembre · Arca su Drive','Mettere al sicuro tutti i dati prima di liberare i dischi. La durata la decide l’upload.'],
  ['28 dicembre – 6 gennaio · Rete e nucleo','Firewall, cluster a cinque voti, sentinella, dorsale 10G.'],
  ['Gennaio · Dati e applicazioni','Spostare i dati sulle destinazioni definitive; almeno un recupero eseguito.'],
  ['Gennaio · Vito, primo viaggio','Lavorare senza casa e senza LTE; un rapporto offline registrato una sola volta.'],
  ['Gennaio–febbraio · Domotica, media, telemetria','Acceleratori solo dove servono, dopo i collaudi.'],
  ['Febbraio–marzo · Ottimizzazione','Consolidare solo ciò che è stato misurato.']])+
 h('Margini già previsti')+
 grid([
  ['Disco di M2','','Pool SSD al posto del disco singolo; il controller LSI 9207 è già a magazzino.',st(PRJ,'')],
  ['Telecamere','','Da 4 a 6, con acceleratore Hailo-8.',st(BUY,'')],
  ['Rete 10G','','Le seconde porte di M2 e M4 sono libere.',st(OK,'')],
  ['Memoria','','La RAM si sposta dove serve, in base al monitoraggio.',st(OK,'')],
  ['Cluster','','Il Dell di cucina (C2) è candidato a entrare.',st(PRJ,'')],
  ['Riserva router','','M7 o il Dell T110 II, da collaudare.',st(PRJ,'')],
  ['Monitoraggio','','Zabbix su M1; Prometheus/Grafana solo se servirà.',st(PRJ,'')],
  ['Nuovi ambienti','','Il campo dietro casa entra come ambiente proprio, con lo stesso metodo.',st(PRJ,'')]])+
 h('Crescere insieme ad altri')+
 `<p class="tg-p">Con un’altra sede (amici, famiglia) si collabora <b>condividendo risorse precise, non unendo le reti</b>: copie reciproche cifrate (chi custodisce non può leggere), cartelle Nextcloud federate, calcolo IA prestato con quote, osservazione reciproca. Ognuno resta padrone della propria rete e delle proprie chiavi, e può uscire.</p>`+
 h('Trasportabile e riusabile')+
 `<p class="tg-p">La sala server non è un armadio: si spostano componenti, configurazioni, ordine di avvio e procedure, come in un recupero. Ogni oggetto ha un codice stabile; ciò che avanza si riusa, si vende o si presta con regole chiare (i lotti liberi valgono, in stima prudente, 150–250 € in blocco).</p>`+
 tech(`<p>Principi: quorum non significa risorse sufficienti; nessuna capacità presunta prima delle misure; le scelte hardware si confermano sui collaudi delle schede ricevute (D1581 Q3/Q3A, PCIe, RAM). Punti aperti: mappa porte RJ45, consumi reali, cifratura Drive, modem Vito.</p>`)+
 more([['roadmap','Roadmap'],['REV4-SALA','Sala server trasportabile'],['INF-13.00','Collaborazione fra sedi'],['REV4-RIUSO','Riuso']])},

/* 12 --------------------------------------------------------------- */
{s:'Riepilogo',a:'orient',i:'✓',t:'Riepilogo e scorciatoie',
 o:'Tutto il tour in una pagina.',
 b:()=>lead('Il tour in una pagina: i numeri da ricordare, dove andare per ogni bisogno, cosa resta da decidere.')+
 h('Numeri da ricordare')+
 `<div class="tg-kpi">${[['5','voti nel nucleo, ne bastano 3'],['3','server a richiesta'],['3','luoghi di backup'],['18:00','backup quotidiano'],['5 min','dati persi al massimo (repliche)'],['4 Mbit/s','upload: 23 giorni per 1 TB'],['10 × 50 GB','spazio Seafile per amici'],['7 giorni','eventi delle telecamere']].map(k=>`<div><b>${k[0]}</b><span>${k[1]}</span></div>`).join('')}</div>`+
 h('Se vuoi…')+
 tbl(['Se vuoi…','Vai a'],[
  ['Vedere come è collegato tutto','<a href="#map">Mappa interattiva</a>'],
  ['Provare cosa succede se si rompe qualcosa','<a href="#sim">Simula guasti</a>'],
  ['Sapere quanto consuma e quanto costa','<a href="#power">Consumi e costi</a> · <a href="#savings">Risparmio</a>'],
  ['Leggere le specifiche di una macchina','<a href="#nodes">Anagrafica nodi</a>'],
  ['Cercare un argomento preciso','<a href="#library">Biblioteca schede</a>'],
  ['Capire una parola','<a href="#glossary">Glossario</a>'],
  ['Sapere quando si fa cosa','<a href="#roadmap">Roadmap</a>']])+
 h('Ancora da decidere o acquistare')+
 grid([
  ['Cifratura della copia su Drive','',' ',st(DEC,'Da decidere')],['Telecamere, Hailo-8, centrale e rilevatori','',' ',st(BUY,'Da acquistare')],
  ['Cartucce RDX','',' ',st(BUY,'Da acquistare')],['Intel Arc per M6','',' ',st(BUY,'Da acquistare')],
  ['Modem, SIM e accumulo del Vito','',' ',st(DEC,'Da decidere')],['Mappa delle porte dello switch','',' ',st(DEC,'Da decidere')],
  ['Consumi reali con wattmetro','',' ',st(PRJ,'Da misurare')],['Escalation degli avvisi','',' ',st(DEC,'Da definire')]])+
 more([['tour','Indice del tour'],['home','Panoramica']])}
];

const N=CH.length;
const seen=(()=>{try{return JSON.parse(localStorage.getItem('tour44')||'[]')}catch(e){return []}})();
function mark(n){if(!seen.includes(n)){seen.push(n);try{localStorage.setItem('tour44',JSON.stringify(seen))}catch(e){}}}
const strip=cur=>`<nav class="tg-strip" aria-label="Capitoli del tour">${CH.map((c,i)=>`<a href="#tour/${i+1}" data-area="${c.a}"${i+1===cur?' aria-current="page"':''}${seen.includes(i+1)?' data-seen':''}><i>${i+1}</i><span>${c.s}</span></a>`).join('')}</nav>`;

function cover(){
  return head('Tour guidato','Il sistema dal punto di vista di chi lo usa','Un percorso completo e autonomo in '+N+' capitoli: lavoro, domotica, sicurezza, servizi, recupero, postazioni, privacy e futuro. Ogni capitolo si legge da solo, in pochi minuti, anche dal telefono.','Percorso')+
  `<a class="tg-start" href="#tour/${seen.length&&seen.length<N?Math.min(N,Math.max(...seen)+1):1}"><b>${seen.length&&seen.length<N?'Riprendi il tour':'Inizia il tour'}</b><span>${seen.length?seen.length+' di '+N+' capitoli letti':'Circa 25 minuti in tutto'}</span><i>→</i></a>`+
  `<div class="tg-how"><div><b>Sintesi</b><span>In cima a ogni capitolo, per chiunque.</span></div><div><b>Scenari</b><span>Cosa vivi tu, nella pratica.</span></div><div><b>Se si ferma</b><span>Cosa continua e cosa no.</span></div><div><b>Dettaglio tecnico</b><span>Richiudibile, per sistemisti.</span></div></div>`+
  `<ol class="tg-index">${CH.map((c,i)=>`<li><a href="#tour/${i+1}" data-area="${c.a}"${seen.includes(i+1)?' data-seen':''}><i>${i+1}</i><span class="tg-ic">${c.i}</span><div><b>${c.t}</b><small>${c.o}</small></div><em>${seen.includes(i+1)?'✓':'→'}</em></a></li>`).join('')}</ol>`;
}
function chapter(n){
  const c=CH[n-1];mark(n);
  const prev=n>1?CH[n-2]:null,next=n<N?CH[n]:null;
  return `<div class="tg-top"><a href="#tour">Tour guidato</a><span>Capitolo ${n} di ${N}</span></div><div class="tg-prog"><i style="width:${(n/N*100).toFixed(1)}%"></i></div>`+strip(n)+
  `<article class="tg-ch" data-area="${c.a}"><header class="tg-ch-h"><span class="tg-ch-n">${n}</span><div><p class="eyebrow">${X(c.s)}</p><h1>${X(c.t)}</h1></div></header>${c.b()}</article>`+
  `<nav class="tg-pn">${prev?`<a href="#tour/${n-1}" class="tg-prev"><small>← Capitolo ${n-1}</small><b>${X(prev.t)}</b></a>`:`<a href="#tour" class="tg-prev"><small>←</small><b>Indice del tour</b></a>`}${next?`<a href="#tour/${n+1}" class="tg-next"><small>Capitolo ${n+1} →</small><b>${X(next.t)}</b></a>`:`<a href="#home" class="tg-next"><small>Fine del tour →</small><b>Panoramica</b></a>`}</nav>`;
}
pages.tour=cover;
CH.forEach((c,i)=>{pages['tour/'+(i+1)]=()=>chapter(i+1)});

const h0=pages.home;
pages.home=function(){return `<a class="tourban" href="#tour"><b>Tour guidato</b><span>Il sistema dal punto di vista di chi lo usa, in ${N} capitoli leggibili anche dal telefono</span><i>→</i></a>`+h0()};

const nav=document.getElementById('nav');
if(nav&&!nav.querySelector('[data-nav="tour"]')){const f=nav.querySelector('[data-nav="home"]');if(f)f.insertAdjacentHTML('afterend','<a class="navlink" data-area="orient" href="#tour" data-nav="tour"><span class="navicon" aria-hidden="true">➜</span>Tour guidato</a>')}

const prevRender=render;
window.removeEventListener('hashchange',prevRender);
render=function(){
  prevRender();
  const r=decodeURIComponent(location.hash.slice(1)||'home');
  if(!r.startsWith('tour'))return;
  const n=Number(r.split('/')[1])||0;
  document.querySelectorAll('[data-nav]').forEach(el=>{const a=el.dataset.nav==='tour';el.classList.toggle('active',a);if(a)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current')});
  const cr=document.getElementById('crumb');if(cr)cr.textContent=n?'Tour · '+n+'. '+CH[n-1].s:'Tour guidato';
  if(n){const at=document.querySelector('.tg-ch .eyebrow .areatag');if(at)at.remove();document.body.dataset.area=CH[n-1].a;document.getElementById('main').dataset.area=CH[n-1].a;document.title=CH[n-1].t+' · Tour · Rev 4.4';const a=document.querySelector('.tg-strip [aria-current]');if(a)a.scrollIntoView({block:'nearest',inline:'center'})}
};
window.addEventListener('hashchange',render);
render();
})();
