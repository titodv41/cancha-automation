# Connect Cancha's Instagram Insights

## Connected: verified October 24, 2026, 8:50 PM New York

[Live connection run 40148250680](https://github.com/titodv41/cancha-automation/actions/runs/40148250680) completed the fresh-consent exchange, exact Cancha app/Page/Instagram identity checks, all five required grants, durable Page-token lifetime verification and actual metric reads. **All five checked posts returned reach, saved and shares.** The receipt reports `connectionUpdated: true`, `corePermissionsVerified: true`, `pageTokenExpiresAt: null` and `publishingAttempted: false`. The verified Page credential is now in encrypted durable state; no post was published during connection.

The account setup is complete. Full metric artifacts are encrypted with the existing state key; the status receipt exposes only access/sample counts. Existing daily collection uses the stored connection. The instructions below are retained for future reauthorization, rather than a request for another credential now. Five usable reads establish access; they do not establish enough comparable samples to select a winning creative or prove growth.

## Setup history and renewal instructions

[Automatic diagnostic 40146137402](https://github.com/titodv41/cancha-automation/actions/runs/40146137402) succeeded at October 24, 2026, 8:18 PM New York after the owner securely supplied `META_APP_SECRET`. Both the encrypted publishing token and saved replacement are valid and belong to the correct app/Page. **Both lack `instagram_manage_insights`.** The saved replacement also expires at 9 PM New York that evening; the existing publisher has no scheduled expiry. Neither was replaced and no publication was attempted. This establishes missing token consent rather than a guessed Page/app mismatch. App Secret setup and automatic inspection are now working.

The owner no longer needs to recover an old token or use the debugger. A fresh **User** authorization lets the trusted workflow derive and verify the Page credential automatically:

1. Open [Graph API Explorer](https://developers.facebook.com/tools/explorer/). In **Meta App / Aplicación de Meta**, choose **Cancha Automation**.
2. In **User or Page / Usuario o página**, choose **Get User Access Token / Obtener token de acceso de usuario**. Keep the four working permissions and add **`instagram_manage_insights`** in the permissions selector. The complete list is:

   ```text
   instagram_basic
   instagram_content_publish
   instagram_manage_insights
   pages_show_list
   pages_read_engagement
   ```

3. Click **Generate Access Token / Generar token de acceso** after selecting the new permission. Complete Meta's login/consent as the personal profile that manages Cancha, including the Cancha Page and @wearecancha assets. Copying the previously displayed token without this new consent will keep the same missing permission.
4. Stay on **User** token. Copy the newly generated value from the **Access Token / Token de acceso** field near the top right of Explorer. No Page-token query, manual extension, debugger or code editing is needed.
5. Open [New GitHub repository secret](https://github.com/titodv41/cancha-automation/settings/secrets/actions/new), set **Name** to **`META_USER_ACCESS_TOKEN`**, paste the new value into **Secret**, then save. Update that exact repository secret if it already exists. Keep all other keys unchanged and never paste the value into chat.
6. Reply **“User token saved.”** Codex runs `github-instagram.yml` with **`connect-insights-user`**, then the existing read-only learning report.

The new workflow checks the User credential's exact app and five grants before conversion, extends it server-side with the existing App Secret, derives only the confirmed Cancha Page, verifies its exact app/Page, all publishing and Insights grants, and a known durable lifetime, then tests actual media metrics. The prior publisher remains stored until all checks pass and the encrypted checkpoint succeeds. Unknown expiry or a scheduled expiry under seven days is rejected. Token exchange uses a direct form-encoded POST to Meta's OAuth endpoint, with credentials in the request body. Metadata inspection uses batched GET reads with inspected tokens inside the batch body. No token/App Secret is written into the HTTP URL, receipts, logs or Claude input. Fresh consent and Meta approval are still account-owner steps; local tests alone do not establish a live new-user conversion.

After the owner enabled the correct non-business permission and updated the User authorization, [run 40147639130](https://github.com/titodv41/cancha-automation/actions/runs/40147639130) passed the exact-app and five-grant checks. It then stopped at the original batched OAuth exchange (`META_INSIGHTS_USER_EXTENSION_FAILED`) without changing the publisher. The permission blocker is resolved; this follow-up changes only the server exchange transport and preserves all downstream identity, lifetime, publishing-scope and real-metric gates. Further provider errors retain only numeric status/code details, never raw error text or credentials.

If Meta refuses `instagram_manage_insights` in the permission selector/consent, enable that exact permission in the existing Instagram use case and Facebook Login for Business configuration as described below. Share only its non-secret error text. Do not switch apps or generate an Instagram-Login token. The similarly named `instagram_business_manage_insights` belongs to a different integration.

Last checked October 24, 2026 at 7:26 PM New York. [Read-only run 40142759333](https://github.com/titodv41/cancha-automation/actions/runs/40142759333) returned `permission_required`, requiring **`instagram_manage_insights`**. Zero posts returned metrics. Some older media also returned error 100; that is not a zero engagement result. A green workflow means the diagnostic completed, not that Meta granted Insights.

The guarded connection was also exercised live at 7:32 PM: [run 40143137258](https://github.com/titodv41/cancha-automation/actions/runs/40143137258) returned **`META_INSIGHTS_TOKEN_MISSING`**, `connectionUpdated: false`, `publishingAttempted: false`. The replacement-token repository secret is absent from this workflow. The existing publishing connection remains in encrypted state. [Automation checks 40143121269](https://github.com/titodv41/cancha-automation/actions/runs/40143121269) passed; all **237 local tests** passed as well.

### After the owner saved the token

The owner subsequently confirmed the repository secret was saved. [Run 40144084171](https://github.com/titodv41/cancha-automation/actions/runs/40144084171) verified the replacement token's exact Cancha Page and linked Instagram identity, then stopped on an Insights permission denial before updating stored state. [Diagnostic run 40144253924](https://github.com/titodv41/cancha-automation/actions/runs/40144253924) confirmed Meta error **10**, with no particular permission named in the redacted diagnostic. Both receipts show `connectionUpdated: false` and `publishingAttempted: false`. The GitHub secret is present; the former missing-secret blocker is resolved. Actual reach/save/share reads remain blocked.

The next owner check is inside Meta's [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/): inspect the saved Page token privately and report only the **App name** and whether **Scopes** contains `instagram_manage_insights`. Do not share the token or a screenshot containing it. If the permission is absent, regenerate the User authorization with it before deriving a new Page token. If present, investigate the app access level, administrator/asset assignments and documented Business Manager permission conditions instead of repeatedly guessing at replacement tokens. Error 10 by itself does not prove which setting is missing. Raw provider error text, token values and trace IDs are not copied into reports.

All **238 tests** pass after adding the redacted diagnostic, including token preservation on denied reads and rejection of private provider content in receipts. Claude's loop expansion PR [#2](https://github.com/titodv41/cancha-automation/pull/2#pullrequestreview-5640653323) was reviewed without rewriting it; its temporary merge with current main also passed all 238 tests. This was a Codex workspace review, not verification of the unattended native Codex reviewer trigger.

Publishing is already connected. Keep the existing **Instagram API with Facebook Login** integration, Cancha Automation app and encrypted GitHub state. There is no need for Render, a new app, another paid service, or an Instagram password. The account step below must be done by its owner inside Meta; Codex cannot approve permissions on the owner's behalf.

## If the owner no longer has the copied token

GitHub does not reveal a saved repository secret, and the owner should not be asked to recover or paste it into chat. The `diagnose-insights` workflow action can inspect both the existing encrypted publishing credential and the saved replacement internally. Meta requires the app's own authorization for its token-debugging endpoint; a Page token alone is insufficient.

One-time owner setup for automatic diagnosis:

1. Open [Cancha Automation → app settings → Basic](https://developers.facebook.com/apps/2083779272510560/settings/basic/). In Spanish: **Configuración de la app → Básica**.
2. At **App Secret / Clave secreta de la app**, choose **Show / Mostrar** and copy the existing value. Do not reset the app secret or share it with either assistant.
3. Open [New GitHub repository secret](https://github.com/titodv41/cancha-automation/settings/secrets/actions/new). Name: **`META_APP_SECRET`**. Paste the copied value into **Secret**, then save. If that exact secret already exists, update it instead.
4. Reply **“App secret saved.”** Codex runs `github-instagram.yml` on main with action **`diagnose-insights`** and reads only `meta-token-diagnostic.json`.

The diagnostic performs only batched GET reads of Meta's `debug_token` endpoint. Inspected token values are in the HTTPS request body, app authorization is in the header, and neither appears in the HTTP URL, report or job summary. Only allowlisted permission names, validity/expiry and expected app/Page match booleans are returned. It never replaces a connection or publishes content. The App Secret is bound only to diagnostic and guarded Insights-connection modes, not to Claude or routine publishing. Account permissions still have to be granted in Meta if the diagnostic confirms they are missing.

Official debugging reference: https://developers.facebook.com/docs/graph-api/reference/debug_token/.

## One-time owner steps

### 1. Add the analytics permission to the existing app

Open [Meta apps](https://developers.facebook.com/apps/) and select **Cancha Automation** (the existing app ID shown in the owner's setup was `2083779272510560`). Open its Instagram use case's **Customize / Permissions and features** section. Meta can change these labels. Add/enable **`instagram_manage_insights`**.

Keep these existing permissions too:

```text
instagram_basic
instagram_content_publish
pages_show_list
pages_read_engagement
```

If Facebook Login for Business uses a **Configuration**, include the new permission in that configuration's permissions and include the Cancha Page/Instagram assets. An app permission toggle alone does not update a token already issued.

Meta documents Standard Access for accounts you own/manage and have added to your app, and Advanced Access for accounts outside that scope. Keep your administrator/developer role and the Cancha assets assigned. Do not start a public-app/business-verification process merely because you are using your own account. If the console requires review or refuses a permission, share only the non-secret error text so we can address its actual requirement.

### 2. Generate a fresh authorization for the same app

Open [Graph API Explorer](https://developers.facebook.com/tools/explorer/).

1. In **Meta App**, choose **Cancha Automation**, rather than the default Graph API Explorer app.
2. In **User or Page**, first choose **Get User Access Token**. Add `instagram_manage_insights` and retain all four permissions above.
3. Choose **Generate Access Token**, continue as your managing **personal Facebook profile**, then select the **Cancha Page** and **@wearecancha** when Meta asks about assets. Your personal profile is the administrator; logging in as it is correct.
4. With that **User** token still selected, run this GET query in the Explorer query field:

   ```text
   me/permissions
   ```

   Confirm `instagram_manage_insights` has `status: granted`. If it is missing/declined, correct the permission/login configuration before proceeding. Do not copy the token or full debug output into chat.
5. To avoid replacing the working connection with an hours-long test token, use Meta's [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/) to inspect the User token. If **Extend Access Token** is available, use it. Meta's documented long-lived User token lasts about 60 days; a Page token generated from a long-lived User token has no scheduled expiry, though permissions, security changes and other conditions can still invalidate it. If Meta does not offer extension, stop before replacing the production credential and share only the expiry label and non-secret error. Do not run token-exchange commands in chat or put an App Secret in a URL.
6. Put the resulting **long-lived User token** in the Explorer's secure token field. Retrieve the Cancha Page token using this GET query (the response contains a secret; keep it inside Meta):

   ```text
   1283032084901437?fields=id,name,access_token,instagram_business_account{id,username}
   ```

   Confirm Page ID `1283032084901437` and Instagram username `wearecancha`, ID `17841477139158414`. Copy only that Page's **`access_token`** value into GitHub below. Do not send the response or a screenshot of it to either assistant. An unrelated Page token or the personal User token will be rejected by the new connection check.

### 3. Save the Page token securely in GitHub

Open [Cancha repository Actions secrets](https://github.com/titodv41/cancha-automation/settings/secrets/actions).

- If **`META_PAGE_ACCESS_TOKEN`** exists: select its pencil/**Update** control and replace the value.
- If absent: select **New repository secret**, name it **`META_PAGE_ACCESS_TOKEN`**, paste the Cancha **Page** token into **Secret**, then save.
- This belongs in **repository secrets**, not an Environment, repository variable, workflow input, source file or chat message.
- Keep `CANCHA_GITHUB_STATE_KEY`, `FRAMER_API_KEY` and `CLAUDE_CODE_OAUTH_TOKEN` unchanged.

Reply **“Insights token saved.”** Codex can finish the connection from here. There is no need to perform the Actions steps manually.

## Codex completion and actual success criteria

Run [Cancha Instagram on GitHub](https://github.com/titodv41/cancha-automation/actions/workflows/github-instagram.yml) on `main` with action **`connect-insights`**. This uses only the existing GitHub secret, not a chat-provided token.

Before saving a replacement connection, it must:

1. Verify the token represents the exact Cancha **Page**, using a read of `/me`.
2. Verify that Page links to the expected @wearecancha account and that the replacement token can read that account.
3. Read real metrics from the five most recent recorded published posts. At least one must return numeric **reach**, **saved** and **shares**; numeric zero is valid data, while an empty dataset is not.
4. Only after these checks succeed, checkpoint the replacement connection encrypted using the existing compare-and-swap state mechanism. This action does not create a container, schedule content, publish, or change creative/CMS records.

Failed identity/permission/metric validation leaves the stored connection unchanged and produces a redacted `meta-insights-connection.json` receipt. A failed encrypted checkpoint requires inspecting its actual outcome before retrying. A verified receipt must show `connectionUpdated: true`, `publishingAttempted: false`, `pageMatched: true`, `instagramMatched: true` and a positive `postsWithCoreMetrics` count.

Then run [Cancha Instagram learning report](https://github.com/titodv41/cancha-automation/actions/workflows/instagram-insights.yml) and verify `instagram-insights-status.json`, rather than the green badge alone: `status: available` and a positive `postsWithCoreMetrics` count establish actual access. The full metric report is encrypted as `instagram-insights.enc.json` with the existing state key before artifact upload. Only non-sensitive access/sample counts are exposed in the status receipt. Plaintext reports stay in the trusted runner's private workspace; comparable snapshots remain in encrypted durable state. The existing read-only daily collection will continue once access works; no second publisher is needed. Do not post private analytics exports to a public PR. Share only the approved minimum useful feedback with Claude.

## If a check fails

| Receipt code | Next step |
| --- | --- |
| `META_INSIGHTS_TOKEN_MISSING` | Save/update the exact repository secret above. |
| `META_INSIGHTS_PAGE_TOKEN_REQUIRED` | The secret represents a personal User or another Page. Retrieve the Cancha Page token from the authorized long-lived User token. |
| `META_INSIGHTS_ACCOUNT_MISMATCH` | Confirm the Page ID, linked Instagram ID/username, and assets selected during authorization. Do not disconnect the working Page link to guess at a fix. |
| `META_INSIGHTS_PERMISSION_REQUIRED` | Confirm `instagram_manage_insights` is granted for a newly issued token and enabled in the existing login configuration. |
| `META_INSIGHTS_IDENTITY_READ_FAILED` / `META_INSIGHTS_TOKEN_EXPIRED` | Inspect token validity privately in Meta. Share only non-secret error/expiry labels. |
| `META_INSIGHTS_METRICS_NOT_READABLE` | Investigate the media/API/access-level response; do not replace the working token or treat unavailable metrics as zero. |
| `META_INSIGHTS_NO_PUBLISHED_MEDIA` | Reconcile recorded publication receipts before attempting analytics. Do not create a test publication just to pass. |
| `META_INSIGHTS_USER_TOKEN_MISSING` | Save the fresh User authorization as `META_USER_ACCESS_TOKEN` using the current steps at the top. |
| `META_INSIGHTS_USER_PERMISSIONS_MISSING` | The newly generated User token still lacks one of the five required grants. Inspect only the redacted permission names; repeat consent with those selected. |
| `META_INSIGHTS_USER_APP_MISMATCH` | In Explorer choose Cancha Automation before generating the User authorization. |
| `META_INSIGHTS_USER_EXTENSION_FAILED` / `META_INSIGHTS_PAGE_DERIVATION_FAILED` | Inspect the actual guarded failure. Do not replace the existing publisher or ask the owner to run credential-bearing commands. |
| `META_INSIGHTS_TOKEN_TOO_SHORT_LIVED` / `META_INSIGHTS_TOKEN_LIFETIME_UNKNOWN` | Use the fresh User-consent route so the workflow can derive a durable, verified Page token. |

Meta's current Insights documentation lists additional `ads_management` / `ads_read` requirements when access to the linked Page was granted through Business Manager. If the five permissions above are granted but Meta still returns a role-specific denial, inspect that requirement. These are not instructions to create ads, ad spend, or request unrelated permissions in advance.

Performance learning needs enough independent posts at comparable ages: the current policy requires five posts per topic in at least two topics, or five per technique in at least two techniques. Access is the first dependency; a small dataset is not proof of a winner or guaranteed growth.

## Official references checked October 24

- [Instagram API with Facebook Login: Insights](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/insights/)
- [Permissions reference](https://developers.facebook.com/docs/permissions/#instagram_manage_insights)
- [Graph API Explorer guide](https://developers.facebook.com/docs/graph-api/guides/explorer/)
- [Long-lived User and Page tokens](https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived/)
