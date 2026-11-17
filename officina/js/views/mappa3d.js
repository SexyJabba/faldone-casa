// Vista 3D del vano: proiezione ortogonale disegnata in SVG, senza librerie. Trascina per ruotare, tocca un modulo per selezionarlo.
// È una vista di controllo degli ingombri (parallelepipedi), non un modello del veicolo.
import { h, avviso } from '../ui.js';
import { ingombroAperto, num } from '../calc.js';

export const cam = { yaw: -0.65, pitch: 0.55 };

export function vista3d({ g, moduli, bad, fin, aperti, haStato, sel, onSel, zoom }) {
  const L = num(g.lung), W = num(g.larg), H = num(g.alt);
  if (L === null || W === null || H === null) return avviso('Servono lunghezza, larghezza e altezza del vano per la vista 3D.');
  const z0 = fin ? fin.pav : 0; // i moduli poggiano sul pavimento finito
  const solidi = [], fili = [];
  const box = (x, y, z, lx, ly, hh, o) => solidi.push({ x, y, z, lx, ly, hh, ...o });
  box(0, 0, -12, L, W, 12, { col: '#8b949a', op: 1 });
  if (z0 > 0) box(0, fin.y0, 0, fin.x1, fin.y1 - fin.y0, z0, { col: '#b08d57', op: .9 });
  for (const p of g.passaruota || []) if ([p.x, p.y, p.lx, p.ly].every((v) => num(v) !== null)) box(p.x, p.y, 0, p.lx, p.ly, num(p.h) ?? 300, { col: '#6b7479', op: .95 });
  const c = g.corridoio;
  if (num(c.y) !== null && num(c.ly) !== null) box(-250, c.y, z0, L + 250, c.ly, num(c.h) ?? 150, { col: '#d9a441', op: .28 });
  for (const m of moduli) {
    if ([m.x, m.y, m.lx, m.ly, m.h].some((v) => num(v) === null)) continue;
    const a = ingombroAperto(m), siApre = a.lx !== m.lx || a.ly !== m.ly, aperto = aperti.has(m.id);
    if (siApre && (!haStato || aperto)) box(a.x, a.y, z0 + (num(m.z) || 0), a.lx, a.ly, m.h, { col: m.colore, op: aperto ? .55 : .18, id: m.id });
    box(m.x, m.y, z0 + (num(m.z) || 0), m.lx, m.ly, m.h, { col: m.colore, op: .93, id: m.id, bad: bad.has(m.id), sel: m.id === sel });
  }
  const filo = (x, y, z, lx, ly, hh, cls) => { const P = (a, b, k) => [x + a * lx, y + b * ly, z + k * hh]; const e = [[0, 0, 0, 1, 0, 0], [0, 1, 0, 1, 1, 0], [0, 0, 1, 1, 0, 1], [0, 1, 1, 1, 1, 1], [0, 0, 0, 0, 1, 0], [1, 0, 0, 1, 1, 0], [0, 0, 1, 0, 1, 1], [1, 0, 1, 1, 1, 1], [0, 0, 0, 0, 0, 1], [1, 0, 0, 1, 0, 1], [0, 1, 0, 0, 1, 1], [1, 1, 0, 1, 1, 1]]; e.forEach((q) => fili.push({ a: P(q[0], q[1], q[2]), b: P(q[3], q[4], q[5]), cls })); };
  filo(0, 0, 0, L, W, H, 'f-lamiera');
  if (fin && fin.y1 !== null) filo(0, fin.y0, fin.pav, fin.x1, fin.y1 - fin.y0, fin.alt, 'f-finito');

  const svg = h('svg', { class: 'vista3d', style: `width:${zoom * 100}%`, role: 'img', 'aria-label': 'Vista 3D del vano di carico' });
  // 3D: X = sinistra→destra, Y = verso l'avanti del mezzo, Z = alto. Osservatore dietro il portellone.
  const pr = (p) => { const X = p[1] - W / 2, Y = -(p[0] - L / 2), Z = p[2]; const ca = Math.cos(cam.yaw), sa = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
    const x1 = X * ca - Y * sa, y1 = X * sa + Y * ca; return [x1, -(y1 * sp + Z * cp), y1 * cp - Z * sp]; };
  const FACCE = [[[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1], 1.18], [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], .6], [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1], .92], [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1], .92], [[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1], .78], [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1], .78]];
  function disegna() {
    const poligoni = []; let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    const vedi = (q) => { minX = Math.min(minX, q[0]); maxX = Math.max(maxX, q[0]); minY = Math.min(minY, q[1]); maxY = Math.max(maxY, q[1]); return q; };
    for (const s of solidi) for (const f of FACCE) { const pts = f.slice(0, 4).map((k) => vedi(pr([s.x + k[0] * s.lx, s.y + k[1] * s.ly, s.z + k[2] * s.hh]))); poligoni.push({ pts, d: pts.reduce((a, q) => a + q[2], 0) / 4, s, lum: f[4] }); }
    poligoni.sort((a, b) => b.d - a.d); // prima le facce lontane
    const linee = fili.map((f) => ({ a: vedi(pr(f.a)), b: vedi(pr(f.b)), cls: f.cls }));
    const m = 120; svg.setAttribute('viewBox', `${minX - m} ${minY - m} ${maxX - minX + 2 * m} ${maxY - minY + 2 * m}`);
    svg.replaceChildren(...poligoni.map((p) => h('polygon', { points: p.pts.map((q) => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' '), fill: p.s.col, 'fill-opacity': p.s.op, style: `filter:brightness(${p.lum})`, class: 'faccia' + (p.s.bad ? ' bad' : '') + (p.s.sel ? ' sel' : ''), 'data-id': p.s.id || null })),
      ...linee.map((l) => h('line', { x1: l.a[0], y1: l.a[1], x2: l.b[0], y2: l.b[1], class: l.cls })),
      (() => { const q = pr([L + 260, W / 2, 0]); return h('text', { x: q[0], y: q[1], 'text-anchor': 'middle', 'font-size': 70 }, 'portellone'); })(),
      (() => { const q = pr([-200, W / 2, 0]); return h('text', { x: q[0], y: q[1], 'text-anchor': 'middle', 'font-size': 70 }, 'cabina ▲'); })());
  }
  svg.addEventListener('pointerdown', (ev) => {
    ev.preventDefault(); svg.setPointerCapture(ev.pointerId);
    const x0 = ev.clientX, y0 = ev.clientY, yaw0 = cam.yaw, p0 = cam.pitch, id = ev.target.getAttribute && ev.target.getAttribute('data-id'); let mosso = false;
    const move = (e) => { const dx = e.clientX - x0, dy = e.clientY - y0; if (Math.abs(dx) + Math.abs(dy) > 5) mosso = true; cam.yaw = yaw0 + dx * 0.008; cam.pitch = Math.max(0.08, Math.min(1.5, p0 + dy * 0.006)); disegna(); };
    const up = () => { svg.removeEventListener('pointermove', move); svg.removeEventListener('pointerup', up); svg.removeEventListener('pointercancel', up); if (!mosso && id) onSel(id); };
    svg.addEventListener('pointermove', move); svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
  });
  disegna();
  return svg;
}
