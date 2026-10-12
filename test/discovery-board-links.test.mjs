import test from 'node:test';import assert from 'node:assert/strict';import {discoveryBoardLink as link} from '../server/discovery-board-links.mjs';
test('board discovery retains exact job IDs and drops tracking without claiming verification',()=>{
 assert.equal(link('/jobs/view/soccer-coach-12345?trackingId=abc','https://www.linkedin.com/jobs/search/?keywords=soccer','Soccer Coach'),'https://www.linkedin.com/jobs/view/soccer-coach-12345');
 assert.equal(link('/viewjob?jk=0123456789abcdef&utm_source=x','https://www.indeed.com/jobs?q=soccer','Soccer Coach'),'https://www.indeed.com/viewjob?jk=0123456789abcdef');
 for(const href of ['/jobs/search/?keywords=soccer','/company/soccer','http://www.linkedin.com/jobs/view/soccer-coach-12345','https://other.example/jobs/view/soccer-coach-12345'])assert.equal(link(href,'https://www.linkedin.com/jobs/search/','Soccer'),null);
 assert.equal(link('/jobs/view/marketing-12345','https://www.linkedin.com/jobs/search/','Marketing'),null);
 assert.equal(link('/viewjob?jk=not-an-id','https://www.indeed.com/jobs?q=soccer','Soccer'),null);
});
