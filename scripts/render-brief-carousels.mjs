import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';import {join,resolve} from 'node:path';import {pathToFileURL} from 'node:url';
import {cssFor} from './render-comparison-carousels.mjs';
// Renders the "Cancha Brief" carousels in content/instagram/brief-carousels.json to 1080x1350 JPEGs with the brand
// fonts: a cover, one slide per point (the last one is Cancha's take) and a sources slide with the check date.
const C={forest:'#103f32',cream:'#f5f3e9',lime:'#d7ef86',orange:'#f55b32',ink:'#0b2e24'};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const palettes=[[C.cream,C.forest,C.orange],[C.lime,C.forest,C.forest],[C.orange,C.cream,C.ink]];
const nice=d=>new Date(d+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
const VISUAL_H=540;
// Club crests come only from the checked badge manifest (unmodified marks on a neutral panel).
export const CRESTS=new Set(['jax','rowdies','miami','weston','fkk']);
export function visualAlt(v){
 if(v.type==='photo')return 'Photo: '+v.alt+'.';
 if(v.type==='stat')return `${v.value} ${v.caption}.`;
 if(v.type==='scoreboard')return `Scoreboard: ${v.teams.map(t=>t.name+' '+t.score).join(', ')}. ${v.note||''}`;
 if(v.type==='bars')return `Bar chart: ${v.bars.map(b=>b.label+' '+b.display).join(', ')}. ${v.caption||''}`;
 if(v.type==='ratio')return `Chart: ${v.highlight} of ${v.of} icons highlighted. ${v.caption}.`;
 return '';
}
export function visualHtml(v,bg,fg,head){
 const box=`margin:30px -72px 0;height:${VISUAL_H}px;position:relative;overflow:hidden`;
 if(v.type==='photo')return `<div style="${box};background:url(${v.file}) center ${v.focus||'35%'}/cover no-repeat"><div style="position:absolute;right:28px;bottom:20px;font-size:22px;font-weight:600;color:#fff;text-shadow:0 1px 6px #000a">${esc(v.credit)}</div></div>`;
 if(v.type==='stat')return `<div style="${box};display:flex;flex-direction:column;justify-content:center;align-items:center;background:${C.forest};color:${C.cream};text-align:center"><div style="font-family:Display;font-style:italic;font-size:${String(v.value).length>6?190:250}px;line-height:.9;color:${C.lime}">${esc(v.value)}</div><div style="font-size:46px;font-weight:700;margin-top:22px;text-transform:uppercase;letter-spacing:2px;padding:0 60px">${esc(v.caption)}</div></div>`;
 if(v.type==='scoreboard'){const team=t=>`<div style="display:flex;flex-direction:column;align-items:center;gap:18px;width:240px"><div style="width:200px;height:200px;border-radius:50%;background:#ffffff1f;border:3px solid ${C.cream}55;display:flex;align-items:center;justify-content:center"><img src="${t.crest}.png" style="max-width:150px;max-height:150px"></div><div style="font-size:38px;font-weight:700;text-transform:uppercase;white-space:nowrap">${esc(t.name)}</div></div>`,score=t=>`<div style="font-family:Display;font-style:italic;font-size:200px;line-height:1;color:${C.lime}">${esc(t.score)}</div>`,[x,y]=v.teams;
  return `<div style="${box};display:flex;flex-direction:column;justify-content:center;background:${C.forest};color:${C.cream}"><div style="display:flex;justify-content:center;align-items:center;gap:34px">${team(x)}${score(x)}<div style="font-family:Display;font-size:90px;opacity:.6">–</div>${score(y)}${team(y)}</div>${v.note?`<div style="margin:26px auto 0;background:${C.orange};color:${C.cream};font-size:40px;font-weight:700;padding:12px 30px;border-radius:999px;text-transform:uppercase">${esc(v.note)}</div>`:''}</div>`;}
 if(v.type==='bars'){const max=Math.max(...v.bars.map(b=>b.value));
  return `<div style="${box};display:flex;flex-direction:column;justify-content:center;gap:16px;padding:0 72px;background:${C.forest};color:${C.cream}">${v.bars.map(b=>`<div style="display:flex;align-items:center;gap:20px"><div style="width:230px;font-size:34px;font-weight:700;text-transform:uppercase;line-height:1.05">${esc(b.label)}</div><div style="flex:1;height:58px;position:relative"><div style="height:100%;width:${Math.max(8,Math.round(b.value/max*100))}%;background:${b.highlight?C.lime:C.cream+'55'};border-radius:6px"></div></div><div style="width:190px;text-align:right;font-family:Display;font-style:italic;font-size:54px;color:${b.highlight?C.lime:C.cream}">${esc(b.display)}</div></div>`).join('')}${v.caption?`<div style="font-size:30px;font-weight:600;opacity:.8;margin-top:6px">${esc(v.caption)}</div>`:''}</div>`;}
 if(v.type==='ratio'){const icon=on=>`<svg width="110" height="190" viewBox="0 0 22 38"><circle cx="11" cy="5" r="5" fill="${on?C.orange:C.cream}"/><path d="M4 13h14v12h-3v13H7V25H4z" fill="${on?C.orange:C.cream}"/></svg>`;
  return `<div style="${box};display:flex;flex-direction:column;justify-content:center;align-items:center;background:${C.forest};color:${C.cream}"><div style="display:flex;gap:18px">${Array.from({length:v.of},(_,k)=>icon(k<v.highlight)).join('')}</div><div style="font-size:46px;font-weight:700;margin-top:34px;text-transform:uppercase;text-align:center;padding:0 60px">${esc(v.caption)}</div></div>`;}
 throw Error('Unknown visual '+v.type);
}
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
 r.points.forEach((p,i)=>{const [bg,fg,head]=palettes[i%palettes.length],v=p.visual;
  // A slide with a visual (photo, big number, scoreboard or icon chart) leads with it and keeps the text short.
  if(v){out.push({alt:`${p.label}: ${p.title.join(' ')}. ${visualAlt(v)} ${p.body.join('. ')}.`,html:`<div class="s" style="background:${bg};color:${fg}">${top(i+2,fg)}
  ${visualHtml(v,bg,fg,head)}
  <div class="kick" style="margin-top:34px">${esc(p.label)}</div>
  <h1 style="font-size:92px;margin:6px 0 26px;color:${head}">${p.title.map(esc).join('<br>')}</h1>
  <div style="font-size:40px;line-height:1.25;font-weight:600">${p.body.map(x=>`<div style="margin-bottom:16px">— ${esc(x)}</div>`).join('')}</div>
  ${foot(r.kicker,i===r.points.length-1?'Save this':'Swipe →',fg)}</div>`});return;}
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
 // A photo is either the cited source's own image (photo.url on a source's domain) or a still from a cleared creator
 // video already in the repo; either way it is credited on the slide.
 async function loadPhoto(r,ph,name){
  // A licensed image from config/community-media.json (Wikimedia, CC), credited with artist and license.
  if(ph.media){const m=JSON.parse(await readFile('config/community-media.json','utf8')).find(x=>x.id===ph.media);if(!m||!/^CC/.test(m.license))throw Error(r.id+': unknown or unlicensed community media');
   const res=await fetch(m.url,{signal:AbortSignal.timeout(60000)});if(!res.ok)throw Error(r.id+': community media unavailable');const ext=m.url.endsWith('.png')?'png':'jpg';
   await writeFile(join(out,`${name}.${ext}`),Buffer.from(await res.arrayBuffer()));return {...ph,file:`${name}.${ext}`};}
  // An interview guest's own photo, used only with the guest's yes recorded in config/interview-permissions.json.
  if(ph.guest){const g=JSON.parse(await readFile('config/interview-permissions.json','utf8')).guests.find(x=>x.id===ph.guest);
   if(!g?.okRelayedOn||!ph.local?.startsWith(`content/instagram/interviews/${g.id}/`)||!/\.(jpe?g|png)$/.test(ph.local))throw Error(r.id+': guest photo needs the guest\'s recorded OK');
   const ext=ph.local.split('.').pop();await copyFile(ph.local,join(out,`${name}.${ext}`));return {...ph,file:`${name}.${ext}`};}
  if(ph.local){const {clearedVideos}=await import('./clip-download.mjs'),cleared=clearedVideos(JSON.parse(await readFile('config/clip-permissions.json','utf8')));
   if(!/^content\/[\w\/.-]+\.jpg$/.test(ph.local)||!cleared.some(v=>v.id===ph.clearedVideo))throw Error(r.id+': local photo needs a cleared source video');
   await copyFile(ph.local,join(out,name+'.jpg'));return {...ph,file:name+'.jpg'};}
  const host=u=>new URL(u).hostname.replace(/^www\./,'');if(!r.sources.some(s=>host(s.url)===host(ph.url)))throw Error(r.id+': photo must come from a cited source');
  const res=await fetch(ph.url,{signal:AbortSignal.timeout(60000)});if(!res.ok||!/^image\//.test(res.headers.get('content-type')||''))throw Error(r.id+': photo unavailable');
  const ext=(res.headers.get('content-type').split('/')[1]||'jpg').replace('jpeg','jpg');await writeFile(join(out,`${name}.${ext}`),Buffer.from(await res.arrayBuffer()));return {...ph,file:`${name}.${ext}`};
 }
 const browser=await chromium.launch(process.env.CHROME_CHANNEL?{channel:process.env.CHROME_CHANNEL}:{}),page=await browser.newPage({viewport:{width:1080,height:1350}}),results=[];
 try{for(const r of briefs.filter(c=>!only.length||only.includes(c.id))){const files=[];
  // The photo comes straight from the cited source (photo.url must be on a source's domain) and is credited on the slide.
  // A photo is either the cited source's own image, or a still from a cleared creator video already in the repo.
  r.photo=r.photo&&await loadPhoto(r,r.photo,`${r.id}-photo`);
  r.points=await Promise.all(r.points.map(async(p,k)=>p.visual?.type==='photo'?{...p,visual:{...p.visual,...await loadPhoto(r,p.visual,`${r.id}-p${k+1}`)}}:p));
  for(const p of r.points)if(p.visual?.type==='scoreboard')for(const t of p.visual.teams){if(!CRESTS.has(t.crest))throw Error(r.id+': crest not in the badge manifest');await copyFile(assets+t.crest+'.png',join(out,t.crest+'.png'));}
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
