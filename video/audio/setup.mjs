import {readFile,access,mkdir} from 'node:fs/promises';import {createHash} from 'node:crypto';import{spawnSync}from'node:child_process';import{resolve,dirname}from'node:path';
const here=import.meta.dirname,python=process.env.CANCHA_VOICE_PYTHON||'/tmp/cancha-voice-venv/bin/python',models=process.env.CANCHA_VOICE_MODELS||'/tmp/cancha-voice-models';
const run=(exe,args)=>{const r=spawnSync(exe,args,{stdio:'inherit'});if(r.status!==0)throw Error('Voice setup stopped: '+exe)};
try{await access(python)}catch{run('python',['-m','venv',dirname(dirname(python))]);run(python,['-m','pip','install','--cache-dir','/tmp/cancha-pip-cache','-r',resolve(here,'requirements.txt')])}
run(python,['-c','import kokoro_onnx,soundfile']);await mkdir(models,{recursive:true});
const lock=JSON.parse(await readFile(resolve(here,'model-lock.json')));for(const item of lock.files){try{await access(resolve(models,item.name))}catch{run('gh',['release','download','model-files-v1.1','--repo','thewh1teagle/kokoro-onnx','--pattern',item.name,'--dir',models])}const bytes=await readFile(resolve(models,item.name));if(createHash('sha256').update(bytes).digest('hex')!==item.sha256)throw Error('Model checksum changed; review the upstream release')}
console.log('Local voice dependencies and pinned models ready; no paid API configured');
