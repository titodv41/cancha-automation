import {readdir,readFile,writeFile} from 'node:fs/promises';import {execFileSync} from 'node:child_process';import {join} from 'node:path';import {createHash} from 'node:crypto';
// Shot planning for creator cuts: for each downloaded cleared video, a timestamped contact sheet (one frame every
// STEP seconds) hosted on Framer, plus the auto-caption text with timestamps, printed to the log. Only videos already
// in config/clip-permissions.json are ever downloaded, so this only previews cleared material.
const dir=process.argv[2]||'private-data/clips',STEP=Number(process.env.PREVIEW_STEP||6);
const cleared=new Set(JSON.parse(await readFile('config/clip-permissions.json','utf8')).videos.map(v=>v.id));
const vtt=t=>{const out=[];let last='';for(const block of t.split(/\n\n+/)){const m=block.match(/(\d\d):(\d\d):(\d\d)\.\d+ -->/);if(!m)continue;
 const text=block.split('\n').slice(1).join(' ').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();if(!text||text===last)continue;last=text;out.push(`${+m[1]*3600+ +m[2]*60+ +m[3]}s ${text}`);}return out;};
const files=await readdir(dir),sheets=[];
for(const f of files.filter(f=>/^[\w-]{11}\.mp4$/.test(f))){const id=f.slice(0,11);if(!cleared.has(id))continue;
 const sheet=join(dir,`${id}-sheet.jpg`);
 execFileSync('ffmpeg',['-v','error','-y','-i',join(dir,f),'-vf',`fps=1/${STEP},scale=320:-2,drawtext=text='%{pts\\:hms}':x=6:y=6:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6,tile=6x12`,'-frames:v','1','-q:v','4',sheet]);
 // Videos longer than 72 frames get further sheets.
 const dur=Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',join(dir,f)]).toString());
 const extra=[];for(let start=72*STEP;start<dur;start+=72*STEP){const p=join(dir,`${id}-sheet-${start}.jpg`);
  execFileSync('ffmpeg',['-v','error','-y','-ss',String(start),'-i',join(dir,f),'-vf',`fps=1/${STEP},scale=320:-2,drawtext=text='%{pts\\:hms}+${start}s':x=6:y=6:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6,tile=6x12`,'-frames:v','1','-q:v','4',p]);extra.push(p);}
 sheets.push({id,dur:Math.round(dur),paths:[sheet,...extra]});
 const subs=files.filter(x=>x.startsWith(id)&&x.endsWith('.vtt'));
 for(const s of subs.slice(0,1)){console.log(`\n=== ${id} captions (${s}) ===`);console.log(vtt(await readFile(join(dir,s),'utf8')).join('\n'));}
}
if(sheets.length&&process.env.FRAMER_API_KEY){const {withProject}=await import('./project-session.mjs');
 await withProject(async fr=>{for(const s of sheets){s.urls=[];for(const p of s.paths){const bytes=await readFile(p);
  const img=await fr.uploadImage({name:`cancha-clip-preview-${s.id}-${createHash('sha256').update(bytes).digest('hex').slice(0,8)}`,image:{bytes:new Uint8Array(bytes),mimeType:'image/jpeg'}});s.urls.push(img.url);}}});}
console.log('\n'+JSON.stringify({previews:sheets.map(s=>({id:s.id,seconds:s.dur,stepSeconds:STEP,sheets:s.urls||s.paths}))}));
await writeFile(join(dir,'preview.json'),JSON.stringify(sheets,null,1));
