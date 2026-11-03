import test from 'node:test';import assert from 'node:assert/strict';import {isCanchaHost} from '../server/site-hosts.mjs';
test('both Framer addresses are Cancha production hosts; others are not (Nov 3 host change)',()=>{
 assert.equal(isCanchaHost('wearecancha.framer.website'),true);assert.equal(isCanchaHost('pioneering-friday-005497.framer.app'),true);
 assert.equal(isCanchaHost('evil.framer.website'),false);assert.equal(isCanchaHost(''),false);
});
