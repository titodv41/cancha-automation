# Google Flow for Cancha content

Official help reviewed October 21, 2026. No Google subscription was bought, account connected or generation started.

Flow can generate clips from text, images, ingredients, frames and other video. Its official getting-started page lists age verification, age 18+, supported regions and eligible Google AI/Workspace access. Plans, models and credit costs change; inspect the model and credit charge in your own account before generating. Do not assume a free tier or that a Cancha GitHub/Meta connection includes Flow.

## First useful experiment

Make one 8–12 second **illustrated** community invitation: “Where do you play in Florida?” Use an original illustrated pitch, a moving ball and two restrained text overlays. End with “City + public venue. Tell us in the comments.” Do not generate a pretend local match, crowd, coach testimonial or fake club footage.

Prompt starting point: “Slow overhead camera over an abstract illustrated soccer field, warm natural green palette, one ball rolling into frame, clean editorial sports design, no people, no logos, no text, no watermark removal, leave clear space for titles. Vertical composition.” Add the actual Cancha wordmark and readable text afterward in the existing renderer/editor rather than relying on generated lettering. This is a draft prompt, not an executed generation.

For actual club stories, organizer-supplied footage with permission is better evidence. Record the photographer/owner, permitted uses, any expiry and permissions involving recognizable people/minors. The fact that a photo appears on a club website does not establish rights to animate it or use it in an ad. Keep editorial use and paid-ad permission separate.

Review the exported clip for visual errors, readability on a phone, license/consent, factual claims, audio rights and platform labeling. Keep synthetic scenes visibly illustrative; never identify them as footage from a named venue or real event. Google says generated outputs include invisible SynthID; visible-watermark options can depend on the product configuration. Do not remove provenance to make generated scenes look like documentary footage.

The existing Cancha pipeline can produce a short real product demonstration with Playwright and ffmpeg without another paid video tool. Video and Stories publishing remain separate work: the live daily automation currently publishes feed images. A Flow export is not automatically connected to GitHub or Instagram. First review one completed clip, then implement a video-specific media validator, publishing path and failure/reconciliation handling before enabling automatic Reels.

Official references:

- [Get started with Google Flow, requirements and watermark FAQ](https://support.google.com/flow/answer/16353333?hl=en)
- [Create videos from prompts, images, ingredients and frames](https://support.google.com/flow/answer/16353334?hl=en)
- [Google Flow](https://labs.google/fx/tools/flow) — entry URL may redirect by account/region.
