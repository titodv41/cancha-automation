import test from'node:test';import assert from'node:assert/strict';import{pendingSummary}from'../scripts/publish-reviewed-code.mjs';
test('a refused publish names what is pending, without content',()=>{
 const s=JSON.parse(pendingSummary({status:'ready',stagingEnabled:false,errors:[],changes:[{type:'CMSCollectionItem',name:'Weston FC',content:'secret body'},{type:'CodeFile',id:'abc'}]}));
 assert.deepEqual(s.changes,[['CMSCollectionItem','Weston FC'],['CodeFile','abc']]);assert.doesNotMatch(JSON.stringify(s),/secret body/);
 assert.equal(JSON.parse(pendingSummary({})).changes.length,0);
});
