import * as React from 'react'
import{addPropertyControls,ControlType}from'framer'
import{catalog}from'./CanchaDiscoveryData.tsx'
import{CanchaStyle,ui,COMMUNITY_MEDIA}from'./CanchaUI.tsx'
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
// Hero photos (Oct 30, visual-first): the licensed Orlando supporters photo for Orlando; stills from cleared CC BY creator
// videos (Florida youth tournament) elsewhere, hosted for /florida-soccer-pathway. Never captioned as a specific place.
const ORL=COMMUNITY_MEDIA.find((m:any)=>m.id==='orlando-supporters')
const HERO:any={orlando:{url:ORL?.url||'https://framerusercontent.com/images/ndjreaMo4OjTpwI7hF4XJX7ie4.jpg',credit:ORL?`Photo: ${ORL.artist}, ${ORL.license} via Wikimedia Commons.`:''},
 tampa:{url:'https://framerusercontent.com/images/emRGLDEukqngdqRjV5eFE1UXvY.jpg',credit:'Photo: still from a Lozzz Productionz video on YouTube (CC BY).'},
 miami:{url:'https://framerusercontent.com/images/1g4BMMzWUCYnNj17XaRnfV9M9Lw.jpg',credit:'Photo: still from a Lozzz Productionz video on YouTube (CC BY).'},
 college:{url:'https://framerusercontent.com/images/ndjreaMo4OjTpwI7hF4XJX7ie4.jpg',credit:'Photo: still from a Lozzz Productionz video on YouTube (CC BY).'}}
const heroCss=`.chb{padding:0 0 60px}.chb-hero{position:relative;color:#fff;background:#0b2e24 center 35%/cover no-repeat;border-radius:0 0 28px 28px;overflow:hidden;isolation:isolate;margin-bottom:10px}.chb-hero:before{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,#0b2e2466 0%,#0b2e24b3 45%,#0b2e24f2 100%)}
.chb-hero .cv-wrap{padding-top:120px;padding-bottom:34px}.chb-chip{display:inline-block;background:#d7ef86;color:#103f32;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;border-radius:6px;padding:6px 9px;margin-bottom:14px}
.chb-hero h1{color:#fff;font-size:clamp(46px,7vw,92px);line-height:.92;margin:0 0 12px;text-shadow:0 2px 18px #0b2e24b3}.chb-hero .chb-intro{color:#e3ecd6;font-size:16px;max-width:620px;margin:0 0 22px}
.chb-hero .chb-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:0;max-width:820px}.chb-hero .chb-stat{background:#ffffff14;border:1px solid #ffffff33;backdrop-filter:blur(8px);border-radius:16px;padding:14px 16px;font-size:13px}
.chb-hero .chb-stat b{font-family:var(--cancha-display-font,'Cancha Display'),sans-serif;font-style:italic;font-size:44px;line-height:1;color:#d7ef86}
.chb h2{font-size:clamp(28px,3.6vw,42px)}.chb-card{flex-direction:row;align-items:center;gap:14px;border-radius:18px;padding:14px;transition:border-color .15s,transform .15s}.chb-card:hover{border-color:#103f32;transform:translateY(-2px)}
.chb-txt{display:flex;flex-direction:column;gap:4px;min-width:0}.chb-cal{flex:none;width:58px;height:62px;border-radius:14px;background:#103f32;color:#fff!important;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1}
.chb-cal small{font-size:11px!important;font-weight:800;text-transform:uppercase;color:#d7ef86!important;letter-spacing:.06em}.chb-cal b{font-family:var(--cancha-display-font,'Cancha Display'),sans-serif;font-style:italic;font-size:30px!important;color:#fff}
.chb-badge{flex:none;width:58px;height:58px;border-radius:14px;background:#f1f5ec;display:grid;place-items:center;overflow:hidden}.chb-badge img{width:46px;height:46px;object-fit:contain}.chb-badge span{font-family:var(--cancha-display-font,'Cancha Display'),sans-serif;font-style:italic;font-size:28px;color:#103f32}
.chb-band{margin-top:44px;background:#103f32;color:#fff;border-radius:24px;padding:28px;display:grid;grid-template-columns:1fr auto;gap:20px;align-items:center}.chb-band h2{color:#fff;margin:0 0 6px}.chb-band p{margin:0;color:#cfe0c8;font-size:14px;max-width:520px}
.chb-band-btns{display:flex;flex-wrap:wrap;gap:10px}.chb-band-btns a{background:#d7ef86;color:#103f32!important;text-decoration:none;padding:12px 16px;border-radius:12px;font-weight:800;font-size:13px}.chb-band-btns a+a{background:transparent;color:#fff!important;border:1px solid #ffffff55}
@media(max-width:900px){.chb-band{grid-template-columns:1fr}}@media(max-width:650px){.chb-hero .cv-wrap{padding-top:96px;padding-bottom:26px}.chb-hero h1{font-size:44px}.chb-hero .chb-stat b{font-size:36px}.chb-band{padding:22px 18px}}
@media(prefers-reduced-motion:reduce){.chb-card{transition:none}}`
const miles=(a:number,b:number,c:number,d:number)=>{const r=(x:number)=>x*Math.PI/180,h=Math.sin(r(c-a)/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(r(d-b)/2)**2;return 7918*Math.asin(Math.sqrt(h))}
const nice=(s:string)=>{try{return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(s+'T12:00:00Z'))}catch{return s}}
const decode=(t:string)=>String(t||'').replace(/&rsquo;|&#8217;|&#x27;|&#39;/g,'’').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&ndash;/g,'–')
const shortAges=(i:any)=>{const a=i.ageEvidence?.label||i.ages||'';return a&&a.length<=40&&!/not established|confirm|must be/i.test(a)?a:''}
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
 const cities=new Set([...opps,...clubs,...places].map((i:any)=>i.city)).size
 const card=(i:any)=>{const d=i.start?new Date(i.start+'T12:00:00Z'):null;return <a className="chb-card" key={i.href} href={i.href}>
  {i.entity==='opportunity'?<span className="chb-cal" aria-hidden="true">{d?<><small>{d.toLocaleDateString('en-US',{month:'short',timeZone:'UTC'})}</small><b>{d.getUTCDate()}</b></>:<small>TBA</small>}</span>:<span className="chb-badge">{i.image?<img src={i.image} alt="" loading="lazy"/>:<span>{decode(i.name).slice(0,1)}</span>}</span>}
  <span className="chb-txt">{i.entity==='opportunity'&&<span className="chb-date">{i.start?nice(i.start)+(i.end&&i.end!==i.start?' – '+nice(i.end):''):'Dates on official page'} · {i.kind}</span>}<b>{decode(i.name)}</b><span>{[i.city,i.entity==='opportunity'?fee(i.cost):shortAges(i)].filter(Boolean).join(' · ')}</span>{i.checkedOn&&<span>Checked {nice(i.checkedOn)}</span>}</span></a>}
 const photo=HERO[hub]||HERO.orlando
 return <main className="cancha-v2 chb"><CanchaStyle css={ui+css+heroCss}/>
  <section className="chb-hero" style={{backgroundImage:`url(${photo.url})`}}><div className="cv-wrap">
   <span className="chb-chip">{h.kicker}</span><h1>{h.title}</h1><p className="chb-intro">{h.intro}</p>
   <div className="chb-stats"><div className="chb-stat"><b>{opps.length}</b>current {hub==='college'?'college events':'tryouts, camps & events'}</div>{hub!=='college'&&<div className="chb-stat"><b>{clubs.length}</b>clubs & academies</div>}{hub!=='college'&&places.length>0&&<div className="chb-stat"><b>{places.length}</b>places & pickup</div>}<div className="chb-stat"><b>{cities}</b>cities</div></div>
  </div></section>
  <div className="cv-wrap">
  <h2>{hub==='college'?'Upcoming college ID camps & events':'Tryouts, camps & events'}</h2>
  {opps.length?<div className="chb-list">{opps.map(card)}</div>:<p className="chb-note">No current listings here right now. New ones are added as organizers publish them.</p>}
  {clubs.length>0&&<><h2>Clubs & academies in {h.name}</h2><div className="chb-list">{clubs.slice(0,24).map(card)}</div>{clubs.length>24&&<a className="chb-more" href="/clubs">See all {clubs.length} clubs on the map →</a>}</>}
  {places.length>0&&<><h2>Places to play & pickup</h2><div className="chb-list">{places.slice(0,12).map(card)}</div></>}
  <section className="chb-band"><div><h2>{hub==='college'?'Know the recruiting dates':'Find your game'}</h2><p>{hub==='college'?'When D1 coaches can contact you, how ID camps fit in, and your personal timeline.':'Tryout dates, ODP, elite paths and your player’s 2026-27 age group.'}</p></div>
   <div className="chb-band-btns"><a href="/florida-soccer-pathway">Pathway guide →</a><a href="/explore">Map of everything</a><a href="/organizations">List or update your club</a></div></section>
  <p className="chb-note">Listings come from official club, college and organizer pages and are rechecked automatically. Cancha doesn’t rank programs, and paid placement, if any, is always labeled. Spot something out of date? <a href="/organizations">Tell us</a>. {photo.credit}</p>
 </div></main>}
addPropertyControls(CanchaHub,{hub:{type:ControlType.Enum,options:['orlando','tampa','miami','college'],defaultValue:'orlando'}})
