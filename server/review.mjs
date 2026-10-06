import {DatabaseSync} from 'node:sqlite';
import {resolve} from 'node:path';
const [action,id,status,...note]=process.argv.slice(2);
if(!['list','set-status'].includes(action))throw Error('Usage: node server/review.mjs list | set-status ID Approved|Rejected NOTE');
const db=new DatabaseSync(resolve(process.env.CANCHA_SUBMISSIONS_DB||'private-data/submissions.sqlite'),{readOnly:action==='list'});
try{
 if(action==='list')console.log(JSON.stringify(db.prepare(`SELECT id,created_at,status,kind,duplicate_of,reviewed_at,reviewed_by,coalesce(json_extract(payload,'$.Organization'),json_extract(payload,'$."Provider Name"'),json_extract(payload,'$.Company')) AS organization,coalesce(json_extract(payload,'$."Opportunity Title"'),json_extract(payload,'$."Offer Title"'),json_extract(payload,'$."Provider Name"')) AS title FROM submissions ORDER BY created_at DESC`).all(),null,2));
 else{if(!['Approved','Rejected'].includes(status)||!id||!note.length||!process.env.CANCHA_REVIEWER?.trim())throw Error('A valid ID, status, review note and CANCHA_REVIEWER identity are required');const result=db.prepare('UPDATE submissions SET status=?,review_note=?,reviewed_at=?,reviewed_by=? WHERE id=?').run(status,note.join(' '),new Date().toISOString(),process.env.CANCHA_REVIEWER.trim(),id);if(result.changes!==1)throw Error('Submission not found');console.log('Review saved; nothing published to Framer');}
}finally{db.close();}
