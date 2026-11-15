// Postazioni e client: resa grafica dei modelli dichiarati nel Faldone. Funzioni pure (SVG).
// L'esterno è un disegno indicativo del modello. Lo spaccato esiste solo per i modelli di cui il Faldone ha una
// foto dell'interno (OptiPlex 7070 Ultra, HP t520) e ne ricalca la disposizione; le etichette vengono dai dati.
import { rackDefs, KIT } from './rackviz.js';
const { R, screw, led, fanBehind, esc, clip } = KIT;

/** Dal modello dichiarato al tipo di disegno. null = nessun disegno specifico. */
export function deviceKind(e) {
  const p = String(e?.hardware?.platform?.value || '');
  if (/OptiPlex 7070 Ultra/i.test(p)) return 'ultra';
  if (/HP t520/i.test(p)) return 't520';
  if (/Wyse 3030/i.test(p)) return 'wyse';
  if (/MacBook/i.test(p)) return 'macbook';
  if (/Aspire|Acer/i.test(p)) return 'laptop';
  if (/Microtech|EBL14/i.test(p)) return 'panel';
  return null;
}
/** I modelli di cui esiste una foto dell'interno nel Faldone: [tipo → codice d'inventario della foto]. */
export const CUTAWAY_SOURCE = { ultra: 'INV-079', t520: 'INV-078' };
export const hasCutaway = (kind) => kind in CUTAWAY_SOURCE;
export const KIND_LABEL = { ultra: 'Mini PC modulare', t520: 'Thin client', wyse: 'Thin client', laptop: 'Portatile', macbook: 'Portatile', panel: 'Pannello con display', null: 'Apparato' };

const W = 230, H = 250;
const floor = (p, cx, w) => `<ellipse cx="${cx}" cy="${H - 26}" rx="${w}" ry="9" fill="url(#${p}-fl)"/>`;
const plate = (p, id, sub) => `<g>${R(W / 2 - 78, H - 20, 156, 18, `rx="1.5" fill="url(#${p}-plate)" stroke="#59626b" stroke-width=".5"`)}<text x="${W / 2 - 70}" y="${H - 7}" class="rk-id">${esc(id)}</text><text x="${W / 2 - 70 + String(id).length * 7.6 + 6}" y="${H - 7.5}" class="rk-sub">${esc(clip(sub, Math.max(4, Math.floor((140 - String(id).length * 7.6) / 3.8))))}</text></g>`;
const pw = (power) => (power === 'on' ? 'on' : power === 'stby' ? 'stby' : 'off');

const EXT = {
  // Dell OptiPlex 7070 Ultra: modulo sottile, in piedi
  ultra(p, s) {
    const x = 84, y = 34, w = 62, h = 178;
    return `${floor(p, W / 2, 62)}${R(x - 14, H - 34, w + 28, 8, `rx="2" fill="url(#${p}-ear)"`)}
${R(x, y, w, h, `rx="5" fill="url(#${p}-bz)" stroke="#000" stroke-width="1"`)}${R(x + 1, y + 1, w - 2, 1.2, 'fill="#fff" opacity=".2"')}
${R(x + 8, y + 12, w - 16, 54, `rx="2" fill="url(#${p}-mesh)" opacity=".85"`)}${R(x + 8, y + 76, w - 16, 60, `rx="2" fill="url(#${p}-slit)" opacity=".6"`)}
${R(x + 12, y + h - 34, 14, 5, 'rx="2.5" fill="#06080a" stroke="#7b858e" stroke-width=".5"')}${R(x + 30, y + h - 35, 12, 6, 'rx=".8" fill="#1d6fb8" stroke="#06080a" stroke-width=".4"')}<circle cx="${x + 51}" cy="${y + h - 32}" r="2.6" fill="#06080a" stroke="#7b858e" stroke-width=".5"/>
<circle cx="${x + w / 2}" cy="${y + h - 14}" r="5" fill="#15181c" stroke="${s.power === 'on' ? '#7dd3a0' : s.power === 'stby' ? '#c98a2b' : '#3a424a'}" stroke-width="1.2"${s.power === 'off' ? '' : ` filter="url(#${p}-glow)"`}/>
${R(x, y, w, h, `rx="5" fill="url(#${p}-gloss)"`)}`;
  },
  // HP t520: thin client in piedi sulla base
  t520(p, s) {
    const x = 78, y = 44, w = 74, h = 166;
    return `${floor(p, W / 2, 70)}${R(x - 12, H - 36, w + 24, 10, `rx="3" fill="url(#${p}-ear)"`)}
${R(x, y, w, h, `rx="7" fill="url(#${p}-bz)" stroke="#000" stroke-width="1"`)}${R(x + 6, y + 8, w - 12, h - 16, `rx="4" fill="#0d0f12" stroke="#2b3238" stroke-width=".6"`)}
${R(x + 14, y + 20, w - 28, 70, `rx="2" fill="url(#${p}-slit)" opacity=".55"`)}
<circle cx="${x + w / 2}" cy="${y + 108}" r="6" fill="#15181c" stroke="${s.power === 'on' ? '#7dd3a0' : s.power === 'stby' ? '#c98a2b' : '#3a424a'}" stroke-width="1.2"${s.power === 'off' ? '' : ` filter="url(#${p}-glow)"`}/>
${R(x + 18, y + 124, 12, 5.5, 'rx=".8" fill="#e9edf0" stroke="#06080a" stroke-width=".4"')}${R(x + 18, y + 134, 12, 5.5, 'rx=".8" fill="#e9edf0" stroke="#06080a" stroke-width=".4"')}<circle cx="${x + 46}" cy="${y + 127}" r="2.6" fill="#06080a" stroke="#7b858e" stroke-width=".5"/><circle cx="${x + 46}" cy="${y + 137}" r="2.6" fill="#06080a" stroke="#7b858e" stroke-width=".5"/>
${R(x, y, w, h, `rx="7" fill="url(#${p}-gloss)"`)}`;
  },
  // Dell Wyse 3030: scatola piccola, in piedi
  wyse(p, s) {
    const x = 86, y = 70, w = 58, h = 140;
    return `${floor(p, W / 2, 56)}${R(x - 10, H - 36, w + 20, 9, `rx="3" fill="url(#${p}-ear)"`)}
${R(x, y, w, h, `rx="4" fill="url(#${p}-bz)" stroke="#000" stroke-width="1"`)}${R(x + 7, y + 12, w - 14, 60, `rx="2" fill="url(#${p}-mesh)" opacity=".8"`)}
${led(p, x + w / 2, y + 88, pw(s.power), 2.4)}${R(x + 12, y + 102, 12, 5.5, 'rx=".8" fill="#1d6fb8" stroke="#06080a" stroke-width=".4"')}${R(x + 12, y + 112, 12, 5.5, 'rx=".8" fill="#e9edf0" stroke="#06080a" stroke-width=".4"')}<circle cx="${x + 40}" cy="${y + 110}" r="2.6" fill="#06080a" stroke="#7b858e" stroke-width=".5"/>
${R(x, y, w, h, `rx="4" fill="url(#${p}-gloss)"`)}`;
  },
  laptop(p, s, { mac = false } = {}) {
    const sx = 34, sy = 40, sw = 162, sh = 108, body = mac ? `url(#${p}-steel)` : `url(#${p}-bz)`;
    return `${floor(p, W / 2, 96)}
${R(sx, sy, sw, sh, `rx="6" fill="${body}" stroke="#000" stroke-width=".8"`)}${R(sx + 5, sy + 5, sw - 10, sh - 12, `rx="2" fill="#05070a"`)}
${R(sx + 5, sy + 5, sw - 10, sh - 12, `rx="2" fill="${s.power === 'off' ? '#0a0d10' : `url(#${p}-screen)`}"`)}${mac ? R(W / 2 - 12, sy + 5, 24, 6, 'rx="2" fill="#05070a"') : `<circle cx="${W / 2}" cy="${sy + 3}" r="1" fill="#2b3238"/>`}
${R(sx + 5, sy + 5, sw - 10, sh - 12, `rx="2" fill="url(#${p}-gloss)"`)}
<path d="M${sx - 14} ${sy + sh + 4}H${sx + sw + 14}L${sx + sw + 4} ${sy + sh + 54}H${sx - 4}z" fill="${body}" stroke="#000" stroke-width=".8"/>
<path d="M${sx - 2} ${sy + sh + 9}H${sx + sw + 2}L${sx + sw - 2} ${sy + sh + 34}H${sx + 2}z" fill="${mac ? '#1b1f24' : '#0b0d0f'}" opacity=".92"/>
${Array.from({ length: 5 }, (_, r) => Array.from({ length: 14 }, (_, c) => R(sx + 3 + c * 11.2 + r * 0.4, sy + sh + 11 + r * 4.6, 9.2, 3.2, `rx=".6" fill="${mac ? '#2b3138' : '#22272d'}"`)).join('')).join('')}
${R(W / 2 - 24, sy + sh + 37, 48, 13, `rx="2" fill="${mac ? '#c9d0d6' : '#15181c'}" stroke="#000" stroke-width=".4" opacity=".9"`)}
${R(sx - 4, sy + sh + 54, sw + 8, 4, `rx="2" fill="${mac ? '#8b959e' : '#0a0c0e'}"`)}${led(p, sx + 6, sy + sh + 50, pw(s.power), 1.4)}`;
  },
  macbook(p, s) { return EXT.laptop(p, s, { mac: true }); },
  // pannello con display integrato: schermo acceso senza contenuti
  panel(p, s) {
    const x = 32, y = 52, w = 166, h = 108;
    return `${floor(p, W / 2, 70)}<path d="M${W / 2 - 16} ${y + h}L${W / 2 - 30} ${H - 34}H${W / 2 + 30}L${W / 2 + 16} ${y + h}z" fill="url(#${p}-ear)"/>${R(W / 2 - 44, H - 36, 88, 7, `rx="2" fill="url(#${p}-ear)"`)}
${R(x, y, w, h, `rx="5" fill="url(#${p}-bz)" stroke="#000" stroke-width=".8"`)}${R(x + 6, y + 6, w - 12, h - 12, `rx="2" fill="${s.power === 'off' ? '#0a0d10' : `url(#${p}-screen)`}"`)}
${s.power === 'off' ? '' : [0, 1, 2].map((c) => [0, 1].map((r) => R(x + 16 + c * 46, y + 18 + r * 38, 40, 30, 'rx="3" fill="#fff" opacity=".10"')).join('')).join('')}
${R(x + 6, y + 6, w - 12, h - 12, `rx="2" fill="url(#${p}-gloss)"`)}${led(p, x + w - 10, y + h - 3, pw(s.power), 1.2)}`;
  },
  generic(p, s) {
    return `${floor(p, W / 2, 60)}${R(70, 80, 90, 130, `rx="5" fill="url(#${p}-bz)" stroke="#000" stroke-width="1"`)}${R(80, 92, 70, 60, `rx="2" fill="url(#${p}-slit)" opacity=".6"`)}${led(p, 115, 170, pw(s.power), 2.4)}`;
  },
};
const SCREEN = (p) => `<linearGradient id="${p}-screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1c4a7c"/><stop offset=".55" stop-color="#0f2b4b"/><stop offset="1" stop-color="#143a55"/></linearGradient>`;

/** Esterno di un apparato in un riquadro 230×250. s: {id, sub, kind, power}. */
export function deviceSvg(s, { prefix = 'dv', defs = true, w = W } = {}) {
  const p = prefix, body = (EXT[s.kind] || EXT.generic)(p, s);
  return `<svg class="dv-svg" viewBox="0 0 ${W} ${H}" width="${w}" height="${(w * H) / W}" aria-hidden="true">${defs ? rackDefs(p).replace('</defs>', SCREEN(p) + '</defs>') : ''}${body}${plate(p, s.id, s.sub || '')}</svg>`;
}

// ---------------------------------------------------------------------------
// spaccati: solo per i modelli con una foto dell'interno nel Faldone
// ---------------------------------------------------------------------------
const chip = (x, y, w, h, t = '') => `${R(x, y, w, h, 'rx="1.5" fill="#101418" stroke="#39424a" stroke-width=".7"')}${t ? `<text x="${x + w / 2}" y="${y + h / 2 + 3}" text-anchor="middle" class="rk-tiny" style="fill:#aeb9c2">${esc(t)}</text>` : ''}`;
const caps = (pts) => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#2b3138" stroke="#9aa4ad" stroke-width="1"/><path d="M${x - 3} ${y}h6" stroke="#9aa4ad" stroke-width=".8"/>`).join('');
const INT = {
  // OptiPlex 7070 Ultra, coperchio tolto: scheda blu, due SO-DIMM, M.2, ventola radiale e alette in fondo
  ultra(p, f, mark) {
    const x = 250, y = 26, w = 220, h = 418, o = [];
    o.push(`${R(x - 8, y - 6, w + 16, h + 12, `rx="12" fill="url(#${p}-bz)" stroke="#000" stroke-width="1.5"`)}${R(x, y, w, h, 'rx="6" fill="#0d3a66" stroke="#06223d" stroke-width="1"')}${R(x, y, w, h, `rx="6" fill="url(#${p}-trace)" opacity=".8"`)}`);
    o.push(`${R(x + 20, y + 6, 46, 14, 'rx="2" fill="#9aa4ad"')}${R(x + 80, y + 6, 30, 14, 'rx="2" fill="#9aa4ad"')}${R(x + 124, y + 6, 22, 14, 'rx="6" fill="#9aa4ad"')}${[[x + 12, y + 30], [x + w - 12, y + 30], [x + 12, y + h - 140], [x + w - 12, y + h - 140]].map(([a, b]) => screw(p, a, b, 3.2)).join('')}`);
    o.push(`${R(x + 22, y + 44, 66, 52, 'rx="2" fill="#e9edf0" stroke="#59626b" stroke-width=".8"')}${chip(x + 30, y + 54, 50, 30)}`); o.push(mark({ cat: 'wifi', label: 'Scheda di rete senza fili (alloggiamento M.2)', sub: 'non censita nel Faldone' }, x + 22, y + 44));
    o.push(`${R(x + 110, y + 40, 84, 26, 'rx="2" fill="#101418" stroke="#39424a" stroke-width=".8"')}${R(x + 116, y + 45, 46, 16, 'fill="#e9edf0"')}${R(x + 188, y + 43, 5, 20, `fill="url(#${p}-gold)"`)}`); o.push(mark({ cat: 'ssd', label: 'Unità di sistema M.2', sub: f.disk || 'capacità non indicata' }, x + 196, y + 40));
    o.push([0, 1].map((k) => `${R(x + 44, y + 126 + k * 74, 132, 62, 'rx="2" fill="#0b0d0f" stroke="#2b3238" stroke-width="1"')}${R(x + 50, y + 132 + k * 74, 120, 50, `rx="1" fill="url(#${p}-bz)"`)}<text x="${x + 110}" y="${y + 162 + k * 74}" text-anchor="middle" class="rk-lbl">DDR4</text>${R(x + 46, y + 184 + k * 74, 128, 3, `fill="url(#${p}-gold)"`)}`).join(''));
    o.push(mark({ cat: 'ram', label: 'Memoria SO-DIMM (due alloggiamenti)', sub: f.ram || 'non indicata' }, x + 44, y + 126));
    o.push(`<circle cx="${x + 78}" cy="${y + h - 78}" r="52" fill="#e9edf0" stroke="#59626b" stroke-width="1"/>${fanBehind(p, x + 78, y + h - 78, 42)}${R(x + 20, y + h - 30, 150, 24, `fill="url(#${p}-fins)" stroke="#4b545c" stroke-width=".8"`)}<path d="M${x + 132} ${y + h - 110}C${x + 170} ${y + h - 130} ${x + 180} ${y + 300} ${x + 150} ${y + 286}" fill="none" stroke="#b87333" stroke-width="7" stroke-linecap="round"/>`);
    o.push(mark({ cat: 'cpu', label: 'Processore sotto il dissipatore, ventola radiale e alette', sub: f.cpu || 'non indicato' }, x + 140, y + h - 120));
    return o;
  },
  // HP t520, coperchio tolto: scheda verde, dissipatore passivo a destra, SO-DIMM, M.2, porte sul retro in basso
  t520(p, f, mark) {
    const x = 120, y = 30, w = 480, h = 400, o = [];
    o.push(`${R(x - 10, y - 8, w + 20, h + 16, `rx="6" fill="url(#${p}-steel)" stroke="#59626b" stroke-width="1.5"`)}${R(x, y, w, h, `rx="3" fill="url(#${p}-pcb)" stroke="#06140f" stroke-width="1"`)}${R(x, y, w, h, `fill="url(#${p}-trace)"`)}`);
    o.push(`${[[x + 14, y + 14], [x + w - 14, y + 14], [x + 14, y + h - 60], [x + w - 14, y + h - 60]].map(([a, b]) => screw(p, a, b, 4)).join('')}${caps([[x + 70, y + 96], [x + 96, y + 120], [x + 62, y + 150], [x + 120, y + 90], [x + 300, y + 250]])}`);
    o.push(`${R(x + 410, y + 40, 60, 300, `rx="2" fill="url(#${p}-brush)" stroke="#000" stroke-width="1"`)}`); o.push(mark({ cat: 'heat', label: 'Dissipatore passivo: nessuna ventola', sub: 'raffreddamento senza parti in movimento' }, x + 410, y + 40));
    o.push(`<path d="M${x + 250} ${y + 70}l28 22l28 -22l22 26l-24 26l24 26l-22 26l-28 -22l-28 22l-22 -26l24 -26l-24 -26z" fill="#c9a074" stroke="#7a5a35" stroke-width="1.2"/>${chip(x + 256, y + 100, 44, 44)}`); o.push(mark({ cat: 'cpu', label: 'Processore con staffa di ritenzione', sub: f.cpu || 'non indicato' }, x + 250, y + 70));
    o.push(`${R(x + 220, y + 190, 180, 44, 'rx="2" fill="#1a4f9c" stroke="#0a2247" stroke-width="1"')}${[0, 1, 2, 3].map((k) => chip(x + 232 + k * 40, y + 198, 30, 22)).join('')}${R(x + 222, y + 230, 176, 4, `fill="url(#${p}-gold)"`)}`); o.push(mark({ cat: 'ram', label: 'Memoria SO-DIMM', sub: f.ram || 'non indicata' }, x + 220, y + 190));
    o.push(`${R(x + 50, y + 80, 34, 96, 'rx="2" fill="#f4f6f7" stroke="#59626b" stroke-width=".8"')}${R(x + 56, y + 88, 22, 60, 'fill="#dfe4e7"')}${R(x + 50, y + 172, 34, 4, `fill="url(#${p}-gold)"`)}`); o.push(mark({ cat: 'ssd', label: 'Unità di sistema M.2', sub: f.disk || 'capacità non indicata' }, x + 50, y + 80));
    o.push(`<circle cx="${x + 70}" cy="${y + 300}" r="22" fill="url(#${p}-steel)" stroke="#59626b" stroke-width="1"/><text x="${x + 70}" y="${y + 304}" text-anchor="middle" class="rk-tiny" style="fill:#3a444d">BATTERIA</text>`);
    o.push(`${R(x + 60, y + h - 44, 22, 44, 'rx="2" fill="#9aa4ad"')}${[0, 1].map((k) => R(x + 96 + k * 44, y + h - 40, 34, 40, 'rx="2" fill="#c3cad0" stroke="#59626b" stroke-width=".8"')).join('')}${R(x + 190, y + h - 34, 60, 34, 'rx="3" fill="#2d5aa8" stroke="#0a2247" stroke-width=".8"')}${[0, 1].map((k) => R(x + 268 + k * 58, y + h - 36, 46, 36, 'rx="2" fill="#e9edf0" stroke="#59626b" stroke-width=".8"')).join('')}${R(x + 396, y + h - 44, 44, 44, 'rx="2" fill="#c3cad0" stroke="#59626b" stroke-width=".8"')}`);
    o.push(mark({ cat: 'io', label: 'Porte sul retro: alimentazione, USB, VGA, DisplayPort, rete', sub: 'come nella foto di riferimento' }, x + 190, y + h - 34));
    return o;
  },
};

/**
 * Spaccato di un modello. facts: {cpu, ram, disk} già in testo, dal Faldone. Restituisce {svg, marks} oppure null
 * se del modello non esiste una foto dell'interno.
 */
export function deviceInterior(kind, title, facts = {}, { prefix = 'di' } = {}) {
  if (!INT[kind]) return null;
  const p = prefix, marks = [];
  const mark = (part, x, y) => { const n = marks.push({ n: marks.length + 1, part }); return `<g class="ri-mark"><circle cx="${x}" cy="${y}" r="10"/><text x="${x}" y="${y + 3.6}" text-anchor="middle">${n}</text></g>`; };
  const body = INT[kind](p, facts, mark).join('');
  return { svg: `<svg class="ri-svg" viewBox="0 0 720 470" width="720" height="470" role="img" aria-label="${esc(`Spaccato di ${title}: ${marks.length} parti indicate`)}">${rackDefs(p)}${body}</svg>`, marks };
}
