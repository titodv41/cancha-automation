import {bundle} from '@remotion/bundler';
import {renderMedia,renderStill,selectComposition} from '@remotion/renderer';
import {readFile,writeFile,mkdir,copyFile,mkdtemp,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {resolve,join} from 'node:path';
import {tmpdir} from 'node:os';
import {sourceSession} from '../scripts/source-session.mjs';
import {confirmLocalStorySource,localStoryDescriptor,localStoryHash} from '../server/local-story-source.mjs';
import {auditVideo} from './audit-output.mjs';
import {masterVideo} from './audio/master-video.mjs';
const root=resolve(import.meta.dirname,'..'),story=JSON.parse(await readFile(join(root,'content/instagram/club-cut.json'))),{brand}=JSON.parse(await readFile(join(root,'content/instagram/photo-editorial.json')));
const out=join(root,'previews/club-cut'),assets=join(root,'video/public/generated/club-cut'),work=join(root,'private-data/video-reset-2026-10-22/cut');
for(const dir of[out,assets,work])await mkdir(dir,{recursive:true});
const sha=b=>createHash('sha256').update(b).digest('hex'),source=localStoryDescriptor(story.editorialSourceId),s=sourceSession();
try{
 if(!await confirmLocalStorySource({editorialSourceId:source.id,officialSourceUrl:source.documents[0].url,sourceHash:localStoryHash(source)},{fetchImpl:async u=>new Response(await s.html(u),{headers:{'content-type':'text/html'}})}))throw Error('Official match source no longer confirms the preview');
 const crest=await s.html(story.crestUrl,/image\//);await writeFile(join(assets,'crest.png'),crest);
 const original=join(root,'private-data/motion-2026-10-22/weston-u15.mp4');
 if(sha(await readFile(original))!==story.clipChecksum)throw Error('Match clip identity changed');
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',String(story.clipStart),'-i',original,'-t',String(story.clipSeconds),'-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p',join(assets,'clip.mp4')]);
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss','15.9','-i',join(assets,'clip.mp4'),'-frames:v','1',join(assets,'poster.jpg')]);
}finally{await s.close()}
for(const[name,path]of[['display.woff2',brand.displayFont],['ui.woff2',brand.bodyFont],['cancha.png',brand.logo]])await copyFile(join(root,path),join(root,'video/public/generated',name));
const voiceIndex=process.argv.indexOf('--voice'),timingIndex=process.argv.indexOf('--timing');
let groups=[],parts=[],voiceStatus='Not generated — music-only visual preview';
if((voiceIndex>=0)!==(timingIndex>=0))throw Error('Voice audio and provider timestamps are required together');
if(voiceIndex>=0){
 const file=resolve(process.argv[voiceIndex+1]),timing=JSON.parse(await readFile(resolve(process.argv[timingIndex+1])));
 if(timing.audioSha256!==sha(await readFile(file)))throw Error('Narration audio does not match its provider timing record');
 const duration=Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',file]));
 if(timing.provider!=='elevenlabs'||timing.script!==story.script||timing.offset!==story.narrationOffset||!timing.words?.length||!Array.isArray(timing.groups)||!Number.isFinite(duration)||duration+story.narrationOffset>story.durationSeconds-.1||timing.words.at(-1).end>story.durationSeconds-.1)throw Error('Narration identity, duration or alignment does not fit this cut; re-edit before rendering');
 groups=timing.groups;parts=[{file,start:story.narrationOffset}];voiceStatus='Premium audition — '+timing.voice;
}
await writeFile(join(work,'story.json'),JSON.stringify(story));await writeFile(join(work,'narration-proof.json'),JSON.stringify({provider:parts.length?'elevenlabs':null,parts,voiceStatus}));
execFileSync(process.execPath,[join(root,'video/audio/soundtrack.mjs'),join(work,'story.json'),work],{stdio:'pipe'});
await copyFile(join(work,'soundtrack.wav'),join(assets,'soundtrack.wav'));
const inputProps={brand,story,clip:'generated/club-cut/clip.mp4',poster:'generated/club-cut/poster.jpg',crest:'generated/club-cut/crest.png',audio:'generated/club-cut/soundtrack.wav',groups};
await writeFile(join(assets,'props.json'),JSON.stringify(inputProps));
const temp=await mkdtemp(join(tmpdir(),'cancha-cut-'));
try{
 const serveUrl=await bundle({entryPoint:join(root,'video/src/index.tsx'),publicDir:join(root,'video/public'),outDir:join(temp,'bundle'),enableCaching:false});
 const common={serveUrl,browserExecutable:process.env.CANCHA_BROWSER_EXECUTABLE||'/usr/bin/chromium',inputProps};
 const composition=await selectComposition({...common,id:'ClubCut'});
 for(const frame of[35,132,260,480,550])await renderStill({...common,composition,frame,imageFormat:'jpeg',output:join(out,`frame-${frame}.jpg`)});
 if(!process.argv.includes('--still')){
  const output=join(out,story.id+(parts.length?'-voice':'-visual')+'.mp4');let last=-1;
  if(!process.argv.includes('--master-only'))await renderMedia({...common,composition,outputLocation:output,codec:'h264',audioCodec:'aac',crf:19,pixelFormat:'yuv420p',concurrency:2,onProgress:({progress})=>{const n=Math.floor(progress*4);if(n>last){last=n;console.log('Club cut: '+Math.round(progress*100)+'%')}}});
  await masterVideo(output,{audioFile:join(assets,'soundtrack.wav'),durationSeconds:story.durationSeconds});
  const checks=await auditVideo(output,story.durationSeconds);
  const code={};for(const path of['video/src/ClubCut.tsx','video/render-club-cut.mjs','video/audio/soundtrack.mjs','video/audio/master-video.mjs',brand.logo,brand.displayFont,brand.bodyFont])code[path]=sha(await readFile(join(root,path)));
  const inputs={story,brand,clipChecksum:story.clipChecksum,crestChecksum:sha(await readFile(join(assets,'crest.png'))),code,audioChecksum:sha(await readFile(join(assets,'soundtrack.wav'))),groups};
  await writeFile(join(out,'report.json'),JSON.stringify({id:story.id,file:output,checks,voiceStatus,publication:'Preview only — never imported into the publishing queue',sourcePage:story.sourcePage,permalink:story.permalink,authorization:story.authorization,inputs,designHash:sha(JSON.stringify(inputs)),renderedAt:new Date().toISOString()},null,2));
 }
 console.log('Club cut preview ready; premium voice must be auditioned before creative approval.');
}finally{await rm(temp,{recursive:true,force:true})}
