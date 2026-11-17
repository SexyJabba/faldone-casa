// Manuali e conoscenza: i PDF che ottieni tu (libretto d'uso, manuale d'officina, schede tecniche) e gli estratti che contano per i lavori.
// I PDF restano in questo browser (non nel backup). Le guide dei lavori rimandano a documento e pagina.
import { store } from '../store.js';
import { h, card, badge, chip, btn, openForm, uid, vuoto, avviso, contiene, tabs, n } from '../ui.js';
import { indicizza, statoTesto, avanzamento, cercaNeiPdf } from '../pdftesto.js';

const ui = { tab: 'documenti', q: '', qPdf: '' };
const ePdf = (nome, tipo) => /pdf/i.test(tipo || '') || /\.pdf$/i.test(nome || '');
// Legge il testo del PDF in sottofondo e ridisegna quando ha finito (o fallito: l'errore resta visibile sulla scheda).
const errori = new Map();
function leggiTesto(docId) {
  errori.delete(docId);
  indicizza(docId, (i, tot) => { const c = document.querySelector(`[data-testo="${docId}"]`); if (c) c.textContent = `lettura del testo: pagina ${i} di ${tot}`; })
    .catch((e) => errori.set(docId, e.message)).finally(() => store.ridisegna());
  setTimeout(() => store.ridisegna(), 0);
}
// Risultati della ricerca dentro i PDF: usati qui e nella ricerca del Quadro.
export async function risultatiPdf(s, q) {
  const r = await cercaNeiPdf(s, q);
  return h('div', {},
    r.risultati.map((x) => h('div', { class: 'riga' }, h('div', { class: 'cresce' }, h('b', {}, `${x.doc.titolo}, p. ${x.pagina}`), h('div', { class: 'aiuto' }, x.brano)),
      btn('Apri alla pagina', () => apriDocumento(x.doc.id, x.pagina), 'mini no-print'), btn('＋ Estratto', () => editEstratto(null, x.doc.id, null, { pagina: String(x.pagina), titolo: q, testo: x.brano }), 'mini no-print'))),
    r.risultati.length ? null : vuoto('Nessuna pagina contiene tutte queste parole.'),
    r.altri ? h('p', { class: 'aiuto' }, `Altre ${r.altri} pagine corrispondono: aggiungi una parola per restringere.`) : null,
    r.nonLetti.length ? h('p', { class: 'aiuto' }, 'Non cercato in (testo non letto): ' + r.nonLetti.map((d) => d.titolo).join(', ') + '.') : null);
}
export const TIPI_DOC = [['uso', 'Libretto d\'uso e manutenzione'], ['officina', 'Manuale d\'officina (WIS o equivalente)'], ['ricambi', 'Catalogo ricambi / datacard'], ['allestimento', 'Direttive di allestimento'], ['scheda', 'Scheda tecnica di prodotto'], ['altro', 'Altro']];
const nomeTipo = (k) => (TIPI_DOC.find((x) => x[0] === k) || [k, k])[1];

// Apre il PDF salvato, alla pagina indicata (i visualizzatori PDF dei browser capiscono #page=N).
export async function apriDocumento(docId, pagina) {
  const f = await store.getDoc(docId);
  if (!f) { alert('Il file di questo documento non è su questo dispositivo. Vai in Manuali e ricaricalo.'); return; }
  const url = URL.createObjectURL(f.blob); window.open(url + (pagina ? '#page=' + pagina : ''), '_blank'); setTimeout(() => URL.revokeObjectURL(url), 600000);
}
export const etichettaRif = (s, rif) => { const d = (s.documenti || []).find((x) => x.id === rif.doc); return `${d ? d.titolo : 'documento rimosso'}${rif.pag ? ', p. ' + rif.pag : ''}${rif.nota ? ' — ' + rif.nota : ''}`; };

export function render(arg) {
  if (['documenti', 'estratti', 'come'].includes(arg)) ui.tab = arg;
  const s = store.s;
  return h('div', {}, h('div', { class: 'testata' }, h('div', {}, h('h1', {}, 'Manuali e conoscenza'), h('p', {}, 'Qui entrano i documenti veri del mezzo. Un passo di una guida diventa “documentato” solo quando rimanda a una pagina di questi.'))),
    tabs([['documenti', `Documenti (${s.documenti.length})`], ['estratti', `Estratti (${s.estratti.length})`], ['come', 'Come ottenerli']], ui.tab, (k) => { ui.tab = k; store.ridisegna(); }),
    ui.tab === 'documenti' ? vDocumenti(s) : ui.tab === 'estratti' ? vEstratti(s) : vCome(s));
}

function editDoc(d, file) {
  openForm({ titolo: d ? 'Documento' : 'Nuovo documento', valore: d || { id: uid('doc'), tipo: 'uso', stato: 'documentato', titolo: file ? file.name.replace(/\.pdf$/i, '') : '', nomeFile: file ? file.name : null, dimensione: file ? file.size : null },
    campi: [{ k: 'titolo', label: 'Titolo', richiesto: true }, { k: 'tipo', label: 'Tipo', tipo: 'select', opzioni: TIPI_DOC }, { k: 'applicabilita', label: 'A cosa si applica (modello, anni, motore, VIN, edizione)', tipo: 'textarea', aiuto: 'Esempio: Vito 639, edizione 2004, motore OM646. Se copre altri motori o anni, scrivilo.' },
      { k: 'provenienza', label: 'Da dove viene (concessionaria, portale Mercedes, officina, produttore)' }, { k: 'stato', label: 'Attendibilità', tipo: 'stato', aiuto: '“Documentato” = fonte del costruttore/produttore valida per questo mezzo. Manuali generici di terzi: “da verificare”.' }, { k: 'nota', label: 'Note', tipo: 'textarea' }],
    onSave: async (v) => { if (file) { try { await store.addDoc(v.id, file); } catch (e) { alert('File non salvato: ' + e.message); return; } } store.update((st) => { const i = st.documenti.findIndex((x) => x.id === v.id); if (i < 0) st.documenti.push(v); else st.documenti[i] = v; }); if (file && ePdf(file.name, file.type)) leggiTesto(v.id); },
    onDelete: d ? async () => { await store.delDoc(d.id); store.update((st) => { st.documenti = st.documenti.filter((x) => x.id !== d.id); st.estratti.forEach((e) => { if (e.doc === d.id) e.doc = null; }); st.lavori.forEach((l) => l.passi.forEach((p) => { if (p.rif && p.rif.doc === d.id) delete p.rif; })); }); } : null });
}

function vDocumenti(s) {
  const inp = h('input', { type: 'file', accept: 'application/pdf,image/*', hidden: true, onchange: () => { const f = inp.files[0]; inp.value = ''; if (f) editDoc(null, f); } });
  const lista = h('div', {}, s.documenti.length ? s.documenti.map((d) => { const cella = h('span', { class: 'chip' }, '…'); store.getDoc(d.id).then((f) => { cella.textContent = f ? 'file presente' : 'file NON su questo dispositivo'; cella.className = 'chip ' + (f ? 'ok' : 'err'); });
    const testo = h('p', { class: 'aiuto', 'data-testo': d.id }, '');
    const av = avanzamento(d.id);
    if (av) testo.textContent = av.totali ? `lettura del testo: pagina ${av.fatte} di ${av.totali}` : 'lettura del testo…';
    else if (errori.has(d.id)) testo.replaceChildren(avviso(errori.get(d.id), 'err'));
    else Promise.all([statoTesto(d.id), store.getDoc(d.id)]).then(([t, f]) => {
      if (!f || !ePdf(f.nome, f.tipo)) { testo.textContent = f ? 'Non è un PDF: non si cerca nel testo.' : ''; return; }
      if (!t) testo.replaceChildren('Testo non ancora letto: la ricerca non guarda in questo documento. ', btn('Leggi il testo', () => leggiTesto(d.id), 'mini no-print'));
      else if (!t.conTesto) testo.replaceChildren(avviso(`Nessun testo nelle ${t.pagine} pagine: è una scansione (immagini). Non è cercabile; puoi comunque aprirlo e salvare estratti a mano.`, 'warn'));
      else testo.textContent = `Testo cercabile: ${t.conTesto} pagine su ${t.pagine}` + (t.conTesto < t.pagine ? ' (le altre sono vuote o immagini).' : '.');
    });
    const usi = s.lavori.filter((l) => l.passi.some((p) => p.rif && p.rif.doc === d.id)).length, estr = s.estratti.filter((e) => e.doc === d.id).length;
    const ricarica = h('input', { type: 'file', accept: 'application/pdf,image/*', hidden: true, onchange: async () => { const f = ricarica.files[0]; if (f) { await store.addDoc(d.id, f); store.update((st) => { const x = st.documenti.find((k) => k.id === d.id); x.nomeFile = f.name; x.dimensione = f.size; }); if (ePdf(f.name, f.type)) leggiTesto(d.id); } } });
    return card(null, h('div', { class: 'riga' }, h('div', { class: 'cresce' }, h('b', {}, d.titolo), h('div', { class: 'aiuto' }, `${nomeTipo(d.tipo)}${d.nomeFile ? ' · ' + d.nomeFile : ''}${d.dimensione ? ' · ' + n(d.dimensione / 1e6, 1) + ' MB' : ''}`)), cella, badge(d.stato)),
      d.applicabilita ? h('p', {}, h('b', {}, 'Si applica a: '), d.applicabilita) : avviso('Applicabilità non indicata: prima di fidarti controlla che copra W639, OM646 e l\'anno.', 'warn'),
      d.provenienza ? h('p', { class: 'aiuto' }, 'Provenienza: ' + d.provenienza) : null, d.nota ? h('p', { class: 'aiuto' }, d.nota) : null,
      h('p', { class: 'aiuto' }, `${estr} estratti · citato in ${usi} lavori`), testo, ricarica,
      h('div', { class: 'barra-azioni no-print' }, btn('Apri', () => apriDocumento(d.id), 'primary mini'), btn('＋ Estratto da questo documento', () => editEstratto(null, d.id), 'mini'), btn('Modifica', () => editDoc(d), 'mini'), btn('Ricarica il file', () => ricarica.click(), 'mini'))); }) : vuoto('Nessun documento. Carica il primo PDF, oppure guarda “Come ottenerli”.'));
  const esito = h('div', {});
  const cercaOra = async () => { if (!ui.qPdf.trim()) { esito.replaceChildren(); return; } esito.replaceChildren(card(`Dentro i PDF: “${ui.qPdf}”`, await risultatiPdf(s, ui.qPdf))); };
  const q = h('input', { type: 'search', class: 'stretto', placeholder: 'Cerca dentro i PDF… (Invio)', value: ui.qPdf, onkeydown: (e) => { if (e.key === 'Enter') { ui.qPdf = q.value; cercaOra(); } } });
  if (ui.qPdf) cercaOra();
  return h('div', {}, h('div', { class: 'barra-azioni no-print' }, btn('＋ Carica un PDF', () => inp.click(), 'primary'), inp, h('span', { class: 'spazio' }), s.documenti.length ? q : null), esito,
    avviso('I PDF restano solo in questo browser e NON entrano nel backup (sarebbe enorme): conserva gli originali. Il backup ricorda titoli, estratti e rimandi; su un altro dispositivo basta ricaricare il file. Al caricamento il testo del PDF viene letto per poterci cercare dentro: i PDF fatti di scansioni non hanno testo.', 'info'), lista);
}

export function editEstratto(e, docId, lavoroId, pre) {
  const s = store.s;
  openForm({ titolo: e ? 'Estratto' : 'Nuovo estratto', valore: e || { id: uid('es'), doc: docId || '', pagina: null, lavoroId: lavoroId || '', argomento: '', ...(pre || {}) },
    campi: [{ k: 'titolo', label: 'Argomento (es. “Coppia tappo olio”, “Punti di ancoraggio”)', richiesto: true }, { k: 'doc', label: 'Documento', tipo: 'select', opzioni: [['', '— nessuno (da dove viene?) —'], ...s.documenti.map((d) => [d.id, d.titolo])] }, { k: 'pagina', label: 'Pagina (o codice del documento WIS)' },
      { k: 'testo', label: 'Cosa dice, con parole tue o trascritto: valori CON unità', tipo: 'textarea', aiuto: 'Trascrivi i numeri esattamente e ricontrollali sul documento. Qui non si scrive niente “a memoria”.' }, { k: 'argomento', label: 'Zona / parole chiave (motore, tetto, freni…)' }, { k: 'lavoroId', label: 'Lavoro a cui serve', tipo: 'select', opzioni: [['', '— nessuno —'], ...s.lavori.map((l) => [l.id, l.titolo])] }],
    onSave: (v) => store.update((st) => { v.doc = v.doc || null; v.lavoroId = v.lavoroId || null; const i = st.estratti.findIndex((x) => x.id === v.id); if (i < 0) st.estratti.push(v); else st.estratti[i] = v; }),
    onDelete: e ? () => store.update((st) => { st.estratti = st.estratti.filter((x) => x.id !== e.id); }) : null });
}
export function rigaEstratto(s, e) {
  const d = s.documenti.find((x) => x.id === e.doc);
  return h('div', { class: 'card' }, h('div', { class: 'riga' }, h('div', { class: 'cresce' }, h('b', {}, e.titolo), h('div', { class: 'aiuto' }, [d ? d.titolo : 'SENZA documento', e.pagina ? 'p. ' + e.pagina : null, e.argomento].filter(Boolean).join(' · '))), d ? badge(d.stato) : chip('senza fonte', 'err'),
    d ? btn('Apri alla pagina', () => apriDocumento(d.id, parseInt(e.pagina, 10) || null), 'mini no-print') : null, btn('✎', () => editEstratto(e), 'mini no-print')), e.testo ? h('p', { style: 'white-space:pre-wrap' }, e.testo) : null);
}
function vEstratti(s) {
  const lista = h('div', {});
  const disegna = () => { const r = s.estratti.filter((x) => contiene(x, ui.q)); lista.replaceChildren(...(r.length ? r.map((e) => rigaEstratto(s, e)) : [vuoto(s.estratti.length ? 'Nessun estratto con questo filtro.' : 'Nessun estratto. Quando leggi nel manuale un valore o una procedura che ti serve, salvalo qui con la pagina.')])); };
  const q = h('input', { type: 'search', class: 'stretto', placeholder: 'Cerca negli estratti…', value: ui.q, oninput: () => { ui.q = q.value; disegna(); } }); disegna();
  return h('div', {}, h('div', { class: 'barra-azioni no-print' }, q, h('span', { class: 'spazio' }), btn('＋ Estratto', () => editEstratto(null), 'primary')),
    h('p', { class: 'aiuto' }, 'Gli estratti si cercano anche dalla ricerca del Quadro e compaiono nella scheda del lavoro collegato. Per cercare dentro il testo dei PDF usa il campo nella scheda Documenti o la ricerca del Quadro.'), lista);
}
function vCome(s) {
  const vin = (s.veicolo.find((v) => v.id === 'v_vin') || {}).valore;
  return h('div', {}, card('Cosa serve e dove si ottiene', h('p', {}, 'VIN del mezzo: ', h('b', {}, vin || 'non inserito'), '. Va comunicato a chi fornisce la documentazione.'),
    h('ol', { class: 'passi' },
      h('li', {}, h('b', {}, 'Libretto d\'uso e manutenzione del Vito 639. '), 'Chiedilo in concessionaria/officina Mercedes‑Benz con il VIN (anche come ristampa o PDF), oppure cercalo nel mezzo. Contiene punti di ancoraggio, carichi, pressioni, liquidi, fusibili. Controlla che l\'edizione copra il 2003–2004.'),
      h('li', {}, h('b', {}, 'Datacard. '), 'Elenco delle dotazioni di fabbrica dal VIN: la stampa la concessionaria. Serve per airbag, attacchi tetto, varianti dei ricambi.'),
      h('li', {}, h('b', {}, 'Manuale d\'officina (WIS) e catalogo ricambi (EPC). '), 'Sono i documenti ufficiali Mercedes. I costruttori devono dare accesso a pagamento alle informazioni di riparazione anche a chi non è officina autorizzata, di solito a tempo (ore o giorni): modalità, portale e prezzi vanno chiesti a Mercedes‑Benz Italia o alla concessionaria. In una sessione a tempo conviene arrivare con l\'elenco delle procedure da stampare in PDF (vedi sotto).'),
      h('li', {}, h('b', {}, 'L\'officina che segue il mezzo. '), 'Può stamparti le procedure e i valori dei lavori che farai tu. Spesso è la via più rapida.'),
      h('li', {}, h('b', {}, 'Direttive di allestimento Vito/Viano 639. '), 'Documento Mercedes per gli allestitori (forature, anticorrosione, tetto, prelievi elettrici): portale allestitori Mercedes‑Benz o concessionaria.'),
      h('li', {}, h('b', {}, 'Manuali di terzi (Haynes e simili). '), 'Utili per orientarsi; caricali come “da verificare” e non usarli per coppie e specifiche senza riscontro.')),
    avviso('Carica solo copie ottenute in modo regolare. L\'app non scarica manuali e non contiene valori presi “da internet”.', 'info')),
  card('Elenco delle procedure da chiedere o stampare', h('p', { class: 'aiuto' }, 'Ricavato dai lavori aperti: per ognuno, cosa cercare nel manuale d\'officina.'),
    h('ul', { class: 'piatto' }, ['Tagliando: specifica e quantità dell\'olio motore, filtri, intervalli; liquido refrigerante e freni; olio cambio e differenziale', 'Coppie di serraggio: tappo olio, ruote, candelette, cinghia servizi', 'Candelette: procedura di smontaggio e centralina di preriscaldo', 'Sovralimentazione: schema del circuito del vuoto, valori di prova dell\'attuatore e del trasduttore di pressione', 'Smontaggio dei pannelli delle portiere e del cielo cabina; posizione di airbag e pretensionatori', 'Tetto: posizione e uso degli attacchi per barre', 'Carico: punti di ancoraggio e loro portata', 'Schemi elettrici: presa OBD, punti di prelievo ammessi, fusibili', 'Protezione anticorrosione dopo lavorazioni sulla scocca'].map((t) => h('li', {}, t)))));
}
