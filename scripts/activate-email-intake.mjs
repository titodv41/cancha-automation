import {withProject} from './project-session.mjs';
import {readFile,writeFile} from 'node:fs/promises';
// Run only after owner confirms native Email destinations are configured.
if(!process.argv.includes('--destinations-confirmed'))throw Error('Confirm Framer Email destinations before enabling delivery');
const prepared=JSON.parse(await readFile('private-data/email-intake-prepared.json'));
await withProject(async f=>{for(const item of prepared.results){await f.agent.serialize({id:item.formId,depth:10},{pagePath:item.path});const result=await f.agent.applyChanges(`SET ${item.formId} codeOverride="null" name="Cancha submissions — email review";`,{pagePath:item.path});if(result.errors)throw Error(JSON.stringify(result.errors));}await writeFile('private-data/email-intake-activated.json',JSON.stringify({at:new Date().toISOString(),published:false,destinationsOwnerConfirmed:true}));console.log(JSON.stringify({enabled:true,published:false}));});
