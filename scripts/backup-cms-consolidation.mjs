import { withProject } from './project-session.mjs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
// Step 1 of docs/cms-consolidation-plan-2026-10-25.md. Read-only: snapshots the CMS,
// page scenes, code files and release contract. Never writes to Framer.
// --encrypted-store seals the snapshot into the automation-state backup store instead of
// writing local files; raw snapshots must never be uploaded as public workflow artifacts.
const retiring = ['Providers', 'Stories', 'Offers'];
const requiredPaths = [...retiring.map(x => `/${x.toLowerCase()}`), ...retiring.map(x => `/${x.toLowerCase()}/:slug`)];
const encrypted = process.argv.includes('--encrypted-store');
await withProject(async f => {
  const capturedAt = new Date().toISOString();
  const snapshot = { capturedAt, kind: 'cms-consolidation', fields: [], items: [], collections: {}, scenes: {}, codeFiles: [], releaseContract: null };
  const manifest = { capturedAt, collections: {}, pages: [], codeFiles: 0, published: false };
  for (const c of await f.getCollections()) {
    const fields = await c.getFields(), items = await c.getItems();
    snapshot.collections[c.id] = { name: c.name, fields, items };
    snapshot.fields.push(...fields.map(x => ({ collectionId: c.id, ...x })));
    snapshot.items.push(...items.map(x => ({ collectionId: c.id, ...x })));
    manifest.collections[c.name] = { id: c.id, items: items.length, fields: fields.map(x => `${x.name}:${x.type}`), ...(retiring.includes(c.name) ? { slugs: items.map(x => x.slug) } : {}) };
  }
  const pages = await f.getNodesWithType('WebPageNode');
  // Framer Basic (framer.com/pricing, Oct 25 2026): 30 pages, 2 collections, 1,000 items.
  // Assumes a CMS template counts as one page; re-check on framer.com before buying.
  manifest.pageCount = pages.length;
  manifest.allPaths = pages.map(x => x.path).sort();
  manifest.basicFit = { pagesAfter: pages.length - 3 + 5, pageLimit: 30, itemLimit: 1000 };
  for (const page of pages.filter(x => requiredPaths.includes(x.path))) {
    // Template pages report "/providers/:slug" but the agent addresses them as "/providers/:Providers".
    const name = retiring.find(x => page.path.startsWith(`/${x.toLowerCase()}/:`));
    const pagePath = name ? `/${name.toLowerCase()}/:${name}` : page.path;
    try {
      snapshot.scenes[page.id] = { path: page.path, scene: await f.agent.serialize({ id: page.id, depth: 25 }, { pagePath }) };
      manifest.pages.push({ id: page.id, path: page.path });
    } catch (error) {
      manifest.pages.push({ id: page.id, path: page.path, error: String(error.message).slice(0, 200) });
    }
  }
  const files = await f.getCodeFiles();
  snapshot.codeFiles = files.map(x => ({ id: x.id, name: x.name, content: x.content }));
  manifest.codeFiles = files.length;
  snapshot.releaseContract = JSON.parse(await readFile('config/discovery-release-contract.json', 'utf8'));
  manifest.totalItems = snapshot.items.length;
  manifest.basicFit.itemsAfter = manifest.totalItems - retiring.reduce((sum, name) => sum + (manifest.collections[name]?.items || 0), 0);
  manifest.basicFit.collectionsAfter = Object.keys(manifest.collections).filter(name => !retiring.includes(name)).length;
  const captured = new Set(manifest.pages.filter(x => !x.error).map(x => x.path));
  manifest.missing = [...requiredPaths.filter(x => !captured.has(x)), ...retiring.filter(x => !manifest.collections[x])];
  manifest.complete = manifest.missing.length === 0;
  snapshot.manifest = manifest;
  if (encrypted) {
    const { githubStateClient } = await import('./github-state-client.mjs');
    const client = githubStateClient();
    try { manifest.store = await client.saveBackup(snapshot); } finally { await client.close(); }
  } else {
    const dir = `backups/cms-consolidation-${Date.now()}`;
    await mkdir(dir, { recursive: true, mode: 0o700 });
    await writeFile(`${dir}/snapshot.json`, JSON.stringify(snapshot), { mode: 0o600 });
    manifest.dir = dir;
  }
  console.log(JSON.stringify(manifest, null, 2));
  // A partial snapshot is kept for diagnosis but never counts as a completed step 1.
  if (!manifest.complete) { console.error(`Backup incomplete; missing: ${manifest.missing.join(', ')}`); process.exitCode = 1; }
});
