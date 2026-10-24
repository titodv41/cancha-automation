import {renewMetaConnection} from './meta-renewal.mjs';
import {collectInstagramInsights} from './instagram-insights.mjs';

export class MetaInsightsConnectionError extends Error {
  constructor(code, diagnostic) {
    super(code);
    this.code = code;
    this.diagnostic = diagnostic;
  }
}

// No connection is mutated, and every Meta request is a read. Only the caller
// can checkpoint the returned connection after all checks pass.
export async function verifyMetaInsightsConnection(connection, token, expected, published, {fetchImpl = fetch, now = new Date()} = {}) {
  const fail = (code, diagnostic) => { throw new MetaInsightsConnectionError(code, diagnostic); };
  if (!token) fail('META_INSIGHTS_TOKEN_MISSING');
  if (!/^v\d+\.\d+$/.test(connection?.version || '') || !/^\d+$/.test(expected?.pageId || '')
      || !/^\d+$/.test(expected?.instagramAccountId || '') || connection.pageId !== expected.pageId
      || connection.accountId !== expected.instagramAccountId || connection.username !== expected.username) {
    fail('META_INSIGHTS_ACCOUNT_MISMATCH');
  }
  const read = async (path, fields) => {
    const url = new URL(`https://graph.facebook.com/${connection.version}/${path}`);
    url.searchParams.set('fields', fields);
    try {
      const response = await fetchImpl(url, {headers: {Authorization: 'Bearer ' + token}, redirect: 'error', signal: AbortSignal.timeout(20000)});
      const body = await response.json();
      if (!response.ok || body.error) fail('META_INSIGHTS_IDENTITY_READ_FAILED');
      return body;
    } catch (error) {
      if (error instanceof MetaInsightsConnectionError) throw error;
      fail('META_INSIGHTS_IDENTITY_READ_FAILED');
    }
  };
  const identity = await read('me', 'id');
  if (identity.id !== expected.pageId) fail('META_INSIGHTS_PAGE_TOKEN_REQUIRED');
  const page = await read(expected.pageId, 'id,instagram_business_account{id,username}');
  if (page.id !== expected.pageId || page.instagram_business_account?.id !== expected.instagramAccountId
      || page.instagram_business_account?.username !== expected.username) fail('META_INSIGHTS_ACCOUNT_MISMATCH');
  let candidate;
  try { candidate = await renewMetaConnection(connection, token, expected, {fetchImpl}); }
  catch { fail('META_INSIGHTS_ACCOUNT_MISMATCH'); }
  const recent = [...published]
    .filter(row => /^\d+$/.test(row.published_id || '') && Number.isFinite(Date.parse(row.published_at)))
    .sort((a, b) => Date.parse(a.published_at) - Date.parse(b.published_at))
    .slice(-5);
  if (!recent.length) fail('META_INSIGHTS_NO_PUBLISHED_MEDIA');
  const report = await collectInstagramInsights(candidate, recent, {fetchImpl, now});
  if (report.status === 'permission_required') fail('META_INSIGHTS_PERMISSION_REQUIRED', report.permissionDiagnostic);
  if (report.status === 'connection_needs_attention') fail('META_INSIGHTS_TOKEN_EXPIRED');
  // A numeric zero is real data; an empty dataset is not. A verified token must
  // return the three metrics the learning comparisons actually require.
  const usable = report.posts.filter(post => ['reach', 'saved', 'shares'].every(metric => Number.isFinite(post.metrics[metric]) && post.metrics[metric] >= 0));
  if (!usable.length) fail('META_INSIGHTS_METRICS_NOT_READABLE');
  return {
    connection: candidate,
    report,
    receipt: {checkedAt: now.toISOString(), status: 'verified', metaReadOnly: true, pageMatched: true, instagramMatched: true,
      postsChecked: report.posts.length, postsWithCoreMetrics: usable.length, coreMetrics: ['reach', 'saved', 'shares'], publishingAttempted: false}
  };
}
