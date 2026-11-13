import { esc, href, phead, ctxbar, ic, go, icon } from '../ui.js';

const PR_ICON = { 'PR-NOACCESSO': 'lock', 'PR-INTERNET': 'wifi', 'PR-DOMOTICA': 'bulb', 'PR-DATI': 'file', 'PR-BLACKOUT': 'bolt' };

export function emergency(app) {
  const { core } = app;
  const em = core.procedures.filter((p) => p.emergency);
  const html = `${phead({ eyebrow: 'Usa e risolvi', title: 'Qualcosa non funziona?', lead: 'Scegli che cosa succede: una guida ti accompagna un passo alla volta. Prima i controlli che chiunque può fare senza toccare nulla, poi il passaggio al tecnico.' })}
<div class="emerg">${em.map((p) => `<a href="${href('procedura/' + p.id + '?g=1')}">${ic(PR_ICON[p.id] || 'fix')}${esc(p.symptom)}<small>${esc(p.title)}</small></a>`).join('')}</div>
<div class="callout warn"><strong>Prima regola</strong>Non riavviare M2 o M4 «per provare» e non cancellare nulla per fare spazio. Un servizio fermo non significa dati persi; una macchina a richiesta spenta non è guasta.</div>
<h2>Altri strumenti</h2><div class="grid">
<a class="tile" href="${href('simula')}">${ic('sim')}<span class="t">Simulatore${go}</span><p>Capire che cosa dipende da che cosa, prima di intervenire.</p></a>
${core.procedures.filter((p) => !p.emergency).map((p) => `<a class="tile" href="${href('procedura/' + p.id)}">${ic('fix')}<span class="t">${esc(p.symptom)}${go}</span><p>${esc(p.title)} · per tecnici</p></a>`).join('')}
<a class="tile" href="kit/emergenza.html">${ic('kit')}<span class="t">Kit di emergenza offline${go}</span><p>Un file autonomo, stampabile, con la revisione ${esc(core.meta.revision)}. Funziona senza Internet e senza i server di casa.</p></a>
<a class="tile" href="${href('preferiti')}">${ic('offline')}<span class="t">Consultazione offline${go}</span><p>Scarica tutte le schede pubbliche su questo dispositivo.</p></a></div>
<p class="small muted">Le checklist che spunti qui restano su questo dispositivo e non sono collaudi ufficiali. Le procedure non sono ancora state provate sul campo: l'impianto 4.4 è in attuazione.</p>`;
  return { title: 'Usa e risolvi', html };
}

export function procedure(app, [id]) {
  const { core, idx } = app;
  const p = core.procedures.find((x) => x.id === id);
  if (!p) return { title: 'Procedura', html: '<p>Procedura non trovata.</p>' };
  const tech = app.depth !== 'capire' || app.query.tecnico === '1';
  const chk = (k) => app.data.checks[`${id}:${k}`]?.done;
  const box = (k, label) => `<label style="display:flex;gap:10px;align-items:flex-start"><input type="checkbox" data-change="chk" data-k="${esc(k)}" ${chk(k) ? 'checked' : ''} style="margin-top:6px;width:20px;height:20px"><span>${label}</span></label>`;
  if (app.query.g === '1') return guided(app, p, tech);
  const html = `${ctxbar([['Usa e risolvi', 'emergenza'], [p.symptom]])}${phead({ eyebrow: p.emergency ? 'Emergenza' : 'Procedura tecnica', title: p.title, lead: `Per: ${esc(p.audience)}. Competenze: ${esc(p.skills)}.`, actions: `<a class="btn primary btn-lg" href="${href(`procedura/${id}?g=1${app.query.tecnico === '1' ? '&tecnico=1' : ''}`)}">Avvia la guida passo passo ${icon('arrow')}</a>` })}
${p.stopIf?.length ? `<div class="callout warn"><strong>Fermati se</strong><ul>${p.stopIf.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>` : ''}
<section class="proc"><h2>1. Controlli iniziali <small class="muted">(non modificano nulla)</small></h2><ol>${p.checks.map((c, i) => `<li>${box(`c${i}`, `${esc(c.text)}<br><span class="small muted">Risultato atteso: ${esc(c.expect)}</span>`)}</li>`).join('')}</ol>
<h2>2. Passaggi</h2>
${!tech && p.steps.some((s) => s.tech) ? `<p><a class="btn" href="${href(`procedura/${id}?tecnico=1`)}">Mostra i passaggi da tecnico</a> <span class="small muted">${p.steps.filter((s) => s.tech).length} passaggi richiedono competenze tecniche.</span></p>` : ''}
<ol>${p.steps.map((s, i) => [s, i]).filter(([s]) => tech || !s.tech).map(([s, i]) => `<li>${box(`s${i}`, `${s.tech ? '<span class="ev">tecnico</span> ' : ''}${esc(s.text)}`)}
${s.cmd ? `<div class="cmd"><code>${esc(s.cmd)}</code><span class="small"><strong>Dove:</strong> ${esc(s.where)} · <strong>Cosa fa:</strong> ${esc(s.does)}</span><span><button class="chip" type="button" data-action="copy" data-text="${esc(s.cmd)}">Copia questo comando</button></span></div>` : ''}
<div class="small muted">Risultato atteso: ${esc(s.expect)}${s.else ? ` · Se è diverso: ${esc(s.else)}` : ''}</div></li>`).join('')}</ol>
${p.params ? `<p class="small">Parametri da sostituire con i valori reali (non sono nel Faldone pubblico): ${p.params.map((x) => `<code>${esc(x)}</code>`).join(', ')}.</p>` : ''}
<h2>3. Ritorno indietro</h2><p>${esc(p.rollback)}</p>
<h2>4. Che cosa registrare</h2><p>${esc(p.evidence)}</p></section>
<p class="small muted">Le spunte valgono solo su questo dispositivo e non sono un collaudo ufficiale. <button class="chip" type="button" data-action="clearchk">Azzera le spunte</button></p>
<p class="small">Fonti: ${p.cards.map((c) => `<a class="code" href="${href(c)}">${esc(c)}</a>`).join(' ')} · Revisione ${esc(core.meta.revision)} · Ultima verifica sul campo: ${p.verifiedAt ? esc(p.verifiedAt) : 'nessuna'}</p>
<p class="small">Elementi coinvolti: ${p.entities.map((e) => `<a href="${href('e/' + e)}">${esc(idx.get(e)?.name || e)}</a>`).join(', ')} · <a href="kit/emergenza.html#${esc(p.id)}">Versione stampabile offline</a></p>`;
  return {
    title: p.symptom, html,
    mount: () => {
      app.on('chk', (el) => { app.data.checks[`${id}:${el.dataset.k}`] = { done: el.checked, at: new Date().toISOString(), source: 'locale' }; app.persist(); });
      app.on('clearchk', () => { for (const k of Object.keys(app.data.checks)) if (k.startsWith(id + ':')) delete app.data.checks[k]; app.persist(); app.go(app.route + (app.query.tecnico ? '?tecnico=1' : ''), { replace: true }); });
    },
  };
}

// ---------------------------------------------------------------------------
// Guida passo passo: un controllo o un passaggio per schermata, stesse voci e stesse spunte della
// procedura completa. Non aggiunge istruzioni: mostra quelle della procedura, una alla volta.
// ---------------------------------------------------------------------------
export function guideItems(p, tech) {
  return [
    ...p.checks.map((c, i) => ({ k: `c${i}`, phase: 'Controllo iniziale', note: 'Non modifica nulla.', ...c })),
    ...p.steps.map((s, i) => ({ k: `s${i}`, phase: s.tech ? 'Passaggio da tecnico' : 'Passaggio', ...s })).filter((s) => tech || !s.tech),
  ];
}
function guided(app, p, tech) {
  const { core, idx } = app;
  const id = p.id;
  const items = guideItems(p, tech);
  const hiddenTech = p.steps.filter((s) => s.tech).length - items.filter((s) => s.tech).length;
  const N = items.length;
  const n = Math.max(0, Math.min(N + 1, Number.parseInt(app.query.n || '0', 10) || 0)); // 0 = avvio, 1…N = voci, N+1 = riepilogo
  const tq = app.query.tecnico === '1' ? '&tecnico=1' : '';
  const at = (k) => href(`procedura/${id}?g=1&n=${k}${tq}`);
  const state = (k) => app.data.checks[`${id}:${k}`];
  const answered = items.filter((it) => state(it.k)).length;
  const firstOpen = items.findIndex((it) => !state(it.k));
  const bar = `<div class="guide-top"><a href="${href('emergenza')}">← Esci dalla guida</a><span class="guide-count">${n >= 1 && n <= N ? `Passo ${n} di ${N}` : n === 0 ? `${N} passi` : 'Riepilogo'}</span></div>
<div class="guide-bar" role="progressbar" aria-label="Avanzamento della guida" aria-valuemin="0" aria-valuemax="${N}" aria-valuenow="${Math.min(n, N)}"><i style="width:${(100 * Math.min(n, N)) / N}%"></i></div>`;
  let body;
  if (n === 0) {
    body = `<p class="eyebrow">${p.emergency ? 'Emergenza' : 'Procedura tecnica'} · ${esc(p.symptom)}</p><h1 id="ptitle">${esc(p.title)}</h1>
<p class="lead">Ti guido un passo alla volta. Per ogni passo leggi che cosa fare, guarda il risultato e dimmi se è quello atteso.</p>
<dl class="kv"><dt>Per chi</dt><dd>${esc(p.audience)}</dd><dt>Competenze</dt><dd>${esc(p.skills)}</dd></dl>
${p.stopIf?.length ? `<div class="callout warn"><strong>Fermati se</strong><ul>${p.stopIf.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
<div class="guide-actions"><a class="btn primary btn-lg" href="${at(firstOpen > 0 ? firstOpen + 1 : 1)}">${firstOpen > 0 ? `Riprendi dal passo ${firstOpen + 1}` : 'Comincia'} ${icon('arrow')}</a>${answered ? `<button class="btn btn-lg" type="button" data-action="guide-restart">Ricomincia da capo</button>` : ''}</div>
<p class="small muted">${answered ? `Hai già risposto a ${answered} ${answered === 1 ? 'passo' : 'passi'} su questo dispositivo. ` : ''}Le risposte restano su questo dispositivo e non sono un collaudo ufficiale. La procedura non è ancora stata provata sul campo: l'impianto ${esc(core.meta.revision)} è in attuazione.</p>`;
  } else if (n <= N) {
    const it = items[n - 1], cur = state(it.k), diff = app.query.x === '1' || (cur && cur.done === false);
    body = `<p class="eyebrow">${esc(it.phase)}${it.note ? ' · ' + esc(it.note) : ''}</p><h1 id="ptitle" class="guide-step">${esc(it.text)}</h1>
${it.cmd ? `<div class="cmd"><code>${esc(it.cmd)}</code><span class="small"><strong>Dove:</strong> ${esc(it.where)} · <strong>Cosa fa:</strong> ${esc(it.does)}</span><span><button class="chip" type="button" data-action="copy" data-text="${esc(it.cmd)}">Copia questo comando</button></span></div>` : ''}
<div class="guide-expect"><span class="small muted">Risultato atteso</span><p>${esc(it.expect)}</p></div>
${diff ? `<div class="callout warn" role="status"><strong>Hai segnato: risultato diverso</strong>${it.else ? esc(it.else) : 'La procedura non indica un passo alternativo per questo caso: resta annotato nel riepilogo, da riferire al tecnico.'}</div>
<div class="guide-actions"><a class="btn primary btn-lg" href="${at(n + 1)}">${n === N ? 'Vai al riepilogo' : 'Continua'} ${icon('arrow')}</a><button class="btn btn-lg" type="button" data-action="guide-answer" data-k="${esc(it.k)}" data-v="yes">Ho sbagliato: è come atteso</button></div>`
    : `<p class="guide-q" id="guide-q">È andata come atteso?</p><div class="guide-actions" role="group" aria-labelledby="guide-q"><button class="btn primary btn-lg" type="button" data-action="guide-answer" data-k="${esc(it.k)}" data-v="yes">${icon('check')} Sì, è così</button><button class="btn btn-lg" type="button" data-action="guide-answer" data-k="${esc(it.k)}" data-v="no">No, è diverso</button></div>`}
<p class="guide-nav"><a href="${at(n - 1)}">← Indietro</a>${cur ? '' : `<a href="${at(n + 1)}">Salta questo passo →</a>`}</p>`;
  } else {
    const row = (it, i) => { const c = state(it.k); return `<li class="${c ? (c.done ? 'ok' : 'diff') : 'skip'}"><a href="${at(i + 1)}"><span class="guide-mark" aria-hidden="true">${c ? (c.done ? '✓' : '!') : '–'}</span><span>${esc(it.text)}<br><span class="small muted">${c ? (c.done ? 'come atteso' : `diverso dall'atteso${it.else ? ' · ' + esc(it.else) : ''}`) : 'non eseguito'}</span></span></a></li>`; };
    const diffs = items.filter((it) => state(it.k)?.done === false);
    const summary = [`${p.symptom} — ${p.title} (Faldone ${core.meta.revision})`, ...items.map((it, i) => { const c = state(it.k); return `${i + 1}. ${it.text} → ${c ? (c.done ? 'come atteso' : 'DIVERSO') : 'non eseguito'}`; })].join('\n');
    body = `<p class="eyebrow">Riepilogo · ${esc(p.symptom)}</p><h1 id="ptitle">${diffs.length ? `${diffs.length} ${diffs.length === 1 ? 'risultato diverso' : 'risultati diversi'} dall'atteso` : answered === N ? 'Tutti i passi sono andati come atteso' : `${answered} passi su ${N} eseguiti`}</h1>
<ol class="guide-sum">${items.map(row).join('')}</ol>
${hiddenTech > 0 ? `<div class="callout"><strong>Passaggio al tecnico</strong>${hiddenTech} ${hiddenTech === 1 ? 'passaggio richiede' : 'passaggi richiedono'} competenze tecniche e non ${hiddenTech === 1 ? 'è stato mostrato' : 'sono stati mostrati'}. <a href="${href(`procedura/${id}?g=1&n=1&tecnico=1`)}">Continua con i passaggi da tecnico</a></div>` : ''}
<h2>Ritorno indietro</h2><p>${esc(p.rollback)}</p><h2>Che cosa registrare</h2><p>${esc(p.evidence)}</p>
<div class="guide-actions"><button class="btn primary" type="button" data-action="copy" data-text="${esc(summary)}">Copia il riepilogo da mandare al tecnico</button><a class="btn" href="${href('procedura/' + id + (tq ? '?tecnico=1' : ''))}">Vedi tutta la procedura</a><button class="btn ghost" type="button" data-action="guide-restart">Azzera le risposte</button></div>
<p class="small">Elementi coinvolti: ${p.entities.map((e) => `<a href="${href('e/' + e)}">${esc(idx.get(e)?.name || e)}</a>`).join(', ')} · <a href="kit/emergenza.html#${esc(p.id)}">Versione stampabile offline</a></p>
<p class="guide-nav"><a href="${at(N)}">← Indietro</a></p>`;
  }
  return {
    title: `${p.symptom} · guida`, html: `<div class="guide">${bar}<section class="card guide-card">${body}</section></div>`,
    mount: () => {
      app.on('guide-answer', (el) => {
        const yes = el.dataset.v === 'yes';
        app.data.checks[`${id}:${el.dataset.k}`] = { done: yes, at: new Date().toISOString(), source: 'locale' };
        app.persist();
        app.go(`procedura/${id}?g=1&n=${yes ? n + 1 : n}${yes ? '' : '&x=1'}${tq}`);
      });
      app.on('guide-restart', () => { for (const k of Object.keys(app.data.checks)) if (k.startsWith(id + ':')) delete app.data.checks[k]; app.persist(); app.go(`procedura/${id}?g=1${tq}`); app.toast('Risposte azzerate su questo dispositivo'); });
      app.onKey = (e) => { if (e.target.closest?.('input,textarea,select,button,a')) return; if (e.key === 'ArrowLeft' && n > 0) app.go(`procedura/${id}?g=1&n=${n - 1}${tq}`); };
    },
  };
}
