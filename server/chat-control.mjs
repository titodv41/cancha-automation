import {backendFrozen} from './github-state.mjs';
import {readPlan,savePlan,validPostImage} from './instagram-plan.mjs';
import {createHash, timingSafeEqual} from 'node:crypto';
import {contentHash, saveDraft, approve} from './instagram-queue.mjs';
import {confirmPostSource,requiresSource} from './post-source.mjs';
const paths = ['/automation/review', '/automation/control', '/automation/plan'];
const hash = value => createHash('sha256').update(value).digest('hex');
export const queueVersion = row => hash(JSON.stringify({content:contentHash(JSON.parse(row.content)),status:row.status,scheduledAt:row.scheduled_at,container:row.container_id,published:row.published_id}));
const version=queueVersion;
class ControlError extends Error {constructor(status,message){super(message);this.status=status;}}
const requireThat=(condition,status,message)=>{if(!condition)throw new ControlError(status,message);};
function visible(row){const content=JSON.parse(row.content);return {id:row.id,status:row.status,version:version(row),scheduledAt:row.scheduled_at,publishedId:row.published_id,note:row.note,sourceRecheckedAt:row.source_rechecked_at||null,content};}

async function readBody(req){const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;requireThat(size<=65536,413,'Request too large');chunks.push(chunk);}return Buffer.concat(chunks);}
export function createChatControl({db,vault,token,origin,fetchImpl=fetch}){
 db.exec('CREATE TABLE IF NOT EXISTS chat_control_receipts(id TEXT PRIMARY KEY,payload_hash TEXT NOT NULL,result TEXT NOT NULL,created_at TEXT NOT NULL,owner_instruction TEXT NOT NULL)');
 const reply=(res,status,value)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value));};
 const receipt=(id,payloadHash)=>{const found=db.prepare('SELECT * FROM chat_control_receipts WHERE id=?').get(id);if(!found)return null;requireThat(found.payload_hash===payloadHash,409,'Request ID was already used for another command');return JSON.parse(found.result);};
 return {handles(path){return paths.includes(path);},async handle(req,res,path){
  try{
   requireThat(typeof token==='string'&&token.length>=32,503,'Chat control is not configured');
   const supplied=createHash('sha256').update(String(req.headers.authorization||'')).digest(),expected=createHash('sha256').update('Bearer '+token).digest();
   requireThat(timingSafeEqual(supplied,expected),401,'Unauthorized');
   requireThat(!req.headers.origin||req.headers.origin===origin,403,'Origin rejected');
   if(path==='/automation/review'){
    requireThat(req.method==='GET',405,'Use GET');const connection=vault.read();
    return reply(res,200,{meta:{connected:!!connection,username:connection?.username||null,accountType:connection?.accountType||null},timezone:'America/New_York',plan:readPlan(db),publishingPolicy:readPlan(db)?.enabled?'Owner-authorized standing plan enabled':'Owner instruction required per post; standing plan paused',posts:db.prepare('SELECT * FROM instagram_queue ORDER BY scheduled_at,id').all().map(visible)});
   }
   requireThat(!backendFrozen(db),409,'Render is frozen for GitHub migration');
   requireThat(req.method==='POST',405,'Use POST');requireThat(String(req.headers['content-type']||'').startsWith('application/json'),415,'JSON required');
   let command;try{command=JSON.parse(await readBody(req));}catch(error){if(error instanceof ControlError)throw error;throw new ControlError(400,'Invalid JSON');}
   requireThat(command&&typeof command==='object'&&!Array.isArray(command),422,'A command object is required');
   requireThat(/^[a-zA-Z0-9_-]{16,64}$/.test(command.requestId||''),422,'A unique request ID is required');
   requireThat(typeof command.ownerInstruction==='string'&&command.ownerInstruction.trim().length>=3&&command.ownerInstruction.length<=2000,422,'Record the actual owner instruction');
   requireThat(['draft','edit','schedule','cancel','plan'].includes(command.action),422,'Unknown command');
   const payloadHash=hash(JSON.stringify(command)),prior=receipt(command.requestId,payloadHash);if(prior)return reply(res,200,{...prior,replayed:true});
   if(path==='/automation/plan'){
    requireThat(command.action==='plan'&&command.authorized===true,422,'Explicit owner plan authorization required');
    db.exec('BEGIN IMMEDIATE');try{const plan=savePlan(db,command.plan,command.ownerInstruction);const result={action:'plan',plan};db.prepare('INSERT INTO chat_control_receipts VALUES(?,?,?,?,?)').run(command.requestId,payloadHash,JSON.stringify(result),new Date().toISOString(),command.ownerInstruction.trim());db.exec('COMMIT');return reply(res,200,result);}catch(error){db.exec('ROLLBACK');throw error;}
   }
   requireThat(command.action!=='plan',422,'Use the plan endpoint');
   const get=()=>db.prepare('SELECT * FROM instagram_queue WHERE id=?').get(command.id);
   requireThat(typeof command.id==='string'&&/^[a-zA-Z0-9_-]{1,120}$/.test(command.id),422,'Invalid post ID');
   let row=get(),sourceChecked=false;
   if(command.action!=='draft'){
    requireThat(row,404,'Post not found');requireThat(command.version===version(row),409,'Post changed; read the queue and confirm the current content again');
   }else requireThat(!row,409,'Post already exists; use edit for a draft');
   if(command.action==='schedule'){
    requireThat(command.authorized===true,422,'An explicit owner instruction to publish or schedule is required');
    requireThat(row.status==='Draft',409,'Only Draft posts can be scheduled; cancel an existing schedule first');
    const connection=vault.read();requireThat(connection,409,'Instagram must be connected');
    const content=JSON.parse(row.content);requireThat(validPostImage(content),422,'A public Framer JPEG and asset checksum are required');
    requireThat(content.format!=='story'||connection.accountType==='BUSINESS',422,'Stories require a confirmed Business account');
    requireThat(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(command.scheduledAt||'')&&Number.isFinite(Date.parse(command.scheduledAt))&&Date.parse(command.scheduledAt)>Date.now()&&new Date(command.scheduledAt).toISOString().slice(0,19)===command.scheduledAt.slice(0,19),422,'A future UTC schedule is required');
    if(requiresSource(content)){
     try{await confirmPostSource(content,{fetchImpl});sourceChecked=true;}catch{throw new ControlError(422,'Official source changed, closed or unavailable; revise the draft before scheduling');}
    }
   }
   db.exec('BEGIN IMMEDIATE');
   try{
    const duplicate=receipt(command.requestId,payloadHash);if(duplicate){db.exec('COMMIT');return reply(res,200,{...duplicate,replayed:true});}
    row=get();
    if(command.action!=='draft')requireThat(row&&command.version===version(row),409,'Post changed while checking; read it again before acting');
    else requireThat(!row,409,'Post was created by another request');
    if(command.action==='draft'){
     const input=command.content;requireThat(input&&typeof input==='object'&&!Array.isArray(input)&&input.id===command.id,422,'Draft ID must match');
     const fields=['id','format','sourceType','caption','altText','headline','body','kicker','cta','assetUrl','assetChecksum','rights','factsCheckedAt','sourceHash','sourcePostingId','officialSourceUrl','topic'];
     const content=Object.fromEntries(fields.filter(key=>input[key]!==undefined).map(key=>[key,input[key]]));
     requireThat(['feed','story'].includes(content.format)&&['brand','opportunity','news'].includes(content.sourceType),422,'Choose feed/story and brand/opportunity');
     requireThat(typeof content.caption==='string'&&content.caption.trim()&&content.caption.length<=2200&&typeof content.altText==='string'&&content.altText.trim()&&content.altText.length<=1000&&validPostImage(content),422,'Caption, image description and immutable JPEG are required');
     requireThat(!requiresSource(content)||(/^[a-f0-9]{64}$/.test(content.sourceHash||'')&&typeof content.officialSourceUrl==='string'&&Number.isFinite(Date.parse(content.factsCheckedAt))&&Date.parse(content.factsCheckedAt)<=Date.now()),422,'Opportunity source evidence is required');
     saveDraft(db,content);
    }else if(command.action==='edit'){
     requireThat(row.status==='Draft',409,'Cancel the schedule before editing');
     requireThat(typeof command.caption==='string'&&command.caption.trim()&&command.caption.length<=2200&&typeof command.altText==='string'&&command.altText.trim()&&command.altText.length<=1000,422,'Valid caption and image description are required');
     saveDraft(db,{...JSON.parse(row.content),caption:command.caption.trim(),altText:command.altText.trim()});
    }else if(command.action==='cancel'){
     requireThat(['Approved','Preparing'].includes(row.status),409,'This post cannot be canceled; check publication status');
     db.prepare("UPDATE instagram_queue SET status='Draft',approved_hash=NULL,approved_by=NULL,scheduled_at=NULL,container_id=NULL,note='Schedule canceled through owner-authorized chat control' WHERE id=? AND status IN ('Approved','Preparing')").run(command.id);
    }else{
     const currentConnection=vault.read();requireThat(currentConnection,409,'Instagram was disconnected during the source check');requireThat(JSON.parse(row.content).format!=='story'||currentConnection.accountType==='BUSINESS',422,'Stories require a confirmed Business account');
     if(sourceChecked)db.prepare('UPDATE instagram_queue SET source_rechecked_at=? WHERE id=?').run(new Date().toISOString(),command.id);
     approve(db,command.id,{reviewer:'Cancha owner instruction via authenticated chat control',scheduledAt:command.scheduledAt,allowSourceRecheck:sourceChecked});
    }
    const result={action:command.action,post:visible(get()),publishingHandledBy:'Hosted worker; scheduled is not yet published'};
    db.prepare('INSERT INTO chat_control_receipts VALUES(?,?,?,?,?)').run(command.requestId,payloadHash,JSON.stringify(result),new Date().toISOString(),command.ownerInstruction.trim());
    db.exec('COMMIT');return reply(res,200,result);
   }catch(error){db.exec('ROLLBACK');throw error;}
  }catch(error){return reply(res,error instanceof ControlError?error.status:422,{error:error instanceof ControlError?error.message:'Command could not be completed; read the current post and configuration before retrying'});}
 }};
}
