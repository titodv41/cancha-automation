import React,{useEffect,useState} from 'react';
import{AbsoluteFill,Audio,Easing,Img,Loop,OffthreadVideo,Sequence,continueRender,delayRender,interpolate,staticFile,useCurrentFrame,useVideoConfig}from'remotion';
const path=(s:string)=>staticFile('generated/narrative-story/'+s);
const clamp={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const};
const ease=Easing.bezier(.16,1,.3,1);
const display:React.CSSProperties={fontFamily:'NarrativeDisplay,sans-serif',fontStyle:'italic',fontWeight:700,lineHeight:.91,letterSpacing:-.7,whiteSpace:'pre-line'};
function Beat({id,seconds,brand,visuals:v}:any){
 const f=useCurrentFrame(),{fps}=useVideoConfig(),enter=interpolate(f,[0,.22*fps],[0,1],{...clamp,easing:ease}),leave=interpolate(f,[Math.max(0,(seconds-.14)*fps),seconds*fps],[1,0],clamp);
 const title=(text:string,y=1080,size=148)=><div data-copy style={{position:'absolute',left:64,right:140,top:y,...display,fontSize:size,transform:`translateY(${(1-enter)*22}px)`}}>{text}</div>;
 const chip=(text:string,y=985,color=brand.accent)=><div data-copy style={{position:'absolute',left:64,top:y,maxWidth:840,background:color,color:brand.forest,padding:'13px 23px 17px',borderRadius:10,fontSize:46,lineHeight:1.05,fontWeight:600}}>{text}</div>;
 return <AbsoluteFill style={{opacity:enter*leave}}>
  {id==='opening'&&<><div style={{position:'absolute',left:64,top:300,width:236,height:236,padding:18,background:'#103f32dd',border:'2px solid #f5f3e93d',borderRadius:28,transform:`scale(${.93+enter*.07})`}}><Img src={path('crest.png')} style={{width:'100%',height:'100%',objectFit:'contain'}}/></div>{chip(v.opening.chip,965)}{title(v.opening.title,1090,138)}</>}
  {id==='season'&&<><div style={{position:'absolute',left:54,right:130,top:510,padding:'35px 32px 38px',background:'#103f32e8',border:'2px solid #f5f3e935',borderRadius:26}}><div data-copy style={{fontSize:49,lineHeight:1,fontWeight:600,color:brand.accent}}>{v.season.label}</div><div data-copy style={{...display,fontSize:112,marginTop:36}}>{v.season.term}</div><div style={{display:'flex',gap:10,marginTop:22}}>{v.season.year.split('').map((d,i)=><div key={i} style={{height:264,width:174,borderRadius:12,background:brand.accent,color:brand.forest,overflow:'hidden'}}><div data-copy style={{...display,fontSize:262,textAlign:'center',transform:`translateY(${interpolate(f,[i*2,14+i*2],[280,0],{...clamp,easing:ease})}px)`}}>{d}</div></div>)}</div></div>{title(v.season.title,1130,133)}</>}
  {id==='ground'&&<><div style={{position:'absolute',left:64,right:140,top:365,height:510,overflow:'hidden',borderRadius:20,border:'3px solid #f5f3e9bb'}}><Img src={path('stadium.png')} style={{width:'100%',height:'100%',objectFit:'cover',transform:`scale(${interpolate(f,[0,seconds*fps],[1.035,1],clamp)})`}}/></div>{chip(v.ground.chip,920)}{title(v.ground.title,1070)}<div data-copy style={{position:'absolute',left:66,right:140,top:1370,fontSize:46,lineHeight:1.08}}>{v.ground.subtitle}</div></>}
  {id==='community'&&<>{chip(v.community.chip,970)}{title(v.community.title,1100,146)}</>}
  {id==='visit'&&<>{chip(v.visit.chip,965,brand.orange)}{title(v.visit.title,1110,143)}</>}
 </AbsoluteFill>;
}
export function NarrativeStory({brand,edit,audio,groups,visuals:v}:any){
 const frame=useCurrentFrame(),{fps}=useVideoConfig(),time=frame/fps,[handle]=useState(()=>delayRender('Narrative brand fonts'));
 useEffect(()=>{Promise.all([document.fonts.load('italic 700 146px NarrativeDisplay'),document.fonts.load('600 48px NarrativeUI')]).then(()=>continueRender(handle));},[handle]);
 const active=groups?.find((g:any)=>time>=g.start&&time<g.end);
 return <AbsoluteFill style={{background:brand.forest,color:brand.cream,fontFamily:'NarrativeUI,sans-serif',fontWeight:600,letterSpacing:0}}>
  <style>{`@font-face{font-family:NarrativeDisplay;src:url('${path('display.woff2')}');font-weight:700;font-style:italic}@font-face{font-family:NarrativeUI;src:url('${path('ui.woff2')}');font-weight:600}`}</style>
  <AbsoluteFill><Loop durationInFrames={610}><OffthreadVideo src={path('club.mp4')} muted playbackRate={.85} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'50% 50%'}}/></Loop></AbsoluteFill>
  <AbsoluteFill style={{background:'linear-gradient(180deg,#082f27b8 0%,#082f2725 30%,#082f2725 42%,#082f27bd 68%,#082f27f5 100%)'}}/>
  {edit.scenes.map((s:any)=><Sequence key={s.id} from={Math.floor(s.start*fps)} durationInFrames={Math.min(Math.ceil((s.end-s.start+.22)*fps),Math.round(edit.durationSeconds*fps)-Math.floor(s.start*fps))}><Beat id={s.id} seconds={s.end-s.start} brand={brand} visuals={v}/></Sequence>)}
  <header style={{position:'absolute',left:64,right:140,top:120,display:'flex',justifyContent:'space-between',alignItems:'center'}}><div style={{height:68,width:210,overflow:'hidden'}}><Img src={path('cancha.png')} style={{height:'100%',width:'100%',objectFit:'cover',filter:'brightness(0) invert(1)'}}/></div><span data-copy style={{...display,fontSize:43,lineHeight:1}}>{v.headerTag}</span></header>
  <div data-copy style={{position:'absolute',left:66,top:225,fontSize:44,lineHeight:1.05,color:brand.cream,background:'#103f32dd',padding:'12px 18px 15px',borderRadius:9}}>{v.footageContext}</div>
  {active&&<div data-copy style={{position:'absolute',left:64,right:140,top:1505,minHeight:94,fontSize:48,lineHeight:1.14,fontWeight:600,textAlign:'center',textShadow:'0 2px 14px #000a'}}>{active.words.map((w:any,i:number)=><span key={i} style={{color:time>=w.start&&time<w.end?brand.accent:brand.cream}}>{i?' ':''}{w.text}</span>)}</div>}
  <div data-copy style={{position:'absolute',left:64,bottom:220,fontSize:41,lineHeight:1,fontWeight:600}}>{brand.handle}</div>
  <Audio src={staticFile(audio)}/>
 </AbsoluteFill>;
}
