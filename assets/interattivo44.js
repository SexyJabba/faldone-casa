/* Strumenti interattivi rev 4.4: mappa a livelli, consumi, risparmio self-hosting.
   Tutti i valori numerici sono stime modificabili, marcate come tali: nessuna telemetria. */
(function(){
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const store={get(k,d){try{const v=localStorage.getItem('faldone44.'+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem('faldone44.'+k,JSON.stringify(v))}catch(e){}}};
const fmt=(n,d=0)=>Number(n).toLocaleString('it-IT',{minimumFractionDigits:d,maximumFractionDigits:d});

/* ================= MAPPA A LIVELLI ================= */
const MN=[ // id,label,sub,x,y,w,gruppo,rotta,testo
['FTTC','FTTC','WAN1 · 4 Mbit/s in upload',110,38,150,'ext',null,'Linea in rame del gestore. È il collo di bottiglia per le copie fuori casa: circa 23 giorni per ogni TB.'],
['R5G','Router 5G','WAN2 · SIM 500 GB',290,38,150,'ext',null,'Seconda uscita su Internet. Una porta (LAN1) serve M1, l’altra (LAN2) porta gli avvisi di M5 anche con M1 fermo.'],
['DRV','Google Drive','Copia remota',700,38,150,'ext','INF-04.09','Arca temporanea durante la migrazione, poi deposito di backup. Non è mai il disco operativo delle VM.'],
['S2','S2 · VPS','Osservazione esterna',880,38,150,'aux','REV3-SRV','Guarda i servizi dall’esterno. Vaultwarden è escluso da S2.'],
['M1','M1','Firewall OPNsense',200,140,130,'core','node/M1',null],
['SW','Linksys LGS352C-EU','48 × 1 GbE + 4 × 10 GbE SFP+',470,240,230,'net','REV4-RETE','Centro della stella di rete. Nessun PoE. Il traffico tra VLAN passa dal firewall M1, collegato a 1 GbE.'],
['M2','M2','Applicazioni · P310 4 TB',190,360,150,'core','node/M2',null],
['M5','M5','HAOS · MQTT · Frigate',365,360,150,'core','node/M5',null],
['C3','C3','Client camera + replica',540,360,150,'core','node/C3',null],
['C4','C4','Client salone + replica',715,360,150,'core','node/C4',null],
['M3','M3','IA · su richiesta',190,480,150,'demand','node/M3',null],
['M4','M4','Backup WD · media',365,480,150,'demand','node/M4',null],
['M6','M6','Media · Seafile · download',540,480,160,'demand','node/M6',null],
['RDX','Cartucce RDX','Selezioni offline',365,585,150,'ext','INF-04.07','Tre cartucce HP RDX 2 TB (proposta, non acquistate): foto/video, documenti, lavoro. Non sono tre copie della stessa cosa.'],
['S1','S1','Caddy · Vaultwarden',880,140,150,'aux','INF-03.07',null],
['S3','S3','Radio Zigbee',880,222,150,'aux','node/S3',null],
['S4','S4','Sentinella · WoL (no voto)',880,304,170,'aux','node/S4',null],
['MP3','Acer MP3','Windows · Sunshine',880,396,150,'client','node/MP3',null],
['CL','Client delle stanze','C2 · Wyse · Microtech',880,478,170,'client','REV4-CLIENT','Postazioni di cucina, studio, Hi-Fi, laboratorio e ingresso: sono client, non server.'],
['C1','C1 · Vito','Nodo mobile · LTE',1030,140,140,'mobile','node/C1','Il Dell del Vito: fuori dal quorum, funziona anche senza casa.'],
['HP','2 × HP t520','Amici esterni',1030,260,140,'mobile','INF-05.30','Client Ethernet per due amici: online verso Jellyfin, offline da USB.']
];
const ML=[ // layer,label,color,dash,desc
['rete','Rete e WAN','#0076ce',0,'Uscite su Internet, firewall, switch e collegamenti a 1 GbE.'],
['dorsale','Dorsale 10 GbE','#0b2239',0,'Quattro link SFP+ 49–52 verso M2, M3, M4, M6.'],
['cluster','Quorum Proxmox','#7a4ea3',1,'Cinque voti (M1, M2, M5, C3, C4), quorum 3, nessun qdevice.'],
['copie','Copie e repliche','#2e7d32',1,'Backup locale, replica dei servizi, copia remota e offline.'],
['wol','Accensione a richiesta','#6b7684',1,'S4 (primo) sveglia M3, M4, M6 con Wake-on-LAN.'],
['mobile','Esterni e Vito','#b4530c',1,'Tunnel del Vito, amici esterni, osservazione esterna.'],
['iot','Radio e IoT','#8a6d00',1,'Zigbee e domotica.']
];
const ME=[ // a,b,layer,label
['FTTC','M1','rete','WAN1'],['R5G','M1','rete','WAN2'],['M1','SW','rete','1 GbE'],['R5G','M5','rete','LAN2 · avvisi'],
['SW','M5','rete',''],['SW','C3','rete',''],['SW','C4','rete',''],['SW','S1','rete',''],['SW','S3','rete',''],['SW','S4','rete',''],['SW','MP3','rete',''],['SW','CL','rete',''],
['SW','M2','dorsale','SFP+49'],['SW','M3','dorsale','SFP+50'],['SW','M4','dorsale','SFP+51'],['SW','M6','dorsale','SFP+52'],
['M1','M2','cluster','Corosync'],['M2','M5','cluster',''],['M5','C3','cluster',''],['C3','C4','cluster',''],
['M2','M4','copie','replica pull'],['M4','DRV','copie','copia remota'],['M4','RDX','copie','offline'],['M2','C4','copie','replica HA'],['M5','C3','copie','replica HA'],
['S4','M3','wol','WoL'],['S4','M4','wol',''],['S4','M6','wol',''],
['C1','M1','mobile','tunnel LTE'],['HP','M6','mobile','HTTPS Jellyfin'],['S2','S1','mobile','osserva'],
['M5','S3','iot','Zigbee2MQTT']
];
const GCOL={core:'#0076ce',demand:'#6b7684',net:'#0b2239',aux:'#8a6d00',client:'#2e7d32',mobile:'#b4530c',ext:'#4b5563'};
const GLAB={core:'Nucleo (vota)',demand:'A richiesta',net:'Rete',aux:'Ausiliari',client:'Client',mobile:'Esterni e mobile',ext:'Esterno'};
let mapSel=null,mapOn=store.get('maplayers',{rete:1,dorsale:1,cluster:1,copie:0,wol:0,mobile:1,iot:0});
function mapInfo(n){
  const hw=(D.hardware&&D.hardware.nodes&&D.hardware.nodes[n[0]])||null;
  let body=n[8]?'<p>'+esc(n[8])+'</p>':'';
  if(hw){body+='<p>'+esc(hw.role||'')+'</p><ul>'+(hw.platform?'<li><b>Piattaforma</b>: '+esc(hw.platform)+'</li>':'')+(hw.cpu?'<li><b>CPU</b>: '+esc(hw.cpu.model)+' · '+hw.cpu.cores+' core</li>':'')+(hw.ram?'<li><b>RAM</b>: '+hw.ram.gb+' GB '+esc(hw.ram.type)+'</li>':'')+'</ul>'}
  const own=ME.filter(e=>e[0]===n[0]||e[1]===n[0]).map(e=>{const o=e[0]===n[0]?e[1]:e[0],nn=MN.find(x=>x[0]===o);const L=ML.find(l=>l[0]===e[2]);return '<li><span class="mapdot" style="background:'+L[2]+'"></span>'+esc(nn?nn[1]:o)+' <span class="muted">· '+esc(L[1])+(e[3]?' · '+esc(e[3]):'')+'</span></li>'}).join('');
  const href=n[7]?('#'+n[7]):null;
  return '<h3>'+esc(n[1])+'</h3><p class="muted">'+esc(n[2])+' · '+esc(GLAB[n[6]])+'</p>'+body+'<h4>Collegamenti</h4><ul>'+own+'</ul>'+(href?'<p><a class="btn" href="'+href+'">Apri la scheda</a></p>':'');
}
function mapSvg(){
  const by=Object.fromEntries(MN.map(n=>[n[0],n]));
  const act=new Set(mapSel?ME.filter(e=>mapOn[e[2]]&&(e[0]===mapSel||e[1]===mapSel)).flatMap(e=>[e[0],e[1]]):[]);
  let s='<svg viewBox="0 0 1120 640" class="mapsvg" role="img" aria-label="Mappa dell’infrastruttura a livelli">';
  s+='<g class="mapedges">';
  ME.forEach(e=>{if(!mapOn[e[2]])return;const a=by[e[0]],b=by[e[1]],L=ML.find(l=>l[0]===e[2]);
    const hl=mapSel&&(e[0]===mapSel||e[1]===mapSel);const dim=mapSel&&!hl;
    s+='<line x1="'+a[3]+'" y1="'+a[4]+'" x2="'+b[3]+'" y2="'+b[4]+'" stroke="'+L[2]+'" stroke-width="'+(e[2]==='dorsale'?4:hl?3:1.8)+'"'+(L[3]?' stroke-dasharray="7 5"':'')+' opacity="'+(dim?.15:.85)+'"/>';
    if(e[3]&&(!mapSel||hl))s+='<text x="'+((a[3]+b[3])/2)+'" y="'+((a[4]+b[4])/2-5)+'" class="mapedgelabel" fill="'+L[2]+'">'+esc(e[3])+'</text>'});
  s+='</g><g class="mapnodes">';
  MN.forEach(n=>{const sel=mapSel===n[0],dim=mapSel&&!sel&&!act.has(n[0]);const w=n[5],h=46;
    s+='<g class="mapnode'+(sel?' sel':'')+'" data-mapnode="'+n[0]+'" tabindex="0" role="button" aria-label="'+esc(n[1]+': '+n[2])+'" opacity="'+(dim?.35:1)+'"><rect x="'+(n[3]-w/2)+'" y="'+(n[4]-h/2)+'" width="'+w+'" height="'+h+'" rx="2" fill="#fff" stroke="'+GCOL[n[6]]+'" stroke-width="'+(sel?3:1.5)+'"/><rect x="'+(n[3]-w/2)+'" y="'+(n[4]-h/2)+'" width="5" height="'+h+'" fill="'+GCOL[n[6]]+'"/><text x="'+(n[3]-w/2+14)+'" y="'+(n[4]-3)+'" class="mapt1">'+esc(n[1])+'</text><text x="'+(n[3]-w/2+14)+'" y="'+(n[4]+13)+'" class="mapt2">'+esc(n[2])+'</text></g>'});
  return s+'</g></svg>';
}
function mapView(){
  const n=MN.find(x=>x[0]===mapSel);
  return '<div class="maptools"><div class="maplayers">'+ML.map(l=>'<label class="maplayer"><input type="checkbox" data-maplayer="'+l[0]+'"'+(mapOn[l[0]]?' checked':'')+'><span class="mapdot" style="background:'+l[2]+'"></span><b>'+esc(l[1])+'</b><small>'+esc(l[4])+'</small></label>').join('')+'</div></div><div class="mapwrap"><div class="mapcanvas">'+mapSvg()+'</div><aside class="mappanel" aria-live="polite">'+(n?mapInfo(n):'<h3>Scegli un elemento</h3><p class="muted">Clicca una macchina per vedere ruolo, collegamenti e la scheda completa. Attiva o spegni i livelli per leggere una cosa alla volta.</p><p class="muted">Legenda: blu = nucleo che vota · grigio = a richiesta · giallo = ausiliari · verde = client · arancio = esterni e mobile.</p>')+'</aside></div>';
}
function switchPorts(){
  const sw=C.net||[];let cells='';
  const sfp={49:'M2',50:'M3',51:'M4',52:'M6'};
  for(let p=1;p<=48;p++)cells+='<span class="swport" title="Porta '+p+' · 1 GbE · assegnazione da mappa definitiva">'+p+'</span>';
  let s='';for(let p=49;p<=52;p++)s+='<span class="swport sfp" title="SFP+ '+p+' · 10 GbE · '+sfp[p]+'"><b>'+p+'</b><i>'+sfp[p]+'</i></span>';
  return '<div class="swpanel"><div class="swrj">'+cells+'</div><div class="swsfp">'+s+'</div></div><p class="muted">Le porte RJ45 non hanno ancora un’assegnazione definitiva: la mappa delle porte resta da fissare. Le quattro SFP+ sono assegnate (49 M2 · 50 M3 · 51 M4 · 52 M6). Le seconde porte di M2 e M4 sono libere.</p>';
}
pages.map=()=>head('Mappa interattiva','Le macchine e i collegamenti, un livello alla volta','Clicca una macchina per i dettagli. Accendi i livelli (rete, dorsale, quorum, copie, accensione, esterni, radio) per vedere una sola cosa per volta.','Assetto di riferimento')+'<div id="map-root">'+mapView()+'</div>'+section('Switch LGS352C-EU: porte')+switchPorts();

/* ================= CONSUMI ================= */
const PW0=[ // id,nome,idle,carico,ore_accesa,ore_carico,tipo
['M1','M1 · firewall',30,50,24,6,'core'],['M2','M2 · applicazioni',45,75,24,6,'core'],['M5','M5 · domotica',28,45,24,4,'core'],
['C3','C3 · client e replica',12,25,24,4,'core'],['C4','C4 · client e replica',12,25,24,4,'core'],
['M3','M3 · IA (GPU)',90,250,3,1.5,'demand'],['M4','M4 · backup e media',55,80,3,1,'demand'],['M6','M6 · media e download',35,70,6,2,'demand'],
['S1','S1 · utilità',8,12,24,2,'aux'],['S3','S3 · radio',5,7,24,1,'aux'],['S4','S4 · sentinella',5,7,24,1,'aux'],
['SW','Switch LGS352C-EU',28,40,24,24,'rete'],['R5G','Router 5G e modem',10,14,24,12,'rete'],['CL','Client e pannelli (stima)',40,70,24,6,'client']
];
let pw=store.get('power',null);if(!pw||pw.rows.length!==PW0.length)pw={price:0.30,rows:PW0.map(r=>r.slice())};
function pwCalc(){
  const out=pw.rows.map(r=>{const [id,nm,idle,load,on,ld]=r;const wh=idle*Math.max(on-ld,0)+load*Math.min(ld,on);return{id,nm,wh,kwhm:wh*30/1000,kind:r[6]}});
  const tot=out.reduce((a,x)=>a+x.kwhm,0);return{out,tot,eur:tot*pw.price,avgW:out.reduce((a,x)=>a+x.kwhm,0)*1000/30/24}
}
function pwView(){
  const c=pwCalc(),max=Math.max(...c.out.map(x=>x.kwhm),1);
  const rows=pw.rows.map((r,i)=>'<tr><td>'+esc(r[1])+'</td>'+[2,3,4,5].map(k=>'<td><input class="num" type="number" min="0" step="'+(k>3?'0.5':'1')+'" value="'+r[k]+'" data-pw="'+i+':'+k+'" aria-label="'+esc(r[1])+'"></td>').join('')+'<td class="r">'+fmt(c.out[i].kwhm,1)+'</td><td><div class="bar"><i style="width:'+(c.out[i].kwhm/max*100)+'%;background:'+GCOL[{core:'core',demand:'demand',aux:'aux',rete:'net',client:'client'}[r[6]]]+'"></i></div></td></tr>').join('');
  return '<div class="stats"><div class="stat"><b>'+fmt(c.avgW)+'</b><span>W medi</span><small>Potenza media su 24 ore</small></div><div class="stat"><b>'+fmt(c.tot)+'</b><span>kWh al mese</span><small>Stima del totale</small></div><div class="stat"><b>'+fmt(c.eur,0)+'</b><span>€ al mese</span><small>A '+fmt(pw.price,2)+' €/kWh</small></div><div class="stat"><b>'+fmt(c.eur*12,0)+'</b><span>€ all’anno</span><small>Tutto il sistema</small></div></div>'+
  '<div class="tablewrap"><table class="datatable"><thead><tr><th>Apparato</th><th>Riposo (W)</th><th>Carico (W)</th><th>Ore accesa / giorno</th><th>Di cui sotto carico</th><th>kWh / mese</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
  '<div class="toolbar"><label>Prezzo energia (€/kWh) <input class="num" type="number" min="0" step="0.01" value="'+pw.price+'" data-pwprice></label><button class="btn ghost" data-pwreset>Ripristina i valori iniziali</button></div>';
}
pages.power=()=>head('Consumi e costi di esercizio','Quanto consuma il sistema, in stima','Tutti i valori sono stime di partenza, modificabili: il consumo reale si misura con un wattmetro su ogni nodo. La potenza di targa (TDP) non è il consumo.','Stima da misurare')+
'<div class="callout"><b>Come usarla.</b> Cambia i watt e le ore: i totali si aggiornano. I tre server a richiesta (M3, M4, M6) pesano poco perché stanno accesi poche ore. I valori restano nel tuo browser. La roadmap prevede la misura reale (riposo, picco, energia giornaliera) in <a href="#REV4-ENER">REV4-ENER</a>.</div><div id="power-root">'+pwView()+'</div>'+
'<p class="muted">Nota: la batteria servizi del Vito e la power station del rack sono progetti a parte e non rientrano in questa tabella. Nessuna autonomia è dichiarata senza misure e prove.</p>';

/* ================= RISPARMIO SELF-HOSTING ================= */
const SV0=[
['archivio','Nextcloud, Immich, Syncthing, SMB','Archivio cloud 2 TB con foto (Google One o simili)',9.99,1,'M2'],
['seafile','Seafile per utenti autorizzati','Secondo spazio cloud condiviso 2 TB',9.99,1,'M6'],
['vikunja','Vikunja','Gestione attività (Todoist Pro o simili)',4,1,'M2'],
['n8n','n8n','Automazioni (n8n Cloud Starter)',24,0,'M2'],
['paperless','Paperless-ngx','Archivio documenti con OCR',8,0,'M2'],
['stirling','Stirling PDF','Strumenti PDF (Acrobat Standard o simili)',15,0,'M2'],
['firefly','Firefly III','Budget personale (YNAB o simili)',14,0,'M2'],
['llm','Open WebUI e modelli su M3','Abbonamento a un assistente IA',23,1,'M3'],
['ha','Home Assistant, MQTT, Zigbee','Accesso remoto e backup cloud di Home Assistant',7.5,1,'M5'],
['frigate','Frigate e telecamere','Registrazione cloud (solo se il video è attivo)',10,0,'M5'],
['jellyfin','Jellyfin, Navidrome, Audiobookshelf','Server media per la propria libreria (Plex Pass o simili)',5,1,'M6'],
['backup','Backup su M4 e copia esterna','Backup cloud 2 TB (Backblaze B2, Hetzner o simili)',11,1,'M4'],
['vault','Vaultwarden','Gestore password per la famiglia (Bitwarden Families o simili)',3.5,1,'S1'],
['monitor','ntfy, Uptime Kuma, Zabbix','Monitoraggio e notifiche',7,0,'S1']
];
let sv=store.get('savings',null);
function acqTotal(){try{return (C.acquisitions||[]).reduce((a,x)=>a+(Number(x.amount)||0),0)}catch(e){return 0}}
if(!sv||sv.rows.length!==SV0.length)sv={years:5,hw:Math.round(acqTotal()),maint:60,domain:12,rows:SV0.map(r=>r.slice())};
function svCalc(){
  const cloud=sv.rows.filter(r=>r[4]).reduce((a,r)=>a+r[3],0)*12,pc=pwCalc().eur*12;
  const own=pc+sv.maint+sv.domain;const cloudT=cloud*sv.years,ownT=sv.hw+own*sv.years;
  const net=cloud-own;const be=net>0?sv.hw/net:null;
  return{cloud,own,pc,cloudT,ownT,diff:cloudT-ownT,be}
}
function svView(){
  const c=svCalc();
  const rows=sv.rows.map((r,i)=>'<tr><td><input type="checkbox" data-svuse="'+i+'"'+(r[4]?' checked':'')+' aria-label="Conta '+esc(r[1])+'"></td><td><b>'+esc(r[1])+'</b><br><span class="muted">'+esc(r[2])+'</span></td><td>'+esc(r[5])+'</td><td><input class="num" type="number" min="0" step="0.5" value="'+r[3]+'" data-svprice="'+i+'" aria-label="Prezzo"></td></tr>').join('');
  const be=c.be===null?'non si ripaga a questi valori':fmt(c.be,1)+' anni';
  return '<div class="stats"><div class="stat"><b>'+fmt(c.cloud)+'</b><span>€ / anno</span><small>Se pagassi i servizi spuntati</small></div><div class="stat"><b>'+fmt(c.own)+'</b><span>€ / anno</span><small>Corrente, manutenzione, dominio</small></div><div class="stat"><b>'+(c.diff>=0?'+':'')+fmt(c.diff)+'</b><span>€ in '+sv.years+' anni</span><small>Risparmio, hardware incluso</small></div><div class="stat"><b>'+be+'</b><span>pareggio</span><small>Quando l’hardware si è ripagato</small></div></div>'+
  '<div class="toolbar"><label>Anni <input class="num" type="number" min="1" max="10" value="'+sv.years+'" data-svp="years"></label><label>Hardware (€) <input class="num" type="number" min="0" step="50" value="'+sv.hw+'" data-svp="hw"></label><label>Manutenzione (€/anno) <input class="num" type="number" min="0" step="10" value="'+sv.maint+'" data-svp="maint"></label><label>Dominio (€/anno) <input class="num" type="number" min="0" step="1" value="'+sv.domain+'" data-svp="domain"></label></div>'+
  '<div class="tablewrap"><table class="datatable"><thead><tr><th>Conta</th><th>Servizio e alternativa a pagamento</th><th>Nodo</th><th>€ / mese</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}
pages.savings=()=>head('Risparmio del self-hosting','Quanto costerebbero gli stessi servizi in abbonamento','Confronto tra pagare i servizi equivalenti e tenerli sui tuoi server. Prezzi indicativi, IVA compresa, da verificare: modificali.','Stima, non preventivo')+
'<div class="callout"><b>Come leggerlo.</b> Spunta solo i servizi che pagheresti davvero. L’hardware di partenza è la somma degli acquisti dichiarati (da correggere con le consegne reali); il materiale già posseduto non è conteggiato. La corrente arriva dalla pagina <a href="#power">Consumi</a>. Il tuo tempo di gestione non è contato, e alcune equivalenze sono parziali (i modelli IA locali sono più piccoli).</div><div id="savings-root">'+svView()+'</div>';

/* ================= EVENTI ================= */
document.addEventListener('click',e=>{
  const n=e.target.closest('[data-mapnode]');
  if(n){mapSel=mapSel===n.dataset.mapnode?null:n.dataset.mapnode;const r=document.getElementById('map-root');if(r)r.innerHTML=mapView();return}
  if(e.target.closest('[data-pwreset]')){pw={price:0.30,rows:PW0.map(r=>r.slice())};store.set('power',pw);document.getElementById('power-root').innerHTML=pwView()}
});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('[data-mapnode]')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}))}});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.dataset.maplayer){mapOn[t.dataset.maplayer]=t.checked?1:0;store.set('maplayers',mapOn);document.getElementById('map-root').innerHTML=mapView()}
  else if(t.dataset.pw!==undefined){const [i,k]=t.dataset.pw.split(':').map(Number);pw.rows[i][k]=Math.max(0,Number(t.value)||0);store.set('power',pw);const f=t.dataset.pw;document.getElementById('power-root').innerHTML=pwView();const el=document.querySelector('[data-pw="'+f+'"]');if(el)el.focus()}
  else if(t.dataset.pwprice!==undefined){pw.price=Math.max(0,Number(t.value)||0);store.set('power',pw);document.getElementById('power-root').innerHTML=pwView()}
  else if(t.dataset.svuse!==undefined){sv.rows[+t.dataset.svuse][4]=t.checked?1:0;store.set('savings',sv);document.getElementById('savings-root').innerHTML=svView()}
  else if(t.dataset.svprice!==undefined){sv.rows[+t.dataset.svprice][3]=Math.max(0,Number(t.value)||0);store.set('savings',sv);document.getElementById('savings-root').innerHTML=svView()}
  else if(t.dataset.svp){sv[t.dataset.svp]=Math.max(0,Number(t.value)||0);store.set('savings',sv);document.getElementById('savings-root').innerHTML=svView()}
});
render();
})();
