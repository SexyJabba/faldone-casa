// Calcoli di energia, costi, trasferimenti e capacità. Funzioni pure.
// Formula: kWh = Σ(W_stato × ore_stato) / 1000. Valori mancanti restano null, mai zero.

export const DAYS_YEAR = 365;
export const DAYS_MONTH = 365 / 12;

const num = (x) => (x === null || x === undefined || x === '' || Number.isNaN(Number(x)) ? null : Number(x));

/** Energia giornaliera di un profilo {idleW, loadW, hoursOn, hoursLoad}. */
export function dailyKwh(p) {
  const idle = num(p.idleW), load = num(p.loadW), on = num(p.hoursOn), ld = num(p.hoursLoad);
  const errors = [];
  if (idle === null || load === null || on === null || ld === null) return { value: null, errors: ['valore mancante: il consumo non si può calcolare'] };
  if (idle < 0 || load < 0) errors.push('potenza negativa');
  if (on < 0 || on > 24) errors.push('ore di accensione fuori da 0–24');
  if (ld < 0 || ld > on) errors.push('ore sotto carico maggiori delle ore di accensione');
  if (errors.length) return { value: null, errors };
  return { value: (idle * (on - ld) + load * ld) / 1000, errors: [] };
}

export function energyTotals(profiles, tariff) {
  const rows = profiles.map((p) => ({ ...p, day: dailyKwh(p) }));
  const valid = rows.filter((r) => r.day.value !== null);
  const missing = rows.filter((r) => r.day.value === null);
  const day = valid.reduce((a, r) => a + r.day.value, 0);
  const t = num(tariff);
  const month = day * DAYS_MONTH, year = day * DAYS_YEAR;
  const contributions = valid.map((r) => ({ id: r.id, label: r.label, kwhYear: r.day.value * DAYS_YEAR, share: day ? r.day.value / day : 0 })).sort((a, b) => b.kwhYear - a.kwhYear);
  return {
    rows, missing: missing.map((m) => m.id), complete: missing.length === 0,
    kwhDay: day, kwhMonth: month, kwhYear: year, avgW: (day * 1000) / 24,
    eurMonth: t === null ? null : month * t, eurYear: t === null ? null : year * t, contributions,
  };
}

/** Tempo di trasferimento. size in byte; bandwidth in Mbit/s; efficiency 0–1 (overhead, pause). */
export function transferTime(sizeBytes, mbit, efficiency = 1) {
  const s = num(sizeBytes), b = num(mbit), e = num(efficiency);
  if (s === null || b === null || e === null) return { seconds: null, error: 'valore mancante' };
  if (b <= 0) return { seconds: null, error: 'banda nulla: il trasferimento non termina' };
  if (e <= 0 || e > 1) return { seconds: null, error: 'efficienza fuori da 0–1' };
  const seconds = (s * 8) / (b * 1e6 * e);
  return { seconds, days: seconds / 86400, theoretical: (s * 8) / (b * 1e6) / 86400 };
}
export const UNITS = { GB: 1e9, TB: 1e12, GiB: 2 ** 30, TiB: 2 ** 40 };
export const toBytes = (v, unit) => (num(v) === null || !UNITS[unit] ? null : num(v) * UNITS[unit]);

/** Capacità nominale di un pool. Non tiene conto di filesystem, versioni e riserve. */
export function poolNominal(layout, disks, sizeTB) {
  const n = num(disks), s = num(sizeTB);
  if (n === null || s === null) return null;
  if (layout === 'raidz1') return n >= 2 ? (n - 1) * s : null;
  if (layout === 'raidz2') return n >= 3 ? (n - 2) * s : null;
  if (layout === 'mirror-pairs') return n % 2 === 0 ? (n / 2) * s : null;
  if (layout === 'single') return n === 1 ? s : null;
  return null;
}

/** Confronto self-hosting / abbonamenti. hardware: [{amount, state}]; si contano solo le spese sostenute o impegnate. */
export const SPENT_STATES = ['Acquistato', 'Acquisto dichiarato', 'Ordinato'];
export function savings({ rows, years, maintEurYear, domainEurYear, energyEurYear, hardware, includeProposed = false }) {
  const cloudYear = rows.filter((r) => r.on).reduce((a, r) => a + (num(r.eurMonth) || 0) * 12, 0);
  const hwRows = hardware.filter((h) => num(h.amount) !== null && (SPENT_STATES.includes(h.state) || (includeProposed && /Proposta/.test(h.state))));
  const hwUnknown = hardware.filter((h) => num(h.amount) === null && SPENT_STATES.includes(h.state)).map((h) => h.id);
  const hw = hwRows.reduce((a, h) => a + num(h.amount), 0);
  const e = num(energyEurYear);
  const ownYear = (e ?? 0) + (num(maintEurYear) || 0) + (num(domainEurYear) || 0);
  const y = num(years) || 1;
  const net = cloudYear - ownYear;
  return {
    cloudYear, ownYear, energyKnown: e !== null, hardware: hw, hardwareUnknown: hwUnknown,
    cloudTotal: cloudYear * y, ownTotal: hw + ownYear * y, difference: cloudYear * y - (hw + ownYear * y),
    breakEvenYears: net > 0 ? hw / net : null,
  };
}
