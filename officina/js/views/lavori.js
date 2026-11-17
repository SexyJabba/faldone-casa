// Piano di restauro: elenco dei lavori e scheda di ogni lavoro (stampabile per l'officina).
import { store } from '../store.js';
import { percorso, stratigrafia } from '../calc.js';
import { passo } from '../seed.js';
import { apriDocumento, etichettaRif, rigaEstratto, editEstratto } from './biblioteca.js';
import { h, card, badge, chip, btn, n, euro, openForm, uid, avviso, vuoto, fotoStrip, contiene, dataIt, oggi, STATI_LAVORO, etichetta, num, tabs, DISP } from '../ui.js';

const ui = { stato: '', q: '', tab: 'percorso' };
const TIPO = { documentata: ['D', 'Documentata da fonte'], proposta: ['P', 'Proposta progettuale'], verifica: ['V', 'Verifica ancora necessaria'] };
const natura = (l) => { const c = { documentata: 0, proposta: 0, verifica: 0 }; l.passi.forEach((x) => { c[x.tipo] = (c[x.tipo] || 0) + 1; }); return `${c.documentata} doc · ${c.proposta} proposte · ${c.verifica} verifiche`; };
const CHI = [['io', 'Io'], ['specialista', 'Specialista'], ['misto', 'Io + specialista']];
const prio = (p) => chip('P' + p, p === 1 ? 'err' : p === 2 ? 'warn' : '');

export function render(arg) {
  const s = store.s;
  if (arg === 'percorso' || arg === 'elenco') ui.tab = arg;
  else if (arg) { const l = s.lavori.find((x) => x.id === arg); return l ? scheda(l) : h('div', {}, vuoto('Lavoro non trovato.'), h('a', { href: '#/lavori' }, '← Lavori')); }
  const lista = h('div', {});
  const disegna = () => {
    const ord = { in_corso: 0, in_attesa: 1, pronto: 2, da_pianificare: 3, concluso: 4 };
    const r = s.lavori.filter((l) => (!ui.stato || l.stato === ui.stato) && contiene(l, ui.q)).sort((a, b) => (ord[a.stato] - ord[b.stato]) || (a.priorita - b.priorita));
    lista.replaceChildren(...(r.length ? r.map((l) => { const bloccato = l.dipende.map((d) => s.lavori.find((x) => x.id === d)).filter((d) => d && d.stato !== 'concluso');
      return h('a', { class: 'card', href: '#/lavori/' + l.id, style: 'display:block;text-decoration:none;color:inherit' }, h('div', { class: 'riga' }, prio(l.priorita), h('div', { class: 'cresce' }, h('b', {}, l.titolo), h('div', { class: 'aiuto' }, `${l.zona} · ${etichetta(CHI, l.chi)}${num(l.ore) !== null ? ' · ' + n(l.ore, 1, 'h') : ''}${num(l.fermo_g) !== null ? ' · fermo ' + n(l.fermo_g, 1, 'g') : ''}`),
        bloccato.length ? h('div', { class: 'aiuto' }, 'Dopo: ' + bloccato.map((d) => d.titolo).join('; ')) : null), chip(natura(l)), chip(etichetta(STATI_LAVORO, l.stato), l.stato === 'concluso' ? 'ok' : l.stato === 'in_corso' ? 'acc' : ''))); }) : [vuoto('Nessun lavoro con questi filtri.')]));
  };
  const sel = h('select', { class: 'stretto', onchange: () => { ui.stato = sel.value; disegna(); } }, h('option', { value: '' }, 'Tutti gli stati'), STATI_LAVORO.map(([k, t]) => h('option', { value: k }, t))); sel.value = ui.stato;
  const q = h('input', { type: 'search', class: 'stretto', placeholder: 'Filtra…', value: ui.q, oninput: () => { ui.q = q.value; disegna(); } });
  disegna();
  const ore = s.lavori.filter((l) => l.stato !== 'concluso'); const oreNote = ore.reduce((a, l) => a + (num(l.ore) || 0), 0), senza = ore.filter((l) => num(l.ore) === null).length;
  return h('div', {}, h('div', { class: 'testata' }, h('div', {}, h('h1', {}, 'Piano di restauro'), h('p', {}, `Ore di lavoro stimate ancora da fare: ${n(oreNote, 0, 'h')} + ${senza} lavori senza stima.`)), btn('＋ Lavoro', () => editLavoro(null), 'primary no-print')),
    tabs([['percorso', 'Percorso guidato'], ['elenco', 'Tutti i lavori']], ui.tab, (k) => { ui.tab = k; store.ridisegna(); }),
    ui.tab === 'percorso' ? vPercorso(s) : [h('div', { class: 'barra-azioni no-print' }, sel, q), lista]);
}

// Percorso guidato: cosa si può fare adesso, cosa manca, cosa è bloccato e da cosa, e la sequenza con ore e fermo.
function vPercorso(s) {
  const oreSess = num(s.impostazioni.oreSessione) ?? 4;
  const p = percorso(s, oreSess);
  const link = (l) => h('a', { href: '#/lavori/' + l.id }, l.titolo);
  const mancanti = (r) => [...r.materiali.filter((m) => m.stato !== 'ok').map((m) => `${m.nome}${m.stato === 'da_verificare' ? ' (quantità da verificare)' : m.manca ? ` (mancano ${n(m.manca, 1)} ${m.unita})` : ' (manca)'}`), ...r.attrezzi.filter((a) => a.stato !== 'ok').map((a) => a.nome + ' (attrezzo)')];
  const riga = (r) => { const mm = mancanti(r); return h('div', { class: 'riga' }, prio(r.lavoro.priorita), h('div', { class: 'cresce' }, h('b', {}, link(r.lavoro)),
    h('div', { class: 'aiuto' }, [r.oreResidue === null ? 'ore non stimate' : `${n(r.oreResidue, 1)} h residue → ${r.sessioni} sessioni da ${oreSess} h`, r.fermo_g === null ? 'fermo non stimato' : `fermo ${n(r.fermo_g, 1)} g`, r.lavoro.attese ? 'attese: ' + r.lavoro.attese : null].filter(Boolean).join(' · ')),
    mm.length ? h('div', { class: 'nota ' + (r.mancaQualcosa ? 'warn' : 'info') }, 'Da procurare o verificare: ' + mm.join('; ')) : (r.materiali.length || r.attrezzi.length) ? h('div', { class: 'aiuto' }, 'Materiali e attrezzi collegati: disponibili.') : h('div', { class: 'aiuto' }, 'Nessun materiale collegato all\'inventario.')),
    !r.mancaQualcosa && !r.daVerificare ? chip('si può iniziare', 'ok') : r.mancaQualcosa ? chip('manca materiale', 'warn') : chip('verificare scorte'), chip(etichetta(STATI_LAVORO, r.lavoro.stato))); };
  const daComprare = new Map();
  p.eseguibili.forEach((r) => r.materiali.filter((m) => m.stato === 'manca').forEach((m) => { const k = daComprare.get(m.inv) || { nome: m.nome, unita: m.unita, q: 0, ignota: false, per: [] }; if (m.manca === null) k.ignota = true; else k.q += m.manca; k.per.push(r.lavoro.titolo); daComprare.set(m.inv, k); }));
  return h('div', {},
    card(`Eseguibili adesso (${p.eseguibili.length})`, h('p', { class: 'aiuto' }, 'Nessuna dipendenza aperta. In ordine di priorità.'), p.eseguibili.length ? p.eseguibili.map(riga) : vuoto('Niente di eseguibile: controlla le dipendenze.')),
    daComprare.size ? card('Lista della spesa per i lavori eseguibili', [...daComprare.values()].map((k) => h('div', { class: 'riga' }, h('div', { class: 'cresce' }, h('b', {}, k.nome), h('div', { class: 'aiuto' }, 'Per: ' + [...new Set(k.per)].join('; '))), h('b', {}, k.ignota && !k.q ? 'quantità da definire' : `${n(k.q, 1)} ${k.unita}`))), h('p', { class: 'aiuto' }, 'Gli stessi articoli compaiono nel budget solo se sono “nel carrello” o “da acquistare” in inventario.')) : null,
    card(`Bloccati (${p.bloccati.length})`, p.bloccati.map((r) => h('div', { class: 'riga' }, prio(r.lavoro.priorita), h('div', { class: 'cresce' }, h('b', {}, link(r.lavoro)), h('div', { class: 'aiuto' }, 'Prima: ', r.bloccanti.map((d, i) => [i ? '; ' : '', link(s.lavori.find((x) => x.id === d))]))))), p.bloccati.length ? null : vuoto('Nessun lavoro bloccato.')),
    p.ciclo.length ? avviso('Dipendenze circolari fra: ' + p.ciclo.join('; ') + '. Correggi il campo “Dipende da”.', 'err') : null,
    card('Sequenza proposta', h('div', { class: 'numeri' }, h('div', { class: 'num' }, h('b', {}, n(p.totali.ore, 0, 'h')), h('span', {}, `Lavoro residuo stimato + ${p.totali.senzaOre} lavori senza stima`)), h('div', { class: 'num' }, h('b', {}, p.totali.sessioni), h('span', {}, `Sessioni da ${oreSess} h`)), h('div', { class: 'num' }, h('b', {}, n(p.totali.fermo_g, 1, 'g')), h('span', {}, `Fermo stimato + ${p.totali.senzaFermo} lavori senza stima`))),
      h('div', { class: 'scroll-x' }, h('table', {}, h('tr', {}, ['#', 'Lavoro', 'Chi', 'Ore res.', 'Sessioni', 'Fermo', 'Ore cumulate', 'Fermo cumulato'].map((x, i) => h('th', { class: i > 2 ? 'n' : null }, x))),
        p.sequenza.map((r) => h('tr', {}, h('td', {}, r.passo), h('td', {}, link(r.lavoro)), h('td', {}, r.lavoro.chi), h('td', { class: 'n' }, r.oreResidue === null ? '?' : n(r.oreResidue, 1)), h('td', { class: 'n' }, r.sessioni ?? '?'), h('td', { class: 'n' }, r.fermo_g === null ? '?' : n(r.fermo_g, 1)), h('td', { class: 'n' }, n(r.oreCumulate, 0)), h('td', { class: 'n' }, n(r.fermoCumulato, 1)))))),
      h('p', { class: 'aiuto' }, 'Ordine per dipendenze e, a parità, per priorità. I “?” non sono zero: i totali sono un minimo. Il fermo somma i giorni dei singoli lavori come se fossero uno dopo l\'altro: accorpandoli nello stesso fermo si riduce.'),
      h('div', { class: 'barra-azioni no-print' }, btn('Durata di una sessione', () => openForm({ titolo: 'Sessioni di lavoro', valore: { oreSessione: oreSess }, campi: [{ k: 'oreSessione', label: 'Ore per sessione', tipo: 'number', unita: 'h' }], onSave: (v) => store.update((st) => { st.impostazioni.oreSessione = v.oreSessione > 0 ? v.oreSessione : 4; }) }), 'mini'))));
}

// Schemi delle guide: sezione a strati (dai dati dello scenario attivo o da un elenco fisso) e diagramma di decisione.
function schema(sc, s) {
  if (sc.tipo === 'decisione') return h('div', {}, h('h3', {}, sc.titolo), h('div', { class: 'rami' }, sc.rami.map((r) => h('div', { class: 'ramo' }, h('div', {}, r.se), h('span', {}, '→'), h('div', { class: r.esito === 'stop' ? 'stop' : 'ok' }, r.allora)))));
  let bande = sc.bande, nota = 'Schema di principio, non in scala: proposta progettuale.';
  if (sc.tipo === 'sezione') {
    const att = s.scenariStrati.find((x) => x.attivo); const mats = Object.fromEntries(s.inventario.map((m) => [m.id, m]));
    const strati = att ? (att.zone[sc.zona] || []) : [];
    const r = stratigrafia(strati, mats);
    bande = [{ nome: 'Lamiera della carrozzeria', colore: '#c9d1d5' }, ...strati.map((l) => { const m = mats[l.mat]; return { nome: m ? `${m.nome} — ${n(m.spessore_mm, 1, 'mm')}${(l.cop ?? 100) < 100 ? `, copertura ${l.cop}%` : ''}` : 'materiale rimosso', colore: m ? ({ smorzante: '#444', isolante: '#d9b44a', pannello: '#b08d57', finitura: '#8fa3ad' })[m.categoria] || '#999' : '#999', mm: m ? num(m.spessore_mm) : null }; })];
    nota = att ? `Dallo scenario attivo “${att.nome}”: ingombro totale ${n(r.spessore_mm, 1, 'mm')}. Cambia con lo scenario.` : 'Nessuno scenario attivo.';
    if (!strati.length) nota += ' Nessuno strato definito per questa zona.';
  }
  const W = 520, hb = 34; const svg = h('svg', { class: 'schema', viewBox: `0 0 ${W} ${bande.length * hb + 6}`, role: 'img', 'aria-label': sc.titolo });
  bande.forEach((b, i) => { const sp = b.mm ? Math.max(8, Math.min(30, b.mm * 1.2)) : 16; svg.append(h('rect', { x: 4, y: i * hb + 4 + (30 - sp) / 2, width: 150, height: sp, fill: b.colore, stroke: 'var(--ink)', 'stroke-width': .6 }), b.foro ? h('rect', { x: 64, y: i * hb + 3, width: 30, height: 32, fill: 'var(--panel)' }) : null, h('text', { x: 166, y: i * hb + 24, 'font-size': 13 }, b.nome)); });
  return h('div', {}, h('h3', {}, sc.titolo), svg, h('p', { class: 'aiuto' }, nota));
}

function scheda(l) {
  const s = store.s;
  const upd = (fn) => store.update((st) => fn(st.lavori.find((x) => x.id === l.id)));
  const elenco = (arr) => arr.length ? h('ul', { class: 'piatto' }, arr.map((t) => h('li', {}, t))) : h('p', { class: 'vuoto' }, 'Da definire.');
  const spese = s.spese.filter((x) => x.lavoroId === l.id);
  const dip = l.dipende.map((d) => s.lavori.find((x) => x.id === d)).filter(Boolean);
  const fonti = l.fonti.map((f) => s.fonti.find((x) => x.id === f)).filter(Boolean);
  const probl = l.problemi.map((p) => s.problemi.find((x) => x.id === p)).filter(Boolean);
  const stato = h('select', { class: 'stretto no-print', onchange: () => upd((x) => { x.stato = stato.value; if (stato.value === 'concluso' && !x.esito.data) x.esito.data = oggi(); }) }, STATI_LAVORO.map(([k, t]) => h('option', { value: k }, t))); stato.value = l.stato;
  const fatti = l.accettazione.filter((a) => a.ok).length;

  return h('div', {}, h('p', { class: 'no-print' }, h('a', { href: '#/lavori' }, '← Tutti i lavori')),
    h('div', { class: 'testata' }, h('div', {}, h('h1', {}, l.titolo), h('p', {}, `${l.zona} · priorità ${l.priorita} · ${etichetta(CHI, l.chi)} · stato: ${etichetta(STATI_LAVORO, l.stato)}`)),
      h('div', { class: 'barra-azioni no-print' }, stato, btn('Modifica', () => editLavoro(l)), btn('Stampa scheda', () => print()))),
    avviso(`Natura dei passi: ${natura(l)}. Solo i passi “D” vengono da una fonte citata; le “proposte” sono idee di progetto da valutare; le “verifiche” vanno fatte prima di procedere. Coppie, quantità e specifiche: sempre dalla documentazione del costruttore.`, 'info'),
    h('div', { class: 'griglia' },
      card('Obiettivo e condizioni iniziali', h('p', {}, l.obiettivo || '—'), h('h3', {}, 'Stato di partenza'), h('p', {}, l.iniziali || '—'),
        probl.length ? [h('h3', {}, 'Problemi collegati'), elenco(probl.map((p) => p.titolo))] : null),
      card('Tempi e dipendenze', h('div', { class: 'numeri' }, h('div', { class: 'num' }, h('b', {}, num(l.ore) === null ? '?' : n(l.ore, 1, 'h')), h('span', {}, 'Ore di lavoro stimate')), h('div', { class: 'num' }, h('b', {}, num(l.fermo_g) === null ? '?' : n(l.fermo_g, 1, 'g')), h('span', {}, 'Fermo del mezzo stimato'))),
        l.attese ? h('p', {}, h('b', {}, 'Attese: '), l.attese) : null, h('p', {}, h('b', {}, 'Competenze: '), l.competenze || '—'),
        dip.length ? [h('h3', {}, 'Da fare prima'), dip.map((d) => h('div', { class: 'riga' }, h('a', { class: 'cresce', href: '#/lavori/' + d.id }, d.titolo), chip(etichetta(STATI_LAVORO, d.stato), d.stato === 'concluso' ? 'ok' : 'warn')))] : null)),
    card('Verifiche prima di iniziare', elenco(l.verifiche)),
    h('div', { class: 'griglia' },
      card('Materiali', collegati(l, 'materialiInv', upd, s), l.materiali.length ? [h('h3', {}, 'Altri materiali (testo libero)'), elenco(l.materiali)] : null),
      card('Attrezzi', collegati(l, 'attrezziInv', upd, s), l.attrezzi.length ? [h('h3', {}, 'Altri attrezzi (testo libero)'), elenco(l.attrezzi)] : null)),
    card('Sequenza', h('p', { class: 'legenda' }, Object.entries(TIPO).map(([k, [sigla, nome]]) => h('span', {}, h('span', { class: 'passo-tipo pt-' + k }, sigla), nome))),
      l.passi.length ? h('ol', { class: 'passi' }, l.passi.map((x, i) => h('li', {}, h('span', { class: 'passo-tipo pt-' + x.tipo, title: TIPO[x.tipo][1] }, TIPO[x.tipo][0]), x.t,
        x.rif ? h('a', { class: 'rif', href: '#', onclick: (e) => { e.preventDefault(); apriDocumento(x.rif.doc, parseInt(x.rif.pag, 10) || null); } }, '📖 ' + etichettaRif(s, x.rif)) : null,
        btn(x.rif ? '✎ rif.' : '＋ rif.', () => rimando(l, i, s), 'mini no-print')))) : h('p', { class: 'vuoto' }, 'Da definire.'),
      (l.schemi || []).map((sc) => schema(sc, s)),
      fonti.length ? [h('h3', {}, 'Fonti'), fonti.map((f) => h('div', { class: 'riga' }, h('div', { class: 'cresce' }, /^https?:/.test(f.url || '') ? h('a', { href: f.url, target: '_blank', rel: 'noopener' }, f.titolo) : h('b', {}, f.titolo), h('div', { class: 'aiuto' }, f.applicabilita), f.manca ? h('div', { class: 'aiuto' }, 'Manca: ' + f.manca) : null), badge(f.stato)))] : h('p', { class: 'aiuto' }, 'Nessuna fonte collegata.')),
    card(`Dal manuale: estratti collegati (${s.estratti.filter((e) => e.lavoroId === l.id).length})`, s.estratti.filter((e) => e.lavoroId === l.id).map((e) => rigaEstratto(s, e)), s.estratti.some((e) => e.lavoroId === l.id) ? null : h('p', { class: 'vuoto' }, 'Nessun estratto. Valori e procedure del costruttore per questo lavoro vanno messi qui, con documento e pagina.'),
      h('div', { class: 'barra-azioni no-print' }, btn('＋ Estratto per questo lavoro', () => editEstratto(null, null, l.id), 'mini'), h('a', { href: '#/manuali' }, 'Manuali →'))),
    card(`Sessioni di lavoro: ${n((l.sessioni || []).reduce((a, x) => a + (num(x.ore) || 0), 0), 1)} h fatte${num(l.ore) !== null ? ' su ' + n(l.ore, 1) + ' stimate' : ''}`,
      (l.sessioni || []).map((x) => h('div', { class: 'riga' }, h('div', { class: 'cresce' }, h('b', {}, dataIt(x.data)), x.nota ? h('div', { class: 'aiuto' }, x.nota) : null), h('b', {}, n(x.ore, 1, 'h')), btn('✕', () => upd((q) => { q.sessioni = q.sessioni.filter((k) => k.id !== x.id); }), 'mini danger no-print'))),
      (l.sessioni || []).length ? null : h('p', { class: 'vuoto' }, 'Nessuna sessione registrata.'),
      h('div', { class: 'barra-azioni no-print' }, btn('＋ Sessione', () => openForm({ titolo: 'Sessione di lavoro', valore: { data: oggi(), ore: null, nota: '' }, campi: [{ k: 'data', label: 'Data', tipo: 'date' }, { k: 'ore', label: 'Ore lavorate', tipo: 'number', unita: 'h', richiesto: true }, { k: 'nota', label: 'Cosa è stato fatto', tipo: 'textarea' }], onSave: (v) => upd((q) => { (q.sessioni ||= []).push({ id: uid('ss'), ...v }); if (q.stato === 'pronto' || q.stato === 'da_pianificare') q.stato = 'in_corso'; }) }), 'mini'))),
    card(`Controlli di accettazione (${fatti}/${l.accettazione.length})`, l.accettazione.length ? l.accettazione.map((a, i) => h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: a.ok, onchange: (e) => upd((x) => { x.accettazione[i].ok = e.target.checked; }) }), h('span', {}, a.t))) : h('p', { class: 'vuoto' }, 'Da definire.')),
    card('Risultato e prove', h('p', {}, h('b', {}, 'Data di conclusione: '), l.esito.data ? dataIt(l.esito.data) : 'non concluso'), h('p', {}, l.esito.nota || h('i', { class: 'vuoto' }, 'Nessuna nota sul risultato.')),
      fotoStrip(l.esito.foto, (ids) => upd((x) => { x.esito.foto = ids; })),
      h('div', { class: 'barra-azioni no-print' }, btn('Registra risultato', () => openForm({ titolo: 'Risultato del lavoro', valore: l.esito, campi: [{ k: 'data', label: 'Data di conclusione', tipo: 'date' }, { k: 'nota', label: 'Cosa è stato fatto, misure, anomalie', tipo: 'textarea' }], onSave: (v) => upd((x) => { x.esito = { ...x.esito, ...v }; }) })))),
    card(`Spese collegate: ${euro(spese.filter((x) => x.tipo === 'sostenuta').reduce((a, x) => a + (num(x.importo) || 0), 0))} sostenute`, spese.length ? spese.map((x) => h('div', { class: 'riga' }, h('div', { class: 'cresce' }, x.descr), chip(x.tipo), h('b', {}, euro(x.importo)))) : h('p', { class: 'vuoto' }, 'Nessuna spesa o preventivo collegato.'),
      h('p', { class: 'aiuto no-print' }, 'Per collegare una spesa o un preventivo: Budget → voce → campo “Lavoro”.')));
}

// Materiali o attrezzi presi dall'inventario: mostra disponibilità e quantità, con aggiunta e rimozione.
function collegati(l, campo, upd, s) {
  const mat = campo === 'materialiInv';
  const righe = (l[campo] || []).map((r) => { const id = mat ? r.inv : r; const it = s.inventario.find((x) => x.id === id); const ok = it && ['posseduto', 'recupero', 'acquistato'].includes(it.disp);
    const basta = !mat || !ok ? ok : num(it.qta) === null ? null : num(r.qta) === null || it.qta >= r.qta;
    return h('div', { class: 'riga' }, h('div', { class: 'cresce' }, h('b', {}, it ? it.nome : '(articolo rimosso)'), h('div', { class: 'aiuto' }, it ? `${etichetta(DISP, it.disp)}${mat ? ` · servono ${num(r.qta) === null ? '?' : n(r.qta, 1)} ${it.unita || ''} · ${ok ? 'in inventario ' + (num(it.qta) === null ? '?' : n(it.qta, 1)) : 'non ancora in casa'}` : ''}` : '')),
      chip(basta === null ? 'quantità da verificare' : basta ? 'disponibile' : 'manca', basta === null ? '' : basta ? 'ok' : 'warn'), btn('✕', () => upd((q) => { q[campo] = q[campo].filter((k) => (mat ? k.inv : k) !== id); }), 'mini danger no-print')); });
  const sel = h('select', { class: 'stretto no-print', onchange: () => { if (!sel.value) return; const id = sel.value;
    if (mat) openForm({ titolo: 'Quantità necessaria', valore: { qta: null }, campi: [{ k: 'qta', label: 'Quantità (nell\'unità dell\'articolo)', tipo: 'number', aiuto: 'Vuoto = non ancora definita' }], onSave: (v) => upd((q) => { (q[campo] ||= []).push({ inv: id, qta: v.qta }); }) });
    else upd((q) => { (q[campo] ||= []).push(id); }); } },
  h('option', { value: '' }, '＋ Collega un articolo dell\'inventario…'), s.inventario.filter((x) => !(l[campo] || []).some((k) => (mat ? k.inv : k) === x.id)).map((x) => h('option', { value: x.id }, `${x.nome} — ${etichetta(DISP, x.disp)}`)));
  return [righe.length ? righe : h('p', { class: 'vuoto' }, 'Nessun articolo collegato.'), sel];
}

// Rimando di un passo a documento e pagina. Solo così un passo può diventare “documentato”.
function rimando(l, i, s) {
  if (!s.documenti.length) { alert('Prima carica il documento nella sezione Manuali.'); return; }
  const p = l.passi[i];
  openForm({ titolo: 'Rimando al manuale', valore: { doc: p.rif?.doc || s.documenti[0].id, pag: p.rif?.pag || '', nota: p.rif?.nota || '', doc_ok: p.tipo === 'documentata' },
    campi: [{ k: 'doc', label: 'Documento', tipo: 'select', opzioni: s.documenti.map((d) => [d.id, d.titolo]) }, { k: 'pag', label: 'Pagina (o codice del documento)' }, { k: 'nota', label: 'Nota (capitolo, figura)' }, { k: 'doc_ok', label: 'Il documento dice proprio questo: segna il passo come DOCUMENTATO', tipo: 'checkbox' }],
    onSave: (v) => store.update((st) => { const q = st.lavori.find((x) => x.id === l.id).passi[i]; q.rif = { doc: v.doc, pag: v.pag, nota: v.nota }; if (v.doc_ok) q.tipo = 'documentata'; if (!st.lavori.find((x) => x.id === l.id).fonti) st.lavori.find((x) => x.id === l.id).fonti = []; }),
    onDelete: p.rif ? () => store.update((st) => { delete st.lavori.find((x) => x.id === l.id).passi[i].rif; }) : null });
}

function editLavoro(l) {
  const s = store.s;
  const sigla = { documentata: 'D', proposta: 'P', verifica: 'V' };
  const base = l ? { ...l, passiTxt: l.passi.map((x) => `[${sigla[x.tipo] || 'V'}] ${x.t}`), dipTxt: l.dipende.join(', '), accTxt: l.accettazione.map((a) => a.t), fontiTxt: l.fonti.join(', '), problTxt: l.problemi.join(', ') } : { id: uid('l'), stato: 'da_pianificare', priorita: 2, chi: 'io', tipoPassi: 'verifica', dipende: [], accettazione: [], fonti: [], problemi: [], verifiche: [], materiali: [], attrezzi: [], passi: [], passiTxt: [], materialiInv: [], attrezziInv: [], sessioni: [], schemi: [], esito: { data: null, nota: '', foto: [] }, accTxt: [] };
  openForm({ titolo: l ? 'Modifica lavoro' : 'Nuovo lavoro', valore: base,
    campi: [{ k: 'titolo', label: 'Titolo', richiesto: true }, { k: 'zona', label: 'Zona' }, { k: 'priorita', label: 'Priorità', tipo: 'select', opzioni: [[1, '1 — alta'], [2, '2 — media'], [3, '3 — bassa']] }, { k: 'stato', label: 'Stato', tipo: 'select', opzioni: STATI_LAVORO }, { k: 'chi', label: 'Chi lo esegue', tipo: 'select', opzioni: CHI },
      { k: 'obiettivo', label: 'Obiettivo', tipo: 'textarea' }, { k: 'iniziali', label: 'Condizioni iniziali', tipo: 'textarea' }, { k: 'verifiche', label: 'Verifiche prima dell\'intervento (una per riga)', tipo: 'lines' }, { k: 'materiali', label: 'Altri materiali non in inventario (uno per riga)', tipo: 'lines' }, { k: 'attrezzi', label: 'Altri attrezzi non in inventario (uno per riga)', tipo: 'lines' },
      { k: 'passiTxt', label: 'Sequenza (un passo per riga)', tipo: 'lines', aiuto: 'Inizia ogni riga con [D] documentata da una fonte collegata, [P] proposta progettuale, [V] verifica da fare. Senza sigla vale [V].' },
      { k: 'competenze', label: 'Competenze richieste' }, { k: 'ore', label: 'Ore di lavoro stimate', tipo: 'number', unita: 'h' }, { k: 'fermo_g', label: 'Fermo del mezzo stimato', tipo: 'number', unita: 'giorni' }, { k: 'attese', label: 'Attese (ricambi, essiccazione…)' },
      { k: 'accTxt', label: 'Controlli di accettazione (uno per riga)', tipo: 'lines' },
      { k: 'dipTxt', label: 'Dipende da (id dei lavori, separati da virgola)', aiuto: 'Disponibili: ' + s.lavori.map((x) => x.id).join(', ') }, { k: 'fontiTxt', label: 'Fonti (id separati da virgola)', aiuto: 'Disponibili: ' + s.fonti.map((x) => x.id).join(', ') }, { k: 'problTxt', label: 'Problemi collegati (id)', aiuto: 'Disponibili: ' + s.problemi.map((x) => x.id).join(', ') }],
    onSave: (v) => store.update((st) => {
      const ids = (t, arr) => String(t || '').split(/[,\s]+/).filter((x) => arr.some((y) => y.id === x));
      v.priorita = Number(v.priorita); const vecchiRif = Object.fromEntries((l?.passi || []).filter((x) => x.rif).map((x) => [x.t, x.rif])); v.passi = v.passiTxt.map(passo).map((x) => (vecchiRif[x.t] ? { ...x, rif: vecchiRif[x.t] } : x)); delete v.passiTxt; v.tipoPassi = v.passi.some((x) => x.tipo === 'documentata') ? 'documentata' : 'verifica'; v.dipende = ids(v.dipTxt, st.lavori).filter((x) => x !== v.id); v.fonti = ids(v.fontiTxt, st.fonti); v.problemi = ids(v.problTxt, st.problemi);
      const vecchi = Object.fromEntries((l?.accettazione || []).map((a) => [a.t, a.ok])); v.accettazione = v.accTxt.map((t) => ({ t, ok: !!vecchi[t] }));
      delete v.dipTxt; delete v.accTxt; delete v.fontiTxt; delete v.problTxt;
      const i = st.lavori.findIndex((x) => x.id === v.id); if (i < 0) st.lavori.push(v); else st.lavori[i] = v;
    }),
    onDelete: l ? () => { location.hash = '#/lavori'; store.update((st) => { st.lavori = st.lavori.filter((x) => x.id !== l.id); st.lavori.forEach((x) => { x.dipende = x.dipende.filter((d) => d !== l.id); }); }); } : null });
}
