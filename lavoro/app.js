/* Lavoro — interfaccia. Solo ES5 e DOM di base: deve girare sul browser dei Kindle.
   Una pagina sola: dopo il primo caricamento non fa più richieste di rete e salva tutto in localStorage.
   Se lavoro/dati.js contiene dati cifrati, chiede la password e tiene cifrato anche l'archivio del dispositivo. */
(function () {
  'use strict';
  var C = window.LavoroCore, QR = window.LavoroQR, X = window.LavoroCifra, BUNDLE = window.LAVORO_DATI || null;
  var KEY = 'lavoro.v1', KEY2 = 'lavoro.v2', KFAST = 'lavoro.k', FAST = 600, KIN = 'lavoro.in', CHUNK = 420;
  var E = C.esc;

  /* ---------- memoria ---------- */
  var mem = {}, canStore = true;
  function sget(k) { try { return window.localStorage.getItem(k); } catch (e) { canStore = false; return mem[k] === undefined ? null : mem[k]; } }
  function sset(k, v) { try { window.localStorage.setItem(k, v); canStore = true; } catch (e) { canStore = false; mem[k] = v; } }
  function sdel(k) { try { window.localStorage.removeItem(k); } catch (e) { delete mem[k]; } }
  function parse(s) { try { return JSON.parse(s); } catch (e) { return null; } }
  (function () { sset('lavoro.prova', '1'); if (canStore && sget('lavoro.prova') !== '1') canStore = false; sdel('lavoro.prova'); })();

  // Con i dati cifrati la pagina parte bloccata: l'archivio si legge solo dopo la password.
  var locked = !!(BUNDLE && X && BUNDLE.salt && BUNDLE.it), key = null, pend = null;
  var db = locked ? C.empty() : C.norm(parse(sget(KEY)));
  function save() {
    if (locked) return;
    if (!key) { sset(KEY, JSON.stringify(db)); return; }
    var box = X.seal(key, JSON.stringify(db));
    box.salt = BUNDLE.salt; box.it = BUNDLE.it;
    sset(KEY2, JSON.stringify(box));
  }

  function now() { return new Date(new Date().getTime() + (db.set.off || 0) * 3600000); }
  function today() { return C.ymd(now()); }

  /* ---------- stato dell'interfaccia ---------- */
  var ui = { more: {}, filt: '', done: false, chiusi: false, json: false, msg: '' };
  var draft = null, draftFor = null, after = null, xfer = null, lastHash = null, calc = {};

  /* ---------- pezzi di HTML ---------- */
  function btn(label, a, attrs, cls) { return '<button type="button" class="b ' + (cls || '') + '" data-a="' + a + '"' + (attrs || '') + '>' + label + '</button>'; }
  function lnk(href, label, cls) { return '<a class="b ' + (cls || '') + '" href="#' + href + '">' + label + '</a>'; }
  function nl(s) { return E(s).replace(/\n/g, '<br>'); }
  function field(id, label, val, attrs) { return '<label class="l" for="f_' + id + '">' + label + '</label><input type="text" class="in" id="f_' + id + '" value="' + E(val) + '" autocomplete="off"' + (attrs || '') + '>'; }
  function area(id, label, val, rows) { return '<label class="l" for="f_' + id + '">' + label + '</label><textarea class="in" id="f_' + id + '" rows="' + (rows || 3) + '">' + E(val) + '</textarea>'; }
  function val(id) { var el = document.getElementById('f_' + id); return el ? C.trim(el.value) : ''; }
  function choice(name, label, opts, cur) {
    return '<div class="l">' + label + '</div><div class="ch">' + picks(name, opts, cur) + '</div>';
  }
  function picks(name, opts, cur) {
    var h = '';
    for (var i = 0; i < opts.length; i++) h += btn(E(opts[i][1]), 'pick', ' data-g="' + name + '" data-v="' + E(opts[i][0]) + '"', opts[i][0] === cur ? 'on' : '');
    return h;
  }
  var STEP = {
    g: { fmt: function (v) { return C.fmtDate(v, true); } },
    o: { min: 0, max: 24, fmt: C.fmtOre },
    pe: { min: 1, max: 30, fmt: function (v) { return v + (v === 1 ? ' persona' : ' persone'); } },
    off: { min: -12, max: 14, fmt: function (v) { return (v > 0 ? '+' : '') + v + ' h'; } }
  };
  function stepper(name, label, v, d) {
    return '<div class="l">' + label + '</div><table class="st"><tr><td class="sb">' + btn('–', 'step', ' data-f="' + name + '" data-d="' + (-d) + '"') + '</td><td class="sv" id="s_' + name + '">' + E(STEP[name].fmt(v)) + '</td><td class="sb">' + btn('+', 'step', ' data-f="' + name + '" data-d="' + d + '"') + '</td></tr></table>';
  }
  // Scelta del cantiere nei moduli: quelli aperti, oppure il nome di uno nuovo da creare al salvataggio.
  // In vista quelli in corso; gli altri non chiusi stanno dietro «Altri cantieri» per non allungare il modulo.
  function cantPick() {
    var a = C.live(db.cant), main = [], other = [], i, h;
    a.sort(function (x, y) { return x.n < y.n ? -1 : 1; });
    for (i = 0; i < a.length; i++) { if (a[i].st === 'a' || a[i].id === draft.c) main.push([a[i].id, a[i].n]); else if (a[i].st !== 'c') other.push([a[i].id, a[i].n]); }
    main.push(['', 'Nessun cantiere']);
    h = choice('c', 'Cantiere', main, draft.c);
    if (other.length) h += btn('Altri cantieri (' + other.length + ')', 'allc', '', 'w') + '<div class="ch" id="allc" style="display:none">' + picks('c', other, draft.c) + '</div>';
    return h + field('nc', 'oppure nuovo cantiere: scrivi il nome', '');
  }
  // Se è stato scritto un nome nuovo lo crea (o riusa quello con lo stesso nome) e lo assegna alla voce.
  function newCant() {
    var n = val('nc'), a = C.live(db.cant), i;
    if (!n) return;
    for (i = 0; i < a.length; i++) if (a[i].n.toLowerCase() === n.toLowerCase()) { draft.c = a[i].id; return; }
    draft.c = C.newId();
    C.put(db.cant, { id: draft.c, n: n, cl: '', ind: '', tel: '', st: 'a', no: '' });
  }
  function more(key, list, n, rowFn) {
    var lim = ui.more[key] || n, h = '';
    for (var i = 0; i < list.length && i < lim; i++) h += rowFn(list[i]);
    if (list.length > lim) h += btn('Mostra altri (' + (list.length - lim) + ')', 'more', ' data-k="' + key + '" data-n="' + (lim + n) + '"', 'w');
    return h;
  }
  function empty(t) { return '<p class="em">' + t + '</p>'; }
  function kv(k, v) { return '<tr><th>' + k + '</th><td>' + v + '</td></tr>'; }

  /* ---------- righe ---------- */
  function todoRow(t, hideCant) {
    var cn = hideCant ? '' : C.cantName(db, t.c);
    return '<table class="tr"><tr><td class="tc">' + btn(t.d ? 'OK' : '&nbsp;', 'tog', ' data-id="' + t.id + '" aria-label="' + (t.d ? 'Fatto' : 'Da fare') + '"', 'ck' + (t.d ? ' on' : '')) + '</td><td><a class="row' + (t.d ? ' dn' : '') + '" href="#fare/' + t.id + '">' +
      (t.p && !t.d ? '<b class="ur">URGENTE</b> ' : '') + (t.k !== 'f' ? '<span class="tg">' + E(C.label(C.TIPI, t.k)) + '</span> ' : '') + nl(t.t) + (cn ? '<br><small>' + E(cn) + '</small>' : '') + '</a></td></tr></table>';
  }
  function rapRow(r) {
    return '<a class="row" href="#rapportino/' + r.id + '"><b>' + E(C.fmtDate(r.g)) + ' · ' + E(C.fmtOre(r.o || 0)) + ((r.pe || 1) > 1 ? ' × ' + r.pe : '') + '</b> ' + E(C.cantName(db, r.c) || 'Senza cantiere') + (r.km ? ' · ' + E(C.fmtNum(r.km)) + ' km' : '') + (r.l ? '<br><small>' + E(r.l.length > 90 ? r.l.substr(0, 90) + '…' : r.l) + '</small>' : '') + '</a>';
  }
  function speRow(s) {
    return '<a class="row" href="#spesa/' + s.id + '"><b>' + E(C.fmtDate(s.g)) + ' · ' + E(C.fmtMoney(s.i || 0)) + '</b> ' + E(C.label(C.CAT, s.k)) + (s.pg === 'd' ? ' · <b>DA PAGARE</b>' : '') + '<br><small>' + E([s.de, C.cantName(db, s.c)].join(s.de && C.cantName(db, s.c) ? ' — ' : '')) + '</small></a>';
  }

  /* ---------- viste ---------- */
  var V = {};

  V.oggi = function () {
    var t = today(), n = now(), h = '<h1>' + E(C.fmtDate(t, true)) + ' <span class="clk" id="clk">' + C.fmtTime(n) + '</span></h1>';
    var act = [], a = C.live(db.cant), i;
    for (i = 0; i < a.length; i++) if (a[i].st === 'a') act.push(a[i]);
    h += '<div class="box">';
    if (db.timer) {
      h += '<p class="big">Al lavoro: <b>' + E(C.cantName(db, db.timer.c) || 'senza cantiere') + '</b></p><p>dalle ' + C.fmtTime(new Date(db.timer.t)) + ' del ' + E(C.fmtDate(C.ymd(new Date(db.timer.t)))) + ' — <span id="el">' + elapsed() + '</span></p>' +
        lnk('rapportino/nuovo?t=1', 'Fine lavoro: scrivi il rapportino', 'pri w') + btn('Annulla la timbratura', 'tcancel', '', 'w');
    } else if (!a.length) {
      h += '<p>Non c\'è ancora nessun cantiere.</p>' + lnk('cantiere/nuovo', '+ Aggiungi il primo cantiere', 'pri w');
    } else {
      h += '<p class="l">Inizia il lavoro in:</p>';
      for (i = 0; i < act.length; i++) h += btn(E(act[i].n), 'tstart', ' data-id="' + act[i].id + '"', 'w');
      h += btn('Senza cantiere', 'tstart', ' data-id=""', 'w') + (a.length > act.length ? lnk('cantieri', 'Altri cantieri…', 'w') : '');
    }
    h += '</div>';
    h += '<div class="q">' + lnk('rapportino/nuovo', '+ Rapportino') + lnk('spesa/nuovo', '+ Spesa') + lnk('fare/nuovo', '+ Da fare') + lnk('fare/nuovo?k=a', '+ Appunto') + '</div>';
    var open = C.todoOpen(db);
    h += '<h2>Da fare (' + open.length + ')</h2>';
    if (open.length) { for (i = 0; i < open.length && i < 6; i++) h += todoRow(open[i]); if (open.length > 6) h += lnk('fare', 'Tutti i ' + open.length, 'w'); }
    else h += empty('Niente in sospeso.');
    var ws = C.weekStart(t), mo = C.monthOf(t);
    var rt = C.rapTot(C.rapList(db, { from: t, to: t })), rw = C.rapTot(C.rapList(db, { from: ws, to: C.dateAdd(ws, 6) })), sm = C.speTot(C.speList(db, { from: mo + '-01', to: mo + '-31' }));
    h += '<h2>Riepilogo</h2><table class="kv">' + kv('Ore oggi', C.fmtOre(rt.ore)) + kv('Ore questa settimana', C.fmtOre(rw.ore)) + kv('Km questa settimana', C.fmtNum(rw.km)) + kv('Spese di ' + C.fmtMonth(mo), C.fmtMoney(sm.tot)) + (sm.daPagare ? kv('di cui da pagare', C.fmtMoney(sm.daPagare)) : '') + '</table>';
    return h;
  };
  function elapsed() {
    if (!db.timer) return '';
    var ms = now().getTime() - db.timer.t; if (ms < 0) ms = 0;
    var m = Math.floor(ms / 60000);
    return Math.floor(m / 60) + ' h ' + C.pad(m % 60) + ' min';
  }

  V.cantieri = function () {
    var a = C.live(db.cant), h = '<h1>Cantieri</h1>' + lnk('cantiere/nuovo', '+ Nuovo cantiere', 'pri w'), n = 0, chiusi = 0, i;
    var ord = { a: 0, p: 1, s: 2, v: 3, c: 4 };
    a.sort(function (x, y) { return (ord[x.st] - ord[y.st]) || (x.n < y.n ? -1 : 1); });
    for (i = 0; i < a.length; i++) {
      if (a[i].st === 'c') { chiusi++; if (!ui.chiusi) continue; }
      var s = C.cantSummary(db, a[i].id); n++;
      h += '<a class="row" href="#cantiere/' + a[i].id + '"><b class="big">' + E(a[i].n) + '</b>' + (a[i].st !== 'a' ? ' <span class="tg">' + E(C.label(C.STATI, a[i].st)) + '</span>' : '') +
        '<br><small>' + (a[i].cl ? E(a[i].cl) + ' · ' : '') + E(C.fmtOre(s.ore)) + ' · ' + E(C.fmtMoney(s.spese)) + ' · ' + s.aperti + ' da fare</small></a>';
    }
    if (!n) h += empty(chiusi ? 'Nessun cantiere aperto.' : 'Nessun cantiere. Aggiungine uno per collegarvi ore, spese e cose da fare.');
    if (chiusi) h += btn(ui.chiusi ? 'Nascondi i chiusi' : 'Mostra i chiusi (' + chiusi + ')', 'chiusi', '', 'w');
    return h;
  };

  V.cantiere = function (p, q) {
    if (p[1] === 'nuovo' || p[2] === 'mod') return formCant(p[1] === 'nuovo' ? null : p[1]);
    var c = C.byId(db.cant, p[1]);
    if (!c || c.x) return notFound();
    var s = C.cantSummary(db, c.id), id = c.id, i;
    var h = '<h1>' + E(c.n) + ' <span class="tg">' + E(C.label(C.STATI, c.st)) + '</span></h1><table class="kv">' +
      (c.cl ? kv('Cliente', E(c.cl)) : '') + (c.ind ? kv('Indirizzo', nl(c.ind)) : '') + (c.tel ? kv('Telefono', '<b class="big">' + E(c.tel) + '</b>') : '') + (c.no ? kv('Note', nl(c.no)) : '') +
      kv('Ore', C.fmtOre(s.ore) + (s.orePers !== s.ore ? ' (per persone: ' + C.fmtOre(s.orePers) + ')' : '') + ' in ' + s.giorni + ' rapportini') + kv('Km', C.fmtNum(s.km)) + kv('Spese', C.fmtMoney(s.spese)) + '</table>';
    h += '<div class="q">' + lnk('rapportino/nuovo?c=' + id, '+ Rapportino') + lnk('spesa/nuovo?c=' + id, '+ Spesa') + lnk('fare/nuovo?c=' + id, '+ Da fare') + lnk('cantiere/' + id + '/mod', 'Modifica') + '</div>' + (db.timer ? '' : btn('Inizia il lavoro qui', 'tstart', ' data-id="' + id + '"', 'w'));
    var open = C.todoOpen(db, id);
    h += '<h2>Da fare (' + open.length + ')</h2>' + (open.length ? more('ct', open, 8, function (t) { return todoRow(t, true); }) : empty('Niente in sospeso.'));
    var rl = C.rapList(db, { c: id }), sl = C.speList(db, { c: id });
    h += '<h2>Rapportini (' + rl.length + ')</h2>' + (rl.length ? more('cr', rl, 5, rapRow) : empty('Nessun rapportino.'));
    h += '<h2>Spese (' + sl.length + ')</h2>';
    if (sl.length) { var st = C.speTot(sl); h += '<p>'; for (i = 0; i < C.CAT.length; i++) if (st.cat[C.CAT[i][0]]) h += E(C.CAT[i][1]) + ' ' + E(C.fmtMoney(st.cat[C.CAT[i][0]])) + ' · '; h = h.replace(/ · $/, '') + '</p>' + more('cs', sl, 5, speRow); }
    else h += empty('Nessuna spesa.');
    return h;
  };
  function formCant(id) {
    var c = id ? C.byId(db.cant, id) : null;
    if (id && (!c || c.x)) return notFound();
    initDraft({ id: id, st: c ? c.st : 'a' });
    c = c || {};
    return '<h1>' + (id ? 'Modifica cantiere' : 'Nuovo cantiere') + '</h1>' + field('n', 'Nome del cantiere', c.n) + field('cl', 'Cliente', c.cl) + area('ind', 'Indirizzo', c.ind, 2) + field('tel', 'Telefono', c.tel) +
      choice('st', 'Stato', C.STATI, draft.st) + area('no', 'Note (accessi, chiavi, orari, misure…)', c.no, 4) + formEnd('savecant', id, 'cant', 'cantieri');
  }
  function formEnd(saveAct, id, coll, back) {
    return '<p class="err" id="err"></p><div class="fe">' + btn('Salva', saveAct, '', 'pri w') + (id ? btn('Elimina', 'del', ' data-k="' + coll + '" data-id="' + id + '" data-b="' + back + '"', 'w') : '') + btn('Annulla', 'back', '', 'w') + '</div>';
  }

  V.fare = function (p, q) {
    if (p[1]) return formTodo(p[1] === 'nuovo' ? null : p[1], q);
    var h = '<h1>Da fare</h1>' + lnk('fare/nuovo' + (ui.filt ? '?k=' + ui.filt : ''), '+ Aggiungi', 'pri w') + '<div class="ch">' + btn('Tutti', 'filt', ' data-v=""', ui.filt === '' ? 'on' : ''), i;
    for (i = 0; i < C.TIPI.length; i++) h += btn(E(C.TIPI[i][1].replace('Da ', '')), 'filt', ' data-v="' + C.TIPI[i][0] + '"', ui.filt === C.TIPI[i][0] ? 'on' : '');
    h += '</div>';
    var open = C.todoOpen(db), list = [], done = [], a = C.live(db.todo);
    for (i = 0; i < open.length; i++) if (!ui.filt || open[i].k === ui.filt) list.push(open[i]);
    for (i = 0; i < a.length; i++) if (a[i].d && (!ui.filt || a[i].k === ui.filt)) done.push(a[i]);
    done.sort(function (x, y) { return (y.m || 0) - (x.m || 0); });
    h += list.length ? more('td', list, 12, todoRow) : empty('Niente in sospeso.');
    if (done.length) {
      h += btn(ui.done ? 'Nascondi i fatti' : 'Mostra i fatti (' + done.length + ')', 'done', '', 'w');
      if (ui.done) h += more('tdd', done, 10, todoRow) + btn('Elimina tutti i fatti', 'cleardone', '', 'w');
    }
    return h;
  };
  function formTodo(id, q) {
    var t = id ? C.byId(db.todo, id) : null;
    if (id && (!t || t.x)) return notFound();
    initDraft({ id: id, k: t ? t.k : (q.k || 'f'), c: t ? t.c : (q.c || ''), p: t ? (t.p ? '1' : '0') : '0' });
    t = t || {};
    return '<h1>' + (id ? 'Modifica' : 'Nuova voce') + '</h1>' + area('t', 'Testo', t.t, 3) + choice('k', 'Tipo', C.TIPI, draft.k) + cantPick() +
      choice('p', 'Urgente', [['0', 'No'], ['1', 'Sì']], draft.p) + formEnd('savetodo', id, 'todo', 'fare');
  }

  V.rapportini = function (p, q) {
    var ws = C.weekStart(q.w || today()), we = C.dateAdd(ws, 6), list = C.rapList(db, { from: ws, to: we }), t = C.rapTot(list), i;
    var h = '<h1>Ore e rapportini</h1>' + lnk('rapportino/nuovo', '+ Nuovo rapportino', 'pri w') +
      '<table class="st"><tr><td class="sb">' + lnk('rapportini?w=' + C.dateAdd(ws, -7), '&lt;') + '</td><td class="sv">Settimana<br>' + E(C.fmtDate(ws)) + ' – ' + E(C.fmtDate(we)) + '</td><td class="sb">' + lnk('rapportini?w=' + C.dateAdd(ws, 7), '&gt;') + '</td></tr></table>';
    h += '<table class="kv">' + kv('Ore', '<b class="big">' + C.fmtOre(t.ore) + '</b>' + (t.orePers !== t.ore ? ' (per persone: ' + C.fmtOre(t.orePers) + ')' : '')) + kv('Km', C.fmtNum(t.km)) + '</table><table class="wk"><tr>';
    for (i = 0; i < 7; i++) { var d = C.dateAdd(ws, i); h += '<td' + (d === today() ? ' class="on"' : '') + '>' + C.fmtDate(d).substr(0, 3) + '<br><b>' + C.fmtNum(C.rapTot(C.rapList(db, { from: d, to: d })).ore) + '</b></td>'; }
    h += '</tr></table>';
    h += list.length ? more('rw', list, 14, rapRow) : empty('Nessun rapportino in questa settimana.');
    return h;
  };
  V.rapportino = function (p, q) {
    var id = p[1] === 'nuovo' ? null : p[1], r = id ? C.byId(db.rap, id) : null;
    if (id && (!r || r.x)) return notFound();
    var d = { id: id, g: r ? r.g : today(), c: r ? r.c : (q.c || ''), o: r ? r.o : 8, pe: r ? (r.pe || 1) : 1, t: 0 };
    if (!r && q.t && db.timer) { d.t = 1; d.c = db.timer.c; d.g = C.ymd(new Date(db.timer.t)); d.o = C.quarter(now().getTime() - db.timer.t); }
    initDraft(d);
    r = r || {};
    return '<h1>' + (id ? 'Modifica rapportino' : 'Nuovo rapportino') + '</h1>' + (draft.t ? '<p class="box">Ore calcolate dalla timbratura, arrotondate al quarto d\'ora: correggile se serve.</p>' : '') +
      stepper('g', 'Data', draft.g, 1) + cantPick() + stepper('o', 'Ore lavorate', draft.o, draft.t ? 0.25 : 0.5) + stepper('pe', 'Persone', draft.pe, 1) +
      area('l', 'Lavori eseguiti', r.l, 4) + area('ma', 'Materiali usati', r.ma, 3) + field('km', 'Km percorsi', r.km ? C.fmtNum(r.km) : '', ' inputmode="decimal"') + formEnd('saverap', id, 'rap', 'rapportini');
  };

  V.spese = function (p, q) {
    var mo = q.m || C.monthOf(today()), list = C.speList(db, { from: mo + '-01', to: mo + '-31' }), t = C.speTot(list), i;
    var h = '<h1>Spese</h1>' + lnk('spesa/nuovo', '+ Nuova spesa', 'pri w') +
      '<table class="st"><tr><td class="sb">' + lnk('spese?m=' + C.monthAdd(mo, -1), '&lt;') + '</td><td class="sv">' + E(C.fmtMonth(mo)) + '</td><td class="sb">' + lnk('spese?m=' + C.monthAdd(mo, 1), '&gt;') + '</td></tr></table>';
    h += '<table class="kv">' + kv('Totale', '<b class="big">' + C.fmtMoney(t.tot) + '</b>');
    for (i = 0; i < C.CAT.length; i++) if (t.cat[C.CAT[i][0]]) h += kv(E(C.CAT[i][1]), C.fmtMoney(t.cat[C.CAT[i][0]]));
    if (t.daPagare) h += kv('Da pagare', '<b>' + C.fmtMoney(t.daPagare) + '</b>');
    h += '</table>' + (list.length ? more('sm', list, 14, speRow) : empty('Nessuna spesa in questo mese.'));
    return h;
  };
  V.spesa = function (p, q) {
    var id = p[1] === 'nuovo' ? null : p[1], s = id ? C.byId(db.spe, id) : null;
    if (id && (!s || s.x)) return notFound();
    initDraft({ id: id, g: s ? s.g : today(), c: s ? s.c : (q.c || ''), k: s ? s.k : 'm', pg: s ? s.pg : 'k', sc: s ? s.sc : 's' });
    s = s || {};
    return '<h1>' + (id ? 'Modifica spesa' : 'Nuova spesa') + '</h1>' + field('i', 'Importo in euro', s.i ? C.fmtNum(s.i / 100) : '', ' inputmode="decimal"') + choice('k', 'Categoria', C.CAT, draft.k) +
      field('de', 'Descrizione o fornitore', s.de) + cantPick() + stepper('g', 'Data', draft.g, 1) + choice('pg', 'Pagamento', C.PAG, draft.pg) + choice('sc', 'Documento', C.DOC, draft.sc) + formEnd('savespe', id, 'spe', 'spese');
  };

  V.altro = function () {
    return '<h1>Altro</h1>' + lnk('liste', 'Liste di controllo', 'w') + lnk('calcoli', 'Calcoli rapidi', 'w') + lnk('invia', 'Passa i dati al telefono', 'w') + lnk('dati', 'Copie, ripristino, impostazioni', 'w') + lnk('guida', 'Come si usa', 'w') + (key ? btn('Blocca (richiede di nuovo la password)', 'lock', '', 'w') : '') +
      '<p><a href="../">Torna al Faldone</a></p>';
  };

  V.liste = function () {
    var a = C.live(db.liste), h = '<h1>Liste di controllo</h1><p>Liste da ripetere: carico del furgone, chiusura del cantiere, attrezzi da riportare. Si spuntano e poi si azzerano.</p>', i, j;
    for (i = 0; i < a.length; i++) { var n = 0; for (j = 0; j < a[i].v.length; j++) if (a[i].v[j].d) n++; h += '<a class="row" href="#lista/' + a[i].id + '"><b class="big">' + E(a[i].n) + '</b><br><small>' + n + ' di ' + a[i].v.length + ' spuntate</small></a>'; }
    if (!a.length) h += empty('Nessuna lista.');
    return h + field('ln', 'Nuova lista', '') + '<p class="err" id="err"></p>' + btn('Crea la lista', 'lnew', '', 'pri w');
  };
  V.lista = function (p) {
    var l = C.byId(db.liste, p[1]);
    if (!l || l.x) return notFound();
    var h = '<h1>' + E(l.n) + '</h1>', i;
    for (i = 0; i < l.v.length; i++) h += '<table class="tr"><tr><td class="tc">' + btn(l.v[i].d ? 'OK' : '&nbsp;', 'ltog', ' data-i="' + i + '"', 'ck' + (l.v[i].d ? ' on' : '')) + '</td><td class="row' + (l.v[i].d ? ' dn' : '') + '">' + E(l.v[i].t) + '</td>' + (ui.ledit ? '<td class="tc">' + btn('×', 'ldelitem', ' data-i="' + i + '" aria-label="Togli"', 'ck') + '</td>' : '') + '</tr></table>';
    if (!l.v.length) h += empty('Lista vuota: aggiungi le voci qui sotto.');
    h += btn('Azzera le spunte', 'lreset', '', 'w') + field('li', 'Aggiungi una voce', '') + btn('Aggiungi', 'ladd', '', 'pri w') + btn(ui.ledit ? 'Fine modifica' : 'Togli voci…', 'ledit', '', 'w') + (ui.ledit ? btn('Elimina la lista', 'del', ' data-k="liste" data-id="' + l.id + '" data-b="liste"', 'w') : '');
    return h;
  };

  V.calcoli = function () {
    var h = '<h1>Calcoli rapidi</h1><h2>IVA</h2>' + field('ci', 'Importo in euro', calc.ci || '', ' inputmode="decimal"') + choice('ca', 'Aliquota', [['22', '22%'], ['10', '10%'], ['4', '4%']], calc.ca || '22') +
      btn('L\'importo è senza IVA', 'civa', ' data-v="n"', 'w') + btn('L\'importo è con IVA', 'civa', ' data-v="l"', 'w') + '<div class="res" id="r_iva">' + (calc.riva || '') + '</div>';
    h += '<h2>Superficie e volume</h2>' + field('cl', 'Lunghezza in metri', calc.cl || '', ' inputmode="decimal"') + field('cw', 'Larghezza in metri', calc.cw || '', ' inputmode="decimal"') + field('cs', 'Spessore in centimetri (facoltativo)', calc.cs || '', ' inputmode="decimal"') +
      btn('Calcola', 'cvol', '', 'w') + '<div class="res" id="r_vol">' + (calc.rvol || '') + '</div>';
    h += '<h2>Pendenza</h2>' + field('pd', 'Dislivello in centimetri', calc.pd || '', ' inputmode="decimal"') + field('pl', 'Lunghezza in metri', calc.pl || '', ' inputmode="decimal"') + btn('Calcola', 'cpen', '', 'w') + '<div class="res" id="r_pen">' + (calc.rpen || '') + '</div>';
    return h;
  };

  var PER = [['oggi', 'Oggi'], ['sett', 'Questa settimana'], ['mese', 'Questo mese'], ['tutto', 'Tutto l\'archivio']];
  function range(p) {
    var t = today();
    if (p === 'oggi') return [t, t];
    if (p === 'sett') return [C.weekStart(t), C.dateAdd(C.weekStart(t), 6)];
    if (p === 'mese') return [C.monthOf(t) + '-01', C.monthOf(t) + '-31'];
    return [null, null];
  }
  function base() { return location.href.split('#')[0]; }
  V.invia = function (p, q) {
    var h = '<h1>Passa i dati al telefono</h1>', i;
    if (!q.p) {
      h += '<p>Il Kindle non può scaricare né spedire file. Per portare fuori rapportini e spese si mostra un codice QR: inquadralo con la fotocamera del telefono, si apre questa stessa pagina e i dati vengono uniti a quelli del telefono. Da lì si scaricano in CSV.</p><p>Nulla passa da Internet: i dati sono dentro il codice.</p>';
      for (i = 0; i < PER.length; i++) {
        var r = range(PER[i][0]), sub = C.subset(db, r[0], r[1], PER[i][0] === 'tutto'), n = C.count(sub);
        h += n ? lnk('invia?p=' + PER[i][0], E(PER[i][1]) + ' — ' + n + ' voci, ' + C.pack(sub, CHUNK, 'x').parts.length + ' QR', 'w') : '<p class="em">' + E(PER[i][1]) + ': niente da passare.</p>';
      }
      return h + '<p><small>I periodi passano rapportini e spese con i loro cantieri; «Tutto l\'archivio» anche le cose da fare e le liste. Con molti dati i codici diventano tanti: conviene passarli ogni settimana.</small></p>';
    }
    if (!xfer || xfer.p !== q.p) { var rg = range(q.p); xfer = C.pack(C.subset(db, rg[0], rg[1], q.p === 'tutto'), CHUNK); xfer.p = q.p; }
    var k = Math.max(0, Math.min(xfer.parts.length - 1, (+q.n || 1) - 1)), tot = xfer.parts.length, url = C.link(base(), xfer, k);
    h += '<p class="big"><b>Codice ' + (k + 1) + ' di ' + tot + '</b> — ' + E(C.label(PER, q.p)) + '</p><div id="qr" class="qr"></div>';
    h += (k + 1 < tot ? lnk('invia?p=' + q.p + '&n=' + (k + 2), 'Fatto, prossimo codice &gt;', 'pri w') : '<p class="box"><b>Era l\'ultimo.</b> Sul telefono deve comparire «Dati ricevuti».</p>') + (k > 0 ? lnk('invia?p=' + q.p + '&n=' + k, '&lt; Codice precedente', 'w') : '') + lnk('invia', 'Chiudi', 'w');
    after = function () { drawQr(document.getElementById('qr'), url); };
    return h;
  };
  function drawQr(el, text) {
    if (!el) return;
    var m, n, q = 4, w = Math.min(el.offsetWidth || 480, 560), px, r, c;
    try { m = QR.matrix(text); } catch (e) { el.innerHTML = '<p class="err">Codice troppo lungo.</p>'; return; }
    n = m.length; px = Math.max(2, Math.floor(w / (n + 2 * q)));
    var cv = document.createElement('canvas');
    if (cv.getContext) {
      cv.width = cv.height = (n + 2 * q) * px;
      var g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height); g.fillStyle = '#000';
      for (r = 0; r < n; r++) for (c = 0; c < n; c++) if (m[r][c]) g.fillRect((c + q) * px, (r + q) * px, px, px);
      el.appendChild(cv);
    } else {
      var h = '<table class="qt" cellspacing="0" cellpadding="0" style="margin:' + (q * px) + 'px">';
      for (r = 0; r < n; r++) { h += '<tr>'; for (c = 0; c < n; c++) h += '<td style="width:' + px + 'px;height:' + px + 'px;background:' + (m[r][c] ? '#000' : '#fff') + '"></td>'; h += '</tr>'; }
      el.innerHTML = h + '</table>';
    }
  }

  var canDl = (function () { try { return typeof Blob !== 'undefined' && 'download' in document.createElement('a') && !!(window.URL && URL.createObjectURL); } catch (e) { return false; } })();
  V.dati = function () {
    var h = '<h1>Dati e impostazioni</h1>' + (ui.msg ? '<p class="box"><b>' + E(ui.msg) + '</b></p>' : '');
    ui.msg = '';
    h += '<table class="kv">' + kv('Cantieri', C.live(db.cant).length) + kv('Rapportini', C.live(db.rap).length) + kv('Spese', C.live(db.spe).length) + kv('Da fare e appunti', C.live(db.todo).length) + kv('Liste', C.live(db.liste).length) + '</table>';
    h += '<p>' + (canStore ? 'I dati stanno solo su questo dispositivo, nella memoria del browser: se si cancellano i dati di navigazione, spariscono. Fai spesso una copia.' : '<b>Attenzione: questo browser non permette di salvare. I dati si perdono chiudendo la pagina.</b>') + '</p>';
    h += '<h2>Copia di sicurezza</h2>' + lnk('invia', 'Passa i dati al telefono (QR)', 'w');
    if (canDl) h += btn('Scarica la copia completa (JSON)', 'dl', ' data-k="json"', 'w') + btn('Scarica i rapportini (CSV)', 'dl', ' data-k="rap"', 'w') + btn('Scarica le spese (CSV)', 'dl', ' data-k="spe"', 'w');
    h += btn(ui.json ? 'Nascondi il testo della copia' : 'Mostra la copia come testo', 'json', '', 'w');
    if (ui.json) h += '<textarea class="in" rows="6" readonly id="f_out">' + E(JSON.stringify(exportObj())) + '</textarea>';
    h += '<h2>Ripristino</h2>' + area('imp', 'Incolla qui il testo di una copia', '', 4);
    if (window.FileReader) h += '<label class="l" for="file">oppure scegli il file della copia</label><input type="file" id="file" accept=".json,application/json">';
    h += '<p class="err" id="err"></p>' + btn('Unisci ai dati presenti', 'restore', ' data-v="m"', 'w') + btn('Sostituisci tutti i dati', 'restore', ' data-v="r"', 'w');
    h += '<h2>Impostazioni</h2>' + choice('fs', 'Grandezza del testo', [['1', 'Normale'], ['2', 'Grande'], ['3', 'Molto grande']], String(db.set.fs || 1)) +
      stepper('off', 'Correzione dell\'ora (adesso segna ' + C.fmtTime(now()) + ')', db.set.off || 0, 1) + '<p><small>Serve se il browser del Kindle mostra un\'ora sbagliata.</small></p>';
    h += '<h2>Cancellazione</h2>' + btn('Cancella tutti i dati di questo dispositivo', 'wipe', '', 'w');
    return h;
  };
  function exportObj() { var o = { app: 'lavoro', v: 1, quando: now().getTime() }; for (var i = 0; i < C.COLL.length; i++) o[C.COLL[i]] = db[C.COLL[i]]; return o; }

  V.ricevi = function () {
    var st = db.rx, h = '<h1>Ricezione dei dati</h1>';
    if (ui.rx) { h += '<p class="box big"><b>Dati ricevuti.</b><br>' + ui.rx.nuovi + ' voci nuove, ' + ui.rx.aggiornati + ' aggiornate.</p>' + lnk('rapportini', 'Vai ai rapportini', 'pri w') + lnk('dati', 'Scarica o fai una copia', 'w'); }
    else if (ui.rxErr) h += '<p class="err">' + E(ui.rxErr) + '</p>';
    else if (st && st.missing && st.missing.length) h += '<p class="box big">Ricevuti ' + (st.n - st.missing.length) + ' codici su ' + st.n + '.<br><b>Mancano: ' + st.missing.join(', ') + '</b></p><p>Inquadra gli altri codici dal Kindle: l\'ordine non conta.</p>';
    else h += empty('Nessuna ricezione in corso.');
    return h;
  };

  V.guida = function () {
    return '<h1>Come si usa</h1>' +
      '<h2>Sul Kindle</h2><p>Apri la pagina una volta con il Wi‑Fi acceso e lasciala aperta: poi lavora anche senza rete, perché non chiede più niente a Internet. Salvala tra i segnalibri del browser.</p>' +
      '<h2>La giornata</h2><p><b>Oggi</b>: tocca il cantiere per timbrare l\'inizio; a fine lavoro «Fine lavoro» apre il rapportino con le ore già calcolate. Da lì si aggiungono anche spese, cose da fare e appunti.</p>' +
      '<p><b>Cantieri</b>: cliente, indirizzo, telefono, note e i totali di ore, km e spese. <b>Da fare</b>: lavori, acquisti, telefonate e appunti, anche per cantiere. <b>Ore</b>: rapportini per settimana. <b>Spese</b>: per mese e per categoria.</p>' +
      '<h2>Portare fuori i dati</h2><p>Altro → «Passa i dati al telefono»: il Kindle mostra dei codici QR, il telefono li inquadra e riceve i dati. Sul telefono o sul computer, da «Copie, ripristino, impostazioni», si scaricano i CSV per il foglio di calcolo.</p>' +
      '<p>Il passaggio va solo dal Kindle verso il telefono: il Kindle non ha fotocamera. Ogni dispositivo tiene i propri dati.</p>' +
      '<h2>Password</h2><p>All\'apertura la pagina chiede la password: senza, non mostra nulla. I cantieri del registro dell\'ufficio arrivano già caricati; quello che aggiungi resta su questo dispositivo, cifrato con la stessa password. «Altro → Blocca» richiude la pagina.</p>' +
      '<h2>Attenzione</h2><p>I dati stanno nella memoria del browser. Se si svuota la cronologia o si ripristina il Kindle, si perdono: passa i dati al telefono con regolarità.</p>';
  };

  function notFound() { return '<h1>Voce non trovata</h1><p>Forse è stata eliminata.</p>' + lnk('oggi', 'Torna a Oggi', 'w'); }

  /* ---------- moduli ---------- */
  function initDraft(d) { if (draftFor !== location.hash) { draft = d; draftFor = location.hash; } }
  function err(t) { var e = document.getElementById('err'); if (e) { e.innerHTML = E(t); if (e.scrollIntoView) e.scrollIntoView(false); } }
  function armed(el, text) {
    if (el.getAttribute('data-ok')) return true;
    el.setAttribute('data-ok', '1'); el.innerHTML = text || 'Sicuro? Tocca ancora per confermare'; el.className += ' on';
    return false;
  }

  var A = {};
  A.pick = function (el) {
    var g = el.getAttribute('data-g'), v = el.getAttribute('data-v'), bs = document.getElementsByTagName('button');
    for (var i = 0; i < bs.length; i++) if (bs[i].getAttribute('data-g') === g) bs[i].className = String(bs[i].className).replace(/\s*\bon\b/g, '');
    el.className += ' on';
    if (g === 'fs') { db.set.fs = +v; save(); applySet(); return; }
    if (g === 'ca') { calc.ca = v; return; }
    if (draft) draft[g] = v;
  };
  A.allc = function (el) { var d = document.getElementById('allc'); if (d) d.style.display = 'block'; el.style.display = 'none'; };
  A.step = function (el) {
    var f = el.getAttribute('data-f'), d = parseFloat(el.getAttribute('data-d')), s = STEP[f], v;
    if (f === 'off') { v = (db.set.off || 0) + d; if (v < s.min || v > s.max) return; db.set.off = v; save(); render(); return; }
    if (!draft) return;
    if (f === 'g') v = C.dateAdd(draft.g, d);
    else { v = Math.round((draft[f] + d) * 100) / 100; if (v < s.min) v = s.min; if (v > s.max) v = s.max; }
    draft[f] = v;
    document.getElementById('s_' + f).innerHTML = E(s.fmt(v));
  };
  A.back = function () { leave(); };
  function leave(to) {
    var q = route().q, dest = to || (q.c ? 'cantiere/' + q.c : null);
    if (!dest) { var p = route().p[0]; dest = { cantiere: draft && draft.id ? 'cantiere/' + draft.id : 'cantieri', fare: 'fare', rapportino: 'rapportini', spesa: 'spese' }[p] || 'oggi'; }
    draft = null; draftFor = null; go(dest);
  }
  A.savecant = function () {
    var n = val('n'); if (!n) return err('Scrivi il nome del cantiere.');
    var id = draft.id || C.newId();
    C.put(db.cant, { id: id, n: n, cl: val('cl'), ind: val('ind'), tel: val('tel'), st: draft.st, no: val('no') }); save(); leave('cantiere/' + id);
  };
  A.savetodo = function () {
    var t = val('t'); if (!t) return err('Scrivi il testo.');
    var old = draft.id ? C.byId(db.todo, draft.id) : null;
    newCant();
    C.put(db.todo, { id: draft.id || C.newId(), t: t, k: draft.k, c: draft.c, p: draft.p === '1' ? 1 : 0, d: old ? old.d : 0 }); save(); leave();
  };
  A.saverap = function () {
    var km = val('km'), kmn = km === '' ? 0 : C.parseNum(km);
    if (kmn === null) return err('I km devono essere un numero.');
    if (!draft.o && !val('l')) return err('Indica le ore oppure i lavori eseguiti.');
    newCant();
    C.put(db.rap, { id: draft.id || C.newId(), g: draft.g, c: draft.c, o: draft.o, pe: draft.pe, l: val('l'), ma: val('ma'), km: kmn });
    if (draft.t) db.timer = null;
    save(); leave(draft.t ? 'oggi' : null);
  };
  A.savespe = function () {
    var i = C.parseMoney(val('i'));
    if (i === null || i <= 0) return err('Scrivi l\'importo, per esempio 12,50.');
    newCant();
    C.put(db.spe, { id: draft.id || C.newId(), g: draft.g, c: draft.c, i: i, k: draft.k, de: val('de'), pg: draft.pg, sc: draft.sc }); save(); leave();
  };
  A.del = function (el) {
    if (!armed(el)) return;
    C.remove(db[el.getAttribute('data-k')], el.getAttribute('data-id')); save(); ui.ledit = false; draft = null; draftFor = null; go(el.getAttribute('data-b'));
  };
  A.tog = function (el) {
    var t = C.byId(db.todo, el.getAttribute('data-id')); if (!t) return;
    t.d = t.d ? 0 : 1; C.put(db.todo, t); save(); render();
  };
  A.filt = function (el) { ui.filt = el.getAttribute('data-v'); ui.more.td = 0; render(); };
  A.done = function () { ui.done = !ui.done; render(); };
  A.chiusi = function () { ui.chiusi = !ui.chiusi; render(); };
  A.json = function () { ui.json = !ui.json; render(); };
  A.cleardone = function (el) {
    if (!armed(el)) return;
    var a = C.live(db.todo); for (var i = 0; i < a.length; i++) if (a[i].d) C.remove(db.todo, a[i].id);
    save(); render();
  };
  A.more = function (el) { ui.more[el.getAttribute('data-k')] = +el.getAttribute('data-n'); render(true); };
  A.tstart = function (el) { db.timer = { c: el.getAttribute('data-id'), t: now().getTime() }; save(); go('oggi'); };
  A.tcancel = function (el) { if (!armed(el)) return; db.timer = null; save(); render(); };

  function curList() { return C.byId(db.liste, route().p[1]); }
  A.lnew = function () { var n = val('ln'); if (!n) return err('Scrivi il nome della lista.'); var id = C.newId(); C.put(db.liste, { id: id, n: n, v: [] }); save(); go('lista/' + id); };
  A.ladd = function () { var l = curList(), t = val('li'); if (!l || !t) return; l.v.push({ t: t, d: 0 }); C.put(db.liste, l); save(); render(true); var f = document.getElementById('f_li'); if (f && f.focus) f.focus(); };
  A.ltog = function (el) { var l = curList(), it = l && l.v[+el.getAttribute('data-i')]; if (!it) return; it.d = it.d ? 0 : 1; C.put(db.liste, l); save(); render(true); };
  A.lreset = function () { var l = curList(); if (!l) return; for (var i = 0; i < l.v.length; i++) l.v[i].d = 0; C.put(db.liste, l); save(); render(true); };
  A.ledit = function () { ui.ledit = !ui.ledit; render(true); };
  A.ldelitem = function (el) { var l = curList(); if (!l) return; l.v.splice(+el.getAttribute('data-i'), 1); C.put(db.liste, l); save(); render(true); };

  function keepCalc() { var k = ['ci', 'cl', 'cw', 'cs', 'pd', 'pl']; for (var i = 0; i < k.length; i++) calc[k[i]] = val(k[i]); }
  function res(id, key, html) { calc[key] = html; var e = document.getElementById(id); if (e) e.innerHTML = html; }
  A.civa = function (el) {
    keepCalc(); var c = C.parseMoney(calc.ci), al = +(calc.ca || 22), netto, lordo;
    if (c === null) return res('r_iva', 'riva', '<p class="err">Scrivi un importo.</p>');
    if (el.getAttribute('data-v') === 'n') { netto = c; lordo = Math.round(c * (100 + al) / 100); } else { lordo = c; netto = Math.round(c * 100 / (100 + al)); }
    res('r_iva', 'riva', '<table class="kv">' + kv('Imponibile', C.fmtMoney(netto)) + kv('IVA ' + al + '%', C.fmtMoney(lordo - netto)) + kv('Totale', '<b class="big">' + C.fmtMoney(lordo) + '</b>') + '</table>');
  };
  A.cvol = function () {
    keepCalc(); var l = C.parseNum(calc.cl), w = C.parseNum(calc.cw), s = calc.cs === '' ? null : C.parseNum(calc.cs);
    if (l === null || w === null || (calc.cs !== '' && s === null)) return res('r_vol', 'rvol', '<p class="err">Scrivi lunghezza e larghezza in numeri.</p>');
    res('r_vol', 'rvol', '<table class="kv">' + kv('Superficie', '<b class="big">' + C.fmtNum(l * w) + ' m²</b>') + (s !== null ? kv('Volume', '<b class="big">' + C.fmtNum(l * w * s / 100) + ' m³</b>') : '') + '</table>');
  };
  A.cpen = function () {
    keepCalc(); var d = C.parseNum(calc.pd), l = C.parseNum(calc.pl);
    if (d === null || l === null || l === 0) return res('r_pen', 'rpen', '<p class="err">Scrivi dislivello e lunghezza in numeri.</p>');
    res('r_pen', 'rpen', '<table class="kv">' + kv('Pendenza', '<b class="big">' + C.fmtNum(d / l) + ' %</b>') + kv('Cioè', C.fmtNum(d / l) + ' cm ogni metro') + '</table>');
  };

  A.dl = function (el) {
    var k = el.getAttribute('data-k'), text = k === 'json' ? JSON.stringify(exportObj()) : '﻿' + (k === 'rap' ? C.csvRap(db) : C.csvSpe(db));
    var name = 'lavoro-' + (k === 'json' ? 'copia' : k === 'rap' ? 'rapportini' : 'spese') + '-' + today() + (k === 'json' ? '.json' : '.csv');
    var a = document.createElement('a'), url = URL.createObjectURL(new Blob([text], { type: k === 'json' ? 'application/json' : 'text/csv;charset=utf-8' }));
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  };
  function doRestore(text, mode) {
    var o = parse(text);
    if (!o || typeof o !== 'object' || !(C.isArr(o.rap) || C.isArr(o.cant) || C.isArr(o.spe) || C.isArr(o.todo))) return err('Il testo non è una copia valida.');
    if (mode === 'r') { var set = db.set; db = C.norm(o); db.set = set; ui.msg = 'Dati sostituiti con la copia.'; }
    else { var r = C.merge(db, o); ui.msg = 'Copia unita: ' + r.nuovi + ' voci nuove, ' + r.aggiornati + ' aggiornate.'; }
    save(); render();
  }
  A.restore = function (el) {
    var mode = el.getAttribute('data-v'), text = val('imp'), f = document.getElementById('file');
    if (!text && f && f.files && f.files[0]) {
      if (mode === 'r' && !armed(el, 'Sostituire tutto? Tocca ancora')) return;
      var rd = new FileReader(); rd.onload = function () { doRestore(String(rd.result), mode); }; rd.readAsText(f.files[0]); return;
    }
    if (!text) return err('Incolla il testo della copia o scegli il file.');
    if (mode === 'r' && !armed(el, 'Sostituire tutto? Tocca ancora')) return;
    doRestore(text, mode);
  };
  A.wipe = function (el) {
    if (!el.getAttribute('data-ok')) { armed(el, 'Cancello tutto? Tocca ancora'); return; }
    if (el.getAttribute('data-ok') === '1') { el.setAttribute('data-ok', '2'); el.innerHTML = 'Ultima conferma: tocca per cancellare'; return; }
    var set = db.set; db = C.empty(); db.set = set; save(); ui.msg = 'Tutti i dati sono stati cancellati.'; render();
  };

  /* ---------- navigazione ---------- */
  var NAV = [['oggi', 'Oggi'], ['cantieri', 'Cantieri'], ['fare', 'Da fare'], ['rapportini', 'Ore'], ['spese', 'Spese'], ['altro', 'Altro']];
  var TAB = { cantiere: 'cantieri', rapportino: 'rapportini', spesa: 'spese', liste: 'altro', lista: 'altro', calcoli: 'altro', invia: 'altro', dati: 'altro', guida: 'altro', ricevi: 'altro' };
  function route() {
    var h = String(location.hash || '').replace(/^#/, ''), i = h.indexOf('?'), q = {}, path = i < 0 ? h : h.substr(0, i);
    if (i >= 0) { var kv2 = h.substr(i + 1).split('&'); for (var j = 0; j < kv2.length; j++) { var e = kv2[j].split('='); try { q[e[0]] = decodeURIComponent(e[1] || ''); } catch (x) { q[e[0]] = e[1] || ''; } } }
    var p = path.split('/'); if (!p[0]) p[0] = 'oggi';
    return { p: p, q: q };
  }
  function go(h) { if (location.hash === '#' + h) render(); else location.hash = h; }
  function applySet() { document.body.className = 'fs' + (db.set.fs || 1); }
  function render(keepScroll) {
    var r = route(), name = r.p[0], view = V[name] || notFound, tab = TAB[name] || name, h = '<table class="nav"><tr>', i;
    if (draftFor !== location.hash) { draft = null; draftFor = null; }
    after = null;
    for (i = 0; i < NAV.length; i++) h += '<td' + (NAV[i][0] === tab ? ' class="on"' : '') + '><a href="#' + NAV[i][0] + '">' + NAV[i][1] + '</a></td>';
    h += '</tr></table>' + (canStore ? '' : '<p class="box"><b>Questo browser non salva i dati.</b></p>');
    var body;
    try { body = view(r.p, r.q); } catch (e) { body = '<h1>Errore</h1><p class="err">' + E(e && e.message ? e.message : e) + '</p>'; }
    document.getElementById('app').innerHTML = h + '<div class="main">' + body + '</div>';
    if (after) after();
    if (!keepScroll && lastHash !== location.hash && window.scrollTo) window.scrollTo(0, 0);
    lastHash = location.hash;
  }

  function incoming() {
    var part = C.parseLink(location.hash);
    if (!part) return false;
    ui.rx = null; ui.rxErr = '';
    try {
      var st = C.receive(db.rx, part);
      if (st.data !== undefined) { ui.rx = C.merge(db, st.data); db.rx = null; }
      else db.rx = st;
      save();
    } catch (e) { ui.rxErr = 'Codice non leggibile: riprova a inquadrarlo.'; }
    if (window.history && history.replaceState) { history.replaceState(null, '', '#ricevi'); render(); } else location.hash = 'ricevi';
    return true;
  }
  function onHash() { if (locked) lockView('', ''); else if (!incoming()) render(); }

  /* ---------- accesso con password ---------- */
  function lockView(msg, mode) {
    var h = '<div class="main"><h1>Lavoro</h1>';
    if (mode === 'old') h += '<p class="box">La password è stata cambiata. Per recuperare i dati salvati su questo dispositivo scrivi la <b>password precedente</b>.</p>';
    else h += '<p>Cantieri, ore e spese sono protetti da password.</p>';
    h += '<label class="l" for="f_pw">' + (mode === 'old' ? 'Password precedente' : 'Password') + '</label><input type="password" class="in" id="f_pw" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">' +
      '<p class="err" id="err">' + E(msg) + '</p><div class="fe">' + btn(mode === 'old' ? 'Recupera i dati' : 'Entra', mode === 'old' ? 'recover' : 'unlock', '', 'pri w') + btn('Mostra la password', 'showpw', '', 'w') +
      (mode === 'old' ? btn('Continua senza i dati di questo dispositivo', 'fresh', '', 'w') : '') + '</div></div>';
    document.getElementById('app').innerHTML = h;
  }
  function derive(pw, salt, it, done) {
    var e = document.getElementById('err'), bs = document.getElementsByTagName('button'), i;
    var msg = it > FAST ? 'Primo accesso su questo dispositivo: il controllo può durare anche qualche minuto, poi basteranno pochi secondi. Lascia la pagina aperta… ' : 'Controllo in corso… ';
    for (i = 0; i < bs.length; i++) bs[i].disabled = true;
    if (e) e.innerHTML = msg;
    setTimeout(function () {
      X.pbkdf2Async(pw, X.unb64(salt), it, function (f) { if (e) e.innerHTML = msg + Math.round(f * 100) + '%'; }, done);
    }, 30);
  }
  // Accesso rapido: la chiave dei dati precaricati resta sul dispositivo, cifrata con una chiave derivata dalla
  // stessa password con poche iterazioni. Il file pubblico resta protetto dalle iterazioni piene; il compromesso
  // riguarda solo chi ha in mano la memoria di questo dispositivo.
  function fastRec(per) { var f = parse(sget(KFAST)); return f && f.per === (per || BUNDLE.salt) && f.salt && f.it ? f : null; }
  // Chiave dell'archivio del dispositivo quando è ancora cifrato con una password o un sale precedenti:
  // se c'è l'accesso rapido di allora si usa quello, altrimenti la derivazione piena.
  function localKey(pw, box, done) {
    var f = fastRec(box.salt);
    if (!f) return derive(pw, box.salt, box.it, done);
    derive(pw, f.salt, f.it, function (kf) { var kb = X.open(kf, f); done(kb === null ? [] : X.unb64(kb)); });
  }
  function fastSave(pw) {
    if (fastRec() || !canStore) return;
    var salt = X.random(16), rec = X.seal(X.pbkdf2(pw, salt, FAST), X.b64(key));
    rec.salt = X.b64(salt); rec.it = FAST; rec.per = BUNDLE.salt;
    sset(KFAST, JSON.stringify(rec));
  }
  function pwVal() { var el = document.getElementById('f_pw'); return el ? el.value : ''; }
  function openLocal(k, box) { var t = X.open(k, box); if (t === null) lockView('', 'old'); else enter(C.norm(parse(t))); }
  // Entra: archivio del dispositivo, più l'eventuale archivio in chiaro di prima della password, più i dati precaricati.
  function enter(local) {
    var old = parse(sget(KEY));
    var pw = pend.pw;
    db = local; key = pend.key; locked = false;
    if (old) { old = C.norm(old); C.merge(db, old); if (!db.timer) db.timer = old.timer; if (!sget(KEY2)) db.set = old.set; }
    if (pend.data) C.merge(db, pend.data);
    pend = null;
    save();
    if (canStore) { sdel(KEY); sdel(KIN); }
    fastSave(pw);
    applySet(); onHash();
  }
  A.showpw = function (el) { var f = document.getElementById('f_pw'); try { f.type = f.type === 'password' ? 'text' : 'password'; el.innerHTML = f.type === 'password' ? 'Mostra la password' : 'Nascondi la password'; } catch (e) { /* alcuni browser non lo permettono */ } };
  A.unlock = function () {
    var pw = pwVal();
    if (!pw) return err('Scrivi la password.');
    var fast = fastRec();
    if (fast) return derive(pw, fast.salt, fast.it, function (kf) {
      var kb = X.open(kf, fast);
      if (kb === null) return lockView('Password sbagliata.', '');
      withKey(pw, X.unb64(kb));
    });
    derive(pw, BUNDLE.salt, BUNDLE.it, function (k) { withKey(pw, k); });
  };
  function withKey(pw, k) {
    var text = X.open(k, BUNDLE), box = parse(sget(KEY2));
    if (text === null) { sdel(KFAST); return lockView('Password sbagliata.', ''); }
    pend = { key: k, data: parse(text), pw: pw };
    if (!box || !box.salt) return enter(C.empty());
    if (box.salt === BUNDLE.salt && box.it === BUNDLE.it) return openLocal(k, box);
    localKey(pw, box, function (k2) { openLocal(k2, box); });
  }
  A.recover = function () {
    var pw = pwVal(), box = parse(sget(KEY2));
    if (!pw) return err('Scrivi la password precedente.');
    localKey(pw, box, function (k) { var t = X.open(k, box); if (t === null) lockView('Password precedente sbagliata.', 'old'); else enter(C.norm(parse(t))); });
  };
  A.fresh = function (el) { if (armed(el, 'I dati di questo dispositivo andranno persi. Tocca ancora')) enter(C.empty()); };
  A.lock = function () { location.reload(); };
  var OPEN = { unlock: 1, recover: 1, fresh: 1, showpw: 1 };

  document.onclick = function (ev) {
    ev = ev || window.event;
    var el = ev.target || ev.srcElement;
    while (el && el !== document) {
      var a = el.getAttribute && el.getAttribute('data-a');
      if (a && A[a] && (!locked || OPEN[a])) { if (ev.preventDefault) ev.preventDefault(); A[a](el); return false; }
      el = el.parentNode;
    }
  };
  if ('onhashchange' in window) window.onhashchange = onHash;
  else { var seen = location.hash; setInterval(function () { if (location.hash !== seen) { seen = location.hash; onHash(); } }, 300); }
  // Orologio e durata della timbratura: si aggiorna solo il testo, senza ridisegnare la pagina.
  setInterval(function () {
    var c = document.getElementById('clk'), e = document.getElementById('el');
    if (c) c.innerHTML = C.fmtTime(now());
    if (e) e.innerHTML = elapsed();
  }, 30000);

  document.onkeydown = function (ev) { ev = ev || window.event; if (locked && ev.keyCode === 13) { var b = document.getElementsByTagName('button')[0]; if (b && !b.disabled) A[b.getAttribute('data-a')](b); return false; } };
  applySet();
  onHash();
  try { if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js'); } catch (e) { /* facoltativo */ }
})();
