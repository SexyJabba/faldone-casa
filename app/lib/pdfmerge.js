// Unisce PDF semplici, senza dipendenze: serve a comporre il Faldone stampabile (blocco o intero)
// dalle singole schede. Capisce i PDF a tabella xref classica, come quelli prodotti da Chromium;
// davanti a un formato diverso si ferma con un errore invece di produrre un file sbagliato.
// Puro: lavora su Uint8Array, funziona nel browser e in Node.

const str = (u8, a, b) => { let s = ''; for (let i = a; i < b; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, Math.min(b, i + 8192))); return s; };
const bytes = (s) => { const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 255; return u; };
const isWs = (c) => c === 32 || c === 10 || c === 13 || c === 9 || c === 12 || c === 0;
const at = (u8, i, word) => { for (let k = 0; k < word.length; k++) if (u8[i + k] !== word.charCodeAt(k)) return false; return true; };
const fail = (m) => { throw new Error(`PDF non componibile: ${m}`); };

function lastIndexOf(u8, word, from) {
  for (let i = Math.min(from, u8.length - word.length); i >= 0; i--) if (at(u8, i, word)) return i;
  return -1;
}

/** Legge un oggetto: testo diviso in tratti (codice / stringa) e, se c'è, i byte dello stream. */
function readObject(u8, off) {
  const head = /^(\d+)\s+(\d+)\s+obj/.exec(str(u8, off, off + 32));
  if (!head) fail(`oggetto atteso alla posizione ${off}`);
  let i = off + head[0].length;
  const parts = []; let run = i; let depth = 0;
  const flush = (end) => { if (end > run) parts.push({ code: true, s: str(u8, run, end) }); };
  for (; i < u8.length;) {
    const c = u8[i];
    if (c === 0x28) { // stringa letterale: copiata com'è
      flush(i); let j = i + 1; let d = 1;
      while (d > 0 && j < u8.length) { const x = u8[j]; if (x === 0x5c) { j += 2; continue; } if (x === 0x28) d++; else if (x === 0x29) d--; j++; }
      parts.push({ code: false, s: str(u8, i, j) }); i = j; run = i; continue;
    }
    if (c === 0x3c) { if (u8[i + 1] === 0x3c) { depth++; i += 2; continue; } while (i < u8.length && u8[i] !== 0x3e) i++; i++; continue; }
    if (c === 0x3e && u8[i + 1] === 0x3e) { depth--; i += 2; continue; }
    if (c === 0x25) { while (i < u8.length && u8[i] !== 10 && u8[i] !== 13) i++; continue; }
    if (depth === 0 && c === 0x65 && at(u8, i, 'endobj')) { flush(i); return { num: +head[1], parts, stream: null }; }
    if (depth === 0 && c === 0x73 && at(u8, i, 'stream')) {
      flush(i);
      let p = i + 6; if (u8[p] === 13) p++; if (u8[p] === 10) p++;
      return { num: +head[1], parts, stream: p };
    }
    i++;
  }
  return fail(`oggetto ${head[1]} senza fine`);
}

const code = (o) => o.parts.filter((p) => p.code).map((p) => p.s).join(' ');

/** Struttura di un PDF: oggetti, pagine nell'ordine di lettura, versione. */
export function parsePdf(u8) {
  if (!(u8 instanceof Uint8Array)) u8 = new Uint8Array(u8);
  if (!at(u8, 0, '%PDF-')) fail('intestazione mancante');
  const sx = lastIndexOf(u8, 'startxref', u8.length);
  if (sx < 0) fail('startxref mancante');
  const xoff = +(/startxref\s+(\d+)/.exec(str(u8, sx, Math.min(u8.length, sx + 40))) || [])[1];
  if (!Number.isFinite(xoff) || !at(u8, xoff, 'xref')) fail('tabella xref non classica');
  const offs = new Map();
  let i = xoff + 4;
  for (;;) {
    while (isWs(u8[i])) i++;
    if (at(u8, i, 'trailer')) break;
    const sub = /^(\d+)\s+(\d+)\s*/.exec(str(u8, i, i + 30));
    if (!sub) fail('sezione xref illeggibile');
    i += sub[0].length;
    for (let k = 0; k < +sub[2]; k++) {
      const e = /^(\d{10}) (\d{5}) ([nf])/.exec(str(u8, i, i + 18));
      if (!e) fail('voce xref illeggibile');
      if (e[3] === 'n') offs.set(+sub[1] + k, +e[1]);
      i += 18; while (isWs(u8[i])) i++;
    }
  }
  const trailer = str(u8, i, sx);
  if (/\/Prev\b/.test(trailer)) fail('aggiornamenti incrementali non gestiti');
  if (/\/Encrypt\b/.test(trailer)) fail('file cifrato');
  const root = +(/\/Root\s+(\d+)\s+\d+\s+R/.exec(trailer) || [])[1];
  const info = +(/\/Info\s+(\d+)\s+\d+\s+R/.exec(trailer) || [])[1] || null;
  if (!root) fail('catalogo mancante');
  const objs = new Map();
  for (const [n, o] of offs) {
    const ob = readObject(u8, o);
    if (ob.stream !== null) {
      const c = code(ob);
      const direct = /\/Length\s+(\d+)(?!\s+\d+\s+R)/.exec(c);
      let len = direct ? +direct[1] : null;
      if (len === null) { const ref = /\/Length\s+(\d+)\s+\d+\s+R/.exec(c); const lo = ref && offs.get(+ref[1]); if (lo === undefined || lo === null) fail(`stream ${n} senza lunghezza`); len = +code(readObject(u8, lo)).trim(); ob.lenRef = +ref[1]; }
      ob.data = u8.subarray(ob.stream, ob.stream + len); ob.len = len;
    }
    objs.set(n, ob);
  }
  // albero delle pagine, in ordine
  const pagesRoot = +(/\/Pages\s+(\d+)\s+\d+\s+R/.exec(code(objs.get(root) || fail('catalogo illeggibile'))) || [])[1];
  const pages = []; const nodes = new Set();
  const walk = (n, inherited) => {
    const o = objs.get(n); if (!o) fail(`pagina ${n} mancante`);
    const c = code(o);
    if (/\/Type\s*\/Pages\b/.test(c)) {
      if (nodes.has(n)) fail('albero delle pagine ciclico'); nodes.add(n);
      const box = /\/MediaBox\s*(\[[^\]]*\])/.exec(c);
      if (/\/Resources\b/.test(c)) fail('risorse ereditate non gestite');
      const kids = /\/Kids\s*\[([^\]]*)\]/.exec(c);
      for (const k of (kids ? kids[1] : '').matchAll(/(\d+)\s+\d+\s+R/g)) walk(+k[1], box ? box[1] : inherited);
    } else pages.push({ num: n, mediaBox: /\/MediaBox\b/.test(c) ? null : inherited });
  };
  walk(pagesRoot, null);
  return { u8, objs, pages, skip: new Set([root, ...nodes, ...(info ? [info] : [])]), version: str(u8, 5, 8) };
}

/** Numero di pagine di un PDF. */
export const pageCount = (u8) => parsePdf(u8).pages.length;

const hex16 = (s) => { let h = 'FEFF'; for (const ch of String(s)) { const cp = ch.codePointAt(0); if (cp > 0xffff) { const v = cp - 0x10000; h += (0xd800 + (v >> 10)).toString(16) + (0xdc00 + (v & 1023)).toString(16); } else h += cp.toString(16).padStart(4, '0'); } return `<${h.toUpperCase()}>`; };

/**
 * Unisce più PDF nell'ordine dato. Ritorna i byte del nuovo file.
 * Si perdono segnalibri e destinazioni interne (i rimandi a pagine); restano testo, caratteri e collegamenti esterni.
 */
export function mergePdfs(list, { title = '', date = null } = {}) {
  if (!list.length) fail('nessun file');
  const docs = list.map((x) => (x.objs ? x : parsePdf(x)));
  const chunks = []; let pos = 0; const xref = [];
  const put = (x) => { const b = typeof x === 'string' ? bytes(x) : x; chunks.push(b); pos += b.length; };
  put(`%PDF-${docs.reduce((v, d) => (d.version > v ? d.version : v), '1.4')}\n%\xE2\xE3\xCF\xD3\n`);
  let next = 4; const kids = [];
  for (const d of docs) {
    const map = new Map();
    for (const n of d.objs.keys()) if (!d.skip.has(n)) map.set(n, next++);
    const pageSet = new Map(d.pages.map((p) => [p.num, p]));
    for (const [n, o] of d.objs) {
      if (d.skip.has(n)) continue;
      let text = o.parts.map((p) => (p.code ? p.s.replace(/(\d+)\s+(\d+)\s+R(?![A-Za-z0-9])/g, (m, a) => (map.has(+a) ? `${map.get(+a)} 0 R` : 'null')) : p.s)).join('').trim();
      const pg = pageSet.get(n);
      if (pg) {
        text = text.replace(/\/Parent\s+(null|\d+\s+0\s+R)/, '/Parent 2 0 R');
        if (!/\/Parent 2 0 R/.test(text)) fail('pagina senza genitore');
        if (pg.mediaBox) text = text.replace(/\/Parent 2 0 R/, `/Parent 2 0 R /MediaBox ${pg.mediaBox}`);
        kids.push(map.get(n));
      }
      if (o.lenRef) text = text.replace(/\/Length\s+(null|\d+\s+0\s+R)/, `/Length ${o.len}`);
      xref[map.get(n)] = pos;
      put(`${map.get(n)} 0 obj\n${text}\n`);
      if (o.data) { put('stream\n'); put(o.data); put('\nendstream\n'); }
      put('endobj\n');
    }
  }
  xref[1] = pos; put('1 0 obj\n<</Type /Catalog /Pages 2 0 R>>\nendobj\n');
  xref[2] = pos; put(`2 0 obj\n<</Type /Pages /Count ${kids.length} /Kids [${kids.map((k) => `${k} 0 R`).join(' ')}]>>\nendobj\n`);
  const stamp = date ? `/CreationDate (D:${String(date).replace(/[^0-9]/g, '').slice(0, 14)})` : '';
  xref[3] = pos; put(`3 0 obj\n<</Producer (Il Faldone)${title ? ` /Title ${hex16(title)}` : ''}${stamp}>>\nendobj\n`);
  const xoff = pos;
  let table = `xref\n0 ${next}\n0000000000 65535 f \n`;
  for (let n = 1; n < next; n++) table += `${String(xref[n]).padStart(10, '0')} 00000 n \n`;
  put(`${table}trailer\n<</Size ${next} /Root 1 0 R /Info 3 0 R>>\nstartxref\n${xoff}\n%%EOF\n`);
  const out = new Uint8Array(pos); let o = 0;
  for (const c of chunks) { out.set(c, o); o += c.length; }
  return out;
}
