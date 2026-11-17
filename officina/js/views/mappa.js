// Mappa e configuratore: pianta 2D del vano (vista dall'alto, AVANTI IN ALTO, sinistra/destra nel senso di marcia).
// Base fissa (sempre a bordo) + mobili della configurazione. Stati d'uso (viaggio, cucina estratta, letto aperto…).
// Limiti verificati sul vano FINITO (lamiera meno rivestimenti dello scenario materiali attivo). Solo geometria: nessuna certificazione.
import { store } from '../store.js';
import { verificaLayout, vanoFinito, massaLayout, ingombroAperto, num } from '../calc.js';
import { vista3d } from './mappa3d.js';
import { h, card, badge, chip, btn, n, openForm, uid, avviso, vuoto, STATI } from '../ui.js';

const ui = { id: null, stato: '', sel: null, zoom: 1, finito: true, vista: 'pianta' };
const CAB = 300, RETRO = 1100, M = 190;

const scenarioAttivo = (s) => s.scenariStrati.find((x) => x.attivo) || null;
function contesto(s, ly) {
  const sc = scenarioAttivo(s);
  const fin = ui.finito && sc ? vanoFinito(s.geom, sc, s) : null;
  const st = ly ? (ly.stati || []).find((x) => x.id === ui.stato) || null : null;
  return { sc, fin, st };
}
// Trova un modulo nella base fissa o nella configurazione; restituisce l'elenco che lo contiene.
const dove = (s, lyId, mid) => { const b = s.baseFissa.find((m) => m.id === mid); if (b) return { arr: s.baseFissa, m: b, fisso: true }; const l = s.layout.find((x) => x.id === lyId); const m = l && l.moduli.find((x) => x.id === mid); return m ? { arr: l.moduli, m, fisso: false } : null; };

export function render() {
  const s = store.s, g = s.geom;
  const ly = s.layout.find((l) => l.id === ui.id) || s.layout[0]; ui.id = ly?.id;
  if (ly && ui.stato && !(ly.stati || []).some((x) => x.id === ui.stato)) ui.stato = '';
  const { sc, fin, st } = contesto(s, ly);
  const probs = ly ? verificaLayout(ly, g, { base: s.baseFissa, stato: st, finito: fin }) : [];
  const bad = new Set(probs.filter((p) => p.livello === 'errore').flatMap((p) => p.ids));
  const tutti = ly ? [...s.baseFissa.map((m) => ({ ...m, fisso: true })), ...ly.moduli] : [];
  if (ui.sel && !tutti.some((m) => m.id === ui.sel)) ui.sel = null;

  const sel = h('select', { class: 'stretto', title: 'Configurazione', onchange: () => { ui.id = sel.value; ui.stato = ''; ui.sel = null; store.ridisegna(); } }, s.layout.map((l) => h('option', { value: l.id }, `${l.nome} (${l.modo})`))); sel.value = ui.id;
  const selSt = h('select', { class: 'stretto', title: 'Stato d\'uso', onchange: () => { ui.stato = selSt.value; store.ridisegna(); } }, h('option', { value: '' }, 'Tutti gli stati (chiuso + avvisi)'), (ly?.stati || []).map((x) => h('option', { value: x.id }, x.nome))); selSt.value = ui.stato;
  const zoom = (k) => { ui.zoom = k ? Math.max(1, Math.min(4, ui.zoom * k)) : 1; store.ridisegna(); };
  const barra = h('div', { class: 'barra-azioni no-print' }, sel, selSt,
    h('label', { class: 'campo riga-check' }, h('input', { type: 'checkbox', checked: ui.finito, onchange: (e) => { ui.finito = e.target.checked; store.ridisegna(); } }), 'Vano finito'),
    btn(ui.vista === '3d' ? 'Pianta' : 'Vista 3D', () => { ui.vista = ui.vista === '3d' ? 'pianta' : '3d'; store.ridisegna(); }, 'mini primary'),
    btn('−', () => zoom(1 / 1.4), 'mini'), h('small', {}, Math.round(ui.zoom * 100) + '%'), btn('＋', () => zoom(1.4), 'mini'), btn('1:1', () => zoom(0), 'mini'),
    btn('↶ Annulla', () => store.annulla(), 'mini' + (store.passato.length ? '' : ' spento')), btn('↷ Ripristina', () => store.ripristina(), 'mini' + (store.futuro.length ? '' : ' spento')),
    h('span', { class: 'spazio' }), btn('＋ Configurazione', () => editLayout(null), 'mini'), ly ? btn('Duplica', () => store.update((x) => { const c = JSON.parse(JSON.stringify(ly)); const mappa = {}; c.id = uid('ly'); c.nome += ' (copia)'; c.moduli.forEach((m) => { const nu = uid('md'); mappa[m.id] = nu; m.id = nu; }); (c.stati || []).forEach((q) => { q.aperti = q.aperti.map((a) => mappa[a] || a); }); x.layout.push(c); ui.id = c.id; }), 'mini') : null, ly ? btn('Rinomina', () => editLayout(ly), 'mini') : null);

  const ord = { errore: 0, avviso: 1, nota: 2 };
  const verifiche = card('Verifica geometrica' + (st ? ` — ${st.nome}` : ''), probs.length ? [...probs].sort((a, b) => ord[a.livello] - ord[b.livello]).map((p) => avviso(p.msg, p.livello === 'errore' ? 'err' : p.livello === 'avviso' ? 'warn' : 'info')) : avviso('Nessuna interferenza con la geometria disponibile.', 'ok'),
    fin ? h('p', { class: 'aiuto' }, `Vano finito con “${sc.nome}”: ${n(fin.lung, 0)} × ${n(fin.larg, 0)} × ${n(fin.alt, 0)} mm (pareti −${n(fin.par, 0)} per lato, pavimento −${n(fin.pav, 0)}, soffitto −${n(fin.sof, 0)}, portellone −${n(fin.por, 0)}).`) : h('p', { class: 'aiuto' }, 'Verifica sulla lamiera nuda: i rivestimenti non sono considerati.'),
    h('p', { class: 'aiuto' }, 'Controlla solo ingombri. Non certifica resistenza, trattenuta del carico né omologazione.'));

  const pannello = ui.sel ? pannelloModulo(ly, dove(s, ly.id, ui.sel)) : card('Moduli', h('p', { class: 'aiuto' }, 'Tocca un modulo sulla pianta o qui sotto per modificarlo. F = base fissa (resta in ogni configurazione).'),
    tutti.map((m, i) => h('div', { class: 'riga clic', onclick: () => { ui.sel = m.id; store.ridisegna(); } }, h('span', { class: 'sw', style: 'background:' + m.colore }, m.fisso ? 'F' : i + 1 - s.baseFissa.length),
      h('div', { class: 'cresce' }, h('b', {}, m.nome), h('div', { class: 'aiuto' }, `${n(m.lx, 0)} × ${n(m.ly, 0)} × ${n(m.h, 0)} mm · quota ${n(m.z, 0)} · massa ${num(m.massa) === null ? 'sconosciuta' : n(m.massa, 1, 'kg')}`)), badge(m.stato || 'ipotesi'), bad.has(m.id) ? chip('interferenza', 'err') : null)),
    tutti.length ? null : vuoto('Nessun modulo.'),
    h('div', { class: 'barra-azioni no-print' }, btn('＋ Mobile', () => nuovoModulo(ly, false), 'primary'), btn('＋ Elemento fisso', () => nuovoModulo(ly, true))));

  const stati = ly ? card('Stati d\'uso di questa configurazione', h('p', { class: 'aiuto' }, 'Spunta i moduli APERTI in ogni stato. Scegli lo stato in alto per verificarlo.'),
    (ly.stati || []).map((q) => h('div', { class: 'riga' }, h('div', { class: 'cresce' }, h('b', {}, q.nome), h('div', {}, tutti.filter((m) => m.apreX || m.apreY).map((m) => h('label', { class: 'campo riga-check', style: 'font-weight:400' }, h('input', { type: 'checkbox', checked: q.aperti.includes(m.id), onchange: (e) => store.update((x) => { const t = x.layout.find((l) => l.id === ly.id).stati.find((k) => k.id === q.id); t.aperti = e.target.checked ? [...t.aperti, m.id] : t.aperti.filter((a) => a !== m.id); }) }), m.nome)))),
      (() => { const e = verificaLayout(ly, g, { base: s.baseFissa, stato: q, finito: fin }).filter((p) => p.livello === 'errore').length; return chip(e ? e + ' errori' : 'ok', e ? 'err' : 'ok'); })(),
      q.id === 'viaggio' ? null : btn('✕', () => store.update((x) => { const l = x.layout.find((k) => k.id === ly.id); l.stati = l.stati.filter((k) => k.id !== q.id); }), 'mini danger no-print'))),
    h('div', { class: 'barra-azioni no-print' }, btn('＋ Stato', () => openForm({ titolo: 'Nuovo stato d\'uso', valore: {}, campi: [{ k: 'nome', label: 'Nome (es. Cucina estratta)', richiesto: true }], onSave: (v) => store.update((x) => { (x.layout.find((l) => l.id === ly.id).stati ||= []).push({ id: uid('st'), nome: v.nome, aperti: [] }); }) }), 'mini'))) : null;

  const geomCard = card('Geometria del vano (lamiera nuda)', h('p', {}, badge(g.stato), ' ', `${n(g.lung, 0)} × ${n(g.larg, 0)} × ${n(g.alt, 0)} mm · corridoio ${n(g.corridoio.ly, 0)} mm a ${n(g.corridoio.y, 0)} mm da sinistra, alto ${n(g.corridoio.h, 0)} mm`),
    g.stato !== 'misurato' ? avviso('Quote indicative, non misurate: il disegno serve a ragionare, non a tagliare.') : null, h('p', { class: 'aiuto' }, g.nota),
    h('div', { class: 'barra-azioni no-print' }, btn('Modifica geometria', editGeom), h('a', { href: '#/diario/rilievi' }, 'Inserisci i rilievi →')));

  const confronto = card('Confronto fra configurazioni e stati', h('div', { class: 'scroll-x' }, h('table', {}, h('tr', {}, ['Configurazione', 'Stato', 'Moduli', 'Massa nota', 'Errori', 'Avvisi'].map((t) => h('th', {}, t))),
    s.layout.flatMap((l) => [null, ...(l.stati || [])].map((q) => { const p = verificaLayout(l, g, { base: s.baseFissa, stato: q, finito: fin }), m = massaLayout({ moduli: [...s.baseFissa, ...l.moduli] }); const e = p.filter((x) => x.livello === 'errore').length;
      return h('tr', {}, h('td', {}, q ? '' : h('b', {}, l.nome)), h('td', {}, q ? q.nome : 'chiuso + avvisi'), h('td', { class: 'n' }, q ? '' : l.moduli.length + s.baseFissa.length), h('td', { class: 'n' }, q ? '' : n(m.nota, 1, 'kg') + (m.ignoti.length ? ` + ${m.ignoti.length} da pesare` : '')), h('td', { class: 'n' }, e ? h('b', { style: 'color:var(--err)' }, e) : 0), h('td', { class: 'n' }, p.filter((x) => x.livello === 'avviso').length)); })))));

  const wrap = h('div', { class: 'pianta-scroll' }, !ly ? vuoto('Crea una configurazione.') : ui.vista === '3d' ? vista3d({ g, moduli: tutti, bad, fin, aperti: new Set(st ? st.aperti : []), haStato: !!st, sel: ui.sel, zoom: ui.zoom, onSel: (id) => { ui.sel = id; store.ridisegna(); } }) : pianta(ly, g, tutti, bad, fin, st));
  return h('div', {}, h('div', { class: 'testata' }, h('div', {}, h('h1', {}, 'Mappa e configuratore'), h('p', {}, 'Vista dall\'alto, avanti in alto. Trascina i moduli (passo 10 mm), tocca per selezionare e modificare.'))),
    barra, ly?.nota ? h('p', { class: 'aiuto' }, ly.nota) : null,
    h('div', { class: 'mappa-wrap' }, h('div', {}, wrap, h('p', { class: 'legenda' }, h('span', {}, h('i', { style: 'border:2px solid var(--ink)' }), 'bordo pieno = misurato'), h('span', {}, h('i', { style: 'border:2px dashed var(--ink)' }), 'tratteggiato = ipotesi'), h('span', {}, h('i', { style: 'background:var(--warn)' }), 'corridoio 3 m'), h('span', {}, h('i', { style: 'border:2px dotted var(--info)' }), 'vano finito'))),
      h('div', {}, pannello, verifiche, stati, geomCard)), confronto,
    h('p', { class: 'aiuto' }, ui.vista === '3d' ? 'Vista 3D: trascina per ruotare, tocca un modulo per selezionarlo e modificarlo nel pannello. Lo spostamento si fa in pianta. Sono parallelepipedi di ingombro, non il modello del veicolo.' : 'Per controllare le altezze passa alla Vista 3D.'));
}

function pianta(ly, g, tutti, bad, fin, st) {
  const L = num(g.lung), W = num(g.larg);
  if (L === null || W === null) return avviso('Inserisci lunghezza e larghezza del vano per disegnare la pianta.');
  const aperti = new Set(st ? st.aperti : []);
  // Coordinate schermo: X = y del veicolo (sinistra→destra), Y = x del veicolo (sedili→portellone).
  const svg = h('svg', { class: 'pianta', style: `width:${ui.zoom * 100}%`, viewBox: `${-M} ${-CAB - M} ${W + 2 * M} ${CAB + L + RETRO + 2 * M}`, role: 'img', 'aria-label': 'Pianta del vano di carico' });
  const txt = (x, y, t, o = {}) => h('text', { x, y, 'text-anchor': 'middle', 'font-size': 50, ...o }, t);
  const quota = (x1, y1, x2, y2, t) => { const v = x1 === x2; return h('g', { class: 'quota' }, h('line', { x1, y1, x2, y2 }), h('line', v ? { x1: x1 - 22, y1, x2: x1 + 22, y2: y1 } : { x1, y1: y1 - 22, x2: x1, y2: y1 + 22 }), h('line', v ? { x1: x2 - 22, y1: y2, x2: x2 + 22, y2 } : { x1: x2, y1: y2 - 22, x2, y2: y2 + 22 }),
    v ? txt(x1 - 26, (y1 + y2) / 2, t, { transform: `rotate(-90 ${x1 - 26} ${(y1 + y2) / 2})` }) : txt((x1 + x2) / 2, y1 - 22, t)); };
  svg.append(h('rect', { class: 'cab', x: 0, y: -CAB, width: W, height: CAB, rx: 60 }), txt(W / 2, -CAB / 2 + 25, 'CABINA ▲ avanti', { 'font-size': 70, 'font-weight': 700 }),
    h('rect', { class: 'vano', x: 0, y: 0, width: W, height: L }),
    h('line', { x1: 0, y1: L, x2: W, y2: L, stroke: 'var(--acc)', 'stroke-width': 26 }), txt(W / 2, L + RETRO - 20, 'esterno — portellone', { 'font-size': 62, opacity: .6 }),
    quota(0, -CAB - 70, W, -CAB - 70, `${n(W, 0)} lamiera` + (fin ? ` · ${n(fin.larg, 0)} finito` : '')), quota(-90, 0, -90, L, `${n(L, 0)} lamiera` + (fin ? ` · ${n(fin.lung, 0)} finito` : '')));
  if (fin && fin.y1 !== null) svg.append(h('rect', { class: 'finito', x: fin.y0, y: 0, width: fin.y1 - fin.y0, height: fin.x1 }));
  for (const p of g.passaruota || []) if ([p.x, p.y, p.lx, p.ly].every((v) => num(v) !== null)) svg.append(h('rect', { class: 'arco', x: p.y, y: p.x, width: p.ly, height: p.lx, rx: 30 }));
  const c = g.corridoio;
  if (num(c.y) !== null && num(c.ly) !== null) svg.append(h('rect', { class: 'corr', x: c.y, y: -CAB, width: c.ly, height: CAB + L }), txt(c.y + c.ly / 2, L * 0.5, 'corridoio montanti 3 m', { transform: `rotate(-90 ${c.y + c.ly / 2} ${L * 0.5})`, opacity: .8 }));
  const mm = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
  let nMob = 0;
  tutti.forEach((m) => {
    if ([m.x, m.y, m.lx, m.ly].some((v) => num(v) === null)) return;
    const a = ingombroAperto(m), siApre = a.lx !== m.lx || a.ly !== m.ly, aperto = aperti.has(m.id);
    const grp = h('g', { class: 'mod' + (bad.has(m.id) ? ' bad' : '') + (m.id === ui.sel ? ' sel' : '') + ((m.stato || 'ipotesi') === 'misurato' ? '' : ' ipo') },
      siApre && (!st || aperto) ? h('rect', { class: 'aperto' + (aperto ? ' attivo' : ''), x: a.y, y: a.x, width: a.ly, height: a.lx, fill: m.colore, stroke: m.colore }) : null,
      h('rect', { class: 'chiuso', x: m.y, y: m.x, width: m.ly, height: m.lx, fill: m.colore, rx: 20 }),
      h('text', { x: m.y + m.ly / 2, y: m.x + m.lx / 2 + 30, 'text-anchor': 'middle', 'font-size': 90 }, m.fisso ? 'F' : ++nMob));
    if (m.id === ui.sel) { // quote del modulo selezionato: dimensioni e distanze dalle pareti di lamiera
      grp.append(quota(m.y, m.x - 40, m.y + m.ly, m.x - 40, n(m.ly, 0)), quota(m.y + m.ly + 60, m.x, m.y + m.ly + 60, m.x + m.lx, n(m.lx, 0)));
      if (m.y > 0) grp.append(quota(0, m.x + m.lx / 2, m.y, m.x + m.lx / 2, n(m.y, 0)));
      if (m.y + m.ly < W) grp.append(quota(m.y + m.ly, m.x + m.lx / 2 + 90, W, m.x + m.lx / 2 + 90, n(W - m.y - m.ly, 0)));
      if (m.x > 0) grp.append(quota(m.y + m.ly / 2, 0, m.y + m.ly / 2, m.x, n(m.x, 0)));
      if (m.x + m.lx < L) grp.append(quota(m.y + m.ly / 2 + 70, m.x + m.lx, m.y + m.ly / 2 + 70, L, n(L - m.x - m.lx, 0)));
    }
    grp.addEventListener('pointerdown', (ev) => {
      ev.preventDefault(); grp.setPointerCapture(ev.pointerId);
      const p0 = mm(ev); let dx = 0, dy = 0;
      const move = (e) => { const p = mm(e); dy = Math.round((p.x - p0.x) / 10) * 10; dx = Math.round((p.y - p0.y) / 10) * 10; grp.setAttribute('transform', `translate(${dy},${dx})`); };
      const up = () => { grp.removeEventListener('pointermove', move); grp.removeEventListener('pointerup', up); grp.removeEventListener('pointercancel', up);
        ui.sel = m.id;
        if (dx || dy) store.update((s) => { const t = dove(s, ly.id, m.id).m; t.x += dx; t.y += dy; }); else store.ridisegna(); };
      grp.addEventListener('pointermove', move); grp.addEventListener('pointerup', up); grp.addEventListener('pointercancel', up);
    });
    svg.append(grp);
  });
  return svg;
}

// Pannello di modifica a lato: ogni campo salva appena cambia (Annulla disponibile).
function pannelloModulo(ly, trovato) {
  const { m, fisso } = trovato;
  const set = (k, v) => store.update((s) => { dove(s, ly.id, m.id).m[k] = v; });
  const campo = (k, label, tipo = 'number', extra = {}) => {
    const el = tipo === 'select' ? h('select', {}, STATI.map(([v, t]) => h('option', { value: v }, t))) : tipo === 'textarea' ? h('textarea', { rows: 2 }) : h('input', { type: tipo, step: 'any', inputmode: tipo === 'number' ? 'decimal' : null });
    el.value = m[k] ?? (tipo === 'select' ? 'ipotesi' : ''); el.addEventListener('change', () => set(k, tipo === 'number' ? (el.value.trim() === '' ? null : Number(el.value)) : el.value));
    return h('label', { class: 'campo', style: extra.largo ? 'grid-column:1/-1' : null }, h('span', {}, label), el);
  };
  return card(null, h('div', { class: 'riga' }, h('span', { class: 'sw', style: 'background:' + m.colore }, fisso ? 'F' : '•'), h('h2', { class: 'cresce', style: 'margin:0' }, m.nome), fisso ? chip('base fissa', 'acc') : chip('mobile sostituibile'), btn('Chiudi', () => { ui.sel = null; store.ridisegna(); }, 'mini')),
    h('div', { class: 'griglia-campi' }, campo('nome', 'Nome', 'text', { largo: true }),
      campo('x', 'Dai sedili [mm]'), campo('y', 'Dal fianco sinistro [mm]'), campo('lx', 'Lunghezza [mm]'), campo('ly', 'Larghezza [mm]'), campo('h', 'Altezza [mm]'), campo('z', 'Quota dal pavimento finito [mm]'),
      campo('apreX', 'Aperto: verso il portellone [mm]'), campo('apreY', 'Aperto: di lato (+dx, −sx) [mm]'), campo('massa', 'Massa carico [kg]'), campo('colore', 'Colore', 'color'),
      campo('stato', 'Attendibilità delle misure', 'select', { largo: true }), campo('nota', 'Note', 'textarea', { largo: true })),
    h('div', { class: 'barra-azioni no-print' },
      btn(fisso ? 'Sposta fra i mobili di questa configurazione' : 'Rendi elemento fisso (tutte le configurazioni)', () => store.update((s) => { const t = dove(s, ly.id, m.id); t.arr.splice(t.arr.indexOf(t.m), 1); (fisso ? s.layout.find((l) => l.id === ly.id).moduli : s.baseFissa).push(t.m); }), 'mini'),
      btn('Elimina', () => { if (confirm('Eliminare il modulo?')) { ui.sel = null; store.update((s) => { const t = dove(s, ly.id, m.id); t.arr.splice(t.arr.indexOf(t.m), 1); s.layout.forEach((l) => (l.stati || []).forEach((q) => { q.aperti = q.aperti.filter((a) => a !== m.id); })); }); } }, 'mini danger')));
}

function nuovoModulo(ly, fisso) {
  const m = { id: uid(fisso ? 'bf' : 'md'), nome: fisso ? 'Nuovo elemento fisso' : 'Nuovo mobile', x: 100, y: 500, lx: 600, ly: 400, z: 0, h: 500, massa: null, apreX: 0, apreY: 0, colore: fisso ? '#8a4a1f' : '#33658a', stato: 'ipotesi', nota: '' };
  ui.sel = m.id; store.update((s) => { (fisso ? s.baseFissa : s.layout.find((l) => l.id === ly.id).moduli).push(m); });
}
function editLayout(ly) {
  openForm({ titolo: ly ? 'Configurazione' : 'Nuova configurazione', valore: ly || { id: uid('ly'), modo: 'lavoro', moduli: [], nota: '', stati: [{ id: 'viaggio', nome: 'Viaggio (tutto chiuso)', aperti: [] }] },
    campi: [{ k: 'nome', label: 'Nome', richiesto: true }, { k: 'modo', label: 'Uso', tipo: 'select', opzioni: ['lavoro', 'camper', 'prova'] }, { k: 'nota', label: 'Note', tipo: 'textarea' }],
    onSave: (v) => store.update((s) => { const i = s.layout.findIndex((x) => x.id === v.id); if (i < 0) s.layout.push(v); else s.layout[i] = v; ui.id = v.id; }),
    onDelete: ly ? () => store.update((s) => { s.layout = s.layout.filter((x) => x.id !== ly.id); s.progetti.forEach((p) => { if (p.layoutLavoroId === ly.id) p.layoutLavoroId = null; if (p.layoutCamperId === ly.id) p.layoutCamperId = null; }); ui.id = null; }) : null });
}
function editGeom() {
  const g = store.s.geom, p = g.passaruota;
  openForm({ titolo: 'Geometria del vano (lamiera nuda)', valore: { lung: g.lung, larg: g.larg, alt: g.alt, cy: g.corridoio.y, cly: g.corridoio.ly, ch: g.corridoio.h, px: p[0]?.x, plx: p[0]?.lx, ply: p[0]?.ly, ph: p[0]?.h, stato: g.stato, nota: g.nota },
    campi: [{ k: 'lung', label: 'Lunghezza utile', tipo: 'number', unita: 'mm' }, { k: 'larg', label: 'Larghezza interna', tipo: 'number', unita: 'mm' }, { k: 'alt', label: 'Altezza interna', tipo: 'number', unita: 'mm' },
      { k: 'cy', label: 'Corridoio: bordo sinistro dal fianco sinistro', tipo: 'number', unita: 'mm' }, { k: 'cly', label: 'Corridoio: larghezza', tipo: 'number', unita: 'mm' }, { k: 'ch', label: 'Corridoio: altezza libera', tipo: 'number', unita: 'mm' },
      { k: 'px', label: 'Passaruota: distanza dai sedili', tipo: 'number', unita: 'mm' }, { k: 'plx', label: 'Passaruota: lunghezza', tipo: 'number', unita: 'mm' }, { k: 'ply', label: 'Passaruota: sporgenza dal fianco', tipo: 'number', unita: 'mm' }, { k: 'ph', label: 'Passaruota: altezza', tipo: 'number', unita: 'mm' },
      { k: 'stato', label: 'Attendibilità', tipo: 'stato' }, { k: 'nota', label: 'Note', tipo: 'textarea' }],
    onSave: (v) => store.update((s) => { const G = s.geom; Object.assign(G, { lung: v.lung, larg: v.larg, alt: v.alt, stato: v.stato, nota: v.nota }); Object.assign(G.corridoio, { y: v.cy, ly: v.cly, h: v.ch });
      G.passaruota = [{ nome: 'sinistro', x: v.px, y: 0, lx: v.plx, ly: v.ply, h: v.ph }, { nome: 'destro', x: v.px, y: v.larg !== null && v.ply !== null ? v.larg - v.ply : null, lx: v.plx, ly: v.ply, h: v.ph }]; }) });
}
