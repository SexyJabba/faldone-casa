// Stato della roadmap derivato dai prerequisiti. Una spunta locale non completa nulla:
// «completato attestato» richiede un esito registrato in content/model/test-results.json o tasks-done.

export const TASK_LABEL = {
  completato: 'Completato attestato', da_verificare: 'Da verificare', pronto: 'Pronto', pronto_incerto: 'Pronto, con prerequisiti non verificati', bloccato: 'Bloccato',
};

export function roadmapState(core) {
  const { phases, tasks } = core.roadmap;
  const passed = new Set((core.testResults || []).filter((r) => r.outcome === 'superato').map((r) => r.testId));
  const done = new Set((core.tasksDone || []).filter((t) => t.evidence).map((t) => t.taskId));
  const decisions = new Map((core.decisions || []).map((d) => [d.id, d]));
  const acq = new Map((core.acquisitions || []).map((a) => [a.id, a]));
  const state = new Map();
  const phaseGate = new Map(phases.map((p) => [p.id, (p.gateTests || []).every((t) => passed.has(t))]));

  const evalTask = (t) => {
    if (state.has(t.id)) return state.get(t.id);
    const blockers = [], unverified = [];
    for (const a of t.after || []) {
      const at = tasks.find((x) => x.id === a);
      const s = at ? evalTask(at) : null;
      if (!s || s.state !== 'completato') blockers.push({ id: a, text: `attende ${a}${at ? `: ${at.title}` : ''}` });
    }
    for (const d of t.decisions || []) {
      const dd = decisions.get(d);
      if (dd && dd.status !== 'approvata') blockers.push({ id: d, text: `decisione aperta: ${dd.title}` });
    }
    if (t.gate && !phaseGate.get(t.gate)) blockers.push({ id: t.gate, text: `gate della fase ${t.gate} non superato (collaudi non registrati)` });
    for (const n of t.needs || []) {
      const a = acq.get(n.acq);
      if (!a) continue;
      if (a.state === 'Acquistato' || a.state === 'Ordinato' || a.state === 'Acquisto dichiarato') unverified.push({ id: n.acq, text: `${a.item}: ${a.state.toLowerCase()}, consegna non registrata` });
      else if (!n.optional) blockers.push({ id: n.acq, text: `${a.item}: ${a.state.toLowerCase()}` });
    }
    let s;
    if (done.has(t.id)) {
      const testsOk = (t.tests || []).every((x) => passed.has(x));
      s = { state: testsOk ? 'completato' : 'da_verificare', blockers: [], unverified: testsOk ? [] : (t.tests || []).filter((x) => !passed.has(x)).map((x) => ({ id: x, text: `collaudo ${x} non registrato` })) };
    } else if (blockers.length) s = { state: 'bloccato', blockers, unverified };
    else s = { state: unverified.length ? 'pronto_incerto' : 'pronto', blockers, unverified };
    state.set(t.id, s);
    return s;
  };
  tasks.forEach(evalTask);
  const phaseState = phases.map((p) => {
    const ts = tasks.filter((t) => t.phase === p.id);
    const missing = (p.gateTests || []).filter((t) => !passed.has(t));
    return { ...p, tasks: ts.map((t) => ({ ...t, ...state.get(t.id) })), gateOpen: missing.length === 0, missingTests: missing };
  });
  const now = tasks.filter((t) => ['pronto', 'pronto_incerto'].includes(state.get(t.id).state)).map((t) => ({ ...t, ...state.get(t.id) }));
  return { phases: phaseState, now, taskState: state };
}
