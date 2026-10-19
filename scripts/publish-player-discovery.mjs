import{withProject}from'./project-session.mjs';import{readFile,writeFile}from'node:fs/promises';import{verifyReleaseContract}from'./discovery-release-contract.mjs';import{syncDiscoveryCatalog}from'./sync-discovery-catalog.mjs';
const dir=process.argv[2];if(!dir?.startsWith('backups/'))throw Error('Pass the reviewed baseline backup directory');
await withProject(async f=>{
 await verifyReleaseContract(f);const{content:data}=await syncDiscoveryCatalog(f),files=await f.getCodeFiles(),names=['CanchaUI','DiscoveryModel','DiscoveryCityMap','CanchaPlayerFit','CanchaNavigation','CanchaFooter','CanchaHome','CanchaDiscovery','OpportunityStatus'];
 for(const name of names)if(files.find(x=>x.name===name+'.tsx')?.content!==await readFile('framer/'+name+'.tsx','utf8'))throw Error('Reviewed code differs from checkout: '+name);
 if(files.find(x=>x.name==='CanchaDiscoveryData.tsx')?.content!==data)throw Error('Public catalog is not current');
 for(const c of await f.getCollections()){const before=JSON.parse(await readFile(`${dir}/collection-${c.id}.json`));if(JSON.stringify(before.fields)!==JSON.stringify(await c.getFields())||JSON.stringify(before.items)!==JSON.stringify(await c.getItems()))throw Error('CMS changed since the reviewed baseline: '+c.name)}
 const preview=await f.agent.publish({action:'preview'}),pages=new Set(['augiA20Il','YoXnHiVO7','U3ge4GVfE','byKUK4ekK','IeTr8B53a']),allowedFiles=new Set(files.filter(x=>names.map(n=>n+'.tsx').includes(x.name)||x.name==='CanchaDiscoveryData.tsx').map(x=>x.id));
 if(preview.status!=='ready'||preview.errors?.length||preview.warnings?.length||preview.stagingEnabled)throw Error('Publication preview needs review');
 for(const change of preview.changes||[]){if(change.type==='WebPage'&&change.status==='updated'&&pages.has(change.nodeId))continue;if(change.type==='CodeFile'&&['created','updated'].includes(change.status)&&allowedFiles.has(change.nodeId))continue;throw Error('Unexpected pending change: '+JSON.stringify(change))}
 const confirm=await f.agent.publish({action:'preview'});if(confirm.confirmationHash!==preview.confirmationHash)throw Error('Project changed after preview');
 const receipt=await f.publish();if(receipt.errors?.length||receipt.status==='failed')throw Error('Publication failed');
 const after=await f.agent.publish({action:'preview'});await writeFile('private-data/player-fit-publication.json',JSON.stringify({publishedAt:new Date().toISOString(),backup:dir,receipt,changes:preview.changes,remainingChanges:after.changes},null,2),{mode:0o600});if(after.changes?.length)throw Error('Publication receipt returned but changes remain pending');console.log(JSON.stringify({published:true,receipt,changes:preview.changes,pendingChanges:0}));
});
