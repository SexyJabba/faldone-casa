// calc.js — funzioni di calcolo PURE (nessun accesso a DOM o archivio).
// Usate dall'interfaccia e dai test (tests/calc.test.mjs). Modelli spiegati in docs/MODELLI.md.
// Regola generale: un dato sconosciuto è `null` e NON diventa zero: il risultato lo segnala.

export const num = (v) => (v === null || v === undefined || v === '' || Number.isNaN(Number(v))) ? null : Number(v);
export const DISP_POSSEDUTI = ['posseduto', 'recupero', 'acquistato'];
export const DISP_PREVISTI = ['carrello', 'da_acquistare'];
const byId = (arr) => Object.fromEntries((arr || []).map((x) => [x.id, x]));

/* ---------------- GEOMETRIA (pianta, mm) ----------------
   x = distanza dalla paratia/sedili verso il portellone; y = da sinistra (senso di marcia) verso destra;
   lx = lunghezza lungo x; ly = larghezza lungo y; z = quota dal pianale; h = altezza. */
export function siSovrappongono(a, b) {
  return a.x < b.x + b.lx && b.x < a.x + a.lx && a.y < b.y + b.ly && b.y < a.y + a.ly;
}
const zSiToccano = (a, b) => (a.z || 0) < (b.z || 0) + b.h && (b.z || 0) < (a.z || 0) + a.h;

export function ingombroAperto(m) {
  const ax = num(m.apreX) || 0, ay = num(m.apreY) || 0;
  return { ...m, lx: m.lx + Math.max(0, ax), y: ay < 0 ? m.y + ay : m.y, ly: m.ly + Math.abs(ay) };
}

// Vano FINITO: il vano in lamiera meno gli spessori della stratigrafia scelta (pareti, pavimento, soffitto, portellone).
// Le posizioni dei moduli restano riferite alla lamiera in pianta (x, y) e al pavimento FINITO in altezza (z).
export function vanoFinito(geom, scenario, state) {
  const mats = byId(state.inventario);
  const sp = (zid) => { const s = stratigrafia(((scenario && scenario.zone) || {})[zid] || [], mats); return { mm: s.spessore_mm, ignoti: s.spessoreIgnoto }; };
  const par = sp('par_cassone'), pav = sp('pav_cassone'), sof = sp('sof_cassone'), por = sp('portellone');
  const L = num(geom.lung), W = num(geom.larg), H = num(geom.alt);
  return { par: par.mm, pav: pav.mm, sof: sof.mm, por: por.mm, x0: 0, x1: L === null ? null : L - por.mm, y0: par.mm, y1: W === null ? null : W - par.mm,
    alt: H === null ? null : H - pav.mm - sof.mm, larg: W === null ? null : W - 2 * par.mm, lung: L === null ? null : L - por.mm,
    incompleto: [...new Set([...par.ignoti, ...pav.ignoti, ...sof.ignoti, ...por.ignoti])] };
}

// Elenco dei problemi geometrici di un layout. NON certifica resistenza né omologazione.
// opt.base   = moduli della base fissa (presenti in ogni configurazione)
// opt.stato  = { nome, aperti: [id] }: verifica quello stato preciso (i moduli elencati contano con l'ingombro APERTO)
//              senza stato: verifica a moduli chiusi e avvisa per ogni coppia che interferisce con uno o entrambi aperti
// opt.finito = risultato di vanoFinito(): i limiti diventano quelli dopo i rivestimenti
export function verificaLayout(layout, geom, opt = {}) {
  const { base = [], stato = null, finito = null } = opt;
  const out = [];
  const L = num(geom.lung), W = num(geom.larg), H = num(geom.alt);
  const lim = finito && finito.y1 !== null && finito.x1 !== null ? { x0: 0, x1: finito.x1, y0: finito.y0, y1: finito.y1, h: finito.alt } : { x0: 0, x1: L, y0: 0, y1: W, h: H };
  const aperti = new Set((stato && stato.aperti) || []);
  const ok = [];
  for (const m of [...base, ...(layout.moduli || [])]) {
    if ([m.x, m.y, m.lx, m.ly, m.h].some((v) => num(v) === null)) {
      out.push({ livello: 'nota', tipo: 'dati', ids: [m.id], msg: `${m.nome}: posizione o dimensioni mancanti, non verificabile` });
    } else ok.push({ ...m, z: num(m.z) || 0 });
  }
  if (L === null || W === null) out.push({ livello: 'nota', tipo: 'dati', ids: [], msg: 'Dimensioni del vano mancanti: limiti non verificabili' });
  if (finito && finito.incompleto.length) out.push({ livello: 'nota', tipo: 'dati', ids: [], msg: 'Spessore sconosciuto per: ' + finito.incompleto.join(', ') + ' — il vano finito è più stretto di quanto indicato' });
  const c = geom.corridoio;
  const corr = c && num(c.y) !== null && num(c.ly) !== null ? { x: -1e6, lx: 2e6, y: c.y, ly: c.ly, z: 0, h: num(c.h) ?? 1e6 } : null;
  if (!corr) out.push({ livello: 'nota', tipo: 'dati', ids: [], msg: 'Corridoio riservato non definito: invasione non verificabile' });
  const eff = (m) => (aperti.has(m.id) ? { ...ingombroAperto(m), _aperto: true } : m);
  const dove = stato ? ` (stato “${stato.nome}”)` : '';
  for (const m of ok) {
    if (lim.x1 !== null && lim.y1 !== null) {
      const fuoriLamiera = m.x < 0 || m.y < 0 || m.x + m.lx > L || m.y + m.ly > W;
      const fuori = m.x < lim.x0 || m.y < lim.y0 || m.x + m.lx > lim.x1 || m.y + m.ly > lim.y1;
      if (fuoriLamiera) out.push({ livello: 'errore', tipo: 'fuori', ids: [m.id], msg: `${m.nome}: esce dal vano di carico (chiuso)` });
      else if (fuori) out.push({ livello: 'errore', tipo: 'fuori', ids: [m.id], msg: `${m.nome}: entra nella lamiera nuda ma non nel vano FINITO (rivestimenti: pareti ${finito.par} mm per lato, portellone ${finito.por} mm)` });
    }
    if (lim.h !== null && m.z + m.h > lim.h) {
      out.push({ livello: 'errore', tipo: 'altezza', ids: [m.id], msg: `${m.nome}: supera l'altezza ${finito ? 'finita' : 'interna'} (${m.z + m.h} > ${Math.round(lim.h)} mm)` });
    }
    // Il corridoio serve in viaggio: si verifica sempre a modulo chiuso.
    if (corr && siSovrappongono(m, corr) && m.z < corr.h) {
      out.push({ livello: 'errore', tipo: 'corridoio', ids: [m.id], msg: `${m.nome}: invade il corridoio riservato ai montanti da 3 m` });
    }
    for (const p of geom.passaruota || []) {
      if ([p.x, p.y, p.lx, p.ly].some((v) => num(v) === null)) continue;
      if (siSovrappongono(m, p) && m.z < (num(p.h) ?? 1e6)) {
        out.push({ livello: 'avviso', tipo: 'passaruota', ids: [m.id], msg: `${m.nome}: sopra il passaruota ${p.nome || ''} — va sagomato o rialzato` });
      }
    }
    const a = ingombroAperto(m);
    if ((!stato || aperti.has(m.id)) && a.ly !== m.ly && lim.y1 !== null && (a.y < lim.y0 || a.y + a.ly > lim.y1)) {
      out.push({ livello: stato ? 'errore' : 'avviso', tipo: 'aperto', ids: [m.id], msg: `${m.nome}: da aperto esce lateralmente dal vano${finito ? ' finito' : ''}${dove}` });
    }
  }
  const urto = (a, b) => siSovrappongono(a, b) && zSiToccano(a, b);
  for (let i = 0; i < ok.length; i++) for (let j = i + 1; j < ok.length; j++) {
    const a = ok[i], b = ok[j];
    if (stato) {
      if (urto(eff(a), eff(b))) out.push({ livello: 'errore', tipo: 'sovrapposizione', ids: [a.id, b.id], msg: `${a.nome} e ${b.nome} si scontrano${dove}` });
      continue;
    }
    if (urto(a, b)) { out.push({ livello: 'errore', tipo: 'sovrapposizione', ids: [a.id, b.id], msg: `${a.nome} e ${b.nome} si sovrappongono (chiusi)` }); continue; }
    const A = ingombroAperto(a), B = ingombroAperto(b);
    if (urto(A, b) || urto(a, B)) out.push({ livello: 'avviso', tipo: 'aperto', ids: [a.id, b.id], msg: `${a.nome} e ${b.nome} interferiscono quando uno dei due è aperto` });
    else if (urto(A, B)) out.push({ livello: 'avviso', tipo: 'aperto', ids: [a.id, b.id], msg: `${a.nome} e ${b.nome} interferiscono solo se aperti ENTRAMBI` });
  }
  return out;
}

export function massaLayout(layout) {
  let tot = 0; const ignoti = [];
  for (const m of layout.moduli || []) { const k = num(m.massa); if (k === null) ignoti.push(m.nome); else tot += k; }
  return { nota: tot, ignoti };
}

/* ---------------- STRATIGRAFIE ---------------- */
// Resistenza termica di uno strato [m²K/W]: valore dichiarato (R_dich) oppure spessore/lambda. null = non determinabile.
export function rStrato(mat) {
  if (!mat) return null;
  if (mat.noTermico) return 0;
  const R = num(mat.R_dich); if (R !== null) return R;
  const t = num(mat.spessore_mm), l = num(mat.lambda);
  return t !== null && l ? (t / 1000) / l : null;
}

export function stratigrafia(strati, mats) {
  const r = { spessore_mm: 0, spessoreIgnoto: [], massa_kg_m2: 0, massaIgnota: [], R: 0, Rignoti: [], ipotesi: [] };
  for (const s of strati || []) {
    const m = mats[s.mat];
    if (!m) { r.Rignoti.push('(materiale rimosso)'); continue; }
    const cop = (num(s.cop) ?? 100) / 100;
    const t = num(m.spessore_mm); if (t === null) r.spessoreIgnoto.push(m.nome); else r.spessore_mm += t;
    const kg = num(m.massa_kg_m2); if (kg === null) r.massaIgnota.push(m.nome); else r.massa_kg_m2 += kg * cop;
    // Semplificazione dichiarata: uno strato a copertura parziale non conta per la resistenza termica.
    if (cop >= 1) { const R = rStrato(m); if (R === null) r.Rignoti.push(m.nome); else r.R += R; }
    if (['ipotesi', 'da_verificare'].includes(m.stato)) r.ipotesi.push(m.nome);
  }
  return r;
}

// Fabbisogno di materiali di uno scenario, confrontato con ciò che è già disponibile.
export function fabbisogni(scenario, state) {
  const mats = byId(state.inventario);
  const per = new Map(); const zoneSenzaArea = [];
  const sfrido = 1 + (num(scenario.sfridoPct) ?? 0) / 100;
  for (const z of state.zone) {
    const strati = (scenario.zone || {})[z.id] || [];
    if (!strati.length) continue;
    const A = num(z.area_m2);
    if (A === null) { zoneSenzaArea.push(z.nome); continue; }
    for (const s of strati) per.set(s.mat, (per.get(s.mat) || 0) + A * ((num(s.cop) ?? 100) / 100) * sfrido);
  }
  const righe = [];
  for (const [id, area] of per) {
    const m = mats[id]; if (!m) continue;
    const au = num(m.areaUnit_m2);
    const necessarie = au ? Math.ceil(area / au - 1e-9) : null;
    const possedute = DISP_POSSEDUTI.includes(m.disp) ? num(m.qta) : 0;
    const mancanti = necessarie === null || possedute === null ? null : Math.max(0, necessarie - possedute);
    const cu = num(m.costoUnit);
    righe.push({ id, nome: m.nome, area_m2: area, areaUnit_m2: au, necessarie, possedute, mancanti,
      costo: mancanti === 0 ? 0 : (mancanti === null || cu === null ? null : mancanti * cu),
      massa_kg: num(m.massa_kg_m2) === null ? null : num(m.massa_kg_m2) * area / sfrido });
  }
  return { righe, zoneSenzaArea };
}

export function riepilogoScenario(scenario, state) {
  const mats = byId(state.inventario);
  let massa = 0; const massaIgnota = new Set(); const zone = [];
  for (const z of state.zone) {
    const s = stratigrafia((scenario.zone || {})[z.id] || [], mats);
    const A = num(z.area_m2);
    s.massaIgnota.forEach((n) => massaIgnota.add(n));
    if (A === null && ((scenario.zone || {})[z.id] || []).length) massaIgnota.add(`superficie ${z.nome}`);
    else if (A !== null) massa += s.massa_kg_m2 * A;
    zone.push({ zona: z, ...s });
  }
  const f = fabbisogni(scenario, state);
  let costo = 0, senzaPrezzo = 0;
  for (const r of f.righe) { if (r.costo === null) senzaPrezzo++; else costo += r.costo; }
  return { zone, massa_kg: massa, massaIgnota: [...massaIgnota], costoNuovi: costo, senzaPrezzo, fabbisogni: f };
}

/* ---------------- ACQUISTI PREVISTI E BUDGET ---------------- */
// Una riga per articolo: quantità prevista = max(quantità in carrello, mancanti dello scenario ATTIVO).
// Così lo stesso articolo non viene contato due volte (carrello + scenario).
export function pianoAcquisti(state) {
  const scen = (state.scenariStrati || []).find((s) => s.attivo);
  const fab = scen ? fabbisogni(scen, state).righe : [];
  const fabById = byId(fab);
  const righe = [];
  for (const it of state.inventario) {
    // Un articolo già pagato (spesaId) non è più "in carrello", ma se lo scenario ne richiede di più i mancanti restano da comprare.
    const inCarrello = !it.spesaId && DISP_PREVISTI.includes(it.disp);
    const qCar = inCarrello ? num(it.qta) : 0;
    const f = fabById[it.id];
    const qScen = f ? f.mancanti : 0;
    if (!inCarrello && !f) continue;
    const ignota = qCar === null || qScen === null;
    const q = Math.max(qCar || 0, qScen || 0);
    if (q === 0 && !ignota) continue;
    const cu = num(it.costoUnit);
    righe.push({ id: it.id, nome: it.nome, qta: ignota && q === 0 ? null : q, daCarrello: qCar, daScenario: qScen,
      costo: cu === null || (ignota && q === 0) ? null : q * cu });
  }
  return righe;
}

export function budget(state) {
  const imp = state.impostazioni;
  const tetto = num(imp.tetto) ?? 0, quota = num(imp.quotaDaDettagliare) ?? 0;
  let dettagliate = 0, inQuota = 0, preventivi = 0, stime = 0;
  for (const s of state.spese) {
    const v = num(s.importo); if (v === null) continue;
    if (s.tipo === 'sostenuta') { if (s.inQuota) inQuota += v; else dettagliate += v; }
    else if (s.tipo === 'preventivo') preventivi += v;
    else stime += v;
  }
  // La quota "già spesa ma da dettagliare" resta fissa finché le ricevute che la compongono non la superano.
  const sostenuto = dettagliate + Math.max(quota, inQuota);
  const quotaResidua = Math.max(0, quota - inQuota);
  const residuo = tetto - sostenuto;
  const acq = pianoAcquisti(state);
  let acquisti = 0, acquistiSenzaPrezzo = 0;
  for (const a of acq) { if (a.costo === null) acquistiSenzaPrezzo++; else acquisti += a.costo; }
  let sistema = 0, sistemaSenzaPrezzo = 0; let sistemaNome = null;
  const sis = (state.energia?.sistemi || []).find((x) => x.attivo);
  if (sis) {
    sistemaNome = sis.nome;
    for (const c of sis.componenti || []) {
      if (c.disp !== 'da_acquistare') continue;
      const v = num(c.costo); if (v === null) sistemaSenzaPrezzo++; else sistema += v;
    }
  }
  const previsto = preventivi + stime + acquisti + sistema;
  const riserva = Math.max(0, residuo) * (num(imp.riservaPct) ?? 0) / 100;
  const avvisi = [];
  if (inQuota > quota) avvisi.push(`Le ricevute attribuite alla quota da dettagliare (${inQuota} €) superano la quota (${quota} €): il totale usa il valore delle ricevute.`);
  if (residuo < 0) avvisi.push('Tetto complessivo superato.');
  else if (residuo - previsto - riserva < 0) avvisi.push('Il previsto più la riserva imprevisti supera il residuo.');
  return { tetto, quota, quotaResidua, inQuota, sostenuto, residuo, preventivi, stime, acquisti, acquistiSenzaPrezzo,
    sistema, sistemaSenzaPrezzo, sistemaNome, previsto, riserva, libero: residuo - previsto - riserva, avvisi, righeAcquisti: acq };
}

/* ---------------- ENERGIA ---------------- */
// Bilancio giornaliero medio [Wh/giorno]. Carico con potenza sconosciuta = escluso e segnalato.
export function energia(profilo, sistema) {
  const effInv = num(sistema.effInv) ?? 1, effDC = num(sistema.effDC) ?? 1;
  let consumo = 0; const ignoti = []; const righe = [];
  for (const c of profilo.carichi || []) {
    const W = num(c.W), ore = num(c.ore), duty = (num(c.duty) ?? 100) / 100;
    if (W === null || ore === null) { ignoti.push(c.nome); righe.push({ ...c, Wh: null }); continue; }
    const Wh = W * ore * duty / (c.via === 'ac' ? effInv : effDC);
    consumo += Wh; righe.push({ ...c, Wh });
  }
  const solare = (num(sistema.solare_Wp) || 0) * (num(profilo.oreSole) || 0) * (num(sistema.rendSolare) ?? 0.7);
  const guida = (num(sistema.caricaVeicolo_W) || 0) * (num(profilo.oreGuida) || 0);
  const rete = (num(sistema.caricaRete_W) || 0) * (num(profilo.oreRete) || 0);
  const ricarica = solare + guida + rete;
  const cap = num(sistema.capacita_Wh), dod = num(sistema.dod) ?? 1, ris = (num(sistema.riservaPct) ?? 0) / 100;
  const utilizzabile = cap === null ? null : cap * dod * (1 - ris);
  const netto = consumo - ricarica;
  // Senza energia utilizzabile non c'è autonomia, anche se la ricarica media supera il consumo medio (di notte non c'è sole).
  const autonomia_h = utilizzabile === null ? null : (utilizzabile <= 0 ? 0 : (netto <= 0 ? (ignoti.length ? null : Infinity) : utilizzabile / netto * 24));
  const capacitaPer = (h) => netto <= 0 ? 0 : (netto * h / 24) / (dod * (1 - ris));
  const limiteSuperiore = ignoti.length > 0; // con utenze ignote l'autonomia mostrata è un MASSIMO
  // Verdetto sul bilancio MEDIO: 'non_determinabile' | 'non_raggiunto' | 'non_definitivo' | 'raggiunto'. Il verdetto vero è quello orario (simulaEnergia).
  const verdetto = (h) => utilizzabile === null ? 'non_determinabile' : autonomia_h === null ? 'non_definitivo' : autonomia_h < h ? 'non_raggiunto' : limiteSuperiore ? 'non_definitivo' : 'raggiunto';
  return { consumo, ricarica, solare, guida, rete, netto, utilizzabile, autonomia_h, ignoti, righe, capacitaPer,
    completo: ignoti.length === 0, limiteSuperiore, verdetto };
}

/* Simulazione ORARIA su `ore` ore (48, 72…). Passo 1 h, partenza all'ora `profilo.oraInizio` con batteria a `sistema.socIniziale` %.
   Utenze: se `da` (ora di accensione 0–23) è indicata, funzionano per `ore` ore consecutive da quell'ora; altrimenti l'energia giornaliera è spalmata sulle 24 h.
   Sole: campana centrata alle 12:30 larga `profilo.oreLuce` ore, con totale giornaliero = Wp × ore di sole equivalenti × rendimento.
   Guida e rete: finestre da `guidaDa` / `reteDa`. La ricarica totale è limitata da `sistema.maxCarica_W` se noto.
   Sotto il livello di riserva le utenze NON vengono servite (energia non servita). Sopra la capacità la ricarica è sprecata.
   `extra` = utenze aggiunte dall'esterno (es. riscaldatore calcolato dal modello termico). */
export function simulaEnergia(profilo, sistema, ore = 48, extra = []) {
  const effInv = num(sistema.effInv) ?? 1, effDC = num(sistema.effDC) ?? 1;
  const cap = num(sistema.capacita_Wh), dod = num(sistema.dod) ?? 1, ris = (num(sistema.riservaPct) ?? 0) / 100;
  const ignoti = []; const utenze = [];
  for (const c of [...(profilo.carichi || []), ...extra]) {
    const W = num(c.W), h = num(c.ore), duty = (num(c.duty) ?? 100) / 100;
    if (W === null || h === null) { ignoti.push(c.nome); continue; }
    const eff = c.via === 'ac' ? effInv : effDC;
    utenze.push({ nome: c.nome, W: W / eff, picco: (num(c.picco_W) ?? W) / eff, ore: Math.min(24, Math.max(0, h)), duty, da: num(c.da) });
  }
  const inFinestra = (ora, da, durata) => { // frazione dell'ora `ora` coperta da una finestra che parte a `da` e dura `durata` ore
    if (durata <= 0) return 0; let f = 0;
    for (const base of [da, da - 24]) { const a = Math.max(ora, base), b = Math.min(ora + 1, base + durata); if (b > a) f += b - a; }
    return Math.min(1, f);
  };
  const luce = Math.min(24, Math.max(1, num(profilo.oreLuce) ?? 12)), alba = 12.5 - luce / 2;
  const peso = (ora) => { let s = 0; for (let k = 0; k < 4; k++) { const x = (ora + (k + 0.5) / 4 - alba) / luce; if (x > 0 && x < 1) s += Math.sin(Math.PI * x); } return s / 4; };
  let sommaPesi = 0; for (let o = 0; o < 24; o++) sommaPesi += peso(o);
  const solareGiorno = (num(sistema.solare_Wp) || 0) * (num(profilo.oreSole) || 0) * (num(sistema.rendSolare) ?? 0.7);
  const maxCarica = num(sistema.maxCarica_W), maxUscita = num(sistema.maxUscita_W);
  const floor = cap === null ? null : cap - cap * dod * (1 - ris);
  let E = cap === null ? null : Math.max(floor, cap * (num(sistema.socIniziale) ?? 100) / 100);
  const serie = []; let nonServita = 0, sprecata = 0, totCarico = 0, totRicarica = 0, piccoMax = 0, piccoOra = null, Emin = E, primaInterruzione_h = null;
  const ora0 = num(profilo.oraInizio) ?? 18;
  for (let i = 0; i < ore; i++) {
    const ora = (ora0 + i) % 24;
    let carico = 0, picco = 0;
    for (const u of utenze) {
      const fr = u.da === null ? u.ore / 24 : inFinestra(ora, u.da, u.ore);
      carico += u.W * u.duty * fr; if (fr > 0) picco += u.picco;
    }
    let ric = (sommaPesi > 0 ? solareGiorno * peso(ora) / sommaPesi : 0)
      + (num(sistema.caricaVeicolo_W) || 0) * inFinestra(ora, num(profilo.guidaDa) ?? 9, num(profilo.oreGuida) || 0)
      + (num(sistema.caricaRete_W) || 0) * inFinestra(ora, num(profilo.reteDa) ?? 20, num(profilo.oreRete) || 0);
    if (maxCarica !== null) ric = Math.min(ric, maxCarica);
    if (picco > piccoMax) { piccoMax = picco; piccoOra = ora; }
    totCarico += carico; totRicarica += ric;
    let ns = 0;
    if (E !== null) {
      E += ric - carico;
      if (E > cap) { sprecata += E - cap; E = cap; }
      if (E < floor) { ns = floor - E; E = floor; nonServita += ns; if (primaInterruzione_h === null) primaInterruzione_h = i; }
      if (E < Emin) Emin = E;
    }
    serie.push({ i, ora, carico, ricarica: ric, E, nonServita: ns });
  }
  const superaLimite = maxUscita === null ? null : piccoMax > maxUscita + 1e-9;
  const motivi = [];
  let verdetto;
  if (cap === null) { verdetto = 'non_determinabile'; motivi.push('capacità della batteria sconosciuta'); }
  else {
    if (cap <= 0) motivi.push('capacità della batteria nulla');
    if (nonServita > 1e-6) motivi.push(`energia non servita: ${Math.round(nonServita)} Wh (prima interruzione dopo ${primaInterruzione_h} h)`);
    if (superaLimite) motivi.push(`picco contemporaneo ${Math.round(piccoMax)} W oltre il limite di uscita ${maxUscita} W`);
    if (motivi.length) verdetto = 'non_raggiunto';
    else {
      if (ignoti.length) motivi.push('utenze con potenza o durata sconosciuta: ' + ignoti.join(', '));
      if (maxUscita === null) motivi.push("limite di potenza in uscita dell'impianto non noto: picchi non verificabili");
      verdetto = motivi.length ? 'non_definitivo' : 'raggiunto';
    }
  }
  return { ore, serie, cap, floor, Emin, Efine: E, nonServita_Wh: nonServita, sprecata_Wh: sprecata, totCarico_Wh: totCarico, totRicarica_Wh: totRicarica,
    piccoMax_W: piccoMax, piccoOra, maxUscita_W: maxUscita, superaLimite, primaInterruzione_h, ignoti, verdetto, motivi };
}

/* Dal fabbisogno termico ai consumi dell'apparecchio. Tre grandezze DISTINTE: energia termica utile, elettricità, combustibile.
   app: { pTermMax_W, rendimento (0–1, combustibile→calore utile; 1 per resistenza elettrica), pci_kWh_l (energia del combustibile per litro),
          el_min_W, el_max_W (assorbimento elettrico a potenza minima/massima), elettrico: true se scalda con la sola elettricità }
   Ogni parametro mancante rende non determinabile la grandezza che ne dipende. */
export function consumiApparecchio(P_W, app, oreGiorno) {
  const P = num(P_W), pMax = num(app.pTermMax_W), h = num(oreGiorno);
  if (P === null) return { determinabile: false, motivo: 'fabbisogno termico non determinabile' };
  const frazione = pMax ? P / pMax : null;
  const out = { determinabile: true, P_W: P, frazione, insufficiente: frazione !== null && frazione > 1, termica_Wh_g: h === null ? null : P * h };
  if (app.elettrico) {
    const cop = num(app.rendimento) ?? 1;
    out.elettrica_W = P / cop; out.combustibile_l_h = 0;
  } else {
    const eta = num(app.rendimento), pci = num(app.pci_kWh_l), e0 = num(app.el_min_W), e1 = num(app.el_max_W);
    out.combustibile_l_h = eta && pci ? P / (eta * pci * 1000) : null;
    out.elettrica_W = e0 === null || e1 === null || frazione === null ? null : e0 + (e1 - e0) * Math.min(1, frazione);
  }
  out.elettrica_Wh_g = out.elettrica_W === null || h === null ? null : out.elettrica_W * h;
  out.combustibile_l_g = out.combustibile_l_h === null || h === null ? null : out.combustibile_l_h * h;
  return out;
}

export function costoSistema(sistema) {
  let noto = 0, senzaPrezzo = 0, daAcquistare = 0;
  for (const c of sistema.componenti || []) {
    const v = num(c.costo);
    if (v === null) { senzaPrezzo++; continue; }
    noto += v; if (c.disp === 'da_acquistare') daAcquistare += v;
  }
  return { noto, senzaPrezzo, daAcquistare };
}

/* ---------------- ACQUA ---------------- */
// Ogni voce: litri al giorno (per persona se perPersona), serbatoio di prelievo, e se finisce nelle acque grigie.
export function acqua(profilo, serbatoi) {
  const p = num(profilo.persone) ?? 1;
  const uso = { pulita: 0, lavoro: 0 }; let grigie = 0; const ignoti = [];
  for (const v of profilo.acqua || []) {
    const l = num(v.litri); if (l === null) { ignoti.push(v.nome); continue; }
    const tot = l * (v.perPersona ? p : 1);
    uso[v.serb === 'lavoro' ? 'lavoro' : 'pulita'] += tot;
    if (v.grigia) grigie += tot;
  }
  const giorni = (cap, u) => num(cap) === null ? null : (u <= 0 ? Infinity : num(cap) / u);
  return { uso, grigie, ignoti,
    giorniPulita: giorni(serbatoi.pulita_l, uso.pulita), giorniLavoro: giorni(serbatoi.lavoro_l, uso.lavoro),
    giorniGrigie: giorni(serbatoi.grigie_l, grigie) };
}

/* ---------------- TERMICO (regime stazionario) ---------------- */
export const RSI = 0.13, RSE = 0.04; // resistenze superficiali convenzionali (UNI EN ISO 6946, flusso orizzontale) usate per tutte le superfici: semplificazione
// Potenza per mantenere Tint con Text: P = (ΣU·A·fattorePonti + 0,33·portata) · ΔT − apporti interni.
// Restituisce un INTERVALLO (ponti termici min/max). Non modella sole, irraggiamento, inerzia, condensa.
export function termico(scenario, state, clima) {
  const mats = byId(state.inventario);
  const t = state.termico || {};
  const motivi = []; const avvisi = []; const dettagli = [];
  let H = 0; let limite = false;
  for (const z of state.zone) {
    const A = num(z.area_m2);
    if (A === null) { motivi.push(`superficie mancante: ${z.nome}`); continue; }
    const s = stratigrafia((scenario.zone || {})[z.id] || [], mats);
    const U = 1 / (RSI + s.R + RSE);
    if (s.Rignoti.length) limite = true;
    H += U * A; dettagli.push({ zona: z.nome, area: A, R: s.R, U, Rignoti: s.Rignoti, ipotesi: s.ipotesi.length > 0 || z.stato !== 'misurato' });
  }
  const Av = num(t.vetri_m2), Uv = num(t.Uvetro);
  if (Av === null || Uv === null) motivi.push('superficie o trasmittanza dei vetri mancante');
  else { H += Av * Uv; dettagli.push({ zona: 'Vetri', area: Av, R: null, U: Uv, Rignoti: [], ipotesi: true }); }
  const Tint = num(clima.Tint), Text = num(clima.Text), q = num(clima.portata_m3h);
  if (Tint === null || Text === null) motivi.push('temperature non impostate');
  if (q === null) motivi.push('portata di ventilazione non impostata');
  const fMin = num(t.ponteMin), fMax = num(t.ponteMax);
  if (fMin === null || fMax === null) motivi.push('fattori ponti termici non impostati');
  if (motivi.length) return { determinabile: false, motivi, dettagli, avvisi };
  const dT = Tint - Text; const Hv = 0.33 * q;
  const guadagni = (num(clima.persone) ?? 0) * (num(t.wattPersona) ?? 80);
  if (limite) avvisi.push('Alcuni strati non hanno resistenza termica nota: sono contati come zero, quindi la potenza reale è minore o uguale a quella indicata.');
  if (dT <= 0) {
    avvisi.push('Esterno più caldo dell\'interno desiderato: serve raffrescamento ATTIVO. La ventilazione può al massimo avvicinare l\'interno alla temperatura esterna. Il carico solare su lamiera e vetri non è modellato: potenza frigorifera non determinabile con questo modello.');
    // Solo le componenti che il modello conosce; le altre sono elencate come mancanti e NON stimate.
    const componenti = [
      { nome: 'Conduzione attraverso l\'involucro (aria-aria, senza sole)', W_min: H * fMin * -dT, W_max: H * fMax * -dT },
      { nome: 'Aria di ventilazione più calda', W_min: Hv * -dT, W_max: Hv * -dT },
      { nome: 'Calore delle persone', W_min: guadagni, W_max: guadagni },
      { nome: 'Sole su lamiera e vetri', mancante: 'servono irraggiamento, colore/assorbimento della carrozzeria, orientamento, ombre' },
      { nome: 'Umidità (calore latente di persone, cucina, aria esterna)', mancante: 'servono umidità esterna e produzione di vapore' },
      { nome: 'Infiltrazioni d\'aria non controllate', mancante: 'serve la tenuta all\'aria reale del mezzo' },
      { nome: 'Calore degli apparecchi accesi (frigo, elettronica)', mancante: 'dipende dalle utenze in funzione' },
      { nome: 'Calore accumulato da lamiera e arredi', mancante: 'modello stazionario: l\'inerzia non è considerata' },
    ];
    const noto = (k) => componenti.reduce((a, c) => a + (c[k] || 0), 0);
    return { determinabile: true, estate: true, H, Hv, dT, P_min: null, P_max: null, guadagni, dettagli, avvisi, limite, componenti, parzialeMin_W: noto('W_min'), parzialeMax_W: noto('W_max') };
  }
  const P = (f) => Math.max(0, (H * f + Hv) * dT - guadagni);
  return { determinabile: true, estate: false, H, H_min: H * fMin, H_max: H * fMax, Hv, dT, guadagni, P_min: P(fMin), P_max: P(fMax), dettagli, avvisi, limite };
}

/* ---------------- CARICHI ---------------- */
export function carichi(state, modo) {
  let tot = 0; const ignoti = [];
  for (const c of state.carichi || []) {
    if (modo && c.modo !== modo && c.modo !== 'entrambi') continue;
    const k = num(c.massa_kg), q = num(c.qta) ?? 1;
    if (k === null) ignoti.push(c.nome); else tot += k * q;
  }
  return { nota: tot, ignoti };
}

// Importazione lista carichi da testo CSV o JSON. Restituisce {righe, errori}; non lancia mai eccezioni.
export function parseCarichi(testo) {
  const errori = []; const righe = [];
  const MODI = ['lavoro', 'camper', 'entrambi'];
  const norm = (o, i) => {
    const nome = String(o.nome ?? '').trim();
    if (!nome) { errori.push(`Riga ${i}: nome mancante, scartata`); return; }
    let modo = String(o.modo ?? 'entrambi').trim().toLowerCase(); if (!MODI.includes(modo)) { errori.push(`Riga ${i} (${nome}): modo "${o.modo}" non valido, impostato "entrambi"`); modo = 'entrambi'; }
    const raw = o.massa_kg; let massa = num(typeof raw === 'string' ? raw.replace(',', '.') : raw);
    if (raw !== undefined && raw !== null && String(raw).trim() !== '' && massa === null) errori.push(`Riga ${i} (${nome}): massa "${raw}" non numerica, lasciata sconosciuta`);
    if (massa !== null && massa < 0) { errori.push(`Riga ${i} (${nome}): massa negativa, lasciata sconosciuta`); massa = null; }
    const q = num(o.qta); righe.push({ nome, modo, massa_kg: massa, qta: q === null || q <= 0 ? 1 : q, categoria: String(o.categoria ?? '').trim(), nota: String(o.nota ?? '').trim() });
  };
  const t = String(testo || '').trim();
  if (!t) return { righe, errori: ['File vuoto'] };
  if (t[0] === '[' || t[0] === '{') {
    try { let j = JSON.parse(t); if (!Array.isArray(j)) j = j.carichi; if (!Array.isArray(j)) throw new Error('atteso un elenco'); j.forEach((o, i) => (o && typeof o === 'object') ? norm(o, i + 1) : errori.push(`Elemento ${i + 1}: non è un oggetto`)); }
    catch (e) { errori.push('JSON non valido: ' + e.message); }
    return { righe, errori };
  }
  const lines = t.split(/\r?\n/).filter((l) => l.trim());
  const sep = (lines[0].match(/;/g) || []).length >= (lines[0].match(/,/g) || []).length ? ';' : ',';
  const head = lines[0].split(sep).map((s) => s.trim().toLowerCase());
  if (!head.includes('nome')) return { righe, errori: ['Intestazione CSV senza colonna "nome" (attese: nome;modo;massa_kg;qta;categoria;nota)'] };
  lines.slice(1).forEach((l, i) => { const c = l.split(sep); norm(Object.fromEntries(head.map((k, j) => [k, (c[j] ?? '').trim()])), i + 2); });
  return { righe, errori };
}

/* ---------------- PROGETTO (scenario unico) ---------------- */
// Il progetto attivo decide quale stratigrafia e quale sistema elettrico entrano nel "previsto" del budget.
// Non tocca mai spese e acquisti registrati.
export function applicaProgetto(state) {
  const p = (state.progetti || []).find((x) => x.attivo); if (!p) return;
  (state.scenariStrati || []).forEach((x) => { x.attivo = x.id === p.stratiId; });
  ((state.energia && state.energia.sistemi) || []).forEach((x) => { x.attivo = x.id === p.sistemaId; });
}
export function partiProgetto(state, p) {
  const trova = (arr, id) => (arr || []).find((x) => x.id === id) || null;
  return { layoutLavoro: trova(state.layout, p.layoutLavoroId), layoutCamper: trova(state.layout, p.layoutCamperId), strati: trova(state.scenariStrati, p.stratiId),
    sistema: trova(state.energia.sistemi, p.sistemaId), profilo: trova(state.energia.profili, p.profiloId) };
}

/* ---------------- PERCORSO GUIDATO DEL RESTAURO ---------------- */
// Per ogni lavoro non concluso: cosa lo blocca, cosa manca in inventario, ore residue e sessioni.
// Sequenza: ordinamento per dipendenze (a parità, priorità), con ore e giorni di fermo cumulati.
export function percorso(state, oreSessione = 4) {
  const lav = byId(state.lavori), inv = byId(state.inventario);
  const concluso = (id) => lav[id] && lav[id].stato === 'concluso';
  const righe = [];
  for (const l of state.lavori) {
    if (l.stato === 'concluso') continue;
    const bloccanti = (l.dipende || []).filter((d) => lav[d] && !concluso(d));
    const materiali = (l.materialiInv || []).map((r) => {
      const it = inv[r.inv]; if (!it) return { inv: r.inv, nome: '(articolo rimosso)', serve: num(r.qta), stato: 'manca', manca: num(r.qta) };
      const serve = num(r.qta), ho = DISP_POSSEDUTI.includes(it.disp) ? num(it.qta) : 0;
      let stato = 'ok', manca = 0;
      if (ho === null) { stato = 'da_verificare'; manca = null; } // posseduto ma quantità sconosciuta
      else if (serve === null) { stato = ho > 0 ? 'ok' : 'manca'; manca = ho > 0 ? 0 : null; }
      else if (ho < serve) { stato = 'manca'; manca = serve - ho; }
      return { inv: it.id, nome: it.nome, unita: it.unita || '', serve, ho, stato, manca };
    });
    const attrezzi = (l.attrezziInv || []).map((id) => { const it = inv[id]; return { inv: id, nome: it ? it.nome : '(articolo rimosso)', stato: it && DISP_POSSEDUTI.includes(it.disp) ? 'ok' : 'manca' }; });
    const oreFatte = (l.sessioni || []).reduce((a, s) => a + (num(s.ore) || 0), 0);
    const ore = num(l.ore), oreResidue = ore === null ? null : Math.max(0, ore - oreFatte);
    righe.push({ lavoro: l, bloccanti, materiali, attrezzi, mancaQualcosa: materiali.some((m) => m.stato === 'manca') || attrezzi.some((a) => a.stato === 'manca'),
      daVerificare: materiali.some((m) => m.stato === 'da_verificare'), oreFatte, oreResidue, sessioni: oreResidue === null ? null : Math.ceil(oreResidue / oreSessione - 1e-9), fermo_g: num(l.fermo_g) });
  }
  const perId = Object.fromEntries(righe.map((r) => [r.lavoro.id, r]));
  // ordinamento topologico (Kahn) con priorità
  const rimasti = new Set(righe.map((r) => r.lavoro.id)); const sequenza = []; let ore = 0, fermo = 0, senzaOre = 0, senzaFermo = 0;
  while (rimasti.size) {
    const pronti = [...rimasti].filter((id) => perId[id].bloccanti.every((d) => !rimasti.has(d))).sort((a, b) => (lav[a].priorita - lav[b].priorita));
    if (!pronti.length) break; // ciclo di dipendenze
    const id = pronti[0]; rimasti.delete(id); const r = perId[id];
    if (r.oreResidue === null) senzaOre++; else ore += r.oreResidue;
    if (r.fermo_g === null) senzaFermo++; else fermo += r.fermo_g;
    sequenza.push({ ...r, passo: sequenza.length + 1, oreCumulate: ore, fermoCumulato: fermo });
  }
  return { righe, eseguibili: righe.filter((r) => !r.bloccanti.length).sort((a, b) => a.lavoro.priorita - b.lavoro.priorita), bloccati: righe.filter((r) => r.bloccanti.length), sequenza,
    ciclo: [...rimasti].map((id) => lav[id].titolo), totali: { ore, senzaOre, fermo_g: fermo, senzaFermo, sessioni: sequenza.reduce((a, r) => a + (r.sessioni || 0), 0) } };
}

/* ---- ricerca nel testo dei PDF ---- */
// Senza accenti e maiuscole, spazi compattati: la lunghezza resta quella dell'originale compattato solo se non ci sono legature; per questo il brano si taglia sul testo normalizzato negli spazi.
export const normTesto = (t) => String(t == null ? '' : t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
// pagine: array di stringhe (indice 0 = pagina 1). Una pagina corrisponde se contiene TUTTE le parole cercate.
// Rende [{ pagina, brano }] in ordine di pagina, al massimo `max`; `altri` = quante pagine in più corrispondono.
export function cercaPagine(pagine, q, max = 20) {
  const parole = normTesto(q).split(/\s+/).filter((w) => w.length >= 2);
  const out = { risultati: [], altri: 0 };
  if (!parole.length || !Array.isArray(pagine)) return out;
  pagine.forEach((grezzo, i) => {
    const testo = String(grezzo || '').replace(/\s+/g, ' '), norm = normTesto(testo);
    if (!parole.every((w) => norm.includes(w))) return;
    if (out.risultati.length >= max) { out.altri++; return; }
    // normTesto può cambiare la lunghezza (legature, caratteri composti): se succede, il brano parte dall'inizio pagina invece di rischiare un taglio sbagliato.
    const pos = norm.length === testo.length ? norm.indexOf(parole[0]) : 0, da = Math.max(0, pos - 90), a = Math.min(testo.length, pos + 210);
    out.risultati.push({ pagina: i + 1, brano: (da > 0 ? '…' : '') + testo.slice(da, a).trim() + (a < testo.length ? '…' : '') });
  });
  return out;
}
