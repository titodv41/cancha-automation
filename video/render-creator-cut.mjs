import{bundle}from'@remotion/bundler';import{renderMedia,renderStill,selectComposition}from'@remotion/renderer';
import{readFile,writeFile,mkdir,copyFile,mkdtemp,rm}from'node:fs/promises';import{execFileSync}from'node:child_process';import{resolve,join}from'node:path';import{tmpdir}from'node:os';
import{clearedVideos}from'../scripts/clip-download.mjs';import{masterVideo}from'./audio/master-video.mjs';import{auditVideo}from'./audit-output.mjs';
// Usage: node video/render-creator-cut.mjs <cut.json> <folder with <id>.mp4 from the clip download workflow> [--still]
// Every shot must come from a video in config/clip-permissions.json; the on-screen credit names each creator used.
const root=resolve(import.meta.dirname,'..'),[cutFile,clipDir]=process.argv.slice(2),spec=JSON.parse(await readFile(cutFile,'utf8'));
const{brand}=JSON.parse(await readFile(join(root,'content/instagram/photo-editorial.json'))),cleared=clearedVideos(JSON.parse(await readFile(join(root,'config/clip-permissions.json'))));
const used=[...new Set(spec.shots.map(s=>s.id))],missing=used.filter(id=>!cleared.some(v=>v.id===id));if(missing.length)throw Error('Not cleared: '+missing.join(', '));
const creators=[...new Set(used.map(id=>cleared.find(v=>v.id===id).creator.replace(/ - .*/,'')))];
const assets=join(root,'video/public/generated/creator-cut'),gen=join(root,'video/public/generated/automatic-news'),out=join(root,'previews/creator-cut');
await mkdir(assets,{recursive:true});await mkdir(gen,{recursive:true});await mkdir(out,{recursive:true});
for(const[name,path]of[['display.woff2',brand.displayFont],['ui.woff2',brand.bodyFont],['cancha.png',brand.logo]])await copyFile(join(root,path),join(gen,name));
const source=id=>execFileSync('sh',['-c','ls "$0"/"$1".mp4 2>/dev/null | head -1',clipDir,id],{encoding:'utf8'}).trim();
const shots=spec.shots.map((s,k)=>{const file=`generated/creator-cut/shot-${k}.mp4`;
 execFileSync('ffmpeg',['-v','error','-y','-ss',String(s.at),'-i',source(s.id),'-t',String(s.seconds+.4),'-an','-vf',`scale=-2:1920,crop=1080:1920:(iw-1080)*${s.x??.5}:0,fps=30`,'-c:v','libx264','-crf','17','-pix_fmt','yuv420p',join(root,'video/public',file)]);
 return{...s,file};});
const durationSeconds=+(spec.shots.reduce((a,s)=>a+s.seconds,0)+spec.outroSeconds).toFixed(2);
const cut={...spec,shots,durationSeconds,credit:'Video: '+creators.join(' · ')+' (CC BY, used with permission)'};
await writeFile(join(assets,'story.json'),JSON.stringify({durationSeconds,music:{bpm:spec.bpm||124}}));await writeFile(join(assets,'narration-proof.json'),JSON.stringify({parts:[]}));
execFileSync(process.execPath,[join(root,'video/audio/soundtrack.mjs'),join(assets,'story.json'),assets],{stdio:'pipe'});
let audio=join(assets,'soundtrack.wav');
// Optional natural sound (crowd, drums) from one cleared shot, mixed under the music for that stretch.
if(spec.ambience){const a=spec.ambience,mixed=join(assets,'mix.wav');
 execFileSync('ffmpeg',['-v','error','-y','-i',audio,'-ss',String(a.at),'-t',String(a.seconds),'-i',source(a.id),'-filter_complex',`[1:a]aresample=48000,afade=t=in:d=0.3,afade=t=out:st=${a.seconds-.5}:d=0.5,volume=${a.gain||.8},adelay=${Math.round(a.start*1000)}|${Math.round(a.start*1000)},apad[n];[0:a][n]amix=inputs=2:duration=first:normalize=0`,'-ar','48000','-ac','2',mixed]);audio=mixed;}
const props={brand,cut,audio:null},temp=await mkdtemp(join(tmpdir(),'cancha-creator-'));
try{
 const serveUrl=await bundle({entryPoint:join(root,'video/src/index.tsx'),publicDir:join(root,'video/public'),outDir:join(temp,'bundle'),enableCaching:false});
 const common={serveUrl,browserExecutable:process.env.CANCHA_BROWSER_EXECUTABLE||'/usr/bin/chromium',inputProps:props},composition=await selectComposition({...common,id:'CreatorCut'});
 for(const s of[1,4,9,14,durationSeconds-1])await renderStill({...common,composition,frame:Math.round(s*30),imageFormat:'jpeg',output:join(out,`frame-${s}.jpg`)});
 if(!process.argv.includes('--still')){const output=join(out,spec.id+'.mp4');
  await renderMedia({...common,composition,outputLocation:output,codec:'h264',crf:23,pixelFormat:'yuv420p',concurrency:2,muted:true});
  await masterVideo(output,{audioFile:audio,durationSeconds,limitPeaks:true,targetLufs:-14});
  const checks=await auditVideo(output,durationSeconds);
  await writeFile(join(out,'report.json'),JSON.stringify({id:spec.id,file:output,durationSeconds,checks,creators,sources:used,syntheticNarration:false,renderedAt:new Date().toISOString()},null,2));console.log(JSON.stringify({output,durationSeconds,checks}));}
}finally{await rm(temp,{recursive:true,force:true})}
