import React from'react';
import{AbsoluteFill,Audio,Easing,Img,OffthreadVideo,Sequence,interpolate,staticFile,useCurrentFrame,useVideoConfig}from'remotion';
// "full-bleed" technique (owner, Oct 29: look professional and big): the club's own footage fills the frame and cuts
// every two seconds, a one-line hook owns the first beat, then a score bug, the club line and bold captions; a short
// branded end card closes. Same facts, sources and caption timing as the other techniques.
const clamp={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const};
const ease=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{...clamp,easing:Easing.bezier(.16,1,.3,1)});
const display:React.CSSProperties={fontFamily:'AutoDisplay,sans-serif',fontStyle:'italic',fontWeight:700,letterSpacing:-1,lineHeight:.92,textTransform:'uppercase'};
export const SHOT=2,HOOK=2.4,OUTRO=2.2;
export function shotPlan(media:any[],seconds:number){
 const clips=media.filter(m=>m.kind==='clip'),photos=media.filter(m=>m.kind==='photo'),pool=clips.length?clips:photos,count=Math.max(1,Math.ceil(seconds/SHOT));
 return Array.from({length:count},(_,k)=>{const m=pool[k%pool.length],round=Math.floor(k/pool.length);
  if(m?.kind!=='clip')return{media:m,start:0,zoomIn:k%2===0,focus:['50% 40%','35% 45%','65% 45%','50% 60%'][k%4]};
  const span=Math.max(SHOT,(m.durationSeconds||SHOT)-SHOT),start=((m.windowStart||0)+round*SHOT)%span;return{media:m,start,zoomIn:k%2===0,focus:'50% 45%'};});
}
export function FullBleedStory({brand,episode,groups,audio}:any){
 const f=useCurrentFrame(),{fps,durationInFrames}=useVideoConfig(),t=f/fps,shotFrames=SHOT*fps,hookEnd=Math.round(HOOK*fps),outroFrom=durationInFrames-Math.round(OUTRO*fps);
 const shots=shotPlan(episode.media,durationInFrames/fps),result=!!episode.story.score,resultAt=Math.floor((episode.resultAtSeconds||episode.durationSeconds*.48)*fps),final=!episode.story.deficit||f>=resultAt;
 const active=f>=hookEnd-6&&f<outroFrom?groups.find((g:any)=>t>=g.start&&t<g.end):null,hook=f<hookEnd,outro=f>=outroFrom;
 // Recaps open on the score line; other club news opens on the article's own title.
 const lines=String(result?episode.headline:episode.entry.title).split('\n'),longest=Math.max(...lines.map(l=>l.length)),hookSize=longest>22?92:longest>14?118:150;
 return <AbsoluteFill style={{background:'#06140f',color:'#fff',fontFamily:'AutoUI,sans-serif',fontWeight:700,overflow:'hidden'}}>
  <style>{`@font-face{font-family:AutoDisplay;src:url('${staticFile('generated/automatic-news/display.woff2')}');font-weight:700;font-style:italic}@font-face{font-family:AutoUI;src:url('${staticFile('generated/automatic-news/ui.woff2')}');font-weight:700}`}</style>
  {shots.map((s:any,k:number)=>{const from=k*shotFrames,local=f-from,punch=interpolate(local,[0,9],[1.12,1],{...clamp,easing:Easing.out(Easing.cubic)}),drift=interpolate(local,[0,shotFrames],s.zoomIn?[1,1.06]:[1.06,1],clamp);
   return <Sequence key={k} from={from} durationInFrames={shotFrames} layout="none"><AbsoluteFill style={{transform:`scale(${punch*drift})`}}>
    {s.media?.kind==='clip'?<OffthreadVideo src={staticFile(s.media.publicFile)} startFrom={Math.floor(s.start*fps)} muted style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:s.focus}}/>:s.media?<Img src={staticFile(s.media.publicFile)} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:s.focus}}/>:null}
   </AbsoluteFill></Sequence>;})}
  {/* Cut flash: three frames of light on every cut after the first. */}
  {f>=shotFrames&&f%shotFrames<3&&<AbsoluteFill style={{background:'#fff',opacity:.18*(1-(f%shotFrames)/3)}}/>}
  <AbsoluteFill style={{background:'linear-gradient(180deg,#000a 0%,#0000 16%,#0000 56%,#06140f80 76%,#06140fd9 100%)'}}/>
  {hook&&<AbsoluteFill style={{background:`rgba(6,20,15,${.38*(1-ease(f,hookEnd-8,hookEnd))})`}}/>}
  <header data-region="brand" style={{position:'absolute',left:62,right:140,top:110,height:68,display:'flex',alignItems:'center',justifyContent:'space-between'}}><Img src={staticFile('generated/automatic-news/cancha.png')} style={{width:200,height:64,objectFit:'cover',filter:'brightness(0) invert(1)'}}/><span data-copy style={{fontSize:30,letterSpacing:1.5,background:brand.accent,color:brand.forest,padding:'8px 14px 10px',borderRadius:6,lineHeight:1}}>{result?'MATCH RECAP':'CLUB NEWS'} · {String(episode.entry.city).toUpperCase()}</span></header>
  {hook&&<div data-region="headline" style={{position:'absolute',left:62,right:140,top:640,opacity:1-ease(f,hookEnd-8,hookEnd),transform:`translateY(${(1-ease(f,0,10))*40-ease(f,hookEnd-8,hookEnd)*30}px)`}}>
   {lines.map((l:string,i:number)=><div key={i} data-copy style={{...display,fontSize:hookSize,color:i===lines.length-1&&lines.length>1?brand.accent:'#fff',textShadow:'0 6px 28px #000c',transform:`translateY(${(1-ease(f,i*4,i*4+12))*36}px)`,opacity:ease(f,i*4,i*4+8)}}>{l}</div>)}
  </div>}
  {!hook&&!outro&&<>
   {result&&<div data-region="result" style={{position:'absolute',left:62,top:220,display:'flex',alignItems:'stretch',borderRadius:10,overflow:'hidden',boxShadow:'0 10px 30px #0008',opacity:ease(f,hookEnd,hookEnd+8)}}>
    <span data-copy style={{background:final?brand.accent:'#ffffffe6',color:brand.forest,fontSize:30,padding:'14px 16px',letterSpacing:1}}>{final?'FULL TIME':'EARLY'}</span>
    <span data-copy key={final?'f':'e'} style={{...display,background:brand.forest,color:'#fff',fontSize:64,padding:'4px 22px 0',transform:`translateY(${interpolate(f,[final?resultAt:hookEnd,(final?resultAt:hookEnd)+7],[12,0],clamp)}px)`}}>{final?episode.story.score:episode.story.deficit||episode.story.score}</span>
   </div>}
   <div data-region="headline" style={{position:'absolute',left:62,right:140,top:1130,opacity:ease(f,hookEnd,hookEnd+10)}}>
    <div data-copy style={{fontSize:30,color:brand.accent,letterSpacing:1.5}}>{episode.entry.publishedOn.slice(5).replace('-','/')} · {String(episode.entry.organization).toUpperCase()}</div>
    <div data-copy style={{...display,fontSize:result&&String(episode.entry.title).length>50?52:66,marginTop:10,textShadow:'0 4px 18px #000a'}}>{result?episode.entry.title:episode.entry.organization}</div>
   </div>
  </>}
  {active&&<div data-region="captions" style={{position:'absolute',left:62,right:140,top:1400,textAlign:'left'}}><span data-copy style={{display:'inline',fontSize:58,lineHeight:1.18,background:'#000000b8',boxDecorationBreak:'clone',WebkitBoxDecorationBreak:'clone',padding:'4px 14px',borderRadius:8}}>{active.words.map((w:any,i:number)=><span key={i} style={{color:!episode.captionOnly&&t>=w.start&&t<w.end?brand.accent:'#fff'}}>{i?' ':''}{w.text}</span>)}</span></div>}
  {outro&&<AbsoluteFill style={{background:`rgba(16,63,50,${.9*ease(f,outroFrom,outroFrom+8)})`}}>
   <div data-region="outro" style={{position:'absolute',left:62,right:140,top:720,opacity:ease(f,outroFrom+3,outroFrom+12),transform:`translateY(${(1-ease(f,outroFrom+3,outroFrom+12))*24}px)`}}>
    <div data-copy style={{fontSize:32,color:brand.accent,letterSpacing:1.5}}>FLORIDA SOCCER · EVERY WEEK</div>
    <div data-copy style={{...display,fontSize:120,marginTop:16}}>Find your<br/>game.</div>
    <div data-copy style={{fontSize:40,marginTop:34}}>Clubs, camps & tryouts near you · link in bio</div>
   </div>
  </AbsoluteFill>}
  <div data-copy style={{position:'absolute',left:64,bottom:232,fontSize:30,opacity:.85}}>{brand.handle}</div>
  <div style={{position:'absolute',left:64,right:140,bottom:205,height:4,background:'#ffffff33',borderRadius:4,overflow:'hidden'}}><div style={{height:'100%',background:brand.accent,width:`${f/(durationInFrames-1)*100}%`}}/></div>
  {audio&&<Audio src={staticFile(audio)}/>}
 </AbsoluteFill>;
}
