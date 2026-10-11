# Private Cancha submissions

The existing Render service stores opportunity, provider and offer submissions in private SQLite, always as Pending review. Organization intake can also request an update to an existing Cancha opportunity URL. Contact information is never added to public CMS by this service. Approval in the private inbox does not publish to Framer.

## Activation

The server repair and connected Framer draft were tested on October 11, 2026. Production still requires:

1. In Render → cancha-automation → Manual Deploy → Deploy latest commit. Automatic deployments are disabled. This workspace has no Render deployment credential.
2. Check `https://cancha-automation.onrender.com/health` returns `publicIntake: 1` and `privateStorage: true`.
3. Publish the connected Framer draft. The existing button stays disabled until the receiver advertises readiness.
4. Submit consented test details from the published form and confirm a Pending review entry in the private inbox. Check desktop/mobile and failed delivery; fields remain populated on failure.

Use the existing administrator password at `https://cancha-automation.onrender.com/admin`. The private inbox is `/admin/submissions`; its authenticated `/admin/submissions/export` endpoint downloads a private backup. Keep that export outside GitHub and public files. Export and migrate these new intake records before deleting Render: they are not automatically copied into the older GitHub migration archive.

## Delivery and privacy

The existing `withSubmissionLock` export now intercepts browser submissions and sends them to `/intake/opportunity`, `/intake/provider` or `/intake/offer`. `/intake/challenge` supplies a short-lived, origin-bound signed token; the server signing secret never enters browser code. Allowed origins are the current public Framer site and Framer editor. A custom domain requires updating the allowlist before switching domains.

The receiver checks consent, schemas, HTTPS links, request size, a honeypot, delivery identity and request limits. CORS and challenge tokens limit browser misuse; they do not authenticate submitter identities or prevent all scripted spam. Duplicate delivery retries are idempotent, and likely duplicate submissions are flagged for review. Unknown or unreviewed submissions never publish automatically. Failed responses do not claim successful storage.

The existing signed webhook routes remain frozen during the GitHub migration. The public browser intake and private review/login routes operate independently; Render Instagram publishing remains frozen, with scheduling on GitHub. No additional hosting service or subscription was created. The existing Render service and persistent disk retain their existing costs.

Set secrets only through secure Render environment settings; never paste them in chat or commit them. Existing CANCHA_WEBHOOK_SECRET and administrator credentials are reused. The server logs no submitted contact values. Restrict administrator access, establish a contact-data retention policy, and keep private backups encrypted outside the service document root.

## Validation

All 51 repository tests passed, including public intake, required consent, origin/token checks, duplicate delivery handling, body limits, migration behavior, private administrator login/review/export, and absence of automatic publication. Framer type checking passed. Production delivery must still be checked after deployment and Framer publication; local tests do not establish live delivery.
