"""Local, generic off-screen narration; no cloned person or paid API."""
import sys, json, os, hashlib
from pathlib import Path
import onnxruntime as rt
rt.disable_telemetry_events()
from kokoro_onnx import Kokoro
import soundfile as sf
story=json.loads(Path(sys.argv[1]).read_text())
out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True)
models=Path(os.environ.get('CANCHA_VOICE_MODELS','/tmp/cancha-voice-models'))
options=rt.SessionOptions();options.log_severity_level=3;options.intra_op_num_threads=2;options.inter_op_num_threads=1
model_file=story.get('voiceModel','kokoro-v1.0.onnx')
lock=json.loads(Path(__file__).with_name('model-lock.json').read_text())
for name in [model_file,'voices-v1.0.bin']:
    pinned=next((x for x in lock['files'] if x['name']==name),None)
    if not pinned or hashlib.sha256((models/name).read_bytes()).hexdigest()!=pinned['sha256']:raise ValueError('Voice model checksum mismatch')
session=rt.InferenceSession(str(models/model_file),sess_options=options,providers=['CPUExecutionProvider'])
k=Kokoro.from_session(session,str(models/'voices-v1.0.bin'))
blend=story.get('voiceBlend',{story.get('voice','af_heart'):1})
if abs(sum(blend.values())-1)>1e-6 or any(v<0 for v in blend.values()):raise ValueError('Voice blend must sum to one')
style=sum(k.get_voice_style(name)*weight for name,weight in blend.items())
proof=[]
for i,part in enumerate(story['narration']):
    audio,sr=k.create(part['text'],voice=style,speed=part.get('speed',1.02),lang='en-us',sentence_pause=.16,clause_pause=.07)
    seconds=len(audio)/sr
    next_start=story['narration'][i+1]['start'] if i+1<len(story['narration']) else story['durationSeconds']
    if part['start']+seconds>next_start-.08:raise ValueError('Narration overlaps the next beat; shorten copy')
    path=out/f'voice-{i}.wav';sf.write(path,audio,sr,subtype='PCM_16')
    proof.append({**part,'file':str(path),'durationSeconds':seconds,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
    print(f'Voice beat {i+1}: {seconds:.2f}s',flush=True)
(out/'narration-proof.json').write_text(json.dumps({'provider':'Kokoro ONNX','modelLicense':'Apache-2.0','modelFile':model_file,'modelChecksum':hashlib.sha256((models/model_file).read_bytes()).hexdigest(),'voice':story.get('voice','af_heart'),'voiceBlend':blend,'synthetic':True,'offScreenNarrator':True,'parts':proof},indent=2))
