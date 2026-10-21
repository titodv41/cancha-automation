# Search, typography and community update

October 21, 2026. Project `GU8EIeQXaRbty0S23thu`.

## Audit and research

The existing interface had readable body text but italic, uppercase headlines across otherwise different pages. The homepage repeated several short slogans before the search. The site already had a city map and ZIP-radius search in the directory, but neither location help nor a map was available on the homepage.

Reviewed official public pages:

| Reference | Observed pattern | Applied to Cancha |
| --- | --- | --- |
| [GoodRec](https://www.goodrec.com/) | A prominent city chooser, clear activity labels and real games/places | Make What/Where and location the first action; retain direct category choices |
| [OpenSports](https://opensports.net/) | Groups and events have concrete actions; interface text uses readable sans families | Use consistent upright interface headings and straightforward section names |
| [Resy](https://www.resy.com/) | Entry page was reachable but returned a small application shell | No unsupported claims about its full navigation, fonts or conversion performance |
| [MDN Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API) | Secure context, explicit browser permission, success/error callbacks | Request only on button press; keep manual search and error fallbacks |

GoodRec's delivered styles referenced Google Sans Flex/DIN families; OpenSports' delivered page referenced Inter/Outfit and other families. Those are observations of the fetched pages, not recommendations to copy proprietary assets. Cancha reuses its already licensed, self-hosted **Manrope headings and Inter body/UI**. The existing Cancha wordmark stays intact. No new font subscription or dependency was needed. These design choices are qualitative judgments, not A/B-tested conversion gains.

## Website changes

- Homepage heading: **Find soccer near you.** Supporting line: **Clubs, pickup groups and fields across Florida.** Removed the slogan chain, italic heading, tilted picture and decorative photo caption.
- Clear What/Where inputs, optional Age & level, and **Use my location** on the homepage and discovery pages.
- Homepage city map and direct links for Miami, Orlando, Tampa, Fort Lauderdale, Jacksonville and West Palm Beach. Selecting a city opens its actual filtered directory. Map counts reflect profiles, not independently verified clubs or scheduled games.
- Upright headings across home, directory, detail, courses and native secondary pages. Services, Stories, Offers and About use descriptive titles.
- Existing club/opportunity URLs, source disclosures, league-season caveats, image identity checks, free native submission forms and organizer review remain intact.

## Location implementation

The browser asks for permission only after **Use my location**. The coordinates are used in browser memory to choose the nearest supported Census ZIP-area center within 15 miles. The result is a **nearby ZIP area**, not a claimed street address or actual postal code. Very imprecise fixes (accuracy over 25 km), invalid coordinates and distant locations fall back to manual search. The user can edit the suggested area before searching.

Raw coordinates are not written to Cancha's URL, local/session storage, CMS or a new service. Only the coarse ZIP area enters the existing search URL. The browser's own geolocation provider still performs its normal permission/location process. A late result cannot overwrite a manually edited location field. Timeout, denial and unsupported/unavailable location have readable fallbacks.

Map pins remain city centers, not exact venue entrances. Distance is approximate straight-line distance between area/city centers, not driving distance. OpenStreetMap attribution remains visible. No geocoding account, key or paid map service was added.

## Scope and preservation

Private starting backup: `backups/location-community-2026-10-21`. Inventory was 331 profiles, 87 opportunities, two providers, three stories and no offers. No listings or source-check dates were changed in this release. In particular, the owner’s Active opportunity statuses were preserved. This release improves discovery; it does not finish importing every Florida club or reverify every program's availability.

Native copy edits compare the full scene excluding only the named text nodes, restore Framer's known empty-frame height normalization and verify that all form subtrees remain unchanged. Publication retains the existing CMS, code and scene guards. The raw-CSS style helper is preserved so font declarations survive Framer navigation.

## Content and business work

[Community content plan](community-content-plan.md) covers the implemented automatic selection changes, reviewed assets and measurement limits. [Monetization pilot](monetization-pilot.md) gives a small featured-placement experiment, explicit pricing hypotheses, payment-fee arithmetic and decision criteria. [Google Flow workflow](google-flow-content-workflow.md) covers official capabilities, account/credit checks and one practical illustrated-video brief.

No paid promotion, payment product, subscription, outreach, Facebook group bot or automatic video publishing was enabled.

## Verification

Code is checked by Framer's TypeScript service before applying. Node tests cover source/age/league/privacy/publication safeguards plus coarse location and community selection. Browser checks exercise real search/navigation at 1440, 390 and 320 pixels; controlled location permissions and simulated errors do not collect a real user's location. Production receipts, final test outcomes and reviewed screenshots are recorded after deployment below.

### Production evidence

- Final layout deployment: `78fda2e32`, October 21 at 03:25:19 UTC; previous copy deployment `199075e1e`. Production optimization was checked separately from the initial publish receipt.
- **124/124 Node tests passed.** All 13 shared Framer code files passed Framer typechecking before application.
- Production simple-discovery, visual taxonomy/details and Florida courses/services/form checks passed at **1440, 390 and 320 pixels**. No horizontal overflow or browser runtime errors in those flows. The first directory card appears at approximately 585/645/647 pixels respectively.
- **Nine location checks passed**: three responsive success flows, denial, timeout, unavailable API response, unsupported API, outside-coverage fallback and a late result after manual input. Production browser permissions/coordinates were controlled fixtures, not a real user's position.
- Full CMS fields/items were compared with the private starting backup; all five collections and their statuses were preserved.
- Latest read-only Insights workflow `39538193534` succeeded as a diagnostic but returned `permission_required` for `instagram_manage_insights`; missing data is not represented as zero engagement.
- Reviewed production screenshots and SHA-256 checksums: `previews/location-community/reviewed-previews.json`. Earlier failed/local captures were moved into private storage, not labeled production previews.
