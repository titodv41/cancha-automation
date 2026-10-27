import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';import {existsSync,createWriteStream} from 'node:fs';import {join,resolve} from 'node:path';import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';import {Readable} from 'node:stream';import {pipeline} from 'node:stream/promises';
import {slides,cssFor} from './render-comparison-carousels.mjs';
// Vertical Reel version of each comparison carousel (content/instagram/comparison-carousels.json): the same verified
// slides laid out at 1080x1920 inside Instagram's safe zone (clear of the top bar, caption and buttons), a slow push-in per slide, slide transitions and a
// licensed Mixkit music bed. No narration and no stock footage. Output: MP4 + poster + report per Reel.
const T=0.35;// transition seconds
export const durations=n=>Array.from({length:n},(_,i)=>i===0?2.8:i===n-2?3.4:i===n-1?2.8:2.6);
const download=async(url,file)=>{const r=await fetch(url,{signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error('Music download failed '+r.status);await pipeline(Readable.fromWeb(r.body),createWriteStream(file));};
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const {chromium}=await import('playwright'),{carousels}=JSON.parse(await readFile('content/instagram/comparison-carousels.json','utf8')),{music}=JSON.parse(await readFile('content/instagram/meme-reels.json','utf8'));
 const only=(process.env.ONLY||'').split(',').filter(Boolean),out='private-data/comparison-reels',assets='content/instagram/local-stories/assets/';
 await mkdir(out,{recursive:true});for(const f of ['display.woff2','condensed-700.woff2','condensed-600.woff2'])await copyFile(assets+f,join(out,f));
 const track=join(out,'_music-drive.mp3');if(!existsSync(track))await download(music.drive,track);
 const browser=await chromium.launch(process.env.CHROME_CHANNEL?{channel:process.env.CHROME_CHANNEL}:{}),page=await browser.newPage({viewport:{width:1080,height:1920}}),results=[];
 try{for(const r of carousels.filter(c=>!only.length||only.includes(c.id))){try{
  const list=slides(r),d=durations(list.length),parts=[];
  // A Reel has no pages to swipe: drop the slide counter and the swipe prompt.
  for(const [i,s] of list.entries()){const html=join(out,`${r.id}-${i+1}.html`),png=join(out,`${r.id}-${i+1}.png`),mp4=join(out,`${r.id}-${i+1}.mp4`);
   await writeFile(html,`<!doctype html><meta charset=utf-8><style>${cssFor(1920)}</style><body>${s.html.replace(/<span>\d+ \/ \d+<\/span>/,'<span></span>').replace('Swipe →','')}</body>`);
   await page.goto(pathToFileURL(resolve(html)).href);await page.evaluate(()=>document.fonts.ready);
   if(!await page.evaluate(()=>document.fonts.check('96px Display')&&document.fonts.check('700 40px Cond')))throw Error('Brand fonts failed to load');
   await page.screenshot({path:png});
   const frames=Math.round(d[i]*30);
   // Slow push-in from 100% to 104%, centered.
   execFileSync('ffmpeg',['-v','error','-y','-loop','1','-framerate','30','-i',png,'-vf',`scale=2160:3840,zoompan=z='1+0.04*on/${frames}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1080x1920:fps=30,format=yuv420p`,'-frames:v',String(frames),'-c:v','libx264','-preset','veryfast','-crf','19',mp4]);
   parts.push(mp4);}
  let chain='',last='[0:v]',off=0;parts.slice(1).forEach((_,k)=>{off+=d[k]-T;chain+=`${last}[${k+1}:v]xfade=transition=${k%2?'slideleft':'smoothleft'}:duration=${T}:offset=${off.toFixed(3)}[x${k}];`;last=`[x${k}]`;});
  const total=d.reduce((a,b)=>a+b,0)-T*(parts.length-1),file=join(out,r.id+'.mp4'),poster=join(out,r.id+'.jpg');
  execFileSync('ffmpeg',['-v','error','-y',...parts.flatMap(f=>['-i',f]),'-ss','8','-i',track,'-filter_complex',
   `${chain}${last}format=yuv420p[vout];[${parts.length}:a]atrim=0:${total.toFixed(3)},afade=t=in:d=0.4,afade=t=out:st=${(total-1).toFixed(3)}:d=1,volume=1.4[a]`,
   '-map','[vout]','-map','[a]','-c:v','libx264','-preset','veryfast','-crf','20','-r','30','-c:a','aac','-b:a','160k','-movflags','+faststart',file]);
  execFileSync('ffmpeg',['-v','error','-y','-i',join(out,`${r.id}-1.png`),'-q:v','2',poster]);
  results.push({id:r.id,rendered:true,file,poster,seconds:+total.toFixed(2),slides:list.length});
 }catch(e){results.push({id:r.id,rendered:false,error:String(e.message).slice(0,300)});}}}
 finally{await browser.close();}
 await writeFile(join(out,'report.json'),JSON.stringify({renderedAt:new Date().toISOString(),results},null,1));
 console.log(JSON.stringify({rendered:results.map(x=>({id:x.id,ok:x.rendered,seconds:x.seconds,error:x.error}))}));
 if(results.some(x=>!x.rendered))process.exitCode=1;
}
