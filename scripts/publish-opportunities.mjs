import {withProject} from './project-session.mjs';import {checkAutomaticPublication} from '../server/framer-publication-policy.mjs';import {writeFile,mkdir} from 'node:fs/promises';
const reviewedPages=process.argv.includes('--include-reviewed-forms')?['/organizations','/providers','/offers']:[];
await withProject(async f=>{
 const collection=(await f.getCollections()).find(c=>c.name==='Opportunities');if(!collection)throw Error('Opportunity collection missing');
 const preview=await f.agent.publish({action:'preview'}),hasChanges=checkAutomaticPublication(preview,{collectionId:collection.id,itemSlugs:(await collection.getItems()).map(item=>item.slug),reviewedPages});
 const before=await f.getPublishInfo();let result={published:false,noChanges:!hasChanges};
 if(hasChanges||process.argv.includes('--cms-updates')){
  const receipt=hasChanges?await f.agent.publish({action:'confirm_publish',confirmationHash:preview.confirmationHash}):await f.publish();if(receipt.errors?.length||['failed','blocked'].includes(receipt.status))throw Error('Framer publication rejected');
  let info;for(let i=0;i<20;i++){info=await f.getPublishInfo();if(info.production?.deploymentTime> (before.production?.deploymentTime||0))break;await new Promise(resolve=>setTimeout(resolve,2000));}
  if(!info?.production?.url||new URL(info.production.url).hostname!=='pioneering-friday-005497.framer.app'||!(info.production.deploymentTime>(before.production?.deploymentTime||0)))throw Error('Production publication receipt not confirmed');
  result={published:true,url:info.production.url,deploymentTime:info.production.deploymentTime,changes:preview.changes};
 }
 await mkdir('private-data',{recursive:true,mode:0o700});await writeFile('private-data/framer-publication.json',JSON.stringify(result,null,2),{mode:0o600});console.log(JSON.stringify(result));
});
