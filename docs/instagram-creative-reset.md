# October 15: Instagram creative reset

The owner rejected the feed's generic copy, repetitive photography and lack of personality. The earlier authorization to publish daily does not establish satisfaction with the existing creative approach. The live standing plan was paused; do not resume it incidentally during setup or unrelated maintenance. Existing published posts were preserved. Website opportunity discovery and publishing remain enabled.

## What the audit confirmed

The private queue records three successful publications: the October 12 introduction, October 13 “Who keeps your club going?” and October 14 “Ask before you apply.” The latter two use the same W.carter photograph of a misty soccer field in Sweden. This is not local Florida community coverage. Copy came from a fixed evergreen bank; imagery was chosen by hashing the draft ID into a three-photo library, without checking recently published images or matching a specific local story.

The system was a scheduler, source checker and renderer. It did not have Instagram reach, saves, shares, profile-visit or follower-performance data connected and was not learning from those outcomes. Website analytics do not establish Instagram performance. No reach figure or diagnosis of the platform's distribution algorithm was verified in this audit.

## Corrections executed

- [Live pause](https://github.com/titodv41/cancha-automation/actions/runs/38777757717) succeeded. Private summary confirms `plan.enabled=false` and no Approved, Preparing, Publishing or Needs reconciliation entries.
- [Queue review](https://github.com/titodv41/cancha-automation/actions/runs/38777845076) confirms published captions, source photo credits and the paused plan. Private preview artifacts stay out of Git; credentials and decrypted state were not downloaded.
- Disabled automatic evergreen-bank and syndicated-headline draft production in `config/instagram-editorial-policy.json`. Fresh website opportunity checks continue. This does not delete the bank or existing drafts.
- Added a 30-day image reuse check to standing-plan selection. It compares original checksums, source pages, source image URLs and rendered assets; recropping/reuploading the same image does not evade the check. Exhausting safe content means skipping a slot.
- Created three unpublished, source-grounded concept drafts in `content/instagram/creative-reset-concepts.json`. October 15 requests returned official academy/evaluation information. They are not queue items or ready-to-publish artwork. No new post was published during this reset.

## Revised creative direction

Make Cancha useful and recognizable to Florida soccer people. Lead with real clubs, specific local options, clear costs/commitments and genuine people when permission and reporting exist. Pair each post with an editorial reason to exist: whom it helps, what it tells them and what they can do next. Avoid generic motivational prompts, arbitrary global headlines, engagement bait and decorative photography unrelated to the story.

Use fewer words on a cover, clear hierarchy and distinct formats appropriate to the content. Keep the Cancha identity without forcing every post into the same oversized text template. Rotate actual local scenes, club details, practical explainers and real product demonstrations. Use original/permission-cleared media; do not use copyrighted club photos merely because they are publicly visible. Do not invent quotes, interviews, attendance, partnerships or results. Stock photographs must not imply a named club or local event.

The owner should not have to manage a calendar every day. First establish a credible visual batch and editorial standard, then resume production against that standard. This temporary pause is not a request to replace automation with permanent manual posting. Carousel/video ideas remain concepts until actual assets and publisher support exist.

## Performance loop still needed

Connect or confirm the account's read-only Instagram insights capabilities before promising automated performance optimization. When available, compare post reach, saves, shares, profile actions and attributable site visits at comparable post ages. Separate content type and topic from distribution/spend changes. Three posts cannot establish a winning strategy. Never guarantee reach or growth, manufacture engagement, buy followers or start ads to mask weak content.

No posts were deleted, archived, boosted or newly published. No outreach messages were sent. No advertising spend was initiated.
