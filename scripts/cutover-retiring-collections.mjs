import {readFile} from 'node:fs/promises';
import {withProject} from './project-session.mjs';
import {readReleaseContract,verifyReleaseContract} from './discovery-release-contract.mjs';
import {site,storyItem,providerItem,injectItems} from './migrate-retiring-collections.mjs';
// docs/cms-consolidation-plan-2026-10-25.md, steps 3-6 ("cutover"). Every edit stays unpublished in the editor until all
// steps succeed: listing pages switch to CanchaStaticPage, each migrated item becomes a static page at its exact old URL,
// the three templates, their collections and /migration-preview are removed. One publish, then every URL is checked.
// Restore path: the encrypted backup taken by the workflow just before this script, plus Framer's version history.
// Logs carry counts, ids and checks only, never item content.
const RETIRING=['Stories','Providers','Offers'],LISTS={'/stories':['story','Approved Stories'],'/providers':['provider','Approved Providers'],'/offers':['offer','Approved Offers']};
const flat=(n,out=[])=>{if(n){out.push(n);for(const c of n.children||[])flat(c,out);}return out;};
const q=JSON.stringify;
// Framer keeps temporary ids project-wide, so every created node gets a fresh one.
let seq=0;const tid=p=>`${p}_${Date.now().toString(36)}_${++seq}`;
await withProject(async f=>{
 // A resumed run already holds its own scene edits (and removed templates change linked scenes such as Home),
 // so it checks reviewed code and typography here and leaves pages to the live checks after publishing.
 if(process.env.RESUME==='1'){const expected=JSON.parse(await readFile('config/discovery-release-contract.json','utf8')),actual=await readReleaseContract(f);
  for(const [k,h] of Object.entries(expected.codeFiles))if(actual.codeFiles[k]!==h)throw Error('Reviewed code changed: '+k);
  for(const [k,h] of Object.entries(expected.textStyles||{}))if(actual.textStyles[k]!==h)throw Error('Typography changed: '+k);}
 else await verifyReleaseContract(f);
 // RESUME=1 continues an interrupted cutover: its own unpublished edits may be pending, but only of these kinds.
 const resume=process.env.RESUME==='1',before=await f.agent.publish({action:'preview'});
 const ownKind=ch=>['WebPage','LayoutTemplate','Collection','CMSCollection','CollectionItem'].includes(ch.type)||ch.type==='CodeFile'&&ch.name==='CanchaStaticPage.tsx';
 if(before.status!=='ready'||before.errors?.length||before.stagingEnabled||(before.changes||[]).some(ch=>!resume||!ownKind(ch)))throw Error('Pending project changes must be reviewed first');
 if(resume)console.log(JSON.stringify({resume:true,pending:(before.changes||[]).map(ch=>ch.type+':'+ch.status)}));
 // 1. Data and component (same field mapping as the verified preview phase).
 const collections=(await f.getCollections()).filter(c=>RETIRING.includes(c.name)),items=[];
 for(const c of collections){const byName=Object.fromEntries((await c.getFields()).map(x=>[x.name,x])),live=(await c.getItems()).filter(i=>!i.draft);
  if(c.name==='Offers'&&live.length)throw Error('Offers exist; extend the migration first');for(const it of live)items.push(c.name==='Stories'?storyItem(it,byName):providerItem(it,byName));}
 if(collections.length!==3||items.length!==5||items.some(i=>!i.title))throw Error('Unexpected collections or items ('+collections.length+'/'+items.length+'); collections are deleted only after every page step, so a resume always finds them');
 const content=injectItems(await readFile('framer/CanchaStaticPage.tsx','utf8'),items),session='cancha-cutover-'+Date.now();
 const ui=(await f.getCodeFiles()).find(x=>x.name==='CanchaUI.tsx');if((await f.typecheckCode('CanchaUI.tsx',ui.content,undefined,session)).length)throw Error('Live CanchaUI.tsx has type errors');
 const errors=await f.typecheckCode('CanchaStaticPage.tsx',content,undefined,session);if(errors.length)throw Error('Typecheck failed: '+JSON.stringify(errors).slice(0,600));
 const file=(await f.getCodeFiles()).find(x=>x.name==='CanchaStaticPage.tsx');if(!file)throw Error('Run the preview phase first');if(file.content!==content)await file.setFileContent(content);
 const component=`codeFile/${file.id}:default`;
 const apply=async(cmd,pagePath)=>{const r=await f.agent.applyChanges(cmd,{pagePath});if(r.errors||r.parseErrors)throw Error(pagePath+': '+JSON.stringify(r).slice(0,600));return r;};
 const pages=await f.getNodesWithType('WebPageNode'),byPath=p=>pages.find(x=>x.path===p);
 const templates=RETIRING.map(n=>byPath(`/${n.toLowerCase()}/:slug`)).filter(Boolean),preview=byPath('/migration-preview');
 if(templates.length!==3&&!resume)throw Error('Expected 3 CMS template pages');
 const touched=new Set([...(resume?(before.changes||[]).map(ch=>ch.nodeId):[]),file.id,...templates.map(t=>t.id),...(preview?[preview.id]:[]),...collections.map(c=>c.id)]);
 // 2. Remove the template pages first; if Framer refuses, stop with nothing published.
 if(templates.length)await f.removeNodes(templates.map(t=>t.id));
 // 3. Listing pages: replace the CMS list and its filters with the component in list mode, on every breakpoint.
 for(const [path,[kind,listName]] of Object.entries(LISTS)){const page=byPath(path);if(!page)throw Error('Missing '+path);touched.add(page.id);
  const read=async()=>f.agent.serialize({id:page.id,depth:3},{pagePath:path});
  for(const frameName of ['Desktop','Phone']){let scene=await read(),frame=scene.children?.find(x=>x.name===frameName);if(!frame)continue;
   const pos=name=>frame.children?.findIndex(x=>x.name===name)??-1,hero=pos('Directory hero'),index=pos(listName)>=0?pos(listName):pos('Directory filters')>=0?pos('Directory filters'):hero>=0?hero+1:-1;
   for(const name of ['Directory filters',listName]){const node=frame.children?.find(x=>x.name===name);if(node)await apply(`DEL ${node.id}`,path);}
   scene=await read();frame=scene.children.find(x=>x.name===frameName);
   if(!frame.children?.some(x=>x.name==='Static listing')){const t=tid('sl');const r=await apply(`+ComponentInstanceNode ${t} parent=${q(frame.id)} component="${component}" name="Static listing" width="1fr" height="auto" $control__mode="list" $control__kind="${kind}"`,path);
    const id=r.renamedIds?.[t];if(id&&index>=0)await apply(`MOVE ${id} parent=${q(frame.id)} index="${index}"`,path);}}
  const check=flat(await read());if(check.some(n=>[listName,'Directory filters'].includes(n.name))||!check.some(n=>n.name==='Static listing'))throw Error('Listing replacement incomplete on '+path);}
 // 4. Remove the three collections.
 for(const c of collections)await apply(`DEL ${c.id}`,'/');
 if((await f.getCollections()).some(c=>RETIRING.includes(c.name)))throw Error('Collections still present');
 // 5. One static page per item at the exact old URL, with the site layout, title and description.
 for(const i of items){let page=(await f.getNodesWithType('WebPageNode')).find(x=>x.path===i.path);
  if(!page){await apply(`+WebPageNode ${tid('sp')} name=${q(i.title.slice(0,60))} path=${q(i.path)}`,'/');page=(await f.getNodesWithType('WebPageNode')).find(x=>x.path===i.path);}
  if(!page)throw Error('Page creation failed for '+i.path);touched.add(page.id);
  await apply(`SET ${page.id} layoutTemplate="ZuWkzhOX9"`,i.path);
  try{await apply(`SET ${page.id} metadata.title=${q(i.title+' | Cancha')} metadata.description=${q((i.summary||i.title).slice(0,155))}`,i.path);}catch(e){console.log(JSON.stringify({metadata:'not set',path:i.path,reason:String(e.message).slice(0,160)}));}
  let scene=await f.agent.serialize({id:page.id,depth:3},{pagePath:i.path}),desktop=scene.children?.find(x=>x.type==='FrameNode'&&x.name==='Desktop')||scene.children?.find(x=>x.type==='FrameNode');
  if(!desktop){const t=tid('spd');const r=await apply(`+FrameNode ${t} parent=${q(page.id)} name="Desktop" width="1200px" height="auto" layout="stack" stackDirection="vertical"`,i.path);desktop={id:r.renamedIds?.[t],children:[]};}
  if(!desktop.children?.some(x=>x.name==='Static content'))await apply(`+ComponentInstanceNode ${tid('sd')} parent=${q(desktop.id)} component="${component}" name="Static content" width="1fr" height="auto" $control__mode="detail" $control__path=${q(i.path)}`,i.path);
  scene=await f.agent.serialize({id:page.id,depth:3},{pagePath:i.path});
  if(!scene.children.some(x=>x.name==='Phone')){const d=scene.children.find(x=>x.type==='FrameNode'&&x.name==='Desktop')||scene.children.find(x=>x.type==='FrameNode');const t=tid('spp');await apply(`CREATE_VARIANT ${t} from=${q(d.id)}\nSET ${t} name="Phone" width="390px" left="1800px" top="0px"`,i.path);}}
 // 6. The temporary preview page goes away with this publish.
 if(preview)await f.removeNodes([preview.id]);
 // 7. Publish only if every pending change belongs to this migration.
 const pending=await f.agent.publish({action:'preview'});
 if(pending.status!=='ready'||pending.errors?.length||pending.stagingEnabled)throw Error('Publication preview needs review');
 const foreign=(pending.changes||[]).filter(ch=>!touched.has(ch.nodeId)&&!(ch.type==='CollectionItem'&&RETIRING.some(n=>String(ch.name||'').startsWith(n.toLowerCase()+'/'))));
 if(foreign.length)throw Error('Unrelated pending changes; stopped: '+foreign.map(ch=>ch.type).join(','));
 const confirm=await f.agent.publish({action:'preview'});if(confirm.confirmationHash!==pending.confirmationHash)throw Error('Project changed after preview');
 const receipt=await f.publish();if(receipt.errors?.length||receipt.status==='failed')throw Error('Publication failed');
 // 8. Verify every preserved URL and the listing pages on the live site.
 const get=async p=>{for(let n=0;n<8;n++){try{const r=await fetch(site+p+(p.includes('?')?'&':'?')+'v='+Date.now(),{signal:AbortSignal.timeout(30000)});const t=await r.text();if(r.ok)return {status:r.status,t};if(n===7)return {status:r.status,t};}catch{}await new Promise(s=>setTimeout(s,15000));}return {status:0,t:''};};
 const has=(t,s)=>t.includes(s)||t.includes(s.replace(/&/g,'&amp;'))||t.includes(s.replace(/’/g,'&#x27;').replace(/'/g,'&#x27;'));
 const checks=[];
 for(const i of items){const r=await get(i.path);checks.push({path:i.path,status:r.status,title:has(r.t,i.title)});}
 for(const [path,[kind]] of Object.entries(LISTS)){const r=await get(path),want=items.filter(i=>i.kind===kind);checks.push({path,status:r.status,items:want.filter(i=>has(r.t,i.title)).length+'/'+want.length,intake:/submission/i.test(r.t)});}
 for(const path of ['/','/clubs','/explore','/about','/training','/organizations','/careers','/pathways']){const r=await get(path);checks.push({path,status:r.status});}
 const failed=checks.filter(c=>c.status!==200||c.title===false||(c.items&&c.items.split('/')[0]!==c.items.split('/')[1]));
 const after=await readReleaseContract(f);
 console.log(JSON.stringify({phase:'cutover',published:true,collectionsRemoved:collections.length,templatesRemoved:templates.length,staticPages:items.length,pages:(await f.getNodesWithType('WebPageNode')).length,collections:(await f.getCollections()).map(c=>c.name),checks,failed:failed.length}));
 console.log('ACTUAL_CONTRACT '+JSON.stringify(after));
 if(failed.length)process.exitCode=1;
});
