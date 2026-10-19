# Cancha discovery and launch refresh — October 19, 2026

The owner asked for a simpler, professional local soccer destination, fewer header links, a useful homepage, readable opportunities, level/activity discovery and better Instagram content. The existing Framer project and public URLs are retained. This release does not invent providers or claim complete Florida coverage.

## Website changes

- Four primary navigation choices, an organization submission action and a collapsed mobile menu. Careers, offers, pathways, providers and about remain accessible through secondary links/footer.
- A shorter homepage with a city/activity search, clear play/train/tryout/field entry points, real club badges, local profiles and useful guides. Original Cancha wordmark, colors and display type remain.
- One consistent discovery interface on `/clubs`, `/explore` and `/careers`: immediate search, city, relevant activity/age/level controls, removable filter chips, clear/reset, honest empty states, result counts and progressive loading. Careers retain role filtering. Query parameters persist and legacy category links still work.
- Beginner, recreational, competitive, academy, semi-pro pathway, professional and school/college filters derive from actual CMS tags/program descriptions. An empty category is not populated with invented offerings. UPSL/League Two pathway labels do not imply a paid contract or an open roster place.
- Optional city map on both clubs/places and opportunities. Selecting a city pin filters the list. Coordinates are public 2025 U.S. Census Florida place internal points. They are explicitly city overviews, not exact venue locations. OpenStreetMap tile attribution is shown. Lithia has no matching gazetteer place point and remains in the results list. No key, paid mapping service or location permission is needed.
- Cards show city, activity, age/level, cost/date notes and availability qualifications together. Logos fit fully; photos can fill their frame. Closed/expired records and passed end dates are excluded from current discovery. Detail URLs remain available with an explicit closed/date-passed banner. Recently source-checked and unconfirmed availability are distinct.
- Opportunity details have a clearer availability banner, review date, readable width and less repeated material. The old broad related-opportunities grid was hidden because it could suggest stale/unrelated current options.

At the baseline there were 84 Opportunities records: 69 Active, 7 Expired, 6 Pending review and 2 Archived. This design migration changed no listing content, status, slug or registration URL. During the task, authorized lifecycle processing changed those three passed-end-date records to Expired and refreshed the four existing club-source review dates to October 19. Those updates were inspected and preserved; all titles, images, registration links and slugs stayed unchanged. The resulting CMS counts are 66 Active, 10 Expired, 6 Pending review and 2 Archived. The current public projection contains 50 play opportunities, 16 careers and 20 club/place profiles (6 clubs, 14 venues). Three Active records had end dates before October 19 and are omitted from current results without deleting their URLs. Active is an owner/CMS state, not proof that registration is open. Four current listings had recent organizer-source checks; most legacy opportunity availability remains unconfirmed and is labeled accordingly.

Providers and Offers still have zero records. Existing email submission destinations were preserved. On October 19 the owner confirmed a test /organizations submission arrived in Gmail. This is owner-confirmed delivery, beyond the browser checks. Provider/offer delivery was not separately confirmed. No email was sent by the tools.

## Keeping the directory current

Framer CMS remains the source of truth. `scripts/sync-discovery-catalog.mjs` reads explicitly whitelisted public fields and creates the Framer `CanchaDiscoveryData.tsx` module. Private submissions, contact emails, full descriptions and arbitrary CMS fields are not copied into this projection. The generated local JSON stays ignored.

Every normal opportunity publication verifies `config/discovery-release-contract.json`, regenerates the catalog, validates the actual module content again and publishes through the SDK. Daily date-based exclusions therefore update even when the CMS itself has no new records. The contract hashes the reviewed layout and component source; rendered rectangles are ignored. Manual layout/code changes fail the guard instead of being silently published by the daily job. After an explicitly reviewed future design change, record a fresh contract. Do not bypass the check or rerun canvas migrations blindly.

Backups of CMS, scenes and previous component source were stored privately under `backups/launch-2026-10-19`. These are outside Git. No prior listing was archived or demoted as part of the design work.

## Instagram changes

The fresh private review confirmed the account connection, a paused plan, three past publications and no later Instagram post. The earlier feed was not learning from insights. This release deliberately replaces that creative approach under the owner's existing one-per-day authorization; it does not resume the rejected draft pool.

- Three original, visually inspected feed designs/captions: actual directory demo, a four-question parent guide and a Broward city/venue-map guide. A club spotlight design was also rendered and inspected. The assets use real Cancha product views or identifying badges, not unrelated stock photography or fabricated people.
- `cancha-local-v2` is required by automatic selection. Legacy drafts cannot enter the new standing plan. Original artwork requires a matching immutable JPEG checksum, documented creator/source/subject and fresh render evidence. Approval hashing includes this evidence. Rewording a post or recropping its source does not bypass reuse checks.
- The owner-authorized cadence remains at most one feed post per day around 6 PM New York. Stories are excluded until account capability and actual Story assets are confirmed. No ads, DMs or uncertain publication retries were enabled.
- `prepare-local-editorial.mjs` prepares at most one new local draft per day when the fresh draft pool falls below three. It uses reviewed CMS profiles plus the inspected launch concepts, validates/render-checks actual artwork, uploads a JPEG and delivers only a Draft into encrypted GitHub state. Profile sources must be within 30 days; artwork must be within 7 days before automatic selection. It does not refresh source-review dates merely because it rendered a new image.
- A subject is not repeated within 30 days; weekly caps prevent a feed full of the same map or spotlight format. Weak/exhausted pools skip a slot. This is a bounded editorial system, not an unlimited unattended AI reporter. Fresh reporting, local photography, player/coach interviews and human community relationships still need real contributions and appropriate permissions. No club partnership or personal quote was invented.
- The disabled generic evergreen bank and syndicated-headline generator remain disabled. Old opportunity/news artwork is not automatically granted the new creative version.
- A weekly read-only insights workflow requests reach, saves, shares, likes, comments and interactions using the existing encrypted Meta connection. It distinguishes absent permission, expired tokens, unavailable metrics and actual zero values. Reports stay in encrypted state and short-lived private artifacts. No token is placed in a request URL or report. Topic preference can change only after sufficient comparable topic samples; weekly format caps continue to apply. There is no verified reach or growth claim from this implementation.

`refresh-creative` imports only the three evidenced launch assets, freezes pending selections from the old plan, activates the updated standing plan and chooses within its same-day freshness window. This action does not immediately publish a post. A successful run/queue receipt must confirm activation; a workflow dispatch acknowledgement is not that proof. Scheduled is not Published.

## Validation and launch boundaries

- 81 automated tests passed after the implementation, including source/privacy projection, dates, filtering, sponsored ordering, publication scope/contracts, original creative evidence, old-queue exclusion, reuse, approval integrity, Meta insights failures and existing private-state/publishing safeguards.
- Actual desktop 1440px and mobile 390px checks passed: homepage city/activity search; menu and Escape behavior; combined city/age/activity/level filtering; persistent URLs/reload; empty/reset; progressive loading; map-to-list city selection; source-checked toggle; careers and preserved detail routes. No runtime errors or horizontal overflow were observed.
- A recorded-past camp detail page was separately checked on mobile and displayed the closed/date-passed warning with its real review date.
- Tools did not submit native forms. The owner confirmed the organization-form test email arrived in Gmail. No new Instagram publication has been inferred from local rendering or tests.
- The first actual insights artifact returned permission_required for instagram_manage_insights. No performance statistics were obtained; follow instagram-insights-connection.md for secure owner reauthorization. Hosted preparation/creative activation are still pending during the Actions incident, and are not reported as successful.

Pitch the current product as an early local discovery directory starting with Broward, with additional Florida opportunities. Before a wider launch: recruit real coach/club submissions, obtain permission for authentic local photos/video, and test a real find-a-team task with a few players/parents. Those are stronger next steps than adding accounts, AI chat, a checkout or more navigation sections.

GitHub status reported an active Actions/Pages incident while the requested jobs were waiting without runners: https://stspg.io/nrv2k8s68bwn. This prevents confirmation of hosted activation and insights, not local validation or Framer publication. Do not request new credentials or claim the scheduler has resumed merely because dispatch was accepted.

The cutover is also applied once by the next successful daily preparation if a separate refresh job is delayed or displaced by GitHub concurrency. The applied creative version is durably checkpointed. Subsequent prepare runs preserve any later owner pause; read-only review/insights actions never activate publishing.

Requested hosted activation: https://github.com/titodv41/cancha-automation/actions/runs/39281221087
Requested hosted preparation: https://github.com/titodv41/cancha-automation/actions/runs/39281226105
Requested read-only insights: https://github.com/titodv41/cancha-automation/actions/runs/39278905728

Latest updated-creative activation request: https://github.com/titodv41/cancha-automation/actions/runs/39282231661 (commit 57b8330; still queued at the final check). Meta analytics permission is independent of this runner delay and of publishing access.
