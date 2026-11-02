#!/usr/bin/env node
// Adapter di riferimento, sola lettura: Zabbix → istantanea normalizzata per il Faldone.
// Gira su un server autorizzato della rete di casa, MAI nel browser. Il token resta nell'ambiente
// del server (ZABBIX_TOKEN), non nel repository, negli URL o nel sito pubblicato.
//
//   ZABBIX_URL=https://zabbix.casa.example/api_jsonrpc.php ZABBIX_TOKEN=… \
//   FALDONE_ALLOWED_HOSTS=zabbix.casa.example node tools/adapters/zabbix.mjs > istantanea.json
//
// Stato: contratto e normalizzazione verificati con dati di prova (tools/test/adapter.test.mjs).
// Nessuna istanza Zabbix è collegata: il sito mostra «non collegato».

export const SCHEMA = 'faldone-osservazione/1';
const OBS = { 0: 'disponibile', 1: 'indisponibile', 2: 'non_rilevato' }; // Zabbix host.available

/** Mappa nome host Zabbix → identificativo del Faldone. Deve essere esplicita: niente indovinelli. */
export const DEFAULT_MAP = { 'm1': 'M1', 'm2': 'M2', 'm5': 'M5', 'c3': 'C3', 'c4': 'C4', 's1': 'S1', 's3': 'S3', 's4': 'S4' };
/** Macchine a richiesta: lo stato «indisponibile» è normale se sono spente e non va trattato come guasto. */
export const ON_DEMAND = new Set(['M3', 'M4', 'M6']);

/** Normalizza la risposta di host.get + item.get (fixture o rete). Pura, testabile. */
export function normalize({ hosts = [], backup = null }, { now = new Date(), map = DEFAULT_MAP, staleAfterS = 900 } = {}) {
  const items = [];
  for (const h of hosts) {
    const id = map[String(h.host).toLowerCase()];
    if (!id) continue; // host non mappato: ignorato, non inventato
    let obs = OBS[h.available] ?? 'non_rilevato';
    if (ON_DEMAND.has(id) && obs === 'indisponibile') obs = 'spento';
    items.push({ entityId: id, observation: obs, at: h.lastAccess ? new Date(Number(h.lastAccess) * 1000).toISOString() : null, source: 'zabbix' });
  }
  if (backup && backup.lastSuccess) items.push({ entityId: 'CP-BCK-M4', observation: 'disponibile', lastSuccess: backup.lastSuccess, source: 'zabbix', note: 'job completato: non è un recupero provato' });
  return { schema: SCHEMA, connector: 'CN-ZABBIX', generatedAt: now.toISOString(), staleAfter: new Date(now.getTime() + staleAfterS * 1000).toISOString(), state: 'connesso', readOnly: true, items };
}

/** Un'istantanea vecchia o assente non è mai «tutto bene». */
export function freshness(snapshot, now = new Date()) {
  if (!snapshot) return { state: 'non_configurato' };
  if (snapshot.schema !== SCHEMA) return { state: 'errore', reason: 'schema non riconosciuto' };
  if (new Date(snapshot.staleAfter) < now) return { state: 'scaduto', since: snapshot.staleAfter };
  return { state: snapshot.state };
}

/** Destinazione consentita solo se il nome host è nell'elenco: l'adapter non è un proxy generico. */
export function checkTarget(url, allowed) {
  const u = new URL(url);
  if (u.protocol !== 'https:') throw new Error('solo https');
  if (!allowed.includes(u.hostname)) throw new Error(`host non consentito: ${u.hostname}`);
  return u;
}

async function rpc(url, token, method, params, timeoutMs) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { method: 'POST', signal: ctl.signal, headers: { 'content-type': 'application/json-rpc', authorization: `Bearer ${token}` }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json(); if (j.error) throw new Error(j.error.data || j.error.message);
    return j.result;
  } finally { clearTimeout(t); }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { ZABBIX_URL, ZABBIX_TOKEN, FALDONE_ALLOWED_HOSTS = '' } = process.env;
  if (!ZABBIX_URL || !ZABBIX_TOKEN) { console.error('Configurare ZABBIX_URL e ZABBIX_TOKEN nell\'ambiente del server (mai nel repository).'); process.exit(2); }
  try {
    const url = checkTarget(ZABBIX_URL, FALDONE_ALLOWED_HOSTS.split(',').filter(Boolean));
    // Solo letture: nessun metodo di modifica, nessun comando verso gli host, nessun Wake-on-LAN.
    const hosts = await rpc(url, ZABBIX_TOKEN, 'host.get', { output: ['host', 'available', 'lastAccess'] }, 10000);
    process.stdout.write(JSON.stringify(normalize({ hosts }), null, 1));
  } catch (e) {
    process.stdout.write(JSON.stringify({ schema: SCHEMA, connector: 'CN-ZABBIX', generatedAt: new Date().toISOString(), state: 'errore', error: String(e.message), items: [] }));
    process.exit(1);
  }
}
