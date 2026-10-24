# Cancha automation

Cancha's existing Framer project is **GU8EIeQXaRbty0S23thu**. Live website: https://pioneering-friday-005497.framer.app/. The October 23 live read confirmed **385 club/place profiles and 106 Opportunities (84 Active)**. The source-recovery run added and published seven soccer-venue profiles; it added zero time-bound opportunities. See [the current source and creative release](docs/source-recovery-and-creative-release-2026-10-23.md) for receipts, two actual ElevenLabs previews, 14 new designs and remaining source blocks. City/ZIP search and optional age/level filters remain in place. Active CMS status is not a blanket verification of every record.

Community now has an **Add your group** flow into the existing private form. WhatsApp groups appear only after real admin-approved invites are available; no Cancha-owned group exists yet. The three native CMS guides remain searchable. See [community group setup](docs/community-groups.md) and [desktop/mobile previews](previews/community-refresh/).

**Current backend: GitHub Actions.** The owner-authorized plan has **12:30 PM and 6 PM New York feed slots**, at least four actual hours apart. Replenishment now discovers current official club news, writes a short evidence-bound script, generates the selected Chris narration, renders subject footage and delivers eligible videos to the standing plan. A daily carousel precedes a Reel or platform post; platform promotion stays capped at two per week. Prepared narrative recipes use accepted cached audio; rejected legacy videos remain held. New narration is **Free-only and capped at 1,500 characters per month**, so that cap cannot support a new narrated video every day. Reservations are encrypted and durable before provider requests. See [the automatic video workflow and limits](docs/automatic-video-workflow-2026-10-24.md). Three visual techniques rotate; measured preferences require comparable Instagram Insights data, whose permission is currently missing. Stories and TikTok publishing are not connected. See [analytics setup](docs/instagram-insights-connection.md).

**Current submission intake: native Framer email forms.** Organization-form delivery was confirmed by the owner. Contacts stay private; unreviewed submissions do not automatically become public profiles. Preserve these form destinations and fields. Do not restore the retired Render receiver or `SubmissionLock` from older notes.

## Environment

Use Node.js 24. Exact dependencies are locked: framer-api 5.1.0, ws 8.22.0, https-proxy-agent 9.1.0, linkedom 0.18.12; browser tools Playwright 1.63.0 and undici 8.1.0. For browser commands in this workspace, use `CANCHA_BROWSER_EXECUTABLE=/usr/bin/chromium` when that browser is installed. Otherwise install the pinned Playwright Chromium in a writable browser cache. FFmpeg supports source-media checks, narration mastering and video previews.

```bash
cd /workspace/cancha-automation
npm --cache /tmp/cancha-npm-cache ci
npm test
npm run check:connection
```

The connection check is read-only, checks Cancha's hashed project identity and never prints credentials. The SDK captures global WebSocket at import time; `scripts/transport.mjs` preserves authorization through the inherited proxy and CA, with TLS verification enabled. Runtime configuration and credentials must be checked after a workspace restore; no new setup secret was needed for the October 21 release.

## Credentials

A Framer project key is created in **Site Settings → General → API Keys**. Store it in a password manager and in Codex **Network secrets / Secretos de red**, named `FRAMER_API_KEY`, scoped to `api.framer.com`. Never paste it in chat, a command argument, an ordinary configuration file or Git.

GitHub Actions needs its own **Repository secret** named `FRAMER_API_KEY`; Codex's proxy placeholder is not the raw value to copy there. Meta tokens and the encrypted-state key also belong in GitHub's secure secret fields. Existing secure access works. Do not replace credentials solely because a legacy guide describes an earlier setup stage.

## Discovery and daily updates

The October 22 [traffic and platform review](docs/traffic-readiness-2026-10-22.md) recommends keeping Framer for launch, fixing campaign/Insights measurement and upgrading catalog loading before a large import. It includes verified costs, current blockers and [prepared local pilot links](content/growth/traffic-pilot-links.json); no ads or plan purchase were activated.

- `framer/CanchaHome.tsx`, `CanchaDiscovery.tsx` and `DiscoveryModel.tsx`: what/where search, optional age/level/activity filters, ZIP-area proximity, shareable filters and bounded campaign attribution.
- `server/discovery-catalog.mjs`: public-only projection of Clubs and Active Opportunities, plus safe details for retained closed URLs. Pending submissions/contact paragraphs are excluded; common card/detail facts are packed once to fit Framer’s file limit.
- `scripts/discover-florida-clubs.mjs`: official UPSL Premier/Division 1, FYSA, FASA, regional Soccer Shots and Orlando soccer-field adapters, duplicate checks, safe website identity, reviewed badge selection, backup before mutation and guarded publication. Cap: 50 qualified new profiles per run, not a guaranteed quota. Regional providers and fields are not counted as open registrations.
- `scripts/automate-opportunities.mjs`: source/date checks, qualified opportunity staging, directory growth, reviewed publication and local Instagram draft preparation. The configured opportunity research target is 50; actual source quality determines additions. Club profiles are counted separately from current openings. The GitHub runner currently receives HTTP 403 from all five approved employer boards; career additions remain blocked there, while this workspace can perform source checks. A successful club run must not be described as working unattended job discovery.
- `scripts/github-instagram.mjs`: encrypted private GitHub state, standing plan, exactly bounded dispatch and publication receipts. The rejected generic content bank stays disabled.
- `config/growth-campaigns.json` and `content/instagram/discovery-campaigns.json`: organic discovery campaign plan and original creative pool. No paid ads or new subscription service was activated.

Existing owner-activated opportunities must not be sent back to Pending review merely because a source is stale or blocked. Preserve URLs. Flag uncertainty; close listings only when source/date evidence establishes closure. New entries still require sufficient source evidence. Do not fabricate open tryouts, fees, credentials or discounts from a club-directory entry.

**Do not rerun one-time page/schema builders blindly.** Back up first and inspect current live/editor state. Publication guards check reviewed code/scenes and narrowly scoped CMS changes; unrelated owner edits block automation. Keep club additions and their publication in the same Framer session to avoid inconsistent snapshots across clients.

## Verification and references

`npm test` covers source adapters, privacy, duplicate/lifecycle rules, queue receipts, age matching, ZIP search, campaign links and publication scope. Framer typechecks code before application. `scripts/verify-expanded-discovery.mjs`, `verify-visual-discovery.mjs`, `verify-simple-discovery.mjs` and `verify-nearby-discovery.mjs` check browsing/details on desktop/mobile; `verify-florida-expansion.mjs` checks courses, services and preserved forms/routes. Browser checks block outgoing POSTs and do not send submissions.

`backups/` and `private-data/` are private and excluded from Git. Hosted backups are compressed before authenticated encryption and can be restored with `githubStateClient.loadBackup(ref)`; existing encrypted snapshots remain readable. Preserve private backups before discarding the workspace. `previews/community-refresh/` contains the latest Community, typography and group-intake previews; `previews/growth-polish/` preserves the prior growth release; `previews/brand-polish/` preserves the previous release; `previews/location-community/` preserves the earlier search release; `previews/visual-discovery/` preserves the prior release. `previews/zip-discovery/` preserves earlier campaign previews and an unscheduled product-video prototype. Older files in `audit/`, `inputs/`, `previews/` and deployment guides preserve implementation history.

- [Cancha design principles](docs/cancha-design-principles.md)
- [Community content plan](docs/community-content-plan.md)
- [Booking marketplace versus ads](docs/marketplace-revenue-model.md)
- [Monetization pilot](docs/monetization-pilot.md)
- [Google Flow content workflow](docs/google-flow-content-workflow.md)
- [Discovery and growth pilot](docs/discovery-growth-pilot.md)
- [Instagram analytics access](docs/instagram-insights-connection.md)
- [GitHub migration history](docs/github-migration.md)
- [Age-evidence rules](docs/player-profile-discovery.md)
- [Framer Server API](https://www.framer.com/developers/server-api-reference)
