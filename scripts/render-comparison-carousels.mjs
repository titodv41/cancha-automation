import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';import {join,resolve} from 'node:path';import {pathToFileURL} from 'node:url';
// Renders the type-led comparison carousels in content/instagram/comparison-carousels.json to 1080x1350 JPEGs
// with the brand fonts: cover, one slide per compared item, a side-by-side table and a checklist.
const C={forest:'#103f32',cream:'#f5f3e9',lime:'#d7ef86',orange:'#f55b32',ink:'#0b2e24'};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const css=`@font-face{font-family:Display;src:url(display.woff2)}
@font-face{font-family:Cond;src:url(condensed-700.woff2);font-weight:700}
@font-face{font-family:Cond;src:url(condensed-600.woff2);font-weight:600}
*{margin:0;box-sizing:border-box}body{width:1080px;height:1350px;overflow:hidden;font-family:Cond;font-weight:700}
.s{position:relative;width:1080px;height:1350px;padding:64px 72px;display:flex;flex-direction:column}
.top{display:flex;justify-content:space-between;align-items:center;font-size:40px}.mark{font-family:Display;font-size:58px;letter-spacing:1px}
h1{font-family:Display;line-height:.9;text-transform:uppercase;letter-spacing:-1px}.kick{font-size:44px;margin-bottom:18px}
.chips{display:flex;gap:18px;flex-wrap:wrap}.chip{border-radius:20px;padding:22px 30px;font-size:30px;font-weight:600;line-height:1.15}.chip b{display:block;font-size:48px;font-weight:700}
.foot{margin-top:auto;display:flex;justify-content:space-between;gap:24px;font-size:34px}
.date{font-family:Display;font-size:230px;line-height:.85;text-transform:uppercase}
table{width:100%;border-collapse:collapse;font-size:40px}td{padding:30px 10px;border-top:3px solid rgba(16,63,50,.25);vertical-align:top}td b{display:block;font-size:56px}
.sub{font-size:30px;font-weight:600;opacity:.8}`;
// Item slides rotate through these palettes; neighbours never share a background.
const palettes=[[C.orange,C.cream,C.ink,C.cream,C.forest],[C.lime,C.forest,C.forest,C.forest,C.cream],[C.forest,C.cream,C.lime,C.cream,C.forest]];
const host=u=>new URL(u).hostname.replace(/^www\./,'');
export function slides(r){
 const n=r.items.length+3,top=(i,fg)=>`<div class="top" style="color:${fg}"><span class="mark">CANCHA</span><span>${i} / ${n}</span></div>`;
 const foot=(l,rt,fg)=>`<div class="foot" style="color:${fg}"><span>${esc(l)}</span><span>${esc(rt)}</span></div>`;
 const chips=(items,bg,fg)=>`<div class="chips">${items.map(([k,v])=>`<div class="chip" style="background:${bg};color:${fg}">${esc(k)}<b>${esc(v)}</b></div>`).join('')}</div>`;
 const out=[{alt:`${r.title.join(' ')}: ${r.highlight}. ${r.intro.join(' ')}`,html:`<div class="s" style="background:${C.forest};color:${C.cream}">${top(1,C.cream)}
  <div class="kick" style="margin-top:150px;color:${C.lime}">${esc(r.kicker)}</div>
  <h1 style="font-size:170px">${r.title.map(esc).join('<br>')}<br><span style="color:${C.lime}">${esc(r.highlight)}</span></h1>
  <div style="font-size:52px;font-weight:600;margin-top:50px;line-height:1.25">${r.intro.map(esc).join('<br>')}</div>${foot('@wearecancha','Swipe →',C.cream)}</div>`}];
 r.items.forEach((it,i)=>{const [bg,fg,head,chipBg,chipFg]=palettes[i%palettes.length];
  out.push({alt:`${it.label}, ${it.where}: ${it.title.join(' ')}. ${it.chips.map(([k,v])=>k+': '+v).join('. ')}. ${it.note}.`,html:`<div class="s" style="background:${bg};color:${fg}">${top(i+2,fg)}
  <div class="kick" style="margin-top:auto">${esc(it.where)}</div><div class="date">${esc(it.label)}</div>
  <h1 style="font-size:92px;margin:40px 0 50px;color:${head}">${it.title.map(esc).join('<br>')}</h1>${chips(it.chips,chipBg,chipFg)}
  <div style="margin-top:auto"></div>${foot(it.note,it.sourceLabel||host(it.sourceUrl),fg)}</div>`});});
 out.push({alt:'Side by side: '+r.items.map(it=>`${it.label}, ${it.row.city}, ${it.row.who} (${it.row.detail}), ${it.row.cost}`).join('; ')+'.',html:`<div class="s" style="background:${C.cream};color:${C.forest}">${top(n-1,C.forest)}
  <h1 style="font-size:120px;margin:70px 0 40px">Side by side</h1><table>${r.items.map(it=>`<tr><td><b>${esc(it.label)}</b>${esc(it.row.city)}</td><td><b>${esc(it.row.who)}</b><span class="sub">${esc(it.row.detail)}</span></td><td><b>${esc(it.row.cost)}</b></td></tr>`).join('')}</table>
  ${foot('Prices as listed by organizers on '+new Date(r.checkedOn+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'}),'Save this',C.forest)}</div>`});
 out.push({alt:'Before you pay: '+r.checklist.join('. ')+'. '+r.cta.join(': ')+'.',html:`<div class="s" style="background:${C.orange};color:${C.cream}">${top(n,C.cream)}
  <h1 style="font-size:130px;margin-top:130px;color:${C.ink}">Before<br>you pay</h1>
  <div style="font-size:52px;line-height:1.35;margin:50px 0;font-weight:600">${r.checklist.map(x=>'✓ '+esc(x)).join('<br>')}</div>
  <div class="chip" style="background:${C.forest};color:${C.cream};font-size:34px">${esc(r.cta[0])}<b style="color:${C.lime}">${esc(r.cta[1])}</b></div>
  ${foot('@wearecancha','Send to a teammate',C.cream)}</div>`});
 return out;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const {chromium}=await import('playwright'),{carousels}=JSON.parse(await readFile('content/instagram/comparison-carousels.json','utf8'));
 const only=(process.env.ONLY||'').split(',').filter(Boolean),out='private-data/comparison-carousels',assets='content/instagram/local-stories/assets/';
 await mkdir(out,{recursive:true});for(const f of ['display.woff2','condensed-700.woff2','condensed-600.woff2'])await copyFile(assets+f,join(out,f));
 const browser=await chromium.launch(process.env.CHROME_CHANNEL?{channel:process.env.CHROME_CHANNEL}:{}),page=await browser.newPage({viewport:{width:1080,height:1350}}),results=[];
 try{for(const r of carousels.filter(c=>!only.length||only.includes(c.id))){const files=[];
  for(const [i,s] of slides(r).entries()){const html=join(out,`${r.id}-${i+1}.html`),jpg=join(out,`${r.id}-${i+1}.jpg`);
   await writeFile(html,`<!doctype html><meta charset=utf-8><style>${css}</style><body>${s.html}</body>`);
   await page.goto(pathToFileURL(resolve(html)).href);await page.evaluate(()=>document.fonts.ready);
   if(!await page.evaluate(()=>document.fonts.check('96px Display')&&document.fonts.check('700 40px Cond')&&document.fonts.check('600 40px Cond')))throw Error('Brand fonts failed to load');
   await page.screenshot({path:jpg,type:'jpeg',quality:92});files.push({file:jpg,altText:s.alt.slice(0,1000)});}
  results.push({id:r.id,slides:files});}}
 finally{await browser.close();}
 await writeFile(join(out,'report.json'),JSON.stringify({renderedAt:new Date().toISOString(),results},null,1));
 console.log(JSON.stringify({rendered:results.map(r=>({id:r.id,slides:r.slides.length}))}));
}
