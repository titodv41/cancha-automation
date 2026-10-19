import{withProject}from'./project-session.mjs';import{readFile,writeFile,mkdir}from'node:fs/promises';import{syncDiscoveryCatalog}from'./sync-discovery-catalog.mjs';
const q=x=>JSON.stringify(String(x));const check=r=>{if(r.errors&&Object.keys(r.errors).length||r.parseErrors?.length)throw Error(JSON.stringify(r));return r};
await withProject(async f=>{
 const dir='backups/launch-2026-10-19';await mkdir(dir,{recursive:true,mode:0o700});
 const{result,content:dataContent}=await syncDiscoveryCatalog(f,{apply:true});const files={},session='cancha-launch-20261019-v2';await f.typecheckCode('Bootstrap.tsx','import * as React from "react";import {addPropertyControls,ControlType} from "framer";export default function Bootstrap(){return <div/>}',undefined,session);await f.typecheckCode('CanchaDiscoveryData.tsx',dataContent,undefined,session);
 for(const name of ['CanchaUI','DiscoveryModel','DiscoveryCityMap','CanchaNavigation','CanchaFooter','CanchaHome','CanchaDiscovery']){const content=await readFile(`framer/${name}.tsx`,'utf8'),errors=await f.typecheckCode(name+'.tsx',content,undefined,session);if(errors.length)throw Error(name+' '+JSON.stringify(errors));let file=(await f.getCodeFiles()).find(x=>x.name===name+'.tsx');if(file){if(file.content!==content)await file.setFileContent(content)}else file=await f.createCodeFile(name+'.tsx',content);files[name]=file.id;console.log(name,'checked and saved')}
 const targets=[['ZuWkzhOX9','/','shell'],['augiA20Il','/','home'],['YoXnHiVO7','/clubs','clubs'],['U3ge4GVfE','/explore','opportunities'],['byKUK4ekK','/careers','careers']];
 for(const[id,path,section]of targets){let scene=await f.agent.serialize({id,depth:2},{pagePath:path});await writeFile(`${dir}/pre-replace-${id}.json`,JSON.stringify(scene,null,2),{mode:0o600});let main=scene.children.find(x=>x.name==='Desktop');if(!main)throw Error('Missing desktop');let commands=[];
  if(section==='shell'){
   const nav=main.children.find(x=>x.name==='Navigation'),footer=main.children.find(x=>x.name==='Footer');if(nav)commands.push(`SET ${nav.id} visible="false";`);if(footer)commands.push(`SET ${footer.id} visible="false";`);
   if(!main.children.some(x=>x.name==='Cancha simple navigation'))commands.push(`+ComponentInstanceNode launch_navigation parent=${q(main.id)} name="Cancha simple navigation" component="codeFile/${files.CanchaNavigation}:default" width="1fr" height="auto"; MOVE launch_navigation parent=${q(main.id)} index="0"; +ComponentInstanceNode launch_footer parent=${q(main.id)} name="Cancha simple footer" component="codeFile/${files.CanchaFooter}:default" width="1fr" height="auto";`);
  }else{
   const old=main.children.filter(x=>x.name!=='Cancha launch discovery');for(const n of old)commands.push(`SET ${n.id} visible="false";`);
   if(!main.children.some(x=>x.name==='Cancha launch discovery'))commands.push(`+ComponentInstanceNode launch_${section} parent=${q(main.id)} name="Cancha launch discovery" component="codeFile/${files[section==='home'?'CanchaHome':'CanchaDiscovery']}:default" width="1fr" height="auto" ${section==='home'?'':`$control__section=${q(section)}`} ; MOVE launch_${section} parent=${q(main.id)} index="0";`);
  }
  if(commands.length)check(await f.agent.applyChanges(commands.join('\n'),{pagePath:path}));
  scene=await f.agent.serialize({id,depth:2},{pagePath:path});main=scene.children.find(x=>x.name==='Desktop');commands=[];
  for(const variant of scene.children.filter(x=>x.id!==main.id)){
   for(const n of main.children){if(['PlaceholderNode','SlotNode'].includes(n.type))continue;const candidate=variant.children?.find(x=>x.id===variant.id+n.id)||variant.children?.find(x=>x.name===n.name);if(!candidate)continue;commands.push(`SET ${candidate.id} visible=${q(n.name==='Cancha launch discovery'||n.name==='Cancha simple navigation'||n.name==='Cancha simple footer'?'true':'false')};`)}
  }
  if(commands.length)check(await f.agent.applyChanges(commands.join('\n'),{pagePath:path}));
  console.log(section,'canvas connected')
 }
 await writeFile('private-data/launch-build.json',JSON.stringify({result,files,published:false},null,2),{mode:0o600});console.log('Launch components connected; no publication requested.');
});
