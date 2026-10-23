import {readFile, writeFile, mkdir, rename, rm} from 'node:fs/promises';
import {resolve, dirname, sep} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {localStoryDescriptor} from '../server/local-story-source.mjs';

// Download only the exact, reviewed public source media. Inherits the managed
// proxy and CA; never follows an unreviewed redirect or executes source content.
const root=resolve(import.meta.dirname,'..'),story=JSON.parse(await readFile(resolve(root,process.argv[2]||'content/instagram/single-story.json')));
const reviewed=localStoryDescriptor(story.editorialSourceId);
const hash=b=>createHash('sha256').update(b).digest('hex');
for(const asset of [...story.assets,story.clip]) {
  const file=resolve(root,asset.file),url=new URL(asset.url);
  if(!file.startsWith(resolve(root,'private-data')+sep)||url.protocol!=='https:'||url.username||url.password||!reviewed.documents.some(d=>d.url===asset.sourcePage)||new URL(asset.sourcePage).hostname!==url.hostname||!/^[a-f0-9]{64}$/.test(asset.sha256)) throw Error('Unreviewed media identity/path');
  const cached=await readFile(file).catch(e=>{if(e.code==='ENOENT')return null;throw e});
  if(cached) {if(hash(cached)!==asset.sha256)throw Error('Cached media changed; review it before replacing');continue;}
  await mkdir(dirname(file),{recursive:true}); const temp=file+'.download';
  try {
    execFileSync('curl',['--fail','--silent','--show-error','--proto','=https','--max-time','90','--max-filesize','40000000',...(process.env.SSL_CERT_FILE?['--cacert',process.env.SSL_CERT_FILE]:[]),'--output',temp,asset.url],{stdio:['ignore','ignore','pipe']});
    const bytes=await readFile(temp);if(hash(bytes)!==asset.sha256)throw Error('Downloaded media differs from the reviewed source');
    await rename(temp,file);
  } finally {await rm(temp,{force:true});}
}
console.log('Reviewed story media prepared; no site or Instagram changes.');
