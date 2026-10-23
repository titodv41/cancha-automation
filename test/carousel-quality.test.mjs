import test from 'node:test';import assert from 'node:assert/strict';
import {distinctCarouselPhotos,passesCarouselPolicy} from '../server/carousel-quality.mjs';
import {satisfiesDailyMediaMix} from '../server/instagram-media-mix.mjs';
const make=()=>({id:'new-guide',photos:[{id:'a',originalUrl:'https://club.org/a.jpg',originalChecksum:'a'.repeat(64)},{id:'b',originalUrl:'https://club.org/b.jpg',originalChecksum:'b'.repeat(64)},{id:'c',originalUrl:'https://club.org/c.jpg',originalChecksum:'c'.repeat(64)}],slides:[{photoId:'a'},{photoId:'b'},{photoId:'c'}]});
test('three genuinely different source photographs pass; crops of one do not',()=>{
 const c=make();assert.equal(distinctCarouselPhotos(c),true);
 assert.equal(distinctCarouselPhotos({...c,slides:[{photoId:'a'},{photoId:'a'},{photoId:'a'}]}),false);
 c.photos[1].originalChecksum=c.photos[0].originalChecksum;assert.equal(distinctCarouselPhotos(c),false);
});
test('renaming source IDs, query strings or Wix resize variants cannot disguise a repeated photo',()=>{
 const c=make();c.photos[1].originalUrl=c.photos[0].originalUrl+'?width=300';assert.equal(distinctCarouselPhotos(c),false);
 c.photos[0].originalUrl='https://static.wixstatic.com/media/a.jpg/v1/fill/w_300/a.jpg';c.photos[1].originalUrl='https://static.wixstatic.com/media/a.jpg/v1/fill/w_600/a.jpg';assert.equal(distinctCarouselPhotos(c),false);
});
test('publishing also stops an already-approved repeated-photo carousel or retired non-video post',()=>{
 const c=make(),policy={requireDistinctCarouselPhotos:true};assert.equal(satisfiesDailyMediaMix(c,[],policy),true);
 c.slides[1].photoId='a';assert.equal(satisfiesDailyMediaMix(c,[],policy),false);
 assert.equal(satisfiesDailyMediaMix({id:'old'},[],{retiredDraftIds:['old']}),false);
 assert.equal(passesCarouselPolicy(c,{}),true);
});
