import {inspectMetaTokens} from './meta-token-diagnostic.mjs';
import {verifyMetaInsightsConnection, MetaInsightsConnectionError} from './meta-insights-connection.mjs';

const fail = (code, diagnostic) => { throw new MetaInsightsConnectionError(code, diagnostic); };

export async function checkMetaPageCredential({token, appSecret, expected, version, fetchImpl = fetch, now = new Date()}) {
  const report = await inspectMetaTokens({appSecret, expected, version, tokens: [{name: 'saved-replacement', value: token}], fetchImpl, now});
  const info = report.inspected[0];
  if (info.status !== 'inspected' || !info.valid || !info.appMatches || info.pageMatches !== true) fail('META_INSIGHTS_ACCOUNT_MISMATCH');
  if (!Array.isArray(info.missingCorePermissions) || info.missingCorePermissions.length) fail('META_INSIGHTS_PERMISSION_REQUIRED', {mentionedPermissions: info.missingCorePermissions || []});
  if (!info.expiryKnown) fail('META_INSIGHTS_TOKEN_LIFETIME_UNKNOWN');
  if (info.expiresAt && Date.parse(info.expiresAt) - now.getTime() < 7 * 86400000) fail('META_INSIGHTS_TOKEN_TOO_SHORT_LIVED');
  return info;
}

// One fresh owner consent is enough: extend its User authorization, derive the
// exact Cancha Page token, and validate scopes, lifetime, identity and metrics.
// All credentials stay in memory. The caller checkpoints only a verified result.
export async function prepareMetaInsightsFromUser({connection, userToken, appSecret, expected, published, fetchImpl = fetch, now = new Date()}) {
  if (!userToken) fail('META_INSIGHTS_USER_TOKEN_MISSING');
  const version = connection.version;
  const debug = await inspectMetaTokens({appSecret, expected, version, tokens: [{name: 'saved-replacement', value: userToken}], fetchImpl, now});
  const user = debug.inspected[0];
  if (user.status !== 'inspected' || !user.valid || !user.appMatches) fail('META_INSIGHTS_USER_APP_MISMATCH');
  if (!Array.isArray(user.missingCorePermissions) || user.missingCorePermissions.length) fail('META_INSIGHTS_USER_PERMISSIONS_MISSING', {mentionedPermissions: user.missingCorePermissions || []});
  let long;
  try {
    const params = new URLSearchParams({grant_type: 'fb_exchange_token', client_id: expected.appId, client_secret: appSecret, fb_exchange_token: userToken});
    const response = await fetchImpl(new URL(`https://graph.facebook.com/${version}/oauth/access_token`), {
      method: 'POST', redirect: 'error', headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: params.toString(), signal: AbortSignal.timeout(20000)
    });
    long = await response.json();
    if (!response.ok || long.error) fail('META_INSIGHTS_USER_EXTENSION_FAILED', {
      stage: 'exchange', httpStatus: response.status,
      metaCode: Number.isInteger(long.error?.code) ? long.error.code : null,
      metaSubcode: Number.isInteger(long.error?.error_subcode) ? long.error.error_subcode : null
    });
    if (typeof long.access_token !== 'string' || !long.access_token || !Number.isFinite(long.expires_in) || long.expires_in < 7 * 86400) fail('META_INSIGHTS_USER_EXTENSION_FAILED');
  } catch (error) { if (error instanceof MetaInsightsConnectionError) throw error; fail('META_INSIGHTS_USER_EXTENSION_FAILED'); }
  let page;
  try {
    const url = new URL(`https://graph.facebook.com/${version}/${expected.pageId}`);
    url.searchParams.set('fields', 'id,access_token,instagram_business_account{id,username}');
    const response = await fetchImpl(url, {headers: {Authorization: 'Bearer ' + long.access_token}, redirect: 'error', signal: AbortSignal.timeout(20000)});
    page = await response.json();
    if (!response.ok || page.id !== expected.pageId || !page.access_token || page.instagram_business_account?.id !== expected.instagramAccountId
        || page.instagram_business_account?.username !== expected.username) fail('META_INSIGHTS_PAGE_DERIVATION_FAILED');
  } catch { fail('META_INSIGHTS_PAGE_DERIVATION_FAILED'); }
  const info = await checkMetaPageCredential({token: page.access_token, appSecret, expected, version, fetchImpl, now});
  const verified = await verifyMetaInsightsConnection(connection, page.access_token, expected, published, {fetchImpl, now});
  verified.connection.userAuthorizationExpiresAt = new Date(now.getTime() + long.expires_in * 1000).toISOString();
  verified.receipt = {...verified.receipt, authorizationSource: 'fresh-user-consent', appMatched: true, corePermissionsVerified: true, pageTokenExpiresAt: info.expiresAt};
  return verified;
}
