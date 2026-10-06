import {dateInNewYork,expiredOffer} from './offer-expiry.mjs';
export function canonicalUrl(input){const u=new URL(input);if(u.protocol!=='https:'||u.username||u.password)throw Error('Public HTTPS URL required');u.hash='';for(const key of [...u.searchParams.keys()])if(/^utm_|^(fbclid|gclid)$/i.test(key))u.searchParams.delete(key);u.searchParams.sort();u.pathname=u.pathname.replace(/\/$/,'')||'/';return u.href;}
export function lifecycle(item,now=new Date()){
 if(item.status!=='Active')return null;
 if(item.end){try{if(expiredOffer(item.end,now))return {status:'Expired',label:'Listed end date passed',verified:false,note:'The stored end date has passed. This listing is retained for its existing URL; organizer availability has not been reconfirmed.'};}catch{return {status:'Pending review',label:'Date needs review',verified:false,note:'The stored end date is invalid. Confirm with the organizer.'};}}
 // Source checks are not proof of closure; unknown/blocked pages never become Expired.
 const checked=String(item.checkedOn||'').slice(0,10);
 const age=Date.parse(dateInNewYork(now))-Date.parse(checked);
 if(!Number.isFinite(age)||age>7*86400000||age<0)return {status:'Pending review',label:'Availability needs recheck',verified:false,note:'The organizer availability check is missing or more than seven calendar days old. Reconfirm dates, eligibility, registration and open status.'};
 return null;
}
export function validateBatch(batch,existing,config,now=new Date()){
 if(!Array.isArray(batch)||batch.length>config.maximumPerRun)throw Error('Batch exceeds daily maximum');
 const identity=x=>`${String(x.title||'').toLowerCase().replace(/[^a-z0-9]/g,'')}|${String(x.organization||'').toLowerCase().replace(/[^a-z0-9]/g,'')}`;
 const identities=new Set(existing.filter(x=>x.title&&x.organization).map(identity));
 const urls=new Set(existing.map(x=>x.registration).filter(Boolean).map(canonicalUrl)),slugs=new Set(existing.map(x=>x.slug));
 for(const row of batch){
  for(const field of ['slug','title','organization','category','sport','city','region','state','level','ageGroup','gender','cost','shortDescription','fullDescription','registrationUrl','officialSourceUrl','eligibilityEvidence','availabilityEvidence','dateEvidence','imageUrl','imageRightsEvidence','imageContext','reviewer','reviewedAt','sourceCheckedAt'])if(typeof row[field]!=='string'||!row[field].trim())throw Error('Missing reviewed field: '+field);
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.slug)||slugs.has(row.slug))throw Error('Duplicate or invalid slug');slugs.add(row.slug);
  if(identities.has(identity(row)))throw Error('Possible duplicate title/organizer requires manual resolution');identities.add(identity(row));
  const url=canonicalUrl(row.registrationUrl);canonicalUrl(row.officialSourceUrl);canonicalUrl(row.imageUrl);if(urls.has(url))throw Error('Possible duplicate registration URL requires manual resolution');urls.add(url);
  for(const field of ['reviewedAt','sourceCheckedAt']){const date=Date.parse(row[field]);if(!Number.isFinite(date)||date>now.getTime()||now.getTime()-date>config.maximumSourceAgeHours*3600000)throw Error('Review/evidence missing, future or stale');}
  if(row.openConfirmed!==true||row.imageApproved!==true||!['Badge','Photo'].includes(row.imageTreatment))throw Error('Open status and image treatment require review');
  if(!Number.isFinite(row.imageWidth)||!Number.isFinite(row.imageHeight)||row.imageWidth<=0||row.imageHeight<=0||(row.imageTreatment==='Photo'&&(row.imageWidth<1200||row.imageHeight<600)))throw Error('Image resolution needs review');
  for(const key of ['startDate','endDate','registrationDeadline'])if(row[key]){expiredOffer(row[key],now);if(key!=='startDate'&&expiredOffer(row[key],now))throw Error('Opportunity date/deadline has passed');}
 }
 return batch;
}
