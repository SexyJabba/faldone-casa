import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { atlas } from '../../app/views/atlas.js';
import { inventory } from '../../app/views/docs.js';
import { bars } from '../../app/lib/charts.js';
import { buildIndex } from '../../app/lib/model.js';
const core = JSON.parse(readFileSync(new URL('../../data/core.json', import.meta.url)));
const inv = JSON.parse(readFileSync(new URL('../../data/inventory.json', import.meta.url)));
const app = query => ({core, idx:buildIndex(core), query, on(){}, inventory:async()=>inv});
test('ogni tema offre schede reali e collegamenti senza valori indefiniti', () => {
  for (const t of ['servizi','continuita','privacy','nodi','casa','lavoro','vito','terzi']) {
    const {html} = atlas(app({t}));
    assert.ok(html.includes('Funzioni, limiti e fonti'));
    assert.ok(!html.includes('undefined'));
    for (const [,id] of html.matchAll(/href="#e\/([^"]+)"/g)) assert.ok(core.entities.some(e=>e.id===id), id);
  }
});
test('inventario: filtri combinati e assenza di risultati esplicita', async () => {
  const {html} = await inventory(app({q:'impossibile-nessuna-voce',cat:'hdd',photo:'1',linked:'1'}));
  assert.ok(html.includes('Nessuna voce corrisponde'));
  assert.ok(html.includes('0 voci su'));
  const detail = await inventory(app({}), ['INV-001']);
  assert.ok(detail.html.includes(inv.items[0].model));
});
test('grafici: un dato sconosciuto resta n.d. e le etichette sono sanificate', () => {
  const html = bars('<test>',[{label:'<script>',value:null},{label:'zero',value:0}]);
  assert.ok(html.includes('n.d.')); assert.ok(html.includes('0 ')); assert.ok(!html.includes('<script>'));
});
