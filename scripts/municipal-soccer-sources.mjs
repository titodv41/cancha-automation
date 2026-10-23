import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {sourceSession} from './source-session.mjs';
import {MUNICIPAL_DIRECTORIES,municipalParkLeads,municipalSoccerProfile} from '../server/municipal-soccer-discovery.mjs';

// Public, source-specific reads. No proxy rotation, login, CAPTCHA handling or
// reliance on a blocked commercial feed. Cache excludes page bodies/contacts.
export async function municipalSoccerSources({today,existing=[]}={}){
 const config=JSON.parse(await readFile('config/municipal-soccer-sources.json'));if(!config.enabled)return {rows:[],sources:[],blocked:[]};
 const session=sourceSession(),rows=[],sources=[],blocked=[],leads=[],known=new Set(existing.map(x=>x.website?.replace(/\/$/,''))),path='private-data/municipal-source-cache/checks.json';let cache={};
 try{cache=JSON.parse(await readFile(path,'utf8'))}catch(e){if(e.code!=='ENOENT')throw e}
 try{
  for(const [kind,url]of Object.entries(MUNICIPAL_DIRECTORIES))try{const bytes=await session.html(url,kind==='miami'?/xml/i:/html/i,{followCanonical:true,maxBytes:5000000}),found=municipalParkLeads(kind,bytes.toString());leads.push(...found);sources.push({url,available:true,records:found.length})}catch(e){sources.push({url,available:false,reason:e.message})}
  const prioritized=new Set(config.reviewedVenueUrls),candidates=leads.filter(r=>!known.has(r.url.replace(/\/$/,''))),dateNumber=Math.floor(Date.parse(today)/86400000);
  // Rotate discovery so a large city directory cannot starve other regions.
  const ordered=[...candidates.filter(r=>prioritized.has(r.url)),...candidates.filter(r=>!prioritized.has(r.url)).sort((a,b)=>((dateNumber+leads.indexOf(a))%leads.length)-((dateNumber+leads.indexOf(b))%leads.length))];
  const due=ordered.filter(r=>{const c=cache[r.url];return !c||c.checkedOn>today||Date.parse(today)-Date.parse(c.checkedOn)>=config.recheckDays*86400000||c.status==='available'}).slice(0,config.maximumDetailPages);
  for(let i=0;i<due.length;i+=4){await Promise.allSettled(due.slice(i,i+4).map(async lead=>{try{
   const bytes=await session.html(lead.url,/html/i,{timeoutMs:12000,followCanonical:true,maxBytes:2000000}),row=municipalSoccerProfile(bytes.toString(),lead,{today,mediaOverrides:config.mediaOverrides||{}});cache[lead.url]={checkedOn:today,status:row?'available':'no-soccer-field-evidence'};if(row)rows.push(row);
  }catch(e){cache[lead.url]={checkedOn:today,status:'blocked'};blocked.push({url:lead.url,reason:e.message})}}))}
  await mkdir('private-data/municipal-source-cache',{recursive:true,mode:0o700});await writeFile(path,JSON.stringify(cache),{mode:0o600});
  sources.push({kind:'municipal-details',available:true,checked:due.length,eligible:rows.length,cached:ordered.length-due.length});
 }finally{await session.close()}
 return {rows,sources,blocked};
}
