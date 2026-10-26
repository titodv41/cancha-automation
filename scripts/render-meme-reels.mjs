import {chromium} from 'playwright';import {execFileSync,spawnSync} from 'node:child_process';import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';import {existsSync} from 'node:fs';
import {pathToFileURL} from 'node:url';import {resolve,join} from 'node:path';import {download,sourceRank} from './footage-library.mjs';
// Renders short Reels from content/instagram/meme-reels.json: one licensed clip per line, white flash cuts,
// text that slides in, Cancha type and colors, and a licensed music bed. Output: MP4 + poster per Reel.
const assets='content/instagram/local-stories/assets/';
export const css=`@font-face{font-family:Display;src:url(display.woff2)}@font-face{font-family:Cond;src:url(condensed-700.woff2)}
*{margin:0;box-sizing:border-box}html,body{width:1080px;height:1920px;background:transparent;overflow:hidden}
.hook{position:absolute;left:70px;right:70px;top:330px;text-align:center;font-family:Cond;font-weight:700;font-size:96px;line-height:1.08;color:#fff;text-shadow:0 0 22px rgba(0,0,0,.65),0 5px 0 rgba(0,0,0,.55)}
.card{position:absolute;left:80px;right:80px;top:700px;text-align:center}
.big{font-family:Display;text-transform:uppercase;font-size:180px;line-height:.9;color:#d7ef86;text-shadow:0 6px 26px rgba(0,0,0,.65)}
.chip{display:inline-block;margin-top:34px;background:#f5f3e9;color:#103f32;border-radius:22px;padding:22px 34px;font-family:Cond;font-size:58px}
.wm{position:absolute;left:0;right:0;bottom:150px;text-align:center;font-family:Display;font-size:54px;color:#f5f3e9;text-shadow:0 2px 10px rgba(0,0,0,.6)}
.wm span{font-family:Cond;font-size:36px;display:block;opacity:.9;margin-top:6px}`;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export function overlay(seg){const wm='<div class="wm">CANCHA<span>Florida soccer, found → link in bio</span></div>';
 if(seg.big)return `${seg.text?`<div class="hook">${esc(seg.text)}</div>`:''}<div class="card"><div class="big">${esc(seg.big)}</div>${seg.chip?`<div class="chip">${esc(seg.chip)}</div>`:''}</div>${wm}`;
 return `<div class="hook">${esc(seg.text)}</div>${wm}`;}
// Picks a downloaded clip for each line: a pinned id when reviewed, otherwise the first unused clip for its query long enough for the line.
// Clips that failed the visual check are excluded; `used` is shared across a batch so no clip repeats.
export function chooseClips(recipe,clips,used=new Set()){const rank=c=>{const i=sourceRank.indexOf(c.source);return i<0?9:i;};return recipe.segments.map(seg=>{
 const pool=clips.filter(c=>c.file&&!c.rejected&&(seg.clip?c.id===seg.clip:c.query===(seg.club?'club:'+seg.club:seg.footage))&&!used.has(c.id)&&(!c.duration||c.duration>=seg.seconds+(seg.start||0))).sort((a,b)=>rank(a)-rank(b));
 const pick=pool[0]||null;if(pick)used.add(pick.id);return pick;});}
// Rejects black, washed-out or flat clips (title cards, blank screens) from frames sampled through the clip.
export function visuallyUsable(stats){return stats.length>0&&stats.every(s=>s.avg>=35&&s.avg<=225&&s.high-s.low>=70);}
export function parseSignalstats(text){const get=k=>Number((String(text).match(new RegExp('signalstats\\.'+k+'=([\\d.]+)'))||[])[1]);return Number.isFinite(get('YAVG'))?{avg:get('YAVG'),low:get('YLOW'),high:get('YHIGH')}:null;}
// metadata=print writes to stderr; a frame past the clip's end yields no stats and is skipped.
function frameStats(file,photo=false){const out=[];for(const t of photo?[0]:[0.5,2,4]){const run=spawnSync('ffmpeg',['-hide_banner','-ss',String(t),'-i',file,'-frames:v','1','-vf','signalstats,metadata=print','-f','null','-'],{encoding:'utf8'});const stats=parseSignalstats(run.stderr);if(stats)out.push(stats);}return out;}
const F=0.15;
async function renderReel(recipe,clips,page,out,music,used){
 const picks=chooseClips(recipe,clips,used);if(picks.some(p=>!p)){const seg=recipe.segments[picks.findIndex(p=>!p)];return {id:recipe.id,rendered:false,reason:'No downloaded clip for '+(seg.club?'club:'+seg.club:seg.footage)};}
 const parts=[];
 for(const [i,seg] of recipe.segments.entries()){const html=join(out,`_${recipe.id}-${i}.html`),png=join(out,`_${recipe.id}-${i}.png`),mp4=join(out,`_${recipe.id}-${i}.mp4`),d=seg.seconds;
  await writeFile(html,`<!doctype html><meta charset=utf-8><style>${css}</style><body>${overlay(seg)}<span style="font-family:Display;position:absolute;opacity:0">.</span></body>`);
  await page.goto(pathToFileURL(resolve(html)).href);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(150);
  if(!await page.evaluate(()=>document.fonts.check('96px Cond')&&document.fonts.check('180px Display')))throw Error('Brand fonts failed to load');
  await page.screenshot({path:png,omitBackground:true});
  const still=picks[i].kind==='photo';execFileSync('ffmpeg',['-v','error','-y',...(still?['-loop','1','-framerate','30']:['-ss',String(seg.start||0)]),'-t',String(d),'-i',picks[i].file,'-loop','1','-t',String(d),'-i',png,'-filter_complex',
   `[0:v]scale=-2:1920,crop=1080:1920:(iw-1080)*${seg.focus??0.5}:0,scale=iw*(1+0.05*t/${d}):-2:eval=frame,crop=1080:1920,eq=brightness=-0.07,fps=30,setsar=1[v];`+
   `[1:v]format=rgba,fade=in:st=0.12:d=0.22:alpha=1[t];[v][t]overlay=x=0:y='if(lt(t,0.34),70*(1-(t-0.12)/0.22),0)':shortest=1,format=yuv420p`,'-an','-c:v','libx264','-preset','veryfast','-crf','19',mp4]);
  parts.push([mp4,d]);}
 let chain='',last='[0:v]',off=0;parts.slice(1).forEach((_,k)=>{off+=parts[k][1]-F;chain+=`${last}[${k+1}:v]xfade=transition=fadewhite:duration=${F}:offset=${off.toFixed(3)}[x${k}];`;last=`[x${k}]`;});
 const total=parts.reduce((s,[,d])=>s+d,0)-F*(parts.length-1),file=join(out,recipe.id+'.mp4');
 execFileSync('ffmpeg',['-v','error','-y',...parts.flatMap(([f])=>['-i',f]),'-ss','8','-i',music,'-filter_complex',
  `${chain}${last}format=yuv420p[vout];[${parts.length}:a]atrim=0:${total.toFixed(3)},afade=t=in:d=0.3,afade=t=out:st=${(total-0.8).toFixed(3)}:d=0.8,volume=1.6[a]`,
  '-map','[vout]','-map','[a]','-c:v','libx264','-preset','veryfast','-crf','20','-c:a','aac','-b:a','160k','-movflags','+faststart',file]);
 execFileSync('ffmpeg',['-v','error','-y','-ss','1.6','-i',file,'-frames:v','1',join(out,recipe.id+'.jpg')]);
 return {id:recipe.id,rendered:true,file,seconds:+total.toFixed(2),footage:picks.map(p=>({id:p.id,source:p.source,license:p.license,creator:p.creator,page:p.page}))};}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const {music,reels}=JSON.parse(await readFile('content/instagram/meme-reels.json','utf8')),library=JSON.parse(await readFile(process.env.LIBRARY||'private-data/footage/library.json','utf8'));
 const out='private-data/meme-reels';await mkdir(out,{recursive:true});for(const f of ['display.woff2','condensed-700.woff2'])await copyFile(assets+f,join(out,f));
 const tracks={};for(const [name,url] of Object.entries(music)){const file=join(out,'_music-'+name+'.mp3');if(!existsSync(file))await download(url,file);tracks[name]=file;}
 for(const clip of library.clips.filter(c=>c.file)){const stats=frameStats(clip.file,clip.kind==='photo');if(!visuallyUsable(stats))clip.rejected='dark, washed-out or flat frames';}
 // CHROME_CHANNEL=chrome uses the runner's preinstalled Chrome instead of a slow Playwright browser install.
 const browser=await chromium.launch(process.env.CHROME_CHANNEL?{channel:process.env.CHROME_CHANNEL}:{}),page=await browser.newPage({viewport:{width:1080,height:1920}}),results=[],used=new Set();
 try{for(const recipe of reels.filter(r=>!process.env.ONLY||process.env.ONLY.split(',').includes(r.id)))try{results.push(await renderReel(recipe,library.clips,page,out,tracks[recipe.music]||Object.values(tracks)[0],used));}catch(e){results.push({id:recipe.id,rendered:false,reason:e.message.slice(0,200)});}}
 finally{await browser.close();}
 await writeFile(join(out,'report.json'),JSON.stringify({renderedAt:new Date().toISOString(),results},null,1));console.log(JSON.stringify(results.map(r=>({id:r.id,rendered:r.rendered,reason:r.reason,footage:r.footage?.map(f=>f.id)}))));
 if(!results.some(r=>r.rendered))process.exitCode=1;
}
