import{readFile,writeFile,mkdir}from'node:fs/promises';import{sendPrivate}from'./automation-service-client.mjs';
export async function repairReviewedClubMedia(f,{durable=false}={}){
 const exclusions=JSON.parse(await readFile('config/club-media-exclusions.json')),c=(await f.getCollections()).find(x=>x.name==='Clubs');if(!c)return 0;const fields=await c.getFields(),image=fields.find(x=>x.name==='Image'),before=await c.getItems();
 const rows=before.filter(x=>exclusions.some(e=>e.slug===x.slug&&e.assetUrl===x.fieldData[image.id]?.value?.url));if(!rows.length)return 0;
 const snapshot={projectId:'GU8EIeQXaRbty0S23thu',collectionName:'Clubs',capturedAt:new Date().toISOString(),fields,items:before},dir='backups/club-media-'+Date.now();await mkdir(dir,{recursive:true,mode:0o700});await writeFile(dir+'/clubs.json',JSON.stringify(snapshot),{mode:0o600});if(durable)await sendPrivate('/automation/opportunity-backup',snapshot);
 if(JSON.stringify(await c.getItems())!==JSON.stringify(before))throw Error('Clubs changed before reviewed media correction');await c.addItems(rows.map(x=>({id:x.id,slug:x.slug,fieldData:{[image.id]:{type:'image'}}})));
 const after=await c.getItems();for(const old of before){const row=after.find(x=>x.id===old.id);if(!row||row.slug!==old.slug||row.draft!==old.draft)throw Error('Media correction changed identity');for(const[k,v]of Object.entries(old.fieldData))if(k!==image.id&&JSON.stringify(row.fieldData[k])!==JSON.stringify(v))throw Error('Media correction changed listing facts');if(rows.some(x=>x.id===old.id)&&row.fieldData[image.id]?.value)throw Error('Reviewed incorrect image was not cleared')}
 return rows.length;
}
