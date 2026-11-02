import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const [storyFile,out]=process.argv.slice(2),story=JSON.parse(await readFile(storyFile)),proof=JSON.parse(await readFile(out+'/narration-proof.json'));
const sr=48000,length=Math.ceil(story.durationSeconds*sr),voice=new Float32Array(length),active=new Uint8Array(length);
for(const part of proof.parts){
 const run=spawnSync('ffmpeg',['-v','error','-i',part.file,'-af','highpass=f=75,lowpass=f=11500,acompressor=threshold=0.12:ratio=2:attack=15:release=100','-f','f32le','-ac','1','-ar',String(sr),'pipe:1'],{maxBuffer:96_000_000});if(run.status!==0)throw Error('Voice decoding failed');
 const samples=new Float32Array(run.stdout.buffer,run.stdout.byteOffset,run.stdout.length/4),offset=Math.round(part.start*sr);let peak=.001;for(const value of samples)peak=Math.max(peak,Math.abs(value));const gain=.62/peak;
 for(let i=0;i<samples.length&&offset+i<length;i++){voice[offset+i]+=samples[i]*gain;active[offset+i]=1}
}
// Original 126 BPM house bed: four-on-floor kick, swung hats, syncopated bass,
// bright chord stabs and a stereo pluck. No sampled recording.
const cinematic=story.music?.style==='cinematic',bpm=story.music?.bpm||(cinematic?84:126),beat=60/bpm,roots=[110,87.307,130.813,97.999],notes=[0,7,12,15,7,12,19,10];
let seed=20261022,lowNoise=0,duck=0,peak=0;
const noise=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/2147483648-1};
const sine=(hz,t)=>Math.sin(2*Math.PI*hz*t),wav=Buffer.alloc(44+length*4);
wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(2,22);wav.writeUInt32LE(sr,24);wav.writeUInt32LE(sr*4,28);wav.writeUInt16LE(4,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(length*4,40);
for(let i=0;i<length;i++){
 const t=i/sr,p=t%beat,step=Math.floor(t/(beat/2)),bar=Math.floor(t/(beat*4)),root=roots[bar%4],swing=step%2?.026:0,hatTime=Math.max(0,t%(beat/2)-swing),n=noise();lowNoise+=.09*(n-lowNoise);const brightNoise=n-lowNoise;
 const fade=Math.max(0,Math.min(1,t/.06,(story.durationSeconds-t)/.65)),sidechain=.42+.58*(1-Math.exp(-p*13));
 const kick=(Math.sin(2*Math.PI*(43*p+6*(1-Math.exp(-p*46))))*Math.exp(-p*23)+brightNoise*Math.exp(-p*300)*.15)*.29;
 const clap=(Math.floor(t/beat)%2===1?brightNoise*Math.exp(-p*38)*.135:0);
 const hats=brightNoise*Math.exp(-hatTime*(step%2?58:115))*(step%2?.052:.033);
 const bassTime=(t+beat*.24)%(beat/2),bass=(sine(root/2,t)+.22*sine(root,t))*.105*Math.exp(-bassTime*9)*sidechain;
 const chordTime=(t+beat*.5)%beat,minor=bar%4===0?1.189207:1.259921,chord=(sine(root*2,t)+sine(root*2*minor,t)+sine(root*3,t))*.019*Math.exp(-chordTime*12)*sidechain;
 const note=root*2*Math.pow(2,notes[step%notes.length]/12),pluckTime=t%(beat/2),pluck=(sine(note,t)+.23*sine(note*2,t))*.042*Math.exp(-pluckTime*15)*sidechain;
 duck+=(active[i]?1-duck:-duck)*(active[i]?1/(sr*.035):1/(sr*.18));
 const musicGain=(story.music?.openGain||.85)*(1-duck)+(story.music?.duckedGain||.42)*duck;
 let effects=0;for(const at of(story.music?.transitionSeconds||[.9,5.6,10.4,15.3,18.6])){const d=t-at;if(d>-.12&&d<.16)effects+=brightNoise*.035*Math.sin(Math.PI*(d+.12)/.28)}
 if(cinematic){
  // Original cinematic bed (owner, Nov 2: analysis Reels need something calmer than house): a soft heartbeat pulse,
  // slow warm pad chords (Am-F-C-G), a sparse bell motif and a gentle riser into each four-bar phrase. No samples.
  const barLen=beat*4,barT=t%barLen,third=[1.189207,1.259921,1.259921,1.259921][bar%4],swell=Math.min(1,barT/1.1)*Math.min(1,(barLen-barT)/.35+.55);
  const lfo=.75+.25*Math.sin(2*Math.PI*t*.18),padF=root;
  const pad=(sine(padF,t)+sine(padF*1.003,t)+.8*sine(padF*third,t)+.8*sine(padF*third*.997,t)+.7*sine(padF*1.5,t)+.35*sine(padF*2,t))*.016*swell*lfo;
  const beatIndex=Math.floor(t/beat)%4,pulse=(beatIndex===0||beatIndex===2)?(Math.sin(2*Math.PI*(40*p+3*(1-Math.exp(-p*30))))*Math.exp(-p*9)*.2+Math.sin(2*Math.PI*(44*Math.max(0,p-.17)))*Math.exp(-Math.max(0,p-.17)*12)*(p>.17?.09:0)):0;
  const semis=[0,3,7,10,12,7,3,5],on=[1,0,0,1,0,1,0,0][step%8],bellT=t%(beat/2),bf=root*4*Math.pow(2,semis[step%8]/12);
  const bell=on?(sine(bf,t)+.3*sine(bf*2,t)+.12*sine(bf*3.01,t))*.03*Math.exp(-bellT*3.2):0;
  const riser=(bar%4===3)?lowNoise*.18*Math.pow(barT/barLen,2.2):0,air=brightNoise*.004;
  const body=(pad+pulse+riser+air)*musicGain*fade,pan2=Math.sin(step*1.3)*.45;
  const l=voice[i]+body+bell*(1-pan2)*musicGain*fade,r=voice[i]+body+bell*(1+pan2)*musicGain*fade;
  for(const [c,v]of[[0,l],[1,r]]){peak=Math.max(peak,Math.abs(v));wav.writeInt16LE(Math.round(Math.max(-.98,Math.min(.98,v))*32767),44+i*4+c*2)}
  continue;
 }
 const center=(kick+clap+hats+bass+chord)*musicGain*fade+effects,pan=Math.sin(step*1.7)*.52;
 const l=voice[i]+center+pluck*(1-pan)*musicGain*fade,r=voice[i]+center+pluck*(1+pan)*musicGain*fade;
 for(const [c,v]of[[0,l],[1,r]]){peak=Math.max(peak,Math.abs(v));wav.writeInt16LE(Math.round(Math.max(-.98,Math.min(.98,v))*32767),44+i*4+c*2)}
}
await writeFile(out+'/mix.wav',wav);
const master=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',out+'/mix.wav','-af','loudnorm=I=-14:TP=-1.3:LRA=8','-ar','48000',out+'/soundtrack.wav'],{stdio:'inherit'});if(master.status!==0)throw Error('Audio mastering failed');
await writeFile(out+'/audio-proof.json',JSON.stringify({voice:proof,originalMusic:true,originalSoundEffects:true,sourceClipAudioUsed:false,musicStyle:story.music?.style||'bright-house',bpm,channels:2,peakBeforeMaster:peak,loudnessTargetLUFS:-14,truePeakLimitDb:-1.3,sampleRate:sr,durationSeconds:story.durationSeconds},null,2));
console.log(cinematic?`${bpm} BPM cinematic bed (pad, pulse, bells, risers) with smooth ducking and narration mixed`:'126 BPM stereo house bed, smooth ducking, transition effects and warm narration mixed');
