// ui.js — piccoli mattoni dell'interfaccia: creazione elementi, formati, etichette di stato, finestre di modifica, foto.
import { store, uid } from './store.js';
import { num } from './calc.js';

const NS = 'http://www.w3.org/2000/svg';
const SVG = new Set(['svg', 'g', 'rect', 'line', 'text', 'path', 'circle', 'defs', 'pattern', 'polygon', 'tspan']);
export function h(tag, props, ...kids) {
  const e = SVG.has(tag) ? document.createElementNS(NS, tag) : document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'value') e.value = v;
    else if (k === 'checked') e.checked = !!v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  const add = (c) => { if (c == null || c === false) return; if (Array.isArray(c)) c.forEach(add); else e.append(c.nodeType ? c : String(c)); };
  kids.forEach(add); return e;
}

export const euro = (v) => num(v) === null ? '—' : num(v).toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
export const n = (v, dec = 1, unita = '') => num(v) === null ? '—' : (v === Infinity ? '∞' : num(v).toLocaleString('it-IT', { maximumFractionDigits: dec })) + (unita ? ' ' + unita : '');
export const dataIt = (d) => d ? new Date(d).toLocaleDateString('it-IT') : 'senza data';
export const oggi = () => new Date().toISOString().slice(0, 10);

export const STATI = [['dichiarato', 'Dichiarato'], ['documentato', 'Documentato'], ['ipotesi', 'Ipotesi'], ['misurato', 'Misurato'], ['da_verificare', 'Da verificare']];
export const badge = (stato) => { const s = STATI.find((x) => x[0] === stato); return s ? h('span', { class: 'badge b-' + stato, title: 'Attendibilità del dato' }, s[1]) : null; };
export const STATI_LAVORO = [['da_pianificare', 'Da pianificare'], ['pronto', 'Pronto'], ['in_corso', 'In corso'], ['in_attesa', 'In attesa'], ['concluso', 'Concluso']];
export const etichetta = (coppie, k) => (coppie.find((x) => x[0] === k) || [k, k])[1];
export const chip = (testo, cls = '') => h('span', { class: 'chip ' + cls }, testo);
export const btn = (testo, onclick, cls = '') => h('button', { type: 'button', class: 'btn ' + cls, onclick }, testo);
export const card = (titolo, ...kids) => h('section', { class: 'card' }, titolo ? h('h2', {}, titolo) : null, ...kids);
export const vuoto = (t) => h('p', { class: 'vuoto' }, t);
export const avviso = (t, cls = 'warn') => h('p', { class: 'nota ' + cls }, t);

export function tabs(voci, attiva, onSel) {
  return h('div', { class: 'tabs', role: 'tablist' }, voci.map(([k, t]) => h('button', { type: 'button', class: 'tab' + (k === attiva ? ' on' : ''), onclick: () => onSel(k) }, t)));
}

/* Finestra di modifica generica.
   campi: [{k, label, tipo: text|number|select|textarea|checkbox|date|lines|stato, opzioni, unita, aiuto}]
   onSave(valori) riceve una copia con i campi aggiornati; i numeri vuoti diventano null (sconosciuto). */
export function openForm({ titolo, campi, valore = {}, onSave, onDelete, testoSalva = 'Salva' }) {
  const ctl = {};
  const riga = (c) => {
    const v = valore[c.k]; let el;
    if (c.tipo === 'select' || c.tipo === 'stato') {
      const ops = (c.tipo === 'stato' ? STATI : c.opzioni).map((o) => Array.isArray(o) ? o : [o, o]);
      el = h('select', {}, ops.map(([val, t]) => h('option', { value: val }, t))); el.value = v ?? ops[0][0];
    } else if (c.tipo === 'textarea' || c.tipo === 'lines') {
      el = h('textarea', { rows: c.tipo === 'lines' ? 5 : 3 }); el.value = c.tipo === 'lines' ? (v || []).map((x) => typeof x === 'string' ? x : x.t).join('\n') : (v ?? '');
    } else if (c.tipo === 'checkbox') { el = h('input', { type: 'checkbox', checked: !!v });
    } else { el = h('input', { type: ['number', 'date', 'color'].includes(c.tipo) ? c.tipo : 'text', step: 'any', inputmode: c.tipo === 'number' ? 'decimal' : null }); el.value = v ?? ''; }
    ctl[c.k] = el; if (c.richiesto) el.required = true;
    const lab = [c.label, c.unita ? h('small', {}, ' [' + c.unita + ']') : null];
    return c.tipo === 'checkbox' ? h('label', { class: 'campo riga-check' }, el, h('span', {}, lab)) :
      h('label', { class: 'campo' }, h('span', {}, lab), el, c.aiuto ? h('small', { class: 'aiuto' }, c.aiuto) : null);
  };
  const dlg = h('dialog', { class: 'dlg' });
  const chiudi = () => { dlg.close(); dlg.remove(); };
  const form = h('form', { method: 'dialog', onsubmit: (e) => {
    e.preventDefault(); const out = { ...valore };
    for (const c of campi) {
      const el = ctl[c.k];
      if (c.tipo === 'number') out[c.k] = el.value.trim() === '' ? null : Number(el.value);
      else if (c.tipo === 'checkbox') out[c.k] = el.checked;
      else if (c.tipo === 'lines') out[c.k] = el.value.split('\n').map((x) => x.trim()).filter(Boolean);
      else if (c.tipo === 'date') out[c.k] = el.value || null;
      else out[c.k] = el.value;
    }
    chiudi(); onSave(out);
  } }, h('h2', {}, titolo), h('div', { class: 'campi' }, campi.map(riga)),
  h('footer', {}, onDelete ? btn('Elimina', () => { if (confirm('Eliminare definitivamente?')) { chiudi(); onDelete(); } }, 'danger') : null, h('span', { class: 'spazio' }), btn('Annulla', chiudi), h('button', { class: 'btn primary', type: 'submit' }, testoSalva)));
  dlg.append(form); document.body.append(dlg); dlg.showModal();
  return dlg;
}

// Striscia di foto/allegati legata a un elenco di id. onChange riceve il nuovo elenco.
export function fotoStrip(ids, onChange) {
  const box = h('div', { class: 'foto' });
  for (const id of ids || []) {
    const cell = h('div', { class: 'foto-cell' }); box.append(cell);
    store.getFile(id).then((f) => {
      if (!f) { cell.append(h('span', { class: 'aiuto' }, 'file mancante')); return; }
      const a = h('a', { href: f.data, target: '_blank', download: f.tipo.startsWith('image/') ? null : f.nome, title: f.nome });
      a.append(f.tipo.startsWith('image/') ? h('img', { src: f.data, alt: f.nome, loading: 'lazy' }) : h('span', { class: 'doc' }, '📄 ' + f.nome));
      cell.append(a);
      if (onChange) cell.append(h('button', { type: 'button', class: 'x no-print', title: 'Rimuovi', onclick: async () => { if (confirm('Rimuovere il file?')) { await store.delFile(id); onChange(ids.filter((x) => x !== id)); } } }, '×'));
    });
  }
  if (onChange) {
    const inp = h('input', { type: 'file', accept: 'image/*,application/pdf', multiple: true, hidden: true, onchange: async () => {
      const nuovi = [];
      for (const f of inp.files) { try { nuovi.push(await store.addFile(f)); } catch (e) { alert(e.message); } }
      if (nuovi.length) onChange([...(ids || []), ...nuovi]);
    } });
    box.append(inp, h('button', { type: 'button', class: 'btn no-print', onclick: () => inp.click() }, '＋ Foto o documento'));
  }
  return box;
}

export function scarica(nome, testo, tipo = 'application/json') {
  const a = h('a', { href: URL.createObjectURL(new Blob([testo], { type: tipo })), download: nome });
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
export const contiene = (obj, q) => !q || JSON.stringify(obj).toLowerCase().includes(q.toLowerCase());
export { uid, num };

/* ---- azioni condivise fra sezioni ---- */
export const CAT_INV = ['isolante', 'smorzante', 'pannello', 'finitura', 'ferramenta', 'consumabile', 'utensile', 'ricambio', 'attrezzatura', 'altro'];
export const CAT_STRATO = ['isolante', 'smorzante', 'pannello', 'finitura'];
export const DISP = [['posseduto', 'Posseduto'], ['recupero', 'Recupero'], ['acquistato', 'Acquistato'], ['carrello', 'Nel carrello'], ['da_acquistare', 'Da acquistare'], ['candidato', 'Candidato (solo ipotesi)']];

export function editInventario(item) {
  const nuovo = !item;
  openForm({ titolo: nuovo ? 'Nuovo articolo' : 'Modifica articolo', valore: item || { id: uid('i'), categoria: 'altro', disp: 'posseduto', qta: 1, unita: 'pz', stato: 'dichiarato' },
    campi: [{ k: 'nome', label: 'Nome', richiesto: true }, { k: 'categoria', label: 'Categoria', tipo: 'select', opzioni: CAT_INV },
      { k: 'disp', label: 'Disponibilità', tipo: 'select', opzioni: DISP, aiuto: '“Candidato” non entra nel budget finché non è usato nello scenario attivo.' },
      { k: 'qta', label: 'Quantità', tipo: 'number', aiuto: 'Vuoto = sconosciuta' }, { k: 'unita', label: 'Unità (conf, m², pz…)' },
      { k: 'costoUnit', label: 'Costo per unità', tipo: 'number', unita: '€', aiuto: 'Vuoto = prezzo non noto' },
      { k: 'areaUnit_m2', label: 'Superficie coperta da una unità', tipo: 'number', unita: 'm²' }, { k: 'spessore_mm', label: 'Spessore', tipo: 'number', unita: 'mm' },
      { k: 'massa_kg_m2', label: 'Massa superficiale', tipo: 'number', unita: 'kg/m²' }, { k: 'lambda', label: 'Conducibilità λ', tipo: 'number', unita: 'W/mK' },
      { k: 'R_dich', label: 'Resistenza R dichiarata (alle condizioni di posa reali)', tipo: 'number', unita: 'm²K/W', aiuto: 'Per termoriflettenti: solo se le intercapedini d\'aria previste dalla scheda esistono davvero.' },
      { k: 'noTermico', label: 'Non conta come isolante termico (smorzanti, finiture)', tipo: 'checkbox' },
      { k: 'stato', label: 'Attendibilità dei dati', tipo: 'stato' }, { k: 'nota', label: 'Note, condizioni di posa, scheda tecnica', tipo: 'textarea' }],
    onSave: (v) => store.update((s) => { const i = s.inventario.findIndex((x) => x.id === v.id); if (i < 0) s.inventario.push(v); else s.inventario[i] = v; }),
    onDelete: nuovo ? null : () => store.update((s) => {
      s.inventario = s.inventario.filter((x) => x.id !== item.id);
      for (const sc of s.scenariStrati) for (const z of Object.keys(sc.zone)) sc.zone[z] = sc.zone[z].filter((l) => l.mat !== item.id);
    }) });
}

// Registra un acquisto: crea UNA spesa sostenuta e la collega all'oggetto (che così esce dal “previsto”).
export function registraAcquisto({ descr, importoProposto, onCollega }) {
  openForm({ titolo: 'Registra acquisto', testoSalva: 'Registra', valore: { data: oggi(), importo: importoProposto ?? null, inQuota: false, descr },
    campi: [{ k: 'descr', label: 'Descrizione', richiesto: true }, { k: 'importo', label: 'Importo pagato', tipo: 'number', unita: '€', richiesto: true }, { k: 'data', label: 'Data', tipo: 'date' },
      { k: 'inQuota', label: 'Fa parte dei ~1.000 € già spesi “da dettagliare” (non aumenta il totale)', tipo: 'checkbox' }, { k: 'nota', label: 'Nota / n. ricevuta', tipo: 'textarea' }],
    onSave: (v) => store.update((s) => { const id = uid('s'); s.spese.push({ id, data: v.data, descr: v.descr, categoria: 'Acquisti', importo: v.importo, tipo: 'sostenuta', inQuota: v.inQuota, nota: v.nota || '' }); onCollega(s, id); }) });
}
