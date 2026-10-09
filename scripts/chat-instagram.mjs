// Run mutations only for a specific owner instruction or an approved standing plan.
// Never put tokens in command arguments, files, output or chat.
import {readFile} from 'node:fs/promises';
import fs from 'node:fs';
import {fetch,ProxyAgent} from 'undici';
const [file,...flags]=process.argv.slice(2);
const service=process.env.CANCHA_AUTOMATION_URL,token=process.env.CANCHA_CONTROL_TOKEN;
if(!service||!token)throw Error('Configure CANCHA_AUTOMATION_URL and the secure CANCHA_CONTROL_TOKEN network binding');
const url=new URL(service);
if(url.protocol!=='https:'||url.username||url.password)throw Error('Use the actual HTTPS service origin');
const dispatcher=process.env.HTTPS_PROXY?new ProxyAgent({uri:process.env.HTTPS_PROXY,...(process.env.SSL_CERT_FILE?{requestTls:{ca:fs.readFileSync(process.env.SSL_CERT_FILE)}}:{})}):undefined;
async function request(path,command){const response=await fetch(new URL(path,url.origin),{dispatcher,redirect:'error',method:command?'POST':'GET',headers:{Authorization:'Bearer '+token,...(command?{'Content-Type':'application/json'}:{})},body:command?JSON.stringify(command):undefined,signal:AbortSignal.timeout(60000)});let result;try{result=await response.json();}catch{throw Error('Service response could not be read');}if(!response.ok){const errors=new Set(['Unauthorized','Chat control is not configured','Origin rejected']);throw Error(errors.has(result.error)?result.error:'Command rejected. Read the queue and check the approved instruction, version, time and source requirements.');}return result;}
try{
 if(!file)console.log(JSON.stringify(await request('/automation/review'),null,2));
 else{
  const command=JSON.parse(await readFile(file,'utf8'));
  if(!flags.includes('--apply'))console.log(JSON.stringify({dryRun:true,command,notice:'No changes made. --apply requires actual owner authorization.'},null,2));
  else{const result=await request(command.action==='plan'?'/automation/plan':'/automation/control',command);console.log(JSON.stringify(result,null,2));}
 }
}catch(error){console.error(error.message);process.exitCode=1;}finally{if(dispatcher)await dispatcher.close();}
