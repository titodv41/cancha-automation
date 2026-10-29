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
