import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {validComparisonCarousel,comparisonCarouselAllowed,confirmComparisonSources} from '../server/comparison-carousels.mjs';
import {buildDraft} from '../scripts/prepare-comparison-carousels.mjs';
import {slides} from '../scripts/render-comparison-carousels.mjs';
import {approvedOriginalCreative} from '../server/social-creative.mjs';
import {passesCarouselPolicy} from '../server/carousel-quality.mjs';
import {requiresSource,confirmPostSource} from '../server/post-source.mjs';
const {carousels}=JSON.parse(await readFile('content/instagram/comparison-carousels.json','utf8'));
const policy=JSON.parse(await readFile('config/instagram-editorial-policy.json','utf8'));
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
