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
const manifest=JSON.parse(await readFile(join(root,'content/instagram/photo-editorial.json')));
const id=process.argv.find(a=>a.startsWith('--story='))?.split('=')[1]||'local-puerta-four-20261022';
const post=manifest.posts.find(p=>p.id===id&&p.video);if(!post)throw Error('A reviewed photo story with video beats is required');
const source=localStoryDescriptor(post.editorialSourceId),session=sourceSession(),photos={},proof=[];
await mkdir(join(here,'public/generated'),{recursive:true});await mkdir(out,{recursive:true});
try {
 if(!await confirmLocalStorySource({editorialSourceId:source.id,sourceHash:localStoryHash(source),officialSourceUrl:source.documents[0].url},{fetchImpl:async u=>new Response(await session.html(u),{headers:{'content-type':'text/html'}})}))throw Error('Story expired or changed');
 for(const photo of post.photos){
  const bytes=await session.html(photo.originalUrl,/image\/(jpeg|png)/,{maxBytes:15_000_000}),checksum=createHash('sha256').update(bytes).digest('hex');
  if(photo.originalChecksum&&photo.originalChecksum!==checksum)throw Error('Photo changed: '+photo.id);
  const name=photo.id+(bytes[0]===137?'.png':'.jpg');await writeFile(join(here,'public/generated',name),bytes);photos[photo.id]='generated/'+name;proof.push({...photo,originalChecksum:checksum});
 }
} finally {await session.close()}
for(const [file,path]of [['display.woff2',manifest.brand.displayFont],['ui.woff2',manifest.brand.bodyFont],['cancha.png',manifest.brand.logo]])await copyFile(join(root,path),join(here,'public/generated',file));
const frames=post.video.durationSeconds*30;
if(post.video.beats[0].start!==0||post.video.beats.at(-1).end!==frames||post.video.beats.some((b,i)=>b.end<=b.start||!photos[b.photoId]||i>0&&b.start!==post.video.beats[i-1].end))throw Error('Invalid video timeline');
const inputProps={brand:manifest.brand,beats:post.video.beats,photos};await writeFile(join(here,'public/generated/input-props.json'),JSON.stringify(inputProps));const temp=await mkdtemp(join(tmpdir(),'cancha-video-'));
try {
 const serveUrl=await bundle({entryPoint:join(here,'src/index.tsx'),outDir:join(temp,'bundle'),publicDir:join(here,'public'),enableCaching:false});
 const common={serveUrl,browserExecutable:process.env.CANCHA_BROWSER_EXECUTABLE||'/usr/bin/chromium',chromeMode:'chrome-for-testing',inputProps};
 const composition={...await selectComposition({...common,id:'PhotoStory'}),durationInFrames:frames};
 for(const frame of [70,220,370])await renderStill({...common,composition,frame,imageFormat:'jpeg',output:join(out,`photo-story-frame-${frame}.jpg`)});
 if(!process.argv.includes('--still')){
  let previous=-1;const outputLocation=join(out,post.id+'.mp4');
  await renderMedia({...common,composition,outputLocation,codec:'h264',crf:18,pixelFormat:'yuv420p',concurrency:2,onProgress:({progress})=>{const step=Math.floor(progress*4);if(step>previous){previous=step;console.log('Video render '+Math.round(progress*100)+'%')}}});
  await writeFile(join(out,'photo-story-report.json'),JSON.stringify({previewOnly:true,file:post.id+'.mp4',story:id,width:1080,height:1920,fps:30,frames,durationSeconds:frames/30,audio:false,renderedAt:new Date().toISOString(),sourceHash:localStoryHash(source),photos:proof,sha256:createHash('sha256').update(await readFile(outputLocation)).digest('hex')},null,2));
 }
 console.log('Photo-led video ready: previews/video/');
} finally {await rm(temp,{recursive:true,force:true})}
