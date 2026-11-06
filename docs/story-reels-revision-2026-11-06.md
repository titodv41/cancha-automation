# Story Reels revision (Nov 6, 2026): change log and claims

Revisions made from the owner's review brief. Earlier cuts are preserved (`StoryReel.tsx` and the v1 story files are unchanged in behaviour).

## What exists (report)
- **Renderer:** Remotion 4 (`video/`), compositions `StoryReel` (v1 cuts) and `StoryReel2` (this revision, production layout). Music and effects mixed by `video/mix-promo-audio.mjs` from each story's `sound` cues (Mixkit licence). No narration on story Reels (owner, Nov 6).
- **Footage:** Como 1907's own YouTube (ASCENT documentary, promotion match), downloaded as `pending-owner` (posting refused until the club agrees). Local cut: one Pexels photo, real county shapes (US Census 2023), club crests from the directory, and screenshots of the live website directory.
- **Live product:** the website directory is live (search near a city → club profile with league, city, sources date and a contact route). The app is a prototype in Expo Go; the website waitlist is live. The local cut shows the live website, so no prototype label is needed.
- **CTA destination:** the bio link should point to the live directory, https://wearecancha.framer.website/clubs, for the local cut ("Find adult teams"). The Como cut ends on a follow CTA only.

## Como v3 (`content/instagram/stories/como-v3-en.json`, 32.5 s)
- One question: why do the owners keep paying? Ownership, media, climb, Fàbregas, money, bet, follow.
- Hook: "Buying the club was the cheap part." over Fàbregas; one financial idea at a time.
- Two large beats instead of the four-card stack (no sideways card travel; 4-frame fades on hard cuts).
- Ladder: past steps dimmed, current step lit, destination largest.
- Fàbregas: "Player → shareholder → head coach" over footage, with the official dated line.
- Funding chart: takeaway headline above, bars grow together (~0.8 s), fixed final labels, unit and period under the baseline.
- 2024/25 comparison labels both measures and says they are not profit; staff costs 155% of revenue.
- Removed tourism (causation not shown) and the "business of the game" end card. Stadium kept only as "planned".
- The €297M cumulative figure is no longer on screen (date and scope caveats).

## Adult discovery v2 (`content/instagram/stories/find-your-club-adults-v2-en.json`, 16 s)
- Hook: "Played back home? Find your team here." with "Adults · Miami-Dade + Broward".
- Map starts on the two counties (no statewide reveal); all crests dimmed; three highlighted one at a time with a card: name, city, level, "Places: contact the club".
- "New clubs every day" and the pickup scene removed.
- Real product flow: live directory search near Doral → Hodler FC → profile (level, city, contact route), cropped large with a tap and a highlight.
- CTA: "Find adult teams. Link in bio" is the largest message; logo-only hold 1 s.

## Layout system (StoryReel2)
Critical area x 72–900, y 288–1248 for text, logos and CTA; headlines 92 px, two lines maximum; supporting copy in the upright UI face at 44 px, labels 34–38 px; light scrims instead of heavy blur; wordmark small at the top-left of the critical area.

## Claims
Each story file carries a `claims` list (`id`, `displayText`, `sourceUrl`, `checkedAt`, `period`, `entity`, `definition`). Before posting Como, reconcile the funding and revenue figures with the club's filings: https://comofootball.com/documenti-societari/.

## Still to do before posting
- Owner approval; Como 1907 agrees to the footage use; reconcile Como figures with filings.
- Point the Instagram bio link at the live directory for the local cut.
- Check both cuts under the real Reels and Stories overlays on a phone.
- Website bug seen while capturing: on club profiles the "UPSL / Division 1 · 2026 Fall" pill is pale on pale and nearly invisible.
