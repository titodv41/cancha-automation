import {githubStateClient} from './github-state-client.mjs';import {mkdtemp,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {openQueue,saveDraft} from '../server/instagram-queue.mjs';import {snapshotState,restoreState} from '../server/github-state.mjs';
export async function githubDelivery(path,value){const client=githubStateClient();let dir,db;try{const state=await client.load();if(!state||state.backend!=='github')throw Error('Migrate the private state before daily delivery');if(path==='/automation/opportunity-backup'){const ref=await client.saveBackup(value);state.cmsBackupRefs||=[];if(!state.cmsBackupRefs.some(row=>row.hash===ref.hash))state.cmsBackupRefs.push(ref);await client.save(state);return;}
 if(path!=='/automation/drafts'||!Array.isArray(value))throw Error('Unsupported private delivery');dir=await mkdtemp(join(tmpdir(),'cancha-delivery-'));db=openQueue(join(dir,'queue.sqlite'));restoreState(db,state);
 for(const row of value){const existing=db.prepare('SELECT status FROM instagram_queue WHERE id=?').get(row.id);if(!existing||existing.status==='Draft')saveDraft(db,row);}
 await client.save(snapshotState(db,state.connection,state));
 }finally{db?.close();await client.close();if(dir)await rm(dir,{recursive:true,force:true});}}
