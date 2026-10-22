# Community, two daily posts and Florida coverage — October 22, 2026

The owner requested two daily Instagram posts, personalized local coverage, more listings, an expansion invitation, a new homepage visual and links to Adidas, On, Gatorade and Celsius.

## Live website work

- Replaced the Orlando archive photograph with an original, clickable Cancha club board using three real directory identities: Weston FC, Florida Kraze Krush and FC Tampa Rangers. This is directory navigation, not a partnership claim or fabricated community photograph.
- Preserved the Cancha display font and Barlow supporting typography, green palette, city/ZIP search, optional age/level controls and location button.
- Removed the repeated three-card featured-club section. The badge rail, map and main discovery categories remain.
- Added four independent official brand links. Marks are recorded in config/independent-brand-links.json and kept legible on appropriate backgrounds. The section explicitly says these brands do not sponsor Cancha. No paid placement, advertising campaign or affiliation was created. NYT imagery was excluded; no NYT logo, headline, article screenshot or website image was generated or modified.
- Added “Which city plays next?” with an invitation to nominate an out-of-state club. The site says coverage starts in Florida and does not announce unsupported state launches.
- Added the native form option “Next-state club nomination” and allowed that exact query value in the existing prefill hook. Normalizing away this single option produces the original form scene digest, confirming that email delivery and other form settings were preserved. The destination remains private; no automatic publication of submissions was enabled.

## Added records

18 source-checked profiles were created: 14 distinct Soccer Stars regional programs, two Sofive venues, and two Lil’ Kickers/Skills Institute location profiles. Separate public registration identities were checked; regional search hubs are explicitly distinguished from exact class venues. These are program/venue profiles, not 18 new competitive teams or claims of open classes. All use identifying provider marks. Their source adapter is included in the existing daily discovery workflow.

Nine new employer-source-checked career opportunities were staged Active using the existing supported structured-source verifier, with exact application links, images and eligibility evidence. They include Tampa Bay Sun FC marketing, design, facilities, partnerships, community, ticketing and event roles. They remain in Careers.

One additional Play opportunity was added: FKK Winter Classic, February 5–7, 2027 at Austin Tindall Regional Park in Kissimmee. The club page and exact GotSport event both confirm the dates and team registration identity. The listing clearly says U8–U15 boys’ and girls’ teams, not an individual tryout. The source differs between January 8/9 for late-fee wording; Cancha flags that detail and does not claim a verified cutoff or guaranteed acceptance.

CMS totals after this work: 378 club/program/place profiles; 106 Opportunities records; two Providers; three Stories; zero Offers. All original CMS rows and public slugs were preserved. Public discovery includes 54 current Play listings and 30 Careers. The rest retain their existing lifecycle states.

## Instagram change

Two eligible feed slots per day: **12:30 PM and 6 PM America/New_York, starting October 23**. October 22’s already-approved Rowdies post is preserved. The new plan is recorded in content/instagram/two-daily-plan-command.json, and both standing-plan reset files use the same authorization so a later resume does not silently restore one daily slot.

The planner supports one or two daily times, a maximum of two posts per New York day and at least four hours between actual publications. Delayed GitHub runs cannot publish two missed slots back-to-back. Existing approvals and publication receipts are preserved. Source checks, content hashes, image repetition checks, owner pauses and uncertain-publication reconciliation remain in force. The two daily slots avoid featuring the same club.

New original community designs invite city nominations and practical advice from local coaches. These alternate with the reviewed club, player, coach, news, business and event batch. Sources are rechecked before approval and dispatch; weak or expired material is skipped. This is a publishing ceiling and schedule, not a guaranteed growth result or a promise to manufacture 14 posts regardless of quality. The daily generator also uses the licensed Cancha display/UI typography for future designs.

## Working previews

The previous chat links referred to workspace files, which the owner could not open. Public HTTPS preview URLs are now in content/instagram/local-stories-preview-links.json. Video is a rendered 18-second Remotion preview; automated Reels remain disabled. No hosted rendering subscription was added.

## Verification and limits

- Full Node test suite: 153 tests passed, covering two-slot scheduling, daily receipt limits, four-hour spacing, DST, source checks, pauses, region scope and preserved queue behavior.
- Framer code was checked in a shared TypeScript session with project dependencies before saving; the release contract records only the reviewed Home, Navigation and form-option changes.
- Desktop, 390px and 320px layout checks passed with no horizontal overflow. Live checks cover hero badges, brand destinations, fonts, nomination prefill, retained native form and a newly created profile.
- The automated browser sees a localStorage SecurityError in Framer’s own embedded editor frame. The same frame error is present on the previous deployment; main-page storage works. Tests distinguish that known editor-frame issue from Cancha component errors. No browser security or storage policy was bypassed.
- A PSG camp page mixed 2027 sessions with an old registration deadline/age wording. It was held for organizer clarification rather than expanded into multiple questionable listings.
- Two FYSA candidates and several adult-league sites failed the strict identity/site check and were held. No duplicate or incomplete club was added to meet a quota.
- Approved job boards still return HTTP 403 on unattended GitHub runners, although workspace verification succeeded for this batch. The workflow cannot promise a fixed number of fresh career listings every day.
- Insights remain permission-limited, so editorial changes are not yet backed by measured reach, saves or follower conversion. No performance improvement or partnership is claimed.

## Small next steps

Get club-owned photos and brief first-person interviews with permission; organize the first city community with a real admin; measure directory visits and inquiries before buying ads or selling featured placement. Keep Florida coverage useful while collecting other-state demand. Do not build a paid contact wall, claim unagreed sponsors or launch many states with thin coverage.

## Saved receipts

Implementation commit: 6365484. Framer deployment of the homepage and first batch: 87ee6cdc9; the subsequent tournament/data publish is confirmed at production deploymentTime 1792687204050. [Plan command run 39816809493](https://github.com/titodv41/cancha-automation/actions/runs/39816809493) succeeded and confirms enabled=true, localTimes=[12:30,18:00], maxPerDay=2, maxPerWeek=14, startDate=2026-10-23. [Content import run 39817040009](https://github.com/titodv41/cancha-automation/actions/runs/39817040009) succeeded; nine reviewed local/community rows are present, with tonight’s Rowdies approval preserved and the remaining eight Draft for future daily windows. No uncertain publication is present. The import did not publish an extra post.

Live browser checks passed at 1440, 390 and 320 pixels. Public desktop/mobile and video URLs are recorded in content/instagram/local-stories-preview-links.json. The local home-layout preview can be reproduced with node scripts/preview-home.mjs after running the read-only catalog sync and installing the separate video package; it binds to 127.0.0.1 and does not implement native Framer form delivery.

The final detail-page check also caught a listing suggesting itself among related opportunities. That predicate now excludes the current slug; the reviewed detail-only fix was typechecked and published. No listing data changed.
