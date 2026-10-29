import test from'node:test';import assert from'node:assert/strict';
import{shapeScoutVideo,rankScout,scoutMarkdown}from'../scripts/clip-scout.mjs';
const v=(id,license,views,dur='PT1M5S')=>({id,status:{license},contentDetails:{duration:dur},statistics:{viewCount:String(views)},snippet:{title:'Pickup | game '+id,channelTitle:'Chan',channelId:'UC'+id}});
test('scout labels Creative Commons as usable and everything else as needing the creator\'s OK',()=>{
 assert.equal(shapeScoutVideo(v('a','creativeCommon',5),'q').status,'usable with credit');
 assert.equal(shapeScoutVideo(v('b','youtube',5),'q').status,'needs creator OK');
 assert.equal(shapeScoutVideo(v('c','youtube',5,'P0D'),'q'),null);
});
test('ranking puts usable clips first, drops duplicates and long videos, and the table escapes pipes',()=>{
 const rows=rankScout([shapeScoutVideo(v('a','youtube',900),'q'),shapeScoutVideo(v('b','creativeCommon',3),'q'),shapeScoutVideo(v('a','youtube',900),'q'),shapeScoutVideo(v('d','youtube',1,'PT45M'),'q')]);
 assert.deepEqual(rows.map(r=>r.id),['b','a']);assert.match(scoutMarkdown(rows),/Pickup \/ game b/);
});
