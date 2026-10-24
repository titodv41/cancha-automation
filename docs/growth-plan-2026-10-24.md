# Cancha growth plan: from zero real audience to first 1,000 visitors

Written October 24, 2026 by Claude (design and growth lead) after a live mobile/desktop audit and the owner's note that **current Instagram followers are mostly bots and the site gets almost no real traffic**.

## The honest diagnosis

Cancha does not have a design problem first. It has a **distribution problem**. The site works, the directory is real (385 profiles), and the daily content pipeline runs. But nobody real is being invited in. More AI tools, more automated posts and more polish will not change that on their own. Every channel below starts with a human message from the owner.

Bot followers actively hurt. Instagram first shows posts to a slice of existing followers. Bots don't engage, so each post looks unpopular and gets less reach. Remove obvious bot accounts in batches (Followers → filter → remove), roughly 50–100 a day so the account isn't flagged.

## Spending decision: domain and Framer plan

| Option | Year-one cost | What it needs |
| --- | --- | --- |
| **Recommended: Framer Basic, billed yearly + `wearecancha.com`** | about **$120** (domain free for year one through Framer's yearly offer, if the name qualifies) | Codex consolidates Providers / Stories / Offers out of the CMS so only Clubs + Opportunities remain (Basic allows 2 collections, 1,000 items; today ~490 items) |
| Framer Pro, billed yearly | about **$360** + domain | Nothing; current 5-collection structure fits |
| Stay free | $0 | Keeps the `framer.app` address and the "Made in Framer" badge, which costs trust on every link you share |

Recommendation: **Basic yearly after consolidation.** $240 a year is real money while traffic is near zero. Pro becomes worth it only when the directory nears 1,000 items or needs more collections. Expired opportunities should be archived out of the CMS to stay under the cap.

**Domain:** `wearecancha.com` was unregistered when checked (RDAP, October 24) and matches the Instagram handle `@wearecancha`. Backups if it's taken: `playcancha.com`, `canchafl.com`. Confirm price and renewal at checkout. Prices above are from `docs/domain-and-hosting-costs.md` and framer.com/pricing; confirm the total before paying.

## Who Cancha is for, and the one action we want

- **Primary visitor:** a Florida parent looking for a youth club, tryout or camp near them.
- **Supply side:** the 385 clubs already listed. They have the audience Cancha lacks: parent email lists, WhatsApp groups and Instagram followers.
- **One action:** visitor searches by city or ZIP and opens a club profile. For clubs: **claim your profile**.

## The 30-day plan

Each channel uses its own tracked link (`utm_source` / `utm_campaign`) so we can see what works. Send everything to the custom domain once it's live.

### 1. Clubs claim their profiles (highest leverage)
Clubs are already listed, so the message is a gift, not an ask. One claimed club sharing "find us on Cancha" reaches hundreds of real parents.
- **Who:** the 385 listed clubs, smallest first. Small clubs care most about being found. Start in Miami (48) and Orlando (42), where coverage is deepest.
- **How:** Instagram DM to the club account plus the contact email on their site. **10 a day, sent personally by the owner.**
- **Target to test:** 300 contacts in 30 days, 10%+ reply rate, 15 claimed profiles.

### 2. Instagram Collab posts with clubs
A Collab post appears on **both** accounts' feeds. For an account with no real audience, this is the fastest legitimate way to reach real local followers.
- Every club-guide carousel the pipeline already makes ("first season at Florida Kraze Krush", etc.) gets offered to that club as a Collab: "We made this about your club. Want to co-post it?"
- **Target:** 1 Collab a week.

### 3. Parent communities (Facebook groups, Nextdoor, school groups)
Parents ask "where can my 8-year-old play in Weston?" all the time.
- Join 10 local youth-soccer and parent groups (Broward, Miami-Dade, Orange County). Read each group's rules first.
- **Answer questions** with a specific Cancha search link. Don't post ads. Once a month where allowed, post a useful list ("Winter tryouts in Broward, all in one place").
- **Target:** 3 helpful answers a week.

### 4. Pickup and adult players
Pickup organizers run WhatsApp groups that grow by word of mouth. The Community page already has an **Add your group** flow. Invite 5 organizers a week to list their group.

### 5. Instagram content change
- **Less news, more people.** Reposted club news can't compete with the clubs' own accounts. Shoot real local content on a phone: a pickup game, a field at sunset, a 10-second "where to play in Doral". One real video a week beats seven automated ones for trust.
- **Tag the club** in every club-guide post. Tagged clubs reshare.
- **Bio link:** the custom domain with `utm_content=bio`, pointing to the homepage. Its new photo hero now matches the feed.

## Weekly scorecard (owner, 10 minutes every Monday)

| Metric | Where to find it |
| --- | --- |
| Real site visitors, by source | Framer Analytics (UTM source) |
| Club DMs/emails sent → replies → claims | A simple tally note |
| Profile claims and new listings | Framer form inbox |
| Instagram: reach from non-followers, shares, profile link taps | Instagram app → Professional dashboard |

Paste the numbers to Claude each Monday. Claude adjusts the plan and the content. Until Instagram Insights is connected through the API, screenshots work.

## Message templates (the owner sends; nothing is sent automatically)

Each profile's claim link is `/organizations?listing=%2Fclubs%2F<club-slug>` (for example `/organizations?listing=%2Fclubs%2Fweston-fc`). It opens the existing private form with that club prefilled.

**Club DM (Instagram)**
> Hi [Club]! We run Cancha, a free directory that helps Florida families find soccer near them. [Club] is already listed: [profile link]. If you'd like to claim it, we can add your current programs, ages and tryout dates so parents see the right info. Takes 2 minutes: [claim link]. ⚽

**Club email**
> Subject: [Club] is listed on Cancha
>
> Hi [Name],
> Cancha is a free Florida soccer directory. Parents search by city or ZIP to find clubs, tryouts and places to play. [Club] already has a profile: [profile link].
> Claim it here to keep programs, ages and tryout dates up to date: [claim link]. There's no cost.
> If anything on the profile is wrong, reply and I'll fix it the same day.
> [Owner name], Cancha · @wearecancha

**Collab offer**
> Hey [Club], we made a post about [club/program] for our Florida soccer page. Want to co-post it as a Collab so it shows on both feeds? Happy to change anything first.

**Parent group answer**
> For [age] in [city], here are the clubs and rec programs near [ZIP]: [filtered Cancha link]. It lists programs, ages and links to each club's official page. Most clubs post tryout dates in [month].

## What Claude does each week
- Monday: reviews the scorecard and adjusts targets and copy.
- Ships one substantial website PR (the loop runs Monday for the website, Thursday for social templates) plus larger redesigns in direct sessions.
- Prepares that week's Collab and club-guide captions and the tracked links for each channel.
