import {validDirectoryGuide} from './directory-editorial.mjs';
import {comparisonCarouselAllowed} from './comparison-carousels.mjs';
import {briefCarouselAllowed} from './brief-carousels.mjs';
// A new crop or rendered slide is not a new source photograph.
export function distinctCarouselPhotos(content) {
  if(!Array.isArray(content?.slides)||content.slides.length<2||!Array.isArray(content.photos))return false;
  const checksums=new Set(),urls=new Set(),ids=new Set();
  for(const slide of content.slides){
    const matches=content.photos.filter(p=>p.id===slide.photoId);
    if(matches.length!==1)return false;
    const photo=matches[0];let url;
    try{const u=new URL(photo.originalUrl);url=u.origin+(u.hostname==='static.wixstatic.com'?u.pathname.split('/v1/')[0]:u.pathname);}catch{return false;}
    if(!/^[a-f0-9]{64}$/.test(photo.originalChecksum||'')||checksums.has(photo.originalChecksum)||urls.has(url)||ids.has(photo.id))return false;
    checksums.add(photo.originalChecksum);urls.add(url);ids.add(photo.id);
  }
  return true;
}
export function passesCarouselPolicy(content,policy={}){
  if(content?.visualEvidence?.kind==='directory-guide')return policy.dailyDirectoryEnabled===true&&validDirectoryGuide(content);
  // Owner-approved type-led comparisons carry no photos; their facts and sources are checked instead.
  if(content?.visualEvidence?.kind==='comparison-carousel')return comparisonCarouselAllowed(content,policy);
  if(content?.visualEvidence?.kind==='brief-carousel')return briefCarouselAllowed(content,policy);
  return !policy.requireDistinctCarouselPhotos||!content?.slides?.length||distinctCarouselPhotos(content);
}
