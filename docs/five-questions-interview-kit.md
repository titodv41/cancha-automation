# "5 Questions" interview series (South Florida soccer people)

Owner, Nov 2: interview small clubs, coaches and people in the soccer business around South Florida. They share their post, and their people find Cancha. The owner makes the ask; Claude builds the post and waits for the owner's yes.

## Who to ask first
- Small and mid-size clubs: a director or the founder
- Coaches with a following, or with a story (former pro, started a program from nothing)
- People around the game: field owners, referees, trainers, photographers, kit and gear shops, pickup organizers, club sponsors

## Message the owner can send (edit freely)
> Hey [name]! I'm building Cancha, a page for South Florida soccer people. We're doing a short series called "5 Questions" featuring people who make the game happen here. Would you answer 5 quick questions? Voice note or text is fine. Send 3–5 photos you own (you, your team or your field), plus your Instagram handle. We'll tag you as a collaborator so it shows on your page too. Before we post, you'll see the final version.

## The 5 questions (pick 5; keep answers short)
1. How did you get into soccer in South Florida?
2. What does your club or program do that others don't?
3. What's the hardest part of running it right now?
4. One piece of advice for parents or young players?
5. What's one thing South Florida soccer needs more of?
Alternates: Best game you've ever been part of here? Who's someone in the local scene people should know? How did you land your first sponsor?

## What Claude needs from the owner
- The answers (text or voice-note transcript), photos the guest owns, their Instagram handle and website
- The guest's yes to: publishing the answers and photos, the collab invite, and seeing the final version before it posts
- No photos of minors unless a parent's written OK comes with them

## How it flows
1. The owner relays the answers and photos. Claude adds the guest to `config/interview-permissions.json` with `okRelayedOn` and saves the photos in `content/instagram/interviews/<id>/`.
2. Claude builds the carousel:
   - Cover: the guest's photo.
   - One slide per question: their photo or a graphic, plus a short pull quote.
   - Closing slide: where to find them.
   Answers are lightly trimmed, never reworded in a way that changes the meaning.
3. Claude sends the preview. The owner shows it to the guest and replies yes or no.
4. On yes, the post is approved and queued with a collab invite to the guest.
