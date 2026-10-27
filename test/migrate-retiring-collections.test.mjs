import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {storyItem,providerItem,injectItems} from '../scripts/migrate-retiring-collections.mjs';
const fd=(names)=>Object.fromEntries(names.map((n,i)=>[n,{id:'f'+i,name:n,...(n==='Category'||n==='Delivery'||n==='Status'?{cases:[{id:'c1',name:n==='Delivery'?'In person':'Guide'}]}:{})}]));
const item=(byName,values,slug='x')=>({slug,fieldData:Object.fromEntries(Object.entries(values).map(([k,v])=>[byName[k].id,{value:v}]))});
test('stories keep their URL and only the fields the old page displayed',()=>{
 const b=fd(['Title','Summary','Category','Body','Author','Published On','Image','Source Link','Status','Interview Consent Recorded','Image Credit','Image Source']);
 const s=storyItem(item(b,{Title:'Questions before you register',Summary:'S',Category:'c1',Body:'<p>B</p>',Image:{url:'https://framerusercontent.com/images/a.jpg'},'Published On':'2026-10-12T00:00:00.000Z','Interview Consent Recorded':true},'questions-before-you-register'),b);
 assert.equal(s.path,'/stories/questions-before-you-register');assert.equal(s.kicker,'Guide');assert.equal(s.image,'https://framerusercontent.com/images/a.jpg');
 assert.deepEqual(s.meta,['Oct 12, 2026']);assert.ok(!JSON.stringify(s).includes('Consent'));
});
test('providers map sections, credentials and booking link',()=>{
 const b=fd(['Name','Category','Delivery','Location','Languages','Age Groups Served','Short Description','Background','Qualifications','Services','Price Note','Booking Link','Image','Credentials Reviewed','Status']);
 const p=providerItem(item(b,{Name:'Coach',Delivery:'c1',Background:'<p>x</p>',Services:'',Location:'Miami','Age Groups Served':'8-14','Credentials Reviewed':false,'Booking Link':'https://example.org'},'coach'),b);
 assert.equal(p.path,'/providers/coach');assert.equal(p.sections.length,1);assert.deepEqual(p.meta,['Miami','Ages: 8-14']);assert.equal(p.credentialsReviewed,false);
});
test('item data is injected into the component exactly once',async()=>{
 const src=await readFile('framer/CanchaStaticPage.tsx','utf8'),out=injectItems(src,[{kind:'story',path:'/stories/a',title:'A'}]);
 assert.match(out,/const items:any\[\]=\[\{"kind":"story"/);assert.throws(()=>injectItems(out,[]),/marker/);
});
