import {spawnSync} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const voiceEnv=process.env.CANCHA_FREE_VOICE_ENV_DIR||join(root,'private-data/free-voice-venv');
const captionEnv=process.env.CANCHA_CAPTION_ENV_DIR||join(root,'private-data/caption-venv');
const run=(exe,args,extra={})=>{const result=spawnSync(exe,args,{cwd:root,stdio:'inherit',env:{...process.env,HF_HUB_CACHE:join(root,'private-data/pocket-cache'),HF_XET_CACHE:join(root,'private-data/pocket-cache/xet'),HF_HUB_DISABLE_XET:'1',OMP_NUM_THREADS:'2',...extra}});if(result.status!==0)throw Error('Local content tool stopped; inspect its output. No paid provider is used.');};
const action=process.argv[2]||'audition',args=process.argv.slice(3);
if(action==='setup'){
 const py=process.env.CANCHA_PYTHON||'python3';
 run(py,['-c','import sys; assert sys.version_info[:2]==(3,12), "Use Python 3.12 for these pinned tools"']);
 await mkdir(join(root,'private-data/python-wheel-cache'),{recursive:true});
 for(const dir of[voiceEnv,captionEnv])run(py,['-m','venv',dir]);
 const install=(dir,extra)=>run(join(dir,'bin/python'),['-m','pip','install','--disable-pip-version-check','--cache-dir',join(root,'private-data/python-wheel-cache'),...extra]);
 install(voiceEnv,['torch==2.6.0+cpu','--index-url','https://download.pytorch.org/whl/cpu']);
 install(voiceEnv,['-r','video/audio/free-voice-requirements.txt']);
 install(captionEnv,['-r','video/audio/caption-requirements.txt']);
}else if(action==='audition')run(join(voiceEnv,'bin/python'),['video/audio/free-voice-auditions.py']);
else if(action==='transcribe'){
 if(!args.length)throw Error('Supply local audio/video paths for editable caption drafts');
 run(join(captionEnv,'bin/python'),['video/audio/transcribe-local.py',...args]);
}else throw Error('Use setup, audition or transcribe');
