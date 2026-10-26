import {writeFile,mkdir} from 'node:fs/promises';import {pathToFileURL} from 'node:url';import {resolve} from 'node:path';
// Searches Pixabay's free video library for Reel footage. The API key stays in GitHub Actions:
// the output holds only public clip metadata and CDN links, never the request URL.
export function shapeHit(hit,query){const pick=['large','medium','small'].map(size=>hit.videos?.[size]).find(v=>v?.url);if(!pick)return null;
 return {query,id:hit.id,tags:hit.tags,duration:hit.duration,width:pick.width,height:pick.height,vertical:pick.height>pick.width,url:pick.url,thumbnail:hit.videos?.medium?.thumbnail||null,page:hit.pageURL,creator:hit.user,source:'pixabay'};}
export function parseQueries(input){return String(input||'').split(/[,\n]/).map(q=>q.trim()).filter(Boolean).slice(0,15);}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const key=process.env.PIXABAY_API_KEY;if(!key)throw Error('Configure PIXABAY_API_KEY');
 const queries=parseQueries(process.env.QUERIES);if(!queries.length)throw Error('Provide at least one search');
 const results=[];
 for(const query of queries){const response=await fetch('https://pixabay.com/api/videos/?'+new URLSearchParams({key,q:query,per_page:'30',safesearch:'true'}),{signal:AbortSignal.timeout(30000)});
  if(!response.ok){console.error(`Search failed for "${query}" (${response.status})`);continue;}
  for(const hit of (await response.json()).hits||[]){const row=shapeHit(hit,query);if(row)results.push(row);}}
 await mkdir('private-data',{recursive:true});await writeFile('private-data/stock-footage.json',JSON.stringify({searchedAt:new Date().toISOString(),queries,results},null,1));
 console.log(JSON.stringify({queries:queries.length,results:results.length,vertical:results.filter(r=>r.vertical).length}));
}
