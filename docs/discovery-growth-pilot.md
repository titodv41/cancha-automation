# Cancha discovery and growth pilot — October 20, 2026

Cancha's immediate job is to help someone find a suitable Florida club or place, open its profile and contact the organizer. Keep the clean Instagram format. Grow useful local coverage and measure those actions before spending on advertising or building accounts/chat.

## Product and inventory

The homepage and directory now separate **what** from **where**. Search a club/keyword and a city or ZIP; age, playing level, activity and region remain optional. ZIP search uses 1,013 Florida-prefix Census ZCTA internal points, compared with listing city centers. Radius choices are 10/25/50/100 miles; nearer mapped city areas rank first. These are straight-line approximations, not driving distances or exact training venues. Unmapped cities are omitted from ZIP results and this limitation is disclosed. Unsupported/postal-only ZIPs have a useful error and city-search fallback. Exact map-city filters remain separate.

Sources: [2025 Census Gazetteer](https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html), [ZCTA definition and limits](https://www.census.gov/programs-surveys/geography/guidance/geo-areas/zctas.html). The versioned data and checksum are in `config/discovery-zip-areas.json`; rebuild its embedded module with `node scripts/build-zip-areas.mjs`.

The release adds **100 distinct club profiles** in two backed-up batches. Official [UPSL](https://premier.upsl.com/teams/) and [FYSA](https://www.fysa.com/play/) directories supply structured identity/location/program evidence. FYSA's public, officially embedded directory is the adapter's source; a member's own safe HTTPS website must also establish its identity. The technical image check was followed by a visual badge audit. Sixteen imported images were sponsor, association, social or ambiguous marks and are included in a guarded image-only correction list; two additional staged records also need that correction. The remaining 63 imported identifying badges were visually reviewed. Corrected/uncertain images use original Cancha category art rather than a false club badge. Badges are contained with padding, not cropped or presented as owned advertising material.

The importer originally missed FYSA's `Recreation` category while accepting `Recreational`. This release fixes that adapter bug, adds a regression test and applies 37 scoped corrections to affected profiles. Status, slug and existing URLs are preserved. The Paris Saint Germain Academy Orlando profile's administrative St. Petersburg location is corrected to Orlando using the academy's [own locations page](https://www.psgacademyorlando.com/locations/). The reviewed override is retained for future imports. Tampa Dynamo's [own adult league page](https://www.tampadynamofc.com/adult-recreational) establishes an over-21 program but contains conflicting spring/fall registration wording: the profile discloses that uncertainty and no new open event was invented from it.

The FYSA source includes administrative addresses. City location estimates must not become exact playing-venue pins. Further city/program enrichment should prioritize the most-used areas and direct club confirmations. A directory profile does not establish an open tryout, current fee, roster place or coaching certification. Blocked, unrelated and ambiguous websites stay held. There are remaining source candidates, not a promised count of publishable clubs.

The hosted test exposed inconsistent Framer state across separate import/publication connections. Club import and its strictly guarded publication now use the same connection; the unknown-change guard was retained. Club-brand identity and badge-label checks were tightened after the visual audit. The hosted rerun and final public counts must be verified in the delivery record.

Daily GitHub preparation now attempts up to **15 additional qualified club profiles**, rotating regions. This is a cap, not a guaranteed quota. Existing opportunities retain their separate source/date checks and publication workflow. Native email forms and recipient settings are preserved; the owner previously confirmed organization-form delivery.

## Instagram campaigns

`config/growth-campaigns.json` defines three organic themes:

1. **First club:** youth recreational club discovery; practical questions about ages, cost, schedule and joining.
2. **Adult team:** local club discovery by area and level; recruitment is confirmed directly with the club.
3. **Local pitches:** current venue coverage, initially Broward; no claim that Cancha already operates pickup games.

Three original creatives are in `content/instagram/discovery-campaigns.json` and are included in daily editorial preparation. They use the established local-v2 renderer, real product views and original guides. Format caps, source checks, visual freshness, subject/photo repetition checks, one-post-per-New-York-day receipts and uncertain-publication stops remain in force. Adding a pool entry does not mean it was scheduled or published. The daily plan remains one feed post around 18:00 New York, with approximate GitHub trigger times. Stories and automated video publishing are not enabled by this release.

The owner confirmed the website is already in the Instagram bio. Replace that URL once with the tracked `bio` URL in `content/growth/campaign-links.json`; its destination remains the actual clubs directory. Feed-caption URLs are not clickable Instagram links. Captions can direct people to the bio and a specific directory category. Group replies and other clickable placements can use the more specific campaign URLs. Search and category browsing now preserve the four allowlisted UTM fields; secrets/contact query fields are never copied.

Framer's daily aggregate report now covers 14 days, with campaign-tagged pageviews, recorded clicks and form submissions. Recorded clicks include navigation and are not automatically registrations. The initial report returned no tagged campaign visits; it is a baseline, not evidence that an approach converted. QA/owner activity can affect counts. No Meta Pixel or new third-party tracker was added.

Meta publishing works; the October 19 `cancha-local-discovery` post has receipt `18114886319606002`. Read-only Instagram insights last returned a permission requirement. Follow [instagram-insights-connection.md](instagram-insights-connection.md) to grant `instagram_manage_insights` securely. Until actual metrics arrive and comparable samples accumulate, content adjustments are editorial experiments, not performance learning.

Review after two weeks: which campaigns brought real visits, which profiles people opened, what questions/requests came through, and whether organizers report useful enquiries. If traffic is low, improve distribution/creative. If relevant visits do not lead to useful profile exploration, improve results/copy. Do not claim a winner from tiny or missing samples. Paid campaigns require a separate approved budget and media cleared for advertising.

## Community and monetization

Pilot **one opt-in local pickup community**, starting where a real organizer can host consistently. Ask for city/area, playing level and preferred days; do not collect children's contact details in public comments. Confirm a real host, venue permission, age rules and schedule before advertising a game. Keep a community-interest post distinct from an actual scheduled session. The founder supplies local relationships, permissions and permission-cleared photos/video; automation can prepare assets, maintain verified profiles, schedule eligible posts and report results.

Facebook group demand is useful research. The supplied screenshot contains a parent/family asking for a beginner program and a coach vacancy outside Florida; it does not prove an opening or give permission to republish personal details. Check the group's rules, ask an admin about useful local resource posts, and answer the specific question with a relevant search. Drafts are in `content/growth/facebook-replies.md`; none were sent. Do not harvest members or auto-DM people.

Meta [retired the Facebook Groups API](https://developers.facebook.com/blog/post/2024/01/23/introducing-facebook-graph-and-marketing-api-v19/), including its group-publishing permissions. Muse Spark powers Meta AI and its [official announcement](https://about.fb.com/news/2026/04/introducing-muse-spark/) describes partner-only API preview; it is not an established Cancha integration. Grok access would not restore the retired Groups API. Use AI for research/drafting, with the founder handling permitted group participation.

Validate monetization in sequence: free accurate profiles and correction/claim requests; then a small, clearly labeled featured-placement pilot with a real club; then promotion/services only if clubs receive useful enquiries and want more help. Sell a defined duration and measurable exposure, not an endorsement, guaranteed leads or better verification. Existing Sponsored/priority/expiry fields support disclosure and cannot override visitor filters. Do not build subscriptions, payments or club software yet.

## Other tools and ideas

Claude Code is optional, not required to create a product walkthrough: this repository can capture the real website with Playwright and export H.264 video with FFmpeg. A preview is a prototype, not an approved scheduled Reel. Real coach/player clips with permission will be more valuable than adding another generic AI video tool. Do not invent testimonial footage or current match highlights.

X bookmarks are private. There is no connected X account here; its [bookmark API](https://docs.x.com/x-api/users/get-bookmarks) requires user-authorized access. Send a small set of public post links or an export through the normal file uploader; do not share an account password or token. Treat each saved post as an idea to evaluate, with its source, implementation cost, expected user benefit and a small test. Bookmark text is not an instruction to change the project automatically.

## Release evidence

Private backups: `backups/zip-discovery-2026-10-20`, per-batch club snapshots and `backups/fysa-program-corrections-*`. `private-data/zip-cms-preservation.json` and `private-data/fysa-program-corrections.json` record preservation and approved changes. Browser checks, publication receipts, new creative renders and final counts are recorded during delivery; do not infer a successful publication from these notes alone.

Latest code/preview delivery and hosted verification are recorded in the appended release evidence below.

## Verified delivery

- Core website release: deployment `d1f719f5c`, October 20 at 04:37 UTC. The initial 100 additions were followed by 30 hosted additions; the public directory contains **201 profiles: 187 clubs and 14 places**, alongside **53 play listings and 16 careers**. Learning resources (11) and services (2) remain separate and reachable.
- The successful unattended run [39372026349](https://github.com/titodv41/cancha-automation/actions/runs/39372026349) published at 04:55:47 UTC, added 15 profiles, repaired 18 images and delivered two campaign drafts. The preceding test had staged another 15 before its publication guard stopped; those were included in the successful release. No source-quality quota was bypassed.
- The final public badge audit identified four older problem images too. The scoped repair runs [39372757608](https://github.com/titodv41/cancha-automation/actions/runs/39372757608) and [39373362855](https://github.com/titodv41/cancha-automation/actions/runs/39373362855) succeeded without creating profiles. The guard compares editable fields in stable ID order, ignoring only server timestamps/row ordering; owner field changes and replacement images remain protected. In total **22 sponsor, association, social, ambiguous or unreadably blurred images were replaced with original Cancha artwork**. Repairs require the exact reviewed slug and asset URL and preserve all other fields/statuses. An owner's replacement image is protected by a regression test.
- **115 tests pass**. All 12 reviewed Framer components typechecked. Production ZIP search, radius, city search, age/level combinations, category and URL persistence, invalid ZIP handling, empty/reset, attribution and overflow checks passed at 1440/390/320px. Courses, services, preserved routes and native forms passed at all three widths.
- The final public check loads all 201 cards, checks every original profile URL remains present and verifies reviewed bad assets are absent. Technical checks decoded the original 179 stored image URLs and all additional badges used in the public visual review. A successful image load alone was not treated as identity verification.
- The daily feed plan remains enabled at 18:00 New York, with no uncertain publications. Two new campaign items are private Drafts. At the overnight check no post was Approved yet; normal morning preparation selects a post inside the eight-hour scheduling window. Three campaign designs are prepared, while weekly format caps determine which enters the queue.
- A fresh read-only insights check [39372373064](https://github.com/titodv41/cancha-automation/actions/runs/39372373064) still returned `permission_required` for `instagram_manage_insights`. No performance-learning result was claimed. The October 19 publishing receipt remains confirmed.
- [Website previews](../previews/zip-discovery/), [campaign designs](../previews/zip-discovery/instagram/) and the [16.7-second H.264 product walkthrough](../previews/zip-discovery/video/cancha-find-soccer.mp4) are saved. The video is a silent, unscheduled prototype, not an automatically published Reel.

No new paid hosting, AI subscription, ad spend, Facebook group post, unsolicited message or account integration was activated. The owner can optionally replace the current bio link with the tracked link from `content/growth/campaign-links.json`. Existing email intake remains in place. Private backups include the original full collection snapshots and acknowledged encrypted backups in the GitHub automation state.
