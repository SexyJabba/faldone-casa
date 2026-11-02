/* Tour guidato rev 4.4: otto tappe, pensato per il telefono */
(function(){
const T=[
['1','⌂','Cos’è','Un solo sistema per casa, laboratorio e Vito.','Tre sedi, un’unica infrastruttura informatica: archivio, domotica, telecamere, IA, postazioni di lavoro e furgone.',[['3','sedi'],['6','ambiti'],['303','schede']],[['worlds','I sei ambiti'],['home','Panoramica']],'orient'],
['2','▤','Il nucleo','Cinque macchine sempre accese decidono insieme.','M1, M2, M5, C3 e C4 formano il cluster Proxmox. Servono 3 voti su 5: se ne perdono due, il sistema continua.',[['5','voti'],['3','quorum'],['0','qdevice']],[['network','Rete e quorum'],['map','Mappa interattiva']],'server'],
['3','⏻','A richiesta','Tre macchine dormono finché servono.','M3 (intelligenza artificiale), M4 (backup e media) e M6 (media, Seafile) si accendono con Wake-on-LAN dalla sentinella S4. Non votano.',[['M3','IA'],['M4','backup'],['M6','media']],[['world-server','Sala server'],['power','Consumi e costi']],'server'],
['4','⌘','Rete','Un firewall, un switch, un collo di bottiglia.','Linksys LGS352C-EU: 48 porte da 1 Gbit e 4 SFP+ da 10 Gbit verso M2, M3, M4, M6. Internet è FTTC con upload di 4 Mbit/s: circa 23 giorni per spedire 1 TB.',[['48','porte 1G'],['4','SFP+ 10G'],['4','Mbit/s up']],[['map','Mappa interattiva'],['network','Rete e quorum']],'infra'],
['5','◫','Dati e copie','Una copia non basta: contano il ripristino e la distanza.','Backup locale, replica, copia remota e supporti offline. Un job completato non equivale a un recupero riuscito: si prova a ripristinare.',[['3','livelli'],['1','offline']],[['storage','Dati e copie'],['REV4-ENER','Energia e continuità']],'dati'],
['6','▣','Postazioni','Lavoro di giorno, gioco la sera, una sola sessione.','Acer MP3 con Windows e Sunshine; i client Linux C1–C4 con Moonlight. I Dell C3 e C4 fanno anche da host di riserva.',[['MP3','Windows'],['C1–C4','Linux']],[['world-home','Casa e ambienti'],['world-lab','Laboratorio']],'casa'],
['7','↗','Vito','Il nodo mobile: LTE e tunnel verso casa.','Il furgone ha un nodo proprio, collegato con un tunnel. Gli amici esterni vedono solo i servizi che condividi, non la rete.',[['LTE','link'],['1','tunnel']],[['world-vito','Vito'],['world-guests','Servizi a terzi']],'vito'],
['8','⚡','Provalo','Cosa succede se si guasta? Quanto costa? Quando?','Spegni una macchina e guarda cosa resta in piedi. Stima i consumi. Confronta con gli abbonamenti. La tabella di marcia parte dal 23 dicembre 2026.',[['23/12','avvio']],[['sim','Simula guasti'],['power','Consumi'],['savings','Risparmio'],['roadmap','Roadmap']],'sim']
];
const E2=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function tour(){
  const flow=['Internet','Firewall M1','Switch','Nucleo 5 voti','A richiesta'].map((x,i)=>'<span class="tflow'+(i==3?' on':'')+'">'+x+'</span>').join('<i aria-hidden="true">›</i>');
  return head('Tour guidato','Il sistema in otto tappe','Scorri dall’alto in basso: ogni tappa è un’idea, con i numeri chiave e il link per approfondire. Pensato per il telefono.','Percorso breve')+
  '<div class="tflowrow" aria-label="Schema generale">'+flow+'</div>'+
  '<nav class="tjump" aria-label="Salta alla tappa">'+T.map(t=>'<a href="#" data-tj="'+t[0]+'">'+t[0]+'</a>').join('')+'</nav>'+
  '<ol class="tour">'+T.map((t,i)=>'<li class="tstep" id="tour-'+t[0]+'" data-area="'+t[7]+'"><div class="tnum"><b>'+t[0]+'</b><span>'+t[1]+'</span></div><div class="tbody"><small>'+E2(t[2])+'</small><h2>'+E2(t[3])+'</h2><p>'+E2(t[4])+'</p><div class="tkpi">'+t[5].map(k=>'<div><b>'+E2(k[0])+'</b><span>'+E2(k[1])+'</span></div>').join('')+'</div><div class="tlinks">'+t[6].map(l=>'<a class="btn ghost" href="#'+l[0]+'">'+E2(l[1])+' →</a>').join('')+'</div>'+(i<T.length-1?'<a class="tnext" href="#" data-tj="'+T[i+1][0]+'">Tappa '+T[i+1][0]+': '+E2(T[i+1][2])+' ↓</a>':'<a class="tnext" href="#library">Vai alla biblioteca tecnica →</a>')+'</div></li>').join('')+'</ol>';
}
pages.tour=tour;
const h0=pages.home;pages.home=function(){return '<a class="tourban" href="#tour"><b>Tour guidato</b><span>Il sistema in otto tappe, schematico e pensato per il telefono</span><i>→</i></a>'+h0()};
document.addEventListener('click',e=>{const a=e.target.closest('[data-tj]');if(!a)return;e.preventDefault();const el=document.getElementById('tour-'+a.dataset.tj);if(el)el.scrollIntoView({behavior:'smooth',block:'start'})});
const nav=document.getElementById('nav');
if(nav&&!nav.querySelector('[data-nav="tour"]')){const f=nav.querySelector('[data-nav="home"]');if(f)f.insertAdjacentHTML('afterend','<a class="navlink" data-area="orient" href="#tour" data-nav="tour"><span class="navicon" aria-hidden="true">➜</span>Tour guidato</a>')}
render();
})();
