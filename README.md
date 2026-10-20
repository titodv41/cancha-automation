# Cancha automation

Cancha's existing Framer project is **GU8EIeQXaRbty0S23thu**. Live website: https://pioneering-friday-005497.framer.app/. The latest October 20 visual-directory release adds **130 profiles, for 331 total**: clubs/league squads, venues and pickup organizers. It adds visual categories, sourced league/division filters and concise club/opportunity pages. See [the current release](docs/visual-directory-release.md) for evidence and coverage limits; [the earlier discovery/growth pilot](docs/discovery-growth-pilot.md) preserves campaign and ZIP-search history.

**Current backend: GitHub Actions, not Render.** The owner-authorized plan is one automatically selected eligible Instagram feed post daily around 18:00 New York. The October 19 post has a confirmed Meta publication receipt. Stories and video publishing are not enabled. Publishing permission and insights permission are separate: [the remaining analytics setup](docs/instagram-insights-connection.md) explains the secure owner step for performance learning.

**Current submission intake: native Framer email forms.** Organization-form delivery was confirmed by the owner. Contacts stay private; unreviewed submissions do not automatically become public profiles. Preserve these form destinations and fields. Do not restore the retired Render receiver or `SubmissionLock` from older notes.

## Environment

Use Node.js 24. Exact dependencies are locked: framer-api 5.1.0, ws 8.22.0, https-proxy-agent 9.1.0; browser tools Playwright 1.63.0 and undici 8.1.0. For browser commands, set `PLAYWRIGHT_BROWSERS_PATH=/tmp/cancha-browsers` and install Chromium if it is missing. FFmpeg is used only for the optional product-video preview.

```bash
cd /workspace/cancha-automation
npm --cache /tmp/cancha-npm-cache ci
npm test
npm run check:connection
```

The connection check is read-only, checks Cancha's hashed project identity and never prints credentials. The SDK captures global WebSocket at import time; `scripts/transport.mjs` preserves authorization through the inherited proxy and CA, with TLS verification enabled. Runtime configuration and credentials must be checked after a workspace restore; no new setup secret was needed for the October 20 release.

## Credentials

A Framer project key is created in **Site Settings → General → API Keys**. Store it in a password manager and in Codex **Network secrets / Secretos de red**, named `FRAMER_API_KEY`, scoped to `api.framer.com`. Never paste it in chat, a command argument, an ordinary configuration file or Git.

GitHub Actions needs its own **Repository secret** named `FRAMER_API_KEY`; Codex's proxy placeholder is not the raw value to copy there. Meta tokens and the encrypted-state key also belong in GitHub's secure secret fields. Existing secure access works. Do not replace credentials solely because a legacy guide describes an earlier setup stage.

## Discovery and daily updates

- `framer/CanchaHome.tsx`, `CanchaDiscovery.tsx` and `DiscoveryModel.tsx`: what/where search, optional age/level/activity filters, ZIP-area proximity, shareable filters and bounded campaign attribution.
- `server/discovery-catalog.mjs`: public-only projection of Clubs and Active Opportunities, plus safe details for retained closed URLs. Pending submissions/contact paragraphs are excluded; common card/detail facts are packed once to fit Framer’s file limit.
- `scripts/discover-florida-clubs.mjs`: official UPSL Premier/Division 1 and FYSA adapters, duplicate checks, safe website identity, reviewed badge selection, backup before mutation and guarded publication. Daily cap: 25 qualified club profiles, not a guaranteed quota.
- `scripts/automate-opportunities.mjs`: source/date checks, qualified opportunity staging, directory growth, reviewed publication and local Instagram draft preparation. The configured opportunity research target is 50; actual source quality determines additions. Club profiles are counted separately from current openings.
- `scripts/github-instagram.mjs`: encrypted private GitHub state, standing plan, exactly bounded dispatch and publication receipts. The rejected generic content bank stays disabled.
- `config/growth-campaigns.json` and `content/instagram/discovery-campaigns.json`: organic discovery campaign plan and original creative pool. No paid ads or new subscription service was activated.

Existing owner-activated opportunities must not be sent back to Pending review merely because a source is stale or blocked. Preserve URLs. Flag uncertainty; close listings only when source/date evidence establishes closure. New entries still require sufficient source evidence. Do not fabricate open tryouts, fees, credentials or discounts from a club-directory entry.

**Do not rerun one-time page/schema builders blindly.** Back up first and inspect current live/editor state. Publication guards check reviewed code/scenes and narrowly scoped CMS changes; unrelated owner edits block automation. Keep club additions and their publication in the same Framer session to avoid inconsistent snapshots across clients.

## Verification and references

`npm test` covers source adapters, privacy, duplicate/lifecycle rules, queue receipts, age matching, ZIP search, campaign links and publication scope. Framer typechecks code before application. `scripts/verify-visual-discovery.mjs`, `verify-simple-discovery.mjs` and `verify-nearby-discovery.mjs` check browsing/details on desktop/mobile; `verify-florida-expansion.mjs` checks courses, services and preserved forms/routes. Browser checks block outgoing POSTs and do not send submissions.

`backups/` and `private-data/` are private and excluded from Git. Preserve private backups before discarding the workspace. `previews/visual-discovery/` contains the latest website previews. `previews/zip-discovery/` preserves earlier campaign previews and an unscheduled product-video prototype. Older files in `audit/`, `inputs/`, `previews/` and deployment guides preserve implementation history.

- [Discovery and growth pilot](docs/discovery-growth-pilot.md)
- [Instagram analytics access](docs/instagram-insights-connection.md)
- [GitHub migration history](docs/github-migration.md)
- [Age-evidence rules](docs/player-profile-discovery.md)
- [Framer Server API](https://www.framer.com/developers/server-api-reference)
