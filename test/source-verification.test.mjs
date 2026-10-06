import test from 'node:test';import assert from 'node:assert/strict';import {verifyJob} from '../server/source-verification.mjs';
const now=new Date('2026-10-06T14:00:00Z'),url='https://www.teamworkonline.com/soccer-jobs/usl-soccer-jobs/example-jobs/medical-role-123';
const registry=[{sourcePrefix:'https://www.teamworkonline.com/soccer-jobs/usl-soccer-jobs/example-jobs/',organizationAliases:['Example FC'],imageUrl:'https://framerusercontent.com/images/fixture.png',imageTreatment:'Badge',imageProvenance:'Fixture only'}];
const job={'@type':'JobPosting',title:'Medical Role',identifier:{value:123},hiringOrganization:{name:'Example FC'},datePosted:'2026-10-01',validThrough:'2026-11-01T00:00:00Z',jobLocation:[{address:{addressCountry:'US',addressRegion:'FL',addressLocality:'Miami'}}]};
const options={url,schemas:[job],pageText:'Medical Role Apply Now',descriptionText:'Qualifications Certified trainer with appropriate state licensure, first-aid certification and relevant experience. Candidates must meet all qualifications established by the organizer.',applicationLinks:['https://www.teamworkonline.com/employment_opportunities/123/applications/new'],registry,image:{loaded:true,width:600,height:600},sourceHash:'a'.repeat(64),now};
test('structured job checks preserve unknown dates, identify automation honestly and require exact organizer/application identity',()=>{
 const row=verifyJob(options);assert.equal(row.category,'Job');assert.equal(row.ageGroup,'See eligibility');assert.equal(row.endDate,undefined);assert.equal(row.reviewMode,'automated-source-check');assert.match(row.dateEvidence,/not a promised deadline|no applicant deadline/i);assert.equal(row.registrationUrl,url);
 assert.throws(()=>verifyJob({...options,schemas:[{...job,hiringOrganization:{name:'Other club'}}]}),/Organizer/);
 assert.throws(()=>verifyJob({...options,applicationLinks:['https://www.teamworkonline.com/employment_opportunities/456/applications/new']}),/application/);
 assert.throws(()=>verifyJob({...options,pageText:'This job is closed to new applications'}),/closed/);
 assert.throws(()=>verifyJob({...options,schemas:[{...job,validThrough:'2026-10-01'}]}),/stale/);
 assert.throws(()=>verifyJob({...options,descriptionText:'An opportunity for everyone'}),/Eligibility/);
 assert.throws(()=>verifyJob({...options,image:{loaded:false}}),/image/);
 assert.throws(()=>verifyJob({...options,schemas:[job,job]}),/ambiguous/);
 assert.throws(()=>verifyJob({...options,schemas:[{...job,jobLocation:[{address:{addressCountry:'US',addressRegion:'CA',addressLocality:'Miami'}}]}]}),/Florida/);
});
