// Faldone stampabile: raccoglitore a schede sostituibili, da sfogliare e da scaricare, sempre dalla versione corrente.
import { esc, href, phead, table } from '../ui.js';
import { dtabs } from './docs.js';
import { wholeOrder, blockOrder, staleKeys, totals, fileName } from '../lib/stampa.js';

const mb = (b) => (b / 1048576).toLocaleString('it-IT', { maximumFractionDigits: 1 });
const size = (t) => (t ? `${t.pages} pagine · ${t.sheets} fogli fronte-retro · ${mb(t.bytes)} MB` : 'PDF non ancora generato');

export async function stampa(app) {
  const plan = await app.load('stampa', 'data/stampa.json');
  const pdf = await app.load('stampa-pdf', 'stampa/pdf/manifest.json').catch(() => ({ files: {} }));
  const stale = new Set(staleKeys(plan, pdf));
  const whole = wholeOrder(plan);
  const tw = totals(whole, pdf);
  const sheetBy = new Map(plan.sheets.map((s) => [s.code, s]));
  const dl = (id, label, name) => `<button class="btn ghost" type="button" data-action="st-dl" data-id="${esc(id)}" aria-label="${esc(`${label} ${name}`)}">${label}</button>`;

  const blockRows = plan.blocks.map((b) => {
    const t = totals(blockOrder(plan, b.id), pdf);
    return [`<span class="code">${esc(b.id)}</span>`, esc(b.name), String(b.cards), String(b.all.length), t ? String(t.pages) : 'n.d.',
      `<a href="stampa/blocco-${esc(b.id)}.html" aria-label="Sfoglia il blocco ${esc(b.id)}">Sfoglia</a>`, t ? dl(b.id, 'Scarica PDF', `del blocco ${b.id}`) : ''];
  });

  const sheetItem = (s) => {
    const f = pdf.files[s.code];
    return `<li data-t="${esc(`${s.codes.join(' ')} ${s.title}`.toLowerCase())}"><a href="stampa/scheda/${esc(s.code)}.html"><span class="code">${esc(s.code)}</span> ${esc(s.title)}</a>
<span class="small muted"> · ${f ? `<a href="stampa/pdf/${esc(s.code)}.pdf" aria-label="PDF della scheda ${esc(s.code)}">PDF</a>, ${f.pages} pagine` : 'PDF non ancora generato'}${stale.has(s.code) && f ? ' · <strong>PDF più vecchio del testo</strong>' : ''}${s.codes.length > 1 ? ` · vale per ${s.codes.length} codici` : ''}</span></li>`;
  };

  app.on('st-filter', (el) => {
    const q = el.value.trim().toLowerCase(); let n = 0;
    for (const li of document.querySelectorAll('#st-sheets li')) { const ok = !q || li.dataset.t.includes(q); li.hidden = !ok; if (ok) n++; }
    for (const sec of document.querySelectorAll('#st-sheets section')) sec.hidden = !sec.querySelector('li:not([hidden])');
    document.getElementById('st-count').textContent = `${n} schede`;
  });

  app.on('st-dl', async (el) => {
    const id = el.dataset.id;
    const keys = id === 'tutto' ? whole : blockOrder(plan, id);
    const status = document.getElementById('st-status');
    const all = [...document.querySelectorAll('[data-action="st-dl"]')];
    all.forEach((b) => { b.disabled = true; });
    try {
      status.textContent = `Compongo il PDF: 0 di ${keys.length} parti…`;
      const { mergePdfs, parsePdf } = await import('../lib/pdfmerge.js');
      const docs = new Array(keys.length); let done = 0; let next = 0;
      const worker = async () => {
        while (next < keys.length) {
          const i = next++;
          const res = await fetch(`stampa/pdf/${keys[i]}.pdf`);
          if (!res.ok) throw new Error(`${keys[i]}.pdf: ${res.status}`);
          docs[i] = parsePdf(new Uint8Array(await res.arrayBuffer()));
          if (++done % 10 === 0 || done === keys.length) status.textContent = `Compongo il PDF: ${done} di ${keys.length} parti…`;
        }
      };
      await Promise.all(Array.from({ length: 6 }, worker));
      const title = id === 'tutto' ? `Il Faldone · revisione ${plan.revision}` : `Il Faldone · blocco ${id} · revisione ${plan.revision}`;
      const out = mergePdfs(docs, { title, date: plan.date });
      const url = URL.createObjectURL(new Blob([out], { type: 'application/pdf' }));
      const a = Object.assign(document.createElement('a'), { href: url, download: fileName(plan, id) });
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      const pages = docs.reduce((n, d) => n + d.pages.length, 0);
      status.textContent = `Pronto: ${fileName(plan, id)}, ${pages} pagine (${pages / 2} fogli fronte-retro).`;
    } catch (e) {
      status.textContent = `Non riesco a comporre il PDF (${e.message}). Il testo si può sempre sfogliare e stampare dal browser con «Sfoglia».`;
    } finally { all.forEach((b) => { b.disabled = false; }); }
  });

  const html = `${dtabs('documenti/stampa')}${phead({ eyebrow: 'Documentazione', title: 'Faldone stampabile', lead: 'Il raccoglitore a schede sostituibili, generato dagli stessi testi del sito: si sfoglia intero, a blocchi o una scheda alla volta, e si scarica aggiornato per la stampa.' })}
<div class="stats st-stats"><div class="stat"><b>${plan.sheets.length}</b><span>schede per ${app.core.meta.counts.cards} codici</span></div><div class="stat"><b>${plan.blocks.length}</b><span>blocchi</span></div><div class="stat"><b>${tw ? tw.pages : 'n.d.'}</b><span>pagine nel raccoglitore intero</span></div><div class="stat"><b>${esc(plan.revision)}</b><span>revisione del ${esc(plan.date)}</span></div></div>
${stale.size ? `<p class="warn" role="note"><strong>${stale.size === 1 ? 'Un PDF è' : `${stale.size} PDF sono`} più ${stale.size === 1 ? 'vecchio' : 'vecchi'} del testo sul sito.</strong> Il testo corrente si legge e si stampa da «Sfoglia»; i PDF si rigenerano con <code>node tools/stampa.mjs</code>.</p>` : ''}
<p id="st-status" role="status" class="small"></p>
<section class="card st-whole" aria-labelledby="st-h-whole"><h2 id="st-h-whole">Faldone intero</h2>
<p>Frontespizio, indice di ogni blocco e tutte le schede, ognuna stampata una volta nel blocco del suo primo codice.</p>
<p class="small muted">${size(tw)}</p>
<div class="actions"><a class="btn primary" href="stampa/faldone.html">Sfoglia il Faldone intero</a>${tw ? dl('tutto', 'Scarica il PDF', 'del Faldone intero').replace('btn ghost', 'btn') : ''}</div></section>
<section aria-labelledby="st-h-blocks"><h2 id="st-h-blocks">Un blocco alla volta</h2>
<p class="small">Il PDF di un blocco è completo da solo: contiene l'indice e tutte le schede che servono ai suoi codici, anche quelle che nel raccoglitore intero stanno in un altro blocco.</p>
${table(['Blocco', 'Argomento', 'Codici', 'Schede', 'Pagine', 'A schermo', 'PDF'], blockRows, { caption: 'Blocchi del Faldone stampabile' })}</section>
<section aria-labelledby="st-h-sheets"><h2 id="st-h-sheets">Una scheda alla volta</h2>
<p class="small">Ogni scheda ha la sua pagina e il suo PDF con pagine pari: per aggiornare il raccoglitore si ristampa solo quella e si sostituisce il foglio.</p>
<label class="f" style="max-width:420px">Filtra per codice o titolo<input type="text" id="st-q" data-input="st-filter" autocomplete="off"></label>
<p class="small" id="st-count" aria-live="polite">${plan.sheets.length} schede</p>
<div id="st-sheets">${plan.blocks.filter((b) => b.own.length).map((b) => `<section><h3 class="blockhead"><span class="code">${esc(b.id)}</span>${esc(b.name)}<small>${b.own.length} ${b.own.length === 1 ? 'scheda' : 'schede'}</small></h3><ul class="list">${b.own.map((c) => sheetItem(sheetBy.get(c))).join('')}</ul></section>`).join('')}</div></section>
<section class="card" aria-labelledby="st-h-how"><h2 id="st-h-how">Come si tiene aggiornato il raccoglitore</h2>
<ul><li>In fondo a ogni pagina stampata ci sono codice, revisione e data; le pagine sono numerate dentro la scheda, così sostituirne una non sposta le altre.</li>
<li>Quando un testo cambia, qui cambiano subito la pagina da sfogliare e il PDF di quella scheda: non ci sono più copie da allineare altrove.</li>
<li>Un testo che vale per più codici è stampato una volta sola; l'indice di ogni blocco dice in quale scheda si legge ciascun codice.</li>
<li>Senza JavaScript: <a href="stampa/index.html">indice del Faldone stampabile</a>. I PDF della revisione 4.4 prodotti in passato restano in <a href="${href('documenti/download')}">Download</a> come archivio.</li></ul></section>`;
  return { title: 'Faldone stampabile', html };
}
