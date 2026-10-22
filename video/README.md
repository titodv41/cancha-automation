# Photo-led video

This separate Remotion package keeps video dependencies out of daily Framer and Instagram installs. It needs no Claude subscription or paid hosted renderer.

```sh
npm --prefix video ci --ignore-scripts
CANCHA_BROWSER_EXECUTABLE=/usr/bin/chromium npm --prefix video run render
```

The runner reads the brand, actual photo URLs and timed story beats from `content/instagram/photo-editorial.json`, rechecks official facts and pinned photo bytes, stages assets locally and renders a 15-second 1080×1920, 30fps H.264 MP4. Three JPEG frames support review. Output: `previews/video/`. `npm --prefix video run still` renders only those frames. `--story=<post-id>` selects another manifest story with video beats. A compatible installed Chromium is required; this script does not download a browser.

The current example uses Puerta's real match celebration and official roster portrait, with movement, short transitions and readable titles. It has no fine-print footer, soundtrack, narration or invented match footage. Photo provenance and source hashes remain in the manifest and render report.

**Publishing:** video remains a preview. Automatic Reels have not been enabled. Feed carousels use the existing two-slot daily plan. Full workflow: `docs/photo-editorial-workflow.md` and `skills/photo-editorial/SKILL.md`.

The [official Remotion pricing page](https://www.remotion.dev/docs/license/pricing), checked October 22, 2026, permits free commercial use by individuals and companies of up to three people. Recheck if the team grows. No paid service/license was purchased. Rendering consumes the current machine's resources. Barlow font licenses are in `assets/fonts/`.
