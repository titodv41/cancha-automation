import test from 'node:test';import assert from 'node:assert/strict';import {applyEditorialCreative,approvedSocialPhoto} from '../server/social-creative.mjs';
const photo={url:'https://framerusercontent.com/images/photo.jpg',sourcePage:'https://commons.wikimedia.org/wiki/File:Soccer.jpg',originalChecksum:'a'.repeat(64),creator:'Photographer',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0',layout:'photo-poster',alt:'Soccer in Dallas.'};
test('real editorial photos require permitted source terms and retain credit/context',()=>{assert(approvedSocialPhoto(photo));for(const invalid of [{...photo,license:'All rights reserved'},{...photo,url:'http://example.test/photo.jpg'},{...photo,sourcePage:'https://example.test/photo'},{...photo,originalChecksum:''}])assert.equal(approvedSocialPhoto(invalid),false);const row={id:'test',sourceType:'brand',caption:'Practice makes progress.',altText:'Cancha tip.'};const result=applyEditorialCreative(row,[photo]);assert(result.caption.includes('Photographer'));assert(result.caption.includes(photo.licenseUrl));assert(result.altText.includes('Dallas'));assert.deepEqual(applyEditorialCreative(row,[photo]),result);assert.throws(()=>applyEditorialCreative(row,[]));const news={...row,sourceType:'news'};assert.equal(applyEditorialCreative(news,[photo]),news);});

test('photo reuse checks original source across different crops and render files for 30 days',async()=>{
 const {recentlyUsedPhoto}=await import('../server/social-creative.mjs');
 const at='2026-10-15T22:00:00Z',old={status:'Published',published_at:'2026-10-14T22:00:00Z',content:JSON.stringify({photo,assetUrl:'https://framerusercontent.com/images/old-crop.jpg'})};
 assert.equal(recentlyUsedPhoto({photo:{...photo,url:'https://framerusercontent.com/images/new-crop.jpg'},assetUrl:'https://framerusercontent.com/images/new-render.jpg'},[old],at),true);
 assert.equal(recentlyUsedPhoto({photo:{originalChecksum:photo.originalChecksum}},[old],at),true);
 assert.equal(recentlyUsedPhoto({photo:{sourcePage:photo.sourcePage}},[old],at),true);
 assert.equal(recentlyUsedPhoto({photo:{sourcePage:'https://commons.wikimedia.org/wiki/File:Different.jpg'}},[old],at),false);
 assert.equal(recentlyUsedPhoto({photo},[{...old,status:'Draft'}],at),false);
 assert.equal(recentlyUsedPhoto({photo},[{...old,published_at:'2026-09-15T22:00:00Z'}],at),false);
});
