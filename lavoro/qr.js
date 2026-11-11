/* Lavoro — generatore QR (modalità byte, correzione L, versioni 1–20). Solo ES5, nessuna dipendenza.
   Stesso algoritmo di app/lib/qr.js (ISO/IEC 18004), riscritto per i browser dei Kindle e verificato nei test
   contro una libreria di riferimento. */
(function (root) {
  'use strict';
  // versione: [correzione per blocco, blocchi gruppo 1, dati per blocco g1, blocchi gruppo 2, dati per blocco g2]
  var EC_L = [null,
    [7, 1, 19, 0, 0], [10, 1, 34, 0, 0], [15, 1, 55, 0, 0], [20, 1, 80, 0, 0], [26, 1, 108, 0, 0],
    [18, 2, 68, 0, 0], [20, 2, 78, 0, 0], [24, 2, 97, 0, 0], [30, 2, 116, 0, 0], [18, 2, 68, 2, 69],
    [20, 4, 81, 0, 0], [24, 2, 92, 2, 93], [26, 4, 107, 0, 0], [30, 3, 115, 1, 116], [22, 5, 87, 1, 88],
    [24, 5, 98, 1, 99], [28, 1, 107, 5, 108], [30, 5, 120, 1, 121], [28, 3, 113, 4, 114], [28, 3, 107, 5, 108]];
  var ALIGN = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50],
    [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90]];

  var EXP = [], LOG = [], i, x = 1;
  for (i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; }
  for (i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  function mul(a, b) { return a && b ? EXP[LOG[a] + LOG[b]] : 0; }
  function zeros(n) { var a = []; for (var k = 0; k < n; k++) a.push(0); return a; }
  function rsGen(n) {
    var g = [1];
    for (var a = 0; a < n; a++) { var ng = zeros(g.length + 1); for (var j = 0; j < g.length; j++) { ng[j] ^= g[j]; ng[j + 1] ^= mul(g[j], EXP[a]); } g = ng; }
    return g;
  }
  function rsEncode(data, n) {
    var g = rsGen(n), r = zeros(n);
    for (var a = 0; a < data.length; a++) { var f = data[a] ^ r[0]; r.shift(); r.push(0); for (var j = 0; j < n; j++) r[j] ^= mul(g[j + 1], f); }
    return r;
  }
  function capacity(v) { var e = EC_L[v]; return e[1] * e[2] + e[3] * e[4]; }

  var MASKS = [
    function (r, c) { return (r + c) % 2 === 0; }, function (r) { return r % 2 === 0; }, function (r, c) { return c % 3 === 0; },
    function (r, c) { return (r + c) % 3 === 0; }, function (r, c) { return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0; },
    function (r, c) { return ((r * c) % 2) + ((r * c) % 3) === 0; }, function (r, c) { return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0; },
    function (r, c) { return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0; }];

  // Quanti byte di testo entrano nella versione v.
  function maxBytes(v) { return capacity(v) - (v < 10 ? 2 : 3); }

  function matrix(text, forcedMask) {
    var bin = unescape(encodeURIComponent(text)), bytes = [], k, j, r, c;
    for (k = 0; k < bin.length; k++) bytes.push(bin.charCodeAt(k));
    var ver = 0;
    for (k = 1; k <= 20; k++) if (bytes.length <= maxBytes(k)) { ver = k; break; }
    if (!ver) throw new Error('testo troppo lungo per il QR');
    var e = EC_L[ver], ecn = e[0], cap = capacity(ver), bits = [];
    function putBits(v, n) { for (var a = n - 1; a >= 0; a--) bits.push((v >> a) & 1); }
    putBits(4, 4); putBits(bytes.length, ver < 10 ? 8 : 16);
    for (k = 0; k < bytes.length; k++) putBits(bytes[k], 8);
    putBits(0, Math.min(4, cap * 8 - bits.length));
    while (bits.length % 8) bits.push(0);
    var data = [];
    for (k = 0; k < bits.length; k += 8) { var by = 0; for (j = 0; j < 8; j++) by = (by << 1) | bits[k + j]; data.push(by); }
    for (k = 0; data.length < cap; k++) data.push(k % 2 ? 0x11 : 0xec);
    var blocks = [], o = 0;
    for (k = 0; k < e[1]; k++) { blocks.push(data.slice(o, o + e[2])); o += e[2]; }
    for (k = 0; k < e[3]; k++) { blocks.push(data.slice(o, o + e[4])); o += e[4]; }
    var ecs = [];
    for (k = 0; k < blocks.length; k++) ecs.push(rsEncode(blocks[k], ecn));
    var fin = [];
    for (k = 0; k < Math.max(e[2], e[4]); k++) for (j = 0; j < blocks.length; j++) if (k < blocks[j].length) fin.push(blocks[j][k]);
    for (k = 0; k < ecn; k++) for (j = 0; j < ecs.length; j++) fin.push(ecs[j][k]);

    var size = ver * 4 + 17, m = [], fn = [];
    for (r = 0; r < size; r++) { m.push([]); fn.push([]); for (c = 0; c < size; c++) { m[r].push(false); fn[r].push(false); } }
    function set(rr, cc, v) { m[rr][cc] = !!v; fn[rr][cc] = true; }
    function finder(r0, c0) {
      for (var a = -1; a <= 7; a++) for (var b = -1; b <= 7; b++) {
        var rr = r0 + a, cc = c0 + b;
        if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
        set(rr, cc, a >= 0 && a <= 6 && b >= 0 && b <= 6 && (a === 0 || a === 6 || b === 0 || b === 6 || (a >= 2 && a <= 4 && b >= 2 && b <= 4)));
      }
    }
    finder(0, 0); finder(0, size - 7); finder(size - 7, 0);
    for (k = 8; k < size - 8; k++) { set(6, k, k % 2 === 0); set(k, 6, k % 2 === 0); }
    var al = ALIGN[ver], L = al.length - 1, ai, aj, a, b;
    for (ai = 0; ai < al.length; ai++) for (aj = 0; aj < al.length; aj++) {
      if ((ai === 0 && aj === 0) || (ai === 0 && aj === L) || (ai === L && aj === 0)) continue;
      for (a = -2; a <= 2; a++) for (b = -2; b <= 2; b++) set(al[ai] + a, al[aj] + b, Math.max(Math.abs(a), Math.abs(b)) !== 1);
    }
    for (k = 0; k < 9; k++) { if (!fn[8][k]) set(8, k, false); if (!fn[k][8]) set(k, 8, false); }
    for (k = 0; k < 8; k++) { set(8, size - 1 - k, false); set(size - 1 - k, 8, false); }
    set(size - 8, 8, true);
    if (ver >= 7) {
      var rem = ver;
      for (k = 0; k < 12; k++) rem = (rem << 1) ^ ((rem >> 11) * 0x1f25);
      var vbits = (ver << 12) | rem;
      for (k = 0; k < 18; k++) { var vb = (vbits >> k) & 1, p = size - 11 + (k % 3), q = Math.floor(k / 3); set(p, q, vb); set(q, p, vb); }
    }
    var dbits = [];
    for (k = 0; k < fin.length; k++) for (j = 7; j >= 0; j--) dbits.push((fin[k] >> j) & 1);
    var n = 0;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var v = 0; v < size; v++) for (j = 0; j < 2; j++) {
        c = right - j; r = ((right + 1) & 2) === 0 ? size - 1 - v : v;
        if (!fn[r][c]) { m[r][c] = n < dbits.length ? !!dbits[n] : false; n++; }
      }
    }
    function build(mk) {
      var xm = [], rr, cc;
      for (rr = 0; rr < size; rr++) { xm.push([]); for (cc = 0; cc < size; cc++) xm[rr].push(fn[rr][cc] ? m[rr][cc] : m[rr][cc] !== MASKS[mk](rr, cc)); }
      var fmt = (1 << 3) | mk, rm = fmt, t; // livello L = 01
      for (t = 0; t < 10; t++) rm = (rm << 1) ^ ((rm >> 9) * 0x537);
      var fbits = ((fmt << 10) | rm) ^ 0x5412;
      function fb(t2) { return !!((fbits >> t2) & 1); }
      for (t = 0; t <= 5; t++) xm[t][8] = fb(t);
      xm[7][8] = fb(6); xm[8][8] = fb(7); xm[8][7] = fb(8);
      for (t = 9; t < 15; t++) xm[8][14 - t] = fb(t);
      for (t = 0; t < 8; t++) xm[8][size - 1 - t] = fb(t);
      for (t = 8; t < 15; t++) xm[size - 15 + t][8] = fb(t);
      xm[size - 8][8] = true;
      return xm;
    }
    if (forcedMask !== undefined && forcedMask !== null) return build(forcedMask);
    var best = null, bestP = Infinity;
    for (k = 0; k < 8; k++) { var cand = build(k), pen = penalty(cand); if (pen < bestP) { bestP = pen; best = cand; } }
    return best;
  }

  var PAT = [true, false, true, true, true, false, true, false, false, false, false];
  function penalty(xm) {
    var n = xm.length, p = 0, a, b, run, k, dark = 0, ok1, ok2, ok3, ok4;
    for (a = 0; a < n; a++) {
      run = 1; for (b = 1; b < n; b++) { if (xm[a][b] === xm[a][b - 1]) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; }
      run = 1; for (b = 1; b < n; b++) { if (xm[b][a] === xm[b - 1][a]) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; }
    }
    for (a = 0; a < n - 1; a++) for (b = 0; b < n - 1; b++) { var v = xm[a][b]; if (v === xm[a + 1][b] && v === xm[a][b + 1] && v === xm[a + 1][b + 1]) p += 3; }
    for (a = 0; a < n; a++) for (b = 0; b <= n - 11; b++) {
      ok1 = ok2 = ok3 = ok4 = true;
      for (k = 0; k < 11; k++) {
        if (xm[a][b + k] !== PAT[k]) ok1 = false; if (xm[a][b + k] !== PAT[10 - k]) ok2 = false;
        if (xm[b + k][a] !== PAT[k]) ok3 = false; if (xm[b + k][a] !== PAT[10 - k]) ok4 = false;
      }
      p += ((ok1 ? 1 : 0) + (ok2 ? 1 : 0) + (ok3 ? 1 : 0) + (ok4 ? 1 : 0)) * 40;
    }
    for (a = 0; a < n; a++) for (b = 0; b < n; b++) if (xm[a][b]) dark++;
    return p + Math.floor(Math.abs((dark * 20) / (n * n) - 10)) * 10;
  }

  root.LavoroQR = { matrix: matrix, maxBytes: maxBytes };
})(this);
