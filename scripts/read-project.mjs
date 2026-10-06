export const projectId = 'GU8EIeQXaRbty0S23thu';
// getProjectInfo returns a hashed ID, not the ID in the project URL.
export const expectedInfoId = 'ca29f20eb767f10956c00481f348ab89c6c13a62c45d5fc9aabec0d23d1a9b87';

export async function readProject(connect, key) {
  if (!key?.trim()) {
    const error = new Error('Configure FRAMER_API_KEY securely in environment settings.');
    error.code = 'MISSING_CREDENTIAL';
    throw error;
  }
  const framer = await connect(projectId, key);
  try {
    const info = await framer.getProjectInfo();
    if (!info || typeof info.id !== 'string' || typeof info.name !== 'string') {
      throw new Error('Unexpected project information response');
    }
    if (info.id !== expectedInfoId) throw new Error('Unexpected project identity');
    return { projectId, readable: true };
  } finally {
    await framer.disconnect();
  }
}
