import {writeFile,mkdir} from 'node:fs/promises';import {pathToFileURL} from 'node:url';import {resolve} from 'node:path';
// Finds Reel footage: Pixabay's free library, or YouTube videos whose own license is Creative Commons (CC BY).
// Keys stay in GitHub Actions: the output holds only public metadata, never request URLs.
export function shapeHit(hit,query){const pick=['large','medium','small'].map(size=>hit.videos?.[size]).find(v=>v?.url);if(!pick)return null;
 return {query,id:hit.id,tags:hit.tags,duration:hit.duration,width:pick.width,height:pick.height,vertical:pick.height>pick.width,url:pick.url,thumbnail:hit.videos?.medium?.thumbnail||null,page:hit.pageURL,creator:hit.user,source:'pixabay'};}
export function parseQueries(input){return String(input||'').split(/[,\n]/).map(q=>q.trim()).filter(Boolean).slice(0,15);}
// ISO 8601 duration (PT1M5S) to seconds.
export function isoSeconds(value){const m=String(value||'').match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);return m?(+m[1]||0)*3600+(+m[2]||0)*60+(+m[3]||0):null;}
// Credit details are kept for the website's credits page; only videos YouTube itself marks creativeCommon are returned.
export function shapeYouTube(video,query){if(video.status?.license!=='creativeCommon')return null;
 return {query,id:video.id,title:video.snippet?.title,duration:isoSeconds(video.contentDetails?.duration),url:'https://www.youtube.com/watch?v='+video.id,thumbnail:video.snippet?.thumbnails?.high?.url||null,page:'https://www.youtube.com/watch?v='+video.id,creator:video.snippet?.channelTitle,license:'CC BY (YouTube Creative Commons)',source:'youtube'};}
async function getJson(url){const response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('Search rejected ('+response.status+')');return response.json();}
async function pixabay(query,key){return ((await getJson('https://pixabay.com/api/videos/?'+new URLSearchParams({key,q:query,per_page:'30',safesearch:'true'}))).hits||[]).map(hit=>shapeHit(hit,query)).filter(Boolean);}
export async function youtube(query,key){
 const found=await getJson('https://www.googleapis.com/youtube/v3/search?'+new URLSearchParams({key,q:query,part:'id',type:'video',videoLicense:'creativeCommon',videoDuration:'short',maxResults:'25',safeSearch:'strict'}));
 const ids=(found.items||[]).map(item=>item.id?.videoId).filter(Boolean);if(!ids.length)return [];
 const details=await getJson('https://www.googleapis.com/youtube/v3/videos?'+new URLSearchParams({key,id:ids.join(','),part:'snippet,status,contentDetails'}));
 return (details.items||[]).map(video=>shapeYouTube(video,query)).filter(Boolean);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const source=process.env.SOURCE||'pixabay',key=source==='youtube'?process.env.YOUTUBE_API_KEY:process.env.PIXABAY_API_KEY;
 if(!['pixabay','youtube'].includes(source))throw Error('Unsupported footage source');if(!key)throw Error('Configure the '+source+' API key');
 const queries=parseQueries(process.env.QUERIES);if(!queries.length)throw Error('Provide at least one search');
 const results=[];
 for(const query of queries)try{results.push(...await(source==='youtube'?youtube(query,key):pixabay(query,key)));}catch(error){console.error(`Search failed for "${query}": ${error.message}`);}
 await mkdir('private-data',{recursive:true});await writeFile('private-data/stock-footage.json',JSON.stringify({searchedAt:new Date().toISOString(),source,queries,results},null,1));
 console.log(JSON.stringify({source,queries:queries.length,results:results.length}));
}
