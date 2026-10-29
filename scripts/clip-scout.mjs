import {writeFile,mkdir,appendFile} from 'node:fs/promises';import {pathToFileURL} from 'node:url';import {resolve} from 'node:path';
import {parseQueries,isoSeconds} from './stock-footage-search.mjs';
// Clip scout (owner, Oct 29): finds real soccer video on YouTube for Reels and lists who to ask. Creative Commons
// videos are usable with credit; every other video is "needs the creator's OK" and is never downloaded until the
// owner records that OK in config/clip-permissions.json. Output is public metadata only; the API key stays in Actions.
export function shapeScoutVideo(v,query){
 const seconds=isoSeconds(v.contentDetails?.duration);if(!v.id||!seconds)return null;
 const cc=v.status?.license==='creativeCommon';
 return {query,id:v.id,title:v.snippet?.title||'',channel:v.snippet?.channelTitle||'',channelUrl:v.snippet?.channelId?'https://www.youtube.com/channel/'+v.snippet.channelId:null,
  url:'https://www.youtube.com/watch?v='+v.id,publishedAt:v.snippet?.publishedAt||null,seconds,views:Number(v.statistics?.viewCount||0),
  license:cc?'Creative Commons (CC BY)':'Standard YouTube license',status:cc?'usable with credit':'needs creator OK'};
}
export function rankScout(rows){const seen=new Set();
 return rows.filter(r=>r&&r.seconds<=1200&&!seen.has(r.id)&&seen.add(r.id)).sort((a,b)=>Number(b.status==='usable with credit')-Number(a.status==='usable with credit')||b.views-a.views);}
export function scoutMarkdown(rows){
 const line=r=>`| ${r.status==='usable with credit'?'✅ CC':'✋ ask'} | [${r.title.replace(/\|/g,'/').slice(0,70)}](${r.url}) | [${r.channel.replace(/\|/g,'/').slice(0,40)}](${r.channelUrl}) | ${Math.round(r.seconds/60*10)/10} min | ${r.views.toLocaleString('en-US')} | ${r.query} |`;
 return ['## Clip scout','','✅ CC = Creative Commons, usable with credit. ✋ ask = needs the creator\'s OK before use.','','| Use | Video | Creator | Length | Views | Search |','|---|---|---|---|---|---|',...rows.map(line)].join('\n');
}
async function getJson(url){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('YouTube search rejected ('+r.status+')');return r.json();}
export async function scout(query,key,{license='any'}={}){
 const found=await getJson('https://www.googleapis.com/youtube/v3/search?'+new URLSearchParams({key,q:query,part:'id',type:'video',maxResults:'25',safeSearch:'strict',regionCode:'US',relevanceLanguage:'en',...(license==='cc'?{videoLicense:'creativeCommon'}:{})}));
 const ids=(found.items||[]).map(i=>i.id?.videoId).filter(Boolean);if(!ids.length)return[];
 const details=await getJson('https://www.googleapis.com/youtube/v3/videos?'+new URLSearchParams({key,id:ids.join(','),part:'snippet,status,contentDetails,statistics'}));
 return (details.items||[]).map(v=>shapeScoutVideo(v,query)).filter(Boolean);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const key=process.env.YOUTUBE_API_KEY;if(!key)throw Error('YOUTUBE_API_KEY is not set in the repository secrets');
 const queries=parseQueries(process.env.QUERIES),rows=[];
 for(const q of queries){rows.push(...await scout(q,key,{license:'cc'}));rows.push(...await scout(q,key));}
 const ranked=rankScout(rows).slice(0,80);await mkdir('private-data',{recursive:true});
 await writeFile('private-data/clip-scout.json',JSON.stringify({checkedAt:new Date().toISOString(),queries,results:ranked},null,1));
 if(process.env.GITHUB_STEP_SUMMARY)await appendFile(process.env.GITHUB_STEP_SUMMARY,scoutMarkdown(ranked)+'\n');
 console.log(JSON.stringify({queries:queries.length,results:ranked.length,creativeCommons:ranked.filter(r=>r.status==='usable with credit').length}));
}
