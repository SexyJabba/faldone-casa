// Quadro iniziale: stato del mezzo, budget, problemi, prossime azioni, informazioni mancanti. Più la ricerca globale.
import { store } from '../store.js';
import { budget } from '../calc.js';
import { h, card, badge, chip, btn, euro, openForm, uid, contiene, vuoto, avviso, STATI_LAVORO, etichetta } from '../ui.js';

export function barraBudget(b) {
  const pct = (v) => Math.max(0, Math.min(100, v / (b.tetto || 1) * 100)) + '%';
  return [h('div', { class: 'barra', title: 'Ripartizione del tetto' },
    h('i', { style: `width:${pct(b.sostenuto)};background:var(--ink)` }), h('i', { style: `width:${pct(b.previsto)};background:var(--acc)` }), h('i', { style: `width:${pct(b.riserva)};background:var(--warn)` })),
  h('div', { class: 'legenda' }, h('span', {}, h('i', { style: 'background:var(--ink)' }), 'Speso'), h('span', {}, h('i', { style: 'background:var(--acc)' }), 'Previsto'), h('span', {}, h('i', { style: 'background:var(--warn)' }), 'Riserva imprevisti'), h('span', {}, h('i', { style: 'background:var(--line)' }), 'Libero'))];
}

export function render() {
  const s = store.s, b = budget(s);
  const prio = (p) => chip('P' + p, p === 1 ? 'err' : p === 2 ? 'warn' : '');
  const senzaPrezzo = b.acquistiSenzaPrezzo + b.sistemaSenzaPrezzo;

  const cerca = h('input', { type: 'search', placeholder: 'Cerca in lavori, materiali, diario, fonti…', class: 'no-print', onkeydown: (e) => { if (e.key === 'Enter' && cerca.value.trim()) location.hash = '#/cerca/' + encodeURIComponent(cerca.value.trim()); } });

  const cBudget = card('Budget', h('div', { class: 'numeri' },
    h('div', { class: 'num' + (b.residuo < 0 ? ' err' : '') }, h('b', {}, euro(b.residuo)), h('span', {}, 'Residuo reale')),
    h('div', { class: 'num' }, h('b', {}, euro(b.sostenuto)), h('span', {}, 'Speso su ' + euro(b.tetto))),
    h('div', { class: 'num' }, h('b', {}, euro(b.previsto)), h('span', {}, 'Previsto (preventivi, stime, scenari attivi)')),
    h('div', { class: 'num ' + (b.libero < 0 ? 'err' : 'ok') }, h('b', {}, euro(b.libero)), h('span', {}, 'Libero dopo previsto e riserva'))),
  barraBudget(b),
  b.quotaResidua > 0 ? avviso(`${euro(b.quotaResidua)} già spesi restano da dettagliare con le ricevute.`, 'info') : null,
  senzaPrezzo ? avviso(`${senzaPrezzo} voci previste non hanno ancora un prezzo: il “previsto” è sottostimato.`) : null,
  b.avvisi.map((a) => avviso(a, 'err')),
  h('p', {}, h('a', { href: '#/budget' }, 'Apri budget e inventario →')));

  const cProblemi = card('Problemi aperti',
    [...s.problemi].sort((a, c) => a.priorita - c.priorita).map((p) => h('div', { class: 'riga clic', onclick: () => editProblema(p) },
      prio(p.priorita), h('div', { class: 'cresce' }, h('b', {}, p.titolo), h('div', { class: 'aiuto' }, p.zona + ' · ' + p.stato)), badge(p.certezza))),
    s.problemi.length ? null : vuoto('Nessun problema registrato.'),
    h('div', { class: 'barra-azioni no-print' }, btn('＋ Problema', () => editProblema(null))));

  const ordine = { in_corso: 0, in_attesa: 1, pronto: 2, da_pianificare: 3 };
  const attivi = s.lavori.filter((l) => l.stato !== 'concluso').sort((a, c) => (ordine[a.stato] - ordine[c.stato]) || (a.priorita - c.priorita)).slice(0, 7);
  const cAzioni = card('Lavori attivi e prossime azioni',
    attivi.map((l) => h('a', { class: 'riga clic', href: '#/lavori/' + l.id, style: 'text-decoration:none;color:inherit' }, prio(l.priorita),
      h('div', { class: 'cresce' }, h('b', {}, l.titolo), l.attese ? h('div', { class: 'aiuto' }, 'In attesa di: ' + l.attese) : null), chip(etichetta(STATI_LAVORO, l.stato), l.stato === 'in_corso' ? 'acc' : l.stato === 'pronto' ? 'ok' : ''))),
    h('p', {}, h('a', { href: '#/lavori' }, `Tutti i ${s.lavori.length} lavori (${s.lavori.filter((l) => l.stato === 'concluso').length} conclusi) →`)));

  const mancanti = s.rilievi.filter((r) => r.stato !== 'misurato' && r.stato !== 'documentato').sort((a, c) => c.sblocca.length - a.sblocca.length);
  const cMancanti = card(`Informazioni mancanti (${mancanti.length})`,
    h('p', { class: 'aiuto' }, 'Ordinate per numero di decisioni che sbloccano.'),
    mancanti.slice(0, 6).map((r) => h('div', { class: 'riga' }, h('div', { class: 'cresce' }, r.domanda, h('div', { class: 'aiuto' }, 'Sblocca: ' + r.sblocca.join(', '))))),
    h('p', {}, h('a', { href: '#/diario/rilievi' }, 'Compila i rilievi →')));

  const cVeicolo = card('Il mezzo',
    s.veicolo.map((v) => h('div', { class: 'riga clic', onclick: () => editVeicolo(v) },
      h('div', { class: 'cresce' }, h('small', {}, v.label), h('div', {}, v.valore == null || v.valore === '' ? h('i', { class: 'vuoto' }, 'sconosciuto') : h('b', {}, v.valore + (v.unita ? ' ' + v.unita : ''))), v.nota ? h('div', { class: 'aiuto' }, v.nota) : null), badge(v.stato))),
    h('div', { class: 'barra-azioni no-print' }, btn('＋ Dato', () => editVeicolo(null))));

  return h('div', {}, h('div', { class: 'testata' }, h('div', {}, h('h1', {}, 'Vito — Officina e Camper'), h('p', {}, 'W639 115 CDI · fase mista lavoro/camper · le simulazioni non sostituiscono verifiche fisiche e professionali')), h('div', { style: 'flex:1;max-width:380px;min-width:220px' }, cerca)),
    (() => { const pg = (s.progetti || []).find((x) => x.attivo); return pg ? h('p', {}, 'Progetto attivo: ', h('a', { href: '#/progetto' }, h('b', {}, pg.nome)), ' · ', h('a', { href: '#/lavori/percorso' }, 'percorso guidato dei lavori →')) : null; })(),
    h('div', { class: 'griglia' }, cBudget, cAzioni, cProblemi, cMancanti), h('div', { style: 'height:1rem' }), cVeicolo);
}

function editProblema(p) {
  openForm({ titolo: p ? 'Problema' : 'Nuovo problema', valore: p || { id: uid('p'), priorita: 2, stato: 'aperto', certezza: 'dichiarato', zona: '' },
    campi: [{ k: 'titolo', label: 'Titolo', richiesto: true }, { k: 'descr', label: 'Descrizione e osservazioni', tipo: 'textarea' }, { k: 'zona', label: 'Zona' },
      { k: 'priorita', label: 'Priorità', tipo: 'select', opzioni: [[1, '1 — alta'], [2, '2 — media'], [3, '3 — bassa']] }, { k: 'stato', label: 'Stato', tipo: 'select', opzioni: ['aperto', 'in diagnosi', 'risolto'] }, { k: 'certezza', label: 'Attendibilità', tipo: 'stato' }],
    onSave: (v) => store.update((s) => { v.priorita = Number(v.priorita); const i = s.problemi.findIndex((x) => x.id === v.id); if (i < 0) s.problemi.push(v); else s.problemi[i] = v; }),
    onDelete: p ? () => store.update((s) => { s.problemi = s.problemi.filter((x) => x.id !== p.id); }) : null });
}
function editVeicolo(v) {
  openForm({ titolo: v ? v.label : 'Nuovo dato del mezzo', valore: v || { id: uid('v'), stato: 'dichiarato' },
    campi: [{ k: 'label', label: 'Voce', richiesto: true }, { k: 'valore', label: 'Valore', aiuto: 'Vuoto = sconosciuto' }, { k: 'unita', label: 'Unità' }, { k: 'stato', label: 'Attendibilità', tipo: 'stato' }, { k: 'nota', label: 'Nota / fonte', tipo: 'textarea' }],
    onSave: (o) => store.update((s) => { if (o.valore === '') o.valore = null; const i = s.veicolo.findIndex((x) => x.id === o.id); if (i < 0) s.veicolo.push(o); else s.veicolo[i] = o; }),
    onDelete: v ? () => store.update((s) => { s.veicolo = s.veicolo.filter((x) => x.id !== v.id); }) : null });
}

export function renderCerca(q) {
  const s = store.s; q = q || '';
  const gruppi = [
    ['Lavori', s.lavori, (x) => ['#/lavori/' + x.id, x.titolo, x.obiettivo]], ['Inventario', s.inventario, (x) => ['#/budget/inventario', x.nome, x.nota]],
    ['Diario', s.diario, (x) => ['#/diario', x.titolo, x.testo]], ['Rilievi', s.rilievi, (x) => ['#/diario/rilievi', x.domanda, x.valore]],
    ['Estratti dai manuali', s.estratti || [], (x) => ['#/manuali/estratti', x.titolo, x.testo]], ['Manuali', s.documenti || [], (x) => ['#/manuali', x.titolo, x.applicabilita]],
    ['Fonti', s.fonti, (x) => ['#/fonti', x.titolo, x.applicabilita]], ['Problemi', s.problemi, (x) => ['#/quadro', x.titolo, x.descr]],
    ['Spese', s.spese, (x) => ['#/budget', x.descr, euro(x.importo)]], ['Il mezzo', s.veicolo, (x) => ['#/quadro', x.label, x.valore]],
  ];
  const out = gruppi.map(([nome, arr, f]) => { const r = arr.filter((x) => contiene(x, q)); return r.length ? card(`${nome} (${r.length})`, r.map((x) => { const [href, t, sub] = f(x); return h('a', { class: 'riga clic', href, style: 'text-decoration:none;color:inherit' }, h('div', { class: 'cresce' }, h('b', {}, t), sub ? h('div', { class: 'aiuto' }, String(sub).slice(0, 160)) : null)); })) : null; }).filter(Boolean);
  // Dentro i PDF dei manuali: arriva dopo (lettura dall'archivio), in una scheda a parte.
  const pdf = h('div', {});
  if ((s.documenti || []).length && q.trim()) import('./biblioteca.js').then((m) => m.risultatiPdf(s, q)).then((el) => pdf.replaceChildren(card('Dentro i PDF dei manuali', el))).catch((e) => console.warn(e));
  return h('div', {}, h('div', { class: 'testata' }, h('h1', {}, `Ricerca: “${q}”`), h('a', { href: '#/quadro' }, '← Quadro')), out.length ? out : vuoto('Nessun risultato nei dati dell\'app.'), pdf);
}
