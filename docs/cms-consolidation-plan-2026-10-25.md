# CMS consolidation plan: 5 collections → 2 (for Framer Basic)

Written October 25, 2026 by Claude. **Status: plan only. Nothing has changed in Framer.** The live backup in step 1 has not run yet: the read-only connection check fails from this environment (see "Blocker" below). Counts are from the October 21 backup recorded in `docs/domain-and-hosting-costs.md` and must be re-confirmed by the live backup.

Owner decision: Framer Basic yearly + `wearecancha.com`, purchased **only after** this migration is verified live.

## What exists today

| Collection | Items (Oct 21) | Template route (scene) | Writes to it |
| --- | --- | --- | --- |
| Clubs (keep) | 360 (≈385 now) | `/clubs/:slug` (`nYqllTBEd`) | club discovery, profile tools |
| Opportunities (keep) | 96 | `/opportunities/:slug` (`IeTr8B53a`) | daily-opportunities workflow |
| Providers | 2 | `/providers/:slug` (`zH7u0krA3`) | `apply-florida-reviewed-batch.mjs`, `publish-launch.mjs`, `publish-player-discovery.mjs --include-reviewed-cms`, `audit-discovery-images.mjs` |
| Stories | 3 | `/stories/:slug` (`NXTOKTcYh`) | `publish-friday-guides.mjs`, `polish-friday.mjs` |
| Offers | 0 | `/offers/:slug` (`CPMsUZAOT`) | `hide-expired-offers.mjs`, `publish-launch.mjs` |

Forms are **not** tied to these collections: provider/offer/opportunity submissions go to `server/submissions.mjs` (`/intake/provider`, `/intake/offer`, `/providers/webhook`, `/offers/webhook`) and private storage. Removing collections does not touch form destinations, as long as the pages that host the forms keep their form components.

Known inbound URLs to preserve: `/providers`, `/offers`, `/stories`, the 3 `/stories/<slug>` guides (Community page links to all three), `/providers/my-personal-football-coach` (used in `config/home-resource-media.json`) and the second provider page.

## The plan

1. **Live backup (read-only).** Snapshot every collection (fields + items), all code files, scenes/templates and the release contract into `backups/cms-consolidation-<timestamp>/`, mode 0600, the same way `publish-home-updates.mjs` does. Record exact item counts and every slug.
2. **Repo data.** Add `content/directory/providers.json`, `content/directory/stories.json`, `content/directory/offers.json` (offers starts empty), each record keeping its slug, every field, image URLs and source evidence. Render them through a generated code module, like `CanchaDiscoveryData.tsx` already does for pickup groups, so nothing new is stored in the CMS.
3. **Keep every URL.** Basic cannot hold wildcard routes without a collection, so each existing item becomes a static page at the **same path** (`/stories/<slug>` ×3, `/providers/<slug>` ×2) using one shared detail component. Listing pages `/providers`, `/offers`, `/stories` read the repo data. `/offers` shows the existing empty state.
4. **Re-point the writers.** `publish-friday-guides.mjs`, `apply-florida-reviewed-batch.mjs`, `hide-expired-offers.mjs`, `publish-launch.mjs`, `publish-player-discovery.mjs` and `audit-discovery-images.mjs` read/write the repo files instead of the CMS (Providers/Offers become reviewed PR edits). Update `config/discovery-release-contract.json` for the new pages/components.
5. **Verify before deleting anything.** Publish with the 5 collections still present. Then check with the existing Playwright verifiers (`verify-community-page.mjs` already visits `/providers`, `/offers` and a story) that every preserved URL returns the same title, copy and images, that forms still submit, and there is no mobile overflow.
6. **Delete the 3 collections and their templates**, publish, run the same verification again, and only then buy Basic + the domain.

Rollback: until step 6, nothing is lost (the collections still exist). After step 6, the backup from step 1 re-creates them.

## Things you should decide or know before I start

- **New guides become a manual page each.** Today a Friday guide is one CMS item. Without a Stories collection, each new `/stories/<slug>` needs a new static page. My recommendation: keep the 3 existing URLs as static pages, and publish **new** guides as sections of `/stories` (`/stories#<slug>`) from repo data. That keeps the weekly workflow automatic. Say if you'd rather pay the per-page cost.
- **Basic's page limit.** Step 3 adds 5 static pages and removes 3 templates. Confirm Basic's page allowance on framer.com/pricing before buying. I have not verified it.
- **Item limit is the real long-term constraint, not collections.** Clubs + Opportunities are ≈480 of 1,000 items. Club discovery adds up to 50 profiles per run, so roughly 10 full-size runs would fill Basic. I'll add a guard that stops imports at 900 items, and closed opportunities should be archived to repo data rather than kept in the CMS. If the directory is meant to pass ~900 profiles this winter, Pro ($360/yr) is the honest answer and this migration is wasted work.
- **Ownership.** `CLAUDE.md` assigns the CMS and publishing scripts to Codex. Your trial hand-over covers this, but I'll still ship it as one PR so the changes stay reviewable.

## Blocker: Framer connection from this environment

`npm run check:connection` → `MISSING_CREDENTIAL`: `FRAMER_API_KEY` is not set as a variable in this container. The secret is applied by the network proxy for `api.framer.com`. With a placeholder value so the proxy can supply the real key, the check returns `CONNECTION_FAILED`. The Framer SDK needs a WebSocket (`wss://api.framer.com/channel/headless-plugin`). Plain HTTPS reaches Framer's server, but the WebSocket handshake gets a CloudFront 404 with or without auth. Either the proxy does not pass WebSocket upgrades, or it does not inject the key in Framer's `Authorization: Token <key>` format. This blocks the backup (step 1) and `publish-home-updates.mjs`.
