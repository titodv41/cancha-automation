import{createHash}from'node:crypto';
import{gzipSync,gunzipSync}from'node:zlib';
import{sealState,unsealState}from'./github-state.mjs';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
// Compress the snapshot before encryption; GitHub Contents API returns base64 only below 1 MB.
// Private data is never stored as plaintext or only-compressed data in the repository.
export function sealBackup(snapshot,secret){
 const bytes=Buffer.from(JSON.stringify(snapshot));
 if(bytes.length>32*1024*1024)throw Error('Backup exceeds supported snapshot size');
 return sealState({schema:1,queue:[],backupEncoding:'gzip-json',backupHash:hash(bytes),backup:gzipSync(bytes,{level:9}).toString('base64')},secret);
}
export function unsealBackup(envelope,secret,expectedHash){
 const state=unsealState(envelope,secret);let bytes;
 if(state.backupEncoding==='gzip-json'){
  if(typeof state.backup!=='string'||!/^[a-f0-9]{64}$/.test(state.backupHash||''))throw Error('Invalid compressed backup');
  bytes=gunzipSync(Buffer.from(state.backup,'base64'),{maxOutputLength:32*1024*1024});
  if(hash(bytes)!==state.backupHash)throw Error('Backup checksum mismatch');
 }else if(!state.backupEncoding&&state.backup&&typeof state.backup==='object')bytes=Buffer.from(JSON.stringify(state.backup));
 else throw Error('Unsupported backup encoding');
 if(expectedHash&&hash(bytes)!==expectedHash)throw Error('Backup reference checksum mismatch');
 const snapshot=JSON.parse(bytes);
 if(!snapshot||!Array.isArray(snapshot.items)||!Array.isArray(snapshot.fields))throw Error('Invalid CMS snapshot');
 return snapshot;
}
