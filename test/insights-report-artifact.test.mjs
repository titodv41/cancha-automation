import test from 'node:test';
import assert from 'node:assert/strict';
import {insightsReportArtifact} from '../server/insights-report-artifact.mjs';
import {unsealState} from '../server/github-state.mjs';
const key = 'fixture-encryption-key-'.repeat(3);
const report = {collectedAt: '2026-10-25T00:45:00Z', readOnly: true, status: 'available', requiredPermission: null,
  posts: [{id: 'private-media-receipt', topic: 'private-topic', metrics: {reach: 1234, saved: 56, shares: 78}}], topicComparison: []};

test('Insights artifacts encrypt all metric values while the public status includes only access and sample counts', () => {
  const {envelope, status} = insightsReportArtifact(report, key);
  assert.deepEqual(unsealState(envelope, key).report, report);
  assert.equal(unsealState(envelope, key).artifactType, 'cancha-instagram-insights');
  assert.doesNotMatch(JSON.stringify({envelope, status}), /private-media-receipt|private-topic|reach|saved|shares/);
  assert.deepEqual(status, {collectedAt: report.collectedAt, readOnly: true, status: 'available', posts: 1, postsWithCoreMetrics: 1, requiredPermission: null, comparableTopics: 0});
});

test('missing metric values remain unavailable and neither invalid reports nor missing encryption keys can produce an artifact', () => {
  assert.equal(insightsReportArtifact({...report, posts: [{metrics: {reach: 10}}]}, key).status.postsWithCoreMetrics, 0);
  assert.throws(() => insightsReportArtifact(report, ''));
  assert.throws(() => insightsReportArtifact({...report, status: 'untrusted-private-text'}, key));
  assert.throws(() => insightsReportArtifact({...report, readOnly: false}, key));
});
