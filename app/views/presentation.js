// «Il progetto in cinque minuti»: presentazione e lettura dalla stessa sorgente (data/presentazione.json).
//
// URL: #presenta?s=<scena>[&m=lettura]. #percorsi/cinque-minuti?c=1…5 (capitoli della versione precedente)
// viene ricondotto per significato alla scena corrispondente.
// Cronologia: cambio scena = nuova voce (Indietro torna alla scena precedente); cambio modalità, scelta
// dall'indice in lettura e punto di ripresa = sostituzione (nessuna voce in più); pannelli = nessuna voce.
import { esc, href } from '../ui.js';
import { renderScene } from '../lib/scenes.js';

const sceneRoute = (id, mode) => `presenta?s=${id}${mode === 'lettura' ? '&m=lettura' : ''}`;

export async function legacy(app) {
  const p = await app.load('presentazione', 'data/presentazione.json');
  const id = p.legacyChapters[app.query.c] || p.scenes[0].id;
  history.replaceState(null, '', '#' + sceneRoute(id));
  return presentation(app, [], { redirectedFrom: app.query.c });
}

export async function presentation(app, _p, opts = {}) {
  const p = await app.load('presentazione', 'data/presentazione.json');
  const q = Object.fromEntries(new URLSearchParams(location.hash.split('?')[1] || ''));
  const mode = q.m === 'lettura' ? 'lettura' : 'presentazione';
  const known = p.scenes.findIndex((s) => s.id === q.s);
  const idx = known >= 0 ? known : 0;
  const invalid = q.s && known < 0;
  const scene = p.scenes[idx];
  const total = p.scenes.length;
  const tests = app.core.testResults.filter((r) => r.outcome === 'superato').length;
  const ctx = { tests };
  const prev = p.scenes[idx - 1], next = p.scenes[idx + 1];
  const canFull = !!document.fullscreenEnabled;

  const bar = `<header class="pres-bar">
<a class="pres-brand" href="#" data-action="pres-exit"><span class="mark" aria-hidden="true">F</span><span>Il Faldone<small>${esc(p.title)}</small></span></a>
${mode === 'presentazione' ? `<div class="pres-pos"><span class="pres-count">${idx + 1} di ${total} — ${esc(scene.short)}</span><span class="pres-progress" aria-hidden="true">${p.scenes.map((s, i) => `<i class="${i < idx ? 'done' : i === idx ? 'cur' : ''}"></i>`).join('')}</span></div>` : '<div class="pres-pos"><span class="pres-count">Lettura continua · 10 scene</span></div>'}
<div class="pres-tools">
<button type="button" class="btn ghost" data-action="pres-index" aria-haspopup="dialog">Indice</button>
<div class="seg" role="group" aria-label="Formato"><button type="button" data-action="pres-mode" data-v="presentazione" aria-pressed="${mode === 'presentazione'}">Presentazione</button><button type="button" data-action="pres-mode" data-v="lettura" aria-pressed="${mode === 'lettura'}">Lettura</button></div>
${canFull && mode === 'presentazione' ? '<button type="button" class="btn ghost pres-opt" data-action="pres-full">Schermo intero</button>' : ''}
<button type="button" class="btn ghost pres-opt" data-action="print">Stampa / Salva in PDF</button>
<a class="btn ghost pres-opt" href="#" data-action="pres-exit">Torna al sito</a></div></header>`;

  const deepBtn = (s) => (s.deep ? `<p class="pres-deep"><button type="button" class="btn" data-action="pres-deep" data-id="${s.id}" aria-haspopup="dialog">${esc(s.deep.label)}</button></p>` : '');
  const exits = (s) => (s.exits ? `<nav class="pres-exits" aria-label="Dove andare ora">${s.exits.map((x) => `<a class="pres-exit" href="${href(x.route)}"><strong>${esc(x.label)}</strong><span>${esc(x.sub)}</span></a>`).join('')}</nav>` : '');
  const status = `<p class="pres-status">${esc(p.statusText)}</p>`;

  let body;
  if (mode === 'presentazione') {
    body = `<article class="pres-scene" aria-labelledby="sc-${scene.id}">
${invalid ? `<p class="callout warn" role="status">La scena «${esc(q.s)}» non esiste: ecco la prima. Usa l'indice per scegliere.</p>` : ''}
${opts.redirectedFrom ? `<p class="small muted" role="status">Il vecchio capitolo ${esc(opts.redirectedFrom)} corrisponde a questa scena.</p>` : ''}
${idx === 0 ? status : ''}
${renderScene(scene, idx, total, ctx)}
${deepBtn(scene)}${exits(scene)}</article>
<nav class="pres-nav" aria-label="Scene">
${prev ? `<a class="btn" href="${href(sceneRoute(prev.id))}" rel="prev" aria-label="Indietro: ${esc(prev.short)}">← <span>Indietro<span class="pres-dest">: ${esc(prev.short)}</span></span></a>` : '<span></span>'}
${next ? `<a class="btn primary" href="${href(sceneRoute(next.id))}" rel="next" aria-label="Avanti: ${esc(next.short)}"><span>Avanti<span class="pres-dest">: ${esc(next.short)}</span></span> →</a>` : '<a class="btn primary" href="#">Torna alla panoramica</a>'}
</nav>
<p class="pres-help small">Frecce ← → per cambiare scena · Esc chiude i pannelli</p>`;
  } else {
    body = `<div class="pres-read"><nav class="pres-toc" aria-label="Indice delle scene"><ol>${p.scenes.map((s, i) => `<li><button type="button" data-action="pres-goto" data-id="${s.id}" ${s.id === scene.id ? 'aria-current="true"' : ''}>${i + 1}. ${esc(s.short)}</button></li>`).join('')}</ol></nav>
<div class="pres-doc"><h1 class="pres-doctitle" id="ptitle">${esc(p.title)}</h1>${status}
${p.scenes.map((s, i) => `<section class="pres-sec" id="r-${s.id}" data-scene="${s.id}">${renderScene(s, i, total, { ...ctx, prefix: 'r', level: 2 })}${deepBtn(s)}${exits(s)}</section>`).join('')}</div></div>`;
  }
  const printDoc = `<div class="pres-print" aria-hidden="true"><h1>${esc(p.title)}</h1><p>${esc(p.statusText)}</p><p>Fonte: Il Faldone, ${esc(location.origin + location.pathname)} · build ${esc(app.core.meta.build)}</p>
${p.scenes.map((s, i) => `<section class="pres-psec">${renderScene(s, i, total, { ...ctx, prefix: 'p', level: 2 })}${s.deep ? `<p class="pres-pdeep"><strong>Approfondimento:</strong> ${esc(s.deep.text)}</p>` : ''}</section>`).join('')}</div>`;

  const html = `<div class="pres pres-${mode}">${bar}<p class="vh" aria-live="polite" id="pres-live"></p>${body}${printDoc}
<dialog id="pres-index-dlg" class="pres-dlg" aria-labelledby="pres-index-h"><header><h2 id="pres-index-h">Indice delle scene</h2><button type="button" class="iconbtn" data-action="pres-close" aria-label="Chiudi">✕</button></header>
<ol class="pres-index">${p.scenes.map((s, i) => `<li><a href="${href(sceneRoute(s.id, mode))}" ${i === idx ? 'aria-current="step"' : ''}><span>${i + 1}</span> ${esc(s.title)}</a></li>`).join('')}</ol>
<footer class="pres-dlg-foot"><button type="button" class="btn ghost" data-action="print">Stampa / Salva in PDF</button><a class="btn ghost" href="#" data-action="pres-exit">Torna al sito</a></footer></dialog>
<dialog id="pres-deep-dlg" class="pres-dlg pres-sheet" aria-labelledby="pres-deep-h"></dialog></div>`;

  return {
    title: mode === 'presentazione' ? `${idx + 1}/${total} ${scene.title}` : p.title, html,
    keepScroll: mode === 'lettura',
    mount: (root) => {
      document.body.classList.add('presenting');
      if (mode === 'presentazione') root.querySelector('#pres-live').textContent = `Scena ${idx + 1} di ${total}: ${scene.title}`;
      // punto di ripresa: solo memoria locale, nessuna voce di cronologia
      app.data.progress = { ...(app.data.progress || {}), presenta: { scene: scene.id, at: new Date().toISOString() } };
      app.persist();
      const idxDlg = root.querySelector('#pres-index-dlg'), deepDlg = root.querySelector('#pres-deep-dlg');
      let opener = null;
      const open = (d, from) => { opener = from; d.showModal(); d.querySelector('button, a')?.focus(); };
      for (const d of [idxDlg, deepDlg]) d.addEventListener('close', () => { opener?.focus(); opener = null; });
      app.on('pres-index', (el) => open(idxDlg, el));
      app.on('pres-close', (el) => el.closest('dialog').close());
      app.on('pres-deep', (el) => {
        const s = p.scenes.find((x) => x.id === el.dataset.id);
        const d = s.deep;
        const ent = d.entities.map((id) => app.idx.get(id)).filter(Boolean);
        deepDlg.innerHTML = `<header><h2 id="pres-deep-h">${esc(d.label)}</h2><button type="button" class="iconbtn" data-action="pres-close" aria-label="Chiudi l'approfondimento">✕</button></header>
<p>${esc(d.text)}</p>
${ent.length ? `<h3>Elementi del sistema</h3><ul class="list">${ent.map((e) => `<li><a href="${href('e/' + e.id)}">${esc(e.title || e.name)}</a> <span class="code">${esc(e.id)}</span><br><span class="small muted">${esc(e.oneLine)}</span></li>`).join('')}</ul>` : ''}
<h3>Fonti</h3><ul class="list">${d.cards.map((c) => `<li><a href="${href(c)}"><span class="code">${esc(c)}</span> ${esc(app.idx.cards.get(c)?.title || '')}</a></li>`).join('')}</ul>
${d.links?.length ? `<h3>Per continuare</h3><ul class="list">${d.links.map((l) => `<li><a href="${href(l.route)}">${esc(l.label)}</a></li>`).join('')}</ul>` : ''}
<p class="small muted">Aprendo un collegamento lasci la presentazione; il pulsante Indietro del browser ti riporta a questa scena.</p>`;
        open(deepDlg, el);
      });
      app.on('pres-mode', (el) => { const m = el.dataset.v; const cur = new URLSearchParams(location.hash.split('?')[1] || '').get('s') || scene.id; app.go(sceneRoute(p.scenes.some((x) => x.id === cur) ? cur : scene.id, m), { replace: true }); });
      app.on('pres-goto', (el) => { const t = root.querySelector('#r-' + CSS.escape(el.dataset.id)); t.scrollIntoView({ block: 'start' }); const h = t.querySelector('h2'); h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); history.replaceState(null, '', '#' + sceneRoute(el.dataset.id, 'lettura')); root.querySelectorAll('.pres-toc button').forEach((b) => (b === el ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current'))); });
      app.on('pres-full', () => { (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => app.toast('Schermo intero non disponibile: la presentazione funziona anche così.')); });
      app.on('pres-exit', () => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); app.go(''); });
      if (mode === 'lettura' && 'IntersectionObserver' in window) {
        // la scena in lettura aggiorna l'URL (sostituzione, nessuna voce in cronologia) e l'indice
        let ready = false; setTimeout(() => { ready = true; }, 600);
        const io = new IntersectionObserver((entries) => {
          if (!ready) return;
          const top = entries.filter((x) => x.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
          if (!top || !document.body.contains(top.target)) return;
          const id = top.target.dataset.scene;
          history.replaceState(null, '', '#' + sceneRoute(id, 'lettura'));
          root.querySelectorAll('.pres-toc button').forEach((b) => (b.dataset.id === id ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')));
        }, { rootMargin: '-80px 0px -60% 0px' });
        root.querySelectorAll('.pres-sec').forEach((s) => io.observe(s));
        app.cleanup = () => io.disconnect();
      }
      if (mode === 'lettura' && q.s && known >= 0 && idx > 0) setTimeout(() => root.querySelector('#r-' + CSS.escape(scene.id))?.scrollIntoView({ block: 'start' }), 0);
      app.onKey = (e) => {
        if (mode !== 'presentazione' || e.altKey || e.ctrlKey || e.metaKey) return;
        const t = e.target;
        if (document.querySelector('dialog[open]') || t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.closest?.('[role=group], .seg')) return;
        if (e.key === 'ArrowRight' && next) { e.preventDefault(); app.go(sceneRoute(next.id)); }
        if (e.key === 'ArrowLeft' && prev) { e.preventDefault(); app.go(sceneRoute(prev.id)); }
      };
    },
  };
}
