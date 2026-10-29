import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';
import{clearedVideos,downloadList}from'../scripts/clip-download.mjs';
const ok={id:'3DAWLIHC5Uo',license:'cc-by',creator:'Chan',credit:'Video: Chan',permission:{recordedOn:'2026-10-29',how:'CC BY'}};
test('only recorded, dated, credited videos are cleared',()=>{
 const bad=[{...ok,id:'x'},{...ok,id:'AAAAAAAAAAA',license:'fair-use'},{...ok,id:'BBBBBBBBBBB',credit:''},{...ok,id:'CCCCCCCCCCC',permission:{how:'ok'}}];
 assert.deepEqual(clearedVideos({videos:[ok,...bad]}).map(v=>v.id),['3DAWLIHC5Uo']);
});
test('a requested id outside the list is refused, blank means all cleared',()=>{
 assert.deepEqual(downloadList({videos:[ok]}),['https://www.youtube.com/watch?v=3DAWLIHC5Uo']);
 assert.throws(()=>downloadList({videos:[ok]},'3DAWLIHC5Uo,dQw4w9WgXcQ'),/dQw4w9WgXcQ/);
});
test('every entry in the checked-in permission list is valid',()=>{
 const c=JSON.parse(readFileSync(new URL('../config/clip-permissions.json',import.meta.url)));
 assert.equal(clearedVideos(c).length,c.videos.length);
});
test('every creator cut uses only cleared videos and its lines fit the timeline',async()=>{
 const{readdirSync}=await import('node:fs'),c=JSON.parse(readFileSync(new URL('../config/clip-permissions.json',import.meta.url))),ids=new Set(clearedVideos(c).map(v=>v.id));
 for(const name of readdirSync(new URL('../content/instagram/creator-cuts/',import.meta.url))){
  const cut=JSON.parse(readFileSync(new URL('../content/instagram/creator-cuts/'+name,import.meta.url))),total=cut.shots.reduce((a,s)=>a+s.seconds,0);
  for(const s of cut.shots)assert.ok(ids.has(s.id),name+' uses '+s.id);
  for(const b of cut.beats)assert.ok(b.start>=cut.hookSeconds&&b.end<=total+.01&&b.text.length<=60,name+': '+b.text);
 }
});
