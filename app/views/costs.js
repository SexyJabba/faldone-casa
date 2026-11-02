import { bars } from '../lib/charts.js';
import { esc, href, phead, ctxbar, ev, fmt, table } from '../ui.js';
import { energyTotals, transferTime, toBytes, poolNominal, savings } from '../lib/energy.js';

export function costs(app) {
  const { core } = app;
  const E = core.energy;
  const docRows = () => E.profiles.map((p) => ({ ...p }));
  const tabsKey = app.query.s === 'B' ? 'B' : 'A';
  // due scenari ipotetici confrontabili, separati dai valori del Faldone
  const saved = app.data.energy?.scenarios || {};
  let sc = { A: saved.A || { tariff: E.defaultTariff.value, rows: docRows() }, B: saved.B || { tariff: E.defaultTariff.value, rows: docRows() } };
  if (app.data.energy?.rows && !saved.A) { // migrazione dai valori del calcolatore 4.4
    sc.A = { tariff: app.data.energy.tariff ?? E.defaultTariff.value, rows: docRows().map((r) => ({ ...r, ...(app.data.energy.rows.find((x) => x.id === r.id) || {}) })) };
  }
  const html = `${ctxbar([['Realizza', 'realizza'], ['Costi ed energia']])}${phead({ eyebrow: 'Realizza', title: 'Energia, costi, capacità e trasferimenti', lead: 'Nessun consumo è ancora misurato: i valori di partenza sono le stime del calcolatore 4.4, marcate come stime. Puoi confrontare due scenari ipotetici; il progetto non cambia.' })}
<div class="callout warn"><strong>Stime, non misure</strong>${esc(E.note)}</div>
<div class="seg" role="group" aria-label="Scenario">${['A', 'B'].map((k) => `<button type="button" data-action="esc" data-v="${k}" aria-pressed="${tabsKey === k}">Scenario ${k}</button>`).join('')}</div>
<div id="energy"></div>
<h2>Confronto fra scenari</h2><div id="ecmp"></div>
<h2>Tempo di trasferimento</h2><div class="card"><div class="formgrid">
<label class="f">Quantità<input type="number" min="0" step="0.1" value="2" id="tq" data-input="tcalc"></label>
<label class="f">Unità<select id="tu" data-change="tcalc"><option>TB</option><option>TiB</option><option>GB</option><option>GiB</option></select></label>
<label class="f">Banda (Mbit/s)<input type="number" min="0" step="0.5" value="${E.transfer.defaultUploadMbit}" id="tb" data-input="tcalc"></label>
<label class="f">Efficienza (0–1)<input type="number" min="0.05" max="1" step="0.05" value="${E.transfer.defaultEfficiency}" id="te" data-input="tcalc"></label></div>
<div id="tout" aria-live="polite"></div><p class="small muted">${esc(E.transfer.note)} La banda di 4 Mbit/s è il valore censito della FTTC (${ev('declared')}). Il tempo reale dipende anche da pause, dati che cambiano durante la copia e banda disponibile; la velocità della scheda di rete non dice nulla sulla velocità dei dischi.</p></div>
<h2>Capacità dei pool</h2>${table(['Archivio', 'Dischi', 'Disposizione', 'Nominale calcolata', 'Utile', 'Occupata'], [
    ['Backup WD (M4)', '6 × 1 TB', 'RAIDZ2', `${fmt(poolNominal('raidz2', 6, 1))} TB`, '<span class="muted">n.d.: dipende da filesystem e versioni</span>', '<span class="muted">n.d.</span>'],
    ['Media (M4)', '4 × 2 TB', 'RAIDZ1 (da chiarire)', `${fmt(poolNominal('raidz1', 4, 2))} TB · mirror a coppie: ${fmt(poolNominal('mirror-pairs', 4, 2))} TB`, '<span class="muted">n.d.</span>', '<span class="muted">n.d.</span>'],
    ['P310 (M2)', '1 × 4 TB', 'singolo', `${fmt(poolNominal('single', 1, 4))} TB`, '<span class="muted">n.d.</span>', '<span class="muted">n.d.</span>'],
    ['Drive', '—', 'remoto', '—', '5 TB liberi dichiarati ' + ev('declared'), '<span class="muted">n.d.</span>'],
  ])}<p class="small muted">Nominale = dischi × taglia meno parità. Una copia non è spazio libero; le versioni del backup consumano spazio.</p>
<h2>Self-hosting e abbonamenti</h2><div id="sav"></div>`;
  return {
    title: 'Costi ed energia', html, keepScroll: true,
    mount: (root) => {
      let cur = tabsKey;
      const persist = () => { app.data.energy = { ...(app.data.energy || {}), scenarios: sc }; app.persist(); };
      const sv = structuredClone(app.data.energy?.savings || E.savings);
      function draw() {
        const s = sc[cur];
        const t = energyTotals(s.rows, s.tariff);
        const row = (r, i) => `<tr><th scope="row">${esc(r.label)}${r.documentedMaxW ? `<br><span class="small muted">massimo da datasheet ${r.documentedMaxW} W</span>` : ''}</th>${['idleW', 'loadW', 'hoursOn', 'hoursLoad'].map((k) => `<td><input class="num" type="number" min="0" step="${k.startsWith('hours') ? 0.5 : 1}" value="${r[k] ?? ''}" data-change="erow" data-i="${i}" data-k="${k}" aria-label="${esc(r.label)} ${({ idleW: 'watt a riposo', loadW: 'watt sotto carico', hoursOn: 'ore accese al giorno', hoursLoad: 'ore sotto carico' })[k]}"></td>`).join('')}<td>${t.rows[i].day.value === null ? `<span class="small" style="color:var(--bad)">${esc(t.rows[i].day.errors.join('; '))}</span>` : fmt(t.rows[i].day.value * 365, 0) + ' kWh'}</td></tr>`;
        root.querySelector('#energy').innerHTML = `<div class="card"><div class="formgrid"><label class="f">Tariffa (€/kWh)<input type="number" min="0" step="0.01" value="${s.tariff ?? ''}" data-change="etariff"></label><div><button class="btn ghost" type="button" data-action="ereset">Ripristina i valori del Faldone</button></div></div>
<p class="statusline"><span class="dim"><b>Media</b>${fmt(t.avgW)} W</span><span class="dim"><b>Mese</b>${fmt(t.kwhMonth)} kWh</span><span class="dim"><b>Anno</b>${fmt(t.kwhYear)} kWh</span><span class="dim"><b>Costo annuo</b>${t.eurYear === null ? 'n.d.' : fmt(t.eurYear) + ' €'}</span> ${ev('estimated')}${t.complete ? '' : ` <span class="dim d-da_chiarire">${t.missing.length} profili esclusi per dati non validi</span>`}</p>
<div class="tablewrap" tabindex="0" role="region" aria-label="Tabella"><table><caption class="vh">Profili di consumo</caption><thead><tr><th>Elemento</th><th>W riposo</th><th>W carico</th><th>Ore accese</th><th>Ore carico</th><th>Energia annua</th></tr></thead><tbody>${s.rows.map(row).join('')}</tbody></table></div>
<p class="small muted">Formula: kWh = (W a riposo × ore a riposo + W sotto carico × ore sotto carico) / 1000. Mese = 365/12 giorni. Il TDP del processore non è usato.</p>
${bars('Energia annua per componente · profili validi',t.contributions.map(c=>({label:c.label,value:c.kwhYear})),'kWh/anno')}<h3>Principali contributi</h3>${t.contributions.slice(0, 6).map((c) => `<div style="display:grid;grid-template-columns:160px 1fr 70px;gap:8px;align-items:center;font-size:.9rem"><span>${esc(c.label)}</span><div class="bar" aria-hidden="true"><i style="width:${(c.share * 100).toFixed(1)}%"></i></div><span>${fmt(c.share * 100)}%</span></div>`).join('')}</div>`;
        const ta = energyTotals(sc.A.rows, sc.A.tariff), tb = energyTotals(sc.B.rows, sc.B.tariff);
        root.querySelector('#ecmp').innerHTML = bars('Energia annua · confronto delle ipotesi', [{label:'Scenario A',value:ta.kwhYear},{label:'Scenario B',value:tb.kwhYear}], 'kWh/anno') + bars('Costo annuo · confronto delle ipotesi', [{label:'Scenario A',value:ta.eurYear},{label:'Scenario B',value:tb.eurYear}], '€/anno') + table(['Valore', 'Scenario A', 'Scenario B', 'Differenza'], [['kWh/anno', fmt(ta.kwhYear), fmt(tb.kwhYear), fmt(tb.kwhYear - ta.kwhYear)], ['€/anno', fmt(ta.eurYear), fmt(tb.eurYear), ta.eurYear === null || tb.eurYear === null ? 'n.d.' : fmt(tb.eurYear - ta.eurYear)], ['W medi', fmt(ta.avgW), fmt(tb.avgW), fmt(tb.avgW - ta.avgW)]]) + '<p class="small muted">Scenari ipotetici salvati su questo dispositivo: non cambiano l\'hardware né il progetto.</p>';
        const s2 = savings({ ...sv, energyEurYear: energyTotals(sc.A.rows, sc.A.tariff).eurYear, hardware: core.acquisitions, includeProposed: !!sv.includeProposed });
        root.querySelector('#sav').innerHTML = `<div class="card"><p class="small muted">${esc(E.savings.note)} Energia dallo scenario A.</p>
<div class="tablewrap" tabindex="0" role="region" aria-label="Tabella"><table><thead><tr><th>Conta</th><th>Servizio</th><th>Alternativa</th><th>€/mese</th></tr></thead><tbody>${sv.rows.map((r, i) => `<tr><td><input type="checkbox" data-change="svon" data-i="${i}" ${r.on ? 'checked' : ''} aria-label="Conta ${esc(r.label)}"></td><th scope="row">${esc(r.label)}</th><td>${esc(r.alt)}</td><td><input class="num" type="number" min="0" step="0.5" value="${r.eurMonth}" data-change="sveur" data-i="${i}" aria-label="Prezzo ${esc(r.label)}"></td></tr>`).join('')}</tbody></table></div>
<label style="display:flex;gap:8px;align-items:center"><input type="checkbox" data-change="svprop" ${sv.includeProposed ? 'checked' : ''}> includi anche gli acquisti proposti (non ancora fatti)</label>
<p class="statusline"><span class="dim"><b>Abbonamenti/anno</b>${fmt(s2.cloudYear)} €</span><span class="dim"><b>Esercizio/anno</b>${fmt(s2.ownYear)} €${s2.energyKnown ? '' : ' (energia n.d.)'}</span><span class="dim"><b>Hardware contato</b>${fmt(s2.hardware)} €</span><span class="dim"><b>In ${sv.years} anni</b>${s2.difference >= 0 ? 'abbonamenti più cari di' : 'self-hosting più caro di'} ${fmt(Math.abs(s2.difference))} €</span></p>
<p class="small muted">Hardware: solo voci acquistate, dichiarate o ordinate con importo noto${s2.hardwareUnknown.length ? `; ${s2.hardwareUnknown.join(', ')} senza prezzo comunicato (non stimato)` : ''}. Manutenzione ${fmt(sv.maintEurYear)} €/anno e dominio ${fmt(sv.domainEurYear)} €/anno sono valori di esempio. Nessun risparmio è garantito: il tempo di gestione non è quantificato.</p></div>`;
      }
      let rt; const redraw = () => { clearTimeout(rt); rt = setTimeout(draw, 0); };
      function tcalc() {
        const b = toBytes(root.querySelector('#tq').value, root.querySelector('#tu').value);
        const r = transferTime(b, root.querySelector('#tb').value, root.querySelector('#te').value);
        root.querySelector('#tout').innerHTML = r.seconds === null ? `<p class="errbox">${esc(r.error)}</p>` : `<p class="statusline"><span class="dim"><b>Limite teorico</b>${fmt(r.theoretical, 1)} giorni continui</span><span class="dim"><b>Con l'efficienza indicata</b>${fmt(r.days, 1)} giorni</span></p>`;
      }
      app.on('esc', (el) => { cur = el.dataset.v; root.querySelectorAll('[data-action=esc]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === cur)); app.setQuery({ s: cur === 'B' ? 'B' : '' }); draw(); });
      app.on('erow', (el) => { const v = el.value === '' ? null : Number(el.value); sc[cur].rows[+el.dataset.i][el.dataset.k] = v; persist(); redraw(); });
      app.on('etariff', (el) => { sc[cur].tariff = el.value === '' ? null : Number(el.value); persist(); redraw(); });
      app.on('ereset', () => { sc[cur] = { tariff: E.defaultTariff.value, rows: docRows() }; persist(); draw(); app.toast(`Scenario ${cur}: valori del Faldone ripristinati`); });
      const svSave = () => { app.data.energy = { ...(app.data.energy || {}), savings: sv }; app.persist(); redraw(); };
      app.on('svon', (el) => { sv.rows[+el.dataset.i].on = el.checked; svSave(); });
      app.on('sveur', (el) => { sv.rows[+el.dataset.i].eurMonth = Math.max(0, Number(el.value) || 0); svSave(); });
      app.on('svprop', (el) => { sv.includeProposed = el.checked; svSave(); });
      app.on('tcalc', tcalc);
      draw(); tcalc();
    },
  };
}
