import {withProject} from './project-session.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const walk=(n,fn)=>{fn(n);for(const c of n.children||[])walk(c,fn)};
await withProject(async f=>{
 const content=await readFile('framer/SubmissionLock.tsx','utf8');const diagnostics=await f.typecheckCode('SubmissionLock.tsx',content);if(diagnostics.length)throw Error('Email guard typecheck failed');
 const file=(await f.getCodeFiles()).find(x=>x.name==='SubmissionLock.tsx');
 const backup=`backups/email-intake-${Date.now()}`;await mkdir(backup,{recursive:true,mode:0o700});await writeFile(backup+'/SubmissionLock.tsx',file.content,{mode:0o600});
 const results=[];let component=(await f.getNodesWithType('ComponentNode')).find(x=>x.name==='Cancha Email Review Submit')?.id;
 for(const path of ['/organizations','/providers','/offers']){
  const p=(await f.getNodesWithType('WebPageNode')).find(x=>x.path===path);const snapshot=await f.agent.serialize({id:p.id,depth:14},{pagePath:path});await writeFile(backup+'/'+path.slice(1)+'.json',JSON.stringify(snapshot,null,2),{mode:0o600});
  const all=[];walk(snapshot,n=>{if(!n.$replicaId)all.push(n)});const form=all.find(n=>n.attributes?.htmlTag==='form');if(!form)throw Error('Form missing');
  const commands=[];
  if(!component){
   commands.push('+ComponentNode email_review_submit name="Cancha Email Review Submit";');
   commands.push('+FrameNode email_default parent="email_review_submit" name="Default" htmlTag="button" layout="stack" stackDirection="horizontal" stackAlignment="center" stackDistribution="center" width="300px" height="56px" radius="8px" fill="#0C3E2E"; +RichTextNode email_default_label parent="email_default" text="Send for review" fontName="Alumni Sans" fontSize="22px" fontWeight="700" textColor="#F4F2EC" width="auto" height="auto";');
  }
  if(!component){const created=await f.agent.applyChanges(commands.join('\n'),{pagePath:path});if(created.errors)throw Error(JSON.stringify(created.errors));component=created.renamedIds.email_review_submit;commands.length=0;}
  if(!all.some(n=>n.name==='Send for review — native email'))commands.push(`+ComponentInstanceNode email_submit_${path.slice(1)} parent="${form.id}" component="${component||'Cancha Email Review Submit'}" name="Send for review — native email" visible="true" width="1fr" height="56px"; SET ${form.id} name="Cancha submissions — configure Email in Send To" formSubmitButtonId="email_submit_${path.slice(1)}";`);
  for(const n of all.filter(n=>n.type==='ComponentInstanceNode'&&(n.component==='codeFile/ahqicyd:default'||n.id===form.attributes.formSubmitButtonId&&n.name!=='Send for review — native email')))commands.push(`SET ${n.id} visible="false";`);
  if(!all.some(n=>n.attributes?.formInputName==='Status'))commands.push(`+FormPlainTextInputNode email_status_${path.slice(1)} parent="${form.id}" formInputName="Status" formInputHidden="true" formInputValue="Pending review" formInputRequired="false" width="1fr" height="1px";`);
  const r=await f.agent.applyChanges(commands.join('\n'),{pagePath:path});if(r.errors)throw Error(JSON.stringify(r.errors));if(!component)component=r.renamedIds?.email_review_submit;
  const s=await f.agent.serialize({id:p.id,depth:14},{pagePath:path});const nodes=[];walk(s,n=>{if(!n.$replicaId)nodes.push(n)});
  const submit=nodes.find(n=>n.name==='Send for review — native email');const componentTree=await f.agent.serialize({id:component,depth:4},{pagePath:path});
  let tree=componentTree;
  for(const [name,label,color] of [['Loading','Sending…','#0C3E2E'],['Success','Received — thank you!','#0C3E2E'],['Error','Couldn’t send — try again','#8F2D16']]){
   if(tree.$variants.some(v=>v.name===name))continue;
   const id='email_state_'+name.toLowerCase(),base=tree.$variants.find(v=>v.name==='Default').id;
   const created=await f.agent.applyChanges(`CREATE_VARIANT ${id} from="${base}"; SET ${id} name="${name}" fill="${color}";`,{pagePath:path});if(created.errors||created.parseErrors)throw Error(JSON.stringify(created));
   tree=await f.agent.serialize({id:component,depth:4},{pagePath:path});const stateNode=tree.children.find(n=>n.id===created.renamedIds[id]);
   const text=stateNode.children.find(n=>n.type==='RichTextNode');const updated=await f.agent.applyChanges(`SET ${text.id} text="${label}";`,{pagePath:path});if(updated.errors)throw Error(JSON.stringify(updated.errors));
  }
  const variants=Object.fromEntries(tree.$variants.map(n=>[n.name,n.id]));
  const state=await f.agent.applyChanges(`SET ${submit.id} formButtonPendingVariant="${variants.Loading}" formButtonSuccessVariant="${variants.Success}" formButtonErrorVariant="${variants.Error}";`,{pagePath:path});if(state.errors)throw Error(JSON.stringify(state.errors));
  results.push({path,formId:form.id,submitId:submit.id});
 }
 await file.setFileContent(content);await writeFile('private-data/email-intake-prepared.json',JSON.stringify({backup,results,published:false,emailDestinationConfigured:false},null,2),{mode:0o600});console.log(JSON.stringify({results,published:false,emailDestinationConfigured:false}));
});
