import test from 'node:test';import assert from 'node:assert/strict';
import {readFootballFeed,confirmNewsSource} from '../server/soccer-news.mjs';
const now=Date.parse('2026-10-09T16:00:00Z');
const xml=title=>'<rss><channel><item><title><![CDATA['+title+']]></title><link>https://www.bbc.co.uk/sport/football/fixture</link><pubDate>Fri, 09 Oct 2026 12:00:00 GMT</pubDate></item></channel></rss>';
test('football news uses recent attributed feed evidence and blocks changed, old or untrusted items',async()=>{
 const items=readFootballFeed(xml('Fixture football news'),{now});assert.equal(items.length,1);
 const row={officialSourceUrl:items[0].url,sourceHash:items[0].sourceHash};assert.equal(await confirmNewsSource(row,{now,fetchImpl:async()=>new Response(xml('Fixture football news'))}),true);
 await assert.rejects(confirmNewsSource(row,{now,fetchImpl:async()=>new Response(xml('Changed fixture headline'))}),/changed/);
 assert.equal(readFootballFeed(xml('Fixture football news').replace('www.bbc.co.uk','evil.example'),{now}).length,0);
 assert.equal(readFootballFeed(xml('Fixture football news'),{now:now+3*86400000}).length,0);
 assert.equal(readFootballFeed(xml('Fixture football news'),{now:now-86400000}).length,0);
});
