import {readFile,writeFile} from 'node:fs/promises';import {pathToFileURL} from 'node:url';import {resolve} from 'node:path';
// Cleared-video downloader guard (owner, Oct 29): only videos recorded in config/clip-permissions.json are ever
// downloaded. Each entry needs a YouTube id, a creator, a credit line and a dated record of how it was cleared
// (Creative Commons, or the creator's OK relayed by the owner). Prints one URL per line for yt-dlp.
// 'pending-owner' (owner, Nov 6): download and build drafts now; the owner asks the creator. Posting refuses such footage
// (server/short-reels.mjs) until the entry becomes 'creator-ok' with the date and how the creator said yes.
const ID=/^[A-Za-z0-9_-]{11}$/,LICENSES=new Set(['cc-by','creator-ok','pending-owner']);
// Cancha's own footage (owner, Nov 11: "stuff related to the app"): screen recordings of the Cancha app, committed under
// content/instagram/own-footage with a checksum. Nothing third-party, so no creator OK is needed; never fetched from YouTube.
const OWN_ID=/^cancha-[a-z0-9-]{3,40}$/,OWN_FILE=/^content\/instagram\/own-footage\/cancha-[a-z0-9-]{3,40}\.mp4$/;
const ownEntry=v=>v?.license==='cancha-own'&&OWN_ID.test(v.id||'')&&OWN_FILE.test(v.file||'')&&v.file==='content/instagram/own-footage/'+v.id+'.mp4'&&/^[a-f0-9]{64}$/.test(v.sha256||'')&&v.creator==='Cancha';
export function ownFootage(config){return (config?.videos||[]).filter(v=>ownEntry(v)&&v.credit&&/^\d{4}-\d{2}-\d{2}$/.test(v.permission?.recordedOn||'')&&v.permission?.how);}
export function clearedVideos(config){
 return [...(config?.videos||[]).filter(v=>ID.test(v?.id||'')&&LICENSES.has(v.license)&&v.creator&&v.credit&&/^\d{4}-\d{2}-\d{2}$/.test(v.permission?.recordedOn||'')&&v.permission?.how),...ownFootage(config)];
}
export function downloadList(config,requested=''){
 const cleared=clearedVideos(config),want=String(requested).split(/[\s,]+/).filter(Boolean);
 const refused=want.filter(id=>!cleared.some(v=>v.id===id));if(refused.length)throw Error('Not in the permission list: '+refused.join(', '));
 return (want.length?cleared.filter(v=>want.includes(v.id)):cleared).filter(v=>v.license!=='cancha-own').map(v=>'https://www.youtube.com/watch?v='+v.id);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const config=JSON.parse(await readFile('config/clip-permissions.json','utf8'));
 const urls=downloadList(config,process.env.IDS);await writeFile(process.argv[2]||'/dev/stdout',urls.join('\n')+'\n');
 console.error(JSON.stringify({cleared:clearedVideos(config).length,queued:urls.length}));
}
