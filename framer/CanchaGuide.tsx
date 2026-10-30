import * as React from 'react'
import{CanchaStyle,ui,Icon}from'./CanchaUI.tsx'
// Florida player pathway guide (Oct 30): the landing page for the Pathway 101 Reels. Visual first (owner, Oct 30: "looks
// like a book"): photo hero with the key dates, a season timeline, a path diagram, photo cards whose details and sources
// open on demand, tip tiles and a closing call to action. Every fact links to its official source and carries the date it
// was checked; advice is labeled as general advice. The IMG placeholders become hosted image URLs when the page publishes.
export const CHECKED='October 30, 2026'
export const PHOTO_CREDIT='Photos: stills from Lozzz Productionz, Coach Javi and Florida Life videos on YouTube (CC BY).'
export const SECTIONS=[
 {id:'tryouts',kicker:'Club tryouts',img:'__IMG:teamwalk__',stat:'May 1',statLabel:'earliest Florida club tryouts',title:'When Florida club tryouts can start',short:'Visit clubs before May. Tryouts can’t start earlier.',body:['Under FYSA Rule 401.6, the statewide tryout date can be no earlier than May 1 and no later than the Tuesday after Memorial Day. Each of FYSA’s regions can keep that date or pick its own inside the same window.','That makes winter and early spring the time to visit clubs, watch a practice and ask about ages, fees and travel before tryouts open. Always confirm the exact dates with the club.'],
  links:[['Browse Florida clubs','/clubs'],['Current tryouts & camps','/explore']],sources:[['FYSA: Important tryout information','https://www.fysa.com/?p=8609']]},
 {id:'odp',kicker:'ODP',img:'__IMG:huddle__',stat:'Aug',statLabel:'2026 Florida ODP tryouts',title:'ODP: the tryout many players miss',short:'Florida’s Olympic Development Program. $50 per tryout location.',body:['ODP is the Olympic Development Program, run in Florida by FYSA. It identifies players for higher-level training in district pools and further state and regional events.','For 2026/27, Florida tryouts were held in August 2026 at locations around the state, at $50 per player per location. District pools train from September 2026 through June 2027, for players born 2010 to 2015 in most pools. Watch FYSA in summer 2027 for the next tryouts.'],
  links:[],sources:[['FYSA: Florida ODP','https://www.fysa.com/odp/']]},
 {id:'leagues',kicker:'Elite paths',img:'__IMG:duel__',stat:'4',statLabel:'main national youth leagues',title:'The main competitive paths',short:'MLS NEXT, ECNL, Girls Academy and USL Academy, plus high school.',body:['MLS NEXT is the youth platform run by Major League Soccer, with a Homegrown Division and an Academy Division. ECNL runs national girls’ and boys’ leagues. Girls Academy is a national girls’ league. USL Academy is the youth league connected to USL clubs.','Florida high school soccer is a winter sport: FHSAA regular-season matches run from November to mid-January, with playoffs into February. Some elite club programs limit high school play, so ask a club about its rules before you commit.','No path guarantees a college or pro outcome. The right fit depends on level, budget, travel and school.'],
  links:[['Find MLS NEXT clubs in Florida','/clubs?activity=Clubs+%26+teams&league=MLS+NEXT']],sources:[['MLS NEXT','https://www.mlssoccer.com/mlsnext/'],['FHSAA soccer','https://fhsaa.com/news/2025/1/23/about-us-soccer.aspx']]},
 {id:'college',kicker:'College recruiting',img:'__IMG:college-huddle__',stat:'Jun 15',statLabel:'after sophomore year: D1 contact opens',title:'When college coaches can contact you',short:'Coaches watch before then. Build film and grades early.',body:['Under NCAA Division I rules for men’s and women’s soccer, coaches can’t start recruiting calls, texts or messages until June 15 after a player’s sophomore year of high school.','Coaches still watch before that, at ID camps, showcases and on film. Build a short highlight video, keep your grades up and research programs early. Rules change, so confirm on ncaa.org.'],
  links:[['College ID camps in Florida','/college-soccer-id-camps-florida']],sources:[['NCAA: College-bound student-athlete guide','http://fs.ncaa.org/Docs/eligibility_center/Student_Resources/CBSA.pdf'],['SoccerWire: NCAA soccer recruiting calendar','https://www.soccerwire.com/resources/all-recruits-should-know-these-dates-on-the-ncaa-soccer-recruiting-calendar/']]},
 {id:'stand-out',kicker:'General advice',img:'__IMG:drill__',stat:'4',statLabel:'habits coaches notice',title:'How to stand out at a tryout',short:'No skill moves needed.',body:['Arrive early and introduce yourself to the coach. Talk on the field and ask for the ball. Take your first touch away from pressure. When you lose the ball, sprint back right away.','This is general advice, not any one club’s checklist. Ask each club what its coaches look for.'],
  links:[['Current tryouts & camps','/explore']],sources:[]}]
// Season months in Florida order (August to July). Each row is one recurring window; spans are inclusive month indexes.
const MONTHS=['Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul']
const TIMELINE=[['ODP tryouts',0,0,'lime','#odp'],['ODP district pools',1,10,'soft','#odp'],['High school season',3,6,'orange','#leagues'],['Club tryouts open',9,9,'lime','#tryouts'],['D1 contact opens (Jun 15, after sophomore year)',10,10,'orange','#college']]
const PATH=[['club','Local club','Rec, travel and academy teams near you','/clubs'],['star','ODP','State pools alongside your club','#odp'],['trophy','Elite leagues','MLS NEXT · ECNL · GA · USL Academy','#leagues'],['event','High school','FHSAA winter season','#leagues'],['pitch','College','ID camps, film, June 15 contact','#college']]
const TIPS=[['Arrive early','Introduce yourself to the coach.'],['Talk','Ask for the ball. Organize.'],['First touch','Take it away from pressure.'],['Lose it?','Sprint back right away.']]
// "Your soccer timeline" calculator (Oct 30). Rules: 2026-27 age groups use the school-year cycle (Aug 1 - Jul 31) adopted by
// US Youth Soccer, US Club Soccer and AYSO; FYSA's 2026/27 ODP district pools list birth years 2010-2015; NCAA D1 soccer
// recruiting contact opens June 15 after sophomore year (June 15 of graduation year minus 2).
const MONTH_NAMES=['January','February','March','April','May','June','July','August','September','October','November','December']
export function seasonAgeGroup(year:number,month:number,seasonEnd=2027){const cycle=month>=7?year+1:year;return seasonEnd-cycle}
export function estimatedGradYear(year:number,month:number){return month>=8?year+19:year+18}
export function d1ContactDate(gradYear:number){return 'June 15, '+(gradYear-2)}
export const ODP_POOL_YEARS=[2010,2015]
function PlayerTimeline(){
 const[year,setYear]=React.useState(2013),[month,setMonth]=React.useState(2),[grad,setGrad]=React.useState<number|null>(null)
 const g=grad??estimatedGradYear(year,month),u=seasonAgeGroup(year,month),odp=year>=ODP_POOL_YEARS[0]&&year<=ODP_POOL_YEARS[1],contactYear=g-2,open=new Date(contactYear,5,15)<=new Date()
 const years=Array.from({length:17},(_,i)=>2004+i)
 return <section className="cgd-calc" aria-labelledby="calc-title"><div className="cgd-calc-in">
  <div className="cgd-calc-form"><span className="cgd-chip">Try it</span><h2 id="calc-title">Your soccer timeline</h2><p>Pick the player’s birth month and year. Everything updates instantly.</p>
   <div className="cgd-fields"><label>Birth month<select value={month} onChange={e=>setMonth(+e.target.value)}>{MONTH_NAMES.map((m,i)=><option key={m} value={i}>{m}</option>)}</select></label>
    <label>Birth year<select value={year} onChange={e=>{setYear(+e.target.value);setGrad(null)}}>{years.map(y=><option key={y} value={y}>{y}</option>)}</select></label>
    <label>High school class<select value={g} onChange={e=>setGrad(+e.target.value)}>{Array.from({length:21},(_,i)=>2022+i).map(y=><option key={y} value={y}>{y}{grad===null&&y===g?' (estimated)':''}</option>)}</select></label></div></div>
  <div className="cgd-results" aria-live="polite">
   <div className="cgd-res"><b>{u>=19?'U19+':u<4?'Too young':'U'+u}</b><span>2026-27 age group<small>Aug 1 – Jul 31 cycle used by US Youth Soccer, US Club Soccer and AYSO. Confirm with your league.</small></span></div>
   <div className="cgd-res"><b>{odp?'In range':'Outside'}</b><span>2026/27 Florida ODP pools<small>District pools list birth years {ODP_POOL_YEARS[0]}–{ODP_POOL_YEARS[1]}. Next tryouts: watch FYSA in summer 2027.</small></span></div>
   <div className="cgd-res"><b>{open?'Open':'Jun 15, '+contactYear}</b><span>D1 coaches can contact {open?'(since June 15, '+contactYear+')':''}<small>June 15 after sophomore year for the class of {g}. Coaches still watch before then.</small></span></div>
  </div></div><p className="cgd-calc-src">Sources: <a href="https://ayso.org/age-group-revision-2026-2027" target="_blank" rel="noopener">AYSO age group revision</a> · <a href="https://www.soccerwire.com/news/us-club-soccer-us-youth-soccer-ayso-announce-update-on-age-group-formation-cycle/" target="_blank" rel="noopener">US Club Soccer, US Youth Soccer & AYSO announcement</a> · <a href="https://www.fysa.com/odp/" target="_blank" rel="noopener">FYSA ODP</a> · <a href="https://www.soccerwire.com/resources/all-recruits-should-know-these-dates-on-the-ncaa-soccer-recruiting-calendar/" target="_blank" rel="noopener">NCAA soccer recruiting calendar</a>. High school class is estimated from a Sept 1 school cutoff; change it if different.</p></section>
}
const css=`.cgd{padding:0 0 70px}.cgd *{box-sizing:border-box}
.cgd-hero{position:relative;min-height:600px;display:flex;align-items:flex-end;color:#fff;background:#0b2e24 center 30%/cover no-repeat;border-radius:0 0 28px 28px;overflow:hidden}
.cgd-hero:before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,#0b2e2440 0%,#0b2e2400 30%,#0b2e24d9 72%,#0b2e24 100%)}
.cgd-hero .cv-wrap{position:relative;width:100%;padding-bottom:40px}.cgd-chip{display:inline-block;background:#d7ef86;color:#103f32;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;border-radius:6px;padding:7px 10px;margin-bottom:16px}
.cgd-hero h1,.cgd-hero p{text-shadow:0 2px 18px #0b2e24b3}.cgd-hero h1{font-size:clamp(48px,8vw,104px);line-height:.9;margin:0 0 14px;color:#fff;max-width:900px}.cgd-hero p{font-size:18px;line-height:1.5;margin:0 0 26px;max-width:620px;color:#e8efe2}
.cgd-keys{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;max-width:820px}.cgd-key{display:block;background:#ffffff14;border:1px solid #ffffff33;backdrop-filter:blur(8px);border-radius:16px;padding:14px 16px;color:#fff!important;text-decoration:none}
.cgd-key b{display:block;font-family:var(--cancha-display-font,'Cancha Display'),sans-serif;font-style:italic;font-size:40px;line-height:1;color:#d7ef86;text-transform:uppercase}.cgd-key span{font-size:13px;line-height:1.35}
.cgd-h2{font-size:clamp(32px,4.4vw,52px);margin:64px 0 8px}.cgd-lead{font-size:16px;color:#4c6350;margin:0 0 22px;max-width:640px;line-height:1.6}
.cgd-tl-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:0 -4px;padding:0 4px 6px}.cgd-tl{min-width:720px;background:#fff;border:1px solid #dfe6d9;border-radius:20px;padding:18px}
.cgd-tl-row{display:grid;grid-template-columns:repeat(12,1fr);gap:4px;align-items:center;margin-bottom:10px}.cgd-tl-row:last-child{margin-bottom:0}
.cgd-m{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#6b7a62;text-align:center}
.cgd-bar{display:block;border-radius:999px;padding:9px 12px;font-size:12px;font-weight:800;line-height:1.2;text-decoration:none;white-space:nowrap;overflow:visible}
.cgd-bar.lime{background:#d7ef86;color:#103f32!important}.cgd-bar.soft{background:#e6eedd;color:#103f32!important}.cgd-bar.orange{background:#f55b32;color:#fff!important}
.cgd-path{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px;position:relative}.cgd-step{position:relative;display:flex;flex-direction:column;gap:8px;background:#103f32;color:#fff!important;border-radius:20px;padding:20px 18px;text-decoration:none;min-height:170px}
.cgd-step:not(:last-child):after{content:'→';position:absolute;right:-13px;top:50%;transform:translateY(-50%);width:24px;height:24px;border-radius:50%;background:#d7ef86;color:#103f32;font-size:14px;font-weight:900;display:flex;align-items:center;justify-content:center;z-index:1}
.cgd-step .cv-icon{color:#d7ef86}.cgd-step b{display:block;font-size:20px;margin-bottom:4px}.cgd-step span{font-size:13px;line-height:1.45;color:#cfe0c8}
.cgd-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:18px}.cgd-card{background:#fff;border:1px solid #dfe6d9;border-radius:20px;overflow:hidden;display:flex;flex-direction:column;scroll-margin-top:90px}
.cgd-card img{width:100%;height:190px;object-fit:cover;display:block;background:#e6eedd}.cgd-card-in{padding:18px 18px 16px;display:flex;flex-direction:column;gap:6px;flex:1}
.cgd-stat{font-family:var(--cancha-display-font,'Cancha Display'),sans-serif;font-style:italic;font-size:46px;line-height:1;color:#f55b32;text-transform:uppercase}.cgd-statl{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#5f7457}
.cgd-card h3{font-size:22px;margin:8px 0 0;line-height:1.15}.cgd-card p{font-size:14px;line-height:1.6;color:#33473a;margin:0}
.cgd-card details{margin-top:auto;border-top:1px solid #e6ece0;padding-top:12px}.cgd-card summary{cursor:pointer;font-size:13px;font-weight:800;color:#173f30;min-height:32px;display:flex;align-items:center}
.cgd-card details p{margin:10px 0 0;font-size:14px}.cgd-links{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 4px}.cgd-links a{background:#173f30;color:#fff!important;border-radius:10px;padding:10px 13px;font-size:12px;font-weight:800;text-decoration:none}
.cgd-src{font-size:12px;color:#63745b;line-height:1.6;margin:10px 0 0!important}.cgd-src a{color:#173f30}
.cgd-tips{position:relative;margin-top:64px;border-radius:28px;overflow:hidden;background:#103f32 center/cover no-repeat;color:#fff}.cgd-tips:before{content:'';position:absolute;inset:0;background:#0b2e24e0}
.cgd-tips-in{position:relative;padding:36px 28px}.cgd-tips h2{color:#fff;font-size:clamp(32px,4.4vw,52px);margin:0 0 6px}.cgd-tips>div>p{color:#cfe0c8;margin:0 0 22px;font-size:14px}
.cgd-tipgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.cgd-tip{background:#ffffff12;border:1px solid #ffffff2b;border-radius:18px;padding:18px}
.cgd-tip i{display:block;font-style:normal;font-family:var(--cancha-display-font,'Cancha Display'),sans-serif;font-size:40px;color:#d7ef86;line-height:1}.cgd-tip b{display:block;font-size:20px;margin:10px 0 4px}.cgd-tip span{font-size:13px;color:#d8e6d2;line-height:1.45}
.cgd-cta{display:grid;grid-template-columns:1.1fr 1fr;gap:0;margin-top:22px;border-radius:28px;overflow:hidden;background:#d7ef86}.cgd-cta img{width:100%;height:100%;min-height:260px;object-fit:cover;display:block}
.cgd-cta>div{padding:32px 28px;display:flex;flex-direction:column;justify-content:center;gap:12px}.cgd-cta h2{font-size:clamp(30px,4vw,46px);margin:0;color:#103f32}.cgd-cta p{margin:0;color:#24402f;font-size:15px}
.cgd-btns{display:flex;flex-wrap:wrap;gap:10px;margin-top:6px}.cgd-btns a{flex:0 0 auto;background:#103f32;color:#fff!important;border-radius:12px;padding:13px 16px;font-size:14px;font-weight:800;text-decoration:none}.cgd-btns a+a{background:transparent;color:#103f32!important;border:2px solid #103f32}
.cgd-calc{margin-top:40px;background:#fff;border:1px solid #dfe6d9;border-radius:28px;padding:26px;box-shadow:0 18px 40px #103f3212}.cgd-calc-in{display:grid;grid-template-columns:1fr 1.15fr;gap:26px;align-items:center}
.cgd-calc h2{font-size:clamp(30px,4vw,48px);margin:10px 0 6px}.cgd-calc-form>p{margin:0 0 16px;color:#4c6350;font-size:15px}.cgd-fields{display:grid;grid-template-columns:1fr 1fr;gap:10px}.cgd-fields label{display:flex;flex-direction:column;gap:6px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#5f7457}.cgd-fields label:last-child{grid-column:1/-1}
.cgd-fields select{appearance:auto;min-height:48px;border:1px solid #c9d8bf;border-radius:12px;padding:0 12px;font-size:16px;font-weight:700;color:#103f32;background:#f7f9f2;text-transform:none;letter-spacing:0}
.cgd-results{display:grid;gap:10px}.cgd-res{display:flex;align-items:center;gap:16px;background:#103f32;color:#fff;border-radius:18px;padding:14px 18px}.cgd-res b{font-family:var(--cancha-display-font,'Cancha Display'),sans-serif;font-style:italic;font-size:40px;line-height:1;color:#d7ef86;min-width:210px;white-space:nowrap;text-transform:uppercase}
.cgd-res span{font-size:15px;font-weight:800;line-height:1.3}.cgd-res small{display:block;font-size:12px;font-weight:600;color:#cfe0c8;margin-top:3px;line-height:1.4}.cgd-calc-src{font-size:11px;color:#6b7a62;margin:16px 0 0;line-height:1.6}.cgd-calc-src a{color:#173f30}
@media(max-width:900px){.cgd-calc-in{grid-template-columns:1fr}}@media(max-width:650px){.cgd-calc{padding:18px;border-radius:22px}.cgd-res{flex-direction:column;align-items:flex-start;gap:6px}.cgd-res b{min-width:0;font-size:36px}}
.cgd-note{font-size:12px;color:#6b7a62;max-width:820px;line-height:1.7;margin-top:28px}.cgd-note a{color:#173f30}
@media(max-width:900px){.cgd-path{grid-template-columns:1fr;gap:10px}.cgd-step{min-height:0;flex-direction:row;align-items:center;gap:14px;padding:16px}.cgd-step span{display:block}.cgd-step:not(:last-child):after{content:'↓';right:auto;left:50%;top:auto;bottom:-15px;transform:translateX(-50%)}
.cgd-tipgrid{grid-template-columns:repeat(2,minmax(0,1fr))}.cgd-cta{grid-template-columns:1fr}.cgd-cta img{min-height:200px;max-height:240px}}
@media(max-width:650px){.cgd-hero{min-height:640px;border-radius:0 0 22px 22px}.cgd-hero:before{background:linear-gradient(180deg,#0b2e2433 0%,#0b2e2499 38%,#0b2e24eb 62%,#0b2e24 100%)}.cgd-hero p{font-size:16px}.cgd-keys{grid-template-columns:1fr;gap:8px}.cgd-key{display:flex;align-items:center;gap:14px;padding:12px 14px}.cgd-key b{font-size:34px;min-width:96px}
.cgd-tips-in{padding:28px 18px}.cgd-tip{padding:14px}.cgd-tip b{font-size:17px}.cgd-cta>div{padding:24px 18px}}`
export default function CanchaGuide(){
 const odp=SECTIONS[1],keys=[SECTIONS[0],odp,SECTIONS[3]]
 return <main className="cancha-v2 cgd"><CanchaStyle css={ui+css}/>
  <section className="cgd-hero" style={{backgroundImage:'url(__IMG:hero-walkout__)'}}><div className="cv-wrap">
   <span className="cgd-chip">Pathway 101 · Florida</span><h1>Your Florida soccer pathway</h1>
   <p>Tryouts, ODP, elite leagues and college recruiting, at a glance. Every date is sourced. Checked {CHECKED}.</p>
   <div className="cgd-keys">{keys.map(s=><a className="cgd-key" key={s.id} href={'#'+s.id}><b>{s.stat}</b><span>{s.statLabel}</span></a>)}</div>
  </div></section>
  <div className="cv-wrap">
   <PlayerTimeline/>
   <h2 className="cgd-h2">The year at a glance</h2><p className="cgd-lead">Florida’s soccer calendar, August to July. Tap a bar for the details.</p>
   <div className="cgd-tl-scroll"><div className="cgd-tl" role="table" aria-label="Florida soccer season timeline">
    <div className="cgd-tl-row" role="row">{MONTHS.map(m=><span className="cgd-m" role="columnheader" key={m}>{m}</span>)}</div>
    {TIMELINE.map(([label,a,b,tone,href])=><div className="cgd-tl-row" role="row" key={label as string}><a className={'cgd-bar '+tone} href={href as string} style={{gridColumn:`${(a as number)+1} / ${(b as number)+2}`}}>{label}</a></div>)}
   </div></div>
   <h2 className="cgd-h2">The paths</h2><p className="cgd-lead">Most players start at a local club. These are the main routes up from there, and many players use more than one.</p>
   <div className="cgd-path">{PATH.map(([icon,t,d,h])=><a className="cgd-step" key={t} href={h}><Icon name={icon} size={30}/><div><b>{t}</b><span>{d}</span></div></a>)}</div>
   <h2 className="cgd-h2">What to know</h2><p className="cgd-lead">The short version on each card. Open “Details & sources” for the full rule and the link.</p>
   <div className="cgd-cards">{SECTIONS.map(s=><article className="cgd-card" id={s.id} key={s.id}><img src={s.img} alt="" loading="lazy"/><div className="cgd-card-in">
    <span className="cgd-stat">{s.stat}</span><span className="cgd-statl">{s.statLabel}</span><h3>{s.title}</h3><p>{s.short}</p>
    <details><summary>Details & sources</summary>{s.body.map((p,i)=><p key={i}>{p}</p>)}
     {s.links.length>0&&<div className="cgd-links">{s.links.map(([t,h])=><a key={h} href={h}>{t} →</a>)}</div>}
     {s.sources.length>0&&<p className="cgd-src">Source{s.sources.length>1?'s':''}: {s.sources.map(([t,h],i)=><React.Fragment key={h}>{i?' · ':''}<a href={h} rel="noopener" target="_blank">{t}</a></React.Fragment>)}</p>}
    </details></div></article>)}</div>
   <section className="cgd-tips" style={{backgroundImage:'url(__IMG:drill__)'}}><div className="cgd-tips-in"><h2>Stand out at a tryout</h2><p>General advice, not any one club’s checklist.</p>
    <div className="cgd-tipgrid">{TIPS.map(([t,d],i)=><div className="cgd-tip" key={t}><i>0{i+1}</i><b>{t}</b><span>{d}</span></div>)}</div></div></section>
   <section className="cgd-cta"><img src="__IMG:celebrate__" alt="Youth players celebrating together at a Florida tournament" loading="lazy"/><div><h2>Find your game</h2><p>Clubs, tryouts, camps and places to play near you, with official links.</p>
    <div className="cgd-btns"><a href="/clubs">Find a club →</a><a href="/explore">Tryouts & camps</a></div></div></section>
   <p className="cgd-note">Cancha is an independent Florida soccer directory and isn’t affiliated with FYSA, the NCAA, MLS NEXT or any league named here. Rules and dates change; always confirm with the organizer. {PHOTO_CREDIT} Spot something out of date? <a href="/organizations">Tell us</a>.</p>
  </div></main>}
