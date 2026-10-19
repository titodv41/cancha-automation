# Instagram analytics access: remaining owner step

On October 19 the actual read-only workflow returned `permission_required`, requiring `instagram_manage_insights`. Meta denied the first media-insights request. No reach/save/share figures were obtained; missing data is not zero performance. This permission is separate from content publishing. The website and email intake do not depend on it.

Use the existing **Instagram API with Facebook Login** route. Do not switch integrations or recreate the app. Meta labels can vary.

1. Open https://developers.facebook.com/apps/ and choose **Cancha Automation**. In its Instagram/Facebook Login permissions configuration, enable/request **`instagram_manage_insights`** while retaining the existing Instagram basic/publishing and Page permissions. Confirm your developer role and access to Cancha’s Page/Instagram asset if Meta asks. Own-account testing and public app access have different requirements; follow the access level Meta actually reports.
2. Reauthorize using that same app and your managing Facebook profile, including the **Cancha Page** and **@wearecancha** assets plus insights permission. The personal profile is the administrator; do not change to an unrelated app/account. The expected Page ID is `1283032084901437`; Instagram ID is `17841477139158414`. These are public identifiers.
3. Obtain the authorized **Cancha Page access token** through Meta’s secure developer tools/Graph API Explorer using the same app. If the tool offers “Get Page Access Token,” choose Cancha. A token generated without the new permission will not fix analytics. Do not paste the token, an OAuth callback address, App Secret or password in chat or a repository file.
4. In GitHub → `titodv41/cancha-automation` → Settings → Secrets and variables → Actions → **Repository secrets**, securely add/update **`META_PAGE_ACCESS_TOKEN`** with that Page token. Keep the Framer key and encrypted-state key unchanged. No new hosting service is needed.
5. In Actions → **Cancha Instagram on GitHub** → Run workflow, choose **`reconnect`**. It checks that the replacement token can access exactly @wearecancha, then stores it in the encrypted state; this action does not publish a post. When it succeeds, run **Cancha Instagram learning report**, or choose **`insights`** in the Instagram workflow. A new report must confirm actual metric access.

If Meta reports an access-level or permission error, share only its non-secret error text. Do not expose tokens in screenshots. An app permission toggle alone does not update a previously issued token. The old Render OAuth/dashboard is not required by this secure replacement-token workflow.

The daily read-only report and bounded content adjustments are implemented. Topic preference requires independent posts sampled in comparable age cohorts and enough examples in two topics. Real performance learning remains blocked until Meta grants the reads and enough data exists; no growth guarantee is made.

Official references:

- https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/insights/
- https://developers.facebook.com/docs/permissions/#instagram_manage_insights
- https://developers.facebook.com/docs/graph-api/tools/explorer/
