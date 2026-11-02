// Helper di interfaccia: escape, frammenti comuni, stati con dimensioni distinte.
import { DECISION, REALIZATION, EVIDENCE, KINDS, MECHANISM } from './lib/model.js';
import { ST_LABEL } from './lib/sim.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const attr = esc;
export const href = (route) => '#' + encodeURI(String(route));

export const ICON = {
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  explore: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  fix: '<path d="M14 6a4 4 0 0 0 5 5l-9 9a2.1 2.1 0 0 1-3-3l9-9a4 4 0 0 0-2-2z"/>',
  build: '<path d="M4 20h16M6 20V9l6-5 6 5v11M10 20v-6h4v6"/>',
  docs: '<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  theme: '<path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z"/>',
};
export const icon = (n, label = '') => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" ${label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"'}>${ICON[n] || ''}</svg>`;

export function phead({ eyebrow = '', title, lead = '', actions = '', extra = '' }) {
  return `<header class="phead">${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<h1 id="ptitle">${esc(title)}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}${extra}${actions ? `<div class="actions">${actions}</div>` : ''}</header>`;
}
export function ctxbar(crumbs, back) {
  return `<nav class="ctxbar" aria-label="Dove sei"><ol>${crumbs.map(([label, r]) => `<li>${r !== undefined && r !== null ? `<a href="${href(r)}">${esc(label)}</a>` : `<span aria-current="page">${esc(label)}</span>`}</li>`).join('')}</ol>${back ? `<a class="back" href="${href(back.route)}">← ${esc(back.label)}</a>` : ''}</nav>`;
}

export function dims(status, { compact = false } = {}) {
  if (!status) return '';
  const d = status.decision, r = status.realization;
  return `<div class="dims" aria-label="Stato">${d ? `<span class="dim d-${d}"><b>Decisione</b>${esc(DECISION[d])}</span>` : ''}${r ? `<span class="dim"><b>Realizzazione</b>${esc(REALIZATION[r])}</span>` : ''}${compact ? '' : `<span class="dim" title="Nessun connettore di osservazione collegato"><b>Osservato</b>non rilevato</span>`}</div>`;
}
export const st = (s, extra = '') => `<span class="st st-${s}">${esc(ST_LABEL[s] || s)}${extra ? ' · ' + esc(extra) : ''}</span>`;
export const badge = (s, label) => `<span class="st st-${s}">${esc(label)}</span>`;
export const ev = (k) => `<span class="ev ev-${k}" title="Natura del valore">${esc(EVIDENCE[k] || k)}</span>`;
export const kind = (k) => esc(KINDS[k] || k);
export const mech = (m) => esc(MECHANISM[m] || m);

export function factValue(f) {
  if (!f) return '<span class="muted">n.d.</span>';
  if (f.value === null || f.value === undefined) return '<span class="muted">non noto</span>';
  if (f.value === true) return 'sì';
  if (f.value === false) return 'no';
  const v = typeof f.value === 'number' ? f.value.toLocaleString('it-IT') : f.value;
  return `${esc(v)}${f.unit ? ' ' + esc(f.unit) : ''}`;
}
export const srcLinks = (ids = []) => ids.map((s) => `<a class="code" href="${href(s)}">${esc(s)}</a>`).join(' ');

export function table(headers, rows, { caption = '' } = {}) {
  return `<div class="tablewrap" tabindex="0" role="region" aria-label="${esc(caption || headers.join(', '))}"><table>${caption ? `<caption class="vh">${esc(caption)}</caption>` : ''}<thead><tr>${headers.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`)).join('')}</tr>`).join('')}</tbody></table></div>`;
}
export const segments = (segs) => segs.map((s) => (s.hit ? `<mark>${esc(s.t)}</mark>` : esc(s.t))).join('');
export const fmt = (n, d = 0) => (n === null || n === undefined || Number.isNaN(n) ? 'n.d.' : Number(n).toLocaleString('it-IT', { minimumFractionDigits: d, maximumFractionDigits: d }));
