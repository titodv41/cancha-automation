import {spawn} from 'node:child_process';
// Keep timers and HTTP connections alive while a long preparation task runs.
export function runSubprocess(command,args,options={}){
 return new Promise((resolve,reject)=>{const child=spawn(command,args,options);child.once('error',reject);child.once('exit',(code,signal)=>resolve({status:code,signal}));});
}
