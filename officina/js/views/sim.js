// Simulatore energia / acqua / comfort termico. Sono STIME su ipotesi dichiarate, non collaudi.
import { store } from '../store.js';
import { energia, simulaEnergia, consumiApparecchio, applicaProgetto, costoSistema, acqua, termico, num } from '../calc.js';
import { h, card, badge, chip, btn, n, euro, openForm, uid, avviso, vuoto, tabs, registraAcquisto } from '../ui.js';

const ui = { tab: 'energia', pid: null };
const VERD = { raggiunto: ['Sì', 'ok'], non_raggiunto: ['No', 'err'], non_definitivo: ['Non definitivo', 'warn'], non_determinabile: ['Non determinabile', 'warn'] };

// Utenza elettrica dell'apparecchio di riscaldamento, ricavata dal modello termico (estremo ALTO dell'intervallo: prudente).
// Se il termico non è determinabile l'utenza resta con potenza sconosciuta e impedisce un verdetto definitivo.
export function utenzeTermiche(s, p, scenario) {
  const c = p.clima || {}; const app = (s.apparecchi || []).find((a) => a.id === c.apparecchioId);
  if (!app || app.uso !== 'riscaldamento') return [];
  const sc = scenario || s.scenariStrati.find((x) => x.attivo);
  const t = sc ? termico(sc, s, c) : { determinabile: false };
  if (t.determinabile && t.estate) return [];
  const k = t.determinabile ? consumiApparecchio(t.P_max, app, c.oreApparecchio) : null;
  return [{ id: 'derivata', nome: `${app.nome} — parte elettrica (dal modello termico)`, W: k ? k.elettrica_W : null, ore: num(c.oreApparecchio), duty: 100, via: app.elettrico ? 'ac' : 'dc', da: num(c.apparecchioDa) ?? 19, derivata: true }];
}

// Andamento della carica su N ore: linea = energia in batteria; fasce = capacità e riserva; barre = consumi (giù) e ricarica (su); rosso = ore con energia non servita.
function grafico(q) {
  const W = 720, H = 230, x0 = 46, x1 = W - 8, yT = 14, yB = 150, yBar = 190, hb = 34;
  const X = (i) => x0 + (x1 - x0) * i / q.ore, Y = (e) => yB - (yB - yT) * (q.cap ? e / q.cap : 0);
  const maxP = Math.max(1, ...q.serie.map((r) => Math.max(r.carico, r.ricarica)));
  const svg = h('svg', { class: 'grafico', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `Andamento della carica su ${q.ore} ore` });
  const t = (x, y, s, o = {}) => h('text', { x, y, 'font-size': 11, ...o }, s);
  svg.append(h('rect', { x: x0, y: yT, width: x1 - x0, height: yB - yT, class: 'g-area' }));
  if (q.cap) svg.append(h('rect', { x: x0, y: Y(q.floor), width: x1 - x0, height: yB - Y(q.floor), class: 'g-riserva' }), t(x0 + 4, Y(q.floor) - 3, `riserva ${Math.round(q.floor)} Wh`), t(x0 + 4, yT + 11, `capacità ${Math.round(q.cap)} Wh`));
  q.serie.forEach((r) => {
    const w = (x1 - x0) / q.ore - 0.6;
    if (r.nonServita > 0) svg.append(h('rect', { x: X(r.i), y: yT, width: w + 0.6, height: yB - yT, class: 'g-ko' }));
    svg.append(h('rect', { x: X(r.i), y: yBar - hb * r.ricarica / maxP, width: w, height: hb * r.ricarica / maxP, class: 'g-ric' }), h('rect', { x: X(r.i), y: yBar, width: w, height: hb * r.carico / maxP, class: 'g-car' }));
    if (r.ora % 6 === 0) svg.append(h('line', { x1: X(r.i), y1: yT, x2: X(r.i), y2: yB, class: 'g-tick' + (r.ora === 0 ? ' g-giorno' : '') }), t(X(r.i), yB + 11, String(r.ora).padStart(2, '0'), { 'text-anchor': 'middle' }));
  });
  if (q.cap) svg.append(h('path', { class: 'g-soc', d: 'M' + [`${X(0)},${Y(Math.max(q.floor, q.cap * 1))}`, ...q.serie.map((r) => `${X(r.i + 1)},${Y(r.E)}`)].join(' L') }));
  svg.append(t(4, yT + 11, 'Wh'), t(4, yBar - 8, 'ricarica'), t(4, yBar + 14, 'consumi'), t(x1, H - 4, `scala barre: ${Math.round(maxP)} W`, { 'text-anchor': 'end' }));
  return svg;
}

export function render(arg) {
  if (['energia', 'acqua', 'termico'].includes(arg)) ui.tab = arg;
  const s = store.s, E = s.energia;
  const p = E.profili.find((x) => x.id === ui.pid) || E.profili[0]; ui.pid = p?.id;
  const updP = (fn) => store.update((st) => fn(st.energia.profili.find((x) => x.id === p.id)));
  const sel = h('select', { class: 'stretto', onchange: () => { ui.pid = sel.value; store.ridisegna(); } }, E.profili.map((x) => h('option', { value: x.id }, x.nome))); sel.value = ui.pid;
  const testa = h('div', { class: 'barra-azioni no-print' }, h('b', {}, 'Profilo d\'uso:'), sel, p ? btn('Modifica profilo', () => editProfilo(p)) : null,
    p ? btn('Duplica', () => store.update((st) => { const c = JSON.parse(JSON.stringify(p)); c.id = uid('pr'); c.nome += ' (copia)'; st.energia.profili.push(c); ui.pid = c.id; })) : null);
  const corpo = !p ? vuoto('Nessun profilo.') : ui.tab === 'energia' ? vEnergia(s, p, updP) : ui.tab === 'acqua' ? vAcqua(s, p, updP) : vTermico(s, p);
  return h('div', {}, h('div', { class: 'testata' }, h('div', {}, h('h1', {}, 'Simulatore'), h('p', {}, 'Stime su ipotesi modificabili. Una simulazione non è un collaudo.'))),
    tabs([['energia', 'Energia'], ['acqua', 'Acqua'], ['termico', 'Comfort termico']], ui.tab, (k) => { ui.tab = k; store.ridisegna(); }), testa,
    p ? h('p', {}, badge(p.stato), ' ', `${n(p.persone, 0)} persona/e · sole equivalente ${n(p.oreSole, 1, 'h/g')} · guida ${n(p.oreGuida, 1, 'h/g')} · rete ${n(p.oreRete, 1, 'h/g')}`) : null, corpo);
}

function vEnergia(s, p, updP) {
  const editCarico = (c) => openForm({ titolo: c ? c.nome : 'Nuova utenza', valore: c || { id: uid('k'), duty: 100, via: 'dc' },
    campi: [{ k: 'nome', label: 'Utenza', richiesto: true }, { k: 'W', label: 'Potenza quando è accesa', tipo: 'number', unita: 'W', aiuto: 'Vuoto = sconosciuta: l\'utenza viene esclusa e segnalata' }, { k: 'ore', label: 'Ore al giorno in cui è in funzione', tipo: 'number', unita: 'h' },
      { k: 'duty', label: 'Ciclo di lavoro (compressori, termostati)', tipo: 'number', unita: '%' }, { k: 'via', label: 'Alimentazione', tipo: 'select', opzioni: [['dc', '12 V / USB (perdite DC)'], ['ac', '230 V da inverter (perdite inverter)']] },
      { k: 'da', label: 'Ora di accensione (0–23)', tipo: 'number', aiuto: 'Vuoto = distribuita sulle 24 ore (frigo, termostati). Indicata = funziona per le ore sopra, di seguito, da quell\'ora.' }, { k: 'picco_W', label: 'Potenza di spunto/picco', tipo: 'number', unita: 'W', aiuto: 'Vuoto = uguale alla potenza. Serve per il confronto con il limite dell\'impianto.' }],
    onSave: (v) => updP((x) => { const i = x.carichi.findIndex((q) => q.id === v.id); if (i < 0) x.carichi.push(v); else x.carichi[i] = v; }),
    onDelete: c ? () => updP((x) => { x.carichi = x.carichi.filter((q) => q.id !== c.id); }) : null });
  const extra = utenzeTermiche(s, p); const pe = { ...p, carichi: [...p.carichi, ...extra] };
  const rif = s.energia.sistemi[0];
  const er = rif ? energia(pe, rif) : null;
  const carichi = card('Utenze del profilo', h('div', { class: 'scroll-x' }, h('table', {}, h('tr', {}, ['Utenza', 'W', 'h/g', 'Ciclo', 'Via', 'Wh/g*'].map((t, i) => h('th', { class: i ? 'n' : null }, t))),
    pe.carichi.map((c, i) => h('tr', { style: c.derivata ? null : 'cursor:pointer', onclick: c.derivata ? null : () => editCarico(c) }, h('td', {}, c.nome, c.derivata ? h('div', { class: 'aiuto' }, 'calcolata: si cambia in Comfort termico') : num(c.da) !== null ? h('div', { class: 'aiuto' }, 'dalle ' + c.da + ':00') : null), h('td', { class: 'n' }, num(c.W) === null ? 'sconosciuta' : n(c.W, 0)), h('td', { class: 'n' }, n(c.ore, 1)), h('td', { class: 'n' }, n(c.duty ?? 100, 0, '%')), h('td', { class: 'n' }, c.via === 'ac' ? '230 V' : '12 V'), h('td', { class: 'n' }, er ? n(er.righe[i].Wh, 0) : '—'))))),
  h('p', { class: 'aiuto' }, rif ? `* comprese le perdite del sistema “${rif.nome}”. Tocca una riga per modificarla.` : ''), h('div', { class: 'barra-azioni no-print' }, btn('＋ Utenza', () => editCarico(null))));

  const sistemi = s.energia.sistemi.map((sy) => {
    const r = energia(pe, sy), c = costoSistema(sy);
    const sims = (p.obiettivi || [48, 72]).map((hh) => simulaEnergia(p, sy, hh, extra)); const lungo = sims[sims.length - 1];
    const obiettivo = (q) => h('div', { class: 'num ' + VERD[q.verdetto][1] }, h('b', {}, VERD[q.verdetto][0]), h('span', {}, `${q.ore} h · non servita ${n(q.nonServita_Wh, 0)} Wh · minimo ${n(q.Emin, 0)} Wh`));
    const updS = (fn) => store.update((st) => fn(st.energia.sistemi.find((x) => x.id === sy.id)));
    const editComp = (k) => openForm({ titolo: k ? k.nome : 'Nuovo componente', valore: k || { id: uid('c'), disp: 'da_acquistare', costo: null },
      campi: [{ k: 'nome', label: 'Componente', richiesto: true }, { k: 'costo', label: 'Costo', tipo: 'number', unita: '€', aiuto: 'Vuoto = prezzo non noto' }, { k: 'disp', label: 'Stato', tipo: 'select', opzioni: [['da_acquistare', 'Da acquistare'], ['posseduto', 'Già posseduto'], ['acquistato', 'Acquistato (spesa registrata)']] }],
      onSave: (v) => updS((x) => { const i = x.componenti.findIndex((q) => q.id === v.id); if (i < 0) x.componenti.push(v); else x.componenti[i] = v; }),
      onDelete: k ? () => updS((x) => { x.componenti = x.componenti.filter((q) => q.id !== k.id); }) : null });
    return card(null, h('div', { class: 'riga' }, h('h2', { class: 'cresce', style: 'margin:0' }, sy.nome), badge(sy.stato), sy.attivo ? chip('nel progetto attivo', 'ok') : null),
      h('div', { class: 'numeri' },
        h('div', { class: 'num' }, h('b', {}, n(r.consumo, 0, 'Wh/g')), h('span', {}, 'Consumo' + (r.completo ? '' : ' (incompleto)'))),
        h('div', { class: 'num' }, h('b', {}, n(r.ricarica, 0, 'Wh/g')), h('span', {}, `Ricarica: sole ${n(r.solare, 0)} · guida ${n(r.guida, 0)} · rete ${n(r.rete, 0)}`)),
        h('div', { class: 'num' }, h('b', {}, n(r.utilizzabile, 0, 'Wh')), h('span', {}, `Utilizzabili su ${n(sy.capacita_Wh, 0)} (scarica ${n(sy.dod * 100, 0)}%, riserva ${n(sy.riservaPct, 0)}%)`)),
        h('div', { class: 'num' }, h('b', {}, r.autonomia_h === null ? 'Non determinabile' : (r.limiteSuperiore ? '≤ ' : '') + (r.autonomia_h === Infinity ? 'illimitata*' : n(r.autonomia_h, 0, 'h'))), h('span', {}, 'Autonomia sul bilancio medio' + (r.limiteSuperiore ? ' (massimo: ci sono utenze ignote)' : ''))),
        h('div', { class: 'num ' + (lungo.superaLimite ? 'err' : lungo.superaLimite === null ? 'warn' : '') }, h('b', {}, n(lungo.piccoMax_W, 0, 'W')), h('span', {}, `Picco contemporaneo${lungo.piccoOra !== null ? ' (ore ' + lungo.piccoOra + ')' : ''} · limite ${lungo.maxUscita_W === null ? 'non noto' : lungo.maxUscita_W + ' W'}`)),
        sims.map(obiettivo)),
      h('h3', {}, `Andamento della carica su ${lungo.ore} ore (partenza ore ${p.oraInizio ?? 18}, batteria al ${sy.socIniziale ?? 100}%)`), grafico(lungo),
      h('p', { class: 'aiuto' }, `Totale consumi ${n(lungo.totCarico_Wh, 0)} Wh · ricarica ${n(lungo.totRicarica_Wh, 0)} Wh · ricarica sprecata a batteria piena ${n(lungo.sprecata_Wh, 0)} Wh · energia non servita ${n(lungo.nonServita_Wh, 0)} Wh.`),
      sims.map((q) => q.motivi.length ? avviso(`${q.ore} h — ${VERD[q.verdetto][0].toLowerCase()}: ${q.motivi.join('; ')}.`, VERD[q.verdetto][1]) : null),
      r.autonomia_h === Infinity ? h('p', { class: 'aiuto' }, '* la ricarica media copre il consumo medio: vale solo se sole e guida ipotizzati ci sono davvero ogni giorno.') : null,
      h('p', { class: 'aiuto' }, sy.nota),
      h('h3', {}, `Costo: ${euro(c.noto)}${c.senzaPrezzo ? ` + ${c.senzaPrezzo} voci senza prezzo` : ''}`),
      sy.componenti.map((k) => h('div', { class: 'riga' }, h('div', { class: 'cresce clic', style: 'cursor:pointer', onclick: () => editComp(k) }, k.nome), h('span', {}, num(k.costo) === null ? h('i', { class: 'vuoto' }, 'prezzo ?') : euro(k.costo)),
        k.disp === 'da_acquistare' ? btn('Acquistato', () => registraAcquisto({ descr: `${k.nome} (${sy.nome})`, importoProposto: k.costo, onCollega: (st, id) => { const q = st.energia.sistemi.find((x) => x.id === sy.id).componenti.find((x) => x.id === k.id); q.disp = 'acquistato'; q.spesaId = id; } }), 'mini no-print') : chip(k.disp === 'acquistato' ? 'acquistato' : 'posseduto', 'ok'))),
      h('div', { class: 'barra-azioni no-print' }, btn('＋ Componente', () => editComp(null), 'mini'), btn('Parametri', () => editSistema(sy), 'mini'),
        btn(sy.attivo ? 'Togli dal progetto attivo' : 'Usa nel progetto attivo', () => store.update((st) => { const pg = st.progetti.find((x) => x.attivo); if (pg) pg.sistemaId = sy.attivo ? null : sy.id; applicaProgetto(st); }), 'mini' + (sy.attivo ? '' : ' primary')),
        btn('Duplica', () => store.update((st) => { const k = JSON.parse(JSON.stringify(sy)); k.id = uid('sy'); k.nome += ' (copia)'; k.attivo = false; st.energia.sistemi.push(k); }), 'mini')));
  });
  return h('div', {}, carichi, h('h2', {}, 'Sistemi a confronto'), h('div', { class: 'griglia' }, sistemi), h('div', { class: 'barra-azioni no-print' }, btn('＋ Sistema', () => editSistema(null))),
    card('Come è calcolato', h('p', { class: 'aiuto' }, 'VERDETTO: simulazione ora per ora. Ogni utenza con orario lavora nelle sue ore, le altre sono distribuite sulle 24 h; il sole segue una campana centrata a metà giornata; guida e rete hanno la loro finestra. Sotto la riserva le utenze non sono servite; a batteria piena la ricarica in più è sprecata. Il verdetto è positivo solo con zero energia non servita, picchi entro il limite dell\'impianto e nessuna utenza ignota; con utenze ignote o limite non noto resta “non definitivo”. BILANCIO MEDIO (solo orientativo): Consumo [Wh/giorno] = Σ potenza × ore × ciclo ÷ rendimento (DC o inverter). Ricarica = pannelli [Wp] × ore di sole equivalenti × rendimento solare + potenza di ricarica in marcia × ore di guida + caricatore di rete × ore di rete. Energia utilizzabile = capacità × profondità di scarica × (1 − riserva). Autonomia = utilizzabile ÷ (consumo − ricarica) × 24. Non considera: spunti, temperatura della batteria, invecchiamento, ombre. Sezioni dei cavi, fusibili e protezioni NON sono calcolati qui: vanno dimensionati sulle schede dei componenti con l\'elettrauto.')));
}

function vAcqua(s, p, updP) {
  const r = acqua(p, s.serbatoi), sb = s.serbatoi;
  const editVoce = (v) => openForm({ titolo: v ? v.nome : 'Nuovo consumo', valore: v || { id: uid('a'), perPersona: false, grigia: true, serb: 'pulita' },
    campi: [{ k: 'nome', label: 'Uso', richiesto: true }, { k: 'litri', label: 'Litri al giorno', tipo: 'number', unita: 'l', aiuto: 'Vuoto = sconosciuto' }, { k: 'perPersona', label: 'Per persona', tipo: 'checkbox' }, { k: 'grigia', label: 'Finisce nel recupero acque grigie', tipo: 'checkbox' }, { k: 'serb', label: 'Prelevata da', tipo: 'select', opzioni: [['pulita', 'Serbatoio acqua pulita'], ['lavoro', 'Serbatoio acqua da lavoro']] }],
    onSave: (o) => updP((x) => { const i = x.acqua.findIndex((q) => q.id === o.id); if (i < 0) x.acqua.push(o); else x.acqua[i] = o; }),
    onDelete: v ? () => updP((x) => { x.acqua = x.acqua.filter((q) => q.id !== v.id); }) : null });
  const g = (v) => v === null ? '—' : v === Infinity ? 'non usata' : n(v, 1, 'giorni') + ` (${n(v * 24, 0)} h)`;
  return h('div', {}, card('Consumi d\'acqua del profilo', p.acqua.map((v) => h('div', { class: 'riga clic', onclick: () => editVoce(v) }, h('div', { class: 'cresce' }, v.nome), h('span', {}, num(v.litri) === null ? h('i', { class: 'vuoto' }, 'sconosciuto') : n(v.litri, 1, 'l/g') + (v.perPersona ? ' a persona' : '')), chip(v.serb === 'lavoro' ? 'lavoro' : 'pulita'), v.grigia ? chip('→ grigie') : null)),
    h('div', { class: 'barra-azioni no-print' }, btn('＋ Consumo', () => editVoce(null)))),
  card('Autonomia idrica', h('div', { class: 'numeri' },
    h('div', { class: 'num' }, h('b', {}, g(r.giorniPulita)), h('span', {}, `Acqua pulita: ${n(sb.pulita_l, 0)} l ÷ ${n(r.uso.pulita, 1)} l/g`)),
    h('div', { class: 'num' }, h('b', {}, g(r.giorniLavoro)), h('span', {}, `Acqua lavoro: ${n(sb.lavoro_l, 0)} l ÷ ${n(r.uso.lavoro, 1)} l/g`)),
    h('div', { class: 'num' }, h('b', {}, g(r.giorniGrigie)), h('span', {}, `Recupero grigie pieno: ${n(sb.grigie_l, 0)} l ÷ ${n(r.grigie, 1)} l/g`))),
  r.ignoti.length ? avviso('Consumi sconosciuti, esclusi: ' + r.ignoti.join(', ') + '. L\'autonomia reale è minore.') : null,
  h('p', {}, badge(sb.stato), ' ', h('span', { class: 'aiuto' }, sb.nota)),
  h('div', { class: 'barra-azioni no-print' }, btn('Capacità dei serbatoi', () => openForm({ titolo: 'Serbatoi', valore: sb, campi: [{ k: 'pulita_l', label: 'Acqua pulita', tipo: 'number', unita: 'l' }, { k: 'lavoro_l', label: 'Acqua da lavoro', tipo: 'number', unita: 'l' }, { k: 'grigie_l', label: 'Recupero acque grigie', tipo: 'number', unita: 'l' }, { k: 'stato', label: 'Attendibilità', tipo: 'stato' }, { k: 'nota', label: 'Note', tipo: 'textarea' }], onSave: (v) => store.update((st) => { st.serbatoi = v; }) })))),
  card('Come è calcolato', h('p', { class: 'aiuto' }, 'Giorni di autonomia = capacità del serbatoio ÷ litri al giorno prelevati da quel serbatoio. Il recupero si riempie con i soli consumi segnati “→ grigie”. 1 litro = 1 kg nella lista carichi. La doccia esterna con raccolta e il WC portatile non sono dimensionati qui.')));
}

function vTermico(s, p) {
  const c = p.clima || {}, t = s.termico;
  const editClima = () => openForm({ titolo: 'Condizioni del profilo', valore: c, campi: [{ k: 'apparecchioId', label: 'Apparecchio di riscaldamento usato', tipo: 'select', opzioni: [['', '— nessuno —'], ...(s.apparecchi || []).filter((a) => a.uso === 'riscaldamento').map((a) => [a.id, a.nome])] }, { k: 'oreApparecchio', label: 'Ore di riscaldamento al giorno', tipo: 'number', unita: 'h' }, { k: 'apparecchioDa', label: 'Riscaldamento: dalle ore', tipo: 'number' }, { k: 'Tint', label: 'Temperatura interna desiderata', tipo: 'number', unita: '°C' }, { k: 'Text', label: 'Temperatura esterna', tipo: 'number', unita: '°C' }, { k: 'portata_m3h', label: 'Ricambio d\'aria (ventilazione)', tipo: 'number', unita: 'm³/h' }, { k: 'persone', label: 'Persone presenti', tipo: 'number' }],
    onSave: (v) => store.update((st) => { v.apparecchioId = v.apparecchioId || null; st.energia.profili.find((x) => x.id === p.id).clima = v; }) });
  const editPar = () => openForm({ titolo: 'Parametri del modello termico', valore: t, campi: [{ k: 'vetri_m2', label: 'Superficie vetrata totale', tipo: 'number', unita: 'm²' }, { k: 'Uvetro', label: 'Trasmittanza dei vetri', tipo: 'number', unita: 'W/m²K' }, { k: 'ponteMin', label: 'Fattore ponti termici: caso favorevole', tipo: 'number', aiuto: '1 = nessun ponte termico' }, { k: 'ponteMax', label: 'Fattore ponti termici: caso sfavorevole', tipo: 'number' }, { k: 'wattPersona', label: 'Calore emesso da una persona', tipo: 'number', unita: 'W' }, { k: 'stato', label: 'Attendibilità', tipo: 'stato' }, { k: 'nota', label: 'Note', tipo: 'textarea' }],
    onSave: (v) => store.update((st) => { st.termico = v; }) });
  const righe = s.scenariStrati.map((sc) => ({ sc, r: termico(sc, s, c) }));
  const att = righe.find((x) => x.sc.attivo) || righe[0];
  return h('div', {}, card('Condizioni', h('p', {}, `Interno ${n(c.Tint, 0, '°C')} · esterno ${n(c.Text, 0, '°C')} · ricambio d'aria ${n(c.portata_m3h, 0, 'm³/h')} · ${n(c.persone, 0)} persona/e`),
    h('p', {}, badge(t.stato), ' ', `Vetri ${n(t.vetri_m2, 1, 'm²')} a U = ${n(t.Uvetro, 1)} · ponti termici ×${n(t.ponteMin, 1)}–${n(t.ponteMax, 1)}`), h('p', { class: 'aiuto' }, t.nota),
    h('div', { class: 'barra-azioni no-print' }, btn('Condizioni', editClima), btn('Parametri del modello', editPar))),
  card('Potenza per mantenere la temperatura, per scenario di stratigrafia', righe.map(({ sc, r }) => h('div', { class: 'riga' }, h('div', { class: 'cresce' }, h('b', {}, sc.nome), sc.attivo ? ' ●' : ''),
    !r.determinabile ? h('span', { class: 'chip err' }, 'non determinabile') : r.estate ? h('span', { class: 'chip warn' }, 'serve raffrescamento attivo') : h('b', {}, `${r.limite ? '≤ ' : ''}${n(r.P_min, 0)} – ${n(r.P_max, 0)} W`))),
  att && !att.r.determinabile ? avviso('Non determinabile perché: ' + att.r.motivi.join('; ') + '. Completa i rilievi delle superfici o togli le zone che non vuoi considerare.', 'err') : null,
  att ? att.r.avvisi.map((a) => avviso(a)) : null,
  h('p', { class: 'aiuto' }, 'È un intervallo, non un numero: l\'estremo basso ignora quasi del tutto costole e montanti, quello alto li pesa molto. La ventilazione sposta aria, non raffresca sotto la temperatura esterna.')),
  att && att.r.dettagli.length ? card(`Dettaglio: ${att.sc.nome}`, h('div', { class: 'scroll-x' }, h('table', {}, h('tr', {}, ['Superficie', 'm²', 'R strati', 'U', 'U×A [W/K]', ''].map((x, i) => h('th', { class: i && i < 5 ? 'n' : null }, x))),
    att.r.dettagli.map((d) => h('tr', {}, h('td', {}, d.zona), h('td', { class: 'n' }, n(d.area, 2)), h('td', { class: 'n' }, d.R === null ? '—' : (d.Rignoti.length ? '≥ ' : '') + n(d.R, 2)), h('td', { class: 'n' }, n(d.U, 2)), h('td', { class: 'n' }, n(d.U * d.area, 1)), h('td', {}, d.ipotesi ? chip('su ipotesi', 'warn') : chip('misurato', 'ok'))))))) : null,
  cardApparecchio(s, p, att), cardRaffrescamento(att), cardApparecchi(s),
  card('Come è calcolato', h('p', { class: 'aiuto' }, 'Regime stazionario. Per ogni superficie U = 1 ÷ (0,13 + Σ spessore/λ + 0,04) [W/m²K]; lamiera nuda ≈ 5,9. Dispersione H = Σ U·A + vetri; corretta con il fattore ponti termici (min–max). Ventilazione 0,33 × m³/h [W/K]. Potenza = (H + ventilazione) × (T interna − T esterna) − calore delle persone. NON modella: sole, irraggiamento notturno, inerzia, umidità e condensa, tenuta all\'aria reale. I termoriflettenti contano solo se inserisci una R dichiarata valida per la posa reale (intercapedini d\'aria). Uno strato con resistenza sconosciuta vale zero e il risultato è segnato “≤”.')));
}

// Dal fabbisogno termico ai consumi: tre grandezze distinte, ciascuna come intervallo (estremo basso – alto del fabbisogno).
function cardApparecchio(s, p, att) {
  const c = p.clima || {}; const app = (s.apparecchi || []).find((a) => a.id === c.apparecchioId);
  if (!app) return card('Dal calore ai consumi', h('p', { class: 'vuoto' }, 'Nessun apparecchio di riscaldamento scelto per questo profilo (Condizioni → Apparecchio).'));
  if (!att || !att.r.determinabile) return card('Dal calore ai consumi', avviso('Fabbisogno termico non determinabile: i consumi dell\'apparecchio non si possono calcolare.', 'err'));
  if (att.r.estate) return null;
  const a = consumiApparecchio(att.r.P_min, app, c.oreApparecchio), b = consumiApparecchio(att.r.P_max, app, c.oreApparecchio);
  const rng = (x, y, dec, u) => x === null || y === null ? 'non determinabile' : `${n(x, dec)} – ${n(y, dec)} ${u}`;
  return card(`Dal calore ai consumi: ${app.nome}`, h('p', {}, badge(app.stato), ' ', h('span', { class: 'aiuto' }, `${n(c.oreApparecchio, 0)} ore al giorno di funzionamento, scenario “${att.sc.nome}”.`)),
    h('div', { class: 'numeri' },
      h('div', { class: 'num' }, h('b', {}, rng(a.termica_Wh_g / 1000, b.termica_Wh_g / 1000, 1, 'kWh/g')), h('span', {}, 'ENERGIA TERMICA da fornire')),
      h('div', { class: 'num' }, h('b', {}, rng(a.elettrica_Wh_g, b.elettrica_Wh_g, 0, 'Wh/g')), h('span', {}, 'ELETTRICITÀ dalla batteria' + (app.elettrico ? '' : ' (ventola, pompa, elettronica)'))),
      h('div', { class: 'num' }, h('b', {}, app.elettrico ? 'nessuno' : rng(a.combustibile_l_g, b.combustibile_l_g, 2, 'l/g')), h('span', {}, 'COMBUSTIBILE' + (app.elettrico ? '' : ' dal serbatoio'))),
      h('div', { class: 'num ' + (b.insufficiente ? 'err' : '') }, h('b', {}, b.frazione === null ? '—' : `${n(a.frazione * 100, 0)} – ${n(b.frazione * 100, 0)} %`), h('span', {}, 'Della potenza massima dell\'apparecchio'))),
    b.insufficiente ? avviso('Nel caso sfavorevole l\'apparecchio non basta a mantenere la temperatura desiderata.', 'err') : null,
    h('p', { class: 'aiuto' }, 'L\'estremo alto dell\'elettricità entra da solo fra le utenze del profilo (Energia). ' + app.nota));
}
function cardRaffrescamento(att) {
  if (!att || !att.r.determinabile || !att.r.estate) return null;
  const r = att.r;
  return card('Raffrescamento: cosa il modello sa e cosa manca', h('table', {}, h('tr', {}, h('th', {}, 'Componente del carico'), h('th', { class: 'n' }, 'Potenza')),
    r.componenti.map((k) => h('tr', {}, h('td', {}, k.nome, k.mancante ? h('div', { class: 'aiuto' }, 'Non modellata: ' + k.mancante) : null), h('td', { class: 'n' }, k.mancante ? h('span', { class: 'chip err' }, 'mancante') : `${n(k.W_min, 0)} – ${n(k.W_max, 0)} W`))),
    h('tr', {}, h('td', {}, h('b', {}, 'Somma delle sole componenti note')), h('td', { class: 'n' }, h('b', {}, `≥ ${n(r.parzialeMin_W, 0)} – ${n(r.parzialeMax_W, 0)} W`)))),
  avviso('È un MINIMO, non il fabbisogno: in un furgone al sole la componente solare è di norma la più grande e qui manca. Non usare questo numero per scegliere un climatizzatore.', 'warn'),
  h('p', { class: 'aiuto' }, 'Per l\'elettricità servirebbe anche il rendimento (EER/COP) dell\'apparecchio scelto. Ombra, aerazione e oscuranti riducono il carico ma non sono quantificati.'));
}
function cardApparecchi(s) {
  const edit = (a) => openForm({ titolo: a ? a.nome : 'Nuovo apparecchio', valore: a || { id: uid('ap'), uso: 'riscaldamento', elettrico: false, stato: 'ipotesi', nota: '' },
    campi: [{ k: 'nome', label: 'Nome e modello', richiesto: true }, { k: 'uso', label: 'Uso', tipo: 'select', opzioni: ['riscaldamento', 'raffrescamento'] }, { k: 'elettrico', label: 'Produce caldo/freddo con la sola elettricità', tipo: 'checkbox' },
      { k: 'pTermMax_W', label: 'Potenza termica massima', tipo: 'number', unita: 'W' }, { k: 'rendimento', label: 'Rendimento (combustibile→calore, 0–1) oppure COP se elettrico', tipo: 'number' }, { k: 'pci_kWh_l', label: 'Energia del combustibile', tipo: 'number', unita: 'kWh/l', aiuto: 'Gasolio ≈ 10' },
      { k: 'el_min_W', label: 'Assorbimento elettrico a potenza minima', tipo: 'number', unita: 'W' }, { k: 'el_max_W', label: 'Assorbimento elettrico a potenza massima', tipo: 'number', unita: 'W' }, { k: 'stato', label: 'Attendibilità (documentato = dal manuale del modello)', tipo: 'stato' }, { k: 'nota', label: 'Fonte e note', tipo: 'textarea' }],
    onSave: (v) => store.update((st) => { const i = st.apparecchi.findIndex((x) => x.id === v.id); if (i < 0) st.apparecchi.push(v); else st.apparecchi[i] = v; }),
    onDelete: a ? () => store.update((st) => { st.apparecchi = st.apparecchi.filter((x) => x.id !== a.id); st.energia.profili.forEach((q) => { if (q.clima && q.clima.apparecchioId === a.id) q.clima.apparecchioId = null; }); }) : null });
  return card('Apparecchi', (s.apparecchi || []).map((a) => h('div', { class: 'riga clic', onclick: () => edit(a) }, h('div', { class: 'cresce' }, h('b', {}, a.nome), h('div', { class: 'aiuto' }, a.nota)), chip(a.uso), badge(a.stato))), h('div', { class: 'barra-azioni no-print' }, btn('＋ Apparecchio', () => edit(null), 'mini')));
}

function editProfilo(p) {
  openForm({ titolo: 'Profilo d\'uso', valore: { ...p, obiettiviTxt: (p.obiettivi || []).join(', ') },
    campi: [{ k: 'nome', label: 'Nome', richiesto: true }, { k: 'persone', label: 'Persone', tipo: 'number' }, { k: 'oreSole', label: 'Ore di sole equivalenti al giorno', tipo: 'number', unita: 'h', aiuto: 'Energia solare giornaliera ÷ 1000 W/m². Dipende da stagione, luogo e ombre.' }, { k: 'oreGuida', label: 'Ore di guida al giorno', tipo: 'number', unita: 'h' }, { k: 'oreRete', label: 'Ore collegato alla rete al giorno', tipo: 'number', unita: 'h' },
      { k: 'oraInizio', label: 'Ora di inizio della simulazione (0–23)', tipo: 'number' }, { k: 'guidaDa', label: 'Guida: dalle ore', tipo: 'number' }, { k: 'reteDa', label: 'Rete: dalle ore', tipo: 'number' }, { k: 'oreLuce', label: 'Ore di luce utile per i pannelli', tipo: 'number', unita: 'h' },
      { k: 'obiettiviTxt', label: 'Obiettivi di autonomia (ore, separati da virgola)', aiuto: 'Esempio: 48, 72, 96' }, { k: 'stato', label: 'Attendibilità', tipo: 'stato' }],
    onSave: (v) => store.update((s) => { const ob = String(v.obiettiviTxt).split(/[,; ]+/).map(Number).filter((x) => x > 0); delete v.obiettiviTxt; v.obiettivi = ob.length ? ob : [48, 72]; const i = s.energia.profili.findIndex((x) => x.id === v.id); s.energia.profili[i] = v; }),
    onDelete: store.s.energia.profili.length > 1 ? () => store.update((s) => { s.energia.profili = s.energia.profili.filter((x) => x.id !== p.id); ui.pid = null; }) : null });
}
function editSistema(sy) {
  openForm({ titolo: sy ? sy.nome : 'Nuovo sistema', valore: sy || { id: uid('sy'), tipo: 'separati', attivo: false, dod: 0.9, effInv: 0.88, effDC: 0.97, riservaPct: 10, solare_Wp: 0, rendSolare: 0.7, caricaVeicolo_W: 0, caricaRete_W: 0, componenti: [], stato: 'ipotesi', nota: '' },
    campi: [{ k: 'nome', label: 'Nome', richiesto: true }, { k: 'tipo', label: 'Tipo', tipo: 'select', opzioni: [['power_station', 'Power station'], ['separati', 'Componenti separati']] },
      { k: 'capacita_Wh', label: 'Capacità nominale', tipo: 'number', unita: 'Wh', aiuto: 'Ah × 12,8 V per LiFePO4' }, { k: 'dod', label: 'Profondità di scarica utilizzabile (0–1)', tipo: 'number' }, { k: 'riservaPct', label: 'Riserva da non toccare', tipo: 'number', unita: '%' },
      { k: 'effDC', label: 'Rendimento uscite 12 V/USB (0–1)', tipo: 'number' }, { k: 'effInv', label: 'Rendimento inverter (0–1)', tipo: 'number' },
      { k: 'solare_Wp', label: 'Pannelli solari', tipo: 'number', unita: 'Wp' }, { k: 'rendSolare', label: 'Rendimento reale del solare (0–1)', tipo: 'number' },
      { k: 'caricaVeicolo_W', label: 'Potenza di ricarica in marcia', tipo: 'number', unita: 'W' }, { k: 'caricaRete_W', label: 'Potenza di ricarica da rete', tipo: 'number', unita: 'W' },
      { k: 'maxUscita_W', label: 'Limite di potenza in uscita (inverter, BMS, fusibile principale)', tipo: 'number', unita: 'W', aiuto: 'Vuoto = non noto: i picchi non sono verificabili e il verdetto resta non definitivo. Valore dalla scheda dei componenti.' }, { k: 'maxCarica_W', label: 'Limite di potenza in ricarica', tipo: 'number', unita: 'W' }, { k: 'socIniziale', label: 'Carica alla partenza', tipo: 'number', unita: '%' }, { k: 'stato', label: 'Attendibilità', tipo: 'stato' }, { k: 'nota', label: 'Note, pro e contro', tipo: 'textarea' }],
    onSave: (v) => store.update((s) => { const i = s.energia.sistemi.findIndex((x) => x.id === v.id); if (i < 0) s.energia.sistemi.push(v); else s.energia.sistemi[i] = v; }),
    onDelete: sy ? () => store.update((s) => { s.energia.sistemi = s.energia.sistemi.filter((x) => x.id !== sy.id); }) : null });
}
