import test from 'node:test';
import assert from 'node:assert/strict';
import {soccerStarsPages,soccerStarsProfile,indoorProgramProfile,INDOOR_PROGRAMS} from '../server/regional-program-discovery.mjs';
const areas={miami:{label:'Miami',city:'Miami',county:'Miami-Dade'}};
test('regional discovery accepts only reviewed Florida pages, not another state or unrelated host',()=>{
 const pages=soccerStarsPages('<loc>https://www.soccerstars.com/fl/miami/</loc><loc>https://www.soccerstars.com/ny/miami/</loc><loc>https://other.example/fl/miami/</loc><loc>https://www.soccerstars.com/fl/unreviewed/</loc>',areas);
 assert.deepEqual(pages,[{url:'https://www.soccerstars.com/fl/miami/',area:areas.miami}]);
 const row=soccerStarsProfile('<html><body><h1>Soccer Stars</h1><h2>Miami</h2>Programs for ages 1 and up<a href="https://registration.youthathletesunited.com/franchise/FLmiamiSS/events">Find A Class</a></body></html>',pages[0],'2026-10-22');
 assert.equal(row.city,'Miami');assert.equal(row.sponsored,false);assert(row.accessNotes.includes('does not establish'));assert(row.address.includes('not a confirmed class venue'));
 assert.throws(()=>soccerStarsProfile('<html><body><h1>Soccer Stars</h1><h2>Orlando</h2>Programs for ages 1 and up</body></html>',pages[0],'2026-10-22'),/identity/);
});
test('venue identities require exact location facts and keep program profiles separate from open opportunities',()=>{
 const p=INDOOR_PROGRAMS[0],row=indoorProgramProfile('<html><body>825 Courtland St Winter Park indoor fields</body></html>',p,'2026-10-22');assert.equal(row.type,'Place');assert.equal(row.city,'Orlando');assert(row.accessNotes.includes('does not announce an open class'));
 assert.throws(()=>indoorProgramProfile('<html><body>Winter Park indoor fields</body></html>',p,'2026-10-22'),/facts changed/);
});
