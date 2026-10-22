import {refreshPhotoEditorial} from '../server/photo-editorial-refresh.mjs';
import {verifyCarouselAssets} from '../server/instagram-media.mjs';
import {expiredPublishingDay} from '../server/github-publish-window.mjs';
import{collectInstagramInsights,instagramLearning,learningSnapshot}from'../server/instagram-insights.mjs';
import{approvedOriginalCreative,shouldActivateLocalCreative}from'../server/social-creative.mjs';
import {mkdtemp,rm,readFile,writeFile,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';import {join} from 'node:path';import {runSubprocess} from './subprocess.mjs';
import {githubStateClient} from './github-state-client.mjs';import {fetch,ProxyAgent} from 'undici';import fs from 'node:fs';
import {openQueue,saveDraft,dispatchDue,metaPublisher} from '../server/instagram-queue.mjs';
import {snapshotState,restoreState,unsealState} from '../server/github-state.mjs';
import {renewMetaConnection} from '../server/meta-renewal.mjs';
import {instagramPreview} from './instagram-preview.mjs';
import {queueVersion} from '../server/chat-control.mjs';
import {savePlan,prepareStandingPlan,readPlan} from '../server/instagram-plan.mjs';
import {confirmPostSource} from '../server/post-source.mjs';import {dateInNewYork} from '../server/offer-expiry.mjs';
import {canPublishFeed} from '../server/instagram-frequency.mjs';
const mode=process.argv[2]||'review';let db,client,dir,phase='load';
const dispatcher=process.env.HTTPS_PROXY?new ProxyAgent({uri:process.env.HTTPS_PROXY,...(process.env.SSL_CERT_FILE?{requestTls:{ca:fs.readFileSync(process.env.SSL_CERT_FILE)}}:{})}):undefined;
try{
 if(!['migrate','prepare','publish','review','pause','resume','command','reconnect','verify','insights','refresh-creative','refresh-community','refresh-local-stories','refresh-photo-stories','repair-media'].includes(mode))throw Error('Unsupported GitHub automation action');
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
 const localPolicy=JSON.parse(await readFile('config/instagram-editorial-policy.json'));
 if(shouldActivateLocalCreative(mode,state,localPolicy)){
  const command=JSON.parse(await readFile('content/instagram/local-plan-command.json')),drafts=JSON.parse(await readFile('content/instagram/launch-refresh-ready.json'));
  if(drafts.length!==3||drafts.some(x=>!approvedOriginalCreative(x)))throw Error('Reviewed local creative assets are missing');
  savePlan(db,{enabled:false},'Replace the rejected old creative with the owner-requested local discovery approach');
  for(const draft of drafts)saveDraft(db,draft);
  savePlan(db,command.plan,command.ownerInstruction);state.localCreativeVersion=localPolicy.requiredCreativeVersion;await checkpoint();
 }
 if(mode==='refresh-community'){
  const drafts=JSON.parse(await readFile('content/instagram/community-ready.json'));
  if(drafts.length!==3||drafts.some(x=>!approvedOriginalCreative(x)||x.topic!=='community'))throw Error('Reviewed community assets are missing or stale');
  for(const draft of drafts){const old=db.prepare('SELECT status FROM instagram_queue WHERE id=?').get(draft.id);if(!old||old.status==='Draft')saveDraft(db,draft)}
  for(const id of localPolicy.retiredDraftIds||[])db.prepare("UPDATE instagram_queue SET note='Retired from automatic selection: community-first content direction' WHERE id=? AND status='Draft'").run(id);
  state.communityEditorialRevision='2026-10-21';await checkpoint();
 }
 if(mode==='refresh-local-stories'){
  const drafts=JSON.parse(await readFile('content/instagram/local-stories-ready.json'));
  if(!drafts.length||drafts.length>10||drafts.some(x=>!approvedOriginalCreative(x)||!['local-story','community-question'].includes(x.visualEvidence.kind)))throw Error('Reviewed local stories are missing or stale');
  // Check the entire batch before checkpointing; never replace owner approvals or receipts.
  for(const draft of drafts){let valid=false;try{valid=await confirmPostSource(draft)===true}catch{}if(!valid)throw Error('Reviewed local story blocked: '+draft.id)}
  for(const draft of drafts){const old=db.prepare('SELECT status FROM instagram_queue WHERE id=?').get(draft.id);if(!old||old.status==='Draft')saveDraft(db,draft)}
  state.localStoriesRevision='2026-10-22';await checkpoint();
 }
 if(mode==='refresh-photo-stories'){
  const drafts=JSON.parse(await readFile('content/instagram/photo-editorial-ready.json'));
  // Check the whole batch before any queue write. Public assets carry no Meta token.
  for(const draft of drafts){if(!await confirmPostSource(draft))throw Error('Reviewed local story blocked: '+draft.id);await verifyCarouselAssets(draft,{fetchImpl:(u,o)=>fetch(u,{...o,dispatcher})});}
  const result=refreshPhotoEditorial(db,drafts);state.photoEditorialRevision='2026-10-22';state.photoEditorialRefresh=result;await checkpoint();console.log(JSON.stringify({photoEditorial:result}));
 }
 if(mode==='repair-media'){if(!process.env.FRAMER_API_KEY)throw Error('Daily preparation needs the existing Framer secret');const run=await runSubprocess(process.execPath,['scripts/repair-reviewed-club-media.mjs'],{stdio:'inherit',env:{...process.env,CANCHA_AUTOMATION_BACKEND:'github'}});if(run.status!==0)throw Error('Daily preparation media repair stopped');await client.close();client=githubStateClient();state=await client.load();}
 if(mode==='prepare'){
  if(!process.env.FRAMER_API_KEY)throw Error('Daily preparation needs FRAMER_API_KEY in GitHub Actions secrets');
  const run=await runSubprocess(process.execPath,['scripts/automate-opportunities.mjs'],{stdio:'inherit',env:{...process.env,CANCHA_AUTOMATION_BACKEND:'github'}});if(run.status!==0)throw Error('Daily preparation failed; nothing published');
  // The child persists delivered drafts and backups through the same API.
  phase='reload-db';db.close();db=openQueue(join(dir,'reloaded.sqlite'));phase='reload-state';await client.close();client=githubStateClient();state=await client.load();phase='restore-state';restoreState(db,state);
  phase='growth-report';const growthDir='private-data/daily-opportunities/'+dateInNewYork(),dailyResult=JSON.parse(await readFile(growthDir+'/automation-result.json'));state.growth={...JSON.parse(await readFile(growthDir+'/report.json','utf8')).growth,clubProfilesAdded:dailyResult.clubProfilesAdded||0,clubCandidatesRemaining:dailyResult.clubCandidatesRemaining||0,automationBlockers:dailyResult.blockers||[]};
 }
 if(mode==='prepare'||mode==='migrate'||mode==='resume'||mode==='refresh-creative'||mode==='refresh-community'||mode==='refresh-local-stories'||mode==='refresh-photo-stories'){
  const creativePolicy=JSON.parse(await readFile('config/instagram-editorial-policy.json'));
  const launchNotPublished=state.localCreativeVersion==='cancha-local-v2'&&!db.prepare("SELECT id FROM instagram_queue WHERE id='cancha-local-discovery' AND status='Published'").get();
  phase='standing-plan';await prepareStandingPlan(db,{connected:true,accountType:connection.accountType||'UNCONFIRMED',verifySource:confirmPostSource,requireBrandPhotos:true,requireCreativeVersion:creativePolicy.requiredCreativeVersion||null,preferredDraftId:launchNotPublished?'cancha-local-discovery':null,editorialPolicy:creativePolicy});await checkpoint();
 }
 if(mode==='verify')await renewMetaConnection(connection,connection.pageToken,expected,{fetchImpl:(url,options)=>fetch(url,{...options,dispatcher})});
 if(mode==='insights'){
  const report=await collectInstagramInsights(connection,db.prepare("SELECT * FROM instagram_queue WHERE status='Published' ORDER BY published_at").all(),{fetchImpl:(url,options)=>fetch(url,{...options,dispatcher})});
  state.instagramInsights=[...(state.instagramInsights||[]).slice(-34),learningSnapshot(report)];const learning=instagramLearning(state.instagramInsights);report.topicComparison=learning.topicComparison;report.ageCohortHours=learning.ageCohortHours;report.learningNote=learning.note||'Comparable cohort found; topic preference is an experiment, not proof of causation or guaranteed reach.';await checkpoint();await mkdir('private-data',{recursive:true,mode:0o700});await writeFile('private-data/instagram-insights.json',JSON.stringify(report,null,2),{mode:0o600});console.log(JSON.stringify({readOnlyInsights:true,status:report.status,posts:report.posts.length,requiredPermission:report.requiredPermission,comparableTopics:learning.topicComparison.length}));
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
  const mayPublish=canPublishFeed(all,readPlan(db));
  for(const row of all)if(['Approved','Preparing'].includes(row.status)&&expiredPublishingDay(row.scheduled_at))db.prepare("UPDATE instagram_queue SET status='Draft',approved_hash=NULL,approved_by=NULL,scheduled_at=NULL,container_id=NULL,note='Scheduled New York day ended; choose fresh content again' WHERE id=?").run(row.id);
  await checkpoint();
  const publisher=metaPublisher({token:connection.pageToken,accountId:connection.accountId,version:connection.version,accountType:connection.accountType,fetchImpl:(url,options)=>fetch(url,{...options,dispatcher})});
  // A runner killed after this checkpoint leaves Publishing, never a retryable approval.
  if(mayPublish)await dispatchDue(db,publisher,{limit:1,verifySource:confirmPostSource,checkpoint});await checkpoint();
 }
 const rows=db.prepare('SELECT * FROM instagram_queue ORDER BY scheduled_at,id').all();const summary={growth:state.growth||null,scheduledAutomationEnabled:process.env.CANCHA_SCHEDULE_BACKEND==='github',backend:'github',action:mode,meta:{connected:true,username:connection.username,accountType:connection.accountType},plan:readPlan(db),queue:rows.map(row=>({id:row.id,version:queueVersion(row),status:row.status,scheduledAt:row.scheduled_at,publishedId:row.published_id,note:row.note,slideCount:JSON.parse(row.content).slides?.length||1,creativeKind:JSON.parse(row.content).visualEvidence?.kind||null})),privateSubmissionsBackedUp:state.submissions?.rows?.length||0,cmsBackups:(state.cmsBackupRefs?.length||0)+(state.cmsBackups?.length||0),photoEditorialRefresh:state.photoEditorialRefresh||null};
 await mkdir('private-data',{recursive:true,mode:0o700});await writeFile('private-data/github-summary.json',JSON.stringify(summary,null,2),{mode:0o600});
 if(mode==='review')await writeFile('private-data/instagram-preview.html',instagramPreview(rows,summary.plan),{mode:0o600});
 console.log(JSON.stringify({backend:summary.backend,action:mode,connected:summary.meta.username,planEnabled:summary.plan?.enabled,posts:rows.length,published:rows.filter(row=>row.status==='Published').length,requiresReconciliation:rows.filter(row=>['Publishing','Needs reconciliation'].includes(row.status)).length}));
 if(process.env.GITHUB_STEP_SUMMARY)await writeFile(process.env.GITHUB_STEP_SUMMARY,'## Cancha Instagram\n\n'+JSON.stringify(summary,null,2)+'\n',{flag:'a'});
}catch(error){console.error(JSON.stringify({phase,errorType:error.constructor.name,code:error.code||null,frames:String(error.stack||'').split('\n').slice(1,3)}));const message=String(error.message);console.error(/^(Configure|GitHub state|Read current|Encrypted state|State file|Unsupported|GitHub state already|Migration needs|Render migration|No migrated|Expected Cancha|Daily preparation|Command rejected|Reviewed local story)/.test(message)?message:'Automation stopped safely; inspect configuration and durable state. No automatic retry of uncertain publication.');process.exitCode=1;}finally{db?.close();await client?.close();await dispatcher?.close();if(dir)await rm(dir,{recursive:true,force:true});}
