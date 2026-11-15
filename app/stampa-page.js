// Pagine del Faldone stampabile: l'unico comportamento è il pulsante «Stampa».
for (const b of document.querySelectorAll('[data-print]')) {
  b.hidden = false;
  b.addEventListener('click', () => window.print());
}
