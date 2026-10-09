# Cancha automation

Framer project **GU8EIeQXaRbty0S23thu**. Authenticated Server API access works in this Codex instance. The user published the earlier listing fixes; live browsing was verified. New Providers, Offers, Stories and navigation changes are saved in Framer's **unpublished draft**. This automation has not published the site or Instagram content.

Start with [Meta and unattended automation setup](docs/connect-meta-and-automation.md): two new Miami FC listings are ready for the next website Publish, and eight Instagram designs remain unscheduled drafts. Twenty-eight tests and a real Docker smoke check passed.

Read [the growth and Instagram report](docs/growth-and-instagram.md) for the latest work, desktop/mobile previews, account connection steps and blockers. Review [six Instagram designs and captions](content/instagram/review.md) and three articles in `content/stories/`. The earlier [change report](docs/change-report.md) preserves the listing audit. Read [private submission deployment instructions](docs/private-submissions.md) to deploy the prepared queue. The organization form is deliberately locked until that service is available.

## Environment

Use Node.js 24 (tested with 24.19.0). Exact dependencies and lockfile: framer-api 5.1.0, ws 8.22.0, https-proxy-agent 9.1.0; development browser tools Playwright 1.63.0 and undici 8.1.0. For screenshot/asset commands, set `PLAYWRIGHT_BROWSERS_PATH=/tmp/cancha-browsers` and run `npx playwright install chromium`.

```bash
cd /workspace/cancha-automation
npm --cache /tmp/cancha-npm-cache ci
npm test
npm run check:connection
```

Twenty-eight tests cover the read-only connection contract, Instagram approval/dispatch safeguards, New York offer expiry, and the real private receiver: signed intake, mandatory Pending review, retries, duplicate flags, consent, validation, and absence of public queue/contact access. They do not replace Framer Preview checks. `check:connection` reads only project information and disconnects, checking Cancha's hashed project identity without printing credentials.

The SDK captures global WebSocket at import time. `scripts/transport.mjs` installs a WebSocket adapter before the dynamic SDK import, preserving SDK authorization through the existing HTTPS proxy. TLS verification stays enabled and the WebSocket destination is limited to api.framer.com. `check:network` is optional: an unauthenticated probe is not an access check for the authenticated project.

## Secure Framer credential

Create a project key in the correct Framer project's **Site Settings → General → API Keys**. Store it in a password manager. In Codex environment settings, use **Network secrets / Secretos de red**, name **FRAMER_API_KEY**, destination **api.framer.com**, and enter the value only in the secure secret field. Do not send it in chat, commit it, or put it in ordinary environment variables, command arguments or installation scripts. The existing secure binding works; no replacement key is required.

A Framer key may permit more actions than our read-only connection test uses. Editing scripts are separate and must only run within an explicitly authorized scope. `getProjectInfo()` returns a hash rather than the URL's project ID; `scripts/read-project.mjs` validates the observed Cancha hash.

## Saved code and audit

- `framer/OpportunityImage.tsx`: contain/padded badges, cover photos, source-aware badge size and background.
- `framer/SubmissionLock.tsx`: form submission lock and disabled button while hosting is unavailable.
- `server/submissions.mjs`: private signed webhook intake using SQLite. Protected Instagram administration is separate from private submission review; no automatic CMS publishing.
- `server/review.mjs`: private operator review commands; decisions never publish to Framer.
- `server/Dockerfile`: container deployment preparation, not a deployed service.
- `inputs/`: supplied CSV data converted from UTF-8 BOM and retained as JSON.
- `audit/`: staged image assertions, source checks, per-listing review, duplicate comparisons and draft snapshots.
- `previews/`: Framer canvas screenshots of desktop/mobile draft layouts. Canvas collection-list templates can show placeholder content; detail screenshots render a real CMS example.
- `backups/`: complete pre-change Opportunities export and project metadata, private and excluded from Git. Preserve/download the backup before discarding this workspace.

**Do not rerun the one-time design scripts blindly.** Some create nodes and are audit records of implementation, not idempotent migrations. `apply-image-patch.mjs` matches existing IDs by unique system Slug, asserts no item/slug changes and no non-image field changes, and requires the three-image verification before the full patch. New listing review fields and statuses were applied only after image-only verification.

## Official documentation

- https://www.framer.com/developers/server-api-quick-start
- https://www.framer.com/developers/server-api-faq
- https://www.framer.com/help/articles/framer-form-webhook-setup/
- Installed SDK type declarations and the project's official agent API schema/Forms/CMS guides.

Reusable Codex installation/start instructions were saved as an environment configuration draft. Review and publish that **environment configuration** in Codex settings to activate it for future tasks; this is separate from publishing the Framer website. No credentials were added to those scripts.

## Daily opportunities

See [daily workflow](docs/daily-opportunities.md) for the weekday discovery schedule, source reports, closed/stale status handling and human-reviewed draft staging. The target is three quality additions, maximum five per New York day, without automatic publication. See [complete Meta and automation setup](docs/connect-meta-and-automation.md). The private service now implements OAuth, encrypted tokens, owner review and scheduling. Custom API schedules appear in its dashboard; Business Suite schedules appear in Planner. Hosting and real Meta authorization remain outstanding.
