// Ricerca locale: codici esatti prima, italiano senza accenti, sinonimi curati, motivo del risultato.
// Restituisce segmenti di testo (mai HTML) per un'evidenziazione sicura.

export const normalize = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’'`]/g, ' ');
const STOP = new Set('il lo la i gli le un una uno di da in con su per tra fra e o a al allo alla ai agli alle del dello della dei degli delle nel nella nei sul sulla che non come cosa se mi ti si ci vi è e sono ho ha mio mia miei mie'.split(' '));
export function stem(w) {
  if (w.length <= 4) return w;
  return w.replace(/(azioni|azione|amenti|amento|mente|ità|ita|ioni|ione|ere|are|ire|i|e|a|o)$/, '') || w;
}
export function tokens(s) {
  return normalize(s).split(/[^a-z0-9.+-]+/).map((t) => t.replace(/^[.-]+|[.-]+$/g, '')).filter((t) => t && !STOP.has(t));
}
const CODE = /^(inf-\d{2}\.\d{2}|atl-\d{2}|rev[34]-[a-z]+|inv-\d{3}|[mcs]\d|mp\d|a-\d\.\d|t-[a-z0-9-]+|dec-[a-z0-9-]+|pr-[a-z0-9-]+)$/i;

/** docs: [{id, type, title, codes:[], text, scope, route, roadmap}] */
export function buildSearch(docs, synonyms = { groups: [] }) {
  const prepared = docs.map((d) => {
    const titleT = tokens(d.title);
    const textN = normalize(d.text || '');
    return { d, titleN: normalize(d.title), titleStems: new Set(titleT.map(stem)), textN, textStems: new Set(tokens(d.text || '').map(stem)), codesN: (d.codes || []).map(normalize) };
  });
  const syn = synonyms.groups.map((g) => ({ ...g, wordsN: g.words.map(normalize) }));
  return { prepared, syn };
}

export function search(index, query, { type = null, scope = null, includeRoadmap = false, limit = 50 } = {}) {
  const q = normalize(query).trim();
  if (!q) return { results: [], total: 0, excluded: 0, query: q, expansions: [] };
  const qt = tokens(q);
  const qs = qt.map(stem);
  // sinonimi: frase intera o parole
  const expansions = [];
  const boostIds = new Map();
  for (const g of index.syn) {
    const hit = g.wordsN.find((w) => (w.includes(' ') ? q.includes(w) : qt.includes(w) || qs.includes(stem(w))));
    if (hit) { expansions.push({ word: hit, means: g.means, entities: g.entities, terms: g.terms }); [...g.entities, ...(g.docs || [])].forEach((id) => boostIds.set(id, `«${hit}» → ${g.means}`)); }
  }
  const extraStems = expansions.flatMap((e) => e.terms.flatMap((t) => tokens(t).map(stem)));
  const scored = [];
  for (const p of index.prepared) {
    let score = 0; const why = [];
    if (p.codesN.some((c) => c === q)) { score += 1000; why.push('codice esatto'); }
    else if (CODE.test(q) && p.codesN.some((c) => c.startsWith(q))) { score += 400; why.push('inizio del codice'); }
    if (p.titleN === q) { score += 300; why.push('titolo esatto'); }
    let matched = 0;
    for (const s of qs) {
      if (p.titleStems.has(s)) { score += 30; matched++; }
      else if ([...p.titleStems].some((t) => t.startsWith(s) && s.length >= 3)) { score += 15; matched++; }
      else if (p.textStems.has(s)) { score += 6; matched++; }
    }
    if (matched && matched === qs.length && qs.length > 1) { score += 25; why.push('tutte le parole'); }
    else if (matched) why.push(`${matched} parol${matched > 1 ? 'e' : 'a'} su ${qs.length}`);
    if (q.length > 3 && p.textN.includes(q) && qs.length > 1) { score += 20; why.push('frase esatta'); }
    if (boostIds.has(p.d.id)) { score += 60 + (p.d.type === 'servizio' ? 8 : 0); why.unshift(boostIds.get(p.d.id)); }
    else if (extraStems.some((s) => p.titleStems.has(s))) { score += 20; why.push('termine collegato'); }
    if (score > 0) scored.push({ doc: p.d, score, why });
  }
  scored.sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title, 'it'));
  let excluded = 0;
  const filtered = scored.filter((r) => {
    if (type && r.doc.type !== type) return false;
    if (scope && !(r.doc.scopes || []).includes(scope)) return false;
    if (!includeRoadmap && r.doc.roadmap && !r.why.includes('codice esatto')) { excluded++; return false; }
    return true;
  });
  const results = filtered.slice(0, limit).map((r) => ({ ...r, snippet: snippet(r.doc.text || '', [...qt, ...expansions.flatMap((e) => tokens(e.terms.join(' ')))]) }));
  return { results, total: filtered.length, excluded, query: q, expansions };
}

/** Estratto con segmenti {t, hit}: l'interfaccia li rende come testo, senza HTML. */
export function snippet(text, words, size = 180) {
  const tn = normalize(text);
  const stems = words.map(stem).filter((w) => w.length >= 2);
  let pos = -1;
  for (const s of stems) { const i = tn.indexOf(s); if (i >= 0 && (pos < 0 || i < pos)) pos = i; }
  const start = Math.max(0, pos < 0 ? 0 : pos - 60);
  const end = Math.min(text.length, start + size);
  const raw = text.slice(start, end);
  const rn = tn.slice(start, end);
  const marks = new Array(raw.length).fill(false);
  for (const s of stems) { let i = rn.indexOf(s); while (i >= 0) { for (let k = i; k < i + s.length; k++) marks[k] = true; i = rn.indexOf(s, i + s.length); } }
  const segs = [];
  for (let i = 0; i < raw.length; i++) {
    const last = segs[segs.length - 1];
    if (last && last.hit === marks[i]) last.t += raw[i]; else segs.push({ t: raw[i], hit: marks[i] });
  }
  if (start > 0) segs.unshift({ t: '… ', hit: false });
  if (end < text.length) segs.push({ t: ' …', hit: false });
  return segs;
}
