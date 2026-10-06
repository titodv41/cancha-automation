# Cancha draft changes — 6 October 2026

The existing Framer prototype was edited through authenticated Server API access to **GU8EIeQXaRbty0S23thu**. Changes are saved in the **unpublished draft**. The public website remains at its previous published version. This draft is prepared for review; it is not yet fully verified for publication.

## Backup and images

Before changes, the complete Opportunities collection (81 items and its field definitions) was exported to `backups/2026-10-06T03-08-32-438Z/a3zk3f981.json`, with a manifest and project metadata. The backup has private permissions and is excluded from Git. Download/preserve it separately before discarding this workspace.

The supplied three-record image test matched existing records by unique system Slug and passed before the 79-record patch. Both stages asserted that item count, slugs and all other listing fields were unchanged. All 79 source images and resulting Framer-hosted assets decoded successfully. The image patch created no listings. See `audit/image-test-verification.json`, `audit/image-full-verification.json` and `audit/image-source-check.json`.

One official Disney source used AVIF, unsupported by the Framer upload endpoint. The same official source was requested in its supported PNG format. Source bytes were uploaded to Framer rather than relying on external hotlinks. No replacement organization artwork was invented.

The supplied image treatments now control a reusable image component on homepage cards, Explore cards, detail images and related cards: padded, centered, contained badges; filling photos; light/dark backgrounds; badge widths capped at original source width or 240 pixels. The existing Cancha palette and Alumni Sans typography are retained. Opportunity cards use one mobile column to preserve title readability. A mobile detail breakpoint was added.

## Listing audit and URLs

| Draft status | Count | Meaning |
|---|---:|---|
| Active | 9 | Exact organizer/employer source checked, with qualifications and availability conditions recorded |
| Pending review | 65 | Official confirmation incomplete, blocked source, directory-only source, inconsistent information, or waitlist acceptance unconfirmed |
| Expired | 5 | Employer applications closed, event date passed, or registration deadline passed |
| Archived | 2 | Confirmed duplicate aliases retained with their original records and URLs |

Every item now has a review status, note and check date. Image validation is separate from opportunity verification. Unsupported original “Verified” claims were cleared. Homepage, Explore and related-card lists are filtered to Active. Detail pages retain all records and show review notes near the title; registration CTAs are hidden for non-Active records. The ambiguous “All Ages” detail value was replaced by a direction to the eligibility notes.

Nine Active listings: Hollywood FC supplemental tryouts; FishHawk and WEC one-on-one evaluations; Florida Southern January ID camp; Tampa Bay Sun Spring 2027 equipment internship; Miami FC Digital Communications Intern; USL Safeguarding Compliance Specialist, Operations Manager–League Two, and Ticketing Systems and Partnerships Manager. Conditional roster spaces and unstated employer deadlines are explicitly described; an available registration page does not guarantee acceptance.

Closed/past examples: Miami FC Social Media Intern and Orlando City Brand Alliance Marketing employer postings say applications are closed; Flagler Women's October 4 camp has passed; the stored Jacksonville Men's October date has passed but its Ryzer source was blocked; Paradise Cup's October 4 application deadline has passed and its page contains inconsistent event years. Tampa Bay Super Cup Juniors is flagged waitlist only. The USF winter camp eligibility text conflicts and is held for clarification. Brandon FC Fall Cup and Tallahassee United remain unverified; their organizers were not invented or asserted as confirmed.

The two alias pairs were compared by organization and identical registration posting before archiving. No record was deleted and no slug changed. The archived detail notes point to the original paths; no redirect was needed to retain the old route. See `audit/duplicate-review.json` and the item-by-item source/status/eligibility notes in `audit/listing-review.json`.

## Browsing and footer

The CMS age choices now match the populated values: All Ages and Adult. Since All Ages was a broad, imprecise tag, its dropdown label reads “See listing eligibility”; it does not promise unrestricted eligibility. Unsupported U13/U15/U17/U19 options were removed. Filters use the live CMS references, stale duplicate conditions were removed, and search combines with category, region, level, age and Active status. Clear Filters and the existing empty-state count binding were preserved.

The shared footer and organization Instagram link now point to **https://www.instagram.com/wearecancha/**. Footer link contrast was repaired. The detail registration CTA now binds to the CMS external registration URL and opens a new tab.

The **currently published** site passed browser checks for search (“Hollywood” returned one card), empty results, Clear Filters (restored 81 old published cards), three existing detail routes (HTTP 200), and a 390-pixel viewport without horizontal overflow. An unused category returned zero results. These are baseline browser checks, not proof that unpublished draft runtime changes work. Source URLs were separately fetched; of 72 unique registration sources, 63 returned HTTP 200 and nine returned 403. HTTP 200 alone was never treated as verification.

## Private organization submissions

A native organization form is prepared on the draft For Organizations page, with required organization/contact/opportunity/eligibility/registration fields and consent. It displays “Submissions opening soon.” Its native submit is hidden, its visible button is disabled, and its form-level code override intercepts submission. No webhook destination or secret is embedded in the page.

The Node/SQLite receiver verifies Framer's signed webhook, validates inputs and consent, stores contact data privately as **Pending review**, handles delivery retries, and flags likely duplicates. It has no public queue or administration endpoint and no CMS/publishing integration. Private operator review commands and a container definition are saved. All five tests pass, including an actual temporary HTTP receiver and private SQLite database. The container image has not been built or deployed here.

There is no hosting account. As requested, deployment and secure-credential instructions are prepared in [private-submissions.md](private-submissions.md). A real always-on HTTPS host and persistent private disk are required before submissions can open. Use a new webhook secret in the hosting secret manager and Framer's secure webhook destination; never reuse the Framer API key or send secrets in chat.

## Previews and remaining checks

| Draft canvas preview | Desktop | Mobile |
|---|---|---|
| Homepage | [Screenshot](../previews/home-draft-desktop.png) | [Screenshot](../previews/home-draft-mobile.png) |
| Explore | [Screenshot](../previews/explore-draft-desktop.png) | [Screenshot](../previews/explore-draft-mobile.png) |
| Detail | [Screenshot](../previews/detail-draft-desktop.png) | [Screenshot](../previews/detail-draft-mobile.png) |
| Organization form | — | [Screenshot](../previews/organizations-draft-mobile.png) |

These are Framer canvas screenshots, not a published staging deployment. Detail screenshots render the real Hollywood CMS record. Collection-list canvas templates can show their old placeholder “Orlando College Showcase” text and the image fallback instead of runtime CMS repetition; that placeholder is not a newly created opportunity. The screenshot mechanism cannot exercise dropdown interactions in the unpublished draft. The captured 2200-pixel sections do not contain every item on long pages.

Before publication, open Framer Preview and check the nine-item current results, each dropdown (including age labels/values), combined filters, Clear Filters, empty results, homepage featured items, related items, pending/expired/archived detail notices, external CTAs, image treatment on real repeated cards, and desktop/mobile overflow. Some canvas linter spacing warnings remain around shared placeholders/stack sections; screenshots show normal flowing sections, but Preview must confirm final runtime behavior. Do not publish unverified sources as current.

Automatic approval review rejected a persistent Chromium proxy-certificate trust-store change as a security-setting change. That action was not applied. Public browser checks instead used HTTPS requests verified against the environment's existing system CA bundle; TLS verification was not disabled. Draft screenshots came directly from Framer's screenshot API.

Reusable Node 24 installation/start instructions were saved in the Codex environment configuration draft, preserving the working Framer secret binding and network settings. Saving that draft does not apply it or publish the website. Future-environment restoration has not been independently tested.
