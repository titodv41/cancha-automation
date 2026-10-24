// Audio energy suggests a lively moment; it does not certify which action occurred.
export function highlightWindow(durationSeconds,samples,{seconds=8}={}){
 if(!Number.isFinite(durationSeconds)||durationSeconds<2)throw Error('Clip duration is invalid');
 const duration=Math.min(seconds,durationSeconds),eligible=samples.filter(s=>Number.isFinite(s.time)&&Number.isFinite(s.db)&&s.time>=2&&s.time<=durationSeconds-2).sort((a,b)=>b.db-a.db);
 const peak=eligible[0]?.time,start=Math.max(0,Math.min(durationSeconds-duration,Number.isFinite(peak)?peak-duration/2:durationSeconds*.45-duration/2));
 return{windowStart:Number(start.toFixed(3)),windowDuration:duration,selectionReason:eligible.length?'source-audio-energy-peak':'bounded-middle-window',...(eligible.length?{energyPeakSeconds:peak}:{})};
}
