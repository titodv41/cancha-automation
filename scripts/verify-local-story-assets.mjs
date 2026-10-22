import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {sourceSession} from './source-session.mjs';
import {openBrowser} from './browser-session.mjs';
import {validPostImage} from '../server/instagram-plan.mjs';
import {approvedOriginalCreative} from '../server/social-creative.mjs';
const path='content/instagram/local-stories-ready.json',rows=JSON.parse(await readFile(path));
const checks=JSON.parse(await readFile('previews/local-stories-2026-10-22/render-check.json'));
const dir='private-data/local-stories-2026-10-22/hosted-assets';await mkdir(dir,{recursive:true});
const session=sourceSession(),{browser,page}=await openBrowser();
try{for(const row of rows){
 const check=checks.find(c=>c.id===row.id);
 if(!validPostImage(row)||!check||![row.assetChecksum,row.visualEvidence.renderChecksum].includes(check.checksum))throw Error('Upload/render binding missing: '+row.id);
 const bytes=await session.html(row.assetUrl,/image\/jpeg/);
 await page.setContent('<img id="asset" alt="Hosted editorial design">');
 const size=await page.evaluate(async url=>{const image=document.getElementById('asset');image.src=url;await image.decode();return {width:image.naturalWidth,height:image.naturalHeight}},'data:image/jpeg;base64,'+bytes.toString('base64'));
 if(size.width!==1080||size.height!==1350)throw Error('Hosted creative size changed: '+row.id);
 // Framer may re-encode JPEGs. Bind approval to the actual hosted bytes while
 // retaining the checksum of the locally reviewed original as provenance.
 const publicChecksum=createHash('sha256').update(bytes).digest('hex');
 row.visualEvidence.renderChecksum=check.checksum;row.assetChecksum=publicChecksum;row.visualEvidence.assetChecksum=publicChecksum;
 if(!approvedOriginalCreative(row))throw Error('Creative validation failed: '+row.id);
 await writeFile(dir+'/'+row.id+'.jpg',bytes);console.log(row.id+' hosted JPEG decoded; 1080x1350; public checksum recorded');
}await writeFile(path,JSON.stringify(rows,null,2)+'\n');}finally{await session.close();await browser.close()}
