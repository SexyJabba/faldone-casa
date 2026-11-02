// A17: telemetria assente o vecchia; contratto dell'adapter in sola lettura (dati di prova).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalize, freshness, checkTarget } from '../adapters/zabbix.mjs';

const fixture = { hosts: [{ host: 'M2', available: 0, lastAccess: 1793000000 }, { host: 'm4', available: 1 }, { host: 'sconosciuto', available: 0 }] };
const DEMO = { ...{ m4: 'M4' }, m2: 'M2' };

test('normalizzazione: host mappati soltanto, spento a richiesta ≠ guasto', () => {
  const s = normalize(fixture, { now: new Date('2026-11-02T10:00:00Z'), map: DEMO });
  assert.equal(s.items.length, 2);
  assert.equal(s.items.find((i) => i.entityId === 'M2').observation, 'disponibile');
  assert.equal(s.items.find((i) => i.entityId === 'M4').observation, 'spento');
  assert.equal(s.readOnly, true);
});
test('A17 · istantanea assente o scaduta: mai mostrata come sana', () => {
  assert.equal(freshness(null).state, 'non_configurato');
  const s = normalize(fixture, { now: new Date('2026-11-02T10:00:00Z'), map: DEMO, staleAfterS: 60 });
  assert.equal(freshness(s, new Date('2026-11-02T10:00:30Z')).state, 'connesso');
  assert.equal(freshness(s, new Date('2026-11-02T10:05:00Z')).state, 'scaduto');
  assert.equal(freshness({ schema: 'altro' }).state, 'errore');
});
test('il backup completato non diventa un recupero provato', () => {
  const s = normalize({ hosts: [], backup: { lastSuccess: '2027-01-10T18:40:00Z' } });
  assert.match(s.items[0].note, /non è un recupero provato/);
});
test('l\'adapter non è un proxy arbitrario', () => {
  assert.throws(() => checkTarget('https://evil.example/api', ['zabbix.casa.example']));
  assert.throws(() => checkTarget('http://zabbix.casa.example/api', ['zabbix.casa.example']));
  assert.equal(checkTarget('https://zabbix.casa.example/api_jsonrpc.php', ['zabbix.casa.example']).hostname, 'zabbix.casa.example');
});
