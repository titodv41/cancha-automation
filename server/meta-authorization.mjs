const scopes = ['pages_show_list', 'pages_read_engagement', 'instagram_basic', 'instagram_content_publish'];
const help = {
  META_CODE_MISSING: 'Start a new connection from the dashboard. The authorization code is missing.',
  META_CODE_EXCHANGE: 'Meta could not exchange the login code. Check that Render’s App ID and App Secret belong to the same Meta app, and that the exact callback URL is configured. Then start a new connection; do not refresh the callback page.',
  META_LONG_TOKEN: 'Meta could not extend the authorization. If using Facebook Login for Business, its configuration must issue a User access token. Start a new connection after checking the app configuration.',
  META_PAGE_ACCESS: 'Meta could not read your Pages. Enable pages_show_list, pages_read_engagement, instagram_basic and instagram_content_publish, and authorize the Cancha Page with an account that controls it.',
  META_NO_PAGES: 'Meta returned no accessible Pages. Authorize the Cancha Facebook Page in the login asset selection and confirm your Facebook account has Page control. Use a User access-token login configuration.',
  META_ACCOUNT_MISMATCH: 'The authorized Page must contain exactly the expected Instagram account @wearecancha. Check Page → Linked accounts, the assets selected during login, and any META_EXPECTED_PAGE_ID restriction in Render.',
  META_PAGE_TOKEN: 'Meta returned the Instagram account without usable Page publishing authorization. Check the required permissions and Page control, then reconnect.'
};
export class MetaConnectionError extends Error {
  constructor(code, details = {}) {
    super(help[code] || 'Meta connection could not be completed. Start a new connection from the dashboard.');
    this.code = Object.hasOwn(help, code) ? code : 'META_CONNECTION_FAILED';
    // Never include Meta's message, URL, response body, authorization code or token.
    this.metaCode = Number.isSafeInteger(details.code) && details.code >= 0 ? details.code : null;
    this.metaSubcode = Number.isSafeInteger(details.error_subcode) && details.error_subcode >= 0 ? details.error_subcode : null;
  }
}
export function createMetaAuthorization({appId, appSecret, version, baseUrl, loginConfigId, expectedUsername = 'wearecancha', expectedPageId, accountType, fetchImpl = fetch}) {
  if (!/^\d+$/.test(appId || '') || !appSecret || !/^v\d+\.\d+$/.test(version || '')) throw Error('Configure the real Meta app and supported Graph version');
  const base = new URL(baseUrl);
  if (base.protocol !== 'https:' || base.username || base.password || base.pathname !== '/') throw Error('Configure the deployed HTTPS service origin');
  const callback = base.origin + '/auth/meta/callback';
  async function proof(token) {
    const {createHmac} = await import('node:crypto');
    return createHmac('sha256', appSecret).update(token).digest('hex');
  }
  async function request(path, params, token, stage) {
    try {
      const url = new URL(`https://graph.facebook.com/${version}/${path}`);
      for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
      if (token) url.searchParams.set('appsecret_proof', await proof(token));
      const response = await fetchImpl(url, {headers: token ? {Authorization: 'Bearer ' + token} : {}, signal: AbortSignal.timeout(25000)});
      const data = await response.json();
      if (!response.ok || data.error) throw new MetaConnectionError(stage, data.error || {});
      return data;
    } catch (error) {
      if (error instanceof MetaConnectionError) throw error;
      throw new MetaConnectionError(stage);
    }
  }
  return {
    url(state) {
      const url = new URL(`https://www.facebook.com/${version}/dialog/oauth`);
      Object.entries({client_id: appId, redirect_uri: callback, response_type: 'code', state,
        ...(loginConfigId ? {config_id: loginConfigId} : {scope: scopes.join(',')})
      }).forEach(([key, value]) => url.searchParams.set(key, value));
      return url.href;
    },
    async exchange(code) {
      if (typeof code !== 'string' || !code || code.length > 4096) throw new MetaConnectionError('META_CODE_MISSING');
      const short = await request('oauth/access_token', {client_id: appId, client_secret: appSecret, redirect_uri: callback, code}, null, 'META_CODE_EXCHANGE');
      if (!short.access_token) throw new MetaConnectionError('META_CODE_EXCHANGE');
      const long = await request('oauth/access_token', {grant_type: 'fb_exchange_token', client_id: appId, client_secret: appSecret, fb_exchange_token: short.access_token}, null, 'META_LONG_TOKEN');
      if (!long.access_token) throw new MetaConnectionError('META_LONG_TOKEN');
      const pages = await request('me/accounts', {fields: 'id,name,access_token,instagram_business_account{id,username}'}, long.access_token, 'META_PAGE_ACCESS');
      if (!Array.isArray(pages.data) || pages.data.length === 0) throw new MetaConnectionError('META_NO_PAGES');
      const matches = pages.data.filter(page => page.instagram_business_account?.username?.toLowerCase() === expectedUsername.toLowerCase() && (!expectedPageId || page.id === expectedPageId));
      if (matches.length !== 1) throw new MetaConnectionError('META_ACCOUNT_MISMATCH');
      const page = matches[0];
      if (!page.access_token || !/^\d+$/.test(page.instagram_business_account.id || '')) throw new MetaConnectionError('META_PAGE_TOKEN');
      return {username: expectedUsername, pageId: page.id, accountId: page.instagram_business_account.id, pageToken: page.access_token, accountType: accountType || 'UNCONFIRMED', version, connectedAt: new Date().toISOString(), userAuthorizationExpiresAt: long.expires_in ? new Date(Date.now() + Number(long.expires_in) * 1000).toISOString() : null};
    }
  };
}
