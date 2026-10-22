import {bundle} from '@remotion/bundler';
import {renderMedia,renderStill,selectComposition} from '@remotion/renderer';
import {copyFile,mkdir,mkdtemp,rm,writeFile,readFile} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {confirmLocalStorySource,localStoryDescriptor,localStoryHash} from '../server/local-story-source.mjs';
import {sourceSession} from '../scripts/source-session.mjs';
const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'..'),out=join(root,'previews/video');
const source=localStoryDescriptor('puerta-four-goals-20261016'),session=sourceSession();
try{if(!await confirmLocalStorySource({editorialSourceId:source.id,sourceHash:localStoryHash(source),officialSourceUrl:source.documents[0].url},{fetchImpl:async u=>new Response(await session.html(u),{headers:{'content-type':'text/html'}})}))throw Error('Player story changed or expired; review before rendering');}finally{await session.close()}
await mkdir(join(here,'public/generated'),{recursive:true});await mkdir(out,{recursive:true});
for(const asset of ['display.woff2','ui.woff2','cancha.png','jax.png'])await copyFile(join(root,'content/instagram/local-stories/assets',asset),join(here,'public/generated',asset));
const temp=await mkdtemp(join(tmpdir(),'cancha-video-'));
try{
 const serveUrl=await bundle({entryPoint:join(here,'src/index.tsx'),outDir:join(temp,'bundle'),publicDir:join(here,'public'),enableCaching:false});
 const browserExecutable=process.env.CANCHA_BROWSER_EXECUTABLE||'/usr/bin/chromium';
 const common={serveUrl,browserExecutable,chromeMode:'chrome-for-testing'};
 const composition=await selectComposition({...common,id:'PuertaFourGoals'});
 for(const frame of [75,240,440])await renderStill({...common,composition,frame,imageFormat:'jpeg',output:join(out,`puerta-frame-${frame}.jpg`)});
 if(!process.argv.includes('--still')){
  let previous=-1;const outputLocation=join(out,'puerta-four-goals.mp4');
  await renderMedia({...common,composition,outputLocation,codec:'h264',crf:18,pixelFormat:'yuv420p',concurrency:2,onProgress:({progress})=>{const step=Math.floor(progress*4);if(step>previous){previous=step;console.log('Video render '+Math.round(progress*100)+'%')}}});
  await writeFile(join(out,'render-report.json'),JSON.stringify({previewOnly:true,composition:'PuertaFourGoals',width:1080,height:1920,fps:30,frames:540,durationSeconds:18,audio:false,renderedAt:new Date().toISOString(),sourceUrl:source.documents[0].url,sourceHash:localStoryHash(source),sha256:createHash('sha256').update(await readFile(outputLocation)).digest('hex')},null,2));
 }
 console.log('Local video preview ready: previews/video/');
}finally{await rm(temp,{recursive:true,force:true})}
