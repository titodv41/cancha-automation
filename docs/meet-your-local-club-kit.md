# "Meet Your Local Club" kit (October 27, 2026)

This is a recurring series that recognizes the people building soccer in Orlando, Tampa Bay and South Florida, using original footage they send us. First features are free. See docs/direction-2026-10-27.md.

## 1. When to invite

Invite an organization when **they reply positively** to an email the owner already sent. We never cold-pitch a feature, and we never send automated outreach.

## 2. Feature invite (reply in the same email thread)

> Thanks so much for getting back to me, [Name]. That's really helpful.
>
> We're starting a series called **Meet Your Local Club** to introduce the people behind programs in [city]. Would you like [organization] to be one of the first features? It's free.
>
> All it takes is 2–4 short phone videos (vertical, under 30 seconds each), answering:
> 1. Who are you, and how did [organization] start?
> 2. Who do you serve (ages, levels, neighborhoods)?
> 3. What are you trying to build this year?
> 4. What should a family or player know before joining?
>
> A few photos of training are welcome too. We'll turn them into a short Reel, a carousel and a link to your page on Cancha. We'll send you the draft before anything goes live, and we'll tag your account.
>
> If that works, just reply with the clips (or a Google Drive / WeTransfer link) and a "yes" to the note below.

## 3. Permission note (they reply "yes" to it, kept with the clips)

> I confirm that [organization] owns these videos and photos, that everyone shown has agreed to appear, and that parents or guardians have agreed for anyone under 18. Cancha may use them, with our quotes, in Instagram posts and on wearecancha.com to feature our program. We can ask Cancha to take a post down at any time.

Without that reply, nothing gets published. Don't feature minors whose guardians haven't agreed. Cancha never adds claims the organization didn't make: no rankings, "best club", results, prices or dates unless they're on the organization's official page.

## 4. Filming tips to send with the invite

- Hold the phone vertically, film in daylight, stand close to the person talking, and do it somewhere quiet.
- One answer per clip, 15–30 seconds.
- 5–10 seconds of training: drills, a goal, the team huddle.

## 5. What we make from it

| Piece | Built from | Ends with |
| --- | --- | --- |
| Reel (20–40 s) | Their clips plus captions in Cancha type; no stock footage | Where they train · who can join · how to contact (from their official page) |
| Carousel (5–7 slides) | Stills from their clips + one quote per slide | Same practical details, "Link in bio" |
| Directory profile | Their Cancha club page (existing `/clubs/<slug>`) | Official links |

The caption tags their account and links their page. Name the series in the caption, for example "Meet Your Local Club · Kissimmee".

## 6. After it posts

- Send them the link and thank them, and ask them to share it, since that's how the post reaches their community.
- Log it in the private outreach tracker (not in this public repo): reply date, consent date, post date, saves, shares and profile visits at 48 hours and 7 days.
- After about 3 features, ask what helped them (inquiries, registrations). That's the evidence for a future paid offer.

## 7. Rendering the Reel (Claude)

The template is `video/render-meet-club.mjs` with the `MeetClub` composition. Everything stays in `private-data/` (never committed; this repo is public).

1. Put the clips in `private-data/meet-club/<id>/` and write `feature.json` next to them:
   - `id`, `organization`, `city`, `instagram` (handle from their official site, no @) and `officialUrl`.
   - `consent`: `reply: "yes"`, `via: "email"`, `receivedOn`, `ownsMedia: true`, `everyoneAgreed: true`, `minorsShown`, plus `guardianConsent: true` if minors appear.
   - `segments`: 1–6 clips, each with `file`, `start`, `duration` (2–15 s) and an optional `caption` (their own words, 90 characters or fewer) and `speaker`.
   - `endCard`: 1–3 rows (where they train, who can join, how to reach them), copied from their official page.
   - `caption`: the Instagram caption, naming "Meet Your Local Club" and the city.
2. Run `node video/render-meet-club.mjs private-data/meet-club/<id>/feature.json`. It refuses to render if any consent field or limit is missing.
3. The output in `render/` is 10–45 s long. It keeps the organization's own audio, adds a low original music bed and passes the delivery sound audit.
4. Send the draft to the organization before anything goes live, as promised in the invite.
