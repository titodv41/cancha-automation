import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Composition, Img, continueRender, delayRender, interpolate, registerRoot, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const forest='#103f32',cream='#f5f3e9',lime='#d7ef86',orange='#f55b32';
const display:React.CSSProperties={fontFamily:'CanchaDisplay, sans-serif',fontWeight:700,fontStyle:'italic',lineHeight:.91,letterSpacing:-2};
const fade=(frame:number,start:number,end:number)=>interpolate(frame,[start,start+12,end-12,end],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const Feature=()=>{
 const f=useCurrentFrame(),{fps}=useVideoConfig();
 const [handle]=useState(()=>delayRender('Load licensed local fonts'));
 useEffect(()=>{Promise.all([document.fonts.load('italic 700 100px CanchaDisplay'),document.fonts.load('600 40px CanchaUI')]).then(()=>continueRender(handle));},[handle]);
 const enter=spring({frame:f,fps,config:{damping:18,stiffness:110}});
 const rise=(start:number)=>interpolate(f,[start,start+22],[45,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 return <AbsoluteFill style={{background:forest,color:cream,fontFamily:'CanchaUI,sans-serif',fontWeight:600,overflow:'hidden'}}>
  <style>{`@font-face{font-family:CanchaDisplay;src:url('${staticFile('generated/display.woff2')}');font-weight:700;font-style:italic}@font-face{font-family:CanchaUI;src:url('${staticFile('generated/ui.woff2')}');font-weight:600}`}</style>
  <AbsoluteFill style={{opacity:.1,transform:`translateX(${interpolate(f,[0,540],[-70,60])}px)`}}>
   <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none" stroke={lime} strokeWidth="2"><path d="M-100 620h1400M-100 1320h1400M540 240v1500"/><circle cx="540" cy="970" r="245"/><path d="M-40 760h170v420H-40m1160-420H950v420h170"/></svg>
  </AbsoluteFill>
  <div style={{position:'absolute',top:150,left:76,right:76,display:'flex',justifyContent:'space-between',alignItems:'center'}}><div style={{width:236,height:80,overflow:'hidden'}}><Img src={staticFile('generated/cancha.png')} style={{width:'100%',height:'100%',objectFit:'cover',filter:'brightness(0) invert(1)'}}/></div><span style={{fontSize:29}}>@wearecancha</span></div>
  <div style={{position:'absolute',top:300,left:76,color:lime,fontSize:28,letterSpacing:3}}>JACKSONVILLE / PLAYER NOTES</div>
  <AbsoluteFill style={{opacity:fade(f,0,165),padding:'410px 76px 0',transform:`translateY(${(1-enter)*55}px)`}}>
   <div style={{...display,fontSize:160}}>ASHLYN<br/>PUERTA.</div>
   <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:60}}><div><div style={{...display,fontSize:400,color:lime,lineHeight:.82}}>4</div><div style={{fontSize:39,marginTop:24}}>GOALS. AT 19.</div></div><div style={{width:280,height:280,padding:32,borderRadius:32,background:'white'}}><Img src={staticFile('generated/jax.png')} style={{width:'100%',height:'100%',objectFit:'contain'}}/></div></div>
   <div style={{fontSize:35,marginTop:65,lineHeight:1.4}}>Sporting JAX 4–1<br/>Fort Lauderdale United</div>
  </AbsoluteFill>
  <AbsoluteFill style={{opacity:fade(f,150,345),padding:'420px 76px 0',transform:`translateY(${rise(150)}px)`}}>
   <div style={{...display,fontSize:158}}>A RECORD<br/>NIGHT.</div>
   <div style={{display:'flex',gap:15,marginTop:76}}>{[1,2,3,4].map((n)=><div key={n} style={{width:210,height:250,borderRadius:24,background:f>173+n*8?lime:'#285543',color:forest,display:'flex',alignItems:'center',justifyContent:'center',...display,fontSize:180,transform:`translateY(${interpolate(f,[170+n*8,190+n*8],[40,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}px)`}}>{n}</div>)}</div>
   <div style={{fontSize:48,lineHeight:1.25,marginTop:65}}>Single-match scoring record<br/>in the Gainbridge Super League.</div><div style={{fontSize:30,color:'#c5d8cb',marginTop:26,lineHeight:1.4}}>According to Sporting JAX’s<br/>October 16, 2026 match report.</div>
  </AbsoluteFill>
  <AbsoluteFill style={{opacity:interpolate(f,[330,348],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}),padding:'445px 76px 0',transform:`translateY(${rise(330)}px)`}}>
   <div style={{width:145,height:12,background:orange,marginBottom:56}}/>
   <div style={{...display,fontSize:148}}>WHO ELSE<br/>SHOULD WE<br/>BE WATCHING?</div>
   <p style={{fontSize:44,lineHeight:1.3,marginTop:70}}>Tell us the Florida player.<br/>The club.<br/>And why.</p>
   <div style={{...display,color:lime,fontSize:67,marginTop:70}}>THE LOCAL GAME.</div>
  </AbsoluteFill>
  <div style={{position:'absolute',left:76,right:76,bottom:175,borderTop:'1px solid #527466',paddingTop:25,fontSize:23,lineHeight:1.5,color:'#c5d8cb'}}>Source: Sporting JAX · Match report: Oct 16, 2026<br/>Original Cancha recap · Identifying club crest · No match footage</div>
 </AbsoluteFill>;
};
const Root=()=> <Composition id="PuertaFourGoals" component={Feature} durationInFrames={540} fps={30} width={1080} height={1920}/>;
registerRoot(Root);
