# Community content reset — October 22, 2026, New York

> Current revision: see [the creative agency workflow](creative-agency-workflow.md). The owner rejected the local narrators and requested capped ElevenLabs Free auditions. The five-guide photo bank and current queue status are recorded there; older counts and voice recommendations below are historical.

**October 23 update:** The accepted carousel structure now uses heavier Manrope secondary type. A focused 24-second FTL men’s expansion explainer, optional free narration audition, reusable project skill and verified queue result are documented in [storycraft](storycraft-workflow.md). Those current instructions supersede the older body-font and preview defaults below.

The live queue confirmed that `local-rowdies-shield-20261022` was published with three crops of one photograph (receipt `17951303991338060`). That was a creative failure. Every post in the former six-carousel bank repeated source photos. Its remaining drafts are retired; published receipts are preserved. The old manifest is archived in `content/instagram/archive/photo-editorial-rejected-20261022.json` as evidence, not a reusable bank.

## Actual changes

`server/carousel-quality.mjs` compares original source photographs rather than rendered JPEGs. Repeated photo IDs, source checksums, canonical URLs, query-size variants and Wix resize variants fail. The renderer, standing planner and final publishing gate enforce this rule, including for old approvals. The first protection was pushed as `0d05db2`. This mechanical gate cannot judge whether the story is valuable.

The replacement bank has two guides and six distinct real photographs:

- **Florida women's pro matchdays, four slides:** three clubs, actual home grounds, Davie location, Tampa cashless parking and JAX's October 31 home date. Sources: current club pages, venue policies and the official JAX report.
- **FKK first-season fit, two slides:** age bands, developmental format, possible recreational away-game travel and the Spring waitlist. The closed Fall status stays explicit.

Every slide supplies a different useful answer. Captions use normal sentences and specific details; no invented firsthand visit, interview, affiliation or player quotation. Every image was viewed. One apparent FTL photo was actually a sponsor logo and was discarded. All six hosted 1080×1350 slides loaded at a 390px phone viewport with no horizontal overflow.

[All six slides](https://framerusercontent.com/images/B40nfKd8ihrvOm42R5g2L1kpo.jpg) · [Full-size PDF](https://framerusercontent.com/assets/o6lVaR0Brm5PWjJ4fvgSq8rW7Ig.pdf)

## Editorial standard

Start with one actual audience question, a useful answer, evidence, the necessary media and a clear next step. A parent needs age, commitment, location and the current registration route. An adult player needs level, format and a real way to join. A fan needs the ground, next verified fixture and practical information. A person feature needs a real individual and a specific story supported by published reporting or an actual recording.

Use 2–6 slides when the material warrants it. Each swipe must add useful information and a different photograph; do not pad a two-slide answer with a recycled-photo question slide. Avoid generic hype, repeated sentence fragments, “don't sleep on…”, “the future is here”, invented urgency and questions without local relevance. Prefer questions whose answers help another person, such as parking or where to watch from. Preserve the Cancha font, genuine subject media and readable spacing. New imagery alone does not make weak copy useful.

## Free tools researched and tested

| Tool | Finding and decision |
| --- | --- |
| [ElevenLabs](https://help.elevenlabs.io/hc/en-us/articles/13313564601361-Can-I-use-the-generated-audio-for-commercial-purposes) | Free credits exist; its official Free policy excludes commercial use. Paid generation is now explicitly disabled. No account/key purchase is needed for the current route. |
| [Pocket TTS](https://github.com/kyutai-labs/pocket-tts) | MIT code; official public non-cloning weights CC BY 4.0; selected Marius and Caro Davy preset sources CC0. Installed 4.0.1 with CPU PyTorch 2.6.0. Two samples generated with no API fee, token or GPU rental. |
| [Qwen3-TTS](https://github.com/QwenLM/Qwen3-TTS) | Apache-2.0 repository with larger 0.6B/1.7B options. Researched, not benchmarked here; no voice-quality or speed claim. |
| [Whisper](https://github.com/openai/whisper) / [faster-whisper](https://github.com/SYSTRAN/faster-whisper) | MIT, local transcription/word timings. Installed faster-whisper 1.2.1, tiny.en CPU/int8; caption drafts actually produced for both samples. |
| [Remotion](https://github.com/remotion-dev/remotion) and FFmpeg | Existing brand animation/editing/mastering stack retained. Remotion has its own license, including free use for eligible individuals/small teams. |
| [OpenMontage](https://github.com/calesthio/OpenMontage) | AGPL orchestration with optional paid providers and a local Piper path. Reviewed; no second orchestrator installed. A brief, real media and an acceptable voice are still needed. |
| [Auto-Editor](https://github.com/WyattBlue/auto-editor) | Repository public-domain; hosted/app assets have separate terms. Reviewed for pause removal; not installed for these guides. |

Pocket source inspected at `44cb63eaa4144f32ff80863968515165a5554353`. Its upstream loader uses the intended [public non-cloning weights](https://huggingface.co/kyutai/pocket-tts-without-voice-cloning), revision `a7056f505a4a8ca72d8b5fb1440071d6f1a35739`, when its optional gated cloning model is unavailable. This run used preset embeddings, no custom recording and no access token. [Voice licenses](https://huggingface.co/kyutai/tts-voices): the selected donation and Voice-Zero recordings are CC0; Expresso noncommercial voices are excluded. Model credit is retained in documentation/sample metadata rather than an overlay on artwork.

[Marius, 15 seconds](https://framerusercontent.com/assets/A2cCWvl3LyLI302KFEQ7N0Pd0M.mp3) · [Caro Davy, 19 seconds](https://framerusercontent.com/assets/kiFrBBRMnxUFJ4qQxbcVF8lYrNw.mp3)

After loading, generation took about 5.3 and 6.1 seconds. Both public files match their original hashes and play in the phone browser. That proves a free CPU path, not human tone or creative acceptance. Neither voice is queued. Never restore the rejected Kokoro narrator as a silent fallback. ASR recovered the core script but spelled Davie as “Davy”, split Nova Southeastern inconsistently and heard “home day” in one sample. Correct caption drafts before use; transcription is not a naturalness test.

## Reusable setup

Use Python 3.12 and FFmpeg. Two separate Python environments and all downloaded media/models remain in ignored `private-data/`. Package versions are pinned in `video/audio/free-voice-requirements.txt` and `caption-requirements.txt`.

```sh
npm run content:free-setup
npm run content:free-voice
npm run content:captions -- path/to/actual-creator-clip.mp4
# Current real-footage study, preview only:
npm run content:video
```

This workspace tested `/tmp/cancha-pocket-venv` and `/tmp/cancha-caption-venv` via `CANCHA_FREE_VOICE_ENV_DIR` / `CANCHA_CAPTION_ENV_DIR`. Defaults create project-private environments. Setup, generation, public playback and transcription were exercised. Xet initially hit a read-only cache; supported HTTP fallback uses the inherited proxy/CA and a project-private cache. The caption tool uses FFmpeg decoding because PyAV 19 removed a parameter expected by faster-whisper's path decoder; that failure was reproduced and fixed. No TLS bypass. Existing Codex/Actions compute allowances still apply, although no TTS API fee or extra hosting service is added.

## Real UGC workflow

Use actual players, coaches, parents and fans for first-person stories. A 20–30-second vertical contribution can contain: the person answering one useful question, a view of the actual place, a few seconds of play/training/atmosphere and the current public joining/fixture link. Preserve actual speech where it works. Edit pauses, choose a strong opening, correct word captions, add Cancha type and supporting motion, mix sound and link to the useful destination. Do not synthesize a coach quotation or pretend an official-media re-edit was filmed by Cancha.

`content/instagram/creator-briefs.json` contains capture prompts, not real submissions, approved quotes or scheduled posts. The existing private submission/email route can receive links; no new paid service is necessary. No outreach messages were sent. The FTL preview uses its actual homepage film under the owner's existing media assurance. Its source AAC track proved silent (−91 dB sample peak) and failed the output audit. The re-edit uses an original 126 BPM Cancha music bed with no synthetic narrator or invented crowd sound. It remains club-sourced editorial with no new interview, result or match-date claim.

## Mix, publishing and learning

Prepare a weekly mix of useful discovery guides, real local people, current matchdays, club/league developments with a local consequence and training/career resources. Keep promotional CTAs selective. Two daily slots are a cap and opportunity, not a reason to fill weak slots. The current replacement bank contains **two** new guides. Scheduled jobs check and publish eligible prepared work; they do not form an always-running research team or generate UGC. Replenish the bank; skip a slot when quality is unavailable.

Meta's [official Best Practices overview](https://about.fb.com/news/2024/10/best-practices-education-hub-creators-instagram/) emphasizes creation, engagement, reach and account-specific metrics. Compare independent posts at similar ages using shares/saves per reach, useful comments, retention where available, website visits and real submissions. A new look does not establish improved performance.

The real [insights run 39881029267](https://github.com/titodv41/cancha-automation/actions/runs/39881029267) returned `permission_required: instagram_manage_insights`. No reach improvement or autonomous performance learning is claimed. [Existing permission setup](instagram-insights-connection.md) documents this account blocker. New interviews, outreach and continuous creative generation are not implemented by the publisher.

## New film preview

[FTL real-footage cut — 17.5 seconds](https://framerusercontent.com/assets/Waq6CJ0N8Kx7Fkgz6W1s4Pyn4.mp4). Actual club-published motion and portraits fill the frame; concise Cancha headings identify the club and current home ground. The soundtrack is original Cancha music, not the silent source track. No AI narrator, fabricated quote or current match-result claim. This is a club-media re-edit, not a Cancha-filmed interview or user submission. The video remains outside the publishing bank and the motion hold remains enabled.

The public MP4 exactly matches the audited render: 1080×1920, 30 fps, H.264, stereo AAC 48 kHz, 17.5 seconds, 10.59 MB, −15.45 LUFS / −0.86 dB true peak. These are delivery checks, not a claim of audience response or subjective music quality. All 176 tests passed, including repeated-photo backstops and the preserved historical approval-hash fixture. The fixture was moved out of the changing live content bank; its literal historical hash was not changed.

The public video played at a 390×844 phone viewport and sought successfully to 1, 6, 9, 14 and 16.7 seconds with no media error. The actual opening, player, crowd and closing frames were inspected after fixing an opening-title wrap that initially overlapped the handle. The final first title is the shorter “FTL / UNITED.” The two free MP3s and six carousel slides also passed public phone delivery checks.

## Connected queue verification

GitHub [refresh 39884992510](https://github.com/titodv41/cancha-automation/actions/runs/39884992510), running commit `35de9bb`, succeeded. Both new guides were imported as Drafts, with four and two slides respectively. At the snapshot, neither was scheduled or published; the next standing-plan check rechecks sources and can schedule them without another owner approval. The plan remains enabled for 12:30 PM and 6 PM New York from October 23. There are seven preserved Published receipts, zero uncertain publications and zero retired drafts left Approved/Preparing. The new video and voice samples are preview-only and were not imported. No Framer page/CMS/form changes or paid provider calls were made during this reset.
