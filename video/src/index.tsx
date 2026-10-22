import {MotionStory} from './MotionStory';
import {NewsExplainer} from './NewsExplainer';
import motionManifest from '../../content/instagram/motion-stories.json';
import explainerManifest from '../../content/instagram/explainer-stories.json';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Composition, Img, continueRender, delayRender, interpolate, registerRoot, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

type Beat={start:number;end:number;photoId:string;position?:string;layout?:string;eyebrow:string;title:string;body:string};
type StoryProps={brand:{name:string;handle:string;forest:string;cream:string;accent:string;orange:string};beats:Beat[];photos:Record<string,string>};
const defaults:StoryProps={brand:{name:'Cancha',handle:'@wearecancha',forest:'#103f32',cream:'#f5f3e9',accent:'#d7ef86',orange:'#f55b32'},beats:[],photos:{}};
const clamp={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const};
const Story=({brand,beats,photos}:StoryProps)=>{
 const f=useCurrentFrame(),{durationInFrames}=useVideoConfig();
 const [handle]=useState(()=>delayRender('Load local brand fonts'));
 useEffect(()=>{Promise.all([document.fonts.load('italic 700 150px CanchaDisplay'),document.fonts.load('600 44px CanchaUI')]).then(()=>continueRender(handle));},[handle]);
 return <AbsoluteFill style={{background:brand.forest,color:brand.cream,fontFamily:'CanchaUI,sans-serif',fontWeight:600,overflow:'hidden'}}>
  <style>{`@font-face{font-family:CanchaDisplay;src:url('${staticFile('generated/display.woff2')}');font-weight:700;font-style:italic}@font-face{font-family:CanchaUI;src:url('${staticFile('generated/ui.woff2')}');font-weight:600}`}</style>
  {beats.map((beat,i)=>{
   const opacity=interpolate(f,[beat.start,beat.start+7,beat.end-7,beat.end],[i===0?1:0,1,1,i===beats.length-1?1:0],clamp);
   const progress=interpolate(f,[beat.start,beat.end],[0,1],clamp),portrait=beat.layout==='portrait';
   return <AbsoluteFill key={i} style={{opacity,background:brand.forest}}>
    <div style={{position:'absolute',top:portrait?270:0,left:portrait?100:0,width:portrait?880:1080,height:portrait?880:1480,overflow:'hidden',borderRadius:portrait?28:0}}>
     <Img src={staticFile(photos[beat.photoId])} style={{height:'100%',width:'100%',objectFit:'cover',objectPosition:beat.position||'50% 40%',transform:`scale(${1.01+progress*.07}) translateY(${-progress*12}px)`}}/>
    </div>
    {!portrait&&<AbsoluteFill style={{background:'linear-gradient(180deg,rgba(4,18,13,.48) 0%,transparent 22%,transparent 43%,#103f32 79%)'}}/>}
    <div style={{position:'absolute',top:portrait?1200:1220,left:72,right:72,transform:`translateY(${interpolate(f,[beat.start,beat.start+14],[34,0],clamp)}px)`}}>
     <div style={{color:brand.accent,fontSize:27,letterSpacing:2,marginBottom:32}}>{beat.eyebrow}</div>
     <div style={{fontFamily:'CanchaDisplay,sans-serif',fontWeight:700,fontStyle:'italic',fontSize:portrait?123:144,lineHeight:.94,whiteSpace:'pre-line',letterSpacing:-1}}>{beat.title}</div>
     <div style={{fontSize:portrait?40:38,lineHeight:1.25,marginTop:34,maxWidth:910}}>{beat.body}</div>
    </div>
   </AbsoluteFill>;
  })}
  <div style={{position:'absolute',top:125,left:72,right:72,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
   <div style={{width:210,height:70,overflow:'hidden'}}><Img src={staticFile('generated/cancha.png')} style={{width:'100%',height:'100%',objectFit:'cover',filter:'brightness(0) invert(1)'}}/></div>
   <span style={{fontSize:29}}>{brand.handle}</span>
  </div>
  <div style={{position:'absolute',left:72,right:72,bottom:205,height:5,background:'#547266',borderRadius:8,overflow:'hidden'}}>
   <div style={{height:'100%',width:`${Math.max(0,f/(durationInFrames-1)*100)}%`,background:brand.accent}}/>
  </div>
 </AbsoluteFill>;
};
const Root=()=> <><Composition id="PhotoStory" component={Story} durationInFrames={450} fps={30} width={1080} height={1920} defaultProps={defaults}/><Composition id="MotionStory" component={MotionStory} durationInFrames={660} fps={30} width={1080} height={1920} defaultProps={{brand:defaults.brand,story:motionManifest.stories[0],clip:'generated/motion/club-clip.mp4',audio:'generated/motion/soundtrack.wav'}}/><Composition id="NewsExplainer" component={NewsExplainer} durationInFrames={720} fps={30} width={1080} height={1920} defaultProps={{brand:defaults.brand,story:explainerManifest.stories[0],media:{'stadium-plan':'generated/explainer/stadium-plan.png','club-crest':'generated/explainer/club-crest.png'},audio:'generated/explainer/soundtrack.wav'}}/></>;
registerRoot(Root);
