import{highlightWindow}from'../server/highlight-window.mjs';
import{mkdir,writeFile}from'node:fs/promises';import{createHash}from'node:crypto';import{execFileSync}from'node:child_process';
const sha=b=>createHash('sha256').update(b).digest('hex');
// Supporting shots: official photos and clips from the same club's other recent articles (already verified entries),
// so a Reel is not one or two images on repeat. The story's own media always comes first.
export function brollCandidates(entry,entries,{now=Date.now(),maxAgeDays=30,limit=6}={}){
 const out=[];for(const e of entries){if(e.id===entry.id||e.sourceId!==entry.sourceId||now-Date.parse(e.publishedAt||e.publishedOn)>maxAgeDays*86400000)continue;
  for(const url of(e.clips||[]).slice(0,1))out.push({kind:'clip',url,sourcePage:e.url});for(const url of(e.photos||[]).slice(0,2))out.push({kind:'photo',url,sourcePage:e.url});}
 const seen=new Set([...(entry.photos||[]),...(entry.clips||[])]);return out.filter(m=>!seen.has(m.url)&&seen.add(m.url)).slice(0,limit);
}
export async function prepareNewsMedia(entry,session,{broll=[]}={}){
 const root='video/public/generated/automatic-news';await mkdir(root,{recursive:true});const media=[],blocked=[];
 const jobs=[...entry.clips.slice(0,3).map(url=>({kind:'clip',url,sourcePage:entry.url})),...entry.photos.slice(0,4).map(url=>({kind:'photo',url,sourcePage:entry.url})),...broll.map(m=>({...m,role:'broll'}))];
 for(const{kind,url,sourcePage,role}of jobs){if(media.length>=8)break;
  try{
   const u=new URL(url);if(u.hostname!==new URL(sourcePage).hostname||new URL(sourcePage).hostname!==new URL(entry.url).hostname||!u.pathname.startsWith('/wp-content/uploads/')||u.protocol!=='https:'||u.username||u.password)throw Error('Subject media origin changed');
   const b=await session.html(url,kind==='clip'?/video\/mp4/:/image\//,{maxBytes:kind==='clip'?40000000:15000000,timeoutMs:60000}),ext=kind==='clip'?'mp4':b[0]===137?'png':b[0]===255?'jpg':'webp',file=root+'/'+sha(Buffer.from(url)).slice(0,16)+'.'+ext;await writeFile(file,b);
   const data=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=width,height:format=duration','-of','json',file],{encoding:'utf8',timeout:15000})),size=data.streams.find(s=>s.width),duration=Number(data.format.duration);
   if(!size||size.width<800||size.height<400||kind==='clip'&&(!Number.isFinite(duration)||duration<2||duration>180))throw Error('Subject media size or duration is unsuitable');
   let window={};if(kind==='clip'){try{const raw=execFileSync('ffmpeg',['-hide_banner','-i',file,'-vn','-af','aresample=8000,asetnsamples=n=8000,astats=metadata=1:reset=1,ametadata=print:file=-','-f','null','-'],{encoding:'utf8',maxBuffer:2000000,stdio:['ignore','pipe','pipe'],timeout:30000}),samples=[...raw.matchAll(/pts_time:([\d.]+)[\s\S]*?lavfi\.astats\.Overall\.RMS_level=([-\d.]+)/g)].map(m=>({time:Number(m[1]),db:Number(m[2])}));window=highlightWindow(duration,samples);}catch{window=highlightWindow(duration,[])}}
   media.push({kind,originalUrl:url,sourcePage,...(role?{role}:{}),sha256:sha(b),publicFile:file.replace('video/public/',''),width:size.width,height:size.height,...(kind==='clip'?{durationSeconds:duration,...window}:{}),authorization:'owner-cleared-2026-10-22'});
  }catch(e){blocked.push({id:entry.id,media:url,reason:e.message})}
 }
 return{media,blocked};
}
