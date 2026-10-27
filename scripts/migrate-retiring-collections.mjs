import {readFile} from 'node:fs/promises';import {pathToFileURL} from 'node:url';import {resolve} from 'node:path';
// docs/cms-consolidation-plan-2026-10-25.md, steps 2-3 (phase "preview"): moves the published Stories / Providers / Offers
// items into the CanchaStaticPage code component and publishes ONE temporary page, /migration-preview, that renders them all.
// Additive only: no collection, template or existing page is changed. Logs carry counts and checks, never item content.
export const site='https://pioneering-friday-005497.framer.app';
const field=(item,byName,name)=>{const fd=byName[name];return fd?item.fieldData?.[fd.id]?.value:undefined};
const text=v=>typeof v==='string'?v.trim():'';
const imageUrl=v=>typeof v==='string'?v:v?.url||'';
const enumName=(fd,v)=>fd?.cases?.find(c=>c.id===v)?.name??(typeof v==='string'?v:'');
const niceDate=v=>{const t=Date.parse(v);return Number.isFinite(t)?new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(t):''};
// Only fields the retired detail pages displayed. Hidden review fields (consent, internal notes) never leave the CMS.
export function storyItem(item,byName){const g=n=>field(item,byName,n);
 return {kind:'story',path:'/stories/'+item.slug,kicker:enumName(byName.Category,g('Category')),title:text(g('Title')),summary:text(g('Summary')),
  image:imageUrl(g('Image')),imageAlt:text(g('Title')),credit:text(g('Image Credit')),creditLink:text(g('Image Source')),body:text(g('Body')),
  meta:[text(g('Author')),niceDate(g('Published On'))].filter(Boolean),link:text(g('Source Link')),linkLabel:'Read the source →'};}
export function providerItem(item,byName){const g=n=>field(item,byName,n);
 const sections=[['Background','Background'],['Qualifications','Qualifications'],['Services','Services']].map(([h,n])=>({heading:h,html:text(g(n))})).filter(s=>s.html);
 return {kind:'provider',path:'/providers/'+item.slug,kicker:[enumName(byName.Category,g('Category')),enumName(byName.Delivery,g('Delivery'))].filter(Boolean).join(' · '),
  title:text(g('Name')),meta:[text(g('Location')),text(g('Languages')),text(g('Age Groups Served'))&&'Ages: '+text(g('Age Groups Served'))].filter(Boolean),
  summary:text(g('Short Description')),image:imageUrl(g('Image')),imageAlt:text(g('Name')),credentialsReviewed:g('Credentials Reviewed')===true,
  note:'Qualifications below are supplied by the provider. A recorded credential review is separate and is shown only when completed.',
  sections,priceNote:text(g('Price Note')),link:text(g('Booking Link')),linkLabel:'Visit provider website / booking →'};}
export const injectItems=(source,items)=>{if(!/^const items:any\[\]=\[\]$/m.test(source))throw Error('Component data marker missing');return source.replace(/^const items:any\[\]=\[\]$/m,'const items:any[]='+JSON.stringify(items));};
async function collect(f){const out=[],counts={};
 for(const c of await f.getCollections()){if(!['Stories','Providers','Offers'].includes(c.name))continue;
  const fields=await c.getFields(),byName=Object.fromEntries(fields.map(x=>[x.name,x])),items=(await c.getItems()).filter(i=>!i.draft);
  counts[c.name]=items.length;counts[c.name+'Status']=items.map(i=>enumName(byName.Status,field(i,byName,'Status'))).join(',');if(c.name==='Offers'&&items.length)throw Error('Offers exist; extend the migration before continuing');
  for(const it of items)out.push(c.name==='Stories'?storyItem(it,byName):providerItem(it,byName));}
 if(out.some(i=>!i.title))throw Error('An item is missing its title');
 return {items:out,counts};}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const {withProject}=await import('./project-session.mjs'),{verifyReleaseContract}=await import('./discovery-release-contract.mjs');
 await withProject(async f=>{
  await verifyReleaseContract(f);
  const initial=await f.agent.publish({action:'preview'});
  if(initial.status!=='ready'||initial.changes?.length||initial.errors?.length||initial.stagingEnabled)throw Error('Existing pending project changes must be reviewed first');
  const {items,counts}=await collect(f);
  const content=injectItems(await readFile('framer/CanchaStaticPage.tsx','utf8'),items),errors=await f.typecheckCode('CanchaStaticPage.tsx',content);
  if(errors.length)throw Error('Typecheck failed: '+JSON.stringify(errors).slice(0,800));
  let file=(await f.getCodeFiles()).find(x=>x.name==='CanchaStaticPage.tsx');if(file){if(file.content!==content)await file.setFileContent(content)}else file=await f.createCodeFile('CanchaStaticPage.tsx',content);
  let page=(await f.getNodesWithType('WebPageNode')).find(x=>x.path==='/migration-preview');
  if(!page){const r=await f.agent.applyChanges('+WebPageNode migration_page name="Migration preview" path="/migration-preview"',{pagePath:'/'});if(r.errors||r.parseErrors)throw Error(JSON.stringify(r).slice(0,500));
   page=(await f.getNodesWithType('WebPageNode')).find(x=>x.path==='/migration-preview');}
  let snap=await f.agent.serialize({id:page.id,depth:4},{pagePath:'/migration-preview'}),desktop=snap.children?.find(x=>x.name==='Desktop')||snap.children?.[0];
  const commands=[`SET ${page.id} layoutTemplate="ZuWkzhOX9"`];
  if(!desktop){commands.push(`+FrameNode mp_desktop parent="${page.id}" name="Desktop" width="1200px" height="auto" layout="stack" stackDirection="vertical"`);desktop={id:'mp_desktop'};}
  if(!desktop.children?.some(x=>x.name==='Static content'))commands.push(`+ComponentInstanceNode mp_content parent="${desktop.id}" component="codeFile/${file.id}:default" name="Static content" width="1fr" height="auto" $control__mode="all"`);
  let r=await f.agent.applyChanges(commands.join('\n'),{pagePath:'/migration-preview'});if(r.errors||r.parseErrors)throw Error(JSON.stringify(r).slice(0,500));
  snap=await f.agent.serialize({id:page.id,depth:4},{pagePath:'/migration-preview'});desktop=snap.children.find(x=>x.name==='Desktop')||snap.children[0];
  if(!snap.children.some(x=>x.name==='Phone')){r=await f.agent.applyChanges(`CREATE_VARIANT mp_phone from="${desktop.id}"\nSET mp_phone name="Phone" width="390px" left="1800px" top="0px"`,{pagePath:'/migration-preview'});if(r.errors||r.parseErrors)throw Error(JSON.stringify(r).slice(0,500));}
  const preview=await f.agent.publish({action:'preview'});
  if(preview.status!=='ready'||preview.errors?.length||preview.stagingEnabled)throw Error('Publication preview needs review');
  for(const ch of preview.changes||[]){if(ch.type==='CodeFile'&&ch.nodeId===file.id)continue;if(['WebPage','LayoutTemplate'].includes(ch.type)&&ch.nodeId===page.id)continue;throw Error('Unrelated pending change; stopped: '+ch.type+' '+ch.name);}
  const confirm=await f.agent.publish({action:'preview'});if(confirm.confirmationHash!==preview.confirmationHash)throw Error('Project changed after preview');
  const receipt=await f.publish();if(receipt.errors?.length||receipt.status==='failed')throw Error('Publication failed');
  await verifyReleaseContract(f);
  // Server-rendered HTML must already contain every migrated title.
  let html='';for(let n=0;n<10;n++){const res=await fetch(site+'/migration-preview?v='+Date.now(),{signal:AbortSignal.timeout(30000)});html=res.ok?await res.text():'';if(items.every(i=>html.includes(i.title.replace(/&/g,'&amp;'))||html.includes(i.title)))break;await new Promise(s=>setTimeout(s,15000));}
  const rendered=items.filter(i=>html.includes(i.title)||html.includes(i.title.replace(/&/g,'&amp;'))).length;
  console.log(JSON.stringify({phase:'preview',counts,migrated:items.length,renderedOnPreview:rendered,previewUrl:site+'/migration-preview',codeFileId:file.id,pageId:page.id,published:true}));
  if(rendered!==items.length)process.exitCode=1;
 });
}
