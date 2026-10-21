# Florida directory growth and restrained UI polish

Work dated October 21, 2026. This continues the existing prototype, routes, forms and owner-authorized daily publication workflow. It does not claim complete Florida coverage or a guaranteed number of new records every day.

## Repeatable source expansion

The daily club-discovery runner now checks three more official sources in addition to FYSA and UPSL:

- [Florida Adult Soccer Association member leagues](https://www.fasa.soccer/find-a-league), with the league's own identity-checked website. Expired domain-sale pages, unrelated sites, ambiguous locations and existing organizations are excluded.
- [Soccer Shots' official locator](https://www.soccershots.com/find-a-location/), grouped into distinct Florida regional programs. Hundreds of school/childcare class-location entries are **not** inflated into separate clubs or public parks. The city is explicitly a service-area reference. Local class access, ages, dates and spaces require the provider's confirmation. Conflicting Miami/Broward locator territories are excluded.
- [City of Orlando rentable soccer fields](https://www.orlando.gov/Parks-the-Environment/Reserve-an-Athletic-Field/Rentable-Soccer-Fields-in-Orlando), restricted to the City's soccer-specific directory and matching official park pages. A field profile is not a scheduled pickup game or permission for walk-on access.

Parsers have source-shape guards, mapped Florida cities/counties, official-page identity checks, duplicate checks and private backups. Existing club items must remain byte-for-byte unchanged after an addition. Full CMS snapshots are compressed before authenticated encryption to stay within GitHub’s file limit. The recorded SHA-256 is checked on restore, and older uncompressed encrypted snapshots remain readable through `githubStateClient.loadBackup(ref)`. The private backup is acknowledged before CMS mutation; this does not drop fields, split away records or store plaintext in GitHub. Media is an identifying badge or an attributed city-area map, never an invented official logo or an exact-venue claim.

The club limit is now **up to 50 qualified new profiles per run**. This is a cap, not a quota or a promise. Once supported directories are exhausted, another source or adapter is needed for further growth. Re-importing existing clubs does not increase the database.

## Careers

Approved employer boards now include [Orlando City SC / Orlando Pride](https://www.orlandocitysc.com/club/careers) and [Sporting JAX](https://www.sportingjax.com/careers/). Their official sites link to the registered TeamWork boards. Jobs still need one matching JobPosting identity, exact employer, posting ID, current metadata, a Florida location, explicit qualifications, identifying media and an exact application action. Orlando uses a reviewed employer-specific interest-expression route; other employers retain their existing action requirements. A follow-up employer application may be required. Nine exact public employer URLs found during this review are also temporary discovery seeds, expiring October 28. They still need live checks; they do not bypass dates, identity, application or availability rules. Already-known posting IDs are never recreated or reactivated by a seed. Supported employer candidates are checked before unsupported search leads, and approved job links are not discarded merely because a role title contains “security.”

## Keeping a larger catalog easy to browse

The homepage remains curated rather than listing every new record. Directory pagination/load-more, location search, age and level filters and separate career/course/service sections remain. Adult leagues and regional youth programs have explicit card labels. Provider-wide age evidence can exclude a 2–8-year-old introductory program from a 14-year-old's filtered results without narrowing an ordinary multi-program club to one class.

Small text and controls use the device's UI font; Cancha's athletic headline identity remains. The boxed badge carousel is a compact logo rail with real profile links. Manual controls, pause/resume, focus/hover pause, offscreen pause and reduced-motion support remain. Green, cream and lime surfaces are reused rather than adding another accent palette. No extra homepage cards or promotional carousels were added.

## Scope and remaining limits

The native email submission forms and private recipients remain unchanged. No live form was submitted by automated tests. Source membership and a logo do not establish an open opportunity, partnership, credential or paid-ad right. The daily Instagram plan is separate; this release does not claim any new Instagram publication or performance learning.

For the actual domain/hosting options and CMS-plan constraint, see [domain and hosting costs](domain-and-hosting-costs.md). No paid plan or domain was purchased.

## Hosted source restriction

GitHub preparation [39554918223](https://github.com/titodv41/cancha-automation/actions/runs/39554918223) confirmed that all five approved TeamWork employer boards return **HTTP 403 to GitHub Actions**, including the two new employers. Exact posting seeds were also unavailable there. The same public pages load through this managed workspace's configured network. No login, CAPTCHA workaround or TLS bypass was used. Unattended career additions are therefore blocked in that runner; the daily result now explicitly lists unavailable employer boards rather than treating club-import success as job-source success.

The 29 directory additions were separately confirmed in hosted preparation [39554088688](https://github.com/titodv41/cancha-automation/actions/runs/39554088688). The full original 331 club records and all other collections remained unchanged at that point. The encrypted full Clubs backup was acknowledged before mutation. A prior run stopped before adding clubs because of the backup size limit; compression and lossless restore checks resolved it.

Nine additional Orlando/Sporting JAX jobs were checked through this workspace and staged with a fresh local private snapshot and a second exact source-fact comparison. The workspace also confirmed four older job postings explicitly closed, including the older fan-ambassador role. These are marked Closed with their URLs preserved; uncertain or merely blocked listings are not demoted. Their production publication is confirmed below; local source access does not establish that GitHub can fetch them tomorrow.

## Verified production result

Deployment **d4c3e2141**, October 21, 2026 at **06:48:17 UTC**. Framer subsequently confirmed production optimization; no pending changes remained. This includes the final selected-category contrast fix.

- **360 directory profiles:** 332 clubs/team profiles, adult leagues and regional programs; 26 venues; two pickup organizers. This is not a claim of 360 separate clubs or complete Florida coverage.
- **29 new profiles:** four adult leagues, 16 regional Soccer Shots programs and nine City of Orlando soccer-field locations. All original 331 directory records are unchanged, including their slugs and existing media.
- **96 opportunity records:** 74 Active (53 play listings and 21 careers), six Pending review, 14 Expired and two Archived. Nine new employer jobs were added. Four older exact employer postings explicitly closed and were marked Expired; two existing jobs had their source-review status/date refreshed. No record was deleted and no slug changed. The six Pending records were not activated.
- All 20 new league/program profiles have decoded identifying marks. The nine new venues use attributed city-area maps. Across the directory, 222 profiles have identifying images; 112 use full-name typographic identities and 26 use maps. These are not all official photographs or logos. All 74 Active opportunity cards have images.
- The daily recheck now uses the same structured source parser and evidence hash as initial job preparation. A previously missing recheck helper was fixed. Recent automatic source labels require the posting identity and source hash; an Active flag alone does not establish a source check.
- Providers (two), Stories (three), Offers (zero), all collection fields, native form destinations and native page content are preserved. Automated browser tests send no forms; the owner had already confirmed real email delivery.
- **139 Node tests** and **13 Framer typechecks** passed. Production search/filter/navigation checks passed at 1440, 390 and 320 pixels, with no runtime errors or horizontal overflow. Initial directory cards remain at approximately 577/637/639 pixels. New program age/level projection, exact official links, identifying media, regional program and adult-league labels, venue-map attribution and closed-career routes were checked. The selected category has readable text contrast.

The private initial baseline is `backups/growth-polish-2026-10-21`; the final reviewed baseline is `backups/growth-reviewed-2026-10-21`. The [preview manifest](../previews/growth-polish/reviewed-previews.json) records production checks and screenshot hashes. See [desktop home](../previews/growth-polish/expansion/home-desktop.png), [mobile home](../previews/growth-polish/expansion/home-mobile.png), [youth discovery](../previews/growth-polish/expansion/youth-programs-desktop.png) and [new venue detail](../previews/growth-polish/expansion/new-venue-mobile.png).

The unattended job-source restriction remains. Club imports work through GitHub, but the supported directories are finite: a cap of 50 does not establish 50 fresh clubs every day. More source-specific coverage work is needed as these directories are exhausted. No new Instagram post, Insights permission, domain or paid subscription is claimed by this release.
