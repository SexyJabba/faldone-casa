// Progetto: UN solo scenario che collega configurazioni, stratigrafia, impianto elettrico e profilo d'uso.
// Il progetto attivo alimenta il "previsto" del budget. Le alternative si salvano e si confrontano; spese e acquisti reali non cambiano mai.
import { store } from '../store.js';
import { applicaProgetto, partiProgetto, verificaLayout, vanoFinito, riepilogoScenario, simulaEnergia, costoSistema, termico, budget, massaLayout } from '../calc.js';
import { h, card, chip, btn, n, euro, openForm, uid, avviso, vuoto } from '../ui.js';
import { utenzeTermiche } from './sim.js';

const ui = { id: null };
const VERD = { raggiunto: ['raggiunto', 'ok'], non_raggiunto: ['non raggiunto', 'err'], non_definitivo: ['non definitivo', 'warn'], non_determinabile: ['non determinabile', 'warn'] };
export const chipVerdetto = (v) => chip(VERD[v][0], VERD[v][1]);

// Tutti i numeri di un progetto, calcolati senza modificare nulla.
export function sintesi(s, p) {
  const k = partiProgetto(s, p);
  const fin = k.strati ? vanoFinito(s.geom, k.strati, s) : null;
  const errori = (ly) => !ly ? null : [null, ...(ly.stati || [])].reduce((a, st) => a + verificaLayout(ly, s.geom, { base: s.baseFissa, stato: st, finito: fin }).filter((x) => x.livello === 'errore').length, 0);
  const mat = k.strati ? riepilogoScenario(k.strati, s) : null;
  const en = (ore) => k.sistema && k.profilo ? simulaEnergia(k.profilo, k.sistema, ore, utenzeTermiche(s, k.profilo, k.strati)) : null;
  const inv = s.energia.profili.find((x) => x.id === 'pr_inv');
  const risc = k.strati && inv ? termico(k.strati, s, inv.clima) : null;
  const cs = k.sistema ? costoSistema(k.sistema) : null;
  const massaMobili = (ly) => ly ? massaLayout({ moduli: [...s.baseFissa, ...ly.moduli] }) : null;
  return { k, fin, errLavoro: errori(k.layoutLavoro), errCamper: errori(k.layoutCamper), mat, e48: en(48), e72: en(72), risc, cs, mLav: massaMobili(k.layoutLavoro), mCam: massaMobili(k.layoutCamper) };
}

export function render() {
  const s = store.s;
  const p = s.progetti.find((x) => x.id === ui.id) || s.progetti.find((x) => x.attivo) || s.progetti[0]; ui.id = p?.id;
  const sel = h('select', { class: 'stretto', onchange: () => { ui.id = sel.value; store.ridisegna(); } }, s.progetti.map((x) => h('option', { value: x.id }, (x.attivo ? '● ' : '') + x.nome))); sel.value = ui.id;
  const upd = (fn) => store.update((st) => { fn(st.progetti.find((x) => x.id === p.id)); applicaProgetto(st); });
  const barra = h('div', { class: 'barra-azioni no-print' }, sel,
    p && !p.attivo ? btn('Rendi attivo (entra nel budget previsto)', () => store.update((st) => { st.progetti.forEach((x) => { x.attivo = x.id === p.id; }); applicaProgetto(st); }), 'primary') : p ? chip('progetto attivo', 'ok') : null,
    p ? btn('Duplica come alternativa', () => store.update((st) => { const c = { ...p, id: uid('pg'), nome: p.nome + ' (alternativa)', attivo: false }; st.progetti.push(c); ui.id = c.id; })) : null,
    p ? btn('Rinomina', () => openForm({ titolo: 'Progetto', valore: p, campi: [{ k: 'nome', label: 'Nome', richiesto: true }, { k: 'nota', label: 'Note', tipo: 'textarea' }], onSave: (v) => upd((x) => Object.assign(x, { nome: v.nome, nota: v.nota })),
      onDelete: s.progetti.length > 1 ? () => store.update((st) => { st.progetti = st.progetti.filter((x) => x.id !== p.id); if (!st.progetti.some((x) => x.attivo)) st.progetti[0].attivo = true; applicaProgetto(st); ui.id = null; }) : null })) : null);
  if (!p) return h('div', {}, h('h1', {}, 'Progetto'), vuoto('Nessun progetto.'));

  const scelta = (campo, label, arr, href, vuotoOk) => { const el = h('select', { onchange: () => upd((x) => { x[campo] = el.value || null; }) }, vuotoOk ? h('option', { value: '' }, '— nessuno —') : null, arr.map((x) => h('option', { value: x.id }, x.nome))); el.value = p[campo] || '';
    return h('label', { class: 'campo' }, h('span', {}, label, ' ', h('a', { href, class: 'no-print' }, 'apri →')), el); };
  const scelte = card('Di cosa è fatto questo progetto', h('div', { class: 'griglia-campi' },
    scelta('layoutLavoroId', 'Configurazione lavoro', s.layout, '#/mappa', true), scelta('layoutCamperId', 'Configurazione camper', s.layout, '#/mappa', true),
    scelta('stratiId', 'Stratigrafia (isolamento e rivestimenti)', s.scenariStrati, '#/strati', true), scelta('sistemaId', 'Impianto elettrico', s.energia.sistemi, '#/sim/energia', true),
    scelta('profiloId', 'Profilo d\'uso per l\'autonomia', s.energia.profili, '#/sim/energia', false)),
  p.nota ? h('p', { class: 'aiuto' }, p.nota) : null,
  h('p', { class: 'aiuto' }, 'Cambiare una scelta aggiorna subito verifiche, fabbisogni e “previsto”. Spese e acquisti già registrati non vengono mai modificati da un progetto.'));

  const x = sintesi(s, p), b = p.attivo ? budget(s) : null;
  const numero = (v, lab, cls = '') => h('div', { class: 'num ' + cls }, h('b', {}, v), h('span', {}, lab));
  const e = (r) => r ? chipVerdetto(r.verdetto) : chip('manca impianto o profilo', 'warn');
  const riepilogo = card('Cosa ne risulta', h('div', { class: 'numeri' },
    numero(x.fin ? `${n(x.fin.larg, 0)} × ${n(x.fin.alt, 0)}` : '—', 'Vano finito: larghezza × altezza [mm]'),
    numero(x.errLavoro === null ? '—' : x.errLavoro, 'Errori geometrici lavoro (tutti gli stati)', x.errLavoro ? 'err' : 'ok'), numero(x.errCamper === null ? '—' : x.errCamper, 'Errori geometrici camper (tutti gli stati)', x.errCamper ? 'err' : 'ok'),
    numero(x.mat ? n(x.mat.massa_kg, 0, 'kg') + (x.mat.massaIgnota.length ? ' +?' : '') : '—', 'Massa nota dei rivestimenti (toglie portata)'),
    numero(x.mat ? euro(x.mat.costoNuovi) + (x.mat.senzaPrezzo ? ' +?' : '') : '—', 'Materiali ancora da comprare'), numero(x.cs ? euro(x.cs.daAcquistare) + (x.cs.senzaPrezzo ? ' +?' : '') : '—', 'Impianto elettrico da comprare'),
    numero(!x.risc ? '—' : !x.risc.determinabile ? 'n.d.' : `${x.risc.limite ? '≤ ' : ''}${n(x.risc.P_min, 0)}–${n(x.risc.P_max, 0)} W`, 'Riscaldamento (profilo invernale)')),
  h('div', { class: 'riga' }, h('div', { class: 'cresce' }, h('b', {}, 'Autonomia 48 h'), x.e48 ? h('div', { class: 'aiuto' }, x.e48.motivi.join(' · ') || 'nessuna energia non servita, picchi entro il limite') : null), e(x.e48)),
  h('div', { class: 'riga' }, h('div', { class: 'cresce' }, h('b', {}, 'Autonomia 72 h'), x.e72 ? h('div', { class: 'aiuto' }, x.e72.motivi.join(' · ') || 'nessuna energia non servita, picchi entro il limite') : null), e(x.e72)),
  b ? h('p', {}, h('b', {}, `Budget con questo progetto: previsto ${euro(b.previsto)}, libero dopo previsto e riserva ${euro(b.libero)}.`), (b.acquistiSenzaPrezzo + b.sistemaSenzaPrezzo) ? ` ${b.acquistiSenzaPrezzo + b.sistemaSenzaPrezzo} voci senza prezzo non contate.` : '') : avviso('Progetto non attivo: non entra nel budget. Rendilo attivo per vedere l\'effetto sul previsto.', 'info'),
  h('p', { class: 'aiuto' }, '“+?” = mancano prezzi o pesi. Tutto poggia su misure ancora ipotetiche finché non compili i rilievi.'));

  const confronto = card('Confronto fra progetti', h('div', { class: 'scroll-x' }, h('table', {}, h('tr', {}, ['Progetto', 'Vano finito', 'Errori L / C', 'Massa rivest.', 'Materiali', 'Impianto', '48 h', '72 h', 'Riscaldamento'].map((t, i) => h('th', { class: i ? 'n' : null }, t))),
    s.progetti.map((q) => { const y = sintesi(s, q); return h('tr', {}, h('td', {}, h('b', {}, q.nome), q.attivo ? ' ●' : ''), h('td', { class: 'n' }, y.fin ? `${n(y.fin.larg, 0)} × ${n(y.fin.alt, 0)}` : '—'), h('td', { class: 'n' }, `${y.errLavoro ?? '—'} / ${y.errCamper ?? '—'}`),
      h('td', { class: 'n' }, y.mat ? n(y.mat.massa_kg, 0, 'kg') + (y.mat.massaIgnota.length ? ' +?' : '') : '—'), h('td', { class: 'n' }, y.mat ? euro(y.mat.costoNuovi) + (y.mat.senzaPrezzo ? ' +?' : '') : '—'), h('td', { class: 'n' }, y.cs ? euro(y.cs.daAcquistare) + (y.cs.senzaPrezzo ? ' +?' : '') : '—'),
      h('td', { class: 'n' }, y.e48 ? chipVerdetto(y.e48.verdetto) : '—'), h('td', { class: 'n' }, y.e72 ? chipVerdetto(y.e72.verdetto) : '—'), h('td', { class: 'n' }, !y.risc || !y.risc.determinabile ? 'n.d.' : `${n(y.risc.P_min, 0)}–${n(y.risc.P_max, 0)} W`)); }))));

  return h('div', {}, h('div', { class: 'testata' }, h('div', {}, h('h1', {}, 'Progetto'), h('p', {}, 'Un solo scenario collega mappa, materiali, impianti e uso. Le alternative restano salvate accanto.'))),
    barra, scelte, riepilogo, confronto);
}
