import{createHash}from'node:crypto';
export const digest=value=>createHash('sha256').update(value).digest('hex');
export const runTitle=(action,number)=>'Cancha Claude loop / '+action+(action==='revise'?' / '+number:'');
const day=value=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));
function week(value){const d=new Date(day(value)+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);return d.toISOString().slice(0,10)}
export function validateLoopPolicy(p){
 if(p.repository!=='titodv41/cancha-automation'||p.authentication!=='claude-pro-oauth-only'||p.model!=='sonnet'||p.timezone!=='America/New_York'||typeof p.enabled!=='boolean'||typeof p.includedUsageConfirmed!=='boolean'||p.maximumInitialRunsPerWeek!==3||p.maximumInitialRunsPerDay!==1||p.maximumRevisionsPerPullRequest!==1||p.maximumRevisionsPerWeek!==3||p.initialTurns!==6||p.revisionTurns!==4||p.timeoutMinutes!==10||p.maximumOutputTokens!==4096||p.maximumChangedFiles!==1||p.maximumEdits!==3||p.maximumEditCharacters!==6000||p.maximumChangedLines!==60||p.branchPrefix!=='claude/cancha-improve-'||p.automaticMerge!==false||p.automaticProductionRelease!==false||p.automaticWorkflowRetry!==false)throw Error('Unreviewed Claude loop or usage policy');
 const paths=['framer/CanchaHome.tsx','video/src/AutomaticNewsStory.tsx','scripts/photo-card-layout.mjs','scripts/photo-panel-layout.mjs'];
 if(JSON.stringify(p.allowedPaths)!==JSON.stringify(paths)||JSON.stringify(p.codexReviewers)!==JSON.stringify(['chatgpt-codex-connector[bot]','chatgpt-codex-connector']))throw Error('Unreviewed loop write or reviewer scope');return p;
}
export function planLoop({policy,action='check',number=0,eventName,actor,currentRunId,runs=[],pulls=[],oauthConfigured=false,now=Date.now(),reviewBody=''}={}){
 validateLoopPolicy(policy);if(!['check','propose','revise'].includes(action))throw Error('Unknown loop action');
 const previous=runs.filter(r=>String(r.id)!==String(currentRunId)&&Number.isFinite(Date.parse(r.created_at))),initial=previous.filter(r=>r.display_title===runTitle('propose')),thisWeek=initial.filter(r=>week(r.created_at)===week(now));
 const result={action,run:false,authenticationConfigured:oauthConfigured,includedUsageConfirmed:policy.includedUsageConfirmed,enabled:policy.enabled,initialRunsThisWeek:thisWeek.length,weeklyLimit:3,reason:'Connection check only; no model request'};
 if(action==='check')return result;
 if(!policy.enabled)return{...result,reason:'Loop paused until one-time authorization is completed'};
 if(!oauthConfigured)return{...result,reason:'CLAUDE_CODE_OAUTH_TOKEN is not configured'};
 if(!policy.includedUsageConfirmed)return{...result,reason:'Confirm usage credits / extra usage is off before included-only work'};
 const own=pulls.filter(p=>p.state==='open'&&p.head?.repo?.full_name===policy.repository&&p.head?.ref?.startsWith(policy.branchPrefix)&&p.base?.ref==='main');
 if(own.length>1)return{...result,reason:'More than one loop PR exists; resolve existing work first'};
 if(action==='propose'){
  if(own.length)return{...result,reason:'Wait for the existing improvement PR before starting another'};
  if(thisWeek.length>=3)return{...result,reason:'Weekly initial-run cap reached; failed runs are not refunded'};
  if(initial.some(r=>day(r.created_at)===day(now)))return{...result,reason:'Daily initial-run cap reached'};
 }else{
  const pr=own.find(p=>p.number===Number(number));if(!pr||!/^\d+$/.test(String(number)))return{...result,reason:'Revision requires this repository’s open loop PR'};
  if(pr.labels?.some(l=>(typeof l==='string'?l:l.name)==='cancha-claude-revision-used'))return{...result,reason:'This PR’s one revision was already reserved'};
  if(!pr.body?.includes('<!-- cancha-claude-loop -->'))return{...result,reason:'PR lacks the trusted loop marker'};
  if(previous.filter(r=>r.display_title?.startsWith(runTitle('revise',''))&&week(r.created_at)===week(now)).length>=3)return{...result,reason:'Weekly revision cap reached'};
  if(previous.some(r=>r.display_title===runTitle('revise',number)))return{...result,reason:'One revision has already been attempted for this PR'};
  if(eventName==='pull_request_review'&&(!policy.codexReviewers.includes(actor)||!reviewBody.trim()))return{...result,reason:'Only a recognized Codex review can start an automatic revision'};
  if(!reviewBody.trim())return{...result,reason:'No concrete review feedback; no revision request'};
 }
 return{...result,run:true,reason:'One bounded subscription-authenticated pass',turns:action==='revise'?4:6,pullRequest:action==='revise'?Number(number):null};
}
const occurrences=(s,part)=>s.split(part).length-1;
export function validateProposal(proposal,files,policy){
 validateLoopPolicy(policy);if(!proposal||!['proposal','no-change'].includes(proposal.status)||typeof proposal.title!=='string'||proposal.title.length<5||proposal.title.length>100||typeof proposal.summary!=='string'||proposal.summary.length>1800||!Array.isArray(proposal.edits)||!Array.isArray(proposal.sources)||proposal.sources.length>3)throw Error('Invalid bounded review output');
 for(const url of proposal.sources){const u=new URL(url);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||url.length>500||!u.hostname.includes('.')||/^\d+(?:\.\d+){3}$/.test(u.hostname))throw Error('Use a public HTTPS reference without credentials or tracking');}
 if(proposal.status==='no-change'){if(proposal.edits.length)throw Error('No-change report contains edits');return{changes:[],report:proposal};}
 if(!proposal.edits.length||proposal.edits.length>policy.maximumEdits||new Set(proposal.edits.map(e=>e.path)).size>1)throw Error('One file and at most three edits per pass');
 const changed=new Map();let characters=0,lines=0;
 for(const e of proposal.edits){
  if(!policy.allowedPaths.includes(e.path)||typeof files[e.path]!=='string'||typeof e.find!=='string'||!e.find.trim()||typeof e.replace!=='string'||e.find===e.replace)throw Error('Edit is outside the reviewed presentation scope');
  characters+=e.find.length+e.replace.length;lines+=e.find.split('\n').length+e.replace.split('\n').length;
  if(characters>policy.maximumEditCharacters||lines>policy.maximumChangedLines)throw Error('Edit is too large for the usage-bounded pilot');
  const before=changed.get(e.path)||files[e.path];if(occurrences(before,e.find)!==1)throw Error('Edit anchor is stale or ambiguous');
  for(const pattern of[/process\.env/i,/\beval\s*\(/i,/new\s+Function/i,/\bfetch\s*\(/i,/XMLHttpRequest/i,/\.publish\s*\(/i,/\b(?:apiKey|accessToken|authorization)\b/i])if(pattern.test(e.replace)&&!pattern.test(e.find))throw Error('Presentation pass introduces an unrelated execution or credential surface');
  changed.set(e.path,before.replace(e.find,()=>e.replace));
 }
 return{changes:[...changed].map(([path,content])=>({path,content,beforeSha256:digest(files[path]),afterSha256:digest(content)})),report:proposal};
}
export function proposalSchema(paths){return{type:'object',additionalProperties:false,properties:{status:{type:'string',enum:['proposal','no-change']},title:{type:'string',minLength:5,maxLength:100},summary:{type:'string',maxLength:1800},sources:{type:'array',maxItems:3,items:{type:'string',maxLength:500}},edits:{type:'array',maxItems:3,items:{type:'object',additionalProperties:false,properties:{path:{type:'string',enum:paths},find:{type:'string',maxLength:2500},replace:{type:'string',maxLength:2500}},required:['path','find','replace']}}},required:['status','title','summary','sources','edits']}}
