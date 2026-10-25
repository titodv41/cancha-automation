# Cancha automation operations

Checked October 25, 2026, New York time. This is an operational handoff for the existing repository, not a new deployment or a transfer of credentials. Claude Code can continue in `titodv41/cancha-automation`; do not rebuild the project or set up a second publisher.

## Authority and ownership

The owner wants routine work to continue without daily approval. Claude leads website UX/copy, Instagram creative and growth; Codex maintains publishing, CMS/source automation and infrastructure. Both use separate branches and PRs, never direct pushes to `main`. Each assistant merges its own PR after tests pass and the other assistant has reviewed changes in its area. Ask the owner only about spending money or account login/authorization. Shared instruction wording is in PR #5, awaiting Claude's review.

Normal authorized decisions include selecting fresh source-backed topics, rotating the existing content mix, improving source coverage and fixing operational faults. Purchases, paid ads, extra API usage and new account access remain owner decisions. Keep existing privacy, factual accuracy and publication controls. Do not treat displayed club profiles as memberships or partnerships.

## What runs while chats are closed

| Work | Runner and scope | Verified status / limit |
| --- | --- | --- |
| Instagram preparation and publishing | `.github/workflows/github-instagram.yml`; encrypted `automation-state` | Live plan enabled for 12:30 PM and 6 PM New York, up to 14 feed posts/week and four actual hours apart. The daily carousel comes first. A scheduled slot is not a publication receipt. |
| Club/opportunity maintenance | The same workflow's `prepare` action, via `scripts/automate-opportunities.mjs` | October 25 preparation/publication passed, adding zero clubs and zero opportunities; five employer sources returned 403. Source failure must not be disguised as successful directory growth. |
| New creative preparation | The same workflow's `replenish` action | October 25 readiness was seven usable items / five carousels. Fresh news narration was blocked by the existing monthly cap; no new TTS request occurred. Recheck source/media eligibility; raw Draft count is not readiness. |
| Instagram measurement | `.github/workflows/instagram-insights.yml`, daily | Real reach/save/share access verified; full reports encrypted. The most recent verified report had no comparable topic cohorts yet. Do not claim continuous proven optimization. |
| Claude improvement proposals | `.github/workflows/claude-improvement.yml`, Monday and Thursday | Enabled, but the first pilot failed before a proposal; no completed model authentication or assistant cycle is established. Existing limits: two initial passes/week, one/day, 15 initial turns, one eight-turn revision/PR, at most two revisions/week and one open loop PR. No automatic merge or production release in this workflow. |
| Form submissions | Native Framer Email destinations | Owner confirmed Gmail receipt. Preserve the existing destinations; no Render account or always-on form server is needed. |

GitHub cron can be delayed or missed. Check actual job steps and durable receipts: a green run with skipped work does not establish publication, fresh listings or an assistant pass. This chat and a locally opened Claude Code session do not themselves run continuously. Scheduled source imports do not perform unlimited research or guarantee 50 verified additions/day.

## Live checks and recovery

Inspect Actions and PRs without exposing keys:

```sh
gh run list --repo titodv41/cancha-automation --limit 15
gh pr list --repo titodv41/cancha-automation --state open
gh workflow run github-instagram.yml --repo titodv41/cancha-automation --ref main -f action=review
```

The resulting status artifact contains readiness, plan state, publication receipts and source blockers. Download into git-ignored `private-data/`; never commit it. For an interrupted day, use the established actions rather than constructing new Meta requests:

```sh
gh workflow run github-instagram.yml --repo titodv41/cancha-automation --ref main -f action=prepare
gh workflow run github-instagram.yml --repo titodv41/cancha-automation --ref main -f action=replenish
gh workflow run github-instagram.yml --repo titodv41/cancha-automation --ref main -f action=publish
```

These mutations share the existing concurrency group. Wait for each result and inspect its summary before dependent recovery. Publishing obeys source checks, receipt state, quotas and actual spacing. Never manually retry `Publishing` or `Needs reconciliation`, overwrite Published rows, reset the queue or call a rendered Draft published. A past-day `Preparing` row is different from an uncertain dispatched publication; let the existing publisher apply its day-expiry checks.

Claude connection checks do not call a model:

```sh
gh workflow run claude-improvement.yml --repo titodv41/cancha-automation --ref main -f action=check
```

An authorized pilot uses `action=propose` and consumes one bounded included-usage attempt. Inspect its actual model job, proposal, tests and native Codex review before calling the improvement loop connected. If authentication or quota fails, retain the error and stop; no API fallback or automatic retry. A tested source PR is not a Framer deployment. Claude should merge its reviewed work and use the existing guarded release procedure, retaining CMS/code backups and checking desktop/mobile output.

## Immediate operational priorities

1. Finish the first Claude-authenticated proposal and review. [Pilot 40214922353](https://github.com/titodv41/cancha-automation/actions/runs/40214922353) reached the official action, then returned `is_error: true`, one turn, empty model usage and zero reported cost; no proposal or production edit occurred. Its generic missing-output error matches the reporting gap in [upstream issue 1720](https://github.com/anthropics/claude-code-action/issues/1720). That signature alone does not prove a bad token or a subscription limit. A new public-safe diagnostic reads only the execution file's numeric API status, error flag and output presence. It exports no raw provider error or trace. Do not rerun this attempt outside existing day/week caps; the next scheduled eligible pass is Monday. Native Codex review already has a real receipt on PR #6.
2. Verify today's preparation and evening publishing receipts. [Recovery run 40214538910](https://github.com/titodv41/cancha-automation/actions/runs/40214538910) published the Rowdies/Al Lang carousel at about 1:03 PM New York (real Meta receipt retained), cleared yesterday's non-dispatched preparation through the existing expiry checks and approved the fresh news film for 6 PM. Zero uncertain publication rows remained. The earlier 1 PM check had only reconnected credentials; it was not a publication.
3. Expand working official club/program sources. Last preparation added zero records; five employer boards returned 403. Preserve useful supported feeds, deduplicate by real organization/source identity and keep current opportunities separate from permanent club/place profiles.
4. PR #6's encrypted backup fix passed Codex re-review and Claude merged it. The current workflow preserves snapshots in encrypted storage with no raw artifact. Do not consolidate/delete collections based solely on a successful backup; restore, route and binding validation are separate.
5. Let Claude review PR #5 so Codex can merge the shared owner rules. Avoid overlapping design rewrites while Claude leads that area.

[Website preparation 40214652958](https://github.com/titodv41/cancha-automation/actions/runs/40214652958) confirmed October 25 publication and retained backups. [Creative replenishment 40214824656](https://github.com/titodv41/cancha-automation/actions/runs/40214824656) retained seven ready items / five carousels but correctly failed the fresh-news stage: its 224-character script exceeded the remaining 201-character voice allowance. Existing queue delivery remains independent; this is not an account-login failure or permission to raise the cap.

## Costs, secrets and private state

- Keep Claude extra usage off, no API fallback, and existing run caps. A subscription does not provide unlimited unattended work.
- ElevenLabs remains Free-only with a 1,500-character monthly project cap; the latest durable ledger reserves 1,299 characters, leaving 201 for October. This cannot support unlimited fresh daily narration. Reuse matching accepted audio or skip video when insufficient; carousels continue independently. Do not silently raise the cap.
- GitHub repository secrets already hold the account authorizations. Do not copy keys into chat, another assistant prompt, source files, screenshots or workflow inputs. Do not rotate `CANCHA_GITHUB_STATE_KEY`: it protects existing state and backups.
- The repository is public. Raw CMS snapshots, decrypted analytics, private contacts and submissions must not enter public artifacts or PRs. Use established encrypted state/backup storage. Full Insights reports are sealed before artifact upload.
- Existing Framer publication, forms and public URLs remain in place. No paid domain/plan change, Render service restoration, TikTok integration or new paid campaign is implied by this handoff.
