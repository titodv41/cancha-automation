import {writeFile,mkdir,stat} from 'node:fs/promises';import {createWriteStream} from 'node:fs';import {Readable} from 'node:stream';import {pipeline} from 'node:stream/promises';
import {pathToFileURL} from 'node:url';import {resolve,join} from 'node:path';import {youtube} from './stock-footage-search.mjs';
// Automated Reel footage from sources that both grant reuse and support downloading:
// Pixabay (Pixabay Content License, API), Mixkit (Mixkit free license, direct files) and
// Wikimedia Commons (only CC0, public domain or CC BY; share-alike, non-commercial and no-derivatives are excluded).
const agent='CanchaFootage/1.0 (https://github.com/titodv41/cancha-automation)';
// Commons licenses a meme edit may reuse commercially without share-alike or no-derivatives terms.
export function commonsLicenseAllowed(name){const n=String(name||'').toLowerCase().trim();
 if(/\b(sa|nc|nd)\b|share.?alike|noncommercial|non-commercial|no.?deriv/.test(n))return false;
 return n==='cc0'||n.startsWith('cc0 ')||n.includes('public domain')||n==='pd'||/^cc[ -]by( \d(\.\d)?)?$/.test(n);}
export function shapeCommons(page,query){const info=page.imageinfo?.[0],meta=info?.extmetadata||{};if(!info?.url||!/^video\//.test(info.mime||''))return null;
 const license=meta.LicenseShortName?.value;if(!commonsLicenseAllowed(license))return null;
 const strip=v=>String(v||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
 return {query,id:'commons-'+page.pageid,title:strip(page.title).replace(/^File:/,''),duration:info.duration?Math.round(info.duration):null,width:info.width||null,height:info.height||null,url:info.url,page:info.descriptionurl,creator:strip(meta.Artist?.value).slice(0,120)||null,license:strip(license),source:'commons'};}
export function shapePixabay(hit,query){const pick=['large','medium','small'].map(size=>hit.videos?.[size]).find(v=>v?.url);if(!pick)return null;
 return {query,id:'pixabay-'+hit.id,title:hit.tags,duration:hit.duration,width:pick.width,height:pick.height,url:pick.url,page:hit.pageURL,creator:hit.user,license:'Pixabay Content License',source:'pixabay'};}
// Mixkit category pages list clip files and their descriptions in page order.
export function parseMixkit(html,query){const ids=[...new Set([...html.matchAll(/assets\.mixkit\.co\/videos\/(\d+)\/\1-\d+\.mp4/g)].map(m=>m[1]))];
 const alts=[...html.matchAll(/alt="([^"]{8,140})"/g)].map(m=>m[1]).filter(a=>!/Envato|Mixkit/i.test(a));
 return ids.map((id,i)=>({query,id:'mixkit-'+id,title:alts[i]||null,duration:null,width:null,height:null,url:`https://assets.mixkit.co/videos/${id}/${id}-720.mp4`,page:'https://mixkit.co/free-stock-video/'+query.replace(/\s+/g,'-')+'/',creator:'Mixkit',license:'Mixkit Stock Video Free License',source:'mixkit'}));}
async function get(url,type='json'){const response=await fetch(url,{headers:{'User-Agent':agent},signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('HTTP '+response.status);return type==='json'?response.json():response.text();}
// YouTube Creative Commons videos that were imported to Wikimedia Commons: found with the YouTube Data API,
// downloaded from Commons (which hosts the file under the same CC BY license). YouTube itself is never downloaded from.
export async function youtubeViaCommons(query,key){const found=await youtube(query,key),out=[];
 for(const video of found.slice(0,25)){const data=await get('https://commons.wikimedia.org/w/api.php?'+new URLSearchParams({action:'query',format:'json',generator:'search',gsrsearch:`insource:"${video.id}" filetype:video`,gsrnamespace:'6',gsrlimit:'3',prop:'imageinfo',iiprop:'url|size|mime|extmetadata'}));
  for(const page of Object.values(data.query?.pages||{})){const clip=shapeCommons(page,query);if(clip)out.push({...clip,id:'yt-'+video.id,source:'youtube-commons',youtube:video.url,title:video.title||clip.title,creator:video.creator||clip.creator});}}
 return out;}
export async function searchAll(query,{pixabayKey,youtubeKey}={}){const out=[],errors=[];
 if(youtubeKey)try{out.push(...await youtubeViaCommons(query,youtubeKey));}catch(e){errors.push('youtube: '+e.message);}
 if(pixabayKey)try{out.push(...((await get('https://pixabay.com/api/videos/?'+new URLSearchParams({key:pixabayKey,q:query,per_page:'20',safesearch:'true'}))).hits||[]).map(h=>shapePixabay(h,query)).filter(Boolean));}catch(e){errors.push('pixabay: '+e.message);}
 try{const data=await get('https://commons.wikimedia.org/w/api.php?'+new URLSearchParams({action:'query',format:'json',generator:'search',gsrsearch:query+' filetype:video',gsrnamespace:'6',gsrlimit:'20',prop:'imageinfo',iiprop:'url|size|mime|extmetadata'}));
  out.push(...Object.values(data.query?.pages||{}).map(p=>shapeCommons(p,query)).filter(Boolean));}catch(e){errors.push('commons: '+e.message);}
 try{out.push(...parseMixkit(await get('https://mixkit.co/free-stock-video/'+encodeURIComponent(query.trim().toLowerCase().replace(/\s+/g,'-'))+'/','text'),query).slice(0,12));}catch(e){errors.push('mixkit: '+e.message);}
 return {results:out,errors};}
export async function download(url,file){const response=await fetch(url,{headers:{'User-Agent':agent},signal:AbortSignal.timeout(120000)});if(!response.ok)throw Error('HTTP '+response.status);
 await pipeline(Readable.fromWeb(response.body),createWriteStream(file));if((await stat(file)).size<20000)throw Error('File too small');return file;}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const queries=String(process.env.QUERIES||'').split(/[,\n]/).map(q=>q.trim()).filter(Boolean).slice(0,15),perQuery=Math.min(Number(process.env.DOWNLOAD_PER_QUERY||0),6),dir='private-data/footage';
 if(!queries.length)throw Error('Provide at least one search');await mkdir(dir,{recursive:true});
 const library=[],report=[];
 for(const query of queries){const {results,errors}=await searchAll(query,{pixabayKey:process.env.PIXABAY_API_KEY,youtubeKey:process.env.YOUTUBE_API_KEY});report.push({query,found:results.length,bySource:Object.fromEntries(['youtube-commons','pixabay','commons','mixkit'].map(s=>[s,results.filter(r=>r.source===s).length])),errors});
  // Download a few per source so every query has a mix of looks.
  for(const source of ['youtube-commons','commons','pixabay','mixkit'])for(const clip of results.filter(r=>r.source===source).slice(0,perQuery)){
   const ext=(clip.url.match(/\.(mp4|webm|ogv|mov)(?:$|\?)/i)?.[1]||'mp4').toLowerCase(),file=join(dir,clip.id+'.'+ext);
   try{await download(clip.url,file);library.push({...clip,file});}catch(e){report.at(-1).errors.push(`${clip.id}: ${e.message}`);}}
  library.push(...results.filter(r=>!library.some(l=>l.id===r.id)));}
 await writeFile(join(dir,'library.json'),JSON.stringify({builtAt:new Date().toISOString(),queries,report,clips:library},null,1));
 console.log(JSON.stringify({report,downloaded:library.filter(c=>c.file).length,indexed:library.length}));
}
