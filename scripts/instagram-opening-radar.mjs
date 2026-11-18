// Instagram opening radar (report only). Reads recent public posts of the club accounts in
// config/club-instagram-handles.json through Instagram's business discovery API, using the connected @wearecancha
// account, and writes posts that look like tryouts or player calls to private-data/instagram-opening-radar/.
// The encrypted state is only read, never saved. Nothing is published, liked, commented or sent.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { githubStateClient } from './github-state-client.mjs';
import { candidates, discoveryFields, validHandle } from '../server/instagram-opening-radar.mjs';
const OUT = 'private-data/instagram-opening-radar';
const { clubs } = JSON.parse(await readFile('config/club-instagram-handles.json', 'utf8'));
const expected = JSON.parse(await readFile('config/meta-account.json', 'utf8'));
const client = githubStateClient();
let connection;
try { connection = (await client.load())?.connection; } finally { await client.close(); }
if (connection?.accountId !== expected.instagramAccountId || !connection.pageToken || !/^v\d+\.\d+$/.test(connection.version || ''))
  throw Error('Expected Cancha Instagram connection is missing');
const found = [], accounts = [];
for (const club of clubs) {
  if (!validHandle(club.handle)) { accounts.push({ handle: club.handle, status: 'invalid handle' }); continue; }
  const url = new URL(`https://graph.facebook.com/${connection.version}/${connection.accountId}`);
  url.searchParams.set('fields', discoveryFields(club.handle));
  try {
    const res = await fetch(url, { headers: { Authorization: 'Bearer ' + connection.pageToken }, signal: AbortSignal.timeout(20000) });
    const body = await res.json().catch(() => ({}));
    // Never echo the response error text or URL: only a short status, so no token can reach the public log.
    if (!res.ok || body.error) { accounts.push({ handle: club.handle, status: 'unavailable', code: Number.isInteger(body.error?.code) ? body.error.code : res.status }); continue; }
    const media = body.business_discovery?.media?.data || [];
    const hits = candidates(club, media);
    found.push(...hits); accounts.push({ handle: club.handle, status: 'read', posts: media.length, candidates: hits.length });
  } catch { accounts.push({ handle: club.handle, status: 'request failed' }); }
  await new Promise(r => setTimeout(r, 1500));
}
await mkdir(OUT, { recursive: true });
const report = { checkedAt: new Date().toISOString(), accounts, candidates: found.sort((a, b) => b.postedAt.localeCompare(a.postedAt)) };
await writeFile(`${OUT}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ accounts: accounts.map(a => `${a.handle}:${a.status}`), candidates: found.length }));
