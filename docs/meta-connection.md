# Connect Cancha to Meta Business Suite

You have access to @wearecancha; account/Page connection is still required for our prepared Facebook Login publishing route.

1. On Instagram, open **@wearecancha → profile → menu → Settings and activity → Account type and tools**. If it is personal, select **Switch to professional account**. Choose **Business** if you want automated Stories; the prepared Meta API route supports feed publishing for professional accounts but Stories only for Business accounts. Labels can vary by app version.
2. On Facebook, create a **Cancha Page** if you do not already own one. A Facebook Page is the business identity; your personal account administers it. Linking does not require posting to Facebook or making your personal profile public.
3. Switch into that Page. Open **Settings → Linked accounts → Instagram → Connect account**. Sign in to **@wearecancha**, check the account name carefully and approve the connection. You need appropriate control of both accounts. Instagram **Edit profile → Page** is another way to connect/select the Page.
4. Open https://business.facebook.com/ . Select Cancha, then **Settings → Accounts** (or **Business assets**) and confirm the Page and Instagram account are present. If using a business portfolio, assign yourself the needed management/content access. Complete any security checks Meta requests.
5. Open **Planner → Create post**, select Instagram, add one reviewed image/caption, and use **Schedule**. Scheduled content appears in **Planner**; also check **Content → Posts & reels → Scheduled**. Interface labels and supported formats can vary. Our six prepared drafts are not already in Meta Planner, and no post has been scheduled.

Meta Business Suite can handle manual scheduling as soon as your connection is working. Connecting accounts does not connect this repository automatically. The custom queue additionally requires a deployed private service and a correctly authorized Meta developer app/integration, including applicable permissions and token management. The OAuth callback/refresh flow is not implemented here; do not claim a permanent token or automatic reconnection.

For the prepared API route, use the current official Meta documentation, a professional account linked to a Page, the actual Instagram account ID, an authorized Page access token and supported Graph API version. Store tokens only in the hosting provider's secret manager, never in chat, the repository or an ordinary text file. The separate hosted worker must keep human approval mandatory and remain disabled until account authorization and a reviewed live test are complete.

Official API reference: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/content-publishing/

Meta also offers an Instagram Login API route with different connection/authentication requirements. A Facebook Page is required by the Facebook Login route we prepared, not by every possible Instagram integration. No Meta permissions, credentials or real publication have been tested for your account yet.
