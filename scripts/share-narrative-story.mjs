import{readFile,writeFile}from'node:fs/promises';
import{createHash}from'node:crypto';
import{withProject}from'./project-session.mjs';
import{sourceSession}from'./source-session.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const input=process.argv[2];if(!input)throw Error('Pass the audited narrative report JSON');const r=JSON.parse(await readFile(input));
if(r.provider!=='elevenlabs'||!r.checks.passed||sha(await readFile(r.storyPath))!==r.storyHash)throw Error('Narrative source or delivery proof changed');
for(const[p,expected]of Object.entries(r.code))if(sha(await readFile(p))!==expected)throw Error('Narrative renderer changed since review');
const bytes=await readFile(r.file);if(sha(bytes)!==r.sha256)throw Error('Narrative movie bytes changed');const s=sourceSession();
try{let url;await withProject(async f=>{url=(await f.uploadFile({name:r.id+'-'+r.voice.toLowerCase()+'.mp4',file:{bytes:new Uint8Array(bytes),mimeType:'video/mp4'}})).url});if(sha(await s.html(url,/video\/mp4/,{maxBytes:20000000}))!==r.sha256)throw Error('Hosted narrative movie changed');
 const links={createdAt:new Date().toISOString(),url,voice:r.voice,provider:r.provider,model:r.model,syntheticNarration:true,creativeStatus:r.creativeStatus,...r.checks};await writeFile('content/instagram/narrative-preview-'+r.voice.toLowerCase()+'.json',JSON.stringify(links,null,2)+'\n');console.log(JSON.stringify(links));
}finally{await s.close()}
