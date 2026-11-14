// Area riservata nell'interfaccia: modulo di sblocco riusabile e pagina di stato.
// La password resta nel campo e in memoria solo per il tempo del calcolo; si conserva, se richiesto, la chiave derivata.
import { esc, href, phead, ctxbar, icon } from '../ui.js';

let seq = 0;
/** Riquadro «contenuto riservato» con il modulo della password. Va seguito da bindLock nella mount della vista. */
export function lockForm(app, { title = 'Contenuto riservato', text = 'Questa parte del Faldone si legge solo con la password dell\'area riservata.' } = {}) {
  const n = ++seq;
  return `<section class="card lockcard" aria-labelledby="lock-t${n}"><div class="lock-h"><span class="ic" aria-hidden="true">${icon('lock')}</span><div><h2 id="lock-t${n}">${esc(title)}</h2><p>${esc(text)}</p></div></div>
<form data-submit="vault-unlock" class="lock-f"><input type="text" name="username" value="Faldone · area riservata" autocomplete="username" hidden>
<label class="f" for="vault-pw${n}">Password<input id="vault-pw${n}" name="password" type="password" autocomplete="current-password" required autocapitalize="off" autocorrect="off" spellcheck="false"></label>
<label class="lock-r"><input type="checkbox" name="remember"> Ricorda su questo dispositivo</label>
<button class="btn primary btn-lg" type="submit">Sblocca</button>
<p class="lock-s small" role="status" aria-live="polite"></p></form>
<p class="small muted">Senza la spunta resta sbloccata finché questa scheda del browser è aperta. Con la spunta il dispositivo conserva la chiave: usala solo su dispositivi tuoi. <a href="${href('riservato')}">Come funziona</a></p></section>`;
}
/** Collega il modulo: a password giusta chiama onOk, altrimenti lo dice e rimette il fuoco nel campo. */
export function bindLock(app, onOk) {
  app.on('vault-unlock', async (form) => {
    const pw = form.elements.password, st = form.querySelector('.lock-s'), btn = form.querySelector('button[type=submit]');
    if (!pw.value.trim() || btn.disabled) return;
    btn.disabled = true; st.textContent = 'Verifico la password…';
    const r = await app.vault.unlock(pw.value, form.elements.remember.checked).catch((e) => ({ error: e }));
    btn.disabled = false;
    if (r === true) { pw.value = ''; st.textContent = ''; app.toast('Area riservata sbloccata'); onOk(); return; }
    st.textContent = r === false ? 'Password non valida. Controlla maiuscole, trattini e spazi.' : 'Non riesco a leggere l\'area riservata: se sei offline, riprova con la rete o apri una pagina riservata già vista.';
    pw.select(); pw.focus();
  });
}

export async function vaultPage(app) {
  const box = await app.vault.box();
  const data = await app.vault.ready();
  const { idx } = app;
  const imp = await app.load('impianti', 'data/impianti.json').catch(() => ({ impianti: [] }));
  const names = (box?.index.impianti || []).map((id) => [`impianti/${id}`, imp.impianti.find((x) => x.id === id)?.title || id]).concat((box?.index.entita || []).map((id) => [`e/${id}`, idx.get(id)?.name || id]));
  const html = `${ctxbar([['Panoramica', ''], ['Area riservata']])}${phead({ eyebrow: 'Protezione con password', title: 'Area riservata', lead: 'Le parti più sensibili del Faldone, come la planimetria di casa, sono pubblicate solo cifrate: senza la password nel sito e nel repository c\'è testo illeggibile.' })}
${!box ? '<div class="empty">Nessun contenuto riservato pubblicato, oppure non raggiungibile adesso.</div>' : data ? `<div class="callout"><strong>Sbloccata su questo dispositivo</strong>${app.vault.remembered() ? 'La chiave è ricordata in questo browser: resta sbloccata anche dopo averlo chiuso.' : 'Resta sbloccata finché questa scheda è aperta.'}</div>
<p><button class="btn primary" type="button" data-action="vault-lock">${icon('lock')} Blocca adesso</button></p>` : lockForm(app, { title: 'Sblocca l\'area riservata', text: 'Inserisci la password per leggere le sezioni elencate qui sotto.' })}
${box ? `<h2>Che cosa è protetto</h2><ul class="list">${names.map(([r, t]) => `<li><a href="${href(r)}">${esc(t)}</a>${data ? '' : ' <span class="small muted">· richiede la password</span>'}</li>`).join('') || '<li class="muted">Nessuna voce.</li>'}</ul>
<p class="small muted">Ultimo aggiornamento del contenuto cifrato: ${esc(box.updated || 'non indicato')}. L'elenco delle voci protette è pubblico; il loro contenuto no.</p>` : ''}
<h2>Come funziona e che cosa non fa</h2>
<ul><li>Il contenuto è cifrato con AES-256-GCM; la chiave nasce dalla password con PBKDF2 (${box ? box.it.toLocaleString('it-IT') : '600.000'} passaggi). La decifrazione avviene nel browser: la password non viene inviata a nessuno.</li>
<li><strong>La protezione vale quanto la password.</strong> Il file cifrato è pubblico: chi lo scarica può provare password sul proprio computer senza limiti. Serve una password lunga e non usata altrove.</li>
<li>Protegge solo ciò che sta nell'area riservata. Il resto del Faldone, i PDF e la cronologia del repository restano pubblici.</li>
<li>Chi conosce la password vede tutta l'area riservata: non ci sono livelli diversi per persone diverse.</li>
<li>Per cambiare password o contenuto serve lo strumento <code>tools/riservato.mjs</code> (vedi <code>docs/area-riservata.md</code>).</li></ul>`;
  return {
    title: 'Area riservata', html,
    mount: () => {
      bindLock(app, () => app.go('riservato', { replace: true }));
      app.on('vault-lock', () => { app.vault.lock(); app.toast('Area riservata bloccata su questo dispositivo'); app.go('riservato', { replace: true }); });
    },
  };
}
