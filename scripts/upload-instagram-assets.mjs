import {createHash} from 'node:crypto';
import {withProject} from './project-session.mjs';import {readFile,writeFile} from 'node:fs/promises';
const file=process.argv[2]||'content/instagram/drafts.json',assetDir=process.argv[3]||'content/instagram/assets',rows=JSON.parse(await readFile(file));
await withProject(async f=>{for(const row of rows){const bytes=await readFile(`${assetDir}/${row.id}.jpg`);const checksum=createHash('sha256').update(bytes).digest('hex');if(row.assetUrl&&row.assetChecksum===checksum)continue;const asset=await f.uploadImage({image:{bytes:new Uint8Array(bytes),mimeType:'image/jpeg'},name:'cancha-social-'+row.id});row.assetUrl=asset.url;row.assetChecksum=checksum;console.log(row.id,'asset uploaded');}await writeFile(file,JSON.stringify(rows,null,2));});
