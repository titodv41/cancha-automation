import {createHash} from 'node:crypto';
export function approvedSocialPhoto(photo){try{const url=new URL(photo.url),source=new URL(photo.sourcePage);return url.origin==='https://framerusercontent.com'&&/^\/images\/.+\.jpe?g$/i.test(url.pathname)&&!url.search&&!url.username&&!url.password&&source.origin==='https://commons.wikimedia.org'&&source.pathname.startsWith('/wiki/File:')&&/^[a-f0-9]{64}$/.test(photo.originalChecksum||'')&&!!photo.creator&&((photo.license==='CC0'&&photo.licenseUrl==='https://creativecommons.org/publicdomain/zero/1.0/deed.en')||(photo.license==='CC BY 2.0'&&photo.licenseUrl==='https://creativecommons.org/licenses/by/2.0/')||(photo.license==='CC BY 4.0'&&photo.licenseUrl==='https://creativecommons.org/licenses/by/4.0'))&&['photo-poster','photo-split'].includes(photo.layout);}catch{return false;}}
export function approvedOriginalCreative(row){
 const e=row.visualEvidence;if(row.creativeVersion!=='cancha-local-v2'||!e||e.creator!=='Cancha'||!['product-demo','parent-guide','map-guide','profile-spotlight','photo-guide','community-question'].includes(e.kind)||!e.subjectKey||!Number.isFinite(Date.parse(e.renderedAt))||Date.parse(e.renderedAt)>Date.now()||Date.now()-Date.parse(e.renderedAt)>7*86400000||e.sourceReviewedOn&&(e.sourceReviewedOn>new Date().toISOString().slice(0,10)||(Date.now()-Date.parse(e.sourceReviewedOn))/86400000>30)||e.assetChecksum!==row.assetChecksum||!/^[a-f0-9]{64}$/.test(e.assetChecksum||''))return false;
 if(e.kind==='photo-guide'&&(!approvedSocialPhoto(row.photo)||row.photo.archive!==true||!/archive/i.test(row.caption)||!/archive/i.test(row.altText)))return false;
 if(!['parent-guide','community-question'].includes(e.kind)){try{const u=new URL(e.sourceUrl);if(u.origin!=='https://pioneering-friday-005497.framer.app'||!['/clubs','/explore'].some(p=>u.pathname===p||u.pathname.startsWith(p+'/')))return false}catch{return false}}
 return !!row.rights&&!!row.caption&&!!row.altText;
}
export const shouldActivateLocalCreative=(mode,state,policy)=>!(policy.cutoverRequestedAt&&state.plan?.enabled===false&&Date.parse(state.plan.updatedAt)>Date.parse(policy.cutoverRequestedAt))&&(mode==='refresh-creative'||mode==='prepare'&&policy.localEditorialEnabled===true&&!!policy.requiredCreativeVersion&&state.localCreativeVersion!==policy.requiredCreativeVersion);
export function applyEditorialCreative(row,photos){
 if(row.sourceType!=='brand')return row;
 const approved=photos.filter(approvedSocialPhoto);if(!approved.length)throw Error('Approved real photography is required for brand preparation');
 const index=createHash('sha256').update(row.id).digest().readUInt32BE(0)%approved.length,photo=approved[index];
 const credit=`Photo: ${photo.creator} / Wikimedia Commons (${photo.license}). ${photo.alt} Cropped and overlaid with Cancha design.\n${photo.sourcePage}\n${photo.licenseUrl}`;
 return {...row,photo,visualStyle:photo.layout,caption:row.caption+'\n\n'+credit,altText:row.altText+' '+photo.alt,rights:`Original Cancha copy and design; real illustrative photograph by ${photo.creator}, ${photo.license}. Reuse terms and source recorded; no claimed affiliation with the people or location photographed.`};
}

// Compare source identity as well as rendered files: a new crop is still the same photo.
export function recentlyUsedPhoto(content,rows,scheduledAt,{days=30}={}){
 const identities=row=>[row.visualEvidence?.subjectKey&&'subject:'+row.visualEvidence.subjectKey,row.photo?.originalChecksum&&'original:'+row.photo.originalChecksum,row.photo?.sourcePage&&'source:'+row.photo.sourcePage,row.photo?.url&&'photo:'+row.photo.url,row.assetChecksum&&'render:'+row.assetChecksum,row.assetUrl&&'asset:'+row.assetUrl].filter(Boolean);
 const keys=new Set(identities(content)),at=Date.parse(scheduledAt);if(!keys.size||!Number.isFinite(at))return false;
 return rows.some(row=>{
  if(!['Approved','Preparing','Publishing','Published','Needs reconciliation'].includes(row.status))return false;
  const previous=Date.parse(row.published_at||row.scheduled_at),elapsed=at-previous;
  if(!Number.isFinite(previous)||elapsed<0||elapsed>=days*86400000)return false;
  let other;try{other=typeof row.content==='string'?JSON.parse(row.content):row.content;}catch{return false;}
  return !!other&&identities(other).some(key=>keys.has(key));
 });
}
