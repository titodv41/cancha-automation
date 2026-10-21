// Routing evidence from existing public listing copy, never an eligibility guarantee.
// A club can have several programs: a range for one must not exclude its other teams.
export function discoveryAgeEvidence({entity,ages='',audience='',summary='',description=''}) {
 const text=`${ages} ${summary} ${description}`.replace(/<[^>]*>/g,' ').replace(/&(?:ndash|mdash);/g,'–').replace(/\s+/g,' ');
 if(entity==='career')return {kind:'unknown',label:'Check employer requirements'};
 if(entity==='profile'){
  const bounded=ages.match(/^Provider-wide ages (\d{1,2})[-–](\d{1,2});/);
  if(bounded&&Number(bounded[1])>=2&&Number(bounded[2])>=Number(bounded[1]))return {kind:'ages',ranges:[{min:Number(bounded[1]),max:Number(bounded[2])}],label:'Ages '+bounded[1]+'–'+bounded[2]};
  return {kind:'programs',label:ages||'Confirm program ages',audience};
 }
 const ranges=[...text.matchAll(/\bages?\s+(\d{1,2})\s*[-–—]\s*(\d{1,2})\b/gi)].map(m=>({min:Number(m[1]),max:Number(m[2]),label:m[0]})).filter(r=>r.min>=2&&r.max>=r.min&&r.max<=99);
 // Multiple program ranges may have gaps. Keep all of them rather than flattening.
 if(ranges.length)return {kind:'ages',ranges,label:[...new Set(ranges.map(r=>r.label))].join(' · ')};
 const plus=text.match(/\bages?\s+(\d{1,2})\s*\+/i);
 if(plus&&Number(plus[1])>=2)return {kind:'ages',ranges:[{min:Number(plus[1]),max:null}],label:plus[0]};
 const season=text.match(/\bU\s?(\d{1,2})\s*(?:[-–—]|through|to)\s*U\s?(\d{1,2})\b/i);
 if(season&&Number(season[1])>=3&&Number(season[2])>=Number(season[1])&&Number(season[2])<=23)return {kind:'season',min:Number(season[1])-1,max:Number(season[2]),label:`U${season[1]}–U${season[2]}`};
 // Grade, graduation year and league names are not converted to player ages.
 const youth=/\byouth\b/.test(text.toLowerCase());
 return {kind:'audience',audience:audience==='See eligibility'?(youth?'Youth':''):audience,label:'Confirm age eligibility'};
}
