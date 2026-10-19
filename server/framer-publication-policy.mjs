export function checkAutomaticPublication(preview,{collectionId,itemSlugs=[],reviewedPages=[],additionalCollections=[],verifiedDerivedPages=[],verifiedDataFileId=null}={}){
 if(preview.status!=='ready'||preview.errors?.length)throw Error('Framer publication is not ready');
 if(preview.stagingEnabled||preview.publishTarget!=='production')throw Error('Automatic publication requires the production target');
 for(const change of preview.changes||[]){
  if(change.type==='WebPage'&&change.status==='updated'&&verifiedDerivedPages.some(p=>p.id===change.nodeId&&p.name===change.name))continue;
  if(change.type==='CodeFile'&&change.status==='updated'&&change.nodeId===verifiedDataFileId&&change.name==='CanchaDiscoveryData.tsx')continue;
  if(change.type==='WebPage'&&reviewedPages.includes(change.name)&&change.status==='updated')continue;
  if(change.type==='CollectionItem'&&['updated','added'].includes(change.status)&&itemSlugs.some(slug=>change.name==='opportunities/'+slug))continue;
  if(change.type==='CollectionItem'&&['updated','added'].includes(change.status)&&additionalCollections.some(c=>(change.status==='updated'||c.allowAdded===true)&&c.slugs.some(slug=>change.name===c.path+'/'+slug)))continue;
  if(['Collection','CMSCollection'].includes(change.type)&&(change.nodeId===collectionId||additionalCollections.some(c=>c.allowAdded===true&&c.id===change.nodeId))&&change.status==='updated')continue;
  throw Error('Unrelated or unsupported Framer changes require review: '+change.type+' '+change.name);
 }
 if((preview.changes||[]).length&&!preview.confirmationHash)throw Error('Framer publication confirmation missing');
 return (preview.changes||[]).length>0;
}
