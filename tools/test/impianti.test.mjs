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
  for (const i of d.impianti.slice(1)) { assert.equal(i.status.label, 'Da compilare'); assert.ok(!i.components); }
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
