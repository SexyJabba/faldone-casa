/* Lavoro — cifratura con password. Solo ES5, nessuna dipendenza: gira anche dove manca WebCrypto.
   Chiave: PBKDF2-HMAC-SHA256 dalla password. Cifratura: flusso HMAC-SHA256 in modalità contatore,
   poi HMAC su vettore e testo cifrato (cifra-poi-autentica). Verificata nei test contro node:crypto. */
(function (root) {
  'use strict';
  var K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  var H0 = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  var W = [];

  function compress(h, p, off) {
    for (var i = 0; i < 16; i++) W[i] = (p[off + i * 4] << 24) | (p[off + i * 4 + 1] << 16) | (p[off + i * 4 + 2] << 8) | p[off + i * 4 + 3];
    core(h);
  }
  // Una compressione sul blocco già scritto in W[0..15] come parole da 32 bit.
  function core(h) {
    var w = W, i, a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], hh = h[7], t1, t2, s0, s1;
    for (i = 16; i < 64; i++) {
      s0 = w[i - 15]; s0 = ((s0 >>> 7) | (s0 << 25)) ^ ((s0 >>> 18) | (s0 << 14)) ^ (s0 >>> 3);
      s1 = w[i - 2]; s1 = ((s1 >>> 17) | (s1 << 15)) ^ ((s1 >>> 19) | (s1 << 13)) ^ (s1 >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    for (i = 0; i < 64; i++) {
      s1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      t1 = (hh + s1 + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0;
      s0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      t2 = (s0 + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    h[0] = (h[0] + a) | 0; h[1] = (h[1] + b) | 0; h[2] = (h[2] + c) | 0; h[3] = (h[3] + d) | 0;
    h[4] = (h[4] + e) | 0; h[5] = (h[5] + f) | 0; h[6] = (h[6] + g) | 0; h[7] = (h[7] + hh) | 0;
  }
  function out(h) { var o = [], i; for (i = 0; i < 8; i++) o.push((h[i] >>> 24) & 255, (h[i] >>> 16) & 255, (h[i] >>> 8) & 255, h[i] & 255); return o; }
  // Completa il calcolo partendo dallo stato h, dopo `prima` byte già elaborati.
  function finish(h, msg, prima) {
    var p = msg.slice(), len = prima + msg.length, i;
    p.push(0x80);
    while (p.length % 64 !== 56) p.push(0);
    p.push(0, 0, 0, Math.floor(len / 0x20000000) & 255, (len >>> 21) & 255, (len >>> 13) & 255, (len >>> 5) & 255, (len << 3) & 255);
    for (i = 0; i < p.length; i += 64) compress(h, p, i);
    return out(h);
  }
  function sha256(msg) { return finish(H0.slice(), msg, 0); }
  // Stati interni di HMAC già avviati con la chiave: ogni HMAC successivo costa due compressioni in meno.
  function hmacKey(key) {
    var k = key.length > 64 ? sha256(key) : key.slice(), ip = [], op = [], i, hi = H0.slice(), ho = H0.slice();
    while (k.length < 64) k.push(0);
    for (i = 0; i < 64; i++) { ip.push(k[i] ^ 0x36); op.push(k[i] ^ 0x5c); }
    compress(hi, ip, 0); compress(ho, op, 0);
    return { i: hi, o: ho };
  }
  function hmacWith(pre, msg) { return finish(pre.o.slice(), finish(pre.i.slice(), msg, 64), 64); }
  function hmac(key, msg) { return hmacWith(hmacKey(key), msg); }

  function utf8(s) { var b = unescape(encodeURIComponent(s)), o = [], i; for (i = 0; i < b.length; i++) o.push(b.charCodeAt(i)); return o; }
  function str(bytes) { var s = '', i; for (i = 0; i < bytes.length; i += 4096) s += String.fromCharCode.apply(null, bytes.slice(i, i + 4096)); return decodeURIComponent(escape(s)); }
  var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  function b64(b) {
    var o = [], i, n;
    for (i = 0; i < b.length; i += 3) {
      n = (b[i] << 16) | ((i + 1 < b.length ? b[i + 1] : 0) << 8) | (i + 2 < b.length ? b[i + 2] : 0);
      o.push(B64.charAt(n >> 18) + B64.charAt((n >> 12) & 63) + (i + 1 < b.length ? B64.charAt((n >> 6) & 63) : '=') + (i + 2 < b.length ? B64.charAt(n & 63) : '='));
    }
    return o.join('');
  }
  function unb64(s) {
    var o = [], i, n, k, v, pad;
    s = String(s).replace(/[^A-Za-z0-9+\/=]/g, '');
    for (i = 0; i < s.length; i += 4) {
      n = 0; pad = 0;
      for (k = 0; k < 4; k++) { v = s.charAt(i + k); if (v === '=' || v === '') { pad++; v = 0; } else v = B64.indexOf(v); n = (n << 6) | v; }
      o.push((n >> 16) & 255); if (pad < 2) o.push((n >> 8) & 255); if (pad < 1) o.push(n & 255);
    }
    return o;
  }

  // PBKDF2-HMAC-SHA256, un solo blocco (32 byte). Il ciclo lavora su parole da 32 bit senza creare oggetti:
  // sui browser senza compilatore (Kindle) è la differenza tra secondi e minuti. Lo stato permette di
  // proseguire a pezzi senza bloccare la pagina.
  function words(b) { var o = [], i; for (i = 0; i < 32; i += 4) o.push((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]); return o; }
  function pbkdf2Start(password, salt, iter) {
    var pre = hmacKey(utf8(password)), u = words(hmacWith(pre, salt.concat([0, 0, 0, 1])));
    return { hi: pre.i, ho: pre.o, u: u, t: u.slice(), s: [0, 0, 0, 0, 0, 0, 0, 0], done: 1, iter: iter };
  }
  function pbkdf2Step(st, n) {
    var end = Math.min(st.iter, st.done + n), hi = st.hi, ho = st.ho, u = st.u, t = st.t, s = st.s, w = W, j, k = st.done;
    for (; k < end; k++) {
      // interno: stato già avviato con la chiave, poi 32 byte + riempimento (96 byte in tutto = 768 bit)
      for (j = 0; j < 8; j++) { w[j] = u[j]; s[j] = hi[j]; }
      w[8] = -2147483648; w[9] = 0; w[10] = 0; w[11] = 0; w[12] = 0; w[13] = 0; w[14] = 0; w[15] = 768;
      core(s);
      for (j = 0; j < 8; j++) { w[j] = s[j]; s[j] = ho[j]; }
      w[8] = -2147483648; w[9] = 0; w[10] = 0; w[11] = 0; w[12] = 0; w[13] = 0; w[14] = 0; w[15] = 768;
      core(s);
      for (j = 0; j < 8; j++) { u[j] = s[j]; t[j] ^= s[j]; }
    }
    st.done = k;
    return k >= st.iter;
  }
  function pbkdf2(password, salt, iter) { var st = pbkdf2Start(password, salt, iter); pbkdf2Step(st, iter); return out(st.t); }
  function pbkdf2Async(password, salt, iter, progress, done) {
    var st = pbkdf2Start(password, salt, iter);
    (function next() {
      var t0 = new Date().getTime();
      // pezzi da circa un quarto di secondo, qualunque sia la velocità del dispositivo
      while (new Date().getTime() - t0 < 250) { if (pbkdf2Step(st, 25)) return done(out(st.t)); }
      if (progress) progress(st.done / st.iter);
      setTimeout(next, 0);
    })();
  }

  var ctr = 0, prev = [];
  function random(n) {
    var a = [], i;
    try { if (root.crypto && root.crypto.getRandomValues) { var u = new root.Uint8Array(n); root.crypto.getRandomValues(u); for (i = 0; i < n; i++) a.push(u[i]); return a; } } catch (e) { a = []; }
    // Senza generatore di sistema: il vettore deve solo non ripetersi, non essere segreto.
    prev = sha256(utf8(new Date().getTime() + ':' + Math.random() + ':' + Math.random() + ':' + (ctr++)).concat(prev));
    return prev.slice(0, n);
  }
  function subKeys(key) { var pre = hmacKey(key); return { enc: hmacKey(hmacWith(pre, utf8('cifra'))), mac: hmacKey(hmacWith(pre, utf8('firma'))) }; }
  function stream(enc, iv, data) {
    var o = [], i, j, ks;
    for (i = 0; i < data.length; i += 32) {
      j = i / 32;
      ks = hmacWith(enc, iv.concat([(j >>> 24) & 255, (j >>> 16) & 255, (j >>> 8) & 255, j & 255]));
      for (j = 0; j < 32 && i + j < data.length; j++) o.push(data[i + j] ^ ks[j]);
    }
    return o;
  }
  // Cifra un testo con la chiave (32 byte). Restituisce { iv, ct, mac } in base64.
  function seal(key, text, iv) {
    var k = subKeys(key), v = iv || random(16), ct = stream(k.enc, v, utf8(text));
    return { iv: b64(v), ct: b64(ct), mac: b64(hmacWith(k.mac, v.concat(ct))) };
  }
  // Restituisce il testo, oppure null se la chiave è sbagliata o i dati sono stati alterati.
  function open(key, box) {
    if (!box || typeof box.iv !== 'string' || typeof box.ct !== 'string' || typeof box.mac !== 'string') return null;
    var k = subKeys(key), v = unb64(box.iv), ct = unb64(box.ct), mac = unb64(box.mac), calc = hmacWith(k.mac, v.concat(ct)), diff = mac.length ^ 32, i;
    for (i = 0; i < 32; i++) diff |= calc[i] ^ mac[i];
    if (diff) return null;
    try { return str(stream(k.enc, v, ct)); } catch (e) { return null; }
  }

  root.LavoroCifra = { sha256: sha256, hmac: hmac, pbkdf2: pbkdf2, pbkdf2Async: pbkdf2Async, seal: seal, open: open, utf8: utf8, str: str, b64: b64, unb64: unb64, random: random };
})(this);
