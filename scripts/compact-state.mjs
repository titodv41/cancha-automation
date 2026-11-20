// Usage: node scripts/compact-state.mjs            -> report sizes only (no contents, no Insights values)
//        node scripts/compact-state.mjs --apply    -> archive old queue rows into an encrypted backup and save
// Nov 20: the encrypted state reached 944 KB of the 950 KB limit and the Insights run could no longer save; posting
// would be next. Archived rows stay recoverable in an encrypted backup on automation-state (backups/<sha>.enc.json).
import {githubStateClient} from './github-state-client.mjs';
import {compactPlan} from '../server/compact-state.mjs';
import {readFile} from 'node:fs/promises';
const apply = process.argv.includes('--apply'), client = githubStateClient();
const size = v => Buffer.byteLength(JSON.stringify(v ?? null));
try {
  const state = await client.load();
  const policy = JSON.parse(await readFile('config/instagram-editorial-policy.json', 'utf8'));
  const top = Object.entries(state).map(([k, v]) => [k, size(v)]).sort((a, b) => b[1] - a[1]).slice(0, 12);
  const byStatus = {};
  for (const r of state.queue || []) { const s = byStatus[r.status] ||= {rows: 0, bytes: 0}; s.rows++; s.bytes += size(r); }
  const plan = compactPlan(state.queue || [], policy, Date.now());
  console.log(JSON.stringify({totalBytes: size(state), top, queue: byStatus, archive: {rows: plan.archive.length, bytes: size(plan.archive)}}));
  if (apply && plan.archive.length) {
    const ref = await client.saveBackup({capturedAt: new Date().toISOString(), kind: 'queue-archive', rows: plan.archive});
    state.queueArchiveRefs = [...(state.queueArchiveRefs || []), {...ref, rows: plan.archive.length}];
    state.queue = plan.keep;
    await client.save(state);
    console.log(JSON.stringify({archived: plan.archive.length, totalBytes: size(state)}));
  }
} finally { await client.close(); }
