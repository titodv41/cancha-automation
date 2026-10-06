const definitions={
 opportunity:{required:['Organization','Contact Name','Contact Email','Opportunity Title','Category','Location','Eligibility','Registration Link','Description'],link:'Registration Link',optional:['Dates']},
 provider:{required:['Provider Name','Contact Name','Contact Email','Category','Location','Delivery','Languages','Age Groups Served','Qualifications','Services','Booking Link'],link:'Booking Link',optional:['Price Note','Image URL']},
 offer:{required:['Company','Contact Name','Contact Email','Offer Title','Category','Terms','Region','Redemption Link','Disclosure'],link:'Redemption Link',optional:['Code','Expires On','Image URL']}
};
export function validateIntake(data,kind='opportunity'){
 const definition=definitions[kind];if(!definition||!data||Array.isArray(data)||typeof data!=='object'||data.Website)throw Error('Invalid submission');
 const clean={};for(const key of definition.required){if(typeof data[key]!=='string'||!data[key].trim()||data[key].length>(['Description','Qualifications','Services','Terms'].includes(key)?10000:1000))throw Error('Missing or invalid field');clean[key]=data[key].trim();}
 for(const key of definition.optional){if(data[key]!=null&&(typeof data[key]!=='string'||data[key].length>1000))throw Error('Invalid optional field');clean[key]=data[key]?.trim()||'';}
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean['Contact Email']))throw Error('Invalid email');
 for(const key of [definition.link,'Image URL'])if(clean[key]){const url=new URL(clean[key]);if(url.protocol!=='https:'||url.username||url.password)throw Error('HTTPS required');}
 if(![true,'true','on'].includes(data.Permission))throw Error('Permission required');clean.Permission=true;
 if(kind==='provider'&&!['Mental Performance','Strength & Conditioning','Private Training','Nutrition','Recruiting & College Guidance','Video & Highlights'].includes(clean.Category))throw Error('Invalid category');
 if(kind==='offer'&&!['Cleats','Training Gear','Camps','Other'].includes(clean.Category))throw Error('Invalid category');
 if(kind==='provider'&&!['In person','Remote','Both'].includes(clean.Delivery))throw Error('Invalid delivery');
 if(kind==='offer'){
  if(!['No paid relationship declared','Sponsored','Affiliate'].includes(clean.Disclosure))throw Error('Disclosure required');
  if(clean['Expires On']&&(!/^\d{4}-\d{2}-\d{2}$/.test(clean['Expires On'])||!Number.isFinite(Date.parse(clean['Expires On']))||new Date(clean['Expires On']).toISOString().slice(0,10)!==clean['Expires On']))throw Error('Invalid expiry');
 }
 return clean;
}
