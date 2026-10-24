import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyMetaInsightsConnection} from '../server/meta-insights-connection.mjs';

const connection = {pageId: '123', accountId: '456', username: 'wearecancha', version: 'v26.0', pageToken: 'old-fixture-token'};
const expected = {pageId: '123', instagramAccountId: '456', username: 'wearecancha'};
const rows = Array.from({length: 8}, (_, i) => ({id: 'post-' + i, published_id: String(1000 + i), published_at: `2026-10-${String(10 + i).padStart(2, '0')}T16:00:00Z`, content: JSON.stringify({topic: 'community'})}));
const fixture = (override = () => undefined) => async (url, options) => {
  assert.equal(url.hostname, 'graph.facebook.com');
  assert.equal(options.method, undefined);
  assert.equal(options.redirect, 'error');
  assert.equal(options.headers.Authorization, 'Bearer new-fixture-token');
  assert.ok(!url.href.includes('fixture-token'));
  const custom = override(url);
  if (custom) return custom;
  if (url.pathname.endsWith('/me')) return Response.json({id: '123'});
  if (url.pathname.endsWith('/123')) return Response.json({id: '123', instagram_business_account: {id: '456', username: 'wearecancha'}});
  if (url.pathname.endsWith('/456')) return Response.json({id: '456', username: 'wearecancha'});
  return Response.json({data: [{name: url.searchParams.get('metric'), values: [{value: 0}]}]});
};

test('Insights reconnection verifies the exact Page and real metric reads without mutating the existing connection', async () => {
  const accessed = [];
  const result = await verifyMetaInsightsConnection(connection, 'new-fixture-token', expected, [...rows].reverse(), {fetchImpl: fixture(url => { accessed.push(url.pathname); })});
  assert.equal(result.connection.pageToken, 'new-fixture-token');
  assert.equal(connection.pageToken, 'old-fixture-token');
  assert.equal(result.receipt.postsChecked, 5);
  assert.equal(result.receipt.postsWithCoreMetrics, 5);
  assert.equal(result.receipt.publishingAttempted, false);
  assert.equal(result.report.posts[0].metrics.reach, 0);
  assert.ok(!accessed.some(path => /100[012]\/insights$/.test(path)));
  assert.ok(!JSON.stringify({receipt: result.receipt, report: result.report}).includes('fixture-token'));
});

test('a personal User token or wrong linked Instagram account cannot replace the publishing token', async () => {
  await assert.rejects(verifyMetaInsightsConnection(connection, 'new-fixture-token', expected, rows, {fetchImpl: fixture(url => url.pathname.endsWith('/me') ? Response.json({id: 'personal-user'}) : undefined)}), {code: 'META_INSIGHTS_PAGE_TOKEN_REQUIRED'});
  await assert.rejects(verifyMetaInsightsConnection(connection, 'new-fixture-token', expected, rows, {fetchImpl: fixture(url => url.pathname.endsWith('/123') ? Response.json({id: '123', instagram_business_account: {id: '999', username: 'other'}}) : undefined)}), {code: 'META_INSIGHTS_ACCOUNT_MISMATCH'});
  assert.equal(connection.pageToken, 'old-fixture-token');
});

test('a readable account without Insights permission is rejected with no upstream token/error disclosure', async () => {
  await assert.rejects(verifyMetaInsightsConnection(connection, 'new-fixture-token', expected, rows, {fetchImpl: fixture(url => url.pathname.endsWith('/insights') ? Response.json({error: {code: 200, message: 'new-fixture-token private details'}}, {status: 403}) : undefined)}), error => error.code === 'META_INSIGHTS_PERMISSION_REQUIRED' && !error.message.includes('fixture-token'));
  await assert.rejects(verifyMetaInsightsConnection(connection, 'new-fixture-token', expected, rows, {fetchImpl: fixture(url => url.pathname.endsWith('/me') ? Promise.reject(Error('new-fixture-token private details')) : undefined)}), error => error.code === 'META_INSIGHTS_IDENTITY_READ_FAILED' && !error.message.includes('fixture-token'));
  assert.equal(connection.pageToken, 'old-fixture-token');
});

test('empty metrics and expired tokens cannot be mistaken for usable Insights access', async () => {
  await assert.rejects(verifyMetaInsightsConnection(connection, 'new-fixture-token', expected, rows, {fetchImpl: fixture(url => url.pathname.endsWith('/insights') ? Response.json({data: []}) : undefined)}), {code: 'META_INSIGHTS_METRICS_NOT_READABLE'});
  await assert.rejects(verifyMetaInsightsConnection(connection, 'new-fixture-token', expected, rows, {fetchImpl: fixture(url => url.pathname.endsWith('/insights') ? Response.json({error: {code: 190}}, {status: 400}) : undefined)}), {code: 'META_INSIGHTS_TOKEN_EXPIRED'});
  await assert.rejects(verifyMetaInsightsConnection(connection, '', expected, rows), {code: 'META_INSIGHTS_TOKEN_MISSING'});
  await assert.rejects(verifyMetaInsightsConnection(connection, 'new-fixture-token', expected, [], {fetchImpl: fixture()}), {code: 'META_INSIGHTS_NO_PUBLISHED_MEDIA'});
  assert.equal(connection.pageToken, 'old-fixture-token');
});
