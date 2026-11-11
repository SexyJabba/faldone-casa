// «Lavoro» (lavoro/): logica, passaggio dati via QR e vincoli per il browser dei Kindle.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const src = (f) => readFileSync(join(ROOT, 'lavoro', f), 'utf8');
const ctx = vm.createContext({});
vm.runInContext(src('core.js'), ctx);
vm.runInContext(src('qr.js'), ctx);
const C = ctx.LavoroCore, QR = ctx.LavoroQR;
const plain = (x) => JSON.parse(JSON.stringify(x));

test('L1 · i file per il Kindle restano ES5 e senza dipendenze esterne', () => {
  for (const f of ['core.js', 'qr.js', 'app.js']) {
    const code = src(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    for (const [re, what] of [[/=>/, 'funzioni freccia'], [/\b(let|const)\s/, 'let/const'], [/`/, 'template'], [/\bclass\s+\w+\s*\{/, 'classi'], [/\b(async|await)\b/, 'async'], [/\.\.\.[\w[]/, 'spread'], [/\b(fetch|XMLHttpRequest)\b/, 'richieste di rete']]) assert.ok(!re.test(code), `${f}: ${what}`);
  }
  const html = src('index.html');
  assert.ok(!/(src|href)="(https?:)?\/\//.test(html), 'nessuna risorsa esterna');
  const css = src('style.css');
  assert.ok(!/display:\s*(flex|grid)|transition|animation/.test(css), 'niente flex, grid, animazioni');
});

test('L2 · importi e numeri all\'italiana', () => {
  assert.equal(C.parseMoney('12,50'), 1250);
  assert.equal(C.parseMoney('1.234,56 €'), 123456);
  assert.equal(C.parseMoney('12.5'), 1250);
  assert.equal(C.parseMoney('1.000'), 100000);
  assert.equal(C.parseMoney('7'), 700);
  assert.equal(C.parseMoney('abc'), null);
  assert.equal(C.parseMoney(''), null);
  assert.equal(C.fmtMoney(123456), '1.234,56 €');
  assert.equal(C.fmtMoney(5), '0,05 €');
  assert.equal(C.parseNum('34,5'), 34.5);
  assert.equal(C.fmtOre(7.5), '7,5 h');
});

test('L3 · date, settimane dal lunedì, mesi', () => {
  assert.equal(C.weekStart('2026-11-11'), '2026-11-09');
  assert.equal(C.weekStart('2026-11-15'), '2026-11-09');
  assert.equal(C.weekStart('2026-11-09'), '2026-11-09');
  assert.equal(C.dateAdd('2026-12-31', 1), '2027-01-01');
  assert.equal(C.dateAdd('2026-03-29', 1), '2026-03-30'); // cambio dell'ora
  assert.equal(C.monthAdd('2026-01', -1), '2025-12');
  assert.equal(C.fmtDate('2026-11-11', true), 'Mercoledì 11 novembre 2026');
});

test('L4 · timbratura arrotondata al quarto d\'ora', () => {
  assert.equal(C.quarter(2 * 3600000 + 7 * 60000), 2);
  assert.equal(C.quarter(2 * 3600000 + 8 * 60000), 2.25);
  assert.equal(C.quarter(60000), 0.25);
});

function sample() {
  const db = C.empty();
  C.put(db.cant, { id: 'c1', n: 'Villa Rossi', st: 'a' }, 10);
  C.put(db.cant, { id: 'c2', n: 'Condominio; "Aurora"', st: 'a' }, 10);
  C.put(db.rap, { id: 'r1', g: '2026-11-09', c: 'c1', o: 8, pe: 2, km: 30, l: 'Tracce e posa\ntubi' }, 10);
  C.put(db.rap, { id: 'r2', g: '2026-11-11', c: 'c2', o: 4.5, pe: 1, km: 12.5, l: 'Collaudo' }, 10);
  C.put(db.rap, { id: 'r3', g: '2026-10-30', c: 'c1', o: 6, pe: 1, km: 0 }, 10);
  C.put(db.spe, { id: 's1', g: '2026-11-10', c: 'c1', i: 12050, k: 'm', pg: 'k', sc: 'f', de: 'Raccordi' }, 10);
  C.put(db.spe, { id: 's2', g: '2026-11-11', c: '', i: 6000, k: 'c', pg: 'd', sc: 's' }, 10);
  C.put(db.todo, { id: 't1', t: 'Ordinare il quadro', k: 'c', c: 'c1', p: 0, d: 0 }, 10);
  C.put(db.todo, { id: 't2', t: 'Chiamare il cliente', k: 't', c: 'c1', p: 1, d: 0 }, 5);
  C.put(db.todo, { id: 't3', t: 'Fatto', k: 'f', c: 'c1', p: 0, d: 1 }, 20);
  return db;
}

test('L5 · riepiloghi per settimana, mese e cantiere', () => {
  const db = sample();
  const w = C.rapTot(C.rapList(db, { from: '2026-11-09', to: '2026-11-15' }));
  assert.deepEqual(plain(w), { ore: 12.5, orePers: 20.5, km: 42.5, n: 2 });
  const s = C.speTot(C.speList(db, { from: '2026-11-01', to: '2026-11-31' }));
  assert.equal(s.tot, 18050); assert.equal(s.daPagare, 6000); assert.equal(s.cat.m, 12050);
  assert.deepEqual(plain(C.cantSummary(db, 'c1')), { ore: 14, orePers: 22, km: 30, giorni: 2, spese: 12050, aperti: 2 });
  assert.equal(C.todoOpen(db)[0].id, 't2', 'le urgenti prima');
});

test('L6 · eliminazione con lapide e unione tra dispositivi', () => {
  const kindle = sample(), tel = C.empty();
  assert.deepEqual(plain(C.merge(tel, plain(kindle))), { nuovi: 10, aggiornati: 0 });
  assert.deepEqual(plain(C.merge(tel, plain(kindle))), { nuovi: 0, aggiornati: 0 }, 'ripetere non duplica');
  C.remove(kindle.rap, 'r3', 50);
  C.put(kindle.rap, { id: 'r1', g: '2026-11-09', c: 'c1', o: 9, pe: 2, km: 30 }, 60);
  C.put(tel.todo, { id: 't1', t: 'Ordinare il quadro (fatto dal telefono)', k: 'c', c: 'c1', d: 1 }, 70);
  C.merge(tel, plain(kindle));
  assert.equal(C.live(tel.rap).length, 2, 'il rapportino eliminato sparisce anche sul telefono');
  assert.equal(C.byId(tel.rap, 'r1').o, 9);
  assert.equal(C.byId(tel.todo, 't1').d, 1, 'la modifica più recente non viene sovrascritta da una più vecchia');
});

test('L7 · passaggio via QR: pezzi in qualunque ordine, testo con accenti, niente fuori dall\'ancora', () => {
  const db = sample();
  C.put(db.todo, { id: 't9', t: 'Città: «più» caffè € ✓', k: 'a', c: '', d: 0 }, 30);
  const sub = C.subset(db, null, null, true), x = C.pack(sub, 120), base = 'https://faldone.rinaldi.build/lavoro/';
  assert.ok(x.parts.length > 3);
  const links = x.parts.map((_, i) => C.link(base, x, i));
  for (const l of links) assert.match(l, /^https:\/\/faldone\.rinaldi\.build\/lavoro\/#i=[0-9a-z]+\.\d+\.\d+\.[A-Za-z0-9_-]+$/);
  let st = null;
  for (const l of [...links].reverse()) { st = C.receive(st && plain(st), C.parseLink(l.slice(l.indexOf('#')))); }
  assert.deepEqual(plain(st.data), plain(sub));
  const tel = C.empty(); C.merge(tel, st.data);
  assert.equal(C.byId(tel.todo, 't9').t, 'Città: «più» caffè € ✓');
  assert.equal(C.parseLink('#oggi'), null);
  assert.equal(C.parseLink('#i=ab.3.2.xx'), null);
  // un periodo passa solo rapportini e spese di quei giorni, con i cantieri che servono
  const oggi = C.subset(db, '2026-11-11', '2026-11-11', false);
  assert.deepEqual([oggi.rap.length, oggi.spe.length, oggi.cant.length, oggi.todo.length], [1, 1, 1, 0]);
  assert.equal(oggi.cant[0].id, 'c2');
});

test('L8 · CSV apribile nel foglio di calcolo', () => {
  const db = sample(), rap = C.csvRap(db).split('\r\n'), spe = C.csvSpe(db).split('\r\n');
  assert.equal(rap[0], 'Data;Cantiere;Ore;Persone;Ore per persone;Km;Lavori eseguiti;Materiali');
  assert.equal(rap[1], '2026-10-30;Villa Rossi;6;1;6;;;');
  assert.ok(C.csvRap(db).includes('2026-11-09;Villa Rossi;8;2;16;30;"Tracce e posa\ntubi";'));
  assert.ok(rap.some((r) => r.startsWith('2026-11-11;"Condominio; ""Aurora""";4,5;1;4,5;12,5;Collaudo')));
  assert.equal(spe[1], '2026-11-10;Villa Rossi;120,5;Materiale;Raccordi;Carta;Fattura');
});

test('L9 · QR identico a una libreria di riferimento (livello L, versioni fino a 20)', () => {
  const fx = JSON.parse(readFileSync(join(ROOT, 'tools/test/fixtures-qr-lavoro.json'), 'utf8'));
  assert.ok(fx.cases.length >= 3);
  for (const c of fx.cases) assert.deepEqual(plain(QR.matrix(c.text, c.mask)).map((r) => r.map((v) => (v ? '1' : '0')).join('')), c.rows, `${c.text.length} caratteri`);
  assert.equal(QR.matrix('a'.repeat(QR.maxBytes(20))).length, 97);
  assert.throws(() => QR.matrix('a'.repeat(QR.maxBytes(20) + 1)));
  // un pezzo da 420 caratteri con il suo indirizzo deve entrare in un codice
  assert.ok(QR.matrix('https://faldone.rinaldi.build/lavoro/#i=abcde.12.34.' + 'A'.repeat(420)).length <= 81);
});

test('L10 · archivio danneggiato o di versione ignota non blocca l\'avvio', () => {
  for (const bad of [null, 'x', 3, {}, { rap: 'no', timer: { t: 0 } }]) {
    const db = C.norm(bad);
    assert.deepEqual(plain(db), plain(C.empty()));
  }
});
