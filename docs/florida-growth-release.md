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

Approved employer boards now include [Orlando City SC / Orlando Pride](https://www.orlandocitysc.com/club/careers) and [Sporting JAX](https://www.sportingjax.com/careers/). Their official sites link to the registered TeamWork boards. Jobs still need one matching JobPosting identity, exact employer, posting ID, current metadata, a Florida location, explicit qualifications, identifying media and an exact application action. Orlando uses a reviewed employer-specific interest-expression route; other employers retain their existing action requirements. A follow-up employer application may be required.

## Keeping a larger catalog easy to browse

The homepage remains curated rather than listing every new record. Directory pagination/load-more, location search, age and level filters and separate career/course/service sections remain. Adult leagues and regional youth programs have explicit card labels. Provider-wide age evidence can exclude a 2–8-year-old introductory program from a 14-year-old's filtered results without narrowing an ordinary multi-program club to one class.

Small text and controls use the device's UI font; Cancha's athletic headline identity remains. The boxed badge carousel is a compact logo rail with real profile links. Manual controls, pause/resume, focus/hover pause, offscreen pause and reduced-motion support remain. Green, cream and lime surfaces are reused rather than adding another accent palette. No extra homepage cards or promotional carousels were added.

## Scope and remaining limits

The native email submission forms and private recipients remain unchanged. No live form was submitted by automated tests. Source membership and a logo do not establish an open opportunity, partnership, credential or paid-ad right. The daily Instagram plan is separate; this release does not claim any new Instagram publication or performance learning.

For the actual domain/hosting options and CMS-plan constraint, see [domain and hosting costs](domain-and-hosting-costs.md). No paid plan or domain was purchased.

Production counts, deployment and responsive checks will be recorded after the hosted daily preparation completes.
