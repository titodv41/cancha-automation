import {readFile,writeFile} from 'node:fs/promises';
import {openBrowser} from './browser-session.mjs';
const preview=JSON.parse(await readFile('content/instagram/club-cut-preview.json'));
const {browser,page}=await openBrowser({width:390,height:844});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.setContent(`<meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;background:#071d17;color:#f5f3e9;font-family:system-ui}video{display:block;width:100%;max-height:calc(100dvh - 70px);object-fit:contain;background:#071d17}p{font-size:12px;padding:0 15px;line-height:1.4}</style><video controls playsinline muted poster="${preview.posterUrl}" src="${preview.videoUrl}"></video><p>Cancha · Visual preview with music. Premium narration is pending.</p>`);
 await page.waitForFunction(()=>{const v=document.querySelector('video');return v.readyState>=2||v.error},{timeout:45000});
 const initial=await page.evaluate(()=>{const v=document.querySelector('video');return{width:v.videoWidth,height:v.videoHeight,duration:v.duration,error:v.error?.code||null}});
 if(initial.error||initial.width!==1080||initial.height!==1920||Math.abs(initial.duration-20)>.1)throw Error('Hosted preview metadata or playback failed');
 await page.evaluate(()=>document.querySelector('video').play());
 await page.waitForFunction(()=>document.querySelector('video').currentTime>.5,{timeout:10000});
 await page.evaluate(()=>document.querySelector('video').pause());
 const frames=[];
 for(const time of[1.2,4.4,9,18]){
  await page.evaluate(async t=>{const v=document.querySelector('video');v.currentTime=t;await v.play()},time);
  try{await page.waitForFunction(t=>{const v=document.querySelector('video');return !v.seeking&&v.currentTime>=t&&v.readyState>=2},time,{timeout:25000});}
  catch{console.log(await page.evaluate(()=>{const v=document.querySelector('video');return{time:v.currentTime,seeking:v.seeking,ready:v.readyState,error:v.error?.code,buffered:Array.from({length:v.buffered.length},(_,i)=>[v.buffered.start(i),v.buffered.end(i)])}}));throw Error('Hosted preview seek failed');}
  await page.evaluate(()=>document.querySelector('video').pause());
  await page.screenshot({path:`previews/club-cut/phone-${time}.png`});frames.push(time);
 }
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
 if(overflow||errors.length)throw Error('Phone preview has layout or browser errors');
 const report={...initial,viewport:{width:390,height:844},frames,played:true,overflow,errors,checkedAt:new Date().toISOString()};
 await writeFile('previews/club-cut/phone-check.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close()}
