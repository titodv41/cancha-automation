import{readFile,copyFile,mkdir}from'node:fs/promises';import{createHash}from'node:crypto';import{pathToFileURL}from'node:url';import{resolve,join}from'node:path';
import{ownFootage}from'./clip-download.mjs';
// Copies Cancha's own committed footage (app screen recordings) into the clip folder next to the downloaded videos,
// after checking each file still matches the checksum recorded in config/clip-permissions.json.
// Usage: node scripts/own-footage.mjs <clip folder> <comma-separated ids used by the cut>
export async function copyOwnFootage(config,ids,dir,root='.'){
 const want=String(ids).split(/[\s,]+/).filter(Boolean),own=ownFootage(config).filter(v=>want.includes(v.id));await mkdir(dir,{recursive:true});
 for(const v of own){const bytes=await readFile(join(root,v.file));if(createHash('sha256').update(bytes).digest('hex')!==v.sha256)throw Error('Own footage changed: '+v.id);await copyFile(join(root,v.file),join(dir,v.id+'.mp4'));}
 return own.map(v=>v.id);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const config=JSON.parse(await readFile('config/clip-permissions.json','utf8'));
 console.log(JSON.stringify({ownFootage:await copyOwnFootage(config,process.argv[3]||'',process.argv[2])}));
}
