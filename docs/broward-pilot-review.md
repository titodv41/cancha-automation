# Broward starter set: October 11, 2026

## Delivered

The current Opportunities collection and Explore/organization design were backed up before changes. Reviewed nine existing records, preserved every existing record ID and slug, and added one distinct program after checking its source URL for duplicates. Existing image assets and unrelated listing fields were preserved. Website publication was not performed.

Four official-source-backed programs now have point-in-time editorial evidence:

- Hollywood FC supplemental competitive evaluations: free pre-registration, 2026/27 season, competitive players; roster space remains subject to club confirmation.
- Hollywood FC Wildcats Academy: a new beginner training listing, ages 4–14, approximately $145/month, no free trial, starts subject to class space. Summer-specific field/timetable information is not represented as current.
- Aventura Premier one-on-one evaluations: neighboring North Miami-Dade, boys and girls U8–U19, 2026/27; program director schedules the evaluation, placement not guaranteed.
- Bay Lions supplemental evaluations: neighboring Miami-Dade, 2026/27; exact age groups, cost and session/roster space must be confirmed with the club.

The six other reviewed existing records remain Pending review: West Pines Kickoff Classic (registration terms and current rules not established), Fall Soccer Fest (event underway/end day, registration and conflicting age ranges unresolved), Nova Southeastern camp (registration source blocked), Inter Miami academy operations role (official vacancy source missing), and the two Weston event listings (specific official event evidence missing).

Other researched leads were rejected as current listings: West Pines Youth Academy still publishes 2025 session dates, and Hollywood PK Soccer contains conflicting age guidance after a summer 2026 change. Do not add or promote these as currently verified merely because a page says “register.”

Added a Youth CMS age option and bound it in the existing Explore age filter, preserving Adult and See eligibility. Location filtering works after hydration; the earlier reported Tampa Bay failure was a test-timing problem. The functional check now waits for hydration. Editor screenshots show layout only and are not proof of public CMS rendering.

## Ongoing checks

`config/reviewed-club-sources.json` registers these four exact program pages with approved content hashes and a November 10 editorial review expiry. Daily checks normalize body text without scripts/styles, require the same HTTPS source and HTTP 200, and compare evidence with the approved review. Changes, blocked sources, or an expired review window flag those listings for review without hiding an existing Active listing. Unchanged evidence can refresh the source-check date; archives, expired listings and editorial holds are not overridden. An acknowledged backup is required before any write; a CMS edit during backup aborts the write.

A read-only run checked 18 sources and found 12 unverified research leads. All four reviewed club pages matched their approved evidence. These checks maintain a small reviewed set; they do not deliver nine new opportunities each day. Additional clubs and programs still require real evidence and review.

All 48 repository tests passed, including ten targeted regression checks, covering evidence changes, blocked sources, expired review windows, editorial holds, backup failure, concurrent CMS changes, opportunity quality and delayed schedules.

## Bulk change reconciled with owner authorization

The first snapshot contained 9 Active and 67 Pending review records. Before the successful pilot patch, a later snapshot contained 75 Active and 1 Pending review, with 66 records moved out of Pending review and verification/featured flags changed. This occurred before the pilot listing patch; none of the new GitHub jobs ran during that interval. The owner confirmed that they made this bulk change and asked Cancha automation to manage statuses instead. After the pilot patch there were 84 total and 71 Active records, which MUST NOT be reported as 71 source-verified opportunities.

Corrected collection: 84 records — 71 Active, 6 Pending review, 5 Expired and 2 Archived. The owner clarified that the 59 listings must stay Active. They were restored with Status-only writes; verification flags, other fields, IDs and public URLs were preserved. Stale checks no longer hide existing Active records. A confirmed passed end date can still mark a listing Expired. Active is visibility, not a claim of verification.

After that confirmation, automatic lifecycle checks were extended to reject an Active/Verified toggle when the editorial label still says Availability not verified, Waitlist only, or a source recheck is required. The cleanup was run with a fresh backup; unrelated fields and featured selections were preserved. Passed stored dates are flagged as such, not called independently verified closures. Both snapshots remain privately in ignored backups.

## Private forms

The existing forms are now prepared for native Framer Email delivery, replacing the Render receiver dependency. Organization intake includes new-listing and existing-listing update choices. Production activation requires configuring private email destinations, removing the temporary guard, publishing and confirming actual receipt. See [private intake instructions](private-submissions.md). No new hosting subscription was created.
