// Screenshot rappresentativi a più larghezze.  node tools/e2e/screens.cjs OUTDIR [URL] [rotte...]
const { chromium } = require(require.resolve('playwright', { paths: [process.cwd(), require('child_process').execSync('npm root -g').toString().trim()] }));
const fs = require('fs');
const OUT = process.argv[2] || 'docs/screenshot';
const BASE = process.argv[3] || 'http://127.0.0.1:8811/';
const ROUTES = process.argv.slice(4).length ? process.argv.slice(4) : ['', 'e/M2', 'e/NEXTCLOUD', 'mappa?l=rete,quorum,hosting&s=M2', 'simula?f=M2', 'realizza?v=sequenza', 'emergenza'];
const SIZES = (process.env.SIZES || '1280x900,390x844').split(',').map((s) => s.split('x').map(Number));
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  for (const [w, h] of SIZES) {
    const p = await b.newPage({ viewport: { width: w, height: h }, colorScheme: process.env.DARK ? 'dark' : 'light' });
    await p.goto(BASE, { waitUntil: 'networkidle' });
    for (const r of ROUTES) {
      await p.evaluate((r) => { location.hash = r; }, r);
      await p.waitForFunction(() => !document.querySelector('main[aria-busy]'), null, { timeout: 5000 }).catch(() => {});
      await p.waitForTimeout(350);
      const name = `${w}-${(r.split('?')[0] || 'home').replace(/[^a-z0-9]+/gi, '_')}${process.env.DARK ? '-scuro' : ''}.png`;
      const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      await p.screenshot({ path: `${OUT}/${name}`, fullPage: !!process.env.FULL });
      console.log(name, overflow > 0 ? `OVERFLOW ${overflow}px` : '');
    }
    await p.close();
  }
  await b.close();
})();
