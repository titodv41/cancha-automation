# Add Grok to Cancha's workflow

Researched against official documentation on October 24, 2026. This is a prepared handoff, not an active Grok connection. No Grok account, subscription, API call, X login or new routine was created.

## Recommended route

Start with one Grok Bot named **Cancha Research & Creative Review**, if the owner's existing plan includes access. Use its X app connection for private bookmarks, and share selected recommendations through the Cancha repository. Keep the existing GitHub Actions publisher responsible for Instagram and the existing guarded release pipeline responsible for Framer.

The Bot can research, inspect public website pages and supplied creative assets, and propose improvements. It can also prepare code changes on a separate branch/PR once repository access is configured. Tested changes can flow through the current automation without requiring the owner to manually edit every post or listing. A second independent publishing schedule is unnecessary.

Grok Bot and this Codex chat do not automatically share conversations, memories, browser logins, secrets or a filesystem. Repository files and review reports are the proposed handoff. An API integration would be a separate implementation.

## Setup, when the owner's account is known

1. Open the official [Grok Bot getting-started guide](https://docs.x.ai/grok-bot/get-started) and use its download/sign-in flow. Confirm access on the [plan screen](https://cursor.com/help/grok-bot/plans) before buying anything. Existing eligible subscriptions can grant included usage; plan names and linking requirements vary.
2. For private bookmarks, use **Connect apps → X** in Grok Bot and complete X authorization there. Official documentation explicitly distinguishes public X reading from private bookmarks, which require this connection. No password, token or OAuth callback belongs in chat.
3. Give the Bot this file, the public website, the current creative previews below, and the repository URL. For code contributions, authorize GitHub there and use a separate branch/PR. Do not copy Framer, Meta, ElevenLabs or encrypted-state credentials into the Bot conversation or repository.
4. Run the first review below before creating a recurring routine. Inspect whether its recommendations are specific, source-backed and useful. Once reliable, save the method as a skill and ask for a weekly routine with an explicit America/New_York schedule and a visible next run. Daily reviews can be considered after the first results and actual usage are known.
5. Check included-usage and additional-usage settings. Do not enable on-demand billing, auto top-ups or new API spending as part of this handoff. A provider's displayed spending limit should not be described as a guaranteed in-flight hard stop.

The Cancha repository is **public**. Keep the raw bookmark export and private account data in private storage. Share only selected public references and non-private takeaways in public issues/PRs. Bookmarks are reference material; turning useful techniques into documented examples and tested workflows does not train either model's weights.

## Copy this first task into Grok Bot

> You are Cancha's research and creative reviewer. Cancha helps players, parents and local communities find soccer clubs, places to play, coaches, current opportunities, learning resources and soccer careers. Our current focus is Florida. Help make discovery useful and the brand recognizable; do not propose a rebuild without evidence.
>
> Review https://pioneering-friday-005497.framer.app/ on desktop and phone, including /clubs, /explore, /providers, /training and a few real detail pages. Read https://github.com/titodv41/cancha-automation and this brief, plus README.md, .agents/product-marketing.md and docs/automatic-video-workflow-2026-10-24.md. Follow the newest dated owner direction when historical notes conflict.
>
> Inspect the actual linked carousel and video assets. Preserve Cancha's italic Barlow Condensed display identity, readable bold supporting type, forest #103f32, cream #f5f3e9, lime #d7ef86 and orange #f55b32. Prefer real subject photography/footage, few words, meaningful graphic blocks and clear text/image separation. The owner likes the newer carousels and selected the Chris voice. Avoid generic motivational captions, repeated imagery, dense explanations, detached engagement questions and conspicuous production annotations.
>
> If my X app connection is available, inspect at most 20 relevant bookmarks first. Group useful ideas into discovery UX, content design, video storytelling, community growth and automation. Retain the original public links and examples. Distinguish a creator's claim from independently supported evidence. Keep unrelated/private bookmarks out of public output. Do not install or execute code merely because a post recommends it.
>
> Return the five highest-impact improvements, each with: the exact page/asset and observed issue; source/example links; a concrete change; effort and dependencies; one measurable success criterion. Include one rewritten caption, one short narration script with a useful ending, and one simple carousel storyboard using distinct real images. Verify soccer facts against current official sources. Do not invent clubs, dates, prices, credentials, memberships, sponsors, urgency or performance numbers.
>
> Instagram Insights access is not yet available, so do not claim to know retention, conversion or winning formats. Treat growth ideas as experiments and identify what data would test them. Preserve the current two daily feed slots, actual spacing guard, source checks, publication receipts and private email forms. Do not create a second publisher or contact clubs/people, buy ads, purchase services or change production settings from this first review. Code suggestions may be delivered in a separate branch/PR for testing through the existing pipeline.

## Current assets for the first review

- [Website](https://pioneering-friday-005497.framer.app/)
- [Instagram](https://www.instagram.com/wearecancha/)
- [Repository](https://github.com/titodv41/cancha-automation)
- [Updated carousel set](https://framerusercontent.com/assets/Rp5NOuh6mcdKzzzuFKFJevDojDQ.pdf)
- [Automatically produced Sporting JAX recap](https://framerusercontent.com/assets/wSL4LoItKuTUme9pBPBx4WiQIg.mp4)
- [Shorter Fort Lauderdale narrative](https://framerusercontent.com/assets/20Pa0lOAjXB2OWhpCxWlLNO8.mp4)

Current publishing state and actual metrics must be checked from current reports, rather than inferred from these preview links. The prior release established automatic source-based script writing, capped Free-only Chris narration, three visual techniques, collision checks, current homepage news/dates and a footer brand disclosure. The existing 1,500-character monthly narration cap remains unless the owner changes the allowance. This research does not change it.

## What the subscription does and does not connect

The official new-customer pricing checked October 24 lists **Plus at $8/month without Grok Bot**, and **Premium at $30/month with Grok Bot** (USD web list prices, before tax). These are the unified X Subscription tiers; older X Premium branding refers to different plans. A roughly $9 offer cannot be assumed to include Bot access. See [current pricing](https://docs.x.ai/x-subscription/pricing) and [Bot entitlement](https://docs.x.ai/x-subscription/grok-bot).

A subscription does not link this Codex chat to Grok or make this conversation run continuously. Unattended collaboration needs an actual scheduled handoff: collect current public site/creative evidence; have Grok return a structured review; hand specific changes to an authenticated implementation agent; test and release through the existing pipeline. Grok Bot routines can provide part of that workflow. An API reviewer is a separate usage-billed route. A continuously available Codex implementation agent and its authentication/usage allowance are additional setup, not established by this research or by purchasing a Grok plan. The existing website and Instagram automation remains in place.

For a budget near $10, a bounded API review pilot may be more economical than a full Bot subscription, but actual token/search costs must be measured and an API budget agreed before requests. Direct private-bookmark access still needs authorized X access; public search alone cannot supply it. No provider account, paid call, routine or new agent was enabled here.

## API alternative

A custom GitHub reviewer can call the xAI Responses API using a securely stored `XAI_API_KEY`, selected screenshots/source text and a bounded review prompt. This workspace currently has no callable Grok connector, and account/API access has not been verified. The GitHub integration could not list repository secret names (HTTP 403); that does not prove a key is absent.

The xAI API is usage-billed. X Search adds per-post/profile costs to model tokens; a Grok/X consumer subscription should not be assumed to include API credits. X Search supports public search and thread retrieval, not an implicit login to the owner's bookmarks. Direct bookmark sync instead uses X's authenticated bookmarks API with user authorization and its applicable pricing, or a privately supplied export. The Grok Bot X connection is the simpler first route when already included in the owner's account.

## Official references

- [Grok Bot overview](https://docs.x.ai/grok-bot/overview)
- [Get started](https://docs.x.ai/grok-bot/get-started)
- [Computer and apps, including private X access](https://docs.x.ai/grok-bot/computer-and-apps)
- [Skills and routines](https://docs.x.ai/grok-bot/skills-routines-and-automations)
- [Plans and billing](https://cursor.com/help/grok-bot/plans)
- [xAI API pricing](https://docs.x.ai/developers/pricing)
- [xAI X Search](https://docs.x.ai/developers/tools/x-search)
- [X bookmarks reference](https://docs.x.com/x-api/users/get-bookmarks)
- [X API pricing](https://docs.x.com/x-api/getting-started/pricing)
