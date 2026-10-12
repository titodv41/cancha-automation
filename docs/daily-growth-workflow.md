# Daily Cancha workflow

Owner instruction on October 12: aim for around 50 new opportunities daily, activate and publish automatically, with quality first. Configuration now sets 50 as the daily target and maximum. It is a ceiling, not a promise of 50 additions. There are only a few supported unattended job-board adapters and reviewed club rechecks; additional program discovery adapters are needed for broad Florida youth and community coverage.

GitHub's daily Instagram preparation job runs opportunity discovery, supported-source checks, duplicate checks, a private backup, and CMS staging as Active. Confirmed expired dates or explicitly closed postings become Expired, with public URLs preserved. Unavailable or stale source checks flag existing Active records for review without hiding them. Unsupported or unverifiable new leads are kept out of automatic additions. Native Framer forms now deliver submissions to the owner's private email after publication; they never create public records automatically.

Automatic production publication is enabled for reviewed Opportunities collection changes. A preview gate stops when other page/code changes, unknown change types, deployment errors, or staging targets are present. A daily run can therefore stage records but report a publication blocker if someone is editing the site. Publishing covers the current project; this gate avoids publishing unrelated visible edits. It cannot prevent a concurrent edit arriving after its check; Framer's exact-preview confirmation is used when changes appear in its changelog. When CMS-only updates do not appear in that page changelog, the official publish method is used after the same preview gate.

On October 12 the owner's confirmed email-form changes on the three intake pages were published once as an explicit reviewed scope. Routine daily publication has no such page exception.

Instagram is separately limited to one feed post daily, targeting 6 PM New York with evening catch-up checks. A Meta media ID is required before calling a post Published. Source checks, uncertain-publication holds and duplicate guards remain active. Stories eligibility, performance analytics and richer automatic photographic/video production are not yet connected; scheduling does not itself improve creative quality.

Reusable pattern for another project: discover → verify → back up → stage → guarded publish → record delivery → measure outcomes. Reuse that structure, but keep account credentials, databases, sources and brand assets separate. Real video production can be added later as an asset input before the review/publishing steps.

Next priorities: expand trustworthy Florida program sources, introduce photo/carousel templates with permitted images, and connect Instagram metrics for weekly topic/design comparisons. Do not fill a daily quota with duplicate programs or recycle closed listings.

## October 12 validation

[The full GitHub preparation run succeeded](https://github.com/titodv41/cancha-automation/actions/runs/38311137237). It checked 18 sources, left 9 leads for manual review, added 0 new opportunities, delivered 2 Instagram drafts privately, and confirmed a production Framer deployment. Collection count: 84 total, 70 Active, 6 Pending review, 6 Expired and 2 Archived; Active counts include owner-approved visibility and are not independent verification counts. One dated listing was moved to Expired; the restored owner-activated records were not hidden for stale checks. The daily plan stayed enabled with 1 Published Instagram post and 0 uncertain publications. All 57 repository tests passed. Published forms on all three pages rendered with native submit buttons in a 390-pixel browser viewport; email receipt remains an owner check.

Two integration faults were fixed during validation: the publication gate now recognizes individual Opportunities collection items, and the parent runner now waits asynchronously for its child task and reopens the state client before reloading. The synchronous wait had left its HTTP connection unusable after source preparation. Failed intermediate runs were not counted as successful end-to-end checks.
