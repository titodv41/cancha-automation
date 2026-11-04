import test from 'node:test'; import assert from 'node:assert/strict';
import { seedSites, candidatePages, findDates, extractCandidates, classifyAudience, locationMatcher, keepCandidate, robotsRules, robotsAllows, htmlToText } from '../server/opening-radar.mjs';

test('seeds club sites once and skips booking apps, socials and CDN files', () => {
  const r = seedSites(['https://www.westonfc.org/tryouts', 'https://westonfc.org/', 'https://www.goodrec.com/x', 'https://facebook.com/a', 'https://framerusercontent.com/i.png', 'https://division1.upsl.com/teams/abc-1/']);
  assert.deepEqual(r.sites, ['https://www.westonfc.org/']); assert.deepEqual(r.leaguePages, ['https://division1.upsl.com/teams/abc-1/']);
});

test('ranks same-site tryout and adult pages first', () => {
  const links = [{ href: 'https://club.org/about', text: 'About' }, { href: 'https://club.org/adult-league', text: 'Adult League' }, { href: 'https://club.org/tryouts', text: 'Tryouts' }, { href: 'https://other.org/tryouts', text: 'Tryouts' }];
  assert.deepEqual(candidatePages(links, 'https://club.org/'), ['https://club.org/adult-league', 'https://club.org/tryouts']);
});

test('reads dates with and without a year; a date with no year is the next occurrence', () => {
  assert.deepEqual(findDates('Tryouts Nov 23-25 and 12/5/2026', '2026-11-04'), ['2026-11-23', '2026-12-05']);
  assert.deepEqual(findDates('Camp March 2', '2026-11-04'), ['2027-03-02']);
  assert.deepEqual(findDates('February 30', '2026-11-04'), []);
});

test('keeps the evidence sentence and drops ended or stale-season lines', () => {
  const html = `<title>Adult League | Demo FC</title><p>Men's Sunday league registration closes November 20, 2026.</p><p>Fall season ran September 1 to October 1, 2026.</p><p>Tryouts for the 2024-2025 season May 1.</p>`;
  const c = extractCandidates(html, { url: 'https://demofc.com/adult', today: '2026-11-04' });
  assert.equal(c.length, 1); assert.equal(c[0].date, '2026-11-20'); assert.equal(c[0].audience, 'adult'); assert.match(c[0].evidence, /registration closes/);
});

test('reads JSON-LD events', () => {
  const html = `<script type="application/ld+json">{"@type":"SportsEvent","name":"Open tryout","startDate":"2026-12-01T18:00"}</script>`;
  assert.equal(extractCandidates(html, { url: 'https://x.com/', today: '2026-11-04' })[0].method, 'json-ld');
});

test('audience labels', () => {
  assert.equal(classifyAudience("Men's over 30 league"), 'adult'); assert.equal(classifyAudience('U12 boys tryouts'), 'youth'); assert.equal(classifyAudience('Registration open'), 'unknown');
});

test('keeps Florida soccer, drops other states, other sports and aggregator lines without a Florida place', () => {
  const place = locationMatcher(['Miami', 'Naples', 'University', 'Doral']);
  const c = (evidence, url = 'https://doralsoccer.com/x', title = '') => ({ evidence, url, title });
  assert.equal(keepCandidate(c('Adult tryouts Dec 1 in Doral'), place), true);
  assert.equal(keepCandidate(c('Camp at Austin, TX on Dec 1'), place), false);
  assert.equal(keepCandidate(c('Basketball league Dec 1', 'https://city.gov/sports'), place), false);
  assert.equal(keepCandidate(c('ID camp at Trine University on Dec 12. Held in IN.', 'https://idcampfinder.org/camp/a'), place), false);
  assert.equal(keepCandidate(c('Women\'s ID clinic Naples, FL Dec 5', 'https://pitchandprofile.com/id-camps/'), place), true);
  assert.equal(keepCandidate(c('Housing waitlist opens November 13', 'https://www.hollywoodfl.org/', 'Hollywood, FL'), place), false);
});

test('robots.txt groups, wildcards and longest match', () => {
  const rules = robotsRules('User-agent: ClaudeBot\nDisallow: /\n\nUser-agent: *\nDisallow: /*?lightbox=\nDisallow: /private\nAllow: /private/tryouts');
  assert.equal(robotsAllows(rules, '/tryouts'), true);
  assert.equal(robotsAllows(rules, '/page?lightbox=1'), false);
  assert.equal(robotsAllows(rules, '/private/x'), false);
  assert.equal(robotsAllows(rules, '/private/tryouts'), true);
});

test('html to text decodes entities and drops scripts', () => {
  assert.equal(htmlToText('<script>x()</script><p>Tryouts&nbsp;&amp; camps&hellip;</p>'), 'Tryouts & camps…');
});
