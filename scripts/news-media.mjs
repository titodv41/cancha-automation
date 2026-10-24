import{highlightWindow}from'../server/highlight-window.mjs';
import{mkdir,writeFile}from'node:fs/promises';import{createHash}from'node:crypto';import{execFileSync}from'node:child_process';
const sha=b=>createHash('sha256').update(b).digest('hex');
export async function prepareNewsMedia(entry,session){
 const root='video/public/generated/automatic-news';await mkdir(root,{recursive:true});const media=[],blocked=[];
 for(const[kind,urls]of[['clip',entry.clips],['photo',entry.photos]])for(const url of urls.slice(0,kind==='clip'?2:1)){
  try{
   const u=new URL(url);if(u.hostname!==new URL(entry.url).hostname||!u.pathname.startsWith('/wp-content/uploads/')||u.protocol!=='https:'||u.username||u.password)throw Error('Subject media origin changed');
   const b=await session.html(url,kind==='clip'?/video\/mp4/:/image\//,{maxBytes:kind==='clip'?40000000:15000000,timeoutMs:60000}),ext=kind==='clip'?'mp4':b[0]===137?'png':b[0]===255?'jpg':'webp',file=root+'/'+sha(Buffer.from(url)).slice(0,16)+'.'+ext;await writeFile(file,b);
   const data=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=width,height:format=duration','-of','json',file],{encoding:'utf8',timeout:15000})),size=data.streams.find(s=>s.width),duration=Number(data.format.duration);
   if(!size||size.width<800||size.height<400||kind==='clip'&&(!Number.isFinite(duration)||duration<2||duration>180))throw Error('Subject media size or duration is unsuitable');
   let window={};if(kind==='clip'){try{const raw=execFileSync('ffmpeg',['-hide_banner','-i',file,'-vn','-af','aresample=8000,asetnsamples=n=8000,astats=metadata=1:reset=1,ametadata=print:file=-','-f','null','-'],{encoding:'utf8',maxBuffer:2000000,stdio:['ignore','pipe','pipe'],timeout:30000}),samples=[...raw.matchAll(/pts_time:([\d.]+)[\s\S]*?lavfi\.astats\.Overall\.RMS_level=([-\d.]+)/g)].map(m=>({time:Number(m[1]),db:Number(m[2])}));window=highlightWindow(duration,samples);}catch{window=highlightWindow(duration,[])}}
   media.push({kind,originalUrl:url,sourcePage:entry.url,sha256:sha(b),publicFile:file.replace('video/public/',''),width:size.width,height:size.height,...(kind==='clip'?{durationSeconds:duration,...window}:{}),authorization:'owner-cleared-2026-10-22'});
  }catch(e){blocked.push({id:entry.id,media:url,reason:e.message})}
 }
 return{media,blocked};
}
