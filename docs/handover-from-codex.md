# Handover from Codex to Claude

Snapshot: October 25, 2026, New York time, against `main` at `bb59335433fbcde440a916b6b2c63c1051a4124e` before this documentation PR. Runtime state changes independently; receipts below are dated observations, not promises that scheduled work completed. This handover changes documentation only.

## Ownership and merge rules

Claude is the lead and owns all areas, including pipelines, publishing, CMS, source automation, credentials integration and infrastructure. Codex is on standby and covers only at the owner's request. Both use separate branches and PRs, never direct source pushes to `main`. Neither needs the other's review. Each merges its own passing PR; publishing, credential and CMS changes require the author's own code review before merge. Codex leaves a short PR note with changes, checks and unfinished work when covering. Escalate only spending, account logins and provider consent. [CLAUDE.md](../CLAUDE.md) and [product context](../.agents/product-marketing.md) contain the current rule and supersede older split-ownership notes.

Existing source, privacy, spending and dispatch controls remain. Routine authorized posting and CMS maintenance do not require fresh owner approval. A merged code PR is not a Framer production deployment.

## Accounts and architecture

- Repository: `titodv41/cancha-automation`, **public**. GitHub Actions is the active scheduler/state backend; do not create a second Instagram publisher.
- Framer project: `GU8EIeQXaRbty0S23thu`; public site: https://pioneering-friday-005497.framer.app/.
- Instagram: https://www.instagram.com/wearecancha/; Meta app `2083779272510560`, confirmed Page `1283032084901437`, Instagram account `17841477139158414`. These are public identifiers, not secrets; canonical mapping is [config/meta-account.json](../config/meta-account.json).
- `automation-state/state.enc.json` retains the Page credential, queue/plan/receipts, voice reservations and operational state. Compressed authenticated CMS backups live at `automation-state/backups/<sha256>.enc.json`. Use [github-state-client.mjs](../scripts/github-state-client.mjs), not manual state replacement.
- Framer remains the site host. Native Email forms on `/organizations`, `/providers` and `/offers` are the current intake; the owner confirmed Gmail delivery. Private contacts/submissions never publish automatically. The former Render dashboard is historical, not the current queue or form receiver. Render billing/cancellation has not been verified here.

## Every workflow and its schedule

All cron expressions are **UTC**, not New York time. EDT is UTC−4; EST is UTC−5. The feed plan stays at **12:30 PM and 6 PM New York**, including daylight-saving changes. GitHub may delay or miss events; inspect job steps and receipts rather than a green run alone. All ten workflows were listed as active, which does not establish that each currently succeeds.

| Workflow | Trigger / New York time | Purpose, gates and last observed result |
| --- | --- | --- |
| [automation-checks.yml](../.github/workflows/automation-checks.yml) — Cancha automation checks | Push/PR changes matching `server/**`, `scripts/github*.mjs`, `test/**`, `package*.json`, `.github/workflows/**`; no cron/manual trigger | Node 24, `npm ci`, `npm test`. Docs-only changes do not trigger it. [40215609501](https://github.com/titodv41/cancha-automation/actions/runs/40215609501) passed on the pre-handover `main`; 251 tests passed locally at that revision. |
| [github-instagram.yml](../.github/workflows/github-instagram.yml) — Cancha Instagram on GitHub | Manual `action`; cron `23 13,17 * * *`, `9 14 * * *`, `19 16 * * *`, `11,41 0-3,16-23 * * *` | Main producer, website preparation and publisher; scheduled runs require `CANCHA_AUTOMATION_BACKEND=github`. Detailed action schedule below. [Publishing 40214538910](https://github.com/titodv41/cancha-automation/actions/runs/40214538910) and [preparation 40214652958](https://github.com/titodv41/cancha-automation/actions/runs/40214652958) passed October 25. [Replenishment 40214824656](https://github.com/titodv41/cancha-automation/actions/runs/40214824656) failed fresh narration at the voice cap; existing queue delivery is independent. |
| [instagram-insights.yml](../.github/workflows/instagram-insights.yml) — Cancha Instagram learning report | Manual or daily `37 17 * * *`: 1:37 PM EDT / 12:37 PM EST | Read-only Meta metrics; encrypted history checkpoint and sealed full report plus sanitized status. Scheduled runs require GitHub backend. [40148514164](https://github.com/titodv41/cancha-automation/actions/runs/40148514164) passed; real metrics available, no comparable topic groups yet. |
| [site-analytics.yml](../.github/workflows/site-analytics.yml) — Cancha website analytics | Manual or daily `43 14 * * *`: 10:43 AM EDT / 9:43 AM EST | Read-only 14-day aggregate page/click/form and UTM counts from Framer; no individual hashes/contacts exported. [40116893008](https://github.com/titodv41/cancha-automation/actions/runs/40116893008) passed October 24. Artifact `cancha-website-analytics` may include owner/QA traffic. |
| [club-source-health.yml](../.github/workflows/club-source-health.yml) — Cancha club and place source health | Manual or Monday `23 13 * * 1`: 9:23 AM EDT / 8:23 AM EST | Reads published Clubs and approved public identity/source pages; reports review-needed flags without CMS writes. Latest listed [39310504470](https://github.com/titodv41/cancha-automation/actions/runs/39310504470) failed October 19; no newer success verified. Artifact: `club-place-source-health`. |
| [learning-link-check.yml](../.github/workflows/learning-link-check.yml) — Cancha learning resource links | Manual or Monday `19 13 * * 1`: 9:19 AM EDT / 8:19 AM EST | Public provider-link check, no credentials or CMS writes. Latest listed [39310440847](https://github.com/titodv41/cancha-automation/actions/runs/39310440847) failed October 19; inspect rather than assume healthy. Artifact: `learning-resource-link-check`. |
| [daily-opportunities.yml](../.github/workflows/daily-opportunities.yml) — Cancha daily opportunity review | Manual, matching source/config pushes, or `0 13,14 * * *`; local-hour guard selects 9 AM New York for scheduled work | **Legacy hosted-backend path.** Entire job is skipped while `CANCHA_AUTOMATION_BACKEND=github`, including manual dispatch. [40213804394](https://github.com/titodv41/cancha-automation/actions/runs/40213804394) was skipped October 25 as expected. Current imports run through `github-instagram.yml` action `prepare`; do not enable a second backend to fix the skip. |
| [premium-voice.yml](../.github/workflows/premium-voice.yml) — Cancha voice auditions | Manual only: `check`, `free-audition`, `audition`; voice Chris/Jessica/both | Shares durable voice ledger and private-automation concurrency. Chris is selected. `check` is read-only; generation does not publish and paid mode remains disabled. Latest [40051124635](https://github.com/titodv41/cancha-automation/actions/runs/40051124635) passed October 23 New York. |
| [cms-consolidation-backup.yml](../.github/workflows/cms-consolidation-backup.yml) — Cancha CMS consolidation backup | Manual only | `check:connection`, then `backup:cms-consolidation -- --encrypted-store`; reads Framer, writes only encrypted GitHub backup, fails for missing required pages/collections. [40148978283](https://github.com/titodv41/cancha-automation/actions/runs/40148978283) passed with zero artifacts on PR #6's head, since merged. It does not migrate/delete collections. |
| [claude-improvement.yml](../.github/workflows/claude-improvement.yml) — Cancha bounded Claude improvement | Manual `check`/`propose`/`revise`; Monday/Thursday `30 13 * * 1,4`: 9:30 AM EDT / 8:30 AM EST; optional legacy Codex-bot review trigger for `claude/cancha-improve-*` PRs | Enabled, included-only confirmed. Model step is read-only; a separate step validates/tests and opens a scoped presentation PR. [Pilot 40214922353](https://github.com/titodv41/cancha-automation/actions/runs/40214922353) failed before a proposal. No full unattended cycle verified. Still no automatic merge/release; optional hooks do not impose peer review under the new rule. |

### Main production action schedule

- `replenish`: `23 13,17 * * *` → 9:23 AM / 1:23 PM EDT, or 8:23 AM / 12:23 PM EST. At most two new source-checked directory guides/run, six-post target buffer, accepted cached narratives, at most one new source-backed news story/day and a two-video buffer.
- `prepare`: `9 14 * * *` and `19 16 * * *` → 10:09 AM / 12:19 PM EDT, or 9:09 AM / 11:19 AM EST. Source/date/duplicate checks, private backups, qualified CMS staging, club discovery, catalog/news refresh and guarded publication. Complete same-day preparation can skip duplicate work. Zero additions can still be successful maintenance.
- `publish`: `11,41 0-3,16-23 * * *`; [github-schedule.mjs](../scripts/github-schedule.mjs) permits local noon onward. Nominal coverage: :11/:41 from 12:11 PM–11:41 PM EDT or 12:11 PM–10:41 PM EST. Plan slots remain 12:30 PM / 6 PM, at most two/day and 14/week, four actual hours apart. A real daily carousel receipt precedes a Reel/platform post; platform promotion is capped at two/week. Missed-slot recovery is at most 90 minutes; timing/quality may cause a skip.

Manual actions also include `review`, `pause`, `resume`, `command`, `verify`, `insights`, `repair-media`, `reconnect`, `connect-insights`, `connect-insights-user`, `diagnose-insights` and reviewed creative-refresh modes. `migrate` is the completed Render migration; do not repeat it. [github-instagram.mjs](../scripts/github-instagram.mjs) and the workflow's `options` list are authoritative. `cancha-private-automation` serializes production, Insights, auditions and encrypted CMS backups with cancellation disabled; the Claude loop has its own group.

## Every credential name — no values

**Inventory limit:** GitHub returned HTTP 403 `Resource not accessible by integration` when listing repository secret names. Repository-variable listing was also unavailable. The tables exhaustively cover the checked-out workflows' secret references, source credential bindings and retained Render configuration. They cannot establish whether additional unreferenced account secrets exist. Successful receipts verify operational bindings where noted; no values were read or copied.

### Repository secrets referenced by workflows

| Name | Use and evidence |
| --- | --- |
| `FRAMER_API_KEY` | Project access in website preparation/replenishment, analytics, source health, backup and legacy preparation. October 25 preparation and earlier read-only checks succeeded. GitHub's secret is separate from Codex's managed proxy binding of the same name. |
| `CANCHA_GITHUB_STATE_KEY` | Encrypts/decrypts live state, CMS backups and voice reservations; required by production, Insights, auditions and backup. Real checkpoints work. **Preserve it**: replacing it without verified migration loses access to existing state/backups. |
| `ELEVENLABS_API_KEY` | Auditions and replenishment only. Prior Chris generation succeeded. Latest blocking condition is the project character cap, not a proven invalid key. |
| `CLAUDE_CODE_OAUTH_TOKEN` | Claude Pro subscription authorization in the official action; presence check passed. Actual pilot errored without a proposal, so usable authentication/quota is not established by presence alone. Owner confirmed extra usage off; no developer API fallback. |
| `META_APP_SECRET` | App-authenticated metadata diagnostics and guarded Insights connections; used successfully in diagnostics/connection. Not supplied for ordinary publication. |
| `META_USER_ACCESS_TOKEN` | Fresh Facebook User consent, used only by `connect-insights-user` to derive/check the confirmed Page credential. Five required grants verified. This staging authorization may later expire; do not replace a working live Page credential merely for that reason. |
| `META_PAGE_ACCESS_TOKEN` | Optional manual replacement used by `reconnect`, direct `connect-insights` and diagnostics. An older candidate lacked Insights and expired; it was **not installed** as publisher. Normal publishing uses the verified encrypted credential. Validate app, Page, Instagram identity, grants and lifetime before any replacement. |
| `CANCHA_CONTROL_TOKEN` | Historical authenticated Render-to-GitHub migration input, supplied only to `migrate`. Migration is complete; current publishing does not need the old dashboard. Do not rotate/rerun migration casually. |
| `CANCHA_AUTOMATION_INGEST_SECRET` | Legacy hosted draft/backup ingestion, referenced by the skipped `daily-opportunities.yml`. Not needed for current GitHub-mode production or native email forms. Actual present configuration unverified. |

### Runtime authorization and legacy bindings

| Name | Location / handling |
| --- | --- |
| `GITHUB_TOKEN` | Ephemeral Actions authorization from `github.token`, with job-specific permissions. Used for checkpoints, backup storage and trusted PR staging. Not an owner-generated permanent key to copy. |
| `GH_TOKEN` | Optional CLI/state-client auth alias in source. Use the authenticated platform CLI; do not extract it or request a PAT just because an environment variable is absent. |
| `CANCHA_ADMIN_PASSWORD` | Retired Render admin-console login, generated in `render.yaml`. Current forms/publisher do not use it. |
| `CANCHA_WEBHOOK_SECRET` | Retired signed submission webhook/public-intake challenge secret, generated Render binding. Do not restore the old receiver as a form fix. |
| `META_TOKEN_ENCRYPTION_KEY` | Retired Render token-vault encryption key. Preserve any old backup/key pair; different from `CANCHA_GITHUB_STATE_KEY`. |
| `CANCHA_STATUS_TOKEN` | Legacy read-only hosted `/automation/status` bearer; not required for current GitHub status artifacts. |
| `ANTHROPIC_API_KEY` | Explicitly empty in the Claude model step. A paid developer API connection is **not** configured or authorized as fallback. |

Codex's managed environment also declares `FRAMER_API_KEY` scoped to `api.framer.com`; readiness metadata currently says unknown while actual transport checks have previously passed. Use the SDK, proxy and CA as configured. Do not copy a proxy placeholder into GitHub, dump environment values, disable TLS or move keys into ordinary source/configuration.

Non-secret selectors are not credentials: repository variables `CANCHA_AUTOMATION_BACKEND` (observed `github` in real status) and legacy `CANCHA_AUTOMATION_URL`; runtime `CANCHA_SCHEDULE_BACKEND`; IDs/username in `config/meta-account.json`; legacy `META_GRAPH_VERSION`, `META_LOGIN_CONFIG_ID`, `META_EXPECTED_PAGE_ID`, `META_INSTAGRAM_ACCOUNT_TYPE`, service URLs and database paths. Preserve account selection during renewal. Current Facebook Login grants are `instagram_basic`, `instagram_content_publish`, `instagram_manage_insights`, `pages_show_list`, `pages_read_engagement`; Instagram Login's `instagram_business_*` grants belong to a different route.

## Verified state and known problems

### Instagram, metrics and media

- [40214538910](https://github.com/titodv41/cancha-automation/actions/runs/40214538910) published the Rowdies/Al Lang carousel around 1:03 PM New York October 25; real Meta receipt retained. It approved the source-checked news film for 6 PM. That evening post is **scheduled, not verified Published** at this snapshot. Latest state: 10 Published records; zero `Publishing`/`Needs reconciliation` rows.
- [40214824656](https://github.com/titodv41/cancha-automation/actions/runs/40214824656) retained seven usable items, including five carousels; fresh news failed because its 224-character script exceeded the remaining 201-character monthly allowance. No new TTS request. October's durable ledger reserves 1,299 of 1,500 characters. `config/automatic-stories.json` and the shared Free ledger control generation; the higher inactive budget in `config/premium-voice.json` does not authorize paid usage or override the Free cap.
- Source-backed scripts/Chris narration are automated within that cap; fresh daily narrated videos cannot be sustained at the remaining allowance. Matching accepted audio can be reused without another request; carousels are independent. Rejected legacy voices/videos remain held. Never reset durable reservations, retry uncertain charges or silently buy usage.
- [Connection 40214331919](https://github.com/titodv41/cancha-automation/actions/runs/40214331919) and [earlier verification 40148250680](https://github.com/titodv41/cancha-automation/actions/runs/40148250680) proved the account and real metrics without test posting. The installed Page credential had no scheduled expiry; Meta can still revoke it. Do not revive the rejected/expired manual replacement.
- [Daily report 40148514164](https://github.com/titodv41/cancha-automation/actions/runs/40148514164): nine recorded posts, six with core metrics, no comparable topic groups. Unavailable older media are not zero engagement. Full reports are encrypted; no raw analytics in public PRs or Claude prompts. The read-only model packet does not yet ingest private Insights feedback. No proven growth/retention improvement.
- Stories/TikTok are not connected. No paid campaign or Meta Pixel activated. Native Codex review is connected (PR #6 has a bot receipt); it is optional under the new rule.

### Website and source coverage

- [Preparation 40214652958](https://github.com/titodv41/cancha-automation/actions/runs/40214652958) backed up and published October 25 maintenance, adding **zero** club profiles and **zero** Opportunities. No remaining club candidate passed identity/media checks. Target/cap 50 is not a volume guarantee.
- All five approved Teamwork employer boards returned 403 from Actions: Tampa Bay Sun, Miami FC, USL league office, Orlando City/Pride and Sporting JAX. UPSL endpoints and the Miami sitemap have also been blocked previously. Supported municipal/other sources continue. Expand official sources/adapters without bypassing logins/CAPTCHAs or inventing openings. Club/place profiles are not open tryouts.
- Last complete retained CMS backup: five collections / 496 items — 385 Clubs (club/program/place profiles), 106 Opportunities, two Providers, three Stories, zero Offers. Last detailed opportunity split: 84 Active, 14 Expired, six Pending, two Archived. Dated counts, not a fresh live read or 385 distinct verified clubs. Preserve owner-activated visibility when sources merely become unavailable; actual closure needs evidence.
- PR #1's homepage source merged; a separate live release of that exact hero was not verified. Inspect editor/live state before changing it or claiming deployment. Daily CMS publication can stop on unrelated editor/code changes; preserve that guard.
- Native form email delivery was owner-confirmed. Do not restore Render destinations or `SubmissionLock`. Community's Add your group flow exists, but no approved WhatsApp invite or Cancha-owned group has been supplied. Actual group/admin consent may require an owner/provider step; do not fabricate it.
- Weekly source-health and learning-link jobs last failed October 19; failures need inspection. Workflow existence is not a healthy-check receipt. Website aggregates measure tagged visits, not confirmed customer acquisition, registrations or ad conversions.

### Claude workflow and unfinished operations

- `config/claude-improvement-loop.json`: enabled, included-only confirmed, Sonnet; two initial passes/week, one/day, 15 initial turns, one eight-turn revision/PR, maximum two revisions/week, 25-minute model timeout, 16,000 output tokens, one open loop PR, at most three files/eight edits/24,000 edit characters/300 edited lines. No automatic retries, paid fallback, merge or release. CI and personal Claude Code share account usage; caps do not reserve quota.
- [Pilot 40214922353](https://github.com/titodv41/cancha-automation/actions/runs/40214922353) reached the pinned action, then returned misleading `subtype: success` with `is_error: true`, one turn, empty model usage and zero reported cost. No proposal, PR or production edit. [Upstream issue 1720](https://github.com/anthropics/claude-code-action/issues/1720) describes this reporting gap; the signature alone does not prove bad consent or a quota cause.
- PR #9's failure-only numeric/status diagnostic was tested locally and merged, but **not yet exercised on a new live failure**. Next eligible scheduled initial pass: Monday October 26, 9:30 AM New York. Do not refund/rerun the failed attempt outside caps. Artifact `claude-loop-execution-status` classifies numeric 429 as rate limit, 401/403 authorization rejected, 5xx provider unavailable, without raw provider prose/traces. A 429 waits for reset, not paid fallback.
- CI proposals still have presentation-only paths/read-only tools and optional recognized Codex-bot revision hooks. This is not a general autonomous business operator. Claude now owns maintaining/replacing it through its own tested/self-reviewed PR. Align optional hooks and merge/release automation as appropriate; this docs-only handover does not change workflow behavior or enlarge usage limits.
- Old governance PR #5 contains superseded split ownership and a proposed `AGENTS.md`; close it as superseded by this handover, **do not merge it later**. No `AGENTS.md` exists on this snapshot's `main`.
- Five-to-two CMS consolidation is **only proposed**. PR #6 fixed template serialization, encrypted backup storage and incomplete-backup failure. It did not migrate/delete collections, validate full restore of collection IDs/bindings/routes or buy a plan/domain. The older plan has stale Render/credential advice and an unproven rollback claim. A green backup alone is not a migration go-ahead. A 1,000-item plan also conflicts with a large directory: verify current limits/costs before purchase.
- No custom domain purchase/connection, Framer badge removal, native app, paid advertising campaign or paid-service rollout was completed.

## Backups, privacy and local-only work

The repo is public; artifacts are not a private vault. Full CMS snapshots, tokens, contacts/submissions and decrypted Insights stay out of public artifacts/PRs. Public health/status artifacts contain only approved projections; do not add private fields. Use encrypted state/backup envelopes for private data.

The older raw CMS artifact from run `40147236885` was downloaded and verified privately (14 files, five collections, 496 items), then deleted from GitHub; the run was checked to have zero artifacts. No claim about whether anyone accessed it beforehand. The fixed backup workflow uploads no raw snapshot.

Local ignored material in the existing Codex workspace is **not present in a fresh Claude checkout**:

- `private-data/retained-cms-backup-40147236885/`: verified retained complete snapshot; preserve privately.
- `backups/cms-consolidation-1792888365325/`: partial failed backup, **not** a complete migration baseline.
- `private-data/operations-audit-2026-10-25/`, `private-data/insights-setup/`: local operational/connection evidence, sealed reports and private diagnostics. Do not commit/upload raw logs.
- Other ignored `backups/` and `private-data/` hold release snapshots and rendered assets. Use verified encrypted hosted backups or secure private transfer, retaining matching keys; not accidental Git inclusion.
- Pre-existing untracked `previews/launch/` was untouched and is outside this commit. Existing `codex/*` branches/merged PRs remain for history.

## Continuing in Claude Code

Use Node 24 and locked dependencies: `npm ci && npm test`. Browser work uses pinned Playwright; the current Codex workspace has `/usr/bin/chromium`, selected with `CANCHA_BROWSER_EXECUTABLE`. Actions installs Chromium. Video work uses `npm ci --prefix video`, FFmpeg and the current Remotion recipes; no new paid generator is needed merely to diagnose a render.

Inspect current PRs/runs, then dispatch the existing read-only queue report if needed:

```sh
gh pr list --repo titodv41/cancha-automation --state open
gh run list --repo titodv41/cancha-automation --limit 20
gh workflow run github-instagram.yml --repo titodv41/cancha-automation --ref main -f action=review
```

Status artifact: `cancha-status-<run-id>` (`github-summary.json`, plus `instagram-preview.html` for review). Learning artifact: `cancha-learning-<run-id>` with `instagram-insights.enc.json` and `instagram-insights-status.json`. Download into ignored private storage. Use hosted preview links for the owner, not workspace-only links. Recheck sources/media/approval hashes before scheduling; arbitrary Draft counts do not establish readiness.

Recovery uses the same workflow with `action=prepare`, `replenish` or `publish`, sequentially after checking the previous receipt. Respect shared concurrency, day/week/voice caps, source checks and standing authorization. Never manually retry `Publishing`/`Needs reconciliation`, overwrite Published receipts or reset encrypted state. The existing publisher separately handles prior-day non-dispatched `Preparing` expiry.

`npm run check:connection` is read-only. Inspect [publish-home-updates.mjs](../scripts/publish-home-updates.mjs), [publish-player-discovery.mjs](../scripts/publish-player-discovery.mjs) and the release contract before site releases. Retain complete CMS/code/scene backups, typecheck actual editor files, check narrow preview changes and desktop/mobile routes/forms, then use the guarded release. Date-locked/one-time builders are historical, not a fresh-site installer.

First priorities: verify the October 25 evening publication receipt; diagnose the next eligible Claude pilot without buying usage; expand working official sources; inspect the two failed weekly jobs. Close those operational gaps before describing the system as fully autonomous or paying to scale traffic.
