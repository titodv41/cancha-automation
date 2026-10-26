import test from 'node:test';import assert from 'node:assert/strict';import {shapeHit,parseQueries} from '../scripts/stock-footage-search.mjs';
test('keeps the largest public rendition and marks vertical clips',()=>{
 const row=shapeHit({id:7,tags:'soccer, kids',duration:12,pageURL:'https://pixabay.com/videos/id-7/',user:'ana',videos:{large:{url:'',width:0,height:0},medium:{url:'https://cdn.pixabay.com/video/m.mp4',width:720,height:1280,thumbnail:'https://cdn.pixabay.com/t.jpg'}}},'kids soccer');
 assert.equal(row.url,'https://cdn.pixabay.com/video/m.mp4');assert.equal(row.vertical,true);assert.equal(row.source,'pixabay');
 assert.equal(shapeHit({id:8,videos:{}},'x'),null);
});
test('parses comma or newline separated searches and caps them',()=>{
 assert.deepEqual(parseQueries(' kids soccer, parents watching\nsoccer coach '),['kids soccer','parents watching','soccer coach']);
 assert.equal(parseQueries(Array.from({length:20},(_,i)=>'q'+i).join(',')).length,15);
});
