import {validReel} from './instagram-media.mjs';
import {localNewsSources,officialNewsUrl,updateSourceHash,confirmLocalUpdate} from './local-updates.mjs';
import {validAutomaticScript,NEWS_TECHNIQUES} from './automatic-story.mjs';
export function validAutomatedNewsVideo(row){
 const e=row.visualEvidence,a=row.audioEvidence,n=row.newsEntry,source=localNewsSources.find(s=>s.id===n?.sourceId);
 if(e?.kind!=='news-film'||!source||!officialNewsUrl(n.url,source)||n.sourceHash!==updateSourceHash(n)||!validAutomaticScript(row.spokenStory,n)||!row.reel||!validReel(row))return false;
 return row.officialSourceUrl===n.url&&row.sourceHash===n.sourceHash&&e.sourceHash===n.sourceHash&&e.sourceUrl===n.url&&e.videoChecksum===row.reel.assetChecksum
  &&a?.originalMusic===true&&a.sourceClipAudioUsed===false&&a.scriptHash===row.spokenStory.scriptHash
  &&(a.provider==='elevenlabs'&&a.voice==='Chris'&&a.model==='eleven_v3'&&a.syntheticNarration===true&&a.ownerUseAuthorization==='owner-chat-2026-10-24-automatic-stories'&&/^[a-f0-9]{64}$/.test(a.audioSha256||'')
   ||a.provider==='none'&&a.captionOnly===true&&a.syntheticNarration===false&&a.ownerUseAuthorization==='owner-chat-2026-10-27-club-reels'&&!!mediaCredit(n)&&String(row.caption||'').includes(mediaCredit(n)))
  &&NEWS_TECHNIQUES.includes(row.creativeTechnique)&&row.subjectMedia?.length>0&&row.subjectMedia.every(m=>['clip','photo'].includes(m.kind)&&m.sourcePage===n.url&&m.authorization==='owner-cleared-2026-10-22'&&/^[a-f0-9]{64}$/.test(m.sha256||'')&&(m.kind==='clip'?n.clips:n.photos).includes(m.originalUrl));
}
// Credit line for club media (owner, Oct 27): names the club and its official Instagram (from the club's own site) and invites a takedown.
export function mediaCredit(entry){const source=localNewsSources.find(s=>s.id===entry?.sourceId);if(!source)return '';
 return `📸 Photos and video: ${source.organization}${source.instagram?' @'+source.instagram:''} (official club media). Your content? DM us to change the credit or have it removed.`;}
export const collabHandle=entry=>localNewsSources.find(s=>s.id===entry?.sourceId)?.instagram||null;
export const automatedNewsAllowed=(row,policy)=>policy.automatedNewsVideoEnabled===true&&validAutomatedNewsVideo(row);
export async function confirmAutomatedNewsVideo(row,options={}){
 if(!validAutomatedNewsVideo(row))return false;
 const fetchHtml=options.fetchHtml||(async url=>{const response=await (options.fetchImpl||fetch)(url,{redirect:'error',signal:AbortSignal.timeout(20000)});if(!response.ok||!/text\/html/.test(response.headers.get('content-type')||''))throw Error('Official news source unavailable');const reader=response.body.getReader(),chunks=[];let bytes=0;try{while(true){const r=await reader.read();if(r.done)break;bytes+=r.value.length;if(bytes>2000000)throw Error('Official news source too large');chunks.push(Buffer.from(r.value))}}finally{await reader.cancel()}return Buffer.concat(chunks)});
 return confirmLocalUpdate(row.newsEntry,{fetchHtml,now:options.now});
}
// Production gate for automatic club Reels: a draft buffer and a daily cap. Drafts the editorial policy retired
// will never post, so they neither fill the buffer nor use the day's allowance.
export function newsProductionBlocked(queue,{retired=[],draftBuffer,maxPerDay,today,now=Date.now(),dayOf}){
 const live=queue.filter(r=>r.parsed?.visualEvidence?.kind==='news-film'&&!retired.includes(r.id));
 const pending=live.filter(r=>['Draft','Approved','Preparing'].includes(r.status)&&Date.parse(r.parsed.newsEntry?.expiresAt)>now);
 return pending.length>=draftBuffer||live.filter(r=>dayOf(r.parsed.visualEvidence.renderedAt)===today).length>=maxPerDay;
}
