# Daily Instagram and chat control

The owner has since selected [GitHub Actions migration](github-migration.md) to reduce hosting costs. Follow that guide for the current migration; this page documents the existing Render backend.

Current owner instruction, October 9, 2026: one post daily, automatically selected and published, mixing tips, questions/fun, Cancha updates, storytelling, soccer news and current opportunities. This supersedes the earlier per-post review requirement. Initial slot: 6 PM America/New_York (not an analytics-proven optimum). Prepared start: October 10. Website publishing remains separate and requires explicit authorization.

## One-time secure connection

1. Deploy the latest repository commit in Render → cancha-automation → Manual Deploy → Deploy latest commit. The existing connected Meta vault and queue stay on the persistent disk; do not reset them.
2. Sync the existing Blueprint to add `CANCHA_CONTROL_TOKEN`, or create that environment key manually using a password manager's random value of at least 32 characters. Use a new key, not the admin password, Meta token, Framer key, status token or ingest secret. Save/redeploy the service. If Blueprint generated it, copy its value from Render's secure Environment screen.
3. Codex → environment → Network secrets / Secretos de red → Manage: set `CANCHA_CONTROL_TOKEN` to that same value, restricted to destination `cancha-automation.onrender.com`. Enter it only in the secure value field. The saved environment draft declares this requirement. Set the ordinary non-secret variable `CANCHA_AUTOMATION_URL=https://cancha-automation.onrender.com`. Save and publish the Codex **environment configuration**.
4. Tell Codex the connection is saved. Codex runs `npm run instagram:chat` to read the real account and queue. Then it can apply `content/instagram/standing-plan-command.json`, which records your existing authorization; no renewed content-plan approval is required. That file alone does not activate anything. The service requires its own explicit authenticated activation.

Do not paste any key, OAuth callback address or password into chat. There is no need to copy Meta tokens into Codex.

## Daily content delivery

GitHub → repository Settings → Secrets and variables → Actions:

- Secret `FRAMER_API_KEY`: an actual project-scoped Framer key, securely entered there; a Codex proxy placeholder cannot be copied here.
- Secret `CANCHA_AUTOMATION_INGEST_SECRET`: matching the existing Render Environment value of that name.
- Variable `CANCHA_AUTOMATION_URL`: `https://cancha-automation.onrender.com`.

These are needed if not already configured. The daily workflow runs around 9 AM New York every day; it renders original graphics, uploads JPEG assets and sends signed drafts to the private queue. Missing credentials leave read-only reports and explicit blockers. Never put a Meta access token in GitHub. The hosted worker remains enabled through `ENABLE_INSTAGRAM_WORKER=1`.

## What runs automatically

The daily pipeline combines a 28-piece original editorial bank, recent attributed BBC Sport football headlines and supported source-checked opportunities. News graphics use Cancha's own design; they do not copy publisher photos or invent a summary. It is a curated bank and structured source pipeline, not a hosted AI agent generating unlimited new copy. Refresh the editorial bank periodically; previously dispatched captions are not repeated just to fill a quota. New topics/designs can be requested in chat.

The standing plan selects today's post within eight hours of its slot, checks source evidence again, and publishes through the minute-based worker. At most one automatically selected post per New York day; an existing manual schedule on that day occupies the slot. It favors a varied weekly mix and can substitute suitable content. Weak, closed, changed, unavailable or stale sources are skipped. An empty safe pool means no post that day. No automatic retries after an uncertain publication.

“Stories” can mean storytelling feed content. Instagram Story publication additionally requires a confirmed Business account and a prepared Story asset. The initial daily pipeline produces feed posts. No automatic paid ads, DMs, testimonials, invented results, discounts or unverified launch claims.

## Manage it from chat

Examples: “Show this week's queue”, “Pause Instagram”, “Change the daily time to 7 PM New York”, “Write a post about first practice”, or “Cancel tomorrow's post”. Chat control supports reading, creating/editing drafts, scheduling, cancellation and plan changes. Edits invalidate approval; dispatched content cannot be silently replaced. A specific “publish this” instruction authorizes that post; ambiguous new instructions can need clarification.

Schedules are visible at https://cancha-automation.onrender.com/admin and through authenticated chat reads; they do not automatically appear in Meta Business Suite Planner. The dashboard shows whether the daily plan is enabled and includes a pause button. Pause cancels automatic posts not yet publishing; a publication already in progress cannot be guaranteed stopped.

For operators: `npm run instagram:chat` reads `/automation/review`. Mutations use a private JSON command file and `npm run instagram:chat -- /path/command.json --apply`. Without `--apply`, mutation commands are dry runs. Each command includes an actual owner instruction and a unique request ID; schedule/edit/cancel require the current queue version. Reusing a request ID with different content is rejected. The token grants queue/plan control and must stay private. It never exposes Meta credentials or submission contacts.

## Evidence and remaining blockers

35 local tests and a real Docker health/authenticated queue smoke check pass, including authenticated control, receipt replay, pause races, source freshness, daily limits, signed ingestion and account safeguards. Original brand/news graphics were rendered, inspected and uploaded as unpublished assets. Actual hosted chat control, plan activation and real Meta publishing remain unverified until deployment and secure token binding. The owner has reported the Meta connection successful; fresh runtime confirmation is still required. Current local tests do not prove a real Instagram publication.
