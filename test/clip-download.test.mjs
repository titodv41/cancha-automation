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
  // The hook is set large; past about three wrapped lines (~15 characters each) it runs into the credit line (Nov 11).
  assert.ok(cut.hook.split('\n').reduce((a,l)=>a+Math.ceil(l.length/15),0)<=3,name+': hook too long');
 }
});

test('pending-owner videos can be downloaded for drafts but never post', async () => {
  const {validShortReel} = await import('../server/short-reels.mjs');
  const {downloadList} = await import('../scripts/clip-download.mjs');
  const cfg = {videos: [{id: 'EY_CVh0pv8k', creator: 'X', credit: 'Video: X', license: 'pending-owner', permission: {recordedOn: '2026-11-06', how: 'owner will ask'}}]};
  assert.deepEqual(downloadList(cfg, 'EY_CVh0pv8k'), ['https://www.youtube.com/watch?v=EY_CVh0pv8k']);
  assert.equal(validShortReel({footage: [{source: 'youtube-cleared', id: 'EY_CVh0pv8k', license: 'pending-owner', page: 'https://youtu.be/x'}]}), false);
});
test('the posting gate names pending-owner footage explicitly', () => {
  assert.match(readFileSync(new URL('../server/short-reels.mjs', import.meta.url), 'utf8'), /f\.license==='pending-owner'\)\)return false/);
});
test('creator-cut drafts keep pending-owner on the footage so the posting gate sees it', () => {
  assert.match(readFileSync(new URL('../video/render-creator-cut.mjs', import.meta.url), 'utf8'), /v\.license==='pending-owner'\?'pending-owner'/);
});
