import {readFile, writeFile} from 'node:fs/promises';
import {publicCommunityGroups} from '../server/community-groups.mjs';
const config = JSON.parse(await readFile('config/community-groups.json'));
const groups = publicCommunityGroups(config.groups);
const path = 'framer/CanchaCommunity.tsx', source = await readFile(path, 'utf8');
const next = source.replace(/^const groups: CommunityGroup\[\] = .*$/m, 'const groups: CommunityGroup[] = ' + JSON.stringify(groups));
if (source !== next) await writeFile(path, next);
console.log(JSON.stringify({approvedPublicGroups:groups.length,privateSubmissionsPublished:false}));
