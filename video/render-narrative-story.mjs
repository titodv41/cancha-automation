import{chromium}from'playwright';
import {bundle} from '@remotion/bundler';
import {renderMedia,renderStill,selectComposition} from '@remotion/renderer';
import {readFile,writeFile,mkdir,copyFile,mkdtemp,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {resolve,join} from 'node:path';
import {tmpdir} from 'node:os';
import {sourceSession} from '../scripts/source-session.mjs';
import {localStoryDescriptor,localStoryHash,confirmLocalStorySource} from '../server/local-story-source.mjs';
import {narrativeTimeline} from './audio/narrative-timing.mjs';
import {masterVideo} from './audio/master-video.mjs';
import {auditVideo} from './audit-output.mjs';

const arg=name=>{const i=process.argv.indexOf(name);return i<0?null:process.argv[i+1]},root=resolve(import.meta.dirname,'..');
const voiceFile=arg('--voice'),timingFile=arg('--timing');if(!voiceFile||!timingFile)throw Error('Use --voice and --timing from the successful ElevenLabs audition artifact. No local narrator fallback.');
const sha=b=>createHash('sha256').update(b).digest('hex'),storyPath=arg('--story')||'content/instagram/story-narration.json';
const story=JSON.parse(await readFile(storyPath)),media=JSON.parse(await readFile(arg('--media')||'content/instagram/single-story.json')),timing=JSON.parse(await readFile(timingFile)),{brand}=JSON.parse(await readFile('content/instagram/photo-editorial.json'));
if(!story.visuals?.opening?.title||!/^[0-9]{4}$/.test(story.visuals?.season?.year||'')||!story.visuals?.footageContext)throw Error('A reviewed visual map is required');
const voiceBytes=await readFile(voiceFile),audioSha256=sha(voiceBytes),audioSeconds=Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',voiceFile],{encoding:'utf8'}));
const edit=narrativeTimeline(story,timing,{audioSha256,audioSeconds}),assets=resolve('video/public/generated/narrative-story'),out=resolve('previews/narrative-story');
await mkdir(assets,{recursive:true});await mkdir(out,{recursive:true});
const source=localStoryDescriptor(story.editorialSourceId),session=sourceSession();
try{
 if(!source||media.editorialSourceId!==story.editorialSourceId||!await confirmLocalStorySource({editorialSourceId:source.id,officialSourceUrl:source.documents[0].url,sourceHash:localStoryHash(source)},{fetchImpl:async u=>new Response(await session.html(u),{headers:{'content-type':'text/html'}})}))throw Error('Narrative source changed or expired');
 for(const a of [...media.assets.filter(a=>['crest','stadium'].includes(a.id)),{...media.clip,id:'club',extension:'mp4'}]){const bytes=await readFile(a.file);if(sha(bytes)!==a.sha256||!(await session.html(a.sourcePage)).toString().includes(a.url))throw Error('Reviewed narrative source media changed: '+a.id);await writeFile(join(assets,a.id+'.'+(a.extension||'png')),bytes)}
}finally{await session.close()}
for(const[name,path]of [['display.woff2',brand.displayFont],['ui.woff2',brand.bodyFont],['ui-bold.woff2',brand.bodyBoldFont||brand.bodyFont],['cancha.png',brand.logo]])await copyFile(path,join(assets,name));
const score={durationSeconds:edit.durationSeconds,music:{bpm:126,openGain:.7,duckedGain:.22,transitionSeconds:edit.scenes.slice(1).map(s=>s.start)}};
await writeFile(join(assets,'story.json'),JSON.stringify(score));await writeFile(join(assets,'narration-proof.json'),JSON.stringify({provider:'elevenlabs',model:timing.model,voice:timing.voice,audioSha256,syntheticNarration:true,parts:[{file:resolve(voiceFile),start:story.narrationOffset,sha256:audioSha256,durationSeconds:audioSeconds}]}));
execFileSync(process.execPath,['video/audio/soundtrack.mjs',join(assets,'story.json'),assets],{stdio:'pipe'});
const temp=await mkdtemp(join(tmpdir(),'cancha-narrative-'));
try{
 const serveUrl=await bundle({entryPoint:resolve('video/src/index.tsx'),publicDir:resolve('video/public'),outDir:join(temp,'bundle'),enableCaching:false});
 const common={serveUrl,browserExecutable:process.env.CANCHA_BROWSER_EXECUTABLE||chromium.executablePath(),inputProps:{brand,edit,visuals:story.visuals,audio:'generated/narrative-story/soundtrack.wav',groups:timing.groups}};
 const composition=await selectComposition({...common,id:'NarrativeStory'}),frames=[...new Set([0,...edit.scenes.flatMap(s=>[Math.floor((s.start+.5)*30),Math.floor((s.start+.12)*30)])])];
 for(const frame of frames)await renderStill({...common,composition,frame,imageFormat:'jpeg',output:join(out,'frame-'+frame+'.jpg')});
 if(process.argv.includes('--still')){await writeFile(join(out,'storyboard.json'),JSON.stringify({edit,voice:timing.voice,frames,audioSha256},null,2));console.log('Actual-voice storyboard rendered; no MP4 or publication.');}
 else{
  const output=join(out,story.id+'-'+timing.voice.toLowerCase()+'.mp4');let last=-1;
  await renderMedia({...common,composition,outputLocation:output,codec:'h264',audioCodec:'aac',crf:25,pixelFormat:'yuv420p',concurrency:2,onProgress:({progress})=>{const n=Math.floor(progress*4);if(n>last){last=n;console.log('Narrative '+Math.round(progress*100)+'%')}}});
  await masterVideo(output,{audioFile:join(assets,'soundtrack.wav'),durationSeconds:edit.durationSeconds,truePeakTargetDb:-3.5});const checks=await auditVideo(output,edit.durationSeconds),code={};
  for(const p of ['video/src/index.tsx','video/src/NarrativeStory.tsx','video/render-narrative-story.mjs','video/audio/narrative-timing.mjs','video/audio/soundtrack.mjs','video/audio/master-video.mjs',brand.displayFont,brand.bodyFont,...(brand.bodyBoldFont?[brand.bodyBoldFont]:[]),brand.logo])code[p]=sha(await readFile(p));
  const report={id:story.id,voice:timing.voice,provider:'elevenlabs',model:timing.model,creativeStatus:process.argv.includes('--production')?'Prepared for owner-authorized queue selection; renderer never publishes':'Owner-requested preview only; no Instagram import or publication',file:output,sha256:sha(await readFile(output)),storyPath,storyHash:sha(await readFile(storyPath)),sourceHash:localStoryHash(source),brandHash:sha(Buffer.from(JSON.stringify(brand))),audioSha256,code,checks,edit,renderedAt:new Date().toISOString(),syntheticNarration:true,originalMusic:true,sourceClipAudioUsed:false};
  await writeFile(join(out,'report-'+timing.voice.toLowerCase()+'.json'),JSON.stringify(report,null,2));console.log('Narrated story rendered and audited; not scheduled or published.');
 }
}finally{await rm(temp,{recursive:true,force:true})}
