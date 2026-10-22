import {dateInNewYork} from './offer-expiry.mjs';
export function dailyPostLimit(plan) {
  return plan?.maxPerDay === 2 && Array.isArray(plan.localTimes) && plan.localTimes.length === 2 ? 2 : 1;
}
export function canPublishFeed(rows, plan, now = Date.now()) {
  const today = dateInNewYork(new Date(now));
  const published = rows.filter(row => row.status === 'Published' && Number.isFinite(Date.parse(row.published_at || row.scheduled_at)));
  if (published.filter(row => dateInNewYork(new Date(row.published_at || row.scheduled_at)) === today).length >= dailyPostLimit(plan)) return false;
  // A delayed runner must not squeeze two missed slots into consecutive posts.
  return !published.some(row => {
    const elapsed = now - Date.parse(row.published_at || row.scheduled_at);
    return elapsed >= 0 && elapsed < 4 * 3600000;
  });
}
