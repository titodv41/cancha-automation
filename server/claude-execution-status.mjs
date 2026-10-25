// Public-safe receipt from the official action's private SDK execution file.
// Never return provider prose, prompts, model output, IDs or credentials.
export function claudeExecutionStatus(messages) {
  const result = Array.isArray(messages)
    ? messages.findLast(row => row?.type === 'result')
    : null;
  const apiStatus = Number.isInteger(result?.api_error_status)
    && result.api_error_status >= 400 && result.api_error_status <= 599
    ? result.api_error_status : null;
  const structured = result?.structured_output;
  const returnedStructuredOutput = !!structured && typeof structured === 'object'
    && !Array.isArray(structured);
  const successful = result?.subtype === 'success' && result?.is_error === false;
  let outcome = 'no_result';
  if (result) {
    if (apiStatus === 429) outcome = 'rate_limited';
    else if (apiStatus === 401 || apiStatus === 403) outcome = 'authorization_rejected';
    else if (apiStatus >= 500) outcome = 'provider_unavailable';
    else if (result.subtype === 'error_max_turns') outcome = 'turn_limit';
    else if (!successful) outcome = 'execution_error';
    else outcome = returnedStructuredOutput ? 'returned_structured_output' : 'missing_structured_output';
  }
  return {
    outcome,
    resultPresent: !!result,
    apiStatus,
    returnedStructuredOutput,
    turns: Number.isInteger(result?.num_turns) && result.num_turns >= 0
      && result.num_turns <= 1000 ? result.num_turns : null,
    productionChanged: false,
    automaticRetry: false,
    paidFallback: false,
  };
}
