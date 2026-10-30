import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parseHTML} from 'linkedom';
export const localNewsSources=JSON.parse(readFileSync(new URL('../config/local-news-sources.json',import.meta.url)));
export const text=value=>String(value||'').normalize('NFKC').replace(/\s+/g,' ').trim();
export const normalize=value=>text(value).toLowerCase().replace(/[’‘]/g,"'").replace(/[–—]/g,'-');
const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function officialNewsUrl(value,source){
 try{const u=new URL(value,source.indexUrl);return u.protocol==='https:'&&u.hostname===source.host&&!u.username&&!u.password&&!u.port&&/^\/news\/\d{4}\/\d{2}\/\d{2}\/[a-z0-9-]+\/$/.test(u.pathname)&&!u.search?u:null}catch{return null}
}
export function newsDate(url){const m=new URL(url).pathname.match(/\/news\/(\d{4})\/(\d{2})\/(\d{2})\//);if(!m)return NaN;const value=`${m[1]}-${m[2]}-${m[3]}`;const date=Date.parse(value+'T12:00:00Z');return Number.isFinite(date)&&new Date(date).toISOString().slice(0,10)===value?date:NaN;}
export function discoverNewsLinks(html,source,{now=Date.now(),maxAgeDays=14,limit=3}={}){
 const{document}=parseHTML(html),urls=new Set();
 for(const a of document.querySelectorAll('a[href]')){const u=officialNewsUrl(a.getAttribute('href'),source);if(!u)continue;const date=newsDate(u.href);if(Number.isFinite(date)&&date<=now+12*3600000&&now-date<maxAgeDays*86400000)urls.add(u.href)}
 return [...urls].sort((a,b)=>newsDate(b)-newsDate(a)).slice(0,limit);
}
const mediaUrl=(value,source)=>{try{const u=new URL(value,source.indexUrl);return u.protocol==='https:'&&u.hostname===source.host&&!u.username&&!u.password&&!u.port&&u.pathname.startsWith('/wp-content/uploads/')?u:null}catch{return null}};
export function extractLocalUpdate(url,html,source,{now=Date.now()}={}){
 const u=officialNewsUrl(url,source);if(!u)return null;
 const date=newsDate(u.href);if(!Number.isFinite(date)||date>now+12*3600000||now-date>14*86400000)return null;
 const{document}=parseHTML(html),title=text(document.querySelector('h1')?.textContent);
 if(title.length<12||title.length>160||/\b(?:official.*partner|signage partner|printing partner|sponsor announcement)\b/i.test(title))return null;
 const body=document.querySelector('.entry-content')||document.querySelector('.article-content')||document.querySelector('.article-body')||document.querySelector('article');if(!body)return null;
 const photos=[],clips=[];
 const addPhoto=value=>{const image=mediaUrl(value,source);if(image&&!/\b(?:logo|sponsor|shadow-onblue|icon|badge|evergreen|marketing|outdoor|banner)\b/i.test(image.pathname)&&!photos.some(x=>new URL(x).pathname===image.pathname))photos.push(image.href)};
 addPhoto(document.querySelector('meta[property="og:image"]')?.getAttribute('content'));
 addPhoto(document.querySelector('article img[src]')?.getAttribute('src'));
 for(const img of body.querySelectorAll('img[src]'))addPhoto(img.getAttribute('src'));
 for(const video of body.querySelectorAll('video[src],video source[src]')){const clip=mediaUrl(video.getAttribute('src'),source);if(clip&&/\.mp4$/i.test(clip.pathname)&&!/(?:istock|stock|generic|background)/i.test(clip.pathname)&&!clips.includes(clip.href))clips.push(clip.href)}
 body.querySelectorAll('script,style,nav,header,footer,form,noscript,aside').forEach(n=>n.remove());
 const paragraphs=[...body.querySelectorAll('p')].map(p=>text(p.textContent)).filter(p=>p.split(' ').length>=8&&!/^(?:MATCH HIGHLIGHTS|Share|Subscribe|Copyright)/i.test(p));
 if(!paragraphs.length||!photos.length&&!clips.length)return null;
 const entry={id:'club-news-'+sha(u.href).slice(0,20),url:u.href,title,organization:source.organization,city:source.city,region:source.region,publishedOn:new Date(date).toISOString().slice(0,10),publishedAt:new Date(date).toISOString(),checkedAt:new Date(now).toISOString(),expiresAt:new Date(Math.min(date+14*86400000,now+72*3600000)).toISOString(),sourceId:source.id,paragraphs:paragraphs.slice(0,16),photos:photos.slice(0,4),clips:clips.slice(0,3)};
 entry.sourceHash=updateSourceHash(entry);return entry;
}
export function updateSourceHash(entry){return sha({url:entry.url,title:entry.title,publishedOn:entry.publishedOn,organization:entry.organization,paragraphs:entry.paragraphs,photos:entry.photos,clips:entry.clips})}
export function publicLocalUpdates(entries,{now=Date.now()}={}){
 return entries.filter(e=>localNewsSources.some(s=>s.id===e.sourceId&&s.organization===e.organization&&officialNewsUrl(e.url,s))&&e.sourceHash===updateSourceHash(e)&&Date.parse(e.expiresAt)>now&&Date.parse(e.checkedAt)<=now+60000).slice(0,8).map(e=>({id:e.id,title:e.title,url:e.url,organization:e.organization,city:e.city,region:e.region,publishedOn:e.publishedOn,checkedAt:e.checkedAt,expiresAt:e.expiresAt,image:e.photos[0]||'',kind:'Club news'}));
}
export async function confirmLocalUpdate(entry,{fetchHtml,now=Date.now()}={}){
 const source=localNewsSources.find(s=>s.id===entry?.sourceId);if(!source||entry.sourceHash!==updateSourceHash(entry)||Date.parse(entry.expiresAt)<=now||Date.parse(entry.checkedAt)>now+60000)return false;
 const fresh=extractLocalUpdate(entry.url,(await fetchHtml(entry.url)).toString(),source,{now});
 return !!fresh&&fresh.sourceHash===entry.sourceHash;
}

export function localNewsEvents(entries,{now=Date.now()}={}){
 const months=['january','february','march','april','may','june','july','august','september','october','november','december'],out=[];
 for(const e of entries){
  if(!publicLocalUpdates([e],{now}).length||!/preview/i.test(e.title))continue;
  const paragraph=e.paragraphs.slice(0,3).find(p=>normalize(p).includes(normalize(e.city))&&/\b(?:ET|EST|EDT)\b/.test(p));if(!paragraph)continue;
  const m=paragraph.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:,\s*(20\d{2}))?,?\s+(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)\s*(ET|EST|EDT)\b/i);if(!m)continue;
  const year=Number(m[3]||e.publishedOn.slice(0,4)),month=months.indexOf(m[1].toLowerCase()),day=Number(m[2]),hours=Number(m[4])%12+(/^p/i.test(m[6])?12:0),minutes=Number(m[5]||0),guess=Date.UTC(year,month,day,hours,minutes),zone=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',timeZoneName:'shortOffset'}).formatToParts(guess).find(p=>p.type==='timeZoneName').value,offset=Number(zone.match(/GMT([+-]\d+)/)?.[1]||0),starts=guess-offset*3600000;
  if(Number(m[4])<1||Number(m[4])>12||minutes>59||day<1||new Date(guess).getUTCMonth()!==month||new Date(guess).getUTCDate()!==day||starts<=now||starts>now+30*86400000)continue;
  const venue=paragraph.slice(m.index+m[0].length).trim().replace(/^[,|–—\s]+/,'').slice(0,140);
  if(!venue||!normalize(venue).includes(normalize(e.city)))continue;
  out.push({id:e.id+'-date',title:e.title.replace(/^preview:\s*/i,''),organization:e.organization,city:e.city,venue,startsAt:new Date(starts).toISOString(),expiresAt:new Date(Math.min(starts,Date.parse(e.expiresAt))).toISOString(),url:e.url,image:e.photos[0]||'',kind:'Match date',checkedAt:e.checkedAt});
 }
 return out.sort((a,b)=>a.startsAt.localeCompare(b.startsAt));
}
