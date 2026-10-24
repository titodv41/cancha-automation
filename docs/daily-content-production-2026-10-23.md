# Cancha daily production — October 23 evening

The [October 23 night revision](short-story-and-phone-readability-2026-10-23.md) supersedes the supporting type and FTL script/video below. Automation limits and publication protections remain.

## Owner direction and visual changes

The owner selected **Chris**, requested moving club footage behind the story graphics, stronger type from Cancha’s own font family, and automatic production for two daily feed posts. The FTL narrative recipe is eligible for the standing plan. Rejected Pocket/Kokoro work remains held; this does not unlock every old Reel.

Social titles use the existing Barlow Condensed bold italic face. Supporting text now uses upright Barlow Condensed 600, with larger labels and captions. This replaces the earlier Barlow/Manrope social supporting text. The website’s reading typography is preserved. Corporate suffixes such as “Inc.” are omitted from consumer-facing social headlines; the original CMS name and public URL remain unchanged. A brand/font/layout fingerprint makes the replenisher rebuild stale Draft designs instead of leaving them in an old style. Real club footage continues behind the overlays; the women’s team and future men’s debut remain clearly distinguished. Dates and figures come from the registered source, not decorative invented counters.

[Updated full-size design PDF](https://framerusercontent.com/assets/RAPurA9RCpkYR5kTIY1nfhJjGXc.pdf) · [All designs](https://framerusercontent.com/images/cJBbHclSY7c0imC7SuPjKvuhGvY.jpg)

## What runs without the chat

- Website discovery/maintenance retains its existing morning and noon fallback jobs. It reads supported official sources, deduplicates, preserves private backups and publishes eligible changes. Source failures remain recorded; no arbitrary quota of new listings is fabricated.
- The independent **replenish** action runs at **9:20 AM and 1:20 PM New York**. It reads the current public CMS projection, checks official club identity/city/program claims, obtains the club’s header badge, captures the actual published Cancha profile and produces up to two new two-slide guides per run. The target is a six-post buffer. It rotates regions, suppresses recently featured clubs, excludes stale/unavailable source drafts from buffer counts and rejects unsupported claims.
- Club guides are correctly identified as an **official badge plus actual profile capture**, rather than two distinct photographs. The existing photo carousels still require a different original photograph per slide. Sponsor logos cannot masquerade as the club’s own badge. A test caught an Auburndale sponsor mark; the stricter home-header check selected the actual Scream crest. The existing website badge was already correct and no CMS image correction was needed.
- The same replenish action renders registered narrative recipes with checksum-bound **accepted Chris audio**, official source media, the current brand manifest and measured captions. It uploads the audited movie/cover and delivers a Draft through encrypted state. It reuses matching prepared work and protects Approved/Published/uncertain rows. This job receives no ElevenLabs key, makes no new TTS request and enables no paid plan. New narrated topics still require their verified story/visual map, source media and matching accepted narration; the system does not invent new news or fabricate speech.
- The standing plan selects eligible work for **12:30 PM and 6 PM New York**, up to two per day / 14 per week. A daily carousel precedes a Reel or platform post; only the registered Chris narrative can pass the legacy video hold. Platform promotion stays capped at two posts per week. Actual published posts stay at least four hours apart.
- GitHub cron can run late. A missed slot can be recovered within **90 minutes**, with a new future approval, the same day/weekly limits and source checks. A failed source before publication releases the unused slot and old unpublished container. It backs off for a day so a fresh checked post can replace it. Failed or uncertain publication is never automatically retried.

The replenish action records the number of usable community drafts and ready carousels. With fewer than two usable items or no carousel, it reports a workflow failure and retains the queue/source artifact rather than silently treating an empty bank as healthy.

Two daily slots are the production target. If sources, media, account access or processing are unavailable, skip and report the shortage rather than recycle old posts or invent content. Instagram insights access is a separate remaining requirement; no engagement improvement is claimed without measurements.

## Reuse and controls

- `config/daily-content.json`: bounded generation, buffer, accepted recipe IDs and the explicit no-new-TTS/no-paid-services settings.
- `config/instagram-editorial-policy.json`: accepted formats/voice recipe, source/photo rules and daily/weekly promotional controls.
- `scripts/prepare-directory-editorial.mjs` and `scripts/directory-guide-layout.mjs`: source-checked club guide preparation, rendering, public media upload and private Draft delivery.
- `server/club-logo.mjs`: home-header badge selection shared by content production and future website club imports. Footer sponsors, supplier/vendor marks and external sponsor destinations are excluded.
- `content/instagram/narrative-recipes.json`: accepted audio/timing URLs and exact hashes, source/story/media/social manifests and revision. It contains no API credentials. The audio was already used in the owner-requested public previews.
- `content/instagram/story-narration.json`: full spoken script, visual copy and actual word-based scene anchors. The renderer keeps short on-screen copy separate from the connected narration.
- `content/instagram/narrative-social.json`: the specific story’s caption, headline, organization, alt text and footage publisher. IDs and the official source link are validated, so a new topic cannot silently receive another club’s caption.
- `scripts/pack-narrative-recipe.mjs`: accepts explicit story/media/social paths, `--audio`, `--timing` and `--revision`; validates identity and uploads checksum-bound cached narration. It upserts one recipe while preserving the others and does not enable a new recipe for publishing.
- `scripts/prepare-narrative-editorial.mjs`: source checks, cached-media hydration, locked Remotion render, delivery audit, hosted-byte checks and encrypted queue delivery. No provider API call occurs here.
- `scripts/github-instagram.mjs`: independently runs production, reloads durable state before scheduling, and retains publication receipts.

To add a new club-expansion story, register its official facts/expiry, create its own matching script, visual map and social brief, record exact subject media, supply accepted matching narration and add the explicit recipe ID. Cached narration cannot be silently reused with a different script. Another project needs its own brand/account, source registry, credentials, voice budget and queue state; Cancha’s publication authorization does not transfer.

Useful commands:

```sh
CANCHA_BROWSER_EXECUTABLE=/usr/bin/chromium npm run content:directory
# Inspect the actual badge, complete slides, source report and phone layout first.
CANCHA_BROWSER_EXECUTABLE=/usr/bin/chromium npm run content:directory -- --upload
npm run content:production-video
# Routine production/scheduling without keeping this workspace online:
gh workflow run github-instagram.yml --ref main -f action=replenish
```

Local rendering/upload prepares assets; only the configured hosted mode delivers Drafts. The scheduled publisher creates Meta media and publication receipts. Do not call a rendered asset or an imported Draft already published.

## Verification

213 tests pass after the production and refresh changes, covering source/badge identity, sponsor rejection, source-backed claims, real capture roles, receipt/approval integrity, accepted Chris versus rejected voices, daily carousel order, delayed-slot recovery, source-failure slot release and daily/weekly limits. Local renders of all 12 photo slides and both platform posts passed source/font/bounds checks. Local narrative production completed with cached Chris audio and no new TTS request. All 14 hosted design images also decoded correctly at a 390-pixel phone width. The production movie played and allowed seeking to its final scene at the same phone width. Codec, loudness and transcription checks do not substitute for a subjective voice review; the owner selected the existing Chris sample.


## Verified GitHub receipts

- [Replenishment 40036087257](https://github.com/titodv41/cancha-automation/actions/runs/40036087257), revision `2cfbdd3`, completed successfully in a clean GitHub runner. It created and privately delivered two new directory carousels (Azzurri Storm Soccer in Naples and AC Delray in Delray Beach), rendered and delivered the accepted Chris Reel, and preserved all eight existing Published receipts. No uncertain publication was present. The 117 FC and Benfica sites returned 403 from that runner and were skipped independently.
- [Production Chris video](https://framerusercontent.com/assets/W43yaXdB4ZkrE59eKMBMPkcVgCg.mp4): 1080×1920, 25.77 seconds, H.264/AAC, actual Chrome phone playback and tail seeking passed. It is a delivered Draft for the standing plan, not a newly published Reel. The job made zero new TTS requests.
- [Typography refresh 40036754473](https://github.com/titodv41/cancha-automation/actions/runs/40036754473) updated the four still-Draft photo guides and protected the already-Published women’s guide. The live queue remained enabled with eight Published receipts and zero uncertain publications.
- [Publication check 40033347285](https://github.com/titodv41/cancha-automation/actions/runs/40033347285) confirmed that the previously approved women’s matchday guide published. No old published artwork was overwritten.

- [Final production and readiness check 40038387072](https://github.com/titodv41/cancha-automation/actions/runs/40038387072), revision `b924303`, succeeded. It refreshed the same two directory Drafts with current typography and clean display names, rendered the smoother overlay exits, retained the measured delivery audit and privately delivered the assets. No duplicate post IDs were created. The buffer contained **seven usable community items, including six carousels**; shortage was false. All **eight Published receipts** remained and no uncertain publication existed. Source/media preparation reported no blocked items in this refresh. The final Chris movie above is that run’s output (1080×1920, 25.77 seconds, −14.77 LUFS, −3.38 dB true peak); zero new TTS requests.

Known website source blockers remain explicit: several Teamwork employer boards and UPSL/Miami directory endpoints return HTTP 403 from GitHub. Supported sources continue independently; no bypass, guessed listings or quantity guarantee was added.

- [Reuse confirmation 40039448784](https://github.com/titodv41/cancha-automation/actions/runs/40039448784), revision `9ef15c9`, succeeded in a fresh runner. It loaded the story-specific social brief, reused the exact accepted production movie, delivered the same Draft ID and retained seven usable community items / six carousels. No new render or TTS request occurred; both automation flags remained enabled, eight Published receipts remained and zero uncertain publications existed. Final hosted movie phone playback and tail seeking were rechecked after delivery.
