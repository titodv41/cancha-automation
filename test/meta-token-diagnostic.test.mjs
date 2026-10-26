import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectMetaTokens} from '../server/meta-token-diagnostic.mjs';
const fixture = {appSecret: 'fixture-app-secret', expected: {appId: '123', pageId: '456'}, version: 'v26.0',
  tokens: [{name: 'stored-publisher', value: 'fixture-existing-token'}, {name: 'saved-replacement', value: 'fixture-replacement-token'}]};

test('server-side token inspection uses only batched GET reads with credentials outside HTTP URLs and receipts', async () => {
  const result = await inspectMetaTokens({...fixture, fetchImpl: async (url, options) => {
    assert.equal(url.href, 'https://graph.facebook.com/v26.0/');
    assert.equal(options.method, 'POST');
    assert.equal(options.redirect, 'error');
    assert.equal(options.headers.Authorization, 'Bearer 123|fixture-app-secret');
    const batch = JSON.parse(new URLSearchParams(options.body).get('batch'));
    assert.deepEqual(batch.map(r => r.method), ['GET', 'GET']);
    assert.deepEqual(batch.map(r => r.relative_url), fixture.tokens.map(t => 'debug_token?input_token=' + t.value));
    return Response.json(batch.map(() => ({code: 200, body: JSON.stringify({data: {is_valid: true, app_id: '123', profile_id: '456', scopes: ['instagram_basic', 'instagram_manage_insights', 'unrelated-scope'], expires_at: 0, access_token: 'fixture-replacement-token', user_id: 'private-person', metadata: 'private-extra'}})})));
  }});
  assert.equal(result.status, 'inspected');
  assert.equal(result.inspected[0].appMatches, true);
  assert.equal(result.inspected[0].pageMatches, true);
  assert.equal(result.inspected[0].insightsGranted, true);
  assert.deepEqual(result.inspected[0].scopes, ['instagram_basic', 'instagram_manage_insights']);
  assert.equal(result.connectionUpdated, false);
  assert.equal(result.publishingAttempted, false);
  assert.doesNotMatch(JSON.stringify(result), /fixture-|private-|unrelated-scope/);
});

test('wrong app, missing permission and invalid token remain distinct diagnostic facts', async () => {
  const result = await inspectMetaTokens({...fixture, fetchImpl: async () => Response.json([
    {code: 200, body: JSON.stringify({data: {is_valid: false, app_id: '999', profile_id: 'other-page', scopes: ['instagram_basic'], expires_at: 1794000000}})},
    {code: 400, body: JSON.stringify({error: {code: 190, message: 'fixture-app-secret private-error'}})}
  ])});
  assert.equal(result.status, 'partially_unavailable');
  assert.equal(result.inspected[0].appMatches, false);
  assert.equal(result.inspected[0].pageMatches, false);
  assert.equal(result.inspected[0].valid, false);
  assert.equal(result.inspected[0].insightsGranted, false);
  assert.match(result.inspected[0].expiresAt, /^2026-/);
  assert.equal(result.inspected[1].errorCode, 190);
  // checkedAt is the wall clock and can legitimately contain "999" milliseconds.
  assert.doesNotMatch(JSON.stringify({...result, checkedAt: null}), /fixture-|private-|other-page|999/);
});

test('missing app authorization and provider failures disclose no inspected credentials', async () => {
  let calls = 0;
  await assert.rejects(inspectMetaTokens({...fixture, appSecret: '', fetchImpl: async () => { calls++; }}), {code: 'META_DIAGNOSTIC_APP_SECRET_MISSING'});
  assert.equal(calls, 0);
  await assert.rejects(inspectMetaTokens({...fixture, fetchImpl: async () => {throw Error('fixture-existing-token fixture-app-secret');}}), e => e.code === 'META_DIAGNOSTIC_REQUEST_FAILED' && !e.message.includes('fixture'));
  await assert.rejects(inspectMetaTokens({...fixture, fetchImpl: async () => Response.json({error: {message: 'fixture-app-secret'}}, {status: 403})}), {code: 'META_DIAGNOSTIC_APP_AUTH_OR_BATCH_REJECTED'});
});
