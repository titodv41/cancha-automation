import test from 'node:test';
import assert from 'node:assert/strict';
import { readProject, projectId, expectedInfoId } from '../scripts/read-project.mjs';

test('missing credential prevents any connection', async () => {
  await assert.rejects(readProject(() => assert.fail('must not connect'), ''), { code: 'MISSING_CREDENTIAL' });
});
test('only reads project info and disconnects', async () => {
  const calls = [];
  const result = await readProject(async (id, key) => {
    assert.equal(id, projectId); assert.equal(key, 'test-only');
    return new Proxy({
      getProjectInfo: async () => { calls.push('read'); return { id: expectedInfoId, name: 'Cancha' }; },
      disconnect: async () => { calls.push('disconnect'); },
    }, { get(target, name) { if (name === 'then') return undefined; assert.ok(name in target, `Unexpected API: ${String(name)}`); return target[name]; } });
  }, 'test-only');
  assert.deepEqual(calls, ['read', 'disconnect']);
  assert.deepEqual(result, { projectId, readable: true });
});
test('disconnects when read fails', async () => {
  let closed = false;
  await assert.rejects(readProject(async () => ({ getProjectInfo: async () => { throw new Error('read failure'); }, disconnect: async () => { closed = true; } }), 'test-only'), /read failure/);
  assert.equal(closed, true);
});
test('rejects unexpected project identity', async () => {
  await assert.rejects(readProject(async () => ({ getProjectInfo: async () => ({ id: 'other', name: 'Other' }), disconnect: async () => {} }), 'test-only'), /identity/);
});
