# Real urgency, clips and a reusable audio workflow

Cancha can build anticipation with real scale, actual local moments and an invitation to help build the directory. It has no evidenced active-member count or club partnerships. Directory profiles must never be presented as registered members or partners. The homepage now displays the actual public CMS profile total, links to a dated Rowdies match, and invites clubs to list while Cancha builds Florida coverage. The event teaser hides after kickoff or its 72-hour review window. No fake visitors, member avatars, ticket scarcity or restarting countdown was added.

`config/growth-content-policy.json` records this direction for future website copy and social posts. An organizer's event date and a registration deadline are different facts. Use “registration closes” or “last places” only with explicit current organizer evidence.

## Motion example

`motion-weston-u15-20261022` uses an actual 18-second excerpt from Weston FC's club-published U15 clip. The official site's public Instagram feed pairs that exact post with a reported 2–0 victory. We preserve that context rather than invent a scorer, opponent or goal minute. It includes animated Cancha graphics, a result panel, a community question, an original synthesized beat, transition effects and a generic off-screen narrator. The source clip audio is not used. The output is 22 seconds, 1080×1920 H.264 with AAC audio. The original owner assurance covers club media; source URL, exact public post, original/edited checksums and trim range are recorded privately/in the queue payload.

No login, player restriction or paywall was bypassed. Other clips must come from a usable official public file or an owner-supplied asset. An embedded public club clip can be resolved from its source page; unrelated stock video or a different player's highlight cannot illustrate a specific claim. When usable footage is missing, use relevant original animation or a photo carousel rather than inventing match footage.

## Free local narration and sound

We installed Kokoro ONNX in `/tmp/cancha-voice-venv` and downloaded pinned release models under `/tmp/cancha-voice-models`. These are rebuildable local dependencies, not an always-on paid service. Kokoro model weights are Apache 2.0; the ONNX wrapper is MIT. The full-precision 82M model uses an 80/20 blend of generic `af_heart` and `af_bella` voices for off-screen narration, not an imitation of a featured person. Music and transition effects are synthesized by original project code, mixed under the voice and mastered to −14 LUFS with a −1.3 dB true-peak target. The new original 126 BPM stereo house bed has brighter percussion, a melodic pluck and smoothly ducked levels under conversational phrases. No copyrighted music recording is copied from the source clip.

The [ElevenLabs pricing page](https://elevenlabs.io/pricing), checked October 22, 2026, lists a commercial license on its paid Starter tier. We did not connect ElevenLabs, purchase a subscription or request an API key. The local example requires neither. Future hosted voice use needs the chosen account's commercial terms and a securely configured key.

Setup and repeat:

```sh
npm ci
npm --prefix video ci --ignore-scripts
npm run content:voice-setup
CANCHA_BROWSER_EXECUTABLE=/usr/bin/chromium npm run content:motion
node scripts/prepare-motion-queue.mjs
# After review, tests and the repository push:
gh workflow run github-instagram.yml --ref main -f action=refresh-motion-stories
```

Setup requires Python 3.12+, pip, the GitHub CLI and ffmpeg; rendering requires Chromium. No shell installer is downloaded or executed. Python packages are isolated, and the model release files are pinned by SHA-256 in `video/audio/model-lock.json`. Environment overrides: `CANCHA_VOICE_PYTHON`, `CANCHA_VOICE_MODELS`, `CANCHA_BROWSER_EXECUTABLE`.

The current motion template deliberately uses 18 seconds of footage inside a 22-second story. Configure topic, brand, city, factual result, title, narration and exact source in `motion-stories.json`. Add its exact source descriptor to `local-editorial-sources.json`. The design hash binds the story, brand, renderer and audio generator to the render; changes require a new render. Private downloads/model/audio intermediates stay out of Git. Only public asset URLs and evidence enter the queue. Copy this workflow to another project with that project's own sources, account identity, credentials and authorization.

## Daily mix and publishing

The standing plan stays at 12:30 PM and 6 PM New York, at most two feed posts/day and four actual hours apart. `minimumDailyCarousels: 1` reserves a carousel before a Reel. A Reel also waits for an actual same-day Published carousel receipt; an approval alone is insufficient. If a carousel or source fails, the Reel does not bypass that requirement. A second fresh carousel remains an option.

Reels create one processing container with an immutable public MP4 and JPEG cover. No new paid backend is used. The existing no-retry rule for uncertain publication is preserved. Synthetic narration is recorded in evidence and uses Meta's AI disclosure parameter; source notes are not printed as fine print on the creative.

Daily checks schedule prepared, source-checked work. They do not run an unattended AI researcher or produce unlimited clips. Replenish with fresh briefs and sources; skip a slot if suitable work is unavailable.

## What we are testing

Meta's [official Best Practices guidance](https://about.fb.com/news/2024/10/best-practices-education-hub-creators-instagram/) separates creation, engagement, reach, monetization and guidelines, and recommends account-specific guidance rather than a guaranteed growth formula. For Cancha, test:

- Recognizable local club/player moments instead of generic promotion.
- A quick opening, actual action and readable text for viewers watching without sound.
- One useful community question: the club, the city, or advice for a first visit.
- A relevant destination on Cancha, with real program details and existing submission forms.
- Comparable saves/shares, watch time, website visits and club submissions, not invented popularity.

Instagram performance collection still needs `instagram_manage_insights`; no measured reach improvement is claimed. This is a creative hypothesis to test. The scheduler and content quality checks work independently of that missing read permission.

Official narration sources: [Kokoro model](https://huggingface.co/hexgrad/Kokoro-82M), [Kokoro ONNX](https://github.com/thewh1teagle/kokoro-onnx). Meta media reference: https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media/.

## Creative revision and tools reviewed (October 22)

The owner requested a livelier track, less mechanical delivery, no “reported by” narration and smoother, quicker transitions. The revised cut uses full-precision Kokoro weights instead of int8, a different blended voice, complete conversational phrases, varied phrase pacing, gentle vocal compression and continuous music ducking. Headline copy says “MLS NEXT · U15” and “2–0”; the exact club post remains recorded in evidence. The clip starts at 0.9 seconds, and text crossfades use eased 8–10-frame movement rather than abrupt replacement. All these are creative choices for review, not a claim that synthetic speech is indistinguishable from a person.

Reviewed original repositories:

- [Kokoro ONNX](https://github.com/thewh1teagle/kokoro-onnx): selected and installed locally; lightweight CPU inference, voice blending and full-precision model. No voice cloning.
- [Chatterbox](https://github.com/resemble-ai/chatterbox): expressive alternatives include Turbo and CPU-oriented Nano; brings a separate PyTorch/Transformers/decoder stack. Not installed in this revision; remains a next candidate if this voice does not meet the creative bar.
- [OpenMontage](https://github.com/calesthio/OpenMontage): broader orchestration around Remotion/FFmpeg, providers, narration and media research. Its default free narrator is Piper; installing it alone does not deliver a premium voice. Keep the existing working pipeline and use selected production principles without adding a second orchestrator or paid providers.
- [Remotion official skills](https://github.com/remotion-dev/skills/tree/main/skills/remotion-best-practices): consulted creation, markup, timing, transitions, audio and voiceover guidance. Existing pinned Remotion 4.0.537 remains in place. Frame-driven easing, measured narration timing, actual-media inspection and source-editable compositions are applied. The owner has already authorized rendered public previews and local free narration, so the generic skill defaults do not override those preferences.

USL league sites returned HTTP 403 during research. Do not publish a “new” promotion/relegation update until a current accessible official announcement can be checked. A past approval/plan is not evidence that the system has launched.

## Animated news explainers

`content/instagram/explainer-stories.json` configures a separate 24-second explainer composition. The first explains Miami FC’s Homestead proposal with the club-published architectural rendering and official crest, an animated stadium outline/capacity count, facility icons and development blocks. It states the 15,000-seat/80-acre/$300 million **development plan** and identifies Homestead as a future home. The caption dates the announcement to September 2025; it is not framed as a new opening. The current club homepage still identifies a future stadium in Homestead. No opening date, construction milestone or confirmed promotion/relegation launch is invented.

```sh
npm run content:explainer
node scripts/prepare-explainer-queue.mjs
node scripts/audit-motion-output.mjs
```

The ready-file upserts preserve other reviewed films. Both live-footage films and animated explainers use the same immutable MP4 checks, source recheck, synthetic-audio flag, daily carousel requirement and durable publisher. Each new film receives an unpublished Meta processing check before import. The scheduler later creates a fresh processing container within its authorized publishing window.

`skills/soccer-motion/SKILL.md` is the reusable project skill. It combines the owner’s editorial direction with the official Remotion guidance, source/claim distinctions, concise spoken copy and a repeatable visual/audio audit. It introduces no paid provider.

## Delivery audit

`video/audit-output.mjs` checks the actual output, not only the render options: 1080×1920, 30 fps, 8-bit 4:2:0 H.264, stereo AAC at 48 kHz, expected duration, public-asset size limit and actual loudness/true peak. Full-range `yuvj420p` is accepted alongside `yuv420p`; the former is a full-range 4:2:0 signal, not a different-resolution or higher-bit-depth format. Rendering and Meta processing accepted that output. The CLI also rejects stale story/brand/renderer/model hashes or a queued MP4 that differs from the audited render. Phone playback is inspected separately. Numbers are delivery checks, not a substitute for listening to the tone or judging the edit.

## Free voice comparison actually run

After the creative revision, we installed Chatterbox at repository commit `5de7a54aa4e5e2baadb0182dde554908b48b85c2` in a separate `/tmp/cancha-chatterbox-venv`, with CPU-only PyTorch 2.6.0 and torchaudio 2.6.0. We tested the upstream Nano weights at Hugging Face revision `71ccd1d0081b430592cea481f4307e764e07bc64` using the built-in generic voice; no person recording or clone reference was supplied, and its watermark stayed enabled. This was a free local trial, not a connected paid provider.

The trial produced 31.8 seconds for a short sample, including roughly 25.8 seconds of trailing silence. A local Whisper tiny.en readback appeared to omit the closing question. That output fails the short-film production check and was not imported into the queue. This is the result of this particular pinned Nano/default-voice trial, not a claim that every Chatterbox model or reference configuration has the same behavior.

We retained the full-precision Kokoro Heart/Bella blend for both finished films. A local readback of the mixed Miami explainer recovered its planned-stadium facts and question. The Weston readback did not recognize the spoken brand ending reliably, so the final CTA was simplified to “Find your next club. Link in bio.” and the score was spoken as “two to zero.” Readback is a pronunciation/omission check, not a human listening test or a naturalness score. The public previews let the owner judge the tone directly.

The experimental Chatterbox/Whisper environments and model downloads remain private, rebuildable workspace files. They are not added to the standard production dependencies, scheduled jobs, or a paid host. The documented production path still installs the smaller pinned Kokoro model.

The repository-local Codex entry is `.agents/skills/cancha-motion/SKILL.md` (invoke `cancha-motion` in a session that loads repository skills). Its canonical workflow is `skills/soccer-motion/SKILL.md`; other coding assistants can read that file directly. Setup was tested with Python 3.12, as required by the pinned NumPy dependency.
