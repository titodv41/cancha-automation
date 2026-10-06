# Daily opportunity workflow — October 6, 2026

Target: three quality additions per weekday, maximum five staged additions per New York calendar day. Fewer is acceptable when the evidence is weak. Start with Florida soccer and relevant soccer careers from existing organizer-linked sources. Broaden the source registry only after checking organizer identity and relevance.

## Current automation upgrade

The source-checking/staging pipeline and private review service are now implemented. See [exact activation steps](connect-meta-and-automation.md). With secure runner credentials and a deployed private backup/queue service, `npm run opportunities:automate` can create up to three supported, checked jobs as Active, non-Draft items in **unpublished** Framer changes. It does not mark them human Verified or publish the website. Unsupported or ambiguous leads remain manual-review exceptions. The daily cap is enforced using persistent technical CMS metadata, including stable source posting IDs.

Snapshots must be acknowledged by encrypted private storage before unattended CMS writes. Instagram draft delivery is idempotent and occurs before staging so a delivery failure leaves opportunities eligible for retry. Draft delivery cannot schedule or approve a post. The private review dashboard checks official evidence at approval and again before publication.

Two Miami FC listings were actually staged on October 6, bringing the collection to 83 records. Eight Instagram designs are Draft, zero scheduled. Twenty tests passed, and the Docker service passed health, protected login/status, draft seeding and mobile layout checks. Hosting, real Meta authorization and GitHub secret/URL configuration are still required.

## Original discovery and manual staging interface

- GitHub Actions discovery around **9 AM America/New_York, Monday–Friday**, with daylight-saving guards and manual **Run workflow**. GitHub may delay scheduled jobs; this is not an exact-time guarantee.
- Source registry in `config/opportunity-workflow.json`: clubs, a camp organizer, and organizer-linked TeamWork job pages/boards. Sources are not a complete search of the web.
- Static read-only source retrieval. Generic alerts/application links are excluded; same-host matching links become **candidate leads**, not opportunities or verification. HTTP 200 never means an opportunity is open. Redirects/blocked sources are flagged; no anti-bot bypass.
- `npm run opportunities:daily` generates `private-data/daily-opportunities/YYYY-MM-DD/report.json` and `candidates.json`, with source excerpts and review flags. Codex uses the current CMS for duplicate checks. GitHub discovery has no Framer credential and uses the saved public baseline: final duplicate checks must use the current CMS when staging.
- `npm run opportunities:cleanup` backs up the collection, changes draft statuses for passed End Dates and exact job postings explicitly announcing closure, and returns stale availability checks (over seven days) to Pending review. It never deletes or publishes. A past start date alone does not prove closure. Date-only end dates remain valid through the full New York day.
- `npm run opportunities:stage -- reviewed-batch.json` validates a human-reviewed batch against current CMS options, duplicates, fresh evidence and image requirements. Add `--apply` only to create **hidden Draft / Pending review** items. No existing listings are overwritten. A private daily ledger enforces the five-item staging cap on this machine; use one persistent staging host/operator, not competing hosts.

## Daily editorial checklist

1. Review source report and find up to three genuinely useful, new opportunities. Reject general navigation links, old news, unknown organizers and duplicates. Confirm the exact event/job identity, dates, deadline, eligibility, fees and open registration against the organizer. A directory is a lead, not a substitute for an organizer source.
2. Fill a copy of `config/opportunity-review-template.json`. Record source URL, quoted/paraphrased evidence, real reviewer and ISO UTC timestamps within 72 hours. Use exact current CMS enum labels. Never infer broad age eligibility from a missing value; explicitly describe unknown requirements and keep the item out of Active.
3. Use an official, permitted image with a relevant subject. Review the rights and crop. Photos require at least 1200×600 source pixels; badges/logos use padded contain treatment and a suitable background. A meaningful logo can be preferable to an unrelated stock photo. The validator requires reviewed dimensions, not a claim that it downloaded or decoded the image. In Framer Preview, check actual loading, readability and desktop/mobile crop before approving.
4. Run validation, then stage with `--apply`. Compare the actual detail page with the official source and check registration link, search/filter labels and mobile layout. Only then change the draft to Active, set Verified according to that review, clear the item Draft flag and publish when authorized. No CLI here automatically performs those approval/publication steps.
5. Review the lifecycle report. Expired/closed items leave the current feed through its existing Active-only filter. Keep their records and detail URLs; existing review notices explain the closure/date. There is no separate public closed-opportunities archive yet. Archived duplicate aliases also stay intact.

## Activation and where to see results

The workflow has been pushed to `main`, and GitHub reports its state as **active**. Weekday discovery is configured; no automatic CMS publishing is enabled. Changes to discovery code/configuration also trigger a read-only validation run. In GitHub: **titodv41/cancha-automation → Actions → Cancha daily opportunity review → Run workflow**. Download **opportunity-review-[run id]** under that run's Artifacts. Reports contain publicly sourced leads, no private contacts. Artifacts are retained seven days and accessible under GitHub's repository/artifact permissions.

Without the new secure settings this schedule does discovery and artifact preparation only. CMS lifecycle changes and approved staging require a secure Framer key on the trusted staging environment. The existing Codex binding works; do not copy its proxy placeholder into GitHub. A Framer key, private ingestion secret and host URL are required for unattended staging; a Meta publishing token is never required in GitHub. There is no always-on editorial review service, automatic daily website publication or guaranteed three additions without review.

For local runs: Node 24, `npm ci`, `PLAYWRIGHT_BROWSERS_PATH=/tmp/cancha-browsers npx playwright install chromium`, then set that browser path for the daily command. The private review receiver and Instagram dispatch still require their separately documented hosted service.

The first [GitHub execution](https://github.com/titodv41/cancha-automation/actions/runs/37413349782) completed successfully and produced its review artifact. Local verification passed all 12 tests; the remote job ran the two opportunity-policy tests and discovery without credentials. The first local CMS-connected scan found 20 leads from 12 HTTP-200 source pages, with zero lifecycle changes required; these leads were not verified, staged or published. The blank review template was correctly rejected by the live staging validator. That describes the first discovery run; the two supported records above were staged afterward.
