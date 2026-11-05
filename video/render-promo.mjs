// Renders an original animated promo (no footage). Usage: node video/render-promo.mjs <promo.json> [--stills] [--out dir]
// Silent preview here; narration (Chris) and library music are mixed by the same steps the creator cuts use.
import{bundle}from'@remotion/bundler';import{renderMedia,renderStill,selectComposition}from'@remotion/renderer';
import{readFile,mkdir,copyFile,mkdtemp,rm}from'node:fs/promises';import{resolve,join}from'node:path';import{tmpdir}from'node:os';import{chromium}from'playwright';
const root=resolve(import.meta.dirname,'..'),spec=JSON.parse(await readFile(process.argv[2],'utf8')),arg=n=>{const i=process.argv.indexOf(n);return i>0?process.argv[i+1]:null};
const{brand}=JSON.parse(await readFile(join(root,'content/instagram/photo-editorial.json'))),gen=join(root,'video/public/generated/promo'),out=resolve(arg('--out')||join(root,'previews/promo'));
await mkdir(gen,{recursive:true});await mkdir(out,{recursive:true});
for(const[name,path]of[['display.woff2',brand.displayFont],['ui.woff2',brand.bodyFont],['cancha.png',brand.logo]])await copyFile(join(root,path),join(gen,name));
const temp=await mkdtemp(join(tmpdir(),'cancha-promo-'));
try{
 const serveUrl=await bundle({entryPoint:join(root,'video/src/index.tsx'),publicDir:join(root,'video/public'),outDir:join(temp,'bundle'),enableCaching:false});
 const common={serveUrl,browserExecutable:process.env.CANCHA_BROWSER_EXECUTABLE||chromium.executablePath(),inputProps:{brand,logo:'generated/promo/cancha.png',text:spec.text}};
 const composition=await selectComposition({...common,id:spec.composition||'PromoEmptySpot'});
 if(process.argv.includes('--stills')){for(const s of spec.stills||[1.5,4.6,9.5,13.4,17.2,20.6]){await renderStill({...common,composition,frame:Math.round(s*30),imageFormat:'jpeg',output:join(out,`${spec.id}-${s}.jpg`)});}}
 else await renderMedia({...common,composition,outputLocation:join(out,spec.id+'-silent.mp4'),codec:'h264',crf:23,pixelFormat:'yuv420p',concurrency:2,muted:true});
 console.log(JSON.stringify({out}));
}finally{await rm(temp,{recursive:true,force:true})}
