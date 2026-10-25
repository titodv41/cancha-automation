import { withProject } from './project-session.mjs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
// Step 1 of docs/cms-consolidation-plan-2026-10-25.md. Read-only: snapshots the CMS,
// page scenes, code files and release contract. Never writes to Framer.
const retiring = ['Providers', 'Stories', 'Offers'];
const listingPaths = ['/providers', '/offers', '/stories', '/community'];
const save = (dir, name, value) => writeFile(`${dir}/${name}`, JSON.stringify(value, null, 2), { mode: 0o600 });
await withProject(async f => {
  const dir = `backups/cms-consolidation-${Date.now()}`;
  await mkdir(dir, { recursive: true, mode: 0o700 });
  const manifest = { dir, takenAt: new Date().toISOString(), collections: {}, pages: [], codeFiles: 0, published: false };
  for (const c of await f.getCollections()) {
    const fields = await c.getFields(), items = await c.getItems();
    await save(dir, `collection-${c.id}.json`, { fields, items });
    manifest.collections[c.name] = { id: c.id, items: items.length, fields: fields.map(x => `${x.name}:${x.type}`), ...(retiring.includes(c.name) ? { slugs: items.map(x => x.slug) } : {}) };
  }
  const pages = await f.getNodesWithType('WebPageNode');
  // Framer Basic (framer.com/pricing, Oct 25 2026): 30 pages, 2 collections, 1,000 items.
  // Assumes a CMS template counts as one page; re-check on framer.com before buying.
  manifest.pageCount = pages.length;
  manifest.allPaths = pages.map(x => x.path).sort();
  manifest.basicFit = { pagesAfter: pages.length - 3 + 5, pageLimit: 30, itemLimit: 1000 };
  for (const page of pages) {
    const keep = listingPaths.includes(page.path) || retiring.some(name => page.path?.startsWith(`/${name.toLowerCase()}/`));
    if (!keep) continue;
    // Template pages report "/providers/:slug" but the agent addresses them as "/providers/:Providers".
    const name = retiring.find(x => page.path.startsWith(`/${x.toLowerCase()}/:`));
    const pagePath = name ? `/${name.toLowerCase()}/:${name}` : page.path;
    try {
      await save(dir, `scene-${page.id}.json`, await f.agent.serialize({ id: page.id, depth: 25 }, { pagePath }));
      manifest.pages.push({ id: page.id, path: page.path });
    } catch (error) {
      manifest.pages.push({ id: page.id, path: page.path, error: String(error.message).slice(0, 200) });
    }
  }
  const files = await f.getCodeFiles();
  await save(dir, 'code-files.json', files.map(x => ({ id: x.id, name: x.name, content: x.content })));
  manifest.codeFiles = files.length;
  await writeFile(`${dir}/discovery-release-contract.json`, await readFile('config/discovery-release-contract.json'), { mode: 0o600 });
  manifest.totalItems = Object.values(manifest.collections).reduce((sum, x) => sum + x.items, 0);
  manifest.basicFit.itemsAfter = manifest.totalItems - retiring.reduce((sum, name) => sum + (manifest.collections[name]?.items || 0), 0);
  manifest.basicFit.collectionsAfter = Object.keys(manifest.collections).filter(name => !retiring.includes(name)).length;
  await save(dir, 'manifest.json', manifest);
  console.log(JSON.stringify(manifest, null, 2));
});
