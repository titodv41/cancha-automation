const scopes = ['pages_show_list', 'pages_read_engagement', 'instagram_basic', 'instagram_content_publish'];
const help = {
  META_CODE_MISSING: 'Start a new connection from the dashboard. The authorization code is missing.',
  META_CODE_EXCHANGE: 'Meta could not exchange the login code. Check that Render’s App ID and App Secret belong to the same Meta app, and that the exact callback URL is configured. Then start a new connection; do not refresh the callback page.',
  META_LONG_TOKEN: 'Meta could not extend the authorization. If using Facebook Login for Business, its configuration must issue a User access token. Start a new connection after checking the app configuration.',
  META_PAGE_ACCESS: 'Meta could not read your Pages. Enable pages_show_list, pages_read_engagement, instagram_basic and instagram_content_publish, and authorize the Cancha Page with an account that controls it.',
  META_NO_PAGES: 'Meta returned no accessible Pages. Authorize the Cancha Facebook Page in the login asset selection and confirm your Facebook account has Page control. Use a User access-token login configuration.',
  META_ACCOUNT_MISMATCH: 'The authorized Page must contain exactly the expected Instagram account @wearecancha. Check Page → Linked accounts, the assets selected during login, and any META_EXPECTED_PAGE_ID restriction in Render.',
  META_PERMISSIONS_MISSING: 'The Meta login did not grant all required permissions. Check the Facebook Login for Business configuration, then reconnect and allow the requested access.',
  META_INSTAGRAM_NOT_VISIBLE: 'Meta returned Facebook Pages but no accessible professional Instagram account. Confirm Instagram access is included in the login configuration and asset selection. The Page link can exist while this app lacks access.',
  META_INSTAGRAM_USERNAME_MISSING: 'Meta returned an Instagram account ID but did not allow its username to be read. Check Instagram permissions and the assets selected in the login configuration.',
  META_CANCHA_PAGE_ACCESS: 'Meta denied direct access to the confirmed Cancha Facebook Page. On Facebook, switch into Cancha → Settings → Page setup → Page access and check the authorizing profile’s Facebook access. Portfolio assignment alone does not establish this access. Also check that the Facebook Login for Business configuration permits Cancha’s assets.',
  META_EXPECTED_PAGE_NOT_VISIBLE: 'The authorized Page list does not include the confirmed Cancha Facebook Page. In Facebook Login for Business, include that Page in asset selection, then start a new connection.',
  META_INSTAGRAM_READ_FAILED: 'The confirmed Cancha Page token could not read the confirmed @wearecancha Instagram account. Check Instagram asset access in Facebook Login for Business and the authorizing user’s app/account access.',
  META_PAGE_TOKEN: 'Meta returned the Instagram account without usable Page publishing authorization. Check the required permissions and Page control, then reconnect.'
};
export class MetaConnectionError extends Error {
  constructor(code, details = {}) {
    super(help[code] || 'Meta connection could not be completed. Start a new connection from the dashboard.');
    this.code = Object.hasOwn(help, code) ? code : 'META_CONNECTION_FAILED';
    // Never include Meta's message, URL, response body, authorization code or token.
    this.pageCount = Number.isSafeInteger(details.pageCount) ? details.pageCount : null;
    this.instagramAccountCount = Number.isSafeInteger(details.instagramAccountCount) ? details.instagramAccountCount : null;
    this.missingPermissions = Array.isArray(details.missingPermissions) ? scopes.filter(scope => details.missingPermissions.includes(scope)) : [];
    this.metaCode = Number.isSafeInteger(details.code) && details.code >= 0 ? details.code : null;
    this.metaSubcode = Number.isSafeInteger(details.error_subcode) && details.error_subcode >= 0 ? details.error_subcode : null;
  }
}
export function createMetaAuthorization({appId, appSecret, version, baseUrl, loginConfigId, expectedUsername = 'wearecancha', expectedPageId, expectedAccountId, accountType, fetchImpl = fetch}) {
  if (!/^\d+$/.test(appId || '') || !appSecret || !/^v\d+\.\d+$/.test(version || '')) throw Error('Configure the real Meta app and supported Graph version');
  if ((expectedPageId && !/^\d+$/.test(expectedPageId)) || (expectedAccountId && !/^\d+$/.test(expectedAccountId))) throw Error('Configure valid confirmed account IDs');
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
      const pages = [];
      let after;
      for (let batch = 0; batch < 10; batch++) {
        const result = await request('me/accounts', {fields: 'id,name,access_token,instagram_business_account{id,username}', limit: '100', ...(after ? {after} : {})}, long.access_token, 'META_PAGE_ACCESS');
        if (Array.isArray(result.data)) pages.push(...result.data);
        if (!result.paging?.next) break;
        const cursor = result.paging?.cursors?.after;
        if (typeof cursor !== 'string' || cursor.length > 4096 || cursor === after || batch === 9) throw new MetaConnectionError('META_PAGE_ACCESS');
        after = cursor;
      }
      const uniquePages = [...new Map(pages.filter(page => /^\d+$/.test(page.id || '')).map(page => [page.id, page])).values()];
      // The authorized Page-list response is discovery, not proof that a
      // specific Page is inaccessible. Ask Meta for the owner-confirmed Page.
      if (expectedPageId && !uniquePages.some(page => page.id === expectedPageId && page.access_token)) {
        const direct = await request(expectedPageId, {fields: 'id,access_token,instagram_business_account{id,username}'}, long.access_token, 'META_CANCHA_PAGE_ACCESS');
        if (direct.id !== expectedPageId) throw new MetaConnectionError('META_CANCHA_PAGE_ACCESS');
        if (typeof direct.access_token !== 'string' || !direct.access_token) throw new MetaConnectionError('META_PAGE_TOKEN');
        const index = uniquePages.findIndex(page => page.id === expectedPageId);
        if (index === -1) uniquePages.push(direct);
        else uniquePages[index] = {...uniquePages[index], ...direct};
      }
      if (!uniquePages.length) throw new MetaConnectionError('META_NO_PAGES');
      for (const page of uniquePages) {
        if (page.instagram_business_account?.id || !page.access_token || (expectedPageId && page.id !== expectedPageId)) continue;
        // The Page-token read is separate from the User-token Page list.
        let result;
        try {result = await request(page.id, {fields: 'id,instagram_business_account{id,username}'}, page.access_token, 'META_PAGE_ACCESS');}
        catch (error) {if (expectedPageId === page.id) throw error;else continue;}
        if (result.id === page.id && result.instagram_business_account?.id) page.instagram_business_account = result.instagram_business_account;
        // For owner-confirmed IDs, directly verify the authorized account node
        // when the Page field was omitted. Still require both its ID and name.
        if (!page.instagram_business_account?.id && expectedPageId === page.id && expectedAccountId) {
          const account = await request(expectedAccountId, {fields: 'id,username'}, page.access_token, 'META_INSTAGRAM_READ_FAILED');
          if (account.id === expectedAccountId && typeof account.username === 'string') page.instagram_business_account = account;
        }
      }
      // Meta may return only the Instagram ID in the Page result. Resolve its
      // username with the Page token, retaining the exact account-name check.
      for (const page of uniquePages) {
        const instagram = page.instagram_business_account;
        if (instagram && /^\d+$/.test(instagram.id || '') && !instagram.username && page.access_token && (!expectedPageId || page.id === expectedPageId)) {
          try {
            const account = await request(instagram.id, {fields: 'id,username'}, page.access_token, 'META_PAGE_ACCESS');
            if (account.id === instagram.id && typeof account.username === 'string') instagram.username = account.username;
          } catch { /* Surface missing access below without upstream data. */ }
        }
      }
      const matches = uniquePages.filter(page => page.instagram_business_account?.username?.toLowerCase() === expectedUsername.toLowerCase() && (!expectedPageId || page.id === expectedPageId) && (!expectedAccountId || page.instagram_business_account.id === expectedAccountId));
      if (matches.length !== 1) {
        const detail = {pageCount: uniquePages.length, instagramAccountCount: uniquePages.filter(page => page.instagram_business_account?.id).length};
        try {
          const granted = await request('me/permissions', {}, long.access_token, 'META_PAGE_ACCESS');
          if (Array.isArray(granted.data) && granted.data.every(item => typeof item.permission === 'string' && typeof item.status === 'string')) detail.missingPermissions = scopes.filter(scope => !granted.data.some(item => item.permission === scope && item.status === 'granted'));
        } catch { /* Some configurations cannot read grants; do not guess. */ }
        let errorCode = 'META_ACCOUNT_MISMATCH';
        if (detail.missingPermissions?.length) errorCode = 'META_PERMISSIONS_MISSING';
        else if (!detail.instagramAccountCount) errorCode = 'META_INSTAGRAM_NOT_VISIBLE';
        else if (!uniquePages.some(page => page.instagram_business_account?.username)) errorCode = 'META_INSTAGRAM_USERNAME_MISSING';
        throw new MetaConnectionError(errorCode, detail);
      }
      const page = matches[0];
      if (!page.access_token || !/^\d+$/.test(page.instagram_business_account.id || '')) throw new MetaConnectionError('META_PAGE_TOKEN');
      return {username: expectedUsername, pageId: page.id, accountId: page.instagram_business_account.id, pageToken: page.access_token, accountType: accountType || 'UNCONFIRMED', version, connectedAt: new Date().toISOString(), userAuthorizationExpiresAt: long.expires_in ? new Date(Date.now() + Number(long.expires_in) * 1000).toISOString() : null};
    }
  };
}
