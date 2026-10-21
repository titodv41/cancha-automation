import test from 'node:test';import assert from 'node:assert/strict';import {discoveryBoardLink as link,exactEmployerSeed,approvedEmployerPosting} from '../server/discovery-board-links.mjs';
test('board discovery retains exact job IDs and drops tracking without claiming verification',()=>{
 assert.equal(link('/jobs/view/soccer-coach-12345?trackingId=abc','https://www.linkedin.com/jobs/search/?keywords=soccer','Soccer Coach'),'https://www.linkedin.com/jobs/view/soccer-coach-12345');
 assert.equal(link('/viewjob?jk=0123456789abcdef&utm_source=x','https://www.indeed.com/jobs?q=soccer','Soccer Coach'),'https://www.indeed.com/viewjob?jk=0123456789abcdef');
 for(const href of ['/jobs/search/?keywords=soccer','/company/soccer','http://www.linkedin.com/jobs/view/soccer-coach-12345','https://other.example/jobs/view/soccer-coach-12345'])assert.equal(link(href,'https://www.linkedin.com/jobs/search/','Soccer'),null);
 assert.equal(link('/jobs/view/marketing-12345','https://www.linkedin.com/jobs/search/','Marketing'),null);
 assert.equal(link('/viewjob?jk=not-an-id','https://www.indeed.com/jobs?q=soccer','Soccer'),null);
});

test('reviewed employer seeds expire, preserve known posting identities and stay unverified leads',()=>{
 const url='https://www.teamworkonline.com/soccer-jobs/fixture/club/fixture-role-123',source={url,discoverySeedUntil:'2026-10-28'},options={organizers:[{sourcePrefix:'https://www.teamworkonline.com/soccer-jobs/fixture/club/'}],existingPostingIds:new Set(),today:'2026-10-21'};
 assert.equal(exactEmployerSeed(source,options),url);assert.equal(exactEmployerSeed({...source,discoverySeedUntil:'2026-10-20'},options),null);
 assert.equal(exactEmployerSeed(source,{...options,existingPostingIds:new Set(['teamwork-posting:123'])}),null);
 for(const bad of[url.replace('/fixture/club/','/other/club/'),url.replace('www.teamworkonline.com','other.example'),url+'?redirect=external',url.replace('-123','')])assert.equal(exactEmployerSeed({...source,url:bad},options),null);
 assert.equal(exactEmployerSeed({url},options),null);
});

test('an exact approved employer job is discoverable even when its role title contains security or alerts',()=>{
 const organizers=[{sourcePrefix:'https://www.teamworkonline.com/soccer-jobs/fixture/club/'}],url=organizers[0].sourcePrefix+'stadium-security-guard-123';
 assert.equal(approvedEmployerPosting(url,organizers),url);
 assert.equal(approvedEmployerPosting('https://www.teamworkonline.com/security',organizers),null);
 assert.equal(approvedEmployerPosting(url.replace('/fixture/','/unreviewed/'),organizers),null);
});
