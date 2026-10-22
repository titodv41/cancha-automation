import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {openBrowser} from './browser-session.mjs';
import {withProject} from './project-session.mjs';
import {sourceSession} from './source-session.mjs';

const rows=JSON.parse(await readFile('content/instagram/photo-editorial-ready.json'));
const dir='previews/photo-editorial',session=sourceSession(),{browser,page}=await openBrowser({width:1260,height:1600});
const data=b=>'data:image/jpeg;base64,'+b.toString('base64'),images=[];
try {
 for(const row of rows){for(const slide of row.slides){const bytes=await session.html(slide.assetUrl,/image\/jpeg/,{maxBytes:8_000_000});if(createHash('sha256').update(bytes).digest('hex')!==slide.assetChecksum)throw Error('Hosted slide changed');images.push({row,slide,data:data(bytes)});}}
 await page.setContent(`<style>@page{size:1080px 1350px;margin:0}*{box-sizing:border-box}html,body{padding:0;margin:0}.sheet{width:1080px;height:1350px;break-after:page}.sheet:last-child{break-after:auto}img{display:block;width:1080px;height:1350px}</style>${images.map(i=>`<div class="sheet"><img src="${i.data}"></div>`).join('')}`);
 await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
 await page.pdf({path:dir+'/cancha-photo-carousels.pdf',printBackground:true,preferCSSPageSize:true,margin:{top:0,right:0,bottom:0,left:0}});
 await page.setContent(`<style>body{margin:0;padding:24px;background:#dce2d6;display:grid;grid-template-columns:repeat(3,1fr);gap:24px}img{width:100%;display:block;border-radius:6px}</style>${images.filter(i=>i.slide===i.row.slides[0]).map(i=>`<img src="${i.data}">`).join('')}`);
 await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
 await page.screenshot({path:dir+'/covers.jpg',fullPage:true,type:'jpeg',quality:94});
 const links={createdAt:new Date().toISOString(),carousels:rows.length,slides:images.length,covers:rows.map(r=>({id:r.id,url:r.assetUrl,slides:r.slides.map(s=>s.assetUrl)}))};
 await withProject(async f=>{
  const cover=await readFile(dir+'/covers.jpg');links.overview=(await f.uploadImage({name:'cancha-photo-carousel-covers',image:{bytes:new Uint8Array(cover),mimeType:'image/jpeg'}})).url;
  const pdf=await readFile(dir+'/cancha-photo-carousels.pdf');links.pdf=(await f.uploadFile({name:'cancha-photo-carousels.pdf',file:{bytes:new Uint8Array(pdf),mimeType:'application/pdf'}})).url;
  const report=JSON.parse(await readFile('previews/video/photo-story-report.json'));if(!/^[a-z0-9-]+\.mp4$/.test(report.file)||!rows.some(r=>r.id===report.story&&r.sourceHash===report.sourceHash))throw Error('Video source proof missing');const video=await readFile('previews/video/'+report.file);if(createHash('sha256').update(video).digest('hex')!==report.sha256)throw Error('Video bytes changed');links.video=(await f.uploadFile({name:'cancha-puerta-photo-story.mp4',file:{bytes:new Uint8Array(video),mimeType:'video/mp4'}})).url;
 });
 // Test links outside the SDK before sharing them with the owner.
 for(const [key,type]of [['overview',/image\/jpeg/],['pdf',/application\/pdf/],['video',/video\/mp4/]]){const bytes=await session.html(links[key],type,{maxBytes:20_000_000});if(!bytes.length)throw Error('Empty public preview '+key);}
 await writeFile('content/instagram/photo-editorial-preview-links.json',JSON.stringify(links,null,2)+'\n');console.log(JSON.stringify({overview:links.overview,pdf:links.pdf,video:links.video}));
} finally {await browser.close();await session.close()}
