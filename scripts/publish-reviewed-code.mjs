import {readFile} from 'node:fs/promises';
import {withProject} from './project-session.mjs';
import {readReleaseContract,verifyReleaseContract} from './discovery-release-contract.mjs';
import {contentDigest} from '../server/discovery-release-contract.mjs';
// Publishes reviewed edits of existing Framer code components from framer/<name>.tsx. The release contract in the same
// commit must already hold each file's new digest; every other reviewed part must match live before publishing.
export const FILES=['CanchaFooter.tsx'];
const site='https://pioneering-friday-005497.framer.app';
if(process.argv[1]?.endsWith('/publish-reviewed-code.mjs'))await withProject(async f=>{
 const expected=JSON.parse(await readFile('config/discovery-release-contract.json','utf8')),live=await readReleaseContract(f),sources={};
 for(const name of FILES){sources[name]=await readFile('framer/'+name,'utf8');if(expected.codeFiles[name]!==contentDigest(sources[name]))throw Error('Contract does not hold the reviewed digest of '+name);}
 for(const [k,h] of Object.entries(expected.codeFiles))if(!FILES.includes(k)&&live.codeFiles[k]!==h)throw Error('Unreviewed code change: '+k);
 for(const kind of ['scenes','textStyles'])for(const [k,h] of Object.entries(expected[kind]||{}))if(live[kind]?.[k]!==h)throw Error('Unreviewed '+kind+' change: '+k);
 const before=await f.agent.publish({action:'preview'});if(before.status!=='ready'||before.errors?.length||before.changes?.length||before.stagingEnabled)throw Error('Pending project changes must be reviewed first');
 const files=await f.getCodeFiles(),session='cancha-code-'+Date.now(),ui=files.find(x=>x.name==='CanchaUI.tsx'),ids=new Set();let changed=false;
 if((await f.typecheckCode('CanchaUI.tsx',FILES.includes('CanchaUI.tsx')?sources['CanchaUI.tsx']:ui.content,undefined,session)).length)throw Error('CanchaUI.tsx has type errors');
 for(const name of FILES){const errors=await f.typecheckCode(name,sources[name],undefined,session);if(errors.length)throw Error(name+' typecheck: '+JSON.stringify(errors).slice(0,400));
  const file=files.find(x=>x.name===name);if(!file)throw Error(name+' missing');ids.add(file.id);if(file.content!==sources[name]){await file.setFileContent(sources[name]);changed=true;}}
 const pending=await f.agent.publish({action:'preview'});if(pending.status!=='ready'||pending.errors?.length)throw Error('Publication preview needs review');
 const foreign=(pending.changes||[]).filter(ch=>!(ch.type==='CodeFile'&&ids.has(ch.nodeId)));if(foreign.length)throw Error('Unrelated pending changes: '+foreign.map(c=>c.type+' '+c.name).join(', '));
 // Framer's preview does not always list an updated code file, so publish when this run edited one or anything of ours is pending.
 // A run that found the editor already updated still publishes: the editor content is the reviewed digest (checked below).
 for(const name of FILES)if(contentDigest((await f.getCodeFiles()).find(x=>x.name===name).content)!==expected.codeFiles[name])throw Error('Editor content differs from the reviewed digest: '+name);
 const confirm=await f.agent.publish({action:'preview'});if(confirm.confirmationHash!==pending.confirmationHash)throw Error('Project changed after preview');
 const receipt=await f.publish();if(receipt.errors?.length||receipt.status==='failed')throw Error('Publication failed');
 await verifyReleaseContract(f);
 await new Promise(s=>setTimeout(s,60000));const html=await (await fetch(site+'/?v='+Date.now())).text();
 console.log(JSON.stringify({published:true,files:FILES,footerHubLinks:(html.match(/href="\/(orlando|tampa|miami)-soccer"/g)||[]).length}));
});
