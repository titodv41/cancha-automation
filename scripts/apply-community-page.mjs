import {withProject} from './project-session.mjs';
import {readFile, writeFile} from 'node:fs/promises';
import {sceneDigest} from '../server/discovery-release-contract.mjs';
const backup=process.argv[2];
if(!backup?.startsWith('backups/'))throw Error('Pass a fresh private project backup');
const id='OogsDn6ap',path='/stories',desktop='HUtdBOseB',phone='FKfDOWjMd',hero='WytfybKLB';
await withProject(async f=>{
 const before=await f.agent.serialize({id,depth:25},{pagePath:path}),baseline=JSON.parse(await readFile(backup+'/scene-'+id+'.json'));
 if(sceneDigest(before)!==sceneDigest(baseline))throw Error('Community page changed since backup');
 const record=JSON.parse(await readFile('private-data/secondary-page-scenes.json'));
 if(record.pages[id]?.after!==sceneDigest(before))throw Error('Previous native page review does not match');
 const file=(await f.getCodeFiles()).find(x=>x.name==='CanchaCommunity.tsx');if(!file)throw Error('Typecheck and apply the community code first');
 if(before.children.some(x=>x.children?.some(y=>y.name==='Cancha community directory')))throw Error('Community directory already exists; review instead of duplicating');
 const commands=[`SET ${hero} visible="false"; SET ${phone}${hero} visible="false";`, `+ComponentInstanceNode community_directory parent="${desktop}" component="codeFile/${file.id}:default" name="Cancha community directory" width="1fr" height="auto";`, `MOVE community_directory parent="${desktop}" index="0";`];
 const r=await f.agent.applyChanges(commands.join('\n'),{pagePath:path});if(r.parseErrors?.length||r.errors&&Object.keys(r.errors).length)throw Error(JSON.stringify(r));
 let after=await f.agent.serialize({id,depth:25},{pagePath:path});
 // Framer can recalculate unrelated auto heights when inserting a component. Restore those exactly.
 const flatten=s=>{const out=new Map();const visit=n=>{out.set(n.id,n);for(const c of n.children||[])visit(c)};visit(s);return out},oldNodes=flatten(before),newNodes=flatten(after),restore=[];
 for(const[nodeId,node]of oldNodes)if(node.attributes?.height==='auto'&&newNodes.get(nodeId)?.attributes?.height==='1fr')restore.push(`SET ${nodeId} height="auto";`);
 if(restore.length){const fixed=await f.agent.applyChanges(restore.join('\n'),{pagePath:path});if(fixed.parseErrors?.length||fixed.errors&&Object.keys(fixed.errors).length)throw Error('Unexpected height restoration failure');after=await f.agent.serialize({id,depth:25},{pagePath:path})}
 for(const breakpoint of after.children){if(!breakpoint.children?.some(x=>x.component===`codeFile/${file.id}:default`))throw Error('Community component missing on '+breakpoint.name)}
 const normalize=s=>{s=structuredClone(s);for(const bp of s.children){bp.children=bp.children.filter(x=>x.component!==`codeFile/${file.id}:default`);const node=bp.children.find(x=>x.id===hero||x.id===phone+hero);delete node.attributes.visible}return s};
 if(sceneDigest(normalize(after))!==sceneDigest(normalize(before)))throw Error('Unexpected change to guides, bindings or original content');
 const filename='community-page-after-'+id+'.json';await writeFile(record.backup+'/'+filename,JSON.stringify(after),{mode:0o600});record.pages[id]={...record.pages[id],after:sceneDigest(after),file:filename};
 await writeFile('private-data/secondary-page-scenes.json',JSON.stringify(record,null,2),{mode:0o600});await writeFile(backup+'/community-page-after.json',JSON.stringify(after),{mode:0o600});
 console.log(JSON.stringify({path,component:true,desktopAndPhone:true,nativeGuidesPreserved:true,cmsChanges:0,published:false}));
});
