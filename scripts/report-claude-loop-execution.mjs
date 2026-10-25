import { appendFile, lstat, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { claudeExecutionStatus } from '../server/claude-execution-status.mjs';

let messages;
try {
  if (!process.env.RUNNER_TEMP) throw Error('Runner execution file unavailable');
  const expected = resolve(process.env.RUNNER_TEMP, 'claude-execution-output.json');
  const path = resolve(process.env.CLAUDE_EXECUTION_FILE || expected);
  const stat = await lstat(path);
  if (path !== expected || await realpath(path) !== expected || !stat.isFile()
      || stat.isSymbolicLink() || stat.size > 10_000_000) throw Error('Unexpected execution file');
  messages = JSON.parse(await readFile(path, 'utf8'));
} catch {
  // No raw errors or provider text: even an unavailable diagnostic stays private.
}
const receipt = { checkedAt: new Date().toISOString(), ...claudeExecutionStatus(messages) };
await mkdir('private-data/claude-loop', { recursive: true, mode: 0o700 });
await writeFile('private-data/claude-loop/execution-status.json', JSON.stringify(receipt, null, 2), { mode: 0o600 });
console.log(JSON.stringify(receipt));
if (process.env.GITHUB_STEP_SUMMARY) {
  await appendFile(process.env.GITHUB_STEP_SUMMARY, '\n## Claude execution status\n\n'
    + JSON.stringify(receipt) + '\n\nA rate limit waits for included usage to reset; authorization errors require account access. No retry or paid fallback was started.\n');
}
