import {readFile} from 'node:fs/promises';
import {withProject} from './project-session.mjs';
import {verifyReleaseContract} from './discovery-release-contract.mjs';
// City and college hub pages (Oct 27 competitor review: city hubs + college ID camp list). Adds CanchaHub.tsx and four
// static pages; publishes only those, then checks each page's server-rendered H1 and title. Reviewed pages are untouched.
const site='https://pioneering-friday-005497.framer.app',image='https://framerusercontent.com/images/JUYZ43aps7QlsKNI8oaZmJcMigA.png';
export const HUB_PAGES=[
 {hub:'orlando',path:'/orlando-soccer',name:'Soccer in Orlando',title:'Soccer in Orlando: Clubs, Tryouts & Camps | Cancha',h1:'Soccer in Orlando',description:'Find soccer clubs, academies, places to play and current tryouts, camps and college events in Orlando and Central Florida, with official links.'},
 {hub:'tampa',path:'/tampa-soccer',name:'Soccer in Tampa Bay',title:'Soccer in Tampa Bay: Clubs, Tryouts & Camps | Cancha',h1:'Soccer in Tampa Bay',description:'Find soccer clubs, academies, places to play and current tryouts, camps and college events in Tampa, St. Pete and the Bay area, with official links.'},
 {hub:'miami',path:'/miami-soccer',name:'Soccer in Miami',title:'Soccer in Miami & South Florida: Clubs, Tryouts & Camps | Cancha',h1:'Soccer in Miami &amp; South Florida',description:'Find soccer clubs, academies, places to play and current tryouts, camps and college events across Miami-Dade, Broward and Palm Beach, with official links.'},
 {hub:'college',path:'/college-soccer-id-camps-florida',name:'College ID camps Florida',title:'College Soccer ID Camps in Florida | Cancha',h1:'College soccer ID camps &amp; events in Florida',description:'Current college soccer ID camps, clinics and showcases in Florida, sorted by date, with official registration links and what to check before you pay.'}];
const q=JSON.stringify;let seq=0;const tid=p=>`${p}_${Date.now().toString(36)}_${++seq}`;
if(process.argv[1]?.endsWith('/create-hub-pages.mjs'))await withProject(async f=>{
 await verifyReleaseContract(f);
 const before=await f.agent.publish({action:'preview'});
 if(before.status!=='ready'||before.errors?.length||before.changes?.length||before.stagingEnabled)throw Error('Pending project changes must be reviewed first');
 const files=await f.getCodeFiles(),session='cancha-hub-'+Date.now(),content=await readFile('framer/CanchaHub.tsx','utf8');
 for(const dep of ['CanchaUI.tsx','CanchaDiscoveryData.tsx']){const d=files.find(x=>x.name===dep);if(!d)throw Error(dep+' missing');if((await f.typecheckCode(dep,d.content,undefined,session)).length)throw Error('Live '+dep+' has type errors');}
 const errors=await f.typecheckCode('CanchaHub.tsx',content,undefined,session);if(errors.length)throw Error('Typecheck failed: '+JSON.stringify(errors).slice(0,600));
 let file=files.find(x=>x.name==='CanchaHub.tsx');if(file){if(file.content!==content)await file.setFileContent(content)}else file=await f.createCodeFile('CanchaHub.tsx',content);
 const apply=async(cmd,pagePath)=>{const r=await f.agent.applyChanges(cmd,{pagePath});if(r.errors||r.parseErrors)throw Error(pagePath+': '+JSON.stringify(r).slice(0,500));return r;};
 const touched=new Set([file.id]);
 for(const h of HUB_PAGES){let page=(await f.getNodesWithType('WebPageNode')).find(x=>x.path===h.path);
  if(!page){await apply(`+WebPageNode ${tid('hp')} name=${q(h.name)} path=${q(h.path)}`,'/');page=(await f.getNodesWithType('WebPageNode')).find(x=>x.path===h.path);}
  if(!page)throw Error('Page creation failed '+h.path);touched.add(page.id);
  await apply(`SET ${page.id} layoutTemplate="ZuWkzhOX9"`,h.path);
  await apply(`SET ${page.id} metadata.title=${q(h.title)} metadata.description=${q(h.description)} metadata.socialImage=${q(image)}`,h.path);
  let scene=await f.agent.serialize({id:page.id,depth:3},{pagePath:h.path}),desktop=scene.children?.find(x=>x.type==='FrameNode'&&x.name==='Desktop')||scene.children?.find(x=>x.type==='FrameNode');
  if(!desktop){const t=tid('hd');const r=await apply(`+FrameNode ${t} parent=${q(page.id)} name="Desktop" width="1200px" height="auto" layout="stack" stackDirection="vertical"`,h.path);desktop={id:r.renamedIds?.[t],children:[]};}
  if(!desktop.children?.some(x=>x.name==='Hub content'))await apply(`+ComponentInstanceNode ${tid('hc')} parent=${q(desktop.id)} component="codeFile/${file.id}:default" name="Hub content" width="1fr" height="auto" $control__hub="${h.hub}"`,h.path);
  scene=await f.agent.serialize({id:page.id,depth:3},{pagePath:h.path});
  if(!scene.children.some(x=>x.name==='Phone')){const d=scene.children.find(x=>x.type==='FrameNode'&&x.name==='Desktop')||scene.children.find(x=>x.type==='FrameNode');const t=tid('hph');await apply(`CREATE_VARIANT ${t} from=${q(d.id)}\nSET ${t} name="Phone" width="390px" left="1800px" top="0px"`,h.path);}}
 const pending=await f.agent.publish({action:'preview'});
 if(pending.status!=='ready'||pending.errors?.length||pending.stagingEnabled)throw Error('Publication preview needs review');
 const foreign=(pending.changes||[]).filter(ch=>!touched.has(ch.nodeId));if(foreign.length)throw Error('Unrelated pending changes: '+foreign.map(c=>c.type+' '+c.name).join(', '));
 const confirm=await f.agent.publish({action:'preview'});if(confirm.confirmationHash!==pending.confirmationHash)throw Error('Project changed after preview');
 const receipt=await f.publish();if(receipt.errors?.length||receipt.status==='failed')throw Error('Publication failed');
 await new Promise(s=>setTimeout(s,60000));
 // A cache edge can serve the previous version for a few minutes after publishing; retry before judging.
 const fresh=async path=>{let r,html='';for(let n=0;n<10;n++){r=await fetch(site+path+'?v='+Date.now());html=await r.text();if(html.includes('chb-card'))break;await new Promise(s=>setTimeout(s,30000));}return {r,html};};
 const checks=[];for(const h of HUB_PAGES){const {r,html}=await fresh(h.path);checks.push({path:h.path,status:r.status,title:((html.match(/<title>([^<]*)/)||[])[1]||'').slice(0,70),h1:html.includes(h.h1.replace(/&amp;/g,'&'))||html.toUpperCase().includes(h.h1.toUpperCase()),cards:(html.match(/chb-card/g)||[]).length});}
 await verifyReleaseContract(f);
 console.log(JSON.stringify({published:true,pages:(await f.getNodesWithType('WebPageNode')).length,checks}));
 if(checks.some(c=>c.status!==200||!c.cards))process.exitCode=1;
});
