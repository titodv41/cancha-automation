import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';import {join,resolve} from 'node:path';import {pathToFileURL} from 'node:url';
import {cssFor} from './render-comparison-carousels.mjs';
// Renders the "Cancha Brief" carousels in content/instagram/brief-carousels.json to 1080x1350 JPEGs with the brand
// fonts: a cover, one slide per point (the last one is Cancha's take) and a sources slide with the check date.
const C={forest:'#103f32',cream:'#f5f3e9',lime:'#d7ef86',orange:'#f55b32',ink:'#0b2e24'};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const palettes=[[C.cream,C.forest,C.orange],[C.lime,C.forest,C.forest],[C.orange,C.cream,C.ink]];
const nice=d=>new Date(d+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
export function briefSlides(r){
 const n=r.points.length+2,top=(i,fg)=>`<div class="top" style="color:${fg}"><img class="logo" src="cancha-trim.png" alt="Cancha" style="${fg===C.forest||fg===C.ink?'':'filter:brightness(0) invert(1)'}"><span>${i} / ${n}</span></div>`;
 const foot=(l,rt,fg)=>`<div class="foot" style="color:${fg}"><span>${esc(l)}</span><span>${esc(rt)}</span></div>`;
 const cover=`background:${C.forest};color:${C.cream}`;
 // The photo owns the top panel and the text sits below it, so headline type never covers faces.
 const panel=r.photo?`<div style="position:absolute;left:0;right:0;top:0;height:700px;background:url(${r.photo.file}) center 35%/cover no-repeat"></div><div style="position:absolute;left:0;right:0;top:0;height:700px;background:linear-gradient(180deg,${C.forest}99 0%,${C.forest}00 18%,${C.forest}00 72%,${C.forest} 100%)"></div><div style="position:absolute;right:72px;top:652px;font-size:24px;font-weight:600;opacity:.85">${esc(r.photo.credit)}</div>`:'';
 const out=[{alt:`${r.kicker}. ${r.title.join(' ')} ${r.highlight}. ${r.dek}${r.photo?' Photo: '+r.photo.alt:''}`,html:`<div class="s" style="${cover}">${panel}<div style="position:relative;display:flex;flex-direction:column;height:100%">${top(1,C.cream)}
  <div class="kick" style="margin-top:${r.photo?'585px':'130px'};color:${C.lime}">${esc(r.kicker)}</div>
  <h1 style="font-size:${r.photo?118:150}px">${r.title.map(esc).join('<br>')}<br><span style="color:${C.lime}">${esc(r.highlight)}</span></h1>
  <div style="font-size:${r.photo?42:48}px;font-weight:600;margin-top:${r.photo?30:46}px;line-height:1.25">${esc(r.dek)}</div>${r.photo?'<div style="height:40px"></div>':''}${foot('@wearecancha','Swipe →',C.cream)}</div></div>`}];
 r.points.forEach((p,i)=>{const [bg,fg,head]=palettes[i%palettes.length];
  out.push({alt:`${p.label}: ${p.title.join(' ')}. ${p.body.join('. ')}.`,html:`<div class="s" style="background:${bg};color:${fg}">${top(i+2,fg)}
  <div class="kick" style="margin-top:110px">${esc(p.label)}</div>
  <h1 style="font-size:118px;margin:10px 0 56px;color:${head}">${p.title.map(esc).join('<br>')}</h1>
  <div style="font-size:50px;line-height:1.3;font-weight:600">${p.body.map(x=>`<div style="margin-bottom:30px">— ${esc(x)}</div>`).join('')}</div>
  ${foot(r.kicker,i===r.points.length-1?'Save this':'Swipe →',fg)}</div>`});});
 out.push({alt:'Sources: '+r.sources.map(s=>s.label+' ('+s.url+')').join('; ')+`. Checked ${nice(r.checkedOn)}.`,html:`<div class="s" style="background:${C.forest};color:${C.cream}">${top(n,C.cream)}
  <h1 style="font-size:120px;margin-top:120px;color:${C.lime}">Sources</h1>
  <div style="font-size:44px;line-height:1.35;margin:46px 0;font-weight:600">${r.sources.map(s=>`<div style="margin-bottom:26px">${esc(s.label)}<div style="font-size:32px;opacity:.75;word-break:break-all">${esc(s.url.replace(/^https:\/\/(www\.)?/,''))}</div></div>`).join('')}</div>
  <div style="font-size:36px;font-weight:600;opacity:.85">Checked ${esc(nice(r.checkedOn))}. Cancha is independent; no affiliation implied.</div>
  ${foot('Follow @wearecancha for Florida soccer, explained','',C.cream)}</div>`});
 return out;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const {chromium}=await import('playwright'),{briefs}=JSON.parse(await readFile('content/instagram/brief-carousels.json','utf8'));
 const only=(process.env.ONLY||'').split(',').filter(Boolean),out='private-data/brief-carousels',assets='content/instagram/local-stories/assets/';
 await mkdir(out,{recursive:true});for(const f of ['display.woff2','condensed-700.woff2','condensed-600.woff2','cancha-trim.png'])await copyFile(assets+f,join(out,f));
 const browser=await chromium.launch(process.env.CHROME_CHANNEL?{channel:process.env.CHROME_CHANNEL}:{}),page=await browser.newPage({viewport:{width:1080,height:1350}}),results=[];
 try{for(const r of briefs.filter(c=>!only.length||only.includes(c.id))){const files=[];
  // The photo comes straight from the cited source (photo.url must be on a source's domain) and is credited on the slide.
  if(r.photo){const host=u=>new URL(u).hostname.replace(/^www\./,'');if(!r.sources.some(s=>host(s.url)===host(r.photo.url)))throw Error(r.id+': photo must come from a cited source');
   const res=await fetch(r.photo.url,{signal:AbortSignal.timeout(60000)});if(!res.ok||!/^image\//.test(res.headers.get('content-type')||''))throw Error(r.id+': photo unavailable');
   const ext=(res.headers.get('content-type').split('/')[1]||'jpg').replace('jpeg','jpg');await writeFile(join(out,`${r.id}-photo.${ext}`),Buffer.from(await res.arrayBuffer()));r.photo={...r.photo,file:`${r.id}-photo.${ext}`};}
  for(const [i,s] of briefSlides(r).entries()){const html=join(out,`${r.id}-${i+1}.html`),jpg=join(out,`${r.id}-${i+1}.jpg`);
   await writeFile(html,`<!doctype html><meta charset=utf-8><style>${cssFor()}</style><body>${s.html}</body>`);
   await page.goto(pathToFileURL(resolve(html)).href);await page.evaluate(()=>document.fonts.ready);
   if(!await page.evaluate(()=>document.fonts.check('96px Display')&&document.fonts.check('700 40px Cond')&&document.fonts.check('600 40px Cond')))throw Error('Brand fonts failed to load');
   // Nothing may spill past the slide: text that overflows the frame is a failed render, not a crop.
   if(await page.evaluate(()=>document.querySelector('.s').scrollHeight>1350))throw Error(`${r.id} slide ${i+1} overflows`);
   await page.screenshot({path:jpg,type:'jpeg',quality:92});files.push({file:jpg,altText:s.alt.slice(0,1000)});}
  results.push({id:r.id,slides:files});}}
 finally{await browser.close();}
 await writeFile(join(out,'report.json'),JSON.stringify({renderedAt:new Date().toISOString(),results},null,1));
 console.log(JSON.stringify({rendered:results.map(r=>({id:r.id,slides:r.slides.length}))}));
}
