import test from 'node:test';
import assert from 'node:assert/strict';
import { claudeExecutionStatus } from '../server/claude-execution-status.mjs';

test('Claude SDK error flags and numeric API status override a misleading success subtype', () => {
  const result = { type: 'result', subtype: 'success', is_error: true, num_turns: 1 };
  assert.equal(claudeExecutionStatus([result]).outcome, 'execution_error');
  for (const [code, expected] of [[429, 'rate_limited'], [401, 'authorization_rejected'],
    [403, 'authorization_rejected'], [503, 'provider_unavailable']]) {
    assert.equal(claudeExecutionStatus([{ ...result, api_error_status: code }]).outcome, expected);
  }
  assert.equal(claudeExecutionStatus([{ ...result, api_error_status: '429' }]).apiStatus, null);
  assert.equal(claudeExecutionStatus([{ ...result, api_error_status: 200 }]).apiStatus, null);
});

test('Claude status never exports provider text, forged status prose, credentials or the proposal', () => {
  const receipt = claudeExecutionStatus([{ type: 'result', subtype: 'success', is_error: true,
    result: '429 session limit SECRET_VALUE', errors: ['SECRET_VALUE'], session_id: 'PRIVATE_ID',
    api_error_status: '429', structured_output: { prompt: 'PRIVATE_PROPOSAL' }, num_turns: 1 }]);
  assert.equal(receipt.outcome, 'execution_error');
  assert.equal(receipt.apiStatus, null);
  assert.equal(receipt.automaticRetry, false);
  assert.equal(receipt.paidFallback, false);
  assert.doesNotMatch(JSON.stringify(receipt), /SECRET_VALUE|PRIVATE_|session limit/);
  assert.equal(claudeExecutionStatus({ result: 'arbitrary' }).outcome, 'no_result');
});

test('only a non-error result with structured output passes the model-output boundary', () => {
  const result = { type: 'result', subtype: 'success', is_error: false, num_turns: 2 };
  assert.equal(claudeExecutionStatus([result]).outcome, 'missing_structured_output');
  assert.equal(claudeExecutionStatus([{ ...result, structured_output: [] }]).outcome, 'missing_structured_output');
  const receipt = claudeExecutionStatus([{ type: 'assistant', api_error_status: 429 },
    { ...result, structured_output: { status: 'proposal' } }]);
  assert.equal(receipt.outcome, 'returned_structured_output');
  assert.equal(receipt.productionChanged, false);
  assert.equal(claudeExecutionStatus([{ ...result, subtype: 'error_max_turns' }]).outcome, 'turn_limit');
});
