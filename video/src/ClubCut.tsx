import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';

const clamp={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const};
const reveal=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{...clamp,easing:Easing.bezier(.16,1,.3,1)});
const display:React.CSSProperties={fontFamily:'CanchaDisplay,sans-serif',fontWeight:700,fontStyle:'italic',lineHeight:.9,letterSpacing:-2};

function Footage({clip,poster,position,opacity=1,blur=0}:any){
 const style:React.CSSProperties={width:'100%',height:'100%',objectFit:'cover',objectPosition:position,filter:blur?`blur(${blur}px) brightness(.4)`:undefined};
 return <AbsoluteFill style={{opacity,overflow:'hidden'}}><Sequence durationInFrames={480}><OffthreadVideo src={staticFile(clip)} muted style={style}/></Sequence><Sequence from={480}><Img src={staticFile(poster)} style={style}/></Sequence></AbsoluteFill>;
}
function Captions({groups,frame}:any){
 const seconds=frame/30,group=groups.find((g:any)=>seconds>=g.start&&seconds<g.end+.08);
 if(!group)return null;
 return <div data-copy style={{position:'absolute',left:80,right:150,top:1490,textAlign:'center',fontSize:62,lineHeight:1.14,fontWeight:600,filter:'drop-shadow(0 3px 9px #000a)'}}>{group.words.map((word:any,i:number)=><span key={i} style={{display:'inline-block',padding:'5px 10px',margin:'3px 0',borderRadius:9,background:seconds>=word.start&&seconds<word.end?'#d7ef86':'#071d17ed',color:seconds>=word.start&&seconds<word.end?'#071d17':'#fff'}}>{word.text}</span>)}</div>;
}
export function ClubCut({brand,story,clip,poster,crest,audio,groups=[]}:any){
 const f=useCurrentFrame(),[handle]=useState(()=>delayRender('Brand fonts'));
 useEffect(()=>{Promise.all([document.fonts.load('italic 700 180px CanchaDisplay'),document.fonts.load('600 60px CanchaUI')]).then(()=>continueRender(handle));},[handle]);
 const blue=story.theme.clubBlue,ink=story.theme.ink,intro=1-reveal(f,88,100),score=reveal(f,93,104)*(1-reveal(f,164,176)),outro=reveal(f,455,468),pan=interpolate(f,[0,120,240,360,480],[58,52,47,62,60],clamp);
 return <AbsoluteFill style={{background:ink,color:brand.cream,fontFamily:'CanchaUI,sans-serif',fontWeight:600,overflow:'hidden'}}>
  <style>{`@font-face{font-family:CanchaDisplay;src:url('${staticFile('generated/display.woff2')}');font-weight:700;font-style:italic}@font-face{font-family:CanchaUI;src:url('${staticFile('generated/ui.woff2')}');font-weight:600}*{box-sizing:border-box}`}</style>
  <Audio src={staticFile(audio)}/><Footage clip={clip} poster={poster} position={`${pan}% 50%`} blur={22}/>
  <div style={{position:'absolute',inset:'230px 0 370px',overflow:'hidden',transform:`scale(${1+intro*.055})`}}><Footage clip={clip} poster={poster} position={`${pan}% center`}/></div>
  <AbsoluteFill style={{background:`linear-gradient(180deg,${ink} 2%,${ink}00 28%,transparent 54%,${ink} 84%)`}}/>
  <div style={{position:'absolute',left:70,right:155,top:260,opacity:1-outro,display:'flex',alignItems:'center',justifyContent:'space-between'}}><div style={{fontSize:29,letterSpacing:2}}>WESTON, FL<span style={{display:'block',marginTop:13,fontSize:24,color:blue}}>U15 · MLS NEXT</span></div><Img src={staticFile(crest)} style={{width:135,height:160,objectFit:'contain',filter:'drop-shadow(0 6px 16px #0007)'}}/></div>
  <div style={{position:'absolute',left:64,right:140,top:1110,opacity:intro,transform:`translateY(${(1-reveal(f,0,17))*32-(1-intro)*28}px)`}}><div data-copy style={{...display,fontSize:193}}>WESTON.<br/><span style={{color:blue}}>TWO–NIL.</span></div><div data-copy style={{fontSize:32,marginTop:27,letterSpacing:1}}>THE LOCAL GAME, UP CLOSE.</div></div>
  <AbsoluteFill style={{background:blue,color:ink,opacity:score,transform:`translateX(${(1-reveal(f,93,104))*1080}px)`}}>
   <svg width="1080" height="1920" style={{position:'absolute',opacity:.12}}><path d="M-200 1540L1000 340M100 1740L1300 540" stroke={ink} strokeWidth="90"/></svg>
   <div style={{position:'absolute',left:72,top:340,fontSize:32,letterSpacing:2}}>WESTON FC · U15</div>
   <div style={{position:'absolute',left:66,right:138,top:460,display:'flex',gap:35,alignItems:'center'}}><Img src={staticFile(crest)} style={{width:280,height:330,objectFit:'contain',transform:`translateY(${(1-reveal(f,103,117))*25}px)`}}/><div data-copy style={{...display,fontSize:290,letterSpacing:-7,transform:`translateY(${(1-reveal(f,105,119))*40}px)`}}>2–0</div></div>
   <div data-copy style={{position:'absolute',left:74,top:825,...display,fontSize:106}}>MLS NEXT.</div><div style={{position:'absolute',top:1030,left:0,right:0,height:570,overflow:'hidden'}}><Footage clip={clip} poster={poster} position="50% 50%"/></div>
  </AbsoluteFill>
  <AbsoluteFill style={{opacity:outro,background:ink,transform:`translateY(${(1-outro)*28}px)`}}>
   <div style={{position:'absolute',left:0,right:0,top:250,height:900,opacity:.27}}><Footage clip={clip} poster={poster} position="60% center"/></div><AbsoluteFill style={{background:`linear-gradient(0deg,${ink} 31%,transparent 100%)`}}/>
   <Img src={staticFile(crest)} style={{position:'absolute',left:72,top:360,width:260,height:310,objectFit:'contain',transform:`rotate(${(1-reveal(f,464,485))*-7}deg)`}}/><div style={{position:'absolute',left:375,top:470,color:blue,fontSize:30,letterSpacing:2,lineHeight:1.5}}>YOUR CLUB.<br/>YOUR CITY.<br/>YOUR STORY.</div>
   <div data-copy style={{position:'absolute',left:64,top:860,...display,fontSize:230}}>WHO’S<br/><span style={{color:blue}}>NEXT?</span></div><div data-copy style={{position:'absolute',left:74,top:1330,fontSize:44}}>Drop a club + city.</div>
   <svg width="150" height="100" viewBox="0 0 150 100" style={{position:'absolute',left:720,top:1320,transform:`translateX(${Math.sin(f/12)*5}px)`}}><path d="M5 50H125M83 10L130 50L83 90" fill="none" stroke={brand.accent} strokeWidth="10"/></svg>
  </AbsoluteFill>
  {groups.length>0&&<Captions groups={groups} frame={f}/>}
  <header style={{position:'absolute',left:72,right:150,top:130,display:'flex',alignItems:'center',justifyContent:'space-between',color:score>.5?ink:brand.cream}}><div style={{width:235,height:68,overflow:'hidden'}}><Img src={staticFile('generated/cancha.png')} style={{width:'100%',height:'100%',objectFit:'cover',filter:score>.5?'brightness(0)':'brightness(0) invert(1)'}}/></div><span style={{fontSize:25,letterSpacing:2}}>MATCHDAY / 01</span></header>
  <div style={{position:'absolute',left:74,right:150,bottom:210,fontSize:25,display:'flex',justifyContent:'space-between',color:score>.5?ink:brand.cream}}><span>{brand.handle}</span><span>FLORIDA SOCCER</span></div><div style={{position:'absolute',left:74,right:150,bottom:190,height:3,background:'#ffffff30'}}><div style={{height:'100%',width:`${f/599*100}%`,background:blue}}/></div>
  {[93,164,455].map(at=>{const t=reveal(f,at-3,at+8),gone=reveal(f,at+8,at+16);return <div key={at} style={{position:'absolute',inset:0,background:blue,clipPath:'polygon(20% 0,100% 0,80% 100%,0 100%)',transform:`translateX(${(-1+t*2+gone)*1400}px)`,opacity:f>=at-3&&f<at+16?1:0}}/>;})}
 </AbsoluteFill>;
}
