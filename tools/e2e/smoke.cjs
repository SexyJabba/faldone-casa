// Verifica di fumo: apre ogni rotta, segnala errori JavaScript e pagine vuote.
//   node tools/e2e/smoke.cjs [URL]   (richiede Playwright; vedi docs/rilascio.md)
const { chromium } = require(require.resolve('playwright', { paths: [process.cwd(), require('child_process').execSync('npm root -g').toString().trim()] }));
const BASE = process.argv[2] || 'http://127.0.0.1:8811/';
const ROUTES = ['', 'esplora', 'esplora/macchine', 'esplora/servizi', 'esplora/dati', 'esplora/rete', 'esplora/rack', 'ambito/vito', 'ambito/inventario', 'e/M2', 'e/NEXTCLOUD', 'e/D-FOTO', 'e/ST-P310', 'e/CP-BCK-M4', 'e/CLUSTER', 'mappa', 'mappa?v=elenco&l=rete,dati', 'percorsi', 'percorsi/documento', 'percorsi/cinque-minuti', 'simula', 'simula?f=M2', 'emergenza', 'procedura/PR-RESTORE', 'realizza', 'realizza?v=sequenza', 'realizza/decisioni', 'realizza/decisioni/DEC-CRYPT', 'realizza/attivita/A-3.1', 'realizza/collaudi', 'realizza/acquisti', 'costi', 'contribuisci', 'contribuisci/I-OPENCLAW', 'documenti', 'INF-03.03', 'REV4-ROAD', 'glossario', 'guida', 'inventario', 'inventario/INV-005', 'documenti/revisioni', 'documenti/download', 'cerca?q=foto', 'preferiti', 'connettori', 'impianti', 'impianti/vmc', 'impianti/acqua', 'realizza/decisioni/DEC-VMC', 'presenta', 'presenta?s=dati&m=lettura', 'node/M2', 'sim', 'world-vito', 'tour', 'pagina-inesistente'];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push('pageerror ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push('console ' + m.text()); });
  await p.goto(BASE, { waitUntil: 'networkidle' });
  let fail = 0;
  for (const r of ROUTES) {
    errs.length = 0;
    await p.evaluate((r) => { location.hash = r; }, r);
    await p.waitForFunction(() => !document.querySelector('main[aria-busy]'), null, { timeout: 5000 }).catch(() => {});
    await p.waitForTimeout(150);
    const [title, h1, len, hash] = await p.evaluate(() => [document.title, document.querySelector('main h1')?.textContent?.trim().slice(0, 50), document.querySelector('main').innerText.length, location.hash]);
    const bad = errs.length || len < 200 || !h1;
    if (bad) fail++;
    console.log(`${bad ? 'KO' : 'ok'} #${r.padEnd(30)} → ${hash.padEnd(26)} ${String(len).padStart(6)} car. «${h1}» ${errs.join(' | ').slice(0, 300)}`);
  }
  await b.close();
  console.log(fail ? `${fail} rotte con problemi` : 'Tutte le rotte senza errori');
  process.exit(fail ? 1 : 0);
})();
