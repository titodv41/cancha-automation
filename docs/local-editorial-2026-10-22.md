# Local editorial: clubs, people and the Florida game

The owner requested local club/academy features, players, coaches, events, news and occasional business stories. Keep the existing one-feed-post-per-day plan at 18:00 America/New_York. GitHub execution can be delayed. This changes the content mix, not the posting limit or pause controls.

## Recurring mix

| Series | Useful material | Weekly starting mix |
| --- | --- | --- |
| Club notes | A real club, its city, programs and a useful question for local families/players | 2 |
| People in the local game | One player milestone and one coach/club-role explanation | 2 |
| Match plans | A dated match, event or session with official details | 1 |
| Florida soccer updates | A meaningful club/league development, with dates | 1 |
| Behind the club | Stadium plans, running a club, sponsorship or another concrete business story | At most 1 |

These are editorial targets, not a quota. A weak or expired story should be skipped. Broaden city coverage beyond Broward: the first batch includes Weston, the Orlando area, Jacksonville, Tampa Bay/St. Petersburg and Homestead. “Growing academy” needs an actual expansion, new program or attributable growth evidence. Avoid invented rankings and generic motivational filler.

## First reviewed batch

Seven original 1080×1350 feed designs and captions are in `content/instagram/local-stories.json`; the asset-backed queue payload is `local-stories-ready.json`. Preview: `previews/local-stories-2026-10-22/index.html`.

- Rowdies' Players’ Shield and Sebastian Cruz’s winner: October 18, 2026 club report. This is the regular-season award, not the playoff title.
- Ashlyn Puerta’s four-goal match: October 16 Sporting JAX report. A professional milestone, not a fabricated interview or player assessment.
- Weston FC: club history and home fields; no open-tryout claim.
- Florida Kraze Krush: U7–U8 Developmental and U9–U19 Recreational. The club explicitly says fall registration is closed. Its recreational Spring 2027 route is a waitlist, not a guaranteed place.
- Luis Mendoza: Weston FC’s public description of its Boys Technical Director role. No credentials independently certified.
- Miami FC/Homestead: clearly dated September 2025 proposal. 15,000 seats; $300m describes the whole planned complex, not just the stadium. Current club homepage still calls it a future stadium. No completion/construction claim.
- Rowdies October 30 home playoff event: kickoff confirmed against the newer October 18 report. Automatically ineligible at kickoff.

Club badges identify the editorial subject; they are not sponsor/partner marks. Sources and checksums are recorded in `content/instagram/local-stories/assets/manifest.json`. No club match photographs, portraits, broadcast footage or music were copied into these designs. Hosted JPEGs were decoded at 1080×1350 after upload. Framer re-encodes uploads, so queue approval binds to the public JPEG checksum while preserving the original render checksum in visual evidence.

## Automation and review

`config/local-editorial-sources.json` contains exact reviewed official documents, selected facts and expiry dates. Changing the descriptor invalidates its content hash. Approval and dispatch both re-fetch the documents; unavailable sources, missing facts and expired events block the post. The import action checks the full batch before saving any rows. It updates only new/Draft IDs, preserving approvals, publication receipts, a paused owner plan and the one-per-day limit.

The curated IDs have priority over older generic drafts. They remain drafts until a daily slot is within the existing eight-hour approval window. An occupied day is preserved. This is not a promise that all seven posts are already scheduled or that future stories will research themselves indefinitely. Existing daily directory/editorial preparation continues; a new current-events batch still needs reviewed facts and media.

Reproduce from the repository root:

```sh
CANCHA_BROWSER_EXECUTABLE=/usr/bin/chromium node scripts/render-local-stories.mjs
# Inspect every rendered design, then:
node scripts/prepare-local-story-batch.mjs
node scripts/upload-instagram-assets.mjs content/instagram/local-stories-ready.json previews/local-stories-2026-10-22
CANCHA_BROWSER_EXECUTABLE=/usr/bin/chromium node scripts/verify-local-story-assets.mjs
# After tests and pushing the reviewed commit:
gh workflow run github-instagram.yml --ref main --field action=refresh-local-stories
```

This uploads media assets and imports feed drafts; it does not publish the Framer website. The normal evening publisher makes the Meta call and stores the receipt. Ambiguous publications still require reconciliation, never automatic retries.

## Partnerships: prepare, then ask

No club has agreed to a partnership as part of this work. No outreach was sent. Before approaching a club, prepare a sample feature with its current public information and ask for factual corrections plus permission to use a small set of club-owned pictures/video.

Unsent message draft:

> Hi [name], I run Cancha, a Florida soccer directory and local community page. We’ve prepared a short feature about [specific program/story], using your club’s published information. Could you check the details and, if you’re interested, share a few pictures your club owns and permits us to use? We can link people to the correct program page. There’s no claimed partnership or promised reach. Happy to send the draft first.

For a coach feature, ask three real questions: what a first session looks like, who the program suits, and what families should ask before joining. For a player, use public professional achievements or permission-based interviews; do not invent quotes or solicit private details from minors. An Instagram collaboration invitation or message requires explicit authorization to send.

## Current limits and rejected research

- Corporate USL websites returned HTTP 403 in this workspace. No access restriction was bypassed. Accessible official club reports support this batch; no unsupported league-expansion announcement was substituted.
- A legacy Orlando youth domain returned unrelated casino content. It was rejected as a source. A fresh scan found no references to that domain in the current Framer CMS, so no listing was changed for it.
- The latest Instagram insights report requires `instagram_manage_insights`. Without usable metrics, topic/layout choices are editorial experiments, not measured performance improvements.
- Native Framer submission email delivery was already confirmed by the owner. No form configuration changed here.

## Video preview

An isolated Remotion project is installed under `video/`, with a rendered 18-second vertical player-story preview under `previews/video/`. It uses locally staged assets, the same official facts, Cancha typography and original animation. There is no audio or match footage. It has not been posted as a Reel; the current automatic publisher supports image feed posts and is unchanged in that respect.
