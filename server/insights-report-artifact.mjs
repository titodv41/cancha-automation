import {sealState} from './github-state.mjs';

export function insightsReportArtifact(report, key) {
  const statuses = ['available', 'permission_required', 'connection_needs_attention', 'metrics_unavailable', 'no_published_posts'];
  if (report?.readOnly !== true || !statuses.includes(report.status) || !Array.isArray(report.posts) || !Number.isFinite(Date.parse(report.collectedAt))) throw Error('Invalid read-only Insights report');
  const status = {
    collectedAt: report.collectedAt, readOnly: true, status: report.status, posts: report.posts.length,
    postsWithCoreMetrics: report.posts.filter(p => ['reach', 'saved', 'shares'].every(m => Number.isFinite(p.metrics?.[m]) && p.metrics[m] >= 0)).length,
    requiredPermission: report.requiredPermission === 'instagram_manage_insights' ? report.requiredPermission : null,
    comparableTopics: Array.isArray(report.topicComparison) ? report.topicComparison.length : 0
  };
  return {envelope: sealState({schema: 1, queue: [], artifactType: 'cancha-instagram-insights', report}, key), status};
}
