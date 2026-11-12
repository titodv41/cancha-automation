// Owner, Nov 12: "the voice and the content were not aligned, the voice was coming first". Stretching every shot by
// one factor drifts as soon as Chris speeds up or slows down. Instead each on-screen line names a cue (the words in
// the script where it belongs); it starts exactly when Chris says them, and the shots between two cues stretch with
// them (a piecewise-linear map from the planned timeline to the spoken one).
const norm=s=>String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g,'');
export function cueTimes(words,cues){
 const w=words.map(x=>norm(x.text)),out=[];let from=0;
 for(const cue of cues){const t=String(cue).split(/\s+/).map(norm).filter(Boolean);if(!t.length)throw Error('Empty cue');let hit=-1;
  for(let i=from;i<=w.length-t.length&&hit<0;i++)if(t.every((x,j)=>w[i+j]===x))hit=i;
  if(hit<0)throw Error('Cue not found in narration (in order): '+cue);out.push(words[hit].start);from=hit+1;}
 return out;
}
// Anchors are [planned, spoken] pairs, strictly increasing on both sides.
export function warp(anchors){
 for(let i=1;i<anchors.length;i++)if(!(anchors[i][0]>anchors[i-1][0]&&anchors[i][1]>anchors[i-1][1]))throw Error('Cues must move forward in time');
 return t=>{if(t<=anchors[0][0])return anchors[0][1];for(let i=1;i<anchors.length;i++){const[a,b]=anchors[i-1],[c,d]=anchors[i];if(t<=c)return b+(t-a)*(d-b)/(c-a);}const[a,b]=anchors.at(-2),[c,d]=anchors.at(-1);return d+(t-c)*(d-b)/(c-a);};
}
// Returns the cut with shot lengths, hook and beats moved onto the narration. Without cues it keeps the old even stretch.
export function alignToVoice(spec,words,{tail=.7,fps=30}={}){
 const planned=spec.shots.reduce((a,s)=>a+s.seconds,0),voiceEnd=words.at(-1).end,r=x=>Math.round(x*fps)/fps;
 let map;
 if(spec.beats.length&&spec.beats.every(b=>b.cue)){const spoken=cueTimes(words,spec.beats.map(b=>b.cue));
  map=warp([[0,0],...spec.beats.map((b,i)=>[b.start,spoken[i]]),[planned,Math.max(voiceEnd+tail,spoken.at(-1)+1)]]);}
 else{const k=Math.max(1,(voiceEnd+tail)/planned);map=t=>t*k;}
 let at=0;const shots=spec.shots.map(s=>{const start=map(at),end=map(at+s.seconds);at+=s.seconds;return{...s,seconds:r(end-start)};});
 const beats=spec.beats.map((b,i,a)=>{const start=map(b.start),end=b.cue&&a[i+1]?.cue?map(a[i+1].start):map(b.end);return{...b,start:r(start),end:r(Math.max(end,start+.5))};});
 return{shots,beats,hookSeconds:r(map(spec.hookSeconds))};
}
