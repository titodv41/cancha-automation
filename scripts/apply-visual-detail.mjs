import{withProject}from'./project-session.mjs';import{readFile,writeFile}from'node:fs/promises';import{sceneDigest}from'../server/discovery-release-contract.mjs';
const dir=process.argv[2];if(!dir?.startsWith('backups/'))throw Error('Pass the initial private backup');const q=x=>JSON.stringify(String(x));
export async function applyVisualDetails(f){
 const file=(await f.getCodeFiles()).find(x=>x.name==='CanchaDetail.tsx');if(!file)throw Error('Upload and typecheck CanchaDetail first');const result={backup:dir,pages:{},published:false};
 for(const config of[{id:'nYqllTBEd',path:'/clubs/:Clubs',collection:'Clubs',entity:'profile',old:'MtMfDvebo',desktop:'UULg1Oxnt',phone:'oOkdAZ25T'},{id:'IeTr8B53a',path:'/opportunities/:Opportunities',collection:'Opportunities',entity:'opportunity',old:'guhekX388',desktop:'f0ZPcz37r',phone:'EYgoXK9eE'}]){
  const baseline=JSON.parse(await readFile(dir+'/scene-'+config.id+'.json')),before=await f.agent.serialize({id:config.id,depth:25},{pagePath:config.path});if(sceneDigest(before)!==sceneDigest(baseline))throw Error('Detail canvas changed since backup: '+config.path);
  const c=(await f.getCollections()).find(x=>x.name===config.collection),scope=await f.agent.serialize({id:c.id,depth:1},{pagePath:'/'}),slug=scope.variables.find(x=>x.name==='Slug')?.id;if(!slug)throw Error('System Slug binding unavailable');
  const local='visual_detail_'+config.entity,commands=[`SET ${config.old} visible="false"; SET ${config.phone}${config.old} visible="false";`,`+ComponentInstanceNode ${local} parent=${q(config.desktop)} component="codeFile/${file.id}:default" name="Cancha ${config.entity} — essential details" width="1fr" height="auto" $control__slug=${q('var(--variable-'+slug+')')} $control__entity=${q(config.entity)};`,`MOVE ${local} parent=${q(config.desktop)} index="0";`];
  const r=await f.agent.applyChanges(commands.join('\n'),{pagePath:config.path});if(r.parseErrors?.length||r.errors&&Object.keys(r.errors).length)throw Error(JSON.stringify(r));
  const after=await f.agent.serialize({id:config.id,depth:25},{pagePath:config.path});const newId=r.renamedIds?.[local]||local;const mobile=after.children.find(x=>x.id===config.phone);if(!mobile.children.some(x=>x.component===`codeFile/${file.id}:default`))throw Error('Phone did not inherit the new detail component');
  await writeFile(`${dir}/detail-after-${config.id}.json`,JSON.stringify(after),{mode:0o600});result.pages[config.id]={path:config.path,before:sceneDigest(before),after:sceneDigest(after),oldContent:config.old,component:newId,systemSlug:slug};
 }
 await writeFile('private-data/visual-detail-scenes.json',JSON.stringify(result,null,2),{mode:0o600});console.log(JSON.stringify(result));
}
if(process.argv[1]?.endsWith('/apply-visual-detail.mjs'))await withProject(applyVisualDetails);
