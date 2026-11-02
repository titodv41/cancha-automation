import test from'node:test';import assert from'node:assert/strict';
import{contentReadiness}from'../server/content-readiness.mjs';
import{localStoryDescriptor,localStoryHash}from'../server/local-story-source.mjs';
import{readFileSync}from'node:fs';
import{buildBriefDraft}from'../scripts/prepare-brief-carousels.mjs';
import{buildDraft as buildComparison}from'../scripts/prepare-comparison-carousels.mjs';
import{buildCreatorDraft}from'../scripts/creator-cut.mjs';
const now=Date.parse('2026-10-23T23:00:00Z');
function photo(id,sourceId){const s=localStoryDescriptor(sourceId),h=localStoryHash(s),slides=['a','b'].map((p,i)=>({photoId:p,assetUrl:'https://framerusercontent.com/images/'+id+i+'.jpg',assetChecksum:p.repeat(64),width:1080,height:1350,altText:'Actual club photo'}));return{id,status:'Draft',content:{id,format:'feed',sourceType:'brand',caption:'Club guide.',altText:'Two real club photos.',rights:'Owner-cleared media.',creativeVersion:'cancha-local-v2',editorialSourceId:s.id,officialSourceUrl:s.documents[0].url,sourceHash:h,assetUrl:slides[0].assetUrl,assetChecksum:slides[0].assetChecksum,slides,photos:['a','b'].map(p=>({id:p,originalUrl:new URL(p+'.jpg',s.documents[0].url).href,sourcePage:s.documents[0].url,publisher:'Club publisher',subject:'Club photo '+p,originalChecksum:p.repeat(64),authorization:'owner-cleared-2026-10-22'})),visualEvidence:{creator:'Cancha',kind:'photo-carousel',subjectKey:s.id,sourceUrl:s.documents[0].url,sourceHash:h,assetChecksum:slides[0].assetChecksum,renderedAt:new Date(now-1000).toISOString()}}}}
const rows=()=>[photo('a','rowdies-shield-20261018'),photo('b','fkk-parent-fit-20261023')];
test('readiness counts usable community work and reports a shortage when a source is blocked or work is already published',t=>{
 t.mock.method(Date,'now',()=>now);const r=rows();assert.deepEqual(contentReadiness(r,{}, {now}),{ready:2,carousels:2,minimumReady:2,shortage:false});r[0].note='Source unavailable, changed or closed at '+new Date(now).toISOString();assert.equal(contentReadiness(r,{}, {now}).shortage,true);r[1].status='Published';assert.equal(contentReadiness(r,{}, {now}).ready,0);
});
test('expired sources, retired designs and malformed queue rows cannot make an empty bank look healthy',t=>{
 t.mock.method(Date,'now',()=>now);assert.equal(contentReadiness(rows(),{}, {now:Date.parse('2030-01-01')}).ready,0);assert.equal(contentReadiness(rows(),{retiredDraftIds:['a','b']},{now}).ready,0);assert.equal(contentReadiness([{id:'bad',status:'Draft',content:'not-json'}],{}, {now}).shortage,true);
});
test('the buffer counts approved Briefs, comparison carousels and long creator Reels without admitting stale or rejected work',t=>{
 const at=Date.parse('2026-11-02T18:00:00Z');t.mock.method(Date,'now',()=>at);
 const date='2026-11-02',renderedAt=new Date(at-1000).toISOString();
 const recipe=JSON.parse(readFileSync('content/instagram/brief-carousels.json')).briefs.find(b=>b.id==='ftl-utd-broward-college-fields');
 const compared=JSON.parse(readFileSync('content/instagram/comparison-carousels.json')).carousels[0];
 const images=Array.from({length:5},(_,i)=>({assetUrl:`https://framerusercontent.com/images/ready${i}.jpg`,assetChecksum:String(i).repeat(64),altText:'Reviewed carousel slide',width:1080,height:1350}));
 const brief=buildBriefDraft({...recipe,checkedOn:date},images,{renderedAt});
 const comparison=buildComparison({...compared,checkedOn:date},images,{renderedAt});
 const reel=buildCreatorDraft({id:'creator-ready',hook:'A specific story',caption:'A reviewed creator story.',altText:'Actual subject footage.'},
  {seconds:74.27,renderedAt,footage:[{source:'youtube-cleared',id:'ready-video',creator:'Creator',license:'creator permission',page:'https://www.youtube.com/watch?v=ready-video'}]},
  {date,posterUrl:'https://framerusercontent.com/images/ready-reel.jpg',posterChecksum:'a'.repeat(64),videoUrl:'https://framerusercontent.com/assets/ready-reel.mp4',videoChecksum:'b'.repeat(64)});
 const policy={briefCarouselsEnabled:true,approvedBriefCarouselIds:[recipe.id],comparisonCarouselsEnabled:true,approvedComparisonCarouselIds:[compared.id],shortReelsEnabled:true,approvedShortReelIds:['creator-ready']};
 const queue=[brief,comparison,reel].map(c=>({id:c.id,status:'Draft',content:JSON.stringify(c)}));
 assert.deepEqual(contentReadiness(queue,policy,{now:at}),{ready:3,carousels:2,minimumReady:2,shortage:false});
 assert.equal(contentReadiness(queue,{...policy,approvedBriefCarouselIds:[],approvedComparisonCarouselIds:[],approvedShortReelIds:[]},{now:at}).ready,0);
 assert.equal(contentReadiness(queue.map(r=>({...r,status:'Published'})),policy,{now:at}).ready,0);
 assert.equal(contentReadiness(queue.map(r=>({...r,note:'Source unavailable, changed or closed'})),policy,{now:at}).ready,0);
 t.mock.method(Date,'now',()=>at+8*86400000);
 assert.equal(contentReadiness(queue,policy,{now:at+8*86400000}).ready,0);
});
