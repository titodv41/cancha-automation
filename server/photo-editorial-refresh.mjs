import {approve,saveDraft} from './instagram-queue.mjs';
import {approvedOriginalCreative} from './social-creative.mjs';

// Owner asked to replace queued artwork. Keep its existing slot only while
// it is an untouched, future standing-plan approval. Never alter dispatched work.
export function refreshPhotoEditorial(db,drafts,{now=Date.now()}={}) {
 if(!drafts.length||drafts.length>10||drafts.some(d=>!approvedOriginalCreative(d)||d.visualEvidence.kind!=='photo-carousel'))throw Error('Reviewed photo carousels required');
 const result={updated:[],rescheduled:[],protected:[],unchanged:[]};
 db.exec('BEGIN IMMEDIATE');
 try {
  for(const draft of drafts){
   const old=db.prepare('SELECT * FROM instagram_queue WHERE id=?').get(draft.id);
   if(old?.content===JSON.stringify(draft)){result.unchanged.push(draft.id);continue;}
   const replaceApproval=old?.status==='Approved'&&!old.container_id&&old.approved_by==='Cancha owner-authorized standing plan'&&Date.parse(old.scheduled_at)>now;
   if(old&&old.status!=='Draft'&&!replaceApproval){result.protected.push(draft.id);continue;}
   saveDraft(db,draft);result.updated.push(draft.id);
   if(replaceApproval){approve(db,draft.id,{reviewer:old.approved_by,scheduledAt:old.scheduled_at,now,allowSourceRecheck:true});result.rescheduled.push({id:draft.id,scheduledAt:old.scheduled_at});}
  }
  db.exec('COMMIT');return result;
 } catch(error){db.exec('ROLLBACK');throw error;}
}
