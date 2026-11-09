// Rappresentazioni grafiche derivate dal modello. Funzioni pure: stringhe HTML/SVG, nessun DOM.
// Regola: si disegna solo ciò che il modello contiene. Un dato mancante resta visibile come mancante,
// e ogni grafico ha accanto la stessa informazione in forma di testo o tabella.
import { REL_LABEL, MECHANISM, KINDS } from './model.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const href = (route) => '#' + encodeURI(String(route));
const clip = (s, n) => { s = String(s ?? ''); return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s; };

// ---------------------------------------------------------------------------
// 1. Vicinato di un elemento: chi punta a lui (sinistra) → elemento → a che cosa punta (destra)
// ---------------------------------------------------------------------------
const EGO_SKIP = new Set(['documented_by', 'validated_by', 'blocked_by', 'located_in']);
const EGO_ORDER = ['hosted_on', 'depends_on', 'stores_on', 'recovers_on', 'protected_by', 'backs_up_to', 'replicates_to', 'connected_to', 'powered_by', 'wakes', 'member_of'];

/** Raggruppa le relazioni per elemento vicino. Restituisce {left:[{e,labels}], right:[…]} senza limiti. */
export function egoData(idx, id) {
  const side = (rels, pick) => {
    const m = new Map();
    for (const r of rels) {
      if (EGO_SKIP.has(r.type)) continue;
      const other = idx.get(pick(r));
      if (!other || other.id === id) continue;
      if (!m.has(other.id)) m.set(other.id, { e: other, labels: [], rank: 99 });
      const g = m.get(other.id);
      const lab = REL_LABEL[r.type]?.[0] || r.type;
      if (!g.labels.includes(lab)) g.labels.push(lab);
      const k = EGO_ORDER.indexOf(r.type);
      g.rank = Math.min(g.rank, k < 0 ? 98 : k);
    }
    return [...m.values()].sort((a, b) => a.rank - b.rank || a.e.name.localeCompare(b.e.name, 'it'));
  };
  return { left: side(idx.in(id), (r) => r.fromId), right: side(idx.out(id), (r) => r.toId) };
}

export function egoGraph(idx, id, { max = 7 } = {}) {
  const c = idx.get(id);
  if (!c) return '';
  const { left, right } = egoData(idx, id);
  if (!left.length && !right.length) return '';
  const W = 760, NW = 220, NH = 42, GAP = 10, TOP = 30, CX = (W - NW) / 2;
  const cut = (list) => (list.length > max ? { shown: list.slice(0, max - 1), more: list.length - (max - 1) } : { shown: list, more: 0 });
  const L = cut(left), R = cut(right);
  const rows = Math.max(L.shown.length + (L.more ? 1 : 0), R.shown.length + (R.more ? 1 : 0), 1);
  const H = TOP + rows * (NH + GAP) - GAP + 8;
  const colY = (n, i) => TOP + (rows * (NH + GAP) - GAP - (n * (NH + GAP) - GAP)) / 2 + i * (NH + GAP);
  const cy = TOP + (rows * (NH + GAP) - GAP) / 2;
  const CH = 56;
  const node = (g, x, y, dir) => `<a href="${href('e/' + g.e.id)}" class="vz-node k-${esc(g.e.kind)}"><title>${esc(dir === 'in' ? `${g.e.name} ${g.labels.join(', ')} ${c.name}` : `${c.name} ${g.labels.join(', ')} ${g.e.name}`)}</title><rect x="${x}" y="${y}" width="${NW}" height="${NH}" rx="8"/><rect class="stripe" x="${x}" y="${y}" width="5" height="${NH}" rx="2.5"/><text x="${x + 16}" y="${y + 18}" class="n">${esc(clip(g.e.name, 26))}</text><text x="${x + 16}" y="${y + 33}" class="s">${esc(clip(g.labels.join(' · '), 34))}</text></a>`;
  const more = (n, x, y) => `<g class="vz-more"><rect x="${x}" y="${y}" width="${NW}" height="${NH}" rx="8"/><text x="${x + NW / 2}" y="${y + 26}" text-anchor="middle">+ ${n} altri nell'elenco sotto</text></g>`;
  const link = (x1, y1, x2, y2) => `<path class="vz-link" d="M${x1} ${y1}C${(x1 + x2) / 2} ${y1} ${(x1 + x2) / 2} ${y2} ${x2} ${y2}" marker-end="url(#vz-arr)"/>`;
  let links = '', nodes = '';
  const nl = L.shown.length + (L.more ? 1 : 0), nr = R.shown.length + (R.more ? 1 : 0);
  L.shown.forEach((g, i) => { const y = colY(nl, i); links += link(NW, y + NH / 2, CX - 6, cy); nodes += node(g, 0, y, 'in'); });
  if (L.more) { const y = colY(nl, nl - 1); links += link(NW, y + NH / 2, CX - 6, cy); nodes += more(L.more, 0, y); }
  R.shown.forEach((g, i) => { const y = colY(nr, i); links += link(CX + NW, cy, W - NW - 6, y + NH / 2); nodes += node(g, W - NW, y, 'out'); });
  if (R.more) { const y = colY(nr, nr - 1); links += link(CX + NW, cy, W - NW - 6, y + NH / 2); nodes += more(R.more, W - NW, y); }
  const head = (x, t, n) => (n ? `<text class="vz-col" x="${x}" y="14">${esc(t)} (${n})</text>` : '');
  return `<figure class="viz"><div class="viz-scroll" tabindex="0" role="region" aria-label="Schema delle relazioni di ${esc(c.name)}"><svg class="vz-ego" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="group" aria-label="${esc(`${c.name}: ${left.length} elementi puntano a questo, ${right.length} sono i suoi appoggi`)}">
<defs><marker id="vz-arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z"/></marker></defs>
${head(0, 'Chi si appoggia a questo', left.length)}${head(W - NW, 'A che cosa si appoggia', right.length)}
${links}${nodes}
<g class="vz-center k-${esc(c.kind)}"><rect x="${CX}" y="${cy - CH / 2}" width="${NW}" height="${CH}" rx="10"/><text x="${CX + NW / 2}" y="${cy - 3}" text-anchor="middle" class="n">${esc(clip(c.name, 24))}</text><text x="${CX + NW / 2}" y="${cy + 15}" text-anchor="middle" class="s">${esc(KINDS[c.kind] || c.kind)}</text></g>
</svg></div><figcaption class="small muted"><span class="only-narrow">Scorri in orizzontale per vedere tutto lo schema.&nbsp;</span>Relazioni dirette del modello, lette da sinistra a destra. Il colore del bordo indica il tipo di elemento; l'elenco completo, con natura e fonti, è in «Relazioni».</figcaption></figure>`;
}

// ---------------------------------------------------------------------------
// 2. Binario delle fasi della roadmap
// ---------------------------------------------------------------------------
const T_ORDER = ['completato', 'da_verificare', 'pronto', 'pronto_incerto', 'bloccato'];
const T_SHORT = { completato: 'completate', da_verificare: 'da verificare', pronto: 'pronte', pronto_incerto: 'pronte con riserva', bloccato: 'bloccate' };

export function phaseCounts(phase) {
  const n = Object.fromEntries(T_ORDER.map((k) => [k, 0]));
  for (const t of phase.tasks) if (t.state in n) n[t.state]++;
  return n;
}
const fdate = (iso) => new Date(iso + 'T12:00:00Z').toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export function phaseRail(rs, { current = '' } = {}) {
  return `<ol class="rail" aria-label="Fasi della roadmap">${rs.phases.map((p, i) => {
    const n = phaseCounts(p), tot = p.tasks.length;
    const when = p.target?.from ? `${fdate(p.target.from)}${p.target.to ? ' – ' + fdate(p.target.to) : ''}` : 'senza data';
    const parts = T_ORDER.filter((k) => n[k]).map((k) => `${n[k]} ${T_SHORT[k]}`);
    return `<li class="${p.gateOpen ? 'open' : 'closed'}"${p.id === current ? ' aria-current="step"' : ''}><a href="${href(`realizza?v=sequenza&f=${p.id}`)}"><span class="rail-n" aria-hidden="true">${i + 1}</span><span class="rail-t">${esc(p.title)}</span><span class="rail-d">${esc(when)}${p.target?.kind ? `<span class="rail-k">${esc(p.target.kind)}</span>` : ''}</span>
<span class="rail-bar" aria-hidden="true">${tot ? T_ORDER.filter((k) => n[k]).map((k) => `<i class="t-${k}" style="flex:${n[k]}"></i>`).join('') : ''}</span>
<span class="rail-c">${tot ? esc(parts.join(' · ')) : 'nessuna attività'}</span>
<span class="rail-g">${p.gateOpen ? 'Gate superato' : `Gate chiuso · ${p.missingTests.length} ${p.missingTests.length === 1 ? 'collaudo' : 'collaudi'} da registrare`}</span></a></li>`;
  }).join('')}</ol>`;
}

// ---------------------------------------------------------------------------
// 3. Matrice delle protezioni: dati × meccanismo
// ---------------------------------------------------------------------------
export const MATRIX_COLS = ['mirror', 'snapshot', 'sync', 'replica', 'backup', 'offsite', 'offline', 'transit'];
const LEVEL = {
  collaudata: ['ok', 'attiva, recupero provato'],
  non_collaudata: ['todo', 'prevista, recupero mai provato'],
  non_attiva: ['off', 'non ancora attiva'],
  non_backup: ['aid', 'aiuta, ma non è una copia indipendente'],
  obsoleta: ['bad', 'copia troppo vecchia'],
  assente: ['bad', 'copia assente'],
};

/** rows: [{dataset, copies:[{id, mechanism, readiness:{level,text}}]}] */
export function protectionMatrix(rows) {
  const cols = MATRIX_COLS.filter((m) => rows.some((r) => r.copies.some((c) => c.mechanism === m)));
  const cell = (r, m) => {
    const cs = r.copies.filter((c) => c.mechanism === m);
    if (!cs.length) return '<td class="mx-none"><span aria-hidden="true">·</span><span class="vh">nessuna</span></td>';
    return `<td>${cs.map((c) => { const [k, t] = LEVEL[c.readiness.level] || ['off', c.readiness.text]; return `<a class="mx mx-${k}" href="${href('e/' + c.id)}" title="${esc(`${MECHANISM[m]}: ${t}. ${c.readiness.text || ''}`)}"><span class="vh">${esc(t)}</span></a>`; }).join('')}</td>`;
  };
  const used = [...new Set(rows.flatMap((r) => r.copies.map((c) => (LEVEL[c.readiness.level] || ['off'])[0])))];
  const legend = Object.values(LEVEL).filter(([k], i, a) => used.includes(k) && a.findIndex((x) => x[0] === k) === i);
  return `<figure class="viz"><div class="tablewrap" tabindex="0" role="region" aria-label="Matrice delle protezioni"><table class="matrix"><caption class="vh">Per ogni insieme di dati, quali meccanismi di protezione esistono e a che punto sono</caption>
<thead><tr><th scope="col">Dati</th>${cols.map((m) => `<th scope="col">${esc(MECHANISM[m])}</th>`).join('')}<th scope="col">Copie indipendenti provate</th></tr></thead>
<tbody>${rows.map((r) => { const ok = r.copies.filter((c) => c.readiness.level === 'collaudata').length; return `<tr><th scope="row"><a href="${href('e/' + r.dataset.id)}">${esc(r.dataset.name)}</a><br><span class="small muted">${esc(r.dataset.criticality || '')}${r.dataset.excludedFromBackup ? ' · escluso dai backup' : ''}</span></th>${cols.map((m) => cell(r, m)).join('')}<td class="mx-sum ${ok ? 'has' : 'zero'}">${ok}</td></tr>`; }).join('')}</tbody></table></div>
<figcaption class="legend">${legend.map(([k, t]) => `<span><i class="mx mx-${k}" aria-hidden="true"></i>${esc(t)}</span>`).join('')}</figcaption></figure>`;
}

// ---------------------------------------------------------------------------
// 4. Frontale logico dello switch
// ---------------------------------------------------------------------------
/** rj45, sfp: numeri documentati; assigned: Map(numeroPorta → {id, label}); firstSfp: numero della prima SFP+. */
export function switchFace({ name, rj45, sfp, assigned = new Map(), rj45Note = '' }) {
  if (!Number.isInteger(rj45) || !Number.isInteger(sfp) || rj45 <= 0) return '';
  const cols = Math.ceil(rj45 / 2), P = 18, G = 5, X0 = 24, Y0 = 44, SW_ = 34, SG = 10;
  const sx0 = X0 + cols * (P + G) + 26;
  const W = sx0 + sfp * (SW_ + SG) - SG + 24, H = 132;
  let ports = '';
  for (let i = 0; i < rj45; i++) { const c = Math.floor(i / 2), r = i % 2; ports += `<rect class="sw-rj" x="${X0 + c * (P + G)}" y="${Y0 + r * (P + G)}" width="${P}" height="${P}" rx="3"/>`; }
  let sfps = '';
  for (let i = 0; i < sfp; i++) {
    const n = rj45 + 1 + i, a = assigned.get(n), x = sx0 + i * (SW_ + SG);
    const body = `<rect class="sw-sfp${a ? ' on' : ''}" x="${x}" y="${Y0 + 4}" width="${SW_}" height="${P * 2 + G - 8}" rx="4"/><text class="sw-pn" x="${x + SW_ / 2}" y="${Y0 + P * 2 + G + 14}" text-anchor="middle">${n}</text><text class="sw-dst" x="${x + SW_ / 2}" y="${Y0 - 6}" text-anchor="middle">${a ? esc(a.id) : 'libera'}</text>`;
    sfps += a ? `<a href="${href('e/' + a.id)}"><title>${esc(`Porta SFP+ ${n}: ${a.id}, ${a.label}`)}</title>${body}</a>` : `<g>${body}</g>`;
  }
  const nAss = [...assigned.keys()].filter((n) => n > rj45).length;
  return `<figure class="viz card"><div class="viz-scroll" tabindex="0" role="region" aria-label="Frontale logico dello switch"><svg class="vz-switch" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="group" aria-label="${esc(`${name}: ${rj45} porte RJ45 senza assegnazione definita, ${sfp} porte SFP+ di cui ${nAss} assegnate`)}">
<rect class="sw-chassis" x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10"/>
<text class="sw-h" x="${X0}" y="24">RJ45 1–${rj45} · 1 GbE</text><text class="sw-h" x="${sx0}" y="24">SFP+ · 10 GbE</text>
${ports}${sfps}
<text class="sw-note" x="${X0}" y="${Y0 + P * 2 + G + 14}">${esc(rj45Note || 'assegnazione non definita')}</text>
</svg></div><figcaption class="small muted">Disegno logico: conta le porte documentate e mostra le destinazioni note. La disposizione fisica sul frontale non è documentata; le porte tratteggiate non hanno ancora un'assegnazione.</figcaption></figure>`;
}

// ---------------------------------------------------------------------------
// 5. Anello del quorum
// ---------------------------------------------------------------------------
export function quorumRing(voters) {
  const n = voters.length;
  if (n < 3) return '';
  const need = Math.floor(n / 2) + 1, S = 168, C = S / 2, R = 58, r = 19;
  const pts = voters.map((v, i) => { const a = -Math.PI / 2 + (2 * Math.PI * i) / n; return [C + R * Math.cos(a), C + R * Math.sin(a), v]; });
  return `<svg class="vz-quorum" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}" role="group" aria-label="${esc(`Nucleo di ${n} macchine con voto: ${voters.map((v) => v.name).join(', ')}. Servono ${need} voti su ${n}.`)}">
<circle class="q-ring" cx="${C}" cy="${C}" r="${R}"/>
<text class="q-need" x="${C}" y="${C + 2}" text-anchor="middle">${need} su ${n}</text><text class="q-lbl" x="${C}" y="${C + 18}" text-anchor="middle">voti per decidere</text>
${pts.map(([x, y, v]) => `<a href="${href('e/' + v.id)}" aria-label="${esc(v.name)}: ${esc(v.title || '')}"><circle class="q-node" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}"/><text class="q-id" x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle">${esc(clip(v.name, 4))}</text></a>`).join('')}
</svg>`;
}
