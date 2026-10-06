import { installTransport } from './transport.mjs';
import { readProject } from './read-project.mjs';

// Never emit SDK debug logs or raw exception details (may contain credentials).
process.env.FRAMER_API_LOG_LEVEL = 'silent';
installTransport();
const { connect } = await import('framer-api');
const deadline = setTimeout(() => {
  console.error('Connection check timed out after 45 seconds.');
  process.exit(1);
}, 45000);
try {
  console.log(JSON.stringify(await readProject(connect, process.env.FRAMER_API_KEY)));
} catch (error) {
  const known = new Set(['MISSING_CREDENTIAL', 'UNAUTHORIZED', 'TIMEOUT', 'PROJECT_CLOSED', 'POOL_EXHAUSTED', 'TOKEN_SESSION_LIMIT']);
  const code = known.has(error.code) ? error.code : 'CONNECTION_FAILED';
  console.error(`Read-only check failed: ${code}. See README.md for diagnostics.`);
  process.exitCode = 1;
} finally {
  clearTimeout(deadline);
}
