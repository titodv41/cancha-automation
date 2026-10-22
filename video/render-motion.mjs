import{motionDesignHash}from'./render-contract.mjs';
import {bundle} from '@remotion/bundler';
import {renderMedia,renderStill,selectComposition} from '@remotion/renderer';
import {readFile,writeFile,mkdir,copyFile,mkdtemp,rm} from 'node:fs/promises';
import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
import {tmpdir} from 'node:os';
import {parseHTML} from 'linkedom';
import {sourceSession} from '../scripts/source-session.mjs';
import {confirmLocalStorySource,localStoryDescriptor,localStoryHash,exactClubFeedPost} from '../server/local-story-source.mjs';
const root=resolve(import.meta.dirname,'..'),manifest=JSON.parse(await readFile(join(root,'content/instagram/motion-stories.json'))),story=manifest.stories[0];
const base=JSON.parse(await readFile(join(root,manifest.brandManifest))),source=localStoryDescriptor(story.editorialSourceId);
if(story.clipSeconds!==18||story.durationSeconds!==22)throw Error('This motion template requires 18 seconds of footage in a 22-second story');
const out=join(root,'previews/motion'),assets=join(root,'video/public/generated/motion'),privateDir=join(root,'private-data/motion-2026-10-22/build');
await mkdir(out,{recursive:true});await mkdir(assets,{recursive:true});await mkdir(privateDir,{recursive:true,mode:0o700});
const hash=b=>createHash('sha256').update(b).digest('hex'),session=sourceSession();let clipProof;
try {
 const row={editorialSourceId:source.id,officialSourceUrl:source.documents[0].url,sourceHash:localStoryHash(source)};
 if(!await confirmLocalStorySource(row,{fetchImpl:async u=>new Response(await session.html(u),{headers:{'content-type':'text/html'}})}))throw Error('Club source changed or expired');
 const {document}=parseHTML((await session.html(story.sourcePage)).toString()),post=exactClubFeedPost(document,source.documents[0]);
 const clip=post.children.filter(c=>c.type==='video')[story.clipIndex];if(!clip)throw Error('Exact club video missing');
 const bytes=await session.html(clip.src,/video\/mp4|application\/octet-stream/,{maxBytes:20_000_000});if(hash(bytes)!==story.originalChecksum)throw Error('Club clip changed');
 const original=join(privateDir,'source.mp4');await writeFile(original,bytes);
 const info=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=codec_name,width,height:format=duration','-of','json',original]));
 const stream=info.streams.find(s=>s.codec_name==='h264');if(!stream||stream.width<1080||stream.height<720||Number(info.format.duration)<story.trimStart+story.clipSeconds)throw Error('Clip does not meet resolution/duration requirements');
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',String(story.trimStart),'-i',original,'-t',String(story.clipSeconds),'-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',join(assets,'club-clip.mp4')]);
 clipProof={sourcePage:story.sourcePage,permalink:story.permalink,publisher:story.organization,subject:'Weston FC U15 Academy match clip',authorization:story.authorization,originalChecksum:story.originalChecksum,editedChecksum:hash(await readFile(join(assets,'club-clip.mp4'))),trimStart:story.trimStart,clipSeconds:story.clipSeconds};
} finally {await session.close()}
for(const [name,path]of[['display.woff2',base.brand.displayFont],['ui.woff2',base.brand.bodyFont],['cancha.png',base.brand.logo]])await copyFile(join(root,path),join(root,'video/public/generated',name));
const storyFile=join(privateDir,'story.json');await writeFile(storyFile,JSON.stringify(story));
const run=(exe,args)=>{const result=spawnSync(exe,args,{stdio:'inherit',env:{...process.env,OMP_NUM_THREADS:'2'}});if(result.status!==0)throw Error('Local audio preparation failed')};
run(process.env.CANCHA_VOICE_PYTHON||'/tmp/cancha-voice-venv/bin/python',[join(root,'video/audio/narrate.py'),storyFile,privateDir]);
run(process.execPath,[join(root,'video/audio/soundtrack.mjs'),storyFile,privateDir]);
await copyFile(join(privateDir,'soundtrack.wav'),join(assets,'soundtrack.wav'));
const inputProps={brand:base.brand,story,clip:'generated/motion/club-clip.mp4',audio:'generated/motion/soundtrack.wav'},temp=await mkdtemp(join(tmpdir(),'cancha-motion-'));
try {
 const serveUrl=await bundle({entryPoint:join(root,'video/src/index.tsx'),publicDir:join(root,'video/public'),outDir:join(temp,'bundle'),enableCaching:false});
 const common={serveUrl,browserExecutable:process.env.CANCHA_BROWSER_EXECUTABLE||'/usr/bin/chromium',chromeMode:'chrome-for-testing',inputProps};
 const composition={...await selectComposition({...common,id:'MotionStory'}),durationInFrames:story.durationSeconds*30};
 for(const frame of[25,220,610])await renderStill({...common,composition,frame,imageFormat:'jpeg',output:join(out,`motion-frame-${frame}.jpg`)});
 if(!process.argv.includes('--still')){
  let last=-1;const file=join(out,story.id+'.mp4');await renderMedia({...common,composition,outputLocation:file,codec:'h264',audioCodec:'aac',crf:18,pixelFormat:'yuv420p',concurrency:2,onProgress:({progress})=>{const n=Math.floor(progress*4);if(n>last){last=n;console.log('Motion render '+Math.round(progress*100)+'%')}}});
  const info=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=codec_name,width,height,r_frame_rate:format=duration','-of','json',file]));
  if(!info.streams.some(s=>s.codec_name==='h264'&&s.width===1080&&s.height===1920)||!info.streams.some(s=>s.codec_name==='aac')||Math.abs(Number(info.format.duration)-story.durationSeconds)>.1)throw Error('Rendered audiovisual format failed');
  await writeFile(join(out,'motion-report.json'),JSON.stringify({story:story.id,designHash:await motionDesignHash(root,story,base.brand),file,sha256:hash(await readFile(file)),info,footage:[clipProof],audio:JSON.parse(await readFile(join(privateDir,'audio-proof.json'))),sourceHash:localStoryHash(source),renderedAt:new Date().toISOString(),voiceSynthetic:true,sourceClipAudioUsed:false},null,2));
 }
 console.log('Motion preview ready');
} finally {await rm(temp,{recursive:true,force:true})}
