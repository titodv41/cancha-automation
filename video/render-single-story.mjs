import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {readFile, writeFile, mkdir, copyFile, mkdtemp, rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {join, resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {sourceSession} from '../scripts/source-session.mjs';
import {confirmLocalStorySource, localStoryDescriptor, localStoryHash} from '../server/local-story-source.mjs';
import {masterVideo} from './audio/master-video.mjs';
import {auditVideo} from './audit-output.mjs';

const root=resolve(import.meta.dirname,'..'), story=JSON.parse(await readFile(join(root,'content/instagram/single-story.json')));
const {brand}=JSON.parse(await readFile(join(root,'content/instagram/photo-editorial.json')));
const sha=b=>createHash('sha256').update(b).digest('hex');
const assets=join(root,'video/public/generated/single-story'), out=join(root,'previews/single-story');
await mkdir(assets,{recursive:true}); await mkdir(out,{recursive:true});
const session=sourceSession(), source=localStoryDescriptor(story.editorialSourceId);
try {
  if(!await confirmLocalStorySource({editorialSourceId:source.id, officialSourceUrl:source.documents[0].url, sourceHash:localStoryHash(source)}, {fetchImpl:async u=>new Response(await session.html(u),{headers:{'content-type':'text/html'}})})) throw Error('Official expansion facts changed or expired');
  for(const asset of [...story.assets,{...story.clip,id:'club',extension:'mp4'}]) {
    const bytes=await readFile(join(root,asset.file));
    if(sha(bytes)!==asset.sha256) throw Error('Source media changed: '+asset.id);
    if(!(await session.html(asset.sourcePage)).toString().includes(asset.url)) throw Error('Media no longer on the recorded source page: '+asset.id);
    await writeFile(join(assets,asset.id+'.'+(asset.extension||'png')),bytes);
  }
} finally {await session.close()}
for(const [name,path] of [['display.woff2',brand.displayFont],['ui.woff2',brand.bodyFont],['cancha.png',brand.logo]]) await copyFile(join(root,path),join(assets,name));

const audioModes=['music',...(process.argv.includes('--with-voice')?['voice']:[])];
for(const mode of audioModes) {
  const dir=join(assets,mode); await mkdir(dir,{recursive:true});
  let proof={parts:[],provider:null,syntheticNarration:false};
  if(mode==='voice') {
    proof=JSON.parse(await readFile(join(root,'private-data/story-voice',story.id,'narration-proof.json')));
    // Python sort_keys uses spaces in JSON separators. Bind every actual part,
    // timing and sentence as well; never silently use a stale voice audition.
    if(proof.provider!=='local-pocket-tts'||proof.voice!==story.voice.preset||proof.parts.length!==story.voice.cues.length) throw Error('Voice identity mismatch');
    for(const [i,part] of proof.parts.entries()) {
      const cue=story.voice.cues[i];
      if(part.text!==cue.text||part.start!==cue.start||part.end!==cue.end||part.durationSeconds>cue.end-cue.start||sha(await readFile(part.file))!==part.sha256) throw Error('Voice script, timing or bytes changed');
    }
  }
  await writeFile(join(dir,'story.json'),JSON.stringify(story));
  await writeFile(join(dir,'narration-proof.json'),JSON.stringify(proof));
  execFileSync(process.execPath,[join(root,'video/audio/soundtrack.mjs'),join(dir,'story.json'),dir],{stdio:'pipe'});
}

const temp=await mkdtemp(join(tmpdir(),'cancha-single-story-'));
try {
  const serveUrl=await bundle({entryPoint:join(root,'video/src/index.tsx'),publicDir:join(root,'video/public'),outDir:join(temp,'bundle'),enableCaching:false});
  const base={serveUrl,browserExecutable:process.env.CANCHA_BROWSER_EXECUTABLE||'/usr/bin/chromium'};
  const reports=[];
  let visualMaster=null;
  for(const mode of audioModes) {
    const common={...base,inputProps:{brand,story,audio:`generated/single-story/${mode}/soundtrack.wav`}};
    const composition=await selectComposition({...common,id:'SingleStory'});
    if(mode==='music') for(const frame of [30,105,123,174,249,309,387,435,507,570,690]) await renderStill({...common,composition,frame,imageFormat:'jpeg',output:join(out,`frame-${frame}.jpg`)});
    if(process.argv.includes('--still')) continue;
    const output=join(out,`${story.id}-${mode}.mp4`); let last=-1;
    // Both versions share this run's identical picture edit. Reuse the visual
    // stream only within this run; never accept an unbound old render.
    if(visualMaster) await copyFile(visualMaster,output);
    else await renderMedia({...common,composition,outputLocation:output,codec:'h264',audioCodec:'aac',crf:24,pixelFormat:'yuv420p',concurrency:2,onProgress:({progress})=>{const n=Math.floor(progress*4);if(n>last){last=n;console.log(`${mode}: ${Math.round(progress*100)}%`)}}});
    await masterVideo(output,{audioFile:join(assets,mode,'soundtrack.wav'),durationSeconds:story.durationSeconds,truePeakTargetDb:-3.5,credit:mode==='voice'?'Synthetic preset narration: Kyutai Pocket TTS, CC BY 4.0 model; Marius CC0 preset source. Original Cancha edit/music. https://github.com/kyutai-labs/pocket-tts':null});
    visualMaster=output;
    const checks=await auditVideo(output,story.durationSeconds),code={};
    for(const path of ['video/src/SingleStory.tsx','video/render-single-story.mjs','video/audio/soundtrack.mjs','video/audio/master-video.mjs',brand.displayFont,brand.bodyFont,brand.logo]) code[path]=sha(await readFile(join(root,path)));
    reports.push({id:story.id,mode,file:output,sha256:sha(await readFile(output)),storyHash:sha(await readFile(join(root,'content/instagram/single-story.json'))),sourceHash:localStoryHash(source),code,checks,syntheticNarration:mode==='voice',voice:mode==='voice'?story.voice.preset:null,originalMusic:true,sourceClipAudioUsed:false,creativeStatus:story.creativeStatus});
  }
  await writeFile(join(out,'report.json'),JSON.stringify({renderedAt:new Date().toISOString(),reports},null,2));
  console.log('Single-subject previews rendered; not imported or published.');
} finally {await rm(temp,{recursive:true,force:true})}
