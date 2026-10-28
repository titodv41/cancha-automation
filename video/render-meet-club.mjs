import{chromium}from'playwright';
import{bundle}from'@remotion/bundler';import{renderMedia,renderStill,selectComposition}from'@remotion/renderer';
import{readFile,writeFile,mkdir,copyFile,mkdtemp,rm}from'node:fs/promises';import{resolve,join,dirname}from'node:path';import{tmpdir}from'node:os';import{execFileSync}from'node:child_process';import{createHash}from'node:crypto';
import{meetClubProblems}from'../server/meet-club.mjs';import{masterVideo}from'./audio/master-video.mjs';import{auditVideo}from'./audit-output.mjs';
// Renders one "Meet Your Local Club" Reel from a private feature folder: private-data/meet-club/<id>/feature.json plus
// the clips it names. Output stays private for owner review: <folder>/render/<id>.mp4, poster and report.
const input=process.argv[2];if(!input?.startsWith('private-data/meet-club/')||!input.endsWith('/feature.json'))throw Error('Use private-data/meet-club/<id>/feature.json');
const feature=JSON.parse(await readFile(input)),folder=dirname(input),problems=meetClubProblems(feature);if(problems.length)throw Error('Feature not ready:\n- '+problems.join('\n- '));
const{brand}=JSON.parse(await readFile('content/instagram/photo-editorial.json')),assets='video/public/generated/meet-club',out=join(folder,'render'),sha=b=>createHash('sha256').update(b).digest('hex');
await mkdir(assets,{recursive:true});await mkdir(out,{recursive:true,mode:0o700});
for(const[name,file]of[['display.woff2',brand.displayFont],['ui.woff2',brand.bodyFont],['cancha.png',brand.logo]])await copyFile(file,assets+'/'+name);
const segments=[],clips=[];
for(const[i,s]of feature.segments.entries()){
 const source=join(folder,s.file),bytes=await readFile(source),info=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=codec_type,width,height:format=duration','-of','json',source],{encoding:'utf8'})),video=info.streams.find(x=>x.codec_type==='video');
 if(!video||Math.min(video.width,video.height)<480)throw Error(`${s.file}: video is missing or below 480p`);if((s.start||0)+s.duration>Number(info.format.duration)+.05)throw Error(`${s.file}: segment runs past the end of the clip`);
 const name=`${feature.id}-${i+1}.mp4`;await copyFile(source,join(assets,name));segments.push({...s,publicFile:'generated/meet-club/'+name});clips.push({file:s.file,sha256:sha(bytes),hasAudio:info.streams.some(x=>x.codec_type==='audio')});
}
const durationSeconds=2.4+4+feature.segments.reduce((a,s)=>a+s.duration,0);
// Original music bed, kept low under the organization's own voices.
await writeFile(assets+'/score.json',JSON.stringify({durationSeconds,music:{bpm:118,openGain:.55,duckedGain:.55,transitionSeconds:[2.4,durationSeconds-4]}}));
await writeFile(assets+'/narration-proof.json',JSON.stringify({provider:'none',syntheticNarration:false,parts:[]}));
execFileSync(process.execPath,['video/audio/soundtrack.mjs',assets+'/score.json',assets],{stdio:'pipe'});
const temp=await mkdtemp(join(tmpdir(),'cancha-meet-club-'));
try{const serveUrl=await bundle({entryPoint:resolve('video/src/index.tsx'),publicDir:resolve('video/public'),outDir:join(temp,'bundle'),enableCaching:false}),
  common={serveUrl,browserExecutable:process.env.CANCHA_BROWSER_EXECUTABLE||chromium.executablePath(),inputProps:{brand,feature:{...feature,segments},music:'generated/meet-club/soundtrack.wav'}},composition=await selectComposition({...common,id:'MeetClub'});
 await renderStill({...common,composition,frame:20,imageFormat:'jpeg',output:join(out,'poster.jpg')});
 const file=join(out,feature.id+'.mp4');await renderMedia({...common,composition,outputLocation:file,codec:'h264',audioCodec:'aac',crf:23,pixelFormat:'yuv420p',concurrency:2});
 await masterVideo(file,{audioFile:file,durationSeconds,truePeakTargetDb:-3.5,limitPeaks:true,targetLufs:-13});const deliveryAudit=await auditVideo(file,durationSeconds);
 await writeFile(join(out,'report.json'),JSON.stringify({id:feature.id,file,poster:join(out,'poster.jpg'),sha256:sha(await readFile(file)),clips,consent:feature.consent,deliveryAudit,renderedAt:new Date().toISOString(),published:false},null,2),{mode:0o600});
 console.log(JSON.stringify({rendered:feature.id,seconds:durationSeconds,clips:clips.length,published:false}));
}finally{await rm(temp,{recursive:true,force:true})}
