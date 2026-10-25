# Growth, content and monetization direction — October 25, 2026

Owner decisions on Oct 25: Framer **Basic** plus the CMS migration (Claude runs it end to end; the owner buys only after it is verified live). Start planning monetization. Make content more engaging by learning from what works elsewhere. Claude leads; these are working bets to test against Instagram Insights and site analytics, not proven results.

## Priority order for daily runs

1. **CMS migration to fit Basic** (`docs/cms-consolidation-plan-2026-10-25.md`): the encrypted backup is done. Next: repo data and static pages for Providers/Stories/Offers at the same URLs, re-point the live hooks, verify, then delete the three collections. Tell the owner when to buy Basic and the domain (yearly includes a domain). Each step is reversible until deletion.
2. **Daily "date drop" Reel plus a weekly "open now" carousel**, built from live opportunities with real dates and official links. No narration needed (voice allowance stays for one strong story a week).
3. **Measure**: two weeks of Insights by format (date-drop Reel, open-now carousel, club guide, narrated story), then shift the mix toward what earns saves and shares.

## Content blueprint (what the evidence supports)

- Carousels earn roughly 9× the saves of single images; Reels drive discovery, with average watch time around 8.5 s ([Metricool 2026 study](https://www.socialmediatoday.com/press-release/20260615-metricools-2026-instagram-study-reveals-reels-and-carousels-are-reshaping-1/), [Socialinsider 2026 benchmarks](https://www.socialinsider.io/instagram-benchmarks)). Accounts under 10k followers still have the most room to grow.
- So: short Reels (8–12 s) with one idea per beat and a hook in the first second for reach; carousels with something worth saving (dates, prices, checklists) for depth.
- Formats to build next, in order: date drops by region and age; "this weekend in Florida soccer" fixtures; club spotlights using the club's own media (needs the club's permission, which is outreach and goes through the owner); before-you-sign-up checklists.
- Rotate three layouts (full-bleed photo, color block, checklist). Never repeat a photo inside one post. Add a royalty-free music track to Reels, because the API cannot attach trending sounds.

## Monetization path (only after real traffic)

Revenue follows audience. Until the site and account show steady traffic, the job is audience, not sales.

1. **Owned audience first:** a free weekly "Florida soccer this week" email (camps, tryouts, tournaments). It is the asset every later model sells against. Needs an email tool (owner decision if paid).
2. **Featured club and camp listings:** SoccerWire charges leagues $99 / $299 / $399 one-time listing tiers ([pricing](https://www.soccerwire.com/soccerwire-com-directory-pricing/)). Cancha's Clubs collection already has `Sponsored`, `Placement Priority` and `Placement Until` fields. Clearly labeled, time-boxed featured placement during tryout season is the most natural first product.
3. **Sponsored posts and email slots** for camps, tournaments and showcases. They already pay to fill spots. Always labeled as sponsored.
4. **Later:** commission or lead fees per registration (a marketplace model like [Kampoos](https://gust.com/companies/kampoos)) and advertising once traffic is large, as SportsEngine planned for its free directory ([announcement](https://corporate.comcast.com/news-information/news-feed/sportsengine-launches-north-americas-largest-youth-sports-directory-to-serve-parents-and-youth-athletes)).

No affiliate program was found for the main camp-registration platform (Ryzer, acquired by Scorability in 2025); don't assume one.

Selling to clubs is outreach and pricing is a spending/business commitment: Claude prepares offers and pages; the owner approves and sends.

## Owner decisions, Oct 25 (later): engagement and auto-replies

The owner wants as much automation as is safe.

- **Morning engagement pack (approved).** Each daily status includes 5–10 relevant Florida club, coach or parent accounts with fresh posts, a ready-to-paste specific comment for each, and 2–3 DM drafts asking clubs for info to feature. **The owner sends them by hand**; Claude never auto-comments, cold-DMs or mass-tags, because Instagram bans that automation and it risks the account. Source accounts from official Instagram links already in Cancha's CMS (clubs, opportunities). Read their recent public posts through the Graph API's Business Discovery on the existing connection. No scraping, logins or third-party bots.
- **Auto-replies (approved).** Reply automatically to comments on our own posts and to DMs people send us first (link requests, "how do I list my club", and so on), using approved templates with real links. No cold messages. This needs Meta permissions beyond the current five grants (comment and message management). Meta may also require App Review or Advanced Access before replies reach the public, which is owner consent: verify that before promising a date.
- **Tag organizers in every post** (photo/user tags plus a caption mention) and offer collab posts when a club agrees. Clubs reposting is the main free reach lever.
- **"Get featured" form** linked from the bio: inbound club and coach info for posts, held for review like other submissions.
