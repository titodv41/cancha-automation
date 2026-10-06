import {readFile,writeFile,mkdir} from 'node:fs/promises';import {withProject} from './project-session.mjs';import {validateBatch} from '../server/opportunity-policy.mjs';import {dateInNewYork} from '../server/offer-expiry.mjs';
const file=process.argv[2],apply=process.argv.includes('--apply');if(!file)throw Error('Supply a human-reviewed JSON batch; default is validation only');
const rows=JSON.parse(await readFile(file)),config=JSON.parse(await readFile('config/opportunity-workflow.json'));
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
await withProject(async f=>{
 const c=(await f.getCollections()).find(x=>x.name==='Opportunities'),fields=await c.getFields(),items=await c.getItems(),ids=Object.fromEntries(fields.map(x=>[x.name,x.id]));
 validateBatch(rows,items.map(x=>({slug:x.slug,title:x.fieldData[ids.Title]?.value,organization:x.fieldData[ids.Organization]?.value,registration:x.fieldData[ids['External Registration Link']]?.value})),config);
 const day=dateInNewYork(),ledgerFile=`private-data/daily-opportunities/${day}/staged.json`;let ledger=[];try{ledger=JSON.parse(await readFile(ledgerFile));}catch(e){if(e.code!=='ENOENT')throw e;}
 if(ledger.length+rows.length>config.maximumPerRun)throw Error('Daily staging maximum reached');
 const mapping={Title:'title',Organization:'organization',Category:'category',Sport:'sport',City:'city',Region:'region',State:'state',Level:'level','Age Group':'ageGroup',Gender:'gender',Cost:'cost','Short Description':'shortDescription','External Registration Link':'registrationUrl',Image:'imageUrl','Image Treatment':'imageTreatment'};
 const payload=rows.map(row=>{
  const fieldData={};for(const[name,key]of Object.entries(mapping)){const field=fields.find(x=>x.name===name);if(!field)throw Error('Missing schema field '+name);let value=row[key];if(field.type==='enum'){value=field.cases.find(x=>x.name===value)?.id;if(!value)throw Error('Unsupported CMS option: '+name+' = '+row[key]);}fieldData[field.id]={type:field.type,value};}
  fieldData[ids['Full Description']]={type:'formattedText',value:'<p>'+esc(row.fullDescription)+'</p>'};
  for(const[name,key]of [['Start Date','startDate'],['End Date','endDate']])if(row[key])fieldData[ids[name]]={type:'date',value:row[key]};
  // Even reviewed additions stay hidden until the editorial CMS review and publication.
  fieldData[ids.Status]={type:'enum',value:fields.find(x=>x.name==='Status').cases.find(x=>x.name==='Pending review').id};
  fieldData[ids.Verified]={type:'boolean',value:false};fieldData[ids.Featured]={type:'boolean',value:false};
  fieldData[ids['Review Status']]={type:'string',value:'Ready for editorial review'};
  fieldData[ids['Review Checked On']]={type:'date',value:row.sourceCheckedAt.slice(0,10)};
  fieldData[ids['Review Note']]={type:'string',value:`Official source: ${row.officialSourceUrl}. Eligibility: ${row.eligibilityEvidence}. Availability: ${row.availabilityEvidence}. Dates/deadline: ${row.dateEvidence}. Image rights/context: ${row.imageRightsEvidence}; ${row.imageContext}. Checked by ${row.reviewer} on ${row.reviewedAt}. Confirm actual image loading and details before changing to Active.`};
  return {slug:row.slug,draft:true,fieldData};
 });
 if(apply&&payload.length){const dir=`backups/staging-${new Date().toISOString().replaceAll(':','-')}`;await mkdir(dir,{recursive:true,mode:0o700});await writeFile(dir+'/opportunities.json',JSON.stringify({fields,items},null,2),{mode:0o600});await c.addItems(payload);const after=await c.getItems();if(after.length!==items.length+payload.length||items.some(x=>after.find(y=>y.id===x.id)?.slug!==x.slug))throw Error('Unexpected record identity/count');await mkdir(`private-data/daily-opportunities/${day}`,{recursive:true,mode:0o700});await writeFile(ledgerFile,JSON.stringify([...ledger,...rows.map(x=>({slug:x.slug,reviewer:x.reviewer,stagedAt:new Date().toISOString()}))],null,2),{mode:0o600});}
 console.log(JSON.stringify({validated:rows.length,staged:apply?payload.length:0,status:'Pending review',draft:true,published:false}));
});
