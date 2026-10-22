import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Audio,Easing,Img,OffthreadVideo,Sequence,continueRender,delayRender,interpolate,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
const clamp={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const};
const ease=Easing.bezier(.22,1,.36,1);
const ramp=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{...clamp,easing:ease});
function CopyBeat({from,to,label,title,body,display,lime,forest}:any){
 const f=useCurrentFrame(),enter=ramp(f,from,from+10),leave=ramp(f,to-9,to);
 return <div style={{position:'absolute',top:1220,left:68,right:68,opacity:enter*(1-leave),transform:`translateY(${(1-enter)*22-leave*12}px)`}}>
  <div style={{display:'inline-flex',background:lime,color:forest,padding:'10px 17px',borderRadius:7,fontSize:26,letterSpacing:1,marginBottom:28}}>{label}</div>
  <div style={{...display,fontSize:116,whiteSpace:'pre-line'}}>{title}</div>
  <div style={{fontSize:44,lineHeight:1.2,marginTop:25}}>{body}</div>
 </div>;
}
export function MotionStory({brand,story,clip,audio}:any){
 const f=useCurrentFrame(),{durationInFrames}=useVideoConfig(),[h]=useState(()=>delayRender('Load brand fonts'));
 useEffect(()=>{Promise.all([document.fonts.load('italic 700 130px CanchaDisplay'),document.fonts.load('600 44px CanchaUI')]).then(()=>continueRender(h))},[h]);
 const forest=brand.forest,cream=brand.cream,lime=brand.accent,orange=brand.orange;
 const display={fontFamily:'CanchaDisplay,sans-serif',fontStyle:'italic',fontWeight:700,lineHeight:.94,letterSpacing:-1} as React.CSSProperties;
 const reveal=ramp(f,27,40),introOut=ramp(f,25,39),outro=ramp(f,558,576),score=ramp(f,164,176);
 return <AbsoluteFill style={{background:forest,color:cream,fontFamily:'CanchaUI,sans-serif',fontWeight:600,overflow:'hidden'}}>
  <style>{`@font-face{font-family:CanchaDisplay;src:url('${staticFile('generated/display.woff2')}');font-weight:700;font-style:italic}@font-face{font-family:CanchaUI;src:url('${staticFile('generated/ui.woff2')}');font-weight:600}`}</style>
  <Audio src={staticFile(audio)}/>
  <AbsoluteFill style={{opacity:.11,transform:`translateY(${-f*.035}px)`}}><svg width="1080" height="2000" viewBox="0 0 1080 2000" fill="none" stroke={lime} strokeWidth="2"><path d="M-90 120L1180 990M-90 460L1180 1330M-90 800L1180 1670"/><circle cx="1030" cy="1630" r="610"/><circle cx="1030" cy="1630" r="430"/></svg></AbsoluteFill>
  <div style={{position:'absolute',left:68,right:68,top:270,display:'flex',alignItems:'center',justifyContent:'space-between',gap:25,opacity:reveal}}><div><div style={{fontSize:27,color:lime,letterSpacing:1,marginBottom:14}}>{story.city.toUpperCase()} · {story.state.toUpperCase()}</div><div style={{...display,fontSize:64}}>{story.teamLabel}</div></div><div style={{opacity:score,background:lime,color:forest,borderRadius:14,padding:'13px 26px',...display,fontSize:94,transform:`translateY(${(1-score)*15}px)`}}>{story.score}</div></div>
  <Sequence from={27} durationInFrames={540}><div style={{position:'absolute',top:435,left:0,width:1080,height:720,overflow:'hidden',clipPath:`inset(${(1-reveal)*50}% 0 round 0px)`,transform:`scale(${1.018-.018*reveal})`,borderTop:'3px solid '+lime,borderBottom:'3px solid '+lime}}><OffthreadVideo src={staticFile(clip)} muted style={{width:'100%',height:'100%',objectFit:'contain'}}/></div></Sequence>
  <AbsoluteFill style={{opacity:1-introOut,padding:'435px 68px 0',background:forest,transform:`translateY(${-introOut*25}px)`}}><div style={{fontSize:27,color:lime,letterSpacing:2,marginBottom:38}}>{story.kicker}</div><div style={{...display,fontSize:150,whiteSpace:'pre-line'}}>{story.title}</div><div style={{marginTop:65,height:8,width:interpolate(f,[0,24],[80,810],clamp),background:orange,borderRadius:8}}/></AbsoluteFill>
  <CopyBeat from={35} to={176} label={story.organization.toUpperCase()} title={story.actionTitle} body={story.teamLabel} display={display} lime={lime} forest={forest}/>
  <CopyBeat from={168} to={320} label={story.scoreContext.toUpperCase()} title={story.resultTitle} body={story.resultLine} display={display} lime={lime} forest={forest}/>
  <CopyBeat from={312} to={469} label="YOUR LOCAL WATCHLIST" title={story.question} body={story.communityCTA} display={display} lime={lime} forest={forest}/>
  <CopyBeat from={461} to={575} label="YOUR CLUB COULD BE NEXT" title={'DROP YOUR\nCLUB + CITY.'} body="Who should we watch next?" display={display} lime={lime} forest={forest}/>
  <AbsoluteFill style={{opacity:outro,background:forest,padding:'470px 68px 0',transform:`translateY(${(1-outro)*22}px)`}}><div style={{fontSize:26,color:lime,letterSpacing:2,marginBottom:40}}>{story.outroEyebrow}</div><div style={{...display,fontSize:150,whiteSpace:'pre-line'}}>{story.outroTitle}</div><div style={{background:cream,color:forest,borderRadius:20,padding:'30px 32px',marginTop:62,fontSize:40,display:'flex',justifyContent:'space-between',alignItems:'center'}}><span>{story.city}, {story.state}</span><span style={{fontSize:48}}>→</span></div><div style={{fontSize:44,marginTop:42,color:lime}}>Explore on {brand.name} · Link in bio</div></AbsoluteFill>
  <header style={{position:'absolute',left:68,right:68,top:120,display:'flex',alignItems:'center',justifyContent:'space-between',zIndex:5}}><div style={{width:210,height:72,overflow:'hidden'}}><Img src={staticFile('generated/cancha.png')} style={{width:'100%',height:'100%',objectFit:'cover',filter:'brightness(0) invert(1)'}}/></div><span style={{fontSize:28}}>{brand.handle}</span></header>
  <div style={{position:'absolute',left:68,right:68,bottom:175,height:4,background:'#547260',borderRadius:10}}><div style={{height:'100%',width:`${f/(durationInFrames-1)*100}%`,background:lime}}/></div>
 </AbsoluteFill>
}
