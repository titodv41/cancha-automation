import {contentHash,approve} from './instagram-queue.mjs';
import {newYorkSchedule} from './scheduling.mjs';
import {dateInNewYork} from './offer-expiry.mjs';
import {confirmPostSource,requiresSource} from './post-source.mjs';
export function initializePlan(db){db.exec("CREATE TABLE IF NOT EXISTS instagram_standing_plan(id INTEGER PRIMARY KEY CHECK(id=1),state TEXT NOT NULL,updated_at TEXT NOT NULL,owner_instruction TEXT NOT NULL)");}
export function readPlan(db){initializePlan(db);const row=db.prepare('SELECT * FROM instagram_standing_plan WHERE id=1').get();return row?{...JSON.parse(row.state),updatedAt:row.updated_at}:null;}
export function savePlan(db,input,ownerInstruction){
 initializePlan(db);
 if(!input||typeof input.enabled!=='boolean'||typeof ownerInstruction!=='string'||ownerInstruction.trim().length<3)throw Error('Owner-authorized plan required');
 const current=readPlan(db);
 if(input.enabled===false){db.prepare("UPDATE instagram_queue SET status='Draft',approved_hash=NULL,approved_by=NULL,scheduled_at=NULL,container_id=NULL,note='Automatic plan paused by owner' WHERE approved_by='Cancha owner-authorized standing plan' AND status IN ('Approved','Preparing')").run();const state={...(current||{}),enabled:false,lastCheckedDay:null,lastQueueHash:null};delete state.updatedAt;db.prepare('INSERT INTO instagram_standing_plan VALUES(1,?,?,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state,updated_at=excluded.updated_at,owner_instruction=excluded.owner_instruction').run(JSON.stringify(state),new Date().toISOString(),ownerInstruction.trim());return readPlan(db);}
 if(!Array.isArray(input.weekdays)||!input.weekdays.length||input.weekdays.length>7||new Set(input.weekdays).size!==input.weekdays.length||input.weekdays.some(day=>!Number.isInteger(day)||day<0||day>6)||!/^\d\d:\d\d$/.test(input.localTime||'')||!/^20\d\d-\d\d-\d\d$/.test(input.startDate||''))throw Error('Choose up to seven weekly slots in New York time');
 const parsed=new Date(input.startDate+'T12:00:00Z');if(!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==input.startDate)throw Error('Invalid start date');
 newYorkSchedule(input.startDate+'T'+input.localTime);
 if(!Array.isArray(input.sourceTypes)||!input.sourceTypes.length||input.sourceTypes.some(type=>!['brand','opportunity','news'].includes(type)))throw Error('Only Cancha brand, checked opportunities and verified news is supported');
 const formats=Array.isArray(input.formats)?input.formats:['feed'];if(!formats.length||formats.some(format=>!['feed','story'].includes(format)))throw Error('Choose feed/story formats');
 const state={enabled:true,weekdays:[...input.weekdays].sort(),localTime:input.localTime,startDate:input.startDate,sourceTypes:[...new Set(input.sourceTypes)],timezone:'America/New_York',formats:[...new Set(formats)],maxPerWeek:input.weekdays.length,excludedIds:['providers-coming-soon'],lastCheckedDay:null,lastQueueHash:null,lastResult:null};
 db.prepare('INSERT INTO instagram_standing_plan VALUES(1,?,?,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state,updated_at=excluded.updated_at,owner_instruction=excluded.owner_instruction').run(JSON.stringify(state),new Date().toISOString(),ownerInstruction.trim());return readPlan(db);
}
export function validPostImage(row){try{const url=new URL(row.assetUrl);return url.origin==='https://framerusercontent.com'&&!url.username&&!url.password&&/^\/images\/[^?]+\.jpe?g$/i.test(url.pathname)&&!url.search&&/^[a-f0-9]{64}$/.test(row.assetChecksum||'');}catch{return false;}}
function week(date){const d=new Date(date+'T12:00:00Z'),day=(d.getUTCDay()+6)%7;d.setUTCDate(d.getUTCDate()-day);return d.toISOString().slice(0,10);}
export async function prepareStandingPlan(db,{now=Date.now(),connected=false,accountType='UNCONFIRMED',verifySource=confirmPostSource}={}){
 const plan=readPlan(db);if(!plan?.enabled||!connected)return {scheduled:[],skipped:[],paused:true};
 const today=dateInNewYork(new Date(now));const all=db.prepare('SELECT * FROM instagram_queue ORDER BY id').all();
 const queueHash=all.map(row=>row.id+':'+row.status+':'+contentHash(JSON.parse(row.content))).join('|');

 const slots=[];for(let offset=0;offset<7;offset++){
  const day=new Date(today+'T12:00:00Z');day.setUTCDate(day.getUTCDate()+offset);const date=day.toISOString().slice(0,10);
  if(date<plan.startDate||!plan.weekdays.includes(day.getUTCDay()))continue;
  try{const scheduledAt=newYorkSchedule(date+'T'+plan.localTime);if(Date.parse(scheduledAt)>now&&Date.parse(scheduledAt)-now<=8*3600000)slots.push({date,scheduledAt});}catch{/* DST ambiguity skips this slot. */}
 }
 const windowHash=queueHash+'|'+slots.map(slot=>slot.scheduledAt).join(',');
 if(plan.lastCheckedDay===today&&plan.lastQueueHash===windowHash)return {scheduled:[],skipped:[],alreadyChecked:true};
 const candidates=all.filter(row=>{const content=JSON.parse(row.content);return row.status==='Draft'&&(plan.formats||['feed']).includes(content.format)&&(content.format!=='story'||accountType==='BUSINESS')&&plan.sourceTypes.includes(content.sourceType)&&!plan.excludedIds.includes(row.id)&&validPostImage(content);});
 const result={scheduled:[],skipped:[]};const blocked=new Set();let cursor=0;
 for(const slot of slots){
  const scheduled=db.prepare('SELECT * FROM instagram_queue WHERE scheduled_at IS NOT NULL').all();
  const inWeek=scheduled.filter(row=>(plan.formats||['feed']).includes(JSON.parse(row.content).format)&&week(dateInNewYork(new Date(row.scheduled_at)))===week(slot.date));
  if(inWeek.length>=plan.maxPerWeek||scheduled.some(row=>dateInNewYork(new Date(row.scheduled_at))===slot.date))continue;
  // Prefer a different topic each day; news and opportunities alternate with
  // tips, questions, updates and storytelling when those drafts are available.
  const day=new Date(slot.date+'T12:00:00Z').getUTCDay(),preferred=['update','tip','opportunity','storytelling','fun','news','tip'][day];
  candidates.sort((a,b)=>{const x=JSON.parse(a.content),y=JSON.parse(b.content);const topic=row=>row.sourceType==='brand'?(row.topic||'update'):row.sourceType;return Number(topic(y)===preferred)-Number(topic(x)===preferred);});cursor=0;
  while(cursor<candidates.length){
   const old=candidates[cursor++],content=JSON.parse(old.content);if(blocked.has(old.id))continue;const before=db.prepare('SELECT status FROM instagram_queue WHERE id=?').get(old.id);if(before?.status!=='Draft')continue;
   if(content.sourceType==='news'&&Date.parse(slot.scheduledAt)-Date.parse(content.factsCheckedAt)>36*3600000)continue;
   if(db.prepare("SELECT content FROM instagram_queue WHERE status IN ('Approved','Preparing','Publishing','Published','Needs reconciliation')").all().some(row=>JSON.parse(row.content).caption===content.caption))continue;let checked=false;
   if(requiresSource(content)){try{checked=await verifySource(content)===true;}catch{}if(!checked){blocked.add(old.id);result.skipped.push({id:old.id,reason:'Source unavailable, changed or closed'});continue;}}
   const latestPlan=readPlan(db),current=db.prepare('SELECT * FROM instagram_queue WHERE id=?').get(old.id);
   if(!latestPlan?.enabled||latestPlan.updatedAt!==plan.updatedAt)return {...result,paused:true};
   if(!current||current.status!=='Draft'||contentHash(JSON.parse(current.content))!==contentHash(content)){result.skipped.push({id:old.id,reason:'Content changed during source check'});continue;}
   // No await in this synchronous claim/approval section; queue and plan cannot
   // change between validation and approval in the single hosted Node process.
   try{
    approve(db,old.id,{reviewer:'Cancha owner-authorized standing plan',scheduledAt:slot.scheduledAt,now,allowSourceRecheck:checked});
    if(checked)db.prepare('UPDATE instagram_queue SET source_rechecked_at=? WHERE id=?').run(new Date(now).toISOString(),old.id);
    result.scheduled.push({id:old.id,scheduledAt:slot.scheduledAt});break;
   }catch{result.skipped.push({id:old.id,reason:'Draft failed publishing requirements'});}
  }
 }
 const latest=readPlan(db);if(latest?.enabled&&latest.updatedAt===plan.updatedAt){const rows=db.prepare('SELECT * FROM instagram_queue ORDER BY id').all();const state={...latest,lastCheckedDay:today,lastQueueHash:rows.map(row=>row.id+':'+row.status+':'+contentHash(JSON.parse(row.content))).join('|')+'|'+slots.map(slot=>slot.scheduledAt).join(','),lastResult:result};delete state.updatedAt;db.prepare('UPDATE instagram_standing_plan SET state=? WHERE id=1').run(JSON.stringify(state));}
 return result;
}
