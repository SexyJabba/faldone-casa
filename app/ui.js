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
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
  auto: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M12 7l5.5 5.5M12 12l4 4" />',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  atlas: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
  server: '<rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/><path d="M7 7.5h.01M7 16.5h.01M11 7.5h6M11 16.5h6"/>',
  lab: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4M8 10l2 2-2 2M12.5 14h3"/>',
  van: '<path d="M2 16V7a1 1 0 0 1 1-1h10v10M13 9h4.5L22 13v3h-2M2 16h2M9 16h6"/><circle cx="6.5" cy="16.5" r="2"/><circle cx="17.5" cy="16.5" r="2"/>',
  people: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0M16 5.2a3.2 3.2 0 0 1 0 5.6M17.5 14.5A6 6 0 0 1 21 20"/>',
  box: '<path d="M3 8l9-4 9 4v8l-9 4-9-4zM3 8l9 4 9-4M12 12v8"/>',
  service: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  data: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
  network: '<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="2" y="16" width="6" height="5" rx="1"/><rect x="16" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M5 16v-4h14v4"/>',
  rack: '<rect x="5" y="2.5" width="14" height="19" rx="1.5"/><path d="M5 8h14M5 13h14M5 18h14M8 5.3h.01M8 10.5h.01M8 15.5h.01"/>',
  plug: '<path d="M9 2v6M15 2v6M6 8h12v3a6 6 0 0 1-12 0zM12 17v5"/>',
  map: '<circle cx="5" cy="6" r="2.5"/><circle cx="19" cy="7" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M7.4 6.3l9.2.5M6.3 8.2l4.5 7.6M17.8 9.2l-4.5 6.7"/>',
  path: '<circle cx="5" cy="18" r="2.5"/><circle cx="19" cy="6" r="2.5"/><path d="M7.5 18H14a3.5 3.5 0 0 0 0-7h-4a3.5 3.5 0 0 1 0-7h6.5"/>',
  sim: '<path d="M12 3v8M7 5.6a8 8 0 1 0 10 0"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14.5v2.5"/>',
  wifi: '<path d="M2 8.5a15 15 0 0 1 20 0M5.5 12.5a10 10 0 0 1 13 0M9 16.2a5 5 0 0 1 6 0M12 20h.01M3 3l18 18"/>',
  bulb: '<path d="M9 18h6M10 21h4M8 14a6 6 0 1 1 8 0c-.7.7-1 1.5-1 2.5H9c0-1-.3-1.8-1-2.5z"/>',
  file: '<path d="M6 3h9l4 4v14H6zM14 3v5h5"/><circle cx="11.5" cy="14" r="2.5"/><path d="M13.5 16l2 2"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  offline: '<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',
  kit: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M12 11v5M9.5 13.5h5"/>',
};
export const icon = (n, label = '') => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" ${label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"'}>${ICON[n] || ''}</svg>`;

/** Icona dentro un riquadro tinto (tessere, intenti, emergenza). Sempre decorativa: il testo accanto dice tutto. */
export const ic = (n) => `<span class="ic" aria-hidden="true">${icon(n)}</span>`;
export const go = '<span class="go" aria-hidden="true">→</span>';
export const SCOPE_ICON = { 'sala-server': 'server', casa: 'home', laboratorio: 'lab', vito: 'van', terzi: 'people', inventario: 'box' };

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
