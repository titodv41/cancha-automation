import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';
import{GUIDE_PAGES}from'../scripts/create-guide-pages.mjs';
const src=readFileSync(new URL('../framer/CanchaGuide.tsx',import.meta.url),'utf8');
test('the pathway guide cites a source for every factual section and states the check date',()=>{
 const sections=src.split("{id:'").slice(1);assert.equal(sections.length,5);
 for(const s of sections){const id=s.slice(0,s.indexOf("'"));if(id==='stand-out'){assert.match(s,/general advice/i);continue;}assert.match(s,/sources:\[\['[^']+','https?:\/\//,id+' needs a source');}
 assert.match(src,/CHECKED='[A-Z][a-z]+ \d{1,2}, 20\d\d'/);assert.match(src,/isn’t affiliated/);
 assert.doesNotMatch(src,/partner|sponsored by|official guide/i);
});
test('the guide page has search metadata within limits and a stable path',()=>{
 for(const p of GUIDE_PAGES){assert.match(p.path,/^\/[a-z0-9-]+$/);assert.ok(p.title.length<=70,p.title);assert.ok(p.description.length<=160,p.description);}
});
