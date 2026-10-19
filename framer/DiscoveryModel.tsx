export const LEVELS=['Beginner','Recreational','Competitive','Academy','Semi-pro pathway','Professional','School / college']
export const ACTIVITIES=['Clubs & teams','Fields & places','Training','Tryouts','Camps & showcases','Tournaments']
export const GOALS=[
 {activity:'Clubs & teams',label:'Join a club',icon:'club',path:'/clubs'},
 {activity:'Tryouts',label:'Find tryouts',icon:'tryout',path:'/explore'},
 {activity:'Camps & showcases',label:'Camps & showcases',icon:'camp',path:'/explore'},
 {activity:'Training',label:'Improve my game',icon:'train',path:'/clubs'},
 {activity:'Fields & places',label:'Find a pitch',icon:'pitch',path:'/clubs'},
 {activity:'Tournaments',label:'Tournaments',icon:'trophy',path:'/explore'}
]
export const EMPTY_FILTERS={q:'',city:'',region:'',age:'',playerAge:'',role:'player',level:'',activity:'',type:'',checked:false,includeUnknown:true,view:'auto'}
export const PROFILE_KEYS=['playerAge','age','level','includeUnknown']
export function playerAge(value:any){const s=String(value??'');const n=Number(s);return /^\d{1,2}$/.test(s)&&n>=2&&n<=99?n:null}
export function ageFit(item:any,value:any){
 const n=playerAge(value);if(n===null)return {hidden:false,known:false,rank:0,label:''}
 const e=item.ageEvidence||{},audience=String(e.audience||item.audience||'').toLowerCase()
 if(e.kind==='ages'){const match=e.ranges?.some((r:any)=>n>=r.min&&(r.max===null||n<=r.max));return {hidden:!match,known:!!match,rank:0,label:`Listed ${e.label.toLowerCase()} · check other requirements`}}
 // U-groups use season/birth-year cutoffs. Conservative bounds only remove clear mismatches.
 if(e.kind==='season')return {hidden:n<e.min||n>e.max,known:false,rank:1,label:`${e.label} · confirm birth-year cutoff`}
 const youth=audience.includes('youth'),adult=audience.includes('adult')
 const hidden=youth&&!adult&&n>=20||adult&&!youth&&n<16
 return {hidden,known:false,rank:youth||adult?2:3,label:item.kind==='Place'?'Confirm session age rules':'Confirm team / program age eligibility'}
}
export function matchesActivity(item:any,activity:string){
 if(!activity)return true
 const p=String(item.programs||'').toLowerCase()
 if(activity==='Clubs & teams')return item.kind==='Club'
 if(activity==='Fields & places')return item.kind==='Place'
 if(activity==='Training')return ['Open Training','Private Training'].includes(item.kind)||item.kind==='Club'&&/training|performance|goalkeep|clinic/.test(p)
 if(activity==='Tryouts')return item.kind==='Tryout'
 if(activity==='Camps & showcases')return ['College Opportunity','Showcase','Camp / Clinic'].includes(item.kind)||item.kind==='Tournament'&&/showcase/.test(`${item.name} ${item.summary}`.toLowerCase())
 if(activity==='Tournaments')return item.kind==='Tournament'
 return false
}
export function filterDiscovery(items:any[],f:any){const result=items.filter(i=>{
 const q=String(f.q||'').trim().toLowerCase(),city=String(f.city||'').trim().toLowerCase(),fit=ageFit(i,f.playerAge)
 return (!q||`${i.name} ${i.organization} ${i.city} ${i.county||''} ${i.region||''} ${i.summary} ${i.programs}`.toLowerCase().includes(q))&&(!city||i.city.toLowerCase().includes(city))&&(!f.region||i.region===f.region)&&(!f.level||i.levels.includes(f.level))&&(!f.age||String(i.ageEvidence?.audience||i.audience).toLowerCase().includes(f.age.toLowerCase()))&&!fit.hidden&&(f.includeUnknown!==false||playerAge(f.playerAge)===null||fit.known)&&matchesActivity(i,f.activity)&&(!f.checked||i.sourceChecked)&&(!f.type||i.kind===f.type)
 });return playerAge(f.playerAge)===null?result:result.sort((a,b)=>ageFit(a,f.playerAge).rank-ageFit(b,f.playerAge).rank)}
export function readDiscoveryFilters(search:string){const p=new URLSearchParams(search),raw=p.get('level')||p.get('level-2')||'',category=p.get('category-2')||'';return {...EMPTY_FILTERS,q:p.get('q')||p.get('search')||'',city:p.get('city')||'',region:p.get('region')||'',age:p.get('age')||p.get('age-group-2')||(raw==='Youth'?'Youth':''),playerAge:playerAge(p.get('playerAge'))===null?'':p.get('playerAge')||'',role:'player',level:({'Competitive Amateur':'Competitive','College':'School / college','High School':'School / college','Youth':''}[raw]??raw),activity:p.get('activity')||({'Tryout':'Tryouts','Open Training':'Training','Tournament':'Tournaments','Showcase':'Camps & showcases','College Opportunity':'Camps & showcases'}[category]||''),type:p.get('type')||p.get('kind')||(['Job','Internship','Volunteer Opportunity'].includes(category)?category:''),checked:p.get('checked')==='1',includeUnknown:p.get('ages')!=='known',view:p.get('view')==='map'?'map':p.get('view')==='list'?'list':'auto'}}
export function discoverySearch(filters:any){const p=new URLSearchParams();for(const k of ['q','city','region','age','playerAge','level','activity','type','checked','view']){const v=filters[k];if(!v||k==='view'&&v==='auto'||k==='role'&&v==='player'||k==='playerAge'&&playerAge(v)===null)continue;p.set(k,v===true?'1':String(v))}if(filters.includeUnknown===false)p.set('ages','known');return p.toString()}
export function discoveryHref(path:string,f:any,overrides:any={}){const search=discoverySearch({...f,q:'',type:'',checked:false,...overrides});return path+(search?'?'+search:'')}
export function playerSummary(f:any){return [playerAge(f.playerAge)!==null?'Age '+f.playerAge:f.age||'',f.level].filter(Boolean).join(' · ')||'All players'}
export const BASIC_LEVELS=['Beginner','Recreational','Competitive','Academy']
export function levelOptionsForAge(value:any,advanced=false,selected=''){return LEVELS.filter(l=>advanced||BASIC_LEVELS.includes(l)||l===selected)}
export function goalPath(activity:string,fallback='/clubs'){return GOALS.find(g=>g.activity===activity)?.path||fallback}
export function activeFilterCount(f:any){return ['city','region','playerAge','age','level','activity','type'].filter(k=>f[k]).length+Number(!!f.checked)+Number(f.includeUnknown===false)}
export function cardAgeLabel(item:any){const e=item.ageEvidence;if(e?.kind==='ages'||e?.kind==='season')return e.label;const a=String(item.ages||'');return a==='See eligibility'?'Ages: confirm with organizer':a.length>60?item.audience||'Ages vary by program':a}
// Merge nearby city markers until their hit targets no longer overlap.
export function clusterMapPoints(points:any[],distance=46){let groups=points.map(p=>({...p,members:[p]})),changed=true;while(changed){changed=false;outer:for(let a=0;a<groups.length;a++)for(let b=a+1;b<groups.length;b++)if(Math.hypot(groups[a].x-groups[b].x,groups[a].y-groups[b].y)<distance){const members=[...groups[a].members,...groups[b].members];groups[a]={x:members.reduce((s,p)=>s+p.x,0)/members.length,y:members.reduce((s,p)=>s+p.y,0)/members.length,count:members.reduce((s,p)=>s+p.count,0),members};groups.splice(b,1);changed=true;break outer}}return groups}
