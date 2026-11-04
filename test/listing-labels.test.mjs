import test from 'node:test';import assert from 'node:assert/strict';import{readFile}from'node:fs/promises';import{stripTypeScriptTypes}from'node:module';
const m=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(await readFile(new URL('../framer/DiscoveryModel.tsx',import.meta.url),'utf8'))).toString('base64'));
const today='2026-11-04';
test('profiles and places never read as openings or games',()=>{
 assert.deepEqual(m.listingStatus({entity:'profile',kind:'Club'},today),{kind:'profile',label:'Club profile'});
 assert.deepEqual(m.listingStatus({entity:'profile',kind:'Place'},today),{kind:'place',label:'Fields · check access'});
 assert.equal(m.listingStatus({entity:'career'},today),null);
});
test('dated opportunities show upcoming, on now or ended; roster openings ask to confirm',()=>{
 assert.equal(m.listingStatus({entity:'opportunity',kind:'Camp / Clinic',start:'2026-11-23',end:'2026-11-25'},today).label,'Upcoming · Nov 23');
 assert.equal(m.listingStatus({entity:'opportunity',kind:'Camp / Clinic',start:'2026-11-01',end:'2026-11-30'},today).label,'On now · until Nov 30');
 assert.equal(m.listingStatus({entity:'opportunity',kind:'Tryout',start:'2026-10-01',end:'2026-10-02'},today).kind,'ended');
 assert.equal(m.listingStatus({entity:'opportunity',kind:'Team / Roster Opening'},today).label,'Team opening · confirm');
 assert.equal(m.listingStatus({entity:'opportunity',kind:'Open Training'},today).label,'Ongoing · confirm dates');
});
test('unknown cost never reads as free; checked dates are short and safe',()=>{
 assert.equal(m.costLabel(''),'Cost not confirmed');assert.equal(m.costLabel(undefined),'Cost not confirmed');assert.equal(m.costLabel('$199'),'$199');
 assert.equal(m.checkedLabel('2026-11-03'),'Checked Nov 3');assert.equal(m.checkedLabel('bad'),'');
});
