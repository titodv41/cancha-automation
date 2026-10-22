# Reusable photo editorial workflow

The October 22 upgrade creates six photo carousels (19 slides) and a 15-second photo-led Puerta video. The media comes from the actual clubs and stories: Sporting JAX's match report and roster portrait, Rowdies match recap/supporter photography, FKK's program action photos, and Weston FC's field photograph and named coach biography. The owner confirmed that media permissions are handled. Publisher, exact photo URL, subject and original checksum are recorded in the manifest; no invented license or photographer credit is asserted.

## Content structure

`content/instagram/photo-editorial.json` is the editable brief. Its `brand` block selects the logo, fonts and colors. Each post has an exact source ID, caption, photo records and ordered slides. Each slide references a photo ID and selects a cover, split or question layout, with short copy and a reviewed focal point. A slide can use a different crop of the same photograph within one carousel. The scheduler blocks reusing that original photo in a different post for 30 days.

Photos are not generated. Original downloads stay in ignored `private-data/`; final hosted images are in `photo-editorial-ready.json`. The manifest pins the original bytes. A changed source photo requires review. Brand typography is Barlow Condensed for short display titles and Barlow 600 for body copy. Every slide is 1080×1350, with one consistent aspect ratio, readable body type and a real subject photograph. Source/legal/process footers are omitted from artwork. Relevant dates and registration status are part of the actual story.

## Commands

Install the root project with `npm ci`. For the heavier video package, install once with `npm --prefix video ci --ignore-scripts`. No new paid skill, Claude subscription, image generator or hosted rendering service is required.

```sh
# Recheck official facts, download pinned photos, render and check layout bounds.
CANCHA_BROWSER_EXECUTABLE=/usr/bin/chromium npm run content:photos

# After visual inspection: upload images and verify every hosted JPEG and checksum.
CANCHA_BROWSER_EXECUTABLE=/usr/bin/chromium npm run content:photos -- --upload

# Render the configured photo video and three review frames.
CANCHA_BROWSER_EXECUTABLE=/usr/bin/chromium npm run content:video

# After tests and the normal repository push: update the actual encrypted queue.
gh workflow run github-instagram.yml --ref main -f action=refresh-photo-stories

# Get a fresh status/preview artifact.
gh workflow run github-instagram.yml --ref main -f action=review
```

Use an installed Chromium path on another machine. The cloud proxy and CA remain in place, with TLS verification enabled. Framer credentials stay in the environment/Actions secret, never in a manifest, command argument, chat or preview. The GitHub state and Meta token remain encrypted; no Render service is used.

The photo builder uploads media only. The GitHub import checks the whole batch's official facts and all image bytes before queue writes. It preserves an existing future standing-plan slot only if the post has no Meta container yet. Published, uncertain, in-progress and separately manually approved posts are protected. Re-running an identical import does not alter approvals.

## Scheduling and boundaries

The existing feed plan is two eligible posts/day at 12:30 PM and 6 PM New York, starting October 23; today's already-approved Rowdies slot remains October 22 at 6 PM. Actual receipts enforce a four-hour gap and two/day. A carousel counts as one post. GitHub schedules are approximate.

The October 22 batch can supply tonight and the next few days. New facts/photos/copy still need a fresh editorial brief. The daily job checks and schedules eligible prepared content; it does not run an unattended AI researcher or invent a new batch. `requireSubjectPhotos` prevents the older badge-only fallback. If fresh, non-repeating work runs out, a slot is skipped. Renew expiring stories and replenish the batch through the same workflow.

Video output is a public preview, not an automatic Reel. It uses two real photos with camera movement, transitions and concise titles; no match clips or fabricated action. It currently has no soundtrack or narration. The image/carousel publishing path is enabled. Reels require their own video-container checks before enabling a recurring Reel plan.

Insights still require `instagram_manage_insights`. This creative upgrade does not establish that reach or conversion has improved. Keep measured results separate from design judgment.

## Publisher implementation

`server/instagram-media.mjs` validates 2–10 distinct hosted JPEG slides, dimensions, descriptions, cover consistency and all public bytes. A conservative 10-slide cap keeps Cancha posts short; the current Meta docs allow up to 20. Child containers are created with `is_carousel_item=true` and per-image alt text; the parent gets `media_type=CAROUSEL`, ordered children and one caption. No child is individually published. Existing single-image approval hashes are preserved. Changing a slide, its order or photo evidence invalidates approval. The existing durable Publishing checkpoint and no-retry rule for uncertain outcomes remain.

Official references checked October 22, 2026:

- https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/content-publishing/
- https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media/

## Reuse in another project

Copy the renderer, media validation/publisher modules, video package and `skills/photo-editorial/SKILL.md`. Configure that project's brand assets, official source registry and owner authorization reference; the current reference lives in `approvedSubjectPhoto` and must not be reused as permission for a different project. Configure the new account's expected identity, its own encrypted queue and its own secure credentials. Render and inspect a sample before importing into that project's queue. Cancha's Framer project, connected Instagram account, publication receipts and standing plan must not be copied as working credentials or authorization.
