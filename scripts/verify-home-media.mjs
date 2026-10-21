import{openBrowser}from'./browser-session.mjs';
import{mkdir,readFile,writeFile}from'node:fs/promises';
const base=process.argv.find(x=>x.startsWith('--base='))?.slice(7)||'https://pioneering-friday-005497.framer.app';
const dir=process.argv.find(x=>x.startsWith('--output='))?.slice(9)||'previews/brand-polish';
const resources=JSON.parse(await readFile('config/learning-resources.json'));
const checks=[],assert=(ok,message)=>{if(!ok)throw Error(message)};
await mkdir(dir,{recursive:true});
for(const[device,width]of[['desktop',1440],['mobile',390],['small-mobile',320]]){
 const{browser,page}=await openBrowser({width,height:1000},{reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const overflow=async()=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No page overflow at '+page.url());
 const visit=async path=>{await page.goto(base+path,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await overflow()};
 try{
  await visit('/');await page.locator('main[data-ready="true"]').waitFor();
  assert(await page.locator('main h1').evaluate(e=>getComputedStyle(e).fontFamily.includes('Cancha Display')&&getComputedStyle(e).fontStyle==='italic'),'Cancha headline identity retained');
  assert(await page.evaluate(()=>document.fonts.check('italic 700 72px "Cancha Display"')),'Actual display font loaded');
  assert(await page.locator('.ch3-intro').evaluate(e=>getComputedStyle(e).fontFamily.includes('system')&&+getComputedStyle(e).fontWeight>=500),'Supporting text uses a readable device UI font');
  const scene=page.locator('.ch3-community-scene');await scene.locator('img').evaluate(i=>i.decode());
  assert(await scene.locator('img').count()===1,'Single intentional community photograph replaces rejected slideshow');
  assert(await scene.getByRole('link',{name:'Orlando, Florida',exact:true}).getAttribute('href')==='/clubs?near=Orlando','Photo location leads to relevant directory results');
  assert(await page.getByRole('button',{name:'Next soccer photo',exact:true}).count()===0,'Rejected rotating photo controls removed');
  const strip=page.locator('.ch3-club-strip');
  assert(await strip.getByRole('listitem').count()===8,'Eight actual directory clubs');
  await strip.locator('[data-primary] img').evaluateAll(async images=>{for(const i of images)i.loading='eager';await Promise.all(images.map(i=>i.decode()))});
  assert(await strip.locator('[data-primary] img').evaluateAll(images=>images.every(i=>i.naturalWidth>0&&getComputedStyle(i).objectFit==='contain')),'Badges load uncropped');
  assert(await page.getByRole('button',{name:'Pause badge movement',exact:true}).count()===0,'Reduced motion keeps badges static');
  const next=page.getByRole('button',{name:'Next clubs',exact:true});let steps=0;
  while(steps++<10){await page.waitForFunction(()=>{const n=document.querySelector('.ch3-club-strip'),b=document.querySelector('button[aria-label="Next clubs"]');return b.disabled===(n.scrollLeft+n.clientWidth>=n.scrollWidth-2)});if(await next.isDisabled())break;const before=await strip.evaluate(n=>n.scrollLeft);await next.click();await page.waitForFunction(before=>document.querySelector('.ch3-club-strip').scrollLeft>before,before)}
  assert(steps>0&&await next.isDisabled(),'Manual controls reach last club');
  const end=await strip.evaluate(n=>n.scrollLeft),previous=page.getByRole('button',{name:'Previous clubs',exact:true});if(end>0){await previous.focus();await page.keyboard.press('Enter');await page.waitForFunction(end=>document.querySelector('.ch3-club-strip').scrollLeft<end,end)}else assert(await previous.isDisabled(),'All badges fit without unnecessary scrolling');
  assert(await page.getByRole('heading',{name:'How Cancha works',exact:true}).count()===1,'Current process explained');
  const credits=page.locator('details.cf3-credits');assert(!await credits.evaluate(n=>n.open),'Credits discreet by default');await credits.locator('summary').focus();await page.keyboard.press('Enter');assert(await credits.evaluate(n=>n.open),'Credits keyboard accessible');assert(await credits.getByRole('link',{name:'CC BY 4.0',exact:true}).count()===1,'Photograph license retained');await credits.locator('summary').click();
  await page.locator('.ch3-paths').scrollIntoViewIfNeeded();await page.locator('.ch3-paths img').evaluateAll(async images=>Promise.all(images.map(i=>i.decode())));
  assert(await page.locator('.ch3-path').evaluateAll(cards=>cards.every(n=>n.querySelector('img')?.naturalWidth>0)),'Each homepage category has identifying media');
  await page.evaluate(()=>{if(document.activeElement instanceof HTMLElement)document.activeElement.blur();scrollTo(0,0)});await page.screenshot({path:dir+'/home-'+device+'.png',fullPage:device==='desktop'});
  await strip.evaluate(n=>n.scrollLeft=0);await strip.getByRole('link',{name:'Explore Weston FC',exact:true}).click();await page.waitForURL('**/clubs/weston-fc');await page.getByRole('heading',{name:'Weston FC',exact:true}).waitFor();
  await visit('/training');assert(await page.locator('.learn-card').count()===11,'All eleven learning resources retained');
  for(const r of resources){const card=page.locator('.learn-card').filter({has:page.getByRole('heading',{name:r.title,exact:true})}),img=card.locator('.learn-art img');await img.evaluate(i=>{i.loading='eager';return i.decode()});assert(await img.getAttribute('src')===r.image&&await img.getAttribute('alt')===r.provider+' official identifying mark','Correct provider mark for '+r.title);assert(await img.evaluate(i=>getComputedStyle(i).objectFit==='contain'),'Provider logo uncropped')}
  await page.screenshot({path:dir+'/courses-'+device+'.png',fullPage:true});
  await page.getByRole('button',{name:'Video & data analysis',exact:true}).click();assert(await page.locator('.learn-card').count()===3,'Analysis filtering preserved');
  await visit('/clubs?view=list&q=ALBION%20SC%20Miami');const identity=page.locator('.cv-card').filter({has:page.getByRole('heading',{name:'ALBION SC Miami',exact:true})}).locator('.cv-identity');assert((await identity.locator('strong').textContent())==='ALBION SC Miami','Missing badge shows full organization identity rather than initials');
  await visit('/clubs/trotters-park-orlando');await page.locator('.cd3-venue-map img').evaluate(i=>i.decode());assert((await page.locator('.cd3-venue-map').innerText()).includes('Orlando · city area')&&(await page.locator('.cd3-venue-map').innerText()).includes('© OpenStreetMap · city area'),'Venue imagery labels map precision honestly');await page.screenshot({path:dir+'/venue-'+device+'.png',fullPage:true});
  assert(errors.length===0,'No runtime errors');checks.push({device,passed:true,brandFont:true,substantialBodyType:true,staticCommunityPhoto:true,eightUncroppedBadges:true,manualCarousel:true,reducedMotion:true,creditsAccessible:true,elevenProviderLogos:true,courseFiltering:true,organizationFallback:true,venueCityMap:true,noOverflow:true});console.log(device,'brand and media passed');
 }finally{await browser.close()}
}
{
 const{browser,page}=await openBrowser({width:1440,height:1000},{reducedMotion:'no-preference'});
 try{
  await page.clock.install();await page.goto(base+'/',{waitUntil:'networkidle'});await page.getByRole('button',{name:'Pause badge movement',exact:true}).waitFor();
  const strip=page.locator('.ch3-club-strip');await strip.scrollIntoViewIfNeeded();await page.mouse.move(0,0);await page.clock.runFor(100);const before=await strip.evaluate(n=>n.scrollLeft);await page.clock.runFor(1000);assert(await strip.evaluate(n=>n.scrollLeft)>before,'Badges move gently when visible');
  await page.getByRole('button',{name:'Pause badge movement',exact:true}).click();await page.clock.runFor(50);const stopped=await strip.evaluate(n=>n.scrollLeft);await page.clock.runFor(1000);assert(await strip.evaluate(n=>n.scrollLeft)===stopped,'Pause stops movement');
  await page.getByRole('button',{name:'Play badge movement',exact:true}).click();await page.clock.runFor(1000);assert(await strip.evaluate(n=>n.scrollLeft)>stopped,'Movement can resume');
  await strip.hover();await page.clock.runFor(50);const hovered=await strip.evaluate(n=>n.scrollLeft);await page.clock.runFor(1000);assert(await strip.evaluate(n=>n.scrollLeft)===hovered,'Hover pauses movement');
  await page.mouse.move(0,0);await page.locator('footer').scrollIntoViewIfNeeded();await page.evaluate(()=>new Promise(resolve=>{const o=new IntersectionObserver(e=>{if(!e[0].isIntersecting){o.disconnect();resolve(true)}});o.observe(document.querySelector('.ch3-club-strip'))}));await page.clock.runFor(100);const offscreen=await strip.evaluate(n=>n.scrollLeft);await page.clock.runFor(1000);assert(await strip.evaluate(n=>n.scrollLeft)===offscreen,'Offscreen movement pauses');checks.push({device:'motion',passed:true,gentleMovement:true,pauseResume:true,hoverPause:true,offscreenPause:true});
 }finally{await browser.close()}
}
await writeFile('private-data/home-media-browser.json',JSON.stringify({base,checkedAt:new Date().toISOString(),checks},null,2));console.log(JSON.stringify({passed:true,checks}));
