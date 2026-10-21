import {openBrowser} from './browser-session.mjs';
import {mkdir, writeFile} from 'node:fs/promises';
const base=process.argv.find(x=>x.startsWith('--base='))?.slice(7)||'https://pioneering-friday-005497.framer.app';
const output='previews/community-refresh',checks=[],assert=(value,message)=>{if(!value)throw Error(message)};
await mkdir(output,{recursive:true});
for(const[device,width]of[['desktop',1440],['mobile',390],['small-mobile',320]]){
 const{browser,page}=await openBrowser({width,height:1000}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const visit=async path=>{const r=await page.goto(base+path,{waitUntil:'networkidle',timeout:90000});assert(r.status()===200,'Route '+path);await page.locator('.cn2-logo img:visible').waitFor();await page.waitForFunction(()=>getComputedStyle(document.documentElement).getPropertyValue('--cancha-ui-font').includes('Cancha UI'));await page.evaluate(()=>document.fonts.ready)};
 const overflow=async()=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow '+page.url());
 const shot=async name=>page.screenshot({path:`${output}/${name}-${device}.png`,fullPage:true});
 try{
  await visit('/stories');await page.locator('.cn2-menu a[href="/stories"][aria-current="page"]').waitFor({state:'attached'});await page.locator('.cancha-community h1').waitFor();await page.locator('.cc-photo img').evaluate(i=>i.decode());await overflow();
  assert(await page.locator('h1:visible').count()===1,'One community title');
  const type=await page.locator('.cancha-community h1').evaluate(e=>({family:getComputedStyle(e).fontFamily,style:getComputedStyle(e).fontStyle}));assert(type.family.includes('Cancha Display')&&type.style==='italic','Community uses Cancha display identity');
  assert(await page.locator('.cc-hero p').evaluate(e=>getComputedStyle(e).fontFamily.includes('Cancha UI')),'Matching Barlow supporting text');
  assert(await page.evaluate(async()=>{await Promise.all([500,600,700].map(w=>document.fonts.load(w+' 16px "Cancha UI"')));return [500,600,700].every(w=>document.fonts.check(w+' 16px "Cancha UI"'))}),'All Barlow font assets load');
  const contrast=await page.locator('.cc-hero .cv-btn').evaluate(e=>{const cs=getComputedStyle(e),l=s=>{const c=s.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return .2126*c[0]+.7152*c[1]+.0722*c[2]},a=l(cs.color),b=l(cs.backgroundColor);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)});assert(contrast>=4.5,'Readable group CTA contrast');
  assert(await page.getByRole('link',{name:/^Join group/}).count()===0,'No invented WhatsApp invites');
  assert(await page.locator('.cc-pickup-card').count()===2,'Existing pickup organizers remain available');
  const storyLinks=page.locator('a[href*="/stories/"]:visible');assert(await storyLinks.count()===3,'All approved guide routes retained');await shot('community');
  const search=page.locator('input[placeholder="Search stories"]:visible');await search.fill('Five');await page.waitForFunction(()=>Array.from(document.querySelectorAll('a[href*="/stories/"]')).filter(e=>e.getClientRects().length).length===1);assert((await storyLinks.first().getAttribute('href')).endsWith('/questions-before-you-register'),'Native guide search still works');await page.getByRole('button',{name:'Clear all directory filters',exact:true}).click();await page.waitForFunction(()=>Array.from(document.querySelectorAll('a[href*="/stories/"]')).filter(e=>e.getClientRects().length).length===3);
  await Promise.all([page.waitForNavigation({waitUntil:'domcontentloaded'}),page.locator('.cc-hero .cv-btn').click()]);
  const selects=page.locator('select[name="Submission Type"]:visible');await selects.first().waitFor();await page.waitForFunction(()=>Array.from(document.querySelectorAll('select[name="Submission Type"]')).filter(e=>e.getClientRects().length).every(e=>e.value==='Pickup group or community'));
  assert(!(await page.locator('body').innerText()).includes('titodv41@gmail.com'),'Private recipient hidden');assert(await page.locator('form').count()>0,'Native private form preserved');await overflow();await shot('group-intake');
  for(const path of ['/providers','/offers','/stories/questions-before-you-register']){await visit(path);await overflow();const titles=await page.locator('.framer-text:visible').evaluateAll(es=>es.filter(e=>parseFloat(getComputedStyle(e).fontSize)>=24).map(e=>getComputedStyle(e).fontFamily));assert(titles.some(f=>f.includes('Cancha Display')),'Native display typography '+path);if(path==='/providers')await shot('services');if(path.startsWith('/stories/')){await page.locator('img[src*="TrNRKgLG"]').waitFor();await page.locator('img[src*="TrNRKgLG"]').evaluate(i=>i.decode());assert(await page.locator('h2.framer-text:visible').evaluateAll(es=>es.every(e=>parseFloat(getComputedStyle(e).fontSize)<=36)),'Guide section headings remain compact');await shot('guide');}}
  assert(errors.length===0,'Runtime errors: '+errors.join(';'));checks.push({device,passed:true,displayFont:true,bodyFont:'Barlow 500/600/700',ctaContrast:contrast,noFakeGroups:true,guideSearch:true,nativeGroupTypePrefilled:true,privateForm:true,noHorizontalOverflow:true,runtimeErrors:errors});console.log(device,'community checks passed');
 }catch(e){await page.screenshot({path:`${output}/failure-${device}.png`}).catch(()=>{});checks.push({device,passed:false,error:e.message,url:page.url()});throw e}finally{await browser.close();await writeFile('private-data/community-refresh-2026-10-21/browser-checks.json',JSON.stringify({base,checkedAt:new Date().toISOString(),checks},null,2),{mode:0o600})}
}
await writeFile(output+'/reviewed-previews.json',JSON.stringify({base,checkedAt:new Date().toISOString(),checks},null,2)+'\n');
