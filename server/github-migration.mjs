import {DatabaseSync} from 'node:sqlite';
import {sealState,snapshotState,unsealState,backendFrozen} from './github-state.mjs';
export function exportForGitHub({db,vault,key,submissionsPath}){
 if(typeof key!=='string'||key.length<32)throw Error('Migration state key required');
 db.exec('CREATE TABLE IF NOT EXISTS instagram_backend_lock(id INTEGER PRIMARY KEY CHECK(id=1),encrypted_snapshot TEXT NOT NULL,created_at TEXT NOT NULL)');
 if(backendFrozen(db)){const envelope=JSON.parse(db.prepare('SELECT encrypted_snapshot FROM instagram_backend_lock WHERE id=1').get().encrypted_snapshot);unsealState(envelope,key);return envelope;}
 if(db.prepare("SELECT id FROM instagram_queue WHERE status='Publishing'").get())throw Error('A publication is in progress; wait before migration');
 const connection=vault.read();if(!connection)throw Error('Connected Instagram account required');
 let submissions=null;if(submissionsPath){const intake=new DatabaseSync(submissionsPath,{readOnly:true});try{submissions={schema:intake.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='submissions'").get()?.sql,rows:intake.prepare('SELECT * FROM submissions').all()};}finally{intake.close();}}
 const envelope=sealState(snapshotState(db,connection,{submissions,cmsBackups:vault.exportBackups(),backend:'github',migratedFrom:'render'}),key);
 // Synchronous snapshot/lock: no worker can claim a publication between them.
 db.prepare('INSERT INTO instagram_backend_lock VALUES(1,?,?)').run(JSON.stringify(envelope),new Date().toISOString());return envelope;
}
