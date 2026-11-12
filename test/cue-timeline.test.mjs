import test from'node:test';import assert from'node:assert/strict';import{readFileSync,readdirSync}from'node:fs';
import{cueTimes,warp,alignToVoice}from'../video/cue-timeline.mjs';
const words='Messi bent this free kick. Here is how. He hits it off center. Save this.'.split(' ').map((text,i)=>({text,start:i*.5,end:i*.5+.4}));
test('a cue starts its line exactly when the narrator says its words, in order',()=>{
 assert.deepEqual(cueTimes(words,['Here is how','off center','Save this']),[2.5,5.5,6.5]);
 assert.throws(()=>cueTimes(words,['Save this','Here is how']),/not found/);
 assert.throws(()=>cueTimes(words,['penalty']),/not found/);
});
test('shots between two cues stretch with them; lines follow the voice, not one global factor',()=>{
 const spec={hookSeconds:1,shots:[{seconds:1},{seconds:1},{seconds:1},{seconds:1}],beats:[{start:1,end:2,cue:'Here is how'},{start:2,end:4,cue:'Save this'}]};
 const out=alignToVoice(spec,words);
 assert.equal(out.beats[0].start,2.5);assert.equal(out.beats[1].start,6.5);assert.equal(out.beats[0].end,6.5);
 assert.equal(out.hookSeconds,2.5);assert.equal(+out.shots.reduce((a,s)=>a+s.seconds,0).toFixed(2),+(words.at(-1).end+.7).toFixed(2));
 assert.throws(()=>warp([[0,0],[2,1],[1,2]]),/forward/);
});
test('every narrated creator cut ties each line to words in its own script',()=>{
 for(const name of readdirSync(new URL('../content/instagram/creator-cuts/',import.meta.url))){
  const c=JSON.parse(readFileSync(new URL('../content/instagram/creator-cuts/'+name,import.meta.url)));
  if(!c.narrationApprovedOn||c.narrationApprovedOn<'2026-11-11')continue;
  const w=c.script.split(/\s+/).map((text,i)=>({text,start:i,end:i+.5}));
  assert.ok(c.beats.every(b=>b.cue),name+': every line needs a cue');
  // The picture changes when the line changes: every line starts on a cut.
  const cuts=c.shots.reduce((a,s)=>[...a,+(a.at(-1)+s.seconds).toFixed(2)],[0]);for(const b of c.beats)assert.ok(cuts.some(x=>Math.abs(x-b.start)<.06),name+': line not on a cut: '+b.text);assert.doesNotThrow(()=>cueTimes(w,c.beats.map(b=>b.cue)),name);
 }
});
