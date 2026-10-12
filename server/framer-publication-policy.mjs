export function checkAutomaticPublication(preview,{collectionId,reviewedPages=[]}={}){
 if(preview.status!=='ready'||preview.errors?.length)throw Error('Framer publication is not ready');
 if(preview.stagingEnabled||preview.publishTarget!=='production')throw Error('Automatic publication requires the production target');
 for(const change of preview.changes||[]){
  if(change.type==='WebPage'&&reviewedPages.includes(change.name)&&change.status==='updated')continue;
  if(['Collection','CMSCollection'].includes(change.type)&&change.nodeId===collectionId&&change.status==='updated')continue;
  throw Error('Unrelated or unsupported Framer changes require review: '+change.type+' '+change.name);
 }
 if((preview.changes||[]).length&&!preview.confirmationHash)throw Error('Framer publication confirmation missing');
 return (preview.changes||[]).length>0;
}
