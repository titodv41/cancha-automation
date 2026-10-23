import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Audio,Easing,Img,OffthreadVideo,continueRender,delayRender,interpolate,staticFile,useCurrentFrame} from 'remotion';
const clamp={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const};
export function CommunityCut({brand,story,clip,audio}:any){
 const f=useCurrentFrame(),[handle]=useState(()=>delayRender('Brand fonts'));
 useEffect(()=>{Promise.all([document.fonts.load('italic 700 144px CanchaDisplay'),document.fonts.load('600 42px CanchaUI')]).then(()=>continueRender(handle))},[handle]);
 return <AbsoluteFill style={{background:brand.forest,color:brand.cream,fontFamily:'CanchaUI,sans-serif',fontWeight:600}}>
  <style>{`@font-face{font-family:CanchaDisplay;src:url('${staticFile('generated/display.woff2')}');font-weight:700;font-style:italic}@font-face{font-family:CanchaUI;src:url('${staticFile('generated/ui.woff2')}');font-weight:600}`}</style>
  <OffthreadVideo src={staticFile(clip)} muted style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:'50% 50%'}}/>
  <Audio src={staticFile(audio)}/>
  <AbsoluteFill style={{background:'linear-gradient(180deg,#071d1766,transparent 25%,transparent 55%,#071d17ed 100%)'}}/>
  <header style={{position:'absolute',left:72,right:150,top:130,display:'flex',alignItems:'center',justifyContent:'space-between',textShadow:'0 2px 10px #0009'}}><div style={{width:235,height:68,overflow:'hidden'}}><Img src={staticFile('generated/cancha.png')} style={{width:'100%',height:'100%',objectFit:'cover',filter:'brightness(0) invert(1)'}}/></div><span style={{fontSize:25,letterSpacing:2}}>THE LOCAL STANDS</span></header>
  {story.cues.map((cue:any,i:number)=>{
   const a=cue.start*30,b=cue.end*30,opacity=interpolate(f,[a,a+7,b-7,b],[0,1,1,0],clamp),y=interpolate(f,[a,a+10],[22,0],{...clamp,easing:Easing.bezier(.16,1,.3,1)});
   return <div key={i} style={{position:'absolute',left:64,right:145,top:1220,opacity,transform:`translateY(${y}px)`}}><div style={{height:5,width:90,background:story.theme.accent,marginBottom:28}}/><div data-copy style={{fontFamily:'CanchaDisplay,sans-serif',fontSize:i===0?140:155,fontStyle:'italic',fontWeight:700,lineHeight:.92,letterSpacing:-1,whiteSpace:'pre-line',textShadow:'0 2px 12px #071d1788'}}>{cue.title}</div><div data-copy style={{fontSize:37,lineHeight:1.25,marginTop:28,color:story.theme.accent}}>{cue.body}</div></div>
  })}
  <div style={{position:'absolute',left:74,bottom:205,fontSize:27,textShadow:'0 2px 8px #0009'}}>{brand.handle}</div>
 </AbsoluteFill>;
}
