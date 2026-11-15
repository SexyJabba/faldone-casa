// Rack: disposizione pubblica, motore di spostamento, resa grafica, compositore riservato (con dati di prova).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, model } from './helpers.mjs';
import { validateRack, overlaps, freeRuns, fits, nearestFit, place, checks, columnSummary, describeSlots, partsFor, powerOf } from '../../app/lib/rack.js';
import { rackSvg, rackGeometry, hitTest, interiorSvg, faceplate, FACE_KINDS, GEO } from '../../app/lib/rackviz.js';
import { proposalLayout, publicLayout } from '../../app/views/sala.js';
import { validateSala } from '../lib/riservato.mjs';

const { idx } = model();
// la disposizione del rack entra nel modello pubblicato: si legge da lì
const core = JSON.parse(readFileSync(join(ROOT, 'data/core.json'), 'utf8'));
const inv = JSON.parse(readFileSync(join(ROOT, 'data/inventory.json'), 'utf8'));

test('disposizione pubblica: valida, senza sovrapposizioni, solo elementi del modello', () => {
  assert.deepEqual(validateRack(core.rack, new Set(core.entities.map((e) => e.id))), []);
  assert.deepEqual(overlaps(core.rack.slots), []);
  for (const c of core.rack.columns) assert.deepEqual(freeRuns(core.rack.slots, c.id, c.u), [], `${c.id} è piena nello schema`);
  for (const s of core.rack.slots) assert.ok(FACE_KINDS.includes(s.face), s.id);
  assert.match(validateRack({ columns: [{ id: 'A', u: 4 }], slots: [{ id: 'x', col: 'A', from: 3, u: 4, entities: ['NON-ESISTE'] }] }, new Set()).join(), /esce dalla colonna.*inesistente/s);
});

test('motore: posto libero più vicino, spostamenti e rifiuti', () => {
  const slots = [{ id: 'a', col: 'A', from: 1, u: 4 }, { id: 'b', col: 'A', from: 7, u: 2 }];
  assert.deepEqual(freeRuns(slots, 'A', 10), [{ from: 5, u: 2 }, { from: 9, u: 2 }]);
  assert.equal(fits(slots, { id: 'c', u: 2 }, 'A', 5, 10), true);
  assert.equal(fits(slots, { id: 'c', u: 3 }, 'A', 5, 10), false);
  assert.equal(nearestFit(slots, { id: 'c', u: 2 }, 'A', 8, 10), 9);
  assert.equal(nearestFit(slots, { id: 'c', u: 3 }, 'A', 5, 10), null, 'tre unità di seguito non ci sono');
  assert.equal(place(slots, { id: 'c', u: 3 }, 'A', 5, 10), null);
  const moved = place(slots, { id: 'a', u: 4 }, 'A', 9, 12);
  assert.equal(moved.find((s) => s.id === 'a').from, 9, 'un pezzo si sposta ignorando se stesso');
  assert.deepEqual(overlaps(moved), []);
});

test('verifiche e riepilogo: solo sui dati presenti', () => {
  const cols = [{ id: 'A', name: 'A', u: 10 }];
  const ok = checks([{ id: 'p', col: 'A', from: 1, u: 2, kg: 10, peakW: 50 }, { id: 'q', col: 'A', from: 3, u: 2, kg: 5, peakW: 300 }], cols);
  assert.ok(ok.every((c) => c.level === 'ok'));
  const bad = checks([{ id: 'p', col: 'A', from: 1, u: 4, kg: 5, peakW: 300 }, { id: 'q', col: 'A', from: 3, u: 2, kg: 15, peakW: 80 }], cols, { pending: ['z'] });
  assert.ok(bad.some((c) => c.level === 'err' && /stesse unità/.test(c.text)));
  assert.ok(bad.some((c) => /pesanti vanno in basso/.test(c.text)));
  assert.ok(bad.some((c) => /Da collocare: z/.test(c.text)));
  assert.equal(columnSummary([{ id: 'p', col: 'A', from: 1, u: 2 }], cols)[0].peakW, null, 'senza dati di potenza non si somma');
  assert.deepEqual(columnSummary([], cols)[0], { id: 'A', name: 'A', u: 10, used: 0, free: 10, peakW: null, kg: null });
});

test('dal modello al disegno: accensione dal progetto, parti dall\'inventario senza quantità inventate', () => {
  const pieces = describeSlots(core.rack, idx.get, { invCat: (c) => inv.items.find((i) => i.code === c)?.category, relations: core.relations });
  assert.equal(pieces.length, core.rack.slots.length);
  assert.equal(pieces.find((p) => p.id === 'M2').power, 'on');
  assert.equal(pieces.find((p) => p.id === 'M3').power, 'stby', 'una macchina a richiesta non è accesa');
  assert.equal(pieces.find((p) => p.id === 'M3').tag, 'GPU');
  assert.equal(pieces.find((p) => p.face === 'shelf').items.length, 3);
  assert.deepEqual(pieces.find((p) => p.face === 'switch').lit.sort(), [0, 1, 2, 3], 'le quattro SFP+ assegnate');
  assert.equal(powerOf({ power: 'manual' }), 'stby');
  const usedBy = new Map();
  for (const e of core.entities) if (e.kind === 'node') for (const c of e.inventory || []) usedBy.set(c, [...(usedBy.get(c) || []), e.id]);
  const m4 = partsFor(idx.get('M4'), inv.items, usedBy);
  assert.equal(m4.filter((p) => p.cat === 'hdd').reduce((n, p) => n + p.n, 0), 12, 'i dischi di M4 sono quelli dell\'inventario');
  const m6 = partsFor(idx.get('M6'), inv.items, usedBy);
  assert.ok(m6.some((p) => p.shared && p.n === 1), 'una voce condivisa fra macchine non viene contata');
  assert.deepEqual(partsFor({ inventory: [] }, inv.items, usedBy), []);
});

test('resa grafica: un gruppo per pezzo, coordinate coerenti, niente misure finte', () => {
  const pieces = describeSlots(core.rack, idx.get, { relations: core.relations });
  const svg = rackSvg(core.rack.columns, pieces, { sel: 'M2' });
  assert.equal((svg.match(/class="rk-unit/g) || []).length, pieces.length);
  assert.equal((svg.match(/aria-pressed="true"/g) || []).length, 1);
  assert.ok(!/NaN|undefined/.test(svg));
  assert.equal((svg.match(/class="rk-in" aria-hidden="true"/g) || []).length, pieces.length, 'il disegno è nascosto ai lettori di schermo; il nome sta sul rettangolo attivo');
  assert.equal((svg.match(/class="rk-hit"/g) || []).length, pieces.length);
  assert.match(svg, /nessuna misura collegata/, 'il display della power station non mostra numeri');
  const geo = rackGeometry(core.rack.columns);
  const s = core.rack.slots[1], y = geo.yOf(s.col, s.from, s.u), c = geo.cols.find((k) => k.id === s.col);
  assert.deepEqual(hitTest(geo, c.innerX + 10, y + s.u * GEO.U), { col: s.col, u: s.from });
  assert.equal(hitTest(geo, -500, 0), null);
  for (const f of FACE_KINDS) assert.ok(!/NaN|undefined/.test(faceplate('t', { id: 'X', face: f, u: 2, items: [{ id: 'a', power: 'on' }], lit: [0], ports: 24 })), f);
  const { svg: inside, marks } = interiorSvg('M', [{ cat: 'mobo', label: 'scheda' }, { cat: 'hdd', label: 'dischi', n: 3 }, { cat: 'ram', label: 'ram', n: 4 }], [{ kind: 'net', label: 'x' }]);
  assert.equal(marks.length, 3);
  assert.match(inside, /stroke-dasharray="5 4"/, 'alimentatore tratteggiato se non registrato');
});

test('compositore riservato: proposta e schema pubblico (dati di prova)', () => {
  const sala = { colonne: [{ id: 'SX', nome: 'S', u_max: 18 }, { id: 'DX', nome: 'D', u_max: 23 }], ripiani: [{ id: 'RSX', col: 'SX' }],
    pezzi: [{ id: 'M2', ref: 'M2', tipo: 'rack', u: 4 }, { id: 'PS', ref: 'PS-RACK', tipo: 'terra', u: 7 }, { id: 'GS', ref: null, tipo: 'ripiano' }, { id: 'XX', ref: null, tipo: 'rack', u: 1 }],
    proposta: { col: { SX: 16 }, pos: { M2: ['DX', 1], GS: ['RSX', 0, 0] }, casi: { M2: 'C1' } } };
  assert.deepEqual(validateSala('p', sala, new Set(core.entities.map((e) => e.id))), []);
  const l = proposalLayout(sala);
  assert.deepEqual(l.cols, { SX: 16, DX: 23 });
  assert.deepEqual(l.pos, { M2: ['DX', 1] });
  assert.deepEqual(l.shelf, { GS: 'RSX' });
  const pub = publicLayout(sala, core.rack);
  assert.deepEqual(pub.pos.M2, ['SX', 9], 'M2 dove lo mette lo schema della 4.4');
  assert.deepEqual(pub.pos.PS, ['DX', 1]);
  assert.ok(!pub.pos.XX, 'un pezzo che lo schema non prevede resta da collocare');
  assert.match(validateSala('p', { ...sala, pezzi: [...sala.pezzi, { id: 'Z', ref: 'NON-ESISTE', tipo: 'rack', u: 1 }] }, new Set()).join(), /elemento inesistente/);
});
