import * as React from 'react'
import{catalog}from'./CanchaDiscoveryData.tsx'
import{CanchaStyle,ui,locationStyles,CatalogCard,Icon,BrowseTiles,COMMUNITY_MEDIA}from'./CanchaUI.tsx'
import CanchaPlayerFit,{usePlayerFilters,fitStyles,DeviceLocationControl}from'./CanchaPlayerFit.tsx'
import DiscoveryCityMap from'./DiscoveryCityMap.tsx'
import{BROWSE_CATEGORIES,activeFilterCount,goalPath,filterDiscovery,discoveryHref,searchSubmission,locationIssue,quickStartResult}from'./DiscoveryModel.tsx'
// Licensed real-match photo; credits stay on the photo-credits page.
const HERO_PHOTO=COMMUNITY_MEDIA.find((m:any)=>m.id==='orlando-huddle')
function FloridaClubBoard({profiles}:any){
 const picks=['weston-fc','florida-kraze-krush','fc-tampa-rangers'].map(slug=>profiles.find((p:any)=>p.slug===slug&&p.image)).filter(Boolean)
 return <aside className="ch4-club-board" aria-label="Clubs around Florida"><div className="ch4-board-heading"><span>AROUND FLORIDA</span><a href="/clubs">Explore <Icon name="arrow" size={14}/></a></div><svg className="ch4-pitch" viewBox="0 0 480 340" fill="none" aria-hidden="true"><rect x="22" y="46" width="436" height="272" rx="8"/><path d="M240 46v272M22 119h60v125H22m436-125h-60v125h60"/><circle cx="240" cy="182" r="65"/><circle cx="240" cy="182" r="3"/></svg><div className="ch4-board-clubs">{picks.map((p:any,index:number)=><a className={'ch4-board-club ch4-board-club-'+index} key={p.id} href={p.href}><span className="ch4-board-badge" style={p.background==='dark'?{background:'#143b2c'}:undefined}><img src={p.image} alt={p.name+' badge'} decoding="async"/></span><span><small><Icon name="pin" size={11}/>{p.city}</small><strong>{p.name}</strong></span><Icon name="arrow" size={17}/></a>)}</div></aside>
}
// A dated, source-reviewed event. Hide it after kickoff or an overdue review.
const LOCAL_MOMENT={title:'Rowdies playoff night',location:'Al Lang, St. Petersburg',startsAt:'2026-10-30T23:30:00Z',reviewedAt:'2026-10-22T18:00:05Z',reviewUntil:'2026-10-25T18:00:05Z',source:'https://www.rowdiessoccer.com/news/2026/10/18/rowdies-claim-players-shield-in-1-0-victory-over-detroit/'}
function LocalMoment(){
 const[now,setNow]=React.useState(0)
 React.useEffect(()=>{const tick=()=>setNow(Date.now());tick();const timer=setInterval(tick,60000);return()=>clearInterval(timer)},[])
 if(!now||now>=Date.parse(LOCAL_MOMENT.startsAt)||now>=Date.parse(LOCAL_MOMENT.reviewUntil))return null
 return <a className="ch5-moment" href={LOCAL_MOMENT.source} target="_blank" rel="noopener noreferrer"><span className="ch5-moment-icon"><Icon name="event" size={19}/></span><span><small>On the calendar · Oct 30, 7:30 PM ET</small><strong>{LOCAL_MOMENT.title}</strong><span>{LOCAL_MOMENT.location}</span></span><span className="ch5-moment-action">Make matchday plans <Icon name="arrow" size={16}/></span></a>
}
function ClubUpdates(){
 const[now,setNow]=React.useState(0),[tab,setTab]=React.useState('news'),rail=React.useRef<HTMLDivElement>(null)
 React.useEffect(()=>{const tick=()=>setNow(Date.now());tick();const t=setInterval(tick,60000);return()=>clearInterval(t)},[])
 const news=(catalog.updates||[]).filter((n:any)=>Date.parse(n.expiresAt)>now),dates=(catalog.upcoming||[]).filter((n:any)=>Date.parse(n.expiresAt)>now&&Date.parse(n.startsAt)>now),activeTab=tab==='dates'&&dates.length>0?'dates':'news',rows=activeTab==='dates'?dates:news
 if(!now||!news.length&&!dates.length)return null
 const move=(direction:number)=>rail.current?.scrollBy({left:direction*rail.current.clientWidth*.8,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'})
 return <section className="ch6-updates" aria-labelledby="club-updates-title"><div className="cv-wrap"><div className="ch6-heading"><div><h2 id="club-updates-title">From the clubs</h2><div className="ch6-tabs" aria-label="Club updates"><button onClick={()=>setTab('news')} aria-pressed={activeTab==='news'}>Club news</button>{dates.length>0&&<button onClick={()=>setTab('dates')} aria-pressed={activeTab==='dates'}>Dates &amp; events</button>}</div></div><div className="ch6-controls"><button onClick={()=>move(-1)} aria-label="Previous club updates">←</button><button onClick={()=>move(1)} aria-label="Next club updates">→</button></div></div><div className="ch6-rail" ref={rail} aria-label={activeTab==='dates'?'Upcoming official club dates':'Recent official club news'}>{rows.slice(0,8).map((n:any)=><article className="ch6-card" key={n.id}><a href={n.url} target="_blank" rel="noopener noreferrer">{n.image&&<div className="ch6-image"><img src={n.image} alt={n.organization+' club news'} loading="lazy"/></div>}<div className="ch6-copy"><span>{n.organization} · {n.city}</span><h3>{n.title}</h3><div className="ch6-date"><time dateTime={n.startsAt||n.publishedOn}>{n.startsAt?new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date(n.startsAt))+' ET':new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',month:'short',day:'numeric'}).format(new Date(n.publishedOn+'T12:00:00Z'))}</time><Icon name="arrow" size={18}/></div>{n.venue&&<p>{n.venue}</p>}</div></a></article>)}</div></div></section>
}
// Owner, Nov 12: the app is for adults in Miami-Dade and Broward, so the crest rail shows those clubs (the app's list).
function ClubBadgeRail({profiles}:any){
 const ref=React.useRef<HTMLDivElement>(null),id=React.useId(),[ends,setEnds]=React.useState({start:true,end:false}),[motion,setMotion]=React.useState(false),[auto,setAuto]=React.useState(false),[hover,setHover]=React.useState(false),[focused,setFocused]=React.useState(false),[visible,setVisible]=React.useState(false),clubs=['miami-sporting-fc','hodler-fc','river-miami-fc','milan-de-miami-fc','117-fc-academy','miramar-supreme-fc','weston-fc','florida-island-united','united-stars','boca-jrs-miami-fc','homestead-fc','asa-itss','futsoc','fort-training-academy'].map(slug=>profiles.find((p:any)=>p.slug===slug&&p.image)).filter(Boolean)
 const running=auto&&motion&&!hover&&!focused&&visible,measure=()=>{const n=ref.current;if(n)setEnds(old=>{const next={start:n.scrollLeft<2,end:n.scrollLeft+n.clientWidth>=n.scrollWidth-2};return old.start===next.start&&old.end===next.end?old:next})}
 React.useEffect(()=>{const n=ref.current;if(!n)return;if(!('IntersectionObserver'in window)){setVisible(true);return}const observer=new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting));observer.observe(n);return()=>observer.disconnect()},[])
 React.useEffect(()=>{const n=ref.current;if(!n)return;measure();const observer=new ResizeObserver(measure);observer.observe(n);return()=>observer.disconnect()},[motion])
 React.useEffect(()=>{const m=matchMedia('(prefers-reduced-motion:reduce)'),update=()=>{setMotion(!m.matches);setAuto(!m.matches)};update();m.addEventListener('change',update);return()=>m.removeEventListener('change',update)},[])
 React.useEffect(()=>{const n=ref.current;if(!n||!running)return;let frame=0,last=0,position=n.scrollLeft;const animate=(time:number)=>{const first=n.querySelector('[data-primary]') as HTMLElement,mirror=n.querySelector('[data-clone]') as HTMLElement;if(!first||!mirror)return;const loop=mirror.offsetLeft-first.offsetLeft;if(last){position+=Math.min(64,time-last)*.022;if(loop>0&&position>=loop)position-=loop;n.scrollLeft=position}last=time;frame=requestAnimationFrame(animate)};frame=requestAnimationFrame(animate);return()=>cancelAnimationFrame(frame)},[running])
 const move=(direction:number)=>{setAuto(false);const n=ref.current;if(n)n.scrollBy({left:direction*n.clientWidth*.8,behavior:motion?'smooth':'auto'})}
 return <section className="ch3-clubs" aria-labelledby={id+'-title'}><div className="cv-wrap"><div className="ch3-strip-head"><div><h2 id={id+'-title'}>South Florida clubs</h2></div><div className="ch3-strip-controls"><button type="button" aria-label="Previous clubs" aria-controls={id} disabled={ends.start} onClick={()=>move(-1)}>←</button>{motion&&<button type="button" aria-label={auto?'Pause badge movement':'Play badge movement'} onClick={()=>setAuto(!auto)}><Icon name={auto?'pause':'play'} size={15}/></button>}<button type="button" aria-label="Next clubs" aria-controls={id} disabled={ends.end} onClick={()=>move(1)}>→</button></div></div><div className="ch3-club-strip" id={id} ref={ref} onScroll={measure} role="list" aria-label="Club profiles" style={{scrollSnapType:motion?'none':'x proximity'}} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} onFocusCapture={()=>setFocused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setFocused(false)}} onPointerDown={()=>setAuto(false)}>{(motion?[0,1]:[0]).flatMap(copy=>clubs.map((p:any)=><div role={copy===0?'listitem':undefined} aria-hidden={copy===1?true:undefined} data-primary={copy===0?'true':undefined} data-clone={copy===1?'true':undefined} key={copy+'-'+p.id}><a href={p.href} tabIndex={copy===1?-1:undefined} aria-label={'Explore '+p.name}><div className="ch3-strip-badge" style={p.background==='dark'?{background:'#173f30'}:undefined}><img src={p.image} alt={copy===0?p.name+' badge':''} loading="lazy"/></div><strong>{p.name}</strong></a></div>))}</div></div></section>
}
/** @framerSupportedLayoutWidth any @framerSupportedLayoutHeight auto */
// "Start here" (Oct 30, owner: bring the pathway page's style to the homepage): big photo cards with live counts and
// the season's key dates. Photos are stills from cleared CC BY creator videos, already hosted for /florida-soccer-pathway.
const START_PHOTOS={walkout:'https://framerusercontent.com/images/ndjreaMo4OjTpwI7hF4XJX7ie4.jpg',teamwalk:'https://framerusercontent.com/images/emRGLDEukqngdqRjV5eFE1UXvY.jpg',huddle:'https://framerusercontent.com/images/jtI4wrlixT74BdJ8NL8c6iVe6A.jpg'}
const startCss=`.ch8-start{padding:56px 0 30px;background:#f5f3e9}.ch8-start h2{font-size:clamp(36px,4.6vw,56px);margin:0 0 8px}.ch8-lead{font-size:16px;line-height:1.6;color:#4c6350;margin:0 0 24px;max-width:600px}
.ch8-grid{display:grid;grid-template-columns:1.25fr 1fr 1fr;gap:16px}.ch8-card{position:relative;display:flex;flex-direction:column;justify-content:flex-end;min-height:380px;border-radius:24px;overflow:hidden;color:#fff!important;text-decoration:none;background:#103f32;isolation:isolate}
.ch8-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2;transition:transform .5s ease}.ch8-card:hover img{transform:scale(1.04)}.ch8-card:after{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,#0b2e2400 25%,#0b2e24cc 62%,#0b2e24 100%)}
.ch8-in{padding:22px 22px 20px;display:flex;flex-direction:column;gap:6px}.ch8-chip{align-self:flex-start;background:#d7ef86;color:#103f32;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;border-radius:6px;padding:6px 9px}
.ch8-num{font-family:var(--cancha-display-font,'Cancha Display'),sans-serif;font-style:italic;font-size:56px;line-height:.95;color:#d7ef86;text-transform:uppercase}.ch8-card b{font-size:24px;line-height:1.15}.ch8-card span.ch8-sub{font-size:14px;line-height:1.45;color:#dbe7d3}.ch8-go{margin-top:6px;font-size:13px;font-weight:800;color:#d7ef86}
.ch8-keys{display:grid;grid-template-columns:auto repeat(4,minmax(0,1fr));gap:12px;margin-top:16px;align-items:stretch}.ch8-keys>p{margin:0;align-self:center;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#5f7457;max-width:120px}
.ch8-key{display:flex;align-items:center;gap:14px;background:#103f32;border-radius:16px;padding:14px 16px;color:#fff!important;text-decoration:none}.ch8-key b{font-family:var(--cancha-display-font,'Cancha Display'),sans-serif;font-style:italic;font-size:34px;line-height:1;color:#d7ef86;min-width:88px;text-transform:uppercase}.ch8-key span{font-size:13px;line-height:1.35}
.ch8-key-calc{background:#d7ef86;color:#103f32!important}.ch8-key-calc b{color:#f55b32}.ch8-credit{font-size:11px;color:#7a856f;margin:12px 0 0}
@media(max-width:900px){.ch8-grid{grid-template-columns:1fr 1fr}.ch8-card:first-child{grid-column:1/-1;min-height:340px}.ch8-keys{grid-template-columns:1fr}.ch8-keys>p{max-width:none}}
@media(max-width:650px){.ch8-start{padding:40px 0 24px}.ch8-grid{grid-template-columns:1fr;gap:12px}.ch8-card{min-height:250px}.ch8-card:first-child{min-height:330px}.ch8-num{font-size:46px}}
@media(prefers-reduced-motion:reduce){.ch8-card img{transition:none}}`
export function StartHere({profiles}:any){
 const events=catalog.items.filter((i:any)=>i.entity==='opportunity').length
 return <section className="ch8-start" aria-label="Start here"><CanchaStyle css={startCss}/><div className="cv-wrap">
  <h2>Start here</h2><p className="ch8-lead">Everything a Florida player or parent needs, in three taps.</p>
  <div className="ch8-grid">
   <a className="ch8-card" href="/florida-soccer-pathway"><img src={START_PHOTOS.walkout+'?scale-down-to=1024'} alt="" loading="lazy"/><div className="ch8-in"><span className="ch8-chip">New · Pathway 101</span><b>Your Florida soccer pathway</b><span className="ch8-sub">Tryouts, ODP, elite leagues and college recruiting, at a glance.</span><span className="ch8-go">See the guide →</span></div></a>
   <a className="ch8-card" href="/explore"><img src={START_PHOTOS.teamwalk+'?scale-down-to=1024'} alt="" loading="lazy"/><div className="ch8-in">{events>0&&<span className="ch8-num">{events}</span>}<b>Tryouts, camps & events</b><span className="ch8-sub">Current listings with dates and official links.</span><span className="ch8-go">Browse →</span></div></a>
   <a className="ch8-card" href="/clubs"><img src={START_PHOTOS.huddle+'?scale-down-to=1024'} alt="" loading="lazy"/><div className="ch8-in">{profiles.length>0&&<span className="ch8-num">{profiles.length}</span>}<b>Clubs & places to play</b><span className="ch8-sub">Search by city or ZIP across Florida.</span><span className="ch8-go">Find a club →</span></div></a>
  </div>
  <div className="ch8-keys"><p>Key dates</p>
   <a className="ch8-key" href="/florida-soccer-pathway#tryouts"><b>May 1</b><span>Earliest Florida club tryouts</span></a>
   <a className="ch8-key" href="/florida-soccer-pathway#odp"><b>Aug</b><span>Florida ODP tryouts (2026)</span></a>
   <a className="ch8-key" href="/florida-soccer-pathway#college"><b>Jun 15</b><span>D1 college contact opens, after sophomore year</span></a>
   <a className="ch8-key ch8-key-calc" href="/florida-soccer-pathway#calc-title"><b>U?</b><span>Age groups changed for 2026-27. Find your player’s in 10 seconds →</span></a>
  </div>
  <p className="ch8-credit">Photos: stills from Lozzz Productionz videos on YouTube (CC BY).</p>
 </div></section>
}
// "Find your game" (Oct 30): a three-tap quiz that ends in a live, filtered directory count and one button. Each answer maps
// to filters the directory already supports; the count comes from the same catalog the results page uses.
const QUIZ_WHO=[['kid','A kid','Under 13'],['teen','A teen','13 to 17'],['adult','An adult','18+']]
const QUIZ_GOAL=[['fun','Have fun','Friends, rec leagues'],['better','Get better','Competitive club team'],['elite','Go elite','Academy, ODP, college path'],['pickup','Just play','Pickup and casual games']]
const QUIZ_CITY=['Miami','Doral','Kendall','Weston','Fort Lauderdale','Anywhere']
export const quizResult=quickStartResult
const quizCss=`.ch9-quiz{padding:30px 0 56px;background:#f5f3e9}.ch9-box{background:#103f32;color:#fff;border-radius:28px;padding:30px;display:grid;grid-template-columns:.9fr 1.1fr;gap:30px;align-items:start;position:relative;overflow:hidden;isolation:isolate}
.ch9-box:before{content:'';position:absolute;right:-120px;top:-120px;width:360px;height:360px;border-radius:50%;border:1px solid #d7ef8626;z-index:-1}.ch9-box h2{color:#fff;font-size:clamp(34px,4.6vw,56px);margin:10px 0 8px}.ch9-box>div>p{color:#cfe0c8;font-size:15px;margin:0}
.ch9-chip{display:inline-block;background:#d7ef86;color:#103f32;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;border-radius:6px;padding:6px 9px}.ch9-steps{display:flex;gap:6px;margin-top:18px}.ch9-steps i{height:5px;flex:1;border-radius:9px;background:#ffffff2e}.ch9-steps i.on{background:#d7ef86}
.ch9-q{font-size:13px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#d7ef86;margin:0 0 12px}.ch9-opts{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
.ch9-opts button{text-align:left;border:1px solid #ffffff33;background:#ffffff12;color:#fff;border-radius:16px;padding:14px 16px;min-height:72px;cursor:pointer;font:inherit;display:flex;flex-direction:column;gap:3px;transition:background .15s,border-color .15s}.ch9-opts button:hover,.ch9-opts button:focus-visible{background:#ffffff24;border-color:#d7ef86;outline:none}
.ch9-opts b{font-size:17px}.ch9-opts span{font-size:12px;color:#cfe0c8}.ch9-back{margin-top:14px;background:none;border:0;color:#cfe0c8;font:inherit;font-size:13px;text-decoration:underline;cursor:pointer;min-height:44px;padding:0}
.ch9-res{background:#f5f3e9;color:#103f32;border-radius:20px;padding:22px}.ch9-res small{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#5f7457}.ch9-res h3{font-size:30px;margin:6px 0 6px;line-height:1.05}.ch9-res p{margin:0 0 14px;font-size:14px;line-height:1.5;color:#33473a}
.ch9-num{font-family:var(--cancha-display-font,'Cancha Display'),sans-serif;font-style:italic;font-size:64px;line-height:.9;color:#f55b32;text-transform:uppercase}.ch9-numl{font-size:13px;font-weight:800;margin-bottom:14px}.ch9-cta{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.ch9-cta a{background:#103f32;color:#fff!important;border-radius:12px;padding:13px 16px;font-size:14px;font-weight:800;text-decoration:none}.ch9-cta a+a{background:transparent;color:#103f32!important;border:2px solid #103f32}
@media(max-width:900px){.ch9-box{grid-template-columns:1fr;gap:20px}}@media(max-width:650px){.ch9-quiz{padding:20px 0 40px}.ch9-box{padding:22px 18px;border-radius:22px}.ch9-opts{grid-template-columns:1fr 1fr}.ch9-opts button{min-height:64px;padding:12px}.ch9-res h3{font-size:26px}.ch9-num{font-size:54px}}
@media(prefers-reduced-motion:reduce){.ch9-opts button{transition:none}}`
// One quiet product panel: the brand display face stays, while answers and results
// share the directory's cream/forest hierarchy. No decorative progress animation.
const quickStartPolish=`.ch9-box{background:#fff;color:#103f32;border:1px solid #dce2d7;border-radius:20px;padding:34px;grid-template-columns:.85fr 1.15fr;gap:40px}.ch9-box:before{display:none}.ch9-box h2{color:#103f32;margin:14px 0 12px}.ch9-box>div>p{color:#536052;font-size:16px;line-height:1.6;max-width:320px}.ch9-chip{background:#edf2e8;color:#365542;font-size:13px;font-weight:600;letter-spacing:0;text-transform:none;padding:7px 11px;border-radius:7px}.ch9-steps{gap:8px;max-width:200px;margin-top:24px}.ch9-steps i{height:3px;background:#e4e9de}.ch9-steps i.on{background:#103f32}.ch9-q{color:#536052;text-transform:none;letter-spacing:0;font-size:15px;font-weight:600;margin-bottom:14px}.ch9-opts{gap:10px}.ch9-opts button{background:#f8f9f5;color:#103f32;border:1px solid #e1e6db;border-radius:12px;padding:17px 18px;min-height:78px}.ch9-opts b{font-size:18px;font-weight:700;letter-spacing:0}.ch9-opts span{font-size:14px;color:#596654}.ch9-opts button:hover,.ch9-opts button:focus-visible{background:#edf3e5;border-color:#527546;outline:2px solid #527546;outline-offset:2px}.ch9-back{color:#496143;font-size:14px}.ch9-res{background:#f5f7ef;border:1px solid #e1e6d8;border-radius:14px;padding:24px}.ch9-res small{text-transform:none;letter-spacing:0;font-size:13px;font-weight:600}.ch9-res h3{font-size:30px;line-height:1.15;margin:10px 0}.ch9-res p{font-size:15px;line-height:1.55;color:#536052}.ch9-num{color:#103f32}.ch9-numl{font-size:14px;font-weight:600;margin-top:5px}.ch9-cta{gap:12px}.ch9-cta a{font-size:14px;font-weight:600;border-radius:9px;min-height:44px;display:inline-flex;align-items:center}.ch9-cta a+a{border-width:1px}.ch9-cta a:focus-visible,.ch9-back:focus-visible{outline:2px solid #527546;outline-offset:3px}@media(max-width:900px){.ch9-box{grid-template-columns:1fr;gap:24px}}@media(max-width:650px){.ch9-box{padding:24px 20px;border-radius:16px}.ch9-box h2{font-size:42px}.ch9-opts{grid-template-columns:1fr 1fr}.ch9-opts button{padding:14px 12px;min-height:76px}.ch9-opts b{font-size:17px}.ch9-opts span{font-size:13px}.ch9-res{padding:20px}.ch9-res h3{font-size:28px}.ch9-cta{align-items:stretch;flex-direction:column}.ch9-cta a{justify-content:center;text-align:center}}`
export function FindYourGame({profiles}:any){
 const[who,setWho]=React.useState(''),[goal,setGoal]=React.useState(''),[city,setCity]=React.useState(''),step=!who?0:!goal?1:!city?2:3
 const res=step===3?quizResult(who,goal):null,place=city==='Anywhere'?'':city,matches=res?filterDiscovery(profiles,{...res.filters,city:place}).length:0,all=res?filterDiscovery(profiles,res.filters).length:0
 const reset=()=>{setWho('');setGoal('');setCity('')},back=()=>step===3?setCity(''):step===2?setGoal(''):setWho('')
 const opts=(list:any[],pick:any)=><div className="ch9-opts">{list.map(([v,t,d]:any)=><button key={v} type="button" onClick={()=>pick(v)}><b>{t}</b><span>{d}</span></button>)}</div>
 return <section className="ch9-quiz" aria-labelledby="quiz-title"><CanchaStyle css={quizCss+quickStartPolish}/><div className="cv-wrap"><div className="ch9-box">
  <div><span className="ch9-chip">{step===3?'Your results':`Step ${step+1} of 3`}</span><h2 id="quiz-title">Find your game</h2><p>Choose who’s playing, the kind of soccer and a city.</p><div className="ch9-steps" aria-hidden="true">{[0,1,2].map(i=><i key={i} className={step>i?'on':''}/>)}</div></div>
  <div aria-live="polite">{step===0&&<><p className="ch9-q">Who’s playing?</p>{opts(QUIZ_WHO,setWho)}</>}
   {step===1&&<><p className="ch9-q">What do you want?</p>{opts(QUIZ_GOAL,setGoal)}</>}
   {step===2&&<><p className="ch9-q">Where?</p>{opts(QUIZ_CITY.map(c=>[c,c,c==='Anywhere'?'All of Florida':'City listings']),setCity)}</>}
   {res&&<div className="ch9-res"><small>Options to explore</small><h3>{res.title}</h3><p>{res.why}</p>
    {matches>0?<><div className="ch9-num">{matches}</div><div className="ch9-numl">{matches===1?'match':'matches'} {place?'in '+place:'in Florida'}</div></>:<p><b>No exact matches listed in {place} yet.</b> {all>0?all+' across Florida.':''}</p>}
    <div className="ch9-cta"><a href={discoveryHref('/clubs',{},{...res.filters,city:matches>0?place:''})}>See {matches>0?'them':'Florida options'} →</a>{res.guide&&<a href={res.guide[1]}>{res.guide[0]}</a>}</div></div>}
   {step>0&&<button className="ch9-back" type="button" onClick={step===3?reset:back}>{step===3?'Start over':'← Back'}</button>}</div>
 </div></div></section>
}
// "How Cancha works" as three visual step tiles (Oct 30: visuals first). Same three steps and copy as before, shorter.
const howCss=`.ch10-how{padding:52px 0;background:#e6eedd}.ch10-how h2{font-size:clamp(32px,4.2vw,50px);margin:0 0 22px}.ch10-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;list-style:none;margin:0;padding:0;counter-reset:s}
.ch10-step{position:relative;background:#fff;border-radius:22px;padding:22px;min-height:210px;display:flex;flex-direction:column;gap:10px;overflow:hidden}.ch10-step:nth-child(2){background:#103f32;color:#fff}.ch10-step:nth-child(3){background:#d7ef86}
.ch10-n{position:absolute;right:14px;top:-8px;font-family:var(--cancha-display-font,'Cancha Display'),sans-serif;font-style:italic;font-size:120px;line-height:1;color:#103f3214}.ch10-step:nth-child(2) .ch10-n{color:#ffffff1c}
.ch10-ic{width:52px;height:52px;border-radius:16px;display:grid;place-items:center;background:#103f32;color:#d7ef86}.ch10-step:nth-child(2) .ch10-ic{background:#d7ef86;color:#103f32}
.ch10-step h3{font-size:22px;margin:4px 0 0;line-height:1.15}.ch10-step p{margin:0;font-size:14px;line-height:1.5;opacity:.85}.ch10-go{margin-top:auto;font-size:13px;font-weight:800;color:inherit!important;text-decoration:none}
@media(max-width:900px){.ch10-steps{grid-template-columns:1fr}.ch10-step{min-height:0}}@media(max-width:650px){.ch10-how{padding:36px 0}.ch10-n{font-size:96px}}`
export function HowItWorks(){
 return <section className="ch10-how" aria-label="How Cancha works"><CanchaStyle css={howCss}/><div className="cv-wrap"><h2>How Cancha works</h2><ol className="ch10-steps">
  <li className="ch10-step"><span className="ch10-n" aria-hidden="true">1</span><span className="ch10-ic"><Icon name="search" size={26}/></span><h3>Search your area</h3><p>City or ZIP. Add age and level if you want.</p><a className="ch10-go" href="/clubs">Start searching →</a></li>
  <li className="ch10-step"><span className="ch10-n" aria-hidden="true">2</span><span className="ch10-ic"><Icon name="filters" size={26}/></span><h3>Compare your options</h3><p>Programs, age groups and the official source for each.</p><a className="ch10-go" href="/explore">See tryouts & camps →</a></li>
  <li className="ch10-step"><span className="ch10-n" aria-hidden="true">3</span><span className="ch10-ic"><Icon name="club" size={26}/></span><h3>Contact the club</h3><p>Use the club’s own site to confirm spaces, prices and how to join.</p><a className="ch10-go" href="/florida-soccer-pathway">Know the dates first →</a></li>
 </ol></div></section>
}
// <waitlist> "Find me a team" (owner, Nov 21: demand test; app migration 0008, intent 'team' + position + level, matched by hand). Was the app waitlist (owner, Nov 4: email, area, role). English first; Spanish only when the visitor taps the switch (owner, Nov 5). Rows go to the app's Supabase table, which accepts inserts only
// (no one can read it back through the API). The publishable key is public by design; RLS is the guard. Nothing is logged.
const WAITLIST={url:'https://ipyaljmbumgvnpkjnbag.supabase.co/rest/v1/waitlist',key:'sb_publishable_XGeHJnRGPPVyrLQYwTAeKg_hwxBC5ps'}
const WL_AREAS=['Miami','Doral','Kendall','Hialeah','Miami Beach','Fort Lauderdale','Hollywood','Pembroke Pines','Weston','Coral Springs']
const WL_TEXT:any={
 en:{kicker:'Free · Miami-Dade + Broward',title:'Find your team in Miami.',lead:'New in town, between teams, or ready for a step up? Tell us what you play. We match you with clubs looking for players like you and email you within 2 days.',points:[['people','Tell us what you play','Position, level and area. One minute.'],['club','We find clubs that fit','Clubs in Miami-Dade and Broward that are looking for players.'],['pitch','You go play','Tryouts, training and match days, straight from the club.']],email:'Email',area:'Area',other:'Other area',position:'Position',positions:{Any:'Anywhere',Goalkeeper:'Goalkeeper',Defender:'Defender',Midfielder:'Midfielder',Forward:'Forward'},level:'Level',levels:{Casual:'Casual',Intermediate:'Intermediate',Competitive:'Competitive'},adult:'I’m 18 or older.',consent:'Email me clubs that fit, and Cancha app news.',join:'Find me a team',sending:'Sending…',done:'We’re on it.',doneLead:'We’ll email you clubs that fit within 2 days.',bad:'Check your email address.',fail:'That didn’t go through. Try again in a minute.',privacy:'We only use your email to send you teams and Cancha news.',switch:'Español'},
 es:{kicker:'Gratis · Miami-Dade + Broward',title:'Encontrá tu equipo en Miami.',lead:'¿Nuevo en la ciudad, sin equipo o con ganas de subir de nivel? Contanos qué jugás. Te conectamos con clubes que buscan jugadores como vos y te escribimos en 2 días.',points:[['people','Contanos qué jugás','Posición, nivel y zona. Un minuto.'],['club','Buscamos clubes para vos','Clubes de Miami-Dade y Broward que buscan jugadores.'],['pitch','Vas y jugás','Pruebas, entrenamientos y partidos, directo con el club.']],email:'Correo',area:'Zona',other:'Otra zona',position:'Posición',positions:{Any:'Donde sea',Goalkeeper:'Arquero',Defender:'Defensor',Midfielder:'Mediocampista',Forward:'Delantero'},level:'Nivel',levels:{Casual:'Recreativo',Intermediate:'Intermedio',Competitive:'Competitivo'},adult:'Tengo 18 años o más.',consent:'Mandame clubes que encajen y novedades de Cancha.',join:'Buscame equipo',sending:'Enviando…',done:'Estamos en eso.',doneLead:'Te mandamos clubes que encajan en 2 días.',bad:'Revisá tu correo.',fail:'No se pudo enviar. Probá de nuevo en un minuto.',privacy:'Usamos tu correo solo para mandarte equipos y novedades de Cancha.',switch:'English'}}
export function waitlistRow(form:any,lang:string,source:string){
 const email=String(form.email||'').trim().toLowerCase()
 if(email.length<6||email.length>254||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return null
 const area=WL_AREAS.includes(form.area)?form.area:'Other'
 const position=['Any','Goalkeeper','Defender','Midfielder','Forward'].includes(form.position)?form.position:'Any',level=['Casual','Intermediate','Competitive'].includes(form.level)?form.level:null
 return{email,area,role:'player',lang:lang==='es'?'es':'en',source:/^[a-z0-9_-]{1,40}$/.test(source)?source:'site',consent:true,intent:'team',position,level}
}
const waitlistCss=`.ch11-app{background:#103f32;color:#f5f3e9;padding:56px 0;border-bottom:1px solid #254e39}.ch11-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}.ch11-kicker{display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:14px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#d7ef86;margin-bottom:14px}.ch11-kicker button{background:none;border:1px solid #f5f3e955;color:#f5f3e9;border-radius:999px;padding:6px 14px;min-height:36px;font-size:14px;letter-spacing:0;text-transform:none;cursor:pointer}.cancha-v2 .ch11-app h2{font-family:'Cancha Display','Arial Narrow',sans-serif;font-style:italic;text-transform:uppercase;font-size:clamp(52px,6vw,88px);line-height:.92;letter-spacing:-.01em;color:#f5f3e9}.ch11-lead{font-size:17px;line-height:1.5;color:#d0dfc5;margin:16px 0 0;max-width:460px}.ch11-points{list-style:none;padding:0;margin:24px 0 0;display:grid;gap:14px;max-width:480px}.ch11-points li{display:flex;gap:14px;align-items:flex-start}.ch11-points li>span{flex:none;display:grid;place-items:center;width:44px;height:44px;border-radius:12px;background:#d7ef86;color:#103f32}.ch11-points strong{display:block;font-size:17px;color:#f5f3e9}.ch11-points small{display:block;font-size:15px;line-height:1.45;color:#b9c8bf}.ch11-form{display:grid;gap:12px;background:#ffffff0d;border:1px solid #f5f3e92b;border-radius:18px;padding:22px}.ch11-form label{display:grid;gap:6px;font-size:14px;font-weight:650;color:#d0dfc5}.ch11-form input[type=email],.ch11-form select{min-height:50px;border-radius:10px;border:1px solid #f5f3e940;background:#0b2e24;color:#f5f3e9;padding:0 14px;font-size:16px}.ch11-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}.ch11-form .ch11-check{display:flex;gap:10px;align-items:center;font-weight:550}.ch11-check input{width:20px;height:20px;accent-color:#d7ef86}.ch11-form .cv-btn{background:#d7ef86;border-color:#d7ef86;color:#103f32!important;font-size:16px;font-weight:800;min-height:54px}.ch11-form .cv-btn[disabled]{opacity:.6;cursor:wait}.ch11-note{font-size:14px;color:#b9c8bf;margin:0}.ch11-error{font-size:14px;color:#ffc6ad;margin:0}.ch11-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}.ch11-done{display:grid;gap:8px;background:#d7ef86;color:#103f32;border-radius:18px;padding:28px}.ch11-done strong{font-family:'Cancha Display','Arial Narrow',sans-serif;font-style:italic;text-transform:uppercase;font-size:44px;line-height:1}.ch11-done span{font-size:16px;font-weight:600}
@media(max-width:800px){.ch11-app{padding:40px 0}.ch11-grid{grid-template-columns:1fr;gap:24px}.ch11-row{grid-template-columns:1fr}.ch11-form{padding:16px}}`
function AppWaitlist(){
 const[lang,setLang]=React.useState('en'),[source,setSource]=React.useState('site'),[form,setForm]=React.useState<any>({email:'',area:'Miami',position:'Any',level:'Intermediate',adult:false,consent:false,hp:''}),[state,setState]=React.useState('idle')
 React.useEffect(()=>{try{const q=new URLSearchParams(window.location.search);setSource((q.get('src')||q.get('utm_source')||'site').toLowerCase().slice(0,40))}catch{}},[])
 const t=WL_TEXT[lang]
 const submit=async(e:any)=>{e.preventDefault();if(state==='sending')return
  if(form.hp){setState('done');return}
  const row=waitlistRow(form,lang,source);if(!row){setState('bad');return}
  setState('sending')
  try{const r=await fetch(WAITLIST.url,{method:'POST',headers:{apikey:WAITLIST.key,Authorization:'Bearer '+WAITLIST.key,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(row)});setState(r.ok?'done':'fail')}catch{setState('fail')}}
 return <section className="ch11-app" id="app" aria-labelledby="app-waitlist-title" lang={lang}><CanchaStyle css={waitlistCss}/><div className="cv-wrap ch11-grid">
  <div><div className="ch11-kicker"><span>{t.kicker}</span><button type="button" onClick={()=>setLang(lang==='es'?'en':'es')}>{t.switch}</button></div><h2 id="app-waitlist-title">{t.title}</h2><p className="ch11-lead">{t.lead}</p><ul className="ch11-points">{t.points.map(([icon,h,d]:any)=><li key={h}><span><Icon name={icon} size={22}/></span><div><strong>{h}</strong><small>{d}</small></div></li>)}</ul></div>
  {state==='done'?<div className="ch11-done" role="status"><strong>{t.done}</strong><span>{t.doneLead}</span></div>:
  <form className="ch11-form" onSubmit={submit} noValidate>
   <label>{t.email}<input type="email" name="email" autoComplete="email" inputMode="email" required maxLength={254} value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
   <div className="ch11-row"><label>{t.area}<select name="area" value={form.area} onChange={e=>setForm({...form,area:e.target.value})}>{WL_AREAS.map(a=><option key={a} value={a}>{a}</option>)}<option value="Other">{t.other}</option></select></label>
   <label>{t.position}<select name="position" value={form.position} onChange={e=>setForm({...form,position:e.target.value})}>{Object.entries(t.positions).map(([k,v]:any)=><option key={k} value={k}>{v}</option>)}</select></label></div>
   <label>{t.level}<select name="level" value={form.level} onChange={e=>setForm({...form,level:e.target.value})}>{Object.entries(t.levels).map(([k,v]:any)=><option key={k} value={k}>{v}</option>)}</select></label>
   <div className="ch11-hp" aria-hidden="true"><label>Company<input tabIndex={-1} autoComplete="off" value={form.hp} onChange={e=>setForm({...form,hp:e.target.value})}/></label></div>
   <label className="ch11-check"><input type="checkbox" required checked={form.adult} onChange={e=>setForm({...form,adult:e.target.checked})}/>{t.adult}</label>
   <label className="ch11-check"><input type="checkbox" required checked={form.consent} onChange={e=>setForm({...form,consent:e.target.checked})}/>{t.consent}</label>
   {state==='bad'&&<p className="ch11-error" role="alert">{t.bad}</p>}{state==='fail'&&<p className="ch11-error" role="alert">{t.fail}</p>}
   <button className="cv-btn" type="submit" disabled={state==='sending'||!form.consent||!form.adult}>{state==='sending'?t.sending:t.join}<Icon name="arrow" size={17}/></button>
   <p className="ch11-note">{t.privacy}</p>
  </form>}
 </div></section>
}
// </waitlist>
// <for-clubs> Cancha for Clubs (owner, Nov 13: all in on teams; clubs get a free page, openings, spotlights and sponsor help).
// Replaces the plain "Run a club?" band. Claims still go to the existing private form on /organizations; nothing new collects data here.
const forClubsCss=`.ch12-clubs{background:#07130f;color:#f5f3e9;padding:60px 0}.ch12-kick{font-size:14px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#d7ef86}.cancha-v2 .ch12-clubs h2{font-family:'Cancha Display','Arial Narrow',sans-serif;font-style:italic;text-transform:uppercase;font-size:clamp(46px,7vw,92px);line-height:.92;letter-spacing:-.01em;color:#f5f3e9;margin:12px 0 14px}.ch12-clubs h2 span{color:#d7ef86}.ch12-lead{max-width:600px;color:#cfdcd2;font-size:17px;line-height:1.55;margin:0}
.ch12-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin:30px 0 28px;list-style:none;padding:0}.ch12-grid li{background:#12261f;border:1px solid #23423a;border-radius:20px;padding:20px;display:flex;flex-direction:column;gap:8px}.ch12-tag{align-self:flex-start;font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;background:#d7ef86;color:#103f32;border-radius:999px;padding:4px 10px}.ch12-tag.alt{background:#f55b32;color:#fff}.ch12-grid strong{font-size:20px;line-height:1.15;color:#f5f3e9}.ch12-grid p{margin:0;font-size:14px;line-height:1.5;color:#a9bab2}
.ch12-actions{display:flex;flex-wrap:wrap;gap:12px;align-items:center}.ch12-clubs .cv-btn{background:#d7ef86!important;color:#103f32!important;border-color:#d7ef86!important}.ch12-ig{display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border:1px solid #f5f3e955;border-radius:999px;color:#f5f3e9!important;text-decoration:none;font-weight:700}.ch12-note{margin:14px 0 0;font-size:13px;color:#9fb3ab}
@media(max-width:900px){.ch12-grid{grid-template-columns:1fr 1fr}}@media(max-width:650px){.ch12-clubs{padding:40px 0}.ch12-grid{grid-template-columns:1fr;gap:10px}.ch12-lead{font-size:16px}}`
const CLUB_OFFERS=[['Free','Your club page','Crest, league, city and your link, in the app and on the web.'],['Free','Players ask to join','Post an opening: a keeper, a sub, a tryout night. Players ask, your captain says yes.'],['Free','Club spotlights','Videos about your club on our Instagram, with your club tagged.'],['When you\u2019re ready','Sponsors that fit','A free media kit, and research on local businesses that fit your club. You decide what to sign.']]
export function ForClubs({count}:{count:number}){
 return <section className="ch12-clubs" id="for-clubs" aria-labelledby="for-clubs-title"><CanchaStyle css={forClubsCss}/><div className="cv-wrap">
  <span className="ch12-kick">Cancha for Clubs · Miami-Dade + Broward</span>
  <h2 id="for-clubs-title">Your club, seen.<br/><span>Your players, found.</span></h2>
  <p className="ch12-lead">{count>0?count.toLocaleString('en-US')+' Florida clubs and places are already listed. ':''}Claim your club to keep it current and start getting players who are looking for a team.</p>
  <ul className="ch12-grid">{CLUB_OFFERS.map(([tag,h,d],i)=><li key={h}><span className={'ch12-tag'+(i===3?' alt':'')}>{tag}</span><strong>{h}</strong><p>{d}</p></li>)}</ul>
  <div className="ch12-actions"><a className="cv-btn" href="/organizations#submission">Claim or add your club <Icon name="arrow" size={17}/></a><a className="ch12-ig" href="https://www.instagram.com/wearecancha/" target="_blank" rel="noopener">DM @wearecancha</a></div>
  <p className="ch12-note">A listing is not a partnership or endorsement. Outside Florida? <a href="/organizations?submission=Next-state%20club%20nomination#submission" style={{color:'#d7ef86'}}>Suggest your city</a></p>
 </div></section>
}
// </for-clubs>
// <start> Owner, Nov 13: the bio link should not feel messy. One clear first screen: who it is for, a wall of real
// South Florida club crests, and two buttons. Players find their club; clubs claim theirs. Everything else follows below.
const SOFLA_CITIES=['Miami','Doral','Hialeah','Kendall','Homestead','Miami Gardens','Miami Beach','Miramar','Weston','Fort Lauderdale','Hollywood','Pembroke Pines','Plantation','Sunrise','Coral Springs','Margate','Davie','Coconut Creek','Pompano Beach','Cutler Bay','Palmetto Bay','North Miami','Aventura','Sweetwater','Tamarac','Lauderhill','Deerfield Beach']
const findStartCss=`.ch14-start{position:relative;overflow:hidden;background:radial-gradient(120% 90% at 50% 100%,#1c5a47 0%,#103f32 42%,#07130f 100%);color:#f5f3e9;padding:64px 0 56px;isolation:isolate}
.ch14-grid{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center}.ch14-kick{font-size:14px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#d7ef86}
.cancha-v2 .ch14-start h1{font-family:'Cancha Display','Arial Narrow',sans-serif;font-style:italic;text-transform:uppercase;font-size:clamp(58px,7vw,100px);line-height:.9;letter-spacing:-.01em;color:#f5f3e9;margin:14px 0 18px}.ch14-start h1 span{color:#d7ef86;display:block}
.ch14-lead{font-size:18px;line-height:1.5;color:#cfdcd2;max-width:440px;margin:0 0 26px}.ch14-ctas{display:flex;flex-wrap:wrap;gap:12px}
.ch14-btn{display:inline-flex;align-items:center;gap:10px;min-height:54px;padding:0 24px;border-radius:999px;font-family:'Cancha Display','Arial Narrow',sans-serif;font-style:italic;text-transform:uppercase;font-size:24px;text-decoration:none!important;transition:transform .15s ease}
.ch14-btn:active{transform:scale(.97)}.ch14-btn.main{background:#d7ef86;color:#103f32!important}.ch14-btn.alt{border:1.5px solid #f5f3e966;color:#f5f3e9!important}.ch14-btn:focus-visible{outline:3px solid #f55b32;outline-offset:3px}
.ch14-count{margin:18px 0 0;font-size:14px;color:#9fb3ab}.ch14-count strong{color:#d7ef86}
.ch14-wall{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px}.ch14-wall a{aspect-ratio:1;display:grid;place-items:center;border-radius:22px;background:#fff;box-shadow:0 10px 24px #0005;overflow:hidden;transition:transform .2s ease,background .2s ease}
.ch14-wall a:hover{transform:translateY(-3px)}.ch14-wall img{width:82%;height:82%;object-fit:contain}
@media(prefers-reduced-motion:no-preference){.ch14-wall a{animation:ch14In .5s cubic-bezier(.2,1.4,.5,1) both}}@keyframes ch14In{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:none}}
@media(max-width:900px){.ch14-grid{grid-template-columns:1fr;gap:28px}.ch14-start{padding:36px 0 40px}.ch14-wall{grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;order:2}.ch14-wall a{border-radius:16px}.ch14-btn{flex:1 1 100%;justify-content:center;font-size:22px}.ch14-lead{font-size:16px}}`
export function FindYourClubStart({profiles}:any){
 const local=profiles.filter((p:any)=>p.image&&SOFLA_CITIES.includes(p.city)),wall=local.slice(0,15)
 return <section className="ch14-start" aria-labelledby="start-title"><CanchaStyle css={findStartCss}/><div className="cv-wrap ch14-grid">
  <div><span className="ch14-kick">Miami-Dade + Broward soccer</span><h1 id="start-title">Find your club.<span>Find your people.</span></h1>
   <p className="ch14-lead">Clubs, teams and games near you, in one place. Run a club? Claim your page and get found.</p>
   <div className="ch14-ctas"><a className="ch14-btn main" href="/clubs">Find your club <Icon name="arrow" size={20}/></a><a className="ch14-btn alt" href="#for-clubs">Claim or add your club</a></div>
   {local.length>0&&<p className="ch14-count"><strong>{local.length}</strong> South Florida clubs and places listed</p>}</div>
  {wall.length>0&&<div className="ch14-wall" aria-label="South Florida clubs on Cancha">{wall.map((p:any,i:number)=><a key={p.id} href={p.href} style={{animationDelay:(i*40)+'ms'}} aria-label={p.name}><img src={p.image} alt="" loading={i<10?'eager':'lazy'} decoding="async"/></a>)}</div>}
 </div></section>
}
// </start>
// <home15> Owner, Nov 18: "more minimalistic, fix what looks like AI, use our typography, easy to scroll, show the
// clubs on Cancha and the other options; right now there's a lot going on." One idea per screen: the promise and the
// waitlist, the clubs, how the app works, Cancha for Clubs, the waitlist form, then plain links to the rest of the site.
// Brand type only: Cancha Display (italic Barlow Condensed) for headlines, upright Barlow Condensed for everything else.
// The app launches on the App Store, so the primary action is the existing private waitlist form.
const HOME_CLUBS=['miami-united-fc','river-miami-fc','boca-jrs-miami-fc','fc-miami-city','florida-soccer-soldiers','cyclones-fc','athletum-miami-fc','milan-de-miami-fc','miami-sporting-fc','hodler-fc','117-fc-academy','florida-island-united','united-stars','dade-county-fc','strikers-miami-first-team','florida-futbol-club','futsoc','miramar-supreme-fc','weston-fc','homestead-fc','empire-sc','plantation-fc','asa-primera','fort-lauderdale-solaiya-fc','florida-elite-fc-esp','fort-training-academy','asa-itss']
export function homeClubs(profiles:any[]){
 const seen=new Set<string>(),out:any[]=[]
 const key=(p:any)=>String(p.slug||p.id||'').toLowerCase()
 for(const slug of HOME_CLUBS){const p=profiles.find((x:any)=>x.image&&(key(x)===slug||String(x.href||'').endsWith('/'+slug)));if(!p)continue
  const img=String(p.image).split('?')[0],name=String(p.name||'').toLowerCase().replace(/[^a-z0-9]/g,'');if(seen.has(img)||seen.has(name))continue;seen.add(img);seen.add(name);out.push(p)}
 return out
}
const homeFont=`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&display=swap');`
// <open-now> Real, sourced sign-ups (Nov 25). Same entries as the app's src/openings.ts (checked Nov 18): each links to the
// organizer's own page or post and hides itself after `until`. Keep the two lists in sync; never add an unsourced opening.
const OPEN_NOW=[
 {org:'Miami United FC',need:'Open Talent ID',when:'Open now',area:'Hialeah',note:'UPSL club · details on their post',url:'https://www.instagram.com/p/DfnT040By1V/',until:'2026-12-11'},
 {org:'South Florida Club Sport',need:"Men's 7v7",when:'Tue · from Jan 5',area:'Coconut Creek',note:'Solo players placed on a team · $80',url:'https://www.southfloridaclubsport.com/sign-up/198165/start/Individual',until:'2027-01-05'},
 {org:'South Florida Club Sport',need:'Coed 6v6',when:'Fri · from Jan 8',area:'Miami Beach',note:'Solo players placed on a team · $95',url:'https://www.southfloridaclubsport.com/sign-up/196387/start/Individual',until:'2027-01-08'},
 {org:'South Florida Club Sport',need:'Coed 7v7',when:'Mon · from Jan 25',area:'Lauderhill',note:'Solo players placed on a team · $75',url:'https://www.southfloridaclubsport.com/sign-up/198894/start/Individual',until:'2027-01-25'},
 {org:'South Florida Club Sport',need:"Men's 7v7",when:'Wed · from Jan 27',area:'Coconut Creek',note:'Solo players placed on a team · $80',url:'https://www.southfloridaclubsport.com/sign-up/199503/start/Individual',until:'2027-01-27'},
]
export const openNow=(today:string)=>OPEN_NOW.filter(o=>o.until>=today)
const openCss=`.h15-open a{flex:0 0 300px;scroll-snap-align:start;display:flex;flex-direction:column;gap:8px;background:#12261f;border:1px solid #23423a;border-radius:20px;padding:20px;color:var(--c);text-decoration:none}.h15-open small{font-size:15px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--l)}.h15-open b{font-family:'Cancha Display','Barlow Condensed',sans-serif;font-style:italic;font-size:34px;line-height:1;text-transform:uppercase}.h15-open span{font-size:18px;font-weight:600}.h15-open em{font-style:normal;font-size:15px;color:var(--m)}.h15-open i{margin-top:auto;font-style:normal;font-size:15px;font-weight:700;color:var(--l)}.h15-sub{font-size:18px;color:var(--m);margin:-10px 0 18px}@media(max-width:600px){.h15-open a{flex-basis:260px}}`
// </open-now>
const homeCss=`.h15{--f:#103f32;--n:#07130f;--c:#f5f3e9;--l:#d7ef86;--o:#f55b32;--m:#9fb3ab;background:var(--n);color:var(--c);font-family:'Barlow Condensed','Arial Narrow',sans-serif;overflow-x:clip}
.h15 *{box-sizing:border-box}.h15 a{color:inherit;text-decoration:none}.h15-w{max-width:1120px;margin:0 auto;padding:0 20px}
.h15 h1,.h15 h2{font-family:'Cancha Display','Barlow Condensed','Arial Narrow',sans-serif;font-style:italic;font-weight:700;text-transform:uppercase;margin:0;letter-spacing:-.01em}
.h15-k{font-size:16px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--l)}
.h15-hero{background:var(--f);padding:72px 0 64px}.h15-hero h1{font-size:clamp(64px,9vw,128px);line-height:.88;margin:16px 0 22px}.h15-hero h1 span{display:block;color:var(--l)}
.h15-lead{font-size:clamp(19px,2vw,23px);font-weight:500;line-height:1.3;color:#d9e4dc;max-width:520px;margin:0 0 30px}
.h15-ctas{display:flex;flex-wrap:wrap;gap:12px}.h15-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:56px;padding:0 28px;border-radius:16px;font-size:21px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;transition:transform .15s ease}
.h15-btn:active{transform:scale(.97)}.h15-btn.main{background:var(--l);color:var(--f)!important}.h15-btn.alt{border:1.5px solid #f5f3e955}.h15-btn:focus-visible,.h15-row a:focus-visible,.h15-more a:focus-visible{outline:3px solid var(--o);outline-offset:3px}
.h15-sec{padding:56px 0}.h15-head{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;margin-bottom:22px}.h15-head h2{font-size:clamp(40px,5vw,64px);line-height:.9}.h15-all{font-size:18px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--l);white-space:nowrap}
.h15-row{display:flex;gap:18px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 20px;padding:4px 20px 12px;margin:0 -20px;scrollbar-width:none}.h15-row::-webkit-scrollbar{display:none}
.h15-row a{flex:0 0 112px;scroll-snap-align:start;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center}
.h15-crest{width:96px;height:96px;border-radius:50%;background:#fff;display:grid;place-items:center;overflow:hidden;transition:transform .2s ease}.h15-row a:hover .h15-crest{transform:translateY(-3px)}.h15-crest img{width:78%;height:78%;object-fit:contain}
.h15-row b,.h15-row small{width:100%}.h15-row b{font-size:17px;font-weight:700;line-height:1.1}.h15-row small{font-size:15px;color:var(--m);font-weight:500;margin-top:-6px}
.h15-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;list-style:none;margin:0;padding:0}.h15-steps li{background:var(--f);border-radius:24px;padding:24px;display:flex;flex-direction:column;gap:10px;min-height:300px}
.h15-n{font-family:'Cancha Display',sans-serif;font-style:italic;font-weight:700;font-size:44px;line-height:1;color:var(--l)}.h15-steps strong{font-size:28px;font-weight:700;text-transform:uppercase;line-height:1}.h15-steps p{margin:0;font-size:19px;line-height:1.3;color:#cfdcd2;font-weight:500}
.h15-ui{margin-top:auto;background:var(--n);border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:8px}.h15-ui .r{display:flex;justify-content:space-between;border-top:1px solid #ffffff1a;padding-top:8px;font-size:16px;font-weight:600;text-transform:uppercase}.h15-ui .r span{color:var(--m)}.h15-ui .r em{font-style:normal;color:var(--l)}
.h15-ui .big{font-family:'Cancha Display',sans-serif;font-style:italic;font-weight:700;font-size:30px;text-transform:uppercase}.h15-ok{background:var(--l);color:var(--f);border-radius:12px;padding:10px;text-align:center;font-weight:700;font-size:17px;letter-spacing:.06em;text-transform:uppercase}
.h15-bub{max-width:85%;border-radius:16px;padding:10px 14px;font-size:17px;font-weight:600}.h15-bub.them{background:#16211c}.h15-bub.me{background:var(--l);color:var(--f);align-self:flex-end}
.h15-ui.h15-mini{flex-direction:row;flex-wrap:wrap;gap:8px}.h15-mini img{width:44px;height:44px;border-radius:50%;background:#fff;object-fit:contain;padding:4px}
.h15-clubs2{background:var(--l);color:var(--f)}.h15-clubs2 h2{font-size:clamp(46px,6vw,80px);line-height:.9}.h15-clubs2 h2 span{display:block;color:var(--o)}.h15-list{list-style:none;padding:0;margin:26px 0 30px;display:grid;grid-template-columns:1fr 1fr;gap:12px 28px;max-width:760px}
.h15-list li{font-size:21px;font-weight:600;line-height:1.25;display:flex;gap:10px}.h15-list li:before{content:'';flex:0 0 10px;height:10px;margin-top:8px;border-radius:50%;background:var(--f)}.h15-clubs2 .h15-btn.main{background:var(--f);color:var(--l)!important}.h15-clubs2 .h15-btn.alt{border-color:#103f3366}
.h15-more{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.h15-more a{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:20px 22px;border-radius:18px;background:#0f1d18;font-size:22px;font-weight:700;text-transform:uppercase;letter-spacing:.02em;transition:background .15s ease}.h15-more a:hover{background:#16281f}.h15-more a svg{color:var(--l);flex:0 0 auto}
.h15-wl .ch11-app{border-bottom:0}.h15-wl h2,.h15-wl .ch11-lead,.h15-wl label,.h15-wl .ch11-kicker,.h15-wl button,.h15-wl .ch11-note,.h15-wl li{font-family:'Barlow Condensed','Arial Narrow',sans-serif}
@media(max-width:860px){.h15-steps{grid-template-columns:1fr}.h15-steps li{min-height:0}.h15-more{grid-template-columns:1fr}.h15-list{grid-template-columns:1fr}}
@media(max-width:600px){.h15-hero{padding:44px 0 44px}.h15-btn{flex:1 1 100%}.h15-sec{padding:44px 0}.h15-row a{flex-basis:96px}.h15-crest{width:84px;height:84px}}
@media(prefers-reduced-motion:reduce){.h15-btn,.h15-crest,.h15-more a{transition:none}}`
/** @framerSupportedLayoutWidth any @framerSupportedLayoutHeight auto */
export default function CanchaHome(){
 const profiles=catalog.items.filter((i:any)=>i.entity==='profile'),clubs=homeClubs(profiles)
 return <main className="cancha-v2 h15"><CanchaStyle css={homeFont+ui+homeCss}/>
  <section className="h15-hero" aria-labelledby="h15-title"><div className="h15-w">
   <span className="h15-k">Miami-Dade + Broward soccer</span>
   <h1 id="h15-title">Find your team.<span>Find your people.</span></h1>
   <p className="h15-lead">Clubs, open tryouts and teammates across Miami-Dade and Broward. Tell us what you play and we’ll match you with clubs that fit. Free.</p>
   <div className="h15-ctas"><a className="h15-btn main" href="#waitlist">Find me a team <Icon name="arrow" size={20}/></a><a className="h15-btn alt" href="#for-clubs">Run a club?</a></div>
  </div></section>
  {clubs.length>0&&<section className="h15-sec" aria-labelledby="h15-clubs"><div className="h15-w">
   <div className="h15-head"><h2 id="h15-clubs">Clubs on Cancha</h2><a className="h15-all" href="/clubs">See all <Icon name="arrow" size={16}/></a></div>
   <div className="h15-row">{clubs.map((p:any)=><a key={p.id} href={p.href} aria-label={p.name}><span className="h15-crest"><img src={p.image} alt="" loading="lazy" decoding="async"/></span><b>{p.name}</b>{p.city&&<small>{p.city}</small>}</a>)}</div>
  </div></section>}
  {(()=>{const list=openNow(new Date().toISOString().slice(0,10));return list.length>0&&<section className="h15-sec" aria-labelledby="h15-open" style={{paddingTop:0}}><div className="h15-w"><CanchaStyle css={openCss}/>
   <div className="h15-head"><h2 id="h15-open">Open right now</h2><a className="h15-all" href="#waitlist">Find me a team <Icon name="arrow" size={16}/></a></div>
   <p className="h15-sub">Real sign-ups and tryouts, checked by Cancha. Tap to go to the source.</p>
   <div className="h15-row h15-open">{list.map(o=><a key={o.url} href={o.url} target="_blank" rel="noopener"><small>{o.org}</small><b>{o.need}</b><span>{o.when} · {o.area}</span><em>{o.note}</em><i>Go to the source ↗</i></a>)}</div>
  </div></section>})()}
  <section className="h15-sec" aria-labelledby="h15-how" style={{paddingTop:0}}><div className="h15-w">
   <div className="h15-head"><h2 id="h15-how">How it works</h2></div>
   <ol className="h15-steps">
    <li><span className="h15-n">01</span><strong>Clubs near you</strong><p>Every club in Miami-Dade and Broward, on one map.</p><div className="h15-ui h15-mini">{clubs.slice(0,10).map((p:any)=><img key={p.id} src={p.image} alt="" loading="lazy"/>)}</div></li>
    <li><span className="h15-n">02</span><strong>See who's recruiting</strong><p>Open tryouts and open spots, straight from the clubs.</p><div className="h15-ui"><span className="h15-k" style={{color:'#9fb3ab',fontSize:15}}>We need</span><span className="big">A keeper</span><div className="r"><span>When</span><em>Sundays</em></div><div className="r"><span>Where</span><em>Doral</em></div></div></li>
    <li><span className="h15-n">03</span><strong>Ask to join, then chat</strong><p>The club says yes and you talk in the app. No phone numbers shared.</p><div className="h15-ui"><div className="h15-ok">✓ Accepted</div><div className="h15-bub them">Welcome! Sunday 8 AM, field 3.</div><div className="h15-bub me">I'm in. See you there.</div></div></li>
   </ol>
  </div></section>
  <section className="h15-sec h15-clubs2" id="for-clubs" aria-labelledby="h15-for"><div className="h15-w">
   <span className="h15-k" style={{color:'#103f32'}}>Cancha for Clubs · Free</span>
   <h2 id="h15-for" style={{marginTop:12}}>Your club, seen.<span>Your players, found.</span></h2>
   <ul className="h15-list"><li>A club page with your crest, league and links</li><li>Your tryouts and open spots in front of players</li><li>Players ask to join; you say yes and chat</li><li>Spotlights on our Instagram, with your club tagged</li></ul>
   <div className="h15-ctas"><a className="h15-btn main" href="/organizations#submission">Claim your club <Icon name="arrow" size={20}/></a><a className="h15-btn alt" href="https://www.instagram.com/wearecancha/" target="_blank" rel="noopener">DM @wearecancha</a></div>
  </div></section>
  <div className="h15-wl" id="waitlist"><AppWaitlist/></div>
  <section className="h15-sec" aria-labelledby="h15-more-t"><div className="h15-w">
   <div className="h15-head"><h2 id="h15-more-t">More on Cancha</h2></div>
   <nav className="h15-more" aria-label="More on Cancha"><a href="/clubs">Find soccer near you <Icon name="arrow" size={22}/></a><a href="/explore">Tryouts &amp; events <Icon name="arrow" size={22}/></a><a href="/florida-soccer-pathway">Florida soccer pathway <Icon name="arrow" size={22}/></a><a href="/training">Training <Icon name="arrow" size={22}/></a><a href="/organizations">Pickup &amp; groups <Icon name="arrow" size={22}/></a><a href="/careers">Careers in soccer <Icon name="arrow" size={22}/></a></nav>
  </div></section>
 </main>
}
// </home15>
