import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {withProject} from './project-session.mjs';
import {sourceSession} from './source-session.mjs';

const sha=b=>createHash('sha256').update(b).digest('hex');
const report=JSON.parse(await readFile('previews/single-story/report.json'));
const links={createdAt:new Date().toISOString(),creativeStatus:'Preview only; no Instagram import or publication',versions:[]};
const session=sourceSession();
try {
 await withProject(async f=>{
  for(const row of report.reports) {
   if(!row.checks.passed||sha(await readFile('content/instagram/single-story.json'))!==row.storyHash)throw Error('Story changed since rendering');
   for(const [path,expected]of Object.entries(row.code))if(sha(await readFile(path))!==expected)throw Error('Render input changed: '+path);
   const bytes=await readFile(row.file);if(sha(bytes)!==row.sha256)throw Error('Video changed since final audit');
   const asset=await f.uploadFile({name:row.id+'-'+row.mode+'.mp4',file:{bytes:new Uint8Array(bytes),mimeType:'video/mp4'}});
   const hosted=await session.html(asset.url,/video\/mp4/,{maxBytes:20_000_000});if(sha(hosted)!==row.sha256)throw Error('Public video bytes changed');
   links.versions.push({mode:row.mode,url:asset.url,sha256:row.sha256,...row.checks,syntheticNarration:row.syntheticNarration});
  }
  const poster=await readFile('previews/single-story/frame-174.jpg');
  links.poster=(await f.uploadImage({name:'cancha-ftl-mens-2027-poster',image:{bytes:new Uint8Array(poster),mimeType:'image/jpeg'}})).url;
 });
 await writeFile('content/instagram/single-story-preview.json',JSON.stringify(links,null,2)+'\n');
 console.log(JSON.stringify({versions:links.versions.map(({mode,url})=>({mode,url})),poster:links.poster}));
}finally{await session.close()}
