import {pathToFileURL} from 'node:url';import {resolve} from 'node:path';import {newYorkSchedule} from '../server/scheduling.mjs';
// GitHub often starts scheduled runs 1-3 hours late, which missed authorized feed slots.
// This waiter starts early, sleeps until each slot and dispatches the existing publisher;
// the publisher alone decides whether anything posts (daily/weekly caps, spacing, review).
export const slotTimes=['12:30','18:00'];
const nyDate=at=>new Intl.DateTimeFormat('sv-SE',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(at);
export function nextSlot(now=new Date(),{lead=150,grace=80,times=slotTimes}={}){
 for(const offset of [0,1]){const day=new Date(now.getTime()+offset*86400000),date=nyDate(day);
  for(const time of times){const slot=Date.parse(newYorkSchedule(date+'T'+time)),minutes=(slot-now.getTime())/60000;if(minutes<=lead&&minutes>=-grace)return {slot:new Date(slot).toISOString(),minutes};}}
 return null;
}
// Dispatch once shortly before the slot (so the publisher books and prepares it) and once just after it (so it posts).
// A late waiter skips the passed pre-slot step but still dispatches the post-slot step at once (late-slot recovery).
export function dispatchPlan(slot,now=new Date()){const at=Date.parse(slot),pre=at-20*60000,post=at+2*60000;return [...(pre>=now.getTime()?[pre]:[]),Math.max(post,now.getTime())].map(t=>new Date(t).toISOString());}
const api=(token,repository,path,init={})=>fetch(`https://api.github.com/repos/${repository}${path}`,{...init,headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},signal:AbortSignal.timeout(30000)});
// One dispatch per step per slot, even when several delayed waiters run back to back.
async function dispatchedSince(token,repository,since){const response=await api(token,repository,`/actions/workflows/github-instagram.yml/runs?event=workflow_dispatch&created=%3E%3D${encodeURIComponent(since)}&per_page=10`);if(!response.ok)throw Error('Run listing rejected ('+response.status+')');return (await response.json()).total_count>0;}
async function dispatch(token,repository){const response=await api(token,repository,'/actions/workflows/github-instagram.yml/dispatches',{method:'POST',body:JSON.stringify({ref:'main',inputs:{action:'publish'}})});if(response.status!==204)throw Error('Publisher dispatch rejected ('+response.status+')');}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const token=process.env.GITHUB_TOKEN,repository=process.env.GITHUB_REPOSITORY;if(!token||repository!=='titodv41/cancha-automation')throw Error('Run inside the Cancha repository workflow');
 const next=nextSlot();if(!next){console.log(JSON.stringify({slot:null,dispatched:0}));process.exit(0);}
 const plan=dispatchPlan(next.slot);let dispatched=0;
 for(const at of plan){const wait=Date.parse(at)-Date.now();if(wait>0)await new Promise(r=>setTimeout(r,wait));
  const before=Date.parse(at)<Date.parse(next.slot),since=new Date(Date.parse(next.slot)-(before?25:0)*60000).toISOString();
  if(await dispatchedSince(token,repository,since))continue;await dispatch(token,repository);dispatched++;}
 console.log(JSON.stringify({slot:next.slot,dispatched}));
}
