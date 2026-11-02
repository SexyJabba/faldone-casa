import { badge, esc, href, phead, ctxbar, dims, st, table, factValue, mech, ev } from '../ui.js';
import { simulate } from '../lib/sim.js';

const POWER = { always: 'sempre acceso', on_demand: 'a richiesta', manual: 'manuale', external: 'esterno' };

export function explore(app) {
  const { core } = app;
  const n = (k) => core.entities.filter((e) => e.kind === k).length;
  const html = `${phead({ eyebrow: 'Esplora', title: 'Esplorare l\'infrastruttura', lead: 'Per ambito, per luogo, per elemento o seguendo il percorso dei dati. Ogni elemento apre la sua scheda con relazioni, stato e fonti.' })}
<p><a class="btn primary" href="#atlante">Apri l’atlante delle funzioni →</a></p><h2>Per ambito</h2><div class="grid">${core.scopes.map((s) => `<a class="tile scope-bar" data-scope="${s.id}" href="${href('ambito/' + s.id)}"><span class="t">${esc(s.name)}</span><p>${esc(s.tagline)}</p><span class="meta small muted">${core.entities.filter((e) => e.scopes?.includes(s.id)).length} elementi</span></a>`).join('')}</div>
<h2>Per tipo di elemento</h2><div class="grid tight">
<a class="tile" href="${href('esplora/macchine')}"><span class="t">Macchine</span><p>${n('node')} nodi: server, supporti, client, mobile.</p></a>
<a class="tile" href="${href('esplora/servizi')}"><span class="t">Servizi</span><p>${n('service')} servizi con ciò che permettono di fare.</p></a>
<a class="tile" href="${href('esplora/dati')}"><span class="t">Dati e copie</span><p>${n('dataset')} insiemi di dati, ${n('storage')} archivi, ${n('copy')} protezioni.</p></a>
<a class="tile" href="${href('esplora/rete')}"><span class="t">Rete</span><p>${n('network')} reti e collegamenti, WAN, VLAN, radio.</p></a>
<a class="tile" href="${href('esplora/rack')}"><span class="t">Rack e porte</span><p>Vista logica del rack e dello switch.</p></a>
<a class="tile" href="${href('inventario')}"><span class="t">Inventario</span><p>${core.meta.counts.inventory} voci con assegnazione e foto.</p></a></div>
<h2>Viste collegate</h2><div class="grid">
<a class="tile" href="${href('mappa')}"><span class="t">Mappa relazionale</span><p>Livelli selezionabili: rete, hosting, dati, copie, quorum, alimentazione, accensione, accesso, radio.</p></a>
<a class="tile" href="${href('percorsi')}"><span class="t">Percorsi leggibili</span><p>${core.paths.map((p) => esc(p.title)).join(' · ')}</p></a>
<a class="tile" href="${href('simula')}"><span class="t">Simulatore</span><p>Che cosa succede se un elemento manca, e perché.</p></a></div>`;
  return { title: 'Esplora', html };
}

export function scope(app, [id]) {
  const { core } = app;
  const s = core.scopes.find((x) => x.id === id);
  if (!s) return { title: 'Ambito', html: '<p>Ambito non trovato.</p>' };
  if (id === 'inventario') return import('./docs.js').then((m) => m.inventory(app, [], s));
  const els = core.entities.filter((e) => e.scopes?.includes(id));
  const by = (k) => els.filter((e) => e.kind === k);
  const sect = (t, list) => (list.length ? `<h2>${t}</h2><div class="grid tight">${list.map((e) => `<a class="tile" href="${href('e/' + e.id)}"><span class="t"><span class="code">${esc(e.id)}</span> ${esc(e.name)}</span><p>${esc(e.oneLine)}</p></a>`).join('')}</div>` : '');
  const world = null;
  void world;
  const html = `${ctxbar([['Esplora', 'esplora'], [s.name]])}<div data-scope="${s.id}" class="scope-bar" style="padding-top:8px">${phead({ eyebrow: 'Ambito', title: s.name, lead: esc(app.depth === 'capire' ? s.simple : s.tagline + ' ' + s.simple) })}</div>
<p class="small">Schede di riferimento: ${s.cards.map((c) => `<a class="code" href="${href(c)}">${esc(c)}</a>`).join(' · ')}</p>
${sect('Servizi', by('service'))}${sect('Macchine e apparati', [...by('node'), ...by('device')])}${sect('Dati, archivi e copie', [...by('dataset'), ...by('storage'), ...by('copy')])}${sect('Reti', by('network'))}${sect('Luoghi', by('place'))}`;
  return { title: s.name, html };
}

export function list(app, [what]) {
  const { core, idx } = app;
  const base = simulate(idx, {});
  if (what === 'macchine') {
    const cmp = (app.query.cmp || '').split(',').filter((x) => idx.get(x));
    const nodes = core.entities.filter((e) => e.kind === 'node');
    app.on('cmp', (el) => {
      const set = new Set(cmp);
      set.has(el.dataset.id) ? set.delete(el.dataset.id) : set.add(el.dataset.id);
      app.setQuery({ cmp: [...set] }); app.go(app.route + (set.size ? '?cmp=' + [...set].join(',') : ''), { replace: true });
    });
    const compare = cmp.length ? `<section class="card" aria-labelledby="h-cmp"><h2 id="h-cmp" style="margin-top:0">Confronto (${cmp.length})</h2>${table(['Voce', ...cmp.map((c) => esc(c))], [
      ['Ruolo', ...cmp.map((c) => esc(idx.get(c).title))],
      ['Accensione', ...cmp.map((c) => esc(POWER[idx.get(c).power] || '—'))],
      ['Voto', ...cmp.map((c) => (idx.get(c).vote ? 'sì' : 'no'))],
      ['Processore', ...cmp.map((c) => factValue(idx.get(c).hardware?.cpu))],
      ['RAM', ...cmp.map((c) => factValue(idx.get(c).hardware?.ram))],
      ['TDP CPU (non consumo)', ...cmp.map((c) => factValue(idx.get(c).hardware?.tdp))],
      ['Servizi', ...cmp.map((c) => idx.in(c, 'hosted_on').map((r) => esc(idx.get(r.fromId).name)).join(', ') || '—')],
      ['Realizzazione', ...cmp.map((c) => esc(idx.get(c).status.realization || '—'))],
    ])}<p class="small muted">Tocca ancora una macchina per toglierla dal confronto.</p></section>` : '';
    const html = `${ctxbar([['Esplora', 'esplora'], ['Macchine']])}${phead({ eyebrow: 'Esplora', title: 'Macchine', lead: 'Server, supporti, client e mobile. «A richiesta» significa spento finché non serve: non è un guasto.' })}${compare}
${table(['Sigla', 'Ruolo', 'Accensione', 'Voto', 'Stato', 'Confronta'], nodes.map((e) => [`<a href="${href('e/' + e.id)}"><span class="code">${esc(e.id)}</span></a>`, `<a href="${href('e/' + e.id)}">${esc(e.title || e.name)}</a><br><span class="small muted">${esc(e.oneLine)}</span>`, esc(POWER[e.power] || '—'), e.vote ? 'sì' : '—', dims(e.status, { compact: true }), `<button class="chip" type="button" data-action="cmp" data-id="${esc(e.id)}" aria-pressed="${cmp.includes(e.id)}">${cmp.includes(e.id) ? 'Nel confronto' : 'Confronta'}</button>`]), { caption: 'Macchine' })}`;
    return { title: 'Macchine', html, keepScroll: !!cmp.length };
  }
  if (what === 'servizi') {
    const svcs = core.entities.filter((e) => e.kind === 'service');
    const html = `${ctxbar([['Esplora', 'esplora'], ['Servizi']])}${phead({ eyebrow: 'Esplora', title: 'Servizi', lead: 'Che cosa si può fare, su quale macchina gira, e lo stato calcolato nella situazione di riferimento.' })}
<p class="small"><span class="simtag">Modello</span> La colonna «Di riferimento» è calcolata dal modello con il nucleo acceso e i server a richiesta spenti. Non è un'osservazione.</p>
${table(['Servizio', 'Permette di', 'Gira su', 'Per chi', 'Di riferimento'], svcs.map((e) => {
      const h = idx.out(e.id, 'hosted_on')[0]?.toId;
      return [`<a href="${href('e/' + e.id)}">${esc(e.name)}</a>`, esc((e.activities || []).map((a) => a.text).join('; ') || e.title), h ? `<a href="${href('e/' + h)}" class="code">${esc(h)}</a>` : '<span class="muted">esterno</span>', esc(e.audience || '—'), st(base.status(e.id).status)];
    }), { caption: 'Servizi' })}`;
    return { title: 'Servizi', html };
  }
  if (what === 'dati') {
    const ds = core.entities.filter((e) => e.kind === 'dataset');
    const html = `${ctxbar([['Esplora', 'esplora'], ['Dati e copie']])}${phead({ eyebrow: 'Esplora', title: 'Dati e copie', lead: 'Dove sta ogni insieme di dati, quali copie lo proteggono e se un recupero è stato provato.' })}
<div class="callout"><strong>Sei cose diverse</strong>Ridondanza (mirror, RAIDZ) evita il fermo per un disco guasto. Snapshot permette di tornare indietro, sullo stesso disco. Sincronizzazione e replica copiano anche gli errori. Backup versionato e copia offline permettono di recuperare dopo un errore o un disastro, ma solo se il recupero è provato.</div>
${table(['Dati', 'Criticità', 'Originale', 'Protezioni', 'Recupero provato'], ds.map((d) => {
      const pr = base.protection(d.id);
      const where = idx.out(d.id, 'stores_on')[0]?.toId;
      return [`<a href="${href('e/' + d.id)}">${esc(d.name)}</a>`, esc(d.criticality || '—'), where ? `<a href="${href('e/' + where)}">${esc(idx.get(where).name)}</a>` : '—', pr.copies.map((c) => `<a href="${href('e/' + c.id)}">${esc(mech(c.mechanism))}</a>`).join(', ') || (d.excludedFromBackup ? 'escluso dai backup' : '—'), pr.copies.some((c) => c.readiness.level === 'collaudata') ? badge('available', 'sì') : badge('unknown', 'no')];
    }), { caption: 'Dati' })}
<h2>Archivi</h2>${table(['Archivio', 'Ridondanza', 'Su', 'Decisione'], core.entities.filter((e) => e.kind === 'storage').map((s) => [`<a href="${href('e/' + s.id)}">${esc(s.name)}</a>`, esc(s.redundancy || '—'), esc(idx.out(s.id, 'hosted_on')[0]?.toId || idx.get(s.place)?.name || '—'), esc(s.status.decision || '—')]))}`;
    return { title: 'Dati e copie', html };
  }
  if (what === 'rete') {
    const nets = core.entities.filter((e) => e.kind === 'network' || e.kind === 'device');
    const links = core.relations.filter((r) => r.type === 'connected_to');
    const html = `${ctxbar([['Esplora', 'esplora'], ['Rete']])}${phead({ eyebrow: 'Esplora', title: 'Rete e collegamenti', lead: 'Uscite su Internet, switch, reti separate, radio. VLAN, subnet e nomi non sono ancora assegnati: non vengono inventati.' })}
<div class="grid tight">${nets.map((e) => `<a class="tile" href="${href('e/' + e.id)}"><span class="t">${esc(e.name)}</span><p>${esc(e.oneLine)}</p></a>`).join('')}</div>
<h2>Collegamenti documentati</h2>${table(['Da', 'A', 'Collegamento', 'Natura'], links.map((r) => [`<a href="${href('e/' + r.fromId)}">${esc(idx.get(r.fromId)?.name)}</a>`, `<a href="${href('e/' + r.toId)}">${esc(idx.get(r.toId)?.name)}</a>`, esc(r.label || '—'), ev(r.evidenceKind)]))}
<p><a href="${href('mappa?l=rete')}">Vedi i collegamenti sulla mappa</a></p>`;
    return { title: 'Rete', html };
  }
  if (what === 'rack') return rack(app);
  return { title: 'Esplora', html: '' };
}

function rack(app) {
  const { idx, core } = app;
  const sw = idx.get('SW');
  const sfp = core.relations.filter((r) => r.type === 'connected_to' && r.toId === 'SW' && /SFP\+ (\d+)/.test(r.label || ''));
  const port = (n) => sfp.find((r) => r.label.includes(`SFP+ ${n}`));
  const inRack = core.entities.filter((e) => e.place === 'P-SALA' && (e.kind === 'node' || e.kind === 'device'));
  const html = `${ctxbar([['Esplora', 'esplora'], ['Rack e porte']])}${phead({ eyebrow: 'Sala server', title: 'Rack e porte', lead: 'Rappresentazione logica: le posizioni in U, le stanze e le porte RJ45 non sono documentate e non vengono assegnate per riempire il disegno.' })}
<div class="callout warn"><strong>Vista logica, non fisica</strong>${esc(idx.get('P-SALA').facts.coordinate.note)} Fonte: <a href="${href('REV4-RACK')}">REV4-RACK</a>.</div>
<h2>Switch ${esc(sw.name)}</h2>
<p>${factValue(sw.facts.rj45)} · ${factValue(sw.facts.sfp)} · PoE: ${factValue(sw.facts.poe)} · ${dims(sw.status, { compact: true })}</p>
<div class="tablewrap" tabindex="0" role="region" aria-label="Tabella"><table><caption class="vh">Porte SFP+ dello switch</caption><thead><tr><th scope="col">Porta</th><th scope="col">Velocità</th><th scope="col">Destinazione</th><th scope="col">Interfaccia</th><th scope="col">Natura</th></tr></thead><tbody>
${[49, 50, 51, 52].map((n) => { const r = port(n); return `<tr><th scope="row">SFP+ ${n}</th><td>10 GbE</td><td>${r ? `<a href="${href('e/' + r.fromId)}">${esc(r.fromId)}</a>` : '<span class="muted">libera</span>'}</td><td>${esc(r?.label || '—')}</td><td>${r ? ev(r.evidenceKind) : '—'}</td></tr>`; }).join('')}
<tr><th scope="row">RJ45 1–48</th><td>1 GbE</td><td colspan="2">${esc(sw.facts.rj45Assignment.note)}</td><td>${ev('unknown')}</td></tr></tbody></table></div>
<h2>Elementi nella sala server</h2>
${table(['Elemento', 'Funzione', 'Alimentazione', 'Collegamenti', 'Etichetta'], inRack.map((e) => [`<a href="${href('e/' + e.id)}"><span class="code">${esc(e.id)}</span> ${esc(e.name)}</a>`, esc(e.title || ''), idx.out(e.id, 'powered_by').map((r) => `${esc(idx.get(r.toId).name)} ${ev(r.evidenceKind)}`).join('') || '<span class="muted">n.d.</span>', idx.out(e.id, 'connected_to').map((r) => esc(r.label || idx.get(r.toId).name)).join('<br>') || '—', `<a href="${href('e/' + e.id)}#etichetta" data-action="label" data-id="${esc(e.id)}">Etichetta</a>`]))}
<div id="labelbox"></div>`;
  return {
    title: 'Rack e porte', html,
    mount: () => {
      app.on('label', async (el) => {
        const { qrSvg } = await import('../lib/qr.js');
        const e = idx.get(el.dataset.id);
        const url = `${location.origin}${location.pathname}#e/${e.id}`;
        document.getElementById('labelbox').innerHTML = `<div class="card" style="display:flex;gap:16px;align-items:center;max-width:520px;margin-top:16px"><div style="width:140px;background:#fff;padding:6px">${qrSvg(url)}</div><div><strong style="font:700 1.6rem var(--mono)">${esc(e.id)}</strong><br>${esc(e.name)} · ${esc(e.title || '')}<br><span class="small muted">Apre la scheda pubblica. Nessun dato riservato nel codice: solo l'indirizzo della pagina.</span><br><button class="btn" type="button" data-action="print">Stampa</button></div></div>`;
        document.getElementById('labelbox').scrollIntoView({ block: 'nearest' });
      });
    },
  };
}
