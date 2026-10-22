# Cancha production direction

Keep the approved real-photo carousel look: actual subject media, Cancha display titles, readable Barlow supporting type, forest/cream/lime/orange and one idea per slide. Build videos around something a local person would care about, rather than a generic advert for Cancha.

## Formats to repeat

| Format | What the viewer gets | Visual language | Question or destination |
|---|---|---|---|
| Local club moment | A recognizable team and a real result or useful detail | Club-published action, clear identity, small result panel, short title beats | Which club should we watch next? |
| Soccer explained | One league, stadium or pathway story made understandable | A genuine subject photo/crest plus a meaningful diagram, timeline or comparison | What does this change for your city? |
| Find a place to play | A few useful options for a particular age, level or city | A photo carousel with identifiable clubs, specific differences and concise details | Explore the relevant Cancha results |
| The weekend | A real event, place and current date | Actual organizer imagery and one readable date/location card | Official event details; never invented ticket scarcity |
| Community advice | One practical question parents/players/coaches can answer | A relevant local image and a specific, short prompt | One question; no fabricated answers or member testimonials |

Community posts do not all need a sales CTA. Ask one question people can actually answer, and respond to real public feedback when available. Do not invent supporter quotes or pretend a featured organization has partnered with Cancha.

## Film structure

Open with the subject or a concrete question; show actual action in the first second for club clips. Give the identity and league once. Explain one thing, then close with a relevant question or destination. Keep a small number of clear beats and let actual motion do some of the work. Use official photos only when they add context; a picture with a slow zoom is not a substitute for useful animation.

Narration should sound like a person telling a soccer friend something useful. Write whole short sentences. Avoid “reported by,” “according to sources,” repetitive caveats, generic hype and phrases such as “elevating the game” or “a vibrant soccer ecosystem.” Record sources off the artwork and link them in the caption. Keep necessary context—planned, closed, the actual age group, or event date—in the story itself.

Use a consistent generic narrator without copying a player/coach. Warmth, pauses, pronunciation and clear phrasing matter more than the model name. Keep music lively but subordinate to speech; use a few restrained effects and short, eased transitions. Include readable on-screen facts so the film still makes sense muted.

## Before a film enters the live bank

1. Re-read the exact official source and confirm the subject, date and claim status.
2. Check that the photo/clip belongs to the actual topic. Preserve its identifying evidence and avoid recent reuse.
3. Inspect every scene and transition at phone size; remove missing glyphs, tiny supporting copy, abrupt cuts, redundant labels and unnecessary production notes.
4. Measure the finished MP4's format, duration, audio levels and checksum with `scripts/audit-motion-output.mjs`. Run `scripts/check-motion-previews.mjs` with Chromium to test hosted phone playback.
5. Run the relevant source, queue and publisher tests; push the reviewed assets and code; import through the GitHub workflow. Require a successful unpublished Meta processing check.
6. Preserve the daily carousel, daily cap, spacing, planned slots and durable published receipts. Never automatically retry an uncertain publication.

## What actually keeps running

GitHub Actions prepares from the reviewed bank and publishes within the standing plan. This workspace and its installed skills do not become an always-running researcher or video maker. Prepared content runs without the owner approving every post; new stories still need research/rendering to replenish the bank. A weak, expired or missing story should leave a slot empty. Skills guide production when an agent is working; they are not themselves a scheduler.

Performance improvements require comparable real results. The connected account currently lacks the requested Instagram insights permission. Until that is fixed, use observable creative/delivery checks and honest hypotheses; do not claim that reach, retention or conversions have improved. When data becomes available, compare similar post ages and track shares, saves, watch time, relevant website visits and club submissions. Change one major creative variable at a time.
