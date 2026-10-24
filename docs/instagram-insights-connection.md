# Connect Cancha's Instagram Insights

Last checked October 24, 2026 at 7:26 PM New York. [Read-only run 40142759333](https://github.com/titodv41/cancha-automation/actions/runs/40142759333) returned `permission_required`, requiring **`instagram_manage_insights`**. Zero posts returned metrics. Some older media also returned error 100; that is not a zero engagement result. A green workflow means the diagnostic completed, not that Meta granted Insights.

Publishing is already connected. Keep the existing **Instagram API with Facebook Login** integration, Cancha Automation app and encrypted GitHub state. There is no need for Render, a new app, another paid service, or an Instagram password. The account step below must be done by its owner inside Meta; Codex cannot approve permissions on the owner's behalf.

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

Then run [Cancha Instagram learning report](https://github.com/titodv41/cancha-automation/actions/workflows/instagram-insights.yml) and verify the actual metric report, rather than the green badge alone. The existing read-only daily collection will continue once access works; no second publisher is needed. Do not post private analytics exports to a public PR. Share only the approved minimum useful feedback with Claude.

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

Meta's current Insights documentation lists additional `ads_management` / `ads_read` requirements when access to the linked Page was granted through Business Manager. If the five permissions above are granted but Meta still returns a role-specific denial, inspect that requirement. These are not instructions to create ads, ad spend, or request unrelated permissions in advance.

Performance learning needs enough independent posts at comparable ages: the current policy requires five posts per topic in at least two topics, or five per technique in at least two techniques. Access is the first dependency; a small dataset is not proof of a winner or guaranteed growth.

## Official references checked October 24

- [Instagram API with Facebook Login: Insights](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/insights/)
- [Permissions reference](https://developers.facebook.com/docs/permissions/#instagram_manage_insights)
- [Graph API Explorer guide](https://developers.facebook.com/docs/graph-api/guides/explorer/)
- [Long-lived User and Page tokens](https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived/)
