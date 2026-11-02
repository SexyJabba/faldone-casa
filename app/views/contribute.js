import { badge, esc, href, phead, ctxbar, st } from '../ui.js';
import { roadmapState } from '../lib/roadmap.js';

const IMPACT = { incongruenza: 2, domanda: 1, privacy: 3, 'difetto del sito 4.4': 0, 'difetto del corpus': 0 };

export function contribute(app) {
  const { core, idx } = app;
  const ent = idx.get(app.query.e);
  const open = core.issues.filter((q) => !['risolta'].includes(q.status)).sort((a, b) => (IMPACT[b.kind] ?? 0) - (IMPACT[a.kind] ?? 0));
  const solved = core.issues.filter((q) => q.status === 'risolta');
  const tests = core.tests.filter((t) => !core.testResults.some((r) => r.testId === t.id && r.outcome === 'superato'));
  const draft = app.data.notes['__proposta'] ? JSON.parse(app.data.notes['__proposta'].text) : {};
  const html = `${ctxbar([['Realizza', 'realizza'], ['Contribuisci']])}${phead({ eyebrow: 'Contribuisci', title: 'Aiutare o verificare una scelta', lead: 'Per un tecnico che vuole dare una mano: il quadro, i limiti del mandato, che cosa manca e un modello di proposta. Nessuna proposta modifica il progetto approvato: revisione e approvazione sono passaggi separati del proprietario.' })}
<div class="callout"><strong>Limiti del mandato</strong>Il Faldone pubblico descrive un progetto. Non contiene indirizzi, credenziali o configurazioni private, e da qui non si eseguono comandi sull'impianto. Le proposte si preparano come bozza da inviare al proprietario: nessun invio automatico.</div>
<h2>Questioni aperte, per impatto</h2><ul class="list">${open.map((q) => `<li><a href="${href('contribuisci/' + q.id)}"><strong>${esc(q.title)}</strong></a> <span class="ev">${esc(q.kind)}</span> <span class="dim${q.status === 'da_chiarire' ? ' d-da_chiarire' : ''}">${esc(q.status.replace('_', ' '))}</span><br><span class="small">${esc(q.impact)}</span></li>`).join('')}</ul>
<h2>Prove da eseguire</h2><ul class="list">${tests.map((t) => `<li><strong>${esc(t.name)}</strong> ${badge('unknown', 'non eseguita')}<br><span class="small">${esc(t.criterion)}</span></li>`).join('')}</ul>
<h2 id="proposta">Prepara una segnalazione o proposta</h2>
<form class="card" data-submit="mkdraft"><div class="formgrid">
<label class="f">Elemento<input type="text" name="e" list="ents" value="${esc(ent?.id || draft.e || '')}"></label>
<label class="f">Tipo<select name="k"><option>Segnalazione</option><option${draft.k === 'Proposta' ? ' selected' : ''}>Proposta</option><option${draft.k === 'Domanda' ? ' selected' : ''}>Domanda</option></select></label></div>
<datalist id="ents">${core.entities.map((e) => `<option value="${esc(e.id)}">${esc(e.name)}</option>`).join('')}</datalist>
${[['ctx', 'Contesto', 'Che cosa stavi guardando, quale scheda o scenario'], ['obs', 'Osservazione', 'Che cosa hai notato'], ['evi', 'Evidenza', 'Fonte, misura, documento: da dove viene'], ['imp', 'Impatto', 'Che cosa cambia se è vero'], ['mod', 'Modifica suggerita', 'Che cosa proponi, senza toccare la baseline']].map(([k, l, p]) => `<label class="f" style="margin-top:8px">${l}<textarea name="${k}" placeholder="${esc(p)}" maxlength="4000">${esc(draft[k] || '')}</textarea></label>`).join('')}
<p style="margin-top:10px"><button class="btn primary" type="submit">Genera la bozza</button> <button class="btn ghost" type="button" data-action="ctxpack">Scarica il pacchetto di contesto</button></p>
<p class="small muted">La bozza resta su questo dispositivo finché non la copi o la scarichi. Non esiste un issue tracker collegato: niente viene inviato.</p></form>
<div id="draftout" aria-live="polite"></div>
${solved.length ? `<details><summary>Questioni risolte (${solved.length})</summary><ul>${solved.map((q) => `<li><a href="${href('contribuisci/' + q.id)}">${esc(q.title)}</a></li>`).join('')}</ul></details>` : ''}`;
  return {
    title: 'Contribuisci', html, keepScroll: !!ent,
    mount: (root) => {
      if (ent) root.querySelector('#proposta').scrollIntoView();
      const form = root.querySelector('form[data-submit=mkdraft]');
      const read = () => Object.fromEntries(new FormData(form));
      app.on('mkdraft', () => {
        const d = read();
        app.data.notes['__proposta'] = { text: JSON.stringify(d), at: new Date().toISOString() }; app.persist();
        const e = idx.get(d.e);
        const md = `# ${d.k}: ${e ? `${e.id} · ${e.name}` : d.e || 'senza elemento'}\n\n- Revisione del Faldone: ${core.meta.revision} (build ${core.meta.build})\n- Data: ${new Date().toISOString().slice(0, 10)}\n${e ? `- Schede: ${e.cards.join(', ')}\n- Stato: decisione ${e.status.decision}, realizzazione ${e.status.realization}\n` : ''}\n## Contesto\n${d.ctx || '—'}\n\n## Osservazione\n${d.obs || '—'}\n\n## Evidenza\n${d.evi || '—'}\n\n## Impatto\n${d.imp || '—'}\n\n## Modifica suggerita\n${d.mod || '—'}\n\n_Bozza preparata con il Faldone. Non modifica la baseline: va revisionata e approvata dal proprietario._\n`;
        root.querySelector('#draftout').innerHTML = `<div class="card"><h3 style="margin-top:0">Bozza pronta</h3><pre style="white-space:pre-wrap">${esc(md)}</pre><p><button class="btn" type="button" data-action="copy" data-text="${esc(md)}">Copia</button> <button class="btn ghost" type="button" data-action="dl" data-name="segnalazione-${esc(d.e || 'faldone')}.md">Scarica .md</button></p></div>`;
        app.on('dl', (el) => download(el.dataset.name, md, 'text/markdown'));
      });
      app.on('ctxpack', () => {
        const d = read();
        const e = idx.get(d.e);
        const rel = e ? core.relations.filter((r) => r.fromId === e.id || r.toId === e.id) : [];
        const pack = { formato: 'faldone-contesto', revisione: core.meta.revision, build: core.meta.build, generato: new Date().toISOString(), accesso: 'pubblico', elemento: e || null, relazioni: rel, questioniAperte: core.issues.filter((q) => q.status !== 'risolta' && (!e || q.entities?.includes(e.id))), collaudi: core.tests, esitiRegistrati: core.testResults, roadmapAdesso: roadmapState(core).now.map((t) => ({ id: t.id, titolo: t.title, stato: t.state })), nota: 'Contiene solo dati pubblici del Faldone.' };
        download(`contesto-${e?.id || 'faldone'}-${core.meta.revision}.json`, JSON.stringify(pack, null, 2), 'application/json');
      });
    },
  };
}

export function issue(app, [id]) {
  const { idx } = app;
  const q = idx.issues.get(id);
  if (!q) return { title: 'Questione', html: '<p>Questione non trovata.</p>' };
  const html = `${ctxbar([['Realizza', 'realizza'], ['Contribuisci', 'contribuisci'], [q.id]])}${phead({ eyebrow: `${esc(q.kind)} · ${esc(q.id)}`, title: q.title, extra: `<p><span class="dim${q.status === 'da_chiarire' ? ' d-da_chiarire' : ''}"><b>Stato</b>${esc(q.status.replace('_', ' '))}</span></p>` })}
${q.question ? `<p class="lead">${esc(q.question)}</p>` : ''}
${q.sources ? `<h2>Fonti a confronto</h2><ul>${q.sources.map((s) => `<li><a class="code" href="${href(s.card)}">${esc(s.card)}</a>: ${esc(s.says)}</li>`).join('')}</ul>` : ''}
<h2>Impatto</h2><p>${esc(q.impact)}</p>
<h2>Risoluzione</h2><p>${q.resolution ? esc(q.resolution) : 'Nessuna: serve una decisione del proprietario.'}</p>
${q.entities ? `<h2>Elementi</h2><div class="chips">${q.entities.map((e) => `<a class="chip" href="${href('e/' + e)}">${esc(idx.get(e)?.name || e)}</a>`).join('')}</div>` : ''}
<p><a class="btn" href="${href('contribuisci?e=' + (q.entities?.[0] || ''))}">Prepara una risposta o proposta</a></p>`;
  return { title: q.title, html };
}

export function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
