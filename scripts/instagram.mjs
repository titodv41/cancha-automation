import {readFile} from 'node:fs/promises';import {resolve} from 'node:path';
import {openQueue,saveDraft,approve,dispatchDue,metaPublisher} from '../server/instagram-queue.mjs';
const [action,...args]=process.argv.slice(2);if(!['import','list','approve','due','run'].includes(action))throw Error('Usage: instagram.mjs import FILE | list | approve ID REVIEWER FUTURE_UTC_TIMESTAMP | due | run --execute');
const db=openQueue(resolve(process.env.CANCHA_CONTENT_DB||'private-data/instagram.sqlite'));
try{
 if(action==='import'){const rows=JSON.parse(await readFile(args[0]||'content/instagram/drafts.json'));for(const row of rows)saveDraft(db,row);console.log(JSON.stringify({drafts:rows.length,scheduled:0}));}
 if(action==='list')console.log(JSON.stringify(db.prepare('SELECT id,status,scheduled_at,approved_by,note FROM instagram_queue ORDER BY id').all(),null,2));
 if(action==='approve'){approve(db,args[0],{reviewer:args[1],scheduledAt:args[2]});console.log('Human review recorded; content scheduled.');}
 if(action==='due')console.log(JSON.stringify(db.prepare("SELECT id,status,scheduled_at FROM instagram_queue WHERE status IN ('Approved','Preparing') AND scheduled_at<=?").all(new Date().toISOString()),null,2));
 if(action==='run'){if(args[0]!=='--execute')throw Error('Use due for read-only checks; explicit --execute is required for publishing');const publisher=metaPublisher({token:process.env.META_PAGE_ACCESS_TOKEN,accountId:process.env.META_INSTAGRAM_ACCOUNT_ID,version:process.env.META_GRAPH_VERSION,accountType:process.env.META_INSTAGRAM_ACCOUNT_TYPE});console.log(JSON.stringify(await dispatchDue(db,publisher)));}
}finally{db.close();}
