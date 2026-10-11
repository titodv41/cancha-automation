import {createHash} from 'node:crypto';
import {canonicalUrl} from './opportunity-policy.mjs';
export const clubTextHash=text=>createHash('sha256').update(String(text).normalize('NFKC').replace(/\s+/g,' ').trim()).digest('hex');
export function clubRefreshDecision(item,review,source,day=new Date().toISOString().slice(0,10)){
 if(item.slug!==review.slug||!['Active','Pending review'].includes(item.status))return null;
 if(item.status==='Pending review'&&item.reviewStatus!=='Club source recheck needed')return null;
 let sameUrl=false;try{sameUrl=canonicalUrl(item.registration)===canonicalUrl(review.url)&&canonicalUrl(source?.url)===canonicalUrl(review.url);}catch{}
 const withinReviewWindow=/^\d{4}-\d{2}-\d{2}$/.test(review.reviewExpiresOn||'')&&day<=review.reviewExpiresOn;
 const unchanged=/^[a-f0-9]{64}$/.test(review.approvedTextHash||'')&&withinReviewWindow&&sameUrl&&source?.httpStatus===200&&!source.blocker&&source.clubTextHash===review.approvedTextHash;
 return {id:item.id,slug:item.slug,status:unchanged?'Active':'Pending review',reviewStatus:unchanged?'Organizer source rechecked':'Club source recheck needed',unchanged,restoring:item.status==='Pending review'};
}
export async function refreshReviewedClubs(f,reviews,sources,{day,beforeWrite}={}){
 const c=(await f.getCollections()).find(x=>x.name==='Opportunities'),fields=await c.getFields(),items=await c.getItems(),ids=Object.fromEntries(fields.map(x=>[x.name,x.id]));
 const changes=items.map(item=>{const review=reviews.find(x=>x.slug===item.slug);if(!review)return null;return clubRefreshDecision({id:item.id,slug:item.slug,status:item.fieldData[ids.Status]?.value,registration:item.fieldData[ids['External Registration Link']]?.value,reviewStatus:item.fieldData[ids['Review Status']]?.value},review,sources.find(x=>x.url===review.url),day);}).filter(Boolean);
 if(!changes.length)return [];
 if(typeof beforeWrite!=='function')throw Error('Club refresh requires an acknowledged backup before writes');
 await beforeWrite({projectId:'GU8EIeQXaRbty0S23thu',collectionName:'Opportunities',capturedAt:new Date().toISOString(),fields,items});
 const latest=await c.getItems();if(changes.some(change=>JSON.stringify(latest.find(x=>x.id===change.id))!==JSON.stringify(items.find(x=>x.id===change.id))))throw Error('CMS changed during backup; defer club writes for review');
 await c.addItems(changes.map(x=>({id:x.id,fieldData:{[ids.Status]:{type:'enum',value:fields.find(y=>y.name==='Status').cases.find(y=>y.name===x.status).id},[ids['Review Status']]:{type:'string',value:x.reviewStatus},...(x.unchanged?{[ids['Review Checked On']]:{type:'date',value:day},...(x.restoring?{[ids['Review Note']]:{type:'string',value:'The official club source again matches its previously reviewed evidence. Confirm exact eligibility, cost, class or roster space and current scheduling with the organizer; enrollment or placement is not guaranteed.'}}:{})}:{[ids.Verified]:{type:'boolean',value:false},[ids['Review Note']]:{type:'string',value:'The previously reviewed official club page changed, moved or could not be accessed. Recheck current season, eligibility, cost and enrollment before restoring this listing. This does not establish that the program is closed.'}})}})));
 const after=await c.getItems(),allowed=new Set([ids.Status,ids['Review Status'],ids['Review Checked On'],ids.Verified,ids['Review Note']]);
 if(after.length!==items.length||items.some(old=>{const current=after.find(x=>x.id===old.id);return !current||current.slug!==old.slug||Object.keys(old.fieldData).some(key=>!allowed.has(key)&&JSON.stringify(old.fieldData[key])!==JSON.stringify(current.fieldData[key]));}))throw Error('Unexpected record change during club recheck');
 return changes;
}
