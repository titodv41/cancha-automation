import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {validateBatch,duplicateOf,confirmRows,pageText} from '../scripts/apply-reviewed-opportunities.mjs';
const batch=JSON.parse(readFileSync(new URL('../config/reviewed-opportunities/south-florida-2026-11.json',import.meta.url)));
test('a reviewed batch must be dated today and every row complete, sourced and not stating Free',()=>{
 assert.equal(validateBatch(batch,batch.checkedOn),true);
 assert.throws(()=>validateBatch(batch,'2026-11-04'),/dated today/);
 const row=batch.opportunities[0];
 assert.throws(()=>validateBatch({...batch,opportunities:[{...row,Cost:'Free'}]},batch.checkedOn),/never state Free/);
 assert.throws(()=>validateBatch({...batch,opportunities:[{...row,confirm:['x']}]},batch.checkedOn),/confirm tokens/);
 assert.throws(()=>validateBatch({...batch,opportunities:[row,row]},batch.checkedOn),/repeated slug/);
 assert.throws(()=>validateBatch({...batch,opportunities:[{...row,'Start Date':'2026-10-01'}]},batch.checkedOn),/already started/);
});
test('duplicates: same slug, or same registration link and start date; two camps on one page are distinct',()=>{
 const ids={'External Registration Link':'L','Start Date':'S'},[a,b]=batch.opportunities;
 const existing=[{slug:'other',fieldData:{L:{value:a['External Registration Link']},S:{value:a['Start Date']}}}];
 assert.equal(duplicateOf(a,existing,ids),'link+date');assert.equal(duplicateOf(b,existing,ids),null);
 assert.equal(duplicateOf(a,[{slug:a.slug,fieldData:{}}],ids),'slug');
});
test('the organizer page must still show every confirm token (entities decoded)',async()=>{
 const page=html=>async()=>new Response(html,{status:200});const one={...batch,opportunities:[batch.opportunities[2]]};
 assert.equal(await confirmRows(one,page('<h2>Thanksgiving Soccer &amp; Speed Clinic</h2><p>Nov 23–27 Ages 5–17 13450 SW 129th St</p>')),true);
 await assert.rejects(confirmRows(one,page('<p>Summer camp</p>')),/no longer shows/);
 await assert.rejects(confirmRows(one,async()=>new Response('',{status:404})),/returned 404/);
 assert.equal(pageText('a&amp;b&nbsp;c'),'a&b c');
});
