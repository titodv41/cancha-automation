import {dateInNewYork} from './offer-expiry.mjs';
export function dailyPostLimit(plan, extra = 0) {
  // One post per configured daily slot (one to four), plus an owner "post now" request; anything inconsistent falls back to one.
  const n = Array.isArray(plan?.localTimes) ? plan.localTimes.length : 0;
  return (n >= 1 && n <= 4 && plan?.maxPerDay === n ? n : 1) + (extra === 1 ? 1 : 0);
}
// Owner, Nov 13: no four-hour gap. If the owner says post it now, it posts on the next run.
// A short guard only stops two overlapping runs from sending two posts in the same minutes.
export const MIN_GAP_MS = 15 * 60000;
// The owner's "post now" request from the editorial policy: one draft, valid for a few hours after the request.
export function activePostNow(policy, now = Date.now()) {
  const r = policy?.postNow;
  if (!r || typeof r.draftId !== 'string' || !/^[a-zA-Z0-9_-]{1,120}$/.test(r.draftId)) return null;
  const from = Date.parse(r.requestedAt), until = Date.parse(r.until);
  if (!Number.isFinite(from) || !Number.isFinite(until) || until <= from || until - from > 24 * 3600000) return null;
  return now >= from && now <= until ? r : null;
}
export function canPublishFeed(rows, plan, now = Date.now(), extra = 0) {
  const today = dateInNewYork(new Date(now));
  const published = rows.filter(row => row.status === 'Published' && Number.isFinite(Date.parse(row.published_at || row.scheduled_at)));
  if (published.filter(row => dateInNewYork(new Date(row.published_at || row.scheduled_at)) === today).length >= dailyPostLimit(plan, extra)) return false;
  return !published.some(row => {
    const elapsed = now - Date.parse(row.published_at || row.scheduled_at);
    return elapsed >= 0 && elapsed < MIN_GAP_MS;
  });
}
