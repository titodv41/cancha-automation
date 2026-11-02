---
name: cancha-reel
description: Make a Cancha Reel from a creator's video (or several) that the owner cleared, from permission to queue. Use when building, revising or reviewing any creator-cut Reel. Target: 1-2 per week.
---

# Cancha Reel workflow (creator cuts)

Read `.agents/product-marketing.md`, `content/instagram/what-works.md` and `CLAUDE.md` first.

## 1. Permission
The owner gets the creator's yes and relays it. Add the video to `config/clip-permissions.json` with `license: "creator-ok"`, the date and how it was given, or `cc-by` for Creative Commons. Check the channel: the account that shared a clip is not always the creator. A creator's yes covers their whole video, including material inside it (owner's decision, Nov 2). Credit the creator on screen (the renderer adds it) and in the caption, with a pointer to the full video. Never write "used with permission" on screen.

## 2. See the video before writing anything
Run `clip-download.yml` with `ids=<id>`. The log prints:
- the auto-captions with timestamps;
- 6-second contact-sheet URLs on framerusercontent.

Download the sheets and look at them. Download the job log through the URL that `get_job_logs` returns (`return_content: false`) to get the whole transcript.

## 3. Script: write it like a pro, for the ear (the owner flagged amateur scripts on Nov 2)
Target about 2.5 spoken words per second: 30 s ≈ 70 words, 60 s ≈ 145 words, 75 s ≈ 180 words.
Structure:
1. **Hook, in the first 2 s:** at most 8 spoken words, matching the on-screen hook. Use a claim that breaks expectations or a question with stakes. Bad: "Watch Messi at the 2026 World Cup." Good: "Messi walks more than any forward. And scores more."
2. **Why it matters:** one sentence on why the viewer should care.
3. **At most three beats:** one idea and one number each, linked with "But…", "So…", "Here's why…". Never read a list of years or stats like a timeline.
4. **Payoff:** the reveal that answers the hook.
5. **Takeaway for our audience** (youth players, parents, coaches): something concrete to do. "Next practice, check your shoulder twice before the ball arrives."
6. **One call to action**, said out loud, shown on the end card (`outro: {kicker,title,line}`) and repeated in the caption: follow, save, send to a teammate, or comment with one answer. Never more than one.
Write for the ear: short sentences, plain words, numbers people can picture, a natural pause before the payoff. Attribute borrowed analysis ("Pedro El Ingeniero showed…").

## 4. Storyboard before rendering
Write a table in the session scratchpad: sentence → on-screen line (5 words max, 2 lines max) → shot (`at`, crop `x` or `fit`) → seconds. Rules:
- Every sentence has a visual showing exactly what's being said. No empty pitches, presenter shots or off-topic frames.
- Plan shot seconds to match the words. The renderer stretches every shot evenly to fit the voice, so each line and its visual must be planned together.
- The first frame has a clear subject (player, face, big number), not a wide empty scene.
- Charts and boards use `"fit": true`. Players and action are cropped with `x` (0–1): centre ≈ x·0.68 + 0.16 of the frame width.
- Check shots near the start of a source video for the presenter or intro cards.

**Amateur-mistakes check.** Score each item 1–5 and rewrite anything below 4 before rendering:
- the hook is strong in 2 s;
- one story, no timeline-reading;
- every line has a matching visual;
- there's a takeaway for our audience;
- there's exactly one CTA;
- the on-screen text is short;
- the pacing has no dead shots;
- the music fits the mood.
Put the script and scores in the PR body.

**Music:** only licensed tracks from `config/music-library.json`, chosen by mood:
- `analysis` → rising-tide
- `hype` → undaunted
- `fun`/`community` → loopster

Set `"music": "<id>"`. The renderer puts it about 13 LU under the voice and ducks it further under speech. The caption must include the track's `credit`; tests enforce this. Never use the synthesized beds under narration: the owner rejected them on Nov 2. If no track fits, add a new CC BY track to the library (download it, pin its sha256, and listen-test it by asking the owner) rather than forcing one.

## 5. Ship and review
1. Run `npm test` and confirm `# fail 0`. Open a PR, merge, and wait until main has the merge.
2. Dispatch `creator-cuts.yml` with `cut=<name>`. The log shows `narration`, `checks.passed`, the hosted mp4 URL and `prepared`.
3. **Always review the hosted render:** `ffmpeg -i reel.mp4 -vf "fps=1/2.2,scale=270:-2,tile=7x2" -frames:v 1 sheet.jpg`, then look at every frame. Check:
   - lines match visuals;
   - nothing important is cropped;
   - no off-story footage;
   - the logo and chip are present.
4. Fix and re-render before the post goes out (the Draft is replaced in place, and an unchanged script reuses the cached voice). Send the owner the final mp4.

## Lessons log
- Nov 2, Messi cut: the first render centre-cropped stat graphics and mismatched lines and visuals. That's why `fit` and the beat-to-shot rule exist.
- Nov 2: the owner wants longer Reels when the source is rich, and calmer music than house for analysis.
- Nov 2: the first seconds of a creator's video often include the presenter on camera. Check the exact window on the contact sheet before using any shot near 0 s.
- Nov 2: the owner rejected the synthesized 'cinematic' bed ("weird piano, not even music") and the house beat under analysis. Licensed library music only, sitting well under the voice. Every Reel ends with one spoken and on-screen CTA.
