import {execFileSync} from 'node:child_process';
import {rename, rm} from 'node:fs/promises';

// Master the encoded delivery, leaving extra headroom for AAC reconstruction.
// A source WAV peak is not the same as the final file's true peak.
export async function masterVideo(file, {audioFile, durationSeconds}) {
  if(!audioFile||!Number.isFinite(durationSeconds)||durationSeconds<=0)throw Error('Mastering needs the source mix and exact edit duration');
  const temp=file+'.mastered.mp4';
  try {
    execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',file,'-i',audioFile,'-map','0:v:0','-map','1:a:0','-c:v','copy','-af','loudnorm=I=-14:TP=-2.5:LRA=8','-ar','48000','-ac','2','-c:a','aac','-b:a','192k','-t',String(durationSeconds),'-movflags','+faststart',temp]);
    await rename(temp,file);
  } finally { await rm(temp,{force:true}); }
}
