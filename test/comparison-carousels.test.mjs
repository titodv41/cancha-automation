import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {validComparisonCarousel,comparisonCarouselAllowed,validComparisonReel,comparisonReelAllowed,confirmComparisonSources} from '../server/comparison-carousels.mjs';
import {buildDraft,buildReelDraft} from '../scripts/prepare-comparison-carousels.mjs';
import {durations} from '../scripts/render-comparison-reels.mjs';
import {satisfiesDailyMediaMix} from '../server/instagram-media-mix.mjs';
import {slides} from '../scripts/render-comparison-carousels.mjs';
import {approvedOriginalCreative} from '../server/social-creative.mjs';
import {passesCarouselPolicy} from '../server/carousel-quality.mjs';
import {requiresSource,confirmPostSource} from '../server/post-source.mjs';
const {carousels}=JSON.parse(await readFile('content/instagram/comparison-carousels.json','utf8'));
const livePolicy=JSON.parse(await readFile('config/instagram-editorial-policy.json','utf8'));
// The mechanism is tested with Reels approved; the live policy currently approves none (owner, Oct 29).
const policy={...livePolicy,approvedComparisonReelIds:['florida-id-camps-dec-2026','thanksgiving-camps-2026']};
const recipe=carousels.find(c=>c.id==='florida-id-camps-dec-2026');
const hex=n=>String(n).repeat(64).slice(0,64);
const hosted=slides(recipe).map((s,i)=>({assetUrl:`https://framerusercontent.com/images/slide${i}.jpg`,assetChecksum:hex(i),altText:s.alt,width:1080,height:1350}));
const draft=buildDraft(recipe,hosted,{renderedAt:'2026-10-27T14:00:00.000Z'}),now=Date.parse('2026-10-28T15:00:00Z');
const page=html=>async()=>new Response(html,{status:200,headers:{'content-type':'text/html'}});
test('renders a cover, one slide per item, a table and a checklist with alt text',()=>{
 const s=slides(recipe);assert.equal(s.length,recipe.items.length+3);assert.ok(s.every(x=>x.alt.length>20&&x.alt.length<=1000));
 assert.match(s[1].html,/Dec 12/);assert.match(s.at(-2).html,/\$50 \/ \$275/);
});
test('an approved, fresh carousel passes every publishing gate',()=>{
 assert.equal(validComparisonCarousel(draft,{now}),true);assert.equal(comparisonCarouselAllowed(draft,policy,{now}),true);
 assert.equal(requiresSource(draft),true);
});
test('facts expire after 7 days and once any compared event has passed',()=>{
 assert.equal(validComparisonCarousel(draft,{now:Date.parse('2026-11-04T15:00:00Z')}),false);
 assert.equal(validComparisonCarousel({...draft,factsCheckedOn:'2026-12-10'},{now:Date.parse('2026-12-13T15:00:00Z')}),false);
 assert.equal(validComparisonCarousel({...draft,comparedItems:draft.comparedItems.map(i=>({...i,confirm:[]}))},{now}),false);
});
test('only policy-approved recipes may post',()=>{
 assert.equal(comparisonCarouselAllowed({...draft,recipeId:'other'},policy,{now}),false);
 assert.equal(comparisonCarouselAllowed(draft,{...policy,comparisonCarouselsEnabled:false},{now}),false);
});
test('the photo-per-slide rule is replaced by the comparison checks only for this kind',()=>{
 const p={...policy};assert.equal(passesCarouselPolicy({...draft,visualEvidence:{...draft.visualEvidence,kind:'photo-carousel'}},p),false);
});
test('publication recheck: changed page blocks, bot-blocked page defers to the fact window, missing page blocks',async t=>{
 t.mock.timers.enable({apis:['Date'],now});
 const all='USA League $50 $275 December 13 2026 $195.00 12/20/26 $225 2007';
 assert.equal(await confirmComparisonSources(draft,{fetchImpl:page(all)}),true);
 assert.equal(await confirmPostSource(draft,{fetchImpl:page(all)}),true);
 assert.equal(await confirmComparisonSources(draft,{fetchImpl:page('USA League $60 $275 December 13')}),false);
 assert.equal(await confirmComparisonSources(draft,{fetchImpl:async u=>u.includes('floridakraze')?new Response('blocked',{status:403}):page(all)()}),true);
 assert.equal(await confirmComparisonSources(draft,{fetchImpl:async()=>new Response('gone',{status:404})}),false);
});
test('the draft is a valid original creative with no photos required',async t=>{
 t.mock.timers.enable({apis:['Date'],now});
 assert.equal(approvedOriginalCreative(draft),true);
});
const reelRecipe=carousels.find(c=>c.id==='thanksgiving-camps-2026');
const reel=buildReelDraft(reelRecipe,{seconds:16.2},{posterUrl:'https://framerusercontent.com/images/poster.jpg',posterChecksum:hex('a'),videoUrl:'https://framerusercontent.com/assets/reel.mp4',videoChecksum:hex('b'),renderedAt:'2026-10-27T14:00:00.000Z'});
test('the Reel version passes the same gates with its own caption and subject',async t=>{
 t.mock.timers.enable({apis:['Date'],now});
 assert.equal(validComparisonReel(reel,{now}),true);assert.equal(comparisonReelAllowed(reel,policy,{now}),true);
 assert.equal(approvedOriginalCreative(reel),true);assert.equal(requiresSource(reel),true);
 assert.notEqual(reel.caption,buildDraft(reelRecipe,hosted,{renderedAt:'2026-10-27T14:00:00.000Z'}).caption);
 assert.equal(reel.visualEvidence.subjectKey,'reel:thanksgiving-camps-2026');assert.equal(reel.slides,undefined);
 assert.equal(satisfiesDailyMediaMix(reel,[],{...policy,minimumDailyCarousels:0},{now}),true);
});
test('the Reel version expires and stops with the same facts, and needs approval',()=>{
 assert.equal(validComparisonReel(reel,{now:Date.parse('2026-11-04T15:00:00Z')}),false);
 assert.equal(validComparisonReel({...reel,visualEvidence:{...reel.visualEvidence,videoChecksum:hex('c')}},{now}),false);
 assert.equal(validComparisonReel({...reel,reel:{...reel.reel,durationSeconds:45}},{now}),false);
 assert.equal(comparisonReelAllowed(reel,{...policy,approvedComparisonReelIds:[]},{now}),false);
 assert.equal(comparisonCarouselAllowed(reel,policy,{now}),false);
});
test('every recipe has a distinct Reel caption and the Reel timing fits Instagram',()=>{
 for(const c of carousels){assert.ok(c.reelCaption&&c.reelCaption!==c.caption&&c.reelCaption.length<=2200);
  const d=durations(slides(c).length),total=d.reduce((a,b)=>a+b,0)-0.35*(d.length-1);assert.ok(total>=5&&total<=30,String(total));}
});
test('after the day\'s carousel the second slot takes a comparison Reel, never the same comparison within 36 hours',async t=>{
 const at=Date.parse('2026-10-28T14:05:00Z');t.mock.timers.enable({apis:['Date'],now:at});
 const {mkdtemp,rm}=await import('node:fs/promises'),{join}=await import('node:path'),{tmpdir}=await import('node:os');
 const {openQueue,saveDraft}=await import('../server/instagram-queue.mjs'),{savePlan,prepareStandingPlan}=await import('../server/instagram-plan.mjs');
 const dir=await mkdtemp(join(tmpdir(),'cancha-compare-reel-')),db=openQueue(join(dir,'queue.sqlite'));
 try{
  const idReel=buildReelDraft(recipe,{seconds:15},{posterUrl:'https://framerusercontent.com/images/id-poster.jpg',posterChecksum:hex('d'),videoUrl:'https://framerusercontent.com/assets/id.mp4',videoChecksum:hex('e'),renderedAt:'2026-10-27T14:00:00.000Z'});
  saveDraft(db,{...draft,sourceType:'brand'});saveDraft(db,{...idReel,sourceType:'brand'});saveDraft(db,{...reel,sourceType:'brand'});
  savePlan(db,{enabled:true,weekdays:[3],localTime:'12:30',localTimes:['12:30','18:00'],startDate:'2026-10-28',sourceTypes:['brand'],formats:['feed']},'Owner asks for at least three Reels a week');
  const editorialPolicy={...policy,curatedDraftIds:['compare-florida-id-camps-dec-2026','reel-compare-florida-id-camps-dec-2026','reel-compare-thanksgiving-camps-2026']};
  const result=await prepareStandingPlan(db,{now:at,connected:true,editorialPolicy,verifySource:async()=>true});
  assert.deepEqual(result.scheduled.map(x=>[x.id,x.scheduledAt]),[['compare-florida-id-camps-dec-2026','2026-10-28T16:30:00.000Z'],['reel-compare-thanksgiving-camps-2026','2026-10-28T22:00:00.000Z']]);
  assert.ok(result.skipped.some(x=>x.id==='reel-compare-florida-id-camps-dec-2026'&&/36 hours/.test(x.reason)));
 }finally{db.close();await rm(dir,{recursive:true,force:true});}
});
test('the live policy approves no comparison Reels (owner, Oct 29)',()=>{assert.deepEqual(livePolicy.approvedComparisonReelIds,[]);assert.equal(comparisonReelAllowed(reel,livePolicy,{now}),false);});
