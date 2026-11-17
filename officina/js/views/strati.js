// Materiali e stratigrafie per zona: scenari alternativi, ingombro, peso, fabbisogni, costo dei nuovi acquisti.
import { store } from '../store.js';
import { stratigrafia, riepilogoScenario, termico, applicaProgetto, num, RSI, RSE } from '../calc.js';
import { h, card, badge, chip, btn, n, euro, openForm, uid, avviso, vuoto, editInventario, CAT_STRATO, etichetta, DISP } from '../ui.js';

const ui = { id: null };

export function render() {
  const s = store.s;
  const sc = s.scenariStrati.find((x) => x.id === ui.id) || s.scenariStrati.find((x) => x.attivo) || s.scenariStrati[0]; ui.id = sc?.id;
  const mats = Object.fromEntries(s.inventario.map((m) => [m.id, m]));
  const candidati = s.inventario.filter((m) => CAT_STRATO.includes(m.categoria));
  const upd = (fn) => store.update((st) => fn(st.scenariStrati.find((x) => x.id === sc.id)));

  const sel = h('select', { class: 'stretto', onchange: () => { ui.id = sel.value; store.ridisegna(); } }, s.scenariStrati.map((x) => h('option', { value: x.id }, (x.attivo ? '● ' : '') + x.nome))); sel.value = ui.id;
  const barra = h('div', { class: 'barra-azioni no-print' }, sel,
    sc && !sc.attivo ? btn('Usa nel progetto attivo', () => store.update((st) => { const pg = st.progetti.find((x) => x.attivo); if (pg) pg.stratiId = sc.id; applicaProgetto(st); }), 'primary') : sc ? chip('nel progetto attivo: entra nel previsto e stringe il vano in Mappa', 'ok') : null,
    sc ? btn('Duplica', () => store.update((st) => { const c = JSON.parse(JSON.stringify(sc)); c.id = uid('sc'); c.nome += ' (copia)'; c.attivo = false; st.scenariStrati.push(c); ui.id = c.id; })) : null,
    sc ? btn('Rinomina', () => editScenario(sc)) : null, btn('＋ Scenario', () => editScenario(null)));
  if (!sc) return h('div', {}, h('h1', {}, 'Materiali e stratigrafie'), barra, vuoto('Nessuno scenario.'));

  const rie = riepilogoScenario(sc, s);
  const zone = s.zone.map((z) => {
    const strati = sc.zone[z.id] || []; const r = stratigrafia(strati, mats); const A = num(z.area_m2);
    const add = h('select', { class: 'stretto no-print', onchange: () => { if (add.value) upd((x) => { (x.zone[z.id] ||= []).push({ mat: add.value, cop: 100 }); }); } }, h('option', { value: '' }, '＋ Aggiungi strato…'), candidati.map((m) => h('option', { value: m.id }, `${m.nome} — ${etichetta(DISP, m.disp)}`)));
    const sposta = (i, d) => upd((x) => { const a = x.zone[z.id]; [a[i], a[i + d]] = [a[i + d], a[i]]; });
    return card(null, h('div', { class: 'riga' }, h('h2', { class: 'cresce', style: 'margin:0' }, z.nome), h('span', {}, A === null ? h('i', { class: 'vuoto' }, 'superficie sconosciuta') : n(A, 2, 'm²')), badge(z.stato), btn('✎', () => editZona(z), 'mini no-print')),
      strati.length ? h('p', { class: 'aiuto' }, 'Dalla lamiera (1) verso l\'interno:') : vuoto('Nessuno strato in questo scenario (lamiera nuda).'),
      strati.map((l, i) => { const m = mats[l.mat]; const cop = h('input', { type: 'number', class: 'stretto', style: 'width:4.6rem;min-height:34px', value: l.cop ?? 100, min: 0, max: 100, title: 'Copertura %', onchange: () => upd((x) => { x.zone[z.id][i].cop = Math.max(0, Math.min(100, Number(cop.value) || 0)); }) });
        return h('div', { class: 'strato' }, h('b', {}, i + 1), h('div', {}, m ? h('a', { href: '#', onclick: (e) => { e.preventDefault(); editInventario(m); } }, m.nome) : 'materiale rimosso', ' ', m ? badge(m.stato) : null, h('div', { class: 'aiuto' }, m ? `${n(m.spessore_mm, 1, 'mm')} · ${num(m.massa_kg_m2) === null ? 'massa ?' : n(m.massa_kg_m2, 2, 'kg/m²')} · ${etichetta(DISP, m.disp)}` : '')),
          h('div', { class: 'azioni no-print' }, cop, h('small', {}, '%'), i > 0 ? btn('↑', () => sposta(i, -1), 'mini') : null, i < strati.length - 1 ? btn('↓', () => sposta(i, 1), 'mini') : null, btn('✕', () => upd((x) => { x.zone[z.id].splice(i, 1); }), 'mini danger'))); }),
      strati.length ? h('div', { class: 'numeri', style: 'margin-top:.6rem' },
        h('div', { class: 'num' }, h('b', {}, n(r.spessore_mm, 1, 'mm') + (r.spessoreIgnoto.length ? ' +?' : '')), h('span', {}, 'Ingombro perso')),
        h('div', { class: 'num' }, h('b', {}, A === null ? '—' : n(r.massa_kg_m2 * A, 1, 'kg') + (r.massaIgnota.length ? ' +?' : '')), h('span', {}, r.massaIgnota.length ? 'Massa nota (mancano: ' + r.massaIgnota.join(', ') + ')' : 'Massa aggiunta')),
        h('div', { class: 'num' }, h('b', {}, (r.Rignoti.length ? '≥ ' : '') + n(r.R, 2)), h('span', {}, 'R strati [m²K/W]' + (r.Rignoti.length ? ' — non determinabile per: ' + r.Rignoti.join(', ') : ''))),
        h('div', { class: 'num' }, h('b', {}, (r.Rignoti.length ? '≤ ' : '') + n(1 / (RSI + r.R + RSE), 2)), h('span', {}, 'U ideale senza ponti [W/m²K]'))) : null,
      r.ipotesi.length ? h('p', { class: 'aiuto' }, 'Basato su dati ipotetici o da verificare: ' + [...new Set(r.ipotesi)].join(', ')) : null, add);
  });

  const f = rie.fabbisogni;
  const fab = card('Fabbisogni dello scenario', h('p', { class: 'aiuto' }, `Superfici × copertura, più ${n(sc.sfridoPct, 0)}% di sfrido. “Mancanti” = da comprare rispetto a ciò che è posseduto.`),
    f.zoneSenzaArea.length ? avviso('Zone escluse perché senza superficie: ' + f.zoneSenzaArea.join(', ')) : null,
    h('div', { class: 'scroll-x' }, h('table', {}, h('tr', {}, ['Materiale', 'Serve', 'Unità necessarie', 'Possedute', 'Mancanti', 'Costo nuovi'].map((t, i) => h('th', { class: i ? 'n' : null }, t))),
      f.righe.map((r) => h('tr', {}, h('td', {}, r.nome), h('td', { class: 'n' }, n(r.area_m2, 2, 'm²')), h('td', { class: 'n' }, r.necessarie === null ? 'superficie per unità ?' : r.necessarie), h('td', { class: 'n' }, r.possedute === null ? 'quantità ?' : r.possedute), h('td', { class: 'n' }, r.mancanti === null ? 'non determinabile' : r.mancanti), h('td', { class: 'n' }, r.costo === null ? 'prezzo ?' : euro(r.costo)))))),
    h('p', {}, h('b', {}, 'Nuova spesa prevista: ' + euro(rie.costoNuovi)), rie.senzaPrezzo ? ` + ${rie.senzaPrezzo} materiali senza prezzo o quantità` : '', ' · ', h('b', {}, 'Massa nota: ' + n(rie.massa_kg, 1, 'kg')), rie.massaIgnota.length ? ` (esclusi: ${rie.massaIgnota.join(', ')})` : ''),
    h('p', { class: 'aiuto' }, sc.attivo ? 'Questo scenario è attivo: i mancanti entrano nel “previsto” del budget. Non diventano spese finché non registri l\'acquisto.' : 'Scenario non attivo: non tocca il budget.'));

  const clima = (s.energia.profili.find((p) => p.id === 'pr_inv') || s.energia.profili[0])?.clima || {};
  const confronto = card('Confronto fra scenari', h('div', { class: 'scroll-x' }, h('table', {}, h('tr', {}, ['Scenario', 'Pareti', 'Pavimento', 'Soffitto', 'Massa nota', 'Nuova spesa', `Potenza a ${n(clima.Tint, 0)}/${n(clima.Text, 0)} °C`].map((t, i) => h('th', { class: i ? 'n' : null }, t))),
    s.scenariStrati.map((x) => { const r = riepilogoScenario(x, s); const sp = (id) => { const z = r.zone.find((q) => q.zona.id === id); return z ? n(z.spessore_mm, 0, 'mm') : '—'; }; const t = termico(x, s, clima);
      return h('tr', {}, h('td', {}, h('b', {}, x.nome), x.attivo ? ' ●' : ''), h('td', { class: 'n' }, sp('par_cassone')), h('td', { class: 'n' }, sp('pav_cassone')), h('td', { class: 'n' }, sp('sof_cassone')),
        h('td', { class: 'n' }, n(r.massa_kg, 1, 'kg') + (r.massaIgnota.length ? ' +?' : '')), h('td', { class: 'n' }, euro(r.costoNuovi) + (r.senzaPrezzo ? ' +?' : '')),
        h('td', { class: 'n' }, !t.determinabile ? 'non determinabile' : t.estate ? 'serve raffrescamento' : `${t.limite ? '≤ ' : ''}${n(t.P_min, 0)}–${n(t.P_max, 0)} W`)); }))),
  h('p', { class: 'aiuto' }, 'Potenza di riscaldamento stimata con il profilo “Camper invernale” (vedi Simulatore → Termico). “+?” = mancano dati. Le zone senza superficie rendono il termico non determinabile.'));

  const catalogo = card('Materiali per stratigrafie', candidati.map((m) => h('div', { class: 'riga clic', onclick: () => editInventario(m) }, h('div', { class: 'cresce' }, h('b', {}, m.nome), h('div', { class: 'aiuto' }, m.nota)), chip(etichetta(DISP, m.disp)), badge(m.stato))),
    h('div', { class: 'barra-azioni no-print' }, btn('＋ Materiale', () => editInventario(null))));

  return h('div', {}, h('div', { class: 'testata' }, h('div', {}, h('h1', {}, 'Materiali e stratigrafie'), h('p', {}, 'Nessuna stratigrafia è decisa: confronta gli scenari. Non tutto il materiale disponibile va per forza usato.'))),
    barra, sc.nota ? h('p', { class: 'nota info' }, sc.nota) : null, h('div', { class: 'griglia' }, zone), h('div', { class: 'barra-azioni no-print' }, btn('＋ Zona', () => editZona(null))), fab, confronto, catalogo);
}

function editScenario(sc) {
  openForm({ titolo: sc ? 'Scenario' : 'Nuovo scenario', valore: sc || { id: uid('sc'), attivo: false, sfridoPct: 10, zone: {}, nota: '' },
    campi: [{ k: 'nome', label: 'Nome', richiesto: true }, { k: 'sfridoPct', label: 'Sfrido', tipo: 'number', unita: '%' }, { k: 'nota', label: 'Note', tipo: 'textarea' }],
    onSave: (v) => store.update((s) => { const i = s.scenariStrati.findIndex((x) => x.id === v.id); if (i < 0) s.scenariStrati.push(v); else s.scenariStrati[i] = v; ui.id = v.id; }),
    onDelete: sc ? () => store.update((s) => { s.scenariStrati = s.scenariStrati.filter((x) => x.id !== sc.id); ui.id = null; }) : null });
}
function editZona(z) {
  openForm({ titolo: z ? z.nome : 'Nuova zona', valore: z || { id: uid('z'), gruppo: 'cassone', area_m2: null, stato: 'da_verificare', nota: '' },
    campi: [{ k: 'nome', label: 'Nome', richiesto: true }, { k: 'gruppo', label: 'Parte', tipo: 'select', opzioni: ['cassone', 'cabina'] }, { k: 'area_m2', label: 'Superficie', tipo: 'number', unita: 'm²', aiuto: 'Vuoto = sconosciuta (la zona viene esclusa dai calcoli e segnalata)' }, { k: 'stato', label: 'Attendibilità', tipo: 'stato' }, { k: 'nota', label: 'Note', tipo: 'textarea' }],
    onSave: (v) => store.update((s) => { const i = s.zone.findIndex((x) => x.id === v.id); if (i < 0) s.zone.push(v); else s.zone[i] = v; }),
    onDelete: z ? () => store.update((s) => { s.zone = s.zone.filter((x) => x.id !== z.id); s.scenariStrati.forEach((x) => { delete x.zone[z.id]; }); }) : null });
}
