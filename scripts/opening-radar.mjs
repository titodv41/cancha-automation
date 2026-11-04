// Opening radar (report only). Reads the public Cancha catalog, visits each listed club/league site politely,
// and writes dated opening candidates with source evidence. Nothing is published or sent anywhere.
// Usage: node scripts/opening-radar.mjs [--limit N] [--out private-data/opening-radar]
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { SITE_HOSTS } from '../server/site-hosts.mjs';
import { dateInNewYork } from '../server/offer-expiry.mjs';
import { seedSites, extractLinks, candidatePages, teamSitesFromLeaguePage, extractCandidates, summarize, hostOf, robotsRules, robotsAllows, locationMatcher, keepCandidate } from '../server/opening-radar.mjs';

const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : fallback; };
const LIMIT = Number(arg('--limit', 0)), OUT = arg('--out', 'private-data/opening-radar');
const UA = 'CanchaOpeningRadar/0.1 (+https://wearecancha.framer.website)';
const MAX_BYTES = 2_000_000;

async function get(url, { timeout = 15000 } = {}) {
  const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml,text/plain' }, redirect: 'follow', signal: AbortSignal.timeout(timeout) });
  if (!res.ok) throw Error(`HTTP ${res.status}`);
  const type = res.headers.get('content-type') || '';
  if (!/html|text\/plain/i.test(type)) throw Error(`type ${type.split(';')[0]}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return { url: res.url, html: buf.subarray(0, MAX_BYTES).toString('utf8') };
}

const robotsCache = new Map();
async function allowed(url) {
  const u = new URL(url);
  if (!robotsCache.has(u.origin)) {
    let rules = [];
    try { rules = robotsRules((await get(`${u.origin}/robots.txt`, { timeout: 8000 })).html); } catch {}
    robotsCache.set(u.origin, rules);
  }
  return robotsAllows(robotsCache.get(u.origin), u.pathname + u.search);
}

async function pool(items, size, fn) { const out = []; let i = 0; await Promise.all(Array.from({ length: size }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]); } })); return out; }

async function catalogUrls() {
  const { html } = await get(`https://${SITE_HOSTS[0]}/`);
  const mod = html.match(/https:\/\/framerusercontent\.com\/sites\/[^"']+CanchaDiscoveryData[^"']+\.mjs/);
  if (!mod) throw Error('Catalog module not found on the live site');
  const src = (await (await fetch(mod[0], { signal: AbortSignal.timeout(20000) })).text());
  return [...new Set(src.match(/https?:\/\/[^`"'\s)]+/g) || [])];
}

const today = dateInNewYork();
const { sites: catalogSites, leaguePages } = seedSites(await catalogUrls());
let teamSites = [];
await pool(leaguePages, 4, async page => {
  try { if (!(await allowed(page))) return; const { url, html } = await get(page); teamSites.push(...teamSitesFromLeaguePage(extractLinks(html, url), url)); } catch {}
});
teamSites = [...new Set(teamSites)].filter(s => !catalogSites.some(c => hostOf(c) === hostOf(s)));
let sites = [...catalogSites, ...teamSites]; if (LIMIT) sites = sites.slice(0, LIMIT);

const report = { checkedOn: today, userAgent: UA, teamSitesFromLeagues: teamSites.length, pagesRead: 0, sites: [], candidates: [] };
await pool(sites, 6, async site => {
  const entry = { site, status: 'ok', pages: [] };
  try {
    if (!(await allowed(site))) { entry.status = 'robots'; return; }
    const home = await get(site); report.pagesRead++;
    report.candidates.push(...extractCandidates(home.html, { url: home.url, today }));
    for (const page of candidatePages(extractLinks(home.html, home.url), home.url)) {
      try {
        if (!(await allowed(page))) continue;
        const r = await get(page); report.pagesRead++; entry.pages.push(r.url);
        report.candidates.push(...extractCandidates(r.html, { url: r.url, today }));
      } catch {}
    }
  } catch (e) { entry.status = 'error'; entry.error = String(e.message).slice(0, 80); }
  finally { report.sites.push(entry); }
});
report.sites.sort((a, b) => a.site.localeCompare(b.site));
const place = locationMatcher(JSON.parse(await readFile('config/discovery-cities.json', 'utf8')).places.map(p => p.city));
report.rawCandidates = report.candidates.length;
report.candidates = report.candidates.filter(c => keepCandidate(c, place));
report.candidates.sort((a, b) => a.date.localeCompare(b.date) || a.url.localeCompare(b.url));

await mkdir(OUT, { recursive: true });
await writeFile(`${OUT}/report-${today}.json`, JSON.stringify(report, null, 2));
const rows = report.candidates.map(c => `| ${c.date}${c.endDate ? '→' + c.endDate : ''} | ${c.audience} | ${c.kind} | ${hostOf(c.url)} | ${c.evidence.replace(/\|/g, '/')} | ${c.url} |`);
await writeFile(`${OUT}/report-${today}.md`, `# Opening radar ${today} (candidates, not verified)\n\n\`\`\`json\n${JSON.stringify(summarize(report), null, 2)}\n\`\`\`\n\n| Date | Audience | Kind | Site | Evidence | Page |\n|---|---|---|---|---|---|\n${rows.join('\n')}\n`);
console.log(JSON.stringify(summarize(report)));
