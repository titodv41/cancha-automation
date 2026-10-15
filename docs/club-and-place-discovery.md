# Cancha: clubs and places first

Implemented October 15, 2026 in the existing Framer project `GU8EIeQXaRbty0S23thu`. Branding, typography and existing opportunity detail URLs are preserved. AI chat, accounts, checkout and new social publishing are outside this release.

## Live experience

- `/clubs`: a separate, native CMS directory with 20 distinct Broward entities: six clubs and fourteen soccer venues. Search covers names, cities, program descriptions and tags. Filters cover city, broad age group, experience and club/place type; combined filters, reset and empty results work. Cards use five inspected official club logos, with original field graphics for venues and unavailable logos. Badges fit fully with padding.
- `/clubs/:slug`: durable profile URLs with ages, programs, levels, price notes, location, access rules, official sources and a visible review date. Venue pages offer directions. Club pages show related Active play listings through organizer-name matching; no matches is explicitly not a claim that the club is closed.
- `/explore`: tryouts, training, camps, tournaments, showcases and college opportunities. Jobs, internships and volunteering are routed to `/careers`. Existing `/opportunities/:slug` URLs are retained, including career records. Legacy career-category Explore links redirect to the career view with their query parameters.
- `/careers`: separate title/city/role filtering over the same Opportunities records. No duplicate career records are created.
- Homepage: a working city search, club profiles as the main local selection, and visible routes to dated opportunities. Shared navigation and footer link to the directory; careers remain secondary.
- `/organizations`: the existing native private-email form now accepts new club/place profiles, corrections and featured-placement enquiries. No email destination was changed. These submissions do not automatically create public CMS profiles. Contact emails must stay out of public CMS data. Actual Gmail receipt still needs the owner's previously requested test; browser validation does not prove delivery.

Directory pages have two desktop card columns and one mobile column. Home club cards use three desktop columns and one mobile column. Page titles, descriptions and branded sharing images are set; profile titles/descriptions use CMS template values.

## Content and verification

The initial batch contains Hollywood FC, Weston FC, West Pines United FC, Coral Springs Soccer Academy, Parkland Soccer and Davie United SC, plus fourteen separately addressed venues. Individual fields at one facility were not counted as separate profiles. Sixteen current Active opportunities are classified as careers and 53 as play; 69 Active does not mean 69 independently verified opportunities. Seven Expired, six Pending review and two Archived opportunity records remain in the collection.

The profile batch was reviewed against club and municipal sources. Useful qualifications are kept visible: organized use at several Pembroke Pines fields requires permits; private school/club facilities have no assumed public access; Pines Recreation Center's building/hall is closed while its city page says fields are open. Program-specific prices are not generalized to every club program. No pickup sessions, roster places, free access, coaching credentials or discounts were invented.

Age/experience filters express relevance. Venue eligibility depends on the session and operator, so public venue profiles can appear for both broad age groups and experience levels without claiming a particular program is available. Club profiles with unestablished levels do not acquire invented experience tags. Exact published ages and caveats remain visible in the cards and profiles.

`config/club-profiles.json` records reviewed facts and source URLs; the live site uses the **Clubs CMS**, not a hardcoded copy of that file. New CMS profiles default to Pending review. `Source Checked On` and its display label must reflect actual editorial review. A successful HTTP response alone must never refresh that date or imply availability.

`config/club-profile-media.json` records original logo sources and checksums. Logos identify the listed clubs editorially; there is no implied partnership. Those assets are not automatically cleared for paid ads. No third-party program photographs were copied into this release. One formerly plausible club domain served unrelated content and was excluded; an erroring municipal detail page was also excluded.

## Ongoing operation

Daily opportunity processing continues on GitHub while the Instagram standing plan remains paused. New opportunities receive a derived `Discovery Track`; a backed-up classification pass also handles existing records whose category changes. This classification changes no listing status, title, image, slug or registration URL. The daily publisher still refuses unrelated design/code changes.

`club-source-health.yml` performs weekly read-only checks of live Published profiles when the Framer secret is available, using only previously reviewed source URLs. It reports missing/changed sources, identity hints and stale review dates as a GitHub artifact. A fallback without credentials is explicitly labeled as a seed-snapshot check. It does not certify program facts, update review dates or hide profiles. New source URLs need editorial review before entering the automated registry.

For an additional batch: review actual official sources; add distinct entities to `config/club-profiles.json`; validate with `server/club-profiles.mjs`; run `scripts/seed-club-profiles.mjs` without `--apply` first. The seeder only creates missing slugs and rejects duplicate entities, stale reviews, unsafe source URLs and undisclosed paid priority. Existing entities are preserved rather than silently overwritten. CMS edits appear on the existing native pages after a guarded publication; no directory JavaScript data regeneration is needed.

The canvas/schema scripts are one-time migration tools with guards, not onboarding/startup commands. Do not rerun builders over an existing page. Inspect the current scene and back it up before further layout edits. `config/framer-discovery.json` holds non-secret collection, field, page and code-file identifiers. Private CMS/layout backups and source evidence are ignored and remain outside Git.

## Featured-placement foundation

All twenty launch profiles are unpaid, unsponsored and have zero placement priority. The schema separates `Sponsored`, `Placement Priority` and `Placement Until` from source review. Matching sponsored profiles can rank above standard profiles and must show “Sponsored placement”; they cannot bypass the visitor's filters or imply an endorsement. No price, payment, reach guarantee, exclusive partnership or active paid placement was created.

The import validator requires recorded promotion approval and a valid future end date before accepting a promoted source row. Daily placement maintenance can only remove expired/invalid promotion, never create a paid placement or expire the underlying club profile. It preserves an encrypted backup before a hosted mutation. The automated publication policy allows existing club-item updates for that maintenance, but blocks unreviewed additions, removals and website/code changes.

Before selling a pilot, define its duration, price, included exposure and measurement; confirm rights to supplied promotional media and verify email intake. Measure real profile traffic and clicks. Private contact/submission information belongs in the private inbox, never the public Clubs CMS. AI-assisted matching can be added later over these structured, source-backed profiles and their limitations.

## Validation

- 67 automated tests pass, including source-review/duplicate guards, career classification, new-job staging, promotion expiry and publication scope.
- Desktop 1440px and mobile 390px browsing passed: 20 profiles; Hollywood city search returns three entities; Adult relevance returns fourteen; Adult + Beginner returns thirteen; unmatched search shows the empty state; reset restores all profiles.
- Club/place filters return six/fourteen. Career role filtering returns three internships; play activity filtering returns twelve tryouts. Reset restores the proper separate view.
- Sample club/venue pages have a single h1, source dates, loaded visuals and working directions. Hollywood FC links to its two preserved opportunity URLs. All twenty profile routes return 200, include the actual profile name, and do not expose the private recipient email in their HTML.
- The first source-health run checked seventeen distinct primary sources for twenty profiles with no identity/link review flags. This is link health, not renewed factual verification.
- Full browser checks block outbound POST requests; no test email, public submission or Instagram post was sent.

The final reviewed release was deployed with the SDK publication method after the agent confirmation left page changes pending. A fresh preview then returned zero pending changes. The first hosted daily preparation correctly refused the pending design changes; its source research, classification and placement phases completed without CMS mutations. Hosted automation checks and weekly source health passed. A subsequent daily-preparation run was requested after publishing; its final result still needs confirmation. Instagram remains paused.

Final recheck limitation: after the release, GitHub API and query-specific live-site GET requests intermittently returned HTTP 503. A supplementary quick-link/social-sharing rerun could not be completed reliably during that interruption; the earlier full desktop/mobile functional checks remain the completed evidence. Recheck these after service recovery rather than weakening assertions.
