import {parseHTML} from 'linkedom';
import {createHash} from 'node:crypto';
import {floridaRegion} from './florida-club-discovery.mjs';

export const MUNICIPAL_DIRECTORIES={
 miami:'https://www.miami.gov/sitemap.xml',
 pbc:'https://discover.pbc.gov/parks/Pages/All-Parks.aspx',
 stpete:'https://www.stpeteparksrec.org/sports___fields/sport_complexes.php'
};
const clean=s=>String(s||'').replace(/[\u200b-\u200f\ufeff]/g,'').replace(/\s+/g,' ').trim();
const digest=s=>createHash('sha256').update(s).digest('hex');
const slug=s=>clean(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const key=s=>slug(s).replaceAll('-','');
const allowed=(kind,url)=>{try{const u=new URL(url);return !u.search&&!u.hash&&!u.username&&!u.password&&({miami:u.origin==='https://www.miami.gov'&&/^\/Parks-Public-Places\/Parks-Directory\/[^/]+$/.test(u.pathname),pbc:u.origin==='https://discover.pbc.gov'&&/^\/parks\/Locations\/[a-z0-9-]+\.aspx$/i.test(u.pathname),stpete:u.origin==='https://www.stpeteparksrec.org'&&/^\/business_detail_T11_R\d+\.php$/.test(u.pathname)})[kind]}catch{return false}};
function doc(html){const {document}=parseHTML(html);document.querySelectorAll('script,style,nav,header,footer,noscript').forEach(n=>n.remove());document.querySelectorAll('br').forEach(n=>n.replaceWith('\n'));return document}
export function municipalParkLeads(kind,html){
 if(!MUNICIPAL_DIRECTORIES[kind])throw Error('Unknown municipal directory');
 const d=doc(html),leads=[];
 if(kind==='miami')for(const n of d.querySelectorAll('loc')){const url=clean(n.textContent);if(allowed(kind,url))leads.push({kind,url})}
 else for(const a of d.querySelectorAll(kind==='stpete'?'a.rz-bus-readmore':'a[href]')){let url;try{url=new URL(a.getAttribute('href'),MUNICIPAL_DIRECTORIES[kind]).href}catch{continue}if(!allowed(kind,url))continue;leads.push({kind,url,nameHint:kind==='stpete'?clean(a.parentElement.querySelector('h2')?.textContent):clean(a.textContent)})}
 const unique=leads.filter((x,i,a)=>a.findIndex(y=>y.url===x.url)===i);
 if(unique.length<5||unique.length>(kind==='stpete'?60:180))throw Error('Municipal directory shape changed');return unique;
}
export function municipalSoccerProfile(html,lead,{today,mediaOverrides=null}={}){
 const {kind,url}=lead;if(!allowed(kind,url)||!/^\d{4}-\d{2}-\d{2}$/.test(today||''))throw Error('Unreviewed municipal source or date');
 const d=doc(html);let name,address,city,county,photo,amenities,content,imageUse='official-venue-photo';
 if(kind==='miami'){
  name=clean(d.querySelector('h1.oc-page-title')?.textContent);address=clean(d.querySelector('.gmap-address')?.textContent);city='Miami';county='Miami-Dade';
  const features=[...d.querySelectorAll('.park-feature-list>li')].map(n=>clean(n.textContent));if(!features.includes('Soccer Field'))return null;
  amenities='Soccer field';content=d.querySelector('main')||d.body;
  photo=d.querySelector('img.main-page-image')?.getAttribute('src');
  if(!photo){photo=[...parseHTML(html).document.querySelectorAll('img[src]')].find(i=>i.getAttribute('alt')==='City of Miami - Logo')?.getAttribute('src');imageUse='official-municipal-logo'}
  if(photo){const u=new URL(photo,url);u.search=imageUse==='official-venue-photo'?'?dimension=pageimage&w=1200':'';photo=u.href}
  if(!/\bMiami\s+\d{5}\b/.test(address))throw Error('Miami venue address changed');
 }else if(kind==='pbc'){
  content=d.querySelector('.ms-wikicontent');if(!content)throw Error('County park body missing');name=clean(content.querySelector('h1')?.textContent);county='Palm Beach';
  const facts=[...content.querySelectorAll('li')].filter(n=>!n.querySelector('li')).map(n=>clean(n.textContent));amenities=facts.find(t=>/\bsoccer\b/i.test(t)&&/\bfields?\b/i.test(t));if(!amenities)return null;
  const copy=content.cloneNode(true);copy.querySelectorAll('br').forEach(n=>n.replaceWith('\n'));const text=clean(copy.textContent);
  address=clean(text.match(/ENTRANCE\s*(.*?)\s*Google Maps/i)?.[1]);city=address.match(/\b([A-Za-z .'-]+), Florida \d{5}$/)?.[1]?.trim();
  // Match against directory geography, rather than splitting a glued street/city.
  const knownCities=['West Palm Beach','Loxahatchee','Lake Worth','Boca Raton','Jupiter','Delray Beach','Lantana','Royal Palm Beach','Boynton Beach'];
  city=knownCities.find(c=>address.includes(c+', Florida '));
  photo=content.querySelector('img[src^="/parks/SiteImages/Parks/"]')?.getAttribute('src');if(photo)photo=new URL(photo,url).href;
  if(!city||!/^\d+\s+/.test(address)||!address.endsWith(address.match(/Florida \d{5}$/)?.[0]||'__'))throw Error('County venue address changed');
 }else{
  content=d.querySelector('main')||d.body;name=clean(d.querySelector('h1#page-title')?.textContent);city='St. Petersburg';county='Pinellas';
  const section=[...d.querySelectorAll('.col-lg')].find(n=>/Complex Amenities/.test(n.textContent));amenities=clean(section?.textContent);if(!/\bsoccer\s+fields?\b/i.test(amenities))return null;
  // Use the official address link; do not accidentally capture footer offices.
  address=clean([...d.querySelectorAll('.bus-detail>span')].find(a=>/\bST\. PETERSBURG,\s*FL\s*\d{5}/i.test(a.textContent))?.textContent);
  photo=d.querySelector('img[src*="/images/sports/"]')?.getAttribute('src');
  if(photo){const original=new URL(photo,url);if(original.origin==='https://www.stpeteparksrec.org')photo='https://cms3.revize.com/revize/stpetersburgparks'+original.pathname+original.search}
  if(!address||!name||lead.nameHint&&key(lead.nameHint)!==key(name))throw Error('City complex identity or address changed');
 }
 if(mediaOverrides){
  const raw=parseHTML(html).document,override=mediaOverrides[url],agencyAlt={miami:'City of Miami - Logo',pbc:'Parks Logo',stpete:'navigation logo'}[kind];
  if(!override||override.mode==='agency'){photo=[...raw.querySelectorAll('img[src]')].find(i=>i.getAttribute('alt')===agencyAlt)?.getAttribute('src');imageUse='official-municipal-logo'}
  else{const normalize=s=>{const u=new URL(s,url);if(kind==='stpete'&&u.origin==='https://www.stpeteparksrec.org')return'https://cms3.revize.com/revize/stpetersburgparks'+u.pathname;return u.origin+u.pathname};if(![...raw.querySelectorAll('img[src]')].some(i=>normalize(i.getAttribute('src'))===normalize(override.url)))throw Error('Reviewed venue photo no longer appears on the official page');photo=override.url;imageUse='official-venue-photo'}
 }
 if(!name||name.length>180||!photo)throw Error('Municipal venue needs its actual name and photograph');
 const image=new URL(photo,url),officialCityCdn=kind==='stpete'&&image.origin==='https://cms3.revize.com'&&(image.pathname.startsWith('/revize/stpetersburgparks/images/sports/')||image.pathname==='/revize/stpetersburgparks/Park-and-Rec-Logo_BLACK.png');
 if(image.protocol!=='https:'||image.origin!==new URL(url).origin&&!officialCityCdn)throw Error('Venue photograph host changed');
 const text=clean(content.textContent),closed=/\b(?:closed|closure|construction)\b/i.test(text),notice=closed?'Check current field closures and construction notices on the official park page before visiting. ':'';
 return {slug:slug(name),name,type:'Place',city,county,region:floridaRegion(county),website:url,checkedOn:today,
  sources:[{url,textChecksum:digest(text)},{url:MUNICIPAL_DIRECTORIES[kind]}],sourceKind:'municipal-soccer-venue',sourceIdentity:kind+':'+new URL(url).pathname,
  summary:`Soccer fields at ${name} in ${city}. Check the official park page for access and reservations.`,
  overview:`${name} is listed by the ${kind==='pbc'?'Palm Beach County':kind==='miami'?'City of Miami':'City of St. Petersburg'} parks department with soccer-field facilities.`,
  address,ages:'Age rules depend on the activity or booking.',levels:'Soccer fields · activity level varies',audience:['Youth','Adult'],experience:[],programs:['Soccer fields','Field reservations'],
  priceNote:'Check current rental fees, permits and booking times with the parks department.',
  accessNotes:notice+'A field profile does not establish a scheduled pickup game, free access, an available booking or open registration. Check permits, closures and the rules for your activity.',
  originalImage:image.href,requireBadge:true,imageUse,sponsored:false,placementPriority:0};
}
