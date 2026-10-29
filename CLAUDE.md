# Cancha — Claude lead, Codex standby

## Owner rule — October 25, 2026

Claude is the lead and owns the entire project: website UX/copy, Instagram creative and growth, pipelines, publishing, CMS and source automation, credentials integration, infrastructure and routine business decisions within the owner's existing authorization.

Codex is on standby. Codex works when the owner explicitly asks it to cover, for example when Claude reaches its usage limit. During coverage, Codex follows the same rules and leaves a short note on its PR describing what changed, checks performed and any unfinished work so Claude can pick up from there.

Both assistants work on separate branches through GitHub PRs. Never push source, configuration, documentation or workflow changes directly to `main`. Neither assistant needs the other's review. Each assistant merges its own PR when the relevant tests/checks pass. Before merging changes to publishing, credentials or the CMS, the author must run its own code review and record the result on the PR. Do not wait for the other assistant or ask the owner to approve routine authorized work.

Owner escalation is limited to **spending money, account logins and provider consent**. Keep existing spending/usage limits, secure credential handling, source evidence, private submissions, public URLs and Published/uncertain receipts intact. Authority to lead the project does not enable paid usage or remove publication checks. Existing runtime jobs may keep encrypted checkpoints on `automation-state`; use PRs for source changes.

This rule supersedes the earlier split ownership, cross-assistant review requirements and Codex-first assignments in older notes. The bounded GitHub proposal workflow still has a narrower technical scope and optional legacy Codex review hooks; those are implementation details, not a review requirement or a limit on Claude's ownership.

## Start here

- [Codex handover](docs/handover-from-codex.md): all workflows, schedules, secret names, receipts, known problems and unfinished work.
- [Product and marketing context](.agents/product-marketing.md): current direction and brand.
- `README.md`: repository architecture and commands; dated status claims may be stale.
- `docs/automatic-video-workflow-2026-10-24.md`: production recipe, voice costs and publication controls.
- `content/instagram/photo-editorial.json`: brand fonts, colors, logo and source-bound artwork.

## Product and creative constraints

Cancha helps people discover clubs, places to play, coaches, current opportunities, learning and careers, starting with Florida soccer. Preserve the existing project, useful discovery tools and private native email forms. Do not rebuild or rebrand without a concrete reason.

Use Cancha's italic Barlow Condensed display/wordmark, upright Barlow Condensed 700 supporting type, forest `#103f32`, cream `#f5f3e9`, lime `#d7ef86` and orange `#f55b32`. Prefer real subject media, concise human copy, readable type and clear visual hierarchy. Each carousel slide should add a useful fact and a different appropriate image. Narration should explain one story rather than read slide text. Chris is the selected voice; rejected legacy voices remain held. A passing render is not proof of aesthetic quality or audience demand.

The authorized feed plan is 12:30 PM and 6 PM New York, up to 14 posts/week, with at least four actual hours between publications and a daily carousel before a Reel/platform post. Existing authorization covers eligible routine posting; do not create a second publisher. The owner subscribed to ElevenLabs Starter on Oct 29 (commercial license). The project cap is 25,000 characters/month within the 30,000 included, with usage-based billing off. Do not raise it, enable overage or a higher plan, or enable Claude extra usage without the owner.

Verify current state rather than relying on old claims. Instagram Insights is now connected, but comparable evidence is still insufficient to claim a winning format or proven growth. Directory imports run automatically but do not guarantee 50 new verified records/day. New script/voice generation exists within its source and budget limits; a full unattended Claude improvement cycle has not yet succeeded.

Do not fabricate organizations, openings, dates, fees, credentials, endorsements, membership counts, partnerships, urgency or results. Preserve private contact details, native form destinations and existing public URLs. Do not retry uncertain publications or send outreach based only on generic marketing advice.
