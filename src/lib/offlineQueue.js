const KEY = "cozy_offline_queue";

export function enqueue(type, payload) {
  const q = getQueue();
  const entry = { type, payload, _qid: `${Date.now()}-${Math.random().toString(36).slice(2)}`, _ts: Date.now() };
  q.push(entry);
  try { localStorage.setItem(KEY, JSON.stringify(q)); } catch {}
  return entry._qid;
}

export function getQueue() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}

export function dequeue(qid) {
  const q = getQueue().filter((op) => op._qid !== qid);
  try { localStorage.setItem(KEY, JSON.stringify(q)); } catch {}
}

export function hasPending() {
  return getQueue().length > 0;
}
