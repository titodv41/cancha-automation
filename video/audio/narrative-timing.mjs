const token=s=>String(s).normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/[^a-z0-9']/g,'');
const tokens=s=>String(s).split(/\s+/).map(token).filter(Boolean);
// The picture edit follows actual provider word times, never a guessed 24s slot.
export function narrativeTimeline(story,timing,{audioSha256,audioSeconds,fps=30}={}){
 if(timing?.provider!=='elevenlabs'||timing.script!==story.script||timing.audioSha256!==audioSha256||!Number.isFinite(audioSeconds)||audioSeconds<10||audioSeconds>55||timing.offset!==story.narrationOffset)throw Error('Narration identity, script or duration changed');
 const words=timing.words;if(!Array.isArray(words)||!words.length||words.some((w,i)=>!w.text||!Number.isFinite(w.start)||!Number.isFinite(w.end)||w.start<timing.offset||w.end<w.start||i&&w.start<words[i-1].start)||words.at(-1).end>audioSeconds+timing.offset+.15)throw Error('Narration word timing is invalid or clipped');
 if(tokens(words.map(w=>w.text).join(' ')).join(' ')!==tokens(story.script).join(' '))throw Error('Narration alignment does not match the full spoken story');
 const anchors=story.sceneAnchors||[['opening',null],['season','Their new'],['ground','They’ll share'],['community','That gives'],['visit','You can go']];
 const normalized=words.map(w=>token(w.text)),starts=anchors.map(([id,phrase])=>{if(!phrase)return{id,start:0};const p=tokens(phrase),i=normalized.findIndex((_,i)=>p.every((s,j)=>normalized[i+j]===s));if(i<0)throw Error('Narrative scene anchor missing');return{id,start:Math.floor(words[i].start*fps)/fps}});
 const durationSeconds=Math.ceil((audioSeconds+timing.offset+.65)*fps)/fps;
 const scenes=starts.map((s,i)=>({...s,end:starts[i+1]?.start??durationSeconds}));if(scenes.some(s=>s.end-s.start<1))throw Error('Narrative scene is too short');
 return{durationSeconds,scenes,words};
}
