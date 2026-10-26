import {writeFile,mkdir,stat} from 'node:fs/promises';import {createWriteStream} from 'node:fs';import {Readable} from 'node:stream';import {pipeline} from 'node:stream/promises';
import {pathToFileURL} from 'node:url';import {resolve,join} from 'node:path';import {youtube} from './stock-footage-search.mjs';import {execFileSync} from 'node:child_process';
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
// A clip is relevant only when its title/tags contain a meaningful word of the search (or its stem).
const stop=new Set(['the','a','an','of','and','in','on','at','to','for','with','video','clip','soccer','football']);
export function relevant(clip){if(clip.source==='club-official')return true;if(/american football|nfl|gridiron|rugby/i.test(String(clip.title||'')))return false;const words=String(clip.query).toLowerCase().split(/\s+/).filter(w=>w.length>2&&!stop.has(w));const text=String(clip.title||'').toLowerCase();
 if(!words.length)return /soccer|football|futbol|fútbol/.test(text);return words.some(w=>text.includes(w.replace(/(ing|s)$/,'')));}
// Best sources first: YouTube CC (via Commons), then curated stock, then general Commons search.
export const sourceRank=['youtube-commons','pixabay','mixkit','commons'];
// Official club media from the club's own website: match/training photos and hosted video, not logos or sponsor art.
const notFootage=/logo|lockup|sponsor|rgb|icon|badge|crest|favicon|banner|_large\.|headshot|_head_|heads_|-\d{2,4}x\d{2,4}\./i;
export function clubMediaUrls(html,host){const re=new RegExp(`https://${host.replace(/\./g,'\\.')}/wp-content/uploads/[^"'\\s?)]+\\.(?:mp4|jpe?g|webp)`,'gi');
 return [...new Set(String(html).match(re)||[])].filter(u=>!notFootage.test(u.split('/').pop()));}
export function articleLinks(html,host){const re=new RegExp(`https://${host.replace(/\./g,'\\.')}/(?:news/)?[a-z0-9-]{20,}/`,'g');return [...new Set(String(html).match(re)||[])].slice(0,4);}
export async function clubMedia(club){const pages=[club.siteUrl,club.indexUrl],urls=new Set();
 for(const html of await Promise.all(pages.map(u=>get(u,'text').catch(()=>''))))for(const a of articleLinks(html,club.host))if(!pages.includes(a))pages.push(a);
 for(const page of pages.slice(0,6)){const html=await get(page,'text').catch(()=>'');for(const u of clubMediaUrls(html,club.host))urls.add(u);}
 return [...urls].map(url=>({query:'club:'+club.id,id:'club-'+club.id+'-'+url.split('/').slice(-3).join('-').replace(/[^a-z0-9.-]/gi,'').slice(-60),title:club.organization+' · '+url.split('/').pop(),duration:/\.mp4$/i.test(url)?null:30,url,page:club.siteUrl,creator:club.organization,license:'Official club media (permission managed by Cancha)',source:'club-official',kind:/\.mp4$/i.test(url)?'video':'photo'}));}
export async function download(url,file){const response=await fetch(url,{headers:{'User-Agent':agent},signal:AbortSignal.timeout(120000)});if(!response.ok)throw Error('HTTP '+response.status);
 await pipeline(Readable.fromWeb(response.body),createWriteStream(file));if((await stat(file)).size<20000)throw Error('File too small');return file;}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const queries=String(process.env.QUERIES||'').split(/[,\n]/).map(q=>q.trim()).filter(Boolean).slice(0,15),perQuery=Math.min(Number(process.env.DOWNLOAD_PER_QUERY||0),8),dir='private-data/footage';
 if(!queries.length)throw Error('Provide at least one search');await mkdir(dir,{recursive:true});
 const library=[],report=[];
 for(const query of queries){const {results,errors}=await searchAll(query,{pixabayKey:process.env.PIXABAY_API_KEY,youtubeKey:process.env.YOUTUBE_API_KEY});report.push({query,found:results.length,bySource:Object.fromEntries(['youtube-commons','pixabay','commons','mixkit'].map(s=>[s,results.filter(r=>r.source===s).length])),errors});
  // Download a few per source so every query has a mix of looks.
  for(const source of sourceRank)for(const clip of results.filter(r=>r.source===source&&relevant(r)).slice(0,perQuery)){
   const ext=(clip.url.match(/\.(mp4|webm|ogv|mov)(?:$|\?)/i)?.[1]||'mp4').toLowerCase(),file=join(dir,clip.id+'.'+ext);
   try{await download(clip.url,file);library.push({...clip,file});}catch(e){report.at(-1).errors.push(`${clip.id}: ${e.message}`);}}
  library.push(...results.filter(r=>!library.some(l=>l.id===r.id)));}
 // Official club footage for Reels that feature a club (videos first, then the largest photos).
 if(process.env.CLUBS){const {clubs}=JSON.parse(await (await import('node:fs/promises')).readFile('config/club-media-sources.json','utf8'));
  for(const club of clubs.filter(c=>process.env.CLUBS.split(',').includes(c.id))){const found=(await clubMedia(club)).sort((a,b)=>(a.kind==='video'?0:1)-(b.kind==='video'?0:1)).slice(0,8),entry={query:'club:'+club.id,found:found.length,bySource:{'club-official':found.length},errors:[]};report.push(entry);
   for(const clip of found){const file=join(dir,clip.id);try{await download(clip.url,file);const [w,h]=execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','csv=p=0',file],{encoding:'utf8'}).trim().split(',').map(Number);if(!(w>=900&&h>=600))throw Error(`too small (${w}x${h})`);library.push({...clip,file,width:w,height:h});}catch(e){entry.errors.push(`${clip.id}: ${e.message}`);}}}}
 await writeFile(join(dir,'library.json'),JSON.stringify({builtAt:new Date().toISOString(),queries,report,clips:library},null,1));
 console.log(JSON.stringify({report,downloaded:library.filter(c=>c.file).length,indexed:library.length}));
}
