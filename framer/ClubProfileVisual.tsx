import * as React from 'react'
import {addPropertyControls,ControlType} from 'framer'
import{CanchaStyle,fontCss,CategoryArt}from'./CanchaUI.tsx'
/** @framerSupportedLayoutWidth any @framerSupportedLayoutHeight fixed */
export default function ClubProfileVisual({image='',name='',kind='Club'}){
 const src=typeof image==='string'?image:(image as any)?.src||(image as any)?.url;const [failed,setFailed]=React.useState(false);React.useEffect(()=>setFailed(false),[src]);
 return <div style={{height:'100%',minHeight:100,width:'100%',background:'#edf2e6',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',gap:20,padding:'20px 28px',boxSizing:'border-box',overflow:'hidden',fontFamily:'Cancha Manrope,Arial,sans-serif',color:'#143b2c'}}><CanchaStyle css={fontCss}/>{src&&!failed?<img src={src} alt={`${name} badge`} onError={()=>setFailed(true)} style={{width:'100%',height:'100%',maxHeight:112,objectFit:'contain'}}/>:<CategoryArt name={name} kind={kind}/>}</div>
}
addPropertyControls(ClubProfileVisual,{image:{type:ControlType.Image},name:{type:ControlType.String},kind:{type:ControlType.String,defaultValue:'Club'}})
