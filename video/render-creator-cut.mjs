import{bundle}from'@remotion/bundler';import{renderMedia,renderStill,selectComposition}from'@remotion/renderer';
import{readFile,writeFile,mkdir,copyFile,mkdtemp,rm}from'node:fs/promises';import{createHash}from'node:crypto';import{execFileSync}from'node:child_process';import{resolve,join}from'node:path';import{tmpdir}from'node:os';
import{chromium}from'playwright';import{clearedVideos}from'../scripts/clip-download.mjs';import{masterVideo}from'./audio/master-video.mjs';import{auditVideo}from'./audit-output.mjs';
// Usage: node video/render-creator-cut.mjs <cut.json> <folder with <id>.mp4 from the clip download workflow> [--voice <timing.json>] [--out <dir>] [--still]
// Every shot must come from a video in config/clip-permissions.json; the on-screen credit names each creator used.
const root=resolve(import.meta.dirname,'..'),[cutFile,clipDir]=process.argv.slice(2),arg=n=>{const i=process.argv.indexOf(n);return i>0?process.argv[i+1]:null};
const spec=JSON.parse(await readFile(cutFile,'utf8')),sha=b=>createHash('sha256').update(b).digest('hex');
const{brand}=JSON.parse(await readFile(join(root,'content/instagram/photo-editorial.json'))),cleared=clearedVideos(JSON.parse(await readFile(join(root,'config/clip-permissions.json'))));
const used=[...new Set([...spec.shots,...(spec.sfx||[])].map(s=>s.id))],missing=used.filter(id=>!cleared.some(v=>v.id===id));if(missing.length)throw Error('Not cleared: '+missing.join(', '));
const creators=[...new Set(spec.shots.map(s=>cleared.find(v=>v.id===s.id).creator.replace(/ - .*/,'')))];
const assets=join(root,'video/public/generated/creator-cut'),gen=join(root,'video/public/generated/automatic-news'),out=resolve(arg('--out')||join(root,'previews/creator-cut'));
await mkdir(assets,{recursive:true});await mkdir(gen,{recursive:true});await mkdir(out,{recursive:true});
for(const[name,path]of[['display.woff2',brand.displayFont],['ui.woff2',brand.bodyFont],['cancha.png',brand.logo]])await copyFile(join(root,path),join(gen,name));
const source=id=>join(clipDir,id+'.mp4');
// A shot with fit:true shows the whole 16:9 frame (charts, boards) in the upper part over a blurred fill instead of a centre crop.
// With narration, shots and lines stretch evenly so the picture never runs out before the voice does.
const timing=arg('--voice')?JSON.parse(await readFile(arg('--voice'),'utf8')):null,voiceEnd=timing?timing.words.at(-1).end:0;
const planned=spec.shots.reduce((a,s)=>a+s.seconds,0),k=Math.max(1,(voiceEnd+.7)/planned),r=x=>Math.round(x*k*30)/30;
const shots=spec.shots.map((s,i)=>{const file=`generated/creator-cut/shot-${i}.mp4`,seconds=r(s.seconds);
 execFileSync('ffmpeg',['-v','error','-y','-ss',String(s.at),'-i',source(s.id),'-t',String(seconds+.4),'-an','-vf',s.fit?`split[a][b];[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=24:2,eq=brightness=-0.18[bg];[b]scale=1080:-2[fg];[bg][fg]overlay=0:300,fps=30`:`scale=-2:1920,crop=1080:1920:(iw-1080)*${s.x??.5}:0,fps=30`,'-c:v','libx264','-crf','17','-pix_fmt','yuv420p',join(root,'video/public',file)]);
 return{...s,seconds,file};});
const durationSeconds=+(shots.reduce((a,s)=>a+s.seconds,0)+spec.outroSeconds).toFixed(2);
const cut={...spec,shots,beats:spec.beats.map(b=>({...b,start:r(b.start),end:r(b.end)})),hookSeconds:r(spec.hookSeconds),durationSeconds,credit:'Video: '+creators.join(' · ')+' · YouTube'+(spec.shots.every(x=>cleared.find(v=>v.id===x.id).license==='cc-by')?' (CC BY)':'')};
await writeFile(join(assets,'story.json'),JSON.stringify({durationSeconds,music:{bpm:spec.bpm||(spec.musicStyle==='cinematic'?84:124),style:spec.musicStyle||'bright-house'}}));
await writeFile(join(assets,'narration-proof.json'),JSON.stringify({parts:timing?[{file:resolve(arg('--voice').replace(/\.json$/,'.mp3')),start:0}]:[]}));
execFileSync(process.execPath,[join(root,'video/audio/soundtrack.mjs'),join(assets,'story.json'),assets],{stdio:'pipe'});
let audio=join(assets,'soundtrack.wav');
// Natural sound (crowd, drums, cheers) from cleared videos, mixed under the music at the planned moments.
for(const[n,a]of(spec.sfx||[]).entries()){const mixed=join(assets,`mix-${n}.wav`),at=Math.round(r(a.start)*1000);
 execFileSync('ffmpeg',['-v','error','-y','-i',audio,'-ss',String(a.at),'-t',String(a.seconds),'-i',source(a.id),'-filter_complex',`[1:a]aresample=48000,aformat=channel_layouts=stereo,afade=t=in:d=0.3,afade=t=out:st=${Math.max(0,a.seconds-.6)}:d=0.6,volume=${a.gain??.8},adelay=${at}|${at},apad[n];[0:a][n]amix=inputs=2:duration=first:normalize=0`,'-ar','48000','-ac','2',mixed]);audio=mixed;}
const props={brand,cut,audio:null},temp=await mkdtemp(join(tmpdir(),'cancha-creator-'));
try{
 const serveUrl=await bundle({entryPoint:join(root,'video/src/index.tsx'),publicDir:join(root,'video/public'),outDir:join(temp,'bundle'),enableCaching:false});
 const common={serveUrl,browserExecutable:process.env.CANCHA_BROWSER_EXECUTABLE||chromium.executablePath(),inputProps:props},composition=await selectComposition({...common,id:'CreatorCut'});
 const poster=join(out,spec.id+'.jpg');await renderStill({...common,composition,frame:Math.round(r(spec.posterSeconds??1.2)*30),imageFormat:'jpeg',output:poster});
 if(!process.argv.includes('--still')){const output=join(out,spec.id+'.mp4');
  await renderMedia({...common,composition,outputLocation:output,codec:'h264',crf:23,pixelFormat:'yuv420p',concurrency:2,muted:true});
  await masterVideo(output,{audioFile:audio,durationSeconds,limitPeaks:true,targetLufs:-14});
  const checks=await auditVideo(output,durationSeconds);
  await writeFile(join(out,spec.id+'.json'),JSON.stringify({id:spec.id,file:output,poster,seconds:durationSeconds,rendered:checks.passed,checks,creators,narration:timing?{voice:timing.voice,audioSha256:timing.audioSha256}:null,
   footage:used.map(id=>{const v=cleared.find(x=>x.id===id);return{source:'youtube-cleared',id,creator:v.creator,license:v.license==='cc-by'?'CC BY 3.0 (YouTube Creative Commons)':'creator permission',page:'https://www.youtube.com/watch?v='+id}}),
   videoSha256:sha(await readFile(output)),renderedAt:new Date().toISOString()},null,2));console.log(JSON.stringify({output,durationSeconds,checks}));}
}finally{await rm(temp,{recursive:true,force:true})}
