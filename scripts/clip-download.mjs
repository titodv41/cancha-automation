import {readFile,writeFile} from 'node:fs/promises';import {pathToFileURL} from 'node:url';import {resolve} from 'node:path';
// Cleared-video downloader guard (owner, Oct 29): only videos recorded in config/clip-permissions.json are ever
// downloaded. Each entry needs a YouTube id, a creator, a credit line and a dated record of how it was cleared
// (Creative Commons, or the creator's OK relayed by the owner). Prints one URL per line for yt-dlp.
const ID=/^[A-Za-z0-9_-]{11}$/,LICENSES=new Set(['cc-by','creator-ok']);
export function clearedVideos(config){
 return (config?.videos||[]).filter(v=>ID.test(v?.id||'')&&LICENSES.has(v.license)&&v.creator&&v.credit&&/^\d{4}-\d{2}-\d{2}$/.test(v.permission?.recordedOn||'')&&v.permission?.how);
}
export function downloadList(config,requested=''){
 const cleared=clearedVideos(config),want=String(requested).split(/[\s,]+/).filter(Boolean);
 const refused=want.filter(id=>!cleared.some(v=>v.id===id));if(refused.length)throw Error('Not in the permission list: '+refused.join(', '));
 return (want.length?cleared.filter(v=>want.includes(v.id)):cleared).map(v=>'https://www.youtube.com/watch?v='+v.id);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const config=JSON.parse(await readFile('config/clip-permissions.json','utf8'));
 const urls=downloadList(config,process.env.IDS);await writeFile(process.argv[2]||'/dev/stdout',urls.join('\n')+'\n');
 console.error(JSON.stringify({cleared:clearedVideos(config).length,queued:urls.length}));
}
