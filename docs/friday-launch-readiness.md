# Friday, October 16 launch preparation

Cancha remains a Florida soccer discovery platform. Existing branding, typography, public listing URLs and owner-activated listings are preserved. No domain was purchased, ads launched or ad budget spent.

## Delivered October 12

- Backed up CMS and affected layouts before changes. Four existing club opportunities were rechecked against organizer pages: Hollywood competitive tryouts and beginner academy, FishHawk and WEC evaluations. Review notes distinguish evaluation requests from confirmed places; costs and season-specific schedules are qualified. No new listings were invented.
- Homepage copy now explains Florida soccer discovery. Featured cards are restricted to Active, Featured records with organizer-source review notes. This is a curated selection, not a claim that every Active listing has been independently verified.
- Explore now includes a city text filter, alongside existing filters and title search. Clear Filters resets the city too. Existing query parameters and detail routes are retained.
- Three original practical guides were approved, illustrated and published: registration questions, choosing support and careers beyond playing. They are guides, not fabricated interviews. Photographs are illustrative; attribution and reuse links appear in each guide.
- Future brand Instagram preparation uses approved real photographs with two layouts. Creator, original source, license and original file checksum are recorded in `config/social-photos.json`; captions disclose actual photograph locations and cropping. Unrelated stock is not represented as a featured club or news-event image. Previously published content is unchanged. Old plain brand drafts are excluded from automatic selection.
- Website analytics are accessible through Framer. The separate read-only GitHub workflow collects page/click/form-submit and campaign aggregates daily. No individual visitor identifiers or contact details are exported. These counts can include QA/owner traffic; they are not Instagram engagement or ad-conversion metrics.

## Automated operation and limits

GitHub remains the scheduling backend. Feed publishing stays at one per New York day, around 6 PM with later same-evening checks. Preparation is daily; source checks and publication receipts govern eligibility. GitHub cron can be delayed. Four social preview files demonstrate layouts; they are not four guaranteed scheduled posts. Stories and Instagram engagement analytics remain unavailable until the account capability/permissions are confirmed.

The opportunities target is up to 50/day, not a quota filled with unverified records. Eligible verified additions can become Active and publish without another owner approval. This review added zero new listings: several apparent registration sources were blocked, empty, or led to a sandbox. Existing unavailable sources are flagged for review rather than silently treating listings as closed. A verified passed closing date can mark a listing Expired while retaining its URL. Active visibility is not proof of verification.

## Before driving traffic Friday

1. Owner submits a clearly marked test via `/organizations` and checks Gmail Inbox/Spam. The owner has not tested receipt yet. Also check `/providers` and `/offers` when practical. Visible native forms and Email destinations alone do not prove delivery; contact emails remain private.
2. Pick one initial catchment, recommended South Florida. Check the actual current featured listings and official registration links once more before promotion. Do not advertise a specific program whose availability is unconfirmed.
3. Start with an organic post directing people to Explore or Training. Watch visits, clicks and genuine submitted feedback before widening the catchment.
4. A custom domain can wait until these checks pass. It improves presentation but is not a substitute for useful listings and working intake.

## Small paid test — prepared, not launched

Run only after form receipt and landing-page checks. Suggested draft: one South Florida audience, adults 18+ including parents and adult players, two creatives, $5–10/day total for 3–5 days if the owner approves the spend. Use Meta's available traffic/landing-page-view objective; no conversion optimization claim without a suitable measurement setup. No pixel was installed.

- Creative A: an authentic licensed soccer photograph, headline “Find your next step in Florida soccer,” caption explaining clubs, tryouts and training. Do not label an illustrative photograph as a particular Florida club.
- Creative B: a real screenshot of the city-filtered directory, headline “Find a place to play near you.” Show only genuine current records; no invented endorsements or guaranteed outcomes.
- Use a consistent campaign `florida_launch_oct16`, separate `utm_content=photo_a` and `directory_b`, and `utm_source=instagram&utm_medium=paid_social`. Organic uses `utm_medium=organic_social`.
- South Florida landing URL: `https://pioneering-friday-005497.framer.app/explore?region-2=South+Florida&utm_source=instagram&utm_medium=paid_social&utm_campaign=florida_launch_oct16&utm_content=photo_a`.
- Training alternative: `https://pioneering-friday-005497.framer.app/training?utm_source=instagram&utm_medium=organic_social&utm_campaign=florida_launch_oct16&utm_content=training_guide`.

Compare landing visits and opportunity clicks, then collect direct feedback: could visitors find a relevant local option, and did organizers receive useful inquiries? Do not infer business growth from likes or owner/QA views. Meta ad-account access, spend approval and Instagram insights are separate prerequisites; no ads or outreach messages were sent during this work.

## Maintenance

One-time October 12 scripts (`polish-friday.mjs`, `review-friday-clubs.mjs`, `publish-friday-guides.mjs`) refuse later dates and need fresh inspection/review before reuse. Private CMS backups and source evidence are ignored, not committed. Approved social assets and preview images contain no credentials or submissions. To review aggregate analytics, open GitHub Actions → Cancha website analytics → successful run → artifact `cancha-website-analytics`. To review Instagram queue/receipts, run the existing Instagram workflow with action `review`.

## Verified execution

- October 12: 60 tests passed, zero failed or skipped. The photo-required scheduler test confirms old plain brand drafts stay unscheduled.
- Framer publication confirmed with a newer production deployment timestamp. Desktop 1440px and mobile 390px checks found no horizontal overflow or unloaded visible images. All three guide routes return 200 and include photo attribution/source links.
- Explore: city Hollywood → two club records; city plus South Florida → same two; city plus Wildcats title search → one; unmatched city → visible empty state; Clear Filters → 70 Active records. Native forms remain visible on all three intake pages; actual Gmail receipt remains owner-unverified.
- [GitHub photo preparation run](https://github.com/titodv41/cancha-automation/actions/runs/38317206409) succeeded. It rendered/uploaded the photo brand draft and a source-attributed news draft, delivered them to the encrypted private queue, and reported one existing published post with zero uncertain publications. Preparation found zero source-approved new listings and 28 leads requiring review. It did not publish an additional Instagram post.
- [Website analytics run](https://github.com/titodv41/cancha-automation/actions/runs/38317209310) succeeded: 15 page aggregates, no campaign aggregates yet.
- [Instagram review run](https://github.com/titodv41/cancha-automation/actions/runs/38317366016) confirmed the new photo draft and caption credits in the private preview artifact. Daily plan and GitHub scheduling are enabled. Tomorrow’s content is selected inside the morning preparation window, not pre-approved days ahead from stale opportunity facts.
