// Narrow CSS release: back up first, reject unrelated edits, preserve CMS.
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {withProject} from './project-session.mjs';
import {readReleaseContract, verifyReleaseContract, releaseScenes} from './discovery-release-contract.mjs';
import {contentDigest, validateReleaseContract} from '../server/discovery-release-contract.mjs';

if (!process.argv.includes('--apply')) throw Error('Review the three component changes, then use --apply');
const names = ['CanchaUI.tsx', 'CanchaHome.tsx', 'CanchaDiscovery.tsx'];
const dir = 'backups/mobile-readability-' + Date.now();
const stamp = value => contentDigest(JSON.stringify(value));
await mkdir(dir, {recursive: true, mode: 0o700});
await withProject(async f => {
  const before = await verifyReleaseContract(f);
  const initial = await f.agent.publish({action: 'preview'});
  if (initial.status !== 'ready' || initial.changes?.length || initial.errors?.length || initial.warnings?.length || initial.stagingEnabled) {
    throw Error('Existing pending project changes must be reviewed before this CSS release');
  }
  const files = await f.getCodeFiles();
  await writeFile(dir + '/code-files.json', JSON.stringify(files.map(x => ({id:x.id,name:x.name,content:x.content}))), {mode:0o600});
  await writeFile(dir + '/contract-before.json', JSON.stringify(before), {mode:0o600});
  const cms = {};
  for (const c of await f.getCollections()) {
    const snapshot = {fields:await c.getFields(),items:await c.getItems()};
    await writeFile(dir + '/collection-' + c.id + '.json', JSON.stringify(snapshot), {mode:0o600});
    cms[c.id] = stamp(snapshot);
  }
  const sources = new Map(await Promise.all(names.map(async name => [name, await readFile('framer/' + name, 'utf8')])));
  const expected = structuredClone(before);
  const session = 'cancha-mobile-reading-' + Date.now();
  const bootstrap = await f.typecheckCode('Bootstrap.tsx','import * as React from "react";import {addPropertyControls,ControlType} from "framer";export default function Bootstrap(){return <div/>}',undefined,session);
  if (bootstrap.length) throw Error('Framer typecheck bootstrap failed');
  for (const [name, content] of sources) {
    const file = files.find(x => x.name === name);
    if (!file || contentDigest(file.content) !== before.codeFiles[name]) throw Error('Component changed before release: ' + name);
    expected.codeFiles[name] = contentDigest(content);
  }
  // The typecheck sandbox needs the actual current dependency modules, in order.
  for (const name of ['CanchaUI.tsx','CanchaDiscoveryData.tsx','DiscoveryModel.tsx','DiscoveryCityMap.tsx','CanchaPlayerFit.tsx','CanchaHome.tsx','CanchaDiscovery.tsx']) {
    const content = sources.get(name) ?? files.find(x => x.name === name)?.content;
    if (!content) throw Error('Missing current dependency: ' + name);
    const errors = await f.typecheckCode(name, content, undefined, session);
    if (errors.length) throw Error(name + ': ' + JSON.stringify(errors));
  }
  // Recheck after the durable backup and typecheck, before any editor write.
  await verifyReleaseContract(f);
  for (const [name, content] of sources) {
    const file = (await f.getCodeFiles()).find(x => x.name === name);
    if (contentDigest(file.content) !== before.codeFiles[name]) throw Error('Concurrent code edit: ' + name);
    if (file.content !== content) await file.setFileContent(content);
  }
  validateReleaseContract(await readReleaseContract(f), expected);
  for (const c of await f.getCollections()) {
    if (stamp({fields:await c.getFields(),items:await c.getItems()}) !== cms[c.id]) throw Error('CMS changed during CSS release; publication stopped');
  }
  const preview = await f.agent.publish({action:'preview'});
  const ids = new Set(files.filter(x => names.includes(x.name)).map(x => x.id));
  const sceneIds = new Set(releaseScenes.map(([id]) => id));
  if (preview.status !== 'ready' || preview.errors?.length || preview.warnings?.length || preview.stagingEnabled) throw Error('Publication preview needs review');
  for (const change of preview.changes || []) {
    if (change.type === 'CodeFile' && change.status === 'updated' && ids.has(change.nodeId)) continue;
    if (['WebPage','LayoutTemplate'].includes(change.type) && change.status === 'updated' && sceneIds.has(change.nodeId)) continue;
    throw Error('Unrelated pending change; publication stopped: ' + change.type + ' ' + change.name);
  }
  const confirm = await f.agent.publish({action:'preview'});
  if (confirm.confirmationHash !== preview.confirmationHash) throw Error('Project changed after preview');
  const receipt = await f.publish();
  if (receipt.errors?.length || receipt.status === 'failed') throw Error('Publication failed');
  validateReleaseContract(await readReleaseContract(f), expected);
  const after = await f.agent.publish({action:'preview'});
  if (after.changes?.length) throw Error('Publication returned but pending changes remain');
  await writeFile('config/discovery-release-contract.json', JSON.stringify(expected, null, 2) + '\n');
  const result = {published:true,at:new Date().toISOString(),backup:dir,components:names,cmsUnchanged:true,receipt,changes:preview.changes,pendingChanges:0};
  await writeFile('private-data/mobile-readability-publication.json', JSON.stringify(result,null,2), {mode:0o600});
  console.log(JSON.stringify({published:true,backup:dir,components:names,cmsUnchanged:true,pendingChanges:0}));
});
