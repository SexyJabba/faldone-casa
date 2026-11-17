// Navigazione laterale: una sola definizione, usata dalla pagina generata (tools/lib/static.mjs) e dall'app.
// Ogni voce: [rotta, etichetta, icona, espressione che riconosce le pagine a cui appartiene].
import { icon } from '../ui.js';

export const NAV = [
  { items: [['', 'Panoramica', 'home', '^$|^presenta']] },
  { title: 'Esplora', items: [
    ['atlante', 'Atlante delle funzioni', 'atlas', '^atlante'],
    ['esplora', 'Per ambito', 'explore', '^esplora$|^ambito/'],
    ['esplora/macchine', 'Macchine', 'server', '^esplora/macchine'],
    ['esplora/servizi', 'Servizi', 'service', '^esplora/servizi'],
    ['esplora/dati', 'Dati e copie', 'data', '^esplora/dati'],
    ['esplora/rete', 'Rete', 'network', '^esplora/rete'],
    ['esplora/rack', 'Rack e porte', 'rack', '^esplora/rack'],
    ['esplora/postazioni', 'Postazioni e client', 'lab', '^esplora/postazioni'],
    ['mappa', 'Mappa relazionale', 'map', '^mappa'],
    ['percorsi', 'Percorsi', 'path', '^percorsi'],
    ['impianti', 'Impianti di casa', 'plug', '^impianti'],
    ['inventario', 'Inventario', 'box', '^inventario'],
  ] },
  { title: 'Usa e risolvi', items: [
    ['emergenza', 'Qualcosa non funziona', 'fix', '^emergenza|^procedura/'],
    ['simula', 'Simulatore', 'sim', '^simula'],
  ] },
  { title: 'Realizza', items: [
    ['realizza', 'Roadmap', 'build', '^realizza$|^realizza/attivita'],
    ['realizza/decisioni', 'Decisioni', 'check', '^realizza/decisioni'],
    ['realizza/collaudi', 'Collaudi', 'kit', '^realizza/collaudi'],
    ['realizza/acquisti', 'Acquisti', 'van', '^realizza/acquisti'],
    ['costi', 'Costi ed energia', 'bolt', '^costi'],
    ['contribuisci', 'Questioni aperte', 'people', '^contribuisci'],
    ['connettori', 'Connettori', 'network', '^connettori'],
  ] },
  { title: 'Documentazione', items: [
    ['documenti', 'Schede', 'docs', '^documenti$'],
    ['glossario', 'Glossario', 'bulb', '^glossario'],
    ['documenti/revisioni', 'Revisioni e fonti', 'file', '^documenti/revisioni'],
    ['documenti/stampa', 'Faldone stampabile', 'file', '^documenti/stampa'],
    ['documenti/download', 'Download', 'offline', '^documenti/download'],
    ['guida', 'Come si usa', 'explore', '^guida'],
  ] },
  { title: 'App personali', items: [ // app a sé nelle loro cartelle: si aprono come pagine, non come rotte
    ['officina/', 'Officina del Vito', 'van', '^$a'],
    ['scout/', 'Lo Scout', 'explore', '^$a'],
  ] },
  { title: 'Su questo dispositivo', items: [
    ['riservato', 'Area riservata', 'lock', '^riservato'],
    ['preferiti', 'Preferiti e dati locali', 'star', '^preferiti'],
  ] },
];
const ITEMS = NAV.flatMap((g) => g.items);
const KIND_ROUTE = { node: 'esplora/macchine', service: 'esplora/servizi', dataset: 'esplora/dati', storage: 'esplora/dati', copy: 'esplora/dati', network: 'esplora/rete', device: 'esplora/rete', place: 'esplora', cluster: 'esplora/macchine' };

/** La voce della barra a cui appartiene una pagina. kindOf: tipo di un elemento del modello; isCard: è il codice di una scheda. */
export function navRouteFor(path, { kindOf = () => null, isCard = () => false } = {}) {
  if (path.startsWith('e/')) return KIND_ROUTE[kindOf(path.slice(2))] || 'esplora';
  if (isCard(path)) return 'documenti';
  const hit = ITEMS.find(([, , , m]) => new RegExp(m).test(path));
  return hit ? hit[0] : null;
}

/** Marcatura della barra laterale. Senza JavaScript restano collegamenti normali. */
export function sidebarHtml({ revision = '' } = {}) {
  return `<a class="brand" href="#"><span class="mark" aria-hidden="true">F</span><span><strong>Il Faldone</strong><small>Rev ${revision} · progetto</small></span></a>
<nav class="side-nav" aria-label="Navigazione principale">${NAV.map((g, i) => `<div class="side-group"${g.title ? ` role="group" aria-labelledby="sg-${i}"` : ''}>${g.title ? `<p class="side-h" id="sg-${i}">${g.title}</p>` : ''}${g.items.map(([r, l, ic]) => (r.endsWith('/') ? `<a href="${r}">${icon(ic)}<span>${l}</span></a>` : `<a href="#${r}" data-side="${r}">${icon(ic)}<span>${l}</span></a>`)).join('')}</div>`).join('')}</nav>`;
}
