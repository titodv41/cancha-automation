# Cancha form delivery without Render

Cancha is transitioning organization, provider and offer forms to Framer's native Email destination. This uses the existing Framer site and a private owner inbox; no new Render or Cloudflare service is needed. Instagram scheduling remains on GitHub.

## Current state and activation

The three existing forms are prepared in the Framer draft with native submit buttons and loading, success and error states. They preserve Cancha typography and colors, required inputs and consent, and include a hidden Pending review label. Organization submissions can request a new opportunity or update an existing listing. No form code calls Render. Delivery remains guarded until native email destinations are configured.

The Server API does not expose native form Email destination settings. The owner must select the form layer named **Cancha submissions — configure Email in Send To** on `/organizations`, `/providers`, and `/offers`. Set **Send To → Email** to the chosen private inbox, remove obsolete Render webhook destinations, and complete any recipient verification. The recipient is not stored in frontend code or this public repository.

After the owner confirms destination configuration, run `node scripts/activate-email-intake.mjs --destinations-confirmed` to remove the temporary submission guard. This stages an editor change; it does not publish. Publish in Framer, send a consented test through each published form, and confirm email receipt including the submitted fields. Verify both a mobile and desktop submission. Do not claim email delivery is working until an email arrives. Framer's native delivery handles sending and failure; it does not merely open the visitor's mail app.

Use `node scripts/prepare-email-intake.mjs` only to prepare or repair this existing project. It backs up affected forms privately and retains the guard until owner confirmation. The older `connect-private-intake.mjs` is a legacy Render route and must not be used for the email transition.

## Review and privacy

Submissions go to the private inbox, not the public CMS. Pending review is an editorial label, not a database queue or authentication mechanism. Forward the relevant submission to Codex for review and source checks before a deliberate CMS action. Do not forward unnecessary contact data. Nothing automatically creates or publishes an opportunity, provider or discount. Framer provides native spam protection and rate limiting; email delivery may still be filtered as spam. Keep the inbox private and define a retention policy for contact information.

## Render shutdown

Do not deploy the legacy Render receiver repair. First configure native email delivery, publish and confirm actual receipt. Inspect and privately export any remaining Render submission data before deleting its service or disk. New Render intake was not activated by the previous repair. Existing migration archives may predate later records; do not assume they contain everything.

Then, in the Render dashboard, delete the old web service and any separately billed persistent disk or other paid resources. Check Render Billing for remaining services and charges. Switching frontend code or Instagram schedules does not cancel a Render subscription. The owner must perform these account actions because this workspace has no Render administration credential.

## Evidence and official references

Framer type checking and staged form structure checks passed. Desktop/mobile editor previews are generated under `previews/email-intake/`; previews are not evidence of email delivery. The full repository suite previously passed 51 tests for the retained backend code. Native destination configuration, site publication and real email receipt are separate checks.

- [Framer native contact forms](https://www.framer.com/help/articles/how-can-i-add-a-contact-form-to-my-framer-website/): native forms support email, Sheets and webhook delivery.
- [Framer native spam protection](https://www.framer.com/help/articles/how-framer-s-built-in-form-spam-protection-works/).

October 12 activation: the owner confirmed Email configuration for all three forms. Their submission guards were removed in the Framer draft. Publication and actual inbox receipt still need confirmation; no Render account deletion was performed.
