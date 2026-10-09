import test from 'node:test';import assert from 'node:assert/strict';import {growthProgress} from '../server/growth-progress.mjs';
test('Florida growth forecast excludes unverified and closed records and reports an honest deadline gap',()=>{
 const plan={startDate:'2026-10-10',deadline:'2026-10-31',targetCurrentOpportunities:200,dailyQualityTarget:9};
 const rows=[...Array.from({length:9},()=>({status:'Active'})),...Array.from({length:67},()=>({status:'Pending review'})),...Array.from({length:5},()=>({status:'Expired'})),{status:'Archived'},{status:'Archived'}];
 const report=growthProgress(rows,plan,'2026-10-09');assert.equal(report.totalRecords,83);assert.equal(report.currentActive,9);assert.equal(report.gap,191);assert.equal(report.remainingDays,22);assert.equal(report.neededPerDay,9);assert.equal(report.guaranteed,false);
 assert.equal(growthProgress(rows,plan,'2026-11-01').neededPerDay,null);
});
