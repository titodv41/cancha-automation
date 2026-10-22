import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {withProject} from './project-session.mjs';
import {sourceSession} from './source-session.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const report=JSON.parse(await readFile('previews/club-cut/report.json'));
const bytes=await readFile(report.file);
if(!report.checks.passed||hash(bytes)!==report.checks.sha256)throw Error('Preview differs from audited output');
for(const[path,expected]of Object.entries(report.inputs.code))if(hash(await readFile(path))!==expected)throw Error('Preview design inputs changed; render again');
const s=sourceSession();
try{
 const assets=await withProject(async f=>{
  const video=await f.uploadFile({name:report.id+'-preview.mp4',file:{bytes:new Uint8Array(bytes),mimeType:'video/mp4'}});
  const contact=await f.uploadImage({name:report.id+'-storyboard',image:{bytes:new Uint8Array(await readFile('previews/club-cut/contact.jpg')),mimeType:'image/jpeg'}});
  const poster=await f.uploadImage({name:report.id+'-cover',image:{bytes:new Uint8Array(await readFile('previews/club-cut/frame-35.jpg')),mimeType:'image/jpeg'}});
  return{videoUrl:video.url,storyboardUrl:contact.url,posterUrl:poster.url};
 });
 const delivered=await s.html(assets.videoUrl,/video\/mp4/,{maxBytes:20_000_000});
 if(hash(delivered)!==report.checks.sha256)throw Error('Public preview bytes changed');
 const preview={id:report.id,...assets,voiceStatus:report.voiceStatus,publication:report.publication,sha256:report.checks.sha256,checks:report.checks,hostedAt:new Date().toISOString()};
 await writeFile('content/instagram/club-cut-preview.json',JSON.stringify(preview,null,2)+'\n');
 console.log(JSON.stringify(preview));
}finally{await s.close()}
