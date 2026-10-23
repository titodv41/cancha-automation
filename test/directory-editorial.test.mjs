import test from'node:test';import assert from'node:assert/strict';
import{directoryDisplayName,directoryLayoutRevision,directoryEligible,directoryClaims,directorySourceHash,officialHeaderLogo,validDirectoryGuide,confirmDirectorySource,selectDirectoryProfiles}from'../server/directory-editorial.mjs';
import{approvedOriginalCreative}from'../server/social-creative.mjs';import{contentHash}from'../server/instagram-queue.mjs';import{passesCarouselPolicy}from'../server/carousel-quality.mjs';
const site='https://fixtureclub.org/',html='<html><head><title>Fixture FC</title></head><body><header><a href="/"><img src="/logo.png" alt="Fixture FC logo"></a></header><main><h1>Fixture FC</h1><p>Miami academy and competitive soccer.</p></main></body></html>';
const profile=()=>({entity:'profile',kind:'Club',slug:'fixture-fc',href:'/clubs/fixture-fc',name:'Fixture FC',city:'Miami',region:'South Florida',website:site,checkedOn:'2026-10-23',programs:'Academy · Competitive · Goalkeeper training',levelLabel:'Competitive',image:site+'logo.png',imageIdentity:'a'.repeat(64),badgeSource:'official-site-logo'});
const row=()=>{const p=profile();p.claims=directoryClaims(p,html);const slides=['official-badge','cancha-profile'].map((assetRole,i)=>({assetRole,assetUrl:'https://framerusercontent.com/images/guide-'+i+'.jpg',assetChecksum:(i?'b':'a').repeat(64),width:1080,height:1350,altText:'Club guide '+assetRole})),stamp=new Date().toISOString(),sourceUrl='https://pioneering-friday-005497.framer.app'+p.href;return{id:'directory-fixture-fc-20261023',format:'feed',sourceType:'brand',creativeVersion:'cancha-local-v2',caption:'Fixture FC in Miami. Ask about current teams.',altText:'Official club badge and actual Cancha profile.',rights:'Original Cancha design and identifying badge.',officialSourceUrl:site,sourceHash:directorySourceHash(p),factsCheckedAt:stamp,directoryProfile:p,directoryCapture:{sourceUrl,width:1100,height:900,capturedAt:stamp,sha256:'c'.repeat(64)},slides,assetUrl:slides[0].assetUrl,assetChecksum:slides[0].assetChecksum,visualEvidence:{creator:'Cancha',kind:'directory-guide',subjectKey:'directory:fixture-fc',sourceUrl,sourceHash:directorySourceHash(p),sourceReviewedOn:'2026-10-23',renderedAt:stamp,assetChecksum:slides[0].assetChecksum}}};
test('fresh public club profiles qualify for a current source check; private hosts, stale records and broad directory fallbacks do not',()=>{
 const p=profile();assert(directoryEligible(p,{today:'2026-10-23'}));
 for(const change of [{...p,kind:'Place'},{...p,checkedOn:'2026-08-01'},{...p,checkedOn:'2026-10-24'},{...p,website:'https://127.0.0.1/'},{...p,website:'https://localhost/'},{...p,website:'https://site.internal/'},{...p,website:'https://www.fysa.com/play/'},{...p,href:'/organizations'}])assert.equal(Boolean(directoryEligible(change,{today:'2026-10-23'})),false);
});
test('badge discovery selects a same-site home header logo, excluding sponsor marks even when filenames contain the city and logo',()=>{
 const bad='<a href="https://camp.example/"><img alt="Auburndale logo" src="/sponsors/auburndale-logo.png"></a>';
 assert.equal(officialHeaderLogo(html,site),site+'logo.png');assert.equal(officialHeaderLogo(bad,site),null);
 assert.equal(officialHeaderLogo(bad+html,site),site+'logo.png');
 assert.equal(officialHeaderLogo(html.replace('/logo.png','/sponsors/adidas-logo.png'),site),null);
 assert.equal(officialHeaderLogo(html.replace('href="/"','href="https://unrelated.org/"'),site),null);
});
test('only source-supported tags are stated; a name or city mismatch rejects the guide',()=>{
 const claims=directoryClaims(profile(),html);assert.deepEqual(claims.tags,['Academy','Competitive']);assert(!claims.tags.includes('Goalkeeper training'));
 assert.equal(directoryClaims({...profile(),city:'Orlando'},html),null);assert.equal(directoryClaims({...profile(),name:'Another United'},html),null);
 assert.equal(directoryClaims(profile(),html.replace('competitive soccer','casino no deposit bonus')),null);assert.equal(directoryClaims(profile(),html.replace('competitive soccer','competitive soccer. The club has closed permanently.')),null);
});
test('directory carousels need two different truthful media roles, a real profile capture and a bound source identity',()=>{
 const r=row();assert(validDirectoryGuide(r));assert(approvedOriginalCreative(r));assert(passesCarouselPolicy(r,{dailyDirectoryEnabled:true,requireDistinctCarouselPhotos:true}));assert(!passesCarouselPolicy(r,{requireDistinctCarouselPhotos:true}));
 for(const other of [{...r,sourceHash:'f'.repeat(64)},{...r,slides:[r.slides[0],{...r.slides[1],assetRole:'official-badge'}]},{...r,directoryCapture:{...r.directoryCapture,sourceUrl:'https://example.org/clubs'}},{...r,directoryProfile:{...r.directoryProfile,name:'Wrong club'}},{...r,slides:[r.slides[0],r.slides[0]]}])assert.equal(Boolean(validDirectoryGuide(other)),false);
 assert.notEqual(contentHash(r),contentHash({...r,directoryProfile:{...r.directoryProfile,city:'Orlando'}}));assert.notEqual(contentHash(r),contentHash({...r,directoryCapture:{...r.directoryCapture,sha256:'d'.repeat(64)}}));
});
test('publication rechecks name, city, program claims and the exact official logo without forwarding credentials',async()=>{
 const r=row();assert.equal(await confirmDirectorySource(r,{fetchImpl:async(u,o)=>{assert.equal(o.headers,undefined);return new Response(html,{headers:{'content-type':'text/html'}})}}),true);
 for(const body of [html.replace('Miami','Orlando'),html.replace('/logo.png','/new-logo.png'),html.replace('academy and competitive','recreational')])assert.equal(await confirmDirectorySource(r,{fetchImpl:async()=>new Response(body,{headers:{'content-type':'text/html'}})}),false);
 assert.equal(await confirmDirectorySource(r,{fetchImpl:async()=>new Response('blocked',{status:403})}),false);
});
test('club selection rotates regions, respects reserved subjects and suppresses recent same-club sites',()=>{
 const items=['Miami','Orlando','St. Petersburg'].map((city,i)=>({...profile(),city,name:'Club '+i,slug:'club-'+i,href:'/clubs/club-'+i,website:'https://club'+i+'.org/',region:['South Florida','Central Florida','Tampa Bay'][i]}));
 const all=selectDirectoryProfiles({items},[],{today:'2026-10-23'});assert.equal(all.length,3);assert.equal(new Set(all.map(p=>p.region)).size,3);
 const recent=[{status:'Published',published_at:'2026-10-22T22:00:00Z',content:{directoryProfile:{website:items[0].website}}},{status:'Draft',content:{factsCheckedAt:'2026-10-23T12:00:00Z',visualEvidence:{subjectKey:'directory:'+items[1].slug}}}];
 const remaining=selectDirectoryProfiles({items},recent,{today:'2026-10-23'});assert.deepEqual(remaining.map(p=>p.slug),['club-2']);
});

test('consumer-facing club names omit corporate suffixes while keeping the source name and meaningful club words intact',()=>{assert.equal(directoryDisplayName('AC Delray Inc.'),'AC Delray');assert.equal(directoryDisplayName('Azzurri Storm Soccer Inc.'),'Azzurri Storm Soccer');assert.equal(directoryDisplayName('Weston FC'),'Weston FC');assert.match(directoryLayoutRevision(),/^[a-f0-9]{64}$/)});
