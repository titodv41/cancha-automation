# Cancha brand polish

October 21, 2026. This is the current direction, superseding the earlier photo-carousel revision in [community identity](community-identity-release.md).

## Result

The homepage uses Cancha's established athletic display face on a forest-green hero. Supporting text is substantial Manrope, rather than thin Inter. The same Manrope body/control hierarchy and stronger athletic section headings carry into discovery, details, courses, navigation and native Framer content. Cream, forest green and pale green alternate across sections; orange remains an existing accent and pale lime distinguishes the main search action.

A single real Orlando supporters photograph replaces the rejected rotating photo panel. Its location link opens relevant directory results. Credits remain in an accessible collapsed footer section. The moving club-badge strip remains, with actual directory links, pause/resume, hover/focus pause, offscreen pause, manual controls and reduced-motion support.

The navigation and search controls use restrained translucent surfaces. This is web CSS, not Apple's native Liquid Glass implementation. Search inputs and card text retain solid contrast and readable weight. Translucency is used around controls, not as a replacement for readable content cards.

## Recognizable organizations and places

- All **11 learning resources** use identifying marks for their **eight actual providers**: FIFA Training Centre, U.S. Soccer, United Soccer Coaches, Hudl Statsbomb, NSCA, FYSA, The Coaching Manual and Online Soccer Academy. Marks were retrieved from their official sites, uploaded unchanged and checked visually on suitable backgrounds. Source URLs, byte checksums and context are in `config/learning-provider-media.json`. They identify linked resources; they do not imply partnerships.
- Existing **53 current play listings and 16 career listings** have images in the public catalog. This design work does not claim those images verify current availability.
- **202 of 331 directory profiles** have actual identifying images. The 110 remaining club/team profiles and two pickup organizers keep a full-name typographic identity and city, rather than a generic initials illustration. The 17 venues use city-area maps. This is explicitly not an invented official club badge. Do not describe this as 331 official logos.
- All 17 venue cards retain real city-area map previews; venue details now have a larger matching map with OpenStreetMap attribution and a city-area label. These are not exact venue pins, photographs of the facility or permission to walk on a pitch. Official map/contact links and access notes remain.
- Existing provider imagery, native forms, URLs, filters, source disclosures and owner-activated CMS statuses are preserved.

## Audit references and decisions

[Apple's materials guidance](https://developer.apple.com/design/human-interface-guidelines/materials) describes glass as a functional layer for navigation and controls, recommends using it sparingly, and emphasizes contrast. Its official documentation JSON was also read. The site uses those principles with its own existing brand, not copied Apple assets or a claim of native platform behavior.

[Plei](https://www.plei.app/), [Playtomic](https://playtomic.com/) and [GoodRec](https://www.goodrec.com/pickup-soccer) were reviewed as sports-discovery references. The useful patterns are a clear first action, identifiable organizations, location context and real sports media. Their partners, audience counts and booking capabilities were not copied into Cancha. No conversion improvement is claimed without actual measurements.

The source audit found weak provider identification in courses and excessive lightness in the supporting type. Those gaps drove the changes. Adding blur alone would not fix either problem. Course copy now uses direct provider/resource names and shorter factual descriptions.

## Publication and verification

Private baseline: `backups/community-identity-2026-10-21`, including all five collections, code and native scenes. Publication verifies the CMS against that baseline, typechecks all 13 shared files and checks the reviewed source/scenes. The final production receipt, responsive checks and screenshot manifest are recorded below after deployment.

## Automation and business

The owner-authorized daily feed plan stays on GitHub Actions. The new community/player photograph and source-backed club spotlights are future editorial candidates; old empty-field/stadium drafts are excluded from future selection. Published receipts are preserved. Content learning remains limited until the Instagram Insights permission described in [the connection guide](instagram-insights-connection.md) is available.

[Booking marketplace versus ads](marketplace-revenue-model.md) recommends free discovery, a small disclosed featured-profile pilot, then one real organizer-led paid-game experiment. It explains off-platform bypass and shows explicitly hypothetical economics. No ads, payments, memberships, outreach or new paid subscriptions were activated.

### Verified production result

- Published deployment **e1522c2d8**, October 21 at **04:50:37 UTC**. Production optimization was confirmed separately after the publish receipt; no pending changes remained.
- **124/124 Node tests** and **13 Framer typechecks** passed.
- Production brand/media, discovery/filtering, visual detail/routes and Florida course/service/form checks passed at **1440, 390 and 320 pixels**. The first directory result begins at approximately **577/637/639 pixels**, respectively. No horizontal overflow or browser runtime errors were found in those flows.
- The badge strip passed normal-motion, pause/resume, hover-pause and offscreen-pause checks. Reduced-motion mode stays static. All 11 course-provider images decoded; logo containment, correct provider associations, direct resource links, filtering and venue-map attribution were checked.
- Full fields/items remained identical to the private baseline in all five collections: **87 Opportunities, 331 Clubs, two Providers, three Stories and zero Offers**. This preserves statuses and public URLs. No test submitted a form or exposed its private email recipient.
- [Desktop home](../previews/brand-polish/media/home-desktop.png), [mobile home](../previews/brand-polish/media/home-mobile.png), [courses](../previews/brand-polish/media/courses-desktop.png) and [venue detail](../previews/brand-polish/media/venue-mobile.png). The [preview manifest](../previews/brand-polish/reviewed-previews.json) includes checks and SHA-256 hashes. Local/intermediate screenshots were archived privately. The Instagram image in that folder is explicitly an unpublished creative preview.
