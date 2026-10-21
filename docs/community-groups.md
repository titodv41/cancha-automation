# Cancha community groups

Prepared October 21, 2026. The existing `/stories` URL remains Community. It now has a branded community introduction, an **Add your group** button, links to the existing Miami/Orlando pickup organizer profiles, and the existing three CMS guides with their search and category controls. It adds no CMS collection.

## Current state

No Cancha-owned WhatsApp group has been created. No external group invite has been provided or approved. The page therefore shows a group submission invitation, not invented city groups or inactive Join buttons. GoodRec profiles are independent pickup booking organizers, not WhatsApp groups or partners.

The Add your group link opens the existing native Framer organization form and selects **Pickup group or community**. Email delivery remains private through the owner's existing Framer configuration. Submitting does not create a public listing. An organizer can put the invite URL in the official link field and give the city, adult age policy, usual playing area and group description in the existing fields. Contact emails never enter the public group projection.

## Create the first Cancha group

Start with one group in an area the founder can actively support. Suggested first name: **Cancha | South Florida pickup**. Split into separate city groups when actual activity justifies it; several empty groups will make the community less useful.

The owner must do this in their WhatsApp account; this workspace has no WhatsApp group administration connection.

1. Open WhatsApp → New group. Add a co-admin who has agreed to participate, enter the name above, and use Cancha's actual logo.
2. Paste the description below. In Group permissions, let members send messages; restrict editing group details to admins. Enable approval of new participants if that control is available in the owner's version.
3. Open Group info → Invite via link → Copy link. Share that invite with Codex **only when ready to list it publicly**, together with the actual city/area covered and confirmation that this is an adult group.
4. Codex checks the invite and public description, adds the approved record, previews it and publishes the website. A Join group button can then open WhatsApp directly.

Suggested description:

> Adult pickup soccer around South Florida. Share the city, pitch, date, time, level and any cost when organizing a game. Confirm field access and booking with the organizer. Be respectful. No unsolicited DMs, spam or promotions. 18+.

Suggested first pinned message:

> Welcome to Cancha. What city do you play in, and what days usually work for you? When sharing a game, include the location, time, level, cost and how players should confirm a spot.

WhatsApp group members can see one another's phone numbers. The website explains that next to actual join links. Cancha should never export member numbers or automatically send group messages, add people or post promotions. Such actions need a separate, specific owner instruction and an appropriate connection.

## Maintain the directory

Reviewed records live in `config/community-groups.json`; pending private submissions are not copied there automatically. Set `status: "Approved"`, `adminPermission: true`, `minimumAge: 18` and a recent `reviewedOn` only after checking those facts. Public fields are `id`, `name`, `city`, `description`, `inviteUrl`, `minimumAge`, and `reviewedOn`.

`node scripts/prepare-community-groups.mjs` validates the records and updates the public constant in `framer/CanchaCommunity.tsx`. It rejects lookalike invitation hosts, duplicate invites, missing permission and reviews older than 90 days. It never publishes to Framer. Follow the normal fresh-backup, apply, visual review and guarded publication process afterward. Adding groups also requires replacing the empty-state browser assertion with checks for the actual reviewed groups.

City filters appear when approved groups exist. Remove or mark a group Archived when an admin withdraws permission or the invite stops working. Revoke/reset the invite in WhatsApp as well if the owner wants the old URL to stop accepting joins. Youth/family groups need a separate reviewed guardian and moderation policy before extending the initial adult-only directory.

## Typography and preservation

Community uses Cancha's existing Barlow Condensed italic display face. Barlow 500/600/700 now supplies supporting text and controls throughout the shared website UI. Legacy Framer paragraph layers that represent headings receive the display treatment instead of the generic body override. This includes the old native guide titles; real guide/CMS bindings remain native.

The original Community hero is retained but hidden on both breakpoints, so its content can be recovered. The native guide filter and CMS card trees, all five collections and native form scenes are unchanged. Licensed font provenance is in `config/discovery-fonts.json`; the community photo is a dated Orlando City archive image, with source/license in the existing footer credits.

## Verified release

Published deployment `295e5c9d7` on October 21, 2026 at 18:02 UTC; Framer reports it optimized, with no pending changes. The fresh backup and final comparison confirm all 461 CMS records/field definitions and the organization/provider/offer native form scenes are unchanged. No collection migration, paid plan or domain purchase was performed.

143 Node tests and 14 Framer code-file typechecks passed. Live checks at 1440, 390 and 320 pixels cover the display/body font assets, CTA contrast, native guide search/reset, the preselected group request type, private recipient visibility, preserved routes and horizontal overflow. Existing home/media and discovery filter suites also passed across those widths. Final native previews wait for the actual article photograph and heading font before capture. Browser checks block outgoing POST requests and did not send a submission. See `previews/community-refresh/reviewed-previews.json` for the review manifest.
