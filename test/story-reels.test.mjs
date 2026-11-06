// Story Reels: every story has sourced facts, a list of who to ask for image permission, and stays blocked until approved.
import test from 'node:test'; import assert from 'node:assert/strict'; import {readFileSync, readdirSync} from 'node:fs';
const dir = new URL('../content/instagram/stories/', import.meta.url);
const lib = JSON.parse(readFileSync(new URL('../config/sound-library.json', import.meta.url), 'utf8'));
for (const f of readdirSync(dir).filter(f => f.endsWith('.json'))) test(`story ${f}`, () => {
  const s = JSON.parse(readFileSync(new URL(f, dir), 'utf8'));
  assert.ok(['StoryReel', 'StoryReel2'].includes(s.composition), s.composition); assert.ok(s.publishBlockedUntil);
  assert.ok(s.facts.length && s.facts.every(x => x.claim && x.sources.every(u => /^https:\/\//.test(u))));
  assert.ok(s.permissionsToAsk.length && s.permissionsToAsk.every(x => x.what && x.from));
  assert.ok(['end', 'cta'].includes(s.props.scenes.at(-1).kind));
  if (s.composition === 'StoryReel2') assert.ok(s.claims?.length && s.claims.every(c => c.displayText && /^https:\/\//.test(c.sourceUrl) && c.checkedAt));
  for (const [name] of s.sound.cues) assert.ok(lib.sfx[name], name);
});
