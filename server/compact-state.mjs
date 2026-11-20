// Which queue rows can leave the live state (Nov 20). Rules keep everything the publisher's checks still read:
// - never touch Approved, Preparing, Publishing, Needs reconciliation;
// - keep Published rows from the last 45 days (30-day photo rule, caption guard, weekly limits) and every receipt id;
// - keep Drafts that are approved, prioritized or post-now; other Drafts and Failed rows older than 14 days, or never
//   scheduled, are archived (the replenish jobs re-create any automatic draft that is still current).
const KEEP = new Set(['Approved', 'Preparing', 'Publishing', 'Needs reconciliation']);
export function compactPlan(queue, policy = {}, now = Date.now()) {
  const wanted = new Set([...(policy.approvedShortReelIds || []).map(id => 'short-' + id), ...(policy.priorityDraftIds || []),
    ...(policy.approvedBriefCarouselIds || []).map(id => 'brief-' + id), policy.postNow?.draftId].filter(Boolean));
  const keep = [], archive = [];
  for (const r of queue) {
    const when = Date.parse(r.published_at || r.scheduled_at || '');
    let drop = false;
    if (KEEP.has(r.status) || wanted.has(r.id)) drop = false;
    else if (r.status === 'Published') drop = Number.isFinite(when) && now - when > 45 * 864e5;
    else if (r.status === 'Draft' || r.status === 'Failed') drop = !Number.isFinite(when) || now - when > 14 * 864e5;
    (drop ? archive : keep).push(r);
  }
  return {keep, archive};
}
