# Florida directory and visual redesign — October 20, 2026

This release continues the existing Framer project and URLs. It replaces the text-heavy discovery/profile experience, expands source-backed coverage, and leaves the native private email forms and the GitHub Instagram backend in place.

## What changed

- Athletic Barlow Condensed display headings complement the existing Cancha wordmark. Inter remains the body face. Fonts are self-hosted Framer assets with OFL notices in `assets/fonts/`.
- The homepage uses a strong search-first layout, soccer imagery with recorded usage terms, visual activity shortcuts, editorial club cards, Florida regions and visible links to coaches, courses and careers. Club badges are identifying editorial material, not evidence of a partnership or advertising clearance.
- Directory shortcuts: recreational, clubs/academies, UPSL, MLS NEXT, parks/fields and pickup groups. UPSL adds separate Premier/Division 1 controls. League, division, activity, age, city and ZIP filters persist in shareable URLs; empty results and Clear Filters remain usable.
- Clubs and opportunities share a new CMS-Slug-bound detail component. Badge/title/location, a single summary, four compact facts and the official action come first. Program labels and related listings remain visible; detailed eligibility, fees, access and sources use keyboard-accessible disclosures. Review notes and old public URLs are retained. Closed records are excluded from current discovery and labeled on their retained detail route.
- Footer links are shorter; courses, careers and services remain discoverable. About/provider/story/offer copy is more concrete. Existing form destinations and fields are preserved.
- The organizations form accepts **Pickup group or community** requests. It still sends privately through native Framer email for review. A submitted group does not become a scheduled Cancha game or a published profile automatically.

## Inventory and source meaning

Initial backup: **201 profiles and 87 opportunities**. This release stages **130 additional profiles**, producing **331 profiles: 312 club/team profiles, 17 venues and 2 pickup organizers**. Opportunities remain 87 CMS records / 69 Active (53 play, 16 careers); their owner-approved statuses are not reset. The 331 figure is not a count of independent clubs: named reserve/age-group squads are separate league profiles.

Sources:

- [UPSL Premier](https://premier.upsl.com/teams/): 45 mapped supported Florida records in the reviewed source.
- [UPSL Division 1](https://division1.upsl.com/teams/): 91 mapped supported Florida records. The adapter checks official host, state, division, In Season status and listed year. Membership is not open recruitment or a paid-contract promise.
- [FYSA member finder](https://www.fysa.com/play/): 223 public directory records, 213 supported mapped records. The public data endpoint is accepted only through FYSA's own embedded widget. Administrative mailing addresses and personal contacts are not copied as playing venues.
- [MLS NEXT Homegrown members](https://www.mlssoccer.com/mlsnext/about/members) and [Academy members](https://www.mlssoccer.com/mlsnext/academy-division/members): **13 unambiguously matched existing profiles**. The pages explicitly say **2025–26**. Cards and details retain that season; this is not a claim of confirmed 2026–27 participation. Similar names and parent/affiliate identities are not silently merged.
- [GoodRec Orlando](https://www.goodrec.com/pickup-soccer/orlando) and [Miami](https://www.goodrec.com/pickup-soccer/miami): independent organizer profiles, with the published minimum age of 18. No game time, price, available spot or Cancha-hosted session is invented. A Tampa URL redirected to a generic page and was not imported.
- Official [Trotters Park](https://www.orlando.gov/Parks-the-Environment/Directory/Trotters-Park), [Kendall Soccer Park](https://www.miamidade.gov/parks/kendall-soccer.asp), and [Amelia Earhart Park](https://www.miamidade.gov/parks/amelia-earhart.asp): venue facts and booking/access cautions. A venue is not an organized pickup group or permission to walk onto a booked field.

The bulk batches added 50 + 36 + 39 profiles, followed by 2 pickup organizers and 3 venues. The 39 FYSA-only records have unconfirmed/blocked club websites. They link to FYSA rather than the unconfirmed site, have no borrowed badge or active-program claims, and visibly say **Directory identity only; current programs/contact details need confirmation**. They sort after richer profiles and are excluded from Instagram spotlights. The fallback requires the explicit manual `--directory-only-fallback` flag; daily unattended imports retain the stricter own-site identity requirement.

**This is not complete Florida coverage.** Some official directory records have vague/unmapped locations, ambiguous names or missing program data; independent and unsanctioned groups are outside those league lists. Seven existing city names lack a mapped Census point and are omitted from ZIP-radius results with a disclosure. Maps show city areas, not precise pitches or drive times. Do not fill these gaps with invented coordinates, schedules or organizations.

## Repeatable import and quality controls

Daily `scripts/discover-florida-clubs.mjs` now attempts Premier, Division 1 and FYSA independently, with a **25-qualified-profile cap**, duplicate checks and backups. This is a cap, not a promise of 25 additions. UPSL sometimes denies GitHub-hosted requests (HTTP 403); preserve the failure report, continue independent supported sources, and request an official export/feed if dependable league-wide refreshes become necessary. Do not evade source access controls.

Each bulk batch retains source identities, listed season, URLs, checksums, city/county and badge usage notes in private reports. The 80 new identifying badges that loaded were visually inspected. Two league-supplied marks were not suitable: Juventus Academy Miami returned an Athletum badge, and Osheas FC returned a pub wordmark whose team identity was uncertain. Exact-asset repairs clear only those images. A white South Orlando wordmark has a dark display background. Missing badges use original Cancha artwork.

Public details are an explicit projection, not a CMS dump. Private fields, drafts/Pending review and paragraphs containing email contacts are excluded. Shared card/detail facts and repeated source boilerplate are stored once in the generated module to fit Framer's code-file size limit. A size budget blocks unsafe expansion; split the static dataset before reaching it rather than silently omitting profiles.

The release contract protects code, native scenes, shared styles **and CMS component-control bindings**. It includes the two detail templates and the preserved form pages. Auto-publication accepts only reviewed dependencies and known CMS records. Club import/publication remains in the same API session. Owner edits still block unrelated publication.

## Facebook/community intake without a bot

The organizations form is the live intake path. Ask organizers to provide the public group/organizer URL, area, age rules, skill level, booking method, real host, venue access and update contact. The email stays private; forward a submission or its public source to this chat for verification and incorporation. This workspace does not have an authorized Gmail inbox reader, and no Facebook-group posts or DMs were sent.

For information **into** Cancha: use organizer submissions, permitted public sources or an admin-provided export. Verify the organizer, source date, location and venue permission. Keep community identity separate from individual dated games. Never publish members' private messages/contact lists.

For information **out**: ask group admins about resource posts, answer a specific local request with a filtered Cancha link, and invite organizers to submit/update their own profile. Existing drafts are in `content/growth/facebook-replies.md`. Meta retired the Groups API and its publishing permissions; Meta AI/Muse Spark or Grok is not a replacement connection. Do not promise autonomous group scraping/posting.

Instagram remains one eligible feed post per day around 18:00 New York, using the existing standing plan and source/repetition safeguards. It excludes thin directory-only profiles and reserve-squad repeats. Badge checksums prevent the same badge being treated as fresh imagery just because another squad uploaded it. This release does not enable Stories, publish a new video, buy ads or add a subscription. Performance-based learning still needs the insights permission described in `instagram-insights-connection.md`.

## Review and delivery evidence

Initial private backup: `backups/visual-discovery-2026-10-20` contains every collection, code content, page scene and publication baseline. Per-import backups and exact image-repair records are retained under `backups/` and `private-data/`. Native template/copy/form review records bind the intended changes to the original backup and exact reviewed result; form preservation checks reject unrelated structural changes.

Validation includes source/age/privacy/duplicate/release tests, all 13 core code files typechecked by Framer, and browser checks at **1440, 390 and 320 px** for category/division counts, ZIP/radius search, age eligibility, empty/reset behavior, map/list, single-summary detail bindings, source disclosure keyboard access and the preserved native form. Browser verification blocks outgoing POSTs; it does not submit test emails or post to social accounts.

Final production receipt, final counts and hosted automation verification are recorded below after they are actually observed.

Production publication: deployment **80647a313**, created **2026-10-20T06:12:50.023Z**, with no pending changes after publication. A separate public browser check returned **331 profiles, zero pinned bad marks, and all 201 original profiles preserved**. The private full-CMS comparison also preserved all 87 original opportunities and the other collections.

A real home-to-directory navigation check exposed Framer entity-escaping inline CSS in style children. The shared `CanchaStyle` renderer emits only first-party static CSS as raw style content (with closing-style protection), preserving font faces, family names, and decorative rules during navigation. Browser verification checks the actual display font after navigation, not just on a fresh page load. Mobile categories remain visible with the first card roughly 620 px down. Career details also retain career breadcrumbs and label employer compensation as Pay.

Qualitative product research compared [GoodRec](https://www.goodrec.com/), [OpenSports](https://opensports.net/) and [Where2Kid](https://where2kid.com/). Useful patterns were a clear what/where search, visible activity categories, visual identity cards, and a distinction between an organizer, a venue and an actual booked event. Cancha adopts those patterns with its own brand and assets. This review is not an A/B test or evidence of higher conversion.

Final checks: **122/122 tests passed**, all 13 core files passed Framer typechecking, and production browsing/detail/courses/services/forms checks passed at **1440, 390 and 320 px**. Home-to-directory navigation retains the actual Cancha display font and unescaped CSS; first directory cards appear at approximately **551 px desktop, 617 px mobile and 619 px small mobile**. No runtime errors or horizontal overflow were observed.

GitHub automation checks passed for commit **5a1df8f** (run **39381225473**). The updated hosted preparation workflow completed successfully (run **39381302137**, same commit). No new hosting subscription, paid ads, Facebook posts or DMs were created.

Final style/career release: deployment **4f7a18367**, created **2026-10-20T06:33:38.169Z**. Hosted preparation then verified and published its current derived catalog at production timestamp **1792478215593**, retaining **331 profiles**, with **zero lifecycle/status changes**, **zero new unsupported opportunities**, the standing Instagram plan enabled and **zero publications needing reconciliation**. Five new-style social drafts were already available, so preparation did not flood the queue. UPSL sources were unavailable to that hosted run; FYSA was available.

Reviewed production screenshots and checksums are in `previews/visual-discovery/reviewed-previews.json`. Permission-based community distribution examples are in `content/growth/community-directory-links.md`; none were sent.
