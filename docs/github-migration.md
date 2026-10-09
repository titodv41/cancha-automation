# Move Cancha Instagram to GitHub Actions

Prepared October 9, 2026. The owner authorized this migration to avoid Render's monthly hosting bill. This replaces daily Instagram publishing and opportunity preparation; GitHub does not provide the existing HTTPS submission form or OAuth callback server. Nothing here deletes Render or publishes the Framer site.

## Costs and tradeoffs

The repository is currently **public**. GitHub's [billing documentation](https://docs.github.com/en/billing/concepts/product-billing/github-actions) says standard hosted runners are free for public repositories. This workflow uses `ubuntu-latest`, not larger paid runners. It runs content preparation around **10:07 AM New York** and publication around **6:07 PM**, covering DST. Small status artifacts expire after seven days. No paid service or model API is introduced. Set an Actions spending budget with **Stop usage when budget limit is reached** in GitHub Billing if available to your account; review cache/storage billing separately. If the repository becomes private, included minutes/storage and overage policy apply, so recheck the budget before changing visibility.

GitHub schedules [can be delayed or dropped](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule); this is not an exact-minute scheduler. A publication more than two hours late returns to a draft instead of dumping missed posts. Public-repository schedules may be disabled after 60 days without activity. No suitable safe content means a skipped day. The curated editorial bank needs occasional refreshing. Meta access can expire or be revoked on either hosting model.

## One-time transfer, all steps

1. **Render → cancha-automation → Manual Deploy → Deploy latest commit.** This installs the migration endpoint. Keep the existing `CANCHA_CONTROL_TOKEN`; do not change it just for this migration.
2. Open [repository Actions secrets](https://github.com/titodv41/cancha-automation/settings/secrets/actions). Add:
   - `CANCHA_CONTROL_TOKEN`: the existing value from Render Environment.
   - `CANCHA_GITHUB_STATE_KEY`: a **new**, password-manager-generated random value of at least 32 characters. Keep a recovery copy in your password manager; losing it loses access to encrypted historical state. Do not reuse the control/admin/Framer password.
   - `FRAMER_API_KEY`, only if not already configured: the actual project key for `GU8EIeQXaRbty0S23thu`. The Codex proxy placeholder cannot be copied into GitHub. This enables new artwork and opportunity preparation; no website publishing is performed.
3. Open [Cancha Instagram on GitHub](https://github.com/titodv41/cancha-automation/actions/workflows/github-instagram.yml) → **Run workflow** → branch **main** → action **migrate**. Leave command path at its default. This securely fetches the connection, queue, receipts, CMS backups and private submission records. It freezes Render publishing and new submissions, encrypts the transfer and saves it on `automation-state`. It applies the already-authorized daily plan. It does **not** immediately publish an Instagram post. The migration requires no new Meta login.
4. Confirm the run succeeds and reports the expected connected `wearecancha`. Run **prepare** to exercise fresh designs, private backup storage and queue delivery. It must succeed before relying on daily content. Run **review** to check schedule/status. A Publishing/Needs reconciliation row needs inspection on Instagram before any retry.
5. In [repository Actions variables](https://github.com/titodv41/cancha-automation/settings/variables/actions), add `CANCHA_AUTOMATION_BACKEND=github`. This enables the new scheduled jobs and disables the old Render-delivery workflow. No Render URL or signed-ingestion secret is required for this backend.
6. Keep Render until the migrated backup is saved, preparation succeeds, and one real Instagram publication is confirmed. Then pause the GitHub workflow while handling the form transition, download a copy of encrypted `state.enc.json` and the encrypted `backups/` directory from `automation-state`, and keep the state key in your password manager. Git history also retains encrypted checkpoints; none contains plaintext tokens or emails.
7. Before deleting Render, replace or disable any live website form pointing to it. GitHub Actions cannot receive public Framer submissions. The migrated submissions are a **private backup**, not a working intake service. Framer's native form inbox may be an alternative if available on the existing plan; that must be checked/configured separately. Preserve the migrated encrypted files first. Then delete the Render web service and its paid disk, and check Render Billing for any other billable resources or accrued charges. Pausing a service or changing GitHub variables alone does not cancel its disk bill. Do not delete the business/Instagram account or Meta app.

Never paste credentials, callbacks or decrypted backups into chat. Only GitHub secure **Actions secrets** fields receive the values. After a successful migration, the control token is no longer needed by routine GitHub jobs and can be removed from GitHub secrets once Render is retired. Retain `CANCHA_GITHUB_STATE_KEY`.

## What is preserved and how it stays safe

A dedicated bearer-authenticated POST exports AES-256-GCM encrypted state. The state key comes directly from the GitHub job over verified HTTPS; it is not logged or stored as plaintext on Render. Render persists the encrypted snapshot and a publishing lock. Export retries with the same key return the same snapshot. In-flight Publishing blocks migration; a worker awaiting a source or container cannot publish after the lock. New webhook submissions return 503 after the lock so no later records silently disappear when Render is deleted.

The encrypted branch is on a public repository. **Only authenticated ciphertext** goes there: Meta connection, queue, receipts and private submission backup. Raw tokens/emails and decrypted SQLite files are never committed or uploaded as artifacts. Independent CMS snapshots are encrypted in `backups/`, acknowledged before CMS mutation. State files over the supported size stop automation; archive preserved history before reducing state. This is application encryption, not a reason to store the decryption key in the repository.

All Cancha automation workflows share one concurrency group. API writes use a SHA comparison so a stale writer cannot replace another run. GitHub persists a **Publishing** claim before the irreversible Meta publish request and persists its result afterward. Interrupted/uncertain claims block further automatic publishing pending reconciliation. Missing credentials, failed backups or failed checkpoints prevent publication. Successful rows record actual publication time; repeated manual publish runs cannot produce another post that day. Weak/closed/changed news and opportunities are rechecked and skipped.

## See or change the schedule

Actions → Cancha Instagram on GitHub → Run workflow:

- `review`: current account, plan and status summary (no contact emails or tokens).
- `pause`: cancel automatic schedules that have not begun publishing.
- `resume`: reapply the owner's saved daily content plan.
- `prepare`: render/deliver today's supported content and schedule safe drafts; no Instagram publication.
- `publish`: execute one due post, respecting freshness, uncertainty and one-per-day guards.
- `command`: execute a repository JSON command with the existing owner-instruction, unique request ID and current version contract. No credentials belong in that file.

The Render admin dashboard is retired after shutdown. The status appears in the workflow run summary and `cancha-status` artifact. Scheduled custom API posts do not automatically appear in Meta Business Suite Planner. This Codex GitHub integration can push code and read repository data; repository-secret/variable management is currently denied. Workflow dispatch access must be tested separately. Do not promise full chat control while that access remains unavailable.

## Current verification and blockers

Forty local tests pass, covering authenticated encryption/tampering, restore, migration freeze, preservation, checkpoint failures, source checks and daily limits. A real Docker smoke check passed for health, authenticated encrypted export/retry, frozen publishing and frozen private intake; it made no real Meta calls. Existing Meta connection was reported successful by the owner. Live migration, GitHub secrets, remote state writes, daily preparation and real Instagram publication still need verification. Render has not been deleted or switched off by Codex. The private submission service still needs an alternative or explicit form disable before retirement.
