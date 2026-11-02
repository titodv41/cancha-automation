import test from 'node:test';import assert from 'node:assert/strict';
import{typecheckReviewedCode}from'../scripts/typecheck-reviewed-code.mjs';
test('a live component sees the reviewed model before it is checked, regardless of release file order',async()=>{
 const calls=[],ready=new Set(),sources={
  'Home.tsx':"import Fit from './Fit.tsx'; export default Fit;",
  'Model.tsx':'export const newHelper = true;'
 },files=[{name:'Model.tsx',content:'old model without newHelper'},
  {name:'Fit.tsx',content:"import {newHelper} from './Model.tsx'; export default newHelper;"}];
 const f={typecheckCode:async(name,content,id,session)=>{assert.equal(id,undefined);assert.equal(session,'fixture-session');
  if(name==='Fit.tsx')assert.ok(ready.has('Model.tsx'),'Model must already exist in the virtual session');
  if(name==='Model.tsx')assert.equal(content,sources[name],'Use reviewed content, not the live older file');
  calls.push(name);ready.add(name);return[];}};
 await typecheckReviewedCode(f,files,sources,{session:'fixture-session'});
 assert.deepEqual(calls,['Model.tsx','Fit.tsx','Home.tsx']);
});
test('type errors stop before dependent checks or any publication work',async()=>{
 const calls=[],f={typecheckCode:async name=>{calls.push(name);return[{message:'type failure'}]}};
 await assert.rejects(typecheckReviewedCode(f,[],{'Home.tsx':"import './ignored.css'; import Model from './Model.tsx';",'Model.tsx':'bad type'},{session:'fixture'}),/Model.tsx has type errors/);
 assert.deepEqual(calls,['Model.tsx']);
});
test('missing or circular local dependencies fail explicitly instead of looping or checking an incomplete graph',async()=>{
 const f={typecheckCode:async()=>[]};
 await assert.rejects(typecheckReviewedCode(f,[],{'Home.tsx':"import X from './Missing.tsx';"}),/Missing typecheck dependency/);
 await assert.rejects(typecheckReviewedCode(f,[],{'A.tsx':"import B from './B.tsx';",'B.tsx':"import A from './A.tsx';"}),/Circular typecheck dependency/);
});
