import {pathToFileURL} from 'node:url';import {resolve} from 'node:path';
export function scheduledAction({event,requested,cron,now=new Date()}){
 if(event==='workflow_dispatch')return requested;
 if(['37 0-4,22-23 * * *','37 0-4,16-23 * * *'].includes(cron)){const hour=Number(new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'numeric',hourCycle:'h23'}).format(now));return hour>=(cron==='37 0-4,22-23 * * *'?18:12)?'publish':'';}
 const offset=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',timeZoneName:'shortOffset'}).formatToParts(now).find(x=>x.type==='timeZoneName').value;
 const daylight=offset==='GMT-4';
 if(cron===(daylight?'20 13,17 * * *':'20 14,18 * * *'))return 'replenish';
 if(cron===(daylight?'17 16 * * *':'17 17 * * *'))return 'prepare';
 if(cron===(daylight?'7 14 * * *':'7 15 * * *'))return 'prepare';
 if(cron===(daylight?'7 22 * * *':'7 23 * * *'))return 'publish';
 return '';
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){const action=scheduledAction({event:process.env.EVENT,requested:process.env.REQUESTED,cron:process.env.TRIGGER_CRON});if(action)console.log('action='+action);}
