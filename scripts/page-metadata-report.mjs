import {withProject} from './project-session.mjs';
// Read-only: each page's metadata attributes (title, description, image), so pages with the generic site title can be fixed.
await withProject(async f=>{
 for(const p of await f.getNodesWithType('WebPageNode')){let scene;const path=p.path?.replace(/:slug$/,':'+((await f.getCollections()).find(c=>c.id===p.collectionId)?.name||'slug'));
  try{scene=await f.agent.serialize({id:p.id,depth:0},{pagePath:path});}catch(e){console.log(p.path+' ERROR '+String(e.message).slice(0,100));continue;}
  const a=scene.attributes||{},meta=Object.fromEntries(Object.entries(a).filter(([k])=>/meta|title|description|seo|og|image|noindex|search/i.test(k)));
  console.log(p.path+' '+JSON.stringify(meta).slice(0,600));}
 const root=await f.agent.serialize({id:'root',depth:0}).catch(()=>null);if(root)console.log('ROOT '+JSON.stringify(Object.fromEntries(Object.entries(root.attributes||{}).filter(([k])=>/meta/i.test(k)))).slice(0,500));
});
