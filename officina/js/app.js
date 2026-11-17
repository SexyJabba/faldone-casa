// app.js — avvio, navigazione (#/sezione/argomento) e ridisegno a ogni modifica dei dati.
import { store } from './store.js';
import { h } from './ui.js';
import * as quadro from './views/quadro.js';
import * as mappa from './views/mappa.js';
import * as strati from './views/strati.js';
import * as sim from './views/sim.js';
import * as lavori from './views/lavori.js';
import * as budget from './views/budget.js';
import * as diario from './views/diario.js';
import * as fonti from './views/fonti.js';
import * as dati from './views/dati.js';
import * as progetto from './views/progetto.js';
import * as biblioteca from './views/biblioteca.js';

const VISTE = [
  ['quadro', 'Quadro', '◉', quadro], ['progetto', 'Progetto', '◈', progetto], ['mappa', 'Mappa', '▦', mappa], ['strati', 'Materiali', '☰', strati], ['sim', 'Simulatore', '⚡', sim],
  ['lavori', 'Lavori', '🛠', lavori], ['budget', 'Budget', '€', budget], ['diario', 'Diario', '✎', diario], ['manuali', 'Manuali', '▤', biblioteca], ['fonti', 'Fonti', '❝', fonti], ['dati', 'Dati', '⇅', dati],
];
const main = document.getElementById('main'), nav = document.getElementById('nav');

function rotta() {
  const [, nome = 'quadro', ...resto] = location.hash.split('/');
  return { nome, arg: resto.length ? decodeURIComponent(resto.join('/')) : null };
}
function disegna() {
  const { nome, arg } = rotta();
  const v = VISTE.find((x) => x[0] === nome) || (nome === 'cerca' ? ['cerca', '', '', { render: quadro.renderCerca }] : VISTE[0]);
  try { main.replaceChildren(v[3].render(arg)); }
  catch (e) { console.error(e); main.replaceChildren(h('div', { class: 'card' }, h('h2', {}, 'Errore in questa sezione'), h('p', {}, String(e.message || e)), h('p', { class: 'aiuto' }, 'I dati non sono stati toccati. Puoi esportare un backup dalla sezione Dati.'))); }
  nav.replaceChildren(h('div', { class: 'logo' }, 'Vito', h('small', {}, 'Officina e Camper')),
    ...VISTE.map(([k, t, ico]) => h('a', { href: '#/' + k, class: k === nome ? 'on' : null }, h('span', { class: 'ico' }, ico), t)),
    h('div', { class: 'stato' }, navigator.onLine ? 'Dati salvati su questo dispositivo' : 'Offline — dati salvati su questo dispositivo'));
}

store.init().then(() => {
  store.on(disegna);
  addEventListener('hashchange', () => { disegna(); scrollTo(0, 0); });
  addEventListener('online', disegna); addEventListener('offline', disegna);
  disegna();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch((e) => console.warn('Service worker non registrato:', e.message));
}).catch((e) => { main.replaceChildren(h('div', { class: 'card' }, h('h2', {}, 'Impossibile aprire l\'archivio locale'), h('p', {}, String(e && e.message || e)), h('p', {}, 'Controlla che il browser non sia in navigazione privata e che l\'archiviazione dei siti sia consentita.'))); });

window.__vito = { store }; // per prove dalla console
