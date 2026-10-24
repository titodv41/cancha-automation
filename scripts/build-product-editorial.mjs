import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {openBrowser} from './browser-session.mjs';
import {withProject} from './project-session.mjs';
import {sourceSession} from './source-session.mjs';
import {approvedProductDemo} from '../server/product-editorial.mjs';

const rows=JSON.parse(await readFile('content/instagram/product-editorial.json')).posts,{brand}=JSON.parse(await readFile('content/instagram/photo-editorial.json')),policy=JSON.parse(await readFile('config/instagram-editorial-policy.json'));
const out='previews/product-stories',sha=b=>createHash('sha256').update(b).digest('hex'),esc=s=>String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'),data=(b,t)=>`data:${t};base64,${b.toString('base64')}`;
const display=data(await readFile(brand.displayFont),'font/woff2'),ui=data(await readFile(brand.bodyFont),'font/woff2'),bold=data(await readFile(brand.bodyBoldFont),'font/woff2'),logo=data(await readFile(brand.logo),'image/png');
await mkdir(out,{recursive:true});const{browser,page}=await openBrowser({width:1100,height:1180}),session=sourceSession(),ready=[],captures=[];
try{
 for(const row of rows){
  if(!policy.productDemoDraftIds.includes(row.id)||new URL(row.sourceUrl).origin!=='https://pioneering-friday-005497.framer.app'||new URL(row.sourceUrl).pathname!=='/clubs')throw Error('Only reviewed Cancha product captures');
  await page.setViewportSize({width:1100,height:1180});await page.goto(row.sourceUrl,{waitUntil:'networkidle'});await page.locator('main[data-ready="true"]').waitFor();await page.locator('.cv-card').first().waitFor();await page.evaluate(async()=>{await document.fonts.ready;scrollTo(0,0);await Promise.all([...document.images].filter(i=>i.getBoundingClientRect().top<1000).map(i=>i.decode().catch(()=>{})))});
  const mainY=await page.locator('main[data-ready="true"]').evaluate(e=>e.getBoundingClientRect().top),screenshot=await page.screenshot({clip:{x:0,y:Math.max(0,mainY),width:1100,height:900},type:'png'}),capturedAt=new Date().toISOString();
  await writeFile(`${out}/${row.id}-capture.png`,screenshot);captures.push({id:row.id,sourceUrl:row.sourceUrl,capturedAt,width:1100,height:900,sha256:sha(screenshot)});
  const dark=row.theme==='forest',paper=dark?brand.forest:brand.cream,ink=dark?brand.cream:brand.forest;
  await page.setViewportSize({width:1080,height:1350});await page.setContent(`<style>
   @font-face{font-family:D;src:url('${display}');font-weight:700;font-style:italic}@font-face{font-family:UI;src:url('${ui}');font-weight:700}@font-face{font-family:UI;src:url('${bold}');font-weight:700}*{box-sizing:border-box}html,body{margin:0;width:1080px;height:1350px;overflow:hidden}body{background:${paper};color:${ink};font:700 39px/1.15 UI,sans-serif;letter-spacing:-.5px;-webkit-font-smoothing:antialiased}header{position:absolute;left:60px;right:60px;top:44px;display:flex;justify-content:space-between;align-items:center;font-size:32px;font-weight:700}header img{width:191px;height:62px;object-fit:cover;${dark?'filter:brightness(0) invert(1)':''}}.copy{position:absolute;top:169px;left:60px;right:60px}h1{font:italic 700 120px/.92 D,sans-serif;white-space:pre-line;margin:0;letter-spacing:-1px}.body{font-size:38px;margin:26px 0 0}.backplate{position:absolute;left:80px;top:485px;width:920px;height:750px;border-radius:30px;background:${dark?brand.accent:brand.forest};rotate:-2deg}.screen{position:absolute;left:100px;top:500px;width:880px;height:720px;border:8px solid white;border-radius:24px;overflow:hidden;background:white;box-shadow:0 15px 40px #071d2640}.screen img{display:block;width:100%;height:100%;object-fit:fill}.chip{position:absolute;left:72px;top:1181px;background:${brand.orange};color:#062219;border-radius:12px;font-size:32px;font-weight:700;padding:16px 24px}footer{position:absolute;bottom:38px;left:60px;right:60px;display:flex;justify-content:space-between;font-size:31px;font-weight:700}
  </style><header><img src="${logo}" alt="Cancha"><span>Find your game</span></header><div class="copy"><h1>${esc(row.headline)}</h1><p class="body">${esc(row.body)}</p></div><div class="backplate"></div><div class="screen"><img src="${data(screenshot,'image/png')}" alt="Actual Cancha directory"></div><div class="chip">${esc(row.chip)}</div><footer><span>${esc(brand.handle)}</span><span>Explore →</span></footer>`);
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()))});
  const bad=await page.evaluate(()=>[...document.querySelectorAll('.copy,.body,h1,.chip')].some(e=>e.scrollWidth>e.clientWidth+1||e.getBoundingClientRect().right>1021||e.getBoundingClientRect().bottom>1250));if(bad)throw Error('Product artwork overflows');
  const file=`${out}/${row.id}.jpg`;await page.screenshot({path:file,type:'jpeg',quality:96});
  const draft={id:row.id,format:'feed',sourceType:'brand',topic:'update',creativeKind:'product-demo',creativeVersion:'cancha-local-v2',caption:row.caption,altText:row.altText,factsCheckedAt:capturedAt,headline:row.headline,assetUrl:null,assetChecksum:sha(await readFile(file)),rights:'Original Cancha design and actual public Cancha directory capture. No invented users, partnership or availability claims.',screenshot:{sourceUrl:row.sourceUrl,capturedAt,width:1100,height:900,assetUrl:null,assetChecksum:sha(screenshot)},visualEvidence:{creator:'Cancha',kind:'product-demo',subjectKey:row.id,sourceUrl:row.sourceUrl,renderedAt:new Date().toISOString(),assetChecksum:sha(await readFile(file))}};
  if(process.argv.includes('--upload'))await withProject(async f=>{
   for(const [asset,bytes,mimeType]of [[draft,await readFile(file),'image/jpeg'],[draft.screenshot,screenshot,'image/png']]){const uploaded=await f.uploadImage({name:row.id+(mimeType==='image/png'?'-actual-capture':''),image:{bytes:new Uint8Array(bytes),mimeType}});asset.assetUrl=uploaded.url;asset.assetChecksum=sha(await session.html(uploaded.url,new RegExp(mimeType),{maxBytes:8_000_000}));}
   draft.visualEvidence.assetChecksum=draft.assetChecksum;if(!approvedProductDemo(draft,policy))throw Error('Product screenshot evidence failed');
  });
  ready.push(draft);console.log(row.id+' rendered with actual directory capture');
 }
 await writeFile(`${out}/captures.json`,JSON.stringify(captures,null,2));await writeFile(`${out}/drafts.json`,JSON.stringify(ready,null,2));
 if(process.argv.includes('--upload'))await writeFile('content/instagram/product-editorial-ready.json',JSON.stringify(ready,null,2)+'\n');
}finally{await browser.close();await session.close()}
