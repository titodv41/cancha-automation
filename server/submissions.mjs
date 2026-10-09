import http from 'node:http';
import {validateIntake} from './intake-validation.mjs';
import {startInstagramWorker} from './instagram-worker.mjs';
import {createAutomationConsole} from './automation-console.mjs';
import {readFileSync} from 'node:fs';
import {openQueue,saveDraft} from './instagram-queue.mjs';
import { createHmac, timingSafeEqual, createHash, randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, chmodSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function signatureFor(secret, id, body) {
  return 'sha256=' + createHmac('sha256', secret).update(body).update(id).digest('hex');
}
export function validSignature(secret, id, body, signature) {
  if (typeof id !== 'string' || !/^[A-Za-z0-9-]{1,128}$/.test(id) || typeof signature !== 'string' || !/^sha256=[a-f0-9]{64}$/.test(signature)) return false;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(signatureFor(secret, id, body)));
}
export const validateSubmission=data=>validateIntake(data,'opportunity');
export function createSubmissionServer({ secret, databasePath, admin }) {
  if (typeof secret !== 'string' || secret.length < 32) throw new Error('Configure a secure CANCHA_WEBHOOK_SECRET of at least 32 characters');
  mkdirSync(dirname(databasePath), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(databasePath);chmodSync(databasePath,0o600);
  db.exec(`CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY, delivery_id TEXT UNIQUE NOT NULL, payload_hash TEXT NOT NULL,
    fingerprint TEXT NOT NULL, duplicate_of TEXT, created_at TEXT NOT NULL,
    kind TEXT NOT NULL DEFAULT 'opportunity',
    status TEXT NOT NULL DEFAULT 'Pending review' CHECK(status IN ('Pending review','Approved','Rejected')),
    payload TEXT NOT NULL, review_note TEXT NOT NULL DEFAULT '', reviewed_at TEXT, reviewed_by TEXT
  )`);
  if(!db.prepare('PRAGMA table_info(submissions)').all().some(x=>x.name==='kind'))db.exec("ALTER TABLE submissions ADD COLUMN kind TEXT NOT NULL DEFAULT 'opportunity'");
  for(const column of ['reviewed_at','reviewed_by'])if(!db.prepare('PRAGMA table_info(submissions)').all().some(x=>x.name===column))db.exec('ALTER TABLE submissions ADD COLUMN '+column+' TEXT');
  const getDelivery = db.prepare('SELECT id,payload_hash FROM submissions WHERE delivery_id=?');
  const getDuplicate = db.prepare('SELECT id FROM submissions WHERE fingerprint=? ORDER BY created_at LIMIT 1');
  const insert = db.prepare("INSERT INTO submissions(id,delivery_id,payload_hash,fingerprint,duplicate_of,created_at,kind,status,payload) VALUES(?,?,?,?,?,?,?,'Pending review',?)");
  const server = http.createServer(async (req,res) => {
    if(admin?.handles(req.url))return admin.handle(req,res);
    function send(status,body={}) { res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(body)); }
    if(req.method==='GET'&&req.url==='/health')return send(200,{ok:true});
    const kind={'/webhook':'opportunity','/providers/webhook':'provider','/offers/webhook':'offer'}[req.url];
    if(req.method!=='POST'||!kind)return send(404);
    if(!String(req.headers['content-type']).startsWith('application/json'))return send(415);
    let bytes=0;const chunks=[];
    try {
      for await(const chunk of req){bytes+=chunk.length;if(bytes>65536){send(413);req.resume();return;}chunks.push(chunk);}
      const body=Buffer.concat(chunks),delivery=req.headers['framer-webhook-submission-id'];
      if(!validSignature(secret,delivery,body,req.headers['framer-signature']))return send(401);
      let payload;try{payload=validateIntake(JSON.parse(body.toString('utf8')),kind);}catch{return send(422,{error:'Invalid submission fields'});}
      const hash=createHash('sha256').update(body).digest('hex');
      const existing=getDelivery.get(delivery);
      if(existing)return send(existing.payload_hash===hash?200:409,existing.payload_hash===hash?{id:existing.id,status:'Pending review'}:{});
      const fingerprint=createHash('sha256').update([kind,payload.Organization||payload['Provider Name']||payload.Company,payload['Opportunity Title']||payload['Offer Title']||payload['Provider Name'],payload['Registration Link']||payload['Booking Link']||payload['Redemption Link']].map(x=>x.toLowerCase()).join('\n')).digest('hex');
      const duplicate=getDuplicate.get(fingerprint),id=randomUUID();
      insert.run(id,delivery,hash,fingerprint,duplicate?.id||null,new Date().toISOString(),kind,JSON.stringify(payload));
      return send(201,{id,status:'Pending review'});
    }catch{return send(500,{error:'Unable to store submission'});}
  });
  server.on('close',()=>{db.close();admin?.close();});
  return {server,db};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const baseUrl=process.env.CANCHA_PUBLIC_BASE_URL||process.env.RENDER_EXTERNAL_URL;const queuePath=resolve(process.env.CANCHA_CONTENT_DB||'private-data/instagram.sqlite');
  const expectedMeta=JSON.parse(readFileSync('config/meta-account.json','utf8'));
  const admin=baseUrl?createAutomationConsole({baseUrl,password:process.env.CANCHA_ADMIN_PASSWORD,encryptionKey:process.env.META_TOKEN_ENCRYPTION_KEY,vaultPath:resolve(process.env.CANCHA_META_DB||'private-data/meta.sqlite'),queuePath,appId:process.env.META_APP_ID,appSecret:process.env.META_APP_SECRET,version:process.env.META_GRAPH_VERSION,loginConfigId:process.env.META_LOGIN_CONFIG_ID,expectedPageId:process.env.META_EXPECTED_PAGE_ID||expectedMeta.pageId,expectedAccountId:expectedMeta.instagramAccountId,accountType:process.env.META_INSTAGRAM_ACCOUNT_TYPE,ingestSecret:process.env.CANCHA_AUTOMATION_INGEST_SECRET,statusToken:process.env.CANCHA_STATUS_TOKEN,controlToken:process.env.CANCHA_CONTROL_TOKEN,reviewer:process.env.CANCHA_REVIEWER||'Cancha account owner'}):undefined;
  if(admin){const queue=openQueue(queuePath);try{for(const row of JSON.parse(readFileSync('content/instagram/bootstrap.json','utf8')))if(!queue.prepare('SELECT id FROM instagram_queue WHERE id=?').get(row.id))saveDraft(queue,row);}finally{queue.close();}}
  const {server}=createSubmissionServer({secret:process.env.CANCHA_WEBHOOK_SECRET,databasePath:resolve(process.env.CANCHA_SUBMISSIONS_DB||'private-data/submissions.sqlite'),admin});
  if(process.env.ENABLE_INSTAGRAM_WORKER==='1'){const stopWorker=startInstagramWorker();server.on('close',stopWorker);}
  server.listen(Number(process.env.PORT||8787),process.env.BIND_ADDRESS||'127.0.0.1',()=>console.log('Private submission receiver started'));
}
