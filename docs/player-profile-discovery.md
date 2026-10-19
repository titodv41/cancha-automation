# Player age and goal discovery — October 19, 2026

This extends the existing Cancha discovery release. The CMS, listing statuses, native detail URLs, branding, forms, email destinations and publishing cadence remain intact. No accounts, AI matching service, paid map service or new hosting are required.

## Audit and implementation

The previous directory exposed only Youth/Adult filters. Homepage searches did not include age or level, section links dropped filters, and cards did not distinguish numeric age evidence from a broad audience label.

The homepage and `/clubs` and `/explore` now put **Find your fit** first: player age, playing level, and a For myself / For my child switch. Six goal choices cover clubs, tryouts, camps/showcases, training, pitches and tournaments. Goal changes preserve the profile and city; unrelated keyword and category filters are cleared. The primary navigation restores the profile within the same browser tab. Clear filters removes both the query filters and saved profile; Reset profile preserves the chosen goal/city.

Query parameters provide shareable searches. `sessionStorage` stores only player age, broad audience, playing level, player/parent choice and the unconfirmed-age preference. There are no names, dates of birth, emails or account records. Storage failures do not prevent query-based filtering.

Mobile shows all six goals, readable single-column cards and a floating Show results shortcut while results are below the viewport. Desktop retains list/map views and larger cards. A licensed, inspected Pexels soccer photograph illustrates the homepage; it is not presented as a listed club or Florida venue. Official badges remain contained, centered and padded. Rights, source and checksum are recorded in `config/discovery-media.json`.

## Age evidence and limits

`server/discovery-ages.mjs` derives a small public age-evidence object from existing public CMS copy; it does not copy full descriptions or contact data into the catalog. It does not independently verify the source or change source-review dates.

- Explicit age ranges and `age N+` phrases filter out clear numeric mismatches. Multiple ranges retain their gaps.
- U-groups use conservative candidate bounds (lower U-group minus one through upper U-group) solely to exclude clear mismatches. Every remaining U-group result says to confirm the birth-year cutoff.
- A range for one club program is never treated as a limit on every program at that club.
- Broad youth-only labels exclude ages 20 and above; adult-only labels exclude ages below 16. The overlap is deliberately left unconfirmed because season and program rules vary.
- Grades, graduation years and league names are not converted into ages. Job descriptions are not mined for participant-age eligibility.
- Unconfirmed ages are included by default and visibly flagged. Turning that option off retains only listings with explicit numeric age evidence. All other requirements, current spaces and availability still need organizer confirmation.

A 24-year-old selecting Semi-pro / UPSL pathway currently finds Weston FC's listed pathway. This does not claim an open UPSL tryout, paid contract or roster place. A parent entering 14 can switch between clubs and showcases; a camp explicitly requiring 15+ is excluded. Gender, school grade, team-versus-individual registration and invitation requirements remain on the detail/source pages and are not inferred from age.

Careers use their own role filters and do not apply a saved player's age, level or activity. Legacy job-category Explore URLs redirect to Careers.

## Release workflow

Back up all collections, relevant page scenes, code files and the publication preview before editing. This task's baseline is the ignored private directory `backups/player-fit-2026-10-19`. The apply script requires that existing backup; it checks the baseline or a recorded prior apply manifest, typechecks the dependency graph in one Framer session, and saves only changed code plus the derived catalog.

```sh
node scripts/apply-player-discovery.mjs backups/player-fit-2026-10-19
node scripts/discovery-release-contract.mjs --record-reviewed
npm test
node scripts/publish-player-discovery.mjs backups/player-fit-2026-10-19
PLAYWRIGHT_BROWSERS_PATH=/tmp/cancha-browsers node scripts/verify-player-discovery.mjs
```

Record the release contract only after reviewing the actual design. The scoped publisher checks exact CMS preservation, reviewed code, current catalog, allowed pending pages/files, a stable preview and no remaining changes after publication. It rejects unrelated edits. The normal daily automation keeps its existing publication guards and will use this reviewed component contract.

The browser check uses read-only GETs and blocks form submission requests. It exercises both requested journeys, exact/unknown ages, goal and primary navigation, URL reload, reset, empty states, search, map, load-more, careers and existing detail routes at 1440, 390 and 320 pixels. A private JSON report and desktop/mobile screenshots are generated in `private-data/` and `previews/player-fit/`.

The organization-form email delivery was already confirmed by the owner. This release does not send another test email or alter the destination.

## Recorded validation

- 88 automated tests passed, including exact numeric ages, disjoint ranges, seasonal uncertainty, public data privacy and both requested player journeys.
- The full browser suite passed against a local bundle of the actual components at 1440, 390 and 320 pixels; no horizontal overflow or browser runtime errors.
- All nine discovery components passed Framer's shared-session typecheck.
- The guarded production release returned deployment `39363666c` on October 19 at 16:28 UTC with no remaining pending changes. The CMS comparison found no record or field changes in any collection.
- Live browser validation and final preview capture are recorded separately after deployment; see the generated private report for the final status.

`verify-launch.mjs` now forwards to the current browser suite, so the old entry point no longer targets removed controls.

The first live 320-pixel check found Framer's built-in badge intercepting the mobile results shortcut. The shortcut now sits above the badge without hiding or covering it. This correction was published as deployment `9bf41c5e0` at 16:32 UTC. The final checks use the real public badge and ordinary pointer clicks.

Final production validation passed after deployment `9bf41c5e0` on all three widths (1440, 390 and 320). Both full player journeys, known/unconfirmed age controls, primary navigation, URL refresh, resets, empty results, load-more, city map filtering, legacy career redirects and preserved detail routes passed. There were no browser runtime errors or horizontal overflow. The smallest-screen results shortcut passed an ordinary pointer click with Framer's badge present. No forms or emails were submitted by the browser checks.
