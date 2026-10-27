import{readFile}from'node:fs/promises';import{readReleaseContract}from'./discovery-release-contract.mjs';import{withProject}from'./project-session.mjs';
// Read-only: lists which reviewed website parts (code files, page scenes, shared text styles) no longer match
// config/discovery-release-contract.json and prints changed text styles (fonts and sizes are public design data).
const expected=JSON.parse(await readFile('config/discovery-release-contract.json','utf8'));
await withProject(async f=>{
 const actual=await readReleaseContract(f),changed=kind=>Object.keys(expected[kind]||{}).filter(id=>actual[kind]?.[id]!==expected[kind][id]),added=kind=>Object.keys(actual[kind]||{}).filter(id=>!(id in (expected[kind]||{})));
 const report={codeFiles:changed('codeFiles'),scenes:changed('scenes'),textStyles:changed('textStyles'),newTextStyles:added('textStyles')};
 console.log(JSON.stringify(report,null,1));
 // The current contract in the config file's format, for re-recording after review (hashes only).
 console.log('ACTUAL_CONTRACT '+JSON.stringify(actual));
 const ids=new Set([...report.textStyles,...report.newTextStyles]);
 // What the editor holds that is not live yet, and when the site was last published.
 const info=await f.getPublishInfo(),when=p=>p?new Date(p.deploymentTime).toISOString():null;
 console.log(JSON.stringify({lastProductionPublish:when(info.production),lastStagingPublish:when(info.staging),unpublishedPageChanges:(await f.getUnpublishedPageChanges()).map(c=>({path:c.path,status:c.status}))},null,1));
 for(const style of await f.getTextStyles())if(ids.has(style.id))console.log('Current text style '+style.id+':\n'+JSON.stringify(JSON.parse(JSON.stringify(style)),null,1));
});
