# CMS consolidation plan: 5 collections → 2 (for Framer Basic)

Written October 25, 2026 by Claude.

**Status (October 27, 2026): done and live.** The project has 2 CMS collections (Clubs, Opportunities) and 18 pages.
- **Preview:** run 40541478723 rendered 5/5 migrated items on a temporary page.
- **Cutover:** run 40543356672, finished by 40544145283, removed the Stories / Providers / Offers templates and collections. It replaced the three listing pages' CMS lists with `CanchaStaticPage` (intake forms kept) and published one static page per item at its exact old URL, with "| Cancha" titles.
- **Live checks:** every preserved URL and the main pages return 200, detail and listing content render, and `/offers` shows its empty state.
- **Restore point:** the encrypted backup taken right before the cutover.

The original plan follows.

**Original status (Oct 25): plan only. Nothing has changed in Framer.** The live backup in step 1 has not run yet: the read-only connection check fails from this environment (see "Blocker" below). Counts are from the October 21 backup recorded in `docs/domain-and-hosting-costs.md` and must be re-confirmed by the live backup.

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

1. **Live backup (read-only).** Ready as `npm run backup:cms-consolidation` (`scripts/backup-cms-consolidation.mjs`). Collections are saved as `collection-<id>.json`, so the backup also works as a reviewed baseline for `publish-player-discovery.mjs`. Snapshot every collection (fields + items), all code files, scenes/templates and the release contract into `backups/cms-consolidation-<timestamp>/`, mode 0600, the same way `publish-home-updates.mjs` does. Record exact item counts and every slug.
2. **Repo data.** Add `content/directory/providers.json`, `content/directory/stories.json`, `content/directory/offers.json` (offers starts empty), each record keeping its slug, every field, image URLs and source evidence. Render them through a generated code module, like `CanchaDiscoveryData.tsx` already does for pickup groups, so nothing new is stored in the CMS.
3. **Keep every URL.** Basic cannot hold wildcard routes without a collection, so each existing item becomes a static page at the **same path** (`/stories/<slug>` ×3, `/providers/<slug>` ×2) using one shared detail component. Listing pages `/providers`, `/offers`, `/stories` read the repo data. `/offers` shows the existing empty state.
4. **Re-point the writers.** *Scope check (Oct 25):* `publish-friday-guides.mjs` and `polish-friday.mjs` are locked to 2026-10-12, and `apply-florida-reviewed-batch.mjs` is locked to its batch date. `publish-launch.mjs` compares against the fixed `launch-2026-10-19` backup. None of them can run again without a fresh review, and no GitHub workflow touches Providers, Stories or Offers. The only live hooks are `npm run offers:check`, which is manual and covers 0 offers, and `audit-discovery-images.mjs`, which reads Providers. `publish-player-discovery.mjs` loops over whatever collections exist. The real work in this step is retiring the date-locked scripts, re-pointing the two live hooks, and the release contract. Guide bodies already live in `content/stories/*.md`. Planned changes: `publish-friday-guides.mjs`, `apply-florida-reviewed-batch.mjs`, `hide-expired-offers.mjs`, `publish-launch.mjs`, `publish-player-discovery.mjs` and `audit-discovery-images.mjs` read/write the repo files instead of the CMS (Providers/Offers become reviewed PR edits). Update `config/discovery-release-contract.json` for the new pages/components.
5. **Verify before deleting anything.** Publish with the 5 collections still present. Then check with the existing Playwright verifiers (`verify-community-page.mjs` already visits `/providers`, `/offers` and a story) that every preserved URL returns the same title, copy and images, that forms still submit, and there is no mobile overflow.
6. **Delete the 3 collections and their templates**, publish, run the same verification again, and only then buy Basic + the domain.

Rollback: until step 6, nothing is lost (the collections still exist). After step 6, the backup from step 1 re-creates them.

## Things you should decide or know before I start

- **New guides become a manual page each.** Today a Friday guide is one CMS item. Without a Stories collection, each new `/stories/<slug>` needs a new static page. My recommendation: keep the 3 existing URLs as static pages, and publish **new** guides as sections of `/stories` (`/stories#<slug>`) from repo data. That keeps the weekly workflow automatic. Say if you'd rather pay the per-page cost.
- **Basic's limits (checked on framer.com/pricing, Oct 25):** 30 pages, 2 CMS collections, 1,000 CMS items, 50 GB bandwidth, $10/month. Pro is 150 pages, 10 collections, 2,500 items, $30/month. Step 3 adds 5 static pages and removes 3 templates, so the site must end at 30 pages or fewer. `npm run backup:cms-consolidation` records the exact page count and the post-migration totals (`basicFit` in the manifest). If those totals go over a Basic limit, stop and choose Pro instead.
- **Item limit is the real long-term constraint, not collections.** Clubs + Opportunities are ≈480 of 1,000 items. Club discovery adds up to 50 profiles per run, so roughly 10 full-size runs would fill Basic. I'll add a guard that stops imports at 900 items, and closed opportunities should be archived to repo data rather than kept in the CMS. If the directory is meant to pass ~900 profiles this winter, Pro ($360/yr) is the honest answer and this migration is wasted work.
- **Ownership.** `CLAUDE.md` assigns the CMS and publishing scripts to Codex. Your trial hand-over covers this, but I'll still ship it as one PR so the changes stay reviewable.

## Blocker: Framer connection from this environment

`npm run check:connection` → `MISSING_CREDENTIAL`: `FRAMER_API_KEY` is not set as a variable in this container. The secret is applied by the network proxy for `api.framer.com`. With a placeholder value so the proxy can supply the real key, the check returns `CONNECTION_FAILED`. The Framer SDK needs a WebSocket (`wss://api.framer.com/channel/headless-plugin`). Plain HTTPS reaches Framer's server, but the WebSocket handshake gets a CloudFront 404 with or without auth. Either the proxy does not pass WebSocket upgrades, or it does not inject the key in Framer's `Authorization: Token <key>` format. This blocks the backup (step 1) and `publish-home-updates.mjs`.

### Update, October 25 (after the owner set the key)

`FRAMER_API_KEY` is now present in the container (30 characters). The read-only check still returns `CONNECTION_FAILED`. Probes, with no writes:

- WebSockets work through this proxy to other hosts: `wss://echo.websocket.org` and `wss://ws.postman-echo.com` both open.
- `wss://api.framer.com/channel/headless-plugin?projectId=…` returns an empty-body **404** in every case: real key, wrong key, no key, and a nonexistent project. The response carries Framer's own `Vary: Origin`/CORS headers. So Framer's server answers the request as a plain GET (its WebSocket route returns 404 to non-upgrade requests) before it ever checks the key or the project.
- `api.framer.com` is the only host set to **allow + inject credentials** in this environment. The likely cause is that the injection path re-issues the request and drops the `Upgrade: websocket` header.

**Fix to try (owner, environment settings):** set `api.framer.com` to plain allow instead of allow + inject, and keep `FRAMER_API_KEY` as an environment variable. The SDK then sends its own `Authorization: Token …` header through a normal tunnel, the same way the echo servers worked. A new session picks this up. Then run `npm run check:connection` and `npm run backup:cms-consolidation`.
