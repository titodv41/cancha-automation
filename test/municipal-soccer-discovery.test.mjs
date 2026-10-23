import test from 'node:test';
import assert from 'node:assert/strict';
import {municipalParkLeads,municipalSoccerProfile} from '../server/municipal-soccer-discovery.mjs';
const today='2026-10-23';
const miami={kind:'miami',url:'https://www.miami.gov/Parks-Public-Places/Parks-Directory/Little-Haiti-Soccer-Park'};
const page=(body)=>'<html><head><title>Official park</title></head><body>'+body+'</body></html>';
const m=page('<header><img alt="City of Miami - Logo" src="/files/assets/public/templateimages/print-header.png"></header><main><h1 class="oc-page-title">Little Haiti Soccer Park</h1><div class="gmap-address">6301 NE 2 AVE, Miami 33138</div><ul class="park-feature-list"><li>Soccer Field</li><li>Playground</li></ul><img class="main-page-image" src="/files/sharedassets/public/v/1/parks/little-haiti.jpg?dimension=pageimage&w=480"><p>Contact private@example.test</p></main>');
test('municipal venue needs explicit soccer amenities, a matching source host, address and real image',()=>{
 const r=municipalSoccerProfile(m,miami,{today});assert.equal(r.type,'Place');assert.equal(r.originalImage,'https://www.miami.gov/files/sharedassets/public/v/1/parks/little-haiti.jpg?dimension=pageimage&w=1200');assert.equal(r.imageUse,'official-venue-photo');assert(!JSON.stringify(r).includes('private@example.test'));assert(r.accessNotes.includes('does not establish a scheduled pickup'));
 assert.equal(municipalSoccerProfile(m.replace('Soccer Field','Multipurpose Field'),miami,{today}),null);
 assert.throws(()=>municipalSoccerProfile(m,{...miami,url:miami.url.replace('www.miami.gov','unrelated.example')},{today}));
 assert.throws(()=>municipalSoccerProfile(m.replace('Miami 33138','Orlando 32801'),miami,{today}));
 const logo=municipalSoccerProfile(m.replace(/<img class="main-page-image"[^>]+>/,''),miami,{today});assert.equal(logo.imageUse,'official-municipal-logo');assert(logo.originalImage.endsWith('print-header.png'));
});
test('St Petersburg phone and footer office are never mistaken for a venue address',()=>{
 const lead={kind:'stpete',url:'https://www.stpeteparksrec.org/business_detail_T11_R3.php',nameHint:'Azalea Sports Complex'};
 const html=page('<main><h1 id="page-title">Azalea Sports Complex</h1><div class="bus-detail"><a href="tel:7278937298">(727) 893-7298</a><span>1600 72ND ST. N., ST. PETERSBURG, FL33710</span></div><div class="col-lg">Complex Amenities<br>1 Lighted Soccer Field<br>2 Lighted Multipurpose Fields</div><img src="https://www.stpeteparksrec.org/images/sports/azalea/1.jpg"></main><footer>999 Office ST, ST. PETERSBURG, FL33701</footer>');
 const r=municipalSoccerProfile(html,lead,{today});assert.equal(r.address,'1600 72ND ST. N., ST. PETERSBURG, FL33710');
 assert.equal(municipalSoccerProfile(html.replace('Soccer Field','Baseball Field'),lead,{today}),null);
 assert.throws(()=>municipalSoccerProfile(html.replace('Azalea Sports Complex','Unrelated Park'),lead,{today}));
});
test('county construction notices stay visible without implying the entire venue is closed',()=>{
 const html=page('<div class="ms-wikicontent"><h1>County Pines Recreational Complex at Samuel Friedland Park</h1><p>NOTICE: Fields 10 and 11 are closed for construction.</p><strong>ENTRANCE</strong><br>18500 Hamlin Boulevard<br>Loxahatchee, Florida 33470<br>Google Maps<strong>AMENITIES</strong><ul><li>multipurpose fields (football/soccer), lighted (3)</li></ul><img src="/parks/SiteImages/Parks/CountyPines/01.jpg"></div>');
 const r=municipalSoccerProfile(html,{kind:'pbc',url:'https://discover.pbc.gov/parks/Locations/County-Pines.aspx'},{today});assert.equal(r.city,'Loxahatchee');assert.equal(r.address,'18500 Hamlin Boulevard Loxahatchee, Florida 33470');assert(r.accessNotes.includes('closures'));assert(!r.openConfirmed);
});
test('directory discovery is bounded and ignores unrelated government links',()=>{
 const urls=Array.from({length:6},(_,i)=>'<loc>https://www.miami.gov/Parks-Public-Places/Parks-Directory/Park-'+i+'</loc>').join('');
 assert.equal(municipalParkLeads('miami','<urlset>'+urls+'<loc>https://www.miami.gov/private</loc></urlset>').length,6);
 assert.throws(()=>municipalParkLeads('miami','<urlset><loc>https://unrelated.example/park</loc></urlset>'));
});
