// Comandi della ricerca: domande e azioni riconosciute da forme fisse, risolte sul modello.
// Modulo puro. Nessuna risposta generata: ogni comando porta a una vista che calcola dai dati.
import { normalize, tokens, stem } from './search.js';

const PAGES = [
  ['mappa', 'Mappa relazionale', 'mappa relazioni schema grafo'],
  ['mappa?sim=1', 'Simula un guasto sulla mappa', 'simula simulazione guasto mappa'],
  ['simula', 'Simulatore di dipendenze e guasti', 'simulatore simula guasto scenario'],
  ['emergenza', 'Qualcosa non funziona?', 'emergenza problema guasto aiuto procedura'],
  ['realizza', 'Roadmap', 'roadmap fasi attivita realizza piano'],
  ['realizza/decisioni', 'Decisioni', 'decisioni scelte'],
  ['realizza/collaudi', 'Collaudi', 'collaudi prove test'],
  ['realizza/acquisti', 'Acquisti', 'acquisti ordini consegne'],
  ['costi', 'Energia e costi', 'costi energia consumi bolletta'],
  ['inventario', 'Inventario', 'inventario materiale componenti hardware pezzi'],
  ['glossario', 'Glossario', 'glossario termini parole significato'],
  ['documenti', 'Schede del Faldone', 'schede documenti documentazione'],
  ['documenti/download', 'Download', 'download pdf scarica epub'],
  ['esplora/macchine', 'Macchine', 'macchine server nodi'],
  ['esplora/servizi', 'Servizi', 'servizi applicazioni app'],
  ['esplora/dati', 'Dati e copie', 'dati copie backup protezioni'],
  ['esplora/rack', 'Rack e porte', 'rack porte switch'],
  ['impianti', 'Impianti di casa', 'impianti vmc casa'],
  ['percorsi', 'Percorsi leggibili', 'percorsi flusso'],
  ['presenta', 'Il progetto in cinque minuti', 'presentazione progetto cinque minuti tour'],
  ['preferiti', 'Preferiti e dati locali', 'preferiti impostazioni dati locali offline esporta'],
  ['contribuisci', 'Questioni aperte', 'questioni domande aperte contribuisci segnala'],
].map(([route, title, kw]) => ({ route, title, stems: new Set(tokens(title + ' ' + kw).map(stem)) }));

/** Trova un elemento del modello da un testo libero: sigla, nome, poi sinonimi curati. */
export function findEntity(core, text, { kinds = null } = {}) {
  const q = normalize(text).replace(/[?!.,;:]+/g, ' ').replace(/\b(il|lo|la|i|gli|le|un|una|mio|mia|miei|mie|di|del|della|dei|delle)\b/g, ' ').replace(/\s+/g, ' ').trim();
  if (!q) return null;
  const pool = core.entities.filter((e) => !kinds || kinds.includes(e.kind));
  const n = (e) => normalize(e.name);
  let hit = pool.find((e) => normalize(e.id) === q) || pool.find((e) => n(e) === q) || pool.find((e) => n(e).startsWith(q) && q.length >= 3)
    || pool.find((e) => q.length >= 4 && n(e).split(/[^a-z0-9]+/).includes(q));
  if (hit) return hit;
  const qt = tokens(q), qs = qt.map(stem);
  for (const g of core.synonyms?.groups || []) {
    const w = g.words.map(normalize);
    if (w.some((x) => (x.includes(' ') ? q.includes(x) : qt.includes(x) || qs.includes(stem(x))))) {
      const e = g.entities.map((id) => pool.find((p) => p.id === id)).find(Boolean);
      if (e) return e;
    }
  }
  return pool.find((e) => q.length >= 4 && n(e).includes(q)) || pool.find((e) => q.length >= 4 && normalize(e.title || '').split(/[^a-z0-9]+/).includes(q)) || null;
}

const RX = {
  fail: /^(?:(?:che )?cosa succede se|che succede se|se)\s+(?:manca|si rompe|si spegne|si guasta|si ferma|cade|salta|non va|non funziona|spengo|stacco)\s+(.+)$|^(?:spegni|spegnere|guasta|simula(?: guasto(?: di)?)?|senza|stacca)\s+(.+)$/,
  compare: /^confronta(?:re)?\s+(.+?)\s+(?:e|con|vs|contro)\s+(.+)$/,
  where: /^dove\s+(?:sta|stanno|sono|si trova|si trovano|finisce|finiscono|salvo|tengo|vanno|va)\s+(.+)$/,
  deps: /^(?:da (?:che )?cosa dipende|cosa serve (?:a|per)|di cosa ha bisogno)\s+(.+)$/,
  uses: /^(?:chi usa|cosa gira su|cosa c e su|cosa dipende da|a cosa serve)\s+(.+)$/,
};

/** Restituisce i comandi che corrispondono alla richiesta: [{title, sub, route, kind}] (al massimo `limit`). */
export function commands(core, query, { limit = 4 } = {}) {
  const q = normalize(query).replace(/[?!.]+$/g, '').replace(/\s+/g, ' ').trim();
  if (q.length < 2) return [];
  const out = [];
  const add = (title, sub, route, kind = 'azione') => { if (!out.some((o) => o.route === route)) out.push({ title, sub, route, kind }); };
  let m;
  if ((m = q.match(RX.fail))) {
    const e = findEntity(core, m[1] || m[2], { kinds: ['node', 'device', 'network', 'storage', 'service'] });
    if (e) {
      add(`Simula sulla mappa: ${e.name} indisponibile`, 'Colora la mappa con gli effetti calcolati dal modello', `mappa?sim=1&f=${e.id}&s=${e.id}`);
      add(`Effetti e cause nel simulatore: senza ${e.name}`, 'Elenco di che cosa puoi ancora fare, con il perché', `simula?f=${e.id}`);
    }
  } else if ((m = q.match(RX.compare))) {
    const a = findEntity(core, m[1], { kinds: ['node'] }), b = findEntity(core, m[2], { kinds: ['node'] });
    if (a && b && a.id !== b.id) add(`Confronta ${a.name} e ${b.name}`, 'Ruolo, accensione, processore, RAM e servizi affiancati', `esplora/macchine?cmp=${a.id},${b.id}`);
  } else if ((m = q.match(RX.where))) {
    const e = findEntity(core, m[1], { kinds: ['dataset'] }) || findEntity(core, m[1]);
    if (e) {
      add(`Dove sta: ${e.name}`, 'Scheda con archivio, copie e relazioni', `e/${e.id}`);
      const qs = new Set(tokens(m[1]).map(stem));
      const p = (core.paths || []).find((x) => tokens(x.title).map(stem).some((s) => qs.has(s)));
      if (p) add(p.title, 'Percorso passo per passo', `percorsi/${p.id}`, 'percorso');
      if (e.kind === 'dataset') add('Protezioni a colpo d\'occhio', 'Matrice dati × copie', 'esplora/dati');
    }
  } else if ((m = q.match(RX.deps))) {
    const e = findEntity(core, m[1]);
    if (e) { add(`Da che cosa dipende ${e.name}`, 'Schema delle relazioni nella scheda', `e/${e.id}`); add(`${e.name} sulla mappa`, 'Dipendenze dirette e indirette evidenziate', `mappa?s=${e.id}`); }
  } else if ((m = q.match(RX.uses))) {
    const e = findEntity(core, m[1]);
    if (e) { add(`Chi si appoggia a ${e.name}`, 'Schema delle relazioni nella scheda', `e/${e.id}`); add(`Se manca ${e.name}`, 'Simulazione sulla mappa', `mappa?sim=1&f=${e.id}&s=${e.id}`); }
  }
  // destinazioni: tutte le parole della richiesta devono corrispondere a titolo o parole chiave
  const qs = tokens(q).map(stem);
  if (qs.length && qs.length <= 3) {
    for (const p of PAGES) {
      if (qs.every((s) => p.stems.has(s) || (s.length >= 3 && [...p.stems].some((t) => t.startsWith(s))))) add(p.title, 'Vai alla pagina', p.route, 'pagina');
    }
  }
  return out.slice(0, limit);
}

export const EXAMPLES = ['cosa succede se manca M2', 'dove stanno le foto', 'confronta M2 e M4', 'da cosa dipende Nextcloud', 'inventario'];

/** Aggiunge una pagina ai recenti (più recente in testa, senza doppioni). */
export function pushRecent(list, entry, max = 8) {
  if (!entry?.route || !entry.title) return list || [];
  return [entry, ...(list || []).filter((r) => r && r.route !== entry.route)].slice(0, max);
}
