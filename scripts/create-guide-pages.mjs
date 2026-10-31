import {readFile,readdir} from 'node:fs/promises';import {createHash} from 'node:crypto';
import {withProject} from './project-session.mjs';
import {verifyReleaseContract} from './discovery-release-contract.mjs';
// Florida player pathway guide (Oct 30): adds CanchaGuide.tsx and one static page, publishes only those, then checks
// the server-rendered H1, title and section anchors. Reviewed pages are untouched. Mirrors create-hub-pages.mjs.
const site='https://pioneering-friday-005497.framer.app',image='https://framerusercontent.com/images/JUYZ43aps7QlsKNI8oaZmJcMigA.png';
export const GUIDE_PAGES=[
 {path:'/florida-soccer-pathway',name:'Florida soccer pathway',title:'Florida Soccer Pathway: Tryouts, ODP & College Recruiting | Cancha',h1:'Your Florida soccer pathway',description:'When Florida club tryouts can start, what ODP is, the main competitive leagues and when college coaches can contact you, with official sources.'}];
const q=JSON.stringify;let seq=0;const tid=p=>`${p}_${Date.now().toString(36)}_${++seq}`;
if(process.argv[1]?.endsWith('/create-guide-pages.mjs'))await withProject(async f=>{
 await verifyReleaseContract(f);
 const before=await f.agent.publish({action:'preview'});
 if(before.status!=='ready'||before.errors?.length||before.changes?.length||before.stagingEnabled)throw Error('Pending project changes must be reviewed first');
 const files=await f.getCodeFiles(),session='cancha-guide-'+Date.now();
 // Photos (content/website/pathway) are uploaded first; their hosted URLs replace the IMG placeholders in the component.
 let content=await readFile('framer/CanchaGuide.tsx','utf8');const images={};
 for(const name of (await readdir('content/website/pathway')).filter(n=>n.endsWith('.jpg'))){const bytes=await readFile('content/website/pathway/'+name),key=name.replace(/\.jpg$/,'');
  images[key]=(await f.uploadImage({name:`cancha-pathway-${key}-${createHash('sha256').update(bytes).digest('hex').slice(0,8)}`,image:{bytes:new Uint8Array(bytes),mimeType:'image/jpeg'}})).url;}
 content=content.replace(/__IMG:([a-z-]+)__/g,(m,k)=>{if(!images[k])throw Error('Missing pathway photo '+k);return images[k];});
 for(const dep of ['CanchaUI.tsx']){const d=files.find(x=>x.name===dep);if(!d)throw Error(dep+' missing');if((await f.typecheckCode(dep,d.content,undefined,session)).length)throw Error('Live '+dep+' has type errors');}
 const errors=await f.typecheckCode('CanchaGuide.tsx',content,undefined,session);if(errors.length)throw Error('Typecheck failed: '+JSON.stringify(errors).slice(0,600));
 let file=files.find(x=>x.name==='CanchaGuide.tsx');if(file){if(file.content!==content)await file.setFileContent(content)}else file=await f.createCodeFile('CanchaGuide.tsx',content);
 const apply=async(cmd,pagePath)=>{const r=await f.agent.applyChanges(cmd,{pagePath});if(r.errors||r.parseErrors)throw Error(pagePath+': '+JSON.stringify(r).slice(0,500));return r;};
 const touched=new Set([file.id]);
 for(const h of GUIDE_PAGES){let page=(await f.getNodesWithType('WebPageNode')).find(x=>x.path===h.path);
  if(!page){await apply(`+WebPageNode ${tid('hp')} name=${q(h.name)} path=${q(h.path)}`,'/');page=(await f.getNodesWithType('WebPageNode')).find(x=>x.path===h.path);}
  if(!page)throw Error('Page creation failed '+h.path);touched.add(page.id);
  await apply(`SET ${page.id} layoutTemplate="ZuWkzhOX9"`,h.path);
  await apply(`SET ${page.id} metadata.title=${q(h.title)} metadata.description=${q(h.description)} metadata.socialImage=${q(image)}`,h.path);
  let scene=await f.agent.serialize({id:page.id,depth:3},{pagePath:h.path}),desktop=scene.children?.find(x=>x.type==='FrameNode'&&x.name==='Desktop')||scene.children?.find(x=>x.type==='FrameNode');
  if(!desktop){const t=tid('hd');const r=await apply(`+FrameNode ${t} parent=${q(page.id)} name="Desktop" width="1200px" height="auto" layout="stack" stackDirection="vertical"`,h.path);desktop={id:r.renamedIds?.[t],children:[]};}
  if(!desktop.children?.some(x=>x.name==='Guide content'))await apply(`+ComponentInstanceNode ${tid('hc')} parent=${q(desktop.id)} component="codeFile/${file.id}:default" name="Guide content" width="1fr" height="auto"`,h.path);
  scene=await f.agent.serialize({id:page.id,depth:3},{pagePath:h.path});
  if(!scene.children.some(x=>x.name==='Phone')){const d=scene.children.find(x=>x.type==='FrameNode'&&x.name==='Desktop')||scene.children.find(x=>x.type==='FrameNode');const t=tid('hph');await apply(`CREATE_VARIANT ${t} from=${q(d.id)}\nSET ${t} name="Phone" width="390px" left="1800px" top="0px"`,h.path);}}
 const pending=await f.agent.publish({action:'preview'});
 if(pending.status!=='ready'||pending.errors?.length||pending.stagingEnabled)throw Error('Publication preview needs review');
 const foreign=(pending.changes||[]).filter(ch=>!touched.has(ch.nodeId));if(foreign.length)throw Error('Unrelated pending changes: '+foreign.map(c=>c.type+' '+c.name).join(', '));
 const confirm=await f.agent.publish({action:'preview'});if(confirm.confirmationHash!==pending.confirmationHash)throw Error('Project changed after preview');
 const receipt=await f.publish();if(receipt.errors?.length||receipt.status==='failed')throw Error('Publication failed');
 await new Promise(s=>setTimeout(s,60000));
 // A cache edge can serve the previous version for a few minutes after publishing; retry before judging.
 const fresh=async path=>{let r,html='';for(let n=0;n<10;n++){r=await fetch(site+path+'?v='+Date.now());html=await r.text();if(html.includes('cgd-card'))break;await new Promise(s=>setTimeout(s,30000));}return {r,html};};
 const checks=[];for(const h of GUIDE_PAGES){const {r,html}=await fresh(h.path);checks.push({path:h.path,status:r.status,title:((html.match(/<title>([^<]*)/)||[])[1]||'').slice(0,70),h1:html.includes(h.h1.replace(/&amp;/g,'&'))||html.toUpperCase().includes(h.h1.toUpperCase()),sections:(html.match(/class="cgd-card"/g)||[]).length,photos:(html.match(/framerusercontent\.com\/images\//g)||[]).length,faq:html.includes('"@type":"FAQPage"')});}
 await verifyReleaseContract(f);
 console.log(JSON.stringify({published:true,pages:(await f.getNodesWithType('WebPageNode')).length,checks}));
 if(checks.some(c=>c.status!==200||c.sections<5||c.photos<5||!c.faq))process.exitCode=1;
});
