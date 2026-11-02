// Tabella delle rotte: ogni vista è caricata solo quando serve.
const lazy = (mod, name) => async (app, p) => (await import(mod))[name](app, p);

export const routes = [
  [/^atlante$/, 'atlante', lazy('./atlas.js', 'atlas'), 'esplora'],
  [/^$/, 'home', lazy('./home.js', 'home'), ''],
  [/^esplora$/, 'esplora', lazy('./explore.js', 'explore'), 'esplora'],
  [/^esplora\/(macchine|servizi|dati|rete|rack)$/, 'lista', lazy('./explore.js', 'list'), 'esplora'],
  [/^ambito\/([a-z-]+)$/, 'ambito', lazy('./explore.js', 'scope'), 'esplora'],
  [/^e\/([A-Za-z0-9._-]+)$/, 'entità', lazy('./entity.js', 'entity'), 'esplora'],
  [/^impianti$/, 'impianti', lazy('./impianti.js', 'impianti'), 'esplora'],
  [/^impianti\/([a-z]+)$/, 'impianto', lazy('./impianti.js', 'impianto'), 'esplora'],
  [/^mappa$/, 'mappa', lazy('./map.js', 'map'), 'esplora'],
  [/^presenta$/, 'presentazione', lazy('./presentation.js', 'presentation'), ''],
  [/^percorsi\/cinque-minuti$/, 'presentazione', lazy('./presentation.js', 'legacy'), ''],
  [/^percorsi$/, 'percorsi', lazy('./paths.js', 'paths'), 'esplora'],
  [/^percorsi\/([a-z-]+)$/, 'percorso', lazy('./paths.js', 'path'), 'esplora'],
  [/^simula$/, 'simula', lazy('./sim.js', 'simView'), 'emergenza'],
  [/^emergenza$/, 'emergenza', lazy('./emergency.js', 'emergency'), 'emergenza'],
  [/^procedura\/([A-Z0-9-]+)$/, 'procedura', lazy('./emergency.js', 'procedure'), 'emergenza'],
  [/^realizza$/, 'realizza', lazy('./roadmap.js', 'roadmap'), 'realizza'],
  [/^realizza\/decisioni$/, 'decisioni', lazy('./roadmap.js', 'decisions'), 'realizza'],
  [/^realizza\/decisioni\/([A-Z0-9-]+)$/, 'decisione', lazy('./roadmap.js', 'decision'), 'realizza'],
  [/^realizza\/attivita\/([A-Z0-9.-]+)$/, 'attività', lazy('./roadmap.js', 'task'), 'realizza'],
  [/^realizza\/(acquisti|collaudi)$/, 'registri', lazy('./roadmap.js', 'registers'), 'realizza'],
  [/^costi$/, 'costi', lazy('./costs.js', 'costs'), 'realizza'],
  [/^contribuisci$/, 'contribuisci', lazy('./contribute.js', 'contribute'), 'realizza'],
  [/^contribuisci\/([A-Z0-9-]+)$/, 'questione', lazy('./contribute.js', 'issue'), 'realizza'],
  [/^documenti$/, 'documenti', lazy('./docs.js', 'library'), 'documenti'],
  [/^documenti\/(revisioni|download)$/, 'doc', lazy('./docs.js', 'misc'), 'documenti'],
  [/^glossario$/, 'glossario', lazy('./docs.js', 'glossary'), 'documenti'],
  [/^glossario\/(.+)$/, 'glossario', lazy('./docs.js', 'glossary'), 'documenti'],
  [/^guida$/, 'guida', lazy('./docs.js', 'guide'), 'documenti'],
  [/^inventario$/, 'inventario', lazy('./docs.js', 'inventory'), 'documenti'],
  [/^inventario\/(INV-\d{3})$/, 'inventario', lazy('./docs.js', 'inventory'), 'documenti'],
  [/^cerca$/, 'cerca', lazy('./search.js', 'searchPage'), ''],
  [/^preferiti$/, 'preferiti', lazy('./settings.js', 'settings'), ''],
  [/^connettori$/, 'connettori', lazy('./settings.js', 'connectors'), 'realizza'],
];

export function resolveRoute(app, path) {
  if (app.idx.cards.has(path)) return { view: lazy('./docs.js', 'card'), params: [path], area: 'documenti' };
  for (const [re, , view, area] of routes) {
    const m = path.match(re);
    if (m) return { view, params: m.slice(1).map((x) => { try { return decodeURIComponent(x); } catch { return x; } }), area };
  }
  return { view: lazy('./docs.js', 'notFound'), params: [path], area: '' };
}
