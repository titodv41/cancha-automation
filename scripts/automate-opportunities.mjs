import {spawnSync} from 'node:child_process';import {readFile,writeFile,mkdir} from 'node:fs/promises';import {dateInNewYork} from '../server/offer-expiry.mjs';import {opportunityPost} from '../server/opportunity-content.mjs';import {sendPrivate} from './automation-service-client.mjs';
function run(script,args=[]){const result=spawnSync(process.execPath,[script,...args],{stdio:'inherit'});if(result.status!==0)throw Error('Automation step failed: '+script);}
const dir=`private-data/daily-opportunities/${dateInNewYork()}`,result={prepared:0,staged:0,instagramDrafts:0,deliveredToPrivateQueue:false,published:false,blockers:[]};await mkdir(dir,{recursive:true,mode:0o700});
const canWrite=!!process.env.FRAMER_API_KEY&&!!process.env.CANCHA_AUTOMATION_URL&&!!process.env.CANCHA_AUTOMATION_INGEST_SECRET;
run('scripts/daily-opportunities.mjs',canWrite?['--apply-statuses','--private-backup']:[]);run('scripts/prepare-opportunities.mjs');const rows=JSON.parse(await readFile(dir+'/ready.json'));result.prepared=rows.length;
const connected=!!process.env.FRAMER_API_KEY,service=!!process.env.CANCHA_AUTOMATION_URL&&!!process.env.CANCHA_AUTOMATION_INGEST_SECRET;
if(!connected)result.blockers.push('Secure FRAMER_API_KEY is not configured in this runner; prepared source-checked batches remain artifacts.');
if(!service)result.blockers.push('Private automation service and signed ingestion are not configured; durable private backups and Instagram delivery are unavailable.');
run('scripts/prepare-editorial.mjs');const editorial=JSON.parse(await readFile(dir+'/editorial-drafts.json'));
if(rows.length||editorial.length){
 const posts=[...rows.map(opportunityPost),...editorial].slice(0,5),file=dir+'/instagram-drafts.json',assets=dir+'/instagram-assets';await writeFile(file,JSON.stringify(posts,null,2),{mode:0o600});run('scripts/render-instagram.mjs',[file,assets]);result.instagramDrafts=posts.length;
 if(connected){run('scripts/upload-instagram-assets.mjs',[file,assets]);}
 // Deliver Drafts first: if delivery fails, leave CMS unchanged so discovery
 // can retry tomorrow. Draft ingestion is idempotent and cannot approve posts.
 if(connected&&service){await sendPrivate('/automation/drafts',JSON.parse(await readFile(file)));result.deliveredToPrivateQueue=true;if(rows.length)run('scripts/stage-opportunities.mjs',[dir+'/ready.json','--ready-for-publish','--apply','--private-backup']);result.staged=rows.length;}
}
await writeFile(dir+'/automation-result.json',JSON.stringify(result,null,2),{mode:0o600});console.log(JSON.stringify(result));
