import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareMetaInsightsFromUser, checkMetaPageCredential} from '../server/meta-insights-user-connection.mjs';

const core = ['instagram_basic', 'instagram_content_publish', 'instagram_manage_insights', 'pages_show_list', 'pages_read_engagement'];
const connection = {pageId: '123', accountId: '456', username: 'wearecancha', version: 'v26.0', pageToken: 'fixture-original-publisher'};
const expected = {pageId: '123', instagramAccountId: '456', username: 'wearecancha', appId: '789'};
const now = new Date('2026-10-25T00:00:00Z');
const published = [{id: 'post-one', published_id: '1000', published_at: '2026-10-23T12:30:00Z', content: JSON.stringify({topic: 'community'})}];
const input = {connection, expected, now, published, userToken: 'fixture-short-user', appSecret: 'fixture-app-secret'};
function fixture({userScopes = core, pageScopes = core, pageExpiry = 0, userApp = '789', rejectExtension = false, calls = []} = {}) {
  return async (url, options) => {
    assert.equal(url.hostname, 'graph.facebook.com');
    assert.equal(options.redirect, 'error');
    assert.ok(!url.href.includes('fixture-'));
    calls.push(url.pathname);
    if (options.method === 'POST') {
      assert.equal(options.headers.Authorization, 'Bearer 789|fixture-app-secret');
      const batch = JSON.parse(new URLSearchParams(options.body).get('batch'));
      assert.equal(batch.length, 1);
      assert.equal(batch[0].method, 'GET');
      const request = new URL(batch[0].relative_url, 'https://graph.facebook.com/');
      if (request.pathname === '/debug_token') {
        const page = request.searchParams.get('input_token') === 'fixture-derived-page';
        return Response.json([{code: 200, body: JSON.stringify({data: {is_valid: true, app_id: page ? '789' : userApp,
          ...(page ? {profile_id: '123'} : {}), scopes: page ? pageScopes : userScopes, expires_at: page ? pageExpiry : 1792890000}})}]);
      }
      assert.equal(request.pathname, '/oauth/access_token');
      assert.equal(request.searchParams.get('fb_exchange_token'), 'fixture-short-user');
      assert.equal(request.searchParams.get('client_secret'), 'fixture-app-secret');
      if (rejectExtension) return Response.json([{code: 400, body: JSON.stringify({error: {message: 'fixture-app-secret private-provider-text'}})}]);
      return Response.json([{code: 200, body: JSON.stringify({access_token: 'fixture-long-user', expires_in: 5184000})}]);
    }
    assert.equal(options.method, undefined);
    if (url.pathname.endsWith('/123')) {
      const deriving = url.searchParams.get('fields').includes('access_token');
      assert.equal(options.headers.Authorization, deriving ? 'Bearer fixture-long-user' : 'Bearer fixture-derived-page');
      return Response.json({id: '123', access_token: 'fixture-derived-page', instagram_business_account: {id: '456', username: 'wearecancha'}});
    }
    assert.equal(options.headers.Authorization, 'Bearer fixture-derived-page');
    if (url.pathname.endsWith('/me')) return Response.json({id: '123'});
    if (url.pathname.endsWith('/456')) return Response.json({id: '456', username: 'wearecancha'});
    assert.ok(url.pathname.endsWith('/1000/insights'));
    return Response.json({data: [{name: url.searchParams.get('metric'), values: [{value: 30}]}]});
  };
}

test('one fresh User authorization derives a long-lived Page credential and proves actual Insights before returning it', async () => {
  const result = await prepareMetaInsightsFromUser({...input, fetchImpl: fixture()});
  assert.equal(result.connection.pageToken, 'fixture-derived-page');
  assert.equal(connection.pageToken, 'fixture-original-publisher');
  assert.equal(result.receipt.corePermissionsVerified, true);
  assert.equal(result.receipt.pageTokenExpiresAt, null);
  assert.equal(result.receipt.postsWithCoreMetrics, 1);
  assert.equal(result.receipt.publishingAttempted, false);
  assert.equal(result.connection.userAuthorizationExpiresAt, '2026-12-24T00:00:00.000Z');
  assert.doesNotMatch(JSON.stringify({receipt: result.receipt, report: result.report}), /fixture-|private/);
});

test('missing consent and a different app stop before token conversion or connection mutation', async () => {
  const calls = [];
  await assert.rejects(prepareMetaInsightsFromUser({...input, fetchImpl: fixture({userScopes: core.filter(p => p !== 'instagram_manage_insights'), calls})}), error => error.code === 'META_INSIGHTS_USER_PERMISSIONS_MISSING' && error.diagnostic.mentionedPermissions[0] === 'instagram_manage_insights');
  assert.equal(calls.length, 1);
  await assert.rejects(prepareMetaInsightsFromUser({...input, fetchImpl: fixture({userApp: '999'})}), {code: 'META_INSIGHTS_USER_APP_MISMATCH'});
  await assert.rejects(prepareMetaInsightsFromUser({...input, userToken: ''}), {code: 'META_INSIGHTS_USER_TOKEN_MISSING'});
  assert.equal(connection.pageToken, 'fixture-original-publisher');
});

test('short or unknown Page-token lifetime cannot replace the current publisher', async () => {
  const args = {token: 'fixture-derived-page', appSecret: input.appSecret, expected, version: connection.version, now};
  await assert.rejects(checkMetaPageCredential({...args, fetchImpl: fixture({pageExpiry: Math.floor(now.getTime() / 1000) + 3600})}), {code: 'META_INSIGHTS_TOKEN_TOO_SHORT_LIVED'});
  await assert.rejects(checkMetaPageCredential({...args, fetchImpl: fixture({pageExpiry: 'unknown'})}), {code: 'META_INSIGHTS_TOKEN_LIFETIME_UNKNOWN'});
  await assert.rejects(prepareMetaInsightsFromUser({...input, fetchImpl: fixture({pageScopes: core.filter(p => p !== 'instagram_content_publish')})}), {code: 'META_INSIGHTS_PERMISSION_REQUIRED'});
  assert.equal(connection.pageToken, 'fixture-original-publisher');
});

test('OAuth conversion failures do not disclose provider credentials or change the existing connection', async () => {
  await assert.rejects(prepareMetaInsightsFromUser({...input, fetchImpl: fixture({rejectExtension: true})}), error => error.code === 'META_INSIGHTS_USER_EXTENSION_FAILED' && !JSON.stringify(error).includes('fixture-'));
  assert.equal(connection.pageToken, 'fixture-original-publisher');
});
