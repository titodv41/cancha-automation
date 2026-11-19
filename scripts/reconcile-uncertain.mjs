// Usage: node scripts/reconcile-uncertain.mjs [--apply]
// Reads the encrypted state, lists our latest Instagram posts (read-only Graph call: id, caption, timestamp, permalink)
// and matches each uncertain row by caption. Without --apply it only reports. With --apply it records the outcome and
// saves the state. It never publishes, retries or deletes anything. Logs never include tokens or Insights numbers.
import {readFile} from 'node:fs/promises';
import {githubStateClient} from './github-state-client.mjs';
import {reconcile, apply, UNCERTAIN} from '../server/reconcile-uncertain.mjs';
const write = process.argv.includes('--apply');
const expected = JSON.parse(await readFile('config/meta-account.json', 'utf8'));
const client = githubStateClient();
try {
  const state = await client.load(), c = state?.connection;
  if (c?.accountId !== expected.instagramAccountId || !c.pageToken || !/^v\d+\.\d+$/.test(c.version || '')) throw Error('Expected Cancha Instagram connection is missing');
  const uncertain = state.queue.filter(r => UNCERTAIN.includes(r.status));
  if (!uncertain.length) { console.log(JSON.stringify({uncertain: 0})); process.exit(0); }
  const url = new URL(`https://graph.facebook.com/${c.version}/${c.accountId}/media`);
  url.searchParams.set('fields', 'id,caption,timestamp,permalink'); url.searchParams.set('limit', '20');
  const res = await fetch(url, {headers: {Authorization: 'Bearer ' + c.pageToken}, signal: AbortSignal.timeout(25000)});
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.error) throw Error('Instagram media list unavailable (' + (Number.isInteger(body.error?.code) ? body.error.code : res.status) + ')');
  const results = reconcile(state.queue, body.data || []);
  console.log(JSON.stringify({uncertain: uncertain.length, results, applied: write}));
  if (write && results.some(r => r.outcome !== 'wait')) { apply(state.queue, results); await client.save(state); console.log(JSON.stringify({saved: true})); }
} finally { await client.close(); }
