# What works on Cancha's Instagram (evidence log)

## Nov 1, 2026: the Rowdies vs Miami FC derby brief
The only post with real engagement so far (~40 likes per the owner; others near zero). Why, as best we can tell:
1. **Timely:** posted hours before a real event (the match that night), so it was worth acting on today.
2. **Stakes and rivalry:** "Win or go home", #1 vs #8, with Miami's earlier win at Al Lang as a twist.
3. **The club's own photo plus a collab invite** (@tampabayrowdies): the club appears to have accepted or reposted it, which put it in front of their fans.
4. **An easy reaction:** "Who you got? Drop it in the comments."

## The formula to repeat (not copy)
- A **specific Florida club or community moment** with a clock on it: match preview or result, playoff run, tryout or deadline, drive or event.
- The **club's own photo** (credited) plus a **collab invite to that club**.
- One **stakes headline** and one **comment prompt** (pick a side, tag a teammate, share your story).
- The same day, or the day before the moment. Set `expiresOn` when the post is time-bound and add it to `priorityDraftIds`.
- It is still evidence from one post: compare with Insights before calling it proven.

## Nov 1, 2026: owner feedback, more pictures and graphics
Text-only inside slides are hard to read. Every point slide in a new brief leads with a `visual` (enforced by tests):
- `photo`: the cited source's own image or a still from a cleared creator video, credited (`url` or `local` + `clearedVideo`).
- `stat`: one big number with a short caption (`$3,500`, `11.21`, `8 – 1`).
- `scoreboard`: two club crests from the badge manifest with scores and a note (match results).
- `ratio`: an icon chart such as 1 in 7 (`of` ≤ 10).
Don't repeat the visual's number in the slide headline; use the headline for the meaning.

## Reach playbook (Nov 2, 2026; review and edit as evidence comes in)
Principles we act on. They are platform guidance and common practice, not yet proven for Cancha:
- **Shares beat likes.** Instagram's head has said sends (shares in DMs) per reach is one of the strongest signals for reaching non-followers. Build posts people send to a team chat: calculators, dates and deadlines, "your club is on this list".
- **Collabs borrow an audience.** One collab invite to the featured club per post. The owner can personally message a club after we feature it, asking it to accept or reshare (a human message, never automated).
- **Reels find new people; carousels earn saves.** Mix both, but no fixed order: the carousel-before-Reel rule was removed on Nov 4 after it blocked a whole day.
- **The first hour matters.** Real friends and followers sharing to their stories and replying in comments right after posting helps. Never buy or fake engagement.
- **One idea per post, one call to action.** "Comment who you've got", "Send this to your team chat", or "Link in bio", not all three.
- **Visual first.** A photo or graphic on every slide, a big number or face in the first second, few words, and the logo always.

## The improvement loop (every session)
1. Look at the latest posts' results (reach, shares, saves, follows, comments) by format and topic. Keep raw Insights numbers out of this public repo: write only conclusions here and send numbers to the owner privately.
2. Do more of what drew shares and follows; change or stop what didn't.
3. Ship one Instagram improvement and one website improvement, each verified visually.
4. Every Monday: send the owner a short private scorecard (top post, worst post, what changes this week).

## Story Reels (owner, Nov 6): what he loves
1. Cool soccer stories: business, ownership, culture (example: Como's president and the Disney playbook). Make them now; the owner gets permissions. Each story file lists who to ask.
2. League ladders and data graphics (Serie D → C → B → A → Champions League) are the favourite. Use that kind of animated graphic a lot: climbs, counters, maps, comparisons.
3. No narrator on story Reels: music, sound effects and kinetic text carry them.
4. Only high-quality pictures (no small web thumbnails), plus real clips of goals and celebrations.
5. Borrow each club's look: its colours, its scarf and crowd aesthetic. Cancha logo stays on every scene and the end card.
6. Owner approved the Como and Weston drafts (Nov 6). More moving graphics (ladders, counters, maps with crest pins). Club badge whenever we can.
7. Focus on adults (the app is adults-only): "Meet the club / Find your club" for clubs with adult teams (UPSL and similar), more clubs around Miami-Dade and Broward.
8. Next format to try: the app itself, a feed of people at your level and pickup near you.
9. Explain the real business, with numbers and how it works (owner, Nov 6: the Disney comparison was "weird" and said nothing new). Each beat answers a question a fan would ask: where the club came from, why the owners bought it, how a key person's role worked (Fàbregas: player → shareholder → coach), money in vs money earned, what's next. One explaining graphic per beat: flow chart, ladder, bars, counter. Source every number in the caption.

## Audience and voice (owner, Nov 2)
- **Who:** South Florida first. Parents at clubs, coaches, players. The goal is a soccer community first; club partnerships and paid features come later.
- **Mix:** besides club moments, post soccer culture people want to talk about: attendance and fan culture, how the pros play (e.g. why Messi walks so much), lower-league and grassroots stories from around the world. It shows we understand the game, the clubs and the people around them.
- **Voice:** write like a person at the field. Short sentences, real numbers, a plain opinion. No marketing filler ("dive in", "game-changer", "elevate"), few em dashes. Tests reject the common giveaways.
- **Other creators' videos:** never download or screenshot them without the creator's OK. Summarize the public facts with our own graphics, credit and link the creator, or ask the creator (owner) and add the video to config/clip-permissions.json.

## Ask the owner first (owner, Nov 2)
The owner is well connected and makes every ask personally. When a post needs someone else's OK (a creator's clip, a guest's answers and photos, a club's media beyond its public news), Claude:
1. Builds the post to top level: script or storyboard if the media can't be used yet, otherwise the full render.
2. Ends the session with an **ASK** line for the owner: who to ask, the exact question, and a preview.
3. Waits. On the owner's yes, records it (`config/clip-permissions.json` or `config/interview-permissions.json`), approves the post and queues it. On no, drops it.
Ongoing series: "5 Questions" interviews with South Florida soccer people (docs/five-questions-interview-kit.md), and sponsorship stories for club directors (how clubs land a first sponsor, real local partnerships).
