import { badge, esc, href, phead, ctxbar, st } from '../ui.js';
import { simulate, ST, ST_LABEL, diff } from '../lib/sim.js';

const ORDER = { blocked: 0, unknown: 1, degraded: 2, on_demand: 3, available: 4 };

export function scenarioFromQuery(q) {
  const list = (k) => (q[k] ? q[k].split(',').filter(Boolean) : []);
  const events = [
    ...list('f').map((id) => ({ type: 'fail', id })), ...list('o').map((id) => ({ type: 'off', id })), ...list('on').map((id) => ({ type: 'on', id })),
    ...list('a').map((id) => ({ type: 'assumeTest', id })), ...list('af').map((id) => ({ type: 'assumeFact', id })),
    ...list('c').map((x) => { const [id, state] = x.split(':'); return { type: 'copy', id, state }; }),
  ];
  if (q.ha === '1') events.push({ type: 'haActive', id: 'CLUSTER' });
  return { events };
}
export function queryFromScenario(sc) {
  const pick = (t) => sc.events.filter((e) => e.type === t).map((e) => e.id);
  return { f: pick('fail'), o: pick('off'), on: pick('on'), a: pick('assumeTest'), af: pick('assumeFact'), c: sc.events.filter((e) => e.type === 'copy').map((e) => `${e.id}:${e.state}`), ha: sc.events.some((e) => e.type === 'haActive') ? '1' : '' };
}

export function simView(app) {
  const { core, idx } = app;
  const sc = scenarioFromQuery(app.query);
  const html = `${ctxbar([['Usa e risolvi', 'emergenza'], ['Simulatore']])}
${phead({ eyebrow: '<span class="simtag">Simulazione</span>', title: 'Che cosa succede se qualcosa manca', lead: 'Scegli che cosa si guasta o si spegne. Il calcolo usa le regole e le relazioni del modello 4.4 e spiega ogni esito. Non esegue comandi, non legge l\'impianto e non modifica il progetto.' })}
<div class="simgrid"><div id="simctl"></div><div id="simres" aria-live="polite"></div></div>`;
  return {
    title: 'Simulatore', html, keepScroll: true,
    mount: (root) => {
      let scen = sc;
      const ctl = root.querySelector('#simctl'), res = root.querySelector('#simres');
      const base = simulate(idx, {});
      const has = (type, id) => scen.events.some((e) => e.type === type && e.id === id);
      const set = (type, id, on) => { scen = { events: scen.events.filter((e) => !(e.type === type && e.id === id)).concat(on ? [{ type, id }] : []) }; };
      const nodeState = (e) => (has('fail', e.id) ? 'fail' : has('off', e.id) ? 'off' : has('on', e.id) ? 'on' : 'base');
      const update = () => { app.setQuery(queryFromScenario(scen)); renderCtl(); renderRes(); };

      function toggleRow(e) {
        const s = nodeState(e);
        const onDemand = e.power === 'on_demand' || e.power === 'manual';
        const label = { fail: 'Guasto', off: 'Spento per manutenzione', on: 'Acceso', base: onDemand ? 'Spento in attesa' : 'In funzione' }[s];
        return `<button type="button" class="toggle ${s === 'off' || s === 'on' ? 'off' : ''}" data-action="cycle" data-id="${esc(e.id)}" aria-pressed="${s !== 'base'}"><span><strong>${esc(e.name)}</strong><small>${esc(e.title || e.oneLine.slice(0, 60))}</small></span><span class="small">${esc(label)}</span></button>`;
      }
      function renderCtl() {
        const nodes = core.entities.filter((e) => e.kind === 'node');
        const grp = (t, list) => `<details open><summary>${esc(t)}</summary><div class="toggles">${list.map(toggleRow).join('')}</div></details>`;
        const tests = core.tests.filter((t) => core.relations.some((r) => r.condition && JSON.stringify(r.condition).includes(`"${t.id}"`)));
        const facts = [...new Set(core.relations.flatMap((r) => (r.condition ? (JSON.stringify(r.condition).match(/"factKnown":"([^"]+)"/g) || []).map((m) => m.split('"')[3]) : [])))];
        const copies = core.entities.filter((e) => e.kind === 'copy' && ['backup', 'offsite', 'offline'].includes(e.mechanism));
        ctl.innerHTML = `<a class="btn primary only-narrow" href="#simres" data-action="jumpres" style="margin-bottom:10px">Vai ai risultati ↓</a><div class="card"><h2 style="margin-top:0;font-size:1.05rem">Scenari tipici</h2><div class="chips">${core.scenarios.map((s) => `<button type="button" class="chip" data-action="preset" data-id="${s.id}" title="${esc(s.text)}">${esc(s.title)}</button>`).join('')}</div>
<p style="margin-top:12px"><button class="btn" type="button" data-action="reset">Torna alla situazione di riferimento</button></p></div>
${grp('Nucleo · vota', nodes.filter((n) => n.vote))}${grp('A richiesta e riserva', nodes.filter((n) => !n.vote && ['on_demand', 'manual'].includes(n.power) && /^(M|ARCA)/.test(n.id)))}${grp('Supporto ed esterni', nodes.filter((n) => /^S\d/.test(n.id)))}
${grp('Rete, linee e alimentazione', core.entities.filter((e) => ['SW', 'WAN1', 'WAN2', 'R5G', 'GRID', 'NET-VITO', 'NET-ZIGBEE'].includes(e.id)))}
${grp('Archivi', core.entities.filter((e) => ['ST-P310', 'ST-M4-BCK', 'ST-M4-MEDIA', 'ST-DRIVE'].includes(e.id)))}
${grp('Postazioni e mobile', nodes.filter((n) => !n.vote && /^(C|MP|HP|MICRO)/.test(n.id)))}
<details><summary>Stato delle copie</summary><div class="toggles">${copies.map((c) => { const cur = scen.events.find((e) => e.type === 'copy' && e.id === c.id)?.state || ''; return `<label class="f">${esc(c.name)}<select data-change="copystate" data-id="${c.id}"><option value="">come da progetto</option><option value="stale"${cur === 'stale' ? ' selected' : ''}>obsoleta</option><option value="missing"${cur === 'missing' ? ' selected' : ''}>assente</option><option value="untested"${cur === 'untested' ? ' selected' : ''}>mai provata</option></select></label>`; }).join('')}</div></details>
<details${scen.events.some((e) => e.type.startsWith('assume') || e.type === 'haActive') ? ' open' : ''}><summary>Ipotesi (non sono fatti)</summary>
<p class="small muted">Servono per vedere che cosa cambierebbe se una prova fosse superata o un dato fosse noto. Sono marcate come ipotesi nei risultati e non modificano il progetto.</p>
<div class="toggles">${tests.map((t) => `<button type="button" class="toggle off" data-action="assume" data-id="${t.id}" aria-pressed="${has('assumeTest', t.id)}"><span><strong>Supponi superato: ${esc(t.name)}</strong><small>${esc(t.criterion)}</small></span></button>`).join('')}
${facts.map((f) => `<button type="button" class="toggle off" data-action="assumefact" data-id="${f}" aria-pressed="${has('assumeFact', f)}"><span><strong>Supponi sufficiente: ${esc(f.replace('.', ' · '))}</strong><small>${esc(idx.get(f.split('.')[0])?.facts?.[f.split('.')[1]]?.note || '')}</small></span></button>`).join('')}
<button type="button" class="toggle off" data-action="ha" aria-pressed="${has('haActive', 'CLUSTER')}"><span><strong>Supponi HA attiva</strong><small>Nella baseline l'HA non è attiva finché manca evidenza.</small></span></button></div></details>
<details><summary>Scenari salvati su questo dispositivo</summary><p class="small muted">Restano nel browser; non sono parte del progetto.</p>
<label class="f">Nome<input type="text" id="scname" maxlength="80" placeholder="es. Natale senza M2"></label><p><button class="btn" type="button" data-action="savesc">Salva questo scenario</button></p>
<ul class="list">${app.data.scenarios.map((s, i) => `<li><button class="chip" type="button" data-action="loadsc" data-i="${i}">${esc(s.name)}</button> <button class="chip" type="button" data-action="delsc" data-i="${i}" aria-label="Elimina ${esc(s.name)}">×</button></li>`).join('') || '<li class="muted small">Nessuno.</li>'}</ul></details>`;
      }
      function chain(sim, r, depth = 0, seen = new Set()) {
        if (!r.cause || depth > 4 || seen.has(r.cause)) return '';
        seen.add(r.cause);
        const c = sim.status(r.cause);
        const first = c.reasons.find((x) => x.status === c.status);
        if (!first) return '';
        return `<li>${esc(idx.get(r.cause)?.name || r.cause)}: ${esc(first.text)}${first.why?.length ? ` <span class="small muted">(${esc(first.why.join('; '))})</span>` : ''}<ul>${chain(sim, first, depth + 1, seen)}</ul></li>`;
      }
      function renderRes() {
        const sim = simulate(idx, scen);
        const q = sim.quorum;
        const svcs = core.entities.filter((e) => e.kind === 'service' && e.activities?.length);
        const changed = new Set(diff(base, sim, core.entities.map((e) => e.id)).map((d) => d.id));
        const sorted = svcs.map((e) => ({ e, s: sim.status(e.id) })).sort((a, b) => ORDER[a.s.status] - ORDER[b.s.status] || (changed.has(b.e.id) - changed.has(a.e.id)));
        const counts = Object.keys(ORDER).map((k) => [k, sorted.filter((x) => x.s.status === k).length]);
        const hyp = scen.events.filter((e) => e.type.startsWith('assume') || e.type === 'haActive');
        const missing = [...new Set(sorted.flatMap((x) => x.s.reasons.filter((r) => r.status === ST.UNKNOWN).flatMap((r) => [r.text, ...(r.why || [])])))].filter((t) => /non ancora eseguito|dato mancante|non documentat|non determinabil|n\.d\./.test(t));
        const procs = core.procedures.filter((p) => p.entities.some((id) => scen.events.some((e) => e.id === id) || changed.has(id)));
        const datasets = core.entities.filter((e) => e.kind === 'dataset' && sim.status(e.id).status !== ST.AVAILABLE && sim.status(e.id).status !== ST.ON_DEMAND);
        const vote = (m) => `<span class="vote ${({ hub: '', maybe: 'maybe', isolated: 'iso', down: 'down' })[q.members[m]]}" title="${esc(m)}: ${({ hub: 'collegato', maybe: 'incerto', isolated: 'isolato', down: 'fermo' })[q.members[m]]}"></span>`;
        res.innerHTML = `<div class="callout sim"><strong><span class="simtag">Simulazione</span> ${scen.events.length ? `${scen.events.filter((e) => !e.type.startsWith('assume')).length} eventi${hyp.length ? `, ${hyp.length} ipotesi` : ''}` : 'Situazione di riferimento'}</strong>Calcolo sul modello del progetto: non è telemetria e non dimostra il funzionamento reale. ${changed.size ? `${changed.size} elementi cambiano rispetto al riferimento (bordo viola).` : ''}</div>
<div class="card"><h2 style="margin-top:0;font-size:1.05rem">Quorum del nucleo</h2>
<div class="quorum" aria-hidden="true">${Object.keys(q.members).map(vote).join('')}</div>
<p>${q.hubQuorum === true ? badge('available', 'Quorum presente') : q.hubQuorum === null ? badge('unknown', 'Quorum incerto') : badge('blocked', 'Quorum assente')} Partizione principale: <strong>${q.min}${q.max > q.min ? `–${q.max}` : ''} voti</strong> su ${q.total}; ne servono ${q.need}.${q.isolated.length ? ` Isolati: ${q.isolated.map(esc).join(', ')} (1 voto ciascuno, senza quorum).` : ''}${q.hubMaybe.length ? ` Incerti: ${q.hubMaybe.map(esc).join(', ')}.` : ''}</p>
<p class="small muted">I voti si contano per partizione connessa, non sommando le macchine accese. Il quorum dice se il gruppo può decidere; non prova che i servizi possano ripartire. Senza quorum, i guest già avviati non HA continuano secondo la documentazione Proxmox, ma non si possono avviare né spostare; il comportamento con HA attiva dipende dal fencing, non documentato.</p></div>
<div class="statusline" style="margin:14px 0">${counts.map(([k, n]) => `${st(k)} <strong>${n}</strong>`).join(' ')}</div>
<h2 style="font-size:1.1rem">Che cosa puoi fare</h2>
${sorted.map(({ e, s }) => {
          const imp = sim.impact(e.id);
          const acc = sim.access(e.id);
          const main = s.reasons.filter((r) => r.status !== ST.AVAILABLE);
          return `<div class="result ${changed.has(e.id) ? 'changed' : ''}"><div class="rh"><a href="${href('e/' + e.id)}"><strong>${esc(e.name)}</strong></a> ${st(s.status)}</div>
<ul>${imp.map((i) => `<li>${esc(i.text)}</li>`).join('')}</ul>
${acc.remote && s.status !== ST.BLOCKED ? `<p class="small">Da fuori casa: ${st(acc.remote.status)} ${esc(acc.remote.reasons.map((r) => r.text).join('; '))}</p>` : ''}
${main.length ? `<details><summary>Perché</summary><ul>${main.map((r) => `<li>${esc(r.text)}${r.why?.length ? `<ul>${r.why.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>` : ''}${r.cause ? `<ul>${chain(sim, r)}</ul>` : ''}</li>`).join('')}</ul></details>` : ''}</div>`;
        }).join('')}
${datasets.length ? `<h2 style="font-size:1.1rem">Dati coinvolti</h2>${datasets.map((d) => { const p = sim.protection(d.id); return `<div class="result"><div class="rh"><a href="${href('e/' + d.id)}"><strong>${esc(d.name)}</strong></a> ${st(p.verdict.status)}</div><p class="small">${esc(p.verdict.text)}</p></div>`; }).join('')}` : ''}
${missing.length ? `<h2 style="font-size:1.1rem">Informazioni mancanti per decidere</h2><ul>${missing.slice(0, 12).map((m) => `<li>${esc(m)}</li>`).join('')}</ul><p class="small"><a href="${href('contribuisci')}">Domande aperte e prove da eseguire</a></p>` : ''}
${procs.length ? `<h2 style="font-size:1.1rem">Procedure pertinenti</h2><ul>${procs.map((p) => `<li><a href="${href('procedura/' + p.id)}">${esc(p.symptom)}</a></li>`).join('')}</ul>` : ''}
<p><button class="btn ghost" type="button" data-action="sharesim">Copia collegamento allo scenario</button></p>`;
      }
      app.on('cycle', (el) => {
        const e = idx.get(el.dataset.id);
        const onDemand = e.power === 'on_demand' || e.power === 'manual';
        const s = nodeState(e);
        scen = { events: scen.events.filter((x) => !(['fail', 'off', 'on'].includes(x.type) && x.id === e.id)) };
        const next = onDemand ? { base: 'on', on: 'fail', fail: 'base' }[s] : { base: 'fail', fail: 'off', off: 'base' }[s];
        if (next !== 'base') scen.events.push({ type: next, id: e.id });
        update();
        root.querySelector(`[data-action=cycle][data-id="${CSS.escape(e.id)}"]`)?.focus();
      });
      app.on('preset', (el) => { scen = { events: structuredClone(core.scenarios.find((s) => s.id === el.dataset.id).events) }; update(); app.toast(core.scenarios.find((s) => s.id === el.dataset.id).title); });
      app.on('reset', () => { scen = { events: [] }; update(); app.toast('Situazione di riferimento'); });
      app.on('assume', (el) => { set('assumeTest', el.dataset.id, !has('assumeTest', el.dataset.id)); update(); });
      app.on('assumefact', (el) => { set('assumeFact', el.dataset.id, !has('assumeFact', el.dataset.id)); update(); });
      app.on('ha', () => { set('haActive', 'CLUSTER', !has('haActive', 'CLUSTER')); update(); });
      app.on('copystate', (el) => { scen = { events: scen.events.filter((x) => !(x.type === 'copy' && x.id === el.dataset.id)).concat(el.value ? [{ type: 'copy', id: el.dataset.id, state: el.value }] : []) }; update(); });
      app.on('savesc', () => { const n = root.querySelector('#scname').value.trim() || `Scenario ${app.data.scenarios.length + 1}`; app.data.scenarios.push({ name: n, events: scen.events }); app.persist(); renderCtl(); app.toast('Scenario salvato su questo dispositivo'); });
      app.on('loadsc', (el) => { scen = { events: structuredClone(app.data.scenarios[+el.dataset.i].events) }; update(); });
      app.on('delsc', (el) => { app.data.scenarios.splice(+el.dataset.i, 1); app.persist(); renderCtl(); });
      app.on('jumpres', () => { res.scrollIntoView({ block: 'start' }); res.querySelector('h2,strong')?.closest('div')?.setAttribute('tabindex', '-1'); res.firstElementChild?.focus?.(); });
      app.on('sharesim', () => navigator.clipboard?.writeText(location.href).then(() => app.toast('Collegamento copiato'), () => app.toast(location.href)));
      renderCtl(); renderRes();
    },
  };
}
void ST_LABEL;
