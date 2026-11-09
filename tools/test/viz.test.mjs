// Rappresentazioni grafiche: disegnano solo ciò che il modello contiene.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildIndex } from '../../app/lib/model.js';
import { simulate } from '../../app/lib/sim.js';
import { roadmapState } from '../../app/lib/roadmap.js';
import { egoData, egoGraph, phaseRail, phaseCounts, protectionMatrix, switchFace, quorumRing } from '../../app/lib/viz.js';

const core = JSON.parse(readFileSync(new URL('../../data/core.json', import.meta.url), 'utf8'));
const idx = buildIndex(core);

test('schema delle relazioni: solo relazioni dirette del modello, senza fonti e collaudi', () => {
  const { left, right } = egoData(idx, 'M2');
  const hosted = new Set(idx.in('M2', 'hosted_on').map((r) => r.fromId));
  for (const id of hosted) assert.ok(left.some((g) => g.e.id === id), `${id} gira su M2`);
  for (const g of [...left, ...right]) assert.ok(idx.get(g.e.id), 'ogni nodo è un elemento del modello');
  assert.ok(!right.some((g) => idx.cards.has(g.e.id)), 'le schede non sono nodi');
  const svg = egoGraph(idx, 'M2');
  assert.match(svg, /<svg/);
  assert.match(svg, /altri nell'elenco sotto/, 'oltre il limite i nodi sono dichiarati, non nascosti');
  assert.equal(egoGraph(idx, 'ELEMENTO-INESISTENTE'), '');
});

test('schema delle relazioni: il numero dichiarato corrisponde ai nodi', () => {
  for (const e of core.entities) {
    const { left, right } = egoData(idx, e.id);
    const svg = egoGraph(idx, e.id, { max: 99 });
    if (!left.length && !right.length) { assert.equal(svg, ''); continue; }
    assert.equal((svg.match(/class="vz-node/g) || []).length, left.length + right.length, e.id);
  }
});

test('binario delle fasi: una voce per fase, conteggi uguali alle attività', () => {
  const rs = roadmapState(core);
  const html = phaseRail(rs);
  assert.equal((html.match(/<li /g) || []).length, core.roadmap.phases.length);
  for (const p of rs.phases) assert.equal(Object.values(phaseCounts(p)).reduce((a, b) => a + b, 0), p.tasks.length, p.id);
  assert.ok(!/%/.test(html.replace(/style="[^"]*"/g, '')), 'nessuna percentuale di avanzamento');
});

test('matrice delle protezioni: una copia provata solo se il modello la dà collaudata', () => {
  const base = simulate(idx, {});
  const rows = core.entities.filter((e) => e.kind === 'dataset').map((d) => ({ dataset: d, copies: base.protection(d.id).copies }));
  const html = protectionMatrix(rows);
  const marks = (html.match(/class="mx mx-(ok|todo|off|aid|bad)" href/g) || []).length;
  assert.equal(marks, rows.reduce((n, r) => n + r.copies.length, 0), 'un segno per ogni copia');
  const proven = rows.reduce((n, r) => n + r.copies.filter((c) => c.readiness.level === 'collaudata').length, 0);
  assert.equal((html.match(/class="mx mx-ok" href/g) || []).length, proven);
});

test('frontale dello switch: porte documentate, nessuna assegnazione inventata', () => {
  const sw = idx.get('SW');
  const svg = switchFace({ name: sw.name, rj45: sw.facts.rj45.value, sfp: sw.facts.sfp.value, assigned: new Map([[49, { id: 'M2', label: 'x' }]]) });
  assert.equal((svg.match(/class="sw-rj"/g) || []).length, sw.facts.rj45.value);
  assert.equal((svg.match(/class="sw-sfp/g) || []).length, sw.facts.sfp.value);
  assert.equal((svg.match(/class="sw-sfp on"/g) || []).length, 1);
  assert.equal((svg.match(/>libera</g) || []).length, sw.facts.sfp.value - 1);
  assert.equal(switchFace({ name: 'x', rj45: null, sfp: null }), '', 'senza numeri documentati non si disegna');
});

test('anello del quorum: maggioranza calcolata dai votanti', () => {
  const voters = core.entities.filter((e) => e.kind === 'node' && e.vote);
  const svg = quorumRing(voters);
  assert.equal((svg.match(/class="q-node"/g) || []).length, voters.length);
  assert.match(svg, new RegExp(`>${Math.floor(voters.length / 2) + 1} su ${voters.length}<`));
  assert.equal(quorumRing(voters.slice(0, 2)), '');
});
