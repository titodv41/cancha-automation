# Florida discovery and creative expansion — October 19, 2026

The owner asked to keep clubs easy to find while restoring careers, courses and services, expanding beyond Broward, improving missing-media states, adding real listings and continuing daily website/Instagram automation.

## Website and source batch

- Courses, Careers and Coaches & services are direct primary navigation links and directory shortcuts. The homepage adds concise off-pitch routes and features real Miami, Orlando and Weston club profiles. Existing service submission forms remain native Framer email forms.
- All Florida / South Florida / Central Florida / Tampa Bay / Southwest Florida / North Florida browsing is explicit and shareable. Search also matches county names. City markers cluster at broad zoom levels instead of overlapping; clusters zoom in, and named city buttons remain available. Map points remain Census city overviews, not exact venues.
- Courses now have the current typography, illustrated cards, search, topic filters and empty/reset states. Eleven official resources include coaching, player development, video/data analysis, strength and conditioning and refereeing. All eleven provider links passed HTTP/title checks here; course availability, fees and accreditation are not inferred from a working page.
- Official opportunity badges/photos are preserved. Missing or failed images now display original Cancha category artwork and organization initials, including on native opportunity detail pages. The illustration is labeled as Cancha artwork and never passed off as a provider logo.
- The services page links to [FIFA's official licensed-agent directory](https://agents.fifa.com/directory-agents). No invented agent, license or representation offer was added.

The initial reviewed publication added **30 UPSL team profiles plus Florida Kraze Krush**, **three programs** and **two service providers**. Counts changed from 20 to 51 club/place profiles and 84 to 87 CMS opportunity records; providers changed from zero to two. Existing records, statuses, fields and slugs were preserved exactly. All 16 native page source digests were unchanged. This does not recertify the older listings.

Primary sources:

- [UPSL Premier official directory](https://premier.upsl.com/teams/) and its individual team pages: current 2026 Fall league identity, location and identifying badges. These profiles establish no open tryout, roster vacancy, player contract or exact playing venue. Ambiguous identities and possible duplicate squads are excluded in `config/florida-club-sources.json`.
- [Florida Kraze Krush](https://floridakrazekrush.com/), its [December girls' ID camp](https://floridakrazekrush.com/fkk-winter-idcamp-girls/) and [recreational program](https://floridakrazekrush.com/rec/). The Spring 2027 listing explicitly says **waitlist**; fall registration is closed/full. Fall prices and dates were not reused for spring.
- [Florida Premier REC+](https://floridapremierfc.com/programs/recreational/): regional recreational training/matches. Tampa is a regional search location; users must select the actual park and confirm current terms.
- [MyPersonalFootballCoach](https://mypersonalfootballcoach.com/) and [NCSA men's](https://www.ncsasports.org/mens-soccer)/[women's soccer](https://www.ncsasports.org/womens-soccer): source-reviewed public service offerings. Individual qualifications and safeguarding arrangements were not independently checked. Both provider credential-review flags remain false; no fees, discounts, recruitment results or endorsements are invented.

Private evidence, source snapshots and backups are under `private-data/florida-research/` and `backups/florida-expansion-2026-10-19/`. The dated curated batch refuses application on a later day without fresh review. USL League Two access was blocked, some other club sites were unavailable, and an old youth-club domain returned unrelated content. Those responses were not treated as new verified club/program evidence. No new job passed the supported automatic job adapter in this research run; existing career listings remain accessible.

## Daily operation

`discover-florida-clubs.mjs` adds a narrow official UPSL adapter to the existing daily GitHub preparation workflow. It requires a current-season Florida team, a reviewed city/county mapping, a valid official badge, duplicate checks and an acknowledged encrypted backup before unattended CMS writes. It preserves existing profiles, records source/badge checksums and adds up to ten profiles per run. Ten additional distinct supported teams remained after the initial batch, subject to a fresh check at the next run. The weekly source-health check recognizes those directory-backed sources as well.

The publication gate allows known new club slugs only with an explicit reviewed Clubs scope. Other page/code changes remain blocked by the release contract. Adding a club profile never activates a corresponding tryout. The existing opportunity workflow still checks source-backed job leads and confirmed expiry/closure, with the owner-authorized automatic activation/publication policy. Unsupported leads remain for review. No new hosting or paid API was introduced.

Daily means the workflow runs unattended and adds suitable new evidence when available. It does not guarantee fifty new listings per day or a specific database size by Friday. The current directory source can be exhausted; the importer must then report zero instead of duplicating teams. New leagues/program adapters still require evidence-specific implementations.

## Instagram

The local renderer now captures the current directory structure, uses the website's Manrope/Inter typography, and validates loaded images and overflow. The queue can hold up to five fresh local drafts. The mix includes club badges, actual product/maps, practical coaching/analysis/player guides and two licensed Florida contextual photographs. New templates favor a different visual format from the last published item; source/photo/subject reuse guards and weekly format caps remain active.

The Orlando stadium photograph is explicitly labeled as an **archive from 2018**, and the community-field photograph is an **illustrative archive**, not a named bookable venue. Credits, license links, original checksums and context are in `config/florida-social-photos.json` and the captions. A blurry Fort Lauderdale photograph was inspected and rejected; it is not in the approved library. No scraped club action photo or artificial crowd is used. Future original club/player media would strengthen the creative pool.

The standing feed plan remains one post daily targeting **18:00 America/New_York**, subject to GitHub schedule delays, freshness, duplicate and uncertain-publication guards. Refreshing assets is not a publication receipt. Stories remain gated because the migrated account type is unconfirmed.

The real read-only insights run [39301572667](https://github.com/titodv41/cancha-automation/actions/runs/39301572667) returned **permission_required / instagram_manage_insights**. No reach/save/share measurements were obtained. The read-only report now runs daily at approximately 17:37 UTC; durable history keeps 35 compact snapshots of the comparable post-age window instead of accumulating full reports indefinitely. Publishing works independently of this permission; we cannot claim that performance learning is operating yet. The exact secure owner steps are in [Instagram analytics access](instagram-insights-connection.md). No token should be pasted into chat.

## Validation

- 104 automated tests passed, including current-season source rejection, duplicate prevention, regional filtering, map clustering, publication boundaries, photo attribution/context and existing publication safeguards.
- Eleven Framer code files passed typechecking before publication.
- Live desktop/mobile verification and the remote daily/queue run are recorded in the delivery addendum below when completed.
- The guarded publisher verifies the exact reviewed CMS baseline and source files. An explicit `--include-reviewed-cms` permits only known reviewed collection items for this one-time batch; routine daily publishing retains its narrower policy.

```sh
node scripts/discover-florida-clubs.mjs                   # read-only
node scripts/apply-florida-reviewed-batch.mjs            # dated batch validation only
PLAYWRIGHT_BROWSERS_PATH=/tmp/cancha-browsers node scripts/verify-florida-expansion.mjs
```

Browser checks never submit forms. The owner's earlier organization-form email receipt remains the delivery evidence; other form delivery was not independently tested here.

### Published website verification

Deployment `56f3169fa` was published at 18:29 UTC on October 19, with no remaining pending changes. The full discovery browser suite passed on the public site at 1440, 390 and 320 pixels. The additional Florida suite also passed at all three widths: visible navigation, regional results and URL persistence, eleven courses and analysis/empty/reset filters, both real provider profiles, the FIFA directory link, retained native submission form, the waitlist condition and new club routes. No horizontal overflow or runtime errors were recorded.

### Unattended source repair and media evidence

The first real preparation run, [39303802039](https://github.com/titodv41/cancha-automation/actions/runs/39303802039), refreshed/published the website and delivered two photographic Instagram drafts, but its club import was blocked by the UPSL HTTP response. It added no clubs; a green workflow result alone did not establish successful growth. The status summary now exposes club additions, remaining candidates and automation blockers.

An independent adapter now follows the official FYSA page’s own public EmbedDirectory data endpoint. The inspected directory contained 223 members; 116 records had supported South/Central Florida city mappings. These are candidates, not 116 new verified programs. Each addition also requires a matching club website; repurposed casino domains, unsafe links, ambiguous identity, duplicate names/aliases and unsupported locations are held. Canonical HTTPS redirects are allowed only between the same host and its www variant. Administrative street addresses and individual contacts are not copied as playing venues. Identifying logos are used when established; otherwise the original Cancha artwork remains visible. Unattended writes still require the encrypted backup and remain capped at ten per run.

All 90 distinct stored image URLs across 125 records decoded successfully. A live simulated image failure also displayed the intended original Cancha fallback. No private form was submitted by these checks.

### Successful unattended delivery

[Run 39305855840](https://github.com/titodv41/cancha-automation/actions/runs/39305855840) completed the repaired preparation path on October 19. UPSL returned HTTP 403 from GitHub; the independent FYSA source remained available. After an acknowledged encrypted backup, the runner added **ten** website-identity-checked members and published production at **18:51:53 UTC**. It preserved existing club records and returned no automation blockers. Four ambiguous/blocked website candidates were held instead of being published.

The new batch includes Sunrise Soccer Club, Sol SC Florida, Coral Gables Youth Center, FC Highland, Miami Lakes United, Elite Soccer Academy (FL), Tropical Soccer, Orlando City Soccer School Lake Nona, Jupiter United and Nona Soccer Academy. Eight identifying logos were established; two use the original Cancha visual fallback. No administrative street addresses or personal contacts were copied into these profiles.

The live catalog now has **61 club/place profiles, 53 play opportunities and 16 career listings**, alongside the separate eleven learning resources and two providers. Today's additions total **41 club profiles, three programs and two providers**. The importer reports **97 further candidates** awaiting checks, not 97 verified openings. Club profiles are not counted toward the separate 200-current-opportunity target.

The published site passed the additional Florida browser suite again at all three widths after this automated batch. All **98 distinct stored image URLs across 133 records** decoded successfully; venue maps and the designed fallbacks cover records without stored logos. One final SDK image-audit attempt returned a transient authorization error; the subsequent official read-only connection check succeeded, and the final media verification used the reviewed public CDN URLs. No credential change was needed.

The private queue confirms the backend and standing plan enabled, @wearecancha connected, 44 encrypted CMS backup references and no uncertain publication. The refreshed `cancha-local-discovery` post is Approved for **October 19 at 22:00 UTC / 18:00 New York**. Both photographic designs are Drafts ready for the daily selector. No new Instagram publication is claimed before its actual Meta receipt.
