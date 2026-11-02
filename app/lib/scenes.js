// Rendering delle scene del percorso «Il progetto in cinque minuti».
// Modulo puro: lo usano il browser (presentazione, lettura, stampa) e la build (pagina statica).
// Tutti i testi vengono da content/presentazione/scene.json.

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const countWords = (t) => String(t).split(/\s+/).filter((x) => /[\p{L}\p{N}]/u.test(x)).length;
export function wordCount(src, meta) {
  const per = src.scenes.map((s) => ({ id: s.id, words: countWords(s.title) + s.body.reduce((a, b) => a + countWords(b), 0) + countWords(s.caption) }));
  const status = countWords(statusLine(src, meta));
  const visual = src.scenes.reduce((a, s) => a + countWords(visualText(s.visual)), 0);
  return { per, status, main: per.reduce((a, b) => a + b.words, 0) + status, visual };
}
/** Testo contenuto nei visual (contato a parte: si legge osservando lo schema). */
export function visualText(v) {
  const parts = [v.center, v.event, v.note, v.link, ...(v.links || [])];
  for (const k of ['spokes', 'items', 'steps', 'outcomes', 'groups']) for (const x of v[k] || []) parts.push(typeof x === 'string' ? x : [x.label, x.sub, ...(x.list || []), ...(x.items || []), x.tag].join(' '));
  for (const e of v.edges || []) parts.push(e[2]);
  return parts.filter(Boolean).join(' ');
}
const fmtDate = (iso) => new Date(iso + 'T12:00:00Z').toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export function statusLine(src, meta) {
  return src.status.replace('{revision}', meta.revision).replace('{documentDate}', fmtDate(meta.documentDate)).replace('{implementationStart}', fmtDate(meta.implementationStart));
}

// ---------- visual ----------
function hub(v, id) {
  const n = v.spokes.length, W = 640, H = n > 3 ? 400 : 340, cx = W / 2, cy = H / 2 + (n > 3 ? 4 : 10);
  const R = n > 3 ? 150 : 132, bw = n > 3 ? 168 : 190, bh = 56;
  const pts = n === 3 ? [{ ...v.spokes[0], x: cx, y: cy - 120 }, { ...v.spokes[1], x: cx + 220, y: cy + 112 }, { ...v.spokes[2], x: cx - 220, y: cy + 112 }]
    : v.spokes.map((s, i) => { const a = (i / n) * Math.PI * 2 - Math.PI / 2; return { ...s, x: cx + R * 1.45 * Math.cos(a), y: cy + R * Math.sin(a) }; });
  const clamp = (x, w) => Math.max(w / 2 + 4, Math.min(W - w / 2 - 4, x));
  return `<svg class="pv-svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${id}-t"><title id="${id}-t">${esc(v.center)}: ${v.spokes.map((s) => esc(s.label)).join(', ')}</title>
${pts.map((p) => `<line x1="${cx}" y1="${cy}" x2="${clamp(p.x, bw)}" y2="${p.y}" class="pv-line"/>`).join('')}
<rect x="${cx - 110}" y="${cy - 34}" width="220" height="68" rx="6" class="pv-core"/><text x="${cx}" y="${cy + 6}" text-anchor="middle" class="pv-core-t">${esc(v.center)}</text>
${pts.map((p) => { const x = clamp(p.x, bw); return `<g><rect x="${x - bw / 2}" y="${p.y - bh / 2}" width="${bw}" height="${bh}" rx="4" class="pv-box"/><text x="${x}" y="${p.y - 4}" text-anchor="middle" class="pv-t">${esc(p.label)}</text><text x="${x}" y="${p.y + 16}" text-anchor="middle" class="pv-s">${esc(p.sub)}</text></g>`; }).join('')}</svg>`;
}
function places(v, id) {
  const pos = { casa: [100, 58], lab: [100, 262], sala: [380, 160], vito: [660, 58] };
  const W = 760, H = 320, bw = 176, bh = 62;
  const label = (l, x, y) => { const lines = String(l).split(/,\s*/); return `<text x="${x}" y="${y - (lines.length - 1) * 8}" text-anchor="middle" class="pv-edge">${lines.map((t, i) => `<tspan x="${x}" dy="${i ? 16 : 0}">${esc(t)}${i < lines.length - 1 ? ',' : ''}</tspan>`).join('')}</text>`; };
  return `<svg class="pv-svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${id}-t"><title id="${id}-t">${v.items.map((i) => esc(i.label)).join(', ')}</title>
${v.edges.map(([a, b, l]) => { const [x1, y1] = pos[a], [x2, y2] = pos[b]; const dash = b === 'vito' ? ' pv-dash' : ''; return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="pv-line${dash}"/>${label(l, (x1 + x2) / 2, (y1 + y2) / 2 + 4)}`; }).join('')}
${v.items.map((i) => { const [x, y] = pos[i.id]; return `<g><rect x="${x - bw / 2}" y="${y - bh / 2}" width="${bw}" height="${bh}" rx="4" class="${i.id === 'sala' ? 'pv-core' : 'pv-box'}"/><text x="${x}" y="${y - 3}" text-anchor="middle" class="${i.id === 'sala' ? 'pv-core-t' : 'pv-t'}">${esc(i.label)}</text><text x="${x}" y="${y + 18}" text-anchor="middle" class="${i.id === 'sala' ? 'pv-core-s' : 'pv-s'}">${esc(i.sub)}</text></g>`; }).join('')}</svg>
${v.note ? `<p class="pv-note">${esc(v.note)}</p>` : ''}`;
}
const card = (x) => `<div class="pv-card"><strong>${esc(x.label)}</strong>${x.sub ? `<span>${esc(x.sub)}</span>` : ''}${x.list ? `<ul>${x.list.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}${x.tag ? `<em class="pv-tag">${esc(x.tag)}</em>` : ''}</div>`;

export function renderVisual(v, ctx = {}) {
  const id = ctx.id || 'v';
  switch (v.type) {
    case 'hub': return `<div class="pv-wide">${hub(v, id)}</div><div class="pv-narrow"><p class="pv-hubcore">${esc(v.center)}</p><ul class="pv-hublist">${v.spokes.map((x) => `<li><strong>${esc(x.label)}</strong> <span>${esc(x.sub)}</span></li>`).join('')}</ul></div>`;
    case 'places': return `<div class="pv-wide">${places(v, id)}</div><div class="pv-narrow"><ul class="pv-hublist">${v.items.map((x) => `<li><strong>${esc(x.label)}</strong> <span>${esc(x.sub)}</span>${(v.edges.find((e) => e[1] === x.id) ? `<em>collegamento con la sala server: ${esc(v.edges.find((e) => e[1] === x.id)[2])}</em>` : '')}</li>`).join('')}</ul>${v.note ? `<p class="pv-note">${esc(v.note)}</p>` : ''}</div>`;
    case 'columns': return `<div class="pv-cols">${v.items.map(card).join('')}</div>`;
    case 'grid': return `<div class="pv-grid">${v.items.map(card).join('')}</div>`;
    case 'sequence': return `<ol class="pv-seq">${v.steps.map((s, i) => `<li>${card(s)}${v.links?.[i] ? `<span class="pv-arrow" aria-hidden="true">${esc(v.links[i])} →</span>` : ''}</li>`).join('')}</ol>`;
    case 'flow': return `<ol class="pv-flow">${v.steps.map((s) => `<li>${card(s)}</li>`).join('')}</ol>`;
    case 'layers': return `<div class="pv-layers">${v.groups.map((g, i) => `<section class="pv-layer pv-layer-${i}"><h3>${esc(g.label)}</h3><ul>${g.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></section>`).join('')}</div>${v.link ? `<p class="pv-note">${esc(v.link)}</p>` : ''}`;
    case 'scenario': return `<div class="pv-scenario"><div class="pv-event">${esc(v.event)}</div><div class="pv-outs">${v.outcomes.map((o) => `<div class="pv-out pv-${o.tone}"><strong>${esc(o.label)}</strong><span>${esc(o.sub)}</span></div>`).join('')}</div></div>`;
    case 'timeline': return `<ol class="pv-time">${v.steps.map((s) => `<li><strong>${esc(s.label)}</strong><span>${esc(s.sub)}</span></li>`).join('')}</ol>${v.footer === 'tests' ? `<p class="pv-note">Collaudi registrati nel Faldone: ${ctx.tests ? ctx.tests : 'nessuno, per ora'}.</p>` : ''}`;
    default: return '';
  }
}

/** Corpo della scena (titolo, testo, visual, didascalia). Senza controlli: li aggiunge chi la ospita. */
export function renderScene(s, i, total, ctx = {}) {
  const hid = `${ctx.prefix || 'sc'}-${s.id}`;
  return `<p class="pv-kicker"><span>${i + 1} di ${total}</span> · ${esc(s.question)}</p>
<h${ctx.level || 1} class="pv-title" id="${hid}">${esc(s.title)}</h${ctx.level || 1}>
<div class="pv-body">${s.body.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
<figure class="pv-figure" aria-describedby="${hid}-alt">${renderVisual(s.visual, { id: `${hid}-v`, tests: ctx.tests })}
<figcaption>${esc(s.caption)}</figcaption><p class="vh" id="${hid}-alt">${esc(s.alt)}</p></figure>`;
}
