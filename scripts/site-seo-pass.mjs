import {withProject} from './project-session.mjs';
import {readReleaseContract,verifyReleaseContract} from './discovery-release-contract.mjs';
// Website SEO pass (Oct 27 audit): page titles/descriptions where pages still used the site default, the opportunity
// template's per-item title/description, and a real H1 on /providers and /offers. Publishes only these page changes.
const site='https://pioneering-friday-005497.framer.app',image='https://framerusercontent.com/images/JUYZ43aps7QlsKNI8oaZmJcMigA.png';
export const META={
 '/about':['About Cancha | Florida Soccer Discovery','Cancha helps players and parents find soccer clubs, camps, tryouts, coaches and places to play in Florida, and introduces the people building the local game.'],
 '/pathways':['Soccer Pathways in Florida | Cancha','Every soccer path looks different. Explore Florida options from recreational play and club teams to camps, training and the next level.'],
 '/training':['Soccer Courses & Training Resources | Cancha','Soccer courses, coaching education and training resources, with official links, formats and costs to check before you sign up.'],
 '/stories':['Soccer Guides & Stories for Florida Families | Cancha','Practical guides for choosing a club, comparing camps and making your next move in soccer, plus stories about the people building the local game.'],
 '/providers':['Soccer Coaches & Services in Florida | Cancha','Find soccer training and services. Check each provider’s experience, prices and availability, or list your services for review.'],
 '/offers':['Local Soccer Offers | Cancha','Offers from local soccer organizations appear here after review, with the merchant’s terms and a clear disclosure.'],
 '/opportunities/:slug':['{{Title}} | Cancha','{{Short Description}}']};
const H1={'/providers':'Coaches & services','/offers':'Soccer offers'};
const q=JSON.stringify,flat=(n,o=[])=>{if(n){o.push(n);for(const c of n.children||[])flat(c,o);}return o;};
await withProject(async f=>{
 await verifyReleaseContract(f);
 const before=await f.agent.publish({action:'preview'});
 if(before.status!=='ready'||before.errors?.length||before.changes?.length||before.stagingEnabled)throw Error('Pending project changes must be reviewed first');
 const pages=await f.getNodesWithType('WebPageNode'),touched=new Set(),done=[];
 for(const [path,[title,description]] of Object.entries(META)){const page=pages.find(p=>p.path===path);if(!page)throw Error('Missing page '+path);touched.add(page.id);
  const pagePath=path==='/opportunities/:slug'?'/opportunities/:Opportunities':path;
  const r=await f.agent.applyChanges(`SET ${page.id} metadata.title=${q(title)} metadata.description=${q(description)} metadata.socialImage=${q(image)}`,{pagePath});
  if(r.errors||r.parseErrors)throw Error(path+': '+JSON.stringify(r).slice(0,400));done.push(path);}
 for(const [path,text] of Object.entries(H1)){const page=pages.find(p=>p.path===path),scene=await f.agent.serialize({id:page.id,depth:8},{pagePath:path});
  const blocks=flat(scene).filter(n=>n.type==='RichTextNode'&&!n.$replicaId&&flat(n).some(t=>t.attributes?.text===text)).map(n=>(n.children||[]).find(c=>c.type==='TextBlock')).filter(Boolean);
  if(!blocks.length)throw Error('Hero title not found on '+path);
  for(const b of blocks){const r=await f.agent.applyChanges(`SET ${b.id} tag="h1"`,{pagePath:path});if(r.errors||r.parseErrors)throw Error(path+' h1: '+JSON.stringify(r).slice(0,400));}
  done.push(path+' h1 x'+blocks.length);}
 const pending=await f.agent.publish({action:'preview'});
 if(pending.status!=='ready'||pending.errors?.length||pending.stagingEnabled)throw Error('Publication preview needs review');
 const foreign=(pending.changes||[]).filter(ch=>!(['WebPage','LayoutTemplate'].includes(ch.type)&&touched.has(ch.nodeId)));
 if(foreign.length)throw Error('Unrelated pending changes: '+foreign.map(c=>c.type+' '+c.name).join(', '));
 const confirm=await f.agent.publish({action:'preview'});if(confirm.confirmationHash!==pending.confirmationHash)throw Error('Project changed after preview');
 const receipt=await f.publish();if(receipt.errors?.length||receipt.status==='failed')throw Error('Publication failed');
 await new Promise(s=>setTimeout(s,45000));
 const checks=[];for(const path of [...Object.keys(META).filter(p=>!p.includes(':')),'/opportunities/hollywood-fc-2026-27-supplemental-competitive-tryouts']){
  const html=await (await fetch(site+path+'?v='+Date.now())).text(),title=(html.match(/<title>([^<]*)<\/title>/)||[])[1]||'',h1=/<h1[\s>]/.test(html);checks.push({path,title:title.slice(0,70),h1});}
 console.log(JSON.stringify({published:true,done,checks}));
 console.log('ACTUAL_CONTRACT '+JSON.stringify(await readReleaseContract(f)));
});
