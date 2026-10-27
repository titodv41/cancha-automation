import {execFileSync} from 'node:child_process';
import {rename, rm} from 'node:fs/promises';

// Music-only cuts (no voice) peak high for their loudness: limit the peaks, normalize to -15 LUFS, then limit
// again, because loudnorm's own peak control is not reliable on every ffmpeg build (6.0 static overshot to +0.3 dBTP).
const musicOnlyFilter=truePeakTargetDb=>`alimiter=limit=0.5:level=false,loudnorm=I=-15:TP=${truePeakTargetDb}:LRA=8,aformat=sample_rates=48000:channel_layouts=stereo,alimiter=limit=${Math.pow(10,(truePeakTargetDb-1)/20).toFixed(3)}:level=false`;

// Master the encoded delivery, leaving extra headroom for AAC reconstruction.
// A source WAV peak is not the same as the final file's true peak.
export async function masterVideo(file, {audioFile, durationSeconds, truePeakTargetDb=-2.5, credit=null, musicOnly=false}) {
  if(!audioFile||!Number.isFinite(durationSeconds)||durationSeconds<=0)throw Error('Mastering needs the source mix and exact edit duration');
  if(!Number.isFinite(truePeakTargetDb)||truePeakTargetDb> -2.5||truePeakTargetDb< -6)throw Error('Invalid final AAC headroom');
  const temp=file+'.mastered.mp4';
  try {
    execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',file,'-i',audioFile,'-map','0:v:0','-map','1:a:0','-c:v','copy','-af',musicOnly?musicOnlyFilter(truePeakTargetDb):`loudnorm=I=-14:TP=${truePeakTargetDb}:LRA=8`,'-ar','48000','-ac','2','-c:a','aac','-b:a','192k','-t',String(durationSeconds),...(credit?['-metadata','comment='+credit]:[]),'-movflags','+faststart',temp]);
    await rename(temp,file);
  } finally { await rm(temp,{force:true}); }
}
