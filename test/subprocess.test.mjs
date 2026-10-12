import test from 'node:test';import assert from 'node:assert/strict';import {runSubprocess} from '../scripts/subprocess.mjs';
test('long preparation tasks let the parent process service network timers',async()=>{
 let responsive=false;const timer=setTimeout(()=>{responsive=true},20);
 try{const task=runSubprocess(process.execPath,['-e','setTimeout(()=>{},150)'],{stdio:'ignore'});assert.equal(responsive,false);const result=await task;assert.equal(responsive,true);assert.equal(result.status,0);}finally{clearTimeout(timer);}
 const failed=await runSubprocess(process.execPath,['-e','process.exit(7)'],{stdio:'ignore'});assert.equal(failed.status,7);
});
