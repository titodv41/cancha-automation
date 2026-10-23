# Cancha storycraft — October 23, 2026

The owner likes the current carousel direction and latest real-footage film, but wants the smaller type to have character and every video to explain one real subject. This change preserves the italic Cancha display font, forest/cream palette, distinct-photo gates and publishing limits. Secondary typography uses the same licensed Manrope family already available on Cancha’s website: 650 body, 750 labels, larger type, sentence case and tighter tracking. Carousel body is 42 px; footer/page labels are at least 29 px on a 1080 px canvas. Source notes stay in evidence/caption links, not as artwork fine print.

## The actual story

Fort Lauderdale United is adding a **men’s USL League One team in spring 2027**. The women’s professional team already exists. The club’s [September 30 announcement](https://www.ftlutd.com/news/2026/09/30/fort-lauderdale-united-usl-league-one/) confirms the league, season and shared Amerant Bank Field ground. Its [October 15 announcement](https://www.ftlutd.com/news/2026/10/15/fort-lauderdale-united-fc-names-aly-hassan-usl-league-one-gm/) confirms Aly Hassan as general manager and the NSU campus venue. The [stadium page](https://www.ftlutd.com/stadium/) places it in Davie. The exact text checks and expiry are registered as `ftl-mens-expansion-20261023`.

The 24-second cut uses the actual club badge, official expansion artwork, stadium photo, Hassan portrait and women’s club film in the explicitly labelled final comparison. The women’s footage does not stand in for a men’s roster. No men’s opening fixture, tryout, roster member, promotion date or ticket benefit is invented. The existing owner media assurance applies. A campus venue pin is a location symbol, not a plotted GPS marker or route.

Scenes: announcement → staggered spring 2027 digit reveal → named home ground → GM building the roster → women playing now / men arriving in spring 2027. Short overlaps and frame-driven easing connect them. The giant year is a supported season, not a fabricated growth counter. The script omits “reported by” filler. The music is the original 126 BPM Cancha composition, with transition effects timed to this edit. The source film’s silent track is unused.

## Skills and tools actually applied

The new [project skill](../.agents/skills/cancha-storycraft/SKILL.md) adapts selected [official Remotion guidance](https://github.com/remotion-dev/skills/tree/6c67adcd9cdbe6eb84d76342da89b225f9161cb2/skills/remotion-best-practices) on scene layout, frame-driven timing, overlapping transitions, local fonts and text measurement. `references.json` records exact upstream URLs and SHA-256 hashes of the eight reviewed guides. It is an original project adapter, not a claim that a new rendering engine was installed. Remotion stays pinned to 4.0.537; newer documentation is applied only to compatible APIs. This chat’s established public-MP4 review workflow takes precedence over upstream Studio-only preview defaults.

Pocket TTS 4.0.1 and faster-whisper 1.2.1 were already installed and tested. The new manifest-driven voice tool generates each sentence into its actual scene window and refuses an overlong or stale audition. It uses the reviewed Marius CC0 preset with Kyutai’s public non-cloning CC BY 4.0 weights, CPU only, no API key, no paid calls. Model credit stays in documentation and MP4 metadata. The five sentences generated at 3.20, 2.16, 2.64, 2.64 and 4.64 seconds. Those timings do not establish a human tone.

The readback test caught likely pronunciation/transcription ambiguities: “pro team” became “protein”; “USL League One” was badly transcribed; Amerant and Davie needed review; Aly was spelled Ali. Visible copy uses the verified names. Do not turn the ASR draft into captions unchanged or call the voice accepted. A music-only primary preview and a clearly optional synthetic narration audition are delivered separately. Actual listening/owner judgement is still needed for the voice.

[ElevenLabs’ current official Free policy](https://help.elevenlabs.io/hc/en-us/articles/13313564601361-Can-I-use-the-generated-audio-for-commercial-purposes) says Free does not include a commercial license; public noncommercial use also requires attribution. Lack of revenue does not establish that brand promotion is noncommercial. No ElevenLabs generation or subscription purchase was made; `paidGenerationEnabled` stays false. OpenMontage, Qwen3-TTS and other options remain the evaluated alternatives in [the reset](community-content-reset.md); no second orchestrator or unbenchmarked heavy voice model is presented as a quality upgrade. No X browsing connector was available, so this work does not claim to have researched X posts.

## Rebuild and reuse

```sh
npm ci
npm --prefix video ci
# Use the cloud runtime proxy/CA and a supported Chromium installation.
npm run content:story-media
npm run content:free-setup  # once; Python 3.12 + CPU FFmpeg tools
npm run content:story-voice
npm run content:single-story -- --with-voice
npm run content:story-share
# Carousel review/upload:
npm run content:photos -- --upload
node scripts/share-photo-editorial.mjs
```

Set `CANCHA_BROWSER_EXECUTABLE=/usr/bin/chromium` where needed. This environment’s existing Python installations are selected with `CANCHA_FREE_VOICE_ENV_DIR=/tmp/cancha-pocket-venv` and `CANCHA_CAPTION_ENV_DIR=/tmp/cancha-caption-venv`; fresh environments default to project-private venvs. Media preparation downloads only exact, checksummed official HTTPS assets into ignored `private-data/`. It inherits the proxy and CA and does not follow unreviewed redirects. A changed source hash stops production for review.

`content/instagram/single-story.json` is the brief, media manifest, voice script, timings, caption and source identity. `video/src/SingleStory.tsx` contains the authored scenes. `video/render-single-story.mjs` checks current facts, binds media/font/code hashes, renders the full visual edit once and creates separate music/narrated versions from that same run. No unbound historical visual render is reused. `scripts/share-single-story.mjs` refuses changed inputs or files and verifies public MP4 bytes before writing preview links. This uploads review assets, not Instagram posts.

For another project, replace the topic/source registry, brand fonts/colors, owner media authorization and account config. Keep credentials, publishing state and private submissions separate. Skills guide the editorial process; they do not create an unattended researcher or guarantee engagement.

## Validation and publishing

All six carousel slides were inspected after the font change; font loading and text/footer overflow checks passed. One Tampa source JPEG changed bytes: it was viewed again and its decoded-pixel SHA-256 was identical to the previous photograph, so the newly observed original checksum was recorded rather than bypassing the source-change gate.

The final encoded MP4 audit checks H.264, 1080×1920, 30 fps, stereo AAC 48 kHz, exact 24-second edit, size below 20 MB, integrated loudness and true peak. A first AAC export exceeded the peak limit. The final master reserves additional reconstruction headroom; the audit was not weakened. New videos remain preview-only under the current hold. Future untouched carousel drafts can be refreshed through the authorized GitHub workflow; published and uncertain receipts remain protected. The current prepared carousel bank has two guides, not an always-growing content generator.

## Final review assets

- [Updated six-slide carousel gallery](https://framerusercontent.com/images/ZqQNlzpDMpe0TrDMFXSXj1yOCG8.jpg) · [Full-size PDF](https://framerusercontent.com/assets/WCq4anJUdmTPD21HLbAwoOdNk.pdf).
- [Single-story video — music](https://framerusercontent.com/assets/1pyol09cxYiN5OXgZF1lpuakp6s.mp4).
- [Same edit with free preset narration audition](https://framerusercontent.com/assets/4ngRUchMwbXBH27Km1CFfYcBL8.mp4).

Both public MP4s exactly match their audited bytes. The music version is 6.45 MB, −15.84 LUFS / −1.99 dB true peak; the optional synthetic narration version is 6.44 MB, −16.74 LUFS / −2.54 dB. Both are 24 seconds, 1080×1920, 30 fps, stereo AAC 48 kHz. Native playback at a 390×844 phone viewport passed for both, with 20 successful scene/transition seeks and no media errors. All six public carousel slides loaded at that viewport without horizontal overflow. Stable frames and mid-transition frames were inspected; a tight portrait crop, hard photo edge and overlapping incoming headlines were corrected before these final uploads.

All 176 repository tests passed. No paid provider call, new dependency subscription, Framer page/CMS/form change or video publication was made. The two untouched photo drafts are being refreshed through the supported GitHub action; its result will be appended after the remote run.
