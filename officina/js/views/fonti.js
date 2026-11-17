// Archivio delle fonti: ogni informazione tecnica importante ha fonte, applicabilità e stato di verifica.
import { store } from '../store.js';
import { h, card, badge, chip, btn, openForm, uid, vuoto, contiene } from '../ui.js';

const ui = { q: '' };
const TIPI = ['costruttore', 'produttore', 'produttore (via portale)', 'produttore (copia su sito terzo)', 'catalogo indipendente', 'terze parti', 'forum / video (solo indizio)', 'progetto personale', 'officina'];

export function render() {
  const s = store.s; const lista = h('div', {});
  const edit = (f) => openForm({ titolo: f ? 'Fonte' : 'Nuova fonte', valore: f || { id: uid('f'), tipo: 'produttore', stato: 'da_verificare' },
    campi: [{ k: 'titolo', label: 'Titolo', richiesto: true }, { k: 'url', label: 'Indirizzo o collocazione (URL, file, faldone)' }, { k: 'tipo', label: 'Tipo di fonte', tipo: 'select', opzioni: TIPI, aiuto: 'Forum e video sono indizi, non valgono quanto il costruttore.' }, { k: 'applicabilita', label: 'A cosa si applica (versione, prodotto, condizioni)', tipo: 'textarea' }, { k: 'stato', label: 'Stato di verifica', tipo: 'stato' }, { k: 'manca', label: 'Cosa manca / come ottenerla (VIN, acquisto, accesso professionale)', tipo: 'textarea' }],
    onSave: (v) => store.update((st) => { const i = st.fonti.findIndex((x) => x.id === v.id); if (i < 0) st.fonti.push(v); else st.fonti[i] = v; }),
    onDelete: f ? () => store.update((st) => { st.fonti = st.fonti.filter((x) => x.id !== f.id); st.lavori.forEach((l) => { l.fonti = l.fonti.filter((x) => x !== f.id); }); }) : null });
  const disegna = () => { const r = s.fonti.filter((x) => contiene(x, ui.q));
    lista.replaceChildren(...(r.length ? r.map((f) => { const usi = s.lavori.filter((l) => l.fonti.includes(f.id));
      return card(null, h('div', { class: 'riga' }, h('div', { class: 'cresce' }, h('b', {}, f.titolo), h('div', { class: 'aiuto' }, f.tipo + ' · id: ' + f.id)), badge(f.stato), btn('✎', () => edit(f), 'mini no-print')),
        f.url ? h('p', {}, /^https?:/.test(f.url) ? h('a', { href: f.url, target: '_blank', rel: 'noopener' }, f.url) : f.url) : null,
        f.applicabilita ? h('p', {}, h('b', {}, 'Applicabilità: '), f.applicabilita) : null, f.manca ? h('p', { class: 'nota warn' }, h('b', {}, 'Manca: '), f.manca) : null,
        usi.length ? h('p', { class: 'aiuto' }, 'Usata in: ', usi.map((l, i) => [i ? ', ' : '', h('a', { href: '#/lavori/' + l.id }, l.titolo)])) : null); }) : [vuoto('Nessuna fonte.')])); };
  const q = h('input', { type: 'search', class: 'stretto', placeholder: 'Cerca fra le fonti…', value: ui.q, oninput: () => { ui.q = q.value; disegna(); } }); disegna();
  return h('div', {}, h('div', { class: 'testata' }, h('div', {}, h('h1', {}, 'Fonti e documentazione'), h('p', {}, 'Il manuale d\'officina Mercedes corretto non è ancora acquisito: serve il VIN. I link si aprono solo con connessione.')), btn('＋ Fonte', () => edit(null), 'primary no-print')),
    h('div', { class: 'barra-azioni no-print' }, q, chip(`${s.fonti.filter((f) => f.stato === 'da_verificare').length} da verificare`, 'warn')), lista);
}
