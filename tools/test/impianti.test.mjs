// Impianti di casa: stato separato dalla baseline, riferimenti validi, VMC cercabile.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, model } from './helpers.mjs';
import { buildSearch, search } from '../../app/lib/search.js';

const d = JSON.parse(readFileSync(join(ROOT, 'content/impianti/impianti.json'), 'utf8'));
const { idx } = model();

test('nove impianti; la VMC è compilata come ipotesi, gli altri da compilare', () => {
  assert.deepEqual(d.impianti.map((i) => i.id), ['vmc', 'corrente', 'acqua', 'sensori', 'allarme', 'telecamere', 'lan', 'fotovoltaico', 'planimetria']);
  const vmc = d.impianti[0];
  assert.equal(vmc.status.decision, 'ipotesi');
  assert.match(vmc.status.label, /da rifinire/);
  for (const i of d.impianti.slice(1).filter((x) => x.id !== 'planimetria')) { assert.equal(i.status.label, 'Da compilare'); assert.ok(!i.components); }
  assert.ok(d.impianti.every((i) => i.status.decision !== 'approvata'));
});
test('la VMC non dichiara nulla di costruito o acquistato', () => {
  for (const c of d.impianti[0].components) assert.match(c.state, /da realizzare|da valutare/);
});
test('riferimenti, domande e decisione esistono nel modello', () => {
  for (const i of d.impianti) for (const e of (i.links || i.related).entities) assert.ok(idx.get(e), `${i.id}: ${e}`);
  for (const q of d.impianti[0].questions) assert.equal(idx.issues.get(q).status, 'aperta', q);
  assert.equal(idx.issues.get('Q-VMC-FINESTRA').status, 'risolta');
  assert.ok(d.impianti[0].places.some((p) => /studio/.test(p.label) && /sala server/.test(p.role)));
  assert.equal(idx.decisions.get('DEC-VMC').status, 'ipotesi');
});
test('«ventilazione» e «camera calda» trovano la VMC', () => {
  const SI = buildSearch(JSON.parse(readFileSync(join(ROOT, 'data/search.json'), 'utf8')), JSON.parse(readFileSync(join(ROOT, 'content/model/synonyms.json'), 'utf8')));
  assert.equal(search(SI, 'ventilazione').results[0].doc.id, 'IMP:vmc');
  assert.ok(search(SI, 'camera calda').results.slice(0, 3).some((r) => r.doc.id === 'IMP:vmc'));
});

test('planimetria: la scheda pubblica è solo un segnaposto riservato; lo schema si disegna da qualunque pianta', async () => {
  const { floorPlan, roomBox } = await import('../../app/lib/viz.js');
  const p = d.impianti.find((i) => i.id === 'planimetria');
  assert.equal(p.riservato, true);
  assert.equal(p.status.decision, null, 'una planimetria non è una decisione');
  assert.ok(!p.plan, 'le stanze stanno solo nell\'area riservata');
  // pianta di prova, inventata per il test: non è la casa
  const plan = { rooms: [
    { id: 'a', name: 'Stanza A', area: 12.5, hmin: 2.4, hmax: 2.7, x: 0, z: 0, w: 4, d: 3 },
    { id: 'b', name: 'Vano basso B', area: 3, hmin: 0.6, hmax: 1.2, x: 3, z: 0, w: 2, d: 3 },
    { id: 'c', name: 'C', area: 6, hmin: 2.4, hmax: 2.4, x: 0, z: 2.5, w: 4, d: 2 },
  ] };
  assert.deepEqual(roomBox(plan.rooms[0]), { x0: -2, x1: 2, z0: -1.5, z1: 1.5 });
  const svg = floorPlan(plan, { sel: 'a', count: (r) => (r.id === 'c' ? 12 : 0) });
  assert.equal((svg.match(/class="fp-room/g) || []).length, 3);
  assert.equal((svg.match(/aria-pressed="true"/g) || []).length, 1);
  assert.equal((svg.match(/class="fp-room low"/g) || []).length, 1, 'il vano sotto 1,50 m è marcato');
  assert.equal((svg.match(/class="fp-dev"/g) || []).length, 1);
  assert.match(svg, /12,50 m²/, 'la superficie è quella indicata, non ricalcolata dal rettangolo');
  assert.equal(floorPlan({ rooms: [] }), '');
});
