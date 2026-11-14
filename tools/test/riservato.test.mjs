// Area riservata: la cifratura regge, e nei file pubblici non resta nulla del contenuto protetto.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, model } from './helpers.mjs';
import { sealBox, unlock, openBox, deriveKey, exportKey, importKey, checkBox, indexOf, mergeImpianto, cleanPassword, ITERATIONS } from '../../app/lib/vault.js';
import { validatePrivate, validatePlan } from '../lib/riservato.mjs';

const salt = new Uint8Array(16).fill(7), iv = new Uint8Array(12).fill(9);
const sample = { v: 1, impianti: { planimetria: { summary: 'segreto', plan: { rooms: [{ id: 'stanza', name: 'Stanza di prova', area: 1, hmin: 1, hmax: 2, x: 0, z: 0, w: 1, d: 1 }] } } }, entita: { M2: [{ label: 'Indirizzo', value: null }] } };
const IT = 100000; // nei test bastano meno passaggi; il contenuto pubblicato ne usa 600.000

test('cifra e decifra; password sbagliata e contenuto alterato danno null', async () => {
  const box = await sealBox(sample, 'una password lunga di prova', { salt, iv, iterations: IT });
  assert.deepEqual(checkBox(box), []);
  assert.ok(!JSON.stringify(box).includes('Stanza di prova') && !JSON.stringify(box).includes('segreto'), 'nel contenitore non c\'è testo in chiaro');
  assert.deepEqual(box.index, { impianti: ['planimetria'], entita: ['M2'] });
  assert.deepEqual((await unlock(box, '  una password lunga di prova ')).data, sample, 'gli spazi ai bordi non contano');
  assert.equal(await unlock(box, 'una password lunga di prova!'), null);
  const bad = { ...box, ct: box.ct.slice(0, 10) + (box.ct[10] === 'A' ? 'B' : 'A') + box.ct.slice(11) };
  assert.equal(await unlock(bad, 'una password lunga di prova'), null, 'un solo carattere cambiato viene rifiutato');
  assert.equal(await unlock({ ...box, v: 2 }, 'una password lunga di prova'), null, 'la versione è legata al contenuto');
});

test('la chiave ricordata riapre il contenuto senza la password; una chiave vecchia no', async () => {
  const box = await sealBox(sample, 'una password lunga di prova', { salt, iv, iterations: IT });
  const raw = await exportKey(await deriveKey('una password lunga di prova', box.salt, IT));
  assert.deepEqual(await openBox(box, await importKey(raw)), sample);
  const other = await sealBox(sample, 'un\'altra password lunga', { salt, iv: new Uint8Array(12).fill(3), iterations: IT });
  assert.equal(await openBox(other, await importKey(raw)), null);
});

test('password corte rifiutate; normalizzazione degli accenti', async () => {
  await assert.rejects(() => sealBox(sample, 'corta', { salt, iv, iterations: IT }), /troppo corta/);
  await assert.rejects(() => sealBox(sample, 'nove-cara', { salt, iv, iterations: IT }), /almeno 12/, 'sotto i 12 caratteri serve una scelta esplicita');
  assert.ok(await sealBox(sample, 'nove-cara', { salt, iv, iterations: IT, allowShort: true }));
  await assert.rejects(() => sealBox(sample, 'sette77', { salt, iv, iterations: IT, allowShort: true }), /sotto gli 8/);
  assert.equal(cleanPassword(' caffè '), 'caffè');
  assert.ok(ITERATIONS >= 600000);
});

test('controlli sul contenuto in chiaro prima di cifrare', () => {
  const { core } = model();
  const ents = new Set(core.entities.map((e) => e.id));
  const pub = [{ id: 'planimetria', riservato: true }, { id: 'vmc' }];
  assert.deepEqual(validatePrivate(sample, pub, ents), []);
  assert.match(validatePrivate({ v: 1, impianti: { vmc: {} } }, pub, ents).join(), /"riservato": true/);
  assert.match(validatePrivate({ v: 1, impianti: { inesistente: {} } }, pub, ents).join(), /manca la scheda pubblica/);
  assert.match(validatePrivate({ v: 1, entita: { 'NON-ESISTE': [] } }, pub, ents).join(), /elemento inesistente/);
  assert.match(validatePrivate({ v: 1, impianti: { planimetria: { status: { decision: 'approvata' } } } }, pub, ents).join(), /approvato/);
  assert.match(validatePlan('p', { rooms: [{ id: 'a', area: 'x', hmin: 1, hmax: 2, x: 0, z: 0, w: 1, d: 1, place: 'P-NON-ESISTE' }] }, ents, new Set()).join(), /non numerico.*luogo inesistente/s);
  assert.deepEqual(indexOf({}), { impianti: [], entita: [] });
  assert.equal(mergeImpianto({ id: 'vmc', title: 'VMC' }, sample).title, 'VMC', 'un impianto senza parte riservata resta com\'è');
  assert.equal(mergeImpianto({ id: 'planimetria', summary: 'pubblico' }, sample).summary, 'segreto');
});

test('il contenuto pubblicato è cifrato, coerente con le schede pubbliche e senza tracce in chiaro', () => {
  const box = JSON.parse(readFileSync(join(ROOT, 'content/riservato/riservato.enc.json'), 'utf8'));
  assert.deepEqual(checkBox(box), []);
  assert.ok(box.it >= 600000);
  const imp = JSON.parse(readFileSync(join(ROOT, 'content/impianti/impianti.json'), 'utf8')).impianti;
  assert.deepEqual(imp.filter((i) => i.riservato).map((i) => i.id).sort(), box.index.impianti);
  for (const i of imp.filter((x) => x.riservato)) { assert.ok(!i.plan && !i.components, `${i.id}: la scheda pubblica non contiene i dati`); assert.match(i.status.label, /Riservata/); }
  assert.deepEqual(JSON.parse(readFileSync(join(ROOT, 'data/riservato.json'), 'utf8')), box, 'la build pubblica il contenitore così com\'è');
  // nessun file pubblico generato o sorgente contiene le stanze o le quote della planimetria
  const files = [...readdirSync(join(ROOT, 'data')).filter((f) => f.endsWith('.json') && f !== 'riservato.json').map((f) => `data/${f}`), 'content/impianti/impianti.json', 'index.html', 'sw.js'];
  for (const f of files) {
    const t = readFileSync(join(ROOT, f), 'utf8');
    for (const mark of ['"rooms"', '"hmin"', '"hmax"', '"cadDate"']) assert.ok(!t.includes(mark), `${f} contiene «${mark}»`);
  }
  assert.ok(!existsSync(join(ROOT, 'content/riservato/riservato.json')), 'il file in chiaro non sta nel repository');
});
