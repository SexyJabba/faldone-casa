// Budget, spese, inventario e lista carichi. Regola: nel “speso” entrano SOLO le spese sostenute; l'inventario non aggiunge mai costo da solo.
import { store } from '../store.js';
import { budget, carichi, parseCarichi, num, DISP_PREVISTI } from '../calc.js';
import { h, card, badge, chip, btn, n, euro, openForm, uid, avviso, vuoto, tabs, contiene, dataIt, oggi, editInventario, registraAcquisto, scarica, CAT_INV, DISP, etichetta } from '../ui.js';
import { barraBudget } from './quadro.js';

const ui = { tab: 'budget', q: '', disp: '', tipo: '' };
const TIPI = [['sostenuta', 'Spesa sostenuta'], ['preventivo', 'Preventivo ricevuto'], ['stima', 'Stima']];

export function render(arg) {
  if (['budget', 'inventario', 'carichi'].includes(arg)) ui.tab = arg;
  const corpo = ui.tab === 'budget' ? vBudget() : ui.tab === 'inventario' ? vInventario() : vCarichi();
  return h('div', {}, h('div', { class: 'testata' }, h('div', {}, h('h1', {}, 'Budget e inventario'), h('p', {}, 'Speso, preventivato, stimato e già disponibile restano sempre distinti.'))),
    tabs([['budget', 'Budget e spese'], ['inventario', 'Inventario'], ['carichi', 'Lista carichi']], ui.tab, (k) => { ui.tab = k; store.ridisegna(); }), corpo);
}

function editSpesa(x) {
  const s = store.s;
  openForm({ titolo: x ? 'Voce di spesa' : 'Nuova voce', valore: x || { id: uid('s'), data: oggi(), tipo: 'sostenuta', inQuota: false, categoria: '', lavoroId: '' },
    campi: [{ k: 'descr', label: 'Descrizione', richiesto: true }, { k: 'importo', label: 'Importo', tipo: 'number', unita: '€', richiesto: true }, { k: 'tipo', label: 'Tipo', tipo: 'select', opzioni: TIPI, aiuto: 'Preventivi e stime non riducono il residuo reale: entrano nel “previsto”.' }, { k: 'data', label: 'Data', tipo: 'date' }, { k: 'categoria', label: 'Categoria (meccanica, materiali, elettrico…)' },
      { k: 'inQuota', label: 'Fa parte dei ~1.000 € già spesi “da dettagliare” (non aumenta il totale speso)', tipo: 'checkbox' }, { k: 'lavoroId', label: 'Lavoro collegato', tipo: 'select', opzioni: [['', '— nessuno —'], ...s.lavori.map((l) => [l.id, l.titolo])] }, { k: 'nota', label: 'Nota / n. ricevuta / fornitore', tipo: 'textarea' }],
    onSave: (v) => store.update((st) => { const i = st.spese.findIndex((q) => q.id === v.id); if (i < 0) st.spese.push(v); else st.spese[i] = v; }),
    onDelete: x ? () => store.update((st) => { st.spese = st.spese.filter((q) => q.id !== x.id);
      // l'articolo collegato torna “da acquistare”: niente costo fantasma, niente inventario orfano
      st.inventario.forEach((i) => { if (i.spesaId === x.id) { delete i.spesaId; i.disp = 'da_acquistare'; } });
      st.energia.sistemi.forEach((sy) => sy.componenti.forEach((c) => { if (c.spesaId === x.id) { delete c.spesaId; c.disp = 'da_acquistare'; } })); }) : null });
}

function vBudget() {
  const s = store.s, b = budget(s);
  const riga = (t, v, extra, cls = '') => h('tr', {}, h('td', {}, t, extra ? h('div', { class: 'aiuto' }, extra) : null), h('td', { class: 'n ' + cls }, h('b', {}, euro(v))));
  const riepilogo = card('Riepilogo', barraBudget(b), h('table', {},
    riga('Tetto complessivo (acquisto incluso)', b.tetto),
    riga('Speso', -b.sostenuto, `di cui ${euro(b.quotaResidua)} ancora da dettagliare con ricevute (quota iniziale ${euro(b.quota)}, dettagliati ${euro(b.inQuota)})`),
    riga('Residuo reale', b.residuo, null, b.residuo < 0 ? 'err' : ''),
    riga('Preventivi ricevuti', -b.preventivi), riga('Stime inserite a mano', -b.stime),
    riga('Acquisti previsti (carrello + mancanti dello scenario materiali attivo)', -b.acquisti, b.acquistiSenzaPrezzo ? `${b.acquistiSenzaPrezzo} articoli senza prezzo o quantità: NON contati` : null),
    riga('Sistema elettrico scelto' + (b.sistemaNome ? `: ${b.sistemaNome}` : ' (nessuno)'), -b.sistema, b.sistemaSenzaPrezzo ? `${b.sistemaSenzaPrezzo} componenti senza prezzo: NON contati` : null),
    riga(`Riserva imprevisti (${n(s.impostazioni.riservaPct, 0)}% del residuo)`, -b.riserva),
    riga('Libero dopo previsto e riserva', b.libero, null, b.libero < 0 ? 'err' : 'ok')),
  b.avvisi.map((a) => avviso(a, 'err')),
  h('p', { class: 'aiuto' }, `Obiettivo per ripristino e allestimento fai‑da‑te: ${s.impostazioni.obiettivoFaiDaTe} (meccanica ed elettrico specialistici esclusi dall'obiettivo, ma dentro il tetto). Priorità alla salute meccanica.`),
  h('div', { class: 'barra-azioni no-print' }, btn('Impostazioni budget', () => openForm({ titolo: 'Impostazioni budget', valore: s.impostazioni, campi: [{ k: 'tetto', label: 'Tetto complessivo', tipo: 'number', unita: '€' }, { k: 'quotaDaDettagliare', label: 'Già speso oltre all\'acquisto, ancora da dettagliare', tipo: 'number', unita: '€', aiuto: 'Resta contato una sola volta: le ricevute segnate “fa parte dei 1.000 €” lo sostituiscono via via.' }, { k: 'riservaPct', label: 'Riserva imprevisti sul residuo', tipo: 'number', unita: '%' }, { k: 'obiettivoFaiDaTe', label: 'Obiettivo fai‑da‑te (testo)' }], onSave: (v) => store.update((st) => { st.impostazioni = v; }) }))));

  const lista = h('div', {});
  const disegna = () => { const r = s.spese.filter((x) => (!ui.tipo || x.tipo === ui.tipo) && contiene(x, ui.q)).sort((a, c) => String(c.data || '').localeCompare(String(a.data || '')));
    lista.replaceChildren(...(r.length ? r.map((x) => h('div', { class: 'riga clic', onclick: () => editSpesa(x) }, h('div', { class: 'cresce' }, h('b', {}, x.descr), h('div', { class: 'aiuto' }, [dataIt(x.data), x.categoria, x.inQuota ? 'nei 1.000 € da dettagliare' : null, x.lavoroId ? (s.lavori.find((l) => l.id === x.lavoroId)?.titolo) : null].filter(Boolean).join(' · '))), chip(etichetta(TIPI, x.tipo), x.tipo === 'sostenuta' ? '' : 'warn'), h('b', {}, euro(x.importo)))) : [vuoto('Nessuna voce.')])); };
  const sel = h('select', { class: 'stretto', onchange: () => { ui.tipo = sel.value; disegna(); } }, h('option', { value: '' }, 'Tutti i tipi'), TIPI.map(([k, t]) => h('option', { value: k }, t))); sel.value = ui.tipo;
  const q = h('input', { type: 'search', class: 'stretto', placeholder: 'Filtra…', value: ui.q, oninput: () => { ui.q = q.value; disegna(); } }); disegna();
  const previsti = b.righeAcquisti.length ? card('Acquisti previsti (non ancora spesi)', b.righeAcquisti.map((a) => h('div', { class: 'riga' }, h('div', { class: 'cresce' }, a.nome, h('div', { class: 'aiuto' }, `carrello: ${a.daCarrello ?? '?'} · richiesti dallo scenario attivo: ${a.daScenario ?? '?'}`)), h('span', {}, a.qta === null ? 'quantità ?' : '× ' + n(a.qta, 0)), h('b', {}, a.costo === null ? 'prezzo ?' : euro(a.costo)))),
    h('p', { class: 'aiuto' }, 'Per ogni articolo conta la quantità maggiore fra carrello e fabbisogno dello scenario attivo, una volta sola. Cambiando scenario questa lista cambia; le spese reali no.')) : null;
  return h('div', {}, riepilogo, card('Spese, preventivi e stime', h('div', { class: 'barra-azioni no-print' }, sel, q, h('span', { class: 'spazio' }), btn('＋ Voce', () => editSpesa(null), 'primary')), lista), previsti);
}

function vInventario() {
  const s = store.s; const lista = h('div', {});
  const disegna = () => { const r = s.inventario.filter((x) => (!ui.disp || x.disp === ui.disp) && contiene(x, ui.q));
    lista.replaceChildren(...(r.length ? r.map((x) => h('div', { class: 'riga' }, h('div', { class: 'cresce clic', style: 'cursor:pointer', onclick: () => editInventario(x) }, h('b', {}, x.nome), ' ', badge(x.stato), h('div', { class: 'aiuto' }, `${x.categoria} · ${num(x.qta) === null ? 'quantità sconosciuta' : n(x.qta, 2) + ' ' + (x.unita || '')}${num(x.costoUnit) !== null ? ' · ' + euro(x.costoUnit) + ' cad.' : ''}`), x.nota ? h('div', { class: 'aiuto' }, x.nota) : null),
      chip(etichetta(DISP, x.disp), ['posseduto', 'recupero', 'acquistato'].includes(x.disp) ? 'ok' : x.disp === 'candidato' ? '' : 'warn'),
      DISP_PREVISTI.includes(x.disp) ? btn('Acquistato', () => registraAcquisto({ descr: x.nome, importoProposto: num(x.costoUnit) !== null && num(x.qta) !== null ? x.costoUnit * x.qta : null, onCollega: (st, id) => { const i = st.inventario.find((q) => q.id === x.id); i.disp = 'acquistato'; i.spesaId = id; } }), 'mini no-print') : null)) : [vuoto('Nessun articolo.')])); };
  const sel = h('select', { class: 'stretto', onchange: () => { ui.disp = sel.value; disegna(); } }, h('option', { value: '' }, 'Tutte le disponibilità'), DISP.map(([k, t]) => h('option', { value: k }, t))); sel.value = ui.disp;
  const q = h('input', { type: 'search', class: 'stretto', placeholder: 'Filtra…', value: ui.q, oninput: () => { ui.q = q.value; disegna(); } }); disegna();
  return card('Materiali, utensili, ricambi', h('p', { class: 'aiuto' }, '“Acquistato” crea una sola spesa e collega l\'articolo: il costo non viene mai contato due volte. Ciò che è posseduto o di recupero non genera uscite.'),
    h('div', { class: 'barra-azioni no-print' }, sel, q, h('span', { class: 'spazio' }), btn('＋ Articolo', () => editInventario(null), 'primary')), lista);
}

function vCarichi() {
  const s = store.s; const utile = num(s.veicolo.find((v) => v.id === 'v_utile')?.valore);
  const edit = (c) => openForm({ titolo: c ? c.nome : 'Nuovo carico', valore: c || { id: uid('q'), modo: 'entrambi', qta: 1, massa_kg: null },
    campi: [{ k: 'nome', label: 'Voce', richiesto: true }, { k: 'modo', label: 'Configurazione', tipo: 'select', opzioni: ['lavoro', 'camper', 'entrambi'] }, { k: 'massa_kg', label: 'Massa unitaria', tipo: 'number', unita: 'kg', aiuto: 'Vuoto = da pesare' }, { k: 'qta', label: 'Quantità', tipo: 'number' }, { k: 'categoria', label: 'Categoria' }, { k: 'nota', label: 'Nota', tipo: 'textarea' }],
    onSave: (v) => store.update((st) => { const i = st.carichi.findIndex((q) => q.id === v.id); if (i < 0) st.carichi.push(v); else st.carichi[i] = v; }),
    onDelete: c ? () => store.update((st) => { st.carichi = st.carichi.filter((q) => q.id !== c.id); }) : null });
  const esito = h('div', {});
  const inp = h('input', { type: 'file', accept: '.csv,.json,text/csv,application/json', hidden: true, onchange: async () => {
    const f = inp.files[0]; if (!f) return; const { righe, errori } = parseCarichi(await f.text()); inp.value = '';
    if (!righe.length) { esito.replaceChildren(avviso('Importazione non riuscita: ' + errori.join(' · '), 'err')); return; }
    const sost = confirm(`${righe.length} righe valide${errori.length ? `, ${errori.length} segnalazioni` : ''}.\nOK = SOSTITUISCI la lista attuale · Annulla = AGGIUNGI alla lista`);
    store.update((st) => { const nuove = righe.map((r) => ({ id: uid('q'), ...r })); st.carichi = sost ? nuove : [...st.carichi, ...nuove]; });
    if (errori.length) alert('Importato con segnalazioni:\n' + errori.join('\n'));
  } });
  const tot = (modo) => { const c = carichi(s, modo); return h('div', { class: 'num ' + (utile !== null && c.nota > utile ? 'err' : '') }, h('b', {}, n(c.nota, 0, 'kg') + (c.ignoti.length ? ' +?' : '')), h('span', {}, `Configurazione ${modo}` + (c.ignoti.length ? ` — ${c.ignoti.length} voci da pesare` : ''))); };
  return h('div', {}, card('Totali per configurazione', h('div', { class: 'numeri' }, tot('lavoro'), tot('camper'), h('div', { class: 'num' }, h('b', {}, utile === null ? 'sconosciuto' : n(utile, 0, 'kg')), h('span', {}, 'Carico utile reale (Quadro → Il mezzo)'))),
    utile === null ? avviso('Carico utile reale sconosciuto: serve la massa complessiva dal libretto e la pesata del mezzo. Fino ad allora il confronto non è possibile.') : null,
    h('p', { class: 'aiuto' }, 'Le voci senza massa NON valgono zero: il totale è un minimo. La somma delle masse non verifica i carichi per asse né gli ancoraggi.')),
  card('Lista carichi', s.carichi.map((c) => h('div', { class: 'riga clic', onclick: () => edit(c) }, h('div', { class: 'cresce' }, h('b', {}, c.nome), h('div', { class: 'aiuto' }, [c.categoria, c.nota].filter(Boolean).join(' · '))), chip(c.modo), h('span', {}, '× ' + n(c.qta ?? 1, 0)), h('b', {}, num(c.massa_kg) === null ? 'da pesare' : n(c.massa_kg, 1, 'kg')))),
    s.carichi.length ? null : vuoto('Lista vuota.'), esito, inp,
    h('div', { class: 'barra-azioni no-print' }, btn('＋ Carico', () => edit(null), 'primary'), btn('Importa CSV/JSON', () => inp.click()),
      btn('Esporta CSV', () => scarica('carichi.csv', 'nome;modo;massa_kg;qta;categoria;nota\n' + s.carichi.map((c) => [c.nome, c.modo, c.massa_kg ?? '', c.qta ?? 1, c.categoria || '', c.nota || ''].map((x) => String(x).replace(/[;\n]/g, ' ')).join(';')).join('\n'), 'text/csv'))),
    h('p', { class: 'aiuto' }, 'Formato CSV: intestazione nome;modo;massa_kg;qta;categoria;nota — modo = lavoro, camper o entrambi. JSON: elenco di oggetti con gli stessi campi. Modello in dati/carichi-esempio.csv.')));
}
