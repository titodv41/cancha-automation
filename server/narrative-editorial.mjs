import {validReel} from './instagram-media.mjs';
import {reviewedLocalStory,localStoryDescriptor} from './local-story-source.mjs';
export function validNarrativeStory(row){
 const e=row.visualEvidence,a=row.audioEvidence;
 return e?.kind==='narrative-story'&&reviewedLocalStory(row)&&validReel(row)&&e.sourceUrl===row.officialSourceUrl&&e.sourceHash===row.sourceHash&&e.videoChecksum===row.reel.assetChecksum
  &&a?.provider==='elevenlabs'&&a.voice==='Chris'&&a.model==='eleven_v3'&&a.syntheticNarration===true&&a.originalMusic===true&&a.sourceClipAudioUsed===false
  &&a.ownerUseAuthorization==='owner-chat-2026-10-23-chris-production'&&/^[a-f0-9]{64}$/.test(a.audioSha256||'')
  &&Array.isArray(row.footage)&&row.footage.length>0&&row.footage.every(p=>p.authorization==='owner-cleared-2026-10-22'&&p.publisher&&p.subject&&/^[a-f0-9]{64}$/.test(p.originalChecksum||'')&&localStoryDescriptor(row.editorialSourceId)?.documents.some(d=>d.url===p.sourcePage));
}
export function narrativeAllowed(row,policy){return policy.approvedNarrativeDraftIds?.includes(row.id)&&validNarrativeStory(row)}
