import {execFileSync} from 'node:child_process';
import {rename, rm} from 'node:fs/promises';

// Music-only and mixed-source cuts can peak high for their loudness: limit the peaks, normalize, then limit again,
// because loudnorm's own peak control is not reliable on every ffmpeg build (6.0 static overshot to +0.3 dBTP).
// Music beds use -15 LUFS; speech-led club clips are more dynamic and land quieter, so they ask for a higher target.
const peakSafeFilter=(truePeakTargetDb,targetLufs=-15)=>`alimiter=limit=0.5:level=false,loudnorm=I=${targetLufs}:TP=${truePeakTargetDb}:LRA=8,aformat=sample_rates=48000:channel_layouts=stereo,alimiter=limit=${Math.pow(10,(truePeakTargetDb-1)/20).toFixed(3)}:level=false`;

// Master the encoded delivery, leaving extra headroom for AAC reconstruction.
// A source WAV peak is not the same as the final file's true peak.
export async function masterVideo(file, {audioFile, durationSeconds, truePeakTargetDb=-2.5, credit=null, limitPeaks=false, targetLufs=-15}) {
  if(!audioFile||!Number.isFinite(durationSeconds)||durationSeconds<=0)throw Error('Mastering needs the source mix and exact edit duration');
  if(!Number.isFinite(truePeakTargetDb)||truePeakTargetDb> -2.5||truePeakTargetDb< -6)throw Error('Invalid final AAC headroom');
  const temp=file+'.mastered.mp4';
  try {
    execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',file,'-i',audioFile,'-map','0:v:0','-map','1:a:0','-c:v','copy','-af',limitPeaks?peakSafeFilter(truePeakTargetDb,targetLufs):`loudnorm=I=-14:TP=${truePeakTargetDb}:LRA=8`,'-ar','48000','-ac','2','-c:a','aac','-b:a','192k','-t',String(durationSeconds),...(credit?['-metadata','comment='+credit]:[]),'-movflags','+faststart',temp]);
    await rename(temp,file);
  } finally { await rm(temp,{force:true}); }
}
