import {readFile} from 'node:fs/promises';
import {sourceSession} from './source-session.mjs';
import {STARS_SITEMAP,soccerStarsPages,soccerStarsProfile,INDOOR_PROGRAMS,indoorProgramProfile} from '../server/regional-program-discovery.mjs';
import {soccerShotsRegionalProfile} from '../server/expanded-club-discovery.mjs';
export async function regionalProgramSources({today,existing=[]}){
 const config=JSON.parse(await readFile('config/regional-program-sources.json'));if(!config.enabled)return {rows:[],sources:[],blocked:[]};
 const session=sourceSession(),rows=[],sources=[],blocked=[],known=new Set(existing.map(x=>x.website?.replace(/\/$/,'')));
 try{
  let pages=[];try{pages=soccerStarsPages((await session.html(STARS_SITEMAP,/xml/i,{followCanonical:true})).toString(),config.soccerStarsAreas);sources.push({url:STARS_SITEMAP,available:true,records:pages.length})}catch(e){sources.push({url:STARS_SITEMAP,available:false,reason:e.message})}
  const shots=JSON.parse(await readFile('config/soccer-shots-regions.json')),locations=JSON.parse(await readFile('config/florida-club-sources.json')).locations;
  if(shots.length>25)throw Error('Regional provider seed limit exceeded');
  const tasks=[...pages.map(p=>({url:p.url,read:html=>soccerStarsProfile(html,p,today)})),...INDOOR_PROGRAMS.map(p=>({url:p.url,read:html=>indoorProgramProfile(html,p,today)})),...shots.map(p=>({url:p.website,read:html=>soccerShotsRegionalProfile(html,p,{today,locations})}))].filter(p=>!known.has(p.url.replace(/\/$/,'')));
  for(let i=0;i<tasks.length;i+=4){const results=await Promise.allSettled(tasks.slice(i,i+4).map(async t=>t.read((await session.html(t.url,/html/i,{followCanonical:true,timeoutMs:12000})).toString())));results.forEach((r,j)=>{if(r.status==='fulfilled'&&!rows.some(x=>x.sourceIdentity===r.value.sourceIdentity))rows.push(r.value);else if(r.status==='rejected')blocked.push({url:tasks[i+j].url,reason:r.reason.message})})}
 }finally{await session.close()}
 return {rows,sources,blocked};
}
