// Accessibilità e interazioni da tastiera (A06, A20).
//   AXE=/percorso/axe.min.js node tools/e2e/a11y.cjs [URL]
// axe-core non è una dipendenza del sito: si indica il file con AXE (vedi docs/rilascio.md).
const { execSync } = require('child_process');
const fs = require('fs');
const { chromium } = require(require.resolve('playwright', { paths: [process.cwd(), execSync('npm root -g').toString().trim()] }));
const BASE = process.argv[2] || 'http://127.0.0.1:8811/';
const AXE = process.env.AXE;
const ROUTES = ['', 'e/M2', 'e/NEXTCLOUD', 'e/D-FOTO', 'mappa?s=M2', 'mappa?v=elenco', 'simula?f=M2', 'emergenza', 'procedura/PR-RESTORE', 'realizza?v=sequenza', 'costi', 'contribuisci', 'documenti', 'INF-03.03', 'cerca?q=foto', 'preferiti', 'percorsi/documento', 'percorsi/cinque-minuti'];
let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log('KO', m); } else console.log('ok', m); };
const wait = (p) => p.waitForFunction(() => !document.querySelector('main[aria-busy]'), null, { timeout: 5000 }).catch(() => {}).then(() => p.waitForTimeout(200));

(async () => {
  const b = await chromium.launch();
  // ---------- axe ----------
  if (AXE && fs.existsSync(AXE)) {
    const axe = fs.readFileSync(AXE, 'utf8');
    for (const [w, h, scheme] of [[1280, 900, 'light'], [390, 844, 'light'], [1280, 900, 'dark']]) {
      const p = await b.newPage({ viewport: { width: w, height: h }, colorScheme: scheme, bypassCSP: true });
      await p.goto(BASE, { waitUntil: 'networkidle' });
      for (const r of ROUTES) {
        await p.evaluate((r) => { location.hash = r; }, r); await wait(p);
        await p.addScriptTag({ content: axe });
        const res = await p.evaluate(async () => { const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } }); return r.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, t: v.nodes.slice(0, 2).map((x) => x.target.join(' ')) })); });
        ok(res.length === 0, `axe ${w}px ${scheme} #${r} ${res.map((v) => `${v.id}(${v.impact},${v.n}: ${v.t.join(' | ')})`).join('; ')}`);
      }
      await p.close();
    }
  } else console.log('axe saltato: impostare AXE=/percorso/axe.min.js');

  // ---------- tastiera, focus, navigazione ----------
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(BASE, { waitUntil: 'networkidle' }); await wait(p);
  await p.keyboard.press('Tab');
  ok(await p.evaluate(() => document.activeElement.classList.contains('skip')), 'primo Tab sul collegamento «Vai al contenuto»');
  await p.keyboard.press('/'); await p.waitForTimeout(400);
  ok(await p.evaluate(() => document.getElementById('palette')?.open), '«/» apre la ricerca');
  await p.keyboard.type('non vedo le foto'); await p.waitForTimeout(600);
  ok(/Immich/.test(await p.evaluate(() => document.querySelector('#pres .hit[aria-selected=true]')?.textContent || '')), 'primo risultato selezionato: Immich');
  await p.keyboard.press('Enter'); await wait(p);
  ok(await p.evaluate(() => location.hash === '#e/IMMICH'), 'Invio apre la scheda di Immich');
  await p.keyboard.press('Control+k'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => document.getElementById('palette').open), 'Ctrl+K apre la ricerca');
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => !document.getElementById('palette').open), 'Esc chiude la ricerca');
  // «/» non viene intercettato mentre si scrive
  await p.evaluate(() => { location.hash = 'contribuisci'; }); await wait(p);
  await p.focus('textarea[name=ctx]'); await p.keyboard.type('a/b'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => document.querySelector('textarea[name=ctx]').value === 'a/b' && !document.getElementById('palette').open), '«/» dentro un campo resta testo');
  // profondità: stessa entità, stessi fatti
  await p.evaluate(() => { location.hash = 'e/M2'; }); await wait(p);
  const factsC = await p.evaluate(() => document.querySelector('main').innerText.includes('Disco dati P310 singolo'));
  await p.click('.top [data-action=depth][data-v=intervenire]'); await wait(p);
  ok(await p.evaluate(() => location.hash === '#e/M2' && document.querySelector('main').innerText.includes('Disco dati P310 singolo')) && factsC, 'A02 cambio di profondità: stessa entità e limite di perdita dati visibile');
  ok(await p.evaluate(() => document.querySelectorAll('main details[open]').length >= 2), 'A02 in «Intervenire» il dettaglio tecnico è aperto');
  await p.click('.top [data-action=depth][data-v=capire]'); await wait(p);
  // mappa da tastiera
  await p.evaluate(() => { location.hash = 'mappa'; }); await wait(p);
  await p.focus('[data-node="M5"]'); await p.keyboard.press('Enter'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => location.hash.includes('s=M5') && document.getElementById('mapdetail').innerText.includes('M5')), 'mappa: Invio seleziona un elemento e aggiorna l\'URL condivisibile');
  // simulatore da tastiera
  await p.evaluate(() => { location.hash = 'simula'; }); await wait(p);
  await p.focus('[data-action=cycle][data-id="M2"]'); await p.keyboard.press('Enter'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => location.hash.includes('f=M2') && document.activeElement.dataset.id === 'M2'), 'simulatore: Invio cambia stato, il focus resta sul controllo');
  // A06: filtri e indietro/avanti, senza render duplicati
  await p.evaluate(() => { location.hash = 'documenti?b=03'; }); await wait(p);
  await p.evaluate(() => window.scrollTo(0, 900)); await p.waitForTimeout(150);
  await p.click('main .list a'); await wait(p);
  const before = await p.evaluate(() => window.__faldone.renderCount);
  await p.goBack(); await wait(p);
  const st = await p.evaluate(() => ({ hash: location.hash, y: window.scrollY, sel: document.getElementById('libb').value, n: window.__faldone.renderCount }));
  ok(st.hash === '#documenti?b=03' && st.sel === '03', `A06 indietro ripristina i filtri (${st.hash}, blocco ${st.sel})`);
  ok(st.y > 600, `A06 indietro ripristina la posizione (y=${st.y})`);
  ok(st.n - before === 1, `A06 una navigazione = un rendering (${st.n - before})`);
  await p.goForward(); await wait(p);
  ok(await p.evaluate(() => /^#[A-Z]/.test(location.hash)), 'A06 avanti torna alla scheda');
  // A06: alias storico e URL profondo
  await p.goto(BASE + '#node/M2', { waitUntil: 'networkidle' }); await wait(p);
  ok(await p.evaluate(() => location.hash === '#e/M2'), '#node/M2 della 4.4 porta alla nuova scheda');
  await p.goto(BASE + '#simula?f=M2,C4&a=T-HA-APP', { waitUntil: 'networkidle' }); await wait(p);
  ok(await p.evaluate(() => document.querySelector('[data-action=cycle][data-id="C4"]').getAttribute('aria-pressed') === 'true'), 'URL profondo del simulatore ripristina lo scenario');
  // glossario nel testo con tastiera
  await p.goto(BASE + '#INF-03.01', { waitUntil: 'networkidle' }); await wait(p);
  const gl = await p.$('.doc .gl');
  if (gl) { await gl.focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(100); }
  ok(gl && await p.evaluate(() => !!document.querySelector('.pop')), 'glossario nel testo apribile con Invio');
  // A15: scenari ipotetici separati e persistenti
  await p.goto(BASE + '#costi?s=B', { waitUntil: 'networkidle' }); await wait(p);
  const inB = await p.$('input[data-k=idleW][data-i="1"]'); await inB.fill('99'); await inB.dispatchEvent('change'); await p.waitForTimeout(200);
  await p.reload({ waitUntil: 'networkidle' }); await wait(p);
  const vB = await p.$eval('input[data-k=idleW][data-i="1"]', (e) => e.value);
  await p.click('[data-action=esc][data-v=A]'); await p.waitForTimeout(200);
  const vA = await p.$eval('input[data-k=idleW][data-i="1"]', (e) => e.value);
  const core = await p.evaluate(async () => (await (await fetch('data/core.json')).json()).energy.profiles[1].idleW);
  ok(vB === '99' && vA === '45' && core === 45, `A15 scenario B salvato (${vB}), A invariato (${vA}), valore del Faldone invariato (${core})`);
  // A21: consultazione offline con service worker (richiede localhost)
  const lb = BASE.replace('127.0.0.1', 'localhost');
  const ctx = await b.newContext();
  const o = await ctx.newPage();
  await o.goto(lb, { waitUntil: 'networkidle' });
  await o.waitForFunction(() => navigator.serviceWorker.controller || navigator.serviceWorker.ready, null, { timeout: 10000 }).catch(() => {});
  await o.reload({ waitUntil: 'networkidle' });
  await o.evaluate(() => { location.hash = 'INF-03.03'; }); await wait(o);
  await ctx.setOffline(true);
  await o.reload({ waitUntil: 'load' }).catch(() => {}); await wait(o);
  const offTxt = await o.evaluate(() => document.querySelector('main h1')?.textContent || '');
  ok(/M2/.test(offTxt), `A21 offline: la scheda già vista si riapre senza rete («${offTxt.slice(0, 40)}»)`);
  await o.goto(lb + 'kit/emergenza.html').catch(() => {});
  ok(/Revisione 4\.4/.test(await o.evaluate(() => document.body.innerText).catch(() => '')), 'A21 offline: kit di emergenza disponibile e con la revisione');
  await ctx.close();
  // mobile: niente overflow orizzontale
  const m = await b.newPage({ viewport: { width: 360, height: 740 } });
  await m.goto(BASE, { waitUntil: 'networkidle' });
  const over = [];
  for (const r of ROUTES) { await m.evaluate((r) => { location.hash = r; }, r); await wait(m); const o = await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); if (o > 0) over.push(`${r}:${o}px`); }
  ok(over.length === 0, `A20 360px senza scorrimento orizzontale ${over.join(' ')}`);
  ok(errs.length === 0, `nessun errore JavaScript ${errs.join(' | ')}`);
  await b.close();
  console.log(failures ? `${failures} verifiche fallite` : 'Tutte le verifiche superate');
  process.exit(failures ? 1 : 0);
})();
