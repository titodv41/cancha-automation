import{withProject}from'./project-session.mjs';
import{mkdir,writeFile}from'node:fs/promises';
const dir=`backups/launch-${new Date().toISOString().slice(0,10)}`;await mkdir(dir,{recursive:true,mode:0o700});
await withProject(async f=>{
 const pages=await f.getNodesWithType('WebPageNode');
 await writeFile(`${dir}/pages.json`,JSON.stringify(pages,null,2),{mode:0o600});
 const summary={backup:dir,collections:{},pages:pages.map(p=>({id:p.id,path:p.path})),publishInfo:await f.getPublishInfo(),pending:await f.agent.publish({action:'preview'})};
 for(const c of await f.getCollections()){const fields=await c.getFields(),items=await c.getItems();await writeFile(`${dir}/collection-${c.id}.json`,JSON.stringify({name:c.name,id:c.id,fields,items},null,2),{mode:0o600});summary.collections[c.name]={id:c.id,count:items.length};}
 for(const [id,path]of[['augiA20Il','/'],['ZuWkzhOX9','/'],['YoXnHiVO7','/clubs'],['U3ge4GVfE','/explore'],['nYqllTBEd','/clubs/:Clubs'],['npRy9P91I','/organizations']]){const scene=await f.agent.serialize({id,depth:25},{pagePath:path});await writeFile(`${dir}/scene-${id}.json`,JSON.stringify(scene,null,2),{mode:0o600});}
 for(const file of await f.getCodeFiles())await writeFile(`${dir}/code-${file.name}`,file.content,{mode:0o600});
 await mkdir('private-data',{recursive:true,mode:0o700});await writeFile('private-data/launch-baseline.json',JSON.stringify(summary,null,2),{mode:0o600});console.log(JSON.stringify(summary));
});
