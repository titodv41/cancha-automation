import {withProject} from './project-session.mjs';
// Read-only: lists nodes on every page that point at the retiring Stories / Providers / Offers collections or their
// detail routes (links, collection lists, collection variables). Prints ids, node types and attribute names only.
const ids=new Set(['MwkpMpoJa','nf3sLZuZf','wK2Lb_zTI']),routes=/\/(stories|providers|offers)\/:/;
await withProject(async f=>{
 const pages=await f.getNodesWithType('WebPageNode');
 for(const p of pages){if(!p.path||p.path.includes(':'))continue;let scene;try{scene=await f.agent.serialize({id:p.id,depth:30},{pagePath:p.path});}catch(e){console.log(p.path+' ERROR '+String(e.message).slice(0,120));continue;}
  const hits=[];const walk=(n,trail)=>{if(!n)return;const a=n.attributes||{};
   for(const [k,v] of Object.entries(a)){const s=typeof v==='string'?v:JSON.stringify(v);if(routes.test(s)||[...ids].some(id=>s.includes(id)))hits.push(`${n.type} ${n.id} "${(n.name||'').slice(0,40)}" ${k} ${routes.test(s)?'route':'collection'}${n.$replicaId?' replica':''} in ${trail}`);}
   for(const c of n.children||[])walk(c,n.name||trail);};
  walk(scene,p.path);console.log(`${p.path} ${hits.length}`+(hits.length?'\n  '+hits.slice(0,20).join('\n  '):''));}
 console.log('COLLECTIONS '+(await f.getCollections()).map(c=>c.name+':'+c.id).join(', '));
 const pending=await f.agent.publish({action:'preview'});console.log('PENDING '+(pending.changes||[]).map(c=>c.type+':'+c.status+':'+c.nodeId).join(' '));
});
