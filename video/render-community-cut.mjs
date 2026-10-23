import{bundle}from'@remotion/bundler';import{renderMedia,renderStill,selectComposition}from'@remotion/renderer';
import{readFile,writeFile,mkdir,copyFile,mkdtemp,rm}from'node:fs/promises';import{createHash}from'node:crypto';import{execFileSync,spawnSync}from'node:child_process';import{resolve,join}from'node:path';import{tmpdir}from'node:os';
import{sourceSession}from'../scripts/source-session.mjs';import{confirmLocalStorySource,localStoryDescriptor,localStoryHash}from'../server/local-story-source.mjs';import{masterVideo}from'./audio/master-video.mjs';import{auditVideo}from'./audit-output.mjs';
const root=resolve(import.meta.dirname,'..'),story=JSON.parse(await readFile(join(root,'content/instagram/community-cut.json'))),{brand}=JSON.parse(await readFile(join(root,'content/instagram/photo-editorial.json'))),sha=b=>createHash('sha256').update(b).digest('hex');
const out=join(root,'previews/community-cut'),assets=join(root,'video/public/generated/community-cut');await mkdir(out,{recursive:true});await mkdir(assets,{recursive:true});
const session=sourceSession(),source=localStoryDescriptor(story.editorialSourceId),file=join(root,story.sourceFile);
try{
 if(!await confirmLocalStorySource({editorialSourceId:source.id,officialSourceUrl:source.documents[0].url,sourceHash:localStoryHash(source)},{fetchImpl:async u=>new Response(await session.html(u),{headers:{'content-type':'text/html'}})}))throw Error('Current club/venue facts no longer match');
 if(!(await session.html(story.sourcePage)).toString().includes(story.sourceVideoUrl)||sha(await readFile(file))!==story.originalSha256)throw Error('Club film identity changed');
}finally{await session.close()}
await copyFile(file,join(assets,'clip.mp4'));
for(const[name,path]of[['display.woff2',brand.displayFont],['ui.woff2',brand.bodyFont],['cancha.png',brand.logo]])await copyFile(join(root,path),join(root,'video/public/generated',name));
const measured=spawnSync('ffmpeg',['-hide_banner','-i',file,'-vn','-af','volumedetect','-f','null','-'],{encoding:'utf8',maxBuffer:2_000_000});
if(measured.status!==0)throw Error('Cannot inspect source audio');const level=measured.stderr.match(/max_volume:\s*(-?[\d.]+|-inf) dB/);if(!level)throw Error('Source audio measurement missing');const sourcePeak=Number(level[1]),useSourceAudio=sourcePeak>-60;
if(useSourceAudio)execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',file,'-vn','-t',String(story.durationSeconds),'-af','afade=t=in:st=0:d=0.04,afade=t=out:st=17.15:d=0.35','-ar','48000','-ac','2',join(assets,'audio.wav')]);
else{await writeFile(join(assets,'story.json'),JSON.stringify(story));await writeFile(join(assets,'narration-proof.json'),JSON.stringify({parts:[],provider:null,syntheticNarration:false}));execFileSync(process.execPath,[join(root,'video/audio/soundtrack.mjs'),join(assets,'story.json'),assets],{stdio:'pipe'});await copyFile(join(assets,'soundtrack.wav'),join(assets,'audio.wav'));}
const props={brand,story,clip:'generated/community-cut/clip.mp4',audio:'generated/community-cut/audio.wav'},temp=await mkdtemp(join(tmpdir(),'cancha-community-'));
try{
 const serveUrl=await bundle({entryPoint:join(root,'video/src/index.tsx'),publicDir:join(root,'video/public'),outDir:join(temp,'bundle'),enableCaching:false});
 const common={serveUrl,browserExecutable:process.env.CANCHA_BROWSER_EXECUTABLE||'/usr/bin/chromium',inputProps:props},composition=await selectComposition({...common,id:'CommunityCut'});
 for(const frame of[30,180,285,420,500])await renderStill({...common,composition,frame,imageFormat:'jpeg',output:join(out,`frame-${frame}.jpg`)});
 if(!process.argv.includes('--still')){
  const output=join(out,story.id+'.mp4');let last=-1;if(!process.argv.includes('--audio-only'))await renderMedia({...common,composition,outputLocation:output,codec:'h264',audioCodec:'aac',crf:23,pixelFormat:'yuv420p',concurrency:2,onProgress:({progress})=>{const n=Math.floor(progress*4);if(n>last){last=n;console.log('Community film: '+Math.round(progress*100)+'%')}}});
  await masterVideo(output,{audioFile:join(assets,'audio.wav'),durationSeconds:story.durationSeconds});const checks=await auditVideo(output,story.durationSeconds),code={};
  for(const p of['video/src/CommunityCut.tsx','video/render-community-cut.mjs','video/audio/master-video.mjs','video/audio/soundtrack.mjs',brand.logo,brand.displayFont,brand.bodyFont])code[p]=sha(await readFile(join(root,p)));
  await writeFile(join(out,'report.json'),JSON.stringify({id:story.id,file:output,checks,story,sourceHash:localStoryHash(source),code,sourceAudioUsed:useSourceAudio,sourceAudioMaxDb:Number.isFinite(sourcePeak)?sourcePeak:'-inf',originalMusic:!useSourceAudio,musicBPM:useSourceAudio?null:story.music.bpm,audioSha256:sha(await readFile(join(assets,'audio.wav'))),syntheticNarration:false,creativeStatus:story.creativeStatus,renderedAt:new Date().toISOString()},null,2));
 }
 console.log('Real club footage and original music preview ready; not imported or published.');
}finally{await rm(temp,{recursive:true,force:true})}
