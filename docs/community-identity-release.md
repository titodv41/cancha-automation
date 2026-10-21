# Cancha identity and community imagery

Earlier October 21 iteration. Superseded by [brand polish](brand-polish-release.md): stronger Manrope text, green hero, a single supporters photograph and official course-provider marks. The owner rejected the three-photo carousel described below.

October 21, 2026. Current visual direction: [design principles](cancha-design-principles.md).

## What is implemented

- Restored the established Cancha Display bold italic headline face. Inter stays on body text and controls, with Manrope on smaller headings. The original wordmark and brand colors are preserved.
- Replaced the empty field/stadium hero with a three-photo gallery of real Orlando players and supporters. It works on phones as a full-width gallery below search. Arrow keys, touch swipes and buttons select photographs; autoplay has a visible pause control.
- Made the eight-club badge strip move gently, with pause/resume, hover/focus pause, manual controls and reduced-motion support. Decorative loop copies are excluded from screen-reader and keyboard navigation.
- Removed photo source references from the image overlay. Required attribution, source links, licenses and context remain in the collapsed, keyboard-accessible **Photo credits** footer section.
- Added actual identifying images to each lower homepage category card: current listing badges, the existing My Personal Football Coach provider mark, and the FIFA Training Centre mark for an existing learning resource. These identify content users can find through the linked directories; they are not sponsors or endorsements.
- Kept location search, the home map, optional age/level filters, How Cancha works, existing routes, source disclosures and private native forms.

## Media evidence

`config/community-media.json` records the creator, Commons source page, license, source-byte checksum and Framer asset for each photo. They show Orlando City players before an August 2025 match and supporters in 2024. They illustrate Florida soccer; no Cancha-organized event or endorsement is claimed. The photograph files were visually inspected before use. Responsive CSS crops are declared in the credits. Framer-provided thumbnail URLs/srcsets keep phone loading smaller; only requested gallery frames are loaded.

`config/home-resource-media.json` records the existing provider image and the identifying mark retrieved from FIFA Training Centre's official website. They are used in the context of the actual provider/learning directories. No unrelated retailer was added as an invented partner.

The gallery preserves a previously shown frame while the next requested image loads. A production-only hydration issue was found during testing: the first image could finish loading before React attached its event handler, leaving the return-to-first-slide action waiting forever. The component now checks the actual image element's `complete`/`naturalWidth` state as well as its load-event cache. The live test cycles through all three photographs and returns to the first, rather than checking only that the first image appears.

## Instagram and business follow-through

The daily community plan remains enabled. Older empty-field/stadium social-photo drafts are excluded from future automatic selection. A licensed player-huddle photograph and community question were added to the future editorial pool; this does not claim it has already been published. Automatic club spotlights now require an actual identifying image; venue map guides remain available. The original source checksum and archive context are recorded for the social photo. One-post-per-day and uncertain-publication safeguards are unchanged.

The last verified private workflow had five published receipts and no uncertain publications. Instagram Insights still requires `instagram_manage_insights`; there is no claim of measured engagement improvement while that permission is missing.

[Booking marketplace versus ads](marketplace-revenue-model.md) compares GoodRec's model, featured placements, contact paywalls and advertising with explicit hypothetical economics. [Google Flow workflow](google-flow-content-workflow.md) records official capabilities and a safe first illustrated-video experiment. No checkout, subscription, ad spend, new paid service, video publishing or outreach was enabled.

## Preservation and checks

Starting private backup: `backups/community-identity-2026-10-21`. It contains all five collections, actual code contents and the reviewed native scenes. Visual publication compares the CMS with that baseline and verifies source/scenes before publishing.

The existing 124-test Node suite and all 13 Framer code typechecks passed. Production search/filter/detail checks at 1440, 390 and 320 pixels passed with the restored headline font. Final gallery/motion checks, publication receipt and preview manifest are recorded below after deployment.
