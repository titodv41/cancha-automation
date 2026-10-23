import {narrativeAllowed} from './narrative-editorial.mjs';
import {approvedProductDemo} from './product-editorial.mjs';
import {passesCarouselPolicy} from './carousel-quality.mjs';
import {validJpeg,validCarousel,validReel} from './instagram-media.mjs';
import {approvedSocialPhoto,approvedOriginalCreative,recentlyUsedPhoto} from './social-creative.mjs';
import {backendFrozen} from './github-state.mjs';
import {contentHash,approve} from './instagram-queue.mjs';
import {newYorkSchedule} from './scheduling.mjs';
import {dateInNewYork} from './offer-expiry.mjs';
import {confirmPostSource,requiresSource} from './post-source.mjs';
import {dailyPostLimit} from './instagram-frequency.mjs';
export function initializePlan(db){db.exec("CREATE TABLE IF NOT EXISTS instagram_standing_plan(id INTEGER PRIMARY KEY CHECK(id=1),state TEXT NOT NULL,updated_at TEXT NOT NULL,owner_instruction TEXT NOT NULL)");}
export function readPlan(db){initializePlan(db);const row=db.prepare('SELECT * FROM instagram_standing_plan WHERE id=1').get();return row?{...JSON.parse(row.state),updatedAt:row.updated_at}:null;}
export function savePlan(db,input,ownerInstruction){
 initializePlan(db);
 if(!input||typeof input.enabled!=='boolean'||typeof ownerInstruction!=='string'||ownerInstruction.trim().length<3)throw Error('Owner-authorized plan required');
 const current=readPlan(db);
 if(input.enabled===false){db.prepare("UPDATE instagram_queue SET status='Draft',approved_hash=NULL,approved_by=NULL,scheduled_at=NULL,container_id=NULL,note='Automatic plan paused by owner' WHERE approved_by='Cancha owner-authorized standing plan' AND status IN ('Approved','Preparing')").run();const state={...(current||{}),enabled:false,lastCheckedDay:null,lastQueueHash:null};delete state.updatedAt;db.prepare('INSERT INTO instagram_standing_plan VALUES(1,?,?,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state,updated_at=excluded.updated_at,owner_instruction=excluded.owner_instruction').run(JSON.stringify(state),new Date().toISOString(),ownerInstruction.trim());return readPlan(db);}
 if(!Array.isArray(input.weekdays)||!input.weekdays.length||input.weekdays.length>7||new Set(input.weekdays).size!==input.weekdays.length||input.weekdays.some(day=>!Number.isInteger(day)||day<0||day>6)||!/^\d\d:\d\d$/.test(input.localTime||'')||!/^20\d\d-\d\d-\d\d$/.test(input.startDate||''))throw Error('Choose up to seven weekly slots in New York time');
 const parsed=new Date(input.startDate+'T12:00:00Z');if(!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==input.startDate)throw Error('Invalid start date');
 const times=input.localTimes===undefined?[input.localTime]:input.localTimes;
 if(!Array.isArray(times)||times.length<1||times.length>2||new Set(times).size!==times.length||times.some(t=>!/^\d\d:\d\d$/.test(t)))throw Error('Choose one or two distinct daily times');
 for(const time of times)newYorkSchedule(input.startDate+'T'+time);
 const localTimes=[...times].sort(),minutes=t=>Number(t.slice(0,2))*60+Number(t.slice(3));
 if(localTimes.length===2&&minutes(localTimes[1])-minutes(localTimes[0])<240)throw Error('Keep daily posts at least four hours apart');
 if(!Array.isArray(input.sourceTypes)||!input.sourceTypes.length||input.sourceTypes.some(type=>!['brand','opportunity','news'].includes(type)))throw Error('Only Cancha brand, checked opportunities and verified news is supported');
 const formats=Array.isArray(input.formats)?input.formats:['feed'];if(!formats.length||formats.some(format=>!['feed','story'].includes(format)))throw Error('Choose feed/story formats');
 const state={enabled:true,weekdays:[...input.weekdays].sort(),localTime:input.localTime,localTimes,maxPerDay:localTimes.length,startDate:input.startDate,sourceTypes:[...new Set(input.sourceTypes)],timezone:'America/New_York',formats:[...new Set(formats)],maxPerWeek:input.weekdays.length*localTimes.length,excludedIds:['providers-coming-soon'],lastCheckedDay:null,lastQueueHash:null,lastResult:null};
 db.prepare('INSERT INTO instagram_standing_plan VALUES(1,?,?,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state,updated_at=excluded.updated_at,owner_instruction=excluded.owner_instruction').run(JSON.stringify(state),new Date().toISOString(),ownerInstruction.trim());return readPlan(db);
}
export function validPostImage(row){return validJpeg(row,{hosted:true})&&validCarousel(row,{hosted:true})&&validReel(row);}
function week(date){const d=new Date(date+'T12:00:00Z'),day=(d.getUTCDay()+6)%7;d.setUTCDate(d.getUTCDate()-day);return d.toISOString().slice(0,10);}
export async function prepareStandingPlan(db,{now=Date.now(),connected=false,accountType='UNCONFIRMED',verifySource=confirmPostSource,requireBrandPhotos=false,requireCreativeVersion=null,preferredDraftId=null,editorialPolicy={}}={}){
 const plan=readPlan(db);if(backendFrozen(db)||!plan?.enabled||!connected)return {scheduled:[],skipped:[],paused:true};
 const today=dateInNewYork(new Date(now));const all=db.prepare('SELECT * FROM instagram_queue ORDER BY id').all();
 const queueHash=all.map(row=>row.id+':'+row.status+':'+contentHash(JSON.parse(row.content))).join('|');

 const slots=[];for(let offset=0;offset<7;offset++){
  const day=new Date(today+'T12:00:00Z');day.setUTCDate(day.getUTCDate()+offset);const date=day.toISOString().slice(0,10);
  if(date<plan.startDate||!plan.weekdays.includes(day.getUTCDay()))continue;
  for(const time of plan.localTimes||[plan.localTime])try{const scheduledAt=newYorkSchedule(date+'T'+time);if(Date.parse(scheduledAt)>now&&Date.parse(scheduledAt)-now<=8*3600000)slots.push({date,scheduledAt});else if(editorialPolicy.lateSlotGraceMinutes&&Date.parse(scheduledAt)<=now&&now-Date.parse(scheduledAt)<=Math.min(90,editorialPolicy.lateSlotGraceMinutes)*60000)slots.push({date,scheduledAt:new Date(now+1000).toISOString(),intendedAt:scheduledAt});}catch{/* DST ambiguity skips this slot. */}
 }
 const policyHash=Object.keys(editorialPolicy).length?'|editorial:'+JSON.stringify(editorialPolicy):'',windowHash=queueHash+'|'+slots.map(slot=>slot.scheduledAt).join(',')+policyHash;
 if(plan.lastCheckedDay===today&&plan.lastQueueHash===windowHash)return {scheduled:[],skipped:[],alreadyChecked:true};
 const latestPublished=all.filter(r=>r.status==='Published').sort((a,b)=>Date.parse(b.published_at||b.scheduled_at)-Date.parse(a.published_at||a.scheduled_at))[0],lastKind=latestPublished?JSON.parse(latestPublished.content).creativeKind:null;
 const sourceRetryDue=row=>{const m=String(row.note||'').match(/^Source unavailable, changed or closed at (.+)$/);return !m||!Number.isFinite(Date.parse(m[1]))||now-Date.parse(m[1])>=86400000};
 const candidates=all.filter(row=>{const content=JSON.parse(row.content);return row.status==='Draft'&&sourceRetryDue(row)&&(!requireCreativeVersion||content.creativeVersion===requireCreativeVersion)&&(!requireBrandPhotos||content.sourceType!=='brand'||approvedSocialPhoto(content.photo)||approvedOriginalCreative(content))&&(plan.formats||['feed']).includes(content.format)&&(content.format!=='story'||accountType==='BUSINESS')&&plan.sourceTypes.includes(content.sourceType)&&!plan.excludedIds.includes(row.id)&&!editorialPolicy.retiredDraftIds?.includes(row.id)&&(!editorialPolicy.requireSubjectPhotos||(content.visualEvidence?.kind==='photo-carousel'||narrativeAllowed(content,editorialPolicy)||editorialPolicy.dailyDirectoryEnabled&&content.visualEvidence?.kind==='directory-guide'||approvedProductDemo(content,editorialPolicy)||editorialPolicy.allowMotionStories&&['motion-story','animated-explainer'].includes(content.visualEvidence?.kind))&&approvedOriginalCreative(content))&&passesCarouselPolicy(content,editorialPolicy)&&validPostImage(content);});
 const result={scheduled:[],skipped:[]};const blocked=new Set();let cursor=0;
 for(const slot of slots){
  const scheduled=db.prepare("SELECT * FROM instagram_queue WHERE scheduled_at IS NOT NULL AND status IN ('Approved','Preparing','Publishing','Published','Needs reconciliation','Failed')").all();
  const inWeek=scheduled.filter(row=>(plan.formats||['feed']).includes(JSON.parse(row.content).format)&&week(dateInNewYork(new Date(row.scheduled_at)))===week(slot.date));
  const sameDay=scheduled.filter(row=>dateInNewYork(new Date(row.scheduled_at))===slot.date);
  if(inWeek.length>=plan.maxPerWeek||sameDay.length>=dailyPostLimit(plan)||sameDay.some(row=>Math.abs(Date.parse(row.scheduled_at)-Date.parse(slot.scheduledAt))<4*3600000))continue;
  // Prefer a different topic each day; news and opportunities alternate with
  // tips, questions, updates and storytelling when those drafts are available.
  const communityCount=inWeek.filter(r=>JSON.parse(r.content).topic==='community').length,preferCommunity=editorialPolicy.communityFirst&&communityCount<(editorialPolicy.communityWeeklyTarget||4);
  const productCount=inWeek.filter(r=>JSON.parse(r.content).visualEvidence?.kind==='product-demo').length,preferProduct=(editorialPolicy.maxWeeklyProductPosts||0)>productCount&&sameDay.some(r=>['Approved','Preparing','Publishing','Published'].includes(r.status)&&JSON.parse(r.content).slides?.length>=2);
  const preferNarrative=sameDay.some(r=>['Approved','Preparing','Publishing','Published'].includes(r.status)&&JSON.parse(r.content).slides?.length>=2);
  const day=new Date(slot.date+'T12:00:00Z').getUTCDay(),preferred=['update','tip','opportunity','storytelling','fun','news','tip'][day];
  candidates.sort((a,b)=>{const x=JSON.parse(a.content),y=JSON.parse(b.content);const topic=row=>row.sourceType==='brand'?(row.topic||'update'):row.sourceType;return Number(b.id===preferredDraftId)-Number(a.id===preferredDraftId)||(preferNarrative?Number(narrativeAllowed(y,editorialPolicy))-Number(narrativeAllowed(x,editorialPolicy)):0)||(preferProduct?Number(y.visualEvidence?.kind==='product-demo')-Number(x.visualEvidence?.kind==='product-demo'):0)||(editorialPolicy.curatedDraftIds?.includes(a.id)?editorialPolicy.curatedDraftIds.indexOf(a.id):999)-(editorialPolicy.curatedDraftIds?.includes(b.id)?editorialPolicy.curatedDraftIds.indexOf(b.id):999)||(preferCommunity?Number(y.topic==='community')-Number(x.topic==='community'):0)||Number(!!lastKind&&x.creativeKind===lastKind)-Number(!!lastKind&&y.creativeKind===lastKind)||Number(topic(y)===preferred)-Number(topic(x)===preferred);});cursor=0;
  while(cursor<candidates.length){
   const old=candidates[cursor++],content=JSON.parse(old.content);if(blocked.has(old.id))continue;if(content.visualEvidence?.kind==='product-demo'&&editorialPolicy.maxWeeklyProductPosts&&productCount>=editorialPolicy.maxWeeklyProductPosts){result.skipped.push({id:old.id,reason:'Weekly product-post limit reached'});continue;}if((content.reel||content.visualEvidence?.kind==='product-demo')&&(editorialPolicy.minimumDailyCarousels||0)>0&&!sameDay.some(r=>['Approved','Preparing','Publishing','Published'].includes(r.status)&&JSON.parse(r.content).slides?.length>=2)){result.skipped.push({id:old.id,reason:'Reserve a daily carousel before a Reel or product post'});continue;}const before=db.prepare('SELECT status FROM instagram_queue WHERE id=?').get(old.id);if(before?.status!=='Draft')continue;
   const organization=c=>c.editorialOrganization||c.profile?.slug||(c.editorialSourceId?c.badge:null);
   if(organization(content)&&sameDay.some(r=>organization(JSON.parse(r.content))===organization(content))){result.skipped.push({id:old.id,reason:'Use a different club in the second daily slot'});continue;}
   if(content.sourceType==='news'&&!content.editorialSourceId&&Date.parse(slot.scheduledAt)-Date.parse(content.factsCheckedAt)>36*3600000)continue;
   if(recentlyUsedPhoto(content,db.prepare('SELECT * FROM instagram_queue').all(),slot.scheduledAt)){result.skipped.push({id:old.id,reason:'Image or source photograph already used within 30 days'});continue;}
   if(db.prepare("SELECT content FROM instagram_queue WHERE status IN ('Approved','Preparing','Publishing','Published','Needs reconciliation')").all().some(row=>JSON.parse(row.content).caption===content.caption))continue;let checked=false;
   if(requiresSource(content)){try{checked=await verifySource(content)===true;}catch{}if(!checked){blocked.add(old.id);const failed=db.prepare('SELECT status,content FROM instagram_queue WHERE id=?').get(old.id);if(failed?.status==='Draft'&&contentHash(JSON.parse(failed.content))===contentHash(content))db.prepare("UPDATE instagram_queue SET note=? WHERE id=? AND status='Draft'").run('Source unavailable, changed or closed at '+new Date(now).toISOString(),old.id);result.skipped.push({id:old.id,reason:'Source unavailable, changed or closed'});continue;}}
   const latestPlan=readPlan(db),current=db.prepare('SELECT * FROM instagram_queue WHERE id=?').get(old.id);
   if(backendFrozen(db)||!latestPlan?.enabled||latestPlan.updatedAt!==plan.updatedAt)return {...result,paused:true};
   if(!current||current.status!=='Draft'||contentHash(JSON.parse(current.content))!==contentHash(content)){result.skipped.push({id:old.id,reason:'Content changed during source check'});continue;}
   // No await in this synchronous claim/approval section; queue and plan cannot
   // change between validation and approval in the single hosted Node process.
   try{
    approve(db,old.id,{reviewer:'Cancha owner-authorized standing plan',scheduledAt:slot.scheduledAt,now,allowSourceRecheck:checked});
    if(checked)db.prepare("UPDATE instagram_queue SET source_rechecked_at=?,note='' WHERE id=?").run(new Date(now).toISOString(),old.id);
    result.scheduled.push({id:old.id,scheduledAt:slot.scheduledAt});break;
   }catch{result.skipped.push({id:old.id,reason:'Draft failed publishing requirements'});}
  }
 }
 const latest=readPlan(db);if(latest?.enabled&&latest.updatedAt===plan.updatedAt){const rows=db.prepare('SELECT * FROM instagram_queue ORDER BY id').all();const state={...latest,lastCheckedDay:today,lastQueueHash:rows.map(row=>row.id+':'+row.status+':'+contentHash(JSON.parse(row.content))).join('|')+'|'+slots.map(slot=>slot.scheduledAt).join(',')+policyHash,lastResult:result};delete state.updatedAt;db.prepare('UPDATE instagram_standing_plan SET state=? WHERE id=1').run(JSON.stringify(state));}
 return result;
}
