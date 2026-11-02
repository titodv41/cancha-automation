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
- **Reels find new people; carousels earn saves.** Keep the daily carousel and the Reel/platform slot.
- **The first hour matters.** Real friends and followers sharing to their stories and replying in comments right after posting helps. Never buy or fake engagement.
- **One idea per post, one call to action.** "Comment who you've got", "Send this to your team chat", or "Link in bio", not all three.
- **Visual first.** A photo or graphic on every slide, a big number or face in the first second, few words, and the logo always.

## The improvement loop (every session)
1. Look at the latest posts' results (reach, shares, saves, follows, comments) by format and topic. Keep raw Insights numbers out of this public repo: write only conclusions here and send numbers to the owner privately.
2. Do more of what drew shares and follows; change or stop what didn't.
3. Ship one Instagram improvement and one website improvement, each verified visually.
4. Every Monday: send the owner a short private scorecard (top post, worst post, what changes this week).

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
