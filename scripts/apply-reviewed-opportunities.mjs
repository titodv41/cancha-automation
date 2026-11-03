import{readFile,writeFile,mkdir}from'node:fs/promises';import{pathToFileURL}from'node:url';import{resolve}from'node:path';
import{dateInNewYork}from'../server/offer-expiry.mjs';import{canonicalUrl}from'../server/opportunity-policy.mjs';
// Reusable reviewed-opportunity importer (replaces the one-off apply-florida-reviewed-batch.mjs).
// Usage: BATCH=config/reviewed-opportunities/<file>.json node scripts/apply-reviewed-opportunities.mjs [--apply]
// Without --apply it is a dry run: it validates every field against the live CMS schema and prints what would be added.
// Safety: the batch must be dated today (New York); every row's organizer page must still show its confirm tokens;
// duplicates (same slug, or same registration link AND start date) are skipped; the collection is backed up before
// writing; a concurrent change aborts; existing items must be byte-identical afterwards; publication goes through the
// existing release-contract/catalog-checked publisher.
export const ROW_KEYS=new Set(['slug','confirm','imageSource','imageBackground']);
export function duplicateOf(row,items,ids){
 if(items.some(x=>x.slug===row.slug))return'slug';
 const link=canonicalUrl(row['External Registration Link']),start=row['Start Date']||'';
 return items.some(x=>{const v=x.fieldData[ids['External Registration Link']]?.value;return v&&canonicalUrl(v)===link&&String(x.fieldData[ids['Start Date']]?.value||'').slice(0,10)===start;})?'link+date':null;
}
export function validateBatch(batch,today){
 if(!batch||batch.checkedOn!==today)throw Error('Batch must be re-reviewed and dated today ('+today+')');
 const slugs=new Set();for(const r of batch.opportunities||[]){
  if(!/^[a-z0-9-]{8,90}$/.test(r.slug||'')||slugs.has(r.slug))throw Error('Bad or repeated slug '+r.slug);slugs.add(r.slug);
  for(const k of ['Title','Organization','Category','City','Region','Short Description','Full Description','External Registration Link','Cost','Review Note'])if(!r[k])throw Error(r.slug+': missing '+k);
  if(!Array.isArray(r.confirm)||r.confirm.length<2||r.confirm.some(t=>typeof t!=='string'||t.length<3))throw Error(r.slug+': needs confirm tokens from the organizer page');
  if(/^\s*free\b/i.test(r.Cost))throw Error(r.slug+': never state Free; use the organizer wording or say the cost is not confirmed');
  if(r['Start Date']&&r['Start Date']<today)throw Error(r.slug+': already started');
  canonicalUrl(r['External Registration Link']);}
 return true;
}
export const pageText=html=>html.replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#0?39;|&rsquo;|&#8217;/g,"'").replace(/&ndash;|&#8211;/g,'–').replace(/&quot;/g,'"').replace(/\s+/g,' ');
export async function confirmRows(batch,fetchImpl=fetch){const text={};
 for(const r of batch.opportunities){const url=r['External Registration Link'];
  if(!text[url]){const res=await fetchImpl(url,{headers:{'User-Agent':'Mozilla/5.0 (compatible; CanchaFactCheck/1.0)'},signal:AbortSignal.timeout(30000)});if(!res.ok)throw Error(r.slug+': organizer page returned '+res.status);
   text[url]=pageText(await res.text());}
  const missing=r.confirm.filter(t=>!text[url].includes(t));if(missing.length)throw Error(r.slug+': organizer page no longer shows '+JSON.stringify(missing));}
 return true;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const file=process.env.BATCH;if(!/^config\/reviewed-opportunities\/[\w-]+\.json$/.test(file||''))throw Error('Set BATCH=config/reviewed-opportunities/<file>.json');
 const batch=JSON.parse(await readFile(file,'utf8')),apply=process.argv.includes('--apply');
 validateBatch(batch,dateInNewYork());await confirmRows(batch);
 const{withProject}=await import('./project-session.mjs'),{sourceSession}=await import('./source-session.mjs');
 await withProject(async f=>{const source=sourceSession(),result={batch:file,apply,added:[],skipped:[],published:false};
  try{const c=(await f.getCollections()).find(x=>x.name==='Opportunities');if(!c)throw Error('Opportunity collection missing');
   const fields=await c.getFields(),items=await c.getItems(),ids=Object.fromEntries(fields.map(x=>[x.name,x.id])),payload=[],problems=[];
   for(const row of batch.opportunities){const dup=duplicateOf(row,items,ids);if(dup){result.skipped.push({slug:row.slug,reason:dup});continue;}
    let image='';if(apply&&row.imageSource){const bytes=await source.html(row.imageSource,/image\//i);const head=bytes.toString('latin1',0,16);
     const mime=bytes[0]===137?'image/png':bytes[0]===255?'image/jpeg':head.startsWith('RIFF')&&head.includes('WEBP')?'image/webp':null;if(!mime)throw Error(row.slug+': unsupported image');
     image=(await f.uploadImage({name:'cancha-opportunity-'+row.slug,image:{bytes:new Uint8Array(bytes),mimeType:mime}})).url;}
    const extra={Sport:'Soccer',State:'Florida',Status:'Active',Verified:false,Featured:false,'Review Status':'Organizer source checked','Review Checked On':batch.checkedOn,'Image Max Width':240,'Discovery Track':'Play','Image Treatment':'Badge','Image Background':row.imageBackground||'Light',...(image?{Image:image}:{})};
    const data={};for(let[k,v]of Object.entries({...row,...extra})){if(ROW_KEYS.has(k))continue;const field=fields.find(x=>x.name===k);if(!field){problems.push(row.slug+': no CMS field "'+k+'"');continue;}
     if(field.type==='enum'){const hit=field.cases.find(x=>x.name===v);if(!hit){problems.push(`${row.slug}: "${v}" is not an option for ${k}; options: ${field.cases.map(x=>x.name).join(' | ')}`);continue;}v=hit.id;}
     data[field.id]={type:field.type,value:v};}
    payload.push({slug:row.slug,draft:false,fieldData:data});result.added.push(row.slug);}
   if(problems.length)throw Error('Batch does not match the CMS schema:\n'+problems.join('\n'));
   if(apply&&payload.length){const dir='backups/reviewed-opportunities-'+Date.now();await mkdir(dir,{recursive:true,mode:0o700});await writeFile(dir+'/Opportunities.json',JSON.stringify({fields,items}),{mode:0o600});
    if(JSON.stringify(await c.getItems())!==JSON.stringify(items))throw Error('Concurrent CMS change');
    await c.addItems(payload);const after=await c.getItems();
    if(after.length!==items.length+payload.length||items.some(x=>JSON.stringify(after.find(y=>y.id===x.id))!==JSON.stringify(x)))throw Error('Existing records changed');
    const{publishOpportunities}=await import('./publish-opportunities.mjs');result.published=(await publishOpportunities(f,{cmsUpdates:true})).published;}
   if(!apply)result.dryRun=true;console.log(JSON.stringify(result));
  }finally{await source.close();}});
}
