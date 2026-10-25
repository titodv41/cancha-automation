# Connect Claude Pro to the bounded Cancha improvement loop

Updated October 25, 2026. The owner confirmed Claude Pro is active, subscription authorization is stored, extra usage is off and native Codex review is enabled. **The bounded proposal workflow is enabled for a first authenticated pilot and its existing Monday/Thursday schedule.** This setting alone does not prove model authentication, a completed proposal or a website release. There is no API-key fallback or new paid allowance. See [the operational handoff](automation-operations.md) for verified receipts and remaining work.

## The connection

Claude uses the official Claude Code GitHub Action, authenticated with **the owner's Claude Pro subscription OAuth token**. The action's current official documentation explicitly supports Pro subscription authentication. This workflow supplies no `ANTHROPIC_API_KEY`, OpenAI API key, Framer key, Meta token or ElevenLabs key to Claude. GitHub is the shared handoff; this particular chat does not run continuously.

A bounded cycle:

1. Claude inspects a small packet of actual public Cancha designs, a phone screenshot when relevant and one focused source file. It can perform a short web-research query and propose one useful presentation fix.
2. A separate job validates the exact edits, tests the proposed tree and opens one improvement PR. Claude's model job has read-only GitHub permissions and no shell, write, edit or sub-agent tools; the trusted staging job applies the validated edits.
3. Codex's GitHub integration reviews that PR if repository reviews are enabled. This is a technical code review, not evidence that the artwork will grow an audience. Native Codex review settings and its usage allowance are separate account controls.
4. A recognized Codex review can trigger one capped Claude revision. A second revision is refused. A persistent PR label reserves the attempt before the model call, so failed attempts do not become eligible again when workflow history ages out. An open loop PR prevents a new initial cycle.
5. The pilot does **not automatically merge or release production changes**. Existing website/Instagram jobs continue independently. After the first authenticated cycle is assessed, we can decide how accepted changes enter the existing guarded release process. No second publisher is created.

## Usage controls

- Maximum **two initial runs per New York week** (fewer, larger passes, per the owner's October 24 request), and one per day.
- Maximum **one revision attempt per PR**, with a maximum two revision attempts per week.
- Initial pass: **15 model turns**. Revision: **8 turns**. Medium effort.
- Sonnet, at most 16,000 output tokens per response, and a 25-minute model-job timeout.
- One open improvement PR, up to three changed files, at most eight exact edits / 24,000 edit characters / 300 edited lines per pass.
- Monday covers the website (home, discovery, detail); Thursday covers social templates (news video and carousel layouts). Runs at 13:30 UTC: 9:30 AM New York during daylight time, 8:30 AM in winter. Manual runs obey the same caps. They do not get a separate allowance.
- Past workflow attempts count conservatively, including failures and paused attempts with an initial/revision title. There is no automatic workflow retry or quota-refund mechanism. Checks never call Claude and do not count as initial attempts.
- No dollar-denominated API budget is presented as a Claude Pro quota. We cannot reserve a precise percentage of a personal Pro allowance or know what other chats consume. Six turns can still use significant context. Claude and Codex retain their own account limits.

**For no overage billing, usage credits / extra usage must be off in the Claude account.** If additional usage is enabled in the provider account, a subscription-authenticated request can still draw on that allowance. The repository cannot independently force the account-wide billing toggle off. Keep Codex additional-credit purchases/automatic top-ups off as well. Provider limit exhaustion should pause the workflow until reset, rather than switch to an API key.

## One-time owner setup

### 1. Confirm included-only usage

In Claude, open **Settings → Usage**. Leave **usage credits / extra usage** disabled; labels can vary with the current UI. Do not add API credits for this setup. The Pro plan is the authentication route.

### 2. Generate the subscription authorization securely

Use Claude Code's official CLI on your own device, signed in to the Pro account. On macOS, open **Terminal**. If Claude Code is not installed, use the official [installation guide](https://code.claude.com/docs/en/setup). The current native installer command is:

```sh
curl -fsSL https://claude.ai/install.sh | bash
```

Then run:

```sh
~/.local/bin/claude setup-token
```

Complete the browser login using your Pro account. The command creates a long-lived **subscription OAuth token**. Copy it directly into GitHub's secure secret field below. Do not paste it into this or another assistant chat, source files, workflow inputs or a screenshot.

### 3. Store the token in GitHub

Open:

https://github.com/titodv41/cancha-automation/settings/secrets/actions/new

- **Name:** `CLAUDE_CODE_OAUTH_TOKEN`
- **Secret:** the subscription token generated above
- Click **Add secret**.

The Cancha workflow already exists; this setup uses its bounded prompts and does not need a generic `@claude` workflow installed alongside it. A regular Claude developer API key is not interchangeable with this token.

### 4. Enable native Codex PR review

Open Codex settings, then **Review code / Code review**, and select `titodv41/cancha-automation`:

https://chatgpt.com/codex/settings/code-review

Enable repository review and the relevant automatic-review preference. Choose a narrow review trigger such as the first PR review where the UI offers it. Avoid enabling additional per-commit reviews merely to make the agents talk more. Code review consumes the account's review allowance; no OpenAI API key is required by our workflow.

Automatic review has not been verified from this Codex workspace. The first pilot must show a real Codex review, not merely a successful Claude job. If the app does not review the newly created PR, we must correct that connection before claiming the two-assistant loop is live.

### 5. Report completion without sharing credentials

Tell this chat: **“Claude token saved, extra usage off, Codex review enabled.”**

That is enough to continue. We will run the free connection check, enable `config/claude-improvement-loop.json` after those account settings are confirmed, then run one bounded pilot and inspect the actual proposal, tests and review receipt. No further approval is required for the setup already authorized; missing account authentication is the dependency.

If GitHub rejects PR creation, its repository setting **Settings → Actions → General → Workflow permissions → Allow GitHub Actions to create and approve pull requests** may need enabling. This cannot be assumed from a repository token's presence. We will report the actual error rather than ask you to change unrelated settings in advance.

## Implementation and current status

- `.github/workflows/claude-improvement.yml`: check/propose/revise, read-only model job, separate tested PR staging, trusted-reviewer trigger, no publication secrets.
- `config/claude-improvement-loop.json`: enabled with the owner's included-only confirmation. All existing run, revision, scope and spending limits remain unchanged.
- `server/claude-improvement-loop.mjs`: hard run/edit scopes and deterministic proposal validation.
- `scripts/plan-claude-loop.mjs`: live run-history and open-PR checks, no model call in check mode.
- `scripts/prepare-claude-loop-input.mjs`: actual public reference images with checksum checks and a phone screenshot.
- `scripts/apply-claude-loop-proposal.mjs`: rechecks source identity, tests the changed tree, creates/revises the scoped PR; no auto merge.
- Local verification: **233 tests passed**, including run caps, New York day boundaries, failed-attempt accounting, trusted-reviewer checks, edit bounds and stale/ambiguous anchor rejection. Workflow YAML and job permission separation validated.

The public reference packet is not a private analytics export. The repository is public, and artifacts do not include provider execution traces, account tokens, contact data or raw bookmark exports. Instagram Insights is connected and full reports are encrypted. The current sample does not establish a winning format or measured growth; a scheduled creative pass does not automatically receive private analytics.

## Official references

- [Claude Code GitHub Actions and Pro OAuth support](https://code.claude.com/docs/en/github-actions)
- [CLI/non-interactive operation](https://code.claude.com/docs/en/headless)
- [Claude Code usage and cost controls](https://code.claude.com/docs/en/costs)
- [Official action source](https://github.com/anthropics/claude-code-action)
- [Codex GitHub integration](https://learn.chatgpt.com/docs/third-party/github)

### Live verification receipt

The owner subsequently confirmed **token saved, extra usage off, review enabled**, and assigned Claude the design/growth area and Codex the pipeline/CMS/infrastructure area. [Connection check 40142748079](https://github.com/titodv41/cancha-automation/actions/runs/40142748079) detected the subscription secret with zero model requests. Claude's larger-pass policy was reviewed and merged in PR #2. The native Codex connector subsequently completed an actual review of PR #6 at commit `1be5bdc`. Instagram Insights was verified in [run 40148250680](https://github.com/titodv41/cancha-automation/actions/runs/40148250680), and its encrypted daily report passed in [run 40148514164](https://github.com/titodv41/cancha-automation/actions/runs/40148514164). These remove the previous setup blockers; the first authenticated Claude proposal remains a separate live check. Enabling the existing workflow does not replace Claude's creative work or authorize additional usage.

Earlier [connection check 40141627692](https://github.com/titodv41/cancha-automation/actions/runs/40141627692) completed successfully before the secret was configured. It made **zero Claude requests**. [Automation checks 40141626593](https://github.com/titodv41/cancha-automation/actions/runs/40141626593) also passed on GitHub. These historical checks did not establish a live authenticated Claude/Codex exchange.
