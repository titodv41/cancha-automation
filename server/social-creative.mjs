import {createHash} from 'node:crypto';
export function approvedSocialPhoto(photo){try{const url=new URL(photo.url),source=new URL(photo.sourcePage);return url.origin==='https://framerusercontent.com'&&/^\/images\/.+\.jpe?g$/i.test(url.pathname)&&!url.search&&!url.username&&!url.password&&source.origin==='https://commons.wikimedia.org'&&source.pathname.startsWith('/wiki/File:')&&/^[a-f0-9]{64}$/.test(photo.originalChecksum||'')&&!!photo.creator&&((photo.license==='CC0'&&photo.licenseUrl==='https://creativecommons.org/publicdomain/zero/1.0/deed.en')||(photo.license==='CC BY 4.0'&&photo.licenseUrl==='https://creativecommons.org/licenses/by/4.0'))&&['photo-poster','photo-split'].includes(photo.layout);}catch{return false;}}
export function applyEditorialCreative(row,photos){
 if(row.sourceType!=='brand')return row;
 const approved=photos.filter(approvedSocialPhoto);if(!approved.length)throw Error('Approved real photography is required for brand preparation');
 const index=createHash('sha256').update(row.id).digest().readUInt32BE(0)%approved.length,photo=approved[index];
 const credit=`Photo: ${photo.creator} / Wikimedia Commons (${photo.license}). ${photo.alt} Cropped and overlaid with Cancha design.\n${photo.sourcePage}\n${photo.licenseUrl}`;
 return {...row,photo,visualStyle:photo.layout,caption:row.caption+'\n\n'+credit,altText:row.altText+' '+photo.alt,rights:`Original Cancha copy and design; real illustrative photograph by ${photo.creator}, ${photo.license}. Reuse terms and source recorded; no claimed affiliation with the people or location photographed.`};
}
