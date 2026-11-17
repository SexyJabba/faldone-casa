// Dati: backup, ripristino, uso da telefono, stato dell'app.
import { store } from '../store.js';
import { h, card, btn, avviso, scarica, dataIt } from '../ui.js';

export function render() {
  const s = store.s; const esito = h('div', {});
  const inp = h('input', { type: 'file', accept: '.json,application/json', hidden: true, onchange: async () => {
    const f = inp.files[0]; if (!f) return; inp.value = '';
    try {
      let o; try { o = JSON.parse(await f.text()); } catch { throw new Error('Il file non è un JSON leggibile.'); }
      const { validaBackup } = await import('../store.js'); validaBackup(o);
      if (!confirm(`Ripristinare il backup del ${dataIt(o.esportato)}?\nTUTTI i dati attuali di questo dispositivo verranno sostituiti.`)) return;
      await store.importa(o); esito.replaceChildren(avviso('Backup ripristinato.', 'ok'));
    } catch (e) { esito.replaceChildren(avviso('Ripristino non eseguito: ' + e.message + ' I dati attuali non sono stati modificati.', 'err')); }
  } });
  const esporta = async () => { const o = await store.esporta(); scarica(`vito-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(o)); esito.replaceChildren(avviso(`Backup scaricato: ${o.files.length} foto/documenti inclusi.`, 'ok')); };
  const conta = [['lavori', s.lavori.length], ['articoli', s.inventario.length], ['spese', s.spese.length], ['voci di diario', s.diario.length], ['rilievi', s.rilievi.length], ['fonti', s.fonti.length]].map(([t, v]) => `${v} ${t}`).join(' · ');
  return h('div', {}, h('div', { class: 'testata' }, h('div', {}, h('h1', {}, 'Dati e backup'), h('p', {}, 'I dati vivono nel browser di QUESTO dispositivo. Non c\'è sincronizzazione automatica.'))),
    card('Backup e ripristino', h('p', {}, conta), h('p', { class: 'aiuto' }, 'Ultima modifica: ' + new Date(s.meta.agg).toLocaleString('it-IT')),
      h('div', { class: 'barra-azioni' }, btn('Scarica backup completo (.json)', esporta, 'primary'), btn('Ripristina da backup…', () => inp.click()), inp), esito,
      h('p', { class: 'aiuto' }, 'Il backup contiene tutti i dati, le foto e i documenti. Fallo dopo ogni giornata di lavoro e conservalo fuori dal computer (chiavetta, cloud personale).')),
    card('Usarla dal telefono', h('ol', { class: 'passi' },
      h('li', {}, h('b', {}, 'Stessa rete Wi‑Fi del computer: '), 'avvia l\'app sul Mac con avvia.command e apri sul telefono l\'indirizzo mostrato nella finestra del Terminale (http://IP-del-Mac:8642). Funziona finché il Mac è acceso e l\'app avviata. In questa modalità il telefono NON può usarla offline.'),
      h('li', {}, h('b', {}, 'Offline anche sul telefono: '), 'l\'app è pubblicata in HTTPS dentro il Faldone, su https://faldone.rinaldi.build/officina/. Aperta una volta, resta disponibile senza rete e si può aggiungere alla schermata Home. I dati non vengono caricati sul sito: restano nel telefono.'),
      h('li', {}, h('b', {}, 'Dati fra computer e telefono: '), 'sono due archivi separati. Per trasferirli: “Scarica backup” su un dispositivo, invia il file all\'altro (AirDrop, mail, cavo) e lì “Ripristina da backup”. Il ripristino sostituisce tutto: lavora su un dispositivo alla volta.')),
      h('p', { class: 'aiuto' }, 'Interfaccia adattabile, disponibilità offline e sincronizzazione sono tre cose diverse: le prime due ci sono (con i limiti sopra), la terza no.')),
    card('Stato dell\'applicazione', h('ul', { class: 'piatto' },
      h('li', {}, 'Funzionante: quadro, progetto unico con alternative, mappa 2D con base fissa e stati, stratigrafie e fabbisogni, simulatore orario, percorso guidato dei lavori, budget, inventario, carichi, diario, rilievi, fonti, backup atomico.'),
      h('li', {}, 'Non realizzato: vista laterale; sincronizzazione fra dispositivi; lettura OBD; calendario con date dei fermi.'),
      h('li', {}, 'Contenuti tecnici: le schede dei lavori sono attività di verifica finché non si collega la documentazione Mercedes (serve il VIN).'),
      h('li', {}, navigator.serviceWorker?.controller ? 'Copia offline attiva su questo dispositivo.' : 'Copia offline non ancora attiva su questo dispositivo (serve localhost o HTTPS; ricarica la pagina una volta).'))),
    card('Aggiornare le guide dei lavori', h('p', { class: 'aiuto' }, 'Porta in questo archivio le guide aggiornate (tetto, ruggine, pianale, cabina, pannellature…), con passi classificati, schemi e materiali collegati all\'inventario, e la base fissa con gli stati d\'uso nella Mappa. Stato dei lavori, spunte, risultati, foto, sessioni, spese e inventario restano come sono. Si può annullare con “Annulla” nella Mappa finché la pagina resta aperta.'),
      btn('Aggiorna guide e base fissa dai dati iniziali', async () => {
        if (!confirm('Sostituire testi, passi, schemi e collegamenti dei lavori predefiniti con la versione aggiornata?\nI lavori creati da te e i tuoi risultati non vengono toccati.')) return;
        const { seed } = await import('../seed.js'); const b = seed(); let nLav = 0;
        store.update((st) => {
          for (const k of ['inventario', 'fonti']) for (const x of b[k]) if (!st[k].some((y) => y.id === x.id)) st[k].push(x);
          for (const g of b.lavori) { const mio = st.lavori.find((x) => x.id === g.id); if (!mio) { st.lavori.push(g); nLav++; continue; }
            const spunte = Object.fromEntries(mio.accettazione.map((a) => [a.t, a.ok]));
            Object.assign(mio, { verifiche: g.verifiche, materiali: g.materiali, attrezzi: g.attrezzi, passi: g.passi, schemi: g.schemi, materialiInv: g.materialiInv, attrezziInv: g.attrezziInv, fonti: g.fonti, tipoPassi: g.tipoPassi, accettazione: g.accettazione.map((a) => ({ t: a.t, ok: !!spunte[a.t] })) }); nLav++; }
          if (!st.baseFissa.length && !st.layout.some((l) => l.moduli.some((m) => m.z > 0 && /slitta/i.test(m.nome)))) {
            st.baseFissa = b.baseFissa;
            for (const g of b.layout) { const mio = st.layout.find((l) => l.id === g.id); if (mio && confirm(`Sostituire anche i moduli e gli stati della configurazione “${mio.nome}” con quelli aggiornati (slitta fissa + mobile)?`)) { mio.moduli = g.moduli; mio.stati = g.stati; } }
          }
        });
        esito.replaceChildren(avviso(`Guide aggiornate: ${nLav} lavori.`, 'ok'));
      })),
    card('Ricominciare da capo', h('p', { class: 'aiuto' }, 'Cancella tutto e ricarica i dati iniziali del progetto. Scarica prima un backup.'),
      btn('Azzera e ricarica i dati iniziali', async () => { if (confirm('Cancellare TUTTI i dati e le foto di questo dispositivo?') && confirm('Sicuro? L\'operazione non si può annullare.')) { await store.azzera(); esito.replaceChildren(avviso('Dati iniziali ricaricati.', 'ok')); } }, 'danger')));
}
