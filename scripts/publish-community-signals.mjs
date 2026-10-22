import{withProject}from'./project-session.mjs';
import{readFile,writeFile}from'node:fs/promises';
import{readReleaseContract}from'./discovery-release-contract.mjs';
import{contentDigest,validateReleaseContract}from'../server/discovery-release-contract.mjs';
import{confirmLocalStorySource,localStoryDescriptor,localStoryHash}from'../server/local-story-source.mjs';
import{sourceSession}from'./source-session.mjs';
const dir='backups/community-signal-2026-10-22',expected=JSON.parse(await readFile(dir+'/release-contract.json')),backup=JSON.parse(await readFile(dir+'/code-files.json')),content=await readFile('framer/CanchaHome.tsx','utf8');
const source=localStoryDescriptor('rowdies-shield-20261018'),s=sourceSession();try{if(!await confirmLocalStorySource({editorialSourceId:source.id,sourceHash:localStoryHash(source),officialSourceUrl:source.documents[0].url},{fetchImpl:async u=>new Response(await s.html(u),{headers:{'content-type':'text/html'}})}))throw Error('Homepage event source changed')}finally{await s.close()}
await withProject(async f=>{
 const files=await f.getCodeFiles();for(const old of backup){const file=files.find(x=>x.id===old.id);if(!file||file.name!==old.name||file.content!==old.content)throw Error('Code changed after backup: '+old.name)}
 validateReleaseContract(await readReleaseContract(f),expected);
 for(const c of await f.getCollections()){const old=JSON.parse(await readFile(dir+'/collection-'+c.id+'.json'));if(JSON.stringify(old.fields)!==JSON.stringify(await c.getFields())||JSON.stringify(old.items)!==JSON.stringify(await c.getItems()))throw Error('CMS changed after backup: '+c.name)}
 const session='cancha-community-signals-'+Date.now();await f.typecheckCode('Bootstrap.tsx','import*as React from"react";import{addPropertyControls,ControlType}from"framer";export default function Bootstrap(){return <div/>}',undefined,session);
 for(const file of files)await f.typecheckCode(file.name,file.content,undefined,session);
 const errors=await f.typecheckCode('CanchaHome.tsx',content,undefined,session);if(errors.length)throw Error('Homepage typecheck: '+JSON.stringify(errors));
 const home=files.find(x=>x.name==='CanchaHome.tsx');await home.setFileContent(content);
 const actual=await readReleaseContract(f),reviewed={...expected,codeFiles:{...expected.codeFiles,'CanchaHome.tsx':contentDigest(content)}};validateReleaseContract(actual,reviewed);
 const preview=await f.agent.publish({action:'preview'});await writeFile(dir+'/publish-reviewed.json',JSON.stringify(preview,null,2));if(preview.status!=='ready'||preview.errors?.length||preview.warnings?.length||preview.stagingEnabled)throw Error('Publication preview needs review');
 for(const change of preview.changes||[]){if(change.type==='CodeFile'&&change.nodeId===home.id&&change.status==='updated')continue;if(change.type==='WebPage'&&change.nodeId==='augiA20Il'&&change.status==='updated')continue;if(change.type==='LayoutTemplate'&&change.nodeId==='ZuWkzhOX9'&&change.status==='updated')continue;throw Error('Unexpected pending change: '+JSON.stringify(change))}
 const confirm=await f.agent.publish({action:'preview'});if(confirm.confirmationHash!==preview.confirmationHash)throw Error('Project changed after preview');
 const receipt=await f.publish();if(receipt.errors?.length||receipt.status==='failed')throw Error('Publication failed');
 const after=await f.agent.publish({action:'preview'});if(after.changes?.length)throw Error('Pending changes remain after publication');
 await writeFile('config/discovery-release-contract.json',JSON.stringify(await readReleaseContract(f),null,2)+'\n');
 await writeFile('private-data/motion-2026-10-22/home-publication.json',JSON.stringify({receipt,changes:preview.changes,backup:dir,publishedAt:new Date().toISOString(),typechecked:true,remainingChanges:0},null,2));
 console.log(JSON.stringify({published:true,receipt,changes:preview.changes,remainingChanges:0}));
});
