import {dateInNewYork} from './offer-expiry.mjs';
export function satisfiesDailyMediaMix(candidate,rows,policy,{now=Date.now()}={}) {
 if(!candidate?.reel)return true;
 if(policy.allowMotionStories===false||policy.retiredDraftIds?.includes(candidate.id))return false;
 if(!policy.minimumDailyCarousels)return true;
 const today=dateInNewYork(new Date(now));
 return rows.filter(r=>r.status==='Published'&&r.published_at&&dateInNewYork(new Date(r.published_at))===today).filter(r=>{try{return JSON.parse(r.content).slides?.length>=2}catch{return false}}).length>=policy.minimumDailyCarousels;
}
