import test from 'node:test';import assert from 'node:assert/strict';import {commonsLicenseAllowed,shapeCommons,shapePixabay,parseMixkit} from '../scripts/footage-library.mjs';
test('keeps only Commons licenses an edited commercial Reel may reuse',()=>{
 for(const ok of ['CC0','Public domain','CC BY 4.0','CC BY 3.0','CC BY'])assert.equal(commonsLicenseAllowed(ok),true,ok);
 for(const no of ['CC BY-SA 4.0','CC BY-NC 2.0','CC BY-ND 3.0','CC BY-NC-SA 4.0','GFDL','',undefined])assert.equal(commonsLicenseAllowed(no),false,String(no));
});
test('shapes Commons videos with credit and rejects images or share-alike files',()=>{
 const page=(license,mime='video/webm')=>({pageid:9,title:'File:Sunday league goal.webm',imageinfo:[{url:'https://upload.wikimedia.org/a.webm',descriptionurl:'https://commons.wikimedia.org/wiki/File:a',mime,duration:12.4,width:1280,height:720,extmetadata:{LicenseShortName:{value:license},Artist:{value:'<a href="x">Ana</a>'}}}]});
 const ok=shapeCommons(page('CC BY 4.0'),'amateur football');assert.equal(ok.creator,'Ana');assert.equal(ok.duration,12);assert.equal(ok.title,'Sunday league goal.webm');
 assert.equal(shapeCommons(page('CC BY-SA 4.0'),'q'),null);assert.equal(shapeCommons(page('CC0','image/jpeg'),'q'),null);
});
test('shapes Pixabay hits and parses Mixkit pages',()=>{
 assert.equal(shapePixabay({id:7,tags:'soccer',duration:5,pageURL:'p',user:'u',videos:{medium:{url:'https://cdn.pixabay.com/m.mp4',width:1,height:2}}},'q').id,'pixabay-7');
 const clips=parseMixkit('<img alt="Player dribbling in a soccer game."><a href="https://assets.mixkit.co/videos/43481/43481-360.mp4"></a>','soccer');
 assert.equal(clips[0].url,'https://assets.mixkit.co/videos/43481/43481-720.mp4');assert.equal(clips[0].title,'Player dribbling in a soccer game.');
});
import {chooseClips,overlay} from '../scripts/render-meme-reels.mjs';
test('gives every line its own long-enough clip, honoring reviewed pins',()=>{
 const clips=[{id:'a',query:'q',file:'a',duration:2},{id:'b',query:'q',file:'b',duration:9},{id:'c',query:'q',file:'c',duration:9},{id:'d',query:'q',duration:9}];
 assert.deepEqual(chooseClips({segments:[{footage:'q',seconds:3},{footage:'q',seconds:3}]},clips).map(c=>c.id),['b','c']);
 assert.equal(chooseClips({segments:[{footage:'q',seconds:3},{footage:'q',seconds:3},{footage:'q',seconds:3}]},clips)[2],null);
 assert.equal(chooseClips({segments:[{clip:'c',seconds:3}]},clips)[0].id,'c');
});
test('escapes overlay text',()=>{assert.match(overlay({text:'<b>"x"'}),/&lt;b&gt;&quot;x&quot;/);});
test('YouTube clips are only ever fetched from their Commons copy',async()=>{
 const src=(await import('node:fs')).readFileSync(new URL('../scripts/footage-library.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(src,/googlevideo|yt-dlp|youtube\.com\/watch[^"]*download/);assert.match(src,/insource:/);
});
import {relevant} from '../scripts/footage-library.mjs';import {visuallyUsable,parseSignalstats} from '../scripts/render-meme-reels.mjs';
test('keeps clips whose title matches the search and drops unrelated ones',()=>{
 assert.equal(relevant({query:'texting phone',title:'Woman texting on her phone'}),true);
 assert.equal(relevant({query:'counting money',title:'Typewritten court document 1917'}),false);
 assert.equal(relevant({query:'soccer ball',title:'Kids kick a football in the park'}),true);
});
test('rejects black, washed-out and flat frames from signalstats output',()=>{
 const s=parseSignalstats('[Parsed_metadata_1] lavfi.signalstats.YAVG=112.4\nlavfi.signalstats.YLOW=20\nlavfi.signalstats.YHIGH=231');
 assert.deepEqual(s,{avg:112.4,low:20,high:231});assert.equal(visuallyUsable([s]),true);
 assert.equal(visuallyUsable([{avg:8,low:2,high:30}]),false);assert.equal(visuallyUsable([{avg:120,low:110,high:140}]),false);assert.equal(visuallyUsable([]),false);
});
test('rejects other football codes even when the words match',()=>{assert.equal(relevant({query:'amateur football',title:'Amateur American football practice'}),false);});
import {clubMediaUrls,articleLinks} from '../scripts/footage-library.mjs';
test('takes match photos and video from the club host, never logos, sponsors or other hosts',()=>{
 const html='"https://www.rowdiessoccer.com/wp-content/uploads/sites/38/2026/02/TBRvCHS_096.jpg" "https://www.rowdiessoccer.com/wp-content/uploads/sites/38/2022/02/AEX_LOGOHughes_large.jpg" "https://www.rowdiessoccer.com/wp-content/uploads/x/clip.mp4" "https://cdn.other.com/wp-content/uploads/a.jpg" "https://www.rowdiessoccer.com/wp-content/uploads/a/Sheraton-RGB.jpg"';
 assert.deepEqual(clubMediaUrls(html,'www.rowdiessoccer.com'),['https://www.rowdiessoccer.com/wp-content/uploads/sites/38/2026/02/TBRvCHS_096.jpg','https://www.rowdiessoccer.com/wp-content/uploads/x/clip.mp4']);
 assert.deepEqual(articleLinks('"https://www.ftlutd.com/news/ftl-united-signs-new-forward-for-2027/" "https://www.ftlutd.com/news/"','www.ftlutd.com'),['https://www.ftlutd.com/news/ftl-united-signs-new-forward-for-2027/']);
});
