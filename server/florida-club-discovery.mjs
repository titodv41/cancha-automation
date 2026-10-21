// Narrow adapter for the public, structured UPSL Premier directory. A team
// profile establishes identity and league/location only, never open tryouts.
import {createHash} from 'node:crypto';
const clean=s=>String(s||'').replace(/&amp;/g,'&').replace(/&#0*39;|&apos;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
export const clubIdentity=s=>clean(s).toLowerCase().replace(/[^a-z0-9]/g,'');
export function floridaRegion(county){return ['Miami-Dade','Broward','Palm Beach'].includes(county)?'South Florida':['Orange','Osceola','Seminole','Lake','Brevard','Polk','Volusia','Marion'].includes(county)?'Central Florida':['Hillsborough','Pinellas','Pasco'].includes(county)?'Tampa Bay':['Lee','Collier','Charlotte','Sarasota','Manatee'].includes(county)?'Southwest Florida':['Duval','Leon','St. Johns','Clay','Alachua','Columbia','Nassau','Bay','Okaloosa','Santa Rosa','Taylor','Escambia','Walton','Putnam','Bradford','Flagler','Gadsden'].includes(county)?'North Florida':'Other Florida';}
export function parseUpslDirectory(html,{today=new Date().toISOString().slice(0,10),locations={},division='Premier'}={}){
 if(!/<title[^>]*>[^<]*Teams/i.test(html)||!html.includes('data-team-state-initials'))throw Error('UPSL directory structure changed');
 if(!['Premier','Division 1'].includes(division))throw Error('Unsupported UPSL division');const host=division==='Premier'?'premier.upsl.com':'division1.upsl.com';
 const rows=[],seen=new Set(),year=today.slice(0,4);
 for(const match of html.matchAll(/<div\s+class="cell[^>]*teams__card--container[^>]+>([\s\S]*?)<\/a>/g)){
  const block=match[0],attrs=Object.fromEntries([...block.matchAll(/(data-[\w-]+)="([^"]*)"/g)].map(x=>[x[1],clean(x[2])]));
  if(attrs['data-team-state-initials']!=='FL'||attrs['data-team-status']!=='In Season'||attrs['data-team-division']!==division||!attrs['data-seasons']?.includes(year))continue;
  const name=attrs['data-team-name'],rawCity=attrs['data-team-city'],location=locations[rawCity];if(!name||!location)continue;
  const url=block.match(new RegExp('<a href="(https://'+host.replaceAll('.','\\.')+'/teams/[a-z0-9-]+/)">'))?.[1],originalImage=block.match(/background-image:url\((https:\/\/upsl\.com\/wp-content\/uploads\/[^)]+)\)/)?.[1];
  if(!url||!originalImage||!/\.(png|jpe?g|webp)$/i.test(originalImage)||seen.has(url))continue;seen.add(url);
  const youth=/\bU(?:17|19|20|21)\b|academy/i.test(name),summary=`${name} is listed in the UPSL ${division} ${attrs['data-team-conference']} conference for ${attrs['data-seasons']}. Explore the team and confirm its player pathway directly.`,slug=name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  rows.push({slug,name,type:'Club',city:location.city||rawCity,county:location.county,region:floridaRegion(location.county),website:url,sources:[{url,textChecksum:createHash('sha256').update(block).digest('hex')},{url:'https://'+host+'/teams/'}],summary,ages:'Team age eligibility and recruitment requirements are not established by the league directory. Confirm with the team.',levels:'UPSL '+division+' competitive pathway. League membership does not guarantee a professional contract.',programs:['UPSL',division,'Competitive soccer',...(youth?['Academy pathway']:[])],address:`${location.city||rawCity}, Florida. Exact training and match venues must be confirmed with the team.`,priceNote:'Fees, player arrangements and any evaluation costs are not established by the league directory.',accessNotes:'Official league profile only. Contact the team through its published channels for recruitment, training locations and current eligibility. No open tryout, available roster spot, paid contract or walk-on access is promised.',overview:summary,audience:/\bU(?:17|19)\b/.test(name)?['Youth']:['Youth','Adult'],experience:['Competitive'],checkedOn:today,sponsored:false,placementPriority:0,originalImage,sourceKind:'upsl-directory',sourceIdentity:attrs['data-team-id'],season:attrs['data-seasons']});
 }
 if(!rows.length)throw Error('No supported current Florida teams returned');return rows;
}
export function newClubProfiles(rows,existing,{limit=10}={}){
 const slugs=new Set(existing.map(x=>x.slug)),names=new Set(existing.map(x=>clubIdentity(x.name))),urls=new Set(existing.map(x=>x.source));
 return rows.filter(x=>!slugs.has(x.slug)&&!names.has(clubIdentity(x.name))&&!urls.has(x.website)).slice(0,limit);
}
