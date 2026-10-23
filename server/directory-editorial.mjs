import {officialHeaderLogo} from './club-logo.mjs';
export {officialHeaderLogo} from './club-logo.mjs';
import {createHash} from 'node:crypto';
import {parseHTML} from 'linkedom';
import {clubWebsiteIdentity} from './fysa-club-discovery.mjs';
import {validCarousel} from './instagram-media.mjs';

const sha=s=>createHash('sha256').update(s).digest('hex');
export const normalized=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function publicEditorialUrl(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&u.hostname.includes('.')&&!/^(?:\d+\.){3}\d+$/.test(u.hostname)&&!u.hostname.includes(':')&&!/(?:^|\.)(?:localhost|local|internal|test|invalid)$/.test(u.hostname)?u:null}catch{return null}}
const tags=[['Beginner',/\bbeginner\b/i],['Recreational',/\brecreation(?:al)?\b/i],['Academy',/\bacadem(?:y|ies)\b/i],['Competitive',/\bcompetitive\b/i],['Goalkeeper training',/\bgoalkeep(?:er|ing)\b/i],['Training',/\btraining\b/i]];
export function directoryClaims(profile,html){
 if(!clubWebsiteIdentity(html,profile.name))return null;
 const {document}=parseHTML(html);document.querySelectorAll('script,style,noscript').forEach(n=>n.remove());
 const text=String(document.body?.textContent||'').replace(/\s+/g,' '),plain=normalized(text);
 if(!plain.includes(normalized(profile.city))||/\b(?:permanently closed|ceased operations|club has closed|no longer operating|club is inactive|operations have ended)\b/i.test(text))return null;
 const info=profile.programs+' '+profile.levelLabel;
 return {name:profile.name,city:profile.city,tags:tags.filter(([,re])=>re.test(info)&&re.test(text)).slice(0,3).map(([label])=>label)};
}
export const directorySourceHash=p=>sha(JSON.stringify({slug:p.slug,name:p.name,city:p.city,website:p.website,checkedOn:p.checkedOn,claims:p.claims,image:p.image,imageIdentity:p.imageIdentity,badgeSource:p.badgeSource}));
export function directoryEligible(profile,{today,badges=[]}={}){
 const age=(Date.parse(today)-Date.parse(profile.checkedOn))/86400000;
 return profile.entity==='profile'&&profile.kind==='Club'&&!!profile.name&&profile.name.length<=95&&!!profile.city
  &&/^[a-z0-9-]+$/.test(profile.slug)&&profile.href==='/clubs/'+profile.slug&&publicEditorialUrl(profile.website)
  &&Number.isFinite(age)&&age>=0&&age<=30&&profile.website!=='https://www.fysa.com/play/'
  &&!/(?:\bII\b|\bU\d{1,2}\b|FIFA Ref Cup)/i.test(profile.name);
}
export function validDirectoryGuide(row){
 const p=row.directoryProfile,e=row.visualEvidence;
 if(!p||e?.kind!=='directory-guide'||!validCarousel(row,{hosted:true})||row.slides.length!==2||row.reel||!publicEditorialUrl(p.website))return false;
 const source=publicEditorialUrl(e.sourceUrl),capture=row.directoryCapture;
 return p.href==='/clubs/'+p.slug&&/^\/clubs\/[a-z0-9-]+$/.test(p.href)&&p.claims?.name===p.name&&p.claims?.city===p.city&&Array.isArray(p.claims?.tags)&&p.claims.tags.length<=3
  &&row.officialSourceUrl===p.website&&row.sourceHash===directorySourceHash(p)&&e.sourceHash===row.sourceHash
  &&source?.origin==='https://pioneering-friday-005497.framer.app'&&source.pathname===p.href
  &&/^[a-f0-9]{64}$/.test(p.imageIdentity||'')&&!!publicEditorialUrl(p.image)&&['reviewed-registry','official-site-logo'].includes(p.badgeSource)
  &&row.slides[0].assetRole==='official-badge'&&row.slides[1].assetRole==='cancha-profile'
  &&capture?.sourceUrl===e.sourceUrl&&/^[a-f0-9]{64}$/.test(capture.sha256||'')&&capture.width===1100&&capture.height===900
  &&Number.isFinite(Date.parse(capture.capturedAt))&&Number.isFinite(Date.parse(row.factsCheckedAt))
  &&Date.parse(p.checkedOn)<=Date.parse(row.factsCheckedAt)&&Date.parse(row.factsCheckedAt)-Date.parse(p.checkedOn)<31*86400000;
}
export async function confirmDirectorySource(row,{fetchImpl=fetch,now=Date.now()}={}){
 if(!validDirectoryGuide(row)||now-Date.parse(row.directoryProfile.checkedOn)>31*86400000||now-Date.parse(row.factsCheckedAt)>7*86400000)return false;
 let response;try{
  response=await fetchImpl(row.officialSourceUrl,{redirect:'manual',signal:AbortSignal.timeout(20000)});
  // Only a same-site www/canonical HTTPS redirect; never forward credentials.
  if([301,302,307,308].includes(response.status)){
   const old=new URL(row.officialSourceUrl),next=new URL(response.headers.get('location')||'',old);await response.body?.cancel();
   if(!publicEditorialUrl(next.href)||next.hostname.replace(/^www\./,'')!==old.hostname.replace(/^www\./,''))return false;
   response=await fetchImpl(next.href,{redirect:'error',signal:AbortSignal.timeout(20000)});
  }
  if(!response.ok||!/text\/html/i.test(response.headers.get('content-type')||'')){await response.body?.cancel();return false}
  const reader=response.body.getReader(),chunks=[];let bytes=0;try{while(true){const r=await reader.read();if(r.done)break;bytes+=r.value.length;if(bytes>2_000_000)return false;chunks.push(Buffer.from(r.value))}}finally{await reader.cancel()}
  const html=Buffer.concat(chunks).toString(),p=row.directoryProfile,claims=directoryClaims(p,html);
  if(p.badgeSource==='official-site-logo'&&officialHeaderLogo(html,p.website)!==p.image)return false;
  return !!claims&&p.claims.tags.every(t=>claims.tags.includes(t));
 }catch{return false}
}
export function selectDirectoryProfiles(catalog,previous,{today,badges=[],maximum=2,maximumCandidates=12}={}){
 const recent=previous.filter(r=>['Draft','Approved','Preparing','Publishing','Published','Needs reconciliation'].includes(r.status)&&(r.status!=='Draft'||Date.parse(today)-Date.parse(r.content?.factsCheckedAt)<7*86400000)&&(!r.published_at||Date.parse(today)-Date.parse(r.published_at)<30*86400000));
 const profiles=catalog.items.filter(p=>directoryEligible(p,{today,badges})),used=new Set(),out=[];
 const sourceHost=row=>{try{const u=new URL(row.directoryProfile?.website||row.officialSourceUrl);return u.hostname.replace(/^www\./,'')}catch{return''}};
 const ids=new Set(recent.map(r=>r.content?.visualEvidence?.subjectKey));
 const hosts=new Set(recent.map(r=>sourceHost(r.content||{})).filter(Boolean));
 const images=new Set(recent.map(r=>r.content?.directoryProfile?.imageIdentity).filter(Boolean));
 const day=Math.floor(Date.parse(today)/86400000),regions=['Central Florida','South Florida','Tampa Bay'];
 profiles.sort((a,b)=>((regions.indexOf(a.region)-day%3+3)%3)-((regions.indexOf(b.region)-day%3+3)%3)||a.name.localeCompare(b.name));
 const ordered=[];const groups=[...regions,'Other Florida'].map(r=>profiles.filter(p=>(regions.includes(p.region)?p.region:'Other Florida')===r));for(let i=0;i<profiles.length;i++)for(let j=0;j<groups.length;j++){const group=groups[(j+day)%groups.length];if(group[i])ordered.push(group[i])}
 for(const p of ordered){
  const key=sourceHost({directoryProfile:p});if(hosts.has(key)||used.has(key)||images.has(p.imageIdentity)||ids.has('directory:'+p.slug))continue;
  used.add(key);out.push(p);if(out.length>=maximumCandidates)break;
 }
 return out;
}
