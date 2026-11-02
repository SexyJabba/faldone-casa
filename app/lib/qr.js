// Generatore QR minimale (modalità byte, correzione M, versioni 1–10). Nessuna dipendenza.
// Basato sulla specifica ISO/IEC 18004; verificato contro una libreria di riferimento nei test.
const EC_M = { // [blocchi gruppo1, dati per blocco g1, blocchi g2, dati g2, ec per blocco]
  1: [1, 16, 0, 0, 10], 2: [1, 28, 0, 0, 16], 3: [1, 44, 0, 0, 26], 4: [2, 32, 0, 0, 18], 5: [2, 43, 0, 0, 24],
  6: [4, 27, 0, 0, 16], 7: [4, 31, 0, 0, 18], 8: [2, 38, 2, 39, 22], 9: [3, 36, 2, 37, 22], 10: [4, 43, 1, 44, 26],
};
const ALIGN = { 1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50] };

const EXP = new Array(512), LOG = new Array(256);
{ let x = 1; for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; } for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]; }
const mul = (a, b) => (a && b ? EXP[LOG[a] + LOG[b]] : 0);
function rsGen(n) { let g = [1]; for (let i = 0; i < n; i++) { const ng = new Array(g.length + 1).fill(0); for (let j = 0; j < g.length; j++) { ng[j] ^= g[j]; ng[j + 1] ^= mul(g[j], EXP[i]); } g = ng; } return g; }
function rsEncode(data, n) { const g = rsGen(n); const r = new Array(n).fill(0); for (const d of data) { const f = d ^ r[0]; r.shift(); r.push(0); for (let i = 0; i < n; i++) r[i] ^= mul(g[i + 1], f); } return r; }

export function qrMatrix(text, { mask = null } = {}) {
  const bytes = [...new TextEncoder().encode(text)];
  let ver = 0;
  for (let v = 1; v <= 10; v++) { const [b1, d1, b2, d2] = EC_M[v]; const cap = b1 * d1 + b2 * d2; const lenBits = v < 10 ? 8 : 16; if (4 + lenBits + bytes.length * 8 <= cap * 8) { ver = v; break; } }
  if (!ver) throw new Error('testo troppo lungo per il QR');
  const [b1, d1, b2, d2, ecn] = EC_M[ver];
  const cap = b1 * d1 + b2 * d2;
  const bits = [];
  const put = (v, n) => { for (let i = n - 1; i >= 0; i--) bits.push((v >> i) & 1); };
  put(4, 4); put(bytes.length, ver < 10 ? 8 : 16); bytes.forEach((b) => put(b, 8));
  put(0, Math.min(4, cap * 8 - bits.length)); while (bits.length % 8) bits.push(0);
  const data = []; for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(''), 2));
  for (let p = 0; data.length < cap; p++) data.push(p % 2 ? 0x11 : 0xec);
  const blocks = []; let o = 0;
  for (let i = 0; i < b1; i++) { blocks.push(data.slice(o, o + d1)); o += d1; }
  for (let i = 0; i < b2; i++) { blocks.push(data.slice(o, o + d2)); o += d2; }
  const ecs = blocks.map((b) => rsEncode(b, ecn));
  const final = [];
  for (let i = 0; i < Math.max(d1, d2); i++) for (const b of blocks) if (i < b.length) final.push(b[i]);
  for (let i = 0; i < ecn; i++) for (const e of ecs) final.push(e[i]);

  const size = ver * 4 + 17;
  const m = Array.from({ length: size }, () => new Array(size).fill(null));
  const fn = Array.from({ length: size }, () => new Array(size).fill(false));
  const set = (r, c, v) => { m[r][c] = v; fn[r][c] = true; };
  const finder = (r, c) => { for (let i = -1; i <= 7; i++) for (let j = -1; j <= 7; j++) { const rr = r + i, cc = c + j; if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue; const on = i >= 0 && i <= 6 && j >= 0 && j <= 6 && (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)); set(rr, cc, on); } };
  finder(0, 0); finder(0, size - 7); finder(size - 7, 0);
  for (let i = 8; i < size - 8; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
  const al = ALIGN[ver];
  for (let ai = 0; ai < al.length; ai++) for (let aj = 0; aj < al.length; aj++) { const r = al[ai], c = al[aj], L = al.length - 1; if ((ai === 0 && aj === 0) || (ai === 0 && aj === L) || (ai === L && aj === 0)) continue; for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) set(r + i, c + j, Math.max(Math.abs(i), Math.abs(j)) !== 1); }
  for (let i = 0; i < 9; i++) { if (!fn[8][i]) set(8, i, false); if (!fn[i][8]) set(i, 8, false); }
  for (let i = 0; i < 8; i++) { set(8, size - 1 - i, false); set(size - 1 - i, 8, false); }
  set(size - 8, 8, true);
  if (ver >= 7) { let rem = ver; for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >> 11) * 0x1f25); const vbits = (ver << 12) | rem; for (let i = 0; i < 18; i++) { const b = (vbits >> i) & 1; const a = size - 11 + (i % 3), c = Math.floor(i / 3); set(a, c, !!b); set(c, a, !!b); } }
  // dati a zigzag
  const dbits = []; for (const b of final) for (let i = 7; i >= 0; i--) dbits.push((b >> i) & 1);
  let k = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let v = 0; v < size; v++) for (let j = 0; j < 2; j++) {
      const c = right - j; const up = ((right + 1) & 2) === 0; const r = up ? size - 1 - v : v;
      if (!fn[r][c]) { m[r][c] = k < dbits.length ? !!dbits[k] : false; k++; }
    }
  }
  const MASKS = [(r, c) => (r + c) % 2 === 0, (r) => r % 2 === 0, (r, c) => c % 3 === 0, (r, c) => (r + c) % 3 === 0, (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0, (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0, (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0, (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0];
  const build = (mk) => {
    const x = m.map((row, r) => row.map((v, c) => (fn[r][c] ? v : v !== MASKS[mk](r, c))));
    // formato: livello M = 00
    let fmt = (0 << 3) | mk; let rem = fmt; for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >> 9) * 0x537); const fbits = ((fmt << 10) | rem) ^ 0x5412;
    const b = (i) => !!((fbits >> i) & 1);
    for (let i = 0; i <= 5; i++) x[i][8] = b(i);
    x[7][8] = b(6); x[8][8] = b(7); x[8][7] = b(8);
    for (let i = 9; i < 15; i++) x[8][14 - i] = b(i);
    for (let i = 0; i < 8; i++) x[8][size - 1 - i] = b(i);
    for (let i = 8; i < 15; i++) x[size - 15 + i][8] = b(i);
    x[size - 8][8] = true;
    return x;
  };
  if (mask !== null) return build(mask);
  let best = null, bestP = Infinity;
  for (let mk = 0; mk < 8; mk++) { const x = build(mk); const p = penalty(x); if (p < bestP) { bestP = p; best = x; } }
  return best;
}

function penalty(x) {
  const n = x.length; let p = 0;
  const lines = (get) => { for (let i = 0; i < n; i++) { let run = 1; for (let j = 1; j < n; j++) { if (get(i, j) === get(i, j - 1)) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; } } };
  lines((i, j) => x[i][j]); lines((i, j) => x[j][i]);
  for (let i = 0; i < n - 1; i++) for (let j = 0; j < n - 1; j++) { const v = x[i][j]; if (v === x[i + 1][j] && v === x[i][j + 1] && v === x[i + 1][j + 1]) p += 3; }
  const pat = [true, false, true, true, true, false, true, false, false, false, false], rev = [...pat].reverse();
  for (let i = 0; i < n; i++) for (let j = 0; j <= n - 11; j++) for (const pp of [pat, rev]) { if (pp.every((v, k) => x[i][j + k] === v)) p += 40; if (pp.every((v, k) => x[j + k][i] === v)) p += 40; }
  let dark = 0; x.forEach((r) => r.forEach((v) => (dark += v ? 1 : 0)));
  p += Math.floor(Math.abs((dark * 20) / (n * n) - 10)) * 10;
  return p;
}

export function qrSvg(text) {
  const m = qrMatrix(text), n = m.length, q = 4;
  let d = '';
  m.forEach((row, r) => row.forEach((v, c) => { if (v) d += `M${c + q},${r + q}h1v1h-1z`; }));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n + 2 * q} ${n + 2 * q}" role="img" aria-label="Codice QR verso ${text.replace(/[<>"&]/g, '')}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
}
