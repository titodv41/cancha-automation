import test from 'node:test';import assert from 'node:assert/strict';
import {canonicalUrl,lifecycle,validateBatch,opportunityIdentity} from '../server/opportunity-policy.mjs';
const now=new Date('2026-10-06T14:00:00Z');
test('closed lifecycle preserves expiry day, ignores nonactive records and rechecks stale sources',()=>{
 assert.equal(lifecycle({status:'Active',end:'2026-10-06',checkedOn:'2026-10-06'},now),null);
 assert.equal(lifecycle({status:'Active',end:'2026-10-05',checkedOn:'2026-10-06'},now).status,'Expired');
 assert.equal(lifecycle({status:'Archived',end:'2026-10-05'},now),null);
 assert.equal(lifecycle({status:'Active',checkedOn:'2026-09-28'},now).status,'Pending review');
 assert.equal(lifecycle({status:'Active',end:'2026-02-30',checkedOn:'2026-10-06'},now).status,'Pending review');
 assert.equal(canonicalUrl('https://example.org/register?id=42&utm_source=ig#register'),'https://example.org/register?id=42');
 assert.equal(opportunityIdentity('https://www.teamworkonline.com/soccer-jobs/team/new-title-123'),opportunityIdentity('https://www.teamworkonline.com/soccer-jobs/team/old-title-123'));
});
test('daily additions require current human evidence, rights, resolution and no duplicate routes',()=>{
 const row=Object.fromEntries(['slug','title','organization','category','sport','city','region','state','level','ageGroup','gender','cost','shortDescription','fullDescription','eligibilityEvidence','availabilityEvidence','dateEvidence','imageRightsEvidence','imageContext','reviewer'].map(x=>[x,x]));
 Object.assign(row,{registrationUrl:'https://example.org/register?id=42',officialSourceUrl:'https://example.org/camp',imageUrl:'https://example.org/photo.jpg',reviewedAt:'2026-10-06T13:00:00Z',sourceCheckedAt:'2026-10-06T13:00:00Z',openConfirmed:true,imageApproved:true,imageTreatment:'Photo',imageWidth:1600,imageHeight:900});
 const config={maximumPerRun:5,maximumSourceAgeHours:72};assert.equal(validateBatch([row],[],config,now).length,1);
 assert.throws(()=>validateBatch([{...row,sourceCheckedAt:'2026-10-01T13:00:00Z'}],[],config,now),/stale/);
 assert.throws(()=>validateBatch([{...row,imageApproved:false}],[],config,now),/require review/);
 assert.throws(()=>validateBatch([{...row,imageWidth:400}],[],config,now),/resolution/);
 assert.throws(()=>validateBatch([row],[{slug:'other',registration:'https://example.org/register?utm_source=ig&id=42'}],config,now),/duplicate/);
 assert.throws(()=>validateBatch([row],[{slug:'other',title:row.title,organization:row.organization}],config,now),/duplicate/);
 assert.throws(()=>validateBatch([{...row,endDate:'2026-10-05'}],[],config,now),/passed/);
 assert.throws(()=>validateBatch([{...row,reviewedAt:'2026-10-07T13:00:00Z'}],[],config,now),/future/);
 assert.throws(()=>validateBatch([row],[],{...config,maximumPerRun:0},now),/maximum/);
});
