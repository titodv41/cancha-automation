import {openBrowser} from './browser-session.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const base=process.argv.find(s=>s.startsWith('--base='))?.slice(7)||'https://pioneering-friday-005497.framer.app';
const out='previews/community-growth-2026-10-22',brands=JSON.parse(await readFile('config/independent-brand-links.json')).brands,checks=[];
await mkdir(out,{recursive:true});const assert=(x,m)=>{if(!x)throw Error(m)};
for(const width of [1440,390,320]){
 const {browser,page}=await openBrowser({width,height:1000},{reducedMotion:'reduce'}),errors=[],frameErrors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.text().startsWith('CANCHA_FRAME_ERROR '))try{frameErrors.push(JSON.parse(m.text().slice(19)))}catch{}});await page.addInitScript(()=>window.addEventListener('error',e=>console.info('CANCHA_FRAME_ERROR '+JSON.stringify({message:e.message,url:location.href,main:top===self}))));
 const visit=async p=>{await page.goto(base+p,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal overflow at '+p)};
 try{
  await visit('/');await page.locator('main[data-ready="true"]').waitFor();
  assert(await page.locator('.ch4-club-board .ch4-board-club').count()===3,'Three actual club identities');
  await page.locator('.ch4-club-board img').evaluateAll(async xs=>Promise.all(xs.map(i=>i.decode())));
  assert(await page.locator('main h1').evaluate(n=>getComputedStyle(n).fontFamily.includes('Cancha Display')),'Brand display font');
  assert(await page.locator('.ch3-community-scene').count()===0,'Old hero photograph replaced');
  await page.locator('.ch4-brand-grid').scrollIntoViewIfNeeded();await page.locator('.ch4-brand-grid img').evaluateAll(async xs=>Promise.all(xs.map(i=>i.decode())));
  for(const b of brands){const link=page.locator('.ch4-brand-link').filter({hasText:b.name});assert(await link.getAttribute('href')===b.url,'Correct independent link: '+b.name)}
  assert((await page.locator('.ch4-brands p').innerText()).includes('do not sponsor'),'No implied sponsors');
  await page.screenshot({path:out+'/brands-'+width+'.png'});await page.locator('.ch4-expansion').scrollIntoViewIfNeeded();await page.screenshot({path:out+'/nominate-'+width+'.png'});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:out+'/home-live-'+width+'.png',fullPage:width===1440});
  await visit('/organizations?submission=Next-state%20club%20nomination#submission');
  await page.waitForFunction(()=>[...document.querySelectorAll('select[name="Submission Type"]')].filter(n=>n.getClientRects().length).some(n=>n.value==='Next-state club nomination'));
  assert(await page.locator('form').count()>0,'Existing native submission form retained');await page.screenshot({path:out+'/nomination-form-'+width+'.png'});
  await visit('/clubs/soccer-stars-miami');await page.getByRole('heading',{name:'Soccer Stars — Miami',exact:true}).waitFor();
  await page.locator('main img').evaluateAll(async xs=>Promise.all(xs.map(i=>i.decode())));assert((await page.locator('main').innerText()).includes('class'),'Program profile loads');await page.screenshot({path:out+'/new-profile-'+width+'.png'});
  await visit('/careers');await page.locator('main[data-ready="true"]').waitFor();assert(await page.getByRole('heading',{name:'Soccer careers',exact:true}).count()||await page.locator('main h1').count(),'Career discovery retained');
  const editorStorage=frameErrors.filter(e=>!e.main&&e.url.startsWith('https://framer.com/edit?')&&e.message.includes("Failed to read the 'localStorage'")).length;assert(errors.every(e=>e.includes("Failed to read the 'localStorage'"))&&errors.length<=editorStorage,'Unexpected browser runtime errors: '+errors.join('; '));checks.push({width,passed:true,heroBadges:3,independentBrandLinks:4,nominationPrefill:true,nativeFormRetained:true,newProfile:true,noOverflow:true,preexistingFramerEditorStorageErrors:editorStorage});console.log(width+' live checks passed');
 }finally{await browser.close()}
}
await writeFile('private-data/growth-2026-10-22/live-browser-checks.json',JSON.stringify({base,checkedAt:new Date().toISOString(),checks},null,2));
