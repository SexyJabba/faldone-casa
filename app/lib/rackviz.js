// Rack: resa grafica realistica in SVG. Funzioni pure (stringhe), nessun DOM.
// Si disegna ciò che dicono i dati: l'ordine dei pezzi, il tipo di frontale, le parti registrate in inventario.
// Dove un dato manca non compare un numero finto: i display restano spenti, le quantità non indicate non si contano.
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clip = (s, n) => { s = String(s ?? ''); return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s; };
const R = (x, y, w, h, a = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${a}/>`;

export const GEO = { U: 22, W: 300, RAIL: 14, CAP: 12, GAP: 74, PADX: 58, TOP: 50, BOTTOM: 46 };

/** Coordinate di una disposizione: usate dal disegno e dal trascinamento. */
export function rackGeometry(columns, { extraTop = 0, side = 0 } = {}) {
  const g = { ...GEO, PADX: GEO.PADX + side }, maxU = Math.max(...columns.map((c) => c.u), 1);
  const colW = g.W + 2 * g.RAIL;
  const top = g.TOP + extraTop;
  const floor = top + g.CAP + maxU * g.U + g.CAP;
  const cols = columns.map((c, i) => ({ ...c, x: g.PADX + i * (colW + g.GAP), innerX: g.PADX + i * (colW + g.GAP) + g.RAIL, y: floor - g.CAP - c.u * g.U - g.CAP, innerBottom: floor - g.CAP }));
  return { ...g, colW, cols, floor, width: g.PADX + columns.length * colW + (columns.length - 1) * g.GAP + 30 + side, height: floor + g.BOTTOM, yOf: (col, from, u) => cols.find((c) => c.id === col).innerBottom - (from - 1 + u) * g.U };
}
/** Dal punto (in coordinate del disegno) alla colonna e all'unità più vicine: {col, u} oppure null. */
export function hitTest(geo, x, y) {
  const c = geo.cols.find((k) => x >= k.x - geo.GAP / 2 && x < k.x + geo.colW + geo.GAP / 2);
  if (!c) return null;
  return { col: c.id, u: Math.round((c.innerBottom - y) / geo.U) + 1 };
}

// ---------------------------------------------------------------------------
// materiali
// ---------------------------------------------------------------------------
export function rackDefs(p = 'rk') {
  return `<defs>
<linearGradient id="${p}-bz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4149"/><stop offset=".06" stop-color="#262b31"/><stop offset=".5" stop-color="#1a1e23"/><stop offset=".94" stop-color="#121519"/><stop offset="1" stop-color="#0a0c0e"/></linearGradient>
<linearGradient id="${p}-ear" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4a525b"/><stop offset=".5" stop-color="#2c3238"/><stop offset="1" stop-color="#1b1f24"/></linearGradient>
<linearGradient id="${p}-rail" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1b1f23"/><stop offset=".35" stop-color="#5a646e"/><stop offset=".65" stop-color="#39414a"/><stop offset="1" stop-color="#15181c"/></linearGradient>
<linearGradient id="${p}-cap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#59636d"/><stop offset=".3" stop-color="#2b3138"/><stop offset="1" stop-color="#0f1215"/></linearGradient>
<linearGradient id="${p}-steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef1f3"/><stop offset=".5" stop-color="#b9c1c8"/><stop offset="1" stop-color="#8b959e"/></linearGradient>
<linearGradient id="${p}-plate" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f6f7"/><stop offset=".5" stop-color="#c3cad0"/><stop offset="1" stop-color="#e6eaed"/></linearGradient>
<linearGradient id="${p}-white" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbfcfc"/><stop offset=".6" stop-color="#dfe4e7"/><stop offset="1" stop-color="#b9c1c7"/></linearGradient>
<linearGradient id="${p}-gloss" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".35" stop-color="#fff" stop-opacity=".03"/><stop offset=".36" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="${p}-back" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#090b0d"/><stop offset="1" stop-color="#14181c"/></linearGradient>
<linearGradient id="${p}-refl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fc6ee" stop-opacity=".16"/><stop offset="1" stop-color="#9fc6ee" stop-opacity="0"/></linearGradient>
<linearGradient id="${p}-sw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b4a5c"/><stop offset=".1" stop-color="#24303d"/><stop offset="1" stop-color="#141b23"/></linearGradient>
<linearGradient id="${p}-pcb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#143a2f"/><stop offset="1" stop-color="#0b2019"/></linearGradient>
<linearGradient id="${p}-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3d98b"/><stop offset="1" stop-color="#a8842c"/></linearGradient>
<radialGradient id="${p}-screw" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#f1f4f6"/><stop offset=".5" stop-color="#9aa4ad"/><stop offset="1" stop-color="#3b434b"/></radialGradient>
<radialGradient id="${p}-fan" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#2b3138"/><stop offset=".25" stop-color="#0c0e10"/><stop offset=".9" stop-color="#15181c"/><stop offset="1" stop-color="#3a424a"/></radialGradient>
<radialGradient id="${p}-fl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".6"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<pattern id="${p}-mesh" width="6" height="5.2" patternUnits="userSpaceOnUse"><rect width="6" height="5.2" fill="#22272d"/><circle cx="1.5" cy="1.3" r="1.25" fill="#07090a"/><circle cx="4.5" cy="3.9" r="1.25" fill="#07090a"/></pattern>
<pattern id="${p}-holes" width="14" height="22" patternUnits="userSpaceOnUse"><rect x="5" y="2.5" width="4" height="4" fill="#06080a"/><rect x="5" y="9" width="4" height="4" fill="#06080a"/><rect x="5" y="15.500" width="4" height="4" fill="#06080a"/></pattern>
<pattern id="${p}-slit" width="10" height="4" patternUnits="userSpaceOnUse"><rect width="10" height="4" fill="#1d2227"/><rect x="1" y="1.2" width="8" height="1.5" rx=".7" fill="#050607"/></pattern>
<pattern id="${p}-brush" width="3" height="10" patternUnits="userSpaceOnUse"><rect width="3" height="10" fill="#0b0d0f"/><rect x=".4" width="1" height="10" fill="#22272c"/><rect x="1.900" width=".5" height="10" fill="#15191d"/></pattern>
<pattern id="${p}-fins" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#aeb7bf"/><rect width="1.6" height="4" fill="#6c7680"/></pattern>
<pattern id="${p}-trace" width="18" height="18" patternUnits="userSpaceOnUse"><path d="M0 4h8l4 4h6M0 13h5l3-3h10" fill="none" stroke="#2c6a55" stroke-width=".6" opacity=".7"/></pattern>
<filter id="${p}-glow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="${p}-soft" x="-20%" y="-20%" width="140%" height="160%"><feGaussianBlur stdDeviation="7"/></filter>
<filter id="${p}-sel" x="-10%" y="-20%" width="120%" height="140%"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>`.replace(/\.(\d)00"/g, '.$1"');
}

// ---------------------------------------------------------------------------
// particolari
// ---------------------------------------------------------------------------
const screw = (p, x, y, r = 2.6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${p}-screw)"/><path d="M${x - r * 0.6} ${y}h${r * 1.2}" stroke="#20252a" stroke-width=".7"/>`;
const led = (p, x, y, kind, r = 1.9) => `<circle class="rk-led ${kind}" cx="${x}" cy="${y}" r="${r}"${kind === 'off' ? '' : ` filter="url(#${p}-glow)"`}/>`;
const ears = (p, w, h) => `${R(0, 0, 12, h, `fill="url(#${p}-ear)"`)}${R(w - 12, 0, 12, h, `fill="url(#${p}-ear)" transform="translate(${2 * w - 12},0) scale(-1,1)"`)}${[[6, 7], [6, h - 7], [w - 6, 7], [w - 6, h - 7]].map(([x, y]) => screw(p, x, y)).join('')}`;
const bezel = (p, w, h, fill = `url(#${p}-bz)`) => `${R(0, 0, w, h, `fill="${fill}"`)}${R(0, 0, w, 1, 'fill="#fff" opacity=".14"')}${R(0, h - 1, w, 1, 'fill="#000" opacity=".5"')}`;
const gloss = (p, w, h) => R(0, 0, w, h, `fill="url(#${p}-gloss)" pointer-events="none"`);
const badge = (p, x, y, id, sub, w = 96) => `<g class="rk-badge">${R(x, y, w, 20, `rx="1.5" fill="url(#${p}-plate)" stroke="#59626b" stroke-width=".5"`)}<text x="${x + 6}" y="${y + 14}" class="rk-id">${esc(id)}</text>${sub ? `<text x="${x + 6 + id.length * 7.6 + 5}" y="${y + 13.500}" class="rk-sub">${esc(clip(sub, Math.max(4, Math.floor((w - id.length * 7.6 - 16) / 3.700))))}</text>` : ''}</g>`.replace(/\.(\d)00"/g, '.$1"');
const fanBehind = (p, cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${p}-fan)" opacity=".85"/>${[0, 60, 120].map((a) => `<path d="M${cx - r * 0.86} ${cy}Q${cx} ${cy - r * 0.5} ${cx + r * 0.86} ${cy}" stroke="#2d343b" stroke-width="${r * 0.3}" fill="none" opacity=".55" transform="rotate(${a} ${cx} ${cy})"/>`).join('')}<circle cx="${cx}" cy="${cy}" r="${r * 0.26}" fill="#1b1f24" stroke="#3a424a" stroke-width=".6"/>`;
const controls = (p, x, y, power) => `${R(x, y, 86, 22, 'rx="2" fill="#0d0f12" stroke="#2f363d" stroke-width=".6"')}
<circle cx="${x + 12}" cy="${y + 11}" r="6.2" fill="#15181c" stroke="${power === 'on' ? '#7dd3a0' : power === 'stby' ? '#c98a2b' : '#3a424a'}" stroke-width="1.3"${power === 'off' ? '' : ` filter="url(#${p}-glow)"`}/><path d="M${x + 12} ${y + 7.500}v3.200" stroke="#cfd6db" stroke-width="1" stroke-linecap="round"/><path d="M${x + 9.400} ${y + 9.400}a3.700 3.700 0 1 0 5.200 0" stroke="#cfd6db" stroke-width="1" fill="none" stroke-linecap="round"/>
${R(x + 26, y + 6, 10, 4.500, 'rx=".6" fill="#1d6fb8" stroke="#06080a" stroke-width=".4"')}${R(x + 26, y + 12.500, 10, 4.500, 'rx=".6" fill="#1d6fb8" stroke="#06080a" stroke-width=".4"')}
${led(p, x + 48, y + 8, power === 'on' ? 'on' : power === 'stby' ? 'stby' : 'off')}${led(p, x + 58, y + 8, power === 'on' ? 'act blink' : 'off')}${led(p, x + 68, y + 8, power === 'on' ? 'net' : 'off')}
<text x="${x + 44}" y="${y + 18.500}" class="rk-tiny">PWR  HDD  NET</text>`.replace(/\.(\d)00/g, '.$1');

/** Particolari riusati dagli altri disegni (postazioni e client). */
export const KIT = { R, screw, led, fanBehind, esc, clip };

// ---------------------------------------------------------------------------
// frontali
// ---------------------------------------------------------------------------
const FACES = {
  server(p, w, h, s) {
    const gx = 20, gw = Math.round(w * 0.55), gh = h - 16, rx = gx + gw + 10, rw = w - rx - 20;
    const bays = Math.max(1, Math.floor((h - 44) / 15));
    return `${bezel(p, w, h)}${ears(p, w, h)}
${R(gx, 8, gw, gh, 'rx="2" fill="#07090a"')}${fanBehind(p, gx + gw * 0.27, 8 + gh / 2, Math.min(gh, gw / 2) * 0.44)}${fanBehind(p, gx + gw * 0.73, 8 + gh / 2, Math.min(gh, gw / 2) * 0.44)}
${R(gx, 8, gw, gh, `rx="2" fill="url(#${p}-mesh)" opacity=".74"`)}${R(gx, 8, gw, gh, 'rx="2" fill="none" stroke="#000" stroke-width="1.4" opacity=".7"')}${R(gx + 1, 9, gw - 2, 1, 'fill="#fff" opacity=".07"')}
${Array.from({ length: bays }, (_, i) => `${R(rx, 8 + i * 15, rw, 13, `rx="1" fill="url(#${p}-bz)" stroke="#000" stroke-width=".7"`)}${R(rx + 2, 9.500 + i * 15, rw - 4, .8, 'fill="#fff" opacity=".08"')}`).join('')}
${controls(p, rx + Math.max(0, rw - 86), h - 30, s.power)}
${badge(p, gx + 6, h - 34, s.id, s.sub, Math.min(gw - 12, 150))}${s.tag ? `<g>${R(gx + gw - 44, 14, 38, 12, `rx="1" fill="#0b0d0f" stroke="#76b900" stroke-width=".7"`)}<text x="${gx + gw - 25}" y="23" text-anchor="middle" class="rk-tiny" style="fill:#9ad12b">${esc(s.tag)}</text></g>` : ''}${gloss(p, w, h)}`.replace(/\.(\d)00/g, '.$1');
  },
  storage(p, w, h, s) {
    const top = Math.round(h / 2), tw = (w - 44) / 5;
    const tray = (x, y) => `${R(x, y, tw - 3, top / 2 - 5, `rx="1" fill="url(#${p}-bz)" stroke="#000" stroke-width=".7"`)}${R(x + 3, y + 3, tw - 22, top / 2 - 11, `fill="url(#${p}-mesh)" opacity=".8"`)}${R(x + tw - 16, y + 3, 10, top / 2 - 11, 'rx="1" fill="#8f989f"')}${R(x + tw - 14, y + 5, 6, 3, 'fill="#30363c"')}${led(p, x + tw - 11, y + top / 2 - 12, s.power === 'on' ? 'act' : 'off', 1.3)}`;
    return `${bezel(p, w, h)}${ears(p, w, h)}
${[0, 1].map((r) => [0, 1, 2, 3, 4].map((c) => tray(22 + c * tw, 6 + r * (top / 2 - 1))).join('')).join('')}
${R(20, top + 6, Math.round(w * 0.5), h - top - 14, `rx="2" fill="url(#${p}-mesh)" opacity=".86"`)}${R(20, top + 6, Math.round(w * 0.5), h - top - 14, 'rx="2" fill="none" stroke="#000" stroke-width="1.2" opacity=".7"')}
${controls(p, w - 20 - 86, h - 30, s.power)}${badge(p, 26, h - 30, s.id, s.sub, 128)}${gloss(p, w, h)}`;
  },
  switch(p, w, h, s) {
    const hh = Math.min(22, h / 2), pw = 8.2, x0 = 34;
    const port = (i, r) => { const blk = Math.floor(i / 6), x = x0 + i * pw + blk * 3; return `${R(x, 3.5 + r * 8, pw - 1.6, 6.2, 'rx=".5" fill="#06080a" stroke="#7b858e" stroke-width=".45"')}${R(x + 1.4, 3.5 + r * 8 + (r ? 4.6 : 0), pw - 4.4, 1.6, 'fill="#343c44"')}`; };
    const sx = x0 + 24 * pw + 4 * 3 + 6;
    const sfp = (i) => { const on = (s.lit || []).includes(i); const x = sx + (i % 2) * 15, y = 3 + Math.floor(i / 2) * 8.500; return `${R(x, y, 13, 6.800, 'rx=".6" fill="#06080a" stroke="#c0c8ce" stroke-width=".6"')}${led(p, x + 6.500, y - 0.2, on && s.power === 'on' ? 'net' : 'off', 1)}`; };
    return `${R(0, 0, w, hh, `fill="url(#${p}-sw)"`)}${R(0, 0, w, 1, 'fill="#fff" opacity=".18"')}${ears(p, w, hh)}
${led(p, 20, 7, s.power === 'on' ? 'on' : 'off', 1.5)}${led(p, 26, 7, s.power === 'on' ? 'act blink' : 'off', 1.5)}<text x="17" y="17" class="rk-tiny">SYS</text>
${Array.from({ length: 24 }, (_, i) => port(i, 0) + port(i, 1)).join('')}${[0, 1, 2, 3].map(sfp).join('')}
${h > hh ? `<g transform="translate(0,${hh})">${bezel(p, w, h - hh)}${ears(p, w, h - hh)}${R(22, 4, w - 44, h - hh - 8, `rx="1.5" fill="url(#${p}-brush)" stroke="#000" stroke-width=".8"`)}${badge(p, w - 22 - 132, (h - hh - 20) / 2, s.id, s.sub, 126)}</g>` : ''}${gloss(p, w, h)}`.replace(/\.(\d)00/g, '.$1');
  },
  shelf(p, w, h, s) {
    const items = s.items || [], n = items.length, floorY = h - 9;
    const slotW = (w - 40) / Math.max(n, 1);
    const box = (it, i) => {
      const big = i === 0 && n > 1, bw = big ? Math.min(slotW - 12, 118) : Math.min(slotW - 16, 34), bh = big ? Math.min(h - 34, 44) : Math.min(h - 26, 60);
      const x = 20 + i * slotW + (slotW - bw) / 2, y = floorY - bh;
      return `<g>${R(x + 2, floorY - 1, bw, 4, `fill="url(#${p}-fl)" opacity=".8"`)}${R(x, y, bw, bh, `rx="1.5" fill="url(#${p}-bz)" stroke="#000" stroke-width=".7"`)}${R(x, y, bw, 1, 'fill="#fff" opacity=".16"')}
${big ? `${R(x + 6, y + 6, bw * 0.55, bh - 12, `fill="url(#${p}-slit)"`)}${led(p, x + bw - 12, y + 9, it.power === 'on' ? 'on' : 'off', 1.5)}${R(x + bw - 30, y + bh - 12, 9, 4, 'rx=".5" fill="#1d6fb8"')}${R(x + bw - 18, y + bh - 12, 9, 4, 'rx=".5" fill="#1d6fb8"')}` : `${R(x + 4, y + 6, bw - 8, bh * 0.45, `fill="url(#${p}-slit)"`)}${led(p, x + bw / 2, y + bh - 9, it.power === 'on' ? 'on' : 'off', 1.5)}`}
<text x="${x + bw / 2}" y="${y - 4}" text-anchor="middle" class="rk-lbl">${esc(it.id)}</text></g>`;
    };
    return `${R(0, 0, w, h, `fill="url(#${p}-back)"`)}${R(0, 0, w, h, 'fill="#fff" opacity=".015"')}
${R(0, floorY, w, 9, `fill="url(#${p}-ear)"`)}${R(0, floorY, w, 1, 'fill="#fff" opacity=".25"')}${[[6, floorY + 4.500], [w - 6, floorY + 4.500]].map(([x, y]) => screw(p, x, y, 2.2)).join('')}
${items.map(box).join('')}`.replace(/\.(\d)00/g, '.$1');
  },
  blank(p, w, h, s) {
    const n = Math.max(1, Math.round(h / 22)), ph = h / n;
    return `${Array.from({ length: n }, (_, i) => `<g transform="translate(0,${i * ph})">${bezel(p, w, ph)}${ears(p, w, ph)}${R(40, ph / 2 - 4, w - 80, 8, `fill="url(#${p}-slit)" opacity=".7"`)}</g>`).join('')}
<g>${R(w / 2 - 104, h / 2 - 9, 208, 18, 'rx="1.5" fill="#0d0f12" stroke="#3a424a" stroke-width=".6"')}<text x="${w / 2}" y="${h / 2 + 4}" text-anchor="middle" class="rk-lbl">${esc(clip(s.label || s.id, 34))}</text></g>${gloss(p, w, h)}`;
  },
  power(p, w, h, s) {
    const bw = Math.min(w - 70, 210), bx = (w - bw) / 2, by = 14, bh = h - 22;
    return `${R(0, 0, w, h, `fill="url(#${p}-back)"`)}${R(0, h - 4, w, 4, `fill="url(#${p}-ear)"`)}
${R(bx + 4, h - 7, bw - 8, 7, `fill="url(#${p}-fl)"`)}
${R(bx, by, bw, bh, `rx="5" fill="url(#${p}-white)" stroke="#6f787e" stroke-width="1"`)}${R(bx, by, bw, 2, 'rx="1" fill="#fff" opacity=".9"')}
${R(bx + 22, by - 8, bw - 44, 10, `rx="4" fill="url(#${p}-bz)"`)}${R(bx + 30, by - 6, bw - 60, 2, 'fill="#fff" opacity=".15"')}
${R(bx + 14, by + 16, bw * 0.46, 40, 'rx="3" fill="#0a0d10" stroke="#39424a" stroke-width=".8"')}<text x="${bx + 14 + bw * 0.23}" y="${by + 40}" text-anchor="middle" class="rk-lcd">— —</text><text x="${bx + 14 + bw * 0.23}" y="${by + 51}" text-anchor="middle" class="rk-tiny">nessuna misura collegata</text>
${[0, 1].map((i) => `<circle cx="${bx + bw * 0.62 + i * 34}" cy="${by + 36}" r="13" fill="#262b30" stroke="#0d1012" stroke-width="1"/><circle cx="${bx + bw * 0.62 + i * 34 - 4.500}" cy="${by + 36}" r="1.700" fill="#050607"/><circle cx="${bx + bw * 0.62 + i * 34 + 4.500}" cy="${by + 36}" r="1.700" fill="#050607"/>`).join('')}
${R(bx + 14, by + 68, bw - 28, Math.max(10, bh - 104), `rx="2" fill="url(#${p}-slit)" opacity=".5"`)}
${[0, 1, 2, 3].map((i) => R(bx + 16 + i * 16, by + bh - 26, 11, 5, 'rx=".8" fill="#1d6fb8" stroke="#06080a" stroke-width=".4"')).join('')}${R(bx + bw - 34, by + bh - 30, 20, 12, 'rx="2" fill="#b8332a" stroke="#5c1712" stroke-width=".8"')}
${badge(p, bx + 14, by + bh - 52, s.id, s.sub, Math.min(bw - 28, 170))}`.replace(/\.(\d)00/g, '.$1');
  },
  panel(p, w, h, s) { // patch panel, PDU e altri pezzi da 1U
    const n = s.ports || 0;
    return `${bezel(p, w, h)}${ears(p, w, h)}${n ? Array.from({ length: n }, (_, i) => R(30 + i * ((w - 60) / n), h / 2 - 4, (w - 60) / n - 2, 8, 'rx=".5" fill="#06080a" stroke="#7b858e" stroke-width=".45"')).join('') : R(30, h / 2 - 4, w - 60, 8, `fill="url(#${p}-slit)" opacity=".7"`)}
<text x="${w - 26}" y="${h / 2 + 3.500}" text-anchor="end" class="rk-lbl">${esc(clip(s.label || s.id, 20))}</text>${gloss(p, w, h)}`.replace(/\.(\d)00/g, '.$1');
  },
};
export const FACE_KINDS = Object.keys(FACES);

/** Un pezzo disegnato a (0,0). s: {id, sub, label, face, u, power:'on'|'stby'|'off', tag, lit, items, ports}. */
export function faceplate(p, s, w = GEO.W, h = s.u * GEO.U) {
  return (FACES[s.face] || FACES.blank)(p, w, h - 1, s);
}

// ---------------------------------------------------------------------------
// armadio
// ---------------------------------------------------------------------------
/**
 * columns: [{id,name,u}]; pieces: [{id, col, from, u, face, sub, label, power, title, …}].
 * opts: sel (id selezionato), prefix, extraTop, overlay(geo) → SVG da aggiungere sopra, bad (Set di id in errore), interactive.
 */
export function rackSvg(columns, pieces, { sel = '', prefix = 'rk', extraTop = 0, side = 0, titles = 'top', overlay = null, bad = new Set(), interactive = true, label = 'Rack' } = {}) {
  const geo = rackGeometry(columns, { extraTop, side }), p = prefix, g = GEO;
  const cab = geo.cols.map((c) => {
    const ih = c.u * g.U;
    return `<g class="rk-cab" data-col="${esc(c.id)}">
<ellipse cx="${c.x + geo.colW / 2}" cy="${geo.floor + 4}" rx="${geo.colW * 0.62}" ry="13" fill="url(#${p}-fl)"/>
${R(c.x - 5, c.y, geo.colW + 10, g.CAP, `fill="url(#${p}-cap)"`)}${R(c.x - 5, c.y, geo.colW + 10, 1, 'fill="#fff" opacity=".28"')}
${R(c.x, c.y + g.CAP, geo.colW, ih, `fill="url(#${p}-back)"`)}
${Array.from({ length: c.u - 1 }, (_, i) => `<path d="M${c.innerX} ${c.innerBottom - (i + 1) * g.U}h${g.W}" stroke="#1f252b" stroke-width=".6"/>`).join('')}
${R(c.x, c.y + g.CAP, g.RAIL, ih, `fill="url(#${p}-rail)"`)}${R(c.x, c.y + g.CAP, g.RAIL, ih, `fill="url(#${p}-holes)"`)}
${R(c.x + geo.colW - g.RAIL, c.y + g.CAP, g.RAIL, ih, `fill="url(#${p}-rail)"`)}${R(c.x + geo.colW - g.RAIL, c.y + g.CAP, g.RAIL, ih, `fill="url(#${p}-holes)"`)}
${R(c.x - 5, c.innerBottom, geo.colW + 10, g.CAP, `fill="url(#${p}-cap)"`)}${R(c.x + 8, c.innerBottom + g.CAP, 22, 5, 'fill="#0b0d0f"')}${R(c.x + geo.colW - 30, c.innerBottom + g.CAP, 22, 5, 'fill="#0b0d0f"')}
${R(c.x, geo.floor + 6, geo.colW, 30, `fill="url(#${p}-refl)" opacity=".5"`)}
${Array.from({ length: c.u }, (_, i) => `<text x="${c.x - 10}" y="${c.innerBottom - i * g.U - 7}" text-anchor="end" class="rk-u">${i + 1}</text>`).join('')}
${titles === 'bottom' ? `<text x="${c.x + geo.colW / 2}" y="${geo.floor + 22}" text-anchor="middle" class="rk-col">${esc(c.name.toUpperCase())} · ${c.u}U</text>` : `<text x="${c.x}" y="${c.y - 12}" class="rk-col">${esc(c.name.toUpperCase())} · ${c.u}U</text>`}</g>`;
  }).join('');
  const units = pieces.filter((s) => geo.cols.some((c) => c.id === s.col)).sort((a, b) => (a.id === sel) - (b.id === sel)).map((s) => {
    const c = geo.cols.find((k) => k.id === s.col), y = geo.yOf(s.col, s.from, s.u), h = s.u * g.U;
    const cls = ['rk-unit', s.id === sel ? 'sel' : '', bad.has(s.id) ? 'bad' : ''].filter(Boolean).join(' ');
    // il disegno è decorativo: il pezzo si raggiunge da un rettangolo trasparente che porta nome e stato
    return `<g class="${cls}" data-unit="${esc(s.id)}" transform="translate(${c.innerX},${y})"><g class="rk-in" aria-hidden="true">${faceplate(p, s)}${R(0, 0, g.W, h - 1, `class="rk-hl" fill="none"${s.id === sel ? ` filter="url(#${p}-sel)"` : ''}`)}</g>${interactive ? R(0, 0, g.W, h - 1, `class="rk-hit" fill="transparent" tabindex="0" role="button" aria-pressed="${s.id === sel}" aria-label="${esc(s.aria || `${s.id} ${s.sub || s.label || ''}`.trim())}"`) : ''}</g>`;
  }).join('');
  return `<svg class="rk-svg" viewBox="0 0 ${geo.width} ${geo.height}" width="${geo.width}" height="${geo.height}" role="group" aria-label="${esc(label)}">${rackDefs(p)}${cab}${units}${overlay ? overlay(geo) : ''}</svg>`;
}

// ---------------------------------------------------------------------------
// interno di una macchina, visto dall'alto
// ---------------------------------------------------------------------------
/**
 * parts: [{cat, label, sub, n (numero di pezzi da disegnare, 1 se non indicato), href}] ; links: [{label, kind:'net'|'power'}].
 * Le parti compaiono solo se registrate; ogni parte porta un numero che rimanda all'elenco accanto.
 */
export function interiorSvg(title, parts, links = [], { prefix = 'ri' } = {}) {
  const p = prefix, W = 720, H = 470;
  const by = (c) => parts.filter((x) => x.cat === c);
  let k = 0; const marks = [];
  const mark = (part, x, y) => { const n = ++k; marks.push({ n, part }); const dot = `<g class="ri-mark"><circle cx="${x}" cy="${y}" r="10"/><text x="${x}" y="${y + 3.6}" text-anchor="middle">${n}</text></g>`; return part.href ? `<a href="${esc(part.href)}" aria-label="${esc(`${n}. ${part.label}`)}">${dot}</a>` : dot; };
  const out = [];
  // telaio
  out.push(`${R(18, 24, W - 36, H - 48, `rx="6" fill="url(#${p}-bz)" stroke="#000" stroke-width="1.5"`)}${R(26, 32, W - 52, H - 64, 'rx="3" fill="#15191d" stroke="#2b3238" stroke-width="1"')}${R(18, H - 40, W - 36, 16, `fill="url(#${p}-ear)"`)}<text x="${W / 2}" y="${H - 28}" text-anchor="middle" class="rk-tiny">FRONTALE</text><text x="${W / 2}" y="20" text-anchor="middle" class="rk-tiny">RETRO</text>`);
  // ventole frontali
  out.push([0, 1, 2].map((i) => `<g>${R(470 + i * 72, H - 108, 64, 60, 'rx="3" fill="#0b0d0f" stroke="#2f363d"')}${fanBehind(p, 502 + i * 72, H - 78, 26)}</g>`).join(''));
  // scheda madre
  const mb = by('mobo')[0];
  out.push(`${R(60, 60, 380, 262, `rx="3" fill="url(#${p}-pcb)" stroke="#06140f" stroke-width="1"`)}${R(60, 60, 380, 262, `fill="url(#${p}-trace)"`)}${[[68, 68], [432, 68], [68, 314], [432, 314]].map(([x, y]) => screw(p, x, y, 3)).join('')}${R(66, 46, 150, 16, 'rx="1" fill="#9aa4ad" stroke="#59626b" stroke-width=".6"')}${[0, 1, 2, 3, 4].map((i) => R(72 + i * 28, 49, 22, 10, 'rx="1" fill="#0a0c0e"')).join('')}`);
  if (mb) out.push(mark(mb, 84, 300));
  // processore con dissipatore
  const cpu = by('cpu')[0];
  out.push(`${R(196, 104, 104, 104, `rx="4" fill="url(#${p}-fins)" stroke="#4b545c" stroke-width="1"`)}${fanBehind(p, 248, 156, 40)}${R(196, 104, 104, 104, 'rx="4" fill="none" stroke="#fff" stroke-width=".6" opacity=".25"')}`);
  if (cpu) out.push(mark(cpu, 196, 104));
  // memoria
  const ram = by('ram');
  if (ram.length) {
    const n = Math.min(ram.reduce((a, r) => a + (r.n || 1), 0), 8);
    out.push(Array.from({ length: n }, (_, i) => `${R(322 + i * 13, 96, 8, 122, 'rx="1" fill="#0d2a44" stroke="#06121d" stroke-width=".6"')}${[0, 1, 2, 3].map((j) => R(323.500 + i * 13, 104 + j * 28, 5, 18, 'fill="#0a0c0e"')).join('')}${R(322 + i * 13, 214, 8, 4, `fill="url(#${p}-gold)"`)}`).join('').replace(/\.(\d)00/g, '.$1'));
    out.push(mark(ram[0], 322, 90));
  }
  // schede di espansione verso il retro
  let cy = 232;
  for (const part of [...by('gpu'), ...by('nic'), ...by('pcie'), ...by('npu')]) {
    const big = part.cat === 'gpu', len = big ? 300 : part.cat === 'npu' ? 70 : 150, th = big ? 46 : 16;
    if (cy + th > 318) break;
    out.push(`<g>${R(70, cy, len, th, `rx="2" fill="${big ? `url(#${p}-bz)` : '#123a5c'}" stroke="#000" stroke-width=".8"`)}${big ? fanBehind(p, 70 + len * 0.3, cy + th / 2, th * 0.42) + fanBehind(p, 70 + len * 0.7, cy + th / 2, th * 0.42) : R(76, cy + 4, len - 40, th - 8, `fill="url(#${p}-trace)"`)}${R(62, cy - 2, 8, th + 4, `fill="url(#${p}-steel)"`)}${R(70, cy + th - 3, Math.min(len, 90), 3, `fill="url(#${p}-gold)"`)}</g>`);
    out.push(mark(part, 70 + len, cy + th / 2));
    cy += th + 10;
  }
  // unità M.2 sulla scheda
  by('nvme').slice(0, 3).forEach((part, i) => { out.push(`${R(318 + i * 0, 236 + i * 24, 96, 16, 'rx="1.5" fill="#101418" stroke="#3a424a" stroke-width=".7"')}${R(322, 239 + i * 24, 40, 10, 'fill="#e9edf0"')}${R(408, 238 + i * 24, 5, 12, `fill="url(#${p}-gold)"`)}`); out.push(mark(part, 424, 244 + i * 24)); });
  // alimentatore
  const psu = by('psu')[0];
  out.push(`${R(520, 50, 160, 104, `rx="3" fill="url(#${p}-bz)" stroke="#000" stroke-width="1"${psu ? '' : ' stroke-dasharray="5 4" opacity=".55"'}`)}${fanBehind(p, 600, 102, 40)}<path d="M520 132C480 150 470 190 440 200M520 142C490 170 480 250 440 262" fill="none" stroke="#0a0c0e" stroke-width="5" stroke-linecap="round"/><path d="M520 132C480 150 470 190 440 200" fill="none" stroke="#d9a520" stroke-width="1.2" opacity=".7"/>`);
  if (psu) out.push(mark(psu, 520, 50));
  // gabbia dischi
  const drives = [...by('hdd'), ...by('ssd')];
  const total = Math.min(drives.reduce((a, d) => a + (d.n || 1), 0), 12);
  if (total) {
    out.push(`${R(52, H - 116, 392, 70, 'rx="3" fill="#0b0d0f" stroke="#2f363d"')}`);
    let i = 0;
    for (const d of drives) for (let j = 0; j < (d.n || 1) && i < 12; j++, i++) {
      const x = 58 + i * 32, hdd = d.cat === 'hdd';
      out.push(`${R(x, H - 110, 28, 58, `rx="1.5" fill="url(#${p}-${hdd ? 'steel' : 'bz'})" stroke="#000" stroke-width=".7"`)}${R(x + 4, H - 104, 20, 22, `rx="1" fill="${hdd ? '#f4f6f7' : '#1f6fb0'}"`)}${hdd ? `<circle cx="${x + 14}" cy="${H - 68}" r="7" fill="none" stroke="#6c7680" stroke-width=".8"/>` : ''}`);
    }
    let x = 58; for (const d of drives) { out.push(mark(d, x + 14, H - 116)); x += Math.min(d.n || 1, 12) * 32; if (x > 430) break; }
  }
  // collegamenti verso l'esterno
  links.slice(0, 5).forEach((l, i) => { const x = 250 + i * 92; out.push(`<g class="ri-link ${esc(l.kind)}"><path d="M${Math.min(x, 660)} 46V14" /><circle cx="${Math.min(x, 660)}" cy="46" r="3"/></g>`); });
  return { svg: `<svg class="ri-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="group" aria-label="${esc(`Interno di ${title}, visto dall'alto: ${marks.length} parti registrate`)}">${rackDefs(p)}${out.join('')}</svg>`, marks };
}
