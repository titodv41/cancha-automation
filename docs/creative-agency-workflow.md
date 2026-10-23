# Cancha creative workflow — October 23, 2026

The owner wants concise photo carousels, stronger colored panels and a real spoken story rather than a narrator reading titles. Pocket and Kokoro are rejected for this work. Keep Cancha’s italic Barlow Condensed headlines, Manrope supporting type, forest/cream/lime/orange palette and authentic subject photography. No paid voice plan is enabled.

## Skills installed and applied

- [Anthropic frontend-design](../.agents/skills/frontend-design/SKILL.md): deliberate art direction and cohesive typography.
- [Corey Haines Social](../.agents/skills/social/SKILL.md): useful slide sequences and short-form storytelling.
- [Corey Haines Copywriting](../.agents/skills/copywriting/SKILL.md): concrete copy without filler, invented experience or generic hype.
- [Cancha storycraft](../.agents/skills/cancha-storycraft/SKILL.md): current official facts, brand motion, measured voice timing and delivery checks.

The actual upstream files and licenses are installed in the repository, with pinned revisions and SHA-256 hashes in `agency-skill-sources.json`. These skills guide production; they are not a background content-generation service. No outreach or paid service is authorized by their generic advice. `.agents/product-marketing.md` records Cancha’s specific audience and direction.

## Current release — October 23, 2026

The replacement ElevenLabs key works. See [the source recovery and creative release](source-recovery-and-creative-release-2026-10-23.md) for current public previews, actual import counts and workflow receipts. Historical results below describe the earlier run and are superseded by that release.

## Carousel production

The bank contains five guides: Florida women’s matchdays, FKK parent questions, the Rowdies’ Al Lang ground, Orlando City/Pride’s shared ground, and Weston FC programs. Twelve slides use twelve distinct source photographs. Each panel has at most 30 words, one headline and a short useful fact/question. Source links belong in captions/evidence rather than artwork fine print.

1. Choose a real reader question, subject and useful outcome. Check current official sources; distinguish a club profile from an open registration offer.
2. Register exact supporting text and an expiry in `config/local-editorial-sources.json`.
3. Select and inspect different original photos for every slide. Record publisher, exact URL, subject and checksum. A different crop is not a new photograph. Discard dated flyers or undersized images.
4. Write the caption and slides in `content/instagram/photo-editorial.json`. Choose `panel` (photo + fact card), `program` (age/program comparison), `field-notes` (ground guide) or `club-card` (smaller inset photo + useful questions). Use the website’s Barlow 600/700 for supporting copy and Barlow Condensed bold italic for headlines. Keep the display font, palette and logo consistent; vary the composition with the subject.
5. Run `npm run content:photos`. Inspect all slides at full size and phone size. The renderer checks source freshness, identity, distinct originals, resolution, font loading and text overflow. A supported official CDN may serve WebP even when its URL ends in JPEG; the source bytes and actual format are checked.
6. Run `npm run content:photos -- --upload`, then `node scripts/share-photo-editorial.mjs`. This uploads review media, not an Instagram post.
7. Commit/push reviewed assets and dispatch `github-instagram.yml` with `action=refresh-photo-stories`. This updates only future untouched drafts/standing approvals and preserves slots and publication receipts. Inspect the private status artifact.

Use `CANCHA_BROWSER_EXECUTABLE=/usr/bin/chromium` in this cloud environment. Public preview links are written to `content/instagram/photo-editorial-preview-links.json`.

The standing plan remains two feed slots per day, 12:30 PM and 6 PM New York, at least four actual hours apart. A finite five-guide bank cannot fill every future day. The scheduler rechecks and publishes eligible prepared work; it skips weak or stale slots. It does not research and art-direct fresh posts indefinitely. New Reels remain preview-only during the current creative revision.

## ElevenLabs Free auditions

The new story is `content/instagram/story-narration.json`: why a Broward fan might follow Fort Lauderdale United before its men’s USL League One debut in spring 2027, including the already-playing women’s side and shared Davie ground. Its complete spoken narrative adds context beyond five short screen headings. Do not squeeze it into the previous 24-second cut or substitute the rejected Pocket audio.

Save the user-created key in [GitHub repository Actions secrets](https://github.com/titodv41/cancha-automation/settings/secrets/actions/new) as `ELEVENLABS_API_KEY`. Allow Text to Speech and read access to Voices, Models and User/subscription. A provider-side 1,500-credit key quota is the hard limit; never put the key in chat, source files, screenshots or artifacts.

The manual `premium-voice.yml` workflow supports:

- `check`: read-only model, stock-voice and account-credit availability.
- `free-audition`: two private stock-voice samples, Chris and Jessica, using the new full script. It refuses a paid-tier account, insufficient confirmed credits or an uncapped policy. Maximum request 650 characters, batch 1,300 and project/month 1,500. The current script is about 450 characters, approximately 900 across both takes; actual credit accounting is the provider’s.
- `audition`: historical paid route, still blocked by the disabled paid-generation setting.

Auditions never schedule or publish. Requests are reserved before a provider call, successful audio is cached and hash-bound to the script/timing, and uncertain calls cannot be retried automatically. A Free-only guard prevents spending paid-plan credits. Free availability and usable stock voices must be confirmed against the actual account; the script does not create an account or grant credits. Keep entitlement information with the account records; a technical preview is not a licensing certification.

After a successful audition, download the private `cancha-voice-RUN_ID` artifact and build the edit against actual audio/word timings. Do not call a voice natural merely because it passed codec or transcription checks. The October 23 replacement key passed; Free audition 40002949357 generated both samples. See the current release for actual narrated MP4s. This success does not enable unattended voice generation.

## Website automation: verified behavior and repair

The live read on October 23 found 378 published Clubs/place profiles and 84 Active Opportunities (106 opportunity records total). Active is a CMS status, not independent verification of every listing. The last recorded additions before this repair were October 22: 18 club profiles and nine automation-tagged opportunities.

The October 23 [preparation run 39992572916](https://github.com/titodv41/cancha-automation/actions/runs/39992572916) completed but added zero listings. All five approved employer boards returned HTTP 403 to the GitHub runner, and remaining club candidates failed identity/media checks. Do not report a successful workflow as successful growth.

The added fallback can independently check 16 known official Soccer Shots regional pages instead of relying solely on a changing locator response. Workspace preflight confirmed 13; three failed geography evidence and stay blocked. **The live identity check then established that all 16 regions are already listed. This fallback added no new coverage today and must not be described as 13 new profiles.** Regional profiles omit private school/childcare venues and do not claim open classes. Each actual addition still requires existing duplicate, badge, source, private backup and publication checks.

The GitHub workflow now has a noon preparation fallback in addition to the morning run. A persisted New York completion date skips duplicate scheduled preparation; manual preparation still forces a check. The completion marker is written only after the entire child pipeline succeeds. Status artifacts now include `websitePreparation`, additions, publication and blockers. GitHub cron timing is approximate; this is a recovery attempt, not a guaranteed fixed-time service.

Employer-board 403s and UPSL directory 403s remain blockers. Twenty-eight opportunity leads still require manual review because no supported structured-source adapter established their current availability. The existing eligible provider directories are largely already represented. A fallback source adapter does not manufacture 50 verified opportunities per day. No page design, submission destination or contact-email exposure is changed by this repair.

## Verified release results

- Commit `a3eb44c` was pushed to `main`. All 182 tests passed, including Free-only financial guards, duplicate-photo rules, exact CDN allowlisting and delayed preparation handling.
- All five carousels passed current official-source checks, distinct-photo/resolution checks, font loading and text/footer overflow checks. All 12 uploaded 1080×1350 JPEGs loaded successfully at a 390 px phone width. Orange panels use a darker ink with approximately 5.14:1 contrast.
- [Full-size carousel PDF](https://framerusercontent.com/assets/WQBueCAeSPDFb3t0Ul9By5SM64.pdf) and [all-slide gallery](https://framerusercontent.com/images/MtZKAIuhBv4MruydvzW5A1HCxu0.jpg) are public and were fetched back successfully.
- [Queue refresh 39997528005](https://github.com/titodv41/cancha-automation/actions/runs/39997528005) succeeded: five guides updated, seven existing Published receipts preserved, zero uncertain publications. The women’s matchday guide retained its October 23, 6 PM New York slot; the other four guides remain Drafts available to the standing plan. Imported does not mean already published or all future slots scheduled.
- [Preparation 39997530689](https://github.com/titodv41/cancha-automation/actions/runs/39997530689) exercised the new daily completion marker and completed successfully. **Zero new club profiles and zero opportunities were added.** Framer returned a publication receipt; that does not establish listing growth. A subsequent live CMS read still found 378 club/place profiles. The existing Opportunities snapshot remains 106 total / 84 Active. The run preserved encrypted backups and exposed the source blockers in its status artifact.
- Historical result, now resolved: [Voice check 39997532807](https://github.com/titodv41/cancha-automation/actions/runs/39997532807) is blocked by missing `ELEVENLABS_API_KEY`. No provider generation, paid-plan change, new narrated MP4 or Reel publication occurred. The user said they would save the key; that is not evidence it has been configured.

## Learning and reuse

Instagram insights still need `instagram_manage_insights`; no performance gains or autonomous audience learning are claimed without actual metrics. Use comparable post ages and evaluate shares, saves, useful comments, website visits and submissions when available. Posting more often is not proof of growth.

For another project, replace brand/media/source manifests, audience context and account configuration. Keep its credentials, private submissions, voice budget and publication state separate. Preserve idempotency, source freshness, media distinctness and uncertain-publication protection.
