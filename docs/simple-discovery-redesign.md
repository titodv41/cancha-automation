# Simpler Cancha discovery — October 19, 2026

The owner requested a less crowded, more readable and more visual site, with a simple nearby search and optional age, level and activity filters. This supersedes the always-visible player/parent panels from the earlier same-day release.

## Research and decisions

Reviewed public pages and captured their text/screenshots on October 19:

- [Playtomic](https://playtomic.com/) leads with finding places and players nearby, then presents named clubs and their locations. Cancha adopts a direct discovery entry point; it does not claim booking, live capacity, ratings or other features that Cancha does not have.
- [Meetup Find](https://www.meetup.com/find/) separates events and groups and puts location and a short filter set close to results. Cancha keeps ongoing club/place profiles distinct from dated tryouts and events.
- [NN/G: Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/) recommends keeping common actions visible and offering advanced choices on request. The primary action is now search; age, playing level and activity live in an optional Filters dialog.
- [NN/G: User Intent Affects Filter Design](https://www.nngroup.com/articles/applying-filters/) explains the disruption caused by refreshing or moving results while users are still choosing filters. The dialog stages changes and applies them together; Cancel/Escape leaves the search unchanged.

The AllTrails Florida page was unavailable to the research fetch. No findings are attributed to it. These are an expert review and implementation decisions, not an A/B test or evidence of improved conversion or growth.

## What changed

- A shorter homepage with one search, three useful shortcuts, three real directory previews and one organization invitation. The permanent player questionnaire and duplicated long explanations were removed.
- A search for city, club, place or keyword; no age, level or account is required. Directory results sit close to the search instead of below large profile panels.
- The For myself / For my child toggle is removed. Player age works for everyone. Legacy parent-mode links retain age and no longer create a separate mode or persisted role.
- Optional, accessible native-dialog filters with a live result count, explicit Apply, Cancel/Escape, reset and focus restoration. Current age/level choices survive browsing within the tab and via shared URLs.
- Four basic playing-level choices. College, semi-pro/UPSL and Professional are available through More playing levels. A fresh age-14 search does not expose those in its basic menu. This is progressive disclosure, not a claim that minors can never pursue professional soccer. Explicitly selected advanced pathways remain editable.
- Manrope headings and Inter body/control text, with fewer condensed display words and more breathing room. Custom UI uses about 73 KB of self-hosted variable WOFF2 fonts on Framer's CDN. Licenses are saved under `assets/fonts/`; metadata and checksums are in `config/discovery-fonts.json`.
- Three primary navigation choices. Training remains available through filters and the footer; careers, services and other existing routes remain accessible.
- Shorter cards with full readable titles, official badges contained without cropping, succinct age/status labels, dates and direct profile links. Venue cards display city-area map previews with attribution instead of generic pitch placeholders.
- Desktop club discovery starts with a list and city map together. Phones start with cards and an obvious map switch. Explicit List view survives refresh. Map fitting now uses both longitude and latitude bounds and actual panel width, and Fit results returns to the filtered set. Keyboard arrows can pan the canvas.
- Shared native Framer heading/body styles were updated as well. Existing native layers with inline font overrides receive scoped typography rules from the shared navigation; page content, field labels and CMS bindings are untouched. Some legacy visual headings are paragraph elements, so their existing size/weight metadata is preserved and scaled rather than flattening every paragraph to body size. Their semantic-tag cleanup remains separate. Long source notes on opportunity detail pages are expandable; availability/closed status remains visible.

## Accuracy and data boundaries

All CMS records, statuses, fields, slugs, URLs, native form destinations and email delivery configuration are preserved. This is a discovery/presentation change; it does not certify listings, add current openings, or mark them source-verified.

Age filtering retains the documented conservative rules from `player-profile-discovery.md`. Exact listed ranges exclude clear mismatches; broad audiences and U-groups remain labeled for confirmation. More filters can restrict to explicit numeric age evidence or recent source reviews.

Maps use existing public Census city/place points and OpenStreetMap tiles. Previews and pins show city areas/centers, not the actual field or club headquarters. Profiles retain their existing address/access/source information. Unmapped results remain listed. No GPS request, location tracking, geocoding API key, paid map service or new hosting was added. Visible previews load normal raster tiles on demand; there is no bulk/offline tile download. Map usage guidance: [OSM tile policy](https://operations.osmfoundation.org/policies/tiles/).

The inspected Pexels soccer photograph remains a generic illustration. Official badges identify clubs; map previews are not passed off as real venue photography. Additional genuine club photos require appropriate source/usage rights.

## Backups and release safeguards

Private baseline: `backups/discovery-simplify-2026-10-19`. It contains all five CMS collections, code, shared text styles, relevant release scenes and the initial empty publication preview. All 16 page sources were also backed up before/after changing shared typography; their source digests were unchanged.

`refine-native-typography.mjs` requires a baseline and refuses changes if the shared styles have changed since it. The standard discovery apply helper validates the baseline or its own prior apply manifest, checks all dependencies in a shared Framer typecheck session, and saves changed files only.

The reviewed release contract now includes shared text-style digests as well as code and scene digests. Automatic data publication stops on unreviewed typography changes. The scoped publisher checks exact CMS preservation, code equality, approved font styles, and all native scene snapshots before allowing the corresponding pages/styles through. The explicit --record-reviewed option records and publishes within the same Framer connection, after these checks, to avoid stale editor snapshots between connections. Unknown pending changes stop the release.

```sh
node scripts/apply-player-discovery.mjs backups/discovery-simplify-2026-10-19
npm test
node scripts/publish-player-discovery.mjs backups/discovery-simplify-2026-10-19 --record-reviewed
PLAYWRIGHT_BROWSERS_PATH=/tmp/cancha-browsers node scripts/verify-simple-discovery.mjs
```

The historical `verify-launch.mjs` and `verify-player-discovery.mjs` entry points forward to the current smoke suite. The browser checks block POST requests and do not send form submissions or email. Per-device reports are saved privately; public review images are under `previews/simple-discovery/`.

## Published result and validation

Published to [Cancha](https://pioneering-friday-005497.framer.app/) as deployment `5c7213f97` on October 19, 2026 at 17:47 UTC. The publisher confirmed no remaining pending changes. All five CMS collections matched the private baseline exactly, and the 16 native page source digests were unchanged.

- All 93 automated tests passed. Framer typechecked the nine discovery code files and their dependencies before release.
- The published site passed browser checks at 1440, 390 and 320 pixels wide. Checks covered search without personal filters, staged Apply/Cancel, keyboard focus and Escape, age-14 and adult pathways, clear/empty results, URL/session persistence, map/list views, map attribution, additional results, careers and existing native/detail/form routes. Both fonts loaded, with no recorded runtime errors or horizontal overflow.
- Homepage main copy fell from roughly 653 to 244 words. The first directory card moved from about 938 to 415 pixels down the desktop page and from 1,218 to 447 pixels on the 390-pixel phone. These are layout measurements, not engagement results.
- Final public screenshots are saved in `previews/simple-discovery/`. Browser reports and the publication receipt are private under `private-data/`.

No form was submitted by the browser checks. The owner's prior successful organization-form email test remains the delivery evidence; delivery for the other forms was not independently tested here. Maps remain city overviews, and genuine additional club/venue photographs remain a future content task.
