// Reconcile posts whose publish outcome is uncertain (status Publishing or Needs reconciliation), Nov 18: a network error
// mid-publish left one row uncertain and the publisher (rightly) stopped all posting. Never retry: look for the post on
// Instagram. Found -> Published with the real media id (receipt). Not found -> Failed, never retried automatically.
export const UNCERTAIN = ['Publishing', 'Needs reconciliation'];
const norm = s => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase().slice(0, 90);
export function captionOf(row) { try { return JSON.parse(row.content).caption || ''; } catch { return ''; } }
export function reconcile(queue, media, now = Date.now()) {
  const used = new Set(queue.map(r => r.published_id).filter(Boolean)), out = [];
  for (const row of queue.filter(r => UNCERTAIN.includes(r.status))) {
    const want = norm(captionOf(row)), since = Date.parse(row.scheduled_at || '') - 6 * 3600e3;
    const hit = want ? media.find(m => !used.has(m.id) && norm(m.caption) === want && (!Number.isFinite(since) || Date.parse(m.timestamp) >= since)) : undefined;
    // Only conclude "not found" once the attempt is at least 30 minutes old, so a slow publish is never mislabelled.
    const old = !row.scheduled_at || now - Date.parse(row.scheduled_at) > 30 * 60e3;
    out.push(hit ? {id: row.id, outcome: 'found', mediaId: hit.id, at: hit.timestamp, permalink: hit.permalink} : {id: row.id, outcome: old ? 'not-found' : 'wait'});
    if (hit) used.add(hit.id);
  }
  return out;
}
export function apply(queue, results) {
  for (const r of results) {
    const row = queue.find(x => x.id === r.id); if (!row || !UNCERTAIN.includes(row.status)) continue;
    if (r.outcome === 'found') Object.assign(row, {status: 'Published', published_id: r.mediaId, published_at: new Date(r.at).toISOString(), note: 'Reconciled: found on Instagram after an uncertain publish'});
    if (r.outcome === 'not-found') Object.assign(row, {status: 'Failed', note: 'Reconciled: not on Instagram after an uncertain publish; not retried automatically'});
  }
  return queue;
}
