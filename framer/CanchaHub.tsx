import * as React from 'react'
import{addPropertyControls,ControlType}from'framer'
import{catalog}from'./CanchaDiscoveryData.tsx'
import{CanchaStyle,ui}from'./CanchaUI.tsx'
// City and college hub pages for search: server-rendered lists drawn from the same reviewed catalog as /clubs and /explore.
// Areas are a radius around each city center (Census place points in the catalog); nothing here is ranked or sponsored.
const HUBS:any={
 orlando:{name:'Orlando',center:[28.5383,-81.3792],radius:40,kicker:'Central Florida',title:'Soccer in Orlando',intro:'Clubs, academies, places to play and current tryouts, camps and college events across Orlando and nearby Central Florida cities. Every listing links to its official page, so check dates, ages and fees with the organizer before you register.'},
 tampa:{name:'Tampa Bay',center:[27.9506,-82.4572],radius:40,kicker:'Tampa · St. Pete · Clearwater',title:'Soccer in Tampa Bay',intro:'Clubs, academies, places to play and current tryouts, camps and college events across Tampa, St. Petersburg and the rest of the Bay area. Every listing links to its official page, so check dates, ages and fees with the organizer before you register.'},
 miami:{name:'Miami & South Florida',center:[25.7617,-80.1918],radius:50,kicker:'Miami-Dade · Broward · Palm Beach',title:'Soccer in Miami & South Florida',intro:'Clubs, academies, places to play and current tryouts, camps and college events across Miami-Dade, Broward and south Palm Beach. Every listing links to its official page, so check dates, ages and fees with the organizer before you register.'},
 college:{name:'Florida',kicker:'College soccer · Florida',title:'College soccer ID camps & events in Florida',intro:'Current college ID camps, clinics and showcases in Florida, sorted by date. Each one links to the program’s official page. Confirm who can attend, which coaches will be there and what the fee includes before you pay.'}}
const css=`.chb{padding:30px 0 60px}.chb-k{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#5f7457;margin:0 0 10px;font-weight:700}
.chb h1{font-size:clamp(40px,5.5vw,68px);margin:0 0 16px}.chb-intro{font-size:16px;line-height:1.75;color:#4c6350;max-width:760px;margin:0 0 22px}
.chb-stats{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 30px}.chb-stat{background:#173f30;color:#fff;border-radius:12px;padding:12px 16px;font-size:12px}.chb-stat b{display:block;font-size:24px;color:#d7ef86}
.chb h2{font-size:28px;margin:36px 0 14px}.chb-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
.chb-card{border:1px solid #dfe6d9;border-radius:12px;background:#fff;padding:16px 16px 14px;text-decoration:none;color:inherit;display:flex;flex-direction:column;gap:6px}
.chb-card b{font-size:16px;line-height:1.3}.chb-card span{font-size:12px;color:#5f6f58;line-height:1.5}.chb-date{font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#b94720}
.chb-more{display:inline-block;margin-top:14px;font-weight:700;color:#173f30}.chb-note{font-size:12px;color:#6b7a62;max-width:760px;line-height:1.6;margin-top:34px}
.chb-cta{display:inline-block;margin:6px 10px 0 0;background:#d7ef86;color:#103f32!important;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:800;font-size:13px}
@media(max-width:650px){.chb h1{font-size:40px}.chb-intro{font-size:14px}.chb h2{font-size:23px}}`
const miles=(a:number,b:number,c:number,d:number)=>{const r=(x:number)=>x*Math.PI/180,h=Math.sin(r(c-a)/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(r(d-b)/2)**2;return 7918*Math.asin(Math.sqrt(h))}
const nice=(s:string)=>{try{return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(s+'T12:00:00Z'))}catch{return s}}
const fee=(c:string)=>!c||/not established|confirm|vary|varies|contact|separate/i.test(c)&&!/[\$]\d/.test(c)?'Ask about fees':c.length>60?'See program fees':c
/** @framerSupportedLayoutWidth any @framerSupportedLayoutHeight auto */
export default function CanchaHub({hub='orlando'}:any){
 const h=HUBS[hub]||HUBS.orlando,today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())
 const place=(city:string)=>(catalog.cities||[]).find((c:any)=>c.city.toLowerCase()===String(city||'').toLowerCase())
 const inArea=(i:any)=>{if(!h.center)return true;const p=place(i.city);return !!p&&miles(p.lat,p.lng,h.center[0],h.center[1])<=h.radius}
 const items=(catalog.items||[]).filter(inArea),current=(i:any)=>!['Expired','Archived'].includes(i.status)&&(!i.end||i.end>=today)
 const opps=items.filter((i:any)=>i.entity==='opportunity'&&current(i)&&(hub!=='college'||i.kind==='College Opportunity')).sort((a:any,b:any)=>(a.start||'9999').localeCompare(b.start||'9999'))
 const clubs=hub==='college'?[]:items.filter((i:any)=>i.entity==='profile'&&i.kind==='Club').sort((a:any,b:any)=>a.name.localeCompare(b.name))
 const places=hub==='college'?[]:items.filter((i:any)=>i.entity==='profile'&&i.kind!=='Club')
 const cities=new Set(items.filter((i:any)=>i.entity!=='career').map((i:any)=>i.city)).size
 const card=(i:any)=><a className="chb-card" key={i.href} href={i.href}>{i.entity==='opportunity'&&<span className="chb-date">{i.start?nice(i.start)+(i.end&&i.end!==i.start?' – '+nice(i.end):''):'Dates on official page'} · {i.kind}</span>}<b>{i.name}</b><span>{[i.city,i.entity==='opportunity'?fee(i.cost):i.ages].filter(Boolean).join(' · ')}</span>{i.checkedOn&&<span>Checked {nice(i.checkedOn)}</span>}</a>
 return <main className="cancha-v2 chb"><CanchaStyle css={ui+css}/><div className="cv-wrap">
  <p className="chb-k">{h.kicker}</p><h1>{h.title}</h1><p className="chb-intro">{h.intro}</p>
  <div className="chb-stats"><div className="chb-stat"><b>{opps.length}</b>current {hub==='college'?'college events':'tryouts, camps & events'}</div>{hub!=='college'&&<div className="chb-stat"><b>{clubs.length}</b>clubs & academies</div>}{hub!=='college'&&places.length>0&&<div className="chb-stat"><b>{places.length}</b>places & pickup</div>}<div className="chb-stat"><b>{cities}</b>cities</div></div>
  <a className="chb-cta" href="/explore">Explore everything on the map →</a><a className="chb-cta" href="/organizations">List or update your club →</a>
  <h2>{hub==='college'?'Upcoming college ID camps & events':'Tryouts, camps & events'}</h2>
  {opps.length?<div className="chb-list">{opps.map(card)}</div>:<p className="chb-note">No current listings here right now. New ones are added as organizers publish them.</p>}
  {clubs.length>0&&<><h2>Clubs & academies in {h.name}</h2><div className="chb-list">{clubs.slice(0,24).map(card)}</div>{clubs.length>24&&<a className="chb-more" href="/clubs">See all {clubs.length} clubs on the map →</a>}</>}
  {places.length>0&&<><h2>Places to play & pickup</h2><div className="chb-list">{places.slice(0,12).map(card)}</div></>}
  <p className="chb-note">Listings come from official club, college and organizer pages and are rechecked automatically. Cancha doesn’t rank programs, and paid placement, if any, is always labeled. Spot something out of date? <a href="/organizations">Tell us</a>.</p>
 </div></main>}
addPropertyControls(CanchaHub,{hub:{type:ControlType.Enum,options:['orlando','tampa','miami','college'],defaultValue:'orlando'}})
