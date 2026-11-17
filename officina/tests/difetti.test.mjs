// Riproduzione dei difetti segnalati nella revisione (novembre 2026) e prove di non regressione.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../js/calc.js';

const SIS = { capacita_Wh: 1000, dod: 1, effInv: 1, effDC: 1, riservaPct: 0, solare_Wp: 0, caricaVeicolo_W: 0, caricaRete_W: 0 };
test('difetto 1a: utenze sconosciute → mai verdetto positivo definitivo, anche con surplus', () => {
  const p = { oreSole: 5, carichi: [{ nome: 'x', W: 10, ore: 10, via: 'dc' }, { nome: 'ignoto', W: null, ore: 2, via: 'dc' }] };
  const r = C.energia(p, { ...SIS, solare_Wp: 100, rendSolare: 1 });
  assert.equal(r.limiteSuperiore, true); assert.equal(r.verdetto(48), 'non_definitivo');
  assert.equal(C.simulaEnergia(p, { ...SIS, solare_Wp: 100, rendSolare: 1, maxUscita_W: 500 }, 48).verdetto, 'non_definitivo');
});
test('difetto 1b: capacità zero con surplus medio → autonomia 0, obiettivo NON raggiunto', () => {
  const p = { oreSole: 5, carichi: [{ nome: 'x', W: 10, ore: 10, via: 'dc' }] };
  const r = C.energia(p, { ...SIS, capacita_Wh: 0, solare_Wp: 100, rendSolare: 1 });
  assert.equal(r.autonomia_h, 0); assert.equal(r.verdetto(48), 'non_raggiunto');
  const s = C.simulaEnergia(p, { ...SIS, capacita_Wh: 0, solare_Wp: 100, rendSolare: 1, maxUscita_W: 500 }, 48);
  assert.equal(s.verdetto, 'non_raggiunto'); assert.ok(s.nonServita_Wh > 0);
});
test('difetto 2: acquistato 1, necessari 3 → restano 2 da comprare', () => {
  const s = { zone: [{ id: 'z', nome: 'Z', area_m2: 3 }], scenariStrati: [{ id: 'a', attivo: true, sfridoPct: 0, zone: { z: [{ mat: 'm', cop: 100 }] } }], inventario: [{ id: 'm', nome: 'm', disp: 'acquistato', spesaId: 's1', qta: 1, areaUnit_m2: 1, costoUnit: 10 }] };
  const r = C.pianoAcquisti(s); assert.equal(r.length, 1); assert.equal(r[0].qta, 2); assert.equal(r[0].costo, 20);
  s.inventario[0].qta = 3; assert.equal(C.pianoAcquisti(s).length, 0);
});
const G = { lung: 2000, larg: 1600, alt: 1300, passaruota: [], corridoio: { y: null, ly: null } };
const M = (o) => ({ id: o.nome, x: 0, y: 0, lx: 500, ly: 400, z: 0, h: 500, ...o });
test('difetto 3: collisione solo con ENTRAMBI i moduli aperti', () => {
  const ly = { moduli: [M({ nome: 'A', y: 0, apreY: 300 }), M({ nome: 'B', y: 1000, apreY: -400 })] }; // A aperto 0–700, B aperto 600–1400; chiusi 0–400 e 1000–1400
  const p = C.verificaLayout(ly, G);
  assert.ok(p.some((x) => x.tipo === 'aperto' && x.ids.includes('A') && x.ids.includes('B')), 'avviso mancante');
  const st = C.verificaLayout(ly, G, { stato: { nome: 'tutto aperto', aperti: ['A', 'B'] } });
  assert.ok(st.some((x) => x.livello === 'errore' && x.tipo === 'sovrapposizione'));
  assert.equal(C.verificaLayout(ly, G, { stato: { nome: 'solo A', aperti: ['A'] } }).filter((x) => x.livello === 'errore').length, 0);
});
test('difetto 3b: due estraibili che si scontrano FUORI dal portellone', () => {
  const ly = { moduli: [M({ nome: 'A', x: 1500, y: 0, ly: 500, apreX: 900 }), M({ nome: 'B', x: 900, y: 300, ly: 500, apreX: 1500 })] };
  assert.ok(C.verificaLayout(ly, G, { stato: { nome: 's', aperti: ['A', 'B'] } }).some((x) => x.tipo === 'sovrapposizione'));
});
