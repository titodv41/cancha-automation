import {readFile,writeFile,mkdir} from 'node:fs/promises';import {chromium} from 'playwright';
import {openBrowser} from './browser-session.mjs';import {sourceSession} from './source-session.mjs';import {verifyJob} from '../server/source-verification.mjs';import {dateInNewYork} from '../server/offer-expiry.mjs';
import {parseJob} from './source-parser.mjs';
const dir=`private-data/daily-opportunities/${dateInNewYork()}`,file=process.argv[2]||dir+'/candidates.json';await mkdir(dir,{recursive:true,mode:0o700});
const candidates=JSON.parse(await readFile(file)),registry=JSON.parse(await readFile('config/automated-organizers.json')),config=JSON.parse(await readFile('config/opportunity-workflow.json')),ready=[],blocked=[];
const source=sourceSession(),browser=await chromium.launch({headless:true}),context=await browser.newContext({javaScriptEnabled:false});await context.route('**/*',route=>route.abort());const page=await context.newPage();const images=new Map();let imageBrowser;
try{for(const lead of candidates.slice(0,50)){
 const approved=registry.find(x=>lead.url.startsWith(x.sourcePrefix));if(!approved){blocked.push({url:lead.url,reason:'No supported structured-source adapter; manual review needed'});continue;}
 try{
  const bytes=await source.html(lead.url),data=await parseJob(page,bytes,lead.url);
  if(!images.has(approved.imageUrl)){imageBrowser||=await openBrowser({width:400,height:300});await imageBrowser.page.goto(approved.imageUrl,{waitUntil:'load'});const image=await imageBrowser.page.evaluate(()=>{const img=document.querySelector('img');return {loaded:!!img?.complete&&img.naturalWidth>0,width:img?.naturalWidth||0,height:img?.naturalHeight||0};});images.set(approved.imageUrl,image);}
  const row=verifyJob({url:lead.url,...data,registry,image:images.get(approved.imageUrl)});if(ready.length<config.targetPerWeekday)ready.push(row);else blocked.push({url:lead.url,reason:'Daily target reached; recheck on a later run'});
 }catch(error){blocked.push({url:lead.url,reason:error.message});}
}}
finally{await browser.close();if(imageBrowser)await imageBrowser.browser.close();await source.close();}
await writeFile(dir+'/ready.json',JSON.stringify(ready,null,2),{mode:0o600});await writeFile(dir+'/manual-review.json',JSON.stringify(blocked,null,2),{mode:0o600});console.log(JSON.stringify({sourceChecked:ready.length,manualReview:blocked.length,batch:dir+'/ready.json',published:false}));
