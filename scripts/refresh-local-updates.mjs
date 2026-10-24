import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {sourceSession} from './source-session.mjs';
import {localNewsSources,discoverNewsLinks,extractLocalUpdate} from '../server/local-updates.mjs';
const session=sourceSession(),report={checkedAt:new Date().toISOString(),sources:[],blocked:[],items:[]};
await mkdir('private-data/local-updates',{recursive:true,mode:0o700});
try{
 const results=await Promise.allSettled(localNewsSources.map(async source=>{
  const urls=discoverNewsLinks((await session.html(source.indexUrl)).toString(),source);
  report.sources.push({source:source.id,candidates:urls.length});
  for(const url of urls){try{const item=extractLocalUpdate(url,(await session.html(url)).toString(),source);if(item)report.items.push(item);else report.blocked.push({url,reason:'No fresh complete article and relevant subject media'});}catch(e){report.blocked.push({url,reason:e.message})}}
 }));
 results.forEach((r,i)=>{if(r.status==='rejected')report.blocked.push({source:localNewsSources[i].id,reason:r.reason.message})});
 const previous=JSON.parse(await readFile('config/local-updates.json').catch(()=>'[]'));
 for(const old of previous)if(!report.items.some(n=>n.id===old.id)&&Date.parse(old.expiresAt)>Date.now()&&report.blocked.some(b=>b.source===old.sourceId||b.url===old.url))report.items.push(old);
 report.items.sort((a,b)=>b.publishedOn.localeCompare(a.publishedOn)||a.organization.localeCompare(b.organization));
 await writeFile('config/local-updates.json',JSON.stringify(report.items.slice(0,12),null,2)+'\n');
 await writeFile('private-data/local-updates/report.json',JSON.stringify(report,null,2),{mode:0o600});
 console.log(JSON.stringify({currentArticles:report.items.length,sources:report.sources,blocked:report.blocked.length,published:false}));
}finally{await session.close()}
