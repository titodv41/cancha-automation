// Opening radar: pure helpers that turn public club/league pages into dated opening *candidates* with evidence.
// Candidates are never published from here. A later step checks them and sends them to the reviewed importer.

export const EXCLUDED_HOSTS = ['framerusercontent.com', 'framer.com', 'framer.website', 'framer.app', 'facebook.com', 'instagram.com',
  'twitter.com', 'x.com', 'youtube.com', 'tiktok.com', 'linkedin.com', 'google.com', 'goo.gl', 'apple.com', 'teamworkonline.com',
  'wikipedia.org', 'gstatic.com', 'googleapis.com', 'cloudflare.com', 'w3.org', 'schema.org', 'wix.com', 'squarespace.com',
  // Booking apps: we link to their organizers, we do not copy their sessions.
  'goodrec.com', 'plei.app', 'meetup.com', 'eventbrite.com'];
// Multi-state listing sites: keep only lines that name a Florida place.
export const AGGREGATOR_HOSTS = ['idcampfinder.com', 'idcampfinder.org', 'pitchandprofile.com', 'register.ryzer.com', 'ryzer.com'];
const LEAGUE_DIRECTORY_HOSTS = ['division1.upsl.com', 'premier.upsl.com'];

const KEYWORDS = /\b(try-?outs?|evaluations?|id camps?|camps?|clinics?|registration|register|sign[- ]?ups?|open (?:play|training|session)s?|pick-?ups?|adult|men'?s|women'?s|coed|leagues?|seasons?|program(?:s|me)?|pruebas|inscripci[oó]n)\b/i;
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const MONTH_RE = '(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';

export const hostOf = url => { try { return new URL(url).host.toLowerCase().replace(/^www\./, ''); } catch { return ''; } };
const excluded = host => !host || EXCLUDED_HOSTS.some(h => host === h || host.endsWith('.' + h));

// Seed list: each club's own site (origin) plus league directory pages, which link out to team sites.
export function seedSites(urls) {
  const sites = new Map(), leaguePages = new Set();
  for (const raw of urls) {
    let u; try { u = new URL(raw); } catch { continue; }
    if (u.protocol !== 'https:' && u.protocol !== 'http:') continue;
    const host = hostOf(u.href);
    if (excluded(host)) continue;
    if (LEAGUE_DIRECTORY_HOSTS.includes(host)) { if (/\/teams\//.test(u.pathname)) leaguePages.add(u.href); continue; }
    if (!sites.has(host)) sites.set(host, `https://${u.host}/`);
  }
  return { sites: [...sites.values()].sort(), leaguePages: [...leaguePages].sort() };
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' };
export const decode = s => s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => e[0] === '#'
  ? String.fromCodePoint(parseInt(e[1].toLowerCase() === 'x' ? e.slice(2) : e.slice(1), e[1].toLowerCase() === 'x' ? 16 : 10))
  : ENTITIES[e.toLowerCase()] ?? m);

export function htmlToText(html) {
  return decode(String(html)
    .replace(/<(head|title|script|style|noscript|svg|template)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li|h[1-6]|tr|section|article|header|footer)>/gi, '\n')
    .replace(/<[^>]+>/g, ' '))
    .replace(/[ \t ]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();
}

export function extractLinks(html, base) {
  const out = [];
  for (const m of String(html).matchAll(/<a\b[^>]*href\s*=\s*["']([^"'#]+)[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    try { out.push({ href: new URL(decode(m[1]), base).href, text: htmlToText(m[2]).slice(0, 120) }); } catch {}
  }
  return out;
}

// Same-site pages most likely to hold dated openings, best first.
export function candidatePages(links, siteUrl, max = 8) {
  const host = hostOf(siteUrl), seen = new Set(), scored = [];
  for (const { href, text } of links) {
    if (hostOf(href) !== host || /\.(pdf|jpe?g|png|gif|zip|docx?)$/i.test(href)) continue;
    const clean = href.split('#')[0]; if (seen.has(clean) || clean === siteUrl) continue; seen.add(clean);
    const hay = `${text} ${decodeURIComponent(new URL(clean).pathname).replace(/[-_/]/g, ' ')}`;
    let score = 0;
    if (/try-?outs?|evaluations?|pruebas/i.test(hay)) score += 5;
    if (/\b(adult|men'?s|women'?s|coed|over ?\d\d|o\d\d|amateur)\b/i.test(hay)) score += 4;
    if (/pick-?up|open (play|training|session)/i.test(hay)) score += 4;
    if (/camps?|clinics?/i.test(hay)) score += 3;
    if (/regist|sign ?up|inscrip/i.test(hay)) score += 3;
    if (/leagues?|seasons?|programs?/i.test(hay)) score += 1;
    if (score) scored.push({ url: clean, score });
  }
  return scored.sort((a, b) => b.score - a.score || a.url.localeCompare(b.url)).slice(0, max).map(x => x.url);
}

// Outbound team websites listed on a league directory page.
export function teamSitesFromLeaguePage(links, pageUrl) {
  const leagueHost = hostOf(pageUrl), out = new Set();
  for (const { href } of links) {
    const host = hostOf(href);
    if (!host || host === leagueHost || host.endsWith('upsl.com') || excluded(host)) continue;
    out.add(`https://${new URL(href).host}/`);
  }
  return [...out];
}

const iso = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const valid = (y, m, d) => { const t = new Date(Date.UTC(y, m - 1, d)); return t.getUTCMonth() === m - 1 && t.getUTCDate() === d; };
const days = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
// A date without a year is the next occurrence, allowing items that started up to 30 days ago.
function withYear(m, d, y, today) {
  if (y) return valid(y, m, d) ? iso(y, m, d) : null;
  const ty = Number(today.slice(0, 4));
  for (const yy of [ty, ty + 1]) if (valid(yy, m, d) && days(today, iso(yy, m, d)) >= -30) return iso(yy, m, d);
  return null;
}

export function findDates(text, today) {
  const found = [];
  const year = s => (s ? (s.length === 2 ? 2000 + Number(s) : Number(s)) : null);
  for (const m of text.matchAll(new RegExp(`\\b${MONTH_RE}\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:\\s*[-–]\\s*\\d{1,2}(?:st|nd|rd|th)?)?(?:,?\\s+(\\d{4}))?\\b`, 'gi')))
    found.push({ at: m.index, m: MONTHS.findIndex(n => n.startsWith(m[1].toLowerCase().slice(0, 3))) + 1, d: Number(m[2]), y: year(m[3]) });
  for (const m of text.matchAll(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{4}|\d{2}))?\b/g)) found.push({ at: m.index, m: Number(m[1]), d: Number(m[2]), y: year(m[3]) });
  found.sort((a, b) => a.at - b.at);
  const out = [];
  found.forEach((f, i) => {
    // In a range like "September 1 to October 1, 2026" the yearless date borrows the later explicit year.
    const later = found.slice(i + 1).find(g => g.y);
    const y = f.y ?? (later ? (f.m <= later.m ? later.y : later.y - 1) : null);
    const date = withYear(f.m, f.d, y, today); if (date) out.push(date);
  });
  return [...new Set(out)].sort();
}

export function classifyAudience(text) {
  const adult = /\b(adults?|men'?s|women'?s|coed|co-ed|18\+|over ?(30|35|40)|o(30|35|40)|amateur|upsl|semi-?pro)\b/i.test(text);
  const youth = /\b(u-?\d{1,2}|youth|kids|boys|girls|children|ages? \d{1,2}\s*[-–]\s*1[0-7]|birth ?years?|20(0[89]|1\d|2\d) ?(born|birth))\b/i.test(text);
  return adult && !youth ? 'adult' : youth && !adult ? 'youth' : adult && youth ? 'mixed' : 'unknown';
}

export function classifyKind(text) {
  if (/try-?outs?|evaluations?|id camps?|pruebas/i.test(text)) return 'tryout';
  if (/pick-?up|open (play|training|session)|drop-?in/i.test(text)) return 'pickup';
  if (/camps?|clinics?/i.test(text)) return 'camp';
  if (/leagues?|seasons?|registration|register|sign ?ups?|inscrip/i.test(text)) return 'league';
  return 'other';
}

function jsonLdEvents(html) {
  const out = [];
  const walk = v => { if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') { if ([v['@type']].flat().some(t => /Event$/.test(String(t)))) out.push(v); walk(v['@graph']); } };
  for (const m of String(html).matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) { try { walk(JSON.parse(m[1])); } catch {} }
  return out;
}

// Dated opening candidates on one page. Each keeps the exact sentence it came from as evidence.
export function extractCandidates(html, { url, today, horizonDays = 180 }) {
  const text = htmlToText(html), title = htmlToText((String(html).match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '').slice(0, 140);
  const pageAudience = classifyAudience(`${title} ${text.slice(0, 4000)}`), out = [];
  const keep = (date, end) => days(today, end || date) >= 0 && days(today, date) <= horizonDays;
  for (const e of jsonLdEvents(html)) {
    const date = String(e.startDate || '').slice(0, 10);
    const end = String(e.endDate || '').slice(0, 10) || null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !keep(date, end)) continue;
    const evidence = `${e.name || ''} ${e.description || ''}`.replace(/\s+/g, ' ').trim().slice(0, 240);
    out.push({ url, title, date, endDate: String(e.endDate || '').slice(0, 10) || null, kind: classifyKind(evidence), audience: classifyAudience(evidence) === 'unknown' ? pageAudience : classifyAudience(evidence), evidence, method: 'json-ld' });
  }
  const lines = text.split(/\n|(?<=[.!?])\s+(?=[A-Z])/).map(s => s.trim()).filter(s => s.length >= 12 && s.length <= 400);
  for (const line of lines) {
    if (!KEYWORDS.test(line)) continue;
    const years = (line.match(/\b20\d\d\b/g) || []).map(Number);
    if (years.length && Math.max(...years) < Number(today.slice(0, 4))) continue;
    const dates = findDates(line, today); if (!dates.length || !keep(dates[0], dates.length > 1 ? dates.at(-1) : null)) continue;
    const own = classifyAudience(line);
    out.push({ url, title, date: dates[0], endDate: dates.length > 1 ? dates.at(-1) : null, kind: classifyKind(line), audience: own === 'unknown' ? pageAudience : own, evidence: line.slice(0, 240), method: 'text' });
  }
  const seen = new Set();
  return out.filter(c => { const k = `${c.date}|${c.evidence}`; if (seen.has(k)) return false; seen.add(k); return true; });
}

const STATES = ['alabama','alaska','arizona','arkansas','california','colorado','connecticut','delaware','georgia','hawaii','idaho','illinois','indiana','iowa','kansas','kentucky','louisiana','maine','maryland','massachusetts','michigan','minnesota','mississippi','missouri','montana','nebraska','nevada','new hampshire','new jersey','new mexico','new york','north carolina','north dakota','ohio','oklahoma','oregon','pennsylvania','rhode island','south carolina','south dakota','tennessee','texas','utah','vermont','virginia','washington','west virginia','wisconsin','wyoming'];
const STATE_CODES = 'AL|AK|AZ|AR|CA|CO|CT|DE|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC';
const OTHER_METROS = ['atlanta','austin','dallas','houston','san antonio','chicago','baltimore','charlotte','los angeles','phoenix','denver','seattle','boston','philadelphia','nashville','new york city','brooklyn','san diego','raleigh','richmond'];
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export function locationMatcher(floridaPlaces) {
  const GENERIC = new Set(['university', 'village', 'country club', 'lakeside', 'harbor', 'sunset', 'holiday', 'southwest', 'northwest', 'midway', 'union park', 'progress', 'citrus', 'columbia', 'washington', 'madison', 'jackson', 'lincoln', 'franklin', 'clinton', 'aventura park']);
  const names = [...new Set(floridaPlaces.map(p => p.toLowerCase()).filter(n => n.length >= 5 && !GENERIC.has(n)))].sort((a, b) => b.length - a.length);
  const fl = new RegExp(`\\b(florida|fla\\.|${names.map(esc).join('|')})\\b|,\\s*FL\\b`, 'i');
  const away = new RegExp(`\\b(${[...STATES, ...OTHER_METROS].map(esc).join('|')})\\b`, 'i'), code = new RegExp(`(,|\\b[Ii]n)\\s+(${STATE_CODES})\\b`);
  return text => { const a = away.test(text) || code.test(text), f = fl.test(text) || /,\s*FL\b/.test(text); return f && !a ? 'florida' : a && !f ? 'elsewhere' : a && f ? 'mixed' : 'unknown'; };
}
const OTHER_SPORT = /\b(basketball|volleyball|pickleball|tennis|football|flag football|softball|baseball|kickball|lacrosse|hockey|golf|swim(ming)?)\b/i;
const SOCCER = /\b(soccer|f[uú]tbol|futsal|football club|fc)\b/i;
// Keep candidates that can plausibly be Florida soccer, using only the evidence line (and the site type).
export function keepCandidate(c, place) {
  const host = hostOf(c.url), where = place(`${c.evidence} ${c.title}`), line = place(c.evidence);
  const page = `${c.title} ${host} ${decodeURIComponent(new URL(c.url).pathname)}`.replace(/[-_/.]/g, ' ');
  if ((OTHER_SPORT.test(c.evidence) || OTHER_SPORT.test(page)) && !SOCCER.test(c.evidence)) return false;
  const aggregator = AGGREGATOR_HOSTS.some(h => host === h || host.endsWith('.' + h));
  if (!aggregator && !SOCCER.test(c.evidence) && !SOCCER.test(page) && !/soccer|futbol|futsal|fc|united|kickers|strikers/i.test(host)) return false;
  if (aggregator) return line === 'florida';
  return line !== 'elsewhere' && where !== 'elsewhere';
}

export function summarize(report) {
  const c = report.candidates, by = k => Object.fromEntries([...c.reduce((m, x) => m.set(x[k], (m.get(x[k]) || 0) + 1), new Map())].sort());
  return { checkedOn: report.checkedOn, sites: report.sites.length, sitesReached: report.sites.filter(s => s.status === 'ok').length,
    blockedByRobots: report.sites.filter(s => s.status === 'robots').length, pagesRead: report.pagesRead, teamSitesFromLeagues: report.teamSitesFromLeagues,
    rawCandidates: report.rawCandidates, candidates: c.length, sitesWithCandidates: new Set(c.map(x => hostOf(x.url))).size, byAudience: by('audience'), byKind: by('kind') };
}

// robots.txt: rules from groups that name `*` or Cancha; wildcards (*) and end anchors ($) per RFC 9309.
export function robotsRules(text) {
  const rules = []; let agents = [], inRules = false;
  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim(); if (!line) continue;
    const i = line.indexOf(':'); if (i < 0) continue;
    const key = line.slice(0, i).trim().toLowerCase(), val = line.slice(i + 1).trim();
    if (key === 'user-agent') { if (inRules) { agents = []; inRules = false; } agents.push(val.toLowerCase()); continue; }
    if (key !== 'allow' && key !== 'disallow') continue;
    inRules = true;
    if (val && agents.some(a => a === '*' || a.includes('cancha'))) rules.push({ allow: key === 'allow', path: val });
  }
  return rules;
}
export function robotsAllows(rules, path) {
  let best = null;
  for (const r of rules) {
    const re = new RegExp('^' + r.path.split('*').map(p => p.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*').replace(/\\\$$/, '$'));
    if (re.test(path) && (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow))) best = r;
  }
  return !best || best.allow;
}
