import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSources, normalize } from '../lib/load.mjs';
import { buildIndex } from '../../app/lib/model.js';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
let cache;
export function model() {
  if (cache) return cache;
  const src = loadSources(ROOT);
  const norm = normalize(src);
  const core = { ...norm, meta: src.meta, tests: src.tests, testResults: src.testResults, procedures: src.procedures, decisions: src.decisions, issues: src.issues, cards: src.cards, roadmap: src.roadmap, acquisitions: src.legacy.config.acquisitions, tasksDone: [] };
  cache = { src, norm, core, idx: buildIndex(core) };
  return cache;
}
/** Indice su un core modificato (per prove isolate). */
export function indexWith(mutate) {
  const { core } = model();
  const c = structuredClone(core);
  mutate(c);
  return buildIndex(c);
}
