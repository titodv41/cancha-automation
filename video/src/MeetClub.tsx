import React,{useEffect,useState}from'react';
import{AbsoluteFill,Audio,Easing,Img,OffthreadVideo,Sequence,continueRender,delayRender,interpolate,staticFile,useCurrentFrame,useVideoConfig}from'remotion';
// "Meet Your Local Club · <city>": the organization's own clips (their voices kept), one short pull quote per clip,
// then an end card with the practical details from their official page. Built only from owner-cleared submissions.
const clamp={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const};
const ease=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{...clamp,easing:Easing.bezier(.16,1,.3,1)});
const display:React.CSSProperties={fontFamily:'MeetDisplay,sans-serif',fontStyle:'italic',fontWeight:700,lineHeight:.93,letterSpacing:-1};
export const INTRO=2.4,OUTRO=4;
export function MeetClub({brand,feature,music}:any){
 const f=useCurrentFrame(),{fps,durationInFrames}=useVideoConfig(),[handle]=useState(()=>delayRender('Meet Your Local Club fonts'));
 useEffect(()=>{Promise.all([document.fonts.load('italic 700 120px MeetDisplay'),document.fonts.load('700 48px MeetUI')]).then(()=>continueRender(handle));},[handle]);
 const intro=Math.round(INTRO*fps),outroFrom=durationInFrames-Math.round(OUTRO*fps);let at=intro;
 const segments=feature.segments.map((s:any)=>{const from=at,len=Math.round(s.duration*fps);at+=len;return{...s,from,len};});
 const current=segments.find((s:any)=>f>=s.from&&f<s.from+s.len);
 return <AbsoluteFill style={{background:brand.forest,color:brand.cream,fontFamily:'MeetUI,sans-serif',fontWeight:700,overflow:'hidden'}}>
  <style>{`@font-face{font-family:MeetDisplay;src:url('${staticFile('generated/meet-club/display.woff2')}');font-weight:700;font-style:italic}@font-face{font-family:MeetUI;src:url('${staticFile('generated/meet-club/ui.woff2')}');font-weight:700}`}</style>
  {music&&<Audio src={staticFile(music)} volume={feature.musicVolume??.14}/>}
  {segments.map((s:any,i:number)=><Sequence key={i} from={i===0?0:s.from} durationInFrames={i===0?s.from+s.len:s.len}>
   <AbsoluteFill style={{opacity:i===0?1:ease(f,s.from,s.from+8)}}><OffthreadVideo src={staticFile(s.publicFile)} startFrom={Math.max(0,Math.round((s.start||0)*fps)-(i===0?intro:0))} volume={(fr:number)=>i===0&&fr<intro?0:1} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:s.position||'50% 40%'}}/></AbsoluteFill>
  </Sequence>)}
  <AbsoluteFill style={{background:'linear-gradient(180deg,#071d17cc 0%,#071d1700 22%,#071d1700 58%,#071d17e6 86%)'}}/>
  {f<intro+6&&<AbsoluteFill style={{background:`${brand.forest}e0`,opacity:1-ease(f,intro-4,intro+6)}}>
   <div style={{position:'absolute',left:70,right:150,top:640,transform:`translateY(${(1-ease(f,0,14))*30}px)`}}>
    <div data-copy style={{display:'inline-block',background:brand.accent,color:brand.forest,fontSize:34,padding:'10px 18px 12px',borderRadius:8,letterSpacing:1}}>MEET YOUR LOCAL CLUB · {String(feature.city).toUpperCase()}</div>
    <div data-copy style={{...display,fontSize:feature.organization.length>18?118:150,marginTop:34}}>{feature.organization}</div>
    {feature.tagline&&<div data-copy style={{fontSize:40,marginTop:30,lineHeight:1.2,maxWidth:820}}>{feature.tagline}</div>}
   </div>
  </AbsoluteFill>}
  {current&&f<outroFrom&&<>
   <div style={{position:'absolute',left:70,top:250,opacity:ease(f,current.from,current.from+10)}}><span data-copy style={{fontSize:30,letterSpacing:1.5,background:'#071d17cc',padding:'9px 15px',borderRadius:8}}>{current.speaker||feature.organization}</span></div>
   {current.caption&&<div data-copy style={{position:'absolute',left:70,right:150,top:1250,...display,fontSize:current.caption.length>60?66:80,textShadow:'0 4px 18px #000b',opacity:ease(f,current.from+4,current.from+16),transform:`translateY(${(1-ease(f,current.from+4,current.from+16))*22}px)`}}>“{current.caption}”</div>}
  </>}
  {f>=outroFrom-6&&<AbsoluteFill style={{background:brand.forest,opacity:ease(f,outroFrom-6,outroFrom+6)}}>
   <div style={{position:'absolute',left:70,right:150,top:330}}>
    <div data-copy style={{fontSize:32,color:brand.accent,letterSpacing:1.5}}>MEET YOUR LOCAL CLUB · {String(feature.city).toUpperCase()}</div>
    <div data-copy style={{...display,fontSize:104,marginTop:22}}>{feature.organization}</div>
    {feature.endCard.map((row:any,i:number)=><div key={i} style={{marginTop:i?34:62,opacity:ease(f,outroFrom+4+i*5,outroFrom+16+i*5)}}><div data-copy style={{fontSize:28,color:brand.accent,letterSpacing:1.5}}>{row.label.toUpperCase()}</div><div data-copy style={{fontSize:46,lineHeight:1.18,marginTop:8}}>{row.value}</div></div>)}
    <div data-copy style={{display:'inline-block',marginTop:66,background:brand.orange,color:brand.forest,fontSize:40,padding:'14px 22px 17px',borderRadius:10}}>Find your game · link in bio</div>
   </div>
  </AbsoluteFill>}
  <header style={{position:'absolute',left:70,right:150,top:120,display:'flex',alignItems:'center',justifyContent:'space-between'}}><div style={{width:210,height:68,overflow:'hidden'}}><Img src={staticFile('generated/meet-club/cancha.png')} style={{width:'100%',height:'100%',objectFit:'cover',filter:'brightness(0) invert(1)'}}/></div><span style={{fontSize:30}}>{brand.handle}</span></header>
  <div style={{position:'absolute',left:70,right:150,bottom:205,height:4,background:'#ffffff30',borderRadius:4,overflow:'hidden'}}><div style={{height:'100%',width:`${f/(durationInFrames-1)*100}%`,background:brand.accent}}/></div>
 </AbsoluteFill>;
}
