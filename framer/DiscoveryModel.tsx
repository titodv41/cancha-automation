export const LEVELS=['Beginner','Recreational','Competitive','Academy','Semi-pro pathway','Professional','School / college']
export const ACTIVITIES=['Clubs & teams','Fields & places','Training','Tryouts','Camps & showcases','Tournaments']
export function matchesActivity(item:any,activity:string){
 if(!activity)return true
 const p=String(item.programs||'').toLowerCase()
 if(activity==='Clubs & teams')return item.kind==='Club'
 if(activity==='Fields & places')return item.kind==='Place'
 if(activity==='Training')return item.kind==='Open Training'||item.kind==='Club'&&/training|performance|goalkeep|clinic/.test(p)
 if(activity==='Tryouts')return item.kind==='Tryout'
 if(activity==='Camps & showcases')return ['College Opportunity','Showcase'].includes(item.kind)
 if(activity==='Tournaments')return item.kind==='Tournament'
 return false
}
export function filterDiscovery(items:any[],f:any){return items.filter(i=>{
 const q=String(f.q||'').trim().toLowerCase(),city=String(f.city||'').trim().toLowerCase()
 return (!q||`${i.name} ${i.organization} ${i.city} ${i.summary} ${i.programs}`.toLowerCase().includes(q))&&(!city||i.city.toLowerCase().includes(city))&&(!f.level||i.levels.includes(f.level))&&(!f.age||i.audience.toLowerCase().includes(f.age.toLowerCase()))&&matchesActivity(i,f.activity)&&(!f.checked||i.sourceChecked)&&(!f.type||i.kind===f.type)
})}
export function readDiscoveryFilters(search:string){const p=new URLSearchParams(search);const raw=p.get('level')||p.get('level-2')||'';return {q:p.get('q')||p.get('search')||'',city:p.get('city')||'',age:p.get('age')||p.get('age-group-2')||'',level:raw==='Competitive Amateur'?'Competitive':raw,activity:p.get('activity')||({'Tryout':'Tryouts','Open Training':'Training','Tournament':'Tournaments','Showcase':'Camps & showcases','College Opportunity':'Camps & showcases'}[p.get('category-2')||'']||''),type:p.get('kind')||'',checked:p.get('checked')==='1',view:p.get('view')==='map'?'map':'list'}}
