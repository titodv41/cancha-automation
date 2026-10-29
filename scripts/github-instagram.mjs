import {shortReelAllowed} from '../server/short-reels.mjs';
import {comparisonCarouselAllowed,comparisonReelAllowed} from '../server/comparison-carousels.mjs';
import {contentReadiness} from '../server/content-readiness.mjs';
import {verifyProductAssets,refreshProductEditorial} from '../server/product-editorial.mjs';
import{refreshMotionEditorial}from'../server/motion-editorial-refresh.mjs';
import {satisfiesDailyMediaMix} from '../server/instagram-media-mix.mjs';
import {refreshPhotoEditorial} from '../server/photo-editorial-refresh.mjs';
import {verifyCarouselAssets,verifyReelAssets} from '../server/instagram-media.mjs';
import {expiredPublishingDay} from '../server/github-publish-window.mjs';
import{collectInstagramInsights,instagramLearning,learningSnapshot,techniqueLearning}from'../server/instagram-insights.mjs';
import{approvedOriginalCreative,shouldActivateLocalCreative}from'../server/social-creative.mjs';
import {mkdtemp,rm,readFile,writeFile,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';import {join} from 'node:path';import {runSubprocess} from './subprocess.mjs';
import {githubStateClient} from './github-state-client.mjs';import {fetch,ProxyAgent} from 'undici';import fs from 'node:fs';
import {openQueue,saveDraft,dispatchDue,metaPublisher} from '../server/instagram-queue.mjs';
import {snapshotState,restoreState,unsealState} from '../server/github-state.mjs';
import {renewMetaConnection} from '../server/meta-renewal.mjs';
import {verifyMetaInsightsConnection,MetaInsightsConnectionError} from '../server/meta-insights-connection.mjs';
import {inspectMetaTokens} from '../server/meta-token-diagnostic.mjs';
import {prepareMetaInsightsFromUser,checkMetaPageCredential} from '../server/meta-insights-user-connection.mjs';
import {insightsReportArtifact} from '../server/insights-report-artifact.mjs';
import {instagramPreview} from './instagram-preview.mjs';
import {queueVersion} from '../server/chat-control.mjs';
import {savePlan,prepareStandingPlan,readPlan} from '../server/instagram-plan.mjs';
import {confirmPostSource} from '../server/post-source.mjs';import {dateInNewYork} from '../server/offer-expiry.mjs';
import {canPublishFeed} from '../server/instagram-frequency.mjs';
const mode=process.argv[2]||'review';let db,client,dir,phase='load';
const dispatcher=process.env.HTTPS_PROXY?new ProxyAgent({uri:process.env.HTTPS_PROXY,...(process.env.SSL_CERT_FILE?{requestTls:{ca:fs.readFileSync(process.env.SSL_CERT_FILE)}}:{})}):undefined;
try{
 if(!['migrate','prepare','publish','review','pause','resume','command','reconnect','connect-insights','connect-insights-user','diagnose-insights','verify','insights','refresh-creative','refresh-community','refresh-local-stories','refresh-photo-stories','refresh-product-posts','refresh-motion-stories','refresh-short-reels','refresh-comparison-carousels','repair-media','replenish'].includes(mode))throw Error('Unsupported GitHub automation action');
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
 if(mode==='refresh-comparison-carousels'){
  // Type-led comparison carousels and their Reel versions hosted on Framer by scripts/prepare-comparison-carousels.mjs. Only policy-approved ones are imported.
  if(!localPolicy.comparisonCarouselsEnabled)throw Error('Comparison carousels are not enabled in the editorial policy');
  const drafts=JSON.parse(await readFile(process.env.COMPARISON_CAROUSELS_FILE||'private-data/comparison-carousels-ready.json'));
  if(!drafts.length||drafts.length>10||drafts.some(x=>!approvedOriginalCreative(x)||!comparisonCarouselAllowed(x,localPolicy)&&!comparisonReelAllowed(x,localPolicy)))throw Error('Comparison carousels are missing, unapproved or stale');
  // Check the entire batch before any queue write; never replace owner approvals or receipts.
  for(const draft of drafts){if(!await confirmPostSource(draft))throw Error('Organizer page changed: '+draft.id);await (draft.reel?verifyReelAssets:verifyCarouselAssets)(draft,{fetchImpl:(u,o)=>fetch(u,{...o,dispatcher})});}
  for(const draft of drafts){const old=db.prepare('SELECT status FROM instagram_queue WHERE id=?').get(draft.id);if(!old||old.status==='Draft')saveDraft(db,draft)}
  state.comparisonCarouselsRefresh={importedAt:new Date().toISOString(),ids:drafts.map(d=>d.id)};await checkpoint();
 }
 if(mode==='refresh-short-reels'){
  // Rendered short Reels hosted on Framer by scripts/prepare-short-reels.mjs. Only policy-approved recipes are imported.
  if(!localPolicy.shortReelsEnabled)throw Error('Short Reels are not enabled in the editorial policy');
  const drafts=JSON.parse(await readFile(process.env.SHORT_REELS_FILE||'private-data/short-reels-ready.json'));
  if(!drafts.length||drafts.length>10||drafts.some(x=>!approvedOriginalCreative(x)||!shortReelAllowed(x,localPolicy)))throw Error('Short Reels are missing, unapproved or stale');
  // Check the entire batch before any queue write; never replace owner approvals or receipts.
  for(const draft of drafts)await verifyReelAssets(draft,{fetchImpl:(u,o)=>fetch(u,{...o,dispatcher})});
  for(const draft of drafts){const old=db.prepare('SELECT status FROM instagram_queue WHERE id=?').get(draft.id);if(!old||old.status==='Draft')saveDraft(db,draft)}
  state.shortReelsRefresh={importedAt:new Date().toISOString(),ids:drafts.map(d=>d.id)};await checkpoint();
 }
 if(mode==='refresh-photo-stories'){
  const drafts=JSON.parse(await readFile('content/instagram/photo-editorial-ready.json'));
  // Check the whole batch before any queue write. Public assets carry no Meta token.
  for(const draft of drafts){if(!await confirmPostSource(draft))throw Error('Reviewed local story blocked: '+draft.id);await verifyCarouselAssets(draft,{fetchImpl:(u,o)=>fetch(u,{...o,dispatcher})});}
  const result=refreshPhotoEditorial(db,drafts);state.photoEditorialRevision='2026-10-23-card-mix';state.photoEditorialRefresh=result;await checkpoint();console.log(JSON.stringify({photoEditorial:result}));
 }
 if(mode==='refresh-product-posts'){
  const drafts=JSON.parse(await readFile('content/instagram/product-editorial-ready.json'));
  for(const draft of drafts){if(!await confirmPostSource(draft))throw Error('Cancha directory is unavailable');await verifyProductAssets(draft,localPolicy,{fetchImpl:(u,o)=>fetch(u,{...o,dispatcher})});}
  state.productEditorialRefresh=refreshProductEditorial(db,drafts,localPolicy);await checkpoint();console.log(JSON.stringify({productEditorial:state.productEditorialRefresh}));
 }
 if(mode==='refresh-motion-stories'){
  if(!localPolicy.allowMotionStories||localPolicy.videoCreativeReviewRequired)throw Error('Reviewed motion import paused while the owner reviews the new video direction');
  const drafts=JSON.parse(await readFile('content/instagram/motion-ready.json'));
  if(!drafts.length||drafts.length>5||drafts.some(r=>!approvedOriginalCreative(r)||!['motion-story','animated-explainer'].includes(r.visualEvidence.kind)))throw Error('Reviewed motion stories missing or stale');
  for(const draft of drafts){if(!await confirmPostSource(draft))throw Error('Reviewed local story blocked: '+draft.id);await verifyReelAssets(draft,{fetchImpl:(u,o)=>fetch(u,{...o,dispatcher})})}
  state.motionPreflights||={};
  for(const sample of drafts){
   const previous=state.motionPreflights[sample.id]||state.motionPreflight;
   if(previous?.assetChecksum===sample.reel.assetChecksum&&previous?.status==='FINISHED'){state.motionPreflights[sample.id]=previous;continue;}
   const media=metaPublisher({token:connection.pageToken,accountId:connection.accountId,version:connection.version,accountType:connection.accountType,fetchImpl:(u,o)=>fetch(u,{...o,dispatcher})});
   state.motionPreflightPending||={};const pending=state.motionPreflightPending[sample.id];
   const reusable=pending?.assetChecksum===sample.reel.assetChecksum&&Date.now()-Date.parse(pending.createdAt)<23*3600000;
   const container=reusable?pending.containerId:await media.create(sample);let status='IN_PROGRESS';
   state.motionPreflightPending[sample.id]={assetChecksum:sample.reel.assetChecksum,containerId:container,createdAt:reusable?pending.createdAt:new Date().toISOString()};await checkpoint();
   for(let check=0;check<60;check++){status=await media.status(container);if(status!=='IN_PROGRESS')break;await new Promise(resolve=>setTimeout(resolve,3000))}
   if(status!=='FINISHED'){if(status!=='IN_PROGRESS')delete state.motionPreflightPending[sample.id];await checkpoint();throw Error('Reviewed motion processing not ready: '+status)}
   // Processing only: the pending ID stays in encrypted state and is discarded
   // when finished. The scheduled publisher always creates a fresh container.
   state.motionPreflight={assetChecksum:sample.reel.assetChecksum,status,checkedAt:new Date().toISOString(),published:false,freshContainerAtSchedule:true};
   state.motionPreflights[sample.id]=state.motionPreflight;delete state.motionPreflightPending[sample.id];await checkpoint();
  }
  state.motionEditorialRefresh=refreshMotionEditorial(db,drafts);
  state.motionRevision='2026-10-22';await checkpoint();
 }
 if(mode==='repair-media'){if(!process.env.FRAMER_API_KEY)throw Error('Daily preparation needs the existing Framer secret');const run=await runSubprocess(process.execPath,['scripts/repair-reviewed-club-media.mjs'],{stdio:'inherit',env:{...process.env,CANCHA_AUTOMATION_BACKEND:'github'}});if(run.status!==0)throw Error('Daily preparation media repair stopped');await client.close();client=githubStateClient();state=await client.load();}
 if(mode==='replenish'){
  if(!process.env.FRAMER_API_KEY)throw Error('Daily preparation needs the existing Framer secret');
  const reports={};
  for(const [key,script]of [['newsSources','scripts/refresh-local-updates.mjs'],['directory','scripts/prepare-directory-editorial.mjs'],['narrative','scripts/prepare-narrative-editorial.mjs'],['automaticNews','scripts/prepare-automatic-news.mjs']]){const run=await runSubprocess(process.execPath,[script],{stdio:'inherit',env:{...process.env,CANCHA_AUTOMATION_BACKEND:'github'}});if(run.status!==0)reports[key]={blocked:true};}
  phase='reload-content';db.close();db=openQueue(join(dir,'content.sqlite'));await client.close();client=githubStateClient();state=await client.load();restoreState(db,state);
  const directoryReport=JSON.parse(await readFile('private-data/daily-opportunities/'+dateInNewYork()+'/directory-editorial/report.json').catch(()=>'null')),narrativeReport=JSON.parse(await readFile('private-data/narrative-production/report.json').catch(()=>'null'));
  state.contentPreparation={checkedAt:new Date().toISOString(),directory:directoryReport?{prepared:directoryReport.prepared,delivered:directoryReport.delivered,availableBefore:directoryReport.availableBefore,blocked:directoryReport.blocked}:reports.directory||null,narrative:narrativeReport,automaticNews:JSON.parse(await readFile('private-data/automatic-news/report.json').catch(()=>'null')),processFailures:reports};await checkpoint();
 }
 if(mode==='prepare'){
  if(!process.env.FRAMER_API_KEY)throw Error('Daily preparation needs FRAMER_API_KEY in GitHub Actions secrets');
  const run=await runSubprocess(process.execPath,['scripts/automate-opportunities.mjs'],{stdio:'inherit',env:{...process.env,CANCHA_AUTOMATION_BACKEND:'github'}});if(run.status!==0)throw Error('Daily preparation failed; nothing published');
  // The child persists delivered drafts and backups through the same API.
  phase='reload-db';db.close();db=openQueue(join(dir,'reloaded.sqlite'));phase='reload-state';await client.close();client=githubStateClient();state=await client.load();phase='restore-state';restoreState(db,state);
  phase='growth-report';const growthDir='private-data/daily-opportunities/'+dateInNewYork(),dailyResult=JSON.parse(await readFile(growthDir+'/automation-result.json'));state.growth={...JSON.parse(await readFile(growthDir+'/report.json','utf8')).growth,clubProfilesAdded:dailyResult.clubProfilesAdded||0,clubCandidatesRemaining:dailyResult.clubCandidatesRemaining||0,automationBlockers:dailyResult.blockers||[]};
  state.dailyPreparation={completedOn:dateInNewYork(),completedAt:new Date().toISOString(),opportunitiesStaged:dailyResult.staged||0,clubProfilesAdded:dailyResult.clubProfilesAdded||0,published:dailyResult.published===true,blockers:dailyResult.blockers||[]};
 }
 if(mode==='prepare'||mode==='replenish'||mode==='publish'||mode==='migrate'||mode==='resume'||mode==='refresh-creative'||mode==='refresh-community'||mode==='refresh-local-stories'||mode==='refresh-photo-stories'||mode==='refresh-product-posts'||mode==='refresh-motion-stories'||mode==='refresh-short-reels'||mode==='refresh-comparison-carousels'){
  const creativePolicy=JSON.parse(await readFile('config/instagram-editorial-policy.json'));
  // A draft retired after the plan approved it holds its slot and never posts (Oct 29, 6 PM); release it so the plan can refill the slot.
  for(const id of creativePolicy.retiredDraftIds||[])db.prepare("UPDATE instagram_queue SET status='Draft',approved_hash=NULL,approved_by=NULL,scheduled_at=NULL,container_id=NULL,note='Retired after approval; slot released' WHERE id=? AND status IN ('Approved','Preparing')").run(id);
  const launchNotPublished=state.localCreativeVersion==='cancha-local-v2'&&!db.prepare("SELECT id FROM instagram_queue WHERE id='cancha-local-discovery' AND status='Published'").get();
  phase='standing-plan';await prepareStandingPlan(db,{connected:true,accountType:connection.accountType||'UNCONFIRMED',verifySource:confirmPostSource,requireBrandPhotos:true,requireCreativeVersion:creativePolicy.requiredCreativeVersion||null,preferredDraftId:launchNotPublished?'cancha-local-discovery':null,editorialPolicy:creativePolicy});await checkpoint();
 }
 if(mode==='verify')await renewMetaConnection(connection,connection.pageToken,expected,{fetchImpl:(url,options)=>fetch(url,{...options,dispatcher})});
 if(mode==='diagnose-insights'){
  phase='inspect-token-permissions';await mkdir('private-data',{recursive:true,mode:0o700});
  try{
   const tokens=[{name:'stored-publisher',value:connection.pageToken},...(process.env.META_PAGE_ACCESS_TOKEN?[{name:'saved-replacement',value:process.env.META_PAGE_ACCESS_TOKEN}]:[])];
   const report=await inspectMetaTokens({appSecret:process.env.META_APP_SECRET,expected,version:connection.version,tokens,fetchImpl:(url,options)=>fetch(url,{...options,dispatcher})});
   await writeFile('private-data/meta-token-diagnostic.json',JSON.stringify(report,null,2),{mode:0o600});
   if(process.env.GITHUB_STEP_SUMMARY)await writeFile(process.env.GITHUB_STEP_SUMMARY,'## Meta token permissions\n\n'+JSON.stringify(report,null,2)+'\n',{flag:'a'});
   console.log(JSON.stringify({tokenDiagnostic:report.status,connectionUpdated:false,publishingAttempted:false}));
  }catch(error){
   const code=/^META_DIAGNOSTIC_[A-Z_]+$/.test(error.code||'')?error.code:'META_DIAGNOSTIC_REQUEST_FAILED';
   await writeFile('private-data/meta-token-diagnostic.json',JSON.stringify({checkedAt:new Date().toISOString(),status:'blocked',code,connectionUpdated:false,publishingAttempted:false},null,2),{mode:0o600});throw error;
  }
 }
 if(mode==='insights'){
  const report=await collectInstagramInsights(connection,db.prepare("SELECT * FROM instagram_queue WHERE status='Published' ORDER BY published_at").all(),{fetchImpl:(url,options)=>fetch(url,{...options,dispatcher})});
  state.instagramInsights=[...(state.instagramInsights||[]).slice(-34),learningSnapshot(report)];const learning=instagramLearning(state.instagramInsights);report.topicComparison=learning.topicComparison;report.techniqueLearning=techniqueLearning(state.instagramInsights);report.ageCohortHours=learning.ageCohortHours;report.learningNote=learning.note||'Comparable cohort found; topic preference is an experiment, not proof of causation or guaranteed reach.';await checkpoint();await mkdir('private-data',{recursive:true,mode:0o700});await writeFile('private-data/instagram-insights.json',JSON.stringify(report,null,2),{mode:0o600});console.log(JSON.stringify({readOnlyInsights:true,status:report.status,posts:report.posts.length,requiredPermission:report.requiredPermission,comparableTopics:learning.topicComparison.length}));
 }
 if(mode==='reconnect'){
  const token=process.env.META_PAGE_ACCESS_TOKEN;if(!token)throw Error('Configure META_PAGE_ACCESS_TOKEN in GitHub Actions secrets to reconnect');
  Object.assign(connection,await renewMetaConnection(connection,token,expected,{fetchImpl:(url,options)=>fetch(url,{...options,dispatcher})}));await checkpoint();
 }
 if(mode==='connect-insights'||mode==='connect-insights-user'){
  await mkdir('private-data',{recursive:true,mode:0o700});
  let verified;
  try{
   const fetchImpl=(url,options)=>fetch(url,{...options,dispatcher}),published=db.prepare("SELECT * FROM instagram_queue WHERE status='Published' ORDER BY published_at").all();
   if(mode==='connect-insights-user')verified=await prepareMetaInsightsFromUser({connection,userToken:process.env.META_USER_ACCESS_TOKEN,appSecret:process.env.META_APP_SECRET,expected,published,fetchImpl});
   else{await checkMetaPageCredential({token:process.env.META_PAGE_ACCESS_TOKEN,appSecret:process.env.META_APP_SECRET,expected,version:connection.version,fetchImpl});verified=await verifyMetaInsightsConnection(connection,process.env.META_PAGE_ACCESS_TOKEN,expected,published,{fetchImpl});}
  }catch(error){
   const code=/^META_INSIGHTS_[A-Z_]+$/.test(error.code||'')?error.code:'META_INSIGHTS_CONNECTION_FAILED';
   await writeFile('private-data/meta-insights-connection.json',JSON.stringify({checkedAt:new Date().toISOString(),status:'blocked',code,diagnostic:error instanceof MetaInsightsConnectionError?error.diagnostic||null:null,connectionUpdated:false,publishingAttempted:false},null,2),{mode:0o600});
   if(process.env.GITHUB_STEP_SUMMARY)await writeFile(process.env.GITHUB_STEP_SUMMARY,'## Instagram Insights needs attention\n\n'+code+'. Inspect the connection receipt and follow docs/instagram-insights-connection.md. No publication was attempted.\n',{flag:'a'});
   throw error;
  }
  Object.assign(connection,verified.connection);
  state.instagramInsights=[...(state.instagramInsights||[]).slice(-34),learningSnapshot(verified.report)];
  state.insightsConnection=verified.receipt;await checkpoint();
  await writeFile('private-data/meta-insights-connection.json',JSON.stringify({...verified.receipt,connectionUpdated:true},null,2),{mode:0o600});
  await writeFile('private-data/instagram-insights.json',JSON.stringify(verified.report,null,2),{mode:0o600});
  if(process.env.GITHUB_STEP_SUMMARY)await writeFile(process.env.GITHUB_STEP_SUMMARY,'## Instagram Insights connected\n\nExact Cancha Page and Instagram identity verified. Reach, saves and shares read on '+verified.receipt.postsWithCoreMetrics+' post(s). The replacement Page token is now stored encrypted. No post was published.\n',{flag:'a'});
 }
 if(['insights','connect-insights','connect-insights-user'].includes(mode)){
  const report=JSON.parse(await readFile('private-data/instagram-insights.json','utf8'));
  const sealed=insightsReportArtifact(report,process.env.CANCHA_GITHUB_STATE_KEY);
  await writeFile('private-data/instagram-insights.enc.json',JSON.stringify(sealed.envelope),{mode:0o600});
  await writeFile('private-data/instagram-insights-status.json',JSON.stringify(sealed.status,null,2),{mode:0o600});
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
  const publisher=metaPublisher({token:connection.pageToken,accountId:connection.accountId,version:connection.version,accountType:connection.accountType,collabInvites:localPolicy.collabInvitesEnabled===true,fetchImpl:(url,options)=>fetch(url,{...options,dispatcher})});
  // A runner killed after this checkpoint leaves Publishing, never a retryable approval.
  const due=db.prepare("SELECT content FROM instagram_queue WHERE status IN ('Approved','Preparing') AND scheduled_at<=? ORDER BY scheduled_at LIMIT 1").get(new Date().toISOString());const mixAllowed=!due||satisfiesDailyMediaMix(JSON.parse(due.content),db.prepare('SELECT * FROM instagram_queue').all(),localPolicy);if(mayPublish&&mixAllowed&&due&&JSON.parse(due.content).visualEvidence?.kind==='product-demo')await verifyProductAssets(JSON.parse(due.content),localPolicy,{fetchImpl:(u,o)=>fetch(u,{...o,dispatcher})});if(mayPublish&&mixAllowed)await dispatchDue(db,publisher,{limit:1,verifySource:confirmPostSource,checkpoint});await checkpoint();
 }
 const rows=db.prepare('SELECT * FROM instagram_queue ORDER BY scheduled_at,id').all();if(mode==='replenish'){state.contentPreparation={...state.contentPreparation,...contentReadiness(rows,localPolicy)};await checkpoint();}const voiceSettings=JSON.parse(await readFile('config/automatic-stories.json')),voiceMonth=new Date().toISOString().slice(0,7),voiceReserved=state.voiceLedger?.months?.[voiceMonth]??(voiceSettings.baseline.month===voiceMonth?voiceSettings.baseline.reservedCharacters:0);const summary={voiceBudget:{month:voiceMonth,mode:'Free-only',monthlyCharacterLimit:voiceSettings.monthlyCharacterBudget,reservedCharacters:voiceReserved,remainingCharacters:Math.max(0,voiceSettings.monthlyCharacterBudget-voiceReserved),paidUsageEnabled:false},growth:state.growth||null,websitePreparation:state.dailyPreparation||null,contentPreparation:state.contentPreparation||null,scheduledAutomationEnabled:process.env.CANCHA_SCHEDULE_BACKEND==='github',backend:'github',action:mode,meta:{connected:true,username:connection.username,accountType:connection.accountType},plan:readPlan(db),queue:rows.map(row=>({id:row.id,version:queueVersion(row),status:row.status,scheduledAt:row.scheduled_at,publishedId:row.published_id,note:row.note,slideCount:JSON.parse(row.content).slides?.length||1,videoSeconds:JSON.parse(row.content).reel?.durationSeconds||null,creativeKind:JSON.parse(row.content).visualEvidence?.kind||null})),privateSubmissionsBackedUp:state.submissions?.rows?.length||0,cmsBackups:(state.cmsBackupRefs?.length||0)+(state.cmsBackups?.length||0),photoEditorialRefresh:state.photoEditorialRefresh||null,productEditorialRefresh:state.productEditorialRefresh||null,motionPreflight:state.motionPreflight||null,motionPreflights:state.motionPreflights||{},motionEditorialRefresh:state.motionEditorialRefresh||null};
 await mkdir('private-data',{recursive:true,mode:0o700});await writeFile('private-data/github-summary.json',JSON.stringify(summary,null,2),{mode:0o600});
 if(mode==='review')await writeFile('private-data/instagram-preview.html',instagramPreview(rows,summary.plan),{mode:0o600});
 console.log(JSON.stringify({backend:summary.backend,action:mode,connected:summary.meta.username,planEnabled:summary.plan?.enabled,posts:rows.length,published:rows.filter(row=>row.status==='Published').length,requiresReconciliation:rows.filter(row=>['Publishing','Needs reconciliation'].includes(row.status)).length}));
 // The Free-only monthly voice cap is a planned limit, not a fault: report it and keep the job green until the cap resets.
 const news=state.contentPreparation?.automaticNews,budgetOnly=news?.status==='blocked'&&Array.isArray(news.blocked)&&news.blocked.length>0&&news.blocked.every(b=>/voice budget reached/i.test(b?.reason||''));
 if(mode==='replenish'&&budgetOnly){delete state.contentPreparation.processFailures?.automaticNews;console.log(JSON.stringify({automaticNews:'paused until the monthly Free voice budget resets',remainingCharacters:news.voiceBudget?.remaining??null}));}
 if(mode==='replenish'&&Object.keys(state.contentPreparation.processFailures||{}).length){console.error('A production stage needs attention; inspect the retained stage reports. Other content and publishing remain independent.');process.exitCode=1;}
 if(mode==='replenish'&&state.contentPreparation.automaticNews?.status==='blocked'&&!budgetOnly){console.error('Automatic narration needs attention; read the retained production report. Other content and publishing remain independent.');process.exitCode=1;}
 if(mode==='replenish'&&readPlan(db)?.enabled&&state.contentPreparation.shortage){console.error('Content shortage: fewer than two usable community posts or no ready carousel. Sources and queue evidence are saved; no filler or publication retry was created.');process.exitCode=1;}
 if(process.env.GITHUB_STEP_SUMMARY)await writeFile(process.env.GITHUB_STEP_SUMMARY,'## Cancha Instagram\n\n'+JSON.stringify(summary,null,2)+'\n',{flag:'a'});
}catch(error){console.error(JSON.stringify({phase,errorType:error.constructor.name,code:error.code||null,subcode:error.subcode||null,httpStatus:error.httpStatus||null,frames:String(error.stack||'').split('\n').slice(1,3)}));const message=String(error.message);console.error(/^(Configure|GitHub state|Read current|Encrypted state|State file|Unsupported|GitHub state already|Migration needs|Render migration|No migrated|Expected Cancha|Daily preparation|Command rejected|Reviewed local story|Reviewed motion)/.test(message)?message:'Automation stopped safely; inspect configuration and durable state. No automatic retry of uncertain publication.');process.exitCode=1;}finally{db?.close();await client?.close();await dispatcher?.close();if(dir)await rm(dir,{recursive:true,force:true});}
