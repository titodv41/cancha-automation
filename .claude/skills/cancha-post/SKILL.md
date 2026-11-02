---
name: cancha-post
description: Build a Cancha Instagram carousel ("Cancha Brief") from research to queue. Use when creating, revising or reviewing a Cancha post, interview, roundup or explainer.
---

# Cancha post workflow

Read first: `.agents/product-marketing.md` (operating brief: geography, audience, series, hard nos), `content/instagram/what-works.md` (evidence, reach playbook, voice, ask-the-owner rule) and `CLAUDE.md`.

1. **Pick the story.** South Florida first, with the neighborhood named. Prefer something with a clock on it, something people will send to a team chat, or a real local person. Check what's already queued in `content/instagram/brief-carousels.json`.
2. **Research and verify.** Use official or reputable pages, opened today. Copy confirm tokens (exact strings on the page) into `sources[].confirm`. No source, no claim. If a score or date can't be found officially, don't post it.
3. **Permission check.** Photos must come from a cited source, a cleared video, CC community media (`config/community-media.json`) or a guest with a recorded OK (`config/interview-permissions.json`). A creator's video or a guest needs the owner's yes first: build the post or storyboard, then end with an ASK line.
4. **Write it like a person.** Short lines and real numbers. The opinion goes only on the OUR TAKE slide. One call to action. No AI filler (the test in `test/brief-carousels.test.mjs` rejects the giveaways).
5. **Visuals.** Every point slide gets a different `visual`: photo, stat, scoreboard, ratio or bars. Don't repeat the visual's number in the headline. The real logo comes from the renderer.
6. **Render and look.** Run `ONLY=<id> node scripts/render-brief-carousels.mjs` and inspect every slide at phone size. Overflow fails the render.
7. **Ship.** Add the id to `approvedBriefCarouselIds` (and to `priorityDraftIds` plus `expiresOn` if it's time-bound). Run `npm test` and confirm `# fail 0`, then open a PR and merge. Once main has the merge, dispatch `brief-carousels.yml` with `only=<id>` and confirm `prepared` in the queue job log.
8. **Afterwards.** In later sessions, compare its results (shares, saves, follows), and write conclusions only (never raw numbers) into `what-works.md`.
