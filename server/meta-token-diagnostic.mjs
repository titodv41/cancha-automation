const permissions = ['instagram_basic', 'instagram_content_publish', 'instagram_manage_insights', 'pages_show_list', 'pages_read_engagement', 'ads_read', 'ads_management', 'business_management'];
export class MetaTokenDiagnosticError extends Error {
  constructor(code) { super(code); this.code = code; }
}

// Meta's debugger requires app authorization. Send the inspected tokens inside
// a read-only Graph batch body, never in the HTTP URL or diagnostic output.
export async function inspectMetaTokens({appSecret, expected, version, tokens, fetchImpl = fetch, now = new Date()}) {
  const fail = code => { throw new MetaTokenDiagnosticError(code); };
  if (!appSecret) fail('META_DIAGNOSTIC_APP_SECRET_MISSING');
  if (!/^\d+$/.test(expected?.appId || '') || !/^\d+$/.test(expected?.pageId || '') || !/^v\d+\.\d+$/.test(version || '')) fail('META_DIAGNOSTIC_CONFIG_INVALID');
  if (!Array.isArray(tokens) || !tokens.length || tokens.length > 2 || tokens.some(t => !['stored-publisher', 'saved-replacement'].includes(t.name) || typeof t.value !== 'string' || !t.value || t.value.length > 8192)) fail('META_DIAGNOSTIC_TOKEN_MISSING');
  const batch = tokens.map(t => ({method: 'GET', relative_url: 'debug_token?input_token=' + encodeURIComponent(t.value)}));
  let data;
  try {
    const response = await fetchImpl(new URL(`https://graph.facebook.com/${version}/`), {
      method: 'POST', headers: {Authorization: `Bearer ${expected.appId}|${appSecret}`, 'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({batch: JSON.stringify(batch), include_headers: 'false'}).toString(), redirect: 'error', signal: AbortSignal.timeout(20000)
    });
    data = await response.json();
    if (!response.ok || !Array.isArray(data) || data.length !== tokens.length) fail('META_DIAGNOSTIC_APP_AUTH_OR_BATCH_REJECTED');
  } catch (error) {
    if (error instanceof MetaTokenDiagnosticError) throw error;
    fail('META_DIAGNOSTIC_REQUEST_FAILED');
  }
  const inspected = data.map((row, index) => {
    let body;
    try { body = JSON.parse(row.body); } catch { fail('META_DIAGNOSTIC_INVALID_RESPONSE'); }
    if (row.code !== 200 || !body.data || typeof body.data.is_valid !== 'boolean') {
      return {name: tokens[index].name, status: 'unavailable', errorCode: Number.isInteger(body.error?.code) ? body.error.code : null};
    }
    const info = body.data, scopes = Array.isArray(info.scopes) ? permissions.filter(p => info.scopes.includes(p)) : null;
    const seconds = info.expires_at;
    return {name: tokens[index].name, status: 'inspected', valid: info.is_valid, appMatches: String(info.app_id) === expected.appId,
      pageMatches: info.profile_id == null ? null : String(info.profile_id) === expected.pageId,
      scopes, insightsGranted: scopes === null ? null : scopes.includes('instagram_manage_insights'),
      missingCorePermissions: scopes === null ? null : permissions.slice(0, 5).filter(p => !scopes.includes(p)),
      expiresAt: Number.isSafeInteger(seconds) && seconds > 0 && seconds < 253402300800 ? new Date(seconds * 1000).toISOString() : null};
  });
  return {checkedAt: now.toISOString(), status: inspected.every(t => t.status === 'inspected') ? 'inspected' : 'partially_unavailable',
    inspected, connectionUpdated: false, publishingAttempted: false};
}
