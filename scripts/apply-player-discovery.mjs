import{createHash}from'node:crypto';
import{withProject}from'./project-session.mjs';import{readFile,writeFile}from'node:fs/promises';import{syncDiscoveryCatalog}from'./sync-discovery-catalog.mjs';
const dir=process.argv[2];if(!dir?.startsWith('backups/'))throw Error('Pass an existing private project backup directory');
const names=['CanchaUI','DiscoveryModel','DiscoveryCityMap','CanchaPlayerFit','CanchaNavigation','CanchaFooter','CanchaHome','CanchaDiscovery','OpportunityStatus','TrainingDirectory','OpportunityImage','ClubProfileVisual','CanchaDetail'];
await withProject(async f=>{
 const prior=JSON.parse(await readFile('private-data/player-fit-build.json').catch(()=>'{"manifest":{}}')),digest=x=>createHash('sha256').update(x).digest('hex');
 const before=JSON.parse(await readFile(dir+'/code-files.json')),current=await f.getCodeFiles(),sources=new Map(await Promise.all(names.map(async n=>[n+'.tsx',await readFile('framer/'+n+'.tsx','utf8')])));
 for(const[name,content]of sources){const file=current.find(x=>x.name===name),old=before.find(x=>x.name===name);if(file&&file.content!==content&&(!old||old.content!==file.content)&&(prior.backup!==dir||prior.manifest?.[name]!==digest(file.content)))throw Error('Code changed since backup: '+name)}
 const{content:data}=await syncDiscoveryCatalog(f),session='cancha-player-fit-'+Date.now();
 let errors=await f.typecheckCode('Bootstrap.tsx','import * as React from "react";import {addPropertyControls,ControlType} from "framer";export default function Bootstrap(){return <div/>}',undefined,session);if(errors.length)throw Error(JSON.stringify(errors));
 errors=await f.typecheckCode('CanchaDiscoveryData.tsx',data,undefined,session);if(errors.length)throw Error(JSON.stringify(errors));
 for(const[name,content]of sources){errors=await f.typecheckCode(name,content,undefined,session);if(errors.length)throw Error(name+' '+JSON.stringify(errors));console.log(name,'typecheck passed')}
 await syncDiscoveryCatalog(f,{apply:true});const applied=[];
 for(const[name,content]of sources){const file=current.find(x=>x.name===name);if(file?.content===content)continue;if(file)await file.setFileContent(content);else await f.createCodeFile(name,content);applied.push(name)}
 await writeFile('private-data/player-fit-build.json',JSON.stringify({at:new Date().toISOString(),backup:dir,applied,manifest:Object.fromEntries([...sources].map(([name,content])=>[name,digest(content)])),published:false},null,2),{mode:0o600});console.log(JSON.stringify({applied,published:false}));
});
