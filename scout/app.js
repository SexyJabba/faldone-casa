/* Lo Scout — interfaccia. Nessun dato viene scritto nell'HTML come stringa: tutto passa da el(). */
'use strict';

const $app = document.getElementById('app');
const S = { state: null, filters: { cat: '', effort: '', maxPrice: '', maxKm: '' } };

/* ---------- utilità ---------- */
function el(tag, attrs, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (k === 'value') n.value = v;
    else if (k === 'checked' || k === 'disabled' || k === 'selected' || k === 'open') n[k] = !!v;
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat(Infinity)) if (k != null && k !== false) n.append(k.nodeType ? k : document.createTextNode(String(k)));
  return n;
}
async function api(path, method = 'GET', body) {
  let r;
  try { r = await window.scoutApi(path, method, body); }
  catch { throw new Error('il server dello Scout non risponde. L\'app mostra i dati solo quando il server è acceso e raggiungibile.'); }
  if (r.status === 401) { location.reload(); throw new Error('Accesso richiesto'); }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'Errore ' + r.status);
  return j;
}
let toastT;
function toast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3200); }
const guard = (fn) => async (...a) => { try { return await fn(...a); } catch (e) { toast(e.message); } };
const eur = (n) => (n == null ? null : new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n));
const when = (iso) => (iso ? new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'mai');
const day = (iso) => (iso ? new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) : '');
const CAT = { auto: 'Auto', moto: 'Moto', gommoni: 'Gommoni e tender', altro: 'Altri mezzi' };
const tag = (cls, text, title) => el('span', { class: 'tag ' + cls, title }, text);
const TAGS = {
  src: () => tag('src', 'Dalla fonte', 'Dato letto dalla pagina dell\'annuncio'),
  seller: () => tag('seller', 'Dichiarato dal venditore', 'Testo dell\'inserzionista, non verificato'),
  you: (t) => tag('you', t || 'Scritto da te'),
};
function scoutTag(c) {
  const s = c.scout;
  if (!s) return tag('ai', 'Ipotesi dello scout sul modello', 'Motivazione della pista di ricerca: riguarda il modello, non questo esemplare');
  if (s.author === 'utente') return TAGS.you('Riscritto da te');
  if (s.author === 'ai-api') return tag('ai', 'Interpretazione AI · ' + (s.model || 'modello'), 'Testo generato dal modello AI collegato a partire dai dati dell\'annuncio e dal tuo profilo');
  return tag('ai', 'Interpretazione AI · allestimento', 'Scritta da Claude durante l\'allestimento del prototipo, leggendo questo annuncio il ' + day(s.writtenAt));
}
const icons = {
  scoperte: 'M12 3l2.6 5.6L20 9.5l-4 4 1 5.9L12 16.6 7 19.4l1-5.9-4-4 5.4-.9z',
  idee: 'M6 3h12v18l-6-4-6 4z', economici: 'M3 12V4h8l10 10-8 8zM7.5 8a.5.5 0 100-1 .5.5 0 000 1', profilo: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-8 9a8 8 0 0116 0',
  approfondimenti: 'M5 3h10l4 4v14H5zM9 12h6M9 16h6M9 8h3', fonti: 'M4 12a8 8 0 1016 0 8 8 0 00-16 0zm0 0h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16',
};
const icon = (name) => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '1.7'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); s.setAttribute('aria-hidden', 'true'); const p = document.createElementNS(s.namespaceURI, 'path'); p.setAttribute('d', icons[name]); s.append(p); return s; };

/* ---------- navigazione ---------- */
const NAV = [['scoperte', 'Scoperte'], ['economici', 'Economici'], ['idee', 'Idee conservate'], ['profilo', 'Profilo e gusti'], ['approfondimenti', 'Approfondimenti'], ['fonti', 'Fonti']];
function renderNav(cur) {
  const nav = document.getElementById('nav');
  nav.replaceChildren(...NAV.map(([id, label]) => el('a', { href: '#/' + id, 'aria-current': cur === id ? 'page' : null }, icon(id), el('span', {}, label.replace(' e gusti', '').replace(' conservate', '')))));
}
async function refreshState() { S.state = await api('state'); return S.state; }

async function route() {
  const [, page = 'scoperte', arg] = location.hash.split('/');
  const pages = { scoperte: pageFeed, economici: pageBudget, idee: pageIdeas, scheda: pageCard, profilo: pageProfile, approfondimenti: pageDossiers, fonti: pageSources, aggiungi: pageAdd };
  renderNav(page === 'scheda' ? 'idee' : page === 'aggiungi' ? 'fonti' : page);
  try { await refreshState(); await (pages[page] || pageFeed)(arg && decodeURIComponent(arg)); }
  catch (e) { $app.replaceChildren(el('p', { class: 'empty' }, 'Qualcosa non ha funzionato: ' + e.message)); }
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);

/* ---------- fotografie ---------- */
function photo(c, opts = {}) {
  const imgs = (c.images || []).slice();
  const box = el('div', { class: 'photo' });
  let i = 0; const failed = new Set();
  const missing = (why) => {
    box.className = 'photo missing';
    box.replaceChildren(el('div', {}, el('strong', {}, why), el('span', {}, c.archived ? 'L\'annuncio non è più online: le foto stavano sul sito della fonte e non sono state copiate.' : 'Le foto restano sul sito dell\'annuncio e non vengono copiate qui.'), opts.compact ? null : el('div', {}, el('a', { href: c.url, target: '_blank', rel: 'noopener noreferrer' }, 'Prova ad aprire l\'annuncio ↗'))));
  };
  if (!imgs.length) { missing(c.status === 'non_verificata' ? 'Nessuna foto letta' : 'Nessuna foto disponibile'); return box; }
  const img = el('img', { alt: 'Foto dell\'annuncio: ' + c.name, loading: 'lazy', decoding: 'async', referrerpolicy: 'no-referrer' });
  const count = el('span', { class: 'count' });
  const show = () => { img.src = imgs[i]; count.textContent = (i + 1) + ' / ' + imgs.length; };
  const step = (d) => { for (let k = 0; k < imgs.length; k++) { i = (i + d + imgs.length) % imgs.length; if (!failed.has(i)) return show(); } };
  img.addEventListener('error', () => { failed.add(i); if (failed.size >= imgs.length) missing('Foto non caricabili adesso'); else step(1); });
  box.append(img);
  if (c.archived) box.append(el('span', { class: 'stamp' }, 'Archivio · annuncio non più online'));
  if (!opts.compact) {
    box.append(el('span', { class: 'plabel' }, 'Foto dell\'esemplare, dall\'annuncio'), count);
    if (imgs.length > 1) box.append(el('button', { class: 'nav-ph prev', 'aria-label': 'Foto precedente', onclick: () => step(-1) }, '‹'), el('button', { class: 'nav-ph next', 'aria-label': 'Foto successiva', onclick: () => step(1) }, '›'));
  }
  show();
  return box;
}

/* ---------- scheda completa ---------- */
const STATUS = {
  attiva: (c) => c.check?.by === 'utente' ? 'Annuncio aperto da te' : 'Annuncio online alla verifica',
  non_disponibile: () => 'Link non disponibile',
  non_verificabile: () => 'Fonte non verificabile dal server',
  non_verificata: () => 'Fonte non verificata',
  senza_foto: () => 'Annuncio online, foto non raggiungibili',
};
function statusLine(c, rerender) {
  const ck = c.check;
  const detail = ck ? [ck.page?.detail, ck.image?.detail && ck.image.ok !== null ? 'prima foto: ' + ck.image.detail : null].filter(Boolean).join(' · ') : 'nessun controllo eseguito';
  const btn = el('button', { class: 'btn small', onclick: guard(async () => { btn.disabled = true; btn.textContent = 'Controllo…'; const v = await api(`cards/${c.id}/check`, 'POST'); toast(STATUS[v.status](v)); rerender(v); }) }, 'Ricontrolla la fonte');
  return el('div', { class: 'status ' + c.status },
    el('div', {}, el('span', { class: 'dot' }), el('strong', {}, STATUS[c.status](c)), el('br'),
      'Ultimo controllo: ', when(ck?.at), ck?.by === 'utente' ? ' (dichiarato da te)' : ck ? ' (dal server)' : '', el('br'), el('span', {}, detail)),
    btn);
}

function facts(c) {
  const f = c.facts || {};
  const row = (k, v, extra, wide) => (v == null || v === '' ? null : el('div', { class: wide ? 'wide' : null }, el('dt', {}, k), el('dd', {}, v, extra ? el('small', {}, extra) : null)));
  const place = [f.city, f.country && f.country !== 'IT' ? ({ DE: 'Germania', FR: 'Francia', BE: 'Belgio', NL: 'Paesi Bassi', AT: 'Austria', ES: 'Spagna', CH: 'Svizzera' }[f.country] || f.country) : null].filter(Boolean).join(', ');
  const dist = c.distanceKm != null ? `circa ${c.distanceKm} km in linea d'aria da ${S.state.settings.base.label}` : (S.state.settings.base ? 'distanza non calcolabile' : null);
  return el('dl', { class: 'facts' },
    row('Prezzo richiesto', f.price != null ? eur(f.price) : (f.priceText || 'non indicato'), f.negotiable ? 'indicato come trattabile' : null),
    row('Luogo', place || 'non indicato', dist),
    row('Anno', f.year), row('Chilometri', f.km != null ? new Intl.NumberFormat('it-IT').format(f.km) + ' km' : null),
    row('Potenza', f.power), row('Cilindrata', f.displacement), row('Alimentazione', f.fuel), row('Cambio', f.gearbox), row('Venditore', f.sellerType),
    row('Fonte', c.sourceLabel, el('a', { href: c.url, target: '_blank', rel: 'noopener noreferrer' }, c.archived ? 'Link originale (non più disponibile) ↗' : 'Apri l\'annuncio originale ↗'), true));
}

function fullCard(c, opts = {}) {
  const art = el('article', { class: 'card' + (c.archived ? ' archived' : ''), id: 'c-' + c.id });
  const rerender = (v) => { art.replaceWith(fullCard(v, opts)); };
  const s = c.scout;
  const block = (title, tg, ...content) => el('section', { class: 'block' }, el('h3', {}, title, tg), ...content);
  const prose = (t) => el('p', { class: 'prose' }, t);

  art.append(el('div', { class: 'kicker' }, CAT[c.category] || 'Mezzo', el('span', { class: 'sep' }, '·'),
    c.origin === 'manuale' ? 'Aggiunta da te' : el('span', { class: c.kind === 'sorpresa' ? 'kind-sorpresa' : '' }, c.kind === 'sorpresa' ? 'Una sorpresa' : 'Vicino ai tuoi gusti'),
    c.trail ? [el('span', { class: 'sep' }, '·'), 'Pista: ' + c.trail.label] : null));
  art.append(photo(c));
  const body = el('div', { class: 'body' });
  art.append(body);
  if (c.archived) body.append(el('div', { class: 'banner' }, el('strong', {}, 'Scheda d\'archivio. '), `L'annuncio risulta non più disponibile dal ${day(c.archivedAt || c.check?.at)}. Restano l'idea di progetto e le tue note; non è un'occasione attuale.`));
  else if (c.status !== 'attiva') body.append(el('div', { class: 'banner' }, el('strong', {}, STATUS[c.status](c) + '. '), 'Il server non ha potuto confermare pagina e fotografie: questa scheda resta nel tuo archivio ma non viene proposta tra le Scoperte.'));
  body.append(el('div', { class: 'vehicle' }, c.name, c.version ? el('span', {}, ' · ' + c.version) : null));
  body.append(s?.title ? el('h2', { class: 'title' }, s.title) : el('h2', { class: 'title pending' }, 'Idea di progetto ancora da scrivere'));

  body.append(block('Perché te lo mostro', scoutTag(c), prose(s?.why || c.trail?.why || 'L\'hai aggiunta tu: nessuna motivazione dello scout.')));
  if (s?.project) body.append(block('Il progetto che ci vedo', scoutTag(c), prose(s.project)));
  else body.append(block('Il progetto che ci vedo', null, el('p', { class: 'hint' }, 'Non ancora scritto per questo esemplare. ', S.state.ai.configured ? 'Puoi chiederlo all\'AI collegata.' : 'Il collegamento AI non è configurato (vedi Fonti): nessun testo viene inventato al suo posto.'),
    S.state.ai.configured ? el('button', { class: 'btn small', onclick: guard(async (e) => { e.target.disabled = true; e.target.textContent = 'Lo scout sta scrivendo…'; rerender(await api(`cards/${c.id}/narrate`, 'POST')); }) }, 'Chiedi la nota allo scout (AI)') : null));

  const seller = c.sellerText ? el('details', { class: 'sellerbox' }, el('summary', {}, 'Leggi cosa dichiara il venditore', c.facts?.language ? ` (testo originale in ${c.facts.language})` : ''), el('blockquote', { class: 'seller' }, c.sellerText)) : el('p', { class: 'hint' }, 'Nessuna descrizione del venditore letta.');
  body.append(block('Dati dell\'annuncio', TAGS.src(), facts(c)));
  if (c.startCost) body.append(costBlock(c.startCost));
  body.append(block('Descrizione', TAGS.seller(), seller));

  const sel = el('select', { 'aria-label': 'Impegno indicativo', onchange: guard(async () => { rerender(await api('cards/' + c.id, 'PATCH', { effort: sel.value })); toast('Impegno aggiornato da te'); }) },
    Object.entries(S.state.efforts).map(([k, v]) => el('option', { value: k, selected: (c.effort || 'capire') === k }, v)));
  body.append(block('Impegno indicativo', c.effortBy === 'utente' ? TAGS.you('Valutazione tua') : (c.effort && c.effort !== 'capire' ? scoutTag({ scout: c.scout || { author: 'ai-sessione' } }) : null),
    el('div', { class: 'effort' }, sel, el('span', { class: 'hint' }, 'Valutazione a distanza, da foto e testo: puoi correggerla.'))));

  if (s?.doubt) body.append(block('Il dubbio dello scout', scoutTag(c), el('div', { class: 'doubt' }, prose(s.doubt))));
  else if (c.category === 'gommoni') body.append(block('Il dubbio dello scout', tag('ai', 'Promemoria generico'), el('div', { class: 'doubt' }, prose('Misure e peso reali non sono stati verificati; il trasporto sul tetto del Vito non è dato per scontato.' + (c.facts?.country === 'DE' ? ' L\'annuncio è in Germania: il ritiro fa parte del progetto.' : '')))));

  const note = el('textarea', { placeholder: 'Le tue note su questa idea…', 'aria-label': 'Note personali', value: c.userNote || '' });
  body.append(el('section', { class: 'block note-you' }, el('h3', {}, 'Le tue note', TAGS.you()), note,
    el('div', { class: 'bar' }, el('button', { class: 'btn small', onclick: guard(async () => { await api('cards/' + c.id, 'PATCH', { userNote: note.value }); toast('Note salvate'); }) }, 'Salva le note'),
      c.hasDossier ? el('a', { class: 'btn small', href: '#/approfondimenti/' + c.id }, 'Apri l\'approfondimento') : null,
      opts.single ? el('button', { class: 'btn small quiet', onclick: guard(async () => { if (!confirm('Eliminare del tutto questa scheda, con note e reazioni?')) return; await api('cards/' + c.id, 'DELETE'); location.hash = '#/idee'; }) }, 'Elimina la scheda') : null)));
  body.append(statusLine(c, rerender));
  art.append(reactBar(c, rerender, opts));
  return art;
}

function reactBar(c, rerender, opts) {
  const box = el('div', { class: 'react' });
  const send = (type) => guard(async () => {
    const v = await api(`cards/${c.id}/react`, 'POST', { type });
    if (type === 'considera') { toast('Approfondimento aperto: nessuno è stato contattato'); location.hash = '#/approfondimenti/' + c.id; return; }
    rerender(v);
  });
  if (c.reaction) {
    const reason = el('textarea', { placeholder: 'Perché? Scrivilo con parole tue (facoltativo)…', 'aria-label': 'Motivo della reazione', value: c.reaction.reason });
    box.append(el('div', { class: 'reacted' },
      el('div', { class: 'line' }, el('span', { class: 'what' }, 'La tua reazione: ', el('strong', {}, c.reaction.label)), el('span', { class: 'hint' }, when(c.reaction.at))),
      el('div', { class: 'reason' }, reason),
      el('div', { class: 'bar' },
        el('button', { class: 'btn small primary', onclick: guard(async () => { await api(`cards/${c.id}/reason`, 'POST', { reason: reason.value }); toast('Motivo salvato nel tuo profilo'); }) }, 'Salva il motivo'),
        el('button', { class: 'btn small', onclick: guard(async () => { rerender(await api(`cards/${c.id}/undo`, 'POST')); }) }, 'Annulla la reazione'),
        c.reaction.type !== 'considera' && !c.archived ? el('button', { class: 'btn small quiet', onclick: send('considera') }, 'Questa la considero davvero') : null)));
    return box;
  }
  if (c.archived) { box.append(el('p', { class: 'hint' }, 'Scheda d\'archivio: puoi ancora conservarne l\'idea.'), el('div', { class: 'grid' }, el('button', { class: 'btn', onclick: send('conserva') }, 'Conserva l\'idea'), el('button', { class: 'btn', onclick: send('scarta') }, 'Non fa per me'))); return box; }
  box.append(el('div', { class: 'grid' },
    el('button', { class: 'btn', onclick: send('incuriosisce') }, 'Mi incuriosisce'),
    el('button', { class: 'btn', onclick: send('conserva') }, 'Conserva l\'idea'),
    el('button', { class: 'btn', onclick: send('sorprendimi') }, 'Sorprendimi ancora'),
    el('button', { class: 'btn', onclick: send('scarta') }, 'Non fa per me')),
    el('div', { class: 'consider' }, el('button', { class: 'btn quiet', onclick: send('considera') }, 'Questa la considero davvero'),
      el('small', {}, 'Apre un approfondimento su questo esemplare. Le altre reazioni servono solo ad affinare i gusti: non avviano nulla e non contattano nessuno.')));
  return box;
}

/* ---------- Scoperte ---------- */
async function pageFeed() {
  const f = S.filters;
  const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v)).toString();
  const data = await api('feed' + (qs ? '?' + qs : ''));
  const chip = (label, val) => el('button', { class: 'chip', 'aria-pressed': String(f.cat === val), onclick: () => { f.cat = val; pageFeed(); } }, label);
  const effort = el('select', { 'aria-label': 'Tipo di impegno', onchange: () => { f.effort = effort.value; pageFeed(); } }, el('option', { value: '' }, 'Qualsiasi impegno'), Object.entries(S.state.efforts).map(([k, v]) => el('option', { value: k, selected: f.effort === k }, v)));
  const price = el('input', { type: 'number', inputmode: 'numeric', min: '0', step: '500', placeholder: 'nessun limite', value: f.maxPrice, onchange: () => { f.maxPrice = price.value; pageFeed(); } });
  const km = el('input', { type: 'number', inputmode: 'numeric', min: '0', step: '50', placeholder: 'nessun limite', value: f.maxKm, disabled: !S.state.settings.base, onchange: () => { f.maxKm = km.value; pageFeed(); } });
  const searchBox = el('div', {});
  const searchBtn = el('button', { class: 'btn primary', onclick: guard(() => runSearch(searchBox, searchBtn, { category: f.cat || null }, pageFeed)) }, f.cat ? 'Cerca nuove proposte: ' + CAT[f.cat].toLowerCase() : 'Cerca nuove proposte');
  $app.replaceChildren(el('div', { class: 'narrow' },
    el('div', { class: 'filters' },
      el('div', { class: 'chips', role: 'group', 'aria-label': 'Categoria' }, chip('Tutto', ''), chip('Auto', 'auto'), chip('Moto', 'moto'), chip('Gommoni', 'gommoni'), chip('Altro', 'altro')), effort,
      el('details', { class: 'more', open: !!(f.maxPrice || f.maxKm) }, el('summary', {}, 'Prezzo e distanza (facoltativi)'),
        el('div', { class: 'row' }, el('label', {}, 'Prezzo richiesto fino a €', price), el('label', {}, 'Distanza fino a km', km)),
        el('p', { class: 'hint' }, S.state.settings.base ? `Distanze in linea d'aria da ${S.state.settings.base.label}. Le schede senza coordinate restano fuori quando usi questo filtro.` : ['Per usare la distanza indica un punto di partenza in ', el('a', { href: '#/fonti' }, 'Fonti e impostazioni'), '.'], ' Nessun budget è impostato: questi filtri valgono solo finché li tieni attivi.'))),
    el('div', { class: 'bar' }, searchBtn, el('a', { class: 'btn', href: '#/aggiungi' }, 'Aggiungi un link'), el('span', { class: 'hint' }, `${data.items.length} da sfogliare` + (data.items.length !== data.total ? ` (su ${data.total})` : ''))),
    searchBox,
    data.items.length ? el('div', { class: 'feed' }, data.items.map((c) => fullCard(c)))
      : el('p', { class: 'empty' }, data.total ? 'Nessuna scheda con questi filtri.' : 'Hai sfogliato tutto.', el('small', {}, 'Le schede a cui hai reagito escono dal flusso e restano in Idee conservate. "Cerca nuove proposte" interroga le fonti collegate adesso; non c\'è una ricerca continua in sottofondo', S.state.settings.autoSearch.enabled ? ' oltre a quella periodica che hai attivato.' : '.'))));
}

async function runSearch(box, btn, body, after) {
  btn.disabled = true;
  await api('search/run', 'POST', body);
  const draw = (j) => box.replaceChildren(el('div', { class: 'progress' },
    el('strong', {}, j.done ? 'Ricerca terminata' : 'Ricerca in corso su fonti reali…'), j.current ? el('div', {}, j.current) : null,
    el('div', {}, `${j.stats.trovati} annunci letti · ${j.stats.giaVisti} già visti · ${j.stats.esclusi} esclusi dai criteri della pista · ${j.stats.nonVerificati} scartati perché pagina o foto non verificabili · ${j.stats.pubblicati} nuove schede`),
    el('ul', {}, j.steps.map((s) => el('li', {}, `${s.source} — ${s.trail}: ${s.outcome || 'in corso'}`))), j.error ? el('div', {}, 'Errore: ' + j.error) : null));
  for (;;) {
    const j = await api('search/status');
    draw(j);
    if (j.done) { btn.disabled = false; if (j.stats.pubblicati) { toast(j.stats.pubblicati + ' nuove schede verificate'); await refreshState(); await after(); document.querySelector('.progress')?.scrollIntoView({ block: 'nearest' }); $app.querySelector('.narrow > div:nth-of-type(3)')?.replaceChildren(el('div', { class: 'progress' }, el('strong', {}, 'Ultima ricerca: '), `${j.stats.pubblicati} nuove schede verificate, ${j.stats.giaVisti} già viste, ${j.stats.nonVerificati} scartate perché non verificabili.`)); } break; }
    await new Promise((r) => setTimeout(r, 1500));
  }
}

/* ---------- Costo di partenza (stima) ---------- */
function costBlock(sc) {
  const range = (a, b) => (a === b ? eur(a) : `${eur(a)} – ${eur(b)}`);
  return el('section', { class: 'block' },
    el('h3', {}, 'Costo di partenza', tag('ai', 'Stima dello scout', 'Calcolata con le tariffe pubbliche di passaggio e revisione: non è un preventivo')),
    el('div', { class: 'cost' },
      el('div', { class: 'cost-total' }, el('span', {}, 'Per portarlo a casa'), el('strong', {}, range(sc.min, sc.max)), sc.complete ? null : el('small', {}, 'stima incompleta: manca una voce, vedi sotto')),
      el('table', { class: 'cost-lines' }, el('tbody', {}, sc.lines.map((l) => el('tr', {}, el('th', { scope: 'row' }, l.label, el('small', {}, l.note)), el('td', {}, range(l.min, l.max)))))),
      el('ul', { class: 'cost-missing' }, sc.missing.map((m) => el('li', {}, m))),
      el('p', { class: 'hint' }, 'Tariffe: IPT D.M. 435/1998 e riduzioni per gli ultratrentennali (art. 63 L. 342/2000), voci fisse PRA e Motorizzazione. Prima di comprare verifica con l\'ACI: ', el('a', { href: 'https://aci.gov.it/pratica-auto/passaggio-di-proprieta-informazioni-utili/', target: '_blank', rel: 'noopener noreferrer' }, 'passaggio di proprietà ↗'), ' · ', el('a', { href: 'https://aci.gov.it/servizio/calcola-online-il-bollo-ed-il-superbollo/', target: '_blank', rel: 'noopener noreferrer' }, 'calcolo del bollo ↗'), '.')));
}

/* ---------- Economici ---------- */
async function pageBudget() {
  const cat = S.budgetCat || '';
  const data = await api('economici' + (cat ? '?cat=' + cat : ''));
  const max = el('input', { type: 'number', inputmode: 'numeric', min: '300', step: '100', value: data.maxStart, 'aria-label': 'Costo di partenza massimo in euro' });
  const pct = el('input', { type: 'number', inputmode: 'numeric', min: '0', max: '30', step: '1', placeholder: 'non so', value: data.iptPct ?? '', 'aria-label': 'Maggiorazione IPT della tua provincia in percentuale' });
  const save = guard(async () => { await api('settings', 'PATCH', { budget: { maxStart: +max.value, iptPct: pct.value === '' ? null : +pct.value } }); toast('Soglia salvata'); pageBudget(); });
  const chip = (label, val) => el('button', { class: 'chip', 'aria-pressed': String(cat === val), onclick: () => { S.budgetCat = val; pageBudget(); } }, label);
  const searchBox = el('div', {});
  const searchBtn = el('button', { class: 'btn primary', onclick: guard(() => runSearch(searchBox, searchBtn, { budget: true }, pageBudget)) }, 'Cerca proposte economiche');
  $app.replaceChildren(el('div', { class: 'narrow' },
    el('h1', { class: 'page-title' }, 'Progetti economici'),
    el('p', { class: 'lede' }, 'Auto e moto che puoi portare a casa spendendo poco: conta il prezzo richiesto più il passaggio di proprietà e una possibile revisione. Ordinate dal costo di partenza più basso.'),
    el('div', { class: 'filters' },
      el('div', { class: 'chips', role: 'group', 'aria-label': 'Categoria' }, chip('Auto e moto', ''), chip('Auto', 'auto'), chip('Moto', 'moto')),
      el('div', { class: 'budget-set' }, el('label', {}, 'Costo di partenza fino a €', max), el('label', {}, 'Maggiorazione IPT provinciale %', pct)),
      el('div', { class: 'bar' }, el('button', { class: 'btn small', onclick: save }, 'Salva la soglia')),
      el('p', { class: 'hint' }, 'La maggiorazione provinciale va da 0 a 30%: se non la conosci la stima usa tutta la forbice. Assicurazione e bollo non sono stimati. I mezzi oltre i 30 anni pagano un passaggio ridotto e sono esenti dal bollo: per questo tendono a stare in cima.')),
    el('div', { class: 'bar' }, searchBtn, el('span', { class: 'hint' }, `${data.items.length} da sfogliare` + (data.reacted ? ` · ${data.reacted} già valutate, in Idee conservate` : ''))),
    el('p', { class: 'hint' }, `La ricerca economica interroga le piste auto e moto chiedendo annunci fino a ${eur(Math.max(0, data.maxStart - 69))} di prezzo; gli annunci più cari non vengono segnati come visti e restano disponibili per la ricerca normale.`),
    searchBox,
    data.items.length ? el('div', { class: 'feed' }, data.items.map((c) => fullCard(c)))
      : el('p', { class: 'empty' }, 'Nessuna scheda entro questa soglia.', el('small', {}, 'Prova "Cerca proposte economiche" o alza la soglia. Servono il prezzo nell\'annuncio e una scheda verificata.'))));
}

/* ---------- Idee conservate ---------- */
function tile(c) {
  const f = c.facts || {};
  return el('a', { class: 'tile' + (c.archived ? ' archived' : ''), href: '#/scheda/' + c.id }, photo(c, { compact: true }),
    el('div', { class: 'tb' }, el('div', { class: 'tname' }, c.name),
      el('div', { class: 'ttitle' }, c.scout?.title || c.version || 'Idea ancora da scrivere'),
      el('div', { class: 'tmeta' }, [c.archived ? 'Archivio · annuncio non più online' : (c.status === 'attiva' ? null : STATUS[c.status](c)), f.price != null ? eur(f.price) : null, f.city, c.reaction ? c.reaction.label : null].filter(Boolean).join(' · ')),
      c.reaction?.reason ? el('div', { class: 'tmeta' }, '«' + c.reaction.reason + '»') : null));
}
async function pageIdeas(tab = 'conservate') {
  const k = S.state.counts;
  const TABS = [['conservate', 'Conservate', k.conservate], ['incuriosito', 'Mi incuriosivano', k.incuriosito], ['archiviate', 'Archivio (annunci scaduti)', k.archiviate], ['nonverificate', 'Non verificate', k.nonverificate], ['scartate', 'Non fanno per me', k.scartate]];
  const { items } = await api('cards?view=' + tab);
  const about = { conservate: 'Idee che hai scelto di tenere, con annuncio ancora online all\'ultimo controllo.', incuriosito: 'Schede che ti hanno incuriosito o sorpreso: segnali per il profilo, niente di più.', archiviate: 'L\'annuncio non è più disponibile. L\'idea di progetto e le tue note restano; non sono occasioni attuali.', nonverificate: 'Link che il server non ha potuto verificare: restano qui e non entrano nelle Scoperte.', scartate: 'Servono allo scout per capire i confini, senza trasformare un no in una regola.' }[tab];
  const recheck = el('button', { class: 'btn small', onclick: guard(async () => { recheck.disabled = true; await api('check-all', 'POST'); for (;;) { const j = await api('check-all'); recheck.textContent = `Controllo ${j.checked}/${j.total}…`; if (j.done) { toast(j.changed.length ? `${j.changed.length} schede hanno cambiato stato` : 'Nessun cambiamento'); break; } await new Promise((r) => setTimeout(r, 1500)); } route(); }) }, 'Ricontrolla tutte le fonti');
  $app.replaceChildren(el('h1', { class: 'page-title' }, 'Idee conservate'),
    el('div', { class: 'tabs', role: 'tablist' }, TABS.map(([id, label, n]) => el('a', { class: 'chip', href: '#/idee/' + id, 'aria-pressed': String(tab === id), style: 'text-decoration:none;color:inherit' + (tab === id ? ';color:var(--paper)' : '') }, `${label} ${n}`))),
    el('p', { class: 'lede' }, about), el('div', { class: 'bar' }, recheck, el('a', { class: 'btn small', href: '#/aggiungi' }, 'Aggiungi un link')),
    items.length ? el('div', { class: 'tiles' }, items.map(tile)) : el('p', { class: 'empty' }, 'Qui non c\'è ancora nulla.'));
}
async function pageCard(id) {
  const c = await api('cards/' + id);
  $app.replaceChildren(el('div', { class: 'narrow' }, el('div', { class: 'bar' }, el('a', { class: 'btn small', href: '#/idee' }, '‹ Idee conservate')), fullCard(c, { single: true })));
}

/* ---------- Profilo ---------- */
const KIND = { esplicita: 'Detto da te', ipotesi: 'Ipotesi dello scout', incerta: 'Ancora incerto' };
const GROUPS = { generale: 'In generale', capacita: 'Cosa so fare', auto: 'Auto', moto: 'Moto', gommoni: 'Gommoni e tender' };
async function pageProfile() {
  const p = await api('profile');
  const kindSel = (val) => el('select', {}, Object.entries(KIND).map(([k, v]) => el('option', { value: k, selected: k === val }, v)));
  const catSel = (val) => el('select', {}, Object.entries(GROUPS).map(([k, v]) => el('option', { value: k, selected: k === val }, v)));
  const taste = (t) => {
    const row = el('div', { class: 'taste ' + t.kind });
    const view = () => row.replaceChildren(el('div', { class: 'tt' }, t.text),
      el('div', { class: 'tm' }, tag(t.kind === 'esplicita' ? 'you' : t.kind === 'ipotesi' ? 'ai' : 'off', KIND[t.kind]), el('span', {}, t.origin + (t.edited ? ' · modificata da te' : '')),
        el('button', { onclick: edit }, 'Modifica'),
        t.kind !== 'esplicita' ? el('button', { onclick: guard(async () => { await api('tastes/' + t.id, 'PATCH', { kind: 'esplicita' }); pageProfile(); }) }, 'Confermo: è così') : null,
        el('button', { onclick: guard(async () => { if (confirm('Togliere questa voce dal profilo?')) { await api('tastes/' + t.id, 'DELETE'); pageProfile(); } }) }, 'Togli')));
    const edit = () => {
      const ta = el('textarea', { class: 'full', value: t.text }), ks = kindSel(t.kind), cs = catSel(t.category);
      row.replaceChildren(ta, el('div', { class: 'bar' }, ks, cs, el('button', { class: 'btn small primary', onclick: guard(async () => { await api('tastes/' + t.id, 'PATCH', { text: ta.value, kind: ks.value, category: cs.value }); pageProfile(); }) }, 'Salva'), el('button', { class: 'btn small', onclick: view }, 'Annulla')));
    };
    view(); return row;
  };
  const nt = el('textarea', { placeholder: 'Es. “Mi piacciono gli abitacoli luminosi”, “Niente cambi automatici”…' }), nk = kindSel('esplicita'), nc = catSel('generale');
  $app.replaceChildren(el('div', { class: 'narrow' },
    el('h1', { class: 'page-title' }, 'Profilo e gusti'),
    el('p', { class: 'lede' }, 'Quello che lo scout crede di sapere di te. Puoi correggere tutto. Le reazioni alle schede orientano le proposte ma non diventano regole: nessuna pista viene esclusa e una parte del flusso resta sempre dedicata alle sorprese.'),
    el('div', { class: 'legend' }, el('span', {}, tag('you', KIND.esplicita), ' osservazioni esplicite'), el('span', {}, tag('ai', KIND.ipotesi), ' supposizioni da verificare'), el('span', {}, tag('off', KIND.incerta), ' preferenze non chiarite')),
    Object.entries(GROUPS).map(([g, label]) => { const rows = p.tastes.filter((t) => t.category === g); return rows.length ? el('section', { class: 'taste-group' }, el('h2', {}, label), rows.map(taste)) : null; }),
    el('div', { class: 'form' }, el('strong', {}, 'Aggiungi una voce'), el('label', {}, 'Con parole tue', nt), el('div', { class: 'two' }, el('label', {}, 'Tipo', nk), el('label', {}, 'Ambito', nc)),
      el('button', { class: 'btn primary', onclick: guard(async () => { await api('tastes', 'POST', { text: nt.value, kind: nk.value, category: nc.value }); toast('Aggiunta al profilo'); pageProfile(); }) }, 'Aggiungi al profilo')),
    el('section', { class: 'section' }, el('h2', {}, 'Segnali dalle tue reazioni'),
      el('p', { class: 'hint' }, 'Conteggi reali delle reazioni, per pista. Sono osservazioni: se una ti sembra una preferenza vera, scrivila tu qui sopra.', p.surpriseBias ? ' Hai chiesto più sorprese: nel flusso ne compare una ogni tre schede invece che ogni quattro.' : ''),
      p.signals.length ? el('ul', { class: 'list' }, p.signals.map((s) => el('li', {}, el('strong', {}, s.trail), ` — ${s.pos} reazioni positive, ${s.neg} “non fa per me”`, s.reasons.map((r) => el('small', {}, `${r.type} · ${r.card}: «${r.text}»`))))) : el('p', { class: 'hint' }, 'Ancora nessuna reazione.')),
    el('section', { class: 'section' }, el('h2', {}, 'Diario delle reazioni'),
      p.diary.length ? el('ul', { class: 'diary' }, p.diary.map((r) => el('li', {}, when(r.at), ' — ', el('strong', {}, r.label), ' · ', r.card ? el('a', { href: '#/scheda/' + r.card.id }, r.card.name) : 'scheda eliminata', r.reason ? [' — ', el('q', {}, r.reason)] : null))) : el('p', { class: 'hint' }, 'Vuoto, per ora.'))));
}

/* ---------- Approfondimenti ---------- */
async function pageDossiers(id) {
  if (id) return pageDossier(id);
  const { items } = await api('dossiers');
  $app.replaceChildren(el('h1', { class: 'page-title' }, 'Approfondimenti'),
    el('p', { class: 'lede' }, 'Si aprono solo quando scegli “Questa la considero davvero” su una scheda. Nessun contatto con i venditori parte da qui.'),
    items.length ? el('div', { class: 'tiles' }, items.map((d) => el('a', { class: 'tile' + (d.card.archived ? ' archived' : ''), href: '#/approfondimenti/' + d.cardId }, photo(d.card, { compact: true }), el('div', { class: 'tb' }, el('div', { class: 'tname' }, d.card.name), el('div', { class: 'ttitle' }, d.card.scout?.title || d.card.version || 'Approfondimento'), el('div', { class: 'tmeta' }, 'Aperto il ' + day(d.openedAt) + (d.card.archived ? ' · annuncio non più online' : ''))))))
      : el('p', { class: 'empty' }, 'Nessun approfondimento aperto.', el('small', {}, 'Va bene così: apprezzare una scheda non significa volerla comprare.')));
}
async function pageDossier(id) {
  let d = await api('dossiers/' + id);
  const c = d.card;
  const save = guard(async (patch, msg) => { d = await api('dossiers/' + id, 'PATCH', patch); if (msg) toast(msg); draw(); });
  const draw = () => {
    const notes = el('textarea', { class: 'full', style: 'min-height:120px', placeholder: 'Appunti, impressioni, cose viste di persona…', value: d.notes });
    const newCheck = el('input', { placeholder: 'Aggiungi una verifica…' });
    const newQ = el('input', { placeholder: 'Aggiungi una domanda…' });
    const costRow = (k, i) => { const inp = (field, type) => el('input', { type: type || 'text', inputmode: type ? 'numeric' : null, value: k[field] ?? '', 'aria-label': field, onchange: (e) => { d.costs[i][field] = e.target.value; if (k.origin === 'fonte' && field !== 'note') d.costs[i].origin = 'tua stima'; save({ costs: d.costs }); } });
      return el('tr', {}, el('td', {}, inp('label'), el('small', { class: 'hint' }, k.origin === 'fonte' ? 'dalla fonte' : k.origin, k.note ? ' · ' + k.note : '')), el('td', { class: 'n' }, inp('min', 'number')), el('td', { class: 'n' }, inp('max', 'number')), el('td', { class: 'x' }, el('button', { class: 'btn small quiet', 'aria-label': 'Togli voce', onclick: () => { d.costs.splice(i, 1); save({ costs: d.costs }); } }, '✕'))); };
    const nl = el('input', { placeholder: 'Voce (es. gomme, tappezzeria, attrezzi)' }), nmin = el('input', { type: 'number', inputmode: 'numeric', placeholder: 'da €' }), nmax = el('input', { type: 'number', inputmode: 'numeric', placeholder: 'a €' }), nnote = el('input', { placeholder: 'Su quale ipotesi si regge?' });
    const ai = d.aiDraft;
    $app.replaceChildren(el('div', { class: 'narrow' },
      el('div', { class: 'bar' }, el('a', { class: 'btn small', href: '#/approfondimenti' }, '‹ Approfondimenti'), el('a', { class: 'btn small', href: '#/scheda/' + id }, 'Vedi la scheda')),
      el('h1', { class: 'page-title' }, c.name + (c.version ? ' · ' + c.version : '')), el('p', { class: 'lede' }, `Approfondimento su questo specifico esemplare, aperto da te il ${day(d.openedAt)}. Qui niente parte da solo: nessun messaggio, nessuna scadenza.`),
      el('div', { class: 'card' + (c.archived ? ' archived' : '') }, photo(c), el('div', { class: 'body' },
        c.archived ? el('div', { class: 'banner' }, el('strong', {}, 'L\'annuncio non è più disponibile. '), 'L\'approfondimento resta come memoria del progetto.') : null,
        el('section', { class: 'block' }, el('h3', {}, 'Dati dell\'annuncio', TAGS.src()), facts(c)),
        c.sellerText ? el('section', { class: 'block' }, el('h3', {}, 'Descrizione completa', TAGS.seller()), el('blockquote', { class: 'seller' }, c.sellerText)) : null,
        statusLine(c, async () => { d = await api('dossiers/' + id); route(); }))),
      el('section', { class: 'section' }, el('h2', {}, 'Lettura dello scout'),
        ai ? [el('p', {}, tag('ai', 'Bozza AI · ' + ai.model), ' ', el('span', { class: 'hint' }, 'generata il ' + when(ai.at) + ' dai dati dell\'annuncio; da verificare di persona')), el('p', { class: 'prose' }, ai.summary), el('p', {}, el('strong', {}, 'Costi: '), ai.costVerdict),
            ai.checks.length ? el('button', { class: 'btn small', onclick: () => save({ checklist: [...d.checklist, ...ai.checks.map((t) => ({ text: t, origin: 'bozza AI' }))], questions: [...d.questions, ...ai.questions.map((t) => ({ text: t, origin: 'bozza AI' }))], costs: [...d.costs, ...ai.costItems.map((k) => ({ label: k.label, min: k.min, max: k.max, note: k.assumption, origin: 'ipotesi AI' }))] }, 'Voci della bozza copiate qui sotto') }, 'Copia verifiche, domande e voci di costo nelle liste') : null]
          : el('p', { class: 'hint' }, S.state.ai.configured ? 'Puoi chiedere all\'AI una bozza di lettura di questo esemplare.' : 'Il collegamento AI non è configurato: nessuna analisi automatica dell\'esemplare è disponibile e nulla viene simulato. Le liste qui sotto sono promemoria generici, etichettati come tali.'),
        S.state.ai.configured ? el('button', { class: 'btn small', onclick: guard(async (e) => { e.target.disabled = true; e.target.textContent = 'Lo scout sta scrivendo…'; d = await api(`dossiers/${id}/ai`, 'POST'); draw(); }) }, ai ? 'Rigenera la bozza' : 'Chiedi una bozza all\'AI') : null),
      el('section', { class: 'section' }, el('h2', {}, 'Da verificare'),
        el('ul', { class: 'list' }, d.checklist.map((k, i) => el('li', {}, el('label', { class: 'check' }, el('input', { type: 'checkbox', checked: k.done, onchange: (e) => { d.checklist[i].done = e.target.checked; save({ checklist: d.checklist }); } }), el('span', {}, k.text, el('small', {}, k.origin)))))),
        el('div', { class: 'bar' }, newCheck, el('button', { class: 'btn small', onclick: () => newCheck.value.trim() && save({ checklist: [...d.checklist, { text: newCheck.value }] }) }, 'Aggiungi'))),
      el('section', { class: 'section' }, el('h2', {}, 'Domande da fare, se e quando vorrai'),
        d.questions.length ? el('ul', { class: 'list' }, d.questions.map((q, i) => el('li', {}, q.text, el('small', {}, q.origin, ' · ', el('a', { href: '#', onclick: (e) => { e.preventDefault(); d.questions.splice(i, 1); save({ questions: d.questions }); } }, 'togli'))))) : el('p', { class: 'hint' }, 'Nessuna domanda annotata.'),
        el('div', { class: 'bar' }, newQ, el('button', { class: 'btn small', onclick: () => newQ.value.trim() && save({ questions: [...d.questions, { text: newQ.value }] }) }, 'Aggiungi'))),
      el('section', { class: 'section' }, el('h2', {}, 'Conto del progetto'),
        el('p', { class: 'hint' }, 'Lo scout non inventa costi. La tabella contiene solo il prezzo richiesto (dalla fonte) e le voci che inserisci tu, ciascuna con la sua ipotesi.'),
        el('table', { class: 'costs' }, el('thead', {}, el('tr', {}, el('th', {}, 'Voce'), el('th', {}, 'Da €'), el('th', {}, 'A €'), el('th', {}))), el('tbody', {}, d.costs.map(costRow))),
        el('div', { class: 'form' }, el('strong', {}, 'Nuova voce'), nl, el('div', { class: 'two' }, nmin, nmax), nnote, el('button', { class: 'btn small', onclick: () => nl.value.trim() && save({ costs: [...d.costs, { label: nl.value, min: nmin.value, max: nmax.value || nmin.value, note: nnote.value, origin: 'tua stima' }] }, 'Voce aggiunta') }, 'Aggiungi voce')),
        el('p', { class: 'total' }, d.total ? `Somma delle ${d.total.entries} voci inserite: da ${eur(d.total.min)} a ${eur(d.total.max)}. È la somma di ciò che hai scritto, non una previsione.` : 'Costo complessivo: da approfondire. Mancano voci oltre al prezzo richiesto.')),
      el('section', { class: 'section' }, el('h2', {}, 'Appunti'), notes, el('div', { class: 'bar' }, el('button', { class: 'btn primary', onclick: () => save({ notes: notes.value }, 'Appunti salvati') }, 'Salva gli appunti')))));
  };
  draw();
}

/* ---------- Aggiungi un link ---------- */
async function pageAdd() {
  const url = el('input', { type: 'url', inputmode: 'url', placeholder: 'https://… indirizzo dell\'annuncio', 'aria-label': 'Link dell\'annuncio' });
  const out = el('div', {});
  const go = guard(async () => {
    if (!url.value.trim()) return;
    out.replaceChildren(el('p', { class: 'progress' }, 'Apro la pagina e controllo le foto…'));
    const r = await api('extract', 'POST', { url: url.value.trim() });
    if (r.duplicate) return out.replaceChildren(el('div', { class: 'banner' }, el('strong', {}, 'Questo annuncio è già in archivio. '), el('a', { href: '#/scheda/' + r.duplicate.id }, 'Apri la scheda: ' + r.duplicate.name)));
    const d = r.draft, ok = r.status === 'attiva';
    const name = el('input', { value: d.name || '' }), version = el('input', { value: d.version || '' }), price = el('input', { type: 'number', inputmode: 'numeric', value: d.facts.price ?? '' }), city = el('input', { value: d.facts.city || '' }), year = el('input', { type: 'number', inputmode: 'numeric', value: d.facts.year ?? '' });
    const cat = el('select', {}, Object.entries(CAT).map(([k, v]) => el('option', { value: k, selected: (d.category || 'auto') === k }, v)));
    const eff = el('select', {}, Object.entries(S.state.efforts).map(([k, v]) => el('option', { value: k, selected: k === 'capire' }, v)));
    const note = el('textarea', { placeholder: 'Perché ti ha colpito? Che progetto ci vedi?' });
    const confirmBox = el('input', { type: 'checkbox' });
    out.replaceChildren(
      el('div', { class: 'banner', style: ok ? 'border-left-color:var(--you)' : null }, el('strong', {}, ok ? 'Pagina e prima foto verificate dal server. ' : 'Il server non ha potuto verificare questo link. '),
        `Pagina: ${r.check.page.detail}. Foto: ${r.check.image.detail}.`, r.check.via ? ` Lettura: ${r.check.via}.` : '', ok ? '' : ' Puoi comunque salvarlo: resterà nel tuo archivio come non verificato e non verrà proposto tra le Scoperte.'),
      r.possibleDuplicate ? el('div', { class: 'banner' }, 'Possibile doppione — ' + r.possibleDuplicate.how + ': ', el('a', { href: '#/scheda/' + r.possibleDuplicate.card.id }, r.possibleDuplicate.card.name)) : null,
      d.images.length ? el('div', { class: 'card' }, photo({ ...d, images: d.images, status: r.status })) : null,
      el('div', { class: 'form' }, el('strong', {}, 'Controlla e correggi i dati'), el('span', { class: 'hint' }, ok ? 'Campi precompilati dalla pagina: correggili se serve.' : 'Compila a mano ciò che conosci.'),
        el('label', {}, 'Mezzo', name), el('label', {}, 'Versione', version),
        el('div', { class: 'two' }, el('label', {}, 'Prezzo richiesto (€)', price), el('label', {}, 'Anno', year)), el('label', {}, 'Luogo', city),
        el('div', { class: 'two' }, el('label', {}, 'Categoria', cat), el('label', {}, 'Impegno indicativo', eff)), el('label', {}, 'La tua idea (facoltativa)', note),
        ok ? null : el('label', { class: 'check', style: 'display:flex' }, confirmBox, el('span', {}, 'Ho aperto io questo annuncio adesso ed è online. (Resterà scritto che la verifica è tua, non del server.)')),
        el('button', { class: 'btn primary', onclick: guard(async () => {
          const c = await api('cards', 'POST', { draft: d, status: r.status, check: r.check, name: name.value, version: version.value, price: price.value, city: city.value, year: year.value, category: cat.value, effort: eff.value, userNote: note.value, userConfirms: confirmBox.checked });
          toast('Salvata tra le idee conservate'); location.hash = '#/scheda/' + c.id; }) }, 'Salva tra le idee conservate')));
  });
  $app.replaceChildren(el('div', { class: 'narrow' }, el('h1', { class: 'page-title' }, 'Aggiungi un link'),
    el('p', { class: 'lede' }, 'Incolla l\'indirizzo di un annuncio trovato da te. Il server prova ad aprirlo e a leggerne dati e foto; poi correggi tu. Se il sito non si lascia leggere, te lo dico e compili a mano.'),
    el('div', { class: 'form' }, url, el('button', { class: 'btn primary', onclick: go }, 'Leggi l\'annuncio')), out));
  url.addEventListener('keydown', (e) => e.key === 'Enter' && go());
}

/* ---------- Fonti e impostazioni ---------- */
const CITIES = [['Ancona', 43.62, 13.51], ['Bari', 41.12, 16.87], ['Bologna', 44.49, 11.34], ['Cagliari', 39.22, 9.12], ['Firenze', 43.77, 11.25], ['Genova', 44.41, 8.93], ['L\'Aquila', 42.35, 13.4], ['Milano', 45.46, 9.19], ['Napoli', 40.85, 14.27], ['Palermo', 38.12, 13.36], ['Perugia', 43.11, 12.39], ['Pescara', 42.46, 14.21], ['Roma', 41.9, 12.5], ['Terni', 42.56, 12.64], ['Torino', 45.07, 7.69], ['Trento', 46.07, 11.12], ['Trieste', 45.65, 13.78], ['Venezia', 45.44, 12.33], ['Verona', 45.44, 10.99]];
async function pageSources() {
  const s = await api('sources');
  const st = S.state.settings;
  const srcRow = (x) => {
    const probeOut = el('small', {}, x.lastProbe ? `Ultima prova da questo server: ${when(x.lastProbe.at)} — ${x.lastProbe.detail}${x.lastProbe.http ? ' (HTTP ' + x.lastProbe.http + ')' : ''}` : 'Mai provata da questo server (lo stato qui sopra viene dalle prove di allestimento del 14/11/2026).');
    return el('li', { class: 'source' }, el('div', { class: 'head' }, el('h3', {}, x.label), el('span', { class: 'pill ' + (x.mode === 'ricerca' ? 'ok' : 'no') }, x.mode === 'ricerca' ? 'Ricerca collegata' : 'Solo link manuale')),
      el('div', { class: 'hint' }, x.covers), el('div', {}, x.setup), x.note ? el('small', {}, x.note) : null, x.alt ? el('div', {}, el('strong', {}, 'Alternativa pratica: '), x.alt) : null, probeOut,
      x.probe ? el('div', {}, el('button', { class: 'btn small', onclick: guard(async (e) => { e.target.disabled = true; const p = await api(`sources/${x.id}/probe`, 'POST'); probeOut.textContent = `Prova di adesso: ${p.detail}${p.http ? ' (HTTP ' + p.http + ')' : ''}`; e.target.disabled = false; }) }, 'Prova il collegamento adesso')) : null);
  };
  const city = el('select', {}, el('option', { value: '' }, 'Nessuno (distanze non calcolate)'), CITIES.map(([n]) => el('option', { value: n, selected: st.base?.label === n }, n)), st.base && !CITIES.some(([n]) => n === st.base.label) ? el('option', { value: '_', selected: true }, st.base.label) : null);
  const lat = el('input', { type: 'number', step: 'any', placeholder: 'lat', value: st.base?.lat ?? '' }), lon = el('input', { type: 'number', step: 'any', placeholder: 'lon', value: st.base?.lon ?? '' });
  city.addEventListener('change', () => { const c = CITIES.find(([n]) => n === city.value); lat.value = c ? c[1] : ''; lon.value = c ? c[2] : ''; });
  const autoOn = el('input', { type: 'checkbox', checked: s.auto.enabled }), autoH = el('input', { type: 'number', min: '6', max: '168', value: s.auto.hours, style: 'width:90px' });
  $app.replaceChildren(el('div', { class: 'narrow' },
    el('h1', { class: 'page-title' }, 'Fonti e stato dei collegamenti'),
    el('p', { class: 'lede' }, 'Cosa lo scout riesce davvero a leggere, cosa no, e come rimediare. Un risultato trovato in ricerca non basta: ogni scheda entra nelle Scoperte solo dopo che il server ha aperto la pagina dell\'annuncio e raggiunto la prima foto.'),
    el('div', { class: 'bar' }, el('a', { class: 'btn primary', href: '#/aggiungi' }, 'Aggiungi un link a mano'), el('a', { class: 'btn', href: '#/scoperte' }, 'Vai alla ricerca')),
    el('section', { class: 'section' }, el('h2', {}, 'Portali'), el('ul', { class: 'list' }, s.sources.map(srcRow))),
    el('section', { class: 'section' }, el('h2', {}, 'Scout AI (note personalizzate)'),
      el('ul', { class: 'list' }, el('li', { class: 'source' }, el('div', { class: 'head' }, el('h3', {}, 'Modello Claude via API Anthropic'), el('span', { class: 'pill ' + (s.ai.configured && s.ai.sdkInstalled ? 'ok' : 'warn') }, s.ai.configured && s.ai.sdkInstalled ? 'Configurato' : 'Configurazione mancante')),
        el('div', {}, s.ai.configured ? `Modello: ${s.ai.model}. Scrive la nota di ogni scheda e la bozza degli approfondimenti, solo quando lo chiedi.` : 'Senza chiave l\'AI non scrive nulla: le nuove schede mostrano i dati della fonte e la motivazione della pista (a livello di modello), dichiarata come tale. Le note AI già presenti sono state scritte durante l\'allestimento e sono etichettate.'),
        s.ai.missing ? el('div', {}, el('strong', {}, 'Cosa manca: '), s.ai.missing) : null, s.ai.lastError ? el('small', {}, `Ultimo errore (${when(s.ai.lastError.at)}): ${s.ai.lastError.message}`) : null,
        el('small', {}, 'La chiave resta sul server (variabile d\'ambiente): il browser non la riceve mai.')))),
    el('section', { class: 'section' }, el('h2', {}, 'Ricerca'),
      el('p', {}, 'La ricerca parte quando premi “Cerca nuove proposte”. Non esistono notifiche né agenti sempre attivi.'),
      el('div', { class: 'form' }, el('label', { class: 'check', style: 'display:flex' }, autoOn, el('span', {}, 'Ripeti la ricerca da sola ogni ', autoH, ' ore, finché il server resta acceso', el('small', {}, s.auto.enabled && s.auto.nextAt ? 'Prossima esecuzione prevista: ' + when(s.auto.nextAt) + ' (si azzera se il server viene riavviato).' : 'Ora è spenta.'))),
        el('button', { class: 'btn small', onclick: guard(async () => { await api('settings', 'PATCH', { autoSearch: { enabled: autoOn.checked, hours: +autoH.value } }); toast('Impostazione salvata'); route(); }) }, 'Salva')),
      el('h3', { style: 'margin:14px 0 6px' }, 'Ultime ricerche eseguite'),
      s.runs.length ? el('ul', { class: 'list' }, s.runs.map((r) => el('li', {}, el('strong', {}, when(r.startedAt)), ` · ${r.trigger} — ${r.stats.pubblicati} nuove schede, ${r.stats.giaVisti} già viste, ${r.stats.nonVerificati} non verificabili`, el('small', {}, r.steps.map((x) => `${x.source} / ${x.trail}: ${x.outcome}`).join(' — '))))) : el('p', { class: 'hint' }, 'Nessuna ricerca eseguita da questo archivio.'),
      el('p', { class: 'hint' }, `${s.counts.seen} annunci già riconosciuti (non verranno riproposti) · ${s.counts.cards} schede in archivio.`)),
    el('section', { class: 'section' }, el('h2', {}, 'Piste di ricerca'), el('p', { class: 'hint' }, 'Le direzioni in cui lo scout guarda, con la loro motivazione. “Sorpresa” = fuori da ciò che hai già apprezzato.'),
      el('ul', { class: 'list' }, S.state.trails.map((t) => el('li', {}, el('strong', {}, t.label), ' ', el('span', { class: 'pill' }, t.kind === 'sorpresa' ? 'sorpresa' : 'affine'), el('small', {}, CAT[t.category] + ' · ' + t.why))))),
    el('section', { class: 'section' }, el('h2', {}, 'Punto di partenza per le distanze'),
      el('div', { class: 'form' }, el('label', {}, 'Città di riferimento', city), el('div', { class: 'two' }, el('label', {}, 'Latitudine', lat), el('label', {}, 'Longitudine', lon)), el('span', { class: 'hint' }, 'Facoltativo. Serve solo a mostrare la distanza in linea d\'aria; resta in questo archivio.'),
        el('button', { class: 'btn small', onclick: guard(async () => { await api('settings', 'PATCH', { base: lat.value && lon.value ? { label: city.value && city.value !== '_' ? city.value : (st.base?.label || 'Punto di partenza'), lat: +lat.value, lon: +lon.value } : null }); toast('Salvato'); route(); }) }, 'Salva'))),
    el('section', { class: 'section' }, el('h2', {}, 'Archivio e accesso'),
      el('p', {}, s.network.passwordSet ? 'Accesso protetto da parola d\'accesso.' : 'Nessuna parola d\'accesso impostata: il sito risponde solo dal computer su cui gira.'),
      el('div', { class: 'bar' }, el('a', { class: 'btn small', href: 'api/export', download: 'scout-backup.json' }, 'Scarica una copia dell\'archivio')))));
}

// App installabile: il service worker funziona solo su HTTPS o su localhost.
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
route();
