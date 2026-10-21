import test from 'node:test';
import assert from 'node:assert/strict';
import {publicCommunityGroups} from '../server/community-groups.mjs';
const now = new Date('2026-10-21T15:00:00Z');
const row = {id:'fixture-group',name:'Fixture soccer group',city:'Orlando',description:'Adult pickup planning.',inviteUrl:'https://chat.whatsapp.com/FixtureInvite1234567890',status:'Approved',adminPermission:true,minimumAge:18,reviewedOn:'2026-10-21',contactEmail:'private@example.test'};
test('pending group submissions never expose invites or contacts',()=>assert.deepEqual(publicCommunityGroups([{...row,status:'Pending review'}],{now}),[]));
test('approved group output contains public fields only',()=>{const [group]=publicCommunityGroups([row],{now});assert.equal(group.city,'Orlando');assert.equal(group.contactEmail,undefined);assert.equal(group.adminPermission,undefined);assert.equal(group.inviteUrl,row.inviteUrl)});
test('groups need recent invite checks, admin permission and explicit adult policy',()=>{for(const patch of [{adminPermission:false},{minimumAge:0},{reviewedOn:'2025-10-21'},{reviewedOn:'2030-01-01'}])assert.throws(()=>publicCommunityGroups([{...row,...patch}],{now}))});
test('group invites reject lookalike hosts, credentials, redirects and duplicate records',()=>{for(const inviteUrl of ['https://chat.whatsapp.com.example.test/FixtureInvite1234567890','javascript:alert(1)','https://chat.whatsapp.com@evil.test/FixtureInvite1234567890',row.inviteUrl+'?next=other','http://chat.whatsapp.com/FixtureInvite1234567890'])assert.throws(()=>publicCommunityGroups([{...row,inviteUrl}],{now}));assert.throws(()=>publicCommunityGroups([row,row],{now}))});
