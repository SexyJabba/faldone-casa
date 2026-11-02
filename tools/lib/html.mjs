// Utilità HTML per la build: escape, testo semplice, sanitizzazione a lista bianca.
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' };
export function htmlToText(html) {
  return String(html).replace(/<\/(p|li|h[1-6]|tr|div|table)>/g, ' ').replace(/<td[^>]*>/g, ' ').replace(/<[^>]+>/g, '').replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, e) => ENT[e]).replace(/\s+/g, ' ').trim();
}

const TAGS = new Set(['p', 'div', 'span', 'strong', 'em', 'b', 'i', 'u', 'small', 'br', 'hr', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'a', 'code', 'pre', 'kbd', 'blockquote', 'figure', 'figcaption', 'sup', 'sub', 'dl', 'dt', 'dd']);
const ATTRS = { a: ['href', 'title'], th: ['scope', 'colspan', 'rowspan'], td: ['colspan', 'rowspan'], div: ['class'], span: ['class'], p: ['class'], h2: ['id'], h3: ['id'], table: ['class'] };
/** Lista bianca di tag e attributi; link solo interni (#), relativi o https. */
export function sanitizeHtml(html) {
  return String(html)
    .replace(/<(script|style|iframe|object|embed|svg|math)[\s\S]*?<\/\1>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (m, tag, attrs) => {
      const t = tag.toLowerCase();
      if (!TAGS.has(t)) return '';
      if (m.startsWith('</')) return `</${t}>`;
      const allowed = ATTRS[t] || [];
      const kept = [];
      attrs.replace(/([a-zA-Z-]+)\s*=\s*("([^"]*)"|'([^']*)')/g, (_, k, __, v1, v2) => {
        const key = k.toLowerCase(); const v = v1 ?? v2 ?? '';
        if (!allowed.includes(key)) return;
        if (key === 'href' && !/^(#|https:\/\/|\.{0,2}\/|[A-Za-z0-9_][A-Za-z0-9_./-]*$)/.test(v)) return;
        if (key === 'href' && /^\s*javascript:/i.test(v)) return;
        kept.push(`${key}="${esc(v.replace(/&amp;/g, '&'))}"`);
      });
      if (t === 'a' && /href="https:/.test(kept.join(' '))) kept.push('rel="noopener noreferrer"');
      return `<${t}${kept.length ? ' ' + kept.join(' ') : ''}>`;
    });
}
