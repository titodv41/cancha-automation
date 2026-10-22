# Cancha video previews

Remotion makes original video with React. This separate package keeps the heavier rendering dependencies out of daily Instagram and Framer installs. No Claude subscription or hosted renderer is required for this project.

```sh
npm --prefix video ci --ignore-scripts
CANCHA_BROWSER_EXECUTABLE=/usr/bin/chromium npm --prefix video run render
```

The runner rechecks the reviewed Ashlyn Puerta story, stages recorded club/logo/font assets locally, bundles into a temporary directory and renders an 18-second 1080×1920, 30fps H.264 MP4. Three JPEG frames support visual review. Output: `previews/video/`. `npm --prefix video run still` renders only those frames. Set `CANCHA_BROWSER_EXECUTABLE` to an installed compatible Chromium/Chrome executable on another machine; the code does not download a browser automatically.

For Studio, run the render/still command once to stage local assets, then `npm --prefix video run studio`. Remotion’s local development server is for previewing; no public hosting is configured.

The composition lives in `src/index.tsx`. The entry is a dated professional-player recap, not a footage generator. It uses a real identifying club crest, licensed fonts, original graphics and no soundtrack, synthetic voice, portrait or match clips. Source/asset provenance is under `../content/instagram/local-stories/` and the render report records the reviewed source hash. Recheck and update expired source descriptors before making a later video; do not bypass the expiry check.

**Publishing:** this is a preview. Reels need a separate media upload/container path and publication checks; no automatic Reel schedule was enabled. The feed image schedule remains one eligible post per day.

**Cost/licensing:** the [official Remotion pricing page](https://www.remotion.dev/docs/license/pricing), checked October 22, 2026, permits free commercial use by individuals and companies of up to three people. Recheck licensing if the business/team grows beyond that. Local rendering uses the machine you run it on; GitHub runner/cloud-provider costs are separate. No paid service, license or subscription was purchased. Barlow and Barlow Condensed are under SIL OFL 1.1; their license files are in `../assets/fonts/`.
