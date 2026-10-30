import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';
import{validBriefCarousel,briefCarouselAllowed,confirmBriefSources}from'../server/brief-carousels.mjs';
import{buildBriefDraft}from'../scripts/prepare-brief-carousels.mjs';import{briefSlides}from'../scripts/render-brief-carousels.mjs';
import{approvedOriginalCreative}from'../server/social-creative.mjs';import{passesCarouselPolicy}from'../server/carousel-quality.mjs';import{requiresSource}from'../server/post-source.mjs';
const{briefs}=JSON.parse(readFileSync(new URL('../content/instagram/brief-carousels.json',import.meta.url)));
const policy=JSON.parse(readFileSync(new URL('../config/instagram-editorial-policy.json',import.meta.url)));
const recipe=briefs.find(b=>!b.expiresOn),today=new Date().toISOString().slice(0,10);
const draft=(r={...recipe,checkedOn:today})=>buildBriefDraft(r,briefSlides(r).map((s,i)=>({assetUrl:`https://framerusercontent.com/images/brief${i}.jpg`,assetChecksum:String(i).repeat(64).slice(0,64).replace(/\d/g,'a'),altText:s.alt,width:1080,height:1350})),{renderedAt:new Date().toISOString()});
test('a current brief with cited sources is valid, approved and treated as a sourced post',()=>{
 const d=draft();assert.equal(validBriefCarousel(d),true);assert.equal(briefCarouselAllowed(d,policy),true);assert.equal(requiresSource(d),true);
 assert.equal(passesCarouselPolicy(d,policy),true);
});
test('stale facts, missing sources or an unapproved brief are refused',()=>{
 assert.equal(validBriefCarousel(draft({...recipe,checkedOn:'2026-01-01'})),false);
 assert.equal(validBriefCarousel({...draft(),briefSources:[]}),false);
 assert.equal(validBriefCarousel({...draft(),briefSources:[{url:'http://x.com',confirm:['abc']}]}),false);
 assert.equal(briefCarouselAllowed({...draft(),recipeId:'nope'},policy),false);
 assert.equal(briefCarouselAllowed(draft(),{...policy,briefCarouselsEnabled:false}),false);
});
test('the source recheck needs every confirm token on a page that loads; bot refusals do not contradict',async()=>{
 const page=t=>async()=>new Response(t,{status:200});
 assert.equal(await confirmBriefSources(draft(),{fetchImpl:page('<p>an estimated $350,000 at Broward College</p>')}),true);
 assert.equal(await confirmBriefSources(draft(),{fetchImpl:page('<p>Broward College only</p>')}),false);
 assert.equal(await confirmBriefSources(draft(),{fetchImpl:async()=>new Response('',{status:404})}),false);
 assert.equal(await confirmBriefSources(draft(),{fetchImpl:async()=>new Response('',{status:403})}),true);
});
test('every brief keeps opinion on its take slide, credits sources and stays approvable',()=>{
 for(const b of briefs){assert.ok(b.points.at(-1).label==='OUR TAKE');assert.ok(b.sources.every(s=>s.confirm.every(t=>t.length>=3)));assert.match(b.caption,/Source/);assert.doesNotMatch(b.caption,/partner|sponsored by/i);}
 const d=draft();assert.equal(approvedOriginalCreative(d),true);
});
test('a brief photo comes from one of its cited sources, is credited, and collab handles are valid',()=>{
 const host=u=>new URL(u).hostname.replace(/^www\./,'');
 for(const b of briefs.filter(b=>b.photo)){assert.ok(b.sources.some(s=>host(s.url)===host(b.photo.url)),b.id);assert.match(b.photo.credit,/^Photo: /);assert.match(b.caption,/📸 Photo:/);assert.ok(b.photo.alt.length>20);}
 for(const b of briefs.filter(b=>b.collab))assert.match(b.collab,/^[a-z0-9._]{1,30}$/);
 const d=buildBriefDraft({...recipe,checkedOn:today},[{assetUrl:'https://framerusercontent.com/images/x.jpg',assetChecksum:'a'.repeat(64),altText:'x'}],{renderedAt:new Date().toISOString()});
 assert.deepEqual(d.collaborators,recipe.collab?[recipe.collab]:undefined);
});
test('a time-bound brief stops after its New York expiry date',()=>{
 const r={...recipe,checkedOn:today,expiresOn:'2026-10-30'},d=draft(r);
 assert.equal(validBriefCarousel(d,{now:Date.parse('2026-10-30T23:00:00Z')}),true);
 assert.equal(validBriefCarousel(d,{now:Date.parse('2026-10-31T05:00:00Z')}),false);
 assert.equal(validBriefCarousel({...d,expiresOn:'Oct 30'},{now:Date.parse('2026-10-30T12:00:00Z')}),false);
});
