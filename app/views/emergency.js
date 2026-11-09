import { esc, href, phead, ctxbar, ic, go } from '../ui.js';

const PR_ICON = { 'PR-NOACCESSO': 'lock', 'PR-INTERNET': 'wifi', 'PR-DOMOTICA': 'bulb', 'PR-DATI': 'file', 'PR-BLACKOUT': 'bolt' };

export function emergency(app) {
  const { core } = app;
  const em = core.procedures.filter((p) => p.emergency);
  const html = `${phead({ eyebrow: 'Usa e risolvi', title: 'Qualcosa non funziona?', lead: 'Scegli che cosa succede. Prima i controlli che chiunque può fare senza toccare nulla, poi il passaggio al tecnico.' })}
<div class="emerg">${em.map((p) => `<a href="${href('procedura/' + p.id)}">${ic(PR_ICON[p.id] || 'fix')}${esc(p.symptom)}<small>${esc(p.title)}</small></a>`).join('')}</div>
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
  const html = `${ctxbar([['Usa e risolvi', 'emergenza'], [p.symptom]])}${phead({ eyebrow: p.emergency ? 'Emergenza' : 'Procedura tecnica', title: p.title, lead: `Per: ${esc(p.audience)}. Competenze: ${esc(p.skills)}.` })}
${p.stopIf?.length ? `<div class="callout warn"><strong>Fermati se</strong><ul>${p.stopIf.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>` : ''}
<section class="proc"><h2>1. Controlli iniziali <small class="muted">(non modificano nulla)</small></h2><ol>${p.checks.map((c, i) => `<li>${box(`c${i}`, `${esc(c.text)}<br><span class="small muted">Risultato atteso: ${esc(c.expect)}</span>`)}</li>`).join('')}</ol>
<h2>2. Passaggi</h2>
${!tech && p.steps.some((s) => s.tech) ? `<p><a class="btn" href="${href(`procedura/${id}?tecnico=1`)}">Mostra i passaggi da tecnico</a> <span class="small muted">${p.steps.filter((s) => s.tech).length} passaggi richiedono competenze tecniche.</span></p>` : ''}
<ol>${p.steps.filter((s) => tech || !s.tech).map((s, i) => `<li>${box(`s${i}`, `${s.tech ? '<span class="ev">tecnico</span> ' : ''}${esc(s.text)}`)}
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
