import test from'node:test';import assert from'node:assert/strict';import{pendingSummary}from'../scripts/publish-reviewed-code.mjs';
test('a refused publish names what is pending, without content',()=>{
 const s=JSON.parse(pendingSummary({status:'ready',stagingEnabled:false,errors:[],changes:[{type:'CMSCollectionItem',name:'Weston FC',content:'secret body'},{type:'CodeFile',id:'abc'}]}));
 assert.deepEqual(s.changes,[['CMSCollectionItem','Weston FC'],['CodeFile','abc']]);assert.doesNotMatch(JSON.stringify(s),/secret body/);
 assert.equal(JSON.parse(pendingSummary({})).changes.length,0);
});
test('only reviewed opportunity items may ride along with a reviewed code release',async()=>{
 const{reviewedOpportunitySlugs,reviewedOpportunityChange}=await import('../scripts/publish-reviewed-code.mjs'),slugs=await reviewedOpportunitySlugs();
 assert.ok(slugs.includes('fishhawk-premier-fc-2026-27-one-on-one-evaluations'));
 assert.equal(reviewedOpportunityChange({type:'CollectionItem',name:'opportunities/fishhawk-premier-fc-2026-27-one-on-one-evaluat'},slugs),true);
 assert.equal(reviewedOpportunityChange({type:'CollectionItem',name:'opportunities/fishhawk-premier-fc-2026-27-one-on-one-evaluations'},slugs),true);
 assert.equal(reviewedOpportunityChange({type:'CodeFile',name:'opportunities/fishhawk-premier-fc-2026-27-one-on-one-evaluations'},slugs),false);
 assert.equal(reviewedOpportunityChange({type:'CollectionItem',name:'clubs/weston-fc'},slugs),false);
 assert.equal(reviewedOpportunityChange({type:'CollectionItem',name:'opportunities/not-a-reviewed-source'},slugs),false);
 assert.equal(reviewedOpportunityChange({type:'CollectionItem',name:'opportunities/fish'},slugs),false);
});
