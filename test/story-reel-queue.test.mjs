// Owner-approved Story Reels reach the existing queue only as the exact committed render, with every image source listed.
import test from 'node:test'; import assert from 'node:assert/strict'; import {readFileSync} from 'node:fs'; import {createHash} from 'node:crypto';
import {storyPostable, buildStoryDraft} from '../scripts/story-reel.mjs'; import {shortReelAllowed, validShortReel} from '../server/short-reels.mjs'; import {approvedOriginalCreative} from '../server/social-creative.mjs';
const read = p => JSON.parse(readFileSync(new URL('../' + p, import.meta.url), 'utf8'));
const policy = read('config/instagram-editorial-policy.json'), spec = read('content/instagram/stories/find-your-club-adults-v2-en.json');
const sha = p => createHash('sha256').update(readFileSync(new URL('../' + p, import.meta.url))).digest('hex');
const hosted = (s = spec) => buildStoryDraft(s, {posterUrl: 'https://framerusercontent.com/images/x.jpg', posterChecksum: s.approved.posterSha256, videoUrl: 'https://framerusercontent.com/assets/x.mp4', videoChecksum: s.approved.videoSha256});
test('the approved adult discovery Reel is postable and pinned to the committed render', () => {
  assert.equal(storyPostable(spec), true);
  assert.equal(sha(spec.approved.video), spec.approved.videoSha256);
  assert.equal(sha(spec.approved.poster), spec.approved.posterSha256);
  assert.ok(policy.approvedShortReelIds.includes(spec.id));
});
test('a hosted story draft passes the same checks the publisher runs', () => {
  const now = Date.parse(spec.approved.renderedAt) + 3600000;
  assert.equal(shortReelAllowed(hosted(), policy, {now}), true);
  const realNow = Date.now; Date.now = () => now; try { assert.equal(approvedOriginalCreative(hosted()), true); } finally { Date.now = realNow; }
});
test('open blockers, missing sources, pending permissions or long cuts never post', () => {
  assert.equal(storyPostable({...spec, publishBlockedUntil: 'Club agrees'}), false);
  assert.equal(storyPostable({...spec, approved: undefined}), false);
  assert.equal(storyPostable({...spec, footage: []}), false);
  assert.equal(validShortReel({...hosted(), footage: [...spec.footage, {source: 'youtube-cleared', id: 'x', license: 'pending-owner', page: 'https://youtube.com/x'}]}), false);
  const long = hosted(); long.reel = {...long.reel, durationSeconds: 61}; assert.equal(validShortReel(long), false);
  // Pexels and own-screen sources are for story Reels only.
  assert.equal(validShortReel({...hosted(), recipeKind: 'club'}), false);
});
test('stories still blocked: Como waits for the club and its filings', () => {
  const como = read('content/instagram/stories/como-v3-en.json');
  assert.equal(storyPostable(como), false); assert.ok(!policy.approvedShortReelIds.includes(como.id));
});
