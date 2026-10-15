const tags={audience:new Set(['Youth','Adult']),experience:new Set(['Beginner','Recreational','Competitive'])};
export function validateClubProfiles(rows,{today=new Date().toISOString().slice(0,10)}={}){
 const slugs=new Set(),entities=new Set();for(const r of rows){if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r.slug)||slugs.has(r.slug))throw Error('Duplicate or invalid club profile slug');slugs.add(r.slug);const entity=[r.name,r.city,r.type].map(x=>String(x||'').trim().toLowerCase()).join('|');if(entities.has(entity))throw Error('Duplicate club/place entity');entities.add(entity);
 if(!['Club','Place'].includes(r.type)||r.county!=='Broward')throw Error('Only reviewed Broward club/place profiles are supported in this batch');for(const key of ['name','city','summary','ages','levels','address','priceNote','accessNotes','overview'])if(typeof r[key]!=='string'||!r[key].trim())throw Error('Missing profile fact/note: '+key);
 for(const key of Object.keys(tags))if(!Array.isArray(r[key])||r[key].some(x=>!tags[key].has(x)))throw Error('Invalid search tags');if(!r.audience.length)throw Error('Audience relevance must be stated');
 if(!/^20\d\d-\d\d-\d\d$/.test(r.checkedOn)||!Number.isFinite(Date.parse(r.checkedOn))||new Date(r.checkedOn).toISOString().slice(0,10)!==r.checkedOn||r.checkedOn>today||Date.parse(today)-Date.parse(r.checkedOn)>30*86400000)throw Error('Fresh editorial source review required');
 if(!Array.isArray(r.sources)||!r.sources.length)throw Error('Source evidence required');for(const s of [...r.sources,{url:r.website}]){const u=new URL(s.url);if(u.protocol!=='https:'||u.username||u.password||!u.hostname.includes('.')||['localhost','127.0.0.1'].includes(u.hostname))throw Error('Public HTTPS source required');}
 if(!r.sources.some(x=>new URL(x.url).hostname===new URL(r.website).hostname))throw Error('Website must match a reviewed source');
 if(r.sponsored){if(r.promotionApproved!==true||!Number.isInteger(r.placementPriority)||!(r.placementPriority>0&&r.placementPriority<=100)||!r.placementUntil||!/^20\d\d-\d\d-\d\d$/.test(r.placementUntil)||!Number.isFinite(Date.parse(r.placementUntil))||new Date(r.placementUntil).toISOString().slice(0,10)!==r.placementUntil||r.placementUntil<=today)throw Error('Sponsored placement needs recorded approval, priority and a future end date');}else if(r.placementPriority!==0)throw Error('Unpaid profiles cannot have paid ranking priority');
 }
 return rows;
}
export function clubSearchTerms(r){return [r.name,r.type,r.city,r.county,r.summary,r.ages,...r.audience,...r.experience,...r.programs].join(' ');}
