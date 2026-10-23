import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {openBrowser} from './browser-session.mjs';

const links=JSON.parse(await readFile('content/instagram/single-story-preview.json'));
const photos=JSON.parse(await readFile('content/instagram/photo-editorial-preview-links.json'));
const out='private-data/story-preview-audit';await mkdir(out,{recursive:true});
const {browser,page}=await openBrowser({width:390,height:844}),results=[];
try {
 for(const row of links.versions) {
  const url=new URL(row.url);if(url.protocol!=='https:'||url.hostname!=='framerusercontent.com')throw Error('Unexpected preview host');
  await page.setContent(`<style>body{margin:0;background:#062832}video{width:100%;display:block;aspect-ratio:9/16}</style><video playsinline controls muted preload="auto" src="${url.href}"></video>`);
  await page.waitForFunction(()=>{const v=document.querySelector('video');return v.readyState>=2||v.error},{timeout:40000});
  const initial=await page.evaluate(()=>{const v=document.querySelector('video');return{width:v.videoWidth,height:v.videoHeight,duration:v.duration,error:v.error?.code||null}});
  if(initial.error||initial.width!==1080||initial.height!==1920||Math.abs(initial.duration-24)>.1)throw Error('Public phone delivery failed');
  await page.evaluate(()=>document.querySelector('video').play());await page.waitForTimeout(350);
  const advanced=await page.evaluate(()=>{const v=document.querySelector('video');v.pause();return v.currentTime>0});
  if(!advanced)throw Error('Public video did not play');
  const seeks=[];
  for(const seconds of[1,4.1,5.8,8.3,10.3,12.9,14.5,16.9,19,23]) {
   await page.evaluate(t=>new Promise((resolve,reject)=>{const v=document.querySelector('video');const timer=setTimeout(()=>reject(Error('Seek timeout')),7000);v.addEventListener('seeked',()=>{clearTimeout(timer);resolve(true)},{once:true});v.currentTime=t}),seconds);
   const proof=await page.evaluate(()=>{const v=document.querySelector('video');return{at:v.currentTime,readyState:v.readyState,error:v.error?.code||null}});
   if(proof.error||Math.abs(proof.at-seconds)>.2)throw Error('Public seek failed');seeks.push(proof);
   if(row.mode==='music'&&[1,5.8,14.5,19].includes(seconds))await page.screenshot({path:`${out}/${row.mode}-${seconds}.png`});
  }
  results.push({mode:row.mode,url:row.url,...initial,advanced,seeks});
 }
 const imageResults=[];
 for(const post of photos.covers)for(const url of post.slides) {
  const asset=new URL(url);if(asset.protocol!=='https:'||asset.hostname!=='framerusercontent.com')throw Error('Unexpected photo host');
  await page.setContent(`<style>body{margin:0}img{display:block;width:100%}</style><img src="${asset.href}">`);
  const proof=await page.evaluate(async()=>{const i=document.querySelector('img');await i.decode();return{width:i.naturalWidth,height:i.naturalHeight,overflow:document.body.scrollWidth>innerWidth}});
  if(proof.width!==1080||proof.height!==1350||proof.overflow)throw Error('Public carousel phone check failed');imageResults.push({url,...proof});
 }
 await writeFile(out+'/report.json',JSON.stringify({checkedAt:new Date().toISOString(),viewport:{width:390,height:844},videos:results,slides:imageResults},null,2));
 console.log(JSON.stringify({publicVideos:results.length,phonePlayback:true,seekChecks:results.reduce((n,r)=>n+r.seeks.length,0),publicSlides:imageResults.length,overflow:false}));
} finally {await browser.close()}
