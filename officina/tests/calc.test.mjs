// Prove dei calcoli: `npm test` (oppure `node --test tests/`). Nessuna dipendenza.
import test from 'node:test';
import assert from 'node:assert/strict';
import { seed } from '../js/seed.js';
import * as C from '../js/calc.js';
import { validaBackup } from '../js/store.js';

const vicino = (a, b, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol, `${a} ≠ ${b}`);

test('budget iniziale: 5.000 spesi, 5.000 residui', () => {
  const b = C.budget(seed());
  assert.equal(b.sostenuto, 5000); assert.equal(b.residuo, 5000); assert.equal(b.quotaResidua, 1000);
});
test('nuova spesa di 200 €: residuo 4.800, nessun doppio conteggio', () => {
  const s = seed(); s.spese.push({ id: 'x', importo: 200, tipo: 'sostenuta', inQuota: false });
  const b = C.budget(s); assert.equal(b.sostenuto, 5200); assert.equal(b.residuo, 4800);
});
test('ricevuta da 200 € che dettaglia i 1.000 già spesi: il totale NON cambia', () => {
  const s = seed(); s.spese.push({ id: 'x', importo: 200, tipo: 'sostenuta', inQuota: true });
  const b = C.budget(s); assert.equal(b.sostenuto, 5000); assert.equal(b.quotaResidua, 800);
});
test('ricevute in quota oltre i 1.000 €: conta il valore reale e avvisa', () => {
  const s = seed(); s.spese.push({ id: 'x', importo: 1300, tipo: 'sostenuta', inQuota: true });
  const b = C.budget(s); assert.equal(b.sostenuto, 5300); assert.ok(b.avvisi.length);
});
test('preventivi e stime non riducono il residuo reale', () => {
  const s = seed(); s.spese.push({ id: 'p', importo: 600, tipo: 'preventivo' }, { id: 'e', importo: 100, tipo: 'stima' });
  const b = C.budget(s); assert.equal(b.residuo, 5000); assert.equal(b.preventivi, 600); assert.equal(b.stime, 100); assert.ok(b.previsto >= 700);
});
test('acquisto dal carrello: una spesa, articolo non più nel previsto', () => {
  const s = seed(); const it = s.inventario.find((i) => i.id === 'm_butile'); it.costoUnit = 50;
  let b = C.budget(s); const prima = b.acquisti; assert.ok(prima >= 100);
  s.spese.push({ id: 'sp', importo: 100, tipo: 'sostenuta', inQuota: false }); it.disp = 'acquistato'; it.spesaId = 'sp';
  b = C.budget(s); assert.equal(b.sostenuto, 5100); assert.equal(b.acquisti, prima - 100);
});
test('cambio di scenario attivo: cambia il previsto, non lo speso', () => {
  const s = seed(); s.inventario.find((i) => i.id === 'm_elast19').costoUnit = 10;
  const a = C.budget(s); s.scenariStrati.forEach((x) => { x.attivo = x.id === 'sc_c'; }); const c = C.budget(s);
  assert.equal(a.sostenuto, c.sostenuto); assert.notEqual(a.acquisti, c.acquisti);
});
test('articolo in carrello E richiesto dallo scenario: contato una volta (il massimo)', () => {
  const s = seed(); const it = s.inventario.find((i) => i.id === 'm_butile'); it.costoUnit = 10;
  const r = C.pianoAcquisti(s).find((x) => x.id === 'm_butile'); assert.equal(r.qta, Math.max(r.daCarrello, r.daScenario)); assert.equal(r.costo, r.qta * 10);
});

const G = { lung: 2000, larg: 1600, alt: 1300, passaruota: [], corridoio: { y: 650, ly: 300, h: 150 } };
const M = (o) => ({ id: o.nome, x: 0, y: 0, lx: 500, ly: 400, z: 0, h: 500, ...o });
test('geometria di prova: modulo che invade il corridoio riservato', () => {
  const p = C.verificaLayout({ moduli: [M({ nome: 'Cassa', y: 700 })] }, G);
  assert.ok(p.some((x) => x.tipo === 'corridoio' && x.livello === 'errore'));
});
test('modulo accanto al corridoio (a filo) o sopra la sua altezza: nessun errore', () => {
  assert.equal(C.verificaLayout({ moduli: [M({ nome: 'A', y: 250 })] }, G).length, 0); // 250+400 = 650 = bordo
  assert.equal(C.verificaLayout({ moduli: [M({ nome: 'Ponte', y: 500, z: 150 })] }, G).length, 0);
});
test('fuori dal vano, sovrapposizione, altezza, dati mancanti', () => {
  const p = C.verificaLayout({ moduli: [M({ nome: 'A', x: 1800 }), M({ nome: 'B', y: 1000 }), M({ nome: 'C', y: 1100 }), M({ nome: 'D', y: 1200, x: 600, h: 1400 }), M({ nome: 'E', lx: null })] }, G);
  const tipi = p.map((x) => x.tipo);
  ['fuori', 'sovrapposizione', 'altezza', 'dati'].forEach((t) => assert.ok(tipi.includes(t), t));
});
test('ingombro aperto: interferenza segnalata come avviso; oltre il portellone nessun conflitto', () => {
  const p = C.verificaLayout({ moduli: [M({ nome: 'Letto', apreY: 500 }), M({ nome: 'Cucina', y: 800, x: 0 }), M({ nome: 'Base', x: 1500, y: 1000, apreX: 900 })] }, { ...G, corridoio: { y: null, ly: null } });
  assert.ok(p.some((x) => x.tipo === 'aperto' && x.ids.includes('Letto') && x.ids.includes('Cucina')));
  assert.ok(!p.some((x) => x.livello === 'errore'));
});
test('layout iniziali: nessun errore, corridoio libero', () => {
  const s = seed(); for (const l of s.layout) assert.equal(C.verificaLayout(l, s.geom).filter((x) => x.livello === 'errore').length, 0, l.nome);
});

test('stratigrafia: R = spessore/λ; copertura parziale non conta; sconosciuto segnalato', () => {
  const mats = { a: { nome: 'a', spessore_mm: 20, lambda: 0.04, massa_kg_m2: 1 }, b: { nome: 'b', spessore_mm: 5, lambda: null, massa_kg_m2: null }, c: { nome: 'c', spessore_mm: 2, noTermico: true, massa_kg_m2: 4 } };
  const r = C.stratigrafia([{ mat: 'a', cop: 100 }, { mat: 'b', cop: 100 }, { mat: 'c', cop: 50 }], mats);
  vicino(r.R, 0.5); assert.equal(r.spessore_mm, 27); vicino(r.massa_kg_m2, 3); assert.deepEqual(r.Rignoti, ['b']); assert.deepEqual(r.massaIgnota, ['b']);
});
test('fabbisogni: arrotonda alle confezioni, zona senza superficie esclusa e dichiarata', () => {
  const s = { zone: [{ id: 'z1', nome: 'Z1', area_m2: 10 }, { id: 'z2', nome: 'Z2', area_m2: null }], inventario: [{ id: 'm', nome: 'm', disp: 'carrello', qta: 1, areaUnit_m2: 4.8, costoUnit: 30 }] };
  const f = C.fabbisogni({ sfridoPct: 10, zone: { z1: [{ mat: 'm', cop: 100 }], z2: [{ mat: 'm', cop: 100 }] } }, s);
  assert.equal(f.righe[0].necessarie, 3); assert.equal(f.righe[0].mancanti, 3); assert.equal(f.righe[0].costo, 90); assert.deepEqual(f.zoneSenzaArea, ['Z2']);
});

const SIS = { capacita_Wh: 1000, dod: 1, effInv: 0.5, effDC: 1, riservaPct: 0, solare_Wp: 0, caricaVeicolo_W: 0, caricaRete_W: 0 };
test('energia: 100 W per 5 h = 500 Wh/g → 48 h con 1000 Wh', () => {
  const r = C.energia({ carichi: [{ nome: 'x', W: 100, ore: 5, duty: 100, via: 'dc' }] }, SIS);
  assert.equal(r.consumo, 500); assert.equal(r.autonomia_h, 48); assert.equal(r.capacitaPer(72), 1500);
});
test('energia: inverter al 50% raddoppia; ciclo 50% dimezza; riserva e scarica riducono', () => {
  assert.equal(C.energia({ carichi: [{ nome: 'x', W: 100, ore: 5, duty: 50, via: 'ac' }] }, SIS).consumo, 500);
  vicino(C.energia({ carichi: [{ nome: 'x', W: 100, ore: 5, via: 'dc' }] }, { ...SIS, dod: 0.8, riservaPct: 50 }).utilizzabile, 400);
});
test('energia: ricarica ≥ consumo → autonomia illimitata; potenza sconosciuta → esclusa e dichiarata', () => {
  const r = C.energia({ oreSole: 5, carichi: [{ nome: 'x', W: 10, ore: 10, via: 'dc' }, { nome: 'ignoto', W: null, ore: 2, via: 'dc' }] }, { ...SIS, solare_Wp: 100, rendSolare: 1 });
  assert.equal(r.autonomia_h, null); assert.deepEqual(r.ignoti, ['ignoto']); assert.equal(r.completo, false);
});
test('energia: capacità sconosciuta → autonomia non determinabile (null), non zero', () => {
  assert.equal(C.energia({ carichi: [{ nome: 'x', W: 10, ore: 1, via: 'dc' }] }, { ...SIS, capacita_Wh: null }).autonomia_h, null);
});

test('acqua: 2 persone × 3 l + 4 l = 10 l/g → 20 l durano 2 giorni; grigie solo dalle voci segnate', () => {
  const r = C.acqua({ persone: 2, acqua: [{ nome: 'bere', litri: 3, perPersona: true, grigia: false, serb: 'pulita' }, { nome: 'stoviglie', litri: 4, grigia: true, serb: 'pulita' }, { nome: '?', litri: null, serb: 'pulita' }] }, { pulita_l: 20, grigie_l: 20, lavoro_l: null });
  assert.equal(r.giorniPulita, 2); assert.equal(r.giorniGrigie, 5); assert.equal(r.giorniLavoro, null); assert.deepEqual(r.ignoti, ['?']);
});

const ST = (area, strati, extra = {}) => ({ zone: [{ id: 'z', nome: 'Z', area_m2: area, stato: 'misurato' }], inventario: [{ id: 'i', nome: 'iso', spessore_mm: 33.2, lambda: 0.04 }], termico: { vetri_m2: 0, Uvetro: 5.8, ponteMin: 1, ponteMax: 2, wattPersona: 80, ...extra } });
test('termico: 10 m², R strati 0,83 → U = 1 W/m²K → 200 W a ΔT 20, 400 W con ponti ×2', () => {
  const r = C.termico({ zone: { z: [{ mat: 'i', cop: 100 }] } }, ST(10), { Tint: 20, Text: 0, portata_m3h: 0, persone: 0 });
  vicino(r.H, 10, 1e-9); vicino(r.P_min, 200, 1e-6); vicino(r.P_max, 400, 1e-6);
});
test('termico: ventilazione 0,33·q·ΔT e apporti delle persone', () => {
  const r = C.termico({ zone: { z: [{ mat: 'i', cop: 100 }] } }, ST(10), { Tint: 20, Text: 0, portata_m3h: 30, persone: 1 });
  vicino(r.P_min, 200 + 0.33 * 30 * 20 - 80, 1e-6);
});
test('termico: lamiera nuda U ≈ 5,88; superficie mancante → non determinabile; estate → nessuna potenza inventata', () => {
  vicino(C.termico({ zone: {} }, ST(1), { Tint: 20, Text: 19, portata_m3h: 0, persone: 0 }).H, 1 / 0.17, 1e-9);
  const nd = C.termico({ zone: {} }, ST(null), { Tint: 20, Text: 0, portata_m3h: 0, persone: 0 }); assert.equal(nd.determinabile, false); assert.ok(nd.motivi.length);
  const e = C.termico({ zone: {} }, ST(1), { Tint: 24, Text: 32, portata_m3h: 0, persone: 0 }); assert.equal(e.estate, true); assert.equal(e.P_max, null);
});
test('termico sui dati iniziali: intervallo plausibile, dichiarato su ipotesi; una superficie mancante lo rende non determinabile', () => {
  const s = seed(); const r = C.termico(s.scenariStrati[0], s, s.energia.profili[1].clima);
  assert.equal(r.determinabile, true); assert.ok(r.P_min > 100 && r.P_max < 5000 && r.P_min < r.P_max); assert.ok(r.dettagli.every((d) => d.ipotesi));
  s.zone[0].area_m2 = null; assert.equal(C.termico(s.scenariStrati[0], s, s.energia.profili[1].clima).determinabile, false);
});

test('carichi: massa sconosciuta non vale zero', () => {
  const r = C.carichi({ carichi: [{ nome: 'a', modo: 'lavoro', massa_kg: 10, qta: 2 }, { nome: 'b', modo: 'entrambi', massa_kg: null }, { nome: 'c', modo: 'camper', massa_kg: 99 }] }, 'lavoro');
  assert.equal(r.nota, 20); assert.deepEqual(r.ignoti, ['b']);
});
test('importazione carichi: CSV valido, virgola decimale, righe sbagliate segnalate', () => {
  const r = C.parseCarichi('nome;modo;massa_kg;qta\nTrapano;lavoro;6,5;1\n;lavoro;3;1\nSacco;boh;abc;0');
  assert.equal(r.righe.length, 2); assert.equal(r.righe[0].massa_kg, 6.5); assert.equal(r.righe[1].massa_kg, null); assert.equal(r.righe[1].modo, 'entrambi'); assert.equal(r.righe[1].qta, 1); assert.equal(r.errori.length, 3);
});
test('importazione carichi: file non validi non lanciano eccezioni', () => {
  for (const t of ['', '{rotto', 'a,b,c\n1,2,3', '42', '{"x":1}', '[1,2]']) { const r = C.parseCarichi(t); assert.equal(r.righe.length, 0, t); assert.ok(r.errori.length, t); }
  assert.equal(C.parseCarichi('[{"nome":"Tanica","massa_kg":20}]').righe.length, 1);
});
test('backup: file estranei o danneggiati rifiutati con messaggio', () => {
  for (const o of [null, 5, {}, { app: 'altro' }, { app: 'vito-officina' }, { app: 'vito-officina', state: { lavori: [] } }]) assert.throws(() => validaBackup(o));
  const s = seed(); assert.ok(validaBackup({ app: 'vito-officina', state: s })); assert.throws(() => validaBackup({ app: 'vito-officina', state: { ...s, schema: 99 } }));
});
test('dati iniziali: riferimenti interni coerenti', () => {
  const s = seed(); const ids = (a) => new Set(a.map((x) => x.id));
  const inv = ids(s.inventario), zone = ids(s.zone), lav = ids(s.lavori), fonti = ids(s.fonti), prob = ids(s.problemi);
  for (const sc of s.scenariStrati) for (const [z, st] of Object.entries(sc.zone)) { assert.ok(zone.has(z), z); st.forEach((l) => assert.ok(inv.has(l.mat), l.mat)); }
  for (const l of s.lavori) { l.dipende.forEach((d) => assert.ok(lav.has(d), d)); l.fonti.forEach((f) => assert.ok(fonti.has(f), f)); l.problemi.forEach((p) => assert.ok(prob.has(p), p)); }
  assert.equal(s.scenariStrati.filter((x) => x.attivo).length, 1);
});

// ---- ricerca nel testo dei PDF ----
import { cercaPagine as _cercaPagine } from '../js/calc.js';
test('cercaPagine: trova la pagina giusta, senza badare ad accenti e maiuscole', () => {
  const pagine = ['Indice generale', 'Capacità del serbatoio e\npressione   degli pneumatici', '', 'Pressione olio'];
  const r = _cercaPagine(pagine, 'CAPACITA serbatoio');
  assert.deepEqual(r.risultati.map((x) => x.pagina), [2]);
  assert.match(r.risultati[0].brano, /Capacità del serbatoio e pressione degli pneumatici/);
  assert.deepEqual(_cercaPagine(pagine, 'pressione').risultati.map((x) => x.pagina), [2, 4]);
});
test('cercaPagine: tutte le parole devono stare nella stessa pagina; ricerca vuota = nessun risultato', () => {
  const pagine = ['olio motore', 'filtro aria'];
  assert.equal(_cercaPagine(pagine, 'olio filtro').risultati.length, 0);
  assert.equal(_cercaPagine(pagine, ' ').risultati.length, 0);
  assert.equal(_cercaPagine(null, 'olio').risultati.length, 0);
});
test('cercaPagine: oltre il massimo conta le pagine restanti invece di perderle', () => {
  const r = _cercaPagine(Array(30).fill('coppia di serraggio'), 'coppia', 5);
  assert.equal(r.risultati.length, 5); assert.equal(r.altri, 25);
});
