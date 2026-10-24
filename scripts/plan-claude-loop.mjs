import{readFile,writeFile,mkdir,appendFile}from'node:fs/promises';import{loopGitHub,loopRunHistory,openLoopPulls,reserveRevision}from'./claude-loop-github.mjs';import{planLoop,validateLoopPolicy}from'../server/claude-improvement-loop.mjs';
const policy=validateLoopPolicy(JSON.parse(await readFile('config/claude-improvement-loop.json'))),event=JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH)),eventName=process.env.GITHUB_EVENT_NAME,action=eventName==='pull_request_review'?'revise':process.env.LOOP_ACTION||'propose',number=Number(event.pull_request?.number||process.env.LOOP_PR||0),g=await loopGitHub();
await mkdir('private-data/claude-loop',{recursive:true,mode:0o700});
try{
 const[runs,pulls,main]=await Promise.all([loopRunHistory(g),openLoopPulls(g),g.api('/git/ref/heads/main')]);
 const comments=action==='revise'?await g.api('/pulls/'+number+'/comments?per_page=100'):[];
 const reviewed=comments.filter(c=>policy.codexReviewers.includes(c.user?.login)).slice(-6).map(c=>String(c.body).slice(0,1600));
 const reviewSummary=/\[P[012]\]|changes? requested/i.test(event.review?.body||'')||event.review?.state==='changes_requested'?event.review?.body||'':'';
 const feedback=[reviewSummary,...reviewed].filter(Boolean).join('\n').slice(0,7000);
 const plan=planLoop({policy,action,number,eventName,actor:event.review?.user?.login||process.env.GITHUB_ACTOR,currentRunId:process.env.GITHUB_RUN_ID,runs,pulls,oauthConfigured:process.env.OAUTH_CONFIGURED==='true',reviewBody:feedback});
 plan.baseSha=main.object.sha;plan.number=number;plan.feedback=feedback;plan.sourceRef=plan.baseSha;
 if(plan.run&&action==='revise'){
  const p=pulls.find(p=>p.number===number),files=await g.api('/pulls/'+number+'/files?per_page=100');
  if(!files.length||files.length>policy.maximumChangedFiles||files.some(f=>!policy.allowedPaths.includes(f.filename)||f.status!=='modified'))throw Error('Existing PR exceeds the pilot presentation scope');
  await reserveRevision(g,number);plan.revisionReserved=true;
  plan.sourceRef=p.head.sha;plan.branch=p.head.ref;plan.focusPaths=files.map(f=>f.filename);
 }
 if(!plan.focusPaths){const day=new Date().getUTCDay();plan.focusPaths=day===1?['framer/CanchaHome.tsx','framer/CanchaDiscovery.tsx','framer/CanchaDetail.tsx']:['video/src/AutomaticNewsStory.tsx','scripts/photo-card-layout.mjs','scripts/photo-panel-layout.mjs'];}
 await writeFile('private-data/claude-loop/plan.json',JSON.stringify(plan,null,2),{mode:0o600});
 if(process.env.GITHUB_OUTPUT)await appendFile(process.env.GITHUB_OUTPUT,'run='+plan.run+'\nbase_sha='+plan.baseSha+'\nturns='+(plan.turns||0)+'\n');
 console.log(JSON.stringify({action,willCallClaude:plan.run,reason:plan.reason,oauthConfigured:plan.authenticationConfigured,includedUsageConfirmed:plan.includedUsageConfirmed,initialRunsThisWeek:plan.initialRunsThisWeek}));
 if(process.env.GITHUB_STEP_SUMMARY)await appendFile(process.env.GITHUB_STEP_SUMMARY,'## Cancha Claude connection\n\n'+plan.reason+'\n\nSubscription token configured: '+plan.authenticationConfigured+'. Included-only settings confirmed: '+plan.includedUsageConfirmed+'. Initial runs this week: '+plan.initialRunsThisWeek+'/'+policy.maximumInitialRunsPerWeek+'. No API-key fallback.\n');
}finally{await g.close()}
