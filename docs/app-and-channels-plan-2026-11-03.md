# Cancha: one plan for the app, website and Instagram (Nov 3, 2026)

Sources: the owner's two briefs from Nov 3 (the iOS master prompt and the website/Instagram follow-up). The owner decided:
1. **Web first, then iPhone, from the same Expo code.**
2. **No Mac or Apple Developer account yet.**
3. **The app lives in a new private repo.**

The automation repo stays public: private repos have a limited free allowance of GitHub Actions minutes, and the posting system runs Actions around the clock.

**Promise:** Find your game. Find your team. Help teams find players.
**Biggest risk: supply.** A finder with three openings is an empty room, and BenchApp Finder, Plei and GoodRec already cover parts of this. Success is a real player reaching a real organizer, not installs or followers.

## The three channels

| Channel | Job | Must not |
|---|---|---|
| Website (Framer, live at wearecancha.framer.website) | Public, searchable directory; current openings; organizer and player intake; demand test before the app | Pretend club profiles are openings; inflate counts |
| Instagram (@wearecancha) | Distribute specific verified openings; Meet the Team; trust | Announce an app that isn't available; fake urgency |
| App (Expo, web first) | Saved preferences, consent-based player discovery, the request → response loop | Become a feed, chat app or marketplace before the loop works |

One shared taxonomy across all three:
- **Club profile:** general info, no availability claim.
- **Accepting players:** organizer-confirmed, with a confirmed date and a recheck date.
- **Upcoming game or tryout:** dated, with eligibility, cost and a real next step.
- **League free-agent route:** described as exactly that.

## Stages

**Stage 0: owner setup (one-time; blocks the app code only)**
- Create the private GitHub repo `cancha-app` and give the Claude GitHub App access to it.
- Later, when the loop works: a Supabase project (free tier) and a free Expo account. Apple Developer ($99/yr) only at the TestFlight stage.

**Stage 1: website and supply (now, in the daily sessions)**
1. Reusable reviewed-opportunity importer (CMS write, self-reviewed), then the verified Kendall camps.
2. Listing labels: Club profile / Accepting players / Upcoming game or tryout, plus last-confirmed date, status and cost ("Cost not confirmed", never "Free").
3. Homepage: three intents (Find a game · Find a team · Looking for players?) on one location input, merged with the existing quick-start quiz, not a second questionnaire. Adults never see ODP; youth routes stay. Honest empty states.
4. Organizer intake for "Looking for players?" (opening type, requirements, schedule, cost or "not confirmed", private contact, authority to submit, advertise-until date). Private player intake, "Tell us what you're looking for", adults only, with permission before sharing.
5. Supply queue: about 10 real openings in one South Florida area, each with organization, source, checked date, availability evidence, missing details and next action. Outreach is handled by the owner and ChatGPT; Claude does the research and drafts.

**Stage 2: app slice A (once the repo exists)**
- PRD, research ledger, decisions, architecture, data model and access rules go in the app repo.
- Expo + React Native + TypeScript app shell, English/Spanish, guest preferences, Discover (Games / Teams & leagues / Tryouts), cards, detail, honest empty, error and no-coverage states.
- Demo fixtures are clearly labelled until vetted data is wired in.
- Web build runs on the owner's phone. Tests cover eligibility, expiry, timezones and "unknown cost ≠ free".

**Stage 3: app slices B–D (after Supabase)**
1. Auth, organizer approval and the opening lifecycle.
2. The request → response loop.
3. Moderation, deletion, security review, and a beta build (TestFlight needs the Apple account).

**Instagram alignment (ongoing)**
- Opportunity posts only from verified listings: `CITY · TYPE · WHO IT'S FOR · DATE` on the first slide, with an expiry and a closure plan.
- Meet the Team only after a guest agrees.
- Founder Reel later (owner decision).
- Bio, pinned posts and highlights: drafts only. Changing the profile needs the owner's account access.
- Every post has a stated purpose and a tracked link.

## Measurement

These are different things, and stay separate:
- reach
- saves and shares
- tracked link clicks
- listing views
- outbound registration/contact clicks (the daily referral report)
- interest requests
- organizer responses
- confirmed attendance

A click is not a registration.

## Not authorized by these briefs

Spending, sending outreach, enrolling accounts, publishing personal data, public release.
