// Carica i sorgenti in content/ e produce il modello normalizzato (contratti Fact/Relation).
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const J = (root, p) => JSON.parse(readFileSync(join(root, p), 'utf8'));

export function loadSources(root) {
  const m = (f) => J(root, `content/model/${f}`);
  const l = (f) => J(root, `content/legacy/${f}`);
  const results = existsSync(join(root, 'content/model/test-results.json')) ? m('test-results.json') : [];
  return {
    meta: m('meta.json'), scopes: m('scopes.json'),
    entities: [...m('infra.json'), ...m('services.json'), ...m('data.json')],
    tests: m('tests.json'), testResults: results, roadmap: m('roadmap.json'), decisions: m('decisions.json'),
    issues: m('issues.json'), procedures: m('procedures.json'), paths: m('paths.json'), glossary: m('glossary.json'),
    synonyms: m('synonyms.json'), connectors: m('connectors.json'), energy: m('energy.json'), scenarios: m('scenarios.json'),
    cards: J(root, 'content/corpus/cards.json'), groups: loadGroups(root),
    legacy: { config: l('config.json'), hardware: l('hardware.json'), inventory: l('inventory.json'), photos: l('photos.json'), ecosystem: l('ecosystem.json'), opportunities: l('opportunities.json'), profiles: l('profiles.json'), blocks: l('blocks.json'), glossary: l('glossary-44.json'), diagrams: l('diagrams.json') },
  };
}

export function parseGroup(text) {
  const head = text.match(/^<!--faldone (\{.*?\}) -->\n/);
  if (!head) throw new Error('intestazione del gruppo mancante');
  const meta = JSON.parse(head[1]);
  const rest = text.slice(head[0].length);
  const parts = rest.split(/<!--tail ([A-Z0-9.-]+)-->\n/);
  const tails = {};
  for (let i = 1; i < parts.length; i += 2) tails[parts[i]] = parts[i + 1].trim();
  return { ...meta, html: parts[0].trim(), tails };
}
function loadGroups(root) {
  const dir = join(root, 'content/corpus/schede');
  return readdirSync(dir).filter((f) => f.endsWith('.html')).sort().map((f) => ({ id: f.replace('.html', ''), ...parseGroup(readFileSync(join(dir, f), 'utf8')) }));
}

const normFact = (f) => {
  if (!f || typeof f !== 'object') return f;
  const o = { value: f.value ?? null, evidenceKind: f.evidenceKind || f.ev || 'documented', sourceIds: f.sourceIds || f.src || [] };
  if (f.unit) o.unit = f.unit;
  if (f.verifiedAt !== undefined) o.verifiedAt = f.verifiedAt;
  if (f.note) o.note = f.note;
  return o;
};
const normStatus = (s) => s ? { decision: s.decision || null, realization: s.realization || null, observation: 'non_rilevato', access: 'pubblico', note: s.note || null, sourceIds: s.src || s.sourceIds || [] } : { decision: null, realization: null, observation: 'non_rilevato', access: 'pubblico', note: null, sourceIds: [] };
const MECH_REL = { replica: 'replicates_to', backup: 'backs_up_to', offsite: 'backs_up_to', offline: 'backs_up_to', transit: 'backs_up_to' };

export function normalize(src) {
  const relations = [];
  const used = new Set();
  const addRel = (r) => {
    let id = r.id || `R:${r.fromId}:${r.type}:${r.toId}`;
    let n = 2; while (used.has(id)) id = `${r.id || `R:${r.fromId}:${r.type}:${r.toId}`}#${n++}`;
    used.add(id);
    relations.push({ ...r, id });
  };
  const hw = src.legacy.hardware.nodes || {};
  const entities = src.entities.map((raw) => {
    const e = { ...raw };
    delete e.rel;
    e.facts = Object.fromEntries(Object.entries(raw.facts || {}).map(([k, v]) => [k, normFact(v)]));
    e.status = normStatus(raw.status);
    e.cards = raw.cards || [];
    if (raw.hardwareRef && hw[raw.hardwareRef]) e.hardware = hardwareFacts(hw[raw.hardwareRef], e.cards[0]);
    if (raw.assignments) e.assignments = raw.assignments.map((a) => ({ ...a, evidenceKind: a.ev || 'documented', sourceIds: a.src || [] }));
    for (const [type, to, opts = {}] of raw.rel || []) {
      addRel({
        id: opts.id ? `R:${raw.id}:${opts.id}` : undefined,
        fromId: raw.id, toId: to, type,
        requirement: type === 'depends_on' || type === 'stores_on' ? (opts.req || 'required') : opts.req,
        condition: opts.cond, evidenceKind: opts.ev || 'documented', sourceIds: opts.src || e.cards.slice(0, 2),
        label: opts.label, note: opts.note, phase: opts.phase, manual: opts.manual || undefined,
      });
    }
    for (const d of raw.protects || []) {
      addRel({ fromId: d, toId: raw.id, type: MECH_REL[raw.mechanism] || 'protected_by', mechanism: raw.mechanism, evidenceKind: 'documented', sourceIds: e.cards.slice(0, 2) });
    }
    for (const c of e.cards) addRel({ fromId: raw.id, toId: c, type: 'documented_by', evidenceKind: 'documented', sourceIds: [c] });
    return e;
  });
  // relazioni della roadmap
  for (const t of src.roadmap.tasks) {
    for (const a of t.after || []) addRel({ fromId: t.id, toId: a, type: 'blocked_by', evidenceKind: 'documented', sourceIds: ['REV4-ROAD'] });
    for (const x of t.tests || []) addRel({ fromId: t.id, toId: x, type: 'validated_by', evidenceKind: 'documented', sourceIds: ['REV4-TEST'] });
    for (const d of t.decisions || []) addRel({ fromId: t.id, toId: d, type: 'blocked_by', evidenceKind: 'documented', sourceIds: ['REV3-OPEN'] });
  }
  // alias storici: rotte del sito 4.4 e codici del gruppo
  const aliases = {};
  for (const s of src.scopes) aliases[s.legacyRoute] = `ambito/${s.id}`;
  Object.assign(aliases, {
    home: '', nodes: 'esplora/macchine', vito: 'ambito/vito', storage: 'esplora/dati', network: 'esplora/rete', roadmap: 'realizza',
    services: 'esplora/servizi', power: 'costi', acquisitions: 'realizza/acquisti', library: 'documenti', changes: 'documenti/revisioni',
    downloads: 'documenti/download', guide: 'guida', atlas: 'esplora', clients: 'ambito/casa', field: 'ambito/casa', inventory: 'ambito/inventario',
    rack: 'esplora/rack', reuse: 'ambito/inventario', synergy: 'esplora', worlds: 'esplora', map: 'mappa', savings: 'costi', glossary: 'glossario',
    sim: 'simula', tour: 'presenta',
  });
  for (const id of entities.filter((e) => e.kind === 'node').map((e) => e.id)) aliases[`node/${id}`] = `e/${id}`;
  return { entities, relations, aliases };
}

function hardwareFacts(h, card) {
  const src = card ? [card] : [];
  const f = (value, unit, note) => ({ value: value ?? null, evidenceKind: value === null || value === undefined ? 'unknown' : 'documented', sourceIds: src, ...(unit ? { unit } : {}), ...(note ? { note } : {}) });
  return {
    platform: f(h.platform),
    cpu: f(h.cpu?.model), cores: f(h.cpu?.cores), threads: f(h.cpu?.threads),
    tdp: f(h.cpu?.tdp_w, 'W', 'Potenza termica del processore: non è il consumo alla presa.'),
    ram: f(h.ram?.gb, 'GB'), ramType: f(h.ram?.type),
    disks: (h.disks || []).map((d) => ({ model: d.model, quantity: d.quantity, role: d.role, layout: d.layout || null, inventory: d.inventory_code || null })),
    devices: (h.connected_devices || []).map((d) => ({ model: d.model, ports: d.ports || null, role: d.role || null, inventory: d.inventory_code || null })),
    role: f(h.role),
  };
}
