import { badge, esc, href, phead, ctxbar, st, table } from '../ui.js';
import * as store from '../lib/store.js';
import { download } from './contribute.js';

export function settings(app) {
  const { core, idx } = app;
  const favs = app.data.favorites;
  const notes = Object.entries(app.data.notes).filter(([k]) => !k.startsWith('__'));
  const name = (id) => idx.get(id)?.name || (idx.cards.get(id) ? `${id} · ${idx.cards.get(id).title}` : id);
  const route = (id) => (idx.get(id) ? 'e/' + id : id);
  const html = `${ctxbar([['Panoramica', ''], ['Preferiti e dati locali']])}${phead({ eyebrow: 'Su questo dispositivo', title: 'Preferiti e dati locali', lead: 'Preferiti, appunti, spunte e scenari sono salvati nel browser di questo dispositivo. Non sono condivisi, non sono collaudi e non cambiano il Faldone.' })}
${app.storeStatus === 'migrato' || app.data.migratedFrom44 ? '<div class="callout">Dati della versione 4.4 recuperati (preferiti, spunte, tema, valori del calcolatore). Le chiavi originali non sono state cancellate.</div>' : ''}
<h2>Preferiti (${favs.length})</h2>${favs.length ? `<ul class="list">${favs.map((f) => `<li><a href="${href(route(f))}">${esc(name(f))}</a> <button class="chip" type="button" data-action="fav" data-id="${esc(f)}" aria-pressed="true">Rimuovi</button></li>`).join('')}</ul>` : '<p class="muted">Nessun preferito. Usa «Aggiungi ai preferiti» su una scheda o un elemento.</p>'}
<h2>Appunti (${notes.length})</h2>${notes.length ? `<ul class="list">${notes.map(([k, v]) => `<li><a href="${href(route(k))}">${esc(name(k))}</a><br><span class="small">${esc(v.text.slice(0, 200))}</span></li>`).join('')}</ul>` : '<p class="muted">Nessun appunto.</p>'}
<h2>Esporta e importa</h2><div class="card"><p><button class="btn" type="button" data-action="export">Esporta i dati locali (.json)</button></p>
<label class="f">Importa un file esportato<input type="file" accept="application/json,.json" data-change="import"></label><div id="impout" aria-live="polite"></div>
<p class="small muted">L'importazione mostra prima un'anteprima: nessun appunto viene sovrascritto senza la tua scelta. Il file viene letto come testo e non esegue nulla.</p></div>
<h2>Consultazione offline</h2><div class="card" id="offline"><p>Il sito registra le pagine visitate per la consultazione offline. Puoi scaricare ora tutte le schede pubbliche (${core.meta.counts.cards} pagine e ${core.meta.counts.groups} testi).</p>
<p><button class="btn" type="button" data-action="cacheall">Scarica tutto per l'offline</button> <a class="btn ghost" href="kit/emergenza.html">Kit di emergenza</a></p><p class="small" id="offstat">Revisione ${esc(core.meta.revision)}, build ${esc(core.meta.build)}.</p>
<p class="small muted">Solo documentazione pubblica: nessuna risposta autenticata o dato di sicurezza viene messo in cache.</p></div>
<h2>Stato della memoria locale</h2><p class="small">${({ ok: 'Disponibile.', nuovo: 'Disponibile (nessun dato precedente).', migrato: 'Disponibile, migrata dalla 4.4.', corrotto: 'I dati salvati non erano leggibili: si è ripartiti da zero.', non_disponibile: 'Il browser non consente il salvataggio: i dati valgono solo per questa visita. Esportali per conservarli.' })[app.storeStatus] || ''} Ultimo salvataggio: ${esc(app.data.updatedAt || 'mai')}.</p>`;
  return {
    title: 'Preferiti e dati locali', html,
    mount: (root) => {
      app.on('export', () => download(`faldone-dati-locali-${new Date().toISOString().slice(0, 10)}.json`, store.exportData(app.data, core.meta.revision), 'application/json'));
      app.on('import', async (el) => {
        const f = el.files[0]; if (!f) return;
        if (f.size > 2_000_000) { root.querySelector('#impout').innerHTML = '<p class="errbox">File troppo grande.</p>'; return; }
        const text = await f.text();
        const known = (x) => !!(idx.get(x) || idx.cards.get(x) || idx.procedures.get(x));
        const r = store.parseImport(text, known);
        if (!r.ok) { root.querySelector('#impout').innerHTML = `<p class="errbox">${esc(r.errors.join('; '))}</p>`; return; }
        const pv = store.previewMerge(app.data, r.data);
        root.querySelector('#impout').innerHTML = `<div class="card"><h3 style="margin-top:0">Anteprima</h3><ul><li>Preferiti nuovi: ${pv.newFav.length}</li><li>Appunti nuovi: ${pv.newNotes.length}</li><li>Scenari: ${pv.newScenarios}</li>${pv.olderFile ? '<li><strong>Il file è più vecchio dei dati attuali.</strong></li>' : ''}${r.warnings.length ? `<li>Ignorati: ${esc(r.warnings.slice(0, 5).join('; '))}</li>` : ''}</ul>
${pv.conflicts.length ? `<h4>Conflitti (${pv.conflicts.length})</h4>${pv.conflicts.map((c) => `<fieldset style="border:1px solid var(--line);border-radius:6px;margin:6px 0"><legend>${esc(name(c.id))}</legend><label><input type="radio" name="cf-${esc(c.id)}" value="attuale" checked> Tieni l'attuale: «${esc(c.current.text.slice(0, 80))}»</label><br><label><input type="radio" name="cf-${esc(c.id)}" value="importato"> Usa l'importato${c.newer === 'importato' ? ' (più recente)' : ''}: «${esc(c.incoming.text.slice(0, 80))}»</label></fieldset>`).join('')}` : ''}
<button class="btn primary" type="button" data-action="doimport">Unisci</button> <button class="btn ghost" type="button" data-action="cancelimp">Annulla</button></div>`;
        app.on('doimport', () => {
          const choices = Object.fromEntries(pv.conflicts.map((c) => [c.id, root.querySelector(`input[name="cf-${CSS.escape(c.id)}"]:checked`)?.value || 'attuale']));
          app.data = store.merge(app.data, r.data, choices); app.persist(); app.toast('Dati importati'); app.go('preferiti', { replace: true });
        });
        app.on('cancelimp', () => { root.querySelector('#impout').innerHTML = ''; el.value = ''; });
      });
      app.on('cacheall', async () => {
        const out = root.querySelector('#offstat');
        if (!navigator.serviceWorker?.controller) { out.textContent = 'La consultazione offline richiede che il sito sia servito in HTTPS (o localhost) e ricaricato una volta.'; return; }
        out.textContent = 'Scaricamento in corso…';
        navigator.serviceWorker.onmessage = (ev) => {
          if (ev.data.type === 'cache-progress') out.textContent = `Scaricate ${ev.data.done} di ${ev.data.total}…`;
          if (ev.data.type === 'cache-done') out.textContent = `Pronto: ${ev.data.done} file disponibili offline, revisione ${ev.data.revision}, build ${ev.data.build}, aggiornati il ${new Date().toLocaleString('it-IT')}.`;
        };
        navigator.serviceWorker.controller.postMessage({ type: 'cache-all' });
      });
    },
  };
}

export function connectors(app) {
  const { core } = app;
  const html = `${ctxbar([['Realizza', 'realizza'], ['Connettori']])}${phead({ eyebrow: 'Integrazioni', title: 'Registro dei connettori', lead: 'Come il Faldone potrà mostrare lo stato osservato, in sola lettura. Oggi nessun connettore è collegato: ogni stato osservato è «non rilevato».' })}
<div class="callout"><strong>Flusso previsto</strong>Servizi interni → adapter su un server autorizzato → istantanea normalizzata → sito con permessi. Nessun token nel browser, negli URL o nel bundle pubblico. Nessuna verifica risveglia i server a richiesta. Il contratto è in <code>docs/integrazioni.md</code> e l'adapter di riferimento in <code>tools/adapters/</code>, provato solo con dati di test.</div>
${table(['Connettore', 'Scopo', 'Stato', 'Frequenza / scadenza', 'Natura', 'Implementato'], core.connectors.map((c) => [`<strong>${esc(c.source)}</strong>${c.preferred ? ' <span class="ev">preferito</span>' : ''}`, esc(c.purpose), badge('unknown', c.state.replace('_', ' ')), `${c.everyS / 60} min / dato scaduto dopo ${Math.round(c.staleAfterS / 60)} min`, c.readOnly ? 'sola lettura' : 'azione', esc(c.implemented)]))}
<p class="small muted">Stati possibili: non configurato, configurato non verificato, connesso, degradato, errore. Un errore di rete viene mostrato come tale, mai come assenza del dato o salute del sistema.</p>`;
  return { title: 'Connettori', html };
}
