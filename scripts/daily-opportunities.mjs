import {readFile,writeFile,mkdir} from 'node:fs/promises';
import fs from 'node:fs';import {fetch,ProxyAgent} from 'undici';import {chromium} from 'playwright';
import {canonicalUrl,lifecycle} from '../server/opportunity-policy.mjs';import {dateInNewYork} from '../server/offer-expiry.mjs';import {withProject} from './project-session.mjs';
const apply=process.argv.includes('--apply-statuses'),day=dateInNewYork(),config=JSON.parse(await readFile('config/opportunity-workflow.json'));
const dir=`private-data/daily-opportunities/${day}`;await mkdir(dir,{recursive:true,mode:0o700});
let existing=JSON.parse(await readFile('audit/listings-before.json'));
const report={date:day,timezone:config.timezone,target:config.targetPerWeekday,maximum:config.maximumPerRun,mode:apply?'apply draft statuses':'read-only',cmsConnected:false,published:false,sources:[],candidates:[],lifecycle:[]};
if(process.env.FRAMER_API_KEY)await withProject(async f=>{
 const c=(await f.getCollections()).find(x=>x.name==='Opportunities');const fields=await c.getFields(),items=await c.getItems();const ids=Object.fromEntries(fields.map(x=>[x.name,x.id]));
 existing=items.map(x=>({id:x.id,slug:x.slug,title:x.fieldData[ids.Title]?.value,organization:x.fieldData[ids.Organization]?.value,registration:x.fieldData[ids['External Registration Link']]?.value,end:x.fieldData[ids['End Date']]?.value,status:x.fieldData[ids.Status]?.value,checkedOn:x.fieldData[ids['Review Checked On']]?.value}));report.cmsConnected=true;
 // Always back up before an explicitly requested status mutation. Never delete records or alter slugs.
 const changes=existing.map(x=>({item:x,change:lifecycle(x)})).filter(x=>x.change);report.lifecycle=changes.map(x=>({slug:x.item.slug,...x.change}));
 if(apply&&changes.length){const backup=`backups/daily-${new Date().toISOString().replaceAll(':','-')}`;await mkdir(backup,{recursive:true,mode:0o700});await writeFile(backup+'/opportunities.json',JSON.stringify({fields,items},null,2),{mode:0o600});report.backup=backup;const cases=fields.find(x=>x.name==='Status').cases;
  await c.addItems(changes.map(({item,change})=>({id:item.id,fieldData:{[ids.Status]:{type:'enum',value:cases.find(x=>x.name===change.status).id},[ids.Verified]:{type:'boolean',value:change.verified},[ids['Review Status']]:{type:'string',value:change.label},[ids['Review Note']]:{type:'string',value:change.note}}})));
  const after=await c.getItems();if(after.length!==items.length||after.some(x=>items.find(y=>y.id===x.id)?.slug!==x.slug))throw Error('Record identity changed');report.statusesApplied=changes.length;
 }
});else if(apply)throw Error('Cannot change CMS without secure Framer binding');
const dispatcher=process.env.HTTPS_PROXY?new ProxyAgent({uri:process.env.HTTPS_PROXY,...(process.env.SSL_CERT_FILE?{requestTls:{ca:fs.readFileSync(process.env.SSL_CERT_FILE)}}:{})}):undefined;
const known=new Set([...existing.map(x=>x.registration).filter(Boolean),...config.sources.map(x=>x.url)].map(canonicalUrl)),seen=new Set();
const browser=await chromium.launch({headless:true});const context=await browser.newContext({javaScriptEnabled:false});await context.route('**/*',route=>route.abort());const page=await context.newPage();
try{for(const source of config.sources.filter(x=>x.enabled)){
 const check={id:source.id,url:source.url,checkedAt:new Date().toISOString(),verifiedOpportunity:false};report.sources.push(check);
 try{
  const response=await fetch(source.url,{dispatcher,redirect:'manual',signal:AbortSignal.timeout(20000)});check.httpStatus=response.status;
  // Redirects, authentication walls and HTTP 200 are all review evidence, never an open-status assertion.
  if(response.status!==200){check.blocker='Source requires review (redirect, blocked or unavailable)';await response.body?.cancel();continue;}
  if(!/text\/html/i.test(response.headers.get('content-type')||'')){check.blocker='Source is not an HTML page';await response.body?.cancel();continue;}
  const reader=response.body.getReader();let total=0,chunks=[];while(true){const r=await reader.read();if(r.done)break;total+=r.value.length;if(total>2_000_000){await reader.cancel();throw Error('Source exceeds size limit');}chunks.push(Buffer.from(r.value));}
  await page.setContent(Buffer.concat(chunks).toString('utf8'),{waitUntil:'domcontentloaded'});
  const parsed=await page.evaluate(()=>({title:document.title,text:document.body.innerText,links:[...document.querySelectorAll('a[href]')].map(a=>({href:a.getAttribute('href'),text:(a.textContent||'').trim().replace(/\s+/g,' ')}))}));check.pageTitle=parsed.title;check.excerpt=parsed.text.slice(0,1200);
  check.confirmedClosed=/teamworkonline\.com\/soccer-jobs\/.+-\d+$/.test(source.url)&&parsed.text.includes('This job is closed to new applications');
  for(const link of parsed.links){if(!/tryout|evaluation|camp|tournament|internship|vacanc|career|job|recruit/i.test(link.text+' '+link.href)||/alert|notification|\/applications\/|privacy|login|sign.?in|jobs-in-sports/i.test(link.text+' '+link.href))continue;let url;try{url=canonicalUrl(new URL(link.href,source.url).href);}catch{continue;}
   if(new URL(url).hostname==='www.teamworkonline.com'&&!/\/soccer-jobs\/.+-\d+$/.test(new URL(url).pathname))continue;
   if(new URL(url).hostname!==new URL(source.url).hostname||known.has(url)||seen.has(url))continue;seen.add(url);
   report.candidates.push({url,titleHint:link.text.slice(0,180),sourceUrl:source.url,foundAt:check.checkedAt,status:'Pending review',verified:false,note:'Possible lead, not a verified opportunity. Review organizer identity, exact event/job, dates, eligibility, availability, duplicate identity and image rights.'});
  }
 }catch{check.blocker='Source fetch or parsing failed; manual review required';}
}}
finally{await browser.close();if(dispatcher)await dispatcher.close();}
const closures=report.sources.filter(x=>x.confirmedClosed).map(x=>existing.find(y=>y.status==='Active'&&y.registration&&canonicalUrl(y.registration)===canonicalUrl(x.url))).filter(Boolean);
for(const item of closures)report.lifecycle.push({slug:item.slug,status:'Expired',label:'Applications closed',verified:true,note:'The exact organizer job posting explicitly says this job is closed to new applications.'});
if(apply&&closures.length)await withProject(async f=>{const c=(await f.getCollections()).find(x=>x.name==='Opportunities'),fields=await c.getFields(),items=await c.getItems(),ids=Object.fromEntries(fields.map(x=>[x.name,x.id]));const targets=items.filter(x=>closures.some(y=>y.id===x.id)&&x.fieldData[ids.Status]?.value==='Active');if(!targets.length)return;const backup=`backups/source-closure-${new Date().toISOString().replaceAll(':','-')}`;await mkdir(backup,{recursive:true,mode:0o700});await writeFile(backup+'/opportunities.json',JSON.stringify({fields,items},null,2),{mode:0o600});await c.addItems(targets.map(x=>({id:x.id,fieldData:{[ids.Status]:{type:'enum',value:fields.find(y=>y.name==='Status').cases.find(y=>y.name==='Expired').id},[ids.Verified]:{type:'boolean',value:true},[ids['Review Status']]:{type:'string',value:'Applications closed'},[ids['Review Note']]:{type:'string',value:'The exact organizer job posting explicitly says this job is closed to new applications.'},[ids['Review Checked On']]:{type:'date',value:day}}})));report.statusesApplied=(report.statusesApplied||0)+targets.length;});
await writeFile(dir+'/report.json',JSON.stringify(report,null,2),{mode:0o600});await writeFile(dir+'/candidates.json',JSON.stringify(report.candidates,null,2),{mode:0o600});
console.log(JSON.stringify({report:dir+'/report.json',cmsConnected:report.cmsConnected,sources:report.sources.length,candidateLeads:report.candidates.length,lifecycleChanges:report.lifecycle.length,statusesApplied:report.statusesApplied||0,published:false}));
