import{createHash}from'node:crypto';
const clean=x=>String(x??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const safeUrl=x=>{try{const u=new URL(x);return u.protocol==='https:'&&!u.username&&!u.password?u.href:'';}catch{return '';}};
const fields=c=>Object.fromEntries(c.fields.map(x=>[x.name,x.id]));
const get=(item,fs,name)=>item.fieldData[fs[name]]?.value;
const image=x=>safeUrl(typeof x==='string'?x:x?.url);
export function discoveryLevels(level,programs=''){
 const raw=`${level} ${programs}`.toLowerCase(),out=[];
 if(/beginner/.test(raw))out.push('Beginner');
 if(/recreation/.test(raw))out.push('Recreational');
 if(/competitive/.test(raw))out.push('Competitive');
 if(/academy/.test(raw))out.push('Academy');
 if(/semi[ -]?pro|\bupsl\b|league two|usl2/.test(raw))out.push('Semi-pro pathway');
 if(/\bprofessional\b/.test(raw)&&!/semi[ -]?professional/.test(raw))out.push('Professional');
 if(/college|high school/.test(raw))out.push('School / college');
 return [...new Set(out)];
}
export function catalogFromCollections(collections,cities,{today=new Date().toISOString().slice(0,10)}={}){
 const out=[],counts={};
 for(const collection of collections){const fs=fields(collection),v=(i,k)=>get(i,fs,k);counts[collection.name]=collection.items.length;
  if(collection.name==='Clubs')for(const i of collection.items){if(i.draft||v(i,'Status')!=='Published')continue;const programs=clean(v(i,'Program Types')),levels=clean(v(i,'Levels'));out.push({id:i.id,slug:i.slug,href:'/clubs/'+i.slug,entity:'profile',kind:v(i,'Type')==='Place'?'Place':'Club',name:clean(v(i,'Name')),organization:clean(v(i,'Name')),city:clean(v(i,'City')),region:'Broward',summary:clean(v(i,'Summary')),ages:clean(v(i,'Ages')),audience:clean(v(i,'Audience')),levels:discoveryLevels(levels,programs),levelLabel:levels,programs,cost:clean(v(i,'Price Note')),access:clean(v(i,'Access Notes')),address:clean(v(i,'Address')),image:image(v(i,'Image')),treatment:'Badge',source:safeUrl(v(i,'Source')),checkedOn:String(v(i,'Source Checked On')||'').slice(0,10),availability:'Profile · confirm current spaces',sponsored:v(i,'Sponsored')===true&&String(v(i,'Placement Until')||'').slice(0,10)>today,priority:Number(v(i,'Placement Priority'))||0});}
  if(collection.name==='Opportunities')for(const i of collection.items){if(i.draft||v(i,'Status')!=='Active')continue;const category=clean(v(i,'Category')),career=['Job','Internship','Volunteer Opportunity'].includes(category),end=String(v(i,'End Date')||'').slice(0,10);if(end&&end<today)continue;const review=clean(v(i,'Review Status')),checked=String(v(i,'Review Checked On')||'').slice(0,10),fresh=checked&&Math.floor((Date.parse(today)-Date.parse(checked))/86400000)<=7&&checked<=today&&['Organizer source checked','Organizer source rechecked'].includes(review);out.push({id:i.id,slug:i.slug,href:'/opportunities/'+i.slug,entity:career?'career':'opportunity',kind:category,name:clean(v(i,'Title')),organization:clean(v(i,'Organization')),city:clean(v(i,'City')),region:clean(v(i,'Region')),summary:clean(v(i,'Short Description')),ages:clean(v(i,'Age Group')),audience:clean(v(i,'Age Group')),levels:discoveryLevels(clean(v(i,'Level'))),levelLabel:clean(v(i,'Level')),programs:category,cost:clean(v(i,'Cost')),image:image(v(i,'Image')),treatment:clean(v(i,'Image Treatment'))||'Badge',source:safeUrl(v(i,'External Registration Link')),checkedOn:checked,start:String(v(i,'Start Date')||'').slice(0,10),end,availability:fresh?'Organizer source checked · confirm spaces':'Confirm current availability',reviewNote:clean(v(i,'Review Note')),sourceChecked:!!fresh,sponsored:false,priority:0});}
 }
 const entityOrder={profile:0,opportunity:1,career:2};out.sort((a,b)=>entityOrder[a.entity]-entityOrder[b.entity]||Number(b.sponsored)-Number(a.sponsored)||(b.sponsored?b.priority-a.priority:0)||Number(b.sourceChecked||false)-Number(a.sourceChecked||false)||(a.entity==='profile'?Number(b.kind==='Club')-Number(a.kind==='Club'):0)||a.name.localeCompare(b.name));
 const known=new Map(cities.places.map(x=>[x.city.toLowerCase(),x])),used=[...new Set(out.map(x=>x.city))];
 return {version:1,generatedOn:today,coverage:'Club and field profiles start in Broward. Dated opportunities cover additional Florida cities.',items:out,cities:used.map(name=>known.get(name.toLowerCase())).filter(Boolean),mapSource:cities.source,unmappedCities:used.filter(name=>!known.has(name.toLowerCase())),cmsCounts:counts};
}
export function catalogModule(catalog){const data=JSON.stringify(catalog);return '// Generated from public CMS fields. Run sync-discovery-catalog.mjs; never add private submissions.\nexport const catalog: any = '+data+'\n';}
export const catalogDigest=catalog=>createHash('sha256').update(catalogModule(catalog)).digest('hex');
