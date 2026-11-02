import { esc } from '../ui.js';
// Il valore rimane leggibile anche senza colore o CSS. Nessuna misura inferita.
export function bars(title, rows, unit = '') {
  const valid = rows.filter(r => Number.isFinite(r.value) && r.value >= 0);
  const max = Math.max(1, ...valid.map(r => r.value));
  return `<figure class="card chart"><figcaption><strong>${esc(title)}</strong></figcaption>${rows.map(r => `<div class="chart-row"><span>${esc(r.label)}</span><span class="chart-track" aria-hidden="true"><span style="width:${Number.isFinite(r.value) && r.value >= 0 ? 100*r.value/max : 0}%"></span></span><span>${Number.isFinite(r.value) && r.value >= 0 ? esc(r.value.toLocaleString('it-IT',{maximumFractionDigits:1})) + ' ' + esc(unit) : 'n.d.'}</span></div>`).join('')}</figure>`;
}
