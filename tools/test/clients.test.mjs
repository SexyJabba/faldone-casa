// Postazioni e client: quali apparati, quale disegno, quali spaccati.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, model } from './helpers.mjs';
import { deviceSvg, deviceInterior, deviceKind, hasCutaway, CUTAWAY_SOURCE, KIND_LABEL } from '../../app/lib/deviceviz.js';
import { clientNodes } from '../../app/views/clients.js';

const { core, idx } = model();
const inv = JSON.parse(readFileSync(join(ROOT, 'data/inventory.json'), 'utf8'));

test('gli apparati mostrati sono macchine del modello con un luogo; niente cloud', () => {
  const nodes = clientNodes(core);
  assert.ok(nodes.length >= 8);
  for (const e of nodes) { assert.equal(e.kind, 'node'); assert.equal(idx.get(e.place)?.kind, 'place', e.id); assert.notEqual(e.place, 'P-CLOUD'); }
  for (const id of ['C1', 'C2', 'C3', 'C4', 'MP1', 'MP3', 'HP-AMICI', 'MICROTECH']) assert.ok(nodes.some((e) => e.id === id), id);
  assert.ok(!nodes.some((e) => /^M\d$/.test(e.id)), 'i server del rack stanno nella pagina del rack');
});

test('il tipo di disegno viene dal modello dichiarato', () => {
  assert.equal(deviceKind(idx.get('C2')), 'ultra');
  assert.equal(deviceKind(idx.get('HP-AMICI')), 't520');
  assert.equal(deviceKind(idx.get('S3')), 'wyse');
  assert.equal(deviceKind(idx.get('MP1')), 'macbook');
  assert.equal(deviceKind(idx.get('MP3')), 'laptop');
  assert.equal(deviceKind(idx.get('MICROTECH')), 'panel');
  assert.equal(deviceKind({ hardware: { platform: { value: 'Modello sconosciuto' } } }), null);
  assert.equal(deviceKind({}), null);
  for (const e of clientNodes(core)) { const svg = deviceSvg({ id: e.id, sub: e.title, kind: deviceKind(e), power: 'on' }); assert.ok(svg.includes(e.id) && !/NaN|undefined/.test(svg), e.id); assert.ok(KIND_LABEL[deviceKind(e)]); }
});

test('spaccato solo dove il Faldone ha una foto dell\'interno, con le etichette dai dati', () => {
  for (const [kind, code] of Object.entries(CUTAWAY_SOURCE)) assert.ok((inv.photos[code] || []).length, `${kind}: la foto di riferimento ${code} esiste`);
  assert.ok(hasCutaway('ultra') && hasCutaway('t520'));
  for (const k of ['wyse', 'laptop', 'macbook', 'panel', null]) { assert.equal(hasCutaway(k), false); assert.equal(deviceInterior(k, 'x'), null, `${k}: nessuno spaccato a memoria`); }
  const cut = deviceInterior('ultra', 'C2', { cpu: 'Processore di prova', ram: '8 GB · DDR4' });
  assert.ok(cut.marks.some((m) => m.part.sub === 'Processore di prova'));
  assert.ok(cut.marks.some((m) => m.part.sub === '8 GB · DDR4'));
  assert.ok(deviceInterior('t520', 'x', {}).marks.some((m) => /non indicat/.test(m.part.sub)), 'un dato mancante è scritto come mancante');
  assert.equal((cut.svg.match(/class="ri-mark"/g) || []).length, cut.marks.length);
});
