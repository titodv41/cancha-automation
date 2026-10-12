import {dateInNewYork} from './offer-expiry.mjs';
// GitHub may start hours late. Approved posts remain eligible through the
// scheduled New York calendar day; yesterday's content needs a fresh schedule.
export function expiredPublishingDay(scheduledAt,now=new Date()){
 const scheduled=new Date(scheduledAt);return Number.isFinite(scheduled.getTime())&&scheduled.getTime()<now.getTime()&&dateInNewYork(scheduled)!==dateInNewYork(now);
}
