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

## 3. Story first
- **One story.** Usually the creator's thesis, retold in 45–75 s for analysis pieces (the owner prefers longer when the material is strong) or 20–35 s for tips.
- **Hook:** at most 2.4 s, two short lines, a surprising claim ("Messi walks. And scores more.").
- **Narration (Chris)** explains the story and doesn't read the screen. Attribute numbers to the creator ("In Pedro El Ingeniero's breakdown…"). Keep within the ElevenLabs Starter cap (25,000/month); check `characters` in the log.
- **On-screen lines** add the number or the phrase to remember: 3–6 words each.
- **End:** a takeaway line ("Less running. More thinking."), then a caption question people can answer or tag a teammate on.

## 4. Shot list (`content/instagram/creator-cuts/<name>.json`)
- Plan shot seconds to match the narration segments: about 2.7 spoken words per second. The renderer stretches every shot evenly to fit the voice, so each line and its visual must be planned together.
- Each beat (on-screen line) sits over the shot that shows the same thing.
- Charts, boards and graphics: `"fit": true` (the full 16:9 frame over a blurred fill). Players and action: crop with `x` (0–1) so the subject is inside the 9:16 window: centre ≈ x·0.68 + 0.16 of the frame width.
- Avoid presenter-on-camera moments unless they serve the story. Check that a shot's stretched length doesn't run into the next scene.
- `musicStyle`: `"cinematic"` (84 BPM pad, pulse, bells) for analysis and emotional stories; default house only for hype and fun. The owner rejected house under analysis Reels.

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
