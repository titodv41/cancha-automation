# Automatic Cancha video production — October 24

The owner authorized automatic scripts and Chris narration, asked for useful endings, less repeated presentation, collision-free carousels, a quieter brand disclosure and current club news/dates on the website. This release replaces the previous manual-script/manual-TTS boundary within the existing Free-only budget.

## What the producer does

The scheduled replenishment action discovers recent articles on four official Florida club news archives, checks dates and publisher identity, and extracts the actual article paragraphs and subject media. The RSS feeds were checked and found stale; they are not treated as current news.

Scripts are generated automatically through a constrained source-based copy editor. It selects complete factual sentences, removes datelines and nonessential record tables, puts a comeback deficit before the result, and speaks football score numbers naturally. Evidence retains the exact source sentences and the permitted copy edits. No outside language-model account, invented quote, first-person club claim or compulsory engagement question is needed. Unsupported previews, sponsor announcements, incomplete stories and unavailable media do not enter narration.

The first current example is the Sporting JAX women's 3–3 comeback at Lexington. Its official report includes the actual goal clips. The generated spoken story is:

> Lexington took a two nil lead in the first sixteen minutes. The Sporting JAX women’s team came back to earn a three all draw against Lexington SC.

This is generated from the article, rather than a manually stored episode script. At most one new story is created per New York day, targeting two pending video drafts. Stories are deduplicated by official article ID; recent club subjects are rotated. The existing two daily feed slots and actual-carousel-first rule remain.

## Narration and costs

The existing ElevenLabs key is supplied only to the replenishment step. The account must be Free. Chris is the only automatic voice. Paid generation, paid-tier credits, upgrades and automatic retries of uncertain requests remain disabled. The October project limit remains **1,500 characters**, with a baseline of **1,153** already used by the earlier auditions.

A reservation is saved to encrypted GitHub state before any provider request. Completed narration and provider timing are checksum-bound and cached as hosted assets. A missing cache or uncertain reservation stops generation rather than buying another take. The manual audition workflow shares the same ledger and concurrency group. Its prior recorded usage is preserved even if an Actions cache is missing. Voice files are retained in private artifacts for recovery; credentials are never artifacts.

The automation can operate only within this allowance. Continuous daily narration needs a sufficient free allowance or a separately agreed budget; this release does not raise the key quota or project cap silently. Carousels and the website remain independent when narration is blocked.

## Visual production and improvement

- Three bounded techniques: a match scoreboard, a lighter newsroom layout and a video-first club film. The production mix tracks technique usage, rather than making every episode identical.
- Actual official subject video is preferred. File identity, size, duration, dimensions and source origin are checked. Generic stock loops are excluded. For longer clips, source audio energy suggests a lively window; this is an editing heuristic, not a claim that software recognizes goals semantically.
- Source video keeps its full frame in a dedicated media region. Brand, headline, imagery, score facts and captions have separate regions. A silent visual preflight checks the loaded fonts and overlap before narration is generated. Final captions use actual provider alignment; score reveals follow the result sentence.
- The 1080×1920 output has original music, selected Chris narration and H.264/AAC delivery checks. The same master can later be adapted for TikTok. No TikTok account is connected or published to in this release.
- Format learning compares independent posts in the same 48–96-hour age window, using saves and shares per 100 accounts reached. It needs at least five posts in each of two techniques; otherwise production rotates the approved techniques. It never rewrites code, changes the brand or treats one post as proof.
- The live insights check still requires `instagram_manage_insights`. Permission errors are recorded as missing data, not zero engagement. Performance-driven selection cannot start until that access and comparable samples exist.

The old Fort Lauderdale closing question is removed by trimming the accepted Chris recording at its sentence boundary, with no new TTS request. Only an untouched future owner-authorized standing-plan approval may receive the revised media; its slot is retained. Published, manually approved, dispatched and uncertain work is protected.

## Carousel repair

Photo panels and fact cards now use normal-flow grid regions. Long copy moves the image region instead of occupying the same coordinates. The renderer rejects text/image intersections, footer overflow and an image region below the minimum size. Font and exact original-photo diversity checks remain. This addresses the layout cause rather than repeatedly changing a font size or a crop.

## Website

The prominent brand sponsorship note is moved to an expandable footer section. “Gear & brands” remains a group of independent official links.

The home page has a compact “From the clubs” news rail and a dates tab when a verified future local date exists. The first date is the Rowdies–Sporting JAX match at Al Lang, October 24 at 7:30 PM Eastern. A date needs an explicit official kickoff, a matching Florida city, and a future start. It hides at kickoff. News expires unless the source is rechecked. Only public fields enter the existing compact catalog module; no extra CMS collection, private contact exposure or hosting service is added.

The existing daily website pipeline refreshes these sources before publication. Code/CMS backups and the release contract protect the existing listings, routes and form destinations.

## Scheduling reliability

Production now uses one set of UTC triggers instead of overlapping summer/winter jobs. Twice-hourly publication checks retain the same New York feed slots and spacing/week/day limits. GitHub may still delay jobs. Source shortages and narration budget issues remain explicit production reports; no fake filler or uncertain-publication retry is introduced.

## Verification and receipts

- First automatic production: [GitHub run 40124681509](https://github.com/titodv41/cancha-automation/actions/runs/40124681509), October 24. One new 146-character Chris request; the 9.1-second Sporting JAX video passed the H.264/AAC, 1080×1920, stereo and loudness audit, and entered the queue as Draft. It has not been claimed as published. [Open the video](https://framerusercontent.com/assets/wSL4LoItKuTUme9pBPBx4WiQIg.mp4).
- Remaining October project allowance after that request: 201 characters. A repeat production run generated no second narration; the daily cap protected the completed episode. Daily new narration remains limited until the project/key quota is changed within the owner's chosen allowance.
- The first run exposed a queue-refresh filesystem error in the separate prepared narrative stage. Fixed by using a private temporary SQLite file. [Follow-up run 40125212478](https://github.com/titodv41/cancha-automation/actions/runs/40125212478) confirmed the 15.13-second CTA-free Fort Lauderdale revision was delivered, kept its original October 24 22:00 UTC slot, and used zero new TTS requests. [Open the revised narrative](https://framerusercontent.com/assets/20Pa0lOAjXB2OWhpCxWlLNO8.mp4).
- Actual public JAX movie bytes matched the production checksum. Phone playback reached a moving frame with no video error; three final frames were inspected, including the score reveal. All three approved visual techniques passed silent region preflight.
- Live homepage checked at 320, 390 and 1440 pixels: no horizontal overflow, current news links and the actual local date visible, footer disclosure expandable. The routed browser also reported a Framer localStorage access warning; the news/date interactions worked. Existing Cancha storage calls are guarded and these home/footer components do not use localStorage.
- Website release preserved the CMS unchanged and retained zero pending editor changes. Latest backup: `backups/home-updates-1792870136194`. The date tab falls back to news if its last event expires while the page is open.
- [Corrected carousel PDF](https://framerusercontent.com/assets/Rp5NOuh6mcdKzzzuFKFJevDojDQ.pdf). Twelve photo-editorial slides passed the copy/photo intersection, font, image-resolution and footer bounds checks. Published content is preserved.
- Current insights check remains blocked by `instagram_manage_insights`; no reach/retention improvement is claimed.


### Final queue and website checks

- [Carousel refresh run 40125704147](https://github.com/titodv41/cancha-automation/actions/runs/40125704147) replaced the four unpublished photo carousels and protected the previously Published women's matchdays post. The old FKK preparation was canceled through version-checked owner-authorized control before replacing its artwork; no published or uncertain media was overwritten.
- [Replacement schedule run 40125827905](https://github.com/titodv41/cancha-automation/actions/runs/40125827905) approved the corrected FKK carousel for the delayed first slot at October 24 19:35:16.773 UTC. The existing four-hour spacing guard can delay the later video; the 18:00 New York slot is a target, not a promise after a late first publication.
- All eight new news images decoded on the live mobile page. A browser clock check crossed the actual kickoff: the date disappeared and current news became selected, without an empty rail or overflow.
- Final automated checks: **229 passed, zero failures**. Stage errors now fail the production status while retaining diagnostics and the independent publishing queue. Every review summary exposes the Free-only monthly cap, durable reserved characters and remaining allowance without exposing the provider key.
- The existing local untracked `previews/launch/` material was left untouched. New production assets and CMS/code backups remain excluded from Git.

The corrected FKK carousel subsequently reached **Published**, confirmed by [run 40126122358](https://github.com/titodv41/cancha-automation/actions/runs/40126122358), media ID `18134726041672899`. The queue now contains nine Published receipts and zero Publishing/Needs reconciliation rows. Meta preparation was polled before the single durable publication claim; no uncertain publish was retried. The later Fort Lauderdale video remains Approved, and the new JAX story remains Draft for the standing planner. The owner was asked whether to use more of the existing Free allowance; no cap increase or paid usage was enabled while awaiting that preference.
