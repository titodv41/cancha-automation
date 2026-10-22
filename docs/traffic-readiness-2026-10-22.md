# Cancha: traffic and platform decision

Reviewed October 22, 2026, using the live Framer project, public HTML, Framer's official pricing and the latest available private GitHub reports. No website, Instagram account, publishing plan, hosting subscription or ad campaign was changed during this review.

## Recommendation

Keep Framer for the next launch and audience-validation stage. The existing discovery experience, profile URLs, email forms and publishing automation already work. Framer serves the website through a CDN; GitHub's publishing workflows do not run once per visitor. A full rebuild would delay learning from actual players, families and clubs.

Do not treat Framer as the permanent database/search/booking architecture. Before substantially expanding the catalog, change how discovery loads data. Later, if repeat use justifies accounts, saved clubs, session capacity, payments and organizer tools, put those functions in a dedicated web application/backend. Framer can remain a marketing frontend if useful. A native phone app is not a launch requirement.

## What the current evidence establishes

- The fresh CMS read contains **360 club/place/program/organizer profiles and 96 opportunity records**. Public discovery includes **53 play listings and 21 careers**. Five collections contain 461 stored records in total. A directory profile is not an open-registration claim.
- The live deployment is optimized. Homepage and Hollywood FC profile HTML contain the actual H1 text, relevant title/description and canonical URL before browser JavaScript executes. The sitemap lists 472 URLs, including all 360 club profiles and 96 retained opportunity URLs; robots.txt permits crawling. These examples have a useful indexing foundation; this does not establish Google indexing or rankings for the whole catalog.
- The fresh 14-day website report has **89 homepage pageviews, 36 directory pageviews and one organization-form submission**. Counts can include owner/QA activity and are not unique external users or confirmed customers. There are **no campaign-tagged rows in that baseline**. The owner's confirmation that a website is in the bio does not establish that the tracked URL is in use.
- The latest usable publishing artifact, run `39702091262`, confirms the plan enabled, **six publication receipts**, the October 21 scheduled post published, and no uncertain publication. A green workflow alone is not proof it performed an action; later scheduled runs without an action produced no status artifact.
- The October 21 read-only learning report, run `39674037885`, still reports **`permission_required: instagram_manage_insights`**. It contains no usable performance comparison. Publishing works; performance learning remains blocked.
- Large unattended inventory growth is not currently working at the requested volume. The latest preparation added zero profiles; the approved club sources have one held candidate remaining, and all five employer boards returned HTTP 403 to the GitHub runner. New approved sources/adapters and source enrichment are required. Do not advertise a guaranteed 50 new listings per day.

## Capacity, costs and migration triggers

Official [Framer pricing](https://www.framer.com/pricing) checked October 22 lists:

| Plan | Annual-billing equivalent | Monthly billing | Collections / items | Listed monthly bandwidth |
| --- | --- | --- | --- | --- |
| Basic | $10/month; $120 upfront/year | $15/month | 2 / 1,000 | 50 GB |
| Pro | $30/month; $360 upfront/year | $45/month | 10 / 2,500 | 100 GB |

Prices are USD before tax. Pro supports the current five-collection structure and a custom domain without a collection migration. Basic requires the separate data/template migration described in [domain-and-hosting-costs.md](domain-and-hosting-costs.md). Paid-plan limits can expand with add-ons, but compare their actual costs before choosing them. No purchase was made. The actual billing plan and monthly bandwidth usage were not available from the project read used here; listed plan capacity is not measured usage.

The more immediate application constraint is our **569,911-byte public catalog module** against the existing **950,000-byte publishing guard**. It is about 60% of that budget. Discovery currently renders cards in batches but downloads the whole catalog, including detail data. That file-size limit is separate from Framer's CMS item limit and from traffic capacity. An increased CMS allowance alone will not fix it.

Before the module approaches 80% of its budget, implement regional/per-profile data loading or public search backed by a suitable data store, preserving URLs and excluding private submissions/contact fields. Choose the simplest design that fits the observed catalog and demand. Investigate mobile page weight, image sizing, caching and search responsiveness with real-user measurements. No concurrent-user load test or new field-performance benchmark was performed in this review. The October 21 mobile functional checks remain the most recent browser suite; the browser binary was unavailable for a fresh workspace rerun.

Consider a broader migration when catalog/search constraints, actual paid-plan/add-on costs or repeatedly requested account/booking features justify it. Preserve URLs, redirects, source evidence, native form delivery and automated publication during any migration. Do not choose a framework merely because traffic is expected to grow.

## The next traffic experiment

Start with two useful local journeys, retaining statewide discovery:

1. **Orlando youth clubs:** the prepared view currently matches 27 directory profiles. Leave playing level optional; the narrower youth + recreational + clubs combination matches only two profiles, so it is not yet a strong broad beginner campaign destination.
2. **Miami adult teams:** the prepared view currently matches 18 directory profiles. Club/league profiles do not establish an open roster or an upcoming tryout.

The exact tracked URLs and reviewed filter counts are in [traffic-pilot-links.json](../content/growth/traffic-pilot-links.json). They are prepared destinations, not activated advertisements. Counts were checked with the same discovery/filter model as the app. Users should still choose the right age/level and confirm availability with the organizer.

For the next two weeks, use the existing daily feed cadence and prepare a varied weekly mix: useful city guides, actual club/player features, community recommendations and two or three real short videos when footage is available. Videos replace feed slots rather than silently increasing the daily quota. Do not repeat one picture or fill the schedule with generic questions. Reels/Stories are not automated by the current pipeline; their production, publishing and link handling need a separate implementation or initial manual posting.

Ask willing clubs/coaches to supply permission-cleared clips and take part in a genuine collaboration post. Invite public club/group submissions through the existing form. The founder handles introductions and permitted participation in local Facebook/WhatsApp communities; Codex can prepare tailored, unsent resources and replies. Do not claim partnerships, existing Cancha games or WhatsApp membership that do not exist. The first Cancha group still needs owner creation in WhatsApp.

Every piece should have one useful destination/action: browse a relevant local view, open the featured profile, compare programs or submit a real group. Use the tracked directory URL in the bio; feed-caption links are not clickable. Campaign-specific links can be used in suitable clickable placements. Do not force all audiences onto an unfiltered promotional homepage.

Measure the funnel from reach and saves/shares through tagged visits, searches, profile opens and official-site clicks. Classify organizer-link clicks separately before calling them enquiries; current native recorded-click totals include navigation. Completed external registrations and revenue are not observable merely from an outbound click. Label/exclude QA activity and do not name a winning topic from tiny samples.

Set up the chosen custom domain, verify Google Search Console and submit the existing sitemap. Build useful, indexable city guides with distinct content and current profiles; do not mass-produce thin age/city keyword pages. Initial success is real people finding a relevant option and returning or recommending Cancha. Establish that before scaling acquisition spend.

Paid promotion can follow with a specific objective, a real destination, advertising-cleared creative and an owner-approved cap. An illustrative first test is $5–10/day for seven days ($35–70 total), not a forecast or activated budget. Stop to diagnose weak results; avoid buying followers or using reach as proof of club registrations. Attribution should work before buying traffic.

## Division of work

**Codex:** source research and listing enrichment; campaign concepts/copy/design; supported daily feed publishing; tagged landing links; technical data-loading improvements; measured weekly reports once insights access works. Preserve the current identity rather than repeatedly redesigning it.

**Founder:** provide real local footage or introductions to clubs/coaches; complete the one-time secure [Instagram Insights permission update](instagram-insights-connection.md); choose/buy the domain/plan if desired; create the first WhatsApp group; approve any actual advertising spend or external outreach.

First concrete task: finish measurement setup and review the two prepared local journeys with a handful of real players/parents. Then produce one genuinely local week of creative and distribute it with willing clubs. Keep a weekly record of what brought useful visits and what visitors actually did.
