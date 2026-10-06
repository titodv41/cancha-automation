# Cancha: providers, offers, stories and Instagram

Prepared October 5, 2026 (America/New_York). The user published the previous website changes. The next sections described here are saved in **Framer's unpublished draft**. No Instagram post was scheduled or published.

## What is built

- `/providers`, navigation **Find Support**: six service categories, category/delivery/location/language/age-group filtering, CMS cards, provider detail route, and private submission form preparation. The public Providers collection has zero records.
- `/offers`: separate merchant offers collection, terms/code/region/expiry/redemption/disclosure detail fields and a private offer form. Zero offers or discounts were invented.
- `/stories`: a CMS editorial section and detail route. Three original guide drafts are saved in the CMS with Draft status and the item's Draft flag enabled. Homepage story placeholders are hidden and replaced by an approved-only CMS section and an honest coming-soon state.
- Shared navigation/footer links, including usable mobile navigation, preserve Cancha's branding and typography.
- Provider/offer forms are locked with the existing submission override, disabled visible button and hidden native submit button. Their private receiver paths are prepared; contact information never appears in the public collections.

The guide mentioned `cancha_provider_offer_schema.json`, which was not among the uploaded files. The collections follow the field descriptions in the supplied implementation guide. Its statements that Canva/Metricool were available were treated as historical context; no current scheduling connector or logged-in social account was available here.

Provider qualifications are supplied information, not automatic endorsements. Credentials Reviewed defaults to false. Interview Consent Recorded defaults to false. Private review stores reviewer identity, timestamp and notes. Publish only real approved profiles; preserve private contact names/emails and review evidence in the private queue. Public Image Treatment is Badge or Photo and Image Background is Light or Dark; reviewers choose based on the submitted asset.

Offers have a tested date-only expiry rule: valid through the end of their New York expiry day. `npm run offers:check` is read-only; `node scripts/hide-expired-offers.mjs --apply` marks expired Approved offers Hidden in the Framer draft. It does not publish the website. No expiry worker has been deployed. Verify the merchant terms and Sponsored/Affiliate disclosure before approval; unknown expiry is not a claim of permanent availability.

## Review the writing and designs

Original editorial drafts:

- [Five questions before you register](../content/stories/questions-before-you-register.md)
- [Choose support that fits your next step](../content/stories/choosing-support.md)
- [Your next role in soccer can be beyond the pitch](../content/stories/careers-beyond-the-pitch.md)

These are practical editorial advice, not fabricated interviews or scholarship/job guarantees. For a real athlete or coach feature, collect permission and an actual interview first. In Framer, review the draft, choose Approved status, and disable the item's Draft flag only when it is ready to appear. The user controls the website's publication.

[Six Instagram designs and captions](../content/instagram/review.md) include four 1080×1350 JPEG feed designs and two 1080×1920 JPEG Story designs. They use Cancha's actual wordmark, palette and Alumni Sans. All assets passed loading/font/dimension/overflow checks and are also hosted as immutable Framer image assets for eventual Meta fetching. They are not Instagram publications. The proposed cadence is three feed posts and two Stories per week; no dates were assigned.

## Updated automation setup

You subsequently reported completing the Page/Instagram link. The OAuth callback, encrypted storage, protected review dashboard and private ingestion are now implemented, with eight draft designs and twenty passing tests. Use [current deployment and authorization instructions](connect-meta-and-automation.md), which supersede the historical setup below. Real Meta authorization and private hosting remain outstanding. Opportunity posts get a live source-evidence check at approval and dispatch; changed, expired or blocked evidence stops publication.

## Original account setup reference

You confirmed access to @wearecancha but still need the connection. Use your own logged-in browser/phone:

1. In Instagram, confirm @wearecancha is a professional account. For automated Story publishing with this implementation, use **Business**, because the supported API Story path requires it.
2. Create or choose the Facebook Page you control for Cancha. On that Page, open **Settings → Linked accounts → Instagram → Connect account**, then sign in to the correct @wearecancha account. Instagram's **Edit profile → Page** can also be used to select/connect the Page. Interface labels can vary.
3. Open https://business.facebook.com/ and confirm Meta Business Suite can see both the Page and @wearecancha. Confirm the Instagram bio links to Cancha.
4. Review the six prepared designs and captions. Meta Business Suite's Planner can schedule approved content directly while custom automation is being connected. Do not schedule the provider announcement as a live-directory launch: it deliberately says the directory is still being built.

Enter passwords only in Instagram/Meta's own login screens. No social password, access token, Framer key or webhook secret belongs in chat.

## What the automation does

`server/instagram-queue.mjs` and `scripts/instagram.mjs` implement:

- Draft import into a private SQLite content queue, with no scheduled date.
- Explicit human approval plus a future UTC schedule and named reviewer.
- Approval tied to the caption, alt text, asset URL/checksum and design brief. Editing a draft clears approval and its schedule; importing identical content preserves its state.
- A freshness gate for opportunity promotion: official facts must be checked within 72 hours of the proposed publication and again within that window when dispatched.
- Meta container creation, readiness checking and publication at the approved time.
- No automatic retry of an uncertain publication: Needs reconciliation requires checking Instagram first, avoiding duplicate posts.
- Business-account gate for Stories. Poll/question/link stickers are not added by this API workflow; add them manually if desired.

Ten tests passed, including actual signed/private HTTP intake for opportunities, providers and offers, approval gates, content-edit invalidation, uncertain publish outcomes, stale/invalid fact dates and expiry boundaries across daylight saving time. The Meta network calls were tested with an injected fixture publisher, not a connected real account. Real Meta authentication/publication remains unverified.

Useful read-only/local commands:

```bash
npm test
npm run content:list
npm run content:due
npm run offers:check
PLAYWRIGHT_BROWSERS_PATH=/tmp/cancha-browsers npm run render:instagram
```

Regenerating designs alone does not approve them. `node scripts/upload-instagram-assets.mjs` uploads changed artwork and updates immutable asset URLs/checksums. `npm run content:import` imports those rows as drafts; material changes clear any approval. Do not rerun one-time Framer page-creation scripts as migrations.

An operator records approval only after you actually review the post. Example command structure, not an executed approval:

```bash
node scripts/instagram.mjs approve POST_ID "Actual reviewer name" FUTURE_UTC_TIMESTAMP
```

Use a complete ISO timestamp ending in Z. A future 6 PM New York slot is 22:00 UTC during daylight saving time and 23:00 UTC during standard time; use the applicable date rather than treating the offset as permanent.

## Turn on the hosted worker later

There is still no hosting account, so no continuous automation is running. Use the persistent private HTTPS service described in [private-submissions.md](private-submissions.md). The Docker definition includes the receiver, private reviewer and content worker. Import the prepared content on the private host; local ignored SQLite files are not automatically transferred to a new deployment.

For custom Meta automation, create/configure the appropriate Meta developer app and Facebook Login authorization for the Cancha Page and professional account. Follow the current official publishing requirements and any required app/access review. The current service implements the OAuth callback and encrypted Page-token storage through its Connect Instagram button. Use the current linked instructions instead of manually transferring Page tokens. Reconnection may be required; indefinite automatic renewal is not implemented. Never reuse the Framer or webhook key.

Configure the actual META_INSTAGRAM_ACCOUNT_ID, the app's currently supported META_GRAPH_VERSION, and META_INSTAGRAM_ACCOUNT_TYPE=BUSINESS. Do not copy fixture IDs or test API versions. Store CANCHA_CONTENT_DB=/data/instagram.sqlite on the private persistent disk. Keep ENABLE_INSTAGRAM_WORKER unset until account permissions, a consented test publication and the approval workflow have been verified.

When ready, ENABLE_INSTAGRAM_WORKER=1 starts a one-minute worker in the same service/disk as intake. The worker handles at most one due row per cycle. A manual operator can use `node scripts/instagram.mjs run --execute` instead; this is a real publishing command and is not part of validation. Do not start either with unapproved posts. Keep the queue, operator console and Meta token private. Monitor token validity and the account's API limits; no token is promised to last indefinitely.

No automated DMs, comments, outreach, invented engagement or provider endorsements are implemented. Real comments/messages can later become reply drafts, subject to review and platform permissions. Website click tracking, saves/shares and qualified submissions should guide the cadence once real account data is available. Do not add tracking parameters to signed registration URLs.

Official publishing specification consulted: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/content-publishing/

## Website validation and previews

The published site shows nine current cards. Search, empty results, all four existing filters, combined Tryout/South Florida filtering and Clear Filters worked. All nine current detail routes returned HTTP 200, had no broken images and exposed their correct official/employer registration URLs. Mobile Explore had no horizontal overflow at 390 pixels. These checks are recorded in `audit/published-functional-review.json`.

The new Framer sections were structurally inspected and captured on desktop/mobile; see `audit/growth-final-snapshots.json` and `audit/growth-preview-results.json`. Native collection-list canvas screenshots can show generic field-name card templates despite an empty/filtered collection; these are not real providers, offers or stories. Before publishing the new pages, use Framer Preview to confirm approved-only rendering, empty/filter states, submission scrolling, detail bindings and mobile layouts. The submission forms remain unavailable until the host is deployed.

| Draft preview | Desktop | Mobile |
|---|---|---|
| Providers | [Preview](../previews/providers-growth-desktop.png) | [Preview](../previews/providers-growth-mobile.png) |
| Offers | [Preview](../previews/offers-growth-desktop.png) | [Preview](../previews/offers-growth-mobile.png) |
| Stories | [Preview](../previews/stories-growth-desktop.png) | [Preview](../previews/stories-growth-mobile.png) |
| Homepage editorial section | [Preview](../previews/home-stories-desktop.png) | [Preview](../previews/home-stories-mobile.png) |

Remaining blockers are the social-account connection and authorization, private hosting, real provider/merchant submissions, editorial/content approval and unpublished runtime validation. No hosting plan, Meta app or paid Framer upgrade was purchased.

Framer’s final read-only publication readiness preview returned `ready`, with zero errors and zero warnings. No confirmation or publication was performed. This checks draft readiness, not rendered unpublished-page behavior or a deployed Meta connection.
