import test from 'node:test';import assert from 'node:assert/strict';import {validShortReel,shortReelAllowed} from '../server/short-reels.mjs';import {buildDraft} from '../scripts/prepare-short-reels.mjs';
const sum='a'.repeat(64),vid='b'.repeat(64),now=Date.parse('2026-10-27T12:00:00Z');
const recipe=(kind='data',checkedOn='2026-10-26')=>({id:'data-id-camps',kind,checkedOn,caption:'College ID camps in Florida this winter. Dates & links in bio.',segments:[{text:'What does a college ID camp cost?'},{big:'$101',chip:'Eckerd'}]});
const result={footage:[{id:'pixabay-1',source:'pixabay',license:'Pixabay Content License',page:'https://pixabay.com/videos/x/'}],seconds:9.6};
const draft=(r=recipe())=>buildDraft(r,result,{date:'2026-10-27',posterUrl:'https://framerusercontent.com/images/abc.jpg',posterChecksum:sum,videoUrl:'https://framerusercontent.com/assets/abc.mp4',videoChecksum:vid,renderedAt:'2026-10-27T11:00:00Z'});
test('a hosted, sourced short Reel is valid and becomes original Cancha creative',()=>{
 assert.equal(validShortReel(draft(),{now}),true);
 assert.equal(draft().id,'short-data-id-camps-2026-10-27');
});
test('posts only when the policy enables short Reels and lists the recipe',()=>{
 assert.equal(shortReelAllowed(draft(),{shortReelsEnabled:true,approvedShortReelIds:['data-id-camps']},{now}),true);
 assert.equal(shortReelAllowed(draft(),{shortReelsEnabled:false,approvedShortReelIds:['data-id-camps']},{now}),false);
 assert.equal(shortReelAllowed(draft(),{shortReelsEnabled:true,approvedShortReelIds:['meme-keeper']},{now}),false);
});
test('rejects stale data facts, unhosted video, unknown footage sources and mismatched evidence',()=>{
 assert.equal(validShortReel(draft(recipe('data','2026-10-10')),{now}),false);
 assert.equal(validShortReel(draft(recipe('meme','2026-10-10')),{now}),true);
 assert.equal(validShortReel({...draft(),reel:{...draft().reel,assetUrl:'https://example.com/a.mp4'}},{now}),false);
 assert.equal(validShortReel({...draft(),footage:[{...result.footage[0],source:'instagram'}]},{now}),false);
 assert.equal(validShortReel({...draft(),visualEvidence:{...draft().visualEvidence,videoChecksum:sum}},{now}),false);
});
