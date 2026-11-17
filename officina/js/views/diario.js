// Diario (note, foto, documenti, manutenzioni, misure) e Rilievi (informazioni mancanti, ordinate per decisioni sbloccate).
import { store } from '../store.js';
import { h, card, badge, chip, btn, openForm, uid, vuoto, tabs, contiene, dataIt, oggi, fotoStrip, avviso, num } from '../ui.js';

const ui = { tab: 'diario', q: '', tipo: '', soloAperti: true };
const TIPI = ['nota', 'foto', 'misura', 'manutenzione', 'documento', 'rifornimento/consumi'];

export function render(arg) {
  if (['diario', 'rilievi'].includes(arg)) ui.tab = arg;
  return h('div', {}, h('div', { class: 'testata' }, h('div', {}, h('h1', {}, 'Diario e rilievi'), h('p', {}, 'Ciò che fai, misuri e scopri. Foto e documenti restano su questo dispositivo e nel backup.'))),
    tabs([['diario', 'Diario'], ['rilievi', 'Rilievi e informazioni mancanti']], ui.tab, (k) => { ui.tab = k; store.ridisegna(); }), ui.tab === 'diario' ? vDiario() : vRilievi());
}

function editVoce(d) {
  const s = store.s;
  openForm({ titolo: d ? 'Voce di diario' : 'Nuova voce di diario', valore: d || { id: uid('d'), data: oggi(), tipo: 'nota', foto: [], lavoroId: '' },
    campi: [{ k: 'titolo', label: 'Titolo', richiesto: true }, { k: 'data', label: 'Data', tipo: 'date' }, { k: 'tipo', label: 'Tipo', tipo: 'select', opzioni: TIPI }, { k: 'km', label: 'Chilometri', tipo: 'number', unita: 'km' }, { k: 'testo', label: 'Testo, misure, risultati', tipo: 'textarea' }, { k: 'lavoroId', label: 'Lavoro collegato', tipo: 'select', opzioni: [['', '— nessuno —'], ...s.lavori.map((l) => [l.id, l.titolo])] }],
    onSave: (v) => store.update((st) => { const i = st.diario.findIndex((x) => x.id === v.id); if (i < 0) st.diario.push(v); else st.diario[i] = v; }),
    onDelete: d ? () => store.update((st) => { (d.foto || []).forEach((f) => store.delFile(f)); st.diario = st.diario.filter((x) => x.id !== d.id); }) : null });
}

function vDiario() {
  const s = store.s; const lista = h('div', {});
  const disegna = () => { const r = s.diario.filter((x) => (!ui.tipo || x.tipo === ui.tipo) && contiene(x, ui.q)).sort((a, b) => String(b.data || '').localeCompare(String(a.data || '')));
    lista.replaceChildren(...(r.length ? r.map((d) => card(null, h('div', { class: 'riga' }, h('div', { class: 'cresce' }, h('b', {}, d.titolo), h('div', { class: 'aiuto' }, [dataIt(d.data), num(d.km) !== null ? d.km + ' km' : null, d.lavoroId ? s.lavori.find((l) => l.id === d.lavoroId)?.titolo : null].filter(Boolean).join(' · '))), chip(d.tipo), btn('✎', () => editVoce(d), 'mini no-print')),
      d.testo ? h('p', { style: 'white-space:pre-wrap' }, d.testo) : null, fotoStrip(d.foto, (ids) => store.update((st) => { st.diario.find((x) => x.id === d.id).foto = ids; })))) : [vuoto('Nessuna voce.')])); };
  const sel = h('select', { class: 'stretto', onchange: () => { ui.tipo = sel.value; disegna(); } }, h('option', { value: '' }, 'Tutti i tipi'), TIPI.map((t) => h('option', { value: t }, t))); sel.value = ui.tipo;
  const q = h('input', { type: 'search', class: 'stretto', placeholder: 'Cerca nel diario…', value: ui.q, oninput: () => { ui.q = q.value; disegna(); } }); disegna();
  return h('div', {}, h('div', { class: 'barra-azioni no-print' }, sel, q, h('span', { class: 'spazio' }), btn('＋ Voce', () => editVoce(null), 'primary')), lista);
}

function vRilievi() {
  const s = store.s;
  const edit = (r) => openForm({ titolo: r ? 'Rilievo' : 'Nuova informazione da ottenere', valore: r ? { ...r, sbloccaTxt: r.sblocca } : { id: uid('r'), stato: 'da_verificare', valore: null, unita: '', sblocca: [], sbloccaTxt: [] },
    campi: [{ k: 'domanda', label: 'Cosa serve sapere', tipo: 'textarea', richiesto: true }, { k: 'valore', label: 'Valore rilevato' + (r?.bind ? ' (numero: aggiorna da solo mappa/materiali)' : ''), tipo: r?.bind ? 'number' : 'text', unita: r?.unita, aiuto: 'Vuoto = ancora sconosciuto' }, r?.bind ? null : { k: 'unita', label: 'Unità' },
      { k: 'stato', label: 'Attendibilità', tipo: 'stato', aiuto: 'Passa a “Misurato” o “Documentato” quando hai il dato.' }, { k: 'nota', label: 'Come è stato misurato / fonte', tipo: 'textarea' }, { k: 'sbloccaTxt', label: 'Decisioni che sblocca (una per riga)', tipo: 'lines' }].filter(Boolean),
    onSave: (v) => store.update((st) => { v.sblocca = v.sbloccaTxt; delete v.sbloccaTxt; if (v.valore === '') v.valore = null;
      if (v.bind && num(v.valore) !== null) { if (store.setPath(st, v.bind, Number(v.valore))) { if (v.stato === 'da_verificare') v.stato = 'misurato'; if (v.bind.startsWith('geom.')) st.geom.stato = 'misurato'; } }
      const i = st.rilievi.findIndex((x) => x.id === v.id); if (i < 0) st.rilievi.push(v); else st.rilievi[i] = v; }),
    onDelete: r ? () => store.update((st) => { st.rilievi = st.rilievi.filter((x) => x.id !== r.id); }) : null });
  const fatto = (r) => ['misurato', 'documentato'].includes(r.stato);
  const tutti = [...s.rilievi].sort((a, b) => (fatto(a) - fatto(b)) || (b.sblocca.length - a.sblocca.length));
  const vis = tutti.filter((r) => !ui.soloAperti || !fatto(r));
  const nFatti = s.rilievi.filter(fatto).length;
  return h('div', {}, h('div', { class: 'barra-azioni no-print' }, h('label', { class: 'campo riga-check' }, h('input', { type: 'checkbox', checked: ui.soloAperti, onchange: (e) => { ui.soloAperti = e.target.checked; store.ridisegna(); } }), 'Solo quelli ancora aperti'), h('span', { class: 'spazio' }), btn('＋ Informazione', () => edit(null), 'primary')),
    h('p', {}, `${nFatti} di ${s.rilievi.length} ottenuti. In cima quelli che sbloccano più decisioni.`),
    avviso('I rilievi numerici di geometria e superfici aggiornano direttamente Mappa, Materiali e Simulatore, e passano il dato a “misurato”.', 'info'),
    vis.length ? vis.map((r) => h('div', { class: 'card riga clic', onclick: () => edit(r) }, h('div', { class: 'cresce' }, h('b', {}, r.domanda), h('div', {}, r.valore == null ? h('i', { class: 'vuoto' }, 'da rilevare') : h('span', { class: 'chip ok' }, r.valore + (r.unita ? ' ' + r.unita : ''))), h('div', { class: 'aiuto' }, 'Sblocca: ' + (r.sblocca.join(', ') || '—'))), r.bind ? chip('collegato ai calcoli', 'acc') : null, badge(r.stato))) : vuoto('Tutto rilevato.'));
}
