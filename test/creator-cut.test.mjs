import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';
import{narrationAllowed,buildCreatorDraft}from'../scripts/creator-cut.mjs';import{shortReelAllowed}from'../server/short-reels.mjs';
const cut=JSON.parse(readFileSync(new URL('../content/instagram/creator-cuts/this-is-florida-soccer.json',import.meta.url))),policy=JSON.parse(readFileSync(new URL('../config/instagram-editorial-policy.json',import.meta.url)));
const h='a'.repeat(64),v='b'.repeat(64),result={seconds:22.3,renderedAt:new Date().toISOString(),footage:[{source:'youtube-cleared',id:'ttVtRHrCWT4',creator:'Lozzz Productionz',license:'CC BY 3.0 (YouTube Creative Commons)',page:'https://www.youtube.com/watch?v=ttVtRHrCWT4'}]};
const draft=(r=result)=>buildCreatorDraft(cut,r,{date:'2026-10-29',posterUrl:'https://framerusercontent.com/images/abc.jpg',posterChecksum:h,videoUrl:'https://framerusercontent.com/assets/abc.mp4',videoChecksum:v});
test('narration needs an approved cut and the capped Starter plan',()=>{
 const starter={plan:'starter',monthlyCharacterBudget:25000,paidUsageEnabled:false};
 assert.equal(narrationAllowed(cut,starter),true);assert.equal(narrationAllowed({...cut,narrationApprovedOn:undefined},starter),false);
 assert.throws(()=>narrationAllowed(cut,{...starter,monthlyCharacterBudget:30000}),/capped/);assert.throws(()=>narrationAllowed(cut,{...starter,paidUsageEnabled:true}),/capped/);
 assert.ok(cut.script.length<=1300);
});
test('an approved creator cut is a valid short Reel up to 40 s; cleared footage is limited to creator cuts',()=>{
 assert.equal(shortReelAllowed(draft(),policy),true);
 assert.equal(shortReelAllowed(draft({...result,seconds:41}),policy),false);
 assert.equal(shortReelAllowed({...draft(),recipeId:'other'},policy),false);
 assert.equal(shortReelAllowed({...draft(),recipeKind:'club'},{...policy}),false);
});
test('the caption credits every creator and never claims more than the license',()=>{
 for(const name of['Lozzz Productionz','Florida Life','Progressive Soccer'])assert.match(cut.caption,new RegExp(name));
 assert.doesNotMatch(cut.caption,/used with permission|official|partner/i);
});
