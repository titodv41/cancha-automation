// Instagram opening radar (report only). Reads recent public posts of the club accounts in
// config/club-instagram-handles.json through Instagram's business discovery API, using the connected @wearecancha
// account, and writes posts that look like tryouts or player calls to private-data/instagram-opening-radar/.
// The encrypted state is only read, never saved. Nothing is published, liked, commented or sent.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { githubStateClient } from './github-state-client.mjs';
import { candidates, discoveryFields, mentions, nameMatches, validHandle } from '../server/instagram-opening-radar.mjs';
const OUT = 'private-data/instagram-opening-radar';
const { clubs, leagues = [] } = JSON.parse(await readFile('config/club-instagram-handles.json', 'utf8'));
const expected = JSON.parse(await readFile('config/meta-account.json', 'utf8'));
const client = githubStateClient();
let connection;
try { connection = (await client.load())?.connection; } finally { await client.close(); }
if (connection?.accountId !== expected.instagramAccountId || !connection.pageToken || !/^v\d+\.\d+$/.test(connection.version || ''))
  throw Error('Expected Cancha Instagram connection is missing');
const found = [], accounts = [], seen = new Set(), mentioned = new Map();
async function read(entry, kind) {
  if (!validHandle(entry.handle) || seen.has(entry.handle)) return;
  seen.add(entry.handle);
  const url = new URL(`https://graph.facebook.com/${connection.version}/${connection.accountId}`);
  url.searchParams.set('fields', discoveryFields(entry.handle));
  try {
    const res = await fetch(url, { headers: { Authorization: 'Bearer ' + connection.pageToken }, signal: AbortSignal.timeout(20000) });
    const body = await res.json().catch(() => ({}));
    // Never echo the response error text or URL: only a short status, so no token can reach the public log.
    if (!res.ok || body.error) { accounts.push({ handle: entry.handle, kind, status: 'unavailable', code: Number.isInteger(body.error?.code) ? body.error.code : res.status }); return; }
    const bd = body.business_discovery || {}, media = bd.media?.data || [];
    if (entry.unconfirmed && !nameMatches(entry.club, bd.name, bd.biography)) { accounts.push({ handle: entry.handle, kind, status: 'name mismatch', name: bd.name || '' }); return; }
    const hits = kind === 'league' ? [] : candidates({ club: entry.club || bd.name || entry.handle, handle: entry.handle }, media);
    if (kind !== 'club') for (const m of media) for (const h of mentions(m.caption)) if (!seen.has(h)) mentioned.set(h, (mentioned.get(h) || 0) + 1);
    found.push(...hits);
    accounts.push({ handle: entry.handle, kind, status: 'read', name: bd.name || '', bio: String(bd.biography || '').slice(0, 200), posts: media.length, candidates: hits.length });
  } catch { accounts.push({ handle: entry.handle, kind, status: 'request failed' }); }
  await new Promise(r => setTimeout(r, 1200));
}
for (const club of clubs) await read(club, 'club');
// League accounts tag their clubs: read the league, then every account it mentions (most-mentioned first, capped).
for (const league of leagues) await read({ handle: league.handle, club: league.league }, 'league');
for (const [handle] of [...mentioned].sort((a, b) => b[1] - a[1]).slice(0, 60)) await read({ handle }, 'mentioned');
await mkdir(OUT, { recursive: true });
const report = { checkedAt: new Date().toISOString(), accounts, candidates: found.sort((a, b) => b.postedAt.localeCompare(a.postedAt)) };
await writeFile(`${OUT}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ read: accounts.filter(a => a.status === 'read').length, unavailable: accounts.filter(a => a.status !== 'read' && a.status !== 'name mismatch').length, nameMismatch: accounts.filter(a => a.status === 'name mismatch').map(a => a.handle), unconfirmedVerified: accounts.filter(a => a.status === 'read' && clubs.some(c => c.unconfirmed && c.handle === a.handle)).map(a => a.handle), candidates: found.length, adultCandidates: found.filter(c => !c.youth).length }));
