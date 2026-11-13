import React from'react';
import{AbsoluteFill,Audio,Easing,Img,OffthreadVideo,Sequence,interpolate,staticFile,useCurrentFrame,useVideoConfig}from'remotion';
// Creator cut (owner, Oct 29): cleared creator videos only (config/clip-permissions.json). Full-frame footage
// with a slow push and soft crossfades, a one-line hook, one short line per beat, the creators' credit on
// screen the whole time and the Cancha end card. Pre-cut 1080x1920 shots; no narration until a cut is approved.
const clamp={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const};
const ease=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{...clamp,easing:Easing.bezier(.16,1,.3,1)});
const display:React.CSSProperties={fontFamily:'AutoDisplay,sans-serif',fontStyle:'italic',fontWeight:700,letterSpacing:-1,lineHeight:.92,textTransform:'uppercase'};
// Owner, Nov 12: transitions felt abrupt; a 0.4 s crossfade reads as one calm piece.
export const FADE=12;
export function CreatorCut({brand,cut,audio}:any){
 const f=useCurrentFrame(),{fps,durationInFrames}=useVideoConfig(),outroFrom=durationInFrames-Math.round(cut.outroSeconds*fps),hookEnd=Math.round(cut.hookSeconds*fps);
 const beat=f>=hookEnd&&f<outroFrom?cut.beats.find((b:any)=>f>=b.start*fps&&f<b.end*fps):null;
 let from=0;
 return <AbsoluteFill style={{background:'#06140f',color:'#fff',fontFamily:'AutoUI,sans-serif',fontWeight:700,overflow:'hidden'}}>
  <style>{`@font-face{font-family:AutoDisplay;src:url('${staticFile('generated/automatic-news/display.woff2')}');font-weight:700;font-style:italic}@font-face{font-family:AutoUI;src:url('${staticFile('generated/automatic-news/ui.woff2')}');font-weight:700}`}</style>
  {cut.shots.map((s:any,k:number)=>{const start=from,len=Math.round(s.seconds*fps);from+=len;const local=f-start,p=interpolate(local,[0,len+FADE],[0,1],clamp);
   return <Sequence key={k} from={start} durationInFrames={len+FADE} layout="none"><AbsoluteFill style={{opacity:k===0?1:interpolate(local,[0,FADE],[0,1],clamp),transform:`scale(${1.02+.05*p})`}}>
    <OffthreadVideo src={staticFile(s.file)} muted style={{width:'100%',height:'100%',objectFit:'cover'}}/></AbsoluteFill></Sequence>;})}
  <AbsoluteFill style={{background:'linear-gradient(180deg,#0009 0%,#0000 18%,#0000 52%,#06140f99 74%,#06140fe0 100%)'}}/>
  <header style={{position:'absolute',left:62,right:140,top:110,height:68,display:'flex',alignItems:'center',justifyContent:'space-between'}}><Img src={staticFile('generated/automatic-news/cancha.png')} style={{width:200,height:64,objectFit:'cover',filter:'brightness(0) invert(1)'}}/><span data-copy style={{fontSize:30,letterSpacing:1.5,background:brand.accent,color:brand.forest,padding:'8px 14px 10px',borderRadius:6,lineHeight:1}}>{cut.chip}</span></header>
  {f<hookEnd&&<div data-copy style={{...display,position:'absolute',left:62,right:140,top:1180,fontSize:150,textShadow:'0 6px 28px #000c',opacity:1-ease(f,hookEnd-8,hookEnd),transform:`translateY(${(1-ease(f,0,12))*40}px)`}}>{cut.hook.split('\n').map((l:string,i:number,a:string[])=><div key={i} style={{color:i===a.length-1&&a.length>1?brand.accent:'#fff'}}>{l}</div>)}</div>}
  {beat&&<div key={beat.start} style={{position:'absolute',left:62,right:140,top:1240,opacity:ease(f,beat.start*fps,beat.start*fps+8)*(1-ease(f,beat.end*fps-6,beat.end*fps)),transform:`translateY(${(1-ease(f,beat.start*fps,beat.start*fps+12))*30}px)`}}>
   <div style={{height:6,width:90,background:brand.accent,marginBottom:24}}/>
   <div data-copy style={{...display,fontSize:96,textShadow:'0 4px 22px #000c'}}>{beat.text}</div></div>}
  {f>=outroFrom&&(()=>{const a=ease(f,outroFrom,outroFrom+10),ph=ease(f,outroFrom+4,outroFrom+22),tx=ease(f,outroFrom+2,outroFrom+14);
   // Owner, Nov 12: the plain-text end card looked like a document. The end card now shows the product: the logo,
   // one bold line and the real app on a phone rising into frame, on a forest-to-black brand gradient.
   return <AbsoluteFill style={{opacity:a,background:'radial-gradient(120% 70% at 50% 78%,#1c5a47 0%,#103f32 45%,#06140f 100%)'}}>
    {/* Owner, Nov 13: end on the app opening. A finger taps the Cancha icon, the app opens and the club crests scroll. */}
    <Sequence from={outroFrom} layout="none"><AbsoluteFill style={{opacity:ph,transform:`translateY(${(1-ph)*80}px)`}}>
     <OffthreadVideo src={staticFile('generated/creator-cut/endcard-app-open.mp4')} muted style={{width:'100%',height:'100%',objectFit:'cover'}}/></AbsoluteFill></Sequence>
    <div style={{position:'absolute',left:62,right:62,top:150,opacity:tx,transform:`translateY(${(1-tx)*24}px)`}}>
     <Img src={staticFile('generated/automatic-news/cancha.png')} style={{width:300,height:96,objectFit:'cover',filter:'brightness(0) invert(1)'}}/>
     <div data-copy style={{fontSize:30,color:brand.accent,letterSpacing:1.5,marginTop:34}}>{(cut.outro?.kicker)||'FLORIDA SOCCER · EVERY WEEK'}</div>
     <div data-copy style={{...display,fontSize:112,marginTop:12}}>{((cut.outro?.title)||'Find your\ngame.').split('\n').map((l:string,i:number,arr:string[])=><div key={i} style={{color:i===arr.length-1&&arr.length>1?brand.accent:'#fff'}}>{l}</div>)}</div></div>
    <div data-copy style={{position:'absolute',left:62,right:62,bottom:330,display:'flex',justifyContent:'center',opacity:ease(f,outroFrom+14,outroFrom+24)}}>
     <span style={{background:brand.accent,color:brand.forest,fontSize:36,padding:'16px 30px 18px',borderRadius:999}}>{(cut.outro?.line)||'Clubs, camps & tryouts near you · link in bio'}</span></div>
   </AbsoluteFill>;})()}
  <div data-copy style={{position:'absolute',left:64,bottom:205,fontSize:30,opacity:.85}}>{brand.handle}</div>
  {audio&&<Audio src={staticFile(audio)}/>}
 </AbsoluteFill>;
}
