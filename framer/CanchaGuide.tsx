import * as React from 'react'
import{CanchaStyle,ui}from'./CanchaUI.tsx'
// Florida player pathway guide (Oct 30): the landing page for the Pathway 101 Reels. Every fact links to its official
// source and carries the date it was checked; advice is labeled as general advice. Nothing here is ranked or sponsored.
export const CHECKED='October 30, 2026'
export const SECTIONS=[
 {id:'tryouts',kicker:'Club tryouts',title:'When Florida club tryouts can start',body:['Under FYSA Rule 401.6, the statewide tryout date can be no earlier than May 1 and no later than the Tuesday after Memorial Day. Each of FYSA’s regions can keep that date or pick its own inside the same window.','That makes winter and early spring the time to visit clubs, watch a practice and ask about ages, fees and travel before tryouts open. Always confirm the exact dates with the club.'],
  links:[['Browse Florida clubs','/clubs'],['Current tryouts & camps','/explore']],sources:[['FYSA: Important tryout information','https://www.fysa.com/?p=8609']]},
 {id:'odp',kicker:'ODP',title:'ODP: the tryout many players miss',body:['ODP is the Olympic Development Program, run in Florida by FYSA. It identifies players for higher-level training in district pools and further state and regional events.','For 2026/27, Florida tryouts were held in August 2026 at locations around the state, at $50 per player per location. District pools train from September 2026 through June 2027, for players born 2010 to 2015 in most pools. Watch FYSA in summer 2027 for the next tryouts.'],
  links:[],sources:[['FYSA: Florida ODP','https://www.fysa.com/odp/']]},
 {id:'leagues',kicker:'Elite paths',title:'The main competitive paths',body:['MLS NEXT is the youth platform run by Major League Soccer, with a Homegrown Division and an Academy Division. ECNL runs national girls’ and boys’ leagues. Girls Academy is a national girls’ league. USL Academy is the youth league connected to USL clubs.','Florida high school soccer is a winter sport: FHSAA regular-season matches run from November to mid-January, with playoffs into February. Some elite club programs limit high school play, so ask a club about its rules before you commit.','No path guarantees a college or pro outcome. The right fit depends on level, budget, travel and school.'],
  links:[['Find MLS NEXT clubs in Florida','/clubs?activity=Clubs+%26+teams&league=MLS+NEXT']],sources:[['MLS NEXT','https://www.mlssoccer.com/mlsnext/'],['FHSAA soccer','https://fhsaa.com/news/2025/1/23/about-us-soccer.aspx']]},
 {id:'college',kicker:'College recruiting',title:'When college coaches can contact you',body:['Under NCAA Division I rules for men’s and women’s soccer, coaches can’t start recruiting calls, texts or messages until June 15 after a player’s sophomore year of high school.','Coaches still watch before that, at ID camps, showcases and on film. Build a short highlight video, keep your grades up and research programs early. Rules change, so confirm on ncaa.org.'],
  links:[['College ID camps in Florida','/college-soccer-id-camps-florida']],sources:[['NCAA: College-bound student-athlete guide','http://fs.ncaa.org/Docs/eligibility_center/Student_Resources/CBSA.pdf'],['SoccerWire: NCAA soccer recruiting calendar','https://www.soccerwire.com/resources/all-recruits-should-know-these-dates-on-the-ncaa-soccer-recruiting-calendar/']]},
 {id:'stand-out',kicker:'General advice',title:'How to stand out at a tryout',body:['Arrive early and introduce yourself to the coach. Talk on the field and ask for the ball. Take your first touch away from pressure. When you lose the ball, sprint back right away.','This is general advice, not any one club’s checklist. Ask each club what its coaches look for.'],
  links:[['Current tryouts & camps','/explore']],sources:[]}]
const css=`.cgd{padding:30px 0 70px}.cgd-k{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#5f7457;margin:0 0 10px;font-weight:700}
.cgd h1{font-size:clamp(40px,5.5vw,68px);margin:0 0 16px}.cgd-intro{font-size:16px;line-height:1.75;color:#4c6350;max-width:760px;margin:0 0 22px}
.cgd-toc{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 34px}.cgd-toc a{border:1px solid #c9d8bf;border-radius:999px;padding:9px 14px;font-size:13px;font-weight:700;color:#173f30;text-decoration:none;background:#fff}
.cgd-sec{border-top:1px solid #dfe6d9;padding:30px 0 6px;max-width:780px;scroll-margin-top:90px}.cgd-sec h2{font-size:clamp(26px,3.4vw,36px);margin:0 0 14px}
.cgd-sec p{font-size:15px;line-height:1.8;color:#25382c;margin:0 0 14px}.cgd-links{display:flex;flex-wrap:wrap;gap:10px;margin:6px 0 14px}
.cgd-links a{background:#173f30;color:#fff!important;border-radius:10px;padding:11px 15px;font-size:13px;font-weight:700;text-decoration:none}
.cgd-src{font-size:12px;color:#63745b;line-height:1.7;margin:0}.cgd-src a{color:#173f30}.cgd-note{font-size:12px;color:#6b7a62;max-width:780px;line-height:1.7;margin-top:30px}
@media(max-width:650px){.cgd{padding:20px 0 50px}.cgd-sec p{font-size:16px}}`
export default function CanchaGuide(){
 return <main className="cancha-v2 cgd"><CanchaStyle css={ui+css}/><div className="cv-wrap">
  <p className="cgd-k">Pathway 101 · Florida</p><h1>The Florida soccer pathway</h1>
  <p className="cgd-intro">Tryouts, ODP, the main competitive leagues and college recruiting, in plain language. Each fact links to its official source. Checked {CHECKED}.</p>
  <nav className="cgd-toc" aria-label="On this page">{SECTIONS.map(s=><a key={s.id} href={'#'+s.id}>{s.kicker}</a>)}</nav>
  {SECTIONS.map(s=><section className="cgd-sec" id={s.id} key={s.id}><p className="cgd-k">{s.kicker}</p><h2>{s.title}</h2>
   {s.body.map((p,i)=><p key={i}>{p}</p>)}
   {s.links.length>0&&<div className="cgd-links">{s.links.map(([t,h])=><a key={h} href={h}>{t} →</a>)}</div>}
   {s.sources.length>0&&<p className="cgd-src">Source{s.sources.length>1?'s':''}: {s.sources.map(([t,h],i)=><React.Fragment key={h}>{i?' · ':''}<a href={h} rel="noopener" target="_blank">{t}</a></React.Fragment>)}</p>}
  </section>)}
  <p className="cgd-note">Cancha is an independent Florida soccer directory and isn’t affiliated with FYSA, the NCAA, MLS NEXT or any league named here. Rules and dates change; always confirm with the organizer. Spot something out of date? <a href="/organizations">Tell us</a>.</p>
 </div></main>}
