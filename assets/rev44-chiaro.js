'use strict';
/* Strato "chiaro e concreto" della rev 4.4: testi per profani e sistemisti, colori per area,
   glossario e simulatore di guasti ricalcolato sull'architettura 4.4 (nucleo a 5 voti, quorum 3). */
(function(){

/* ---------- SCHEDE RISCRITTE: stesso testo per tutti i codici che condividevano il contenuto ---------- */
if(window.SCHEDE_G){window.SCHEDE_G.forEach(g=>g.codes.forEach(code=>{const c=lookup[code];if(!c)return;
  const others=g.codes.filter(x=>x!==code);
  const note=others.length?'<p class="dupnote">Questo testo vale anche per le schede: '+others.map(x=>'<a href="#'+x+'">'+x+'</a>').join(' · ')+'.</p>':'';
  c.html=g.html+note+g.tails[code];c.plain=g.plain;if(g.title)c.title=g.title;c.rewritten=true;}));}
const AREAS={
 orient:{label:'Orientamento',desc:'Come leggere il faldone'},
 infra:{label:'Infrastruttura',desc:'Macchine, rete, rack'},
 dati:{label:'Dati e copie',desc:'Dischi, backup, recupero'},
 sim:{label:'Continuità',desc:'Cosa succede se si guasta'},
 vito:{label:'Vito',desc:'Nodo mobile di lavoro'},
 casa:{label:'Casa e ambienti',desc:'Domotica e videosorveglianza'},
 server:{label:'Sala server',desc:'Rack, aria, energia'},
 lab:{label:'Laboratorio',desc:'Postazioni e lavoro'},
 terzi:{label:'Servizi a terzi',desc:'Amici e collaboratori'},
 inv:{label:'Inventario',desc:'Pezzi, foto, riuso'},
 piano:{label:'Attuazione',desc:'Calendario, acquisti, prove'},
 sinergie:{label:'Sinergie',desc:'Come collaborano i rami'}
};
const ROUTE_AREA={home:'orient',guide:'orient',glossary:'orient',library:'orient',downloads:'orient',changes:'piano',
 atlas:'infra',nodes:'infra',network:'infra',clients:'infra',rack:'server',field:'casa',
 storage:'dati',sim:'sim',synergy:'sinergie',worlds:'sinergie',
 'world-vito':'vito',vito:'vito','world-home':'casa','world-server':'server','world-lab':'lab','world-guests':'terzi','world-reuse':'inv',
 inventory:'inv',reuse:'inv',roadmap:'piano',acquisitions:'piano',services:'infra',power:'infra'};
function areaOf(route){
  if(ROUTE_AREA[route])return ROUTE_AREA[route];
  if(route.startsWith('node/'))return 'infra';
  if(route.startsWith('inventory/'))return 'inv';
  const c=lookup[route];
  if(c){
    if(/^REV4-V|^REV4-VITO/.test(c.code))return 'vito';
    if(/^REV4-(RACK|SALA)/.test(c.code))return 'server';
    if(/^REV4-(DOM|CAMPO)/.test(c.code))return 'casa';
    if(/^REV4-(LAB|CLIENT)/.test(c.code))return 'lab';
    if(/^REV4-TERZI/.test(c.code))return 'terzi';
    if(/^REV4-RIUSO/.test(c.code))return 'inv';
    if(/^REV4-(SIN|ECO)/.test(c.code))return 'sinergie';
    if(c.scope==='roadmap')return 'piano';
    if(/BCK|STO|MAP|CLOUD|MIG/.test(c.code))return 'dati';
    return 'infra';
  }
  return 'orient';
}
const ar=(k,t)=>`<span class="areatag" data-area="${k}">${E(t||AREAS[k].label)}</span>`;
const fold=(title,html,open=false)=>`<details class="fold"${open?' open':''}><summary>${E(title)}</summary><div>${html}</div></details>`;
const twoLevel=(simple,tech)=>`<div class="levels"><section class="level simple"><span class="levelname">In parole semplici</span>${simple}</section><section class="level tech"><span class="levelname">Per il tecnico</span>${tech}</section></div>`;
const P=a=>a.map(s=>'<p>'+s+'</p>').join('');
const UL=a=>'<ul>'+a.map(s=>'<li>'+s+'</li>').join('')+'</ul>';
const hd=(k,tag,title,desc,badgeText)=>head(tag,title,desc,badgeText===undefined?'Progetto di riferimento':badgeText);

/* ---------- PAGINA INIZIALE ---------- */
pages.home=()=>hd('orient','Faldone dell’infrastruttura informatica · Revisione 4.4','Casa, laboratorio e veicolo di lavoro: che cosa c’è, come funziona, che cosa succede se si guasta.','Documento di progetto del 1 novembre 2026. Descrive l’infrastruttura informatica di casa, del laboratorio e del furgone Vito: le macchine, i collegamenti, dove stanno i dati, come ci si protegge dai guasti e in che ordine si attiva tutto. È scritto per essere letto da chi non è del mestiere e consultato da un sistemista.','Rev 4.4 · 1 novembre 2026')+
`<div class="statebox"><strong>Stato del documento.</strong> L’architettura descritta è il <b>progetto di riferimento</b> da attivare a partire dal 23 dicembre 2026. Una funzione indicata come «prevista», «proposta» o «da collaudare» non è già installata né provata. Dove un dato non è noto è scritto <b>n.d.</b> e non viene sostituito da una stima.</div>`+
section('Che cos’è, in tre frasi')+
twoLevel(
 P(['Tutto ciò che serve in casa e in laboratorio, dai documenti condivisi alle foto, dalla domotica alle telecamere, dai film agli strumenti di lavoro, gira su computer di proprietà tenuti in una sala server, non su abbonamenti a servizi di terzi.','Le macchine si dividono in due gruppi: <b>cinque sempre accese</b> che reggono i servizi di base e si coprono a vicenda, e <b>tre accese solo quando servono</b> (intelligenza artificiale, archivi e backup, film e condivisioni).','Se una macchina si guasta, il progetto dice quali servizi continuano, quali si fermano e che cosa fare. Nessun servizio importante dipende da una sola macchina senza un piano di recupero scritto.']),
 P(['Cluster Proxmox VE locale a <b>5 voti</b> (M1, M2, M5, C3, C4), quorum 3, senza qdevice. M3, M4 e M6 sono host Proxmox autonomi, fuori dal quorum, accesi su richiesta con Wake-on-LAN. S4 è la sentinella indipendente, senza voto.','Rete: firewall OPNsense in VM su M1, doppia WAN (FTTC con 4 Mbit/s in upload + router 5G), switch LGS352C-EU con 48 porte 1 GbE e 4 SFP+ da 10 GbE, dorsale 10 GbE su M2, M3, M4 e M6.','Dati: M2 ospita applicazioni e dati su un solo NVMe (Crucial P310 4 TB, senza ridondanza locale); M4 conserva i backup in RAIDZ2 e i media in un pool separato; copie remote su Drive e offline su cartucce RDX.']))+
section('Le cifre di base')+stats([['5','macchine','Nucleo sempre acceso: M1, M2, M5, C3, C4'],['3','macchine','Accese su richiesta: M3, M4, M6'],['352','GB','Memoria complessiva dei sei server M1–M6'],['10','GbE','Dorsale tra i quattro server principali']])+
section('Da dove cominciare')+
`<div class="paths"><div class="path" data-area="orient"><h3>Se non sei del mestiere</h3><ol><li>${link('glossary','Glossario','')}: poche parole spiegate con calma.</li><li>${link('sim','Simula un guasto','')}: spegni una macchina e vedi che cosa resta in funzione.</li><li>${link('worlds','I sei ambiti','')}: casa, sala server, laboratorio, Vito, terzi, inventario.</li></ol></div><div class="path" data-area="infra"><h3>Se sei un sistemista</h3><ol><li>${link('atlas','Atlante tecnico','')}: rack, rete, client e anagrafica.</li><li>${link('nodes','Anagrafica dei nodi','')}: CPU, RAM, dischi, schede, servizi.</li><li>${link('network','Rete e quorum','')} e ${link('storage','Dati e copie','')}.</li><li>${link('library','Biblioteca','')}: le schede complete con i codici del faldone stampato.</li></ol></div><div class="path" data-area="piano"><h3>Se devi attuarlo</h3><ol><li>${link('roadmap','Roadmap','')}: fasi, condizioni di passaggio e ritorno indietro.</li><li>${link('acquisitions','Acquisti e verifiche','')}: che cosa è arrivato, che cosa manca.</li><li>${link('changes','Cosa cambia dalla 4.3','')}.</li></ol></div></div>`+
section('Le aree del faldone','')+
`<div class="grid areas">${[['atlas','infra','Infrastruttura','Le macchine, la rete e le postazioni. Che cosa fa ciascuna e come sono collegate.'],['storage','dati','Dati e copie','Dove stanno i dati, come si copiano e come si recuperano.'],['sim','sim','Continuità','Che cosa resta acceso quando una macchina si ferma o manca la corrente.'],['world-server','server','Sala server','Il rack, l’aria, l’energia e il cablaggio.'],['world-home','casa','Casa e ambienti','Domotica, telecamere, sensori e il campo dietro casa.'],['world-lab','lab','Laboratorio','Postazioni di lavoro e strumenti per le attività.'],['world-vito','vito','Vito','Il furgone come ufficio mobile che lavora anche senza copertura.'],['world-guests','terzi','Servizi a terzi','Che cosa viene messo a disposizione di amici e collaboratori, e con quali limiti.'],['world-reuse','inv','Inventario e riuso','Ogni pezzo ha un codice. Che cosa è libero, che cosa si può vendere o cedere.'],['roadmap','piano','Attuazione','Il calendario, gli acquisti e le prove da superare passo per passo.']].map(a=>`<a class="tile linked" data-area="${a[1]}" href="#${a[0]}"><span class="num">${AREAS[a[1]].label.toUpperCase()}</span><h3>${a[2]}</h3><p>${a[3]}</p><div class="tail"><span>Apri</span><span aria-hidden="true">↗</span></div></a>`).join('')}</div>`+
section('Come leggere i colori e gli stati')+
`<div class="legend">${Object.entries(AREAS).filter(([k])=>k!=='sinergie').map(([k,v])=>`<span class="legendchip" data-area="${k}"><i></i>${v.label}</span>`).join('')}</div><p class="muted">Ogni area ha un colore: lo ritrovi nel menu, nell’intestazione della pagina e nei riquadri. Gli stati sono sempre gli stessi: <b>Disponibile</b> = materiale già posseduto; <b>Acquisto dichiarato</b> = ordinato ma consegna e collaudo non attestati; <b>Previsto / proposto</b> = attività futura; <b>Collaudato</b> = provato, e viene scritto solo quando c’è la prova.</p>`;

/* ---------- GLOSSARIO ---------- */
const GLOSS=[
['Nodo','Un computer dell’infrastruttura. Nel faldone ha una sigla: M1–M6 sono i server principali, S1–S4 i dispositivi di supporto, C1–C4 mini PC Dell, MP i portatili.'],
['Cluster','Più computer che lavorano come un gruppo e si coprono a vicenda. Qui il gruppo è formato da cinque nodi: M1, M2, M5, C3, C4.'],
['Quorum','La regola della maggioranza. Ogni nodo del cluster ha un voto; il gruppo continua a lavorare solo se almeno la maggioranza dei voti è raggiungibile (qui 3 su 5). Evita che due metà isolate decidano ciascuna per conto proprio.'],
['Proxmox VE','Il programma installato sui server che permette di far girare più computer virtuali su un’unica macchina fisica.'],
['VM (macchina virtuale)','Un computer simulato dentro un server. Una VM si può spostare o ripristinare più facilmente di un computer fisico.'],
['Alta disponibilità (HA)','Un servizio che, se la macchina su cui gira si ferma, riparte su un’altra con una copia dei suoi dati. Non vale per tutti i servizi: nel faldone sono indicati uno per uno.'],
['RPO e RTO','RPO = quanti dati si possono perdere al massimo (es. gli ultimi 5 minuti). RTO = in quanto tempo il servizio torna disponibile. Sono obiettivi di progetto, non risultati misurati.'],
['Backup e ridondanza','Sono due cose diverse. La ridondanza (es. due dischi uguali) evita il fermo se un disco si rompe. Il backup è una copia separata che permette di recuperare i dati dopo un errore o un guasto grave, ma richiede tempo.'],
['OPNsense','Il programma che fa da firewall e router: decide chi può entrare e uscire dalla rete. Gira in una VM su M1.'],
['WAN e FTTC','WAN è il collegamento a internet. FTTC è la fibra fino all’armadio di strada con ultimo tratto in rame: è la linea principale di casa, con soli 4 Mbit/s in upload.'],
['VLAN','Una rete separata dentro lo stesso cavo e lo stesso switch. Serve per tenere distinti, per esempio, i dispositivi della domotica dai computer di lavoro.'],
['10 GbE e SFP+','Collegamento di rete a 10 gigabit al secondo, dieci volte più veloce del normale gigabit. SFP+ è il tipo di porta usato dallo switch per questi collegamenti.'],
['Wake-on-LAN (WoL)','Un comando di rete che accende da remoto una macchina spenta. Permette di tenere spenti i server pesanti finché non servono.'],
['Sentinella (S4)','Un piccolo dispositivo indipendente che controlla gli altri e può mandare i comandi di accensione. Non ha voto nel cluster.'],
['ZFS, RAIDZ1, RAIDZ2','Sistema di gestione dei dischi con controllo di integrità. RAIDZ1 tollera il guasto di un disco, RAIDZ2 di due. Tollerare un guasto non sostituisce il backup.'],
['ARC','La memoria RAM che ZFS usa come cache per rendere più rapidi i dati letti spesso.'],
['NVMe / SSD / HDD','Tre tipi di disco: gli SSD NVMe sono i più veloci, gli HDD a piatti i più capienti ed economici. SMR è una tecnologia di HDD più lenta nelle riscritture.'],
['RDX','Cartucce di disco rimovibili, tenute scollegate, usate per copie offline di foto, documenti e lavoro.'],
['TDP','Potenza termica nominale del processore indicata dal costruttore. Non è il consumo reale del computer alla presa.'],
['Home Assistant, MQTT, Zigbee','Home Assistant è il centro della domotica. MQTT è il canale con cui i sensori e il centro si scambiano messaggi. Zigbee è il tipo di radio usata dai sensori; la chiavetta radio sta su S3, indipendente da M5.'],
['Frigate e Hailo','Frigate analizza le telecamere e registra gli eventi; Hailo-8 è la scheda che accelera il riconoscimento di persone e oggetti.'],
['IoT','Dispositivi collegati alla rete come sensori, prese e luci smart. Stanno in una rete separata.'],
['Dorsale','Il collegamento principale ad alta velocità tra i server e lo switch.'],
['n.d.','Dato non disponibile. Il faldone non lo sostituisce con quello di un modello simile.']];
pages.glossary=()=>hd('orient','Glossario','Le parole del faldone, spiegate senza dare nulla per scontato.','Poche parole tecniche tornano ovunque. Qui sono spiegate in modo semplice e, dove serve, con il significato preciso che hanno in questo progetto.','')+`<div class="gloss">${GLOSS.map(g=>`<div class="glossrow"><dt>${E(g[0])}</dt><dd>${E(g[1])}</dd></div>`).join('')}</div>`;

/* ---------- AMBITI ---------- */
const oldWorlds=pages.worlds;
pages.worlds=()=>hd('sinergie','Gli ambiti','Sei ambiti, ciascuno in grado di funzionare con le proprie risorse.','Casa, sala server, laboratorio, Vito, servizi a terzi e inventario hanno ciascuno una missione, strumenti propri e confini precisi. Si collegano tra loro per scelta: nessuno richiede che gli altri siano accesi.')+worldCards()+diagram('ecosistema','Mappa delle relazioni tra gli ambiti.')+cardtiles(['REV4-ECO','REV4-SIN']);

/* ---------- ATLANTE ---------- */
pages.atlas=()=>hd('infra','Atlante tecnico','Dalla disposizione fisica al singolo componente.','Qui si trovano le mappe, le schede di ogni macchina e i collegamenti. Si parte dalla visione d’insieme e si scende fino alla porta, al disco e al codice di inventario.')+`<div class="grid">${tile('rack','La sala server','Come sono disposte le macchine nel rack, il percorso dell’aria, la dorsale e l’energia.','01 · STRUTTURA')}${tile('network','Rete e quorum','Quattro collegamenti a 10 GbE, le reti separate e le regole del cluster.','02 · CONNESSIONI')}${tile('clients','Le postazioni','Computer nelle stanze, a bordo e presso altre persone.','03 · DISTRIBUZIONE')}${tile('nodes','Anagrafica dei nodi','Processore, memoria, dischi, schede e servizi di ogni macchina.','04 · ANAGRAFICA')}${tile('inventory','Inventario con foto','Ogni pezzo con codice, quantità, foto e destinazione.','05 · COMPONENTI')}${tile('sim','Simulatore di guasti','Spegni una macchina e vedi quali servizi restano attivi.','06 · CONTINUITÀ')}</div>`+diagram('rete-10g','Rete: quattro collegamenti a 10 GbE dai server allo switch.');

/* ---------- ANAGRAFICA NODI ---------- */
const oldNodes=pages.nodes;
pages.nodes=()=>oldNodes().replace(/<div class="pagehead">[\s\S]*?<\/div><\/div>(?=<div class="stats">)/,hd('infra','Atlante / anagrafica nodi','Ogni macchina, con le sue caratteristiche e il suo compito.','Per ciascun nodo sono riportati processore, memoria, dischi, schede di rete e servizi ospitati. Il badge indica se è nel nucleo sempre acceso o se si accende su richiesta. Il TDP è la potenza nominale del processore, non il consumo reale.'));

/* ---------- RETE ---------- */
const oldNetwork=pages.network;
pages.network=()=>hd('infra','Atlante / rete e continuità','Come sono collegate le macchine e come si decide chi comanda.','La rete ha due compiti: portare i servizi alle persone e far parlare i server tra loro. Il cluster decide per maggioranza chi continua a lavorare quando una macchina manca.')+
twoLevel(P(['I server principali sono collegati a uno switch con cavi veloci (10 gigabit). Il firewall (M1) separa la rete di casa da internet e dalle altre reti: dispositivi smart, ospiti e lavoro non si vedono tra loro se non dove autorizzato.','Cinque macchine formano un gruppo che decide a maggioranza: finché ne restano raggiungibili almeno tre, il gruppo continua a lavorare. Le altre tre macchine, più pesanti, si accendono solo quando servono e non votano.']),P(['Switch LGS352C-EU: 48 × 1 GbE RJ45 + 4 × SFP+ 10 GbE (porte 49–52 per M2, M3, M4, M6), non PoE, VLAN 802.1Q, routing tra VLAN via M1. Il link M1–switch è in rame a 1 GbE.','Corosync a 5 voti (M1, M2, M5, C3, C4), expected_votes 5, quorum 3. Senza qdevice nella base: S4 è sentinella e primo mittente WoL, non vota. S2 (Oracle Always Free) osserva dall’esterno e non vota.']))
+diagram('rete-10g','Rete 10 GbE: quattro server direttamente sullo switch.')+stats([['5','voti','Membri del cluster'],['3','voti','Quorum necessario'],['4 × 10','GbE','Porte SFP+ dei server'],['4','Mbit/s','Upload della linea FTTC']])+
callout('Quorum e subentro sono due cose diverse','Il quorum dice solo se il gruppo può continuare a decidere. Perché un servizio riparta su un’altra macchina servono anche RAM, spazio disco e una copia dei dati aggiornata, da collaudare per ogni servizio.')+
section('Collegamenti e confini')+table(['Da','Funzione','A','Regola o limite'],C.net)+
section('Se qualcosa si ferma')+table(['Evento','Che cosa resta','Limite'],C.availability)+
`<div class="actions">${link('sim','Prova tu stesso: simula un guasto','btn')}</div>`+cardtiles(['REV3-RET','REV3-HA','REV4-MON']);

/* ---------- DATI ---------- */
pages.storage=()=>hd('dati','Dati e copie','Dove stanno i dati, e come si recuperano se qualcosa va storto.','Dati attivi, backup e archivi hanno compiti distinti e stanno su supporti diversi. Avere due dischi non è un backup, e un backup non evita il fermo: servono entrambi, per scopi diversi.')+
twoLevel(P(['I dati usati ogni giorno (documenti, foto, applicazioni personali) stanno su M2. I backup stanno su M4, acceso solo quando serve. Una terza copia va su un servizio remoto (Drive) e una quarta su cartucce tenute scollegate.','Il disco di M2 è singolo: se si rompe, i servizi che ospita si fermano finché non si ripristina dalla copia. Le copie permettono di recuperare i dati, non di evitare il fermo.']),P(['M2: Sabrent Rocket 512 GB (boot) + Crucial P310 4 TB (dati), NVMe singolo senza ridondanza locale, in attesa del pool SSD. M4: 6 × WD 1 TB in RAIDZ2 (~4 TB, solo backup versionati, snapshot alle 18:00) e 4 × ST2000 2 TB SMR in RAIDZ1 (~6 TB, media). M5: mirror 2 × 1 TB per Frigate (7 giorni di eventi, 4 camere).','Copia remota: Drive (5 TB dichiarati liberi, volume dati ancora da misurare, upload FTTC 4 Mbit/s: ~23 giorni per 1 TB). Copia offline: 3 cartucce RDX HP 2 TB (foto/video, documenti, lavoro), proposte e ancora da acquistare.']))+
`<div class="flow"><div><b>M2 · dati attivi</b><small>Applicazioni e dati personali su un solo SSD NVMe: il backup consente il recupero, non evita il fermo.</small></div><div><b>M4 · backup locali</b><small>Copie versionate sui WD in RAIDZ2. I media stanno in un pool separato, non sui dischi di backup.</small></div><div><b>Drive · copia remota</b><small>Copia fuori casa e area di transizione per liberare l’archivio vecchio. Procedure nella roadmap.</small></div><div><b>RDX · copia offline</b><small>Tre cartucce scollegate per categorie. Non sono tre copie dello stesso insieme.</small></div></div>`+
section('Mappa dei dischi')+table(['Sede','Supporto','Funzione','Caratteristica'],C.disks)+
callout('Con 4 Mbit/s in upload i tempi sono lunghi','1 TB richiede circa 23 giorni di trasferimento continuo teorico, 2 TB circa 46. La SIM di casa da 500 GB non basta per spostare terabyte: per questo la transizione è a fasi e le copie locali vengono prima.')+cardtiles(['REV3-BCK','REV4-MIG','REV3-CLOUD']);

/* ---------- GUIDA ---------- */
pages.guide=()=>hd('orient','Come usare il faldone','Come è organizzato, come cercare, che cosa significano gli stati.','Il faldone è un sito consultabile anche senza internet, con le stesse schede e gli stessi codici della versione stampata e dei PDF.','')+`<div class="grid">${tile('glossary','Capire le parole','Un glossario per chi non è del mestiere.','ORIENTAMENTO')}${tile('library','Cercare','Premi / per cercare. Filtra per capitolo e raccogli le schede nei preferiti.','BIBLIOTECA')}${tile('roadmap','Seguire il percorso','Le spunte della roadmap restano nel tuo browser e si esportano.','ATTUAZIONE')}</div>`+
`<article class="doc spaced"><h2>Che cosa è reale e che cosa è progetto</h2><p>Le sezioni sull’architettura descrivono la configurazione di riferimento 4.4. La roadmap raccoglie acquisti, consegne, migrazioni e prove. «Previsto», «proposto», «offerta» e «acquisto dichiarato» indicano attività future o non verificate; solo «collaudato» indica una prova eseguita.</p><h2>Colori</h2><p>Ogni area ha un colore (menu, intestazione, riquadri): infrastruttura, dati, continuità, sala server, casa, laboratorio, Vito, terzi, inventario, attuazione.</p><h2>Valori tecnici e foto</h2><p>I valori sono quelli nominali del costruttore. «n.d.» indica un dato non disponibile. Le foto sono dell’esemplare, del lotto o di repertorio e sono sempre etichettate.</p><h2>Offline e privacy</h2><p>Il sito non contatta servizi esterni. Preferiti, tema e spunte sono salvati solo nel browser. Nulla di ciò che compare qui modifica server, cloud, veicolo o registri.</p></article>`;

/* ---------- SIMULATORE DI GUASTI ---------- */
const SIMNODES=[
 {g:'core',id:'M1',n:'Rete e osservabilità',vote:1},{g:'core',id:'M2',n:'Applicazioni e dati',vote:1},{g:'core',id:'M5',n:'Domotica e visione',vote:1},{g:'core',id:'C3',n:'Subentro domotica',vote:1},{g:'core',id:'C4',n:'Subentro applicazioni',vote:1},
 {g:'req',id:'M3',n:'Calcolo IA'},{g:'req',id:'M4',n:'Archivi e backup'},{g:'req',id:'M6',n:'Media e condivisione'},
 {g:'sup',id:'S1',n:'Ingressi e utilità'},{g:'sup',id:'S2',n:'Controllo esterno (cloud)'},{g:'sup',id:'S3',n:'Radio Zigbee'},{g:'sup',id:'S4',n:'Sentinella e accensione remota'},
 {g:'cli',id:'MP3',n:'Portatile Acer del laboratorio'},{g:'cli',id:'C1',n:'Vito (nodo mobile)'}];
const GROUPS={core:['Nucleo del cluster · 5 voti, quorum 3','Sempre acceso. Se ne restano almeno 3 raggiungibili, il gruppo decide.'],req:['Server a richiesta · non votano','Acceso solo quando serve, fuori dal quorum.'],sup:['Supporto · non votano','Piccoli dispositivi e un servizio cloud.'],cli:['Postazioni e mobile','Fuori dal cluster.']};
const PRESETS=[['M1 guasto',['M1']],['M2 guasto',['M2']],['M5 guasto',['M5']],['Due membri guasti',['M2','M5']],['M3/M4/M6 spenti',['M3','M4','M6']],['S4 guasto',['S4']],['Vito senza rete',['C1']]];
let simDown=new Set();
const tok=s=>(String(s).match(/\b(?:MP\d|M\d|S\d|C\d)\b/g)||[]);
function svcStatus(r){
  const t=tok(r[1]),name=r[0];
  if(!t.length)return {k:'ext',t:'Non dipende dai nodi del faldone',note:'servizio esterno o dispositivo autonomo'};
  const isFail=/->/.test(r[1]);
  const votes=SIMNODES.filter(n=>n.vote&&!simDown.has(n.id)).length,quorum=votes>=3;
  if(isFail){const p=t[0],b=t[1];
    if(!simDown.has(p))return {k:'ok',t:'In funzione su '+p};
    if(!simDown.has(b)&&quorum)return {k:'warn',t:'Può ripartire su '+b,note:'solo se le repliche sono state collaudate; si perde al massimo l’ultimo intervallo di replica'};
    return {k:'down',t:'Fermo',note:(simDown.has(b)?'anche il nodo di subentro '+b+' è fermo':'senza quorum non si fa subentro')};}
  const up=t.filter(x=>!simDown.has(x)),dn=t.filter(x=>simDown.has(x));
  if(!dn.length)return {k:'ok',t:'In funzione'};
  if(!up.length)return {k:'down',t:'Fermo',note:'dipende da '+dn.join(', ')};
  return {k:'warn',t:'Parziale',note:'manca '+dn.join(', ')+'; resta '+up.join(', ')};
}
const STL={ok:'In funzione',warn:'Limitato',down:'Fermo',ext:'Indipendente'};
function simPanel(){
  const votes=SIMNODES.filter(n=>n.vote&&!simDown.has(n.id)).length,quorum=votes>=3;
  const sv=C.services.map(r=>({r,s:svcStatus(r)}));
  const cnt=k=>sv.filter(x=>x.s.k===k).length;
  const downList=[...simDown].join(', ')||'nessuna';
  return `<div class="simsummary"><div class="simq ${quorum?'ok':'down'}"><b>${votes} / 5</b><span>voti raggiungibili</span><em>${quorum?'Quorum presente (servono 3): il cluster decide':'Quorum perso (servono 3): le VM del nucleo si fermano per sicurezza'}</em></div><div class="simcount"><div class="ok"><b>${cnt('ok')}</b>in funzione</div><div class="warn"><b>${cnt('warn')}</b>limitati</div><div class="down"><b>${cnt('down')}</b>fermi</div><div class="ext"><b>${cnt('ext')}</b>indipendenti</div></div></div>`+
  `<p class="muted">Macchine ferme: <b>${E(downList)}</b>. ${simDown.size?'':'Tocca una macchina per spegnerla, oppure scegli un caso tipico.'}</p>`+
  `<div class="tablewrap"><table class="datatable"><thead><tr><th scope="col">Servizio</th><th scope="col">Dove gira</th><th scope="col">Stato</th><th scope="col">Nota</th></tr></thead><tbody>${sv.map(x=>`<tr><td>${E(x.r[0])}</td><td>${E(x.r[1])}</td><td><span class="stpill ${x.s.k}">${E(x.s.t)}</span></td><td>${E((x.s.note?x.s.note+'. ':'')+(x.s.k==='down'||x.s.k==='warn'?x.r[3]:''))}</td></tr>`).join('')}</tbody></table></div>`;
}
function simView(){
  return `<div class="simnodes">${Object.entries(GROUPS).map(([g,[title,sub]])=>`<section class="simgroup"><h3>${E(title)}</h3><p class="muted">${E(sub)}</p><div class="simrow">${SIMNODES.filter(n=>n.g===g).map(n=>`<button type="button" class="simnode ${simDown.has(n.id)?'off':''}" data-simnode="${n.id}" aria-pressed="${simDown.has(n.id)}"><b>${n.id}</b><span>${E(n.n)}</span><em>${simDown.has(n.id)?'Spenta / guasta':'Accesa'}</em></button>`).join('')}</div></section>`).join('')}</div><div class="actions simpresets">${PRESETS.map((p,i)=>`<button class="btn ghost" data-simpreset="${i}">${E(p[0])}</button>`).join('')}<button class="btn ghost" data-simreset>Riaccendi tutto</button></div><div id="sim-out" aria-live="polite">${simPanel()}</div>`;
}
pages.sim=()=>hd('sim','Simulatore di guasti','Spegni una macchina e guarda che cosa resta in funzione.','Il simulatore applica le regole del progetto 4.4 (cluster a 5 voti, quorum 3, servizi con il loro nodo principale e di subentro). Non misura un impianto acceso: mostra che cosa il progetto prevede.')+
callout('Come si legge','Il nucleo ha 5 voti e ne servono 3. Le macchine a richiesta, i supporti e le postazioni non votano. Un servizio «può ripartire» su un’altra macchina solo se la copia dei suoi dati è stata collaudata: il simulatore non lo presume.')+`<div id="sim-root">${simView()}</div>`+section('Casi descritti nel progetto')+table(['Evento','Che cosa resta','Limite'],C.availability)+cardtiles(['REV3-HA','REV4-MON']);

/* ---------- NAV A COLORI ---------- */
const NAV=[
 ['Orientamento',[['home','Panoramica','⌂','orient'],['glossary','Glossario','Aa','orient'],['guide','Come usare il faldone','?','orient']]],
 ['Infrastruttura',[['atlas','Atlante tecnico','▦','infra'],['nodes','Anagrafica nodi','▤','infra'],['network','Rete e quorum','⌘','infra'],['storage','Dati e copie','◫','dati'],['sim','Simula guasti','⚡','sim']]],
 ['Ambiti',[['world-server','Sala server','▤','server'],['world-home','Casa e ambienti','◉','casa'],['world-lab','Laboratorio','⊞','lab'],['world-vito','Vito','↗','vito'],['world-guests','Servizi a terzi','◎','terzi'],['world-reuse','Inventario e riuso','◇','inv']]],
 ['Attuazione e archivio',[['roadmap','Roadmap','◷','piano'],['inventory','Foto e inventario','▧','inv'],['library','Biblioteca schede','≡','orient'],['synergy','Sinergie','⇄','sinergie'],['downloads','Formati e download','↓','orient']]]];
$('#nav').innerHTML=NAV.map(([t,items])=>'<div class="navgroup">'+E(t)+'</div>'+items.map(([id,l,ic,a])=>`<a class="navlink" data-area="${a}" href="#${id}" data-nav="${id}"><span class="navicon" aria-hidden="true">${ic}</span>${E(l)}</a>`).join('')).join('');
const brand=document.querySelector('.brand');if(brand)brand.innerHTML='<span class="brand-mark">F</span><span><strong>Il Faldone</strong><small>Infrastruttura informatica · Rev 4.4</small></span>';
const sb=document.querySelector('.side-bottom');if(sb)sb.innerHTML='<div class="edition">Revisione 4.4 · 1 novembre 2026</div><p>Casa, laboratorio e Vito. Progetto di riferimento: nulla di «previsto» è dichiarato già installato.</p><a href="#guide">Come usare il faldone</a>';

/* ---------- RENDER: colore area, titoli, eventi ---------- */
const prevRender=render;
window.removeEventListener('hashchange',prevRender);
render=function(){
  prevRender();
  const route=decodeURIComponent(location.hash.slice(1)||'home'),area=areaOf(route);
  document.body.dataset.area=area;
  const labels=Object.fromEntries(NAV.flatMap(x=>x[1].map(y=>[y[0],y[1]])));
  $('#crumb').textContent=labels[route]||lookup[route]?.code||(route.startsWith('node/')?'Nodo '+route.slice(5):AREAS[area].label);
  const m=$('#main');
  m.dataset.area=area;
  const first=m.querySelector('.eyebrow');if(first&&!first.querySelector('.areatag')){first.innerHTML=ar(area)+' <span class="eyebrowtxt">'+first.innerHTML+'</span>'}
  m.querySelectorAll('a.tile.linked,a.world-card,a.result,a.inventory-tile').forEach(a=>{if(a.dataset.area)return;const h=decodeURIComponent((a.getAttribute('href')||'').slice(1));a.dataset.area=areaOf(h)});
  document.querySelectorAll('[data-nav]').forEach(el=>{const r=el.dataset.nav,a=r===route||(route.startsWith('node/')&&r==='nodes')||(route.startsWith('inventory/')&&r==='inventory')||(lookup[route]&&r==='library'&&false);el.classList.toggle('active',!!a);if(a)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current')});
  const f=m.querySelector('.footer');if(f)f.innerHTML='<span>IL FALDONE · REV 4.4 · Infrastruttura informatica di casa, laboratorio e Vito</span><span>Documentazione di progetto · nessuna telemetria in tempo reale</span>';
};
window.addEventListener('hashchange',render);
document.addEventListener('click',e=>{
  const n=e.target.closest('[data-simnode]');
  if(n){const id=n.dataset.simnode;simDown.has(id)?simDown.delete(id):simDown.add(id);$('#sim-root').innerHTML=simView();return}
  const p=e.target.closest('[data-simpreset]');
  if(p){simDown=new Set(PRESETS[Number(p.dataset.simpreset)][1]);$('#sim-root').innerHTML=simView();return}
  if(e.target.closest('[data-simreset]')){simDown=new Set();$('#sim-root').innerHTML=simView();}
});
render();
})();
