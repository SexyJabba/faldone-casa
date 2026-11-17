// pdftesto.js — legge il testo dei PDF caricati in Manuali (con pdf.js, tenuto in locale in vendor/pdfjs) e lo cerca.
// Il testo vive solo in questo browser, accanto al file. Un PDF fatto di scansioni non ha testo: non è cercabile.
import { store } from './store.js';
import { cercaPagine } from './calc.js';

let lib = null;
async function pdfjs() {
  if (!lib) { lib = await import('../vendor/pdfjs/pdf.min.mjs'); lib.GlobalWorkerOptions.workerSrc = new URL('../vendor/pdfjs/pdf.worker.min.mjs', import.meta.url).href; }
  return lib;
}

const inCorso = new Map(); // docId -> { fatte, totali }
export const avanzamento = (docId) => inCorso.get(docId) || null;

// Estrae il testo pagina per pagina e lo salva. Rende { pagine, conTesto } oppure lancia un errore leggibile.
export async function indicizza(docId, suAvanzamento) {
  if (inCorso.has(docId)) throw new Error('Lettura già in corso.');
  const f = await store.getDoc(docId);
  if (!f) throw new Error('Il file non è su questo dispositivo.');
  if (!/pdf/i.test(f.tipo || '') && !/\.pdf$/i.test(f.nome || '')) throw new Error('Non è un PDF: il testo si legge solo dai PDF.');
  inCorso.set(docId, { fatte: 0, totali: null });
  let compito = null;
  try {
    const { getDocument } = await pdfjs();
    compito = getDocument({ data: await f.blob.arrayBuffer() });
    const pdf = await compito.promise, pagine = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const pag = await pdf.getPage(i), tc = await pag.getTextContent();
      pagine.push(tc.items.map((it) => (it.str || '') + (it.hasEOL ? '\n' : ' ')).join('').replace(/[ \t]+/g, ' ').trim());
      pag.cleanup();
      inCorso.set(docId, { fatte: i, totali: pdf.numPages }); if (suAvanzamento) suAvanzamento(i, pdf.numPages);
    }
    await store.setTesto(docId, pagine);
    return { pagine: pagine.length, conTesto: pagine.filter((t) => t.length > 20).length };
  } catch (e) {
    if (e && e.name === 'PasswordException') throw new Error('Il PDF è protetto da password: il testo non si può leggere.');
    throw new Error('Testo non letto: ' + (e && e.message || e));
  } finally { inCorso.delete(docId); if (compito) compito.destroy().catch(() => {}); }
}

// Stato del testo di un documento: null = mai letto; altrimenti { pagine, conTesto }.
export async function statoTesto(docId) {
  const t = await store.getTesto(docId);
  return t ? { pagine: t.pagine.length, conTesto: t.pagine.filter((x) => x.length > 20).length } : null;
}

// Cerca in tutti i documenti letti. Rende { risultati:[{doc, pagina, brano}], altri, nonLetti:[doc] }.
export async function cercaNeiPdf(s, q, maxPerDoc = 12) {
  const out = { risultati: [], altri: 0, nonLetti: [] };
  for (const d of s.documenti || []) {
    const t = await store.getTesto(d.id);
    if (!t) { out.nonLetti.push(d); continue; }
    const r = cercaPagine(t.pagine, q, maxPerDoc);
    out.altri += r.altri; for (const x of r.risultati) out.risultati.push({ doc: d, ...x });
  }
  return out;
}
