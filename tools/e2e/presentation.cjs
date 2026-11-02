// Verifica del percorso «Il progetto in cinque minuti» nel browser.
//   node tools/e2e/presentation.cjs [URL] [cartella-screenshot]
// Opzionale: AXE=/percorso/axe.min.js per i controlli di accessibilità.
const { execSync } = require('child_process');
const fs = require('fs');
const { chromium } = require(require.resolve('playwright', { paths: [process.cwd(), execSync('npm root -g').toString().trim()] }));
const BASE = process.argv[2] || 'http://127.0.0.1:8811/';
const OUT = process.argv[3];
let fail = 0;
const ok = (c, m) => { if (!c) fail++; console.log(c ? 'ok' : 'KO', m); };
const settle = (p) => p.waitForFunction(() => !document.querySelector('main[aria-busy]'), null, { timeout: 5000 }).catch(() => {}).then(() => p.waitForTimeout(200));
const hash = (p) => p.evaluate(() => decodeURI(location.hash));

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(BASE, { waitUntil: 'networkidle' }); await settle(p);
  // ingresso: un clic, prima scena, nessuna pagina intermedia
  await p.click('a.btn.primary:has-text("Scopri il progetto in 5 minuti")'); await settle(p);
  ok(/presenta/.test(await hash(p)) && (await p.textContent('.pres-count')).includes('1 di 10 — La visione'), 'la CTA della home apre direttamente la scena 1 («1 di 10 — La visione»)');
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('.top')).display === 'none' && !document.querySelector('.pres [data-action=depth]')), 'cornice della presentazione senza testata, preferiti e livello di dettaglio');
  ok(await p.evaluate(() => document.activeElement?.tagName === 'H1'), 'focus sul titolo della scena');
  ok((await p.textContent('#pres-live')).includes('Scena 1 di 10'), 'cambio scena annunciato');
  ok(/Avanti: Il valore/.test(await p.getAttribute('a[rel=next]', 'aria-label')), 'pulsante Avanti con la destinazione');
  // frecce e cronologia
  await p.keyboard.press('ArrowRight'); await settle(p);
  await p.keyboard.press('ArrowRight'); await settle(p);
  ok((await hash(p)) === '#presenta?s=giornata', 'freccia destra: scena successiva con URL stabile');
  await p.goBack(); await settle(p);
  ok((await hash(p)) === '#presenta?s=valore', 'Indietro del browser torna alla scena precedente');
  await p.goForward(); await settle(p);
  await p.reload({ waitUntil: 'networkidle' }); await settle(p);
  ok((await p.textContent('.pres-count')).includes('3 di 10'), 'il ricaricamento conserva la scena');
  await p.keyboard.press('ArrowLeft'); await settle(p);
  ok((await hash(p)) === '#presenta?s=valore', 'freccia sinistra: scena precedente');
  // indice: apertura, Esc, ritorno del focus
  await p.focus('[data-action=pres-index]'); await p.keyboard.press('Enter'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => document.getElementById('pres-index-dlg').open), 'indice apribile da tastiera');
  ok(await p.evaluate(() => document.querySelector('#pres-index-dlg [aria-current=step]')?.textContent.includes('Dati ordinati')), 'l\'indice indica la scena attuale');
  await p.keyboard.press('ArrowRight'); await p.waitForTimeout(150);
  ok((await hash(p)) === '#presenta?s=valore', 'con un pannello aperto le frecce non cambiano scena');
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => !document.getElementById('pres-index-dlg').open && document.activeElement.dataset.action === 'pres-index'), 'Esc chiude l\'indice e il focus torna al pulsante');
  await p.click('[data-action=pres-index]'); await p.click('#pres-index-dlg a:has-text("Le foto hanno")'); await settle(p);
  ok((await hash(p)) === '#presenta?s=dati', 'salto diretto dall\'indice');
  // approfondimento
  await p.click('[data-action=pres-deep]'); await p.waitForTimeout(150);
  const deep = await p.evaluate(() => { const d = document.getElementById('pres-deep-dlg'); return d.open && d.innerText; });
  ok(deep && /P310/.test(deep) && /REV3-BCK/.test(deep), 'approfondimento con dettaglio tecnico, elementi e fonti');
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => document.activeElement.dataset.action === 'pres-deep'), 'chiudendo l\'approfondimento il focus torna al pulsante');
  await p.click('[data-action=pres-deep]'); await p.click('#pres-deep-dlg a[href="#e/ST-P310"]'); await settle(p);
  ok((await hash(p)) === '#e/ST-P310', 'dall\'approfondimento si apre la scheda completa');
  await p.goBack(); await settle(p);
  ok((await hash(p)) === '#presenta?s=dati', 'Indietro riporta alla stessa scena');
  // modalità
  await p.click('[data-action=pres-mode][data-v=lettura]'); await settle(p); await p.waitForTimeout(200);
  ok((await hash(p)) === '#presenta?s=dati&m=lettura' && await p.evaluate(() => document.querySelectorAll('.pres-sec').length === 10), 'lettura continua con le stesse dieci scene, scena conservata');
  ok(await p.evaluate(() => { const r = document.getElementById('r-dati').getBoundingClientRect(); return r.top < 300 && r.bottom > 0; }), 'la lettura parte dalla scena corrente');
  await p.click('[data-action=pres-goto][data-id=continuita]'); await p.waitForTimeout(200);
  await p.click('[data-action=pres-mode][data-v=presentazione]'); await settle(p);
  ok((await hash(p)) === '#presenta?s=continuita', 'tornando alla presentazione si resta sulla scena scelta');
  // URL storici e non validi
  await p.goto(BASE + '#percorsi/cinque-minuti?c=3', { waitUntil: 'networkidle' }); await settle(p);
  ok((await hash(p)) === '#presenta?s=funzionamento', 'vecchio capitolo 3 («chi è sempre acceso») → scena del funzionamento');
  await p.goto(BASE + '#percorsi/cinque-minuti?c=4', { waitUntil: 'networkidle' }); await settle(p);
  ok((await hash(p)) === '#presenta?s=dati', 'vecchio capitolo 4 → scena dei dati');
  await p.goto(BASE + '#percorsi/cinque-minuti', { waitUntil: 'networkidle' }); await settle(p);
  ok((await hash(p)) === '#presenta?s=visione', 'vecchio percorso senza capitolo → prima scena');
  await p.goto(BASE + '#presenta?s=inesistente', { waitUntil: 'networkidle' }); await settle(p);
  ok(/non esiste/.test(await p.textContent('.pres-scene')) && (await p.textContent('.pres-count')).includes('1 di 10'), 'scena inesistente: prima scena con avviso e indice');
  await p.goto(BASE + '#tour', { waitUntil: 'networkidle' }); await settle(p);
  ok((await hash(p)).startsWith('#presenta'), '#tour della 4.4 porta alla presentazione');
  // uscita (dopo aver visto una scena intermedia)
  await p.goto(BASE + '#presenta?s=dati', { waitUntil: 'networkidle' }); await settle(p);
  await p.click('.pres-tools [data-action=pres-exit]'); await settle(p);
  ok((await hash(p)) === '' || (await hash(p)) === '#', 'Torna al sito riporta alla panoramica');
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('.top')).display !== 'none'), 'fuori dalla presentazione la testata ricompare');
  ok(await p.evaluate(() => /Riprendi/.test(document.querySelector('.hero').innerText)), 'la home propone di riprendere, senza farlo da sola');
  // stampa
  await p.goto(BASE + '#presenta?s=luoghi', { waitUntil: 'networkidle' }); await settle(p);
  await p.emulateMedia({ media: 'print' });
  const pr = await p.evaluate(() => ({ bar: getComputedStyle(document.querySelector('.pres-bar')).display, doc: getComputedStyle(document.querySelector('.pres-print')).display, n: document.querySelectorAll('.pres-psec').length }));
  ok(pr.bar === 'none' && pr.doc === 'block' && pr.n === 10, 'stampa: dieci scene, nessun controllo stampato');
  if (OUT) { fs.mkdirSync(OUT, { recursive: true }); await p.pdf({ path: `${OUT}/presentazione-stampa.pdf`, format: 'A4', printBackground: true }); }
  const pdf = await p.pdf({ format: 'A4' });
  const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  ok(pages >= 10 && pages <= 16, `PDF dal browser: ${pages} pagine`);
  await p.emulateMedia({ media: 'screen' });
  // accessibilità
  if (process.env.AXE && fs.existsSync(process.env.AXE)) {
    const axe = fs.readFileSync(process.env.AXE, 'utf8');
    for (const [w, h, scheme] of [[1440, 900, 'light'], [390, 844, 'light'], [1280, 720, 'dark']]) {
      const q = await b.newPage({ viewport: { width: w, height: h }, colorScheme: scheme, bypassCSP: true });
      await q.goto(BASE, { waitUntil: 'networkidle' });
      for (const s of ['visione', 'luoghi', 'funzionamento', 'dati', 'continuita', 'realizzazione', 'quadro', 'dati&m=lettura']) {
        await q.evaluate((s) => { location.hash = 'presenta?s=' + s; }, s); await settle(q);
        await q.addScriptTag({ content: axe });
        const v = await q.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } })).violations.map((x) => `${x.id}(${x.nodes.length}: ${x.nodes[0].target.join(' ')})`));
        ok(!v.length, `axe ${w}×${h} ${scheme} ${s} ${v.join('; ')}`);
      }
      await q.close();
    }
  }
  // dimensioni: nessuno scorrimento orizzontale, controlli raggiungibili, anche con viewport bassa
  for (const [w, h] of [[360, 740], [390, 844], [768, 1024], [1280, 720], [1440, 900], [1920, 1080]]) {
    const q = await b.newPage({ viewport: { width: w, height: h } });
    await q.goto(BASE, { waitUntil: 'networkidle' });
    const bad = [];
    for (const s of ['visione', 'giornata', 'luoghi', 'servizi', 'funzionamento', 'dati', 'continuita', 'realizzazione', 'quadro', 'visione&m=lettura']) {
      await q.evaluate((s) => { location.hash = 'presenta?s=' + s; }, s); await settle(q);
      const r = await q.evaluate(() => ({ o: document.documentElement.scrollWidth - document.documentElement.clientWidth, next: (() => { const n = document.querySelector('a[rel=next], .pres-nav a.primary'); if (!n) return true; const b = n.getBoundingClientRect(); return b.right <= innerWidth && b.bottom <= innerHeight && b.width > 40; })() }));
      if (r.o > 0) bad.push(`${s}: ${r.o}px`);
      if (!s.includes('lettura') && !r.next) bad.push(`${s}: Avanti fuori vista`);
      if (OUT && ['visione', 'luoghi', 'dati', 'continuita', 'quadro'].includes(s) && [390, 1440, 1280].includes(w)) await q.screenshot({ path: `${OUT}/presenta-${w}x${h}-${s}.png` });
    }
    ok(!bad.length, `${w}×${h}: niente scorrimento orizzontale, Avanti sempre visibile ${bad.join(' ')}`);
    await q.close();
  }
  ok(!errs.length, `nessun errore JavaScript ${errs.join(' | ')}`);
  await b.close();
  console.log(fail ? `${fail} verifiche fallite` : 'Tutte le verifiche superate');
  process.exit(fail ? 1 : 0);
})();
