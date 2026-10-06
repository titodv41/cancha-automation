process.on('uncaughtException', error => { const message=String(error.message).replaceAll(process.env.FRAMER_API_KEY || '__no_key__','[REDACTED]'); console.error(JSON.stringify({code:error.code,message})); process.exit(1); });
import { installTransport } from './transport.mjs';
import { projectId, expectedInfoId } from './read-project.mjs';
export async function withProject(fn) {
  if (!process.env.FRAMER_API_KEY) throw new Error('Missing secure Framer credential');
  process.env.FRAMER_API_LOG_LEVEL = 'silent';
  installTransport();
  const { connect } = await import('framer-api');
  const f = await connect(projectId, process.env.FRAMER_API_KEY);
  try {
    const info = await f.getProjectInfo();
    if (info.id !== expectedInfoId) throw new Error('Unexpected project identity');
    return await fn(f);
  } finally { await f.disconnect(); }
}
