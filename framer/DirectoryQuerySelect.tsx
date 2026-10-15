import * as React from 'react'
import {addPropertyControls,ControlType} from 'framer'
/** @framerSupportedLayoutWidth any @framerSupportedLayoutHeight fixed */
export default function DirectoryQuerySelect({value='',param='age',options='Youth,Adult',placeholder='Any age group',label=''}){
 const [selected,setSelected]=React.useState(value||'');React.useEffect(()=>setSelected(value||''),[value]);
 return <select aria-label={label||(param==='age'?'Age group':param==='level'?'Experience':'Filter')} value={selected} onChange={e=>{const next=e.target.value;setSelected(next);if(typeof window!=='undefined'){const url=new URL(window.location.href);if(next)url.searchParams.set(param,next);else url.searchParams.delete(param);window.location.assign(url.pathname+url.search+url.hash)}}} style={{fontFamily:'Alumni Sans,sans-serif',fontSize:21,width:'100%',height:'100%',minHeight:48,background:'#FFF',color:'#0C3E2E',border:'1px solid #B5C7BA',borderRadius:8,padding:'10px 12px',boxSizing:'border-box'}}><option value="">{placeholder}</option>{options.split(',').map(x=>x.trim()).filter(Boolean).map(x=>{const[value,title]=x.split('|');return <option value={value} key={value}>{title||value}</option>})}</select>
}
addPropertyControls(DirectoryQuerySelect,{value:{type:ControlType.String},label:{type:ControlType.String},param:{type:ControlType.String,defaultValue:'age'},options:{type:ControlType.String,defaultValue:'Youth,Adult'},placeholder:{type:ControlType.String,defaultValue:'Any age group'}})
