# Deploy the private submission queue

The receiver is prepared and tested, but it has not been deployed. The unpublished Framer form is locked and its native submit button is hidden. No contact data is stored in a public CMS collection. Every signed delivery is saved to private SQLite as **Pending review**; no route or process publishes it to Framer.

## Hosting requirements

Create a hosting account that supports an always-on Node 24 service, an HTTPS hostname, a persistent disk, and a secret manager. A container web service with a persistent disk works; an ephemeral filesystem or static website host does not. The Codex workspace is not the public submission host. No hosting charges or account creation have been authorized here.

Build the container from the repository root using `docker build -f server/Dockerfile -t cancha-submissions .`. Mount a private persistent disk at `/data`; the runtime user is UID 1000 and must have write access. Never serve that disk with a static-file server. Set the platform port to 8787, or securely configure `PORT` to the platform's required value. Terminate TLS at the hosting provider. Use `GET /health` as the health check.

Create a random secret of at least 32 characters using the provider's secure generator or a password manager. Store it as **CANCHA_WEBHOOK_SECRET** in the hosting secret manager. Do not commit it, put it into a Framer code component, or send it in chat. The Framer API key is unrelated and must not be reused for this webhook. Store an encrypted copy in your password manager so the same value can be entered in the Framer webhook destination.

The receiver endpoint will be `https://YOUR-ACTUAL-HOST/webhook`. This is a placeholder, not a deployed address. Accept POST JSON, preserve the original request bytes and Framer headers, and return 2xx only after SQLite storage succeeds. Framer signs raw request bytes plus the submission ID with HMAC SHA256; the receiver verifies `Framer-Signature` and `Framer-Webhook-Submission-Id`. Unsigned requests receive 401. Framer can retry deliveries; delivery IDs are idempotent. Likely duplicates are flagged for review instead of published.

## Connect the draft form after deployment

In the Cancha Framer editor, open **For Organizations** → **Private organization submission** → **Pending review form — locked until deployment** (form ID `CnS4mD_8b`). Under **Send To**, add a **Webhook**, enter the actual HTTPS `/webhook` address and the matching secret through Framer's secure destination settings. These destination credentials are not configured by the repository.

The field names must remain: Organization, Contact Name, Contact Email, Opportunity Title, Category, Location, Eligibility, Dates, Registration Link, Description, Permission. Dates is optional; the other textual fields and consent are required. Registration Link must be HTTPS. Permission is a checkbox. Contact details are used privately for review.

Test a submission in Framer Preview with your own consented test data; verify exactly one Pending review row on the private disk and verify that no CMS record was created. Keep the lock until the service, signature, storage and native form success/error states all pass. Then remove the `withSubmissionLock` override, hide the disabled “Submissions opening soon” code button, and reveal the native submit instance referenced by the form's `formSubmitButtonId`. Change the opening-soon notice. Test desktop/mobile, validation, failed delivery, successful delivery and a retried delivery before publishing. The site has not been published by this task.

## Private review and operations

On the host's private operator console, run `CANCHA_SUBMISSIONS_DB=/data/submissions.sqlite node server/review.mjs list`. This lists IDs, organizations, titles and status without contact emails. To record a decision, use `CANCHA_REVIEWER="Your actual name" node server/review.mjs set-status ID Approved "Official source checked"` or `Rejected "Reason"`, with the same database environment variable. Decisions only update private storage. Manually verify identity, duplicates, dates, eligibility and the official registration URL before any separate CMS action. Approved does not automatically mean published.

Restrict host-console and disk access to Cancha administrators. Back up SQLite using a consistent SQLite backup on the private host, encrypt the backup, and keep it outside the web service's document root. Establish a retention policy and delete rejected/contact data when no longer needed. The receiver logs no submitted contact values and exposes no public queue, database, or public submission administration endpoint. The separate Instagram dashboard requires administrator login.

Official specification: https://www.framer.com/help/articles/framer-form-webhook-setup/

## Provider and offer forms

The same private receiver now accepts provider submissions at `/providers/webhook` and merchant offers at `/offers/webhook`. Configure each native Framer form with its corresponding path, the same securely stored signing secret, and exactly its displayed field names. These routes validate different schemas and still force Pending review. Provider and offer contact emails never enter the public CMS collections. Operator decisions now record the actual reviewer identity and review timestamp. Approved private submissions still require a deliberate, reviewed CMS action; there is no automatic CMS publication. See growth-and-instagram.md for field mapping and account setup.

The prepared [Render Blueprint](../render.yaml) combines this private receiver with encrypted Meta storage and the protected Instagram review service. See [current deployment steps](connect-meta-and-automation.md). Deployment does not unlock the Framer forms; the signed end-to-end submission check above still comes first.
