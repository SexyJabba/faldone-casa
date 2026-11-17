// Migrazione dallo schema 1 e controlli sul ripristino. Il file tests/fixtures/backup-v1.json è un backup vero della prima versione.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { migra, validaBackup, preparaRipristino } from '../js/store.js';
import { seed, SCHEMA } from '../js/seed.js';
import * as C from '../js/calc.js';

const v1 = () => JSON.parse(readFileSync(new URL('./fixtures/backup-v1.json', import.meta.url)));
test('backup v1: accettato, migrato allo schema attuale senza perdere dati dell\'utente', () => {
  const o = v1(); const n = o.state.lavori.length, inv = o.state.inventario.length;
  const { state: s, files } = preparaRipristino(o);
  assert.equal(s.schema, SCHEMA); assert.equal(files.length, 1);
  assert.ok(s.spese.some((x) => x.id === 'u1' && x.importo === 123)); assert.equal(s.lavori[0].stato, 'concluso'); assert.equal(s.lavori[0].accettazione[0].ok, true);
  assert.equal(s.lavori.length, n); assert.ok(s.inventario.length >= inv);
  assert.ok(s.lavori.every((l) => l.passi.every((p) => typeof p.t === 'string' && p.tipo) && Array.isArray(l.materialiInv) && Array.isArray(l.sessioni)));
  assert.ok(s.layout.every((l) => l.stati[0].id === 'viaggio')); assert.deepEqual(s.baseFissa, []);
  assert.equal(s.progetti.length, 1); assert.equal(s.progetti[0].stratiId, 'sc_a'); assert.equal(s.progetti[0].sistemaId, null);
  assert.equal(C.budget(s).sostenuto, 5123);
  assert.equal(s.veicolo.find((v) => v.id === 'v_vin').valore, seed().veicolo.find((v) => v.id === 'v_vin').valore); assert.equal(s.inventario.find((i) => i.id === 'm_butile').costoUnit, 50.9);
});
test('migrazione idempotente e rispettosa dei dati già documentati dall\'utente', () => {
  const o = v1(); o.state.veicolo.find((v) => v.id === 'v_km').valore = '401000'; o.state.veicolo.find((v) => v.id === 'v_mcompl').valore = '9999'; o.state.veicolo.find((v) => v.id === 'v_mcompl').stato = 'misurato';
  o.state.inventario.find((i) => i.id === 'm_butile').costoUnit = 44;
  const a = migra(o.state); const una = JSON.stringify(a); const b = migra(JSON.parse(una));
  assert.equal(JSON.stringify(b), una); assert.equal(a.veicolo.find((v) => v.id === 'v_km').valore, '401000'); assert.equal(a.veicolo.find((v) => v.id === 'v_mcompl').valore, '9999'); assert.equal(a.inventario.find((i) => i.id === 'm_butile').costoUnit, 44);
});
test('ripristino: contenuti non validi rifiutati PRIMA di qualsiasi scrittura', () => {
  const casi = [(o) => { o.state.lavori[0].id = ''; }, (o) => { o.state.spese.push({ ...o.state.spese[0] }); }, (o) => { o.files = [{ id: 'x', data: 'non-un-data-url' }]; }, (o) => { o.files = 'x'; }, (o) => { delete o.state.lavori[1].passi; }, (o) => { o.state.layout[0].moduli = null; }, (o) => { o.state.geom.corridoio = null; }, (o) => { o.state.energia.sistemi = {}; }];
  for (const rompi of casi) { const o = v1(); rompi(o); assert.throws(() => preparaRipristino(o), /Backup/); }
  const o = v1(); const prima = JSON.stringify(o); preparaRipristino(o); assert.equal(JSON.stringify(o), prima, 'il backup originale non deve essere modificato');
});
test('dati iniziali v2: nessun errore geometrico in nessuno stato con la stratigrafia del progetto attivo; la B stringe il vano', () => {
  const s = seed(); assert.ok(validaBackup({ app: 'vito-officina', state: s }));
  const fin = (id) => C.vanoFinito(s.geom, s.scenariStrati.find((x) => x.id === id), s);
  for (const ly of s.layout) for (const st of [null, ...ly.stati]) assert.deepEqual(C.verificaLayout(ly, s.geom, { base: s.baseFissa, stato: st, finito: fin('sc_a') }).filter((x) => x.livello === 'errore'), [], `${ly.nome} / ${st?.nome}`);
  assert.ok(C.verificaLayout(s.layout[1], s.geom, { base: s.baseFissa, finito: fin('sc_b') }).some((x) => x.tipo === 'fuori'));
  const f = fin('sc_a'); assert.ok(Math.abs(f.larg - (1650 - 2 * 24.3)) < 1e-6); assert.ok(Math.abs(f.alt - (1350 - 32 - 24.3)) < 1e-6);
});
test('progetto attivo: decide stratigrafia e sistema del previsto, mai lo speso', () => {
  const s = seed(); C.applicaProgetto(s); const a = C.budget(s);
  s.progetti.forEach((p) => { p.attivo = p.id === 'pg_b'; }); C.applicaProgetto(s); const b = C.budget(s);
  assert.equal(a.sostenuto, b.sostenuto); assert.equal(a.sistemaNome, 'Componenti separati LiFePO4 100 Ah'); assert.equal(b.sistemaNome, 'Power station ~1 kWh');
  assert.equal(s.scenariStrati.filter((x) => x.attivo).map((x) => x.id).join(), 'sc_b');
});
test('simulazione oraria: bilancio energetico chiuso, riserva rispettata, picchi contro il limite', () => {
  const SIS = { capacita_Wh: 1000, dod: 0.9, effInv: 1, effDC: 1, riservaPct: 10, solare_Wp: 150, rendSolare: 1, caricaVeicolo_W: 0, caricaRete_W: 0, maxUscita_W: 150 };
  const p = { oreSole: 4, oreLuce: 12, oraInizio: 18, carichi: [{ nome: 'frigo', W: 40, ore: 24, duty: 50 }, { nome: 'luci', W: 100, ore: 3, da: 19 }] };
  const r = C.simulaEnergia(p, SIS, 48);
  assert.equal(r.serie.length, 48); assert.ok(Math.abs(r.totCarico_Wh - 2 * (480 + 300)) < 1e-6); assert.ok(Math.abs(r.totRicarica_Wh - 1200) < 1e-6);
  assert.ok(Math.abs((1000 + r.totRicarica_Wh - r.totCarico_Wh + r.nonServita_Wh - r.sprecata_Wh) - r.Efine) < 1e-6, 'bilancio');
  assert.ok(r.Emin >= r.floor - 1e-9); assert.ok(Math.abs(r.floor - 190) < 1e-9); assert.equal(r.piccoMax_W, 140); assert.equal(r.superaLimite, false); assert.equal(r.verdetto, 'raggiunto');
  assert.equal(C.simulaEnergia(p, { ...SIS, maxUscita_W: 120 }, 48).verdetto, 'non_raggiunto');
  assert.equal(C.simulaEnergia(p, { ...SIS, maxUscita_W: null }, 48).verdetto, 'non_definitivo');
  const corto = C.simulaEnergia(p, { ...SIS, capacita_Wh: 300, solare_Wp: 0 }, 48); assert.equal(corto.verdetto, 'non_raggiunto'); assert.ok(corto.primaInterruzione_h !== null && corto.nonServita_Wh > 0);
});
test('apparecchi: termico, elettricità e combustibile restano grandezze distinte', () => {
  const d = C.consumiApparecchio(1000, { pTermMax_W: 2000, rendimento: 0.8, pci_kWh_l: 10, el_min_W: 10, el_max_W: 30 }, 10);
  assert.equal(d.termica_Wh_g, 10000); assert.ok(Math.abs(d.combustibile_l_h - 0.125) < 1e-9); assert.equal(d.elettrica_W, 20); assert.equal(d.elettrica_Wh_g, 200); assert.equal(d.insufficiente, false);
  assert.equal(C.consumiApparecchio(3000, { pTermMax_W: 2000, rendimento: 0.8, pci_kWh_l: 10, el_min_W: 10, el_max_W: 30 }, 1).insufficiente, true);
  assert.equal(C.consumiApparecchio(500, { elettrico: true, rendimento: 1, pTermMax_W: 1000 }, 2).elettrica_Wh_g, 1000);
  assert.equal(C.consumiApparecchio(500, { pTermMax_W: 2000 }, 2).combustibile_l_h, null); assert.equal(C.consumiApparecchio(null, {}, 2).determinabile, false);
});
test('estate: componenti note sommate, componenti mancanti elencate e non stimate', () => {
  const s = seed(); const r = C.termico(s.scenariStrati[0], s, { Tint: 24, Text: 32, portata_m3h: 30, persone: 1 });
  assert.equal(r.P_max, null); assert.ok(r.componenti.filter((c) => c.mancante).length >= 4); assert.ok(r.parzialeMin_W > 0 && r.parzialeMax_W > r.parzialeMin_W);
});
test('percorso: eseguibili, bloccati, materiali mancanti da inventario, sequenza rispettosa delle dipendenze', () => {
  const s = seed(); const p = C.percorso(s, 4);
  const ids = p.sequenza.map((r) => r.lavoro.id); assert.equal(p.ciclo.length, 0);
  for (const r of p.sequenza) for (const d of r.lavoro.dipende) assert.ok(ids.indexOf(d) < ids.indexOf(r.lavoro.id), `${d} prima di ${r.lavoro.id}`);
  assert.ok(p.eseguibili.some((r) => r.lavoro.id === 'l_tetto')); assert.ok(p.bloccati.some((r) => r.lavoro.id === 'l_pianale'));
  const tetto = p.righe.find((r) => r.lavoro.id === 'l_tetto'); assert.equal(tetto.mancaQualcosa, true); assert.ok(tetto.materiali.find((m) => m.inv === 'i_primer').stato === 'manca');
  s.inventario.find((i) => i.id === 'i_primer').disp = 'acquistato'; assert.equal(C.percorso(s).righe.find((r) => r.lavoro.id === 'l_tetto').materiali.find((m) => m.inv === 'i_primer').stato, 'ok');
  const t = s.lavori.find((l) => l.id === 'l_rilievo'); t.sessioni = [{ ore: 1 }]; const r = C.percorso(s, 1).righe.find((x) => x.lavoro.id === 'l_rilievo'); assert.equal(r.oreResidue, 2); assert.equal(r.sessioni, 2);
  s.lavori.find((l) => l.id === 'l_ruggine').dipende = ['l_pianale']; assert.ok(C.percorso(s).ciclo.length > 0);
});
