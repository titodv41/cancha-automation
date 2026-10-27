import {pathToFileURL} from 'node:url';import {resolve} from 'node:path';import {newYorkSchedule} from '../server/scheduling.mjs';
// GitHub's cron skipped this repository for hours (Oct 25-26), missing feed slots and preparation.
// This clock does not depend on cron: one long run sleeps until each production event, dispatches the
// existing Instagram workflow, and re-dispatches itself before its time limit, forming one continuous chain.
// The production workflow alone decides what happens (caps, spacing, source checks, receipts).
export const events=[
 {time:'09:23',action:'replenish'},{time:'10:09',action:'prepare'},
 {time:'12:10',action:'publish'},{time:'12:19',action:'prepare'},{time:'12:32',action:'publish'},
 {time:'12:50',action:'publish'},{time:'13:23',action:'replenish'},{time:'17:40',action:'publish'},{time:'18:02',action:'publish'},
 {time:'18:20',action:'publish'},{time:'18:50',action:'publish'},
];
// Follow-up publish events (12:50, 18:20, 18:50): a Reel container created at the slot can still be
// processing at Meta; later runs send it once it is FINISHED. They never create a second post.
const nyDate=at=>new Intl.DateTimeFormat('sv-SE',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(at);
// Upcoming events in order. A link continues strictly after the last event its predecessor handled;
// a fresh start (manual or cron restart) also fires one that fell due in the last few minutes. Even with
// a cursor, events more than an hour old are stale (Oct 27: a link fired 22:20/22:50 publish at 23:22).
export function upcoming(now=new Date(),{catchUpMinutes=5,days=2,after=null,maxLateMinutes=60}={}){
 const floor=after?Math.max(Date.parse(after)+1,now.getTime()-maxLateMinutes*60000):now.getTime()-catchUpMinutes*60000;
 const out=[];for(let offset=0;offset<days;offset++){const date=nyDate(new Date(now.getTime()+offset*86400000));
  for(const event of events){let at;try{at=Date.parse(newYorkSchedule(date+'T'+event.time));}catch{continue;}
   if(at>=floor)out.push({...event,at:new Date(at).toISOString()});}}
 return out.sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)).filter((e,i,all)=>all.findIndex(x=>x.at===e.at&&x.action===e.action)===i);
}
// Events this run handles before it hands over to the next link of the chain.
export function plan(now=new Date(),budgetMinutes=320,after=null){const until=now.getTime()+budgetMinutes*60000;return upcoming(now,{after}).filter(e=>Date.parse(e.at)<=until);}
const api=(token,repository,path,init={})=>fetch(`https://api.github.com/repos/${repository}${path}`,{...init,headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},signal:AbortSignal.timeout(30000)});
async function dispatch(token,repository,workflow,inputs){const response=await api(token,repository,`/actions/workflows/${workflow}/dispatches`,{method:'POST',body:JSON.stringify({ref:'main',...(inputs?{inputs}:{})})});if(response.status!==204)throw Error(`Dispatch of ${workflow} rejected (${response.status})`);}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const token=process.env.GITHUB_TOKEN,repository=process.env.GITHUB_REPOSITORY;if(!token||repository!=='titodv41/cancha-automation')throw Error('Run inside the Cancha repository workflow');
 const after=/^\d{4}-\d\d-\d\dT/.test(process.env.AFTER||'')?process.env.AFTER:null,started=Date.now(),todo=plan(new Date(started),320,after),fired=[];
 try{
  for(const event of todo){const wait=Date.parse(event.at)-Date.now();if(wait>0)await new Promise(r=>setTimeout(r,wait));
   try{await dispatch(token,repository,'github-instagram.yml',{action:event.action});fired.push(event);console.log(JSON.stringify({fired:event.action,at:event.at}));}
   catch(error){console.error(`${event.action} at ${event.at}: ${error.message}`);}}
  // Sleep out the rest of the budget so the next link starts close to its first event, never hours early.
  const rest=started+320*60000-Date.now();if(rest>0&&!todo.length)await new Promise(r=>setTimeout(r,rest));
 }finally{
  // Always hand over, even after an error, so the chain keeps running.
  const handled=todo.length?todo[todo.length-1].at:(after||null);await dispatch(token,repository,'production-clock.yml',handled?{after:handled}:undefined);console.log(JSON.stringify({handedOver:true,fired:fired.length}));
 }
}
