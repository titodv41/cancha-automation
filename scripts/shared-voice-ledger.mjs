import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {githubStateClient} from './github-state-client.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
// The workflow concurrency group serializes all users of this durable ledger.
export async function sharedVoiceLedger({directory,session,allowLocal=false}={}){
 await mkdir(directory,{recursive:true,mode:0o700});
 const hosted=process.env.CANCHA_AUTOMATION_BACKEND==='github'&&!!process.env.CANCHA_GITHUB_STATE_KEY&&!!process.env.GITHUB_TOKEN;
 if(!hosted){if(!allowLocal)throw Error('Automatic narration needs the durable encrypted GitHub ledger');return{save:null,cache:async()=>{},register:async()=>{},close:async()=>{}}}
 const client=githubStateClient();let state=await client.load();if(!state?.connection)throw Error('Private Cancha state is missing');
 const settings=JSON.parse(await readFile('config/automatic-stories.json'));
 if(!state.voiceLedger){const legacy=JSON.parse(await readFile(directory+'/ledger.json').catch(()=>'null'));state.voiceLedger=legacy||{months:{},requests:{}};state.voiceLedger.months[settings.baseline.month]=Math.max(state.voiceLedger.months[settings.baseline.month]||0,settings.baseline.reservedCharacters);for(const b of settings.baseline.requests){if(!state.voiceLedger.requests[b.digest])state.voiceLedger.requests[b.digest]={...b,status:'complete',month:settings.baseline.month,file:directory+'/'+b.digest+'.mp3',timingFile:directory+'/'+b.digest+'.json'}}await client.save(state)}
 await writeFile(directory+'/ledger.json',JSON.stringify(state.voiceLedger,null,2),{mode:0o600});
 return{
  async save(ledger){state.voiceLedger=ledger;await client.save(state)},
  async cache(){for(const request of Object.values(state.voiceLedger.requests)){if(request.status!=='complete')continue;const refs=request.hostedAssets;if(!refs)continue;for(const[name,mime,ext]of[['audio',/audio\//,'mp3'],['timing',/json/,'json']]){const a=refs[name],u=new URL(a.url);if(u.origin!=='https://framerusercontent.com'||!u.pathname.startsWith('/assets/'))throw Error('Voice cache origin changed');const b=await session.html(a.url,mime,{maxBytes:2000000});if(sha(b)!==a.sha256)throw Error('Voice cache checksum changed');const file=directory+'/'+request.audioSha256+'.'+ext;await writeFile(file,b,{mode:0o600});request[name==='audio'?'file':'timingFile']=file;}}await writeFile(directory+'/ledger.json',JSON.stringify(state.voiceLedger,null,2),{mode:0o600});},
  async register(audioSha256,hostedAssets){const ledger=JSON.parse(await readFile(directory+'/ledger.json'));const r=Object.values(ledger.requests).find(r=>r.audioSha256===audioSha256&&r.status==='complete');if(!r)throw Error('Completed narration receipt missing');r.hostedAssets=hostedAssets;state.voiceLedger=ledger;await client.save(state);await writeFile(directory+'/ledger.json',JSON.stringify(ledger,null,2),{mode:0o600});},
  async close(){await client.close()}
 };
}
