// Calcolatori, ricerca, persistenza, roadmap, QR (A03, A04, A13–A16).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { model, ROOT } from './helpers.mjs';
import { dailyKwh, energyTotals, transferTime, toBytes, poolNominal, savings } from '../../app/lib/energy.js';
import { buildSearch, search, normalize } from '../../app/lib/search.js';
import * as store from '../../app/lib/store.js';
import { roadmapState } from '../../app/lib/roadmap.js';
import { qrMatrix } from '../../app/lib/qr.js';

// ---- energia (valori attesi calcolati a mano) ----
test('A14 · energia giornaliera: casi noti', () => {
  // M1: 30 W × 18 h + 50 W × 6 h = 840 Wh
  assert.equal(dailyKwh({ idleW: 30, loadW: 50, hoursOn: 24, hoursLoad: 6 }).value, 0.84);
  // M3: 90 W × 1,5 h + 250 W × 1,5 h = 510 Wh
  assert.equal(dailyKwh({ idleW: 90, loadW: 250, hoursOn: 3, hoursLoad: 1.5 }).value, 0.51);
  assert.equal(dailyKwh({ idleW: 10, loadW: 10, hoursOn: 0, hoursLoad: 0 }).value, 0);
});
test('A14 · valori nulli e limiti: nessun numero inventato', () => {
  assert.equal(dailyKwh({ idleW: null, loadW: 50, hoursOn: 24, hoursLoad: 6 }).value, null);
  assert.equal(dailyKwh({ idleW: 30, loadW: 50, hoursOn: 25, hoursLoad: 6 }).value, null);
  assert.equal(dailyKwh({ idleW: 30, loadW: 50, hoursOn: 4, hoursLoad: 6 }).value, null);
  const t = energyTotals([{ id: 'a', idleW: 30, loadW: 50, hoursOn: 24, hoursLoad: 6 }, { id: 'b', idleW: null }], 0.3);
  assert.equal(t.complete, false); assert.deepEqual(t.missing, ['b']);
  assert.ok(Math.abs(t.kwhYear - 0.84 * 365) < 1e-9);
  assert.ok(Math.abs(t.eurYear - 0.84 * 365 * 0.3) < 1e-9);
  assert.equal(energyTotals([{ id: 'a', idleW: 30, loadW: 50, hoursOn: 24, hoursLoad: 6 }], null).eurYear, null);
});
test('A14 · i profili usati non partono dal TDP', () => {
  const { core } = model();
  const e = JSON.parse(readFileSync(join(ROOT, 'content/model/energy.json'), 'utf8'));
  const m1 = e.profiles.find((p) => p.id === 'M1');
  assert.notEqual(m1.loadW, core.entities.find((x) => x.id === 'M1').hardware?.tdp?.value ?? -1);
  assert.equal(e.profileEvidence.ev, 'estimated');
});
test('trasferimento: 1 TB a 4 Mbit/s ≈ 23 giorni teorici (come REV3-CLOUD)', () => {
  const r = transferTime(toBytes(1, 'TB'), 4, 1);
  assert.ok(Math.abs(r.days - 23.148) < 0.01);
  assert.ok(Math.abs(transferTime(toBytes(5, 'TB'), 4, 1).days - 115.74) < 0.01);
  assert.ok(transferTime(toBytes(1, 'TB'), 4, 0.5).days > r.days);
  assert.ok(toBytes(1, 'TiB') > toBytes(1, 'TB'));
  assert.equal(transferTime(toBytes(1, 'TB'), 0, 1).seconds, null);
});
test('capacità nominale dei pool (REV3-MAP)', () => {
  assert.equal(poolNominal('raidz2', 6, 1), 4);
  assert.equal(poolNominal('raidz1', 4, 2), 6);
  assert.equal(poolNominal('mirror-pairs', 4, 2), 4);
  assert.equal(poolNominal('raidz1', 1, 2), null);
});
test('risparmio: gli acquisti proposti non si contano come spesi', () => {
  const hw = [{ id: 'a', amount: 100, state: 'Acquistato' }, { id: 'b', amount: 150, state: 'Proposta da acquistare' }, { id: 'c', amount: null, state: 'Ordinato' }];
  const s = savings({ rows: [{ on: true, eurMonth: 10 }], years: 5, maintEurYear: 0, domainEurYear: 0, energyEurYear: 0, hardware: hw });
  assert.equal(s.hardware, 100); assert.deepEqual(s.hardwareUnknown, ['c']);
  assert.equal(savings({ rows: [], years: 1, maintEurYear: 0, domainEurYear: 0, energyEurYear: 0, hardware: hw, includeProposed: true }).hardware, 250);
});

// ---- ricerca ----
const docs = JSON.parse(readFileSync(join(ROOT, 'data/search.json'), 'utf8'));
const { core } = model();
const SI = buildSearch(docs, JSON.parse(readFileSync(join(ROOT, 'content/model/synonyms.json'), 'utf8')));
test('A03 · ricerca per codice esatto', () => {
  const r = search(SI, 'INF-03.03');
  assert.ok(r.results[0].doc.codes.includes('INF-03.03'));
  assert.equal(r.results[0].doc.route, 'INF-03.03');
  assert.ok(r.results[0].why.includes('codice esatto'));
  assert.ok(search(SI, 'inf-03.03').results[0].doc.codes.includes('INF-03.03'), 'senza distinzione di maiuscole');
});
test('A04 · linguaggio comune: foto, furgone, «non vedo le foto», luci', () => {
  const foto = search(SI, 'non vedo le foto');
  assert.equal(foto.results[0].doc.id, 'IMMICH');
  assert.match(foto.results[0].why[0], /foto/);
  const van = search(SI, 'furgone');
  assert.ok(van.results.slice(0, 3).some((r) => ['C1', 'VITO-KIT', 'NET-VITO'].includes(r.doc.id)));
  assert.ok(van.expansions.some((e) => e.means === 'Vito'));
  assert.ok(search(SI, 'luci').results.slice(0, 4).some((r) => r.doc.id === 'HAOS'));
});
test('A04 · zero risultati gestiti, accenti e roadmap esclusa per impostazione', () => {
  const z = search(SI, 'qwzxv');
  assert.equal(z.total, 0); assert.deepEqual(z.results, []);
  assert.equal(normalize('Attività'), 'attivita');
  const a = search(SI, 'collaudi');
  const b = search(SI, 'collaudi', { includeRoadmap: true });
  assert.ok(b.total >= a.total);
  assert.equal(b.total - a.total, a.excluded);
});
test('evidenziazione sicura: segmenti di testo, mai HTML', () => {
  const r = search(SI, 'Immich');
  for (const s of r.results[0].snippet) assert.equal(typeof s.t, 'string');
});

// ---- persistenza ----
test('A16 · migrazione delle chiavi 4.4 senza cancellarle', () => {
  const m = store.memoryStorage({ 'faldone44-favorites': JSON.stringify(['INF-03.03', 'REV4-ROAD']), 'faldone44-checks': JSON.stringify({ x: true }), 'faldone44-theme': '"dark"', 'faldone44.power': JSON.stringify({ price: 0.28, rows: [['M1', 'M1', 31, 50, 24, 6, 'core']] }) });
  const r = store.load(m);
  assert.equal(r.status, 'migrato');
  assert.deepEqual(r.data.favorites, ['INF-03.03', 'REV4-ROAD']);
  assert.equal(r.data.prefs.theme, 'dark');
  assert.equal(r.data.energy.rows[0].idleW, 31);
  assert.ok(m.getItem('faldone44-favorites'), 'la chiave originale resta');
});
test('A16 · dati corrotti, quota esaurita, import non valido non corrompono nulla', () => {
  assert.equal(store.load(store.memoryStorage({ faldone5: '{rotto' })).status, 'corrotto');
  const full = store.memoryStorage({}, { failWrites: true });
  const s = store.save(full, store.empty());
  assert.equal(s.ok, false); assert.match(s.error, /spazio/);
  assert.equal(store.parseImport('{"format":"altro"}').ok, false);
  assert.equal(store.parseImport('non json').ok, false);
  assert.equal(store.parseImport(JSON.stringify({ format: 'faldone-locale', v: 99, data: {} })).ok, false);
  const r = store.parseImport(JSON.stringify({ format: 'faldone-locale', v: 1, data: { favorites: ['M2', 'NON-ESISTE'], notes: { M2: { text: '<script>alert(1)</script>' } } } }), (x) => x === 'M2');
  assert.deepEqual(r.data.favorites, ['M2']);
  assert.equal(r.data.notes.M2.text, '<script>alert(1)</script>', 'resta testo: viene sempre mostrato con escape');
});
test('A16 · conflitti esplicitati, la versione attuale non viene sovrascritta per difetto', () => {
  const cur = { ...store.empty(), favorites: ['M2'], notes: { M2: { text: 'nuova', at: '2026-11-02' } }, updatedAt: '2026-11-02' };
  const inc = { ...store.empty(), favorites: ['M4'], notes: { M2: { text: 'vecchia', at: '2026-10-01' } }, updatedAt: '2026-10-01' };
  const pv = store.previewMerge(cur, inc);
  assert.equal(pv.conflicts.length, 1); assert.equal(pv.olderFile, true);
  assert.equal(store.merge(cur, inc).notes.M2.text, 'nuova');
  assert.equal(store.merge(cur, inc, { M2: 'importato' }).notes.M2.text, 'vecchia');
  assert.deepEqual(store.merge(cur, inc).favorites, ['M2', 'M4']);
});

// ---- roadmap ----
test('A13 · gate incompleto blocca il passo dipendente; una spunta locale non conta', () => {
  const rs = roadmapState(core);
  assert.equal(rs.taskState.get('A-3.1').state, 'bloccato');
  assert.ok(rs.taskState.get('A-3.1').blockers.some((b) => /gate della fase p1/.test(b.text)));
  assert.equal(rs.taskState.get('A-1.1').state, 'pronto');
  assert.ok(rs.now.every((t) => !(t.after || []).length || t.after.every((a) => rs.taskState.get(a).state === 'completato')));
  // con collaudo ed esecuzioni registrate con evidenza, il gate si apre
  const c2 = { ...core, testResults: [{ testId: 'T-COPIE', outcome: 'superato', date: '2027-01-10', evidence: 'registro' }], tasksDone: ['A-0.3', 'A-1.1', 'A-1.2', 'A-1.4', 'A-0.1', 'A-0.2', 'A-2.1', 'A-2.2'].map((taskId) => ({ taskId, evidence: 'x' })) };
  const rs2 = roadmapState(c2);
  assert.ok(!rs2.taskState.get('A-3.1').blockers.some((b) => /gate/.test(b.text)));
  assert.equal(rs2.taskState.get('A-1.4').state, 'completato');
  assert.equal(rs2.taskState.get('A-2.2').state, 'da_verificare', 'senza T-CLUSTER registrato non è completato');
});
test('A13 · una decisione aperta blocca', () => {
  assert.equal(roadmapState(core).taskState.get('A-3.3').state, 'bloccato');
});

// ---- QR ----
test('QR identico alla libreria di riferimento (livello M, maschera fissa)', () => {
  const fx = JSON.parse(readFileSync(join(ROOT, 'tools/test/fixtures-qr.json'), 'utf8'));
  const mine = qrMatrix(fx.text, { mask: fx.mask }).map((r) => r.map((v) => (v ? '1' : '0')).join(''));
  assert.deepEqual(mine, fx.rows);
});
