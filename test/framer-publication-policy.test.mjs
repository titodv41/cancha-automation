import test from 'node:test';import assert from 'node:assert/strict';import {checkAutomaticPublication as check} from '../server/framer-publication-policy.mjs';
const base={status:'ready',publishTarget:'production',stagingEnabled:false,errors:[],confirmationHash:'exact-preview',changes:[]};const policy={collectionId:'opportunities'};
test('automatic publication allows only the Opportunities collection',()=>{assert.equal(check(base,policy),false);assert.equal(check({...base,changes:[{type:'Collection',nodeId:'opportunities',status:'updated'}]},policy),true);for(const c of [{type:'Collection',nodeId:'private',status:'updated'},{type:'CodeFile',name:'Other.tsx'},{type:'WebPage',name:'/explore',status:'updated'}])assert.throws(()=>check({...base,changes:[c]},policy));});
test('reviewed forms require a one-time explicit scope and publish readiness',()=>{const p={...base,changes:[{type:'WebPage',name:'/organizations',status:'updated'}]};assert.throws(()=>check(p,policy));assert.equal(check(p,{...policy,reviewedPages:['/organizations']}),true);assert.throws(()=>check({...p,stagingEnabled:true},{...policy,reviewedPages:['/organizations']}));assert.throws(()=>check({...base,status:'blocked'},policy));assert.throws(()=>check({...p,confirmationHash:null},{...policy,reviewedPages:['/organizations']}));});
test('individual collection changes must match an existing Opportunities slug',()=>{
 const policy={collectionId:'opportunities',itemSlugs:['current-club']};
 for(const status of ['updated','added'])assert.equal(check({...base,changes:[{type:'CollectionItem',name:'opportunities/current-club',status}]},policy),true);
 for(const name of ['providers/current-club','opportunities/unknown'])assert.throws(()=>check({...base,changes:[{type:'CollectionItem',name,status:'updated'}]},policy));
 assert.throws(()=>check({...base,changes:[{type:'CollectionItem',name:'opportunities/current-club',status:'removed'}]},policy));
});

test('club placement maintenance can publish known profile updates but cannot add or remove profiles',()=>{
 const p={...policy,additionalCollections:[{path:'clubs',slugs:['reviewed-club']}]};assert.equal(check({...base,changes:[{type:'CollectionItem',name:'clubs/reviewed-club',status:'updated'}]},p),true);
 for(const change of [{type:'CollectionItem',name:'clubs/new-club',status:'updated'},{type:'CollectionItem',name:'clubs/reviewed-club',status:'added'},{type:'CollectionItem',name:'clubs/reviewed-club',status:'removed'},{type:'WebPage',name:'/clubs',status:'updated'}])assert.throws(()=>check({...base,changes:[change]},p));
});
test('derived discovery renders require matching reviewed page identities and data file',()=>{
 const page={type:'WebPage',nodeId:'p',name:'/clubs',status:'updated'},data={type:'CodeFile',nodeId:'d',name:'CanchaDiscoveryData.tsx',status:'updated'};
 assert.throws(()=>check({...base,changes:[page,data]},policy));
 const p={...policy,verifiedDerivedPages:[{id:'p',name:'/clubs'}],verifiedDataFileId:'d'};assert.equal(check({...base,changes:[page,data]},p),true);
 for(const change of [{...page,nodeId:'other'},{...page,name:'/about'},{...data,name:'Other.tsx'},{...data,status:'added'},{...data,nodeId:'other'}])assert.throws(()=>check({...base,changes:[change]},p));
});
