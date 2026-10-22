import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {sourceSession} from './source-session.mjs';
import {openBrowser} from './browser-session.mjs';
import {withProject} from './project-session.mjs';
import {localStoryDescriptor, localStoryHash, confirmLocalStorySource} from '../server/local-story-source.mjs';
import {approvedOriginalCreative} from '../server/social-creative.mjs';

// --upload explicitly publishes only media assets, never an Instagram post.
const input=process.argv.find(a=>a.endsWith('.json'))||'content/instagram/photo-editorial.json';
const manifest=JSON.parse(await readFile(input,'utf8')), brand=manifest.brand;
const out=resolve('previews/photo-editorial'), cache=resolve('private-data/photo-editorial/assets');
await mkdir(out,{recursive:true}); await mkdir(cache,{recursive:true,mode:0o700});
const hash=b=>createHash('sha256').update(b).digest('hex');
const esc=s=>String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const data=async(p,mime)=>`data:${mime};base64,${(await readFile(p)).toString('base64')}`;
const display=await data(brand.displayFont,'font/woff2'),ui=await data(brand.bodyFont,'font/woff2'),logo=await data(brand.logo,'image/png');
const session=sourceSession(), {browser,page}=await openBrowser({width:1080,height:1350});
const ready=[], checks=[], localPhotos=new Map();
try {
 for(const post of manifest.posts){
  const source=localStoryDescriptor(post.editorialSourceId);
  if(!source||post.slides.length<2||post.slides.length>10)throw Error('Reviewed source and 2–10 slides required: '+post.id);
  const draft={...post,format:'feed',creativeKind:'photo-carousel',creativeVersion:'cancha-local-v2',editorialOrganization:post.organization,officialSourceUrl:source.documents[0].url,sourceHash:localStoryHash(source)};
  if(!await confirmLocalStorySource(draft,{fetchImpl:async u=>new Response(await session.html(u),{headers:{'content-type':'text/html'}})}))throw Error('Story expired or changed: '+post.id);
  const photos=[];
  for(const photo of post.photos){
   if(!source.documents.some(d=>d.url===photo.sourcePage))throw Error('Photo source is not in the reviewed story: '+photo.id);
   const bytes=await session.html(photo.originalUrl,/image\/(jpeg|png)/,{maxBytes:15_000_000});
   const checksum=hash(bytes);if(photo.originalChecksum&&photo.originalChecksum!==checksum)throw Error('Source photograph changed: '+photo.id);
   const file=resolve(cache,photo.id+(bytes[0]===137?'.png':'.jpg'));await writeFile(file,bytes);
   const photoData=`data:image/${bytes[0]===137?'png':'jpeg'};base64,${bytes.toString('base64')}`;
   await page.setContent(`<img src="${photoData}">`);
   const dimensions=await page.evaluate(async()=>{const i=document.querySelector('img');await i.decode();return{width:i.naturalWidth,height:i.naturalHeight}});
   localPhotos.set(photo.id,{file,data:photoData,photo,...dimensions});
   photos.push({...photo,originalChecksum:checksum,authorization:manifest.authorization});
  }
  const slides=[];
  for(const [index,slide] of post.slides.entries()){
   const asset=localPhotos.get(slide.photoId);if(!asset)throw Error('Unknown photo '+slide.photoId);
   const split=slide.layout==='split',question=slide.layout==='question';
   const crop=asset.photo.crop;
   const frameHeight=split?546:question?740:1050;
   const scale=crop?Math.max(1080/(asset.width*crop.width),frameHeight/(asset.height*crop.height)):1;
   const photoStyle=crop?`width:${asset.width*scale}px;height:${asset.height*scale}px;max-width:none;left:${(1080-asset.width*crop.width*scale)/2-asset.width*crop.x*scale}px;top:${(frameHeight-asset.height*crop.height*scale)/2-asset.height*crop.y*scale}px;`:`width:100%;height:100%;object-fit:cover;object-position:${esc(slide.position||'50% 50%')};`;
   const frameClass=crop?' cropped':'';
   await page.setContent(`<!doctype html><html><head><style>
    @font-face{font-family:Display;src:url('${display}');font-weight:700;font-style:italic}@font-face{font-family:UI;src:url('${ui}');font-weight:600}
    *{box-sizing:border-box}html,body{width:1080px;height:1350px;margin:0}body{font:600 38px/1.24 UI,sans-serif;background:${brand.forest};color:${brand.cream}}
    main{position:relative;width:1080px;height:1350px;overflow:hidden;background:${split?brand.cream:brand.forest};color:${split?brand.forest:brand.cream}}
    .photo{position:absolute;top:${split?'454':question?'0':'0'}px;left:0;width:1080px;height:${split?'546':question?'740':'1050'}px;overflow:hidden;background:#1f4338}.photo img{position:absolute;display:block;${photoStyle}}
    .photo.cropped img{object-fit:fill}.shade{position:absolute;inset:0;background:${split?'none':question?'linear-gradient(180deg,rgba(5,24,18,.55),transparent 48%,#103f32 59%)':'linear-gradient(180deg,rgba(5,24,18,.55),transparent 24%,rgba(8,27,20,.04) 40%,#103f32 80%)'}}
    header{position:absolute;left:60px;right:60px;top:45px;height:62px;display:flex;justify-content:space-between;align-items:center}.logo{width:191px;height:62px;overflow:hidden}.logo img{width:100%;height:100%;object-fit:cover;${split?'':'filter:brightness(0) invert(1)'}}.page-number{font-size:28px;letter-spacing:2px}
    .copy{position:absolute;left:60px;right:60px;top:${split?'165':question?'745':'800'}px}.eyebrow{font-size:25px;letter-spacing:2px;margin-bottom:${split?'26':'28'}px;color:${split?brand.forest:brand.accent}}
    h1{font:italic 700 ${split?'112':question?'108':'144'}px/.93 Display,sans-serif;letter-spacing:-1.5px;white-space:pre-line;margin:0}
    .label{display:inline-block;font-size:27px;line-height:1.1;letter-spacing:.6px;margin-top:34px;padding:13px 18px;background:${brand.accent};color:${brand.forest};border-radius:7px}
    .body{white-space:pre-line;font-size:${question?'43':'40'}px;line-height:1.24;margin:${question?'30px 0 0':'0'};${split?'position:absolute;left:60px;right:60px;top:1045px;':''}}
    footer{position:absolute;bottom:40px;left:60px;right:60px;display:flex;align-items:center;justify-content:space-between;font-size:26px;line-height:1.1}footer .line{height:3px;width:68px;background:${brand.orange};margin-right:18px;display:inline-block;vertical-align:middle}.handle{opacity:.9}.arrow{font-size:37px;color:${split?brand.forest:brand.accent}}
   </style></head><body><main class="${esc(slide.layout)}"><div class="photo${frameClass}"><img src="${asset.data}" alt="${esc(slide.altText)}"></div><div class="shade"></div><header><div class="logo"><img src="${logo}" alt="${esc(brand.name)}"></div><div class="page-number">${String(index+1).padStart(2,'0')} / ${String(post.slides.length).padStart(2,'0')}</div></header><div class="copy"><div class="eyebrow">${esc(slide.eyebrow)}</div><h1>${esc(slide.title)}</h1>${slide.label?`<div class="label">${esc(slide.label)}</div>`:''}${question?`<p class="body">${esc(slide.body)}</p>`:''}</div>${split?`<p class="body">${esc(slide.body)}</p>`:''}<footer><span class="handle"><i class="line"></i>${esc(brand.handle)}</span><span class="arrow">${index===post.slides.length-1?'JOIN THE CONVERSATION':'SWIPE →'}</span></footer></main></body></html>`);
   await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
   const quality=await page.evaluate(()=>{
    const bounds=e=>e.getBoundingClientRect(),footer=bounds(document.querySelector('footer'));
    const text=[...document.querySelectorAll('.copy,.body,h1,.label')];
    return {overflow:text.some(e=>e.scrollWidth>e.clientWidth+1||bounds(e).right>1021||bounds(e).bottom>footer.top-18),images:[...document.images].map(i=>({width:i.naturalWidth,height:i.naturalHeight})),fonts:document.fonts.check('italic 700 150px Display')&&document.fonts.check('600 40px UI')};
   });
   if(quality.overflow||!quality.fonts)throw Error('Layout failed: '+post.id+'/'+index+' '+JSON.stringify(quality));
   if(quality.images[0].width<800||quality.images[0].height<600)throw Error('Insufficient photo resolution: '+slide.photoId);
   const file=resolve(out,`${post.id}-${index+1}.jpg`);await page.screenshot({path:file,type:'jpeg',quality:96});
   const renderChecksum=hash(await readFile(file));slides.push({assetUrl:null,assetChecksum:renderChecksum,renderChecksum,width:1080,height:1350,photoId:slide.photoId,altText:slide.altText});
   checks.push({id:post.id,slide:index+1,file,renderChecksum,...quality});
  }
  const renderedAt=new Date().toISOString();ready.push({...draft,headline:post.slides[0].title,altText:post.slides[0].altText,photos,slides,assetUrl:null,assetChecksum:slides[0].assetChecksum,factsCheckedAt:renderedAt,rights:'Owner confirms media permissions are handled (2026-10-22). Official publisher, exact source URL, subject, original checksum and photo crop are recorded per asset. Original Cancha design and copy. No invented interview or affiliation.',visualEvidence:{creator:'Cancha',kind:'photo-carousel',subjectKey:post.editorialSourceId,sourceUrl:draft.officialSourceUrl,sourceHash:draft.sourceHash,renderedAt,assetChecksum:slides[0].assetChecksum,renderChecksum:slides[0].renderChecksum}});
  console.log(post.id+': '+slides.length+' slides rendered; sources confirmed');
 }
 await writeFile(resolve(out,'render-check.json'),JSON.stringify(checks,null,2));
 await writeFile(resolve(cache,'manifest.json'),JSON.stringify([...localPhotos.values()].map(({file,photo})=>({file,...photo})),null,2));
 // The overview is a single, mobile-readable image; full-size slides remain separate.
 await page.setViewportSize({width:1620,height:Math.ceil(checks.length/3)*715});
 await page.setContent(`<style>body{margin:0;background:#dce2d6;display:grid;grid-template-columns:repeat(3,1fr);gap:24px;padding:24px}figure{margin:0}img{width:100%;display:block}figcaption{font:20px sans-serif;padding:8px;color:#103f32}</style>${await Promise.all(checks.map(async c=>`<figure><img src="${await data(c.file,'image/jpeg')}"><figcaption>${esc(c.id.replace('local-',''))} · ${c.slide}</figcaption></figure>`)).then(a=>a.join(''))}`);
 await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
 await page.screenshot({path:resolve(out,'all-slides.jpg'),fullPage:true,type:'jpeg',quality:90});
 if(process.argv.includes('--upload')){
  await withProject(async f=>{for(const row of ready){for(const [i,slide]of row.slides.entries()){
   const bytes=await readFile(resolve(out,`${row.id}-${i+1}.jpg`));
   const asset=await f.uploadImage({name:`cancha-photo-${row.id}-${i+1}`,image:{bytes:new Uint8Array(bytes),mimeType:'image/jpeg'}});
   // Bind to hosted bytes: Framer can re-encode an uploaded JPEG.
   const hosted=await session.html(asset.url,/image\/jpeg/,{maxBytes:8_000_000});
   await page.setContent(`<img id="proof" src="data:image/jpeg;base64,${hosted.toString('base64')}">`);
   const size=await page.evaluate(async()=>{const i=document.querySelector('img');await i.decode();return[i.naturalWidth,i.naturalHeight]});
   if(size[0]!==1080||size[1]!==1350)throw Error('Hosted carousel dimensions changed');
   slide.assetUrl=asset.url;slide.assetChecksum=hash(hosted);
  }row.assetUrl=row.slides[0].assetUrl;row.assetChecksum=row.slides[0].assetChecksum;row.visualEvidence.assetChecksum=row.assetChecksum;if(!approvedOriginalCreative(row))throw Error('Invalid photo evidence: '+row.id);}});
  await writeFile('content/instagram/photo-editorial-ready.json',JSON.stringify(ready,null,2)+'\n');
 }
 await writeFile(resolve(out,'drafts.json'),JSON.stringify(ready,null,2));
} finally {await browser.close();await session.close();}
