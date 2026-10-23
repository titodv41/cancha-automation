# Premium voice and the Cancha Club Cut

**Later owner decision:** Free tools are preferred. Paid narration is now explicitly disabled in the policy and generation adapter. No ElevenLabs purchase/key setup is needed for the current task. Follow [the free tools and community content reset](community-content-reset.md). The optional setup below is dormant.

The owner rejected the old Weston and Miami videos for robotic narration and generic visuals. Both remain unpublished Drafts and are now retired. `config/instagram-editorial-policy.json` disables motion selection, and the publish gate also rejects retired/held Reels. The approved photo-carousel work and standing two-slot plan are preserved. A successful Meta processing check is not creative approval.

The new `ClubCut` is a separate 20-second **preview**, using the actual Weston match footage, a large official crest, club blue alongside Cancha's forest/lime, the existing Barlow Condensed Bold Italic display font, the actual Cancha wordmark, larger action, brief result graphics and short wipes. It has no “reported by” voice line, fake speaker or on-design production fine print. It is not imported into the queue. Without a premium voice it contains original music only; don't call that a narrated preview.

## Small-cost voice choice

Checked October 22 against [ElevenLabs pricing](https://elevenlabs.io/pricing): Starter lists **$6/month before tax**, 30,000 credits and commercial use. The displayed introductory offer is not the recurring price. Standard short narration should fit comfortably when takes are limited, but actual credit consumption depends on the model and account. No plan was purchased and no key was available during preparation.

Use `eleven_v3` with the official [TTS-with-timestamps endpoint](https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps). It gives character alignment for real speech-following captions. v4 is newer but currently uses the Dialogue API; it must not be passed to this TTS route. This is an audition choice, not a claim that a service automatically sounds human. Compare Chris and Jessica on the same complete conversational script, then choose by listening. Stock voice availability is verified against the connected account before a paid call. Do not clone anyone, use celebrity imitation or run endless retakes.

## Owner setup, in one pass

1. Sign in at [ElevenLabs](https://elevenlabs.io/), and select Starter only if its displayed recurring price is acceptable. Keep usage-based billing disabled (maximum extra credits = 0). Existing suitable accounts can be reused.
2. In Developers → API Keys, create a key named `Cancha`. Enable Text to Speech, read Voices, read Models and read User/subscription. Set a **5,000-credit monthly quota on this key** for initial testing. Leave unnecessary endpoints disabled. The [official authentication guide](https://elevenlabs.io/docs/api-reference/authentication) documents endpoint scopes and key credit quotas. GitHub-hosted runner IPs change, so do not pin this key to the Codex machine's IP.
3. Open [this repository's new Actions secret](https://github.com/titodv41/cancha-automation/settings/secrets/actions/new). Name: `ELEVENLABS_API_KEY`. Paste the key into **Secret** and save. This is a repository Actions secret, not a repository variable or chat message. The existing Framer key is separate.
4. Tell Codex the key is saved. Run `Cancha voice auditions` with **check** first. It reads model/stock-voice availability and billing limits without generating paid audio. Then run **audition** once to make the two short samples. Select the voice by listening before finishing or scheduling a Reel.

The key is supplied only to the voice step and sent in `xi-api-key` to `https://api.elevenlabs.io`. Redirects are rejected. No credential value, provider error body, raw user response or token is included in logs/artifacts. An account check may fail until the key permits all three read endpoints. No extra Render service is required.

The official ElevenLabs CLI was inspected on GitHub. Its browser setup relies on local clipboard handoff and falls back to manual setup in a remote environment; it cannot read the owner's browser clipboard from this cloud workspace. A repository secret is the appropriate connection here. Installing OpenMontage would not solve the voice/account blocker, so the existing pinned Remotion/FFmpeg stack is retained.

## Cost controls and limits

`config/premium-voice.json` limits a request to 650 characters, an audition batch to two configured stock voices / 1,300 characters and the project ledger to 20,000 reserved characters per UTC month. No cron invokes this paid service. Neither check nor audition publishes. Generation refuses Free accounts, unknown model/voices, insufficient included credits and unconfirmed/active usage-based billing.

A local ledger reserves the request **before** sending it. Completed audio is cached by voice/script/model/settings; pending or uncertain requests cannot automatically retry. Failed calls stay reserved until someone checks provider history. GitHub caches and uploads this ledger even when the action fails. **Cache retention/eviction or interrupted runners can remove that extra protection**; the provider key's credit quota and disabled overage billing are the hard financial limits. Character counts are not an exact currency ledger and cannot price other ElevenLabs services. Increasing quotas or adding automatic paid production requires a specific budget decision.

Private audition artifacts contain only the configured script, voice names, audio, timings, safe account-check fields and the generation ledger. Retention is seven days. The repo must remain private if those drafts need to remain private. Do not upload raw API responses. A codec/loudness check cannot establish whether a voice sounds natural.

## Render and reuse

```sh
npm run content:voice-check
npm run content:voice-audition
# Music-only visual draft while the account is not connected:
npm run content:club-cut
# After listening to the chosen audition:
node video/render-club-cut.mjs --voice private-data/premium-voice/ledger/SELECTED.mp3 --timing private-data/premium-voice/ledger/SELECTED.json
```

The workflow's Actions artifact can be downloaded into the same ignored private-data tree. The render verifies exact source footage checksum, the official match claim, crest identity, script, actual narration duration and alignment identity. Overlong speech is a failed edit, not silently sped up or cut off. Word groups contain at most four words and use provider timings. A voice cut must be checked again for pronunciation, readable captions, safe areas, smooth transitions, actual phone playback and sound balance. Render reports bind story, media, template and audio hashes. Keep source links/checksums in evidence rather than printing production notes on the creative.

For another project, reuse the adapter/timing helpers/manual workflow, replace brand and story manifests, set a separate restricted key/quota and ledger namespace, then review a new example. Do not reuse Cancha's voice budget, media approvals or publication permissions automatically.

## Verified status and blockers

- GitHub run [39871255909](https://github.com/titodv41/cancha-automation/actions/runs/39871255909) confirmed both rejected video rows are Draft with no scheduled time or published ID. The video policy hold is committed as `8f393c0`.
- The carousel plan remains enabled. That snapshot showed six historical Published receipts and the Rowdies carousel Approved; approval is not a publication receipt.
- Premium account/key and actual auditions remain pending owner setup. No claim of a human-sounding result is made before listening.
- Instagram insights access is still limited; do not claim measured growth or retention improvements.
- This change does not modify Framer pages, CMS collections, forms or carousel artwork.

## Current visual preview

- [20-second music-only cut](https://framerusercontent.com/assets/DFiIkJrL4EoEO7T6hJSOe9LhA.mp4)
- [Storyboard](https://framerusercontent.com/images/uUgD85n3IEWB9DMKAoqdRTWbEnc.jpg)

The hosted MP4 exactly matches the audited render: 1080×1920, 30 fps, H.264 / stereo AAC 48 kHz, 20 seconds, 16.60 MB, −15.45 LUFS and −1.37 dB true peak. Source and asset hashes are recorded in the render report; the public delivery manifest is `content/instagram/club-cut-preview.json`. It is a music-only visual direction for review, not an approved narrated Reel. All 173 repository tests passed, including charge caching, uncertain-request blocking, budget validation, credential/error handling, overage configuration and caption timing.

The public URL played in Chromium at a 390×844 phone viewport. Playback and seeks at 1.2, 4.4, 9 and 18 seconds succeeded with no media/browser errors or horizontal overflow. The opening, score, action and closing frames were inspected. Actual narration/caption synchronization remains untested until the premium account is connected; fixture timing tests do not replace an actual voice render.

GitHub [read-only connection check 39873556879](https://github.com/titodv41/cancha-automation/actions/runs/39873556879) ran the real workflow successfully through setup and reported `blocked: Configure ELEVENLABS_API_KEY as a secret first`. The workflow has no configured credential yet. No provider generation, scheduling or publication occurred. Its private status artifact was inspected; after the owner saves the repository secret, rerun **check**, then make the capped auditions only if account, voice and billing checks pass.
