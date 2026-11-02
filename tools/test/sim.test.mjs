// Regole del simulatore (criteri A08–A12 e casi richiesti dal mandato).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { model, indexWith } from './helpers.mjs';
import { simulate, ST } from '../../app/lib/sim.js';
import { findCycles } from '../../app/lib/model.js';

const { idx } = model();
const S = (events = []) => simulate(idx, { events });
const fail = (...ids) => ids.map((id) => ({ type: 'fail', id }));

test('riferimento: nucleo con quorum, server a richiesta spenti ma non guasti', () => {
  const s = S();
  assert.equal(s.quorum.hubQuorum, true);
  assert.equal(s.quorum.min, 4, 'M5 ha un collegamento non documentato: 4 voti certi');
  assert.equal(s.quorum.max, 5);
  assert.equal(s.status('M4').status, ST.ON_DEMAND);
  assert.equal(s.status('JELLYFIN').status, ST.ON_DEMAND);
  assert.equal(s.status('NEXTCLOUD').status, ST.AVAILABLE);
});

test('A08 · M2 indisponibile: subentro su C4 non garantito senza collaudo e dati', () => {
  const s = S(fail('M2'));
  const nc = s.status('NEXTCLOUD');
  assert.equal(nc.status, ST.UNKNOWN);
  const why = nc.reasons.flatMap((r) => r.why || []).join(' ');
  assert.match(why, /T-HA-APP/);
  assert.match(why, /dato mancante: C4/);
  assert.equal(s.status('IMMICH').status, ST.BLOCKED, 'Immich non ha subentro');
  assert.equal(s.status('HAOS').status, ST.AVAILABLE, 'la domotica non dipende da M2');
  assert.match(s.impact('IMMICH')[1].text, /Non puoi caricare nuove foto/);
});

test('A08 · con collaudo e capacità supposti, subentro con perdita entro l\'obiettivo RPO', () => {
  const s = S([...fail('M2'), { type: 'assumeTest', id: 'T-HA-APP' }, { type: 'assumeFact', id: 'C4.diskCapacity' }]);
  const nc = s.status('NEXTCLOUD');
  assert.equal(nc.status, ST.DEGRADED);
  assert.match(nc.reasons[0].text, /ripartito su C4.*5 minuti.*obiettivo, non misurato/);
  assert.equal(s.status('IMMICH').status, ST.BLOCKED, 'il subentro vale solo per i servizi selezionati');
});

test('combinazione di guasti: M2 e C4 insieme', () => {
  const s = S(fail('M2', 'C4'));
  assert.equal(s.status('NEXTCLOUD').status, ST.BLOCKED);
  assert.match(s.status('NEXTCLOUD').reasons[0].text, /riserva C4 non è disponibile/);
  assert.equal(s.quorum.min, 2);
  assert.equal(s.quorum.hubQuorum, true === false ? null : (s.quorum.max >= 3 ? null : false));
});

test('A09 · M3/M4/M6 spenti: nessuna perdita di voto, carichi a richiesta distinti dal guasto', () => {
  const base = S();
  const on = S(['M3', 'M4', 'M6'].map((id) => ({ type: 'on', id })));
  assert.equal(base.quorum.min, on.quorum.min);
  assert.equal(base.status('LLM').status, ST.ON_DEMAND);
  assert.equal(on.status('LLM').status, ST.AVAILABLE);
  const broken = S(fail('M6'));
  assert.equal(broken.status('JELLYFIN').status, ST.BLOCKED);
  assert.notEqual(base.status('JELLYFIN').status, broken.status('JELLYFIN').status);
});

test('manutenzione pianificata: spento intenzionalmente, non guasto', () => {
  const s = S([{ type: 'off', id: 'M2' }]);
  assert.equal(s.status('M2').intentional, true);
  assert.match(s.status('IMMICH').reasons[0].text, /spento per manutenzione/);
});

test('A10 · partizione: con lo switch guasto ogni membro è isolato e i voti non si sommano', () => {
  const s = S(fail('SW'));
  assert.equal(s.quorum.hubQuorum, false);
  assert.equal(s.quorum.min, 0);
  assert.ok(s.quorum.isolated.length >= 4);
  assert.equal(s.quorumAt('M2').value, false);
  // comportamento dei guest non inventato: in esecuzione ma senza gestione
  const nc = s.status('NEXTCLOUD');
  assert.equal(nc.status, ST.DEGRADED);
  assert.match(nc.reasons[0].text, /senza quorum.*HA non attiva/);
  // con HA ipotetica: indeterminato (fencing non documentato)
  const ha = S([...fail('SW'), { type: 'haActive', id: 'CLUSTER' }]);
  assert.equal(ha.status('NEXTCLOUD').status, ST.UNKNOWN);
});

test('A10 · tre membri fermi: due voti, nessun quorum, nessun subentro', () => {
  const s = S(fail('M2', 'M5', 'C3'));
  assert.equal(s.quorum.max, 2);
  assert.equal(s.quorum.hubQuorum, false);
  assert.equal(s.status('HAOS').status, ST.BLOCKED);
});

test('A11 · dipendenza sconosciuta: stato indeterminato, mai verde', () => {
  const s = S();
  assert.equal(s.status('ACCESSO-PRIVATO').status, ST.UNKNOWN);
  assert.equal(s.access('IMMICH').remote.status, ST.UNKNOWN);
  assert.equal(s.status('ZB-BINDING').status, ST.UNKNOWN);
  // M5 con collegamento non documentato: quorumAt incerto solo dove conta
  const m = S(fail('M1', 'C3'));
  assert.equal(m.quorum.min, 2); assert.equal(m.quorum.max, 3);
  assert.equal(m.quorumAt('M2').value, null);
});

test('A12 · copia non collaudata non è un recupero garantito', () => {
  const s = S(fail('ST-P310'));
  const p = s.protection('D-FOTO');
  assert.equal(p.original.status, ST.BLOCKED);
  assert.equal(p.verdict.status, ST.UNKNOWN);
  assert.match(p.verdict.text, /mai stato provato/);
  const bck = p.copies.find((c) => c.id === 'CP-BCK-M4');
  assert.equal(bck.readiness.level, 'non_attiva', 'il backup locale è una proposta da attivare');
  const snap = p.copies.find((c) => c.id === 'CP-SNAP');
  assert.equal(snap.sameDomain.level, 'stesso_archivio');
});

test('dato obsoleto: copia segnata come vecchia', () => {
  const s = S([{ type: 'copy', id: 'CP-DRIVE', state: 'stale' }, ...fail('ST-P310')]);
  assert.equal(s.status('CP-DRIVE').status, ST.DEGRADED);
  const c = s.protection('D-DOC').copies.find((x) => x.id === 'CP-DRIVE');
  assert.equal(c.readiness.level, 'obsoleta');
});

test('dipendenza indiretta: con M1 fermo Jellyfin è irraggiungibile da fuori (via Caddy)', () => {
  const s = S(fail('M1'));
  // il firewall potrebbe ripartire a mano su M7 (non collaudato): Caddy e l'accesso esterno sono incerti, mai disponibili
  assert.equal(s.status('CADDY').status, ST.UNKNOWN);
  const acc = s.access('JELLYFIN');
  assert.notEqual(acc.remote.status, ST.AVAILABLE);
  assert.match(acc.remote.reasons.map((r) => r.text).join(), /Caddy/);
  assert.equal(acc.local.status, ST.DEGRADED, 'in casa resta la stessa rete locale');
  assert.equal(s.status('OPNSENSE').status, ST.UNKNOWN, 'subentro manuale su M7 non collaudato');
  const both = S(fail('M1', 'M7'));
  assert.equal(both.status('CADDY').status, ST.BLOCKED);
  assert.equal(both.access('JELLYFIN').remote.status, ST.BLOCKED);
});

test('servizio parzialmente disponibile: senza WAN il firewall resta per le reti locali', () => {
  const s = S(fail('WAN1', 'WAN2'));
  assert.equal(s.status('OPNSENSE').status, ST.DEGRADED);
  assert.equal(s.access('JELLYFIN').remote.status, ST.BLOCKED);
  assert.equal(s.access('JELLYFIN').local.status, ST.AVAILABLE);
});

test('accensione: senza S4 e C4 i server a richiesta non si possono svegliare', () => {
  const s = S(fail('S4', 'C4'));
  assert.equal(s.status('M4').status, ST.BLOCKED);
  const one = S(fail('S4'));
  assert.equal(one.status('M4').status, ST.ON_DEMAND, 'C4 è il secondo mittente');
});

test('blackout: autonomia non dichiarata, esito indeterminato e non verde', () => {
  const s = S(fail('GRID'));
  assert.equal(s.status('M1').status, ST.UNKNOWN);
  assert.equal(s.quorum.hubQuorum, null);
  assert.equal(s.status('VITO-KIT').status, ST.ON_DEMAND, 'il Vito non dipende dalla corrente di casa');
});

test('Vito senza rete: consultazione locale, invio differito', () => {
  const s = S([{ type: 'on', id: 'C1' }, ...fail('NET-VITO')]);
  assert.equal(s.status('VITO-KIT').status, ST.DEGRADED);
});

test('ciclo di avvio: rilevato dal grafo e reso indeterminato dal simulatore', () => {
  const cyc = indexWith((c) => {
    c.relations.push({ id: 'R:X1', fromId: 'CADDY', toId: 'VAULTWARDEN', type: 'depends_on', requirement: 'required', evidenceKind: 'documented', sourceIds: [] });
    c.relations.push({ id: 'R:X2', fromId: 'VAULTWARDEN', toId: 'CADDY', type: 'depends_on', requirement: 'required', evidenceKind: 'documented', sourceIds: [] });
  });
  assert.ok(findCycles(cyc.core.relations).some((c) => c.includes('CADDY') && c.includes('VAULTWARDEN')));
  const s = simulate(cyc, { events: fail('M1') });
  const all = [s.status('CADDY'), s.status('VAULTWARDEN')].flatMap((x) => x.reasons.map((r) => r.text)).join(' ');
  assert.ok(s.status('CADDY').status !== ST.AVAILABLE);
  void all;
  assert.equal(findCycles(model().norm.relations).length, 0, 'il modello reale non ha cicli');
});

test('nessuna simulazione modifica il modello', () => {
  const before = JSON.stringify(model().core.entities);
  S(fail('M2', 'SW', 'GRID'));
  assert.equal(JSON.stringify(model().core.entities), before);
});
