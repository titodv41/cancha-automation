import {withProject} from './project-session.mjs';
// Read-only outline for steps 2-4 of docs/cms-consolidation-plan-2026-10-25.md: pages, collection fields,
// retiring items (public page content only), how listing/template pages are built, and redirect support.
const retiring=['Providers','Stories','Offers'];
const outline=(n,depth=0,out=[])=>{if(!n||depth>12)return out;const a=n.attributes||{};
 const bits=[n.type||n.__class||'?',a.name||n.name||'',a.componentIdentifier||a.url||a.codeFileId||'',
  Object.keys(a).filter(k=>k.startsWith('$control__')||k==='text'||k==='link').map(k=>k+'='+JSON.stringify(a[k]).slice(0,90)).join(' ')].filter(Boolean).join(' | ');
 out.push('  '.repeat(depth)+bits.slice(0,400));for(const c of n.children||[])outline(c,depth+1,out);return out;};
await withProject(async f=>{
 const pages=await f.getNodesWithType('WebPageNode');
 console.log('PAGES '+pages.length+'\n'+pages.map(p=>p.id+' '+p.path).sort((a,b)=>a.split(' ')[1].localeCompare(b.split(' ')[1])).join('\n'));
 for(const c of await f.getCollections()){const fields=await c.getFields(),items=await c.getItems();
  console.log(`\nCOLLECTION ${c.name} (${c.id}) items=${items.length} fields=${fields.map(x=>x.name+':'+x.type).join(', ')}`);
  if(retiring.includes(c.name))for(const it of items)console.log('  item '+it.slug+' draft='+!!it.draft+' fields='+Object.keys(it.fieldData||{}).length);}
 for(const name of retiring){for(const path of [`/${name.toLowerCase()}`,`/${name.toLowerCase()}/:${name}`]){
  const page=pages.find(p=>p.path===path.replace(`:${name}`,':slug'));if(!page){console.log('\nNO PAGE '+path);continue;}
  try{const scene=await f.agent.serialize({id:page.id,depth:25},{pagePath:path});console.log(`\nSCENE ${path}\n`+outline(scene).join('\n'));}
  catch(e){console.log(`\nSCENE ${path} ERROR ${String(e.message).slice(0,200)}`);}}}
 try{const r=await f.getRedirects();console.log('\nREDIRECTS '+r.length+' '+JSON.stringify(r).slice(0,500));}catch(e){console.log('\nREDIRECTS ERROR '+String(e.message).slice(0,300));}
 try{const info=await f.getProjectInfo();console.log('\nPROJECT '+JSON.stringify(info).slice(0,300));}catch(e){console.log('PROJECT ERROR '+e.message);}
});
