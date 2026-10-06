import {mkdir,writeFile} from 'node:fs/promises';import {validateBatch} from './opportunity-policy.mjs';import {dateInNewYork} from './offer-expiry.mjs';
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export async function stageBatch(f,rows,config,{apply=false,readyForPublish=false,beforeWrite}={}){
 const c=(await f.getCollections()).find(x=>x.name==='Opportunities'),fields=await c.getFields(),items=await c.getItems(),ids=Object.fromEntries(fields.map(x=>[x.name,x.id])),day=dateInNewYork();
 validateBatch(rows,items.map(x=>({slug:x.slug,title:x.fieldData[ids.Title]?.value,organization:x.fieldData[ids.Organization]?.value,registration:x.fieldData[ids['External Registration Link']]?.value})),config);
 const stagedToday=items.filter(x=>String(x.fieldData[ids['Automation Added On']]?.value||'').slice(0,10)===day).length;if(stagedToday+rows.length>config.maximumPerRun)throw Error('Daily staging maximum reached');
 if(readyForPublish&&rows.some(x=>x.reviewMode!=='automated-source-check'||x.automationChecks?.length!==8||!x.sourceHash))throw Error('Publish-ready preparation requires the strict supported-source checks');
 if(readyForPublish&&!['Automation ID','Automation Added On','Automation Source Hash'].every(x=>ids[x]))throw Error('Enable the automation metadata fields before staging');
 const mapping={Title:'title',Organization:'organization',Category:'category',Sport:'sport',City:'city',Region:'region',State:'state',Level:'level','Age Group':'ageGroup',Gender:'gender',Cost:'cost','Short Description':'shortDescription','External Registration Link':'registrationUrl',Image:'imageUrl','Image Treatment':'imageTreatment'};
 const payload=rows.map(row=>{
  const fieldData={};for(const[name,key]of Object.entries(mapping)){const field=fields.find(x=>x.name===name);if(!field)throw Error('Missing schema field '+name);let value=row[key];if(field.type==='enum'){value=field.cases.find(x=>x.name===value)?.id;if(!value)throw Error('Unsupported CMS option: '+name+' = '+row[key]);}fieldData[field.id]={type:field.type,value};}
  fieldData[ids['Full Description']]={type:'formattedText',value:'<p>'+esc(row.fullDescription)+'</p>'};
  for(const[name,key]of [['Start Date','startDate'],['End Date','endDate']])if(row[key])fieldData[ids[name]]={type:'date',value:row[key]};
  fieldData[ids.Status]={type:'enum',value:fields.find(x=>x.name==='Status').cases.find(x=>x.name===(readyForPublish?'Active':'Pending review')).id};
  fieldData[ids.Verified]={type:'boolean',value:false};fieldData[ids.Featured]={type:'boolean',value:false};
  fieldData[ids['Review Status']]={type:'string',value:readyForPublish?'Organizer source checked automatically':'Ready for editorial review'};
  fieldData[ids['Review Checked On']]={type:'date',value:dateInNewYork(new Date(row.sourceCheckedAt))};
  if(ids['Image Background'])fieldData[ids['Image Background']]={type:'string',value:row.imageBackground||'Light'};
  if(ids['Image Max Width'])fieldData[ids['Image Max Width']]={type:'number',value:row.imageMaxWidth||240};
  fieldData[ids['Review Note']]={type:'string',value:`${readyForPublish?'Organizer source checked automatically.':'Source prepared for editorial review.'} Qualifications excerpt: ${row.eligibilityEvidence} ${row.dateEvidence} Confirm full eligibility, compensation and remaining availability with the employer before applying.`};
  if(readyForPublish){fieldData[ids['Automation ID']]={type:'string',value:'teamwork-posting:'+row.sourcePostingId};fieldData[ids['Automation Added On']]={type:'date',value:day};fieldData[ids['Automation Source Hash']]={type:'string',value:row.sourceHash};}
  return {slug:row.slug,draft:!readyForPublish,fieldData};
 });
 if(apply&&payload.length){const dir=`backups/staging-${new Date().toISOString().replaceAll(':','-')}`,snapshot={projectId:'GU8EIeQXaRbty0S23thu',collectionName:'Opportunities',capturedAt:new Date().toISOString(),fields,items};await mkdir(dir,{recursive:true,mode:0o700});await writeFile(dir+'/opportunities.json',JSON.stringify(snapshot,null,2),{mode:0o600});if(beforeWrite)await beforeWrite(snapshot);await c.addItems(payload);const after=await c.getItems();if(after.length!==items.length+payload.length||items.some(x=>{const current=after.find(y=>y.id===x.id);return current?.slug!==x.slug||JSON.stringify(current.fieldData)!==JSON.stringify(x.fieldData);}))throw Error('Unexpected existing record change');}
 return {validated:rows.length,staged:apply?payload.length:0,readyForManualPublish:readyForPublish,published:false};
}
