// Inventario a faccette, comandi della ricerca, guida passo passo: motori puri.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { prepare, filter, facets, group, totals, sortItems, qty, isAlias } from '../../app/lib/inventory.js';
import { commands, findEntity, pushRecent } from '../../app/lib/commands.js';
import { guideItems } from '../../app/views/emergency.js';

const core = JSON.parse(readFileSync(new URL('../../data/core.json', import.meta.url)));
const inv = JSON.parse(readFileSync(new URL('../../data/inventory.json', import.meta.url)));
const items = prepare(inv, core.entities);

test('inventario: ogni voce resta, le quantità non sono reinterpretate', () => {
  assert.equal(items.length, inv.items.length);
  assert.equal(qty({ quantity: '8' }), 8);
  assert.equal(qty({ quantity: '2 kit NIC + AOC' }), null, 'una quantità descrittiva non diventa un numero');
  const t = totals(items);
  assert.equal(t.counted + t.textual + t.alias, items.length);
  assert.equal(t.pieces, items.filter((i) => !isAlias(i) && i.n !== null).reduce((a, i) => a + i.n, 0));
  assert.ok(t.alias > 0 && items.filter(isAlias).every((i) => /ALIAS/.test(i.inventory_state)), 'gli alias non si sommano');
});

test('inventario: filtri combinati e conteggi delle faccette coerenti', () => {
  const f = { q: '', cat: ['ram'], state: [], used: [], photo: false, linked: '' };
  const res = filter(items, f);
  assert.ok(res.length && res.every((i) => i.cat === 'ram'));
  const fc = facets(items, f);
  assert.equal(fc.cat.get('ram'), res.length);
  assert.equal([...fc.cat.values()].reduce((a, b) => a + b, 0), items.length, 'i conteggi di categoria ignorano il filtro di categoria');
  const m2 = filter(items, { ...f, cat: [], used: ['M2'] });
  const declared = core.entities.find((e) => e.id === 'M2').inventory;
  assert.deepEqual(m2.map((i) => i.code).sort(), [...declared].sort(), 'il filtro per macchina segue i collegamenti del modello');
  assert.equal(filter(items, { ...f, q: 'p310 lexar', cat: [] })[0]?.code, 'INV-005');
  assert.equal(filter(items, { ...f, linked: 'si' }).length + filter(items, { ...f, linked: 'no' }).length, res.length);
});

test('inventario: gruppi e ordinamenti non perdono voci', () => {
  for (const by of ['categoria', 'stato']) assert.equal(group(items, by).reduce((n, g) => n + g.items.length, 0), items.length, by);
  const gm = group(items, 'macchina');
  assert.equal(gm.find((g) => g.key === '~').items.length, items.filter((i) => !i.used.length).length);
  assert.equal(gm.at(-1).key, '~', 'i non collegati stanno in fondo');
  assert.equal(sortItems(items, 'quantita').length, items.length);
  assert.ok(sortItems(items, 'modello')[0].model.localeCompare(sortItems(items, 'modello')[1].model, 'it') <= 0);
});

test('comandi: forme riconosciute portano a viste calcolate, il resto non produce nulla', () => {
  const r = (q) => commands(core, q).map((c) => c.route);
  assert.deepEqual(r('Cosa succede se manca M2?').slice(0, 2), ['mappa?sim=1&f=M2&s=M2', 'simula?f=M2']);
  assert.ok(r('cosa succede se si rompe lo switch')[0].includes('f=SW'));
  assert.deepEqual(r('confronta M2 e M4'), ['esplora/macchine?cmp=M2,M4']);
  assert.equal(r('dove stanno le foto')[0], 'e/D-FOTO');
  assert.ok(r('dove stanno le foto').includes('percorsi/foto'));
  assert.equal(r('da cosa dipende nextcloud')[0], 'e/NEXTCLOUD');
  assert.ok(r('inventario').includes('inventario'));
  assert.deepEqual(r('non vedo le foto'), [], 'una frase qualsiasi resta alla ricerca normale');
  assert.deepEqual(r('cosa succede se manca qualcosadiinesistente'), [], 'un elemento sconosciuto non genera comandi');
  assert.deepEqual(r('confronta M2 e M2'), []);
  for (const c of commands(core, 'spegni M4')) assert.ok(c.title && c.sub && c.route);
});

test('comandi: ricerca di un elemento per sigla, nome e sinonimo', () => {
  assert.equal(findEntity(core, 'm2').id, 'M2');
  assert.equal(findEntity(core, 'le mie foto', { kinds: ['dataset'] }).id, 'D-FOTO');
  assert.equal(findEntity(core, ''), null);
});

test('recenti: più recente in testa, senza doppioni, lunghezza limitata', () => {
  let l = [];
  for (let i = 0; i < 12; i++) l = pushRecent(l, { route: 'e/X' + i, title: 'X' + i });
  l = pushRecent(l, { route: 'e/X5', title: 'X5' });
  assert.equal(l.length, 8);
  assert.equal(l[0].route, 'e/X5');
  assert.equal(new Set(l.map((x) => x.route)).size, l.length);
  assert.deepEqual(pushRecent(l, { route: '', title: '' }), l);
});

test('guida passo passo: stesse voci della procedura, i passaggi da tecnico solo a richiesta', () => {
  for (const p of core.procedures) {
    const all = guideItems(p, true), base = guideItems(p, false);
    assert.equal(all.length, p.checks.length + p.steps.length, p.id);
    assert.equal(base.length, p.checks.length + p.steps.filter((s) => !s.tech).length, p.id);
    assert.equal(new Set(all.map((x) => x.k)).size, all.length, 'chiavi uniche');
    for (const it of all) assert.ok(it.text && it.expect, `${p.id} ${it.k}`);
    // le chiavi dei passaggi non cambiano quando si mostrano quelli da tecnico
    for (const it of base) assert.equal(all.find((x) => x.k === it.k).text, it.text);
  }
});
