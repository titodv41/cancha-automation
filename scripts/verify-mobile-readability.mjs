import {openBrowser} from './browser-session.mjs';
import {mkdir,writeFile} from 'node:fs/promises';

const out='private-data/mobile-readability-check';
await mkdir(out,{recursive:true,mode:0o700});
const checks=[];
for(const width of [320,390,1440]){
 const{browser,page}=await openBrowser({width,height:900}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  for(const route of ['/','/clubs','/explore']){
   await page.goto('https://pioneering-friday-005497.framer.app'+route,{waitUntil:'networkidle'});
   await page.locator('main[data-ready="true"]').waitFor();
   await page.evaluate(()=>document.fonts.ready);
   const reading=await page.evaluate(()=>({
    overflow:document.documentElement.scrollWidth>innerWidth+1,
    categories:[...document.querySelectorAll('.cv-browse-tile')].map(e=>({text:e.textContent,size:parseFloat(getComputedStyle(e).fontSize),clipped:e.scrollWidth>e.clientWidth+1})),
    actions:[...document.querySelectorAll('.ch3-filter,.cv-locate,.sd-tool')].map(e=>({text:e.textContent,size:parseFloat(getComputedStyle(e).fontSize),height:e.getBoundingClientRect().height})),
    headingFont:getComputedStyle(document.querySelector('main h1')).fontFamily,
   }));
   if(reading.overflow||!reading.headingFont.includes('Cancha Display')||reading.categories.some(x=>x.clipped))throw Error('Layout or display-font regression: '+route+' '+width);
   if(width<=650&&(reading.categories.some(x=>x.size<13)||reading.actions.some(x=>x.size<14||x.height<44)))throw Error('Phone reading size or touch target is too small: '+JSON.stringify(reading));
   if(route==='/clubs'){
    const before=await page.locator('.sd-count').innerText();
    await page.getByRole('button',{name:'UPSL',exact:true}).click();
    await page.waitForFunction(()=>new URL(location.href).searchParams.get('league')==='UPSL');
    if(!await page.locator('.cv-card').count())throw Error('UPSL category returned no cards');
    await page.getByRole('button',{name:/^Filters\b/}).first().click();
    await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({state:'hidden'});
    await page.getByRole('button',{name:'Clear filters',exact:true}).click();
    await page.waitForFunction(text=>document.querySelector('.sd-count')?.textContent===text,before);
    await page.getByRole('button',{name:'Map view',exact:true}).click();
    await page.getByRole('region',{name:'City overview map'}).waitFor();
    await page.getByRole('button',{name:'List view',exact:true}).click();
    await page.getByRole('region',{name:'City overview map'}).waitFor({state:'hidden'});
   }
   await page.screenshot({path:out+'/'+(route==='/'?'home':route.slice(1))+'-'+width+'.png',fullPage:false});
   checks.push({route,width,...reading,passed:true});
  }
  if(errors.length)throw Error(errors.join('; '));
 }finally{await browser.close()}
}
await writeFile(out+'/report.json',JSON.stringify({checkedAt:new Date().toISOString(),passed:true,checks},null,2),{mode:0o600});
console.log(JSON.stringify({passed:true,viewports:[320,390,1440],pages:['/','/clubs','/explore'],checks:checks.length,categoryResetDialogAndMapPassed:true}));
