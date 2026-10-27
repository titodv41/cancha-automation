# Cancha LinkedIn kit

Prepared October 27, 2026. **No LinkedIn Company Page was created or edited, and no personal profile change was applied.** This session has no LinkedIn connector or authenticated browser. The supplied personal profile returned HTTP 999; the Page creation route redirected to sign-in. Account identity, existing managed Pages/drafts, existing Founder entries and final selector/field-limit enforcement remain unverified.

## Start here

Download the complete ZIP, extract it, and open **`index.html`** in Chrome, Safari or Edge. It contains the company-page preview, copy buttons for all fields, downloadable logo/cover, the Founder entry, all three draft posts and the first-month plan. It works locally without account credentials or a server. **It does not apply changes to LinkedIn.**

- `SETUP.md` has the exact text and a short manual handoff.
- `exports/cancha-linkedin-logo-400.png` is the 400 × 400 Company Page logo.
- `exports/cancha-linkedin-cover-1512x256.png` is the 1512 × 256 Company Page cover.
- `exports/page-preview-desktop.png` and `page-preview-mobile.png` show the assets together. These are labelled layout simulations, not screenshots of a live LinkedIn Page.
- `exports/post-01-introducing-cancha.png`, `post-02-local-soccer.png` and `post-03-id-camp-comparison.png` are **unpublished draft visuals**, not scheduled posts.
- Matching SVG files are editable, self-contained design sources; the artwork uses the actual Cancha wordmark and existing licensed fonts. Sources and the font license are included under `sources/`.
- `content.json` is the canonical copy; `research.json` records source checks and limits; `qa.json` records rendered dimensions, file sizes, font/bounds checks and character counts.

## Brand choices

Use the exact wordmark from the live Cancha site and current creative manifest. Its original PNG is preserved byte-for-byte; the square export only contains and centers it on cream. The original transparent padding is excluded in the SVG viewport without redrawing, stretching or recoloring the mark. A separate approved circular-C asset was not available, so no replacement symbol was invented.

Palette: forest `#103f32`, cream `#f5f3e9`, lime `#d7ef86`. Typography: existing Barlow Condensed bold italic display and upright bold supporting face. The cover uses one descriptive headline, supporting copy and a restrained pitch-line detail. It adds no club/sponsor logos, artificial players, partnership claims or permanent slogan. LinkedIn controls its own text/interface fonts; the brand typography applies to the supplied artwork.

The cover keeps meaningful text centered and away from the logo overlap and edges. Desktop, 390-pixel layout and a simulated 320 × 100 center-crop are included. Actual LinkedIn cropping, account settings and the saved Page/profile link still need checking after upload.

## Rebuild

From the repository root, use the locked Node/Playwright dependencies already installed for Cancha:

```sh
npm ci
CANCHA_BROWSER_EXECUTABLE=/usr/bin/chromium node content/linkedin/build-assets.mjs
```

If that browser path is absent, install the project's pinned Playwright Chromium and omit `CANCHA_BROWSER_EXECUTABLE`. No paid service, external image generator, API key or new npm dependency is required. Rebuilding regenerates assets/preview from `content.json`; it does not recheck camp facts or renew their October 27 research date. Source changes must be rechecked separately before publication.

## Scope and permissions

The owner authorized Company Page setup and a correctly associated Founder entry only. No invitations, messages, other admins, website/Instagram edits, LinkedIn post publication/scheduling, paid products or ads are part of this kit. Do not reuse Instagram's standing publication authorization for LinkedIn. The three drafts require a separate publishing instruction.
