// Misura di laboratorio: byte trasferiti, LCP, CLS, tempo di interazione. Non sono metriche sul campo.
//   node tools/e2e/perf.cjs URL [etichetta]
// Condizioni: Chromium headless, rete emulata 10 Mbit/s giù, 40 ms RTT, CPU rallentata 4×, cache vuota.
const { execSync } = require('child_process');
const zlib = require('zlib');
const { chromium } = require(require.resolve('playwright', { paths: [process.cwd(), execSync('npm root -g').toString().trim()] }));
const URL = process.argv[2] || 'http://127.0.0.1:8811/';
const LABEL = process.argv[3] || URL;
(async () => {
  const b = await chromium.launch();
  const runs = [];
  for (let i = 0; i < 3; i++) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage();
    const cdp = await ctx.newCDPSession(p);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 40, downloadThroughput: (10e6 / 8), uploadThroughput: (5e6 / 8) });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    let raw = 0, gz = 0; const files = [];
    p.on('response', async (r) => { try { const body = await r.body(); raw += body.length; gz += zlib.gzipSync(body).length; files.push([r.url().replace(/^https?:\/\/[^/]+\//, ''), body.length]); } catch { /* ignora */ } });
    await p.addInitScript(() => {
      window.__lcp = 0; window.__cls = 0;
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
    });
    const t0 = Date.now();
    await p.goto(URL, { waitUntil: 'networkidle' });
    const load = Date.now() - t0;
    await p.waitForTimeout(500);
    // interazione: apertura della ricerca o della navigazione e tempo al frame successivo
    const inp = await p.evaluate(async () => {
      const btn = document.querySelector('[data-action=palette]') || document.querySelector('#global-search') || document.querySelector('a[href^="#"]');
      const t = performance.now(); btn?.click?.(); if (btn?.focus) btn.focus();
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
      return performance.now() - t;
    });
    const m = await p.evaluate(() => ({ lcp: window.__lcp, cls: window.__cls }));
    runs.push({ raw, gz, load, ...m, inp, files: files.sort((a, b) => b[1] - a[1]).slice(0, 5) });
    await ctx.close();
  }
  await b.close();
  const med = (k) => runs.map((r) => r[k]).sort((a, b) => a - b)[1];
  console.log(JSON.stringify({ label: LABEL, bytesRaw: med('raw'), bytesGzipStimati: med('gz'), lcpMs: Math.round(med('lcp')), cls: +med('cls').toFixed(3), caricamentoMs: med('load'), interazioneMs: Math.round(med('inp')), fileMaggiori: runs[1].files }, null, 1));
})();
