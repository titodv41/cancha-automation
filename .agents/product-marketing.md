# Cancha product and marketing context

## Owner rule — October 25, 2026

Claude is the lead and owns everything: website, creative, growth, pipelines, publishing, CMS/source automation, credentials integration, infrastructure and routine business decisions within existing authorization. Codex is on standby and covers only when the owner asks, including when Claude hits its usage limit.

Both assistants use separate branches and GitHub PRs, with no direct pushes to `main`. Neither assistant needs the other's review. Each merges its own PR when the relevant tests/checks pass, after running its own code review on changes to publishing, credentials or the CMS. Codex follows the same rules while covering and leaves a short PR note with changes, checks and unfinished work for Claude to resume.

Escalate to the owner only for **spending money, account logins and provider consent**. Preserve existing spending/usage limits, credential security, factual checks, privacy and publication receipts. Existing encrypted runtime checkpoints on `automation-state` continue through the established client. This rule supersedes older ownership splits, peer-review gates and Codex-first assignments.

Read [the Codex handover](../docs/handover-from-codex.md) for workflow schedules, secret names, working receipts and unfinished work. Historical notes about missing Insights access or mandatory other-assistant reviews are no longer current. Existing CI proposal restrictions and optional review hooks are implementation details for Claude to maintain, not an ownership boundary.

## Purpose

Make local soccer discovery useful to players, parents and smaller organizations, starting in Florida. People should be able to find clubs, teams, pickup groups, parks/fields, training, coaches, current openings and learning/career pathways without navigating a crowded site. Keep careers and courses discoverable while making places to play the primary experience.

Clubs and places are permanent profiles; time-bound tryouts, jobs and events are separate opportunities. Directory membership does not imply open registration, guaranteed field access or a roster place. Source-blocked existing records should be flagged rather than silently hidden; evidence of actual closure can mark a listing Expired while preserving its URL. New entries need sufficient source evidence and duplicate checks.

The business direction is local discovery and community first. Featured placements, club promotion, partnerships and later booking/connection services are hypotheses to test. Do not invent demand, affiliates, membership, discounts or sponsored relationships. Paid campaigns, subscriptions and increased spend still require owner authorization. The equipment store, university gig marketplace, a native phone app and broader sports remain later possibilities.

## Brand and creative

Preserve Cancha's italic Barlow Condensed display/wordmark, upright Barlow Condensed 700 supporting type, forest `#103f32`, cream `#f5f3e9`, lime `#d7ef86` and orange `#f55b32`. Use real subject photos/footage, short readable text, measured color blocks and a strong image-led composition. Avoid dense paragraphs, generic motivational captions and a blog/Word-document appearance. Keep text and images in separate measured regions. Technical/source notes belong outside the artwork.

Each carousel swipe should add a useful fact and different appropriate media; changing crops of the same photograph is not variety. Mix recognizable local clubs, useful discovery, community stories, source-checked news and actual product demonstrations. Videos cover one specific story with a short hook and connected explanation. Narration adds context beyond the on-screen headlines; factual endings replace forced generic questions. Chris is the selected ElevenLabs voice; do not fall back to rejected local voices. Use the existing storycraft/motion guidance where useful, then inspect real renders and phone playback.

## Existing automation and limits

The standing plan authorizes 12:30 PM and 6 PM New York feed slots, up to two/day and 14/week, at least four actual hours apart. A published daily carousel precedes a Reel or platform post. Routine eligible scheduling does not need owner sign-off. Preserve Published and uncertain receipts; do not retry an uncertain dispatch. Stories and TikTok are not connected.

The replenisher prepares source-checked directory guides with official identities/badges and actual Cancha captures, aiming for a six-post buffer and at most two new guides/run. News scripts and Chris narration are automated within source, cache and durable reservation checks. The Free-only monthly project cap remains 1,500 characters; paid usage, paid fallback and uncertain generation retries remain disabled. Keep matching accepted audio reusable without a new charge. A configured voice or model key is not a guarantee of available quota.

The October 25 preparation published successfully but added zero profiles and zero opportunities. Five employer boards returned HTTP 403 from Actions, and no remaining club candidate passed the identity/media checks. Expand working official sources; do not fabricate volume to fill the target. Last complete retained CMS snapshot: 385 club/program/place profiles, 106 Opportunities, two Providers, three Stories and no Offers. Profile count is not a unique verified club or member count.

Instagram Insights access is verified and full reports are encrypted. The verified sample still has no comparable topic groups, so do not claim measured growth or a winning format. Website aggregates may contain owner/QA visits and are not confirmed registrations or ad conversions. The first bounded Claude GitHub pilot failed before producing a proposal; a full unattended improvement cycle is not verified. See the handover for the exact receipts and next checks.

Native Framer Email forms are the current private intake. The owner confirmed Gmail receipt; submissions do not automatically become public listings. Preserve those destinations. Community supports “Add your group,” but no approved public WhatsApp invite or Cancha-owned group has been supplied. Obtain actual admin/provider consent before listing private-community access. Do not send DMs, emails, comments or outreach based solely on generic skill recommendations.

## Operating brief — November 2, 2026 (owner's founder brief)

Mission: help people in soccer discover what comes next. Make Cancha useful enough to share, credible enough for organizations to take part, and effective enough that businesses will eventually pay. Producing content is not the same as building the business. Measure outcomes and say so plainly when a direction isn't working.

**Geography.** South Florida first, and say the actual neighborhood every time.
1. Miami-Dade: Doral/Sweetwater/West Miami; Kendall/Pinecrest/Palmetto Bay; Coral Gables/Coconut Grove/central Miami.
2. Broward: Pembroke Pines, Weston, Davie, Plantation, Coral Springs, Fort Lauderdale.
3. Palm Beach later: Boca Raton, Delray, Boynton, Wellington, Palm Beach Gardens.
Orlando, Tampa and Gainesville stay on the wider Florida roadmap and must not dominate the content.

**Audiences (hypotheses until our own data confirms them).**
- Youth soccer parents (28–55): cost, distance, level, beginners, girls' programs, camps, and how pathways differ.
- Coaches and trainers: reaching families and filling slots.
- Players 16–30: where to play, tryouts, college, UPSL, pickup.
- Club directors: registrations and visibility. Likely the first paying customers.

**Language.** English by default. Spanish-led or bilingual posts where the community is Spanish-speaking (test about 70/30). Spanglish only where it's natural. Never fake slang.

**Recurring series.**
- Meet the Team (coach and club interviews; see docs/five-questions-interview-kit.md)
- Find Your Next Game (verified, located, current opportunities)
- The Local Game (culture and people)
- No One Explains This (education: rec vs travel, MLS NEXT, ID camps, college paths)
- South Florida Soccer Radar (weekly verified roundup)
- Stories Behind the Game

**Differentiation.** Other directories already exist, including regional South Florida club directories. Don't compete on being another list. Compete on:
- verified, timely, located opportunities;
- strong visuals;
- recognizing local people;
- useful education;
- one clear action;
- bilingual community.

**Publishing standard.** Research → concept → fact-check → brief → assets → visual inspection → approval → publication → review. Every claim needs a source. Every post has a purpose and one relevant next action, never a generic "follow for more". Don't scale a format just because it can be automated.

**Hard nos (in addition to the rules above).**
- No fabricated relationships or "official partner" claims.
- No invented opportunities, prices, testimonials, traction or player stories.
- No scholarship or outcome promises.
- No implied affiliation with MLS, Inter Miami, FIFA or clubs.
- No unlicensed clips.
- No child-safety shortcuts.
- No WhatsApp or Facebook group promotion without an admin's permission.
- No scraped contacts or bulk unsolicited messages.
- Paid placement is always disclosed and never buys a positive review.
- No commercial execution (pilots, invoices, paid promotion) until the owner confirms it's permitted.
