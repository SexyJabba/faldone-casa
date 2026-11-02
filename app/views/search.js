import { esc, href, phead, segments } from '../ui.js';
import { buildSearch, search } from '../lib/search.js';

const TYPES = ['scheda', 'servizio', 'macchina', 'dati', 'infrastruttura', 'procedura', 'decisione', 'attività', 'glossario', 'inventario', 'questione'];
let indexPromise = null;
function getIndex(app) {
  if (!indexPromise) indexPromise = app.search().then((docs) => buildSearch(docs, app.core.synonyms)).catch((e) => { indexPromise = null; throw e; });
  return indexPromise;
}
const resultHtml = (r, i, opt = false) => `<a class="hit" ${opt ? `role="option" id="hit-${i}" aria-selected="false"` : ''} href="${href(r.doc.route)}"><span class="eyebrow">${esc(r.doc.type)}${r.doc.codes?.length ? ` · ${r.doc.codes.slice(0, 4).map(esc).join(' ')}${r.doc.codes.length > 4 ? ` +${r.doc.codes.length - 4}` : ''}` : ''}</span><br><strong>${esc(r.doc.title)}</strong><br><span class="small">${segments(r.snippet)}</span><br><span class="why">Perché: ${esc(r.why.join(' · '))}</span></a>`;
function expl(out) {
  return out.expansions.length ? `<p class="small">Interpretato: ${out.expansions.map((x) => `«${esc(x.word)}» → <strong>${esc(x.means)}</strong> (${x.terms.map(esc).join(', ')})`).join('; ')}</p>` : '';
}
function empty(q) {
  return `<div class="empty"><p>Nessun risultato per «${esc(q)}».</p><p class="small">Prova un codice (es. INF-03.03, M2), una parola comune (foto, luci, furgone, copia) o apri il <a href="#glossario">glossario</a>. Nessuna risposta viene inventata.</p></div>`;
}

export async function searchPage(app) {
  const q = app.query.q || '', t = app.query.t || '', r = app.query.r === '1';
  const idx = await getIndex(app);
  const out = search(idx, q, { type: t || null, includeRoadmap: r, limit: 80 });
  const html = `${phead({ eyebrow: 'Ricerca', title: 'Cerca nel Faldone', lead: 'Schede, servizi, macchine, procedure, decisioni, inventario e glossario. Codici esatti prima; parole comuni collegate ai termini tecnici.' })}
<form class="searchpage" role="search" data-submit="dosearch"><label for="sq" class="vh">Cerca</label><input type="search" id="sq" value="${esc(q)}" placeholder="Es. non vedo le foto, INF-03.03, furgone" autocomplete="off" data-input="livesearch"></form>
<div class="filters" role="group" aria-label="Filtra per tipo"><button class="chip" type="button" data-action="stype" data-v="" aria-pressed="${!t}">Tutto</button>${TYPES.map((x) => `<button class="chip" type="button" data-action="stype" data-v="${x}" aria-pressed="${t === x}">${x}</button>`).join('')}
<label class="chip"><input type="checkbox" data-change="sroad" ${r ? 'checked' : ''}> includi roadmap</label></div>
<div id="sres" aria-live="polite">${q ? `${expl(out)}<p class="small">${out.total} risultati${out.excluded ? ` · ${out.excluded} di roadmap esclusi dal filtro predefinito` : ''}${t ? ` · solo «${esc(t)}»` : ''}.</p>${out.results.map((r, i) => resultHtml(r, i)).join('') || empty(q)}` : '<p class="muted">Scrivi per cercare.</p>'}</div>`;
  return {
    title: q ? `Cerca: ${q}` : 'Cerca', html, keepScroll: true,
    mount: (root) => {
      let timer;
      const apply = (patch) => { app.setQuery({ q: app.query.q, t: app.query.t, r: app.query.r, ...patch }); clearTimeout(timer); timer = setTimeout(() => app.go(`cerca?${new URLSearchParams(Object.entries(app.query).filter(([, v]) => v))}`, { replace: true }), 0); };
      app.on('livesearch', (el) => { clearTimeout(timer); timer = setTimeout(() => {
        const o = search(idx, el.value, { type: app.query.t || null, includeRoadmap: app.query.r === '1', limit: 80 });
        app.setQuery({ q: el.value, t: app.query.t, r: app.query.r });
        root.querySelector('#sres').innerHTML = el.value ? `${expl(o)}<p class="small">${o.total} risultati${o.excluded ? ` · ${o.excluded} di roadmap esclusi` : ''}.</p>${o.results.map((r, i) => resultHtml(r, i)).join('') || empty(el.value)}` : '<p class="muted">Scrivi per cercare.</p>';
      }, 120); });
      app.on('dosearch', () => apply({ q: root.querySelector('#sq').value }));
      app.on('stype', (el) => apply({ t: el.dataset.v }));
      app.on('sroad', (el) => apply({ r: el.checked ? '1' : '' }));
      const input = root.querySelector('#sq');
      if (!q) input.focus(); else { input.focus(); input.setSelectionRange(q.length, q.length); }
    },
  };
}

/** Palette Ctrl/Cmd+K: dialogo modale accessibile, freccia su/giù e Invio. */
export async function palette(app) {
  let dlg = document.getElementById('palette');
  if (!dlg) {
    dlg = document.createElement('dialog');
    dlg.id = 'palette'; dlg.className = 'palette'; dlg.setAttribute('aria-label', 'Cerca nel Faldone');
    dlg.innerHTML = `<header><label for="pq" class="vh">Cerca</label><input id="pq" type="search" placeholder="Cerca: codice, servizio, problema…" autocomplete="off" role="combobox" aria-expanded="true" aria-controls="pres" aria-autocomplete="list"><button class="iconbtn" type="button" id="pclose" aria-label="Chiudi">✕</button></header><div class="res" id="pres" role="listbox" aria-label="Risultati"><p class="muted small">Esempi: «non vedo le foto», «INF-03.03», «furgone», «backup».</p></div>`;
    document.body.append(dlg);
    const input = dlg.querySelector('#pq'), res = dlg.querySelector('#pres');
    let sel = -1, items = [];
    const mark = () => { items.forEach((a, i) => a.setAttribute('aria-selected', i === sel)); if (items[sel]) { input.setAttribute('aria-activedescendant', items[sel].id); items[sel].scrollIntoView({ block: 'nearest' }); } };
    let timer;
    input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(async () => {
      let idx;
      try { idx = await getIndex(app); } catch (e) { res.innerHTML = `<p class="errbox">Indice di ricerca non disponibile (${esc(e.message)}). Sei offline? Le pagine già aperte restano consultabili.</p>`; return; }
      const v = input.value;
      if (!v.trim()) { res.innerHTML = ''; items = []; return; }
      const o = search(idx, v, { limit: 12 });
      res.innerHTML = `${expl(o)}${o.results.map((r, i) => resultHtml(r, i, true)).join('') || empty(v)}${o.total > 12 || o.excluded ? `<a class="hit" role="option" id="hit-all" aria-selected="false" href="${href('cerca?q=' + encodeURIComponent(v))}"><strong>Tutti i risultati (${o.total})${o.excluded ? ` · ${o.excluded} di roadmap esclusi` : ''} e filtri →</strong></a>` : ''}`;
      items = [...res.querySelectorAll('.hit')]; sel = items.length ? 0 : -1; mark();
    }, 80); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, items.length - 1); mark(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); mark(); }
      else if (e.key === 'Enter' && items[sel]) { e.preventDefault(); items[sel].click(); }
      else if (e.key === 'Escape') { e.preventDefault(); dlg.close(); }
    });
    res.addEventListener('click', (e) => { if (e.target.closest('a')) dlg.close(); });
    dlg.querySelector('#pclose').addEventListener('click', () => dlg.close());
    dlg.addEventListener('close', () => { (app.paletteReturn || document.querySelector('[data-action=palette]'))?.focus(); });
  }
  app.paletteReturn = document.activeElement;
  dlg.showModal();
  const input = dlg.querySelector('#pq'); input.select(); input.focus();
}
