import {parseHTML} from 'linkedom';
import {createHash} from 'node:crypto';
import {floridaRegion} from './florida-club-discovery.mjs';
export const STARS_SITEMAP='https://www.soccerstars.com/franchise-sitemap.xml';
export const STARS_LOGO='https://www.soccerstars.com/wp-content/uploads/2023/05/SS_Logo.svg';
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
const key=s=>clean(s).toLowerCase().replace(/[^a-z0-9]/g,'');
const slug=s=>clean(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function soccerStarsPages(xml,areas){
 const found=[];
 for(const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)){
  const u=new URL(match[1]),part=u.pathname.match(/^\/fl\/([a-z]+)\/$/)?.[1];
  if(u.origin!=='https://www.soccerstars.com'||u.search||!part||!areas[part])continue;
  found.push({url:u.href,area:areas[part]});
 }
 return found.filter((r,i,a)=>a.findIndex(x=>x.url===r.url)===i);
}
export function soccerStarsProfile(html,{url,area},today){
 const {document:d}=parseHTML(html);
 for(const n of d.querySelectorAll('script,style,nav,header,footer,noscript'))n.remove();
 const headings=[...d.querySelectorAll('h1,h2')].map(n=>key(n.textContent)),text=clean(d.body.textContent);
 const registration=[...d.querySelectorAll('a[href]')].filter(a=>/find a class/i.test(a.textContent)).map(a=>a.getAttribute('href')).find(h=>{try{const u=new URL(h);return ['registration.youthathletesunited.com','registration.amazingathletes.com'].includes(u.hostname)&&u.protocol==='https:'&&/^\/franchise\/[^/]+\/events$/.test(u.pathname)}catch{return false}});
 if(!headings.some(h=>h.includes(key(area.label)))||!/Soccer Stars/i.test(text)||!registration||!/ages|program/i.test(text))throw Error('Regional program identity or public locator changed');
 const name='Soccer Stars — '+area.label;
 return {name,slug:slug(name),type:'Club',city:area.city,county:area.county,region:floridaRegion(area.county),website:url,sources:[{url:STARS_SITEMAP},{url,textChecksum:createHash('sha256').update(text).digest('hex')}],sourceKind:'soccer-stars-region',sourceIdentity:new URL(registration).origin+new URL(registration).pathname,summary:`Introductory youth soccer classes in the ${area.label} area. Compare age-specific programs and local venues through the provider.`,ages:'Provider describes toddler, preschool and school-age programs. Check the exact local class age range; offerings vary.',audience:['Youth'],experience:['Beginner'],levels:'Introductory youth soccer',programs:['Introductory soccer','Preschool soccer','Skills training'],address:`${area.label} service area. ${area.city} is a regional search reference, not a confirmed class venue. Choose the actual venue in the official class finder.`,priceNote:'Prices, trial terms and season dates depend on the local class. Confirm directly before booking.',accessNotes:'Regional program profile only. School or childcare sessions may be restricted to enrolled children. A class-finder link does not establish an available place, a current session date or walk-on park access.',overview:`${name} is identified on Soccer Stars’ official Florida regional page. Use its class finder to compare venues, age groups and current session details.`,checkedOn:today,sponsored:false,placementPriority:0,originalImage:STARS_LOGO,requireBadge:true};
}
export const INDOOR_PROGRAMS=[
 {name:'Sofive Winter Park',type:'Place',city:'Orlando',county:'Orange',url:'https://www.sofive.com/locations/winter-park',proof:['825 Courtland St','Winter Park','indoor'],address:'825 Courtland St, Orlando, FL 32804. Venue is branded Sofive Winter Park.',summary:'Indoor and outdoor small-sided soccer fields, leagues and classes at Sofive’s Winter Park-area center.',programs:['Indoor soccer','Field rentals','Adult leagues','Youth soccer'],audience:['Youth','Adult'],experience:[],ages:'Programs serve different ages; check each league or class.',image:'https://cdn.prod.website-files.com/6821a564b613eae724040553/682477152d0f7e4a372ec03d_SOFIVE.svg'},
 {name:'Sofive Lake Nona',type:'Place',city:'Orlando',county:'Orange',url:'https://www.sofive.com/locations/lake-nona',proof:['12314 Suttner Ave','Lake Nona','indoor'],address:'12314 Suttner Ave, Orlando, FL 32827.',summary:'Indoor soccer fields, futsal courts, leagues and youth programs in the Lake Nona area.',programs:['Indoor soccer','Futsal','Field rentals','Adult leagues','Youth soccer'],audience:['Youth','Adult'],experience:[],ages:'Programs serve different ages; check each league or class.',image:'https://cdn.prod.website-files.com/6821a564b613eae724040553/682477152d0f7e4a372ec03d_SOFIVE.svg'},
 ...[['Winter Park','winter-park','Winter Park','18 months to 6 years'],['Lake Nona','lake-nona','Orlando','18 months to 7 years']].map(([label,path,city,ages])=>({name:'Lil’ Kickers at Sofive '+label,type:'Club',city,county:'Orange',url:'https://www.lilkickers.com/location/florida/sofive-'+path+'/',proof:[label,ages,'Register'],address:label==='Winter Park'?'Sofive Winter Park, 825 Courtland St, Orlando, FL 32804.':'Sofive Lake Nona, 12314 Suttner Ave, Orlando, FL 32827.',summary:'Age-specific introductory soccer classes and Skills Institute training at Sofive '+label+'.',programs:['Introductory soccer','Preschool soccer','Skills training'],audience:['Youth'],experience:['Beginner'],ages:'Lil’ Kickers: '+ages+'. Skills Institute: ages 5–12. Confirm the exact group directly.',image:'https://www.lilkickers.com/wp-content/uploads/Lil-Kickers-Soccer-for-Kids-Logo-Blue.png'}))
];
export function indoorProgramProfile(html,source,today){
 const {document:d}=parseHTML(html);for(const n of d.querySelectorAll('script,style,nav,header,footer,noscript'))n.remove();const text=clean(d.body.textContent);
 if(!source.proof.every(p=>key(text).includes(key(p))))throw Error('Indoor venue/program facts changed');
 return {...source,slug:slug(source.name),region:floridaRegion(source.county),website:source.url,sources:[{url:source.url,textChecksum:createHash('sha256').update(text).digest('hex')}],sourceKind:'reviewed-indoor-program',sourceIdentity:source.url,levels:source.type==='Place'?'Venue · choose the activity level':'Introductory youth soccer',priceNote:'Check the official program or booking page for current fees, session dates and availability.',accessNotes:'Private facility/program. Confirm booking, eligibility and the specific session before travelling. This profile does not announce an open class or a scheduled pickup game.',overview:source.summary+' Follow the official provider for current programs and booking requirements.',checkedOn:today,sponsored:false,placementPriority:0,originalImage:source.image,requireBadge:true};
}
