import {mkdtemp,rm,readFile,writeFile,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';import {join} from 'node:path';import {spawnSync} from 'node:child_process';
import {githubStateClient} from './github-state-client.mjs';import {fetch,ProxyAgent} from 'undici';import fs from 'node:fs';
import {openQueue,saveDraft,dispatchDue,metaPublisher} from '../server/instagram-queue.mjs';
import {snapshotState,restoreState,unsealState} from '../server/github-state.mjs';
import {renewMetaConnection} from '../server/meta-renewal.mjs';
import {queueVersion} from '../server/chat-control.mjs';
import {savePlan,prepareStandingPlan,readPlan} from '../server/instagram-plan.mjs';
import {confirmPostSource} from '../server/post-source.mjs';import {dateInNewYork} from '../server/offer-expiry.mjs';
const mode=process.argv[2]||'review';let db,client,dir;
const dispatcher=process.env.HTTPS_PROXY?new ProxyAgent({uri:process.env.HTTPS_PROXY,...(process.env.SSL_CERT_FILE?{requestTls:{ca:fs.readFileSync(process.env.SSL_CERT_FILE)}}:{})}):undefined;
try{
 if(!['migrate','prepare','publish','review','pause','resume','command','reconnect'].includes(mode))throw Error('Unsupported GitHub automation action');
 client=githubStateClient();let state=await client.load();
 if(mode==='migrate'){
  if(state)throw Error('GitHub state already exists; review it instead of importing again');
  const token=process.env.CANCHA_CONTROL_TOKEN;if(!token||token.length<32)throw Error('Migration needs the existing Render control token in GitHub secrets');
  const response=await fetch('https://cancha-automation.onrender.com/automation/migrate-github',{dispatcher,method:'POST',redirect:'error',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({authorized:true,ownerInstruction:'Move Cancha publishing from Render to GitHub Actions',stateKey:process.env.CANCHA_GITHUB_STATE_KEY}),signal:AbortSignal.timeout(60000)});
  if(!response.ok){await response.body?.cancel();throw Error('Render migration rejected ('+response.status+'); deploy the migration endpoint and verify the control token');}
  state=unsealState(await response.json(),process.env.CANCHA_GITHUB_STATE_KEY);await client.save(state);
  state.cmsBackupRefs||=[];for(const backup of state.cmsBackups||[])state.cmsBackupRefs.push(await client.saveBackup(backup));delete state.cmsBackups;await client.save(state);
 }
 if(!state)throw Error('No migrated state; run the migrate action before enabling the GitHub backend');
 const expected=JSON.parse(await readFile('config/meta-account.json','utf8')),connection=state.connection;
 if(connection?.username!==expected.username||connection?.accountId!==expected.instagramAccountId||connection?.pageId!==expected.pageId||!connection.pageToken)throw Error('Expected Cancha Instagram connection is missing; do not publish');
 dir=await mkdtemp(join(tmpdir(),'cancha-github-'));db=openQueue(join(dir,'queue.sqlite'));restoreState(db,state);
 const checkpoint=async()=>{state=snapshotState(db,connection,state);await client.save(state);};
 if(mode==='migrate'||mode==='resume'){const command=JSON.parse(await readFile('content/instagram/standing-plan-command.json','utf8'));savePlan(db,command.plan,command.ownerInstruction);await checkpoint();}
 if(mode==='pause'){savePlan(db,{enabled:false},'Owner paused daily Instagram through GitHub Actions');await checkpoint();}
 if(mode==='prepare'){
  if(!process.env.FRAMER_API_KEY)throw Error('Daily preparation needs FRAMER_API_KEY in GitHub Actions secrets');
  const run=spawnSync(process.execPath,['scripts/automate-opportunities.mjs'],{stdio:'inherit',env:{...process.env,CANCHA_AUTOMATION_BACKEND:'github'}});if(run.status!==0)throw Error('Daily preparation failed; nothing published');
  // The child persists delivered drafts and backups through the same API.
  db.close();db=openQueue(join(dir,'reloaded.sqlite'));state=await client.load();restoreState(db,state);
 }
 if(mode==='prepare'||mode==='migrate'||mode==='resume'){
  await prepareStandingPlan(db,{connected:true,accountType:connection.accountType||'UNCONFIRMED',verifySource:confirmPostSource});await checkpoint();
 }
 if(mode==='reconnect'){
  const token=process.env.META_PAGE_ACCESS_TOKEN;if(!token)throw Error('Configure META_PAGE_ACCESS_TOKEN in GitHub Actions secrets to reconnect');
  Object.assign(connection,await renewMetaConnection(connection,token,expected,{fetchImpl:(url,options)=>fetch(url,{...options,dispatcher})}));await checkpoint();
 }
 if(mode==='command'){
  // Reuse the authenticated command contract locally; receipts survive runs.
  const command=JSON.parse(await readFile(process.env.CANCHA_COMMAND_FILE||'private-data/github-command.json','utf8'));
  const {createChatControl}=await import('../server/chat-control.mjs');const {Readable}=await import('node:stream');const fixtureToken='local-command-auth-'.repeat(3);
  const control=createChatControl({db,vault:{read:()=>connection},token:fixtureToken,origin:'https://github.com'}),req=Readable.from([Buffer.from(JSON.stringify(command))]);req.method='POST';req.headers={authorization:'Bearer '+fixtureToken,'content-type':'application/json'};let status,result;
  await control.handle(req,{writeHead(code){status=code;},end(bytes){result=JSON.parse(bytes);}},command.action==='plan'?'/automation/plan':'/automation/control');if(status!==200)throw Error('Command rejected; read queue version, ownership instruction and source requirements');await checkpoint();
 }
 if(mode==='publish'){
  const today=dateInNewYork(),all=db.prepare('SELECT * FROM instagram_queue').all();
  if(all.some(row=>['Publishing','Needs reconciliation'].includes(row.status)))throw Error('Uncertain publication requires reconciliation before another automatic post');
  const alreadyPublished=all.some(row=>row.status==='Published'&&(row.published_at||row.scheduled_at)&&dateInNewYork(new Date(row.published_at||row.scheduled_at))===today);
  for(const row of all)if(['Approved','Preparing'].includes(row.status)&&Date.now()-Date.parse(row.scheduled_at)>2*3600000)db.prepare("UPDATE instagram_queue SET status='Draft',approved_hash=NULL,approved_by=NULL,scheduled_at=NULL,container_id=NULL,note='Missed GitHub publishing window; choose fresh content again' WHERE id=?").run(row.id);
  await checkpoint();
  const publisher=metaPublisher({token:connection.pageToken,accountId:connection.accountId,version:connection.version,accountType:connection.accountType,fetchImpl:(url,options)=>fetch(url,{...options,dispatcher})});
  // A runner killed after this checkpoint leaves Publishing, never a retryable approval.
  if(!alreadyPublished)await dispatchDue(db,publisher,{limit:1,verifySource:confirmPostSource,checkpoint});await checkpoint();
 }
 const rows=db.prepare('SELECT * FROM instagram_queue ORDER BY scheduled_at,id').all();const summary={scheduledAutomationEnabled:process.env.CANCHA_SCHEDULE_BACKEND==='github',backend:'github',action:mode,meta:{connected:true,username:connection.username,accountType:connection.accountType},plan:readPlan(db),queue:rows.map(row=>({id:row.id,version:queueVersion(row),status:row.status,scheduledAt:row.scheduled_at,publishedId:row.published_id,note:row.note})),privateSubmissionsBackedUp:state.submissions?.rows?.length||0,cmsBackups:(state.cmsBackupRefs?.length||0)+(state.cmsBackups?.length||0)};
 await mkdir('private-data',{recursive:true,mode:0o700});await writeFile('private-data/github-summary.json',JSON.stringify(summary,null,2),{mode:0o600});
 console.log(JSON.stringify({backend:summary.backend,action:mode,connected:summary.meta.username,planEnabled:summary.plan?.enabled,posts:rows.length,published:rows.filter(row=>row.status==='Published').length,requiresReconciliation:rows.filter(row=>['Publishing','Needs reconciliation'].includes(row.status)).length}));
 if(process.env.GITHUB_STEP_SUMMARY)await writeFile(process.env.GITHUB_STEP_SUMMARY,'## Cancha Instagram\n\n'+JSON.stringify(summary,null,2)+'\n',{flag:'a'});
}catch(error){const message=String(error.message);console.error(/^(Configure|GitHub state|Read current|Encrypted state|State file|Unsupported|GitHub state already|Migration needs|Render migration|No migrated|Expected Cancha|Daily preparation|Command rejected)/.test(message)?message:'Automation stopped safely; inspect configuration and durable state. No automatic retry of uncertain publication.');process.exitCode=1;}finally{db?.close();await client?.close();await dispatcher?.close();if(dir)await rm(dir,{recursive:true,force:true});}
