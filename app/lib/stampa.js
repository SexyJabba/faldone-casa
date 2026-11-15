// Faldone stampabile: che cosa entra nel PDF intero o di un blocco, quante pagine, che cosa non è aggiornato.
// Puro: lavora su data/stampa.json (dalla build) e stampa/pdf/manifest.json (dai PDF generati).

/** Raccoglitore intero: frontespizio, poi ogni blocco con il suo indice e le schede stampate lì. */
export const wholeOrder = (plan) => ['_copertina', ...plan.blocks.flatMap((b) => [`_blocco-${b.id}`, ...b.own])];

/** Blocco da solo: indice e tutte le schede che servono ai suoi codici, anche se nel raccoglitore stanno altrove. */
export function blockOrder(plan, id) {
  const b = plan.blocks.find((x) => x.id === id);
  return b ? [`_blocco-${b.id}`, ...b.all] : [];
}

export const keyOf = (x) => x.code || x.id;

/** Parti e schede il cui PDF manca o è stato generato da un testo diverso da quello corrente. */
export function staleKeys(plan, pdf) {
  return [...plan.parts, ...plan.sheets].filter((x) => pdf?.files?.[keyOf(x)]?.hash !== x.hash).map(keyOf);
}

/** Pagine e byte di un insieme di file; null se di qualcuno non c'è il PDF. */
export function totals(keys, pdf) {
  let pages = 0; let bytes = 0;
  for (const k of keys) { const f = pdf?.files?.[k]; if (!f) return null; pages += f.pages; bytes += f.bytes; }
  return { pages, bytes, sheets: pages / 2 };
}

export const fileName = (plan, id) => (id === 'tutto' ? `Faldone-rev${plan.revision}.pdf` : `Faldone-blocco-${id}-rev${plan.revision}.pdf`);
