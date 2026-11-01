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
