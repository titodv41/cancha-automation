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

## Owner decisions — November 4, 2026 (evening)

- This week's focus: an MVP app designed and in the works so we can start marketing it, and a new website design. Instagram keeps running: valuable, traffic-driving posts only.
- MVP first user: **someone new in town** who wants a team and a soccer community (the founder's own story: soccer connected him to people in every new city and country). Core: clubs and teams near me, ask to join, people you'll play with.
- Look and feel for the app and the website: **Strava** (social, streaks, people), **FotMob/OneFootball** (clean sports data, many club crests, follow your teams) and **Nike Run Club** (bold editorial type and photos, premium).
- Website while the app is built: **app landing page + waitlist** (players and organizers), crests up front; the current directory moves to a secondary page.
- MVP flow (owner, Nov 4): first open is a **3-tap quiz** (area, level, what you want: play, join a team, meet people) leading to a personal home. Joining a team is **request, captain accepts, then in-app chat** (no phone numbers shared). Waitlist asks **email + area + role** (player or organizer). Launch area: **Miami-Dade + Broward**.

## Less text rule — November 4, 2026 (owner)

Text is the thing the owner dislikes most across Instagram, the website and the app: crowded, small, and it adds nothing. Applies everywhere:
- Say it in the fewest words. One idea per slide, card or section. If a line doesn't change what someone does, cut it.
- No small print in the design. Nothing below 14px in the app or on the site, and nothing a phone viewer has to zoom to read on a slide. Required receipts (source, checked date, "example") go one tap deeper or into the caption, not on the visual.
- Visuals carry the message: real photos, club crests, big numbers. Show many club badges; they build trust and make people feel part of a club.
- Copy the layout discipline of good sports apps (FotMob, OneFootball, Strava) rather than inventing dense layouts.

## Existing automation and limits

The standing plan authorizes 12:30 PM and 6 PM New York feed slots, up to two/day and 14/week, at least four actual hours apart. The carousel-before-Reel rule was removed on Nov 4 (owner): each slot takes the most valuable approved post. Routine eligible scheduling does not need owner sign-off. Preserve Published and uncertain receipts; do not retry an uncertain dispatch. Stories and TikTok are not connected.

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
- Commercial work: the owner handles the legal side. Sales (founding-partner pilots, sponsorships) can be prepared and proposed later; any paid placement must be disclosed, and pricing or a deal goes to the owner before it's offered.

**Owner decisions on the brief (Nov 2).**
- **Volume stays.** Up to 2 posts a day and 14 a week, because testing at volume finds what works. Every post must still be interesting or useful; there are plenty of real stories, so no automated filler. The plan prefers researched briefs (`preferCraftedBriefs`).
- **No approval step.** Posts publish automatically after Claude's research and checks.
- **More short, engaging Reels.** They drive views and traffic.
- **Founder Reel:** later, once the format is proven.
- **Outreach:** the owner and ChatGPT handle it. Claude builds the content once someone says yes.
- **LinkedIn:** start looking at automated professional posts the week of Nov 9 (needs the owner's LinkedIn consent).
- **Creator content (Nov 2):** when a creator gives their OK, it covers everything in their video, including material inside it. The owner has his own advice on this. Always credit the creator.
- **Reels (Nov 2):** aim for 1–2 creator Reels a week using the cancha-reel skill. Analysis Reels can run 45–75 s with the cinematic music style.

**Design direction (owner, Nov 3 references: @phormestudio on Instagram, boardui.com).**
- **Instagram (phorme):** a calm, premium grid. Lots of empty space, one short statement per slide in a light, elegant weight, black-and-white action photography, and an alternating rhythm of statement slides and photo slides. Restraint over decoration.
- **Website (BoardUI):** clean modern product UI. Generous white space, soft neutral backgrounds, crisp cards, small refined data visuals, one strong primary button, a clear hierarchy, and nothing cluttered.
- **How to apply it:** keep Cancha's colors and real logo, but use them sparingly: mostly cream/white and forest, lime and orange only as accents. Test a "minimal" carousel variant (statement slide plus B&W photo slide) against the current bold style, and compare saves and shares before switching. Bring the website's cards, spacing and type toward BoardUI's calm precision, one section at a time, checked at 390 px and on desktop.
