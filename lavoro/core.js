/* Lavoro — logica pura, senza DOM.
   Solo ES5: deve girare anche sul browser dei Kindle meno recenti (niente let/const, frecce, template). */
(function (root) {
  'use strict';

  var GIORNI = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
  var GIORNI_L = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  var MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  var COLL = ['cant', 'todo', 'rap', 'spe', 'liste'];

  var CAT = [['m', 'Materiale'], ['c', 'Carburante'], ['a', 'Attrezzatura'], ['p', 'Pasti'], ['v', 'Viaggio'], ['x', 'Altro']];
  var PAG = [['c', 'Contanti'], ['k', 'Carta'], ['b', 'Bonifico'], ['d', 'Da pagare']];
  var DOC = [['s', 'Scontrino'], ['f', 'Fattura'], ['n', 'Nessuno']];
  var TIPI = [['f', 'Da fare'], ['c', 'Da comprare'], ['t', 'Da chiamare'], ['a', 'Appunto']];
  var STATI = [['a', 'In corso'], ['p', 'Preventivo'], ['s', 'In attesa'], ['v', 'Da verificare'], ['c', 'Chiuso']];

  function isArr(x) { return Object.prototype.toString.call(x) === '[object Array]'; }
  function label(list, k) { for (var i = 0; i < list.length; i++) if (list[i][0] === k) return list[i][1]; return ''; }

  /* ---------- testo ---------- */
  function esc(s) {
    return String(s === null || s === undefined ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function trim(s) { return String(s === null || s === undefined ? '' : s).replace(/^\s+|\s+$/g, ''); }

  /* ---------- date (stringhe AAAA-MM-GG, ora locale) ---------- */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseYmd(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 12, 0, 0); }
  function dateAdd(s, n) { var d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); }
  function weekStart(s) { var d = parseYmd(s); return dateAdd(s, -((d.getDay() + 6) % 7)); }
  function monthOf(s) { return s.substr(0, 7); }
  function monthAdd(ym, n) { var p = ym.split('-'); var d = new Date(+p[0], +p[1] - 1 + n, 1, 12); return d.getFullYear() + '-' + pad(d.getMonth() + 1); }
  function fmtDate(s, lungo) {
    var d = parseYmd(s);
    if (lungo) return GIORNI_L[d.getDay()] + ' ' + d.getDate() + ' ' + MESI[d.getMonth()] + ' ' + d.getFullYear();
    return GIORNI[d.getDay()] + ' ' + d.getDate() + ' ' + MESI[d.getMonth()].substr(0, 3);
  }
  function fmtMonth(ym) { var p = ym.split('-'); return MESI[+p[1] - 1] + ' ' + p[0]; }
  function fmtTime(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }

  /* ---------- numeri e importi ---------- */
  // Importo scritto all'italiana ("12,50", "1.234,56") o con il punto ("12.50") → centesimi; null se non è un importo.
  function parseMoney(str) {
    var s = String(str === null || str === undefined ? '' : str).replace(/[\s€]/g, '');
    if (s === '') return null;
    if (s.indexOf(',') >= 0) s = s.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    if (!/^\d+(\.\d+)?$/.test(s)) return null;
    return Math.round(parseFloat(s) * 100);
  }
  function fmtMoney(c) {
    var neg = c < 0; c = Math.abs(Math.round(c));
    var e = String(Math.floor(c / 100)), out = '';
    while (e.length > 3) { out = '.' + e.substr(e.length - 3) + out; e = e.substr(0, e.length - 3); }
    return (neg ? '-' : '') + e + out + ',' + pad(c % 100) + ' €';
  }
  function parseNum(str) {
    var s = String(str === null || str === undefined ? '' : str).replace(/\s/g, '').replace(',', '.');
    if (!/^\d+(\.\d+)?$/.test(s)) return null;
    return parseFloat(s);
  }
  function fmtNum(n) { return String(Math.round(n * 100) / 100).replace('.', ','); }
  function fmtOre(n) { return fmtNum(n) + ' h'; }
  // Durata in millisecondi → ore arrotondate al quarto d'ora (minimo un quarto).
  function quarter(ms) { var q = Math.round(ms / 900000) / 4; return q < 0.25 ? 0.25 : q; }

  /* ---------- archivio ---------- */
  function empty() { return { v: 1, cant: [], todo: [], rap: [], spe: [], liste: [], timer: null, rx: null, set: { fs: 1, off: 0 } }; }
  function norm(db) {
    var e = empty(), k;
    if (!db || typeof db !== 'object') return e;
    for (var i = 0; i < COLL.length; i++) { k = COLL[i]; if (isArr(db[k])) e[k] = db[k]; }
    if (db.timer && db.timer.c !== undefined && db.timer.t) e.timer = db.timer;
    if (db.rx && typeof db.rx === 'object' && db.rx.id) e.rx = db.rx;
    if (db.set && typeof db.set === 'object') { e.set.fs = db.set.fs || 1; e.set.off = db.set.off || 0; }
    return e;
  }
  var seq = 0;
  function newId(t) { seq = (seq + 1) % 1296; return (t || new Date().getTime()).toString(36) + ('0' + seq.toString(36)).slice(-2) + Math.floor(Math.random() * 1296).toString(36); }
  function byId(arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return null; }
  function live(arr) { var o = []; for (var i = 0; i < arr.length; i++) if (!arr[i].x) o.push(arr[i]); return o; }
  // Inserisce o sostituisce un record aggiornandone la data di modifica.
  function put(arr, rec, t) {
    rec.m = t || new Date().getTime();
    for (var i = 0; i < arr.length; i++) if (arr[i].id === rec.id) { arr[i] = rec; return rec; }
    arr.push(rec); return rec;
  }
  // L'eliminazione lascia una lapide, così l'unione con un altro dispositivo non fa ricomparire il record.
  function remove(arr, id, t) { return put(arr, { id: id, x: 1 }, t); }

  // Unisce i record in arrivo: per ogni identificativo vince la modifica più recente.
  function merge(db, inc) {
    var res = { nuovi: 0, aggiornati: 0 };
    for (var i = 0; i < COLL.length; i++) {
      var k = COLL[i], src = inc && inc[k];
      if (!isArr(src)) continue;
      for (var j = 0; j < src.length; j++) {
        var r = src[j];
        if (!r || typeof r !== 'object' || !r.id) continue;
        var cur = byId(db[k], r.id);
        if (!cur) { db[k].push(r); if (!r.x) res.nuovi++; }
        else if ((r.m || 0) > (cur.m || 0)) { db[k][indexOf(db[k], cur)] = r; res.aggiornati++; }
      }
    }
    return res;
  }
  function indexOf(arr, x) { for (var i = 0; i < arr.length; i++) if (arr[i] === x) return i; return -1; }

  function inRange(g, from, to) { return (!from || g >= from) && (!to || g <= to); }
  function sortBy(arr, f) { return arr.slice().sort(function (a, b) { var x = f(a), y = f(b); return x < y ? -1 : x > y ? 1 : 0; }); }

  /* ---------- riepiloghi ---------- */
  // Filtri: c = cantiere (undefined = tutti), from/to = date comprese.
  function rapList(db, f) {
    f = f || {}; var o = [], a = live(db.rap);
    for (var i = 0; i < a.length; i++) if ((f.c === undefined || a[i].c === f.c) && inRange(a[i].g, f.from, f.to)) o.push(a[i]);
    return sortBy(o, function (r) { return r.g + ' ' + r.m; }).reverse();
  }
  function speList(db, f) {
    f = f || {}; var o = [], a = live(db.spe);
    for (var i = 0; i < a.length; i++) if ((f.c === undefined || a[i].c === f.c) && inRange(a[i].g, f.from, f.to)) o.push(a[i]);
    return sortBy(o, function (r) { return r.g + ' ' + r.m; }).reverse();
  }
  function rapTot(list) {
    var t = { ore: 0, orePers: 0, km: 0, n: list.length };
    for (var i = 0; i < list.length; i++) { t.ore += list[i].o || 0; t.orePers += (list[i].o || 0) * (list[i].pe || 1); t.km += list[i].km || 0; }
    return t;
  }
  function speTot(list) {
    var t = { tot: 0, cat: {}, daPagare: 0, n: list.length };
    for (var i = 0; i < list.length; i++) { var s = list[i]; t.tot += s.i || 0; t.cat[s.k] = (t.cat[s.k] || 0) + (s.i || 0); if (s.pg === 'd') t.daPagare += s.i || 0; }
    return t;
  }
  function todoOpen(db, c) {
    var o = [], a = live(db.todo);
    for (var i = 0; i < a.length; i++) if (!a[i].d && (c === undefined || a[i].c === c)) o.push(a[i]);
    return o.sort(function (x, y) { return ((y.p || 0) - (x.p || 0)) || ((y.m || 0) - (x.m || 0)); });
  }
  function cantSummary(db, id) {
    var r = rapTot(rapList(db, { c: id })), s = speTot(speList(db, { c: id }));
    return { ore: r.ore, orePers: r.orePers, km: r.km, giorni: r.n, spese: s.tot, aperti: todoOpen(db, id).length };
  }
  function cantName(db, id) { var c = id ? byId(db.cant, id) : null; return c && !c.x ? c.n : ''; }

  /* ---------- CSV (punto e virgola e virgola decimale: si apre direttamente nel foglio di calcolo) ---------- */
  function csvCell(v) { v = String(v === null || v === undefined ? '' : v); return /[";\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  function csv(rows) { var o = []; for (var i = 0; i < rows.length; i++) { var r = []; for (var j = 0; j < rows[i].length; j++) r.push(csvCell(rows[i][j])); o.push(r.join(';')); } return o.join('\r\n') + '\r\n'; }
  function csvRap(db) {
    var rows = [['Data', 'Cantiere', 'Ore', 'Persone', 'Ore per persone', 'Km', 'Lavori eseguiti', 'Materiali']], a = rapList(db).reverse();
    for (var i = 0; i < a.length; i++) { var r = a[i]; rows.push([r.g, cantName(db, r.c), fmtNum(r.o || 0), r.pe || 1, fmtNum((r.o || 0) * (r.pe || 1)), r.km ? fmtNum(r.km) : '', r.l || '', r.ma || '']); }
    return csv(rows);
  }
  function csvSpe(db) {
    var rows = [['Data', 'Cantiere', 'Importo', 'Categoria', 'Descrizione', 'Pagamento', 'Documento']], a = speList(db).reverse();
    for (var i = 0; i < a.length; i++) { var s = a[i]; rows.push([s.g, cantName(db, s.c), fmtNum((s.i || 0) / 100), label(CAT, s.k), s.de || '', label(PAG, s.pg), label(DOC, s.sc)]); }
    return csv(rows);
  }

  /* ---------- passaggio al telefono: JSON → base64url → pezzi dentro l'ancora di un indirizzo ---------- */
  var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  function b64enc(str) {
    var b = unescape(encodeURIComponent(str)), o = '', i, n;
    for (i = 0; i < b.length; i += 3) {
      n = (b.charCodeAt(i) << 16) | ((i + 1 < b.length ? b.charCodeAt(i + 1) : 0) << 8) | (i + 2 < b.length ? b.charCodeAt(i + 2) : 0);
      o += B64.charAt(n >> 18) + B64.charAt((n >> 12) & 63) + (i + 1 < b.length ? B64.charAt((n >> 6) & 63) : '') + (i + 2 < b.length ? B64.charAt(n & 63) : '');
    }
    return o;
  }
  function b64dec(s) {
    var b = '', i, n, k, len;
    for (i = 0; i < s.length; i += 4) {
      len = Math.min(4, s.length - i); n = 0;
      for (k = 0; k < 4; k++) { var v = k < len ? B64.indexOf(s.charAt(i + k)) : 0; if (v < 0) throw new Error('codice non valido'); n = (n << 6) | v; }
      b += String.fromCharCode((n >> 16) & 255); if (len > 2) b += String.fromCharCode((n >> 8) & 255); if (len > 3) b += String.fromCharCode(n & 255);
    }
    return decodeURIComponent(escape(b));
  }
  // Sceglie che cosa passare: rapportini e spese del periodo con i loro cantieri; con tutto = true l'archivio intero.
  function subset(db, from, to, tutto) {
    var o = { cant: [], todo: [], rap: [], spe: [], liste: [] }, i, need = {};
    if (tutto) { for (i = 0; i < COLL.length; i++) o[COLL[i]] = db[COLL[i]].slice(); return o; }
    o.rap = rapList(db, { from: from, to: to }); o.spe = speList(db, { from: from, to: to });
    for (i = 0; i < o.rap.length; i++) need[o.rap[i].c] = 1;
    for (i = 0; i < o.spe.length; i++) need[o.spe[i].c] = 1;
    var c = live(db.cant); for (i = 0; i < c.length; i++) if (need[c[i].id]) o.cant.push(c[i]);
    return o;
  }
  function count(sub) { var n = 0; for (var i = 0; i < COLL.length; i++) n += live(sub[COLL[i]] || []).length; return n; }
  function pack(sub, size, id) {
    var s = b64enc(JSON.stringify(sub)), parts = [];
    for (var i = 0; i < s.length; i += size) parts.push(s.substr(i, size));
    if (!parts.length) parts.push('');
    return { id: id || newId().slice(-5), parts: parts };
  }
  function link(base, x, i) { return base + '#i=' + x.id + '.' + (i + 1) + '.' + x.parts.length + '.' + x.parts[i]; }
  function parseLink(hash) {
    var m = /^#?i=([0-9a-z]+)\.(\d+)\.(\d+)\.([A-Za-z0-9_-]*)$/.exec(hash || '');
    if (!m) return null;
    var i = +m[2], n = +m[3];
    if (i < 1 || n < 1 || i > n || n > 500) return null;
    return { id: m[1], i: i, n: n, d: m[4] };
  }
  // st = stato della ricezione in corso (o null). Restituisce il nuovo stato; con data !== undefined la ricezione è completa.
  function receive(st, part) {
    if (!st || st.id !== part.id || st.n !== part.n) st = { id: part.id, n: part.n, p: {} };
    st.p[part.i] = part.d;
    var missing = [], s = '';
    for (var i = 1; i <= st.n; i++) { if (st.p[i] === undefined) missing.push(i); else s += st.p[i]; }
    st.missing = missing;
    if (!missing.length) st.data = JSON.parse(b64dec(s));
    return st;
  }

  root.LavoroCore = {
    CAT: CAT, PAG: PAG, DOC: DOC, TIPI: TIPI, STATI: STATI, COLL: COLL, label: label,
    esc: esc, trim: trim, pad: pad, isArr: isArr,
    ymd: ymd, parseYmd: parseYmd, dateAdd: dateAdd, weekStart: weekStart, monthOf: monthOf, monthAdd: monthAdd, fmtDate: fmtDate, fmtMonth: fmtMonth, fmtTime: fmtTime,
    parseMoney: parseMoney, fmtMoney: fmtMoney, parseNum: parseNum, fmtNum: fmtNum, fmtOre: fmtOre, quarter: quarter,
    empty: empty, norm: norm, newId: newId, byId: byId, live: live, put: put, remove: remove, merge: merge,
    rapList: rapList, speList: speList, rapTot: rapTot, speTot: speTot, todoOpen: todoOpen, cantSummary: cantSummary, cantName: cantName,
    csvRap: csvRap, csvSpe: csvSpe,
    b64enc: b64enc, b64dec: b64dec, subset: subset, count: count, pack: pack, link: link, parseLink: parseLink, receive: receive
  };
})(this);
