import{parseHTML}from'linkedom';
import{createHash}from'node:crypto';
import{publicClubUrl}from'./fysa-club-discovery.mjs';
import{floridaRegion}from'./florida-club-discovery.mjs';
export const FASA_DIRECTORY='https://www.fasa.soccer/find-a-league';
export const SOCCER_SHOTS_DIRECTORY='https://www.soccershots.com/find-a-location/';
export const SOCCER_SHOTS_LOCATIONS='https://www.soccershots.com/wp-json/jpl-locator/v1/locations/?lat=28.5383&lng=-81.3792&radius=500';
export const SOCCER_SHOTS_LOGO='https://llp-assets.meetsoci.com/live/assets/soccershotssites/images/SS_Logo_Primary_CMYK_2021.png';
export const ORLANDO_SOCCER_FIELDS='https://www.orlando.gov/Parks-the-Environment/Reserve-an-Athletic-Field/Rentable-Soccer-Fields-in-Orlando';
const clean=v=>String(v||'').replace(/\s+/g,' ').trim();
const key=v=>clean(v).toLowerCase().replace(/[^a-z0-9]/g,'');
const slug=v=>clean(v).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const digest=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
function documentOf(html){const{document}=parseHTML(html);document.querySelectorAll('script,style,noscript').forEach(e=>e.remove());return document}
function locationFor(city,locations){return Object.entries(locations).map(([name,v])=>({city:v.city||name,...v})).find(v=>key(v.city)===key(city))||Object.entries(locations).map(([name,v])=>({city:v.city||name,...v})).find(v=>key(v.city)===key(city.replace(/^Saint\b/i,'St')))}
function profile({name,city,county,website,sources,...r},today){return{slug:slug(name),name,city,county,region:floridaRegion(county),website,sources,type:'Club',levels:'Confirm the specific program level',programs:[],ages:'Confirm program ages with the organizer.',audience:[],experience:[],checkedOn:today,sponsored:false,placementPriority:0,...r}}
export function parseFasaLeagues(html,{locations={},today,cityOverrides={}}={}){
 const d=documentOf(html);if(!/FASA AFFILIATED LEAGUES/.test(d.body.textContent))throw Error('FASA directory identity changed');const rows=[];let pending=[],image='';
 for(const n of d.querySelectorAll('[data-testid="richTextElement"],.wixui-image,[data-semantic-classname="button"]')){
  if(n.matches('.wixui-image')){image=n.querySelector('img')?.getAttribute('src')?.split('/v1/')[0]||'';continue}
  const link=n.querySelector('a[aria-label="Learn More"]');if(!link){pending.push(n);continue}
  const heading=pending.filter(p=>p.querySelector('h6')).at(-1),texts=pending.filter(p=>p.querySelector('p')).map(x=>clean(x.textContent)),rawCity=texts.find(t=>/\bFL\b|Central Florida/.test(t))||'';pending=[];if(!heading)continue;
  const name=clean(heading.textContent),override=cityOverrides[name],city=override?.city||rawCity.match(/^(.+?),?\s+FL\b/i)?.[1]?.replace(/,$/,'').trim(),loc=city&&locationFor(city,locations),website=publicClubUrl(link.getAttribute('href'));if(!loc||!website)continue;
  const identity={name,city:loc.city,website},sources=[{url:FASA_DIRECTORY,textChecksum:digest(identity)},{url:website}];
  rows.push(profile({name,city:loc.city,county:loc.county,website,sources,summary:`Adult league soccer through ${name} in the ${loc.city} area. Check current divisions and how to join with the organizer.`,ages:'Adult league. Division-specific minimum ages and eligibility need confirmation.',audience:['Adult'],programs:['Adult soccer league'],experience:[],levels:'Adult league · confirm division and level',address:`${loc.city}, Florida. FASA lists this league area; confirm the specific game venue and team before going.`,priceNote:'Ask the organizer about current league, team and player fees.',accessNotes:'FASA member-league identity only. Team registration, player recruitment, dates and available spaces require separate confirmation. This profile does not establish a scheduled pickup game.',overview:`${name} is listed in the Florida Adult Soccer Association league directory. Follow the organizer for current divisions and joining requirements.`,sourceKind:'fasa-league',sourceIdentity:website,originalImage:publicClubUrl(image),requireBadge:true,expectedCityText:override?.expectedCityText||null},today))
 }
 if(rows.length<3||rows.length>60)throw Error('FASA directory shape changed');return rows;
}
export function parseSoccerShotsLocations(data,{locations={},today,scopeCounties={}}={}){
 if(!Array.isArray(data)||data.length<10||data.length>3000||data.some(x=>typeof x!=='string'))throw Error('Soccer Shots locator schema changed');const groups=new Map();
 for(const raw of data){const d=documentOf(raw),node=d.querySelector('.locator-location'),a=d.querySelector('.cta-link a[href]'),address=d.querySelector('.locator-address');if(!node||!a||!address)continue;
  const lat=Number(node.getAttribute('data-lat')),lng=Number(node.getAttribute('data-lng'));if(!Number.isFinite(lat)||!Number.isFinite(lng)||lat<24||lat>31.1||lng< -87.7||lng> -79.7)continue;
  const lines=address.innerHTML.split(/<br\s*\/?\s*>/i).map(s=>clean(parseHTML('<html><head></head><body>'+s+'</body></html>').document.body.textContent)),line=lines.findLast(s=>/,\s*FL\s+\d{5}\b/.test(s)),city=line?.match(/^(.+?),\s*FL\s+\d{5}\b/)?.[1],loc=city&&locationFor(city,locations);if(!loc)continue;
  const website=new URL(a.getAttribute('href'),SOCCER_SHOTS_DIRECTORY);if(website.origin!=='https://www.soccershots.com'||!/^\/[a-z]+\/?$/.test(website.pathname))continue;website.pathname=website.pathname.replace(/\/?$/,'/');const path=website.pathname;
  if(scopeCounties[path]&&!scopeCounties[path].includes(loc.county))continue;
  const name=clean(a.textContent).replace(/^View\s+/,'').replace(/\s+website$/i,'').replace(/,?\s*FL$/,'').trim();if(!name)continue;
  const group=groups.get(path)||{name,website:website.href,places:new Map(),count:0};group.count++;group.places.set(loc.city,{...loc,count:(group.places.get(loc.city)?.count||0)+1});groups.set(path,group);
 }
 const rows=[];for(const[path,g]of groups){const places=[...g.places.values()].sort((a,b)=>b.count-a.count||a.city.localeCompare(b.city)),primary=places[0],cities=places.map(x=>x.city),name='Soccer Shots — '+g.name,identity={franchise:path,name,cities};rows.push(profile({name,city:primary.city,county:primary.county,website:g.website,sources:[{url:SOCCER_SHOTS_DIRECTORY},{url:SOCCER_SHOTS_LOCATIONS,textChecksum:digest(identity)},{url:g.website}],summary:`Soccer Shots youth classes listed around ${cities.slice(0,3).join(', ')}. Choose the class and venue through the provider.`,ages:'Provider-wide ages 2–8; younger toddler classes also offered. Confirm each local class age range.',audience:['Youth'],programs:['Introductory soccer','Preschool soccer','School-age soccer'],experience:['Beginner'],levels:'Introductory youth soccer',address:`Service-area reference: ${primary.city}, Florida. The official locator lists classes across ${cities.join(', ')}. This is a regional program profile, not a walk-on venue or a confirmed class schedule.`,priceNote:'Class prices, session dates and any registration fee are set by the local provider.',accessNotes:'Select a class and confirm current ages, dates and availability with the provider. Some school or childcare locations restrict participation to enrolled children. No private-school venue is listed here as a public park, and no open space is inferred from a locator entry.',overview:`${name} is a regional Soccer Shots program listed by the provider’s public location finder. National program descriptions cover toddlers, preschool and school-age children; local ages and offerings vary.`,sourceKind:'soccer-shots-franchise',sourceIdentity:path,originalImage:SOCCER_SHOTS_LOGO,requireBadge:true,serviceCities:cities},today))}if(rows.length<3||rows.length>50)throw Error('No supported Florida Soccer Shots regions');return rows;
}
export function parseOrlandoSoccerFields(html,{today}={}){
 const d=documentOf(html);if(!/Rentable Soccer Fields in Orlando/.test(d.body.textContent)||!/soccer fields you can reserve/i.test(d.body.textContent))throw Error('Orlando soccer directory identity changed');const rows=[];
 for(const a of d.querySelectorAll('article a[href]')){const name=clean(a.querySelector('h2.list-item-title')?.textContent),address=clean(a.querySelector('.list-item-address')?.textContent),website=publicClubUrl(a.getAttribute('href'));if(!name||!website?.startsWith('https://www.orlando.gov/Parks-the-Environment/Directory/')||!/, Orlando, FL \d{5}$/.test(address))continue;
  rows.push(profile({name,city:'Orlando',county:'Orange',website,sources:[{url:ORLANDO_SOCCER_FIELDS,textChecksum:digest({name,address,website})},{url:website}],type:'Place',summary:`City-listed soccer fields at ${name} in Orlando. Check reservations and access before going.`,ages:'Venue access varies by activity; confirm session age rules.',audience:['Youth','Adult'],programs:['Soccer fields','Field reservations'],experience:[],levels:'Venue · activity level varies',address,priceNote:'Check the City of Orlando for rental fees, permit requirements and available booking times.',accessNotes:'The City lists soccer fields that can be reserved on a first-come, first-served basis. A field listing is not permission for walk-on access, an open booking slot or a scheduled pickup game. Check the park page for closures and restrictions.',overview:`${name} appears in the City of Orlando rentable soccer-field directory. Use the official park and reservation pages to plan a visit.`,sourceKind:'orlando-soccer-field',sourceIdentity:website,originalImage:null,requireBadge:false},today))
 }if(rows.length<3||rows.length>40)throw Error('Orlando field directory schema changed');return rows;
}
export function expandedProfileIdentity(html,row){const d=documentOf(html),text=clean(d.body.textContent),branding=[d.title,...d.querySelectorAll('h1,h2,h3')].map(x=>clean(typeof x==='string'?x:x.textContent));if(/domain.{0,15}for sale|buy.it.now|online slots|sportsbook|casino|toto togel/i.test(text))return false;if(row.expectedCityText&&!new RegExp(row.expectedCityText,'i').test(text))return false;
 if(row.sourceKind==='soccer-shots-franchise'){const area=row.name.replace(/^Soccer Shots\s*—\s*/,''),tokens=area.toLowerCase().split(/[^a-z0-9]+/).filter(x=>x.length>2&&!['county','florida','southern','northern'].includes(x));return /Soccer Shots/i.test(text)&&/programs?/.test(text.toLowerCase())&&/18 months/.test(text)&&tokens.length>0&&branding.some(label=>tokens.every(t=>label.toLowerCase().includes(t)))}
 if(row.type==='Place')return branding.some(label=>key(label)===key(row.name));return null;
}
export function sharedOrganizationHost(website){try{const u=new URL(website);return !['www.soccershots.com','www.teamworkonline.com','app.teampass.com','www.facebook.com','www.fysa.com','clubs.bluesombrero.com'].includes(u.hostname)?u.hostname.replace(/^www\./,''):null}catch{return null}}

// The locator is a discovery lead, not enrollment evidence. Regional pages can
// independently establish a provider profile when its locator response changes.
export function soccerShotsRegionalProfile(html,seed,{today,locations={}}={}){
 const u=new URL(seed.website),loc=locationFor(seed.city,locations);
 if(u.origin!=='https://www.soccershots.com'||!/^\/[a-z]+\/$/.test(u.pathname)||!loc||loc.county!==seed.county||!seed.name?.startsWith('Soccer Shots — '))throw Error('Unreviewed regional provider seed');
 const d=documentOf(html),text=clean(d.body.textContent),row={...seed,sourceKind:'soccer-shots-franchise'};
 if(expandedProfileIdentity(html,row)!==true||!/18 months/i.test(text)||!/(?:8 years|8 year|18 months\s*[-–]\s*8)/i.test(text))throw Error('Regional provider identity or age evidence changed');
 const candidates=[seed.city,seed.county,...(seed.serviceCities||[])].map(key).filter(x=>x.length>3);
 if(!candidates.some(x=>key(text).includes(x)))throw Error('Regional provider geography could not be confirmed');
 const {places,school,contact,email,...publicSeed}=seed;
 return {...publicSeed,sourceKind:'soccer-shots-franchise',checkedOn:today,sourceIdentity:u.pathname,originalImage:SOCCER_SHOTS_LOGO,requireBadge:true,sponsored:false,placementPriority:0,sources:[{url:seed.website,textChecksum:createHash('sha256').update(html).digest('hex')},{url:SOCCER_SHOTS_DIRECTORY}],accessNotes:'Choose a class with the provider and confirm ages, dates, fees and availability. Some school or childcare sessions are restricted to enrolled children. This regional profile does not expose private-school venues or establish open registration.'};
}
