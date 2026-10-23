import{readFile,writeFile,mkdir}from'node:fs/promises';
import{createHash}from'node:crypto';
import{pathToFileURL}from'node:url';
import{resolve}from'node:path';
import{sourceSession}from'./source-session.mjs';
import{openBrowser}from'./browser-session.mjs';
import{withProject}from'./project-session.mjs';
import{syncDiscoveryCatalog}from'./sync-discovery-catalog.mjs';
import{githubStateClient}from'./github-state-client.mjs';
import{sendPrivate}from'./automation-service-client.mjs';
import{dateInNewYork}from'../server/offer-expiry.mjs';
import{directoryClaims,directorySourceHash,selectDirectoryProfiles,normalized,officialHeaderLogo}from'../server/directory-editorial.mjs';
import{approvedOriginalCreative}from'../server/social-creative.mjs';
import{directoryGuideHtml}from'./directory-guide-layout.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex'),asData=(b,m)=>`data:${m};base64,${b.toString('base64')}`;
export async function prepareDirectoryEditorial({catalog,previous=[],upload=false,deliver=false,maximum=2,targetBuffer=6,today=dateInNewYork(),out='previews/directory-guides'}={}){
 const settings=JSON.parse(await readFile('config/daily-content.json'));if(!settings.enabled)return {prepared:0,delivered:false,blocked:[],posts:[],reason:'disabled'};maximum=Math.min(maximum,settings.newDirectoryGuidesPerRun);targetBuffer=settings.directoryDraftBuffer;
 const policy=JSON.parse(await readFile('config/instagram-editorial-policy.json')),badges=JSON.parse(await readFile('config/club-badge-identities.json')),{brand}=JSON.parse(await readFile('content/instagram/photo-editorial.json'));
 const eligiblePending=previous.filter(r=>['Draft','Approved','Preparing'].includes(r.status)&&!/(?:Source unavailable|Organizer source changed|Official facts need rechecking)/.test(r.note||'')&&!policy.retiredDraftIds.includes(r.id)&&['photo-carousel','directory-guide','narrative-story'].includes(r.content?.visualEvidence?.kind)&&approvedOriginalCreative(r.content));
 const count=Math.min(maximum,Math.max(0,targetBuffer-eligiblePending.length)),report={prepared:0,delivered:false,availableBefore:eligiblePending.length,targetBuffer,blocked:[],posts:[]};
 if(!count)return report;
 const candidates=selectDirectoryProfiles(catalog,previous,{today,badges,maximumCandidates:Math.min(18,settings.maximumCandidateSites)}),session=sourceSession(),{browser,page}=await openBrowser({width:1100,height:1180});
 const display=asData(await readFile(brand.displayFont),'font/woff2'),ui=asData(await readFile(brand.bodyFont),'font/woff2'),logo=asData(await readFile(brand.logo),'image/png');
 await mkdir(out,{recursive:true});page.setDefaultTimeout(15000);
 try{
  for(const candidate of candidates){if(report.posts.length>=count)break;
   try{
    const html=await session.html(candidate.website,/text\/html/i,{timeoutMs:15000,followCanonical:true}),claims=directoryClaims(candidate,html.toString());if(!claims)throw Error('Current official name/city evidence unavailable');
    let reviewed=badges.some(b=>b.slug===candidate.slug&&b.assetUrl===candidate.image&&b.sha256===candidate.imageIdentity);let image=reviewed?candidate.image:officialHeaderLogo(html.toString(),candidate.website);if(!image)throw Error('An identifying club logo could not be established');
    let bytes=await session.html(image,/image\//i,{maxBytes:8000000,followCanonical:true});if(reviewed&&sha(bytes)!==candidate.imageIdentity){image=officialHeaderLogo(html.toString(),candidate.website);if(!image)throw Error('Reviewed badge bytes changed and no fresh official badge is identifiable');bytes=await session.html(image,/image\//i,{maxBytes:8000000,followCanonical:true});reviewed=false;}
    const profile=Object.fromEntries(['slug','name','city','region','website','href','image','imageIdentity','checkedOn'].map(k=>[k,candidate[k]]));profile.claims=claims;profile.image=image;profile.imageIdentity=sha(bytes);profile.badgeSource=reviewed?'reviewed-registry':'official-site-logo';
    const sourceUrl='https://pioneering-friday-005497.framer.app'+profile.href;
    await page.setViewportSize({width:1100,height:1180});await page.goto(sourceUrl,{waitUntil:'networkidle',timeout:20000});const heading=page.getByRole('heading',{name:profile.name,exact:true}).first();await heading.waitFor();
    await page.evaluate(async()=>{await document.fonts.ready;scrollTo(0,0);await Promise.all([...document.images].filter(i=>i.getBoundingClientRect().top<1000).map(i=>i.decode().catch(()=>{})))});
    if(!normalized(await heading.textContent()).includes(normalized(profile.name)))throw Error('Public profile identity changed');
    const capture=await page.screenshot({clip:{x:0,y:100,width:1100,height:900},type:'png'}),stamp=new Date().toISOString(),id='directory-'+profile.slug+'-'+today.replaceAll('-',''),slides=[];
    const badge=asData(bytes,/<svg[\s>]/i.test(bytes.toString('utf8',0,1000))?'image/svg+xml':bytes[0]===137?'image/png':bytes[0]===255?'image/jpeg':'image/webp');
    await writeFile(`${out}/${id}-capture.png`,capture);
    for(const index of [0,1]){
     await page.setViewportSize({width:1080,height:1350});await page.setContent(directoryGuideHtml({brand,profile,display,ui,logo,badge,capture:asData(capture,'image/png'),index,variant:report.posts.length+Math.floor(Date.parse(today)/86400000)}));
     await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()))});
     const quality=await page.evaluate(()=>[...document.querySelectorAll('.copy,.city,.facts,.profile-copy,.questions,h1,.fact')].map(e=>({text:e.textContent,bounds:e.getBoundingClientRect().toJSON(),scroll:e.scrollWidth,width:e.clientWidth})).filter(e=>e.bounds.right>1021||e.bounds.bottom>1235||e.scroll>e.width+1));
     const overlap=await page.evaluate(()=>{const a=document.querySelector('.copy'),b=document.querySelector('.city');return !!a&&a.getBoundingClientRect().bottom>b.getBoundingClientRect().top-24});if(quality.length||overlap)throw Error('Club guide typography or layout does not fit');
     const file=`${out}/${id}-${index+1}.jpg`;await page.screenshot({path:file,type:'jpeg',quality:96});const b=await readFile(file);slides.push({assetRole:index?'cancha-profile':'official-badge',assetUrl:null,assetChecksum:sha(b),width:1080,height:1350,altText:index?'Actual Cancha profile for '+profile.name+'. Check age group, costs and training venue with the club.':profile.name+' official identifying badge. '+profile.city+', Florida.'});
    }
    const city=profile.city,name=profile.name,programs=claims.tags.length?claims.tags.join(', ').toLowerCase():null,variant=parseInt(sha(profile.slug).slice(0,2),16)%3;
    const intros=[`${name}, in ${city}.` ,`A club to know around ${city}: ${name}.`,`${city} players: here’s ${name}.`];
    const caption=intros[variant]+(programs?` Its official site lists ${programs}.`:'')+'\n\nBefore joining, ask which team fits your age and level, where it trains and what the season costs. A club profile does not mean registration is open.\n\nIf you play there, what would you tell someone new to the area?\n\nFind the profile through Cancha’s bio link, or visit the club:\n'+profile.website+'\n\n#FloridaSoccer #LocalSoccer';
    const row={id,format:'feed',sourceType:'brand',topic:'community',creativeKind:'directory-guide',creativeVersion:'cancha-local-v2',headline:name,caption,altText:slides[0].altText,factsCheckedAt:stamp,officialSourceUrl:profile.website,sourceHash:directorySourceHash(profile),editorialOrganization:name,directoryProfile:profile,directoryCapture:{sourceUrl,capturedAt:stamp,width:1100,height:900,sha256:sha(capture)},slides,assetUrl:null,assetChecksum:slides[0].assetChecksum,rights:'Original Cancha design; reviewed official badge identifies the club, and the second slide is an actual public Cancha profile capture. No membership, endorsement, opening or availability claim.',visualEvidence:{creator:'Cancha',kind:'directory-guide',subjectKey:'directory:'+profile.slug,sourceUrl,sourceHash:directorySourceHash(profile),sourceReviewedOn:today,renderedAt:stamp,assetChecksum:slides[0].assetChecksum}};
    if(upload)await withProject(async f=>{for(const [i,slide]of slides.entries()){const b=await readFile(`${out}/${id}-${i+1}.jpg`),a=await f.uploadImage({name:id+'-'+(i+1),image:{bytes:new Uint8Array(b),mimeType:'image/jpeg'}});slide.assetUrl=a.url;slide.assetChecksum=sha(await session.html(a.url,/image\/jpeg/,{maxBytes:8000000}));}row.assetUrl=slides[0].assetUrl;row.assetChecksum=slides[0].assetChecksum;row.visualEvidence.assetChecksum=row.assetChecksum;if(!approvedOriginalCreative(row))throw Error('Directory guide evidence failed');});
    report.posts.push(row);console.log(JSON.stringify({directoryGuide:profile.name,city,rendered:true,uploaded:upload}));
   }catch(error){report.blocked.push({slug:candidate.slug,reason:error.message})}
  }
 }finally{await browser.close();await session.close()}
 report.prepared=report.posts.length;if(deliver&&report.posts.length){if(!upload)throw Error('Hosted assets required before private queue delivery');await sendPrivate('/automation/drafts',report.posts);report.delivered=true}
 await writeFile(out+'/report.json',JSON.stringify(report,null,2));return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const hosted=process.env.CANCHA_AUTOMATION_BACKEND==='github'&&!!process.env.CANCHA_GITHUB_STATE_KEY&&!!process.env.GITHUB_TOKEN;
 let catalog,previous=[];if(hosted){const client=githubStateClient();try{const state=await client.load();if(state?.plan?.enabled!==true){console.log(JSON.stringify({directoryPrepared:0,reason:'Standing plan paused'}));process.exit(0)}previous=(state?.queue||[]).map(r=>({...r,content:JSON.parse(r.content)}))}finally{await client.close()}}
 await withProject(async f=>catalog=(await syncDiscoveryCatalog(f)).catalog);
 const out=hosted?'private-data/daily-opportunities/'+dateInNewYork()+'/directory-editorial':'previews/directory-guides',report=await prepareDirectoryEditorial({catalog,previous,upload:hosted||process.argv.includes('--upload'),deliver:hosted,out,targetBuffer:6});console.log(JSON.stringify({directoryPrepared:report.prepared,delivered:report.delivered,blocked:report.blocked.length}));
}
