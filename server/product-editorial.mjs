import {createHash} from 'node:crypto';
import {approvedOriginalCreative} from './social-creative.mjs';
import {validJpeg} from './instagram-media.mjs';
import {saveDraft} from './instagram-queue.mjs';

export function approvedProductDemo(row,policy={}) {
 const e=row?.visualEvidence,s=row?.screenshot;
 if(!policy.productDemoDraftIds?.includes(row?.id)||e?.kind!=='product-demo'||!approvedOriginalCreative(row)||!validJpeg(row,{hosted:true})||row.slides||row.reel||!Number.isFinite(Date.parse(row.factsCheckedAt))||!s)return false;
 try {
  const url=new URL(s.sourceUrl),image=new URL(s.assetUrl);
  return url.origin==='https://pioneering-friday-005497.framer.app'&&url.pathname==='/clubs'&&!url.username&&!url.password
   &&e.sourceUrl===s.sourceUrl&&image.origin==='https://framerusercontent.com'&&image.pathname.startsWith('/images/')&&/\.png$/.test(image.pathname)&&!image.search
   &&/^[a-f0-9]{64}$/.test(s.assetChecksum||'')&&s.width===1100&&s.height===900&&Number.isFinite(Date.parse(s.capturedAt))
   &&Date.parse(s.capturedAt)<=Date.now()&&Date.now()-Date.parse(s.capturedAt)<7*86400000;
 }catch{return false}
}
export async function confirmProductSource(row,{fetchImpl=fetch}={}) {
 try {
  const u=new URL(row.visualEvidence?.sourceUrl);if(u.origin!=='https://pioneering-friday-005497.framer.app'||u.pathname!=='/clubs'||u.username||u.password)return false;
  const response=await fetchImpl(u.href,{redirect:'error',signal:AbortSignal.timeout(20000)});
  if(!response.ok||!/text\/html/.test(response.headers.get('content-type')||'')){await response.body?.cancel();return false}
  const reader=response.body.getReader(),chunks=[];let size=0;
  try{while(true){const{done,value}=await reader.read();if(done)break;size+=value.length;if(size>3_000_000)return false;chunks.push(Buffer.from(value))}}finally{await reader.cancel()}
  return /Cancha/.test(Buffer.concat(chunks).toString('utf8'));
 }catch{return false}
}
export async function verifyProductAssets(row,policy,{fetchImpl=fetch}={}) {
 if(!approvedProductDemo(row,policy))throw Error('Reviewed Cancha screenshot evidence required');
 for(const [asset,type,magic]of [[row,/image\/jpeg/,'jpeg'],[row.screenshot,/image\/png/,'png']]){
  const response=await fetchImpl(asset.assetUrl,{redirect:'error',signal:AbortSignal.timeout(30000)});
  if(!response.ok||!type.test(response.headers.get('content-type')||'')){await response.body?.cancel();throw Error('Product artwork unavailable')}
  const reader=response.body.getReader(),chunks=[];let size=0;
  try{while(true){const{done,value}=await reader.read();if(done)break;size+=value.length;if(size>8_000_000)throw Error('Product asset too large');chunks.push(Buffer.from(value))}}finally{await reader.cancel()}
  const b=Buffer.concat(chunks);if(createHash('sha256').update(b).digest('hex')!==asset.assetChecksum||(magic==='jpeg'?b[0]!==255||b[1]!==216:!b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))))throw Error('Product asset changed');
 }
 return true;
}
export function refreshProductEditorial(db,drafts,policy) {
 if(!drafts.length||drafts.length>3||drafts.some(d=>!approvedProductDemo(d,policy)))throw Error('Reviewed product artwork required');
 const result={updated:[],protected:[]};db.exec('BEGIN IMMEDIATE');
 try{for(const draft of drafts){const old=db.prepare('SELECT status FROM instagram_queue WHERE id=?').get(draft.id);if(old&&old.status!=='Draft'){result.protected.push(draft.id);continue}saveDraft(db,draft);result.updated.push(draft.id)}db.exec('COMMIT');return result}catch(error){db.exec('ROLLBACK');throw error}
}
