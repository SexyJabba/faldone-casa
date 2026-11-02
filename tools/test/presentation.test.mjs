// Percorso «Il progetto in cinque minuti»: sorgente unica, budget, regole editoriali, riferimenti.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, model } from './helpers.mjs';
import { wordCount, renderScene, countWords } from '../../app/lib/scenes.js';

const src = JSON.parse(readFileSync(join(ROOT, 'content/presentazione/scene.json'), 'utf8'));
const { idx, src: msrc } = model();
const text = (s) => [s.title, ...s.body, s.caption].join(' ');

test('dieci scene con identificativi stabili e campi editoriali completi', () => {
  assert.equal(src.scenes.length, 10);
  assert.deepEqual(src.scenes.map((s) => s.id), ['visione', 'valore', 'giornata', 'luoghi', 'servizi', 'funzionamento', 'dati', 'continuita', 'realizzazione', 'quadro']);
  for (const s of src.scenes) for (const k of ['title', 'short', 'question', 'body', 'caption', 'visual', 'alt']) assert.ok(s[k], `${s.id}.${k}`);
});

test('budget: 550–650 parole di testo principale (titoli, testo, didascalie, nota di stato)', () => {
  const wc = wordCount(src, msrc.meta);
  assert.ok(wc.main >= 550 && wc.main <= 650, `${wc.main} parole`);
  for (const p of wc.per) assert.ok(p.words <= 75, `${p.id}: ${p.words} parole`);
});

test('titoli con un messaggio, non solo un argomento', () => {
  for (const s of src.scenes) assert.ok(countWords(s.title) >= 4, `${s.id}: «${s.title}»`);
});

test('prime quattro scene senza codici macchina, acronimi infrastrutturali o prodotti', () => {
  const banned = /\b(M\d|S\d|C\d|MP\d|INV-\d+|INF-\d|ATL-\d|REV\d|Proxmox|quorum|cluster|Nextcloud|Immich|Jellyfin|Home Assistant|Zigbee|MQTT|NVMe|RAIDZ|VLAN|WoL|LTE|ZFS)\b/i;
  for (const s of src.scenes.slice(0, 4)) {
    assert.doesNotMatch(text(s), banned, s.id);
    assert.doesNotMatch(JSON.stringify(s.visual), banned, `${s.id} (visual)`);
  }
});

test('nessun codice macchina nel racconto principale: compaiono solo negli approfondimenti', () => {
  for (const s of src.scenes) assert.doesNotMatch(text(s) + JSON.stringify(s.visual), /\b(M[1-7]|S[1-4]|C[1-4])\b/, s.id);
});

test('i nomi di prodotto nel racconto sono accompagnati dalla funzione', () => {
  const products = ['Nextcloud', 'Immich', 'Home Assistant', 'Frigate', 'Jellyfin', 'Vikunja'];
  for (const s of src.scenes) {
    const v = JSON.stringify(s.visual);
    for (const p of products) if (v.includes(p)) assert.match(v, new RegExp(`[a-zà-ù ]{6,}\\(${p}\\)`), `${s.id}: ${p} senza funzione`);
    for (const p of products) assert.ok(!text(s).includes(p), `${s.id}: ${p} nel testo principale`);
  }
});

test('formulazioni da evitare: niente promesse non dimostrate', () => {
  const all = src.scenes.map((s) => text(s) + JSON.stringify(s.visual) + (s.deep?.text || '')).join(' ');
  assert.doesNotMatch(all, /nulla è (ancora )?collaudato|invece che in un abbonamento|senza perdere (alcun )?dat|risparmi(o)? garantit[oi](?! né)|funziona sempre/i);
  assert.match(src.scenes.find((s) => s.id === 'realizzazione').deep.text, /non dice che nulla funzioni/);
});

test('approfondimenti: entità e schede esistenti nel modello', () => {
  for (const s of src.scenes.filter((x) => x.deep)) {
    for (const e of s.deep.entities) assert.ok(idx.get(e), `${s.id}: entità ${e}`);
    for (const c of s.deep.cards) assert.ok(idx.cards.has(c), `${s.id}: scheda ${c}`);
    assert.ok(s.deep.cards.length >= 1, `${s.id}: approfondimento senza fonti`);
  }
});

test('capitoli della versione precedente ricondotti per significato', () => {
  assert.deepEqual(src.legacyChapters, { 1: 'visione', 2: 'luoghi', 3: 'funzionamento', 4: 'dati', 5: 'continuita' });
});

test('coerenza con il modello: le affermazioni delicate corrispondono ai dati', () => {
  // scena 6: cinque sempre accesi, tre a richiesta
  const nodes = model().core.entities.filter((e) => e.kind === 'node');
  assert.equal(nodes.filter((n) => n.vote).length, 5);
  assert.deepEqual(nodes.filter((n) => n.power === 'on_demand' && /^M\d$/.test(n.id)).map((n) => n.id).sort(), ['M3', 'M4', 'M6']);
  // scena 7: il backup locale è una proposta, le cartucce sono da acquistare
  assert.equal(idx.get('CP-BCK-M4').status.decision, 'proposta');
  assert.equal(idx.get('CP-RDX').status.realization, 'da_acquisire');
  // scena 8: Nextcloud ha subentro su C4, Immich no
  assert.ok(idx.out('NEXTCLOUD', 'recovers_on').some((r) => r.toId === 'C4'));
  assert.equal(idx.out('IMMICH', 'recovers_on').length, 0);
});

test('una sola sorgente: presentazione, lettura, stampa e pagina statica usano lo stesso renderer', () => {
  const html = renderScene(src.scenes[3], 3, 10);
  assert.match(html, /<h1 class="pv-title"/);
  assert.match(html, /<figure class="pv-figure" aria-describedby=/);
  assert.match(html, /<figcaption>/);
  assert.ok(existsSync(join(ROOT, 'presentazione.html')), 'pagina statica generata');
  const st = readFileSync(join(ROOT, 'presentazione.html'), 'utf8');
  for (const s of src.scenes) assert.ok(st.includes(s.title.replace(/'/g, '&#39;')), s.id);
  assert.doesNotMatch(st, /<script/);
  const data = JSON.parse(readFileSync(join(ROOT, 'data/presentazione.json'), 'utf8'));
  assert.deepEqual(data.scenes.map((s) => s.title), src.scenes.map((s) => s.title));
});
