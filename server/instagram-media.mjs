import {createHash} from 'node:crypto';
// A carousel remains one feed post, with one approval and publication receipt.
export const postImages = row => row.slides === undefined ? [{assetUrl: row.assetUrl, assetChecksum: row.assetChecksum, altText: row.altText}] : row.slides;
export function validJpeg(asset, {hosted = false} = {}) {
  try {
    const u = new URL(asset.assetUrl);
    return u.protocol === 'https:' && !u.username && !u.password && /\.jpe?g$/i.test(u.pathname)
      && (!hosted || u.origin === 'https://framerusercontent.com' && u.pathname.startsWith('/images/') && !u.search)
      && (!hosted || /^[a-f0-9]{64}$/.test(asset.assetChecksum || ''));
  } catch { return false; }
}
export function validCarousel(row, {hosted = false} = {}) {
  if (row.slides === undefined) return true;
  return !row.reel && row.format === 'feed' && Array.isArray(row.slides) && row.slides.length >= 2 && row.slides.length <= 10
    && row.slides[0].assetUrl === row.assetUrl && row.slides[0].assetChecksum === row.assetChecksum
    && new Set(row.slides.map(s => s.assetUrl)).size === row.slides.length
    && row.slides.every(s => validJpeg(s, {hosted}) && /^[a-f0-9]{64}$/.test(s.assetChecksum || '')
      && typeof s.altText === 'string' && s.altText.length > 0 && s.altText.length <= 1000
      && s.width === 1080 && s.height === 1350);
}
export function validReel(row) {
  if(row.reel===undefined)return true;
  try {const v=row.reel,u=new URL(v.assetUrl);return row.format==='feed'&&row.slides===undefined&&validJpeg(row,{hosted:true})&&u.origin==='https://framerusercontent.com'&&u.pathname.startsWith('/assets/')&&/\.mp4$/.test(u.pathname)&&!u.username&&!u.password&&!u.search&&/^[a-f0-9]{64}$/.test(v.assetChecksum||'')&&v.width===1080&&v.height===1920&&v.durationSeconds>=3&&v.durationSeconds<=90&&v.codec==='h264'&&v.audioCodec==='aac';}catch{return false}
}
export async function verifyReelAssets(row,{fetchImpl=fetch}={}) {
  if(!row.reel||!validReel(row))throw Error('Invalid Reel media');
  for(const asset of[{...row,type:/image\/jpeg/,limit:8_000_000}, {...row.reel,type:/video\/mp4/,limit:20_000_000,mp4:true}]){
    const response=await fetchImpl(asset.assetUrl,{redirect:'error',signal:AbortSignal.timeout(30000)});
    if(!response.ok||!asset.type.test(response.headers.get('content-type')||'')){await response.body?.cancel();throw Error('Reel asset unavailable')}
    const reader=response.body.getReader(),chunks=[];let size=0;
    try{while(true){const{done,value}=await reader.read();if(done)break;size+=value.length;if(size>asset.limit)throw Error('Reel asset exceeds size limit');chunks.push(Buffer.from(value))}}finally{await reader.cancel()}
    const bytes=Buffer.concat(chunks);if(createHash('sha256').update(bytes).digest('hex')!==asset.assetChecksum)throw Error('Reel asset bytes changed');
    if(asset.mp4&&!bytes.subarray(0,64).includes(Buffer.from('ftyp')))throw Error('Invalid MP4');
  }
  return true;
}

export async function verifyCarouselAssets(row, {fetchImpl=fetch}={}) {
  if (!validCarousel(row,{hosted:true})) throw Error('Invalid hosted carousel');
  for (const slide of row.slides) {
    // Public images receive no Meta Authorization header.
    const response=await fetchImpl(slide.assetUrl,{redirect:'error',signal:AbortSignal.timeout(30000)});
    if(!response.ok||!/image\/jpeg/i.test(response.headers.get('content-type')||'')){await response.body?.cancel();throw Error('Carousel image unavailable');}
    const reader=response.body.getReader(),chunks=[];let total=0;
    try {while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>8_000_000)throw Error('Carousel image too large');chunks.push(Buffer.from(value));}}
    finally {await reader.cancel();}
    const bytes=Buffer.concat(chunks);
    if(bytes[0]!==0xff||bytes[1]!==0xd8||createHash('sha256').update(bytes).digest('hex')!==slide.assetChecksum)throw Error('Carousel image bytes changed');
  }
  return true;
}
